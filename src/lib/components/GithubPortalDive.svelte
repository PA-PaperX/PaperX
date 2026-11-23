<script lang="ts">
	import { onMount } from 'svelte';
	import AiPixelMascots from '$lib/components/AiPixelMascots.svelte';

	interface Props {
		theme?: 'dark' | 'light';
		/** 100% Scroll-scrubbed cosmic portal progress (0.00 -> 1.00) */
		progress: number;
	}

	let { theme = 'dark', progress = 0 }: Props = $props();
	let isLight = $derived(theme === 'light');

	// Official GitHub Invertocat path (99.25% pixel-exact lockstep with static/images/github-white-icon.webp!)
	const OCTOCAT_PATH =
		'M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z';

	function clamp01(v: number) {
		return Math.max(0, Math.min(1, v));
	}

	function range01(v: number, s: number, e: number) {
		return clamp01((v - s) / Math.max(0.0001, e - s));
	}

	function easeOutCubic(t: number) {
		const c = clamp01(t);
		return 1 - Math.pow(1 - c, 3);
	}

	function easeInOutCubic(t: number) {
		const c = clamp01(t);
		return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
	}

	function easeOutBack(t: number) {
		const c = clamp01(t);
		const c1 = 1.45;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
	}

	let vw = $state(1440);
	let vh = $state(900);
	let canvasEl: HTMLCanvasElement | undefined = $state();

	// Responsive base size of the centered GitHub Octocat Solar Core
	let baseSize = $derived(Math.round(Math.max(168, Math.min(236, Math.min(vw, vh) * 0.24))));

	// =========================================================================
	// VYOM.LOL DEEP-UNIVERSE SOLAR SYSTEM -> OCTOCAT PORTAL DIVE
	//   Beat 1 (0.00 -> 0.34): Milky Way Nebula + 2,000 Stars + Ecliptic Planets & 3 AI Converge into the Solar Core
	//   Beat 2 (0.28 -> 0.52): Octocat Sun Core Ignites inside the Solar System (Boiling Corona + Ecliptic Orbits + Planets!)
	//   Beat 3 (0.50 -> 0.95): 3D Camera Flies THROUGH the Ecliptic Orbits & Hollow Octocat Silhouette (1x -> 37x) into Blur->Sharp GitHub!
	// =========================================================================
	let portalEnterOpacity = $derived(easeOutCubic(range01(progress, 0.0, 0.08)));
	let portalExitOpacity = $derived(1 - easeOutCubic(range01(progress, 0.92, 0.995)));
	let layerOpacity = $derived(portalEnterOpacity * portalExitOpacity);

	// Deep-space canvas opacity builds smoothly right as Terminal text dissolves into stardust
	let universeBgAlpha = $derived(easeOutCubic(range01(progress, 0.06, 0.22)));

	// Beat 1: 3 AI Satellites (Gemini, ChatGPT, Clawd) orbit along the ecliptic plane & unite into the Solar Core
	let aiConvergeP = $derived(range01(progress, 0.02, 0.33));
	let aiSatelliteOpacity = $derived(
		easeOutCubic(range01(progress, 0.02, 0.1)) * (1 - easeOutCubic(range01(progress, 0.27, 0.34)))
	);

	// Beat 2: Octocat Sun Core illuminates dead center
	let iconPopP = $derived(range01(progress, 0.27, 0.42));
	let iconOpacity = $derived(
		easeOutCubic(range01(progress, 0.27, 0.34)) * (1 - easeOutCubic(range01(progress, 0.78, 0.92)))
	);

	// Hollow Octocat cat-head window opens to reveal the dreamy blurred GitHub Overview inside!
	let apertureOpen = $derived(easeInOutCubic(range01(progress, 0.34, 0.52)));

	// Beat 3: Exponential 3D Fly-Through Dive Scale (1x -> 37x centered on cat face 50% / 51.75%)
	let diveP = $derived(range01(progress, 0.5, 0.95));
	let diveScale = $derived(1 + 36 * Math.pow(diveP, 2.35));

	let iconIntroScale = $derived(0.08 + 0.92 * easeOutBack(iconPopP));
	let totalScale = $derived(progress < 0.27 ? 0.08 : iconIntroScale * diveScale);

	// Subtle solar corona rim shimmer
	let diveShimmer = $derived(Math.sin(clamp01(range01(progress, 0.5, 0.84)) * Math.PI));
	let prismShiftPx = $derived(diveShimmer * 5.5);
	let prismOpacity = $derived(diveShimmer * 0.32 * iconOpacity);

	function seeded(i: number) {
		const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
		return x - Math.floor(x);
	}

	// =========================================================================
	// AUTHENTIC VYOM.LOL COHESIVE 3D ECLIPTIC SOLAR SYSTEM ORBITS & 3D PLANETS
	// All primary planetary tracks share the shallow ~-3° to +4° ecliptic viewing plane
	// with realistic foreshortening (0.14..0.28), plus 3 angled comet/outer tracks!
	// =========================================================================
	interface PlanetOrbitSpec {
		rxFrac: number;
		inclination: number;
		tiltDeg: number;
		phase: number;
		speed: number;
		planetRadius: number;
		colorBright: string;
		colorMid: string;
		colorAtmo: string;
		hasRings?: boolean;
		hasMoon?: boolean;
		hasReticle: boolean;
		isCometTrack?: boolean;
	}

	const SOLAR_ORBITS: PlanetOrbitSpec[] = [
		// 1. Mercury-like inner scorched rocky world
		{
			rxFrac: 0.135,
			inclination: 0.2,
			tiltDeg: -2.2,
			phase: 0.7,
			speed: 1.75,
			planetRadius: 2.2,
			colorBright: '#ffe8c2',
			colorMid: '#b58d63',
			colorAtmo: 'rgba(255, 214, 153, 0.35)',
			hasReticle: true
		},
		// 2. Venus-like golden shrouded world
		{
			rxFrac: 0.19,
			inclination: 0.19,
			tiltDeg: -1.5,
			phase: 2.35,
			speed: 1.45,
			planetRadius: 3.4,
			colorBright: '#fff1c8',
			colorMid: '#d9994a',
			colorAtmo: 'rgba(255, 205, 120, 0.45)',
			hasReticle: true
		},
		// 3. Earth-like pale blue world + tiny orbiting Moon!
		{
			rxFrac: 0.255,
			inclination: 0.185,
			tiltDeg: -0.8,
			phase: 4.15,
			speed: 1.22,
			planetRadius: 3.9,
			colorBright: '#e0f2fe',
			colorMid: '#2563eb',
			colorAtmo: 'rgba(96, 165, 250, 0.5)',
			hasMoon: true,
			hasReticle: true
		},
		// 4. Mars-like rusty crimson world
		{
			rxFrac: 0.32,
			inclination: 0.19,
			tiltDeg: -1.8,
			phase: 5.5,
			speed: 1.05,
			planetRadius: 2.9,
			colorBright: '#fed7aa',
			colorMid: '#c2410c',
			colorAtmo: 'rgba(249, 115, 22, 0.38)',
			hasReticle: true
		},
		// [Asteroid Belt sits at rxFrac 0.36..0.41!]
		// 5. Jupiter-like banded gas giant
		{
			rxFrac: 0.46,
			inclination: 0.175,
			tiltDeg: -1.1,
			phase: 2.85,
			speed: 0.84,
			planetRadius: 7.4,
			colorBright: '#ffedd5',
			colorMid: '#b47b4e',
			colorAtmo: 'rgba(245, 189, 130, 0.36)',
			hasMoon: true,
			hasReticle: true
		},
		// 6. Saturn-like golden ringed gas giant (with 3D multi-band rings!)
		{
			rxFrac: 0.57,
			inclination: 0.18,
			tiltDeg: -2.0,
			phase: 0.35,
			speed: 0.68,
			planetRadius: 6.2,
			colorBright: '#fef3c7',
			colorMid: '#c49a58',
			colorAtmo: 'rgba(253, 224, 150, 0.38)',
			hasRings: true,
			hasReticle: true
		},
		// 7. Uranus-like cyan ice giant
		{
			rxFrac: 0.69,
			inclination: 0.17,
			tiltDeg: -0.6,
			phase: 3.7,
			speed: 0.56,
			planetRadius: 4.8,
			colorBright: '#e0f2fe',
			colorMid: '#0284c7',
			colorAtmo: 'rgba(56, 189, 248, 0.42)',
			hasReticle: true
		},
		// 8. Neptune-like deep cobalt outer world
		{
			rxFrac: 0.82,
			inclination: 0.165,
			tiltDeg: -1.4,
			phase: 5.9,
			speed: 0.46,
			planetRadius: 4.5,
			colorBright: '#dbeafe',
			colorMid: '#1d4ed8',
			colorAtmo: 'rgba(96, 165, 250, 0.42)',
			hasReticle: true
		},
		// 9. Kuiper outer dwarf track
		{
			rxFrac: 0.96,
			inclination: 0.21,
			tiltDeg: 3.5,
			phase: 1.4,
			speed: 0.38,
			planetRadius: 2.4,
			colorBright: '#f1f5f9',
			colorMid: '#64748b',
			colorAtmo: 'rgba(148, 163, 184, 0.3)',
			hasReticle: true
		},
		// 10-12. Authentic vyom.lol long-period inclined comet / probe trajectories!
		{
			rxFrac: 0.78,
			inclination: 0.34,
			tiltDeg: -16.5,
			phase: 4.75,
			speed: 0.62,
			planetRadius: 2.3,
			colorBright: '#ffffff',
			colorMid: '#93c5fd',
			colorAtmo: 'rgba(147, 197, 253, 0.5)',
			hasReticle: true,
			isCometTrack: true
		},
		{
			rxFrac: 0.92,
			inclination: 0.29,
			tiltDeg: 13.8,
			phase: 2.05,
			speed: 0.52,
			planetRadius: 2.2,
			colorBright: '#ffffff',
			colorMid: '#c4b5fd',
			colorAtmo: 'rgba(196, 181, 253, 0.45)',
			hasReticle: false,
			isCometTrack: true
		},
		{
			rxFrac: 1.12,
			inclination: 0.14,
			tiltDeg: -7.5,
			phase: 0.9,
			speed: 0.42,
			planetRadius: 2.0,
			colorBright: '#e2e8f0',
			colorMid: '#64748b',
			colorAtmo: 'rgba(148, 163, 184, 0.3)',
			hasReticle: false,
			isCometTrack: true
		}
	];

	// 380 Asteroid Belt & Kuiper Dust Ring micro-bodies orbiting between Mars & Jupiter!
	const ASTEROID_BELT = Array.from({ length: 380 }, (_, i) => ({
		rxFrac: 0.355 + seeded(i * 3 + 1) * 0.065 + (i > 290 ? 0.46 + seeded(i + 50) * 0.08 : 0),
		inclination: 0.172 + (seeded(i * 3 + 2) - 0.5) * 0.028,
		tiltRad: ((-1.4 + (seeded(i * 3 + 3) - 0.5) * 2.2) * Math.PI) / 180,
		angle: seeded(i * 5 + 7) * Math.PI * 2,
		speed: 0.72 + seeded(i * 5 + 9) * 0.45,
		size: 0.55 + seeded(i * 7 + 11) * 1.15,
		alpha: 0.25 + seeded(i * 7 + 13) * 0.55
	}));

	// 700 Dynamic Foreground & Midground Spectral Stars (O/B blue, A white, F/G cream, K gold, M rose)
	const SPECTRAL_COLORS_DARK = [
		'#ffffff',
		'#d6e4ff',
		'#b8d0ff',
		'#fff4d6',
		'#ffd296',
		'#ffb3a0',
		'#e0d4ff'
	];
	const SPECTRAL_COLORS_LIGHT = [
		'#1a2ffb',
		'#0284c7',
		'#4f46e5',
		'#0f172a',
		'#2563eb',
		'#7c3aed',
		'#0369a1'
	];

	const FOREGROUND_STARS = Array.from({ length: 700 }, (_, i) => {
		// Include the iconic vyom.lol Pleiades-like blue star cluster on the right side (indices 0..11)!
		const isPleiades = i < 12;
		const ang = isPleiades
			? 0.04 + (seeded(i * 11 + 1) - 0.5) * 0.22
			: seeded(i * 4 + 1) * Math.PI * 2;
		const rad = isPleiades
			? 0.64 + (seeded(i * 11 + 2) - 0.5) * 0.18
			: 0.03 + Math.pow(seeded(i * 4 + 2), 0.68) * 1.08;
		const isDiffraction = i < 34;
		return {
			angle: ang,
			radFrac: rad,
			size: isPleiades
				? 2.2 + seeded(i + 50) * 1.9
				: isDiffraction
					? 1.85 + seeded(i + 80) * 1.85
					: 0.45 + Math.pow(seeded(i + 10), 1.6) * 1.65,
			isDiffraction,
			isPleiades,
			colorIdx: isPleiades ? 2 : i % SPECTRAL_COLORS_DARK.length,
			twinkleSpeed: 0.9 + seeded(i + 200) * 2.8,
			twinklePhase: seeded(i + 300) * Math.PI * 2,
			depthLayer: 0.45 + seeded(i + 400) * 1.15
		};
	});

	// 3 Flagship AI Satellites orbiting on the ecliptic plane before uniting at the Solar Core!
	const AI_SATELLITES = [
		{
			kind: 'gemini' as const,
			rxFrac: 0.36,
			tiltDeg: -3.5,
			inclination: 0.24,
			baseAngle: -0.55,
			turns: 1.25,
			trailColorDark: '#93c5fd',
			trailColorLight: '#2563eb'
		},
		{
			kind: 'chatgpt' as const,
			rxFrac: 0.48,
			tiltDeg: 2.8,
			inclination: 0.22,
			baseAngle: 1.65,
			turns: 1.15,
			trailColorDark: '#6ee7b7',
			trailColorLight: '#059669'
		},
		{
			kind: 'claude' as const,
			rxFrac: 0.27,
			tiltDeg: -5.2,
			inclination: 0.26,
			baseAngle: 3.65,
			turns: 1.38,
			trailColorDark: '#fdba74',
			trailColorLight: '#d97757'
		}
	];

	function project3DEllipse(
		angle: number,
		rx: number,
		inclination: number,
		tiltRad: number,
		cx: number,
		cy: number
	) {
		const lx = Math.cos(angle) * rx;
		const ly = Math.sin(angle) * rx * inclination;
		const cosT = Math.cos(tiltRad);
		const sinT = Math.sin(tiltRad);
		return {
			x: cx + lx * cosT - ly * sinT,
			y: cy + lx * sinT + ly * cosT,
			depth: Math.sin(angle)
		};
	}

	function computeAiSatellitePose(
		sat: (typeof AI_SATELLITES)[number],
		convP: number,
		width: number,
		height: number
	) {
		const baseR = Math.max(width, height) * 0.72;
		const shrink = 1 - Math.pow(clamp01(convP), 1.48);
		const rx = baseR * sat.rxFrac * shrink;
		const angle = sat.baseAngle + easeInOutCubic(convP) * Math.PI * 2 * sat.turns;
		const tiltRad = (sat.tiltDeg * Math.PI) / 180;
		const pt = project3DEllipse(angle, rx, sat.inclination, tiltRad, width * 0.5, height * 0.5);
		const depthScale = 0.86 + 0.22 * ((pt.depth + 1) * 0.5);
		const convergeScale = (1.12 - 0.82 * Math.pow(clamp01(convP), 1.65)) * depthScale;
		return {
			x: pt.x,
			y: pt.y,
			scale: convergeScale,
			depth: pt.depth
		};
	}

	let aiPoses = $derived(
		AI_SATELLITES.map((sat) => ({
			...sat,
			...computeAiSatellitePose(sat, aiConvergeP, vw, vh)
		}))
	);

	// =========================================================================
	// PRE-BAKED PROCEDURAL DEEP-SPACE NEBULA & MILKY WAY TEXTURE (Offscreen Canvas)
	// Renders 260 multi-octave textured nebula cloud puffs, dark dust lanes,
	// 1,500 Milky Way micro-stardust grains, and 3 distant spiral galaxies once!
	// =========================================================================
	function buildNebulaTexture(width: number, height: number, light: boolean): HTMLCanvasElement {
		const off = document.createElement('canvas');
		off.width = width;
		off.height = height;
		const c = off.getContext('2d');
		if (!c) return off;

		const cx = width * 0.5;
		const cy = height * 0.5;
		const diag = Math.hypot(width, height);

		// 1. Deep Cosmic Skybox Base
		const skyGrad = c.createRadialGradient(cx, cy, 0, cx, cy, diag * 0.65);
		if (light) {
			skyGrad.addColorStop(0, '#fcfdff');
			skyGrad.addColorStop(0.45, '#eef3fc');
			skyGrad.addColorStop(1, '#dbe4f8');
		} else {
			skyGrad.addColorStop(0, '#141224');
			skyGrad.addColorStop(0.38, '#090b1a');
			skyGrad.addColorStop(0.75, '#050611');
			skyGrad.addColorStop(1, '#020308');
		}
		c.fillStyle = skyGrad;
		c.fillRect(0, 0, width, height);

		// 2. Diagonal Milky Way Galactic Band & Multi-Octave Textured Nebula Clouds (260 cloud puffs!)
		// Matches vyom.lol's diagonal warm amber-ochre Milky Way dust band, top-left & bottom-right
		// rose/magenta emission nebulae, and right-side royal indigo/violet reflection nebula!
		const cloudRegions = light
			? [
					// Light Mode Crystal Aurora Nebulae
					{ x: 0.5, y: 0.5, spreadX: 0.28, spreadY: 0.22, rot: -0.45, count: 70, rgb: '37, 99, 235', a: 0.032 },
					{ x: 0.22, y: 0.18, spreadX: 0.22, spreadY: 0.16, rot: -0.3, count: 45, rgb: '124, 58, 237', a: 0.028 },
					{ x: 0.82, y: 0.54, spreadX: 0.22, spreadY: 0.2, rot: 0.2, count: 55, rgb: '14, 165, 233', a: 0.035 },
					{ x: 0.72, y: 0.82, spreadX: 0.2, spreadY: 0.15, rot: -0.4, count: 40, rgb: '79, 70, 229', a: 0.026 }
				]
			: [
					// Central Warm Amber / Ochre Milky Way Galactic Core Dust (vyom.lol diagonal arch!)
					{ x: 0.49, y: 0.51, spreadX: 0.26, spreadY: 0.34, rot: -0.48, count: 85, rgb: '214, 146, 76', a: 0.044 },
					{ x: 0.47, y: 0.49, spreadX: 0.17, spreadY: 0.22, rot: -0.42, count: 55, rgb: '248, 196, 124', a: 0.048 },
					// Top-Left Rose / Magenta Star-Forming Emission Nebula (exact vyom.lol top-left!)
					{ x: 0.22, y: 0.15, spreadX: 0.2, spreadY: 0.16, rot: -0.35, count: 55, rgb: '188, 68, 114', a: 0.046 },
					{ x: 0.24, y: 0.14, spreadX: 0.11, spreadY: 0.08, rot: -0.25, count: 28, rgb: '240, 168, 195', a: 0.042 },
					// Bottom-Right Crimson / Rose Nebula Wisp (exact vyom.lol bottom-right!)
					{ x: 0.76, y: 0.78, spreadX: 0.18, spreadY: 0.16, rot: -0.55, count: 45, rgb: '185, 58, 92', a: 0.045 },
					// Right-Side Deep Royal Indigo / Violet Nebula around the Pleiades Cluster!
					{ x: 0.87, y: 0.54, spreadX: 0.22, spreadY: 0.24, rot: 0.15, count: 65, rgb: '74, 62, 205', a: 0.055 },
					{ x: 0.91, y: 0.52, spreadX: 0.14, spreadY: 0.16, rot: 0.1, count: 35, rgb: '124, 118, 255', a: 0.045 },
					// Subtle Dark Absorbing Dust Rift Pockets along the Milky Way (gives true fractal texture!)
					{ x: 0.42, y: 0.44, spreadX: 0.18, spreadY: 0.24, rot: -0.5, count: 40, rgb: '4, 5, 14', a: 0.14 }
				];

		let seedCursor = 1000;
		for (const reg of cloudRegions) {
			const cosR = Math.cos(reg.rot);
			const sinR = Math.sin(reg.rot);
			for (let i = 0; i < reg.count; i++) {
				seedCursor += 7;
				// Box-Muller-like clustered distribution for organic cloud clumps
				const u1 = Math.max(0.001, seeded(seedCursor));
				const u2 = seeded(seedCursor + 1);
				const mag = Math.sqrt(-2 * Math.log(u1)) * 0.52;
				const theta = u2 * Math.PI * 2;
				const lx = Math.cos(theta) * mag * reg.spreadX * width;
				const ly = Math.sin(theta) * mag * reg.spreadY * height;

				const px = reg.x * width + lx * cosR - ly * sinR;
				const py = reg.y * height + lx * sinR + ly * cosR;
				const puffR = (0.04 + seeded(seedCursor + 2) * 0.13) * Math.min(width, height);

				const g = c.createRadialGradient(px, py, 0, px, py, puffR);
				g.addColorStop(0, `rgba(${reg.rgb}, ${reg.a})`);
				g.addColorStop(0.5, `rgba(${reg.rgb}, ${reg.a * 0.45})`);
				g.addColorStop(1, `rgba(${reg.rgb}, 0)`);
				c.fillStyle = g;
				c.beginPath();
				c.arc(px, py, puffR, 0, Math.PI * 2);
				c.fill();
			}
		}

		// 3. 1,500 Dense Milky Way Background Micro-Stardust Grains (concentrated along the galactic band + everywhere!)
		for (let i = 0; i < 1500; i++) {
			const inBand = i < 820;
			let sx = seeded(i * 9 + 1) * width;
			let sy = seeded(i * 9 + 2) * height;
			if (inBand) {
				// Concentrated along the diagonal Milky Way dust arch!
				const t = (seeded(i * 9 + 3) - 0.5) * 1.15;
				const spread = (seeded(i * 9 + 4) - 0.5) * (0.28 + Math.abs(t) * 0.25);
				const angle = -0.52;
				const bx = t * diag * 0.62;
				const by = spread * diag * 0.42;
				sx = cx + bx * Math.cos(angle) - by * Math.sin(angle);
				sy = cy + bx * Math.sin(angle) + by * Math.cos(angle);
			}
			const sz = 0.35 + Math.pow(seeded(i * 9 + 5), 2.2) * 1.05;
			const col = light
				? SPECTRAL_COLORS_LIGHT[i % SPECTRAL_COLORS_LIGHT.length]
				: SPECTRAL_COLORS_DARK[i % SPECTRAL_COLORS_DARK.length];
			c.fillStyle = col;
			c.globalAlpha = light
				? 0.14 + seeded(i * 9 + 6) * 0.35
				: 0.18 + seeded(i * 9 + 6) * 0.62;
			c.beginPath();
			c.arc(sx, sy, sz, 0, Math.PI * 2);
			c.fill();
		}
		c.globalAlpha = 1;

		// 4. Distant Tilted Spiral Galaxies & Globular Clusters (like the golden Andromeda disk at bottom-left of vyom.lol!)
		const galaxies = [
			{ x: width * 0.285, y: height * 0.65, rx: 18, ry: 5.5, rot: -0.35, color: light ? '37, 99, 235' : '255, 215, 130' },
			{ x: width * 0.14, y: height * 0.29, rx: 11, ry: 3.8, rot: 0.48, color: light ? '124, 58, 237' : '210, 195, 255' },
			{ x: width * 0.74, y: height * 0.21, rx: 13, ry: 4.2, rot: -0.22, color: light ? '14, 165, 233' : '255, 198, 165' }
		];
		for (const gal of galaxies) {
			c.save();
			c.translate(gal.x, gal.y);
			c.rotate(gal.rot);
			c.scale(1, gal.ry / gal.rx);
			const gg = c.createRadialGradient(0, 0, 0, 0, 0, gal.rx);
			gg.addColorStop(0, light ? `rgba(${gal.color}, 0.65)` : 'rgba(255, 250, 235, 0.95)');
			gg.addColorStop(0.32, `rgba(${gal.color}, 0.52)`);
			gg.addColorStop(1, `rgba(${gal.color}, 0)`);
			c.fillStyle = gg;
			c.beginPath();
			c.arc(0, 0, gal.rx, 0, Math.PI * 2);
			c.fill();
			c.restore();
		}

		return off;
	}

	// Draw a vyom.lol bright 4-point diffraction star (✦) with razor-thin horizontal & vertical light needles
	function drawDiffractionStar(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		r: number,
		color: string,
		alpha: number,
		isClusterHero = false
	) {
		if (alpha <= 0.01) return;
		ctx.save();
		ctx.globalAlpha = alpha;

		const haloR = r * (isClusterHero ? 6.5 : 4.8);
		const g = ctx.createRadialGradient(x, y, 0, x, y, haloR);
		g.addColorStop(0, '#ffffff');
		g.addColorStop(0.25, color);
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(x, y, haloR, 0, Math.PI * 2);
		ctx.fill();

		// Long razor-thin vyom.lol 4-point diffraction needles
		const spikeLen = r * (isClusterHero ? 9.5 : 6.4);
		ctx.strokeStyle = color;
		ctx.lineWidth = Math.max(0.65, r * 0.34);
		ctx.beginPath();
		ctx.moveTo(x - spikeLen, y);
		ctx.lineTo(x + spikeLen, y);
		ctx.moveTo(x, y - spikeLen);
		ctx.lineTo(x, y + spikeLen);
		ctx.stroke();

		// Subtle secondary diagonal cross-glint for brightest stars
		if (isClusterHero) {
			const diagLen = spikeLen * 0.36;
			ctx.globalAlpha = alpha * 0.55;
			ctx.lineWidth = 0.6;
			ctx.beginPath();
			ctx.moveTo(x - diagLen, y - diagLen);
			ctx.lineTo(x + diagLen, y + diagLen);
			ctx.moveTo(x + diagLen, y - diagLen);
			ctx.lineTo(x - diagLen, y + diagLen);
			ctx.stroke();
		}

		ctx.globalAlpha = alpha;
		ctx.fillStyle = '#ffffff';
		ctx.beginPath();
		ctx.arc(x, y, Math.max(0.9, r * 0.65), 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}

	// Draw a 3D-lit Planet with Day/Night Crescent Terminator facing the Central Sun, Atmospheric Rim, & Saturn Rings!
	function draw3DPlanet(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		r: number,
		sunX: number,
		sunY: number,
		spec: PlanetOrbitSpec,
		alpha: number,
		light: boolean,
		tSec: number
	) {
		if (alpha <= 0.01 || r < 0.4) return;
		ctx.save();
		ctx.globalAlpha = alpha;

		const sunAngle = Math.atan2(sunY - y, sunX - x);

		// 1. Back half of Saturn's translucent rings
		if (spec.hasRings) {
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(-0.24);
			for (const [mult, w, op] of [
				[2.35, r * 0.34, 0.52],
				[1.82, r * 0.24, 0.72]
			]) {
				ctx.strokeStyle = light ? `rgba(37, 99, 235, ${op})` : `rgba(238, 206, 150, ${op})`;
				ctx.lineWidth = Math.max(0.8, w);
				ctx.beginPath();
				ctx.ellipse(0, 0, r * mult, r * mult * 0.32, 0, Math.PI, Math.PI * 2);
				ctx.stroke();
			}
			ctx.restore();
		}

		// 2. Soft atmospheric halo around planet
		const atmoR = r * 2.8;
		const atmo = ctx.createRadialGradient(x, y, r * 0.4, x, y, atmoR);
		atmo.addColorStop(0, spec.colorAtmo);
		atmo.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = atmo;
		ctx.beginPath();
		ctx.arc(x, y, atmoR, 0, Math.PI * 2);
		ctx.fill();

		// 3. 3D Shaded Planet Sphere with Day/Night Terminator Offset toward the Central Sun!
		const litX = x + Math.cos(sunAngle) * r * 0.48;
		const litY = y + Math.sin(sunAngle) * r * 0.48;
		const sphereGrad = ctx.createRadialGradient(litX, litY, r * 0.08, x, y, r * 1.08);
		sphereGrad.addColorStop(0, spec.colorBright);
		sphereGrad.addColorStop(0.52, spec.colorMid);
		sphereGrad.addColorStop(1, light ? '#1e293b' : '#050711');
		ctx.fillStyle = sphereGrad;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();

		// 4. Front half of Saturn's translucent rings crossing in front of the planet sphere!
		if (spec.hasRings) {
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(-0.24);
			for (const [mult, w, op] of [
				[2.35, r * 0.34, 0.65],
				[1.82, r * 0.24, 0.85]
			]) {
				ctx.strokeStyle = light ? `rgba(37, 99, 235, ${op})` : `rgba(248, 220, 168, ${op})`;
				ctx.lineWidth = Math.max(0.8, w);
				ctx.beginPath();
				ctx.ellipse(0, 0, r * mult, r * mult * 0.32, 0, 0, Math.PI);
				ctx.stroke();
			}
			ctx.restore();
		}

		// 5. Tiny Orbiting Moon around Earth / Jupiter
		if (spec.hasMoon && r > 2.2) {
			const mAng = tSec * 1.4 + spec.phase * 3;
			const mx = x + Math.cos(mAng) * r * 2.45;
			const my = y + Math.sin(mAng) * r * 0.85;
			ctx.fillStyle = light ? '#334155' : '#e2e8f0';
			ctx.beginPath();
			ctx.arc(mx, my, Math.max(0.9, r * 0.26), 0, Math.PI * 2);
			ctx.fill();
		}

		// 6. Authentic vyom.lol Hairline Circular Target Reticle ◎
		if (spec.hasReticle) {
			const retR = Math.max(8.5, r * 1.9 + 4.5);
			ctx.strokeStyle = light ? 'rgba(26, 47, 251, 0.55)' : 'rgba(255, 255, 255, 0.68)';
			ctx.lineWidth = 0.95;
			ctx.beginPath();
			ctx.arc(x, y, retR, 0, Math.PI * 2);
			ctx.stroke();
		}

		ctx.restore();
	}

	let liveProgress = 0;
	let liveLight = false;
	$effect(() => {
		liveProgress = progress;
		liveLight = isLight;
	});

	onMount(() => {
		let nebulaCache: HTMLCanvasElement | null = null;
		let cachedW = 0;
		let cachedH = 0;
		let cachedLight = !liveLight;
		let octocatPath2D: Path2D | null =
			typeof Path2D !== 'undefined' ? new Path2D(OCTOCAT_PATH) : null;

		const updateSize = () => {
			vw = window.innerWidth;
			vh = window.innerHeight;
		};
		updateSize();
		window.addEventListener('resize', updateSize);

		let rafId = 0;
		const startTs = performance.now();

		const drawFrame = (now: number) => {
			const canvas = canvasEl;
			if (canvas) {
				const capDpr = vw < 768 ? 1.25 : 1.65;
				const dpr = Math.min(window.devicePixelRatio || 1, capDpr);
				const targetW = Math.round(vw * dpr);
				const targetH = Math.round(vh * dpr);
				if (canvas.width !== targetW || canvas.height !== targetH) {
					canvas.width = targetW;
					canvas.height = targetH;
				}

				const light = liveLight;
				if (!nebulaCache || cachedW !== vw || cachedH !== vh || cachedLight !== light) {
					cachedW = vw;
					cachedH = vh;
					cachedLight = light;
					nebulaCache = buildNebulaTexture(vw, vh, light);
				}

				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
					ctx.clearRect(0, 0, vw, vh);

					const p = liveProgress;
					const tSec = (now - startTs) * 0.001;
					const cx = vw * 0.5;
					const cy = vh * 0.5;
					const maxR = Math.hypot(cx, cy);
					const solarSpanR = (vw < vh ? Math.min(vw, vh) * 0.88 : Math.max(vw, vh) * 0.72);

					const convP = range01(p, 0.0, 0.34);
					const flyDiveP = range01(p, 0.5, 0.95);
					const bgAlpha = easeOutCubic(range01(p, 0.06, 0.22));
					const fxAlpha = easeOutCubic(range01(p, 0.0, 0.1));

					// -----------------------------------------------------------------
					// 1. COMPOSITE PRE-BAKED FRACTAL NEBULA, MILKY WAY & GALAXIES
					//    Scales gently outward in 3D depth parallax as the camera flies in!
					// -----------------------------------------------------------------
					if (nebulaCache && bgAlpha > 0.004) {
						ctx.save();
						ctx.globalAlpha = bgAlpha;
						const nebZoom = 1 + 0.04 * convP + 0.85 * Math.pow(flyDiveP, 1.85);
						ctx.translate(cx, cy);
						ctx.scale(nebZoom, nebZoom);
						ctx.drawImage(nebulaCache, -cx, -cy, vw, vh);
						ctx.restore();
					}

					// -----------------------------------------------------------------
					// 2. CENTRAL VYOM.LOL SOLAR CORONA & GOLDEN PHOTOSPHERE BLOOM
					// -----------------------------------------------------------------
					const coronaScale = (0.35 + 0.65 * easeOutCubic(range01(p, 0.04, 0.32))) * (1 + 4.5 * Math.pow(flyDiveP, 1.9));
					const coronaFade = fxAlpha * (1 - easeOutCubic(range01(flyDiveP, 0.45, 0.88)));
					if (coronaFade > 0.01) {
						ctx.save();
						const outerCoronaR = baseSize * 2.15 * coronaScale;
						const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerCoronaR);
						if (light) {
							cGrad.addColorStop(0, `rgba(26, 47, 251, ${0.32 * coronaFade})`);
							cGrad.addColorStop(0.28, `rgba(14, 165, 233, ${0.18 * coronaFade})`);
							cGrad.addColorStop(0.62, `rgba(99, 102, 241, ${0.08 * coronaFade})`);
							cGrad.addColorStop(1, 'rgba(255,255,255,0)');
						} else {
							cGrad.addColorStop(0, `rgba(255, 248, 215, ${0.85 * coronaFade})`);
							cGrad.addColorStop(0.18, `rgba(255, 204, 112, ${0.52 * coronaFade})`);
							cGrad.addColorStop(0.45, `rgba(218, 138, 72, ${0.24 * coronaFade})`);
							cGrad.addColorStop(0.75, `rgba(155, 92, 82, ${0.08 * coronaFade})`);
							cGrad.addColorStop(1, 'rgba(0,0,0,0)');
						}
						ctx.fillStyle = cGrad;
						ctx.beginPath();
						ctx.arc(cx, cy, outerCoronaR, 0, Math.PI * 2);
						ctx.fill();
						ctx.restore();
					}

					// -----------------------------------------------------------------
					// 3. 700 DYNAMIC SPECTRAL STARS + PLEIADES CLUSTER + 34 4-POINT (✦) STARS
					// -----------------------------------------------------------------
					const palette = light ? SPECTRAL_COLORS_LIGHT : SPECTRAL_COLORS_DARK;
					for (const st of FOREGROUND_STARS) {
						const layerFly = 1 + 4.6 * st.depthLayer * Math.pow(flyDiveP, 1.9);
						const driftAng = st.angle + tSec * 0.008 * st.depthLayer;
						const r = st.radFrac * maxR * layerFly;
						if (r > maxR * 1.45) continue;

						const x = cx + Math.cos(driftAng) * r;
						const y = cy + Math.sin(driftAng) * r;
						const twinkle = 0.64 + 0.36 * Math.sin(tSec * st.twinkleSpeed + st.twinklePhase);
						const alpha = fxAlpha * twinkle * (light ? 0.76 : 0.94);
						const col = palette[st.colorIdx];

						// Subtle radial warp trail during fly-through dive
						if (flyDiveP > 0.04) {
							const streak = Math.min(130, 8 + r * 0.16 * st.depthLayer * Math.sin(flyDiveP * Math.PI));
							const prevR = Math.max(0, r - streak);
							ctx.save();
							ctx.strokeStyle = col;
							ctx.globalAlpha = alpha * 0.48;
							ctx.lineWidth = Math.max(0.55, st.size * 0.52);
							ctx.lineCap = 'round';
							ctx.beginPath();
							ctx.moveTo(cx + Math.cos(driftAng) * prevR, cy + Math.sin(driftAng) * prevR);
							ctx.lineTo(x, y);
							ctx.stroke();
							ctx.restore();
						}

						if (st.isDiffraction) {
							drawDiffractionStar(ctx, x, y, st.size * (1 + flyDiveP * 0.5), col, alpha, st.isPleiades);
						} else {
							ctx.fillStyle = col;
							ctx.globalAlpha = alpha;
							ctx.beginPath();
							ctx.arc(x, y, st.size, 0, Math.PI * 2);
							ctx.fill();
						}
					}
					ctx.globalAlpha = 1;

					// -----------------------------------------------------------------
					// 4. 380-BODY ASTEROID BELT & KUIPER DUST RING ALONG THE ECLIPTIC PLANE
					// -----------------------------------------------------------------
					const orbitFlyScale = 1 + 11.5 * Math.pow(flyDiveP, 2.05);
					const orbitAlphaFade = fxAlpha * (1 - easeOutCubic(range01(flyDiveP, 0.58, 0.94)));
					if (orbitAlphaFade > 0.01) {
						ctx.save();
						for (const ast of ASTEROID_BELT) {
							const rx = solarSpanR * ast.rxFrac * orbitFlyScale;
							if (rx > maxR * 1.6) continue;
							const ang = ast.angle + tSec * 0.09 * ast.speed + p * 0.9 * ast.speed;
							const pt = project3DEllipse(ang, rx, ast.inclination, ast.tiltRad, cx, cy);
							ctx.fillStyle = light ? '#3b82f6' : '#d8e4ff';
							ctx.globalAlpha = orbitAlphaFade * ast.alpha * (light ? 0.55 : 0.68);
							ctx.beginPath();
							ctx.arc(pt.x, pt.y, ast.size, 0, Math.PI * 2);
							ctx.fill();
						}
						ctx.restore();
					}

					// -----------------------------------------------------------------
					// 5. 12 COHESIVE VYOM.LOL ECLIPTIC 3D ORBITAL RINGS + 3D SHADED PLANETS + ◎ RETICLES
					// -----------------------------------------------------------------
					if (orbitAlphaFade > 0.01) {
						ctx.save();
						for (let idx = 0; idx < SOLAR_ORBITS.length; idx++) {
							const orb = SOLAR_ORBITS[idx];
							const rx = solarSpanR * orb.rxFrac * orbitFlyScale;
							const ry = rx * orb.inclination;
							if (rx > maxR * 3.8) continue;

							const tiltRad = (orb.tiltDeg * Math.PI) / 180;

							// Crisp hairline vyom.lol periwinkle / ice-blue 3D elliptical orbital track
							ctx.save();
							ctx.translate(cx, cy);
							ctx.rotate(tiltRad);
							ctx.strokeStyle = light
								? orb.isCometTrack
									? 'rgba(99, 102, 241, 0.34)'
									: 'rgba(26, 47, 251, 0.38)'
								: orb.isCometTrack
									? 'rgba(165, 180, 252, 0.28)'
									: 'rgba(160, 190, 255, 0.42)';
							ctx.globalAlpha = orbitAlphaFade;
							ctx.lineWidth = orb.hasRings || idx === 2 ? 1.05 : 0.78;
							ctx.beginPath();
							ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
							ctx.stroke();
							ctx.restore();

							// During Beat 1 (0.00 -> 0.34), a luminous workflow star stream glides along each orbit into the Solar Core!
							if (p < 0.35) {
								const streamShrink = 1 - Math.pow(clamp01(range01(p, 0.02, 0.33)), 1.52);
								const sRx = solarSpanR * orb.rxFrac * streamShrink;
								const sAng = orb.phase + 1.8 + easeInOutCubic(convP) * Math.PI * 2.1 * orb.speed;
								const sAlpha = fxAlpha * (1 - range01(p, 0.29, 0.35));
								ctx.strokeStyle = light ? '#2563eb' : orb.colorBright;
								ctx.lineCap = 'round';
								for (let k = 0; k < 10; k++) {
									const a0 = sAng - k * 0.065;
									const a1 = sAng - (k + 1) * 0.065;
									const r0 = sRx + k * 2.5;
									const r1 = sRx + (k + 1) * 2.5;
									const p0 = project3DEllipse(a0, r0, orb.inclination, tiltRad, cx, cy);
									const p1 = project3DEllipse(a1, r1, orb.inclination, tiltRad, cx, cy);
									ctx.globalAlpha = sAlpha * (1 - k / 10) * 0.58;
									ctx.lineWidth = Math.max(0.7, (1 - k / 10) * 2.4);
									ctx.beginPath();
									ctx.moveTo(p0.x, p0.y);
									ctx.lineTo(p1.x, p1.y);
									ctx.stroke();
								}
							}

							// Render the 3D-shaded planet (with crescent terminator, Saturn rings, moon & ◎ reticle) on its ecliptic track!
							const planetAng = orb.phase + tSec * 0.14 * orb.speed + p * 1.45 * orb.speed;
							const pt = project3DEllipse(planetAng, rx, orb.inclination, tiltRad, cx, cy);
							const depthFactor = 0.82 + 0.32 * ((pt.depth + 1) * 0.5);
							const pRad = orb.planetRadius * depthFactor * (1 + flyDiveP * 1.35);

							draw3DPlanet(ctx, pt.x, pt.y, pRad, cx, cy, orb, orbitAlphaFade, light, tSec);
						}
						ctx.restore();
					}

					// -----------------------------------------------------------------
					// 6. STARDUST ORBIT TRAILS & ◎ RETICLES BEHIND THE 3 AI SATELLITES (Beat 1)
					// -----------------------------------------------------------------
					const satP = range01(p, 0.02, 0.33);
					const satVis =
						easeOutCubic(range01(p, 0.02, 0.1)) * (1 - easeOutCubic(range01(p, 0.27, 0.34)));
					if (satVis > 0.01 && satP > 0.005) {
						ctx.save();
						for (const sat of AI_SATELLITES) {
							const col = light ? sat.trailColorLight : sat.trailColorDark;
							ctx.strokeStyle = col;
							ctx.lineCap = 'round';
							for (let s = 0; s < 16; s++) {
								const pA = clamp01(satP - s * 0.013);
								const pB = clamp01(satP - (s + 1) * 0.013);
								const aPos = computeAiSatellitePose(sat, pA, vw, vh);
								const bPos = computeAiSatellitePose(sat, pB, vw, vh);
								ctx.globalAlpha = satVis * (1 - s / 16) * 0.62;
								ctx.lineWidth = Math.max(0.9, (1 - s / 16) * 3.8);
								ctx.beginPath();
								ctx.moveTo(aPos.x, aPos.y);
								ctx.lineTo(bPos.x, bPos.y);
								ctx.stroke();
							}

							const head = computeAiSatellitePose(sat, satP, vw, vh);
							ctx.strokeStyle = light ? 'rgba(26, 47, 251, 0.45)' : 'rgba(255, 255, 255, 0.5)';
							ctx.globalAlpha = satVis * 0.75;
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.arc(head.x, head.y, Math.max(10, 29 * head.scale), 0, Math.PI * 2);
							ctx.stroke();
						}
						ctx.restore();
					}

					// -----------------------------------------------------------------
					// 7. INFINITE-VECTOR OCTOCAT CAT SILHOUETTE PORTAL CUTOUT!
					//    Uses destination-out with Path2D(OCTOCAT_PATH) so EVERY nebula puff,
					//    star, and orbital line is cleanly cut inside the hollow Octocat cat window,
					//    revealing the dreamy blurred -> crystal-sharp GitHub Overview behind!
					// -----------------------------------------------------------------
					const apOpen = easeInOutCubic(range01(p, 0.34, 0.52));
					if (apOpen > 0.004 && octocatPath2D) {
						const curTotalScale =
							p < 0.27 ? 0.08 : (0.08 + 0.92 * easeOutBack(range01(p, 0.27, 0.42))) * (1 + 36 * Math.pow(flyDiveP, 2.35));
						const maskScale = (baseSize / 98) * curTotalScale;

						ctx.save();
						ctx.translate(cx, cy);
						ctx.scale(maskScale, maskScale);
						ctx.translate(-49, -50.715);

						// Step A: Punch out the inner circle (`r = 47.3`) with destination-out
						ctx.globalCompositeOperation = 'destination-out';
						ctx.globalAlpha = apOpen;
						ctx.fillStyle = '#000000';
						ctx.beginPath();
						ctx.arc(49, 49, 47.3, 0, Math.PI * 2);
						ctx.fill();

						// Step B: Restore the outer Invertocat ring (`OCTOCAT_PATH`) so ONLY the cat silhouette inside is transparent!
						ctx.globalCompositeOperation = 'source-over';
						ctx.globalAlpha = bgAlpha;
						ctx.fillStyle = light ? '#eef3fc' : '#080a18';
						ctx.save();
						ctx.translate(0.15, 1.15);
						ctx.fill(octocatPath2D, 'evenodd');
						ctx.restore();

						ctx.restore();
					}
				}
			}
			rafId = requestAnimationFrame(drawFrame);
		};

		rafId = requestAnimationFrame(drawFrame);
		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', updateSize);
		};
	});
</script>

<div
	class="portal-dive-root"
	class:portal-light={isLight}
	style="opacity: {layerOpacity.toFixed(3)};"
	aria-hidden="true"
>
	<!-- LAYER 1: HIGH-DETAIL 60FPS VYOM.LOL UNIVERSE CANVAS
	     (260 Fractal Nebula Clouds + Dark Dust Lanes + 2,200 Multi-Spectral Stars + Pleiades Cluster +
	      380-Body Asteroid Belt + 12 Ecliptic 3D Orbits + 3D Shaded Planets & Ringed Saturn + Vector Octocat Cutout!) -->
	<canvas bind:this={canvasEl} class="portal-fx-canvas"></canvas>

	<!-- LAYER 2: 3 AI SATELLITES (Real Gemini Star, Real ChatGPT Knot, Orange Pixel Clawd) ORBITING INTO THE SOLAR CORE! -->
	{#if aiSatelliteOpacity > 0.008}
		<div class="portal-satellites-stage" style="opacity: {aiSatelliteOpacity.toFixed(3)};">
			{#each aiPoses as sat (sat.kind)}
				<div
					class="orbiting-ai-node"
					style="
						transform: translate3d({sat.x.toFixed(1)}px, {sat.y.toFixed(1)}px, 0) translate(-50%, -50%) scale({sat.scale.toFixed(3)});
						z-index: {sat.depth > 0 ? 4 : 2};
					"
				>
					<AiPixelMascots kind={sat.kind} {theme} size={44} interactive={false} />
				</div>
			{/each}
		</div>
	{/if}

	<!-- LAYER 3: LUMINOUS GITHUB OCTOCAT SOLAR CORE (github-white-icon.webp) LOCKED 1:1 TO THE PORTAL CUTOUT! -->
	{#if iconOpacity > 0.005}
		<div
			class="octocat-emblem-anchor"
			style="
				width: {baseSize}px;
				height: {baseSize}px;
				margin-left: {(-baseSize * 0.5).toFixed(1)}px;
				margin-top: {(-baseSize * 0.5175).toFixed(1)}px;
				opacity: {iconOpacity.toFixed(3)};
				transform: scale({totalScale.toFixed(5)});
			"
		>
			{#if prismOpacity > 0.01}
				<div
					class="octocat-img octocat-prism-blue"
					style="
						opacity: {prismOpacity.toFixed(3)};
						transform: translate3d({(-prismShiftPx).toFixed(1)}px, {(-prismShiftPx * 0.2).toFixed(1)}px, 0);
					"
				></div>
				<div
					class="octocat-img octocat-prism-gold"
					style="
						opacity: {prismOpacity.toFixed(3)};
						transform: translate3d({prismShiftPx.toFixed(1)}px, {(prismShiftPx * 0.2).toFixed(1)}px, 0);
					"
				></div>
			{/if}

			<img
				src="/images/github-white-icon.webp"
				alt="GitHub Cosmic Star Core"
				class="octocat-img octocat-main"
			/>
		</div>
	{/if}
</div>

<style>
	.portal-dive-root {
		position: fixed;
		inset: 0;
		z-index: 82;
		pointer-events: none;
		overflow: hidden;
		will-change: opacity;
	}

	.portal-fx-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none;
	}

	.portal-satellites-stage {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.orbiting-ai-node {
		position: absolute;
		left: 0;
		top: 0;
		will-change: transform;
	}

	/* Locked 1:1 onto the exact cat-head center (50%, 51.75%) of github-white-icon.webp! */
	.octocat-emblem-anchor {
		position: absolute;
		left: 50%;
		top: 50%;
		transform-origin: 50% 51.75%;
		pointer-events: none;
		will-change: transform, opacity;
	}

	.octocat-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		user-select: none;
		display: block;
	}

	/* Warm Solar Photosphere Corona Glow around the white GitHub Octocat Sun */
	.octocat-main {
		filter: drop-shadow(0 0 18px rgba(255, 240, 195, 0.75))
			drop-shadow(0 0 46px rgba(235, 168, 84, 0.42));
	}

	.portal-light .octocat-main {
		filter: invert(1) drop-shadow(0 0 22px rgba(26, 47, 251, 0.34))
			drop-shadow(0 10px 28px rgba(15, 23, 42, 0.18));
	}

	.octocat-prism-blue,
	.octocat-prism-gold {
		-webkit-mask-image: url('/images/github-white-icon.webp');
		mask-image: url('/images/github-white-icon.webp');
		-webkit-mask-size: contain;
		mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-position: center;
	}

	.octocat-prism-blue {
		background: #93c5fd;
		mix-blend-mode: screen;
	}

	.octocat-prism-gold {
		background: #fde68a;
		mix-blend-mode: screen;
	}

	.portal-light .octocat-prism-blue {
		background: #0ea5e9;
		mix-blend-mode: multiply;
	}

	.portal-light .octocat-prism-gold {
		background: #1a2ffb;
		mix-blend-mode: multiply;
	}
</style>
