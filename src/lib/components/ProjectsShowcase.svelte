<script lang="ts">
	import { onMount } from 'svelte';
	import { PROJECTS_DATA, MOTION_REELS, type ProjectWork } from '$lib/data/portfolio';

	interface Props {
		theme?: 'dark' | 'light';
		scrollContainer?: HTMLElement;
		scrollY?: number;
		onScrollToElement?: (el: HTMLElement) => void;
	}

	let { theme = 'dark', scrollContainer, scrollY = 0, onScrollToElement }: Props = $props();
	let isLight = $derived(theme === 'light');

	let sectionEl: HTMLElement | undefined = $state();
	let innerEl: HTMLElement | undefined = $state();
	let introStageEl: HTMLElement | undefined = $state();
	let thumbSlotEl: HTMLElement | undefined = $state();
	let reelStageEl: HTMLElement | undefined = $state();
	let reelSlotEl: HTMLElement | undefined = $state();
	let featuredSectionEl: HTMLElement | undefined = $state();
	let featuredHeadEl: HTMLElement | undefined = $state();
	let ribbonPathEl: SVGPathElement | undefined = $state();

	// Measured layout anchor rectangles relative to .lusion-inner for the 1:1 Lusion Flying Video Morph
	let thumbBox = $state({ x: 0, y: 360, w: 520, h: 332 });
	let reelBox = $state({ x: 0, y: 1020, w: 1120, h: 580 });
	let layoutMeasured = $state(false);

	// 100% Scroll-Scrubbed Lusion timelines (lerped smoothly at 60fps with Lenis scroll, reversible!)
	let ribbonLength = $state(3600);
	let introTarget = $state(0);
	let introSmooth = $state(0);

	// Exact 1:1 Lusion flight progress: 0 = parked as small left duotone card -> 1 = expanded full-width colorful PLAY REEL!
	let flightTarget = $state(0);
	let flightSmooth = $state(0);

	let featuredTarget = $state(0);
	let featuredSmooth = $state(0);

	// Smoothly auto-cycles Film's real animated VTuber & TikTok AMV GIFs inside the single flying video card
	let motionReelIdx = $state(0);
	let activeMotionReel = $derived(MOTION_REELS[motionReelIdx]);

	// Character-scramble state for each Featured Work card's tag row
	const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789•';
	let scrambledTags = $state<string[]>(PROJECTS_DATA.map((p) => p.lusionTags));
	const scrambleRafs = new Map<number, number>();
	const cardScrambleTriggered = new Set<number>();

	// Subtle per-card pointer parallax inside media box
	let cardHoverParallax = $state<{ x: number; y: number }[]>(
		PROJECTS_DATA.map(() => ({ x: 0, y: 0 }))
	);

	// Lusion Fullscreen Case Study Overlay state
	let selectedIdx = $state<number | null>(null);
	let detailSlide = $state<0 | 1>(0);
	let isClosingDetail = $state(false);
	let pageSlideState = $state<'idle' | 'out-left' | 'out-right' | 'in-from-right' | 'in-from-left'>(
		'idle'
	);
	let pageSlideTimer: ReturnType<typeof setTimeout> | null = null;
	let selectedWork = $derived<ProjectWork | null>(
		selectedIdx !== null ? PROJECTS_DATA[selectedIdx] : null
	);

	function clamp01(v: number) {
		return Math.max(0, Math.min(1, v));
	}

	function range(v: number, start: number, end: number) {
		return clamp01((v - start) / Math.max(0.0001, end - start));
	}

	function lerp(a: number, b: number, t: number) {
		return a + (b - a) * t;
	}

	function easeOutCubic(t: number) {
		const c = clamp01(t);
		return 1 - Math.pow(1 - c, 3);
	}

	function easeInOutCubic(t: number) {
		const c = clamp01(t);
		return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
	}

	// --- STAGE 1: 100% SCROLL-SCRUBBED RIBBON & EDITORIAL INTRO ---
	let ribbonDraw = $derived(range(introSmooth, 0.05, 0.96));
	let ribbonOpacity = $derived(range(introSmooth, 0.03, 0.1));
	let ribbonDashOffset = $derived(ribbonLength * (1 - ribbonDraw));

	let line1P = $derived(easeOutCubic(range(introSmooth, 0.12, 0.3)));
	let line2P = $derived(easeOutCubic(range(introSmooth, 0.19, 0.37)));

	let thumbEnterP = $derived(easeOutCubic(range(introSmooth, 0.28, 0.52)));
	let copyP = $derived(easeOutCubic(range(introSmooth, 0.38, 0.62)));
	let ctaP = $derived(easeOutCubic(range(introSmooth, 0.5, 0.72)));

	// --- STAGE 2: EXACT 1:1 LUSION SINGLE FLYING DUOTONE -> VIBRANT COLOR 3D WARP VIDEO MORPH ---
	let flightE = $derived(easeInOutCubic(flightSmooth));
	let flightArc = $derived(Math.sin(flightSmooth * Math.PI));

	// Interpolated live geometry (flies continuously from left small duotone slot -> full-width center PLAY REEL slot!)
	let flyX = $derived(lerp(thumbBox.x, reelBox.x, flightE));
	let flyY = $derived(
		lerp(thumbBox.y, reelBox.y, flightE) + (1 - thumbEnterP) * 52 * (1 - flightE)
	);
	let flyW = $derived(lerp(thumbBox.w, reelBox.w, flightE));
	let flyH = $derived(lerp(thumbBox.h, reelBox.h, flightE));
	let flyRadius = $derived(lerp(16, 20, flightE));

	// Mid-flight signature Lusion 3D curved tilt (peaks smoothly in the middle of flight, settles flat on arrival!)
	let flyRotX = $derived(-6.2 * flightArc);
	let flyRotY = $derived(9.2 * flightArc);
	let flyRotZ = $derived(-2.4 * flightArc);
	let flySkewX = $derived(-1.5 * flightArc);
	let flyScale = $derived(lerp(0.92 + 0.08 * thumbEnterP, 1, flightE));

	// Smooth Duotone -> Full Vibrant Color Bloom as the video detaches & flies down!
	let colorBloom = $derived(easeOutCubic(range(flightSmooth, 0.08, 0.68)));
	let duotoneOpacity = $derived(1 - colorBloom);
	let imgGrayscale = $derived((1 - colorBloom) * 100);
	let imgContrast = $derived(1.16 - 0.14 * colorBloom);
	let imgSaturate = $derived(1 + 0.12 * colorBloom);

	// Clean centered PLAY [▶] REEL overlay fades in as the card lands in full color
	let playOverlayP = $derived(easeOutCubic(range(flightSmooth, 0.56, 0.94)));
	let playWordOffset = $derived((1 - playOverlayP) * 34);
	let crosshairDeg = $derived(flightSmooth * 240);
	let crosshairsOpacity = $derived(easeOutCubic(range(flightSmooth, 0.32, 0.78)));

	// --- STAGE 3: FEATURED WORK 2x3 GRID (6 Real Works + Live Motion GIFs, Zero Overlay Clutter) ---
	let featHeadP = $derived(easeOutCubic(range(featuredSmooth, 0.01, 0.18)));
	let cardProgress = $derived([
		easeOutCubic(range(featuredSmooth, 0.06, 0.28)),
		easeOutCubic(range(featuredSmooth, 0.1, 0.32)),
		easeOutCubic(range(featuredSmooth, 0.24, 0.48)),
		easeOutCubic(range(featuredSmooth, 0.28, 0.52)),
		easeOutCubic(range(featuredSmooth, 0.44, 0.68)),
		easeOutCubic(range(featuredSmooth, 0.48, 0.72))
	]);

	function measureFlightAnchors() {
		if (!innerEl || !thumbSlotEl || !reelSlotEl) return;
		const ir = innerEl.getBoundingClientRect();
		const tr = thumbSlotEl.getBoundingClientRect();
		const rr = reelSlotEl.getBoundingClientRect();
		thumbBox = {
			x: tr.left - ir.left,
			y: tr.top - ir.top,
			w: tr.width,
			h: tr.height
		};
		reelBox = {
			x: rr.left - ir.left,
			y: rr.top - ir.top,
			w: rr.width,
			h: rr.height
		};
		layoutMeasured = true;
	}

	function computeScrollTargets() {
		const rootRect = scrollContainer
			? scrollContainer.getBoundingClientRect()
			: { top: 0, bottom: window.innerHeight, height: window.innerHeight };
		const vh = Math.max(1, rootRect.height);

		if (introStageEl) {
			const r = introStageEl.getBoundingClientRect();
			const relTop = r.top - rootRect.top;
			const raw = (vh * 0.74 - relTop) / Math.max(1, r.height * 0.85 + vh * 0.12);
			introTarget = clamp01(raw);
		}

		// Flight starts smoothly once the left thumb card reaches upper-middle viewport,
		// and finishes smoothly right as the full-width PLAY REEL slot centers in viewport!
		if (thumbSlotEl && reelSlotEl) {
			const tr = thumbSlotEl.getBoundingClientRect();
			const rr = reelSlotEl.getBoundingClientRect();
			const thumbCenterRel = (tr.top + tr.height * 0.5) - rootRect.top;
			const reelCenterRel = (rr.top + rr.height * 0.5) - rootRect.top;
			const startY = vh * 0.46; // thumb center passes upper-mid viewport -> launch flight!
			const travelDist = Math.max(220, reelCenterRel - thumbCenterRel);
			const rawFlight = (startY - thumbCenterRel) / travelDist;
			flightTarget = clamp01(rawFlight);
		}

		if (featuredSectionEl) {
			const r = featuredSectionEl.getBoundingClientRect();
			const relTop = r.top - rootRect.top;
			const raw = (vh * 0.88 - relTop) / Math.max(1, r.height * 0.86 + vh * 0.15);
			featuredTarget = clamp01(raw);
		}
	}

	$effect(() => {
		void scrollY;
		void scrollContainer;
		computeScrollTargets();
	});

	$effect(() => {
		const cp = cardProgress;
		for (let i = 0; i < cp.length; i++) {
			if (cp[i] > 0.35 && !cardScrambleTriggered.has(i)) {
				cardScrambleTriggered.add(i);
				triggerTagScramble(i);
			} else if (cp[i] < 0.05 && cardScrambleTriggered.has(i)) {
				cardScrambleTriggered.delete(i);
			}
		}
	});

	function triggerTagScramble(idx: number) {
		const target = PROJECTS_DATA[idx].lusionTags;
		const prevRaf = scrambleRafs.get(idx);
		if (prevRaf) cancelAnimationFrame(prevRaf);

		const start = performance.now();
		const duration = 520;

		const tickScramble = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			const revealedCount = Math.floor(t * target.length);
			let out = '';
			for (let i = 0; i < target.length; i++) {
				const ch = target[i];
				if (ch === ' ' || ch === '•' || i < revealedCount) {
					out += ch;
				} else {
					out += SCRAMBLE_CHARS[(Math.floor(now * 0.04) + i * 7) % SCRAMBLE_CHARS.length];
				}
			}
			scrambledTags[idx] = out;
			if (t < 1) {
				scrambleRafs.set(idx, requestAnimationFrame(tickScramble));
			} else {
				scrambledTags[idx] = target;
				scrambleRafs.delete(idx);
			}
		};

		scrambleRafs.set(idx, requestAnimationFrame(tickScramble));
	}

	function handleCardMouseMove(idx: number, e: MouseEvent) {
		const el = e.currentTarget as HTMLElement;
		const r = el.getBoundingClientRect();
		const nx = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
		const ny = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
		cardHoverParallax[idx] = { x: nx * -8, y: ny * -6 };
	}

	function handleCardMouseLeave(idx: number) {
		cardHoverParallax[idx] = { x: 0, y: 0 };
	}

	function handleCardMouseEnter(idx: number) {
		triggerTagScramble(idx);
	}

	function scrollToFeaturedWork() {
		if (!featuredHeadEl) return;
		if (onScrollToElement) {
			onScrollToElement(featuredHeadEl);
		} else if (scrollContainer) {
			const containerRect = scrollContainer.getBoundingClientRect();
			const targetRect = featuredHeadEl.getBoundingClientRect();
			const nextTop = scrollContainer.scrollTop + (targetRect.top - containerRect.top) - 24;
			scrollContainer.scrollTo({ top: nextTop, behavior: 'smooth' });
		} else {
			featuredHeadEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function openProjectDetail(idx: number) {
		if (pageSlideTimer) clearTimeout(pageSlideTimer);
		pageSlideState = 'idle';
		isClosingDetail = false;
		detailSlide = 0;
		selectedIdx = idx;
	}

	function closeProjectDetail() {
		if (selectedIdx === null || isClosingDetail) return;
		if (pageSlideTimer) clearTimeout(pageSlideTimer);
		isClosingDetail = true;
		setTimeout(() => {
			selectedIdx = null;
			isClosingDetail = false;
			pageSlideState = 'idle';
		}, 440);
	}

	function stepProjectDetail(dir: -1 | 1) {
		if (selectedIdx === null || isClosingDetail) return;
		if (pageSlideTimer) clearTimeout(pageSlideTimer);
		pageSlideState = dir === 1 ? 'out-left' : 'out-right';
		pageSlideTimer = setTimeout(() => {
			if (selectedIdx === null) return;
			detailSlide = 0;
			selectedIdx = (selectedIdx + dir + PROJECTS_DATA.length) % PROJECTS_DATA.length;
			pageSlideState = dir === 1 ? 'in-from-right' : 'in-from-left';
			pageSlideTimer = setTimeout(() => {
				pageSlideState = 'idle';
			}, 380);
		}, 150);
	}

	function toggleDetailSlide() {
		detailSlide = detailSlide === 0 ? 1 : 0;
	}

	function handleDetailWheel(e: WheelEvent) {
		if (Math.abs(e.deltaY) > 18 || Math.abs(e.deltaX) > 18) {
			const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			if (delta > 0 && detailSlide === 0) {
				detailSlide = 1;
			} else if (delta < 0 && detailSlide === 1) {
				detailSlide = 0;
			}
		}
	}

	function splitChars(text: string): string[] {
		return Array.from(text).map((ch) => (ch === ' ' ? '\u00A0' : ch));
	}

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) node.parentNode.removeChild(node);
			}
		};
	}

	onMount(() => {
		if (ribbonPathEl) {
			ribbonLength = ribbonPathEl.getTotalLength();
		}
		measureFlightAnchors();
		computeScrollTargets();
		introSmooth = introTarget;
		flightSmooth = flightTarget;
		featuredSmooth = featuredTarget;

		let rafId = 0;
		let isProductVisible = true;
		const tickSmooth = () => {
			if (!isProductVisible) {
				rafId = 0;
				return;
			}
			const dIntro = introTarget - introSmooth;
			if (Math.abs(dIntro) > 0.00015) introSmooth += dIntro * 0.12;
			else if (introSmooth !== introTarget) introSmooth = introTarget;

			const dFlight = flightTarget - flightSmooth;
			if (Math.abs(dFlight) > 0.00015) flightSmooth += dFlight * 0.12;
			else if (flightSmooth !== flightTarget) flightSmooth = flightTarget;

			const dFeat = featuredTarget - featuredSmooth;
			if (Math.abs(dFeat) > 0.00015) featuredSmooth += dFeat * 0.12;
			else if (featuredSmooth !== featuredTarget) featuredSmooth = featuredTarget;

			rafId = requestAnimationFrame(tickSmooth);
		};
		rafId = requestAnimationFrame(tickSmooth);

		const visObs = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					isProductVisible = entry.isIntersecting;
					if (isProductVisible && !rafId) {
						computeScrollTargets();
						rafId = requestAnimationFrame(tickSmooth);
					}
				}
			},
			{ threshold: 0.01 }
		);
		if (sectionEl) visObs.observe(sectionEl);

		const motionReelTimer = setInterval(() => {
			motionReelIdx = (motionReelIdx + 1) % MOTION_REELS.length;
		}, 5600);

		const ro = new ResizeObserver(() => {
			if (ribbonPathEl) ribbonLength = ribbonPathEl.getTotalLength();
			measureFlightAnchors();
			computeScrollTargets();
		});
		if (innerEl) ro.observe(innerEl);

		const handleResize = () => {
			measureFlightAnchors();
			computeScrollTargets();
		};
		const handleKey = (e: KeyboardEvent) => {
			if (selectedIdx === null) return;
			if (e.key === 'Escape') closeProjectDetail();
			else if (e.key === 'ArrowRight') stepProjectDetail(1);
			else if (e.key === 'ArrowLeft') stepProjectDetail(-1);
		};

		window.addEventListener('resize', handleResize);
		window.addEventListener('keydown', handleKey);

		return () => {
			cancelAnimationFrame(rafId);
			clearInterval(motionReelTimer);
			ro.disconnect();
			visObs.disconnect();
			for (const id of scrambleRafs.values()) cancelAnimationFrame(id);
			scrambleRafs.clear();
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('keydown', handleKey);
		};
	});
</script>

<section
	bind:this={sectionEl}
	class="lusion-section"
	class:theme-light={isLight}
	data-theme={theme}
	aria-label="PRODUCT.md — Lusion Scroll-Scrubbed Editorial Works"
>
	<div class="lusion-top-buffer" aria-hidden="true"></div>

	<div bind:this={innerEl} class="lusion-inner">
		<!-- =========================================================================
		     THE SINGLE 1:1 LUSION FLYING VIDEO CARD (Zero Badges / Zero Clutter!)
		     Starts as small left duotone card beside OUR APPROACH -> Detaches on scroll,
		     tilts in 3D perspective while blooming smoothly into full vibrant color,
		     and lands full-width inside the PLAY [▶] REEL crosshairs stage!
		     ========================================================================= -->
		<div
			class="lusion-flying-video-layer"
			class:ready={layoutMeasured}
			style="
				left: {flyX.toFixed(1)}px;
				top: {flyY.toFixed(1)}px;
				width: {flyW.toFixed(1)}px;
				height: {flyH.toFixed(1)}px;
				opacity: {thumbEnterP.toFixed(3)};
			"
		>
			<div
				class="lusion-flying-card-3d"
				class:is-landed={flightSmooth > 0.72}
				style="
					border-radius: {flyRadius.toFixed(1)}px;
					transform:
						perspective(1200px)
						scale({flyScale.toFixed(4)})
						rotateX({flyRotX.toFixed(2)}deg)
						rotateY({flyRotY.toFixed(2)}deg)
						rotateZ({flyRotZ.toFixed(2)}deg)
						skewX({flySkewX.toFixed(2)}deg);
				"
			>
				<!-- Pure Live Moving VTuber & TikTok AMV GIFs (ZERO pills, ZERO text clutter!) -->
				{#each MOTION_REELS as mr, i (mr.id)}
					<img
						src={mr.gifSrc}
						alt={mr.label}
						class="flying-video-img"
						class:active={i === motionReelIdx}
						style="filter: grayscale({imgGrayscale.toFixed(1)}%) contrast({imgContrast.toFixed(2)}) saturate({imgSaturate.toFixed(2)});"
					/>
				{/each}

				<!-- Smoothly Dissolving Duotone Tint (Crimson in Dark / Cobalt in Light -> Melts away to full color!) -->
				<div
					class="flying-duotone-veil"
					style="opacity: {duotoneOpacity.toFixed(3)};"
					aria-hidden="true"
				></div>
				<div
					class="flying-duotone-glow"
					style="opacity: {duotoneOpacity.toFixed(3)};"
					aria-hidden="true"
				></div>

				<!-- Subtle Cinematic Vignette only when landed for white PLAY REEL legibility -->
				<div
					class="flying-reel-scrim"
					style="opacity: {(playOverlayP * 0.72).toFixed(3)};"
					aria-hidden="true"
				></div>

				<!-- Clean Minimal Centered PLAY [▶] REEL Overlay (Exact Lusion Image 3!) -->
				<div
					class="flying-play-overlay"
					style="opacity: {playOverlayP.toFixed(3)}; pointer-events: {playOverlayP > 0.25 ? 'auto' : 'none'};"
				>
					<span
						class="reel-big-word"
						style="transform: translate3d({(-playWordOffset).toFixed(1)}px, 0, 0);"
					>
						PLAY
					</span>

					<button
						type="button"
						class="reel-watch-pill"
						onclick={() => openProjectDetail(activeMotionReel.projectIndex)}
						aria-label="Inspect Showreel Project"
					>
						<span class="reel-watch-fill" aria-hidden="true"></span>
						<svg class="reel-play-tri" width="18" height="20" viewBox="0 0 18 20" fill="none">
							<path d="M2 1.8L16.4 10L2 18.2V1.8Z" fill="currentColor" />
						</svg>
					</button>

					<span
						class="reel-big-word"
						style="transform: translate3d({playWordOffset.toFixed(1)}px, 0, 0);"
					>
						REEL
					</span>
				</div>

				<!-- Invisible click hit target while parked in the small left slot -->
				{#if playOverlayP <= 0.25}
					<button
						type="button"
						class="flying-card-hit"
						onclick={() => openProjectDetail(activeMotionReel.projectIndex)}
						aria-label="Inspect {activeMotionReel.label}"
					></button>
				{/if}
			</div>
		</div>

		<!-- PART A: 100% SCROLL-SCRUBBED EDITORIAL INTRO + 3D SWEEPING RIBBON -->
		<div bind:this={introStageEl} class="lusion-intro-stage">
			<!-- 3D-Shaded Sweeping Ribbon (Crimson #e60012 in Dark Mode / Cobalt #1a2ffb in Light Mode) -->
			<svg
				class="lusion-ribbon-svg"
				viewBox="0 0 1440 1060"
				preserveAspectRatio="xMidYMin slice"
				style="opacity: {ribbonOpacity.toFixed(3)};"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="lusionTubeBodyDark" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#ff1a36" />
						<stop offset="48%" stop-color="#e60012" />
						<stop offset="78%" stop-color="#ff3b52" />
						<stop offset="100%" stop-color="#cc0010" />
					</linearGradient>
					<linearGradient id="lusionTubeBaseDark" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#9e000c" />
						<stop offset="100%" stop-color="#e60012" />
					</linearGradient>

					<linearGradient id="lusionTubeBodyLight" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#2237ff" />
						<stop offset="48%" stop-color="#1a2ffb" />
						<stop offset="78%" stop-color="#4d6eff" />
						<stop offset="100%" stop-color="#1a2ffb" />
					</linearGradient>
					<linearGradient id="lusionTubeBaseLight" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#0d1ed4" />
						<stop offset="100%" stop-color="#1a2ffb" />
					</linearGradient>

					<filter id="lusionRibbonGlow" x="-15%" y="-15%" width="130%" height="130%">
						<feGaussianBlur stdDeviation="10" />
					</filter>
				</defs>

				<path
					d="M -90 68 C 175 112, 415 218, 492 404 C 554 556, 488 835, 294 920 C 102 1002, -26 878, 22 680 C 66 500, 355 438, 655 512 C 910 574, 922 864, 1086 872 C 1188 877, 1244 762, 1348 796 C 1412 818, 1442 868, 1470 905"
					fill="none"
					stroke={isLight ? 'rgba(18, 36, 196, 0.14)' : 'rgba(230, 0, 18, 0.34)'}
					stroke-width="48"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-dasharray={ribbonLength}
					stroke-dashoffset={ribbonDashOffset}
					transform={isLight ? 'translate(0, 12)' : 'translate(0, 4)'}
					filter="url(#lusionRibbonGlow)"
				/>
				<path
					d="M -90 68 C 175 112, 415 218, 492 404 C 554 556, 488 835, 294 920 C 102 1002, -26 878, 22 680 C 66 500, 355 438, 655 512 C 910 574, 922 864, 1086 872 C 1188 877, 1244 762, 1348 796 C 1412 818, 1442 868, 1470 905"
					fill="none"
					stroke={isLight ? 'url(#lusionTubeBaseLight)' : 'url(#lusionTubeBaseDark)'}
					stroke-width="38"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-dasharray={ribbonLength}
					stroke-dashoffset={ribbonDashOffset}
				/>
				<path
					bind:this={ribbonPathEl}
					d="M -90 68 C 175 112, 415 218, 492 404 C 554 556, 488 835, 294 920 C 102 1002, -26 878, 22 680 C 66 500, 355 438, 655 512 C 910 574, 922 864, 1086 872 C 1188 877, 1244 762, 1348 796 C 1412 818, 1442 868, 1470 905"
					fill="none"
					stroke={isLight ? 'url(#lusionTubeBodyLight)' : 'url(#lusionTubeBodyDark)'}
					stroke-width="32"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-dasharray={ribbonLength}
					stroke-dashoffset={ribbonDashOffset}
				/>
				<path
					d="M -90 68 C 175 112, 415 218, 492 404 C 554 556, 488 835, 294 920 C 102 1002, -26 878, 22 680 C 66 500, 355 438, 655 512 C 910 574, 922 864, 1086 872 C 1188 877, 1244 762, 1348 796 C 1412 818, 1442 868, 1470 905"
					fill="none"
					stroke={isLight ? 'rgba(182, 204, 255, 0.36)' : 'rgba(255, 178, 188, 0.36)'}
					stroke-width="7"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-dasharray={ribbonLength}
					stroke-dashoffset={ribbonDashOffset}
					transform="translate(0, -6)"
				/>
			</svg>

			<!-- Giant Indented Editorial Display Headline -->
			<h2 class="lusion-hero-title">
				<span class="title-line-mask line-indent">
					<span
						class="title-line-inner"
						style="transform: translate3d(0, {((1 - line1P) * 108).toFixed(1)}%, 0); opacity: {line1P.toFixed(3)};"
					>
						Bold Ideas
					</span>
				</span>
				<span class="title-line-mask">
					<span
						class="title-line-inner"
						style="transform: translate3d(0, {((1 - line2P) * 108).toFixed(1)}%, 0); opacity: {line2P.toFixed(3)};"
					>
						Brought to Life
					</span>
				</span>
			</h2>

			<!-- Split Editorial Row: Invisible Left Anchor Slot (for the Flying Video!) + Right Copy & Pill CTA -->
			<div class="lusion-approach-grid">
				<div bind:this={thumbSlotEl} class="lusion-thumb-anchor" aria-hidden="true"></div>

				<div class="lusion-approach-right">
					<p
						class="lusion-approach-desc"
						style="
							transform: translate3d(0, {((1 - copyP) * 44).toFixed(1)}px, 0);
							opacity: {copyP.toFixed(3)};
						"
					>
						ที่ PaperX และ Hamster Software House เราโฟกัสการออกแบบและพัฒนาระบบ Full-Stack, แพลตฟอร์ม
						POS, แผนที่อสังหาฯ, ระบบ ERP รวมถึงงานตัดต่อวิดีโอและ Broadcast
						ให้ใช้งานง่าย ลื่นไหล และพร้อมใช้จริงในระดับโปรดักชัน
					</p>

					<div
						class="lusion-cta-slot"
						style="
							transform: translate3d(0, {((1 - ctaP) * 32).toFixed(1)}px, 0) scale({(0.94 + 0.06 * ctaP).toFixed(4)});
							opacity: {ctaP.toFixed(3)};
						"
					>
						<button type="button" class="lusion-pill-btn" onclick={scrollToFeaturedWork}>
							<span class="pill-flood" aria-hidden="true"></span>
							<span class="pill-text">แนวทางการทำงาน</span>
							<span class="pill-arrow" aria-hidden="true">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path
										d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5"
										stroke="currentColor"
										stroke-width="1.6"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- PART B: FULL-WIDTH PLAY REEL LANDING ZONE WITH ROTATING '+' CROSSHAIRS -->
		<div
			bind:this={reelStageEl}
			class="lusion-reel-stage"
		>
			<div
				class="reel-crosshair-rail"
				style="opacity: {crosshairsOpacity.toFixed(3)};"
				aria-hidden="true"
			>
				{#each [0, 1, 2, 3, 4] as ci (ci)}
					<span
						class="reel-crosshair"
						style="transform: rotate({(crosshairDeg + ci * 18).toFixed(1)}deg);"
					>
						<svg width="15" height="15" viewBox="0 0 15 15" fill="none">
							<path d="M7.5 1V14M1 7.5H14" stroke="currentColor" stroke-width="1.5" />
						</svg>
					</span>
				{/each}
			</div>

			<!-- Invisible Full-Width Landing Anchor where the Flying Video Card settles cleanly in full color! -->
			<div bind:this={reelSlotEl} class="lusion-reel-anchor" aria-hidden="true"></div>

			<div
				class="reel-crosshair-rail"
				style="opacity: {crosshairsOpacity.toFixed(3)};"
				aria-hidden="true"
			>
				{#each [0, 1, 2, 3, 4] as ci (ci)}
					<span
						class="reel-crosshair"
						style="transform: rotate({(-crosshairDeg - ci * 18).toFixed(1)}deg);"
					>
						<svg width="15" height="15" viewBox="0 0 15 15" fill="none">
							<path d="M7.5 1V14M1 7.5H14" stroke="currentColor" stroke-width="1.5" />
						</svg>
					</span>
				{/each}
			</div>
		</div>

		<!-- PART C: PURE LUSION 2-COLUMN FEATURED WORK GRID (All 6 Real Works & Motion GIFs — Zero Overlay Clutter) -->
		<div bind:this={featuredSectionEl} class="lusion-featured-section">
			<div
				bind:this={featuredHeadEl}
				class="lusion-featured-header"
				style="
					transform: translate3d(0, {((1 - featHeadP) * 42).toFixed(1)}px, 0);
					opacity: {featHeadP.toFixed(3)};
				"
			>
				<h2 class="featured-big-title">Featured Work</h2>
				<p class="featured-disclaimer">
					ผลงานที่ออกแบบและพัฒนาจริง สำหรับธุรกิจ แพลตฟอร์มสเกลใหญ่ และครีเอเตอร์สายอนิเมะ
				</p>
			</div>

			<div class="lusion-project-grid">
				{#each PROJECTS_DATA as work, idx (work.id)}
					{@const pOffset = cardHoverParallax[idx]}
					{@const chars = splitChars(work.shortTitle)}
					{@const cp = cardProgress[idx] ?? 1}
					<button
						type="button"
						class="lusion-project-card"
						style="
							transform: translate3d(0, {((1 - cp) * 52).toFixed(1)}px, 0);
							opacity: {cp.toFixed(3)};
						"
						onmouseenter={() => handleCardMouseEnter(idx)}
						onmousemove={(e) => handleCardMouseMove(idx, e)}
						onmouseleave={() => handleCardMouseLeave(idx)}
						onclick={() => openProjectDetail(idx)}
					>
						<div class="lusion-card-media">
							<img
								src={work.previewImage}
								alt={work.shortTitle}
								class="lusion-card-img"
								style="--px: {pOffset.x.toFixed(1)}px; --py: {pOffset.y.toFixed(1)}px;"
							/>
						</div>

						<div class="lusion-card-tags">{scrambledTags[idx]}</div>

						<div class="lusion-card-title-row">
							<span class="card-title-arrow" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="none">
									<path
										d="M4 12H20M20 12L13.5 5.5M20 12L13.5 18.5"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</span>

							<span class="card-title-chars" aria-label={work.shortTitle}>
								{#each chars as ch, ci (ci)}
									<span class="char-mask">
										<span class="char-stack" style="--ci: {ci};">
											<span class="char-glyph">{ch}</span>
											<span class="char-glyph" aria-hidden="true">{ch}</span>
										</span>
									</span>
								{/each}
							</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="lusion-bottom-buffer" aria-hidden="true"></div>

	<!-- PART D: LUSION FULLSCREEN CASE-STUDY OVERLAY (Portaled to document.body) -->
	{#if selectedWork !== null && selectedIdx !== null}
		<div
			use:portal
			class="lusion-detail-portal"
			class:closing={isClosingDetail}
			style="
				--pd-bg: {selectedWork.detailTheme.bg};
				--pd-text: {selectedWork.detailTheme.text};
				--pd-highlight: {selectedWork.detailTheme.highlight};
				--pd-btn-bg: {selectedWork.detailTheme.btnBg};
				--pd-btn-text: {selectedWork.detailTheme.btnText};
			"
			role="dialog"
			aria-modal="true"
			aria-label={selectedWork.shortTitle}
			onwheel={handleDetailWheel}
		>
			<header class="pd-topbar">
				<span class="pd-wordmark">PAPERX</span>

				<div class="pd-nav-pills">
					<button type="button" class="pd-back-pill" onclick={closeProjectDetail}>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path
								d="M13 8H3M3 8L7.5 3.5M3 8L7.5 12.5"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<span>BACK</span>
					</button>

					<div class="pd-pager">
						<button
							type="button"
							class="pd-pager-btn"
							onclick={() => stepProjectDetail(-1)}
							aria-label="Previous project"
						>
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
								<path
									d="M10 3.5L5.5 8L10 12.5"
									stroke="currentColor"
									stroke-width="1.7"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
						<span class="pd-pager-count">0{selectedIdx + 1} / 0{PROJECTS_DATA.length}</span>
						<button
							type="button"
							class="pd-pager-btn"
							onclick={() => stepProjectDetail(1)}
							aria-label="Next project"
						>
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
								<path
									d="M6 3.5L10.5 8L6 12.5"
									stroke="currentColor"
									stroke-width="1.7"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
					</div>
				</div>
			</header>

			<div
				class="pd-body"
				class:slide-out-left={pageSlideState === 'out-left'}
				class:slide-out-right={pageSlideState === 'out-right'}
				class:slide-in-right={pageSlideState === 'in-from-right'}
				class:slide-in-left={pageSlideState === 'in-from-left'}
			>
				<div class="pd-left">
					<h2 class="pd-title">{selectedWork.shortTitle}</h2>

					<div class="pd-meta-split">
						<div class="pd-desc-col">
							<p class="pd-desc">{selectedWork.description}</p>
							<p class="pd-desc-sub">{selectedWork.metricDetail}</p>

							{#if selectedWork.link}
								<a
									href={selectedWork.link}
									target="_blank"
									rel="noopener noreferrer"
									class="pd-launch-pill"
								>
									<span class="pd-launch-dot" aria-hidden="true"></span>
									<span class="pd-launch-text">{selectedWork.ctaText}</span>
									<span class="pd-launch-arrow" aria-hidden="true">
										<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
											<path
												d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5"
												stroke="currentColor"
												stroke-width="1.6"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</span>
								</a>
							{/if}

							{#if selectedWork.extraLinks && selectedWork.extraLinks.length > 0}
								<div class="pd-extra-links">
									{#each selectedWork.extraLinks as ex (ex.href)}
										<a
											href={ex.href}
											target="_blank"
											rel="noopener noreferrer"
											class="pd-extra-chip"
										>
											<span>{ex.label}</span>
											<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
												<path
													d="M4 12L12 4M12 4H6M12 4V10"
													stroke="currentColor"
													stroke-width="1.6"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</svg>
										</a>
									{/each}
								</div>
							{/if}
						</div>

						<div class="pd-services-col">
							<span class="pd-services-label">SERVICES</span>
							<ul class="pd-services-list">
								{#each selectedWork.services as srv (srv)}
									<li>{srv}</li>
								{/each}
							</ul>

							<span class="pd-services-label pd-client-heading">CLIENT</span>
							<div class="pd-client-name">{selectedWork.clientOrType}</div>
							<div class="pd-client-domain">{selectedWork.domain} · {selectedWork.year}</div>
						</div>
					</div>
				</div>

				<div class="pd-right">
					<div class="pd-gallery-viewport">
						<div
							class="pd-gallery-track"
							style="transform: translate3d({detailSlide === 0 ? '0%' : '-52%'}, 0, 0);"
						>
							<button
								type="button"
								class="pd-media-slide"
								onclick={toggleDetailSlide}
								aria-label="Toggle showcase slide"
							>
								<img
									src={selectedWork.previewImage}
									alt={selectedWork.shortTitle}
									class="pd-media-img"
								/>
							</button>

							<button
								type="button"
								class="pd-spec-slide"
								class:has-secondary-img={Boolean(selectedWork.secondaryImage)}
								onclick={toggleDetailSlide}
								aria-label="Back to visual preview"
							>
								{#if selectedWork.secondaryImage}
									<img
										src={selectedWork.secondaryImage}
										alt="{selectedWork.shortTitle} profile"
										class="pd-secondary-img"
									/>
								{/if}
								<div class="pd-spec-content">
									<span class="pd-spec-code">{selectedWork.code}</span>
									<h3 class="pd-spec-headline">{selectedWork.metricHeadline}</h3>
									<p class="pd-spec-copy">{selectedWork.metricDetail}</p>

									<div class="pd-spec-stack">
										{#each selectedWork.tech as t (t)}
											<span class="pd-tech-chip">{t}</span>
										{/each}
									</div>
								</div>
							</button>
						</div>
					</div>

					<div class="pd-footer-hint">
						<button type="button" class="pd-explore-btn" onclick={toggleDetailSlide}>
							{detailSlide === 0 ? 'SCROLL TO EXPLORE >>' : '<< BACK TO PREVIEW'}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</section>

<style>
	/* ==========================================================
	   DEFAULT: DARK MODE — OBSIDIAN & CRIMSON (#060608 + #e60012)
	   ========================================================== */
	.lusion-section {
		position: relative;
		width: 100%;
		--lu-bg: #060608;
		--lu-ink: #ffffff;
		--lu-ink-muted: rgba(255, 255, 255, 0.72);
		--lu-ink-tag: rgba(255, 255, 255, 0.62);
		--lu-accent: #e60012;
		--lu-accent-glow: rgba(230, 0, 18, 0.34);
		--lu-pill-bg: #14151d;
		--lu-pill-border: rgba(255, 255, 255, 0.16);
		--lu-pill-ink: #ffffff;
		--lu-pill-dot: #ff2a45;
		--lu-crosshair: rgba(255, 255, 255, 0.56);
		--lu-card-frame: rgba(255, 255, 255, 0.1);
		--lu-card-shadow: 0 22px 54px rgba(0, 0, 0, 0.55);
		--lu-card-shadow-hover: 0 28px 66px rgba(230, 0, 18, 0.16), 0 18px 44px rgba(0, 0, 0, 0.65);

		background: var(--lu-bg);
		color: var(--lu-ink);
		font-family: 'DM Sans', 'LINE Seed Sans TH', -apple-system, BlinkMacSystemFont, sans-serif;
		overflow: hidden;
		transition:
			background-color 0.5s cubic-bezier(0.22, 1, 0.36, 1),
			color 0.45s ease;
	}

	/* ==========================================================
	   LIGHT MODE — LUSION OFF-WHITE & COBALT (#f0f1fa + #1a2ffb)
	   ========================================================== */
	.lusion-section.theme-light {
		--lu-bg: #f0f1fa;
		--lu-ink: #000000;
		--lu-ink-muted: #161824;
		--lu-ink-tag: #1b1d29;
		--lu-accent: #1a2ffb;
		--lu-accent-glow: rgba(26, 47, 251, 0.28);
		--lu-pill-bg: #ffffff;
		--lu-pill-border: transparent;
		--lu-pill-ink: #000000;
		--lu-pill-dot: #000000;
		--lu-crosshair: rgba(22, 24, 36, 0.72);
		--lu-card-frame: rgba(15, 23, 42, 0.08);
		--lu-card-shadow: 0 14px 36px rgba(17, 22, 48, 0.08);
		--lu-card-shadow-hover: 0 24px 54px rgba(26, 47, 251, 0.14);
	}

	.lusion-top-buffer {
		width: 100%;
		height: clamp(84px, 14vh, 145px);
		background: linear-gradient(180deg, #000000 0%, #060608 100%);
		pointer-events: none;
	}

	.lusion-section.theme-light .lusion-top-buffer {
		background: #f0f1fa;
	}

	.lusion-bottom-buffer {
		width: 100%;
		height: 84px;
		background: linear-gradient(180deg, #060608 0%, #040508 100%);
		pointer-events: none;
	}

	.lusion-section.theme-light .lusion-bottom-buffer {
		background: #f0f1fa;
	}

	.lusion-inner {
		max-width: 1320px;
		margin: 0 auto;
		padding: 12px clamp(24px, 4.8vw, 64px) 52px;
		position: relative;
	}

	/* ==========================================================
	   SINGLE 1:1 LUSION FLYING DUOTONE -> VIBRANT COLOR VIDEO CARD
	   ========================================================== */
	.lusion-flying-video-layer {
		position: absolute;
		z-index: 6;
		pointer-events: auto;
		visibility: hidden;
		will-change: left, top, width, height, opacity;
	}

	.lusion-flying-video-layer.ready {
		visibility: visible;
	}

	.lusion-flying-card-3d {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: #140308;
		border: 1px solid var(--lu-card-frame);
		box-shadow: 0 28px 64px rgba(230, 0, 18, 0.22), 0 18px 44px rgba(0, 0, 0, 0.55);
		transform-origin: center center;
		will-change: transform, border-radius;
	}

	.lusion-section.theme-light .lusion-flying-card-3d {
		background: #1422c4;
		border-color: transparent;
		box-shadow: 0 26px 56px rgba(26, 47, 251, 0.18);
	}

	.flying-video-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1);
		will-change: opacity, filter;
	}

	.flying-video-img.active {
		opacity: 1;
	}

	/* Crimson Duotone (Dark Mode) / Electric Cobalt Duotone (Light Mode) — Melts smoothly away mid-flight! */
	.flying-duotone-veil {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(230, 0, 18, 0.88) 0%, rgba(168, 0, 24, 0.82) 100%);
		mix-blend-mode: color;
		pointer-events: none;
		will-change: opacity;
	}

	.flying-duotone-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 28% 25%, rgba(255, 58, 86, 0.36), rgba(20, 2, 8, 0.48));
		mix-blend-mode: multiply;
		pointer-events: none;
		will-change: opacity;
	}

	.lusion-section.theme-light .flying-duotone-veil {
		background: linear-gradient(135deg, rgba(26, 47, 251, 0.9) 0%, rgba(56, 86, 255, 0.78) 100%);
	}

	.lusion-section.theme-light .flying-duotone-glow {
		background: radial-gradient(circle at 28% 25%, rgba(86, 118, 255, 0.38), rgba(14, 28, 200, 0.42));
		mix-blend-mode: screen;
	}

	.flying-reel-scrim {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at center, rgba(8, 10, 18, 0.16) 0%, rgba(8, 10, 18, 0.46) 100%);
		pointer-events: none;
	}

	.flying-play-overlay {
		position: absolute;
		inset: 0;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(18px, 3.6vw, 52px);
		padding: 0 20px;
	}

	.flying-card-hit {
		position: absolute;
		inset: 0;
		z-index: 4;
		border: none;
		background: transparent;
		cursor: pointer;
	}

	/* ==========================================================
	   PART A: 100% SCROLL-SCRUBBED EDITORIAL INTRO + 3D RIBBON
	   ========================================================== */
	.lusion-intro-stage {
		position: relative;
		padding-top: 24px;
		padding-bottom: clamp(110px, 14vh, 170px);
	}

	.lusion-ribbon-svg {
		position: absolute;
		top: -14px;
		left: -6%;
		width: 112%;
		height: calc(100% + 40px);
		pointer-events: none;
		z-index: 1;
		overflow: visible;
	}

	.lusion-hero-title {
		position: relative;
		z-index: 2;
		margin: 0 0 clamp(44px, 5.5vw, 76px);
		font-family: 'DM Sans', 'LINE Seed Sans TH', sans-serif;
		font-weight: 400;
		font-size: clamp(3.1rem, 8.6vw, 7.6rem);
		line-height: 1.02;
		letter-spacing: -0.03em;
		color: var(--lu-ink);
	}

	.title-line-mask {
		display: block;
		overflow: hidden;
		padding-bottom: 0.08em;
		margin-bottom: -0.08em;
	}

	.title-line-mask.line-indent {
		padding-left: clamp(28px, 16vw, 220px);
	}

	.title-line-inner {
		display: block;
		will-change: transform, opacity;
	}

	.lusion-approach-grid {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
		gap: clamp(32px, 5vw, 84px);
		align-items: start;
	}

	@media (max-width: 860px) {
		.lusion-approach-grid {
			grid-template-columns: 1fr;
			gap: 36px;
		}
		.title-line-mask.line-indent {
			padding-left: 0;
		}
	}

	/* Invisible layout anchor for the starting position of the Flying Video Card */
	.lusion-thumb-anchor {
		width: 100%;
		aspect-ratio: 100 / 64;
		pointer-events: none;
	}

	.lusion-approach-right {
		padding-top: clamp(0px, 1.5vw, 18px);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 30px;
	}

	.lusion-approach-desc {
		margin: 0;
		font-size: clamp(1rem, 1.38vw, 1.42rem);
		line-height: 1.5;
		font-weight: 400;
		color: var(--lu-ink-muted);
		max-width: 520px;
		will-change: transform, opacity;
	}

	.lusion-cta-slot {
		position: relative;
		z-index: 4;
		will-change: transform, opacity;
	}

	.lusion-pill-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		height: 54px;
		padding: 0 28px;
		border: 1px solid var(--lu-pill-border);
		border-radius: 999px;
		background: var(--lu-pill-bg);
		color: var(--lu-pill-ink);
		font-family: 'LINE Seed Sans TH', 'DM Sans', sans-serif;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		cursor: pointer;
		overflow: hidden;
		box-shadow:
			0 8px 20px rgba(0, 0, 0, 0.16),
			0 2px 6px rgba(0, 0, 0, 0.08);
		transition:
			border-color 0.35s ease,
			box-shadow 0.35s ease;
	}

	.lusion-section.theme-light .lusion-pill-btn {
		box-shadow:
			0 8px 18px rgba(0, 0, 0, 0.05),
			0 2px 5px rgba(0, 0, 0, 0.04);
	}

	.lusion-pill-btn:hover {
		border-color: var(--lu-accent);
		box-shadow: 0 12px 28px var(--lu-accent-glow);
	}

	.pill-flood {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: var(--lu-accent);
		transform: scale3d(1, 0, 1);
		transform-origin: bottom center;
		transition: transform 0.44s cubic-bezier(0.35, 0, 0, 1);
	}

	.lusion-pill-btn:hover .pill-flood {
		transform: scale3d(1, 1, 1);
	}

	.pill-text {
		position: relative;
		z-index: 2;
		transition:
			transform 0.42s cubic-bezier(0.35, 0, 0, 1),
			color 0.3s ease;
	}

	.lusion-pill-btn:hover .pill-text {
		color: #ffffff;
		transform: translate3d(-0.65em, 0, 0);
	}

	.pill-arrow {
		position: absolute;
		right: 18px;
		z-index: 2;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: #ffffff;
		opacity: 0;
		transform: translate3d(1.8em, 0, 0);
		transition:
			transform 0.42s cubic-bezier(0.35, 0, 0, 1),
			opacity 0.3s ease;
	}

	.lusion-pill-btn:hover .pill-arrow {
		opacity: 1;
		transform: translate3d(0, 0, 0);
	}

	/* ==========================================================
	   PART B: PLAY REEL LANDING STAGE + ROTATING CROSSHAIRS
	   ========================================================== */
	.lusion-reel-stage {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: 18px 0 48px;
	}

	.reel-crosshair-rail {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 4px;
		color: var(--lu-crosshair);
	}

	.reel-crosshair {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		will-change: transform;
	}

	/* Invisible Full-Width Landing Anchor for the Flying Video Card */
	.lusion-reel-anchor {
		width: 100%;
		aspect-ratio: 16 / 8.5;
		min-height: 300px;
		pointer-events: none;
	}

	.reel-big-word {
		font-family: 'DM Sans', 'LINE Seed Sans TH', sans-serif;
		font-weight: 400;
		font-size: clamp(2.1rem, 6.8vw, 6.2rem);
		line-height: 1;
		letter-spacing: -0.02em;
		color: #ffffff;
		user-select: none;
		will-change: transform;
		text-shadow: 0 10px 30px rgba(0, 0, 0, 0.36);
	}

	.reel-watch-pill {
		position: relative;
		width: clamp(78px, 8.6vw, 114px);
		height: clamp(50px, 5.4vw, 72px);
		border: none;
		border-radius: 999px;
		background: #ffffff;
		color: #0b0d14;
		display: grid;
		place-items: center;
		cursor: pointer;
		overflow: hidden;
		box-shadow: 0 14px 32px rgba(0, 0, 0, 0.32);
		transition:
			transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
			color 0.32s ease;
	}

	.reel-watch-pill:hover {
		transform: scale(1.06);
		color: #ffffff;
	}

	.reel-watch-fill {
		position: absolute;
		inset: 0;
		background: var(--lu-accent);
		transform: scale3d(1, 0, 1);
		transform-origin: bottom center;
		transition: transform 0.42s cubic-bezier(0.35, 0, 0, 1);
	}

	.reel-watch-pill:hover .reel-watch-fill {
		transform: scale3d(1, 1, 1);
	}

	.reel-play-tri {
		position: relative;
		z-index: 2;
		margin-left: 3px;
	}

	/* ==========================================================
	   PART C: EXACT LUSION 2-COLUMN FEATURED WORK GRID
	   ========================================================== */
	.lusion-featured-section {
		padding-top: clamp(72px, 7.5vw, 116px);
		padding-bottom: 42px;
	}

	.lusion-featured-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 32px;
		margin-bottom: clamp(42px, 4.5vw, 68px);
		flex-wrap: wrap;
		will-change: transform, opacity;
	}

	.featured-big-title {
		margin: 0;
		font-family: 'DM Sans', 'LINE Seed Sans TH', sans-serif;
		font-weight: 400;
		font-size: clamp(2.8rem, 7.2vw, 6.4rem);
		line-height: 0.92;
		letter-spacing: -0.03em;
		color: var(--lu-ink);
	}

	.featured-disclaimer {
		margin: 0 0 6px;
		max-width: 310px;
		font-size: clamp(0.72rem, 0.88vw, 0.86rem);
		line-height: 1.48;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--lu-ink-tag);
	}

	.lusion-project-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: clamp(22px, 2.2vw, 34px);
		row-gap: clamp(46px, 5vw, 72px);
	}

	@media (max-width: 780px) {
		.lusion-project-grid {
			grid-template-columns: 1fr;
			row-gap: 44px;
		}
	}

	.lusion-project-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		border: none;
		padding: 0;
		background: transparent;
		text-align: left;
		cursor: pointer;
		color: var(--lu-ink);
		font-family: inherit;
		will-change: transform, opacity;
	}

	.lusion-card-media {
		position: relative;
		width: 100%;
		aspect-ratio: 100 / 64;
		border-radius: 15px;
		overflow: hidden;
		background: #12131c;
		border: 1px solid var(--lu-card-frame);
		box-shadow: var(--lu-card-shadow);
		transition:
			box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1),
			border-color 0.4s ease;
	}

	.lusion-section.theme-light .lusion-card-media {
		background: #e2e5f3;
	}

	.lusion-project-card:hover .lusion-card-media {
		box-shadow: var(--lu-card-shadow-hover);
		border-color: color-mix(in srgb, var(--lu-accent) 45%, transparent);
	}

	.lusion-card-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
		display: block;
		transform: translate3d(var(--px, 0px), var(--py, 0px), 0) scale(1);
		transition: transform 0.72s cubic-bezier(0.22, 1, 0.36, 1);
		will-change: transform;
	}

	.lusion-project-card:hover .lusion-card-img {
		transform: translate3d(var(--px, 0px), var(--py, 0px), 0) scale(1.06);
	}

	.lusion-card-tags {
		margin: 18px 0 8px;
		font-family: 'DM Sans', 'LINE Seed Sans TH', sans-serif;
		font-weight: 400;
		font-size: clamp(0.68rem, 0.84vw, 0.82rem);
		line-height: 1.3;
		letter-spacing: 0.045em;
		text-transform: uppercase;
		color: var(--lu-ink-tag);
	}

	.lusion-card-title-row {
		position: relative;
		display: inline-flex;
		align-items: center;
		font-family: 'DM Sans', 'LINE Seed Sans TH', sans-serif;
		font-weight: 400;
		font-size: clamp(1.65rem, 2.7vw, 2.6rem);
		line-height: 1.12;
		letter-spacing: -0.025em;
		color: var(--lu-ink);
		overflow: hidden;
		padding-right: 1.25em;
	}

	.card-title-arrow {
		position: absolute;
		left: 0;
		top: 50%;
		width: 0.78em;
		height: 0.78em;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--lu-accent);
		transform: translate3d(-1.15em, -50%, 0);
		opacity: 0;
		transition:
			transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.3s ease;
	}

	.card-title-arrow svg {
		width: 100%;
		height: 100%;
	}

	.lusion-project-card:hover .card-title-arrow {
		transform: translate3d(0, -50%, 0);
		opacity: 1;
	}

	.card-title-chars {
		display: inline-flex;
		align-items: center;
		transform: translate3d(0, 0, 0);
		transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.lusion-project-card:hover .card-title-chars {
		transform: translate3d(1.06em, 0, 0);
	}

	.char-mask {
		display: inline-block;
		height: 1.14em;
		overflow: hidden;
		vertical-align: top;
	}

	.char-stack {
		display: flex;
		flex-direction: column;
		transform: translate3d(0, 0%, 0);
		transition: transform 0.52s cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: calc(var(--ci, 0) * 16ms);
	}

	.lusion-project-card:hover .char-stack {
		transform: translate3d(0, -50%, 0);
	}

	.char-glyph {
		display: block;
		height: 1.14em;
		line-height: 1.14em;
	}

	/* ==========================================================
	   PART D: LUSION FULLSCREEN CASE-STUDY OVERLAY (PORTALED)
	   ========================================================== */
	.lusion-detail-portal {
		position: fixed;
		inset: 0;
		z-index: 99990;
		background: var(--pd-bg, #181818);
		color: var(--pd-text, #fffde0);
		font-family: 'DM Sans', 'LINE Seed Sans TH', -apple-system, BlinkMacSystemFont, sans-serif;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition:
			background-color 0.42s cubic-bezier(0.22, 1, 0.36, 1),
			color 0.42s ease;
		animation: lusionFadeSlideUp 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.lusion-detail-portal.closing {
		animation: lusionFadeSlideDown 0.44s cubic-bezier(0.32, 0, 0.2, 1) forwards;
	}

	@keyframes lusionFadeSlideUp {
		0% {
			opacity: 0;
			transform: translate3d(0, 56px, 0) scale(0.985);
			clip-path: inset(100% 0% 0% 0%);
		}
		100% {
			opacity: 1;
			transform: translate3d(0, 0, 0) scale(1);
			clip-path: inset(0% 0% 0% 0%);
		}
	}

	@keyframes lusionFadeSlideDown {
		0% {
			opacity: 1;
			transform: translate3d(0, 0, 0) scale(1);
			clip-path: inset(0% 0% 0% 0%);
		}
		100% {
			opacity: 0;
			transform: translate3d(0, 64px, 0) scale(0.985);
			clip-path: inset(100% 0% 0% 0%);
		}
	}

	.pd-topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: clamp(20px, 3vw, 34px) clamp(24px, 4.8vw, 60px);
		flex-shrink: 0;
	}

	.pd-wordmark {
		font-family: 'DM Sans', 'LINE Seed Sans TH', sans-serif;
		font-weight: 600;
		font-size: 1.25rem;
		letter-spacing: 0.14em;
		color: var(--pd-highlight);
	}

	.pd-nav-pills {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.pd-back-pill {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		height: 44px;
		padding: 0 22px;
		border: none;
		border-radius: 999px;
		background: #ffffff;
		color: #12141c;
		font-family: 'DM Sans', 'LINE Seed Sans TH', sans-serif;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		cursor: pointer;
		transition:
			background-color 0.3s ease,
			color 0.3s ease,
			transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.pd-back-pill:hover {
		background: var(--pd-highlight);
		color: #ffffff;
		transform: translateX(-2px);
	}

	.pd-pager {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 44px;
		padding: 0 8px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.pd-pager-btn {
		width: 30px;
		height: 30px;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--pd-text);
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease;
	}

	.pd-pager-btn:hover {
		background: var(--pd-highlight);
		color: #ffffff;
	}

	.pd-pager-count {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 0.74rem;
		padding: 0 6px;
		color: var(--pd-text);
		opacity: 0.8;
	}

	.pd-body {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
		gap: clamp(28px, 4vw, 64px);
		align-items: center;
		padding: 8px clamp(24px, 4.8vw, 60px) clamp(24px, 4vw, 44px);
		will-change: transform, opacity;
	}

	.pd-body.slide-out-left {
		animation: pdSlideOutLeft 0.15s cubic-bezier(0.4, 0, 1, 1) forwards;
	}

	.pd-body.slide-out-right {
		animation: pdSlideOutRight 0.15s cubic-bezier(0.4, 0, 1, 1) forwards;
	}

	.pd-body.slide-in-right {
		animation: pdSlideInFromRight 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.pd-body.slide-in-left {
		animation: pdSlideInFromLeft 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@keyframes pdSlideOutLeft {
		0% {
			opacity: 1;
			transform: translate3d(0, 0, 0);
		}
		100% {
			opacity: 0;
			transform: translate3d(-64px, 0, 0);
		}
	}

	@keyframes pdSlideOutRight {
		0% {
			opacity: 1;
			transform: translate3d(0, 0, 0);
		}
		100% {
			opacity: 0;
			transform: translate3d(64px, 0, 0);
		}
	}

	@keyframes pdSlideInFromRight {
		0% {
			opacity: 0;
			transform: translate3d(72px, 0, 0);
		}
		100% {
			opacity: 1;
			transform: translate3d(0, 0, 0);
		}
	}

	@keyframes pdSlideInFromLeft {
		0% {
			opacity: 0;
			transform: translate3d(-72px, 0, 0);
		}
		100% {
			opacity: 1;
			transform: translate3d(0, 0, 0);
		}
	}

	.pd-left {
		display: flex;
		flex-direction: column;
		gap: clamp(24px, 3.2vw, 44px);
	}

	.pd-title {
		margin: 0;
		font-family: 'DM Sans', 'LINE Seed Sans TH', sans-serif;
		font-weight: 400;
		font-size: clamp(2.4rem, 4.6vw, 4.2rem);
		line-height: 0.96;
		letter-spacing: -0.03em;
		color: var(--pd-text);
	}

	.pd-meta-split {
		display: grid;
		grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
		gap: clamp(20px, 3vw, 42px);
		align-items: start;
	}

	@media (max-width: 580px) {
		.pd-meta-split {
			grid-template-columns: 1fr;
		}
	}

	.pd-desc-col {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}

	.pd-desc {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.65;
		color: var(--pd-text);
		opacity: 0.92;
	}

	.pd-desc-sub {
		margin: 0 0 10px;
		font-size: 0.84rem;
		line-height: 1.6;
		color: var(--pd-text);
		opacity: 0.68;
	}

	.pd-launch-pill {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 12px;
		height: 50px;
		padding: 0 24px 0 20px;
		border-radius: 999px;
		background: var(--pd-btn-bg);
		color: var(--pd-btn-text);
		text-decoration: none;
		font-family: 'DM Sans', 'LINE Seed Sans TH', sans-serif;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.055em;
		text-transform: uppercase;
		overflow: hidden;
		transition: background-color 0.42s 0.16s ease;
	}

	.pd-launch-pill:hover {
		background: var(--pd-highlight);
	}

	.pd-launch-dot {
		position: relative;
		z-index: 1;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--pd-btn-text);
		transition:
			transform 0.46s cubic-bezier(0.35, 0, 0, 1),
			background-color 0.25s ease;
	}

	.pd-launch-pill:hover .pd-launch-dot {
		background: var(--pd-highlight);
		transform: translate3d(2.4em, 0, 0) scale(44);
	}

	.pd-launch-text {
		position: relative;
		z-index: 2;
		transition:
			transform 0.4s cubic-bezier(0.35, 0, 0, 1),
			color 0.28s ease;
	}

	.pd-launch-pill:hover .pd-launch-text {
		color: #ffffff;
		transform: translate3d(-1.1em, 0, 0);
	}

	.pd-launch-arrow {
		position: absolute;
		right: 18px;
		z-index: 2;
		display: inline-flex;
		color: #ffffff;
		opacity: 0;
		transform: translate3d(2em, 0, 0);
		transition:
			transform 0.4s cubic-bezier(0.35, 0, 0, 1),
			opacity 0.28s ease;
	}

	.pd-launch-pill:hover .pd-launch-arrow {
		opacity: 1;
		transform: translate3d(0, 0, 0);
	}

	.pd-extra-links {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 2px;
	}

	.pd-extra-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 13px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.16);
		color: var(--pd-text);
		text-decoration: none;
		font-family: 'LINE Seed Sans TH', 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		font-weight: 500;
		transition:
			background-color 0.25s ease,
			border-color 0.25s ease,
			color 0.25s ease;
	}

	.pd-extra-chip:hover {
		background: var(--pd-highlight);
		border-color: var(--pd-highlight);
		color: #ffffff;
	}

	.pd-services-col {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.pd-services-label {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--pd-highlight);
	}

	.pd-client-heading {
		margin-top: 16px;
	}

	.pd-services-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 5px;
		font-size: 0.84rem;
		line-height: 1.4;
		color: var(--pd-text);
		opacity: 0.88;
	}

	.pd-client-name {
		font-size: 0.84rem;
		font-weight: 500;
		color: var(--pd-text);
	}

	.pd-client-domain {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 0.72rem;
		color: var(--pd-text);
		opacity: 0.58;
	}

	.pd-right {
		display: flex;
		flex-direction: column;
		gap: 18px;
		min-width: 0;
	}

	.pd-gallery-viewport {
		width: 100%;
		overflow: hidden;
		border-radius: 16px;
	}

	.pd-gallery-track {
		display: flex;
		gap: 4%;
		width: 192%;
		transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.pd-media-slide {
		position: relative;
		width: 50%;
		aspect-ratio: 100 / 64;
		border: none;
		padding: 0;
		border-radius: 16px;
		overflow: hidden;
		background: #0d0e13;
		cursor: pointer;
		flex-shrink: 0;
	}

	.pd-media-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
		display: block;
		transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.pd-media-slide:hover .pd-media-img {
		transform: scale(1.035);
	}

	.pd-spec-slide {
		width: 50%;
		aspect-ratio: 100 / 64;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: clamp(24px, 3vw, 42px);
		background: rgba(255, 255, 255, 0.035);
		color: var(--pd-text);
		text-align: left;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 16px;
		cursor: pointer;
		flex-shrink: 0;
		font-family: inherit;
		overflow: hidden;
		position: relative;
	}

	.pd-spec-slide.has-secondary-img {
		padding: 0;
		justify-content: flex-end;
	}

	.pd-secondary-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		opacity: 0.36;
		transition: opacity 0.45s ease, transform 0.65s ease;
	}

	.pd-spec-slide.has-secondary-img:hover .pd-secondary-img {
		opacity: 0.56;
		transform: scale(1.03);
	}

	.pd-spec-content {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.pd-spec-slide.has-secondary-img .pd-spec-content {
		padding: clamp(20px, 2.8vw, 34px);
		background: linear-gradient(180deg, transparent 0%, rgba(12, 11, 16, 0.9) 46%, rgba(12, 11, 16, 0.98) 100%);
	}

	.pd-spec-code {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		color: var(--pd-highlight);
	}

	.pd-spec-headline {
		margin: 0;
		font-size: clamp(1.4rem, 2.4vw, 2.15rem);
		font-weight: 500;
		line-height: 1.25;
		color: var(--pd-text);
	}

	.pd-spec-copy {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.65;
		color: var(--pd-text);
		opacity: 0.8;
	}

	.pd-spec-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.pd-tech-chip {
		padding: 6px 12px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.12);
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 0.72rem;
		color: var(--pd-text);
	}

	.pd-footer-hint {
		display: flex;
		justify-content: flex-end;
	}

	.pd-explore-btn {
		border: none;
		background: transparent;
		color: var(--pd-highlight);
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 0.76rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		cursor: pointer;
		padding: 6px 2px;
		transition: opacity 0.25s ease, transform 0.25s ease;
	}

	.pd-explore-btn:hover {
		opacity: 0.8;
		transform: translateX(4px);
	}

	/* Mobile & Tablet Responsive Polish for ProjectsShowcase */
	@media (max-width: 960px) {
		.lusion-detail-portal {
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
		}
		.pd-topbar {
			padding: 16px 18px;
		}
		.pd-wordmark {
			font-size: 1.05rem;
		}
		.pd-back-pill {
			height: 36px;
			padding: 0 14px;
			font-size: 0.72rem;
		}
		.pd-pager {
			height: 36px;
			padding: 0 5px;
		}
		.pd-body {
			grid-template-columns: 1fr;
			align-items: start;
			padding: 8px 18px 40px;
			gap: 24px;
		}
		.pd-title {
			font-size: clamp(1.9rem, 7.5vw, 2.75rem);
		}
		.pd-gallery-track {
			align-items: flex-start;
		}
		.pd-spec-slide {
			aspect-ratio: auto;
			min-height: 250px;
			height: auto;
			padding: 20px 18px;
			justify-content: flex-start;
			overflow: visible;
		}
		.pd-spec-slide.has-secondary-img {
			min-height: 290px;
			overflow: hidden;
		}
		.pd-spec-headline {
			font-size: 1.25rem;
		}
		.pd-spec-copy {
			font-size: 0.84rem;
		}
	}

	@media (max-width: 768px) {
		.lusion-inner {
			padding-left: 16px;
			padding-right: 16px;
		}

		.reel-big-word {
			font-size: clamp(1.35rem, 6.5vw, 2.2rem);
		}
	}
</style>
