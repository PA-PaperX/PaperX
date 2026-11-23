<script lang="ts">
	import { onMount } from 'svelte';
	import VsIcons from '$lib/components/VsIcons.svelte';
	import { isPartBuilt } from '$lib/swarm/state.svelte';

	let {
		heroTheme = 'dark',
		introTrigger = 0,
		playIntro = false,
		isResetting = false,
		onZoomOutProgress,
		onIntroComplete,
		onToggleTheme,
		onReplayIntro
	}: {
		heroTheme: 'light' | 'dark';
		introTrigger?: number;
		playIntro?: boolean;
		isResetting?: boolean;
		onZoomOutProgress?: (p: number) => void;
		onIntroComplete?: () => void;
		onToggleTheme: () => void;
		onReplayIntro: () => void;
	} = $props();

	let starHovered = $state(false);
	let fxCanvas: HTMLCanvasElement | undefined = $state();

	// 0 = pure black, 1 = 3D close-up Swarm building P-A-P-E-R-X boxes,
	// 2 = Canvas cursor drags Sky frame + Itachi snaps 4-point star flare,
	// 3 = Camera pulls back / zooms out into VS Code slot, 4 = settled live
	let animPhase = $state<0 | 1 | 2 | 3 | 4>(0);
	let skyRevealed = $state(false);
	let timelineMs = $state(0);
	let starFlare = $state(0);

	// 3D Perspective Camera Rig state
	let camRotX = $state(0);
	let camRotY = $state(0);
	let camRotZ = $state(0);
	let camScale = $state(1);
	let camPanX = $state(0);
	let camPanY = $state(0);
	let bgParallaxScale = $state(1);
	let bgParallaxX = $state(0);
	let bgParallaxY = $state(0);

	// Each letter of PAPERX is built in 3D cinematic space by its own Agent Cursor dragging a bounding box!
	const LETTERS = [
		{ ch: 'P', isX: false, agent: 'Typo', color: '#fb923c', startMs: 80, durMs: 420, dims: '112 × 138' },
		{ ch: 'a', isX: false, agent: 'PaperX', color: '#38bdf8', startMs: 320, durMs: 400, dims: '104 × 132' },
		{ ch: 'p', isX: false, agent: 'Motion', color: '#a855f7', startMs: 560, durMs: 400, dims: '108 × 136' },
		{ ch: 'e', isX: false, agent: 'Svelte', color: '#ff3e00', startMs: 800, durMs: 400, dims: '102 × 132' },
		{ ch: 'r', isX: false, agent: 'Film', color: '#facc15', startMs: 1040, durMs: 400, dims: '110 × 136' },
		{ ch: 'X', isX: true, agent: 'Itachi', color: '#e60012', startMs: 1280, durMs: 480, dims: '124 × 146' }
	];

	// Fullscreen Sky Canvas frame dragged by Canvas agent (1550ms -> 2120ms)
	const SKY_START = 1520;
	const SKY_END = 2120;
	// 4-point star placed by Crow/Itachi agent (1840ms -> 2360ms)
	const STAR_START = 1840;
	const STAR_END = 2320;

	const T_SHOT1_END = 1760;
	const T_FLARE_PEAK = 2240;
	const T_ZOOMOUT_START = 2620;
	const T_DONE = 3620;

	function easeOutCubic(t: number) {
		const c = Math.max(0, Math.min(1, t));
		return 1 - Math.pow(1 - c, 3);
	}

	function easeInOutCubic(t: number) {
		const c = Math.max(0, Math.min(1, t));
		return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
	}

	function easeInOutQuart(t: number) {
		const c = Math.max(0, Math.min(1, t));
		return c < 0.5 ? 8 * c * c * c * c : 1 - Math.pow(-2 * c + 2, 4) / 2;
	}

	function lerp(a: number, b: number, t: number) {
		return a + (b - a) * t;
	}

	let introRaf = 0;

	$effect(() => {
		const _trig = introTrigger;
		if (isResetting) {
			cancelAnimationFrame(introRaf);
			animPhase = 0;
			skyRevealed = false;
			timelineMs = 0;
			starFlare = 0;
			camRotX = 0;
			camRotY = 0;
			camRotZ = 0;
			camScale = 1;
			camPanX = 0;
			camPanY = 0;
			bgParallaxScale = 1;
			bgParallaxX = 0;
			bgParallaxY = 0;
			onZoomOutProgress?.(0);
			return;
		}
		if (!playIntro) return;

		cancelAnimationFrame(introRaf);
		animPhase = 1;
		skyRevealed = false;
		timelineMs = 0;
		starFlare = 0;
		onZoomOutProgress?.(0);

		const start = performance.now();
		let firedSky = false;

		const tick = (now: number) => {
			const elapsed = now - start;
			timelineMs = elapsed;

			if (elapsed < T_SHOT1_END) {
				// SHOT 1: Dramatic 3D close-up tracking shot panning left -> right as Agent Cursors
				// drag blueprint bounding boxes and construct P-A-P-E-R-X letter by letter!
				const p = easeInOutCubic(elapsed / T_SHOT1_END);
				camScale = lerp(1.66, 1.24, p);
				camRotX = lerp(24, 10, p);
				camRotY = lerp(-28, 15, p);
				camRotZ = lerp(-6, 2.2, p);
				camPanX = lerp(16, -8, p);
				camPanY = lerp(5, -2, p);

				bgParallaxScale = 1.22;
				bgParallaxX = lerp(4, -2, p);
				bgParallaxY = lerp(2, -1, p);
				onZoomOutProgress?.(0);
			} else if (elapsed < T_ZOOMOUT_START) {
				// SHOT 2: Canvas cursor finishes dragging the full Sky backdrop -> bursts open fullscreen!
				// Itachi cursor places the 4-point star above X -> kinetic flare & camera level-out!
				if (elapsed >= SKY_END - 140 && !firedSky) {
					firedSky = true;
					animPhase = 2;
					skyRevealed = true;
				}
				const p = easeOutCubic((elapsed - T_SHOT1_END) / (T_ZOOMOUT_START - T_SHOT1_END));
				const recoil = Math.sin(p * Math.PI) * 0.04;
				camScale = lerp(1.24, 1.08, p) + recoil;
				camRotX = lerp(10, 3, p);
				camRotY = lerp(15, -3, p);
				camRotZ = lerp(2.2, -0.6, p);
				camPanX = lerp(-8, 0, p);
				camPanY = lerp(-2, 0, p);

				bgParallaxScale = lerp(1.2, 1.07, p);
				bgParallaxX = lerp(-2, 0, p);
				bgParallaxY = lerp(-1, 0, p);
				onZoomOutProgress?.(0);
			} else {
				// SHOT 3: Cinematic Camera Pull-Back / Zoom-Out from 100vw×100vh fullscreen into VS Code Editor slot!
				animPhase = 3;
				if (!firedSky) {
					firedSky = true;
					skyRevealed = true;
				}
				const p = easeInOutQuart((elapsed - T_ZOOMOUT_START) / (T_DONE - T_ZOOMOUT_START));

				camScale = lerp(1.08, 1.0, p);
				camRotX = lerp(3, 0, p);
				camRotY = lerp(-3, 0, p);
				camRotZ = lerp(-0.6, 0, p);
				camPanX = 0;
				camPanY = 0;

				bgParallaxScale = lerp(1.07, 1.0, p);
				bgParallaxX = 0;
				bgParallaxY = 0;

				onZoomOutProgress?.(p);
			}

			// 4-Point Star Flare Envelope right as Itachi snaps the star into place
			if (elapsed < STAR_START) {
				starFlare = 0;
			} else if (elapsed < T_FLARE_PEAK) {
				const p = (elapsed - STAR_START) / (T_FLARE_PEAK - STAR_START);
				starFlare = Math.sin(p * Math.PI * 0.5);
			} else {
				const p = Math.min(1, (elapsed - T_FLARE_PEAK) / (T_ZOOMOUT_START + 250 - T_FLARE_PEAK));
				starFlare = Math.max(0, 1 - Math.pow(p, 0.72));
			}

			if (elapsed < T_DONE) {
				introRaf = requestAnimationFrame(tick);
			} else {
				animPhase = 4;
				timelineMs = T_DONE + 1000;
				starFlare = 0;
				skyRevealed = true;
				camScale = 1;
				camRotX = 0;
				camRotY = 0;
				camRotZ = 0;
				camPanX = 0;
				camPanY = 0;
				bgParallaxScale = 1;
				bgParallaxX = 0;
				bgParallaxY = 0;
				onZoomOutProgress?.(1);
				onIntroComplete?.();
			}
		};

		introRaf = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(introRaf);
	});

	// Subtle live interactive 3D mouse camera drift once settled
	function handleMouseMove(e: MouseEvent) {
		if (animPhase !== 4) return;
		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
		const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
		camRotY = nx * 8;
		camRotX = -ny * 6;
		bgParallaxX = -nx * 1.8;
		bgParallaxY = -ny * 1.4;
		bgParallaxScale = 1.03;
	}

	function handleMouseLeave() {
		if (animPhase !== 4) return;
		camRotX = 0;
		camRotY = 0;
		bgParallaxX = 0;
		bgParallaxY = 0;
		bgParallaxScale = 1;
	}

	onMount(() => {
		if (!fxCanvas) return;
		const ctx = fxCanvas.getContext('2d');
		if (!ctx) return;

		let animId = 0;
		const motes = Array.from({ length: 42 }, () => ({
			x: Math.random(),
			y: Math.random(),
			r: 0.8 + Math.random() * 1.9,
			vx: (Math.random() - 0.5) * 0.00022,
			vy: -0.00016 - Math.random() * 0.00028,
			phase: Math.random() * Math.PI * 2
		}));

		const resize = () => {
			if (!fxCanvas) return;
			const rect = fxCanvas.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			fxCanvas.width = rect.width * dpr;
			fxCanvas.height = rect.height * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();

		const ro = new ResizeObserver(resize);
		ro.observe(fxCanvas);

		const tickFx = (now: number) => {
			if (!fxCanvas) return;
			const w = fxCanvas.clientWidth;
			const h = fxCanvas.clientHeight;
			ctx.clearRect(0, 0, w, h);

			const isDark = heroTheme === 'dark';

			// Pure drifting atmospheric dust/embers (NO orbital ring!)
			for (const m of motes) {
				m.x += m.vx + Math.sin(now * 0.001 + m.phase) * 0.00012;
				m.y += m.vy;
				if (m.y < -0.02) {
					m.y = 1.02;
					m.x = Math.random();
				}
				if (m.x > 1.02) m.x = -0.02;
				if (m.x < -0.02) m.x = 1.02;

				const alpha = (skyRevealed ? 0.28 : 0.42) + 0.32 * Math.sin(now * 0.0025 + m.phase);
				ctx.beginPath();
				ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2);
				ctx.fillStyle =
					isDark || !skyRevealed
						? `rgba(255, 65, 90, ${alpha})`
						: `rgba(255, 255, 255, ${alpha * 1.1})`;
				ctx.fill();
			}

			animId = requestAnimationFrame(tickFx);
		};
		animId = requestAnimationFrame(tickFx);

		return () => {
			cancelAnimationFrame(animId);
			ro.disconnect();
		};
	});

	// Derived progress for Canvas agent dragging the fullscreen Sky backdrop frame
	let skyDragP = $derived(
		animPhase >= 1 && animPhase <= 2
			? easeOutCubic(Math.max(0, Math.min(1, (timelineMs - SKY_START) / (SKY_END - SKY_START))))
			: 0
	);
	let showSkyDrag = $derived(
		animPhase >= 1 && animPhase <= 2 && timelineMs >= SKY_START && timelineMs <= SKY_END + 180
	);

	// Derived progress for Itachi agent snapping the 4-point star onto X
	let starDragP = $derived(
		animPhase >= 1 && animPhase <= 2
			? easeOutCubic(Math.max(0, Math.min(1, (timelineMs - STAR_START) / (STAR_END - STAR_START))))
			: 1
	);
	let showStarCursor = $derived(
		animPhase >= 1 && animPhase <= 2 && timelineMs >= STAR_START && timelineMs <= STAR_END + 200
	);
</script>

<section
	class="hero-stage"
	class:theme-light={heroTheme === 'light'}
	class:theme-dark={heroTheme === 'dark'}
	class:sky-revealed={skyRevealed}
	class:interactive-settled={animPhase === 4}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
	aria-label="PaperX Hero Stage"
>
	<!-- Depth-Parallax Backdrop Layer -->
	<div
		class="hero-backdrops"
		class:visible={skyRevealed}
		style="transform: translate3d({bgParallaxX}%, {bgParallaxY}%, 0) scale({bgParallaxScale});"
		aria-hidden="true"
	>
		<img
			src="/images/sky-light.jpg"
			alt=""
			class="backdrop-img light-img"
			class:active={heroTheme === 'light'}
		/>
		<img
			src="/images/sky-dark.jpg"
			alt=""
			class="backdrop-img dark-img"
			class:active={heroTheme === 'dark'}
		/>
		<div class="hero-grain"></div>
		<div class="hero-bottom-fade"></div>
	</div>

	<!-- Minimal Floating Theme Toggle Button in Top-Right (Built by Swarm after Zoom-Out!) -->
	<div
		class="hero-top-controls"
		data-swarm-part="hero-theme-btn"
		data-swarm-built={isPartBuilt('hero-theme-btn') ? 'true' : undefined}
	>
		<button
			type="button"
			class="nsys-theme-btn"
			onclick={onToggleTheme}
			aria-label="สลับธีมสว่าง/มืด"
			title={heroTheme === 'dark' ? 'Switch to Anime Daylight Sky' : 'Switch to Uchiha Blood Moon'}
		>
			{#if heroTheme === 'dark'}
				<VsIcons name="sun" size={18} color="#f8fafc" />
			{:else}
				<VsIcons name="moon" size={18} color="#0f172a" />
			{/if}
		</button>
	</div>

	<!-- 3D Perspective Camera Rig filming the Swarm Cursors constructing PAPERX in 3D space! -->
	<div class="camera-viewport">
		<div
			class="camera-rig"
			class:smooth-live={animPhase === 4}
			style="
				transform:
					translate3d({camPanX}%, {camPanY}%, 0)
					scale({camScale})
					rotateX({camRotX}deg)
					rotateY({camRotY}deg)
					rotateZ({camRotZ}deg);
			"
		>
			<!-- Subtle atmospheric ember/dust canvas (No orbital ring!) -->
			<canvas bind:this={fxCanvas} class="fx-canvas" aria-hidden="true"></canvas>

			<!-- Fullscreen Sky Backdrop Construction Box dragged by Canvas Agent inside Shot 2 -->
			{#if showSkyDrag}
				{@const skyW = 86 * skyDragP}
				{@const skyH = 78 * skyDragP}
				{@const skyFade = timelineMs > SKY_END ? Math.max(0, 1 - (timelineMs - SKY_END) / 180) : 1}
				<div
					class="cine-sky-frame"
					style="
						left: 7%;
						top: 11%;
						width: {skyW}%;
						height: {skyH}%;
						opacity: {skyFade};
					"
					aria-hidden="true"
				>
					<span class="c-handle tl"></span>
					<span class="c-handle tr"></span>
					<span class="c-handle bl"></span>
					<span class="c-handle br"></span>
					<span class="c-dim-pill">SKY CANVAS · {Math.round(skyDragP * 100)}%</span>

					<div class="cine-cursor" style="left: 100%; top: 100%;">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="c-arrow">
							<path
								d="M4 3L11.5 21L14.5 13.5L22 10.5L4 3Z"
								fill="#2dd4bf"
								stroke="#ffffff"
								stroke-width="1.6"
								stroke-linejoin="round"
							/>
						</svg>
						<span class="c-badge" style="background: #2dd4bf">Canvas <em>Render Sky</em></span>
					</div>
				</div>
			{/if}

			<!-- Centerpiece: 3D Swarm-Constructed PAPERX Wordmark -->
			<div class="hero-center" class:visible={animPhase > 0}>
				<!-- Faint horizontal baseline guide visible during Shot 1 letter construction -->
				{#if animPhase === 1}
					<div class="cine-baseline-guide" aria-hidden="true"></div>
				{/if}

				<h1 class="paperx-title" aria-label="PaperX">
					{#each LETTERS as item}
						{@const rawP =
							animPhase >= 3 ? 1 : (timelineMs - item.startMs) / item.durMs}
						{@const started = rawP > 0}
						{@const boxP = easeOutCubic(Math.max(0, Math.min(1, rawP / 0.78)))}
						{@const solidP = easeOutCubic(Math.max(0, Math.min(1, (rawP - 0.56) / 0.44)))}
						{@const wireframeP =
							started && solidP < 0.96 ? Math.min(1, boxP * 1.3) * (1 - solidP * 0.75) : 0}
						{@const showLetterBox =
							animPhase <= 2 && started && rawP < 1.18}
						{@const boxFade = rawP > 0.92 ? Math.max(0, 1 - (rawP - 0.92) / 0.26) : 1}

						<span class="letter-slot" class:is-x={item.isX}>
							<!-- 3D Blueprint Construction Box & Agent Cursor building THIS exact letter! -->
							{#if showLetterBox}
								<span
									class="letter-build-box"
									style="
										width: {Math.max(12, boxP * 106)}%;
										height: {Math.max(12, boxP * 106)}%;
										border-color: {item.color};
										background: {item.color}16;
										opacity: {boxFade};
									"
									aria-hidden="true"
								>
									<span class="c-handle tl" style="border-color: {item.color}"></span>
									<span class="c-handle tr" style="border-color: {item.color}"></span>
									<span class="c-handle bl" style="border-color: {item.color}"></span>
									<span class="c-handle br" style="border-color: {item.color}"></span>

									<span class="letter-dim" style="background: {item.color}">
										{item.dims}
									</span>

									<!-- Agent Cursor physically dragging the bottom-right corner of this letter box in 3D space! -->
									<span class="cine-cursor" style="left: 100%; top: 100%;">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="c-arrow">
											<path
												d="M4 3L11.5 21L14.5 13.5L22 10.5L4 3Z"
												fill={item.color}
												stroke="#ffffff"
												stroke-width="1.7"
												stroke-linejoin="round"
											/>
										</svg>
										<span class="c-badge" style="background: {item.color}">
											{item.agent}
											<em>{rawP < 0.72 ? `Draw "${item.ch}"` : 'Fill'}</em>
										</span>
									</span>
								</span>
							{/if}

							<!-- Glowing Wireframe Outline while Cursor is dragging the box (unmounted once solid to prevent 3D GPU tile ghosting!) -->
							{#if wireframeP > 0.01}
								<span
									class="letter-wireframe"
									style="
										opacity: {wireframeP};
										clip-path: inset(0 {100 - boxP * 100}% {100 - boxP * 100}% 0);
									"
									aria-hidden="true"
								>
									{item.ch}
								</span>
							{/if}

							<!-- Solid Crisp Filled Letter snapping in once its box finishes! -->
							<span
								class="letter-solid"
								style="
									opacity: {solidP};
									transform: scale({0.93 + solidP * 0.07});
								"
							>
								{item.ch}
							</span>

							{#if item.isX}
								<!-- Interactive 4-Pointed Sparkle Star placed by Itachi Cursor above X -->
								<button
									type="button"
									class="nsys-star-btn"
									class:visible={timelineMs >= STAR_START + 180 || animPhase >= 3}
									style="--flare: {starFlare}"
									onmouseenter={() => (starHovered = true)}
									onmouseleave={() => (starHovered = false)}
									onfocus={() => (starHovered = true)}
									onblur={() => (starHovered = false)}
									onclick={onReplayIntro}
									aria-label="Replay intro animation"
								>
									{#if showStarCursor}
										{@const sFade =
											timelineMs > STAR_END ? Math.max(0, 1 - (timelineMs - STAR_END) / 200) : 1}
										<span
											class="star-build-box"
											style="
												width: {starDragP * 100}%;
												height: {starDragP * 100}%;
												opacity: {sFade};
											"
											aria-hidden="true"
										>
											<span class="cine-cursor" style="left: 100%; top: 100%;">
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" class="c-arrow">
													<path
														d="M4 3L11.5 21L14.5 13.5L22 10.5L4 3Z"
														fill="#ff2a6d"
														stroke="#ffffff"
														stroke-width="1.7"
														stroke-linejoin="round"
													/>
												</svg>
												<span class="c-badge" style="background: #ff2a6d">
													Itachi <em>Snap Flare</em>
												</span>
											</span>
										</span>
									{/if}

									<span class="star-flare-beam" aria-hidden="true"></span>
									<span class="star-halo" aria-hidden="true"></span>

									<svg class="star-svg" viewBox="0 0 64 64" fill="none">
										<path
											d="M32 2C33.8 18.8 45.2 30.2 62 32C45.2 33.8 33.8 45.2 32 62C30.2 45.2 18.8 33.8 2 32C18.8 30.2 30.2 18.8 32 2Z"
											class="star-shape"
										/>
									</svg>

									<span class="replay-tooltip" class:visible={starHovered}>
										<span class="tooltip-caret"></span>
										Replay intro
									</span>
								</button>
							{/if}
						</span>
					{/each}
				</h1>
			</div>
		</div>
	</div>
</section>

<style>
	@font-face {
		font-family: 'NinjaNaruto';
		src: url('/fonts/njnaruto.ttf') format('truetype');
		font-weight: normal;
		font-style: normal;
		font-display: swap;
	}

	.hero-stage {
		position: relative;
		width: 100%;
		height: calc(100vh - 57px);
		min-height: 540px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		user-select: none;
		background: #000000;
	}

	.hero-backdrops {
		position: absolute;
		inset: -8%;
		z-index: 1;
		opacity: 0;
		will-change: transform, opacity;
		transition: opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.hero-stage.interactive-settled .hero-backdrops {
		transition:
			opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.hero-backdrops.visible {
		opacity: 1;
	}

	.backdrop-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		opacity: 0;
		transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.backdrop-img.active {
		opacity: 1;
	}

	.hero-grain {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
		opacity: 0.11;
		background-image: radial-gradient(rgba(255, 255, 255, 0.42) 1px, transparent 0);
		background-size: 3px 3px;
	}

	.hero-bottom-fade {
		position: absolute;
		inset: auto 0 0 0;
		height: 220px;
		z-index: 4;
		pointer-events: none;
		background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.65) 55%, #000000 100%);
		transition: background 0.5s ease;
	}

	.hero-stage.theme-light .hero-bottom-fade {
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(240, 241, 250, 0.72) 56%,
			#f0f1fa 100%
		);
	}

	/* 3D Perspective Camera Rig */
	.camera-viewport {
		position: relative;
		z-index: 6;
		width: 100%;
		height: 100%;
		perspective: 1100px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.camera-rig {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		will-change: transform;
	}

	.camera-rig.smooth-live {
		transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.fx-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 4;
	}

	/* Fullscreen Sky Blueprint Construction Frame (dragged by Canvas Agent in 3D space) */
	.cine-sky-frame {
		position: absolute;
		border: 1.25px dashed #2dd4bf;
		background: rgba(45, 212, 191, 0.05);
		z-index: 8;
		pointer-events: none;
	}

	.c-dim-pill {
		position: absolute;
		top: -19px;
		left: 0;
		background: #2dd4bf;
		color: #050609;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 9px;
		font-weight: 700;
		padding: 1px 6px;
		border-radius: 2px;
		letter-spacing: 0.06em;
		white-space: nowrap;
	}

	.c-handle {
		position: absolute;
		width: 6px;
		height: 6px;
		background: #06070a;
		border: 1.25px solid #2dd4bf;
	}
	.c-handle.tl {
		top: -3.5px;
		left: -3.5px;
	}
	.c-handle.tr {
		top: -3.5px;
		right: -3.5px;
	}
	.c-handle.bl {
		bottom: -3.5px;
		left: -3.5px;
	}
	.c-handle.br {
		bottom: -3.5px;
		right: -3.5px;
	}

	/* 3D-plane Cinematic Swarm Cursor */
	.cine-cursor {
		position: absolute;
		transform: translate(-2px, -2px);
		pointer-events: none;
		z-index: 30;
		display: inline-flex;
		align-items: flex-start;
	}

	.c-arrow {
		filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.75));
		flex-shrink: 0;
	}

	.c-badge {
		margin-left: 3px;
		margin-top: 10px;
		padding: 2px 6px;
		border-radius: 4px;
		border-top-left-radius: 1px;
		color: #08090d;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 9px;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: 0;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55);
	}

	.c-badge em {
		font-style: normal;
		background: rgba(0, 0, 0, 0.28);
		color: #ffffff;
		padding: 0 4px;
		border-radius: 2px;
		font-size: 8.5px;
		font-weight: 500;
	}

	.hero-top-controls {
		position: absolute;
		top: 22px;
		right: 26px;
		z-index: 15;
	}

	.nsys-theme-btn {
		cursor: pointer;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		display: grid;
		place-items: center;
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: rgba(15, 16, 24, 0.55);
		backdrop-filter: blur(10px);
		transition:
			transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
			background 0.2s ease,
			border-color 0.2s ease;
	}

	.nsys-theme-btn:hover {
		transform: scale(1.06);
		border-color: rgba(255, 255, 255, 0.38);
	}

	.theme-light .nsys-theme-btn {
		background: rgba(255, 255, 255, 0.85);
		border-color: rgba(15, 23, 42, 0.1);
		box-shadow: 0 4px 16px rgba(15, 23, 42, 0.1);
	}

	/* Centerpiece PaperX Wordmark */
	.hero-center {
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.hero-center.visible {
		opacity: 1;
	}

	.cine-baseline-guide {
		position: absolute;
		left: -14%;
		right: -14%;
		bottom: 22px;
		height: 1px;
		border-bottom: 1px dashed rgba(255, 42, 109, 0.45);
		pointer-events: none;
	}

	.paperx-title {
		margin: 0;
		font-family: 'NinjaNaruto', sans-serif;
		font-size: clamp(4.5rem, 11.2vw, 9rem);
		line-height: 1;
		letter-spacing: 0.045em;
		display: inline-flex;
		align-items: baseline;
		position: relative;
	}

	.letter-slot {
		position: relative;
		display: inline-block;
	}

	.letter-slot.is-x {
		margin-left: 0.04em;
	}

	/* Per-letter 3D Blueprint Construction Box */
	.letter-build-box {
		position: absolute;
		top: -3%;
		left: -3%;
		border: 1.25px dashed;
		pointer-events: none;
		z-index: 12;
		box-sizing: border-box;
	}

	.letter-dim {
		position: absolute;
		top: -17px;
		left: 0;
		color: #050609;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 8.5px;
		font-weight: 700;
		letter-spacing: 0;
		line-height: 1.3;
		padding: 1px 4px;
		border-radius: 2px;
		white-space: nowrap;
	}

	.letter-wireframe {
		position: absolute;
		inset: 0;
		color: transparent;
		-webkit-text-stroke: 2px rgba(255, 255, 255, 0.94);
		text-shadow: 0 0 14px rgba(230, 0, 18, 0.85);
		pointer-events: none;
	}

	.letter-slot.is-x .letter-wireframe {
		-webkit-text-stroke: 2.3px #ff2a4b;
	}

	.letter-solid {
		position: relative;
		display: inline-block;
		will-change: transform, opacity;
		transition: color 0.45s ease;
	}

	.theme-dark .letter-solid {
		color: #f8fafc;
		text-shadow: 0 12px 36px rgba(0, 0, 0, 0.78);
	}

	.theme-dark .letter-slot.is-x .letter-solid {
		color: #e60012;
		text-shadow:
			0 0 28px rgba(230, 0, 18, 0.5),
			0 12px 36px rgba(0, 0, 0, 0.88);
	}

	.theme-light .letter-solid {
		color: #ffffff;
		text-shadow:
			0 10px 30px rgba(15, 23, 42, 0.34),
			0 2px 6px rgba(15, 23, 42, 0.22);
	}

	.theme-light .letter-slot.is-x .letter-solid {
		color: #dc2626;
		text-shadow: 0 10px 28px rgba(15, 23, 42, 0.34);
	}

	/* Interactive 4-Pointed Sparkle Star at Top-Right of X */
	.nsys-star-btn {
		position: absolute;
		top: -34px;
		right: -30px;
		width: 58px;
		height: 58px;
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
		display: grid;
		place-items: center;
		z-index: 20;
		opacity: 0;
		transform: scale(0.35);
		transition:
			opacity 0.4s ease,
			transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.nsys-star-btn.visible {
		opacity: 1;
		transform: scale(calc(1 + var(--flare, 0) * 0.7));
	}

	.nsys-star-btn:hover {
		transform: scale(1.18) rotate(12deg);
	}

	.star-build-box {
		position: absolute;
		top: 0;
		left: 0;
		border: 1.25px dashed #ff2a6d;
		background: rgba(255, 42, 109, 0.12);
		pointer-events: none;
		z-index: 25;
	}

	.star-svg {
		width: 44px;
		height: 44px;
		position: relative;
		z-index: 3;
		filter: drop-shadow(0 0 12px rgba(255, 42, 75, 0.7));
	}

	.theme-dark .star-shape {
		fill: #ffffff;
	}

	.theme-light .star-shape {
		fill: #2563eb;
	}

	.theme-light .star-svg {
		filter: drop-shadow(0 0 10px rgba(37, 99, 235, 0.55));
	}

	.star-halo {
		position: absolute;
		inset: 4px;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(255, 255, 255, 0.92) 0%,
			rgba(230, 0, 18, 0.55) 45%,
			transparent 75%
		);
		opacity: calc(0.32 + var(--flare, 0) * 0.68);
		transform: scale(calc(1 + var(--flare, 0) * 1.45));
		pointer-events: none;
	}

	.theme-light .star-halo {
		background: radial-gradient(
			circle,
			rgba(255, 255, 255, 0.95) 0%,
			rgba(59, 130, 246, 0.45) 45%,
			transparent 75%
		);
	}

	.star-flare-beam {
		position: absolute;
		width: 240px;
		height: 3px;
		border-radius: 999px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 70, 95, 0.78) 35%,
			#ffffff 50%,
			rgba(255, 70, 95, 0.78) 65%,
			transparent 100%
		);
		opacity: calc(0.38 + var(--flare, 0) * 0.62);
		transform: scaleX(calc(0.55 + var(--flare, 0) * 1.35));
		pointer-events: none;
	}

	.theme-light .star-flare-beam {
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(96, 165, 250, 0.65) 35%,
			#ffffff 50%,
			rgba(96, 165, 250, 0.65) 65%,
			transparent 100%
		);
	}

	.replay-tooltip {
		position: absolute;
		bottom: -34px;
		left: 50%;
		transform: translateX(-50%) translateY(-5px) scale(0.95);
		background: #ffffff;
		color: #0f172a;
		font-family: 'Space Grotesk', 'LINE Seed Sans TH', sans-serif;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0;
		padding: 5px 12px;
		border-radius: 999px;
		white-space: nowrap;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
		opacity: 0;
		transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
		pointer-events: none;
	}

	.replay-tooltip.visible {
		opacity: 1;
		transform: translateX(-50%) translateY(0) scale(1);
	}

	.tooltip-caret {
		position: absolute;
		top: -4px;
		left: 50%;
		transform: translateX(-50%) rotate(45deg);
		width: 8px;
		height: 8px;
		background: #ffffff;
	}
</style>
