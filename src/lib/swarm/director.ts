import { animate } from 'motion';
import { markPartBuilt, resetBuiltState } from '$lib/swarm/state.svelte';

export type SwarmActionKind =
	| 'draw-box'
	| 'smart-duplicate'
	| 'paste-clone'
	| 'rename-live'
	| 'type-text'
	| 'drop-asset'
	| 'scout-align';

export interface SwarmStepSpec {
	id: string;
	kind: SwarmActionKind;
	agent: string;
	color: string;
	el: HTMLElement;
	/** For smart-duplicate / paste-clone: the already-built sibling to clone from */
	sourceEl?: HTMLElement;
	/** Optional selector inside el for the text node that gets highlighted & re-typed after cloning */
	editTitleSelector?: string;
	/** Optional cloned preview text shown after pasting before renaming */
	clonedPreviewText?: string;
	/** Optional explicit final text for rename-live (overrides DOM snapshot) */
	finalText?: string;
	/** Optional reactive callback invoked whenever text changes (e.g. to morph file icons by extension!) */
	onTextUpdate?: (text: string) => void;
	/** Optional badge shown on cursor during duplicate/action (e.g. "Ctrl+V", "F2 Rename") */
	actionTag?: string;
	/** Start time in ms relative to sequence start */
	startMs: number;
	/** Duration in ms of this single step */
	durationMs: number;
	/** Optional image URL for drop-asset ghost preview */
	assetPreviewUrl?: string;
}

export interface RenderedCursorState {
	id: string;
	agent: string;
	color: string;
	cursorX: number;
	cursorY: number;
	cursorType: 'pointer' | 'ibeam';
	opacity: number;
	actionTag?: string;
	/** Active dashed draw box */
	drawBox?: {
		x: number;
		y: number;
		w: number;
		h: number;
	};
	/** Active translucent ghost box sliding from sourceEl -> targetEl during smart-duplicate or drop-asset */
	ghostBox?: {
		x: number;
		y: number;
		w: number;
		h: number;
		label?: string;
		assetUrl?: string;
	};
	/** Alignment / spacing guide lines shown when snapping */
	guideLine?: {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		label?: string;
	};
}

function easeOutCubic(t: number) {
	const c = Math.max(0, Math.min(1, t));
	return 1 - Math.pow(1 - c, 3);
}

function easeInOutCubic(t: number) {
	const c = Math.max(0, Math.min(1, t));
	return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export function revealElement(el: HTMLElement, springStyle: 'pop' | 'slide' | 'soft' = 'pop') {
	const partId = el.getAttribute('data-swarm-part');
	markPartBuilt(partId);
	if (el.getAttribute('data-swarm-built') === 'true') return;
	el.setAttribute('data-swarm-built', 'true');
	if (springStyle === 'soft') {
		animate(el, { opacity: [0, 1] }, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
	} else if (springStyle === 'slide') {
		animate(
			el,
			{ opacity: [0, 1], y: [10, 0], scale: [0.97, 1] },
			{ type: 'spring', stiffness: 280, damping: 24 }
		);
	} else {
		animate(
			el,
			{ opacity: [0, 1], scale: [0.94, 1] },
			{ type: 'spring', stiffness: 260, damping: 22 }
		);
	}
}

export function resetAllSwarmParts(root: ParentNode = document) {
	resetBuiltState();
	root.querySelectorAll<HTMLElement>('[data-swarm-part]').forEach((el) => {
		el.removeAttribute('data-swarm-built');
		el.style.opacity = '';
		el.style.transform = '';
	});
	// Restore any original text cached during typing/duplicating
	root.querySelectorAll<HTMLElement>('[data-orig-text]').forEach((el) => {
		if (el.dataset.origText !== undefined) {
			el.textContent = el.dataset.origText;
			el.classList.remove('swarm-text-selected', 'swarm-typing-caret');
		}
	});
}

/**
 * Runs a choreographed multi-step Swarm sequence where cursors draw boxes,
 * type text character-by-character, drop assets, and smartly duplicate repeated
 * sibling components before editing their text in place!
 */
export function runSwarmDirector(
	steps: SwarmStepSpec[],
	onFrame: (cursors: RenderedCursorState[]) => void,
	onComplete: () => void
): () => void {
	if (steps.length === 0) {
		onFrame([]);
		onComplete();
		return () => {};
	}

	const totalMs =
		Math.max(...steps.map((s) => s.startMs + s.durationMs)) + 260;

	// Internal mutable per-step state
	const runtime = steps.map((spec, idx) => {
		let textNode: HTMLElement | null = null;
		let realText = '';

		if (spec.kind === 'type-text') {
			textNode = spec.editTitleSelector
				? spec.el.querySelector<HTMLElement>(spec.editTitleSelector)
				: spec.el;
			if (textNode) {
				if (textNode.dataset.origText === undefined) {
					textNode.dataset.origText = textNode.textContent ?? '';
				}
				realText = spec.finalText ?? textNode.dataset.origText;
			}
		} else if (
			(spec.kind === 'smart-duplicate' ||
				spec.kind === 'paste-clone' ||
				spec.kind === 'rename-live') &&
			spec.editTitleSelector
		) {
			textNode = spec.el.querySelector<HTMLElement>(spec.editTitleSelector);
			if (textNode) {
				if (textNode.dataset.origText === undefined) {
					textNode.dataset.origText = textNode.textContent ?? '';
				}
				realText = spec.finalText ?? textNode.dataset.origText;
			}
		} else if (spec.finalText) {
			realText = spec.finalText;
		}

		// Determine a natural entry origin for this cursor
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const r = spec.el.getBoundingClientRect();
		const originX =
			idx % 4 === 0
				? 18
				: idx % 4 === 1
					? vw - 28
					: Math.max(24, Math.min(vw - 24, r.left + (idx % 2 === 0 ? -160 : 180)));
		const originY =
			idx % 3 === 0
				? 18
				: idx % 3 === 1
					? vh - 28
					: Math.max(24, Math.min(vh - 24, r.top + (idx % 2 === 0 ? -120 : 140)));

		return {
			spec,
			textNode,
			realText,
			originX,
			originY,
			revealed: false,
			clonedTextSet: false,
			typingDone: false
		};
	});

	let animId = 0;
	const t0 = performance.now();

	const tick = (now: number) => {
		const elapsed = now - t0;
		const rendered: RenderedCursorState[] = [];

		for (const item of runtime) {
			const { spec } = item;
			const localMs = elapsed - spec.startMs;

			if (localMs < 0) continue;

			const rawP = localMs / Math.max(1, spec.durationMs);
			const finished = rawP >= 1;
			// Keep cursor briefly visible while fading out for 220ms after finishing
			const fadeAfter = finished ? Math.max(0, 1 - (localMs - spec.durationMs) / 220) : 1;
			if (fadeAfter <= 0.01) continue;

			const rect = spec.el.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;

			// Clamp box into visible area slightly so cursor stays legible
			const rx = Math.max(2, Math.min(vw - 24, rect.left));
			const ry = Math.max(2, Math.min(vh - 24, rect.top));
			const rw = Math.max(24, Math.min(vw - rx - 6, rect.width));
			const rh = Math.max(18, Math.min(vh - ry - 6, rect.height));

			if (spec.kind === 'draw-box') {
				const moveP = easeOutCubic(Math.min(1, rawP / 0.24));
				const dragP = easeOutCubic(Math.max(0, Math.min(1, (rawP - 0.24) / 0.72)));

				const curW = rw * dragP;
				const curH = rh * dragP;

				const cx =
					rawP < 0.24 ? item.originX + (rx - item.originX) * moveP : rx + curW;
				const cy =
					rawP < 0.24 ? item.originY + (ry - item.originY) * moveP : ry + curH;

				if (!item.revealed && rawP >= 0.94) {
					item.revealed = true;
					revealElement(spec.el, rw > vw * 0.6 ? 'soft' : 'pop');
				}

				rendered.push({
					id: spec.id,
					agent: spec.agent,
					color: spec.color,
					cursorX: cx,
					cursorY: cy,
					cursorType: 'pointer',
					opacity: fadeAfter,
					actionTag: !finished && rawP > 0.24 ? spec.actionTag : undefined,
					drawBox:
						!finished && rawP > 0.24 && dragP > 0.02
							? { x: rx, y: ry, w: curW, h: curH }
							: undefined
				});
			} else if (spec.kind === 'drop-asset') {
				// Carry translucent asset from above/right onto exact target rect
				const carryP = easeInOutCubic(Math.min(1, rawP / 0.88));
				const startX = rx + 95;
				const startY = Math.max(8, ry - 110);
				const curX = startX + (rx - startX) * carryP;
				const curY = startY + (ry - startY) * carryP;

				if (!item.revealed && rawP >= 0.88) {
					item.revealed = true;
					revealElement(spec.el, 'pop');
				}

				rendered.push({
					id: spec.id,
					agent: spec.agent,
					color: spec.color,
					cursorX: curX + rw * 0.5,
					cursorY: curY + rh * 0.45,
					cursorType: 'pointer',
					opacity: fadeAfter,
					actionTag: !finished ? spec.actionTag || 'Place' : undefined,
					ghostBox: !finished
						? {
								x: curX,
								y: curY,
								w: rw,
								h: rh,
								assetUrl: spec.assetPreviewUrl
							}
						: undefined,
					guideLine:
						!finished && carryP > 0.72
							? {
									x1: rx + rw / 2,
									y1: ry - 20,
									x2: rx + rw / 2,
									y2: ry + rh + 20,
									label: 'Snap X'
								}
							: undefined
				});
			} else if (spec.kind === 'type-text') {
				// Reveal container first with blank text, then type character by character!
				if (!item.revealed) {
					item.revealed = true;
					if (item.textNode) {
						item.textNode.textContent = '';
						item.textNode.classList.add('swarm-typing-caret');
					}
					revealElement(spec.el, 'soft');
				}

				const moveP = easeOutCubic(Math.min(1, rawP / 0.16));
				const typeP = Math.max(0, Math.min(1, (rawP - 0.16) / 0.82));
				const charCount = Math.floor(typeP * item.realText.length);

				if (item.textNode && !item.typingDone) {
					if (rawP >= 0.98) {
						item.textNode.textContent = item.realText;
						item.textNode.classList.remove('swarm-typing-caret');
						item.typingDone = true;
					} else {
						item.textNode.textContent = item.realText.slice(0, charCount);
					}
				}

				const textRect = item.textNode ? item.textNode.getBoundingClientRect() : rect;
				const tx =
					rawP < 0.16
						? item.originX + (textRect.left - item.originX) * moveP
						: textRect.left + Math.min(textRect.width, Math.max(12, textRect.width * typeP));
				const ty =
					rawP < 0.16
						? item.originY + (textRect.top + textRect.height * 0.5 - item.originY) * moveP
						: textRect.top + Math.min(textRect.height * 0.6, 26);

				rendered.push({
					id: spec.id,
					agent: spec.agent,
					color: spec.color,
					cursorX: Math.min(vw - 24, tx),
					cursorY: Math.min(vh - 24, ty),
					cursorType: rawP >= 0.16 ? 'ibeam' : 'pointer',
					opacity: fadeAfter,
					actionTag: !finished && rawP >= 0.16 ? spec.actionTag || 'Typing...' : undefined
				});
			} else if (spec.kind === 'smart-duplicate') {
				// 3 sub-phases for smart copy-paste + text edit:
				// 0.00 -> 0.48 : Grab ghost from sourceEl & Alt+Drag smoothly to targetEl with alignment guide
				// 0.48 -> 0.64 : Snap & reveal targetEl displaying CLONED text from sourceEl (highlighted in blue!)
				// 0.64 -> 0.98 : Live-type/replace the highlighted text with targetEl's real text!
				const srcRect = spec.sourceEl ? spec.sourceEl.getBoundingClientRect() : rect;
				const slideP = easeInOutCubic(Math.min(1, rawP / 0.48));
				const curX = srcRect.left + (rx - srcRect.left) * slideP;
				const curY = srcRect.top + (ry - srcRect.top) * slideP;
				const curW = srcRect.width + (rw - srcRect.width) * slideP;
				const curH = srcRect.height + (rh - srcRect.height) * slideP;

				const hasTitleEdit = Boolean(item.textNode && spec.clonedPreviewText);

				if (!item.revealed && rawP >= 0.48) {
					item.revealed = true;
					if (hasTitleEdit && item.textNode && spec.clonedPreviewText) {
						item.textNode.textContent = spec.clonedPreviewText;
						item.textNode.classList.add('swarm-text-selected');
						item.clonedTextSet = true;
					}
					revealElement(spec.el, 'slide');
				}

				let cursorX = curX + curW * 0.55;
				let cursorY = curY + curH * 0.45;
				let cursorType: 'pointer' | 'ibeam' = 'pointer';
				let tag = 'Alt+Drag';

				if (rawP >= 0.48 && hasTitleEdit && item.textNode) {
					const titleRect = item.textNode.getBoundingClientRect();
					cursorType = 'ibeam';

					if (rawP < 0.64) {
						// Select cloned text briefly
						tag = 'Select Text';
						cursorX = titleRect.left + titleRect.width * 0.5;
						cursorY = titleRect.top + titleRect.height * 0.5;
					} else {
						// Replace text character by character!
						tag = 'Edit Text';
						const editP = Math.max(0, Math.min(1, (rawP - 0.64) / 0.34));
						item.textNode.classList.remove('swarm-text-selected');
						item.textNode.classList.add('swarm-typing-caret');

						if (rawP >= 0.98) {
							item.textNode.textContent = item.realText;
							item.textNode.classList.remove('swarm-typing-caret');
							item.typingDone = true;
						} else {
							const chars = Math.max(1, Math.floor(editP * item.realText.length));
							item.textNode.textContent = item.realText.slice(0, chars);
						}

						cursorX = titleRect.left + Math.min(titleRect.width + 6, Math.max(10, titleRect.width * editP));
						cursorY = titleRect.top + titleRect.height * 0.55;
					}
				}

				// Smart spacing guide line between sourceEl and targetEl while sliding
				let guideLine: RenderedCursorState['guideLine'] = undefined;
				if (rawP > 0.2 && rawP < 0.52 && spec.sourceEl) {
					const dx = Math.abs(rx - srcRect.left);
					const dy = Math.abs(ry - srcRect.top);
					if (dx >= dy) {
						const gap = Math.max(0, Math.round(rx - srcRect.right));
						guideLine = {
							x1: srcRect.right,
							y1: ry + rh / 2,
							x2: rx,
							y2: ry + rh / 2,
							label: gap > 0 ? `${gap}px` : 'Aligned'
						};
					} else {
						const gap = Math.max(0, Math.round(ry - srcRect.bottom));
						guideLine = {
							x1: rx + rw / 2,
							y1: srcRect.bottom,
							x2: rx + rw / 2,
							y2: ry,
							label: gap > 0 ? `${gap}px` : 'Aligned'
						};
					}
				}

				rendered.push({
					id: spec.id,
					agent: spec.agent,
					color: spec.color,
					cursorX: Math.min(vw - 26, Math.max(6, cursorX)),
					cursorY: Math.min(vh - 26, Math.max(6, cursorY)),
					cursorType,
					opacity: fadeAfter,
					actionTag: !finished ? tag : undefined,
					ghostBox:
						rawP < 0.48
							? {
									x: curX,
									y: curY,
									w: curW,
									h: curH,
									label: spec.clonedPreviewText
								}
							: undefined,
					guideLine
				});
			} else if (spec.kind === 'paste-clone') {
				// Batch Copy-Paste step: slides translucent clone from sourceEl -> targetEl & drops it with IDENTICAL cloned text!
				const srcRect = spec.sourceEl ? spec.sourceEl.getBoundingClientRect() : rect;
				const slideP = easeInOutCubic(Math.min(1, rawP / 0.84));
				const curX = srcRect.left + (rx - srcRect.left) * slideP;
				const curY = srcRect.top + (ry - srcRect.top) * slideP;
				const curW = srcRect.width + (rw - srcRect.width) * slideP;
				const curH = srcRect.height + (rh - srcRect.height) * slideP;

				if (!item.revealed && rawP >= 0.84) {
					item.revealed = true;
					if (spec.clonedPreviewText) {
						if (spec.onTextUpdate) {
							spec.onTextUpdate(spec.clonedPreviewText);
						} else if (item.textNode) {
							item.textNode.textContent = spec.clonedPreviewText;
						}
					}
					revealElement(spec.el, 'slide');
				}

				let guideLine: RenderedCursorState['guideLine'] = undefined;
				if (rawP > 0.2 && rawP < 0.88 && spec.sourceEl) {
					const dx = Math.abs(rx - srcRect.left);
					const dy = Math.abs(ry - srcRect.top);
					if (dx >= dy) {
						const gap = Math.max(0, Math.round(rx - srcRect.right));
						guideLine = {
							x1: srcRect.right,
							y1: ry + rh / 2,
							x2: rx,
							y2: ry + rh / 2,
							label: gap > 0 ? `${gap}px` : 'Ctrl+V'
						};
					} else {
						const gap = Math.max(0, Math.round(ry - srcRect.bottom));
						guideLine = {
							x1: rx + rw / 2,
							y1: srcRect.bottom,
							x2: rx + rw / 2,
							y2: ry,
							label: gap > 0 ? `${gap}px` : 'Ctrl+V'
						};
					}
				}

				rendered.push({
					id: spec.id,
					agent: spec.agent,
					color: spec.color,
					cursorX: Math.min(vw - 26, Math.max(6, curX + curW * 0.55)),
					cursorY: Math.min(vh - 26, Math.max(6, curY + curH * 0.5)),
					cursorType: 'pointer',
					opacity: fadeAfter,
					actionTag: !finished ? spec.actionTag || 'Ctrl+V' : undefined,
					ghostBox:
						rawP < 0.84
							? {
									x: curX,
									y: curY,
									w: curW,
									h: curH,
									label: spec.clonedPreviewText
								}
							: undefined,
					guideLine
				});
			} else if (spec.kind === 'rename-live') {
				// Step 2 after batch paste: cursor clicks into pasted duplicate, selects old text (F2),
				// and live-types the new name so extension icons dynamically morph on the fly!
				const titleEl = item.textNode ?? spec.el;
				const titleRect = titleEl.getBoundingClientRect();
				const moveP = easeOutCubic(Math.min(1, rawP / 0.18));

				let cursorX = item.originX + (titleRect.left + titleRect.width * 0.45 - item.originX) * moveP;
				let cursorY = item.originY + (titleRect.top + titleRect.height * 0.5 - item.originY) * moveP;
				let cursorType: 'pointer' | 'ibeam' = 'pointer';
				let tag = spec.actionTag || 'F2 Rename';

				if (rawP >= 0.18 && rawP < 0.4) {
					cursorType = 'ibeam';
					titleEl.classList.add('swarm-text-selected');
					cursorX = titleRect.left + titleRect.width * 0.55;
					cursorY = titleRect.top + titleRect.height * 0.5;
				} else if (rawP >= 0.4) {
					cursorType = 'ibeam';
					tag = 'Renaming...';
					titleEl.classList.remove('swarm-text-selected');
					titleEl.classList.add('swarm-typing-caret');

					const editP = Math.max(0, Math.min(1, (rawP - 0.4) / 0.58));
					const finalStr = item.realText;

					if (rawP >= 0.98) {
						if (spec.onTextUpdate) {
							spec.onTextUpdate(finalStr);
						} else if (item.textNode) {
							item.textNode.textContent = finalStr;
						}
						titleEl.classList.remove('swarm-typing-caret');
						item.typingDone = true;
					} else {
						const chars = Math.max(1, Math.floor(editP * finalStr.length));
						const partial = finalStr.slice(0, chars);
						if (spec.onTextUpdate) {
							spec.onTextUpdate(partial);
						} else if (item.textNode) {
							item.textNode.textContent = partial;
						}
					}

					cursorX = titleRect.left + Math.min(titleRect.width + 6, Math.max(10, titleRect.width * editP));
					cursorY = titleRect.top + titleRect.height * 0.55;
				}

				rendered.push({
					id: spec.id,
					agent: spec.agent,
					color: spec.color,
					cursorX: Math.min(vw - 26, Math.max(6, cursorX)),
					cursorY: Math.min(vh - 26, Math.max(6, cursorY)),
					cursorType,
					opacity: fadeAfter,
					actionTag: !finished ? tag : undefined
				});
			} else if (spec.kind === 'scout-align') {
				// Helper/scout agent glides along the edges of target element snapping alignment guides
				const glideP = easeInOutCubic(Math.min(1, rawP));
				const phase1 = glideP < 0.45;
				const pA = Math.min(1, glideP / 0.45);
				const pB = Math.max(0, (glideP - 0.45) / 0.55);

				const cx = phase1
					? item.originX + (rx + rw * 0.2 - item.originX) * pA
					: rx + rw * 0.2 + rw * 0.65 * pB;
				const cy = phase1
					? item.originY + (ry + rh * 0.25 - item.originY) * pA
					: ry + rh * 0.25 + rh * 0.5 * Math.sin(pB * Math.PI);

				rendered.push({
					id: spec.id,
					agent: spec.agent,
					color: spec.color,
					cursorX: Math.min(vw - 24, Math.max(6, cx)),
					cursorY: Math.min(vh - 24, Math.max(6, cy)),
					cursorType: 'pointer',
					opacity: fadeAfter,
					actionTag: !finished ? spec.actionTag || 'Align' : undefined,
					guideLine:
						!finished && glideP > 0.35 && glideP < 0.9
							? {
									x1: rx,
									y1: cy,
									x2: rx + rw,
									y2: cy,
									label: spec.actionTag || 'Aligned'
								}
							: undefined
				});
			}
		}

		onFrame(rendered);

		if (elapsed < totalMs) {
			animId = requestAnimationFrame(tick);
		} else {
			// Safety finalize every step so nothing ever remains hidden or truncated
			for (const item of runtime) {
				if (!item.revealed && item.spec.kind !== 'scout-align' && item.spec.kind !== 'rename-live') {
					item.revealed = true;
					revealElement(item.spec.el, 'soft');
				}
				if (item.spec.kind !== 'paste-clone') {
					if (item.spec.onTextUpdate && item.realText) {
						item.spec.onTextUpdate(item.realText);
					} else if (item.textNode && item.realText) {
						item.textNode.textContent = item.realText;
					}
					item.textNode?.classList.remove('swarm-text-selected', 'swarm-typing-caret');
				}
			}
			onFrame([]);
			onComplete();
		}
	};

	animId = requestAnimationFrame(tick);

	return () => {
		cancelAnimationFrame(animId);
		// Ensure texts restored cleanly if cancelled
		for (const item of runtime) {
			if (item.textNode && item.realText) {
				item.textNode.textContent = item.realText;
				item.textNode.classList.remove('swarm-text-selected', 'swarm-typing-caret');
			}
		}
		onFrame([]);
	};
}
