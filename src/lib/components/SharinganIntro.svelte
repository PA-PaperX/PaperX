<script lang="ts">
	import { onMount } from 'svelte';

	let {
		onComplete
	}: {
		onComplete: () => void;
	} = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();

	const BURST_AGENTS = [
		{ name: 'PaperX', color: '#e60012' },
		{ name: 'Itachi', color: '#ff2a6d' },
		{ name: 'UI-Arch', color: '#0078d4' },
		{ name: 'Svelte', color: '#ff3e00' },
		{ name: 'Film', color: '#facc15' },
		{ name: 'Phantom', color: '#a855f7' },
		{ name: 'Motion', color: '#38bdf8' },
		{ name: 'Hamster', color: '#22c55e' },
		{ name: 'Crow', color: '#f43f5e' },
		{ name: 'Typo', color: '#fb923c' },
		{ name: 'Canvas', color: '#2dd4bf' },
		{ name: 'Grid', color: '#818cf8' },
		{ name: 'Router', color: '#60a5fa' },
		{ name: 'Layout', color: '#f472b6' },
		{ name: 'Tokens', color: '#34d399' },
		{ name: 'Render', color: '#fb7185' }
	];

	function drawCursorArrow(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		color: string,
		label: string,
		scale: number,
		alpha: number
	) {
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.translate(x, y);
		ctx.scale(scale, scale);

		// Crisp pointer arrow matching SwarmOverlay SVG
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(7.5, 18);
		ctx.lineTo(10.5, 10.5);
		ctx.lineTo(18, 7.5);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 1.6;
		ctx.lineJoin = 'round';
		ctx.stroke();

		// Floating agent name pill right beside the cursor
		ctx.font = 'bold 10px "JetBrains Mono", monospace';
		const textW = ctx.measureText(label).width;
		const pillX = 12;
		const pillY = 12;
		const pillW = textW + 12;
		const pillH = 17;

		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.roundRect(pillX, pillY, pillW, pillH, [2, 5, 5, 5]);
		ctx.fill();

		ctx.fillStyle = '#08090d';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.fillText(label, pillX + 6, pillY + pillH / 2 + 0.5);

		ctx.restore();
	}

	onMount(() => {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		let animId = 0;
		const startTime = performance.now();

		// Timeline (total 4600ms):
		// 0.00s - 1.25s : 3-Tomoe Sharingan awakens & spins
		// 1.25s - 2.85s : Morphs into Itachi's 3-blade Mangekyou Sharingan & holds
		// 2.85s - 3.95s : SHATTERS into 16 multi-colored Agent Mouse Cursors bursting outward with trails!
		// 3.95s - 4.60s : Brief pitch-black beat (0.65s) before the Agent Swarm dives back in to build VS Code
		const T_MORPH_START = 1220;
		const T_MORPH_END = 1920;
		const T_SHATTER_START = 2850;
		const T_BLACKOUT_START = 3950;
		const T_TOTAL = 4600;

		const burstCursors: {
			x: number;
			y: number;
			vx: number;
			vy: number;
			trail: { x: number; y: number }[];
			name: string;
			color: string;
			scale: number;
			delayMs: number;
		}[] = [];

		const emberShards: {
			x: number;
			y: number;
			vx: number;
			vy: number;
			char: string;
			color: string;
		}[] = [];

		const resize = () => {
			if (!canvasEl) return;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvasEl.width = window.innerWidth * dpr;
			canvasEl.height = window.innerHeight * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		window.addEventListener('resize', resize);

		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				cancelAnimationFrame(animId);
				onComplete();
			}
		};
		window.addEventListener('keydown', handleKey);

		const render = (now: number) => {
			const elapsed = now - startTime;
			const w = window.innerWidth;
			const h = window.innerHeight;
			const cx = w / 2;
			const cy = h / 2;
			const baseRadius = Math.min(w, h) * 0.27;

			ctx.fillStyle = '#000000';
			ctx.fillRect(0, 0, w, h);

			if (elapsed < T_SHATTER_START) {
				const radial = ctx.createRadialGradient(cx, cy, 10, cx, cy, baseRadius * 1.38);
				radial.addColorStop(0, 'rgba(220, 0, 18, 0.34)');
				radial.addColorStop(0.6, 'rgba(130, 0, 12, 0.14)');
				radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
				ctx.fillStyle = radial;
				ctx.fillRect(0, 0, w, h);

				const morph = Math.max(
					0,
					Math.min(1, (elapsed - T_MORPH_START) / (T_MORPH_END - T_MORPH_START))
				);
				const angle =
					elapsed * 0.0022 +
					Math.sin(morph * Math.PI) * 1.8 +
					morph * Math.PI * 1.35 +
					Math.max(0, elapsed - T_MORPH_END) * 0.0014;

				const cellW = 10;
				const cellH = 12;
				const cols = Math.floor((baseRadius * 2.2) / cellW);
				const rows = Math.floor((baseRadius * 2.2) / cellH);

				ctx.font = 'bold 12px "JetBrains Mono", monospace';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';

				const eyeOpen = Math.min(1, elapsed / 320);

				for (let r = -Math.floor(rows / 2); r <= Math.floor(rows / 2); r++) {
					for (let c = -Math.floor(cols / 2); c <= Math.floor(cols / 2); c++) {
						const px = c * cellW;
						const py = r * cellH;

						const normX = px / (baseRadius * 1.15);
						const lidLimit = (1 - normX * normX * 0.42) * baseRadius * eyeOpen;
						if (Math.abs(py) > lidLimit) continue;

						const dist = Math.hypot(px, py);
						const normDist = dist / baseRadius;
						if (normDist > 1.02) continue;

						const rx = px * Math.cos(-angle) - py * Math.sin(-angle);
						const ry = px * Math.sin(-angle) + py * Math.cos(-angle);
						const theta = Math.atan2(ry, rx);

						// 3-Tomoe Sharingan
						let tomoeMask = 0;
						const trackRing = Math.abs(normDist - 0.56) < 0.026;
						if (trackRing) tomoeMask = 0.85;
						for (let i = 0; i < 3; i++) {
							const a = (i * Math.PI * 2) / 3;
							const tx = Math.cos(a) * 0.56 * baseRadius;
							const ty = Math.sin(a) * 0.56 * baseRadius;
							const dHead = Math.hypot(rx - tx, ry - ty) / baseRadius;
							if (dHead < 0.135) tomoeMask = 1;

							for (let s = 1; s <= 4; s++) {
								const ta = a - s * 0.11;
								const tr = (0.56 + s * 0.014) * baseRadius;
								const dTail =
									Math.hypot(rx - Math.cos(ta) * tr, ry - Math.sin(ta) * tr) / baseRadius;
								if (dTail < 0.105 - s * 0.018) tomoeMask = 1;
							}
						}

						// Itachi 3-Blade Mangekyou Sharingan
						let mangekyouMask = 0;
						if (normDist > 0.14 && normDist < 0.94) {
							const twist = theta - normDist * 1.35;
							const wave = Math.cos(twist * 3);
							const threshold = 0.12 + normDist * 0.36;
							if (wave > threshold || normDist < 0.34) {
								mangekyouMask = 1;
							}
						}

						const blackPattern = tomoeMask * (1 - morph) + mangekyouMask * morph;
						const isOuterBorder = normDist > 0.93;
						const isPupil = normDist < 0.16;
						const isMangekyouCenterRed = normDist < 0.068 && morph > 0.25;

						let ch = '⣿';
						let color = '#e60012';

						if (isOuterBorder) {
							ch = '⠿';
							color = '#3b0208';
						} else if (isMangekyouCenterRed) {
							ch = '⣿';
							color = '#ff1a35';
						} else if (isPupil || blackPattern > 0.52) {
							ch = '⠁';
							color = '#090002';
						} else {
							const pulse = Math.sin(normDist * 9 - elapsed * 0.008);
							ch = normDist > 0.78 ? '⠿' : pulse > 0 ? '⣿' : '⣾';
							color = normDist < 0.65 ? '#ff122c' : '#cc0014';
						}

						ctx.fillStyle = color;
						ctx.fillText(ch, cx + px, cy + py);
					}
				}
			} else if (elapsed < T_BLACKOUT_START) {
				// SHATTER INTO 16 BURSTING AGENT MOUSE CURSORS!
				if (burstCursors.length === 0) {
					BURST_AGENTS.forEach((ag, i) => {
						const angle = (Math.PI * 2 * i) / BURST_AGENTS.length + (Math.random() - 0.5) * 0.22;
						const startRad = 18 + (i % 3) * (baseRadius * 0.26);
						const speed = 7.5 + (i % 4) * 3.1 + Math.random() * 2.5;
						burstCursors.push({
							x: cx + Math.cos(angle) * startRad,
							y: cy + Math.sin(angle) * startRad,
							vx: Math.cos(angle) * speed,
							vy: Math.sin(angle) * speed,
							trail: [],
							name: ag.name,
							color: ag.color,
							scale: 0.92 + (i % 3) * 0.12,
							delayMs: (i % 4) * 35
						});
					});

					// Small crimson flash sparks accompanying the cursor burst
					const sparkChars = ['⣿', '⠿', '⠏', '⠁'];
					for (let i = 0; i < 65; i++) {
						const a = Math.random() * Math.PI * 2;
						const spd = 4 + Math.random() * 11;
						emberShards.push({
							x: cx + Math.cos(a) * (Math.random() * baseRadius * 0.65),
							y: cy + Math.sin(a) * (Math.random() * baseRadius * 0.65),
							vx: Math.cos(a) * spd,
							vy: Math.sin(a) * spd,
							char: sparkChars[i % sparkChars.length],
							color: '#e60012'
						});
					}
				}

				const localShatter = elapsed - T_SHATTER_START;
				const shatterNorm = localShatter / (T_BLACKOUT_START - T_SHATTER_START);

				// Brief crimson shockwave ring at the moment of transformation
				if (shatterNorm < 0.35) {
					const ringP = shatterNorm / 0.35;
					ctx.save();
					ctx.strokeStyle = `rgba(230, 0, 18, ${(1 - ringP) * 0.75})`;
					ctx.lineWidth = 2.5 * (1 - ringP);
					ctx.beginPath();
					ctx.arc(cx, cy, baseRadius * (0.4 + ringP * 1.45), 0, Math.PI * 2);
					ctx.stroke();
					ctx.restore();
				}

				// Quickly dissolving crimson shards
				const sparkAlpha = Math.max(0, 1 - shatterNorm * 2.2);
				if (sparkAlpha > 0.01) {
					ctx.save();
					ctx.globalAlpha = sparkAlpha;
					ctx.font = 'bold 11px "JetBrains Mono", monospace';
					for (const s of emberShards) {
						s.x += s.vx;
						s.y += s.vy;
						s.vx *= 0.94;
						s.vy *= 0.94;
						ctx.fillStyle = s.color;
						ctx.fillText(s.char, s.x, s.y);
					}
					ctx.restore();
				}

				// Animate the 16 bursting Agent Mouse Cursors with glowing neon trails
				const cursorFadeOut = shatterNorm > 0.72 ? Math.max(0, 1 - (shatterNorm - 0.72) / 0.28) : 1;
				for (const bc of burstCursors) {
					if (localShatter < bc.delayMs) continue;

					bc.trail.push({ x: bc.x, y: bc.y });
					if (bc.trail.length > 9) bc.trail.shift();

					bc.x += bc.vx;
					bc.y += bc.vy;
					// Slight spiral curve as cursors disperse like summoned crows/agents
					const perpX = -bc.vy * 0.018;
					const perpY = bc.vx * 0.018;
					bc.vx = bc.vx * 0.985 + perpX;
					bc.vy = bc.vy * 0.985 + perpY;

					// Draw velocity motion trail
					if (bc.trail.length > 2) {
						ctx.save();
						ctx.beginPath();
						ctx.moveTo(bc.trail[0].x, bc.trail[0].y);
						for (let t = 1; t < bc.trail.length; t++) {
							ctx.lineTo(bc.trail[t].x, bc.trail[t].y);
						}
						ctx.strokeStyle = bc.color;
						ctx.globalAlpha = cursorFadeOut * 0.45;
						ctx.lineWidth = 2;
						ctx.stroke();
						ctx.restore();
					}

					drawCursorArrow(ctx, bc.x, bc.y, bc.color, bc.name, bc.scale, cursorFadeOut);
				}
			}
			// Else (T_BLACKOUT_START -> T_TOTAL): pure pitch-black pause before the Swarm returns to build VS Code!

			if (elapsed < T_TOTAL) {
				animId = requestAnimationFrame(render);
			} else {
				onComplete();
			}
		};

		animId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
			window.removeEventListener('keydown', handleKey);
		};
	});
</script>

<div class="sharingan-intro" role="presentation">
	<canvas bind:this={canvasEl} class="intro-canvas"></canvas>
</div>

<style>
	.sharingan-intro {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: #000000;
		overflow: hidden;
		user-select: none;
	}

	.intro-canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
