<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Lenis from 'lenis';
	import SharinganIntro from '$lib/components/SharinganIntro.svelte';
	import SwarmOverlay from '$lib/components/SwarmOverlay.svelte';
	import HeroScene from '$lib/components/HeroScene.svelte';
	import PersonaAbout from '$lib/components/PersonaAbout.svelte';
	import ProjectsShowcase from '$lib/components/ProjectsShowcase.svelte';
	import EnvContact from '$lib/components/EnvContact.svelte';
	import ScrollPushTerminal from '$lib/components/ScrollPushTerminal.svelte';
	import GithubPortalDive from '$lib/components/GithubPortalDive.svelte';
	import GithubProfileFinale from '$lib/components/GithubProfileFinale.svelte';
	import VsIcons, { type IconName } from '$lib/components/VsIcons.svelte';
	import {
		PORTFOLIO_FILES,
		PROFILE_DATA,
		ENV_CONTACTS,
		type SectionId
	} from '$lib/data/portfolio';
	import {
		runSwarmDirector,
		resetAllSwarmParts,
		type RenderedCursorState,
		type SwarmStepSpec
	} from '$lib/swarm/director';
	import { isPartBuilt } from '$lib/swarm/state.svelte';

	type ZoneId = 'readme-top' | 'readme-bottom' | 'env-main';

	let stage = $state<'sharingan' | 'paperx-intro' | 'building-shell' | 'ready'>('sharingan');
	let paperXIntroTrigger = $state(0);
	let shellZoomOutProgress = $state(0); // 0 = fullscreen 100vw×100vh on PaperX -> 1 = zoomed out into VS Code
	let activeSection = $state<SectionId>('hero.svelte');

	// Compute dynamic fullscreen camera zoom-out transform for .vscode-shell:
	// At zoomOut=0 (Shots 1 & 2), scales & centers the Hero editor slot so it fills 100vw×100vh edge-to-edge!
	// At zoomOut=1 (End of Shot 3 -> Act 3 Swarm), lands cleanly at identity (no transform) so VS Code sits 1:1!
	let shellCameraStyle = $derived.by(() => {
		if (stage !== 'paperx-intro') return '';
		const inv = Math.max(0, 1 - shellZoomOutProgress);
		if (inv <= 0.001) return '';
		const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
		const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
		const sidebarW = vw > 760 && sidebarOpen ? 206 : 0;
		const fullScale = Math.max(vw / Math.max(320, vw - sidebarW), vh / Math.max(320, vh - 57));
		const curScale = 1 + (fullScale - 1) * inv;
		// Shift so the Hero viewport center aligns with the exact center of the browser screen while zoomed in!
		const offsetX = -(sidebarW / 2) * curScale * inv;
		const offsetY = -6.5 * curScale * inv;
		return `transform: translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0) scale(${curScale.toFixed(4)});`;
	});
	let heroTheme = $state<'light' | 'dark'>('dark');
	let isLightTheme = $derived(heroTheme === 'light');
	let sidebarOpen = $state(true);

	// 100% Continuous Reversible Deploy Scroll Track (.env -> VS Code Dissolves -> Fullscreen Scroll-Scrubbed Terminal -> GitHub Overview!)
	let deployTrackEl: HTMLElement | undefined = $state();
	let deployTargetP = $state(0);
	let deploySmoothP = $state(0);

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

	// Synced 100% continuous reversible scroll-scrubbed timeline (600vh track):
	// 0.01 -> 0.08 : VS Code chrome (Explorer, Tabs, StatusBar) dissolves cleanly to 0
	// 0.03 -> 0.10 : Fullscreen 100vw×100vh Claude Code Terminal enters
	// 0.08 -> 0.45 : Terminal git status / commit / push types & streams 0% -> 100% (reversible 1:1!)
	// 0.46 -> 0.90 : VYOM.LOL COSMIC PORTAL DIVE (3D Tilted Orbits + Workflow Stars & 3 AI Converge -> Octocat Sun -> Fly THROUGH!)
	// 0.78 -> 0.985: CINEMA LENS FOCUS-PULL (GitHub Overview enters dreamy blur(18px) -> smoothly racks focus to crystal-sharp 0px!)
	let isDeployActive = $derived(deploySmoothP > 0.004);
	let vscodeChromeOpacity = $derived(1 - easeOutCubic(range01(deploySmoothP, 0.01, 0.08)));

	let termEnterP = $derived(easeOutCubic(range01(deploySmoothP, 0.03, 0.1)));
	let termExitP = $derived(easeOutCubic(range01(deploySmoothP, 0.56, 0.6)));
	let termOpacity = $derived(termEnterP * (1 - termExitP));
	let termScale = $derived(0.94 + 0.06 * termEnterP);
	let termScrubP = $derived(range01(deploySmoothP, 0.08, 0.45));
	let termImplodeP = $derived(range01(deploySmoothP, 0.46, 0.58));

	let portalP = $derived(range01(deploySmoothP, 0.46, 0.9));
	let showPortal = $derived(deploySmoothP > 0.458 && deploySmoothP < 0.91);

	let githubMounted = $derived(deploySmoothP > 0.56);
	let githubOpacity = $derived(easeOutCubic(range01(deploySmoothP, 0.56, 0.6)));
	let focusPullP = $derived(easeOutCubic(range01(deploySmoothP, 0.76, 0.985)));
	let githubScale = $derived(0.86 + 0.14 * focusPullP);
	let githubBlurPx = $derived(Math.round(15 * (1 - focusPullP) * 4) / 4);
	let githubBrightness = $derived(0.76 + 0.24 * focusPullP);
	let githubInteractive = $derived(deploySmoothP > 0.95);
	let rootFolderOpen = $state(true);

	// Reactive file names so when agents paste identical hero.svelte copies and then F2-rename them,
	// BOTH the filename AND the leading VS Code file icon dynamically morph by file extension!
	let explorerLabels = $state<string[]>(PORTFOLIO_FILES.map((f) => f.name));
	let tabLabels = $state<string[]>(PORTFOLIO_FILES.map((f) => f.name));

	function resolveIconByExtension(filename: string): IconName {
		const lower = filename.trim().toLowerCase();
		if (lower.endsWith('.svelte')) return 'file-svelte';
		if (lower === 'readme.md') return 'file-readme';
		if (lower.endsWith('.md')) return 'file-md';
		if (lower === '.env' || lower.startsWith('.env.')) return 'file-env';
		return 'file-default';
	}

	let activeCursors = $state<RenderedCursorState[]>([]);

	// Scroll-linked seamless cross-fade opacities for each section
	let sectionOpacity = $state<Record<SectionId, number>>({
		'hero.svelte': 1,
		'README.md': 0.12,
		'PRODUCT.md': 0.12,
		'.env': 0.12
	});

	let editorScrollEl: HTMLElement | undefined = $state();
	let editorContentEl: HTMLElement | undefined = $state();
	let editorScrollTop = $state(0);
	let heroWrapperEl: HTMLElement | undefined = $state();
	let readmeWrapperEl: HTMLElement | undefined = $state();
	let productWrapperEl: HTMLElement | undefined = $state();
	let envWrapperEl: HTMLElement | undefined = $state();

	let lenis: Lenis | null = null;
	let lenisRafId = 0;

	let cancelCurrentSwarm: (() => void) | null = null;
	let builtZones = new Set<ZoneId>();
	let scheduledZones = new Set<ZoneId>();
	let pendingZoneTimers = new Map<ZoneId, ReturnType<typeof setTimeout>>();
	let zoneQueue: ZoneId[] = [];
	let isZoneRunning = false;
	let zoneObserver: IntersectionObserver | null = null;

	const SWARM_FADE_DELAY_MS = 540;

	function q(part: string): HTMLElement | null {
		return document.querySelector<HTMLElement>(`[data-swarm-part="${part}"]`);
	}

	function buildShellAndHeroSteps(): SwarmStepSpec[] {
		const steps: SwarmStepSpec[] = [];

		// Pre-set explorer & tab labels for the clones to "hero.svelte" before build starts
		explorerLabels = PORTFOLIO_FILES.map(() => 'hero.svelte');
		tabLabels = PORTFOLIO_FILES.map(() => 'hero.svelte');

		// 1. VS Code Explorer Frame -> Create #1 (hero.svelte) -> Paste 3 IDENTICAL copies -> Rename & Morph Icons!
		const explorerEl = q('shell-explorer');
		if (explorerEl) {
			steps.push({
				id: 'shell-explorer',
				kind: 'draw-box',
				agent: 'UI-Arch',
				color: '#0078d4',
				actionTag: 'Explorer',
				el: explorerEl,
				startMs: 0,
				durationMs: 500
			});
		}

		const exp0 = q('exp-file-0');
		if (exp0) {
			steps.push({
				id: 'exp-file-0',
				kind: 'draw-box',
				agent: 'PaperX',
				color: '#e60012',
				actionTag: 'New hero.svelte',
				el: exp0,
				startMs: 460,
				durationMs: 380
			});
		}

		// Batch Ctrl+V Paste 3 IDENTICAL [Svelte] hero.svelte copies!
		for (let idx = 1; idx < PORTFOLIO_FILES.length; idx++) {
			const rowEl = q(`exp-file-${idx}`);
			if (!rowEl) continue;
			steps.push({
				id: `exp-paste-${idx}`,
				kind: 'paste-clone',
				agent: 'PaperX',
				color: '#e60012',
				actionTag: `Ctrl+V (${idx}/3)`,
				el: rowEl,
				sourceEl: exp0 ?? undefined,
				editTitleSelector: '.file-label',
				clonedPreviewText: 'hero.svelte',
				onTextUpdate: (txt) => {
					explorerLabels[idx] = txt;
				},
				startMs: 860 + (idx - 1) * 240,
				durationMs: 300
			});
		}

		// After all 4 identical [Svelte] hero.svelte files are visibly sitting in Explorer,
		// 3 agents swoop in to F2-Rename each copy -> watching the icon morph dynamically when .md / .env is typed!
		const renameExpAgents = [
			{ name: 'Router', color: '#60a5fa' },
			{ name: 'Motion', color: '#38bdf8' },
			{ name: 'Tokens', color: '#34d399' }
		];

		for (let idx = 1; idx < PORTFOLIO_FILES.length; idx++) {
			const rowEl = q(`exp-file-${idx}`);
			if (!rowEl) continue;
			const ag = renameExpAgents[(idx - 1) % renameExpAgents.length];
			steps.push({
				id: `exp-rename-${idx}`,
				kind: 'rename-live',
				agent: ag.name,
				color: ag.color,
				actionTag: 'F2 Rename',
				el: rowEl,
				editTitleSelector: '.file-label',
				finalText: PORTFOLIO_FILES[idx].name,
				onTextUpdate: (txt) => {
					explorerLabels[idx] = txt;
				},
				startMs: 1850 + (idx - 1) * 280,
				durationMs: 740
			});
		}

		// 2. VS Code Tabs Bar -> Create Tab #1 (hero.svelte) -> Paste 3 IDENTICAL tabs -> Rename & Morph Tab Icons!
		const tabsEl = q('shell-tabs');
		if (tabsEl) {
			steps.push({
				id: 'shell-tabs',
				kind: 'draw-box',
				agent: 'Svelte',
				color: '#ff3e00',
				actionTag: 'Tab Bar',
				el: tabsEl,
				startMs: 120,
				durationMs: 440
			});
		}

		const tab0 = q('tab-file-0');
		if (tab0) {
			steps.push({
				id: 'tab-file-0',
				kind: 'draw-box',
				agent: 'Svelte',
				color: '#ff3e00',
				actionTag: 'Open Tab',
				el: tab0,
				startMs: 560,
				durationMs: 340
			});
		}

		for (let idx = 1; idx < PORTFOLIO_FILES.length; idx++) {
			const tabEl = q(`tab-file-${idx}`);
			if (!tabEl) continue;
			steps.push({
				id: `tab-paste-${idx}`,
				kind: 'paste-clone',
				agent: 'Svelte',
				color: '#ff3e00',
				actionTag: `Ctrl+V (${idx}/3)`,
				el: tabEl,
				sourceEl: tab0 ?? undefined,
				editTitleSelector: '.tab-label',
				clonedPreviewText: 'hero.svelte',
				onTextUpdate: (txt) => {
					tabLabels[idx] = txt;
				},
				startMs: 920 + (idx - 1) * 240,
				durationMs: 300
			});
		}

		const renameTabAgents = [
			{ name: 'Layout', color: '#f472b6' },
			{ name: 'Phantom', color: '#a855f7' },
			{ name: 'Hamster', color: '#22c55e' }
		];

		for (let idx = 1; idx < PORTFOLIO_FILES.length; idx++) {
			const tabEl = q(`tab-file-${idx}`);
			if (!tabEl) continue;
			const ag = renameTabAgents[(idx - 1) % renameTabAgents.length];
			steps.push({
				id: `tab-rename-${idx}`,
				kind: 'rename-live',
				agent: ag.name,
				color: ag.color,
				actionTag: 'F2 Rename',
				el: tabEl,
				editTitleSelector: '.tab-label',
				finalText: PORTFOLIO_FILES[idx].name,
				onTextUpdate: (txt) => {
					tabLabels[idx] = txt;
				},
				startMs: 1920 + (idx - 1) * 280,
				durationMs: 740
			});
		}

		// 3. Scout alignment sweep over the already-revealed PaperX Hero + Theme Toggle & Status Bar
		if (heroWrapperEl) {
			steps.push({
				id: 'hero-scout-grid',
				kind: 'scout-align',
				agent: 'Grid',
				color: '#818cf8',
				actionTag: 'Align Hero',
				el: heroWrapperEl,
				startMs: 360,
				durationMs: 1120
			});
			steps.push({
				id: 'hero-scout-render',
				kind: 'scout-align',
				agent: 'Render',
				color: '#fb7185',
				actionTag: 'Svelte 5 Runes',
				el: heroWrapperEl,
				startMs: 1260,
				durationMs: 1120
			});
		}

		// 4. Film & Hamster finish Theme Switch & Status Bar
		const themeBtn = q('hero-theme-btn');
		if (themeBtn) {
			steps.push({
				id: 'hero-theme-btn',
				kind: 'draw-box',
				agent: 'Film',
				color: '#facc15',
				actionTag: 'Theme Switch',
				el: themeBtn,
				startMs: 1220,
				durationMs: 520
			});
		}

		const statusEl = q('shell-status');
		if (statusEl) {
			steps.push({
				id: 'shell-status',
				kind: 'draw-box',
				agent: 'Hamster',
				color: '#22c55e',
				actionTag: 'Status Bar',
				el: statusEl,
				startMs: 1580,
				durationMs: 560
			});
		}

		return steps;
	}

	function buildZoneSteps(zone: ZoneId): SwarmStepSpec[] {
		const steps: SwarmStepSpec[] = [];

		if (zone === 'readme-top') {
			const slash = q('p5-slash');
			if (slash) {
				steps.push({
					id: 'p5-slash',
					kind: 'draw-box',
					agent: 'Phantom',
					color: '#e60012',
					actionTag: 'P5 Slash',
					el: slash,
					startMs: 0,
					durationMs: 620
				});
				steps.push({
					id: 'p5-scout-layout',
					kind: 'scout-align',
					agent: 'Layout',
					color: '#f472b6',
					actionTag: 'Angle -8°',
					el: slash,
					startMs: 380,
					durationMs: 1200
				});
			}

			const codename = q('p5-codename');
			if (codename) {
				steps.push({
					id: 'p5-codename',
					kind: 'draw-box',
					agent: 'Film',
					color: '#facc15',
					actionTag: 'Stamp Tag',
					el: codename,
					startMs: 360,
					durationMs: 480
				});
			}

			const portrait = q('p5-portrait');
			if (portrait) {
				steps.push({
					id: 'p5-portrait',
					kind: 'drop-asset',
					agent: 'Canvas',
					color: '#2dd4bf',
					actionTag: 'Place Cutout',
					assetPreviewUrl: PROFILE_DATA.avatarUrl,
					el: portrait,
					startMs: 820,
					durationMs: 740
				});
			}

			const role = q('p5-role');
			if (role) {
				steps.push({
					id: 'p5-role',
					kind: 'draw-box',
					agent: 'Hamster',
					color: '#22c55e',
					actionTag: 'CTO Plate',
					el: role,
					startMs: 1520,
					durationMs: 520
				});
			}

			const charHeader = q('p5-header-char');
			if (charHeader) {
				steps.push({
					id: 'p5-header-char',
					kind: 'draw-box',
					agent: 'Typo',
					color: '#fb923c',
					actionTag: 'Ransom Header',
					el: charHeader,
					startMs: 440,
					durationMs: 540
				});
			}

			const filmHeader = q('p5-header-film');
			if (filmHeader) {
				steps.push({
					id: 'p5-header-film',
					kind: 'draw-box',
					agent: 'PaperX',
					color: '#38bdf8',
					actionTag: 'Nameplate',
					el: filmHeader,
					startMs: 980,
					durationMs: 560
				});
			}

			const bioBox = q('p5-bio-box');
			if (bioBox) {
				steps.push({
					id: 'p5-bio-box',
					kind: 'draw-box',
					agent: 'UI-Arch',
					color: '#0078d4',
					actionTag: 'Bio Frame',
					el: bioBox,
					startMs: 1480,
					durationMs: 560
				});
			}

			const tagline = q('p5-bio-tagline');
			if (tagline) {
				steps.push({
					id: 'p5-bio-tagline',
					kind: 'type-text',
					agent: 'Svelte',
					color: '#ff3e00',
					actionTag: 'Type Tagline',
					el: tagline,
					startMs: 2040,
					durationMs: 580
				});
			}

			const bioAgents = [
				{ name: 'Typo', color: '#fb923c' },
				{ name: 'Motion', color: '#38bdf8' },
				{ name: 'Svelte', color: '#ff3e00' }
			];
			for (let bIdx = 0; bIdx < PROFILE_DATA.bioParagraphs.length; bIdx++) {
				const pEl = q(`p5-bio-p${bIdx}`);
				if (!pEl) continue;
				const ag = bioAgents[bIdx % bioAgents.length];
				steps.push({
					id: `p5-bio-p${bIdx}`,
					kind: 'type-text',
					agent: ag.name,
					color: ag.color,
					actionTag: 'Type Bio',
					el: pEl,
					startMs: 2620 + bIdx * 620,
					durationMs: 600
				});
			}
		} else if (zone === 'readme-bottom') {
			const radar = q('p5-radar');
			if (radar) {
				steps.push({
					id: 'p5-radar',
					kind: 'draw-box',
					agent: 'Hamster',
					color: '#22c55e',
					actionTag: 'Plot Stats',
					el: radar,
					startMs: 0,
					durationMs: 680
				});
			}

			const skillsWrap = q('p5-skills-wrap');
			if (skillsWrap) {
				steps.push({
					id: 'p5-skills-wrap',
					kind: 'draw-box',
					agent: 'Grid',
					color: '#818cf8',
					actionTag: 'Skills Layout',
					el: skillsWrap,
					startMs: 180,
					durationMs: 420
				});
			}

			// Step 1: Build Row #0 ("Frontend")
			const row0 = q('p5-skill-row-0');
			if (row0) {
				steps.push({
					id: 'p5-skill-row-0',
					kind: 'draw-box',
					agent: 'Svelte',
					color: '#ff3e00',
					actionTag: 'Row 1',
					el: row0,
					startMs: 560,
					durationMs: 380
				});
			}

			// Step 2: Batch-Paste IDENTICAL "Frontend" skill rows downwards!
			const firstGroupTitle = PROFILE_DATA.skillGroups[0].title;
			const skillPasteTotal = PROFILE_DATA.skillGroups.length - 1;
			for (let idx = 1; idx < PROFILE_DATA.skillGroups.length; idx++) {
				const rowEl = q(`p5-skill-row-${idx}`);
				if (!rowEl) continue;
				steps.push({
					id: `p5-skill-paste-${idx}`,
					kind: 'paste-clone',
					agent: 'Svelte',
					color: '#ff3e00',
					actionTag: `Ctrl+V (${idx}/${skillPasteTotal})`,
					el: rowEl,
					sourceEl: row0 ?? undefined,
					editTitleSelector: '.strip-cat-title',
					clonedPreviewText: firstGroupTitle,
					startMs: 920 + (idx - 1) * 190,
					durationMs: 260
				});
			}

			// Step 3: Agents swoop in to F2-Rename each category row!
			const rowTeam = [
				{ name: 'PaperX', color: '#e60012' },
				{ name: 'Motion', color: '#38bdf8' },
				{ name: 'Canvas', color: '#c084fc' },
				{ name: 'Phantom', color: '#a855f7' }
			];
			for (let idx = 1; idx < PROFILE_DATA.skillGroups.length; idx++) {
				const rowEl = q(`p5-skill-row-${idx}`);
				if (!rowEl) continue;
				const ag = rowTeam[(idx - 1) % rowTeam.length];
				steps.push({
					id: `p5-skill-rename-${idx}`,
					kind: 'rename-live',
					agent: ag.name,
					color: ag.color,
					actionTag: 'Edit Category',
					el: rowEl,
					editTitleSelector: '.strip-cat-title',
					finalText: PROFILE_DATA.skillGroups[idx].title,
					startMs: 1860 + (idx - 1) * 210,
					durationMs: 580
				});
			}
		} else if (zone === 'env-main') {
			const envCard = q('env-card');
			if (envCard) {
				steps.push({
					id: 'env-card',
					kind: 'draw-box',
					agent: 'UI-Arch',
					color: '#0078d4',
					actionTag: 'Env Container',
					el: envCard,
					startMs: 0,
					durationMs: 500
				});
			}

			// Row 0 created -> Rapid-paste 6 IDENTICAL DEVELOPER_CODENAME rows -> Then Agents rename all 6!
			const row0 = q('env-row-0');
			if (row0) {
				steps.push({
					id: 'env-row-0',
					kind: 'draw-box',
					agent: 'Tokens',
					color: '#34d399',
					actionTag: 'Line 1',
					el: row0,
					startMs: 480,
					durationMs: 380
				});
			}

			const firstEnvKey = ENV_CONTACTS[0].key;
			const envPasteTotal = ENV_CONTACTS.length - 1;
			for (let idx = 1; idx < ENV_CONTACTS.length; idx++) {
				const rowEl = q(`env-row-${idx}`);
				if (!rowEl) continue;
				steps.push({
					id: `env-paste-${idx}`,
					kind: 'paste-clone',
					agent: 'Tokens',
					color: '#34d399',
					actionTag: `Ctrl+V (${idx}/${envPasteTotal})`,
					el: rowEl,
					sourceEl: row0 ?? undefined,
					editTitleSelector: '.env-key',
					clonedPreviewText: firstEnvKey,
					startMs: 860 + (idx - 1) * 140,
					durationMs: 240
				});
			}

			const envTeam = [
				{ name: 'Router', color: '#60a5fa' },
				{ name: 'Film', color: '#facc15' },
				{ name: 'PaperX', color: '#e60012' },
				{ name: 'Svelte', color: '#ff3e00' }
			];

			for (let idx = 1; idx < ENV_CONTACTS.length; idx++) {
				const rowEl = q(`env-row-${idx}`);
				if (!rowEl) continue;
				const ag = envTeam[(idx - 1) % envTeam.length];
				steps.push({
					id: `env-rename-${idx}`,
					kind: 'rename-live',
					agent: ag.name,
					color: ag.color,
					actionTag: 'Edit Key',
					el: rowEl,
					editTitleSelector: '.env-key',
					finalText: ENV_CONTACTS[idx].key,
					startMs: 1920 + (idx - 1) * 190,
					durationMs: 560
				});
			}

			const connectBar = q('env-connect');
			if (connectBar) {
				steps.push({
					id: 'env-connect',
					kind: 'draw-box',
					agent: 'Hamster',
					color: '#22c55e',
					actionTag: 'Contact Bar',
					el: connectBar,
					startMs: 2450,
					durationMs: 620
				});
			}
		}

		return steps;
	}

	function processNextZone() {
		if (stage !== 'ready' || isZoneRunning || zoneQueue.length === 0) return;
		const nextZone = zoneQueue.shift()!;
		if (builtZones.has(nextZone)) {
			processNextZone();
			return;
		}
		builtZones.add(nextZone);
		isZoneRunning = true;

		const steps = buildZoneSteps(nextZone);
		cancelCurrentSwarm = runSwarmDirector(
			steps,
			(cursors) => {
				activeCursors = cursors;
			},
			() => {
				isZoneRunning = false;
				cancelCurrentSwarm = null;
				processNextZone();
			}
		);
	}

	function enqueueZone(zone: ZoneId) {
		if (builtZones.has(zone) || zoneQueue.includes(zone)) return;
		zoneQueue.push(zone);
		processNextZone();
	}

	function scheduleZoneWithFadeDelay(zone: ZoneId) {
		if (builtZones.has(zone) || scheduledZones.has(zone) || zoneQueue.includes(zone)) return;
		scheduledZones.add(zone);
		// Let the seamless atmospheric cross-fade settle first (no cursors yet!),
		// then summon the Swarm Cursors smoothly into the newly faded-in section!
		const delayMs = zone === 'readme-bottom' ? 380 : SWARM_FADE_DELAY_MS;
		const timer = setTimeout(() => {
			pendingZoneTimers.delete(zone);
			scheduledZones.delete(zone);
			if (stage === 'ready') {
				enqueueZone(zone);
			}
		}, delayMs);
		pendingZoneTimers.set(zone, timer);
	}

	function setupZoneObservers() {
		zoneObserver?.disconnect();
		if (!editorScrollEl) return;

		// NOTE: PRODUCT.md uses pure 100% scroll-scrubbed Lusion choreography (NO Swarm Cursors!)
		const zoneAnchors: { zone: ZoneId; el: HTMLElement | null }[] = [
			{ zone: 'readme-top', el: q('p5-slash') },
			{ zone: 'readme-bottom', el: q('p5-radar') },
			{ zone: 'env-main', el: q('env-card') }
		];

		zoneObserver = new IntersectionObserver(
			(entries) => {
				if (stage !== 'ready') return;
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const z = (entry.target as HTMLElement).dataset.swarmZone as ZoneId | undefined;
						if (z) scheduleZoneWithFadeDelay(z);
					}
				}
			},
			{
				root: editorScrollEl,
				threshold: 0.16
			}
		);

		for (const anchor of zoneAnchors) {
			if (anchor.el) {
				anchor.el.dataset.swarmZone = anchor.zone;
				zoneObserver.observe(anchor.el);
			}
		}
	}

	function updateScrollFadesAndActive() {
		if (!editorScrollEl) return;
		const vpRect = editorScrollEl.getBoundingClientRect();
		const vh = Math.max(1, vpRect.height);

		const candidates: { id: SectionId; el: HTMLElement | undefined }[] = [
			{ id: 'hero.svelte', el: heroWrapperEl },
			{ id: 'README.md', el: readmeWrapperEl },
			{ id: 'PRODUCT.md', el: productWrapperEl },
			{ id: '.env', el: envWrapperEl }
		];

		let detected: SectionId = 'hero.svelte';
		const scrollTop = editorScrollEl.scrollTop;
		editorScrollTop = scrollTop;

		for (const c of candidates) {
			if (!c.el) continue;
			const r = c.el.getBoundingClientRect();

			// Smooth cross-fade curve: fades smoothly in as section glides up into viewport,
			// and gently dims out as it leaves the top/bottom edge
			const visiblePx = Math.max(0, Math.min(r.bottom, vpRect.bottom) - Math.max(r.top, vpRect.top));
			const minRef = Math.min(vh * 0.62, Math.max(240, r.height * 0.55));
			const rawVis = Math.max(0, Math.min(1, visiblePx / minRef));
			const smoothFade = 0.08 + 0.92 * Math.pow(rawVis, 0.72);
			sectionOpacity[c.id] = smoothFade;

			const topThreshold = c.el.offsetTop - vh * 0.42;
			if (scrollTop >= topThreshold) {
				detected = c.id;
			}
		}

		if (stage === 'ready' && detected !== activeSection) {
			activeSection = detected;
		}

		// Compute continuous reversible Deploy Scroll Track progress (0 -> 1)
		if (deployTrackEl && stage === 'ready') {
			const tr = deployTrackEl.getBoundingClientRect();
			const relTop = tr.top - vpRect.top;
			const travel = Math.max(1, tr.height - vh * 0.25);
			const raw = (vh * 0.75 - relTop) / travel;
			deployTargetP = clamp01(raw);
		} else {
			deployTargetP = 0;
		}
	}

	async function handleSharinganComplete() {
		// Act 2: Play the nsys.site-inspired 3D Camera PaperX intro FULLSCREEN first, then zoom out into VS Code!
		shellZoomOutProgress = 0;
		stage = 'paperx-intro';
		paperXIntroTrigger += 1;
	}

	async function handlePaperXIntroComplete() {
		// Act 3: Camera has zoomed out into the VS Code frame -> summon Multi-Agent Swarm to build VS Code around it!
		shellZoomOutProgress = 1;
		stage = 'building-shell';
		await tick();

		const steps = buildShellAndHeroSteps();
		cancelCurrentSwarm = runSwarmDirector(
			steps,
			(cursors) => {
				activeCursors = cursors;
			},
			() => {
				stage = 'ready';
				cancelCurrentSwarm = null;
				explorerLabels = PORTFOLIO_FILES.map((f) => f.name);
				tabLabels = PORTFOLIO_FILES.map((f) => f.name);
				// Clear inline opacity left by Motion spring on VS Code chrome so --vscode-chrome-opacity cleanly dissolves it!
				for (const part of ['shell-explorer', 'shell-tabs', 'shell-status']) {
					const el = q(part);
					if (el) el.style.opacity = '';
				}
				setupZoneObservers();
				updateScrollFadesAndActive();
			}
		);
	}

	function replayFullIntro() {
		cancelCurrentSwarm?.();
		cancelCurrentSwarm = null;
		zoneObserver?.disconnect();
		for (const t of pendingZoneTimers.values()) clearTimeout(t);
		pendingZoneTimers.clear();
		scheduledZones.clear();
		builtZones.clear();
		zoneQueue = [];
		isZoneRunning = false;
		activeCursors = [];

		if (lenis) {
			lenis.scrollTo(0, { immediate: true });
		} else if (editorScrollEl) {
			editorScrollEl.scrollTo({ top: 0, behavior: 'instant' });
		}

		resetAllSwarmParts(document);
		explorerLabels = PORTFOLIO_FILES.map(() => 'hero.svelte');
		tabLabels = PORTFOLIO_FILES.map(() => 'hero.svelte');
		sectionOpacity = {
			'hero.svelte': 1,
			'README.md': 0.12,
			'PRODUCT.md': 0.12,
			'.env': 0.12
		};
		activeSection = 'hero.svelte';
		deployTargetP = 0;
		deploySmoothP = 0;
		stage = 'sharingan';
	}

	function handleGithubScrollUpRewind(deltaY: number) {
		if (!editorScrollEl) return;
		const nextTop = Math.max(0, editorScrollEl.scrollTop + deltaY * 2.5);
		if (lenis) {
			lenis.scrollTo(nextTop, {
				duration: 0.35,
				easing: (t: number) => 1 - Math.pow(1 - t, 3)
			});
		} else {
			editorScrollEl.scrollTop = nextTop;
		}
	}

	function navigateToSection(sec: SectionId) {
		activeSection = sec;
		const map: Record<SectionId, HTMLElement | undefined> = {
			'hero.svelte': heroWrapperEl,
			'README.md': readmeWrapperEl,
			'PRODUCT.md': productWrapperEl,
			'.env': envWrapperEl
		};
		const el = map[sec];
		if (!el) return;
		if (lenis) {
			lenis.scrollTo(el, {
				duration: 1.35,
				easing: (t: number) => 1 - Math.pow(1 - t, 4)
			});
		} else if (editorScrollEl) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function scrollToElementSmooth(el: HTMLElement) {
		if (lenis) {
			lenis.scrollTo(el, {
				offset: -20,
				duration: 1.25,
				easing: (t: number) => 1 - Math.pow(1 - t, 4)
			});
		} else if (editorScrollEl) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function handleEditorScroll() {
		updateScrollFadesAndActive();
	}

	function toggleHeroTheme() {
		heroTheme = heroTheme === 'dark' ? 'light' : 'dark';
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', heroTheme);
		}
	}

	onMount(() => {
		if (window.innerWidth <= 768) {
			sidebarOpen = false;
		}
		// Initialize Lenis buttery inertial smooth scrolling on the editor viewport
		if (editorScrollEl && editorContentEl) {
			lenis = new Lenis({
				wrapper: editorScrollEl,
				content: editorContentEl,
				lerp: 0.085,
				wheelMultiplier: 0.9,
				smoothWheel: true,
				touchMultiplier: 1.5
			});

			const raf = (time: number) => {
				lenis?.raf(time);
				const dDeploy = deployTargetP - deploySmoothP;
				if (Math.abs(dDeploy) > 0.00015) {
					deploySmoothP += dDeploy * 0.15;
				} else if (deploySmoothP !== deployTargetP) {
					deploySmoothP = deployTargetP;
				}
				lenisRafId = requestAnimationFrame(raf);
			};
			lenisRafId = requestAnimationFrame(raf);
		}

		return () => {
			cancelAnimationFrame(lenisRafId);
			lenis?.destroy();
			lenis = null;
			cancelCurrentSwarm?.();
			zoneObserver?.disconnect();
			for (const t of pendingZoneTimers.values()) clearTimeout(t);
		};
	});
</script>

<!-- ACT 1: Pure ASCII Sharingan -> Itachi Mangekyou -> Shatters into 16 Agent Cursors -> Blackout -->
{#if stage === 'sharingan'}
	<SharinganIntro onComplete={handleSharinganComplete} />
{/if}

<!-- CHOREOGRAPHED MULTI-AGENT SWARM OVERLAY -->
<SwarmOverlay cursors={activeCursors} />

<!-- ULTRA-MINIMAL VSCODE WORKSPACE (Dissolves smoothly into Fullscreen Scroll-Scrubbed Terminal -> Octocat Portal Dive -> GitHub Overview!) -->
<div
	class="vscode-shell"
	class:theme-light={isLightTheme}
	class:deploy-active={isDeployActive}
	data-theme={heroTheme}
	style="{shellCameraStyle} --vscode-chrome-opacity: {vscodeChromeOpacity.toFixed(3)};"
>
	<div class="vscode-workbench">
		{#if sidebarOpen}
			<aside
				class="explorer-sidebar"
				data-swarm-part="shell-explorer"
				data-swarm-built={isPartBuilt('shell-explorer') ? 'true' : undefined}
				aria-label="Explorer"
			>
				<div class="explorer-header">
					<span>EXPLORER</span>
					<button
						type="button"
						class="subtle-icon-btn"
						onclick={() => (sidebarOpen = false)}
						title="Hide Explorer"
						aria-label="Hide Explorer"
					>
						<VsIcons name="sidebar-left" size={14} color="#858585" />
					</button>
				</div>

				<div class="explorer-section">
					<button
						type="button"
						class="section-header-btn"
						onclick={() => (rootFolderOpen = !rootFolderOpen)}
					>
						<VsIcons
							name={rootFolderOpen ? 'chevron-down' : 'chevron-right'}
							size={16}
							color={isLightTheme ? '#475569' : '#cccccc'}
						/>
						<span class="workspace-title">PaperX</span>
					</button>

					{#if rootFolderOpen}
						<div class="file-list" role="tree">
							{#each PORTFOLIO_FILES as file, idx (file.id)}
								{@const liveName = explorerLabels[idx]}
								{@const liveIcon = resolveIconByExtension(liveName)}
								<button
									type="button"
									role="treeitem"
									aria-selected={activeSection === file.id}
									class="tree-file-row"
									class:selected={activeSection === file.id}
									data-swarm-part="exp-file-{idx}"
									data-swarm-built={isPartBuilt(`exp-file-${idx}`) ? 'true' : undefined}
									onclick={() => navigateToSection(file.id)}
								>
									<span class="file-icon-wrap" data-icon-type={liveIcon}>
										<VsIcons name={liveIcon} size={16} />
									</span>
									<span class="file-label">{liveName}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</aside>
		{/if}

		<!-- VS Code Editor Group -->
		<div class="editor-group">
			<!-- Clean 35px VS Code Tabs Bar -->
			<div
				class="tabs-bar"
				data-swarm-part="shell-tabs"
				data-swarm-built={isPartBuilt('shell-tabs') ? 'true' : undefined}
				role="tablist"
			>
				{#if !sidebarOpen}
					<button
						type="button"
						class="tab-sidebar-toggle"
						onclick={() => (sidebarOpen = true)}
						title="Show Explorer"
						aria-label="Show Explorer"
					>
						<VsIcons name="sidebar-left" size={14} color={isLightTheme ? '#475569' : '#cccccc'} />
					</button>
				{/if}

				<div class="tabs-strip">
					{#each PORTFOLIO_FILES as tab, idx (tab.id)}
						{@const liveTabName = tabLabels[idx]}
						{@const liveTabIcon = resolveIconByExtension(liveTabName)}
						<button
							type="button"
							role="tab"
							aria-selected={activeSection === tab.id}
							class="vscode-tab"
							class:active={activeSection === tab.id}
							data-swarm-part="tab-file-{idx}"
							data-swarm-built={isPartBuilt(`tab-file-${idx}`) ? 'true' : undefined}
							onclick={() => navigateToSection(tab.id)}
						>
							<VsIcons name={liveTabIcon} size={15} />
							<span class="tab-label">{liveTabName}</span>
						</button>
					{/each}
				</div>

				<div class="tabs-actions">
					<button
						type="button"
						class="tab-theme-pill"
						onclick={toggleHeroTheme}
						title={isLightTheme ? 'Switch to Dark Crimson Mode' : 'Switch to Light Cobalt Mode'}
						aria-label="Toggle site theme"
					>
						<VsIcons
							name={isLightTheme ? 'moon' : 'sun'}
							size={13}
							color={isLightTheme ? '#1a2ffb' : '#facc15'}
						/>
						<span>{isLightTheme ? 'Dark' : 'Light'}</span>
					</button>

					<button
						type="button"
						class="subtle-icon-btn"
						onclick={replayFullIntro}
						title="Replay Sharingan & Swarm Intro"
						aria-label="Replay Intro"
					>
						<VsIcons name="replay" size={14} color={isLightTheme ? '#475569' : '#9d9d9d'} />
					</button>
				</div>
			</div>

			<!-- Main Scrollable Portfolio Viewport (Lenis Inertial Smooth Scroll + Hidden Scrollbar + Seamless Cross-Fade) -->
			<main bind:this={editorScrollEl} onscroll={handleEditorScroll} class="editor-viewport">
				<div bind:this={editorContentEl} class="editor-content">
					<div
						bind:this={heroWrapperEl}
						id="section-hero"
						class="section-anchor"
						style="--sec-opacity: {sectionOpacity['hero.svelte']}"
					>
						<HeroScene
							{heroTheme}
							playIntro={stage === 'paperx-intro'}
							isResetting={stage === 'sharingan'}
							introTrigger={paperXIntroTrigger}
							onZoomOutProgress={(p) => (shellZoomOutProgress = p)}
							onIntroComplete={handlePaperXIntroComplete}
							onToggleTheme={toggleHeroTheme}
							onReplayIntro={replayFullIntro}
						/>
					</div>

					<div
						bind:this={readmeWrapperEl}
						id="section-readme"
						class="section-anchor"
						style="--sec-opacity: {sectionOpacity['README.md']}"
					>
						<PersonaAbout theme={heroTheme} scrollContainer={editorScrollEl} />
					</div>

					<div
						bind:this={productWrapperEl}
						id="section-product"
						class="section-anchor"
						style="--sec-opacity: {sectionOpacity['PRODUCT.md']}"
					>
						<ProjectsShowcase
							theme={heroTheme}
							scrollContainer={editorScrollEl}
							scrollY={editorScrollTop}
							onScrollToElement={scrollToElementSmooth}
						/>
					</div>

					<div
						bind:this={envWrapperEl}
						id="section-env"
						class="section-anchor"
						style="--sec-opacity: {sectionOpacity['.env']}"
					>
						<EnvContact theme={heroTheme} />
					</div>

					<!-- 100% CONTINUOUS SCROLL TRACK: Drives VS Code Dissolve -> Fullscreen Terminal git push -> GitHub Overview! -->
					<div
						bind:this={deployTrackEl}
						id="section-deploy-track"
						class="deploy-scroll-track"
						aria-hidden="true"
					></div>
				</div>
			</main>
		</div>
	</div>

	<!-- Minimal 22px VS Code Status Bar (Pure Svelte Language Mode!) -->
	<footer
		class="vscode-statusbar"
		data-swarm-part="shell-status"
		data-swarm-built={isPartBuilt('shell-status') ? 'true' : undefined}
	>
		<div class="status-left">
			<span class="status-remote">
				<VsIcons name="git-branch" size={12} color="#ffffff" />
				<span>main*</span>
			</span>
		</div>

		<div class="status-right">
			<span class="status-entry">UTF-8</span>
			<span class="status-entry">
				{activeSection.endsWith('.svelte')
					? 'Svelte'
					: activeSection.endsWith('.md')
						? 'Markdown'
						: 'Properties'}
			</span>
			<span class="status-entry">PaperX (Film)</span>
		</div>
	</footer>
</div>

<!-- ACT 4C-BACKDROP (z:75): 1:1 GITHUB OVERVIEW ONLY + REAL GEMINI/CHATGPT + CLAUDE CLAWD
     Mounted directly BEHIND the Octocat Cosmic Portal Wall: enters dreamy blurred (18px) -> smoothly racks focus to crystal sharp! -->
{#if githubMounted}
	<GithubProfileFinale
		theme={heroTheme}
		opacity={githubOpacity}
		scale={githubScale}
		blurPx={githubBlurPx}
		brightness={githubBrightness}
		interactive={githubInteractive}
		onScrollUpRewind={handleGithubScrollUpRewind}
		onToggleTheme={toggleHeroTheme}
	/>
{/if}

<!-- ACT 4B (z:78): FULLSCREEN 100vw×100vh SCROLL-SCRUBBED TERMINAL (Implodes into Octocat Singularity!) -->
{#if termOpacity > 0.005}
	<ScrollPushTerminal
		theme={heroTheme}
		progress={termScrubP}
		opacity={termOpacity}
		scale={termScale}
		implodeP={termImplodeP}
	/>
{/if}

<!-- ACT 4C-PORTAL (z:82): CODE VORTEX + 3 PIXEL AI MASCOTS + RGB SHOCKWAVE + OCTOCAT PORTAL DIVE! -->
{#if showPortal}
	<GithubPortalDive theme={heroTheme} progress={portalP} />
{/if}

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	/* CORE SWARM-CURSORS RULE: Nothing appears until its cursor finishes drawing/cloning it! */
	:global([data-swarm-part]:not([data-swarm-built='true'])) {
		opacity: 0;
		pointer-events: none;
	}

	/* Live text selection highlight when cursor selects cloned text before editing */
	:global(.swarm-text-selected) {
		background: rgba(38, 79, 120, 0.92);
		color: #ffffff !important;
		border-radius: 2px;
		padding: 0 2px;
	}

	/* Live blinking typing caret while cursor types characters */
	:global(.swarm-typing-caret::after) {
		content: '';
		display: inline-block;
		width: 2px;
		height: 0.92em;
		background: #ff2a4b;
		margin-left: 2px;
		vertical-align: -0.08em;
		animation: swarmCaretBlink 0.55s steps(2) infinite;
	}

	@keyframes swarmCaretBlink {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	:global(html, body) {
		margin: 0;
		padding: 0;
		background: #000000;
		color: #cccccc;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'LINE Seed Sans TH',
			sans-serif;
		overflow: hidden;
		height: 100%;
	}

	.vscode-shell {
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		background: #000000;
		overflow: hidden;
	}

	/* Scroll-driven dissolve of VS Code workbench chrome when entering Fullscreen Terminal & Octocat Portal */
	.explorer-sidebar,
	.tabs-bar,
	.vscode-statusbar {
		transition: opacity 0.14s linear;
	}

	.vscode-shell.deploy-active .explorer-sidebar,
	.vscode-shell.deploy-active .tabs-bar,
	.vscode-shell.deploy-active .vscode-statusbar {
		opacity: var(--vscode-chrome-opacity, 1) !important;
		pointer-events: none;
	}

	.deploy-scroll-track {
		width: 100%;
		height: 600vh;
		background: #040508;
		pointer-events: none;
	}

	.vscode-shell.theme-light .deploy-scroll-track {
		background: #f0f1fa;
	}

	.vscode-workbench {
		flex: 1;
		display: flex;
		overflow: hidden;
		min-height: 0;
	}

	/* Minimal VS Code Explorer Sidebar (206px) */
	.explorer-sidebar {
		width: 206px;
		background: #181818;
		border-right: 1px solid #2b2b2b;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		user-select: none;
	}

	@media (max-width: 760px) {
		.explorer-sidebar {
			position: absolute;
			top: 0;
			bottom: 22px;
			left: 0;
			z-index: 60;
			box-shadow: 8px 0 24px rgba(0, 0, 0, 0.7);
		}
	}

	.explorer-header {
		height: 35px;
		padding: 0 10px 0 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
		letter-spacing: 0.04em;
		color: #bbbbbb;
		border-bottom: 1px solid #222222;
	}

	.subtle-icon-btn {
		cursor: pointer;
		width: 24px;
		height: 24px;
		border: none;
		background: transparent;
		border-radius: 4px;
		display: grid;
		place-items: center;
	}

	.subtle-icon-btn:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.explorer-section {
		display: flex;
		flex-direction: column;
		padding-top: 4px;
	}

	.section-header-btn {
		cursor: pointer;
		height: 22px;
		width: 100%;
		border: none;
		background: transparent;
		color: #cccccc;
		padding: 0 8px 0 2px;
		display: flex;
		align-items: center;
		gap: 2px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-align: left;
	}

	.file-list {
		display: flex;
		flex-direction: column;
	}

	.tree-file-row {
		cursor: pointer;
		height: 24px;
		width: 100%;
		border: none;
		background: transparent;
		color: #cccccc;
		padding: 0 12px 0 22px;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		text-align: left;
	}

	.tree-file-row:hover {
		background: #2a2d2e;
	}

	.tree-file-row.selected {
		background: #37373d;
		color: #ffffff;
	}

	.file-icon-wrap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.file-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* EDITOR GROUP */
	.editor-group {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		background: #000000;
	}

	/* Clean 35px VS Code Tabs Bar */
	.tabs-bar {
		height: 35px;
		background: #181818;
		border-bottom: 1px solid #2b2b2b;
		display: flex;
		align-items: center;
		flex-shrink: 0;
		user-select: none;
	}

	.tab-sidebar-toggle {
		cursor: pointer;
		width: 35px;
		height: 35px;
		border: none;
		border-right: 1px solid #2b2b2b;
		background: #181818;
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.tab-sidebar-toggle:hover {
		background: #222222;
	}

	.tabs-strip {
		display: flex;
		overflow-x: auto;
		flex: 1;
		height: 100%;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.tabs-strip::-webkit-scrollbar {
		height: 0;
		display: none;
	}

	.vscode-tab {
		cursor: pointer;
		height: 35px;
		border: none;
		border-right: 1px solid #2b2b2b;
		background: #181818;
		color: #9d9d9d;
		padding: 0 14px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		white-space: nowrap;
		position: relative;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.vscode-tab {
			padding: 0 9px;
			font-size: 11.5px;
			gap: 4px;
		}
	}

	.vscode-tab:hover {
		background: #1f1f1f;
		color: #cccccc;
	}

	.vscode-tab.active {
		background: #1f1f1f;
		color: #ffffff;
		border-top: 1px solid #ff3e00;
	}

	.tabs-actions {
		padding: 0 8px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.tab-theme-pill {
		cursor: pointer;
		height: 22px;
		padding: 0 9px;
		border-radius: 999px;
		border: 1px solid #303038;
		background: #222229;
		color: #e2e8f0;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 11px;
		font-weight: 500;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease;
	}

	.tab-theme-pill:hover {
		border-color: #e60012;
		color: #ffffff;
	}

	/* MAIN SCROLLABLE VIEWPORT — Lenis Inertial Glide + Completely Hidden Scrollbar */
	.editor-viewport {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		position: relative;
		background: #000000;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.editor-viewport::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
	}

	.editor-content {
		width: 100%;
		will-change: transform;
	}

	.section-anchor {
		opacity: var(--sec-opacity, 1);
		transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1);
		will-change: opacity;
	}

	/* Minimal 22px VS Code Status Bar */
	.vscode-statusbar {
		height: 22px;
		background: #181818;
		border-top: 1px solid #2b2b2b;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 10px 0 0;
		font-size: 12px;
		color: #cccccc;
		flex-shrink: 0;
		user-select: none;
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 14px;
		height: 100%;
	}

	.status-remote {
		height: 100%;
		background: #0078d4;
		color: #ffffff;
		padding: 0 10px;
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}

	.status-entry {
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.status-right {
			display: none;
		}
	}

	/* =====================================================================
	   VS CODE LIGHT MODERN SHELL (Lusion Off-White + Cobalt #1a2ffb)
	   ===================================================================== */
	.vscode-shell.theme-light {
		background: #f0f1fa;
		color: #1f2328;
	}

	.vscode-shell.theme-light .explorer-sidebar {
		background: #f6f7fc;
		border-right-color: #dce0ef;
	}

	.vscode-shell.theme-light .explorer-header {
		color: #525970;
		border-bottom-color: #e4e7f3;
	}

	.vscode-shell.theme-light .subtle-icon-btn:hover {
		background: rgba(26, 47, 251, 0.08);
	}

	.vscode-shell.theme-light .section-header-btn {
		color: #1e2433;
	}

	.vscode-shell.theme-light .tree-file-row {
		color: #363d52;
	}

	.vscode-shell.theme-light .tree-file-row:hover {
		background: #eaeef9;
	}

	.vscode-shell.theme-light .tree-file-row.selected {
		background: rgba(26, 47, 251, 0.11);
		color: #1a2ffb;
		font-weight: 600;
	}

	.vscode-shell.theme-light .editor-group,
	.vscode-shell.theme-light .editor-viewport {
		background: #f0f1fa;
	}

	.vscode-shell.theme-light .tabs-bar {
		background: #f6f7fc;
		border-bottom-color: #dce0ef;
	}

	.vscode-shell.theme-light .tab-sidebar-toggle {
		background: #f6f7fc;
		border-right-color: #dce0ef;
	}

	.vscode-shell.theme-light .tab-sidebar-toggle:hover {
		background: #eaeef9;
	}

	.vscode-shell.theme-light .vscode-tab {
		background: #f6f7fc;
		border-right-color: #e2e6f2;
		color: #646c84;
	}

	.vscode-shell.theme-light .vscode-tab:hover {
		background: #eef0fa;
		color: #1e2433;
	}

	.vscode-shell.theme-light .vscode-tab.active {
		background: #ffffff;
		color: #0f172a;
		border-top-color: #1a2ffb;
	}

	.vscode-shell.theme-light .tab-theme-pill {
		background: #ffffff;
		border-color: #d4daf0;
		color: #1e2433;
	}

	.vscode-shell.theme-light .tab-theme-pill:hover {
		border-color: #1a2ffb;
		color: #1a2ffb;
	}

	.vscode-shell.theme-light .vscode-statusbar {
		background: #f6f7fc;
		border-top-color: #dce0ef;
		color: #475569;
	}

	.vscode-shell.theme-light .status-remote {
		background: #1a2ffb;
		color: #ffffff;
	}
</style>
