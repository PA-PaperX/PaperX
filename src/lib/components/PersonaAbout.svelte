<script lang="ts">
	import { onMount } from 'svelte';
	import { PROFILE_DATA, COMPETITION_HONOR } from '$lib/data/portfolio';
	import VsIcons from '$lib/components/VsIcons.svelte';
	import BrandIcons from '$lib/components/BrandIcons.svelte';
	import { isPartBuilt } from '$lib/swarm/state.svelte';

	interface Props {
		theme?: 'dark' | 'light';
		scrollContainer?: HTMLElement;
	}

	let { theme = 'dark', scrollContainer }: Props = $props();
	let isLight = $derived(theme === 'light');

	let bioHidden = $state(false);
	let imgFailed = $state(false);
	let hoveredSkillIdx = $state<number | null>(null);
	let pinnedSkillIdx = $state<number | null>(null);
	let activeSkillIdx = $derived(hoveredSkillIdx ?? pinnedSkillIdx);
	let starBgCanvas: HTMLCanvasElement | undefined = $state();

	// Below-skills scroll-triggered Competition Honors animation & in-page poster lightbox
	let honorSectionEl: HTMLElement | undefined = $state();
	let honorRevealed = $state(false);
	let posterZoomOpen = $state(false);

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) node.parentNode.removeChild(node);
			}
		};
	}

	function togglePinSkill(idx: number) {
		pinnedSkillIdx = pinnedSkillIdx === idx ? null : idx;
	}

	function toRansomTiles(word: string) {
		return word.split('').map((ch, i) => ({
			ch,
			rot: (i % 2 === 0 ? -1 : 1) * (2.2 + ((i * 3) % 4)),
			variant: i % 3 === 0 ? 'crimson' : i % 3 === 1 ? 'white' : 'black',
			scale: i === 0 ? 1.1 : 1
		}));
	}

	const characterTiles = toRansomTiles('CHARACTER');
	const nameTiles = toRansomTiles('FILM');
	const codenameTiles = toRansomTiles('PAPERX');

	const radarCenter = 120;
	const radarRadius = 80;

	function getPoint(idx: number, total: number, radiusScale: number) {
		const angle = (Math.PI * 2 * idx) / total - Math.PI / 2;
		const r = radarRadius * radiusScale;
		return {
			x: radarCenter + Math.cos(angle) * r,
			y: radarCenter + Math.sin(angle) * r
		};
	}

	const outerPoints = PROFILE_DATA.stats
		.map((_, i) => {
			const p = getPoint(i, 5, 1);
			return `${p.x},${p.y}`;
		})
		.join(' ');

	const midPoints = PROFILE_DATA.stats
		.map((_, i) => {
			const p = getPoint(i, 5, 0.65);
			return `${p.x},${p.y}`;
		})
		.join(' ');

	const statPolygon = PROFILE_DATA.stats
		.map((s, i) => {
			const p = getPoint(i, 5, s.score / 100);
			return `${p.x},${p.y}`;
		})
		.join(' ');

	// Authentic p5x-sea.com background star field recreation (p5x_bgstar_20230301.mp4):
	// 15 overlapping stationary tilted 5-pointed stars with concentric dark-grey / black star zebra bands
	// radiating continuously outward from each star's center on a seamless ~2.0s loop.
	const P5_STARS = [
		{ x: 0.08, y: 0.14, r: 195, rot: -0.28, phase: 0.0 },
		{ x: 0.28, y: 0.09, r: 155, rot: 0.18, phase: 0.25 },
		{ x: 0.52, y: 0.15, r: 230, rot: -0.14, phase: 0.5 },
		{ x: 0.78, y: 0.12, r: 185, rot: 0.32, phase: 0.75 },
		{ x: 0.95, y: 0.26, r: 210, rot: -0.22, phase: 0.15 },
		{ x: 0.14, y: 0.45, r: 245, rot: 0.24, phase: 0.4 },
		{ x: 0.4, y: 0.42, r: 190, rot: -0.35, phase: 0.65 },
		{ x: 0.66, y: 0.48, r: 240, rot: 0.12, phase: 0.9 },
		{ x: 0.9, y: 0.58, r: 205, rot: -0.18, phase: 0.3 },
		{ x: 0.06, y: 0.78, r: 215, rot: -0.1, phase: 0.55 },
		{ x: 0.31, y: 0.76, r: 235, rot: 0.29, phase: 0.8 },
		{ x: 0.56, y: 0.84, r: 200, rot: -0.24, phase: 0.1 },
		{ x: 0.82, y: 0.86, r: 225, rot: 0.16, phase: 0.45 },
		{ x: 0.46, y: 0.66, r: 160, rot: 0.4, phase: 0.7 }
	];

	// Pre-compute unit (cos, sin) 10-vertex tables for each star ONCE (eliminates ~2,100 trig calls per frame!)
	const P5_STAR_VECS = P5_STARS.map((s) => {
		const pts: { ux: number; uy: number }[] = [];
		for (let i = 0; i < 10; i++) {
			const mult = i % 2 === 0 ? 1 : 0.42;
			const a = (i * Math.PI) / 5 - Math.PI / 2 + s.rot;
			pts.push({ ux: Math.cos(a) * mult, uy: Math.sin(a) * mult });
		}
		return { ...s, pts };
	});

	function tracePrecomputedStar(
		ctx: CanvasRenderingContext2D,
		cx: number,
		cy: number,
		outerR: number,
		pts: { ux: number; uy: number }[]
	) {
		ctx.beginPath();
		for (let i = 0; i < 10; i++) {
			const p = pts[i];
			const x = cx + p.ux * outerR;
			const y = cy + p.uy * outerR;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
	}

	$effect(() => {
		const target = honorSectionEl;
		const root = scrollContainer ?? null;
		if (!target) return;

		const obs = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						honorRevealed = true;
					}
				}
			},
			{ root, threshold: 0.16 }
		);
		obs.observe(target);
		return () => obs.disconnect();
	});

	onMount(() => {
		if (!starBgCanvas) return;
		const ctx = starBgCanvas.getContext('2d');
		if (!ctx) return;

		let animId = 0;
		let isSectionVisible = true;
		const PERIOD_MS = 2100; // Matches p5x_bgstar ~2s seamless cycle
		const BAND_STEP = 34; // One full dark+charcoal ring pair

		const resize = () => {
			if (!starBgCanvas) return;
			const rect = starBgCanvas.getBoundingClientRect();
			const capDpr = rect.width < 768 ? 1.2 : 1.5;
			const dpr = Math.min(window.devicePixelRatio || 1, capDpr);
			starBgCanvas.width = Math.max(1, Math.round(rect.width * dpr));
			starBgCanvas.height = Math.max(1, Math.round(rect.height * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();

		const ro = new ResizeObserver(resize);
		ro.observe(starBgCanvas);

		const renderStars = (now: number) => {
			if (!starBgCanvas || !isSectionVisible) {
				animId = 0;
				return;
			}
			const w = starBgCanvas.clientWidth;
			const h = starBgCanvas.clientHeight;
			const scaleFactor = Math.max(0.68, Math.min(1.25, w / 1100));

			const lightMode = theme === 'light';

			// Base canvas fill: pure black (Persona 5 Dark) or pale lavender (Lusion / Persona 3 Light)
			ctx.fillStyle = lightMode ? '#f0f1fa' : '#000000';
			ctx.fillRect(0, 0, w, h);

			const tGlobal = (now % PERIOD_MS) / PERIOD_MS;

			for (const s of P5_STAR_VECS) {
				const cx = s.x * w;
				const cy = s.y * h;
				const maxR = s.r * scaleFactor;
				const phaseT = (tGlobal + s.phase) % 1;
				const offset = phaseT * BAND_STEP;

				ctx.save();
				// Clip inside this stationary 5-pointed star silhouette
				tracePrecomputedStar(ctx, cx, cy, maxR, s.pts);
				ctx.clip();

				// Fill base inside star
				ctx.fillStyle = lightMode ? '#e8ecfa' : '#070709';
				ctx.fillRect(cx - maxR, cy - maxR, maxR * 2, maxR * 2);

				// Draw concentric 5-pointed star zebra bands from outside inward so each smaller band cleanly masks inside
				const ringCount = Math.ceil((maxR + BAND_STEP) / (BAND_STEP / 2)) + 2;
				for (let k = ringCount; k >= 0; k--) {
					const radius = k * (BAND_STEP / 2) + offset;
					if (radius <= 0 || radius > maxR + BAND_STEP) continue;
					tracePrecomputedStar(ctx, cx, cy, radius, s.pts);
					if (lightMode) {
						ctx.fillStyle = k % 2 === 0 ? '#dce2f8' : '#f4f6fe';
					} else {
						ctx.fillStyle = k % 2 === 0 ? '#1b1b20' : '#060608';
					}
					ctx.fill();
				}

				ctx.restore();
			}

			animId = requestAnimationFrame(renderStars);
		};

		// Automatically pause offscreen canvas loop when user scrolls past README.md
		const visObs = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					isSectionVisible = entry.isIntersecting;
					if (isSectionVisible && !animId) {
						animId = requestAnimationFrame(renderStars);
					}
				}
			},
			{ threshold: 0.01 }
		);
		visObs.observe(starBgCanvas);

		animId = requestAnimationFrame(renderStars);

		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && posterZoomOpen) posterZoomOpen = false;
		};
		window.addEventListener('keydown', handleKey);

		return () => {
			cancelAnimationFrame(animId);
			ro.disconnect();
			visObs.disconnect();
			window.removeEventListener('keydown', handleKey);
		};
	});
</script>

<section
	class="p5-section"
	class:theme-light={isLight}
	data-theme={theme}
	aria-label="README.md Persona Character Profile"
>
	<!-- Authentic p5x-sea.com Animated Radiating Concentric 5-Pointed Star Field -->
	<canvas bind:this={starBgCanvas} class="p5-star-canvas" aria-hidden="true"></canvas>

	<!-- Seamless Top & Bottom Atmospheric Cross-Fade Feathers (No Hard Seams) -->
	<div class="p5-top-fade" aria-hidden="true"></div>
	<div class="p5-bottom-fade" aria-hidden="true"></div>

	<!-- Jagged Lightning Ribbon Slash + Halftone Dots (Crimson in Dark / Cobalt in Light) -->
	<svg
		class="p5-crimson-slash"
		data-swarm-part="p5-slash"
		data-swarm-built={isPartBuilt('p5-slash') ? 'true' : undefined}
		viewBox="0 0 1440 900"
		preserveAspectRatio="none"
		aria-hidden="true"
	>
		<defs>
			<pattern id="p5-halftone" width="12" height="12" patternUnits="userSpaceOnUse">
				<circle
					cx="4"
					cy="4"
					r="2.2"
					fill={isLight ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.3)'}
				/>
			</pattern>
		</defs>
		<polygon
			points="0,45 430,0 350,240 890,120 710,470 1440,280 1440,590 830,630 1120,900 540,900 620,570 110,690 260,340 0,390"
			fill="#ffffff"
			opacity={isLight ? '0.68' : '0.12'}
		/>
		<polygon
			points="0,70 400,15 320,255 860,145 680,485 1440,310 1440,560 800,610 1080,900 570,900 645,550 145,665 280,325 0,365"
			fill={isLight ? '#1a2ffb' : '#e60012'}
		/>
		<polygon
			points="0,70 400,15 320,255 860,145 680,485 1440,310 1440,560 800,610 1080,900 570,900 645,550 145,665 280,325 0,365"
			fill="url(#p5-halftone)"
		/>
	</svg>

	<div class="p5-stage">
		<!-- LEFT COLUMN: Film (PaperX) Character Cutout -->
		<div class="p5-character-col">
			<div
				class="codename-plate"
				data-swarm-part="p5-codename"
				data-swarm-built={isPartBuilt('p5-codename') ? 'true' : undefined}
			>
				<span class="cn-small">CODE NAME</span>
				<div class="ransom-row small">
					{#each codenameTiles as tile}
						<span
							class="ransom-tile {tile.variant}"
							style="transform: rotate({tile.rot}deg) scale({tile.scale})"
						>
							{tile.ch}
						</span>
					{/each}
				</div>
			</div>

			<div class="character-cutout-frame">
				<div
					class="portrait-unit"
					data-swarm-part="p5-portrait"
					data-swarm-built={isPartBuilt('p5-portrait') ? 'true' : undefined}
				>
					<div class="cutout-backing-red"></div>
					<div class="cutout-backing-white"></div>

					<div class="portrait-card">
						{#if !imgFailed}
							<img
								src={PROFILE_DATA.avatarUrl}
								alt="Film (PaperX) — Chief Technology Officer at Hamster Software House"
								class="character-img"
								onerror={() => (imgFailed = true)}
							/>
						{:else}
							<div class="fallback-avatar">
								<span class="fallback-name">FILM // PAPERX</span>
							</div>
						{/if}
						<div class="portrait-halftone"></div>
					</div>
				</div>

				<div
					class="role-banner"
					data-swarm-part="p5-role"
					data-swarm-built={isPartBuilt('p5-role') ? 'true' : undefined}
				>
					<span class="role-position">CHIEF TECHNOLOGY OFFICER (CTO)</span>
					<a
						href={PROFILE_DATA.companyUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="role-company"
					>
						<span>HAMSTER SOFTWARE HOUSE CO., LTD.</span>
						<VsIcons name="external" size={12} color={isLight ? '#1a2ffb' : '#ff2a4b'} />
					</a>
				</div>
			</div>
		</div>

		<!-- RIGHT COLUMN: P5X Ransom Headers, Skewed Trapezoid Bio Box, 5-Star Radar & Minimal Icon+Text Skills -->
		<div class="p5-info-col">
			<div class="p5-headers">
				<div
					class="ransom-word character-header"
					data-swarm-part="p5-header-char"
					data-swarm-built={isPartBuilt('p5-header-char') ? 'true' : undefined}
					aria-label="CHARACTER"
				>
					<svg class="p5-star-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path
							d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z"
							fill="#ffffff"
						/>
					</svg>
					{#each characterTiles as tile}
						<span
							class="ransom-tile {tile.variant}"
							style="transform: rotate({tile.rot}deg) scale({tile.scale})"
						>
							{tile.ch}
						</span>
					{/each}
				</div>

				<div
					class="name-row"
					data-swarm-part="p5-header-film"
					data-swarm-built={isPartBuilt('p5-header-film') ? 'true' : undefined}
				>
					<div class="ransom-word film-header" aria-label="FILM">
						{#each nameTiles as tile}
							<span
								class="ransom-tile lg {tile.variant}"
								style="transform: rotate({tile.rot}deg) scale({tile.scale})"
							>
								{tile.ch}
							</span>
						{/each}
					</div>

					<div class="alias-stamp">
						<span class="alias-top">ALIAS</span>
						<span class="alias-main">PaperX</span>
					</div>
				</div>
			</div>

			<div
				class="bio-trapezoid-wrapper"
				data-swarm-part="p5-bio-box"
				data-swarm-built={isPartBuilt('p5-bio-box') ? 'true' : undefined}
			>
				<button
					type="button"
					class="p5-hide-btn"
					onclick={() => (bioHidden = !bioHidden)}
					aria-expanded={!bioHidden}
				>
					{bioHidden ? '+ Show' : 'HiDE'}
				</button>

				<!-- Keep DOM mounted with class:collapsed + reactive data-swarm-built so reopening NEVER vanishes -->
				<div class="p5-trapezoid-box" class:bio-collapsed={bioHidden}>
					<div class="trapezoid-halftone"></div>
					<p
						class="p5-tagline"
						data-swarm-part="p5-bio-tagline"
						data-swarm-built={isPartBuilt('p5-bio-tagline') ? 'true' : undefined}
					>
						{PROFILE_DATA.tagline}
					</p>
					{#each PROFILE_DATA.bioParagraphs as para, pIdx}
						<p
							class="p5-bio-text"
							data-swarm-part="p5-bio-p{pIdx}"
							data-swarm-built={isPartBuilt(`p5-bio-p${pIdx}`) ? 'true' : undefined}
						>
							{para}
						</p>
					{/each}
				</div>
			</div>

			<!-- Bottom Row: 5-Point Star Radar + Minimal Icon & Text Skill Strips -->
			<div class="p5-stats-and-skills">
				<div
					class="p5-radar-card"
					data-swarm-part="p5-radar"
					data-swarm-built={isPartBuilt('p5-radar') ? 'true' : undefined}
				>
					<div class="card-skew-title">
						<span>PARAMETER STATS</span>
					</div>
					<svg viewBox="-24 -10 288 260" class="radar-svg">
						<polygon
							points={outerPoints}
							fill={isLight ? 'rgba(26, 47, 251, 0.07)' : 'rgba(230, 0, 18, 0.08)'}
							stroke={isLight ? 'rgba(15, 23, 42, 0.28)' : 'rgba(255, 255, 255, 0.35)'}
							stroke-width="1.5"
						/>
						<polygon
							points={midPoints}
							fill="none"
							stroke={isLight ? 'rgba(15, 23, 42, 0.14)' : 'rgba(255, 255, 255, 0.16)'}
							stroke-dasharray="3 3"
							stroke-width="1"
						/>
						{#each PROFILE_DATA.stats as _, idx}
							{@const pt = getPoint(idx, 5, 1)}
							<line
								x1={radarCenter}
								y1={radarCenter}
								x2={pt.x}
								y2={pt.y}
								stroke={isLight ? 'rgba(15, 23, 42, 0.18)' : 'rgba(255, 255, 255, 0.2)'}
								stroke-width="1"
							/>
						{/each}
						<polygon
							points={statPolygon}
							fill={isLight ? 'rgba(26, 47, 251, 0.36)' : 'rgba(230, 0, 18, 0.55)'}
							stroke={isLight ? '#1a2ffb' : '#ff2a4b'}
							stroke-width="2.5"
						/>
						{#each PROFILE_DATA.stats as stat, idx}
							{@const labelPt = getPoint(idx, 5, 1.24)}
							{@const dotPt = getPoint(idx, 5, stat.score / 100)}
							<circle
								cx={dotPt.x}
								cy={dotPt.y}
								r="4"
								fill="#ffffff"
								stroke={isLight ? '#1a2ffb' : '#e60012'}
								stroke-width="2"
							/>
							<text
								x={labelPt.x}
								y={labelPt.y}
								text-anchor="middle"
								dominant-baseline="middle"
								class="radar-label"
							>
								{stat.short} {stat.score}
							</text>
						{/each}
					</svg>
				</div>

				<!-- Persona 5 Battle Command Skill Menu: Compact [Symbol + Text] idle -> Hover expands like preparing a P5 Skill! -->
				<div
					class="p5-command-menu"
					class:has-active={activeSkillIdx !== null}
					data-swarm-part="p5-skills-wrap"
					data-swarm-built={isPartBuilt('p5-skills-wrap') ? 'true' : undefined}
					onmouseleave={() => (hoveredSkillIdx = null)}
					role="menu"
					tabindex="-1"
					aria-label="Persona 5 Skills Command Menu"
				>
					{#each PROFILE_DATA.skillGroups as group, gIdx (group.title)}
						{@const isExpanded = activeSkillIdx === gIdx}
						<div
							class="p5-cmd-item"
							class:expanded={isExpanded}
							class:dimmed={activeSkillIdx !== null && !isExpanded}
							data-swarm-part="p5-skill-row-{gIdx}"
							data-swarm-built={isPartBuilt(`p5-skill-row-${gIdx}`) ? 'true' : undefined}
							onmouseenter={() => (hoveredSkillIdx = gIdx)}
							role="menuitem"
							tabindex="0"
							onfocus={() => (hoveredSkillIdx = gIdx)}
							onblur={() => (hoveredSkillIdx = null)}
							onclick={() => togglePinSkill(gIdx)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									togglePinSkill(gIdx);
								}
							}}
						>
							<!-- Persona Jagged Battle Selector Pointer -->
							<div class="p5-cmd-pointer" aria-hidden="true">
								<svg width="16" height="18" viewBox="0 0 16 18" fill="none">
									<polygon points="0,1 16,9 2,17 5,9" fill={isLight ? '#0f172a' : '#ffffff'} />
									<polygon points="2,4 13,9 3,14 5,9" fill={isLight ? '#1a2ffb' : '#e60012'} />
								</svg>
							</div>

							<div class="p5-cmd-surface">
								<!-- Compact Command Bar: Symbol + Category Name -->
								<div class="p5-cmd-head">
									<div class="strip-left">
										<div class="strip-cat-icon">
											<BrandIcons name={group.icon} size={18} />
										</div>
										<span class="strip-cat-title">{group.title}</span>
									</div>

									<div class="cmd-right-cue">
										<span class="cmd-ready-tag">{isExpanded ? 'SKILL READY' : `${group.items.length} SKILLS`}</span>
										<span class="cmd-chevron" aria-hidden="true">
											<VsIcons name={isExpanded ? 'chevron-down' : 'chevron-right'} size={14} color="currentColor" />
										</span>
									</div>
								</div>

								<!-- Smoothly Expanding Persona 5 Skill Drawer (Reveals Brand SVG Icon + Text Pills on Hover!) -->
								<div class="p5-cmd-drawer">
									<div class="p5-cmd-drawer-inner">
										<div class="strip-pills">
											{#each group.items as skill, sIdx (skill.name)}
												<span
													class="skill-pill"
													style="--pill-delay: {sIdx * 42}ms"
												>
													<BrandIcons name={skill.icon} size={15} />
													<span class="pill-text">{skill.name}</span>
												</span>
											{/each}
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- DEDICATED FULL-WIDTH ANIMATED COMPETITION HONORS SHOWCASE (Scroll down past Skills -> Real Award Poster + Year!) -->
	<div
		bind:this={honorSectionEl}
		class="p5-honor-stage"
		class:revealed={honorRevealed}
		aria-label="National Skill Competition Honors"
	>
		<div class="honor-slash-rule" aria-hidden="true"></div>

		<div class="honor-grid">
			<!-- Left: Real Official College Award Poster Photo (Click for clean in-page zoom lightbox!) -->
			<div class="honor-poster-col">
				<button
					type="button"
					class="honor-poster-card"
					onclick={() => (posterZoomOpen = true)}
					aria-label="View full award poster"
				>
					<div class="honor-backing-accent" aria-hidden="true"></div>
					<div class="honor-backing-white" aria-hidden="true"></div>
					<div class="honor-photo-frame">
						<img
							src={COMPETITION_HONOR.posterImage}
							alt="{COMPETITION_HONOR.institution} — {COMPETITION_HONOR.title}"
							class="honor-photo-img"
						/>
					</div>
				</button>
			</div>

			<!-- Right: Giant Competition Year Stamp + Verified Medal & National Qualifier Credentials -->
			<div class="honor-info-col">
				<div class="honor-year-row">
					<div class="honor-year-stamp">
						<span class="year-label">COMPETITION YEAR</span>
						<div class="year-digits">
							<span class="year-be">{COMPETITION_HONOR.yearBe}</span>
							<span class="year-ad">/ {COMPETITION_HONOR.yearAd}</span>
						</div>
					</div>

					<div class="honor-badges-col">
						<span class="honor-medal-pill">
							<VsIcons name="trophy" size={14} color="#facc15" />
							<span>{COMPETITION_HONOR.medalBadge}</span>
						</span>
						<span class="honor-national-pill">{COMPETITION_HONOR.nationalBadge}</span>
					</div>
				</div>

				<h3 class="honor-headline">{COMPETITION_HONOR.title}</h3>
				<p class="honor-category">{COMPETITION_HONOR.category}</p>

				<div class="honor-spec-grid">
					<div class="honor-spec-row">
						<span class="spec-key">COMPETITOR</span>
						<span class="spec-val">{COMPETITION_HONOR.student}</span>
					</div>
					<div class="honor-spec-row">
						<span class="spec-key">INSTITUTION</span>
						<span class="spec-val">{COMPETITION_HONOR.institution}</span>
					</div>
					<div class="honor-spec-row">
						<span class="spec-key">EVENT &amp; DATE</span>
						<span class="spec-val">
							{COMPETITION_HONOR.event} · {COMPETITION_HONOR.dateRange} ({COMPETITION_HONOR.location})
						</span>
					</div>
					<div class="honor-spec-row">
						<span class="spec-key">TEAM &amp; ADVISOR</span>
						<span class="spec-val">
							{COMPETITION_HONOR.teammates.join(', ')} · ครูผู้ควบคุม {COMPETITION_HONOR.advisor}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Clean In-Page Fullscreen Poster Lightbox (Zero external redirect to Facebook login walls!) -->
	{#if posterZoomOpen}
		<div
			use:portal
			class="honor-lightbox"
			role="dialog"
			aria-modal="true"
			aria-label={COMPETITION_HONOR.title}
		>
			<button
				type="button"
				class="lightbox-backdrop"
				onclick={() => (posterZoomOpen = false)}
				aria-label="Close poster preview"
			></button>

			<div class="lightbox-card">
				<button
					type="button"
					class="lightbox-close"
					onclick={() => (posterZoomOpen = false)}
					aria-label="Close"
				>
					<VsIcons name="close" size={16} color="currentColor" />
				</button>
				<img
					src={COMPETITION_HONOR.posterImage}
					alt="{COMPETITION_HONOR.institution} — {COMPETITION_HONOR.title}"
					class="lightbox-img"
				/>
				<div class="lightbox-caption">
					<span>{COMPETITION_HONOR.yearBe} · {COMPETITION_HONOR.title}</span>
					<span>{COMPETITION_HONOR.institution}</span>
				</div>
			</div>
		</div>
	{/if}
</section>

<style>
	.p5-section {
		position: relative;
		width: 100%;
		min-height: 920px;
		background: #000000;
		color: #ffffff;
		overflow: hidden;
		padding: 112px 32px 124px;
	}

	/* Seamless atmospheric gradient cross-fade feathers */
	.p5-top-fade {
		position: absolute;
		inset: 0 0 auto 0;
		height: 170px;
		background: linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0.72) 48%, transparent 100%);
		z-index: 3;
		pointer-events: none;
	}

	.p5-bottom-fade {
		position: absolute;
		inset: auto 0 0 0;
		height: 180px;
		background: linear-gradient(0deg, #000000 0%, rgba(0, 0, 0, 0.78) 45%, transparent 100%);
		z-index: 3;
		pointer-events: none;
	}

	/* Authentic p5x-sea.com Radiating Concentric 5-Pointed Star Animated Canvas */
	.p5-star-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		z-index: 1;
		pointer-events: none;
	}

	.p5-crimson-slash {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 2;
		pointer-events: none;
	}

	.p5-stage {
		position: relative;
		z-index: 5;
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: minmax(250px, 315px) minmax(0, 1fr);
		gap: 32px;
		align-items: start;
	}

	@media (max-width: 1080px) {
		.p5-stage {
			grid-template-columns: 1fr;
		}
	}

	.p5-character-col {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.codename-plate {
		align-self: flex-start;
		background: #000000;
		border: 2px solid #ffffff;
		box-shadow: 6px 6px 0 #e60012;
		padding: 8px 14px;
		transform: rotate(-4deg) skewX(-8deg);
		margin-bottom: -14px;
		z-index: 10;
	}

	.cn-small {
		display: block;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 10px;
		font-weight: 700;
		color: #ff2a4b;
		letter-spacing: 0.14em;
		margin-bottom: 4px;
	}

	.character-cutout-frame {
		position: relative;
		width: 100%;
		max-width: 325px;
	}

	.portrait-unit {
		position: relative;
		width: 100%;
	}

	.cutout-backing-red {
		position: absolute;
		inset: 10px -12px -12px 12px;
		background: #e60012;
		clip-path: polygon(6% 0%, 100% 3%, 93% 100%, 0% 95%);
		z-index: 1;
	}

	.cutout-backing-white {
		position: absolute;
		inset: -6px 6px 6px -6px;
		background: #ffffff;
		clip-path: polygon(3% 2%, 98% 0%, 95% 98%, 0% 100%);
		z-index: 2;
	}

	.portrait-card {
		position: relative;
		z-index: 3;
		background: linear-gradient(165deg, #12131c 0%, #050508 60%, #2b040a 100%);
		border: 3px solid #000000;
		clip-path: polygon(4% 0%, 100% 2%, 96% 100%, 0% 97%);
		overflow: hidden;
		aspect-ratio: 4 / 5;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.character-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
		filter: contrast(1.12) saturate(1.06) drop-shadow(6px 0 0 #ffffff)
			drop-shadow(-4px 0 0 #e60012);
		transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.portrait-card:hover .character-img {
		transform: scale(1.04) rotate(-1deg);
	}

	.portrait-halftone {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(rgba(230, 0, 18, 0.22) 1.5px, transparent 0);
		background-size: 8px 8px;
		mix-blend-mode: screen;
		pointer-events: none;
	}

	.fallback-avatar {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
	}

	.fallback-name {
		font-family: 'Anton', 'LINE Seed Sans TH', sans-serif;
		font-size: 24px;
		letter-spacing: 0.1em;
	}

	.role-banner {
		position: relative;
		z-index: 6;
		margin-top: -18px;
		background: #000000;
		border: 2.5px solid #ffffff;
		box-shadow: 6px 6px 0 #e60012;
		padding: 10px 14px;
		transform: rotate(-2deg) skewX(-6deg);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.role-position {
		font-family: 'Anton', 'Space Grotesk', 'LINE Seed Sans TH', sans-serif;
		font-size: 15px;
		letter-spacing: 0.06em;
		color: #ffffff;
	}

	.role-company {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 11px;
		font-weight: 700;
		color: #ff2a4b;
		text-decoration: none;
	}

	.role-company:hover {
		color: #ffffff;
	}

	.p5-info-col {
		display: flex;
		flex-direction: column;
		gap: 22px;
	}

	.p5-headers {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.ransom-word,
	.ransom-row {
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 3px;
	}

	.p5-star-svg {
		margin-right: 6px;
		filter: drop-shadow(0 0 8px #e60012);
		animation: p5StarSpin 9s linear infinite;
	}

	@keyframes p5StarSpin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.ransom-tile {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: 'Anton', 'Bangers', 'LINE Seed Sans TH', sans-serif;
		font-size: 23px;
		line-height: 1;
		padding: 4px 7px;
		border: 2px solid #ffffff;
		box-shadow: 3px 3px 0 #000000;
		text-transform: uppercase;
	}

	.ransom-row.small .ransom-tile {
		font-size: 17px;
		padding: 3px 6px;
	}

	.ransom-tile.lg {
		font-size: clamp(2.4rem, 4.4vw, 3.5rem);
		padding: 6px 12px;
		border-width: 2.5px;
		box-shadow: 5px 5px 0 #000000;
	}

	.ransom-tile.crimson {
		background: #e60012;
		color: #ffffff;
		border-color: #ffffff;
	}

	.ransom-tile.white {
		background: #ffffff;
		color: #050508;
		border-color: #000000;
	}

	.ransom-tile.black {
		background: #08080c;
		color: #ffffff;
		border-color: #e60012;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
	}

	.alias-stamp {
		background: #000000;
		border: 2.5px solid #ffffff;
		box-shadow: 5px 5px 0 #e60012;
		padding: 6px 16px;
		transform: rotate(2.5deg) skewX(-10deg);
		display: flex;
		flex-direction: column;
	}

	.alias-top {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 9px;
		color: #ff2a4b;
		font-weight: 700;
		letter-spacing: 0.16em;
	}

	.alias-main {
		font-family: 'Anton', 'LINE Seed Sans TH', sans-serif;
		font-size: 26px;
		color: #ffffff;
		letter-spacing: 0.06em;
	}

	.bio-trapezoid-wrapper {
		position: relative;
		min-height: 28px;
	}

	.p5-hide-btn {
		cursor: pointer;
		position: absolute;
		top: -14px;
		right: 14px;
		z-index: 8;
		background: #000000;
		color: #ffffff;
		border: 2px solid #e60012;
		box-shadow: 3px 3px 0 #ffffff;
		font-family: 'Anton', 'LINE Seed Sans TH', sans-serif;
		font-size: 14px;
		letter-spacing: 0.08em;
		padding: 3px 12px;
		transform: rotate(5deg) skewX(-10deg);
		transition:
			transform 0.15s ease,
			background 0.15s ease;
	}

	.p5-hide-btn:hover {
		background: #e60012;
		transform: rotate(2deg) scale(1.06);
	}

	.p5-trapezoid-box {
		position: relative;
		background: #050508;
		border: 3.5px solid #e60012;
		box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.85);
		padding: 22px 26px;
		clip-path: polygon(0% 0%, 100% 3%, 97% 100%, 2% 96%);
		transition:
			opacity 0.25s ease,
			transform 0.25s ease;
	}

	.p5-trapezoid-box.bio-collapsed {
		display: none;
	}

	.trapezoid-halftone {
		position: absolute;
		inset: 0;
		opacity: 0.16;
		background-image: radial-gradient(#e60012 1.25px, transparent 0);
		background-size: 10px 10px;
		pointer-events: none;
	}

	.p5-tagline {
		position: relative;
		margin: 0 0 10px;
		font-family: 'Space Grotesk', 'LINE Seed Sans TH', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: #ff2a4b;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.p5-bio-text {
		position: relative;
		margin: 0 0 10px;
		font-family: 'LINE Seed Sans TH', sans-serif;
		font-size: 14.5px;
		line-height: 1.72;
		color: #f1f5f9;
	}

	.p5-bio-text:last-child {
		margin-bottom: 0;
	}

	/* BOTTOM ROW: RADAR + MINIMAL ICON & TEXT SKILL STRIPS */
	.p5-stats-and-skills {
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}

	@media (max-width: 860px) {
		.p5-stats-and-skills {
			grid-template-columns: 1fr;
		}
	}

	.p5-radar-card {
		background: rgba(5, 5, 9, 0.94);
		border: 2.5px solid #ffffff;
		box-shadow: 6px 6px 0 #e60012;
		padding: 14px;
		position: relative;
	}

	.card-skew-title {
		background: #e60012;
		color: #ffffff;
		font-family: 'Anton', 'Space Grotesk', 'LINE Seed Sans TH', sans-serif;
		font-size: 13px;
		letter-spacing: 0.08em;
		padding: 4px 10px;
		transform: skewX(-10deg);
		display: inline-block;
		margin-bottom: 10px;
		border: 1.5px solid #ffffff;
	}

	.radar-svg {
		width: 100%;
		max-width: 210px;
		margin: 0 auto;
		display: block;
	}

	.radar-label {
		fill: #ffffff;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 9px;
		font-weight: 700;
	}

	/* PERSONA 5 BATTLE COMMAND SKILL MENU (Idle: compact Icon+Text -> Hover: P5 slash expand!) */
	.p5-command-menu {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-left: 14px;
	}

	.p5-cmd-item {
		position: relative;
		cursor: pointer;
		outline: none;
		transition:
			transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
			opacity 0.24s ease;
	}

	.p5-cmd-item.dimmed {
		opacity: 0.54;
		transform: translateX(-2px);
	}

	.p5-cmd-item.expanded {
		transform: translateX(10px) rotate(-0.8deg);
		z-index: 10;
	}

	.p5-cmd-pointer {
		position: absolute;
		left: -20px;
		top: 16px;
		opacity: 0;
		transform: translateX(-10px) scale(0.75);
		transition:
			opacity 0.2s ease,
			transform 0.26s cubic-bezier(0.16, 1, 0.3, 1);
		pointer-events: none;
	}

	.p5-cmd-item.expanded .p5-cmd-pointer {
		opacity: 1;
		transform: translateX(0) scale(1.1);
		animation: p5PointerPulse 0.75s ease-in-out infinite alternate;
	}

	@keyframes p5PointerPulse {
		from {
			transform: translateX(0) scale(1.05);
		}
		to {
			transform: translateX(4px) scale(1.18);
		}
	}

	.p5-cmd-surface {
		background: rgba(8, 9, 13, 0.92);
		border: 1.5px solid rgba(255, 255, 255, 0.16);
		border-left: 4px solid #e60012;
		transform: skewX(-6deg);
		padding: 12px 18px;
		box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.65);
		transition:
			background 0.24s ease,
			border-color 0.24s ease,
			box-shadow 0.24s ease,
			padding 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.p5-cmd-item.expanded .p5-cmd-surface {
		background: linear-gradient(125deg, #0b0b10 0%, #1d0409 68%, #2e040c 100%);
		border-color: #ffffff;
		border-left-color: #ffffff;
		box-shadow:
			7px 7px 0 #e60012,
			0 12px 28px rgba(230, 0, 18, 0.28);
		padding: 14px 20px 16px;
	}

	.p5-cmd-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		transform: skewX(6deg);
	}

	.strip-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.strip-cat-icon {
		width: 34px;
		height: 34px;
		border-radius: 7px;
		background: #14151e;
		border: 1.5px solid rgba(255, 255, 255, 0.16);
		color: #ff2a4b;
		display: grid;
		place-items: center;
		flex-shrink: 0;
		transition:
			background 0.22s ease,
			color 0.22s ease,
			transform 0.26s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.p5-cmd-item.expanded .strip-cat-icon {
		background: #e60012;
		border-color: #ffffff;
		color: #ffffff;
		transform: rotate(-8deg) scale(1.08);
	}

	.strip-cat-title {
		font-family: 'Anton', 'Space Grotesk', 'LINE Seed Sans TH', sans-serif;
		font-size: 19px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #f1f5f9;
		transition: color 0.2s ease;
	}

	.p5-cmd-item.expanded .strip-cat-title {
		color: #ffffff;
		text-shadow: 2px 2px 0 #e60012;
	}

	.cmd-right-cue {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: #94a3b8;
	}

	.cmd-ready-tag {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		padding: 2px 7px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #94a3b8;
		transition: all 0.2s ease;
	}

	.p5-cmd-item.expanded .cmd-ready-tag {
		background: #e60012;
		border-color: #ffffff;
		color: #ffffff;
	}

	.cmd-chevron {
		display: inline-flex;
		align-items: center;
		color: #cbd5e1;
	}

	/* Smooth Grid-Row Expansion Drawer */
	.p5-cmd-drawer {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transform: skewX(6deg);
		transition:
			grid-template-rows 0.34s cubic-bezier(0.16, 1, 0.3, 1),
			opacity 0.24s ease,
			margin-top 0.3s ease;
		margin-top: 0;
	}

	.p5-cmd-item.expanded .p5-cmd-drawer {
		grid-template-rows: 1fr;
		opacity: 1;
		margin-top: 12px;
	}

	.p5-cmd-drawer-inner {
		overflow: hidden;
		border-top: 1px dashed rgba(255, 255, 255, 0.18);
		padding-top: 0;
		transition: padding-top 0.3s ease;
	}

	.p5-cmd-item.expanded .p5-cmd-drawer-inner {
		padding-top: 12px;
	}

	.strip-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.skill-pill {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 6px 12px;
		border-radius: 6px;
		background: #08090e;
		border: 1.5px solid rgba(255, 255, 255, 0.24);
		color: #ffffff;
		font-family: 'Space Grotesk', 'LINE Seed Sans TH', sans-serif;
		font-size: 12.5px;
		font-weight: 600;
		white-space: nowrap;
		opacity: 0;
		transform: translateX(-14px) skewX(-6deg);
		transition:
			opacity 0.28s ease var(--pill-delay, 0ms),
			transform 0.32s cubic-bezier(0.16, 1, 0.3, 1) var(--pill-delay, 0ms),
			background 0.18s ease,
			border-color 0.18s ease;
	}

	.p5-cmd-item.expanded .skill-pill {
		opacity: 1;
		transform: translateX(0) skewX(-6deg);
	}

	.skill-pill:hover {
		background: #e60012;
		border-color: #ffffff;
		box-shadow: 3px 3px 0 #ffffff;
	}

	/* =====================================================================
	   LIGHT MODE: PERSONA 3 RELOAD / LUSION COBALT (#f0f1fa + #1a2ffb)
	   ===================================================================== */
	.p5-section.theme-light {
		background: #f0f1fa;
		color: #0f172a;
	}

	.p5-section.theme-light .p5-top-fade {
		background: linear-gradient(180deg, #f0f1fa 0%, rgba(240, 241, 250, 0.72) 48%, transparent 100%);
	}

	.p5-section.theme-light .p5-bottom-fade {
		background: linear-gradient(0deg, #f0f1fa 0%, rgba(240, 241, 250, 0.85) 45%, transparent 100%);
	}

	.p5-section.theme-light .codename-plate,
	.p5-section.theme-light .role-banner,
	.p5-section.theme-light .alias-stamp {
		background: #ffffff;
		border-color: #0f172a;
		box-shadow: 6px 6px 0 #1a2ffb;
	}

	.p5-section.theme-light .cn-small,
	.p5-section.theme-light .alias-top,
	.p5-section.theme-light .role-company {
		color: #1a2ffb;
	}

	.p5-section.theme-light .role-company:hover {
		color: #0f172a;
	}

	.p5-section.theme-light .role-position,
	.p5-section.theme-light .alias-main {
		color: #0f172a;
	}

	.p5-section.theme-light .cutout-backing-red {
		background: #1a2ffb;
	}

	.p5-section.theme-light .portrait-card {
		background: linear-gradient(165deg, #e7ecff 0%, #f5f7ff 58%, #cfd8ff 100%);
		border-color: #0f172a;
	}

	.p5-section.theme-light .character-img {
		filter: contrast(1.06) saturate(1.04) drop-shadow(6px 0 0 #ffffff)
			drop-shadow(-4px 0 0 #1a2ffb);
	}

	.p5-section.theme-light .portrait-halftone {
		background-image: radial-gradient(rgba(26, 47, 251, 0.22) 1.5px, transparent 0);
		mix-blend-mode: multiply;
	}

	.p5-section.theme-light .p5-star-svg {
		filter: drop-shadow(0 0 8px rgba(26, 47, 251, 0.65));
	}

	.p5-section.theme-light .p5-star-svg path {
		fill: #1a2ffb;
	}

	.p5-section.theme-light .ransom-tile.crimson {
		background: #1a2ffb;
		color: #ffffff;
		border-color: #ffffff;
	}

	.p5-section.theme-light .ransom-tile.black {
		background: #0f172a;
		color: #ffffff;
		border-color: #1a2ffb;
	}

	.p5-section.theme-light .p5-hide-btn {
		background: #ffffff;
		color: #0f172a;
		border-color: #1a2ffb;
		box-shadow: 3px 3px 0 #0f172a;
	}

	.p5-section.theme-light .p5-hide-btn:hover {
		background: #1a2ffb;
		color: #ffffff;
	}

	.p5-section.theme-light .p5-trapezoid-box {
		background: rgba(255, 255, 255, 0.96);
		border-color: #1a2ffb;
		box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.14);
	}

	.p5-section.theme-light .trapezoid-halftone {
		background-image: radial-gradient(#1a2ffb 1.25px, transparent 0);
		opacity: 0.11;
	}

	.p5-section.theme-light .p5-tagline {
		color: #1a2ffb;
	}

	.p5-section.theme-light .p5-bio-text {
		color: #1e293b;
	}

	.p5-section.theme-light .p5-radar-card {
		background: rgba(255, 255, 255, 0.96);
		border-color: #0f172a;
		box-shadow: 6px 6px 0 #1a2ffb;
	}

	.p5-section.theme-light .card-skew-title {
		background: #1a2ffb;
		border-color: #0f172a;
	}

	.p5-section.theme-light .radar-label {
		fill: #0f172a;
	}

	.p5-section.theme-light .p5-cmd-surface {
		background: rgba(255, 255, 255, 0.96);
		border-color: rgba(15, 23, 42, 0.16);
		border-left-color: #1a2ffb;
		box-shadow: 5px 5px 0 rgba(26, 47, 251, 0.14);
	}

	.p5-section.theme-light .strip-cat-icon {
		background: #eef1ff;
		border-color: rgba(26, 47, 251, 0.24);
		color: #1a2ffb;
	}

	.p5-section.theme-light .strip-cat-title {
		color: #0f172a;
	}

	.p5-section.theme-light .cmd-right-cue {
		color: #64748b;
	}

	.p5-section.theme-light .cmd-ready-tag {
		background: #eef1ff;
		border-color: rgba(26, 47, 251, 0.2);
		color: #1a2ffb;
	}

	.p5-section.theme-light .cmd-chevron {
		color: #475569;
	}

	.p5-section.theme-light .p5-cmd-item.expanded .p5-cmd-surface {
		background: linear-gradient(125deg, #0b1236 0%, #102090 66%, #1a2ffb 100%);
		border-color: #0f172a;
		border-left-color: #ffffff;
		box-shadow:
			7px 7px 0 #0f172a,
			0 12px 28px rgba(26, 47, 251, 0.24);
	}

	.p5-section.theme-light .p5-cmd-item.expanded .strip-cat-icon {
		background: #ffffff;
		border-color: #ffffff;
		color: #1a2ffb;
	}

	.p5-section.theme-light .p5-cmd-item.expanded .strip-cat-title {
		color: #ffffff;
		text-shadow: 2px 2px 0 #071bdf;
	}

	.p5-section.theme-light .p5-cmd-item.expanded .cmd-ready-tag {
		background: #ffffff;
		border-color: #ffffff;
		color: #1a2ffb;
	}

	.p5-section.theme-light .p5-cmd-item.expanded .cmd-chevron {
		color: #ffffff;
	}

	.p5-section.theme-light .skill-pill {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.34);
		color: #ffffff;
	}

	.p5-section.theme-light .skill-pill:hover {
		background: #ffffff;
		border-color: #ffffff;
		color: #1a2ffb;
		box-shadow: 3px 3px 0 #071bdf;
	}

	/* =====================================================================
	   DEDICATED BELOW-SKILLS ANIMATED COMPETITION HONORS SHOWCASE
	   ===================================================================== */
	.p5-honor-stage {
		position: relative;
		z-index: 5;
		max-width: 1200px;
		margin: 88px auto 0;
		padding-top: 44px;
	}

	.honor-slash-rule {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #e60012 0%, rgba(255, 255, 255, 0.35) 55%, transparent 100%);
		transform: scaleX(0);
		transform-origin: left center;
		transition: transform 0.78s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.p5-honor-stage.revealed .honor-slash-rule {
		transform: scaleX(1);
	}

	.honor-grid {
		display: grid;
		grid-template-columns: minmax(280px, 430px) minmax(0, 1fr);
		gap: clamp(28px, 4.2vw, 54px);
		align-items: center;
	}

	@media (max-width: 960px) {
		.honor-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Left: Skewed Persona Photo Showcase (Animates smoothly in from left!) */
	.honor-poster-col {
		opacity: 0;
		transform: translate3d(-44px, 24px, 0) rotate(-4deg);
		transition:
			opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.08s,
			transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.08s;
	}

	.p5-honor-stage.revealed .honor-poster-col {
		opacity: 1;
		transform: translate3d(0, 0, 0) rotate(-1.5deg);
	}

	.honor-poster-card {
		position: relative;
		display: block;
		width: 100%;
		border: none;
		padding: 0;
		background: transparent;
		cursor: zoom-in;
		transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.honor-poster-card:hover {
		transform: rotate(0deg) scale(1.025);
	}

	.honor-backing-accent {
		position: absolute;
		inset: 12px -12px -12px 12px;
		background: #e60012;
		clip-path: polygon(2% 0%, 100% 2%, 98% 100%, 0% 98%);
		z-index: 1;
	}

	.honor-backing-white {
		position: absolute;
		inset: -5px 5px 5px -5px;
		background: #ffffff;
		clip-path: polygon(1% 1%, 99% 0%, 99% 99%, 0% 100%);
		z-index: 2;
	}

	.honor-photo-frame {
		position: relative;
		z-index: 3;
		background: #08090d;
		border: 3px solid #000000;
		overflow: hidden;
		aspect-ratio: 400 / 387;
		box-shadow: 0 22px 48px rgba(0, 0, 0, 0.55);
	}

	.honor-photo-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.honor-poster-card:hover .honor-photo-img {
		transform: scale(1.03);
	}

	/* Right: Competition Year Stamp + Award Metadata (Animates smoothly in from right!) */
	.honor-info-col {
		display: flex;
		flex-direction: column;
		gap: 16px;
		opacity: 0;
		transform: translate3d(44px, 20px, 0);
		transition:
			opacity 0.78s cubic-bezier(0.22, 1, 0.36, 1) 0.18s,
			transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.18s;
	}

	.p5-honor-stage.revealed .honor-info-col {
		opacity: 1;
		transform: translate3d(0, 0, 0);
	}

	.honor-year-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 16px;
	}

	.honor-year-stamp {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.year-label {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.16em;
		color: #fde047;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
	}

	.year-digits {
		display: inline-flex;
		align-items: baseline;
		gap: 8px;
		line-height: 0.92;
	}

	.year-be {
		font-family: 'Anton', 'Space Grotesk', 'LINE Seed Sans TH', sans-serif;
		font-size: clamp(3.2rem, 5.8vw, 4.8rem);
		letter-spacing: 0.03em;
		color: #ffffff;
		text-shadow: 5px 5px 0 #e60012;
	}

	.year-ad {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 1.1rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.56);
	}

	.honor-badges-col {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 7px;
	}

	@media (max-width: 640px) {
		.honor-badges-col {
			align-items: flex-start;
		}
	}

	.honor-medal-pill {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 5px 12px;
		background: #000000;
		border: 1.5px solid #facc15;
		box-shadow: 4px 4px 0 #e60012;
		transform: skewX(-8deg);
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: #fde047;
	}

	.honor-national-pill {
		padding: 4px 11px;
		background: #e60012;
		border: 1.5px solid #ffffff;
		transform: skewX(-8deg);
		font-family: 'LINE Seed Sans TH', 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: #ffffff;
	}

	.honor-headline {
		margin: 6px 0 0;
		font-family: 'LINE Seed Sans TH', sans-serif;
		font-size: clamp(1.35rem, 2.3vw, 1.85rem);
		font-weight: 700;
		line-height: 1.32;
		color: #ffffff;
	}

	.honor-category {
		margin: 0;
		font-family: 'LINE Seed Sans TH', sans-serif;
		font-size: 15px;
		font-weight: 500;
		line-height: 1.55;
		color: #f8fafc;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.85);
	}

	.honor-spec-grid {
		margin-top: 6px;
		background: rgba(6, 7, 11, 0.92);
		border: 2px solid rgba(255, 255, 255, 0.18);
		border-left: 4px solid #e60012;
		padding: 16px 20px;
		display: flex;
		flex-direction: column;
		gap: 11px;
		box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.65);
	}

	.honor-spec-row {
		display: grid;
		grid-template-columns: 124px minmax(0, 1fr);
		gap: 12px;
		align-items: baseline;
		padding-bottom: 9px;
		border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
	}

	.honor-spec-row:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}

	@media (max-width: 580px) {
		.honor-spec-row {
			grid-template-columns: 1fr;
			gap: 3px;
		}
	}

	.spec-key {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: #94a3b8;
	}

	.spec-val {
		font-family: 'LINE Seed Sans TH', sans-serif;
		font-size: 13.5px;
		line-height: 1.55;
		color: #f1f5f9;
	}

	/* Light Mode Overrides for Competition Honors Showcase (Persona 3 Reload Cobalt!) */
	.p5-section.theme-light .honor-slash-rule {
		background: linear-gradient(90deg, #1a2ffb 0%, rgba(15, 23, 42, 0.25) 55%, transparent 100%);
	}

	.p5-section.theme-light .honor-backing-accent {
		background: #1a2ffb;
	}

	.p5-section.theme-light .honor-photo-frame {
		border-color: #0f172a;
		box-shadow: 0 20px 44px rgba(26, 47, 251, 0.16);
	}

	.p5-section.theme-light .year-label {
		color: #1a2ffb;
		text-shadow: none;
	}

	.p5-section.theme-light .year-be {
		color: #0f172a;
		text-shadow: 5px 5px 0 #1a2ffb;
	}

	.p5-section.theme-light .year-ad {
		color: #64748b;
	}

	.p5-section.theme-light .honor-medal-pill {
		background: #0f172a;
		border-color: #facc15;
		box-shadow: 4px 4px 0 #1a2ffb;
		color: #fde047;
	}

	.p5-section.theme-light .honor-national-pill {
		background: #1a2ffb;
		border-color: #0f172a;
	}

	.p5-section.theme-light .honor-headline {
		color: #0f172a;
	}

	.p5-section.theme-light .honor-category {
		color: #1a2ffb;
		text-shadow: none;
	}

	.p5-section.theme-light .honor-spec-grid {
		background: rgba(255, 255, 255, 0.96);
		border-color: #0f172a;
		border-left-color: #1a2ffb;
		box-shadow: 7px 7px 0 #1a2ffb;
	}

	.p5-section.theme-light .honor-spec-row {
		border-bottom-color: rgba(15, 23, 42, 0.1);
	}

	.p5-section.theme-light .spec-key {
		color: #1a2ffb;
	}

	.p5-section.theme-light .spec-val {
		color: #1e293b;
	}

	/* Clean In-Page Poster Zoom Lightbox */
	.honor-lightbox {
		position: fixed;
		inset: 0;
		z-index: 99995;
		display: grid;
		place-items: center;
		padding: 24px;
		animation: lbFadeIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@keyframes lbFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.lightbox-backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgba(4, 5, 10, 0.86);
		backdrop-filter: blur(12px);
		cursor: zoom-out;
	}

	.lightbox-card {
		position: relative;
		z-index: 2;
		max-width: min(680px, 92vw);
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.lightbox-close {
		position: absolute;
		top: -16px;
		right: -16px;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		border: 2px solid #ffffff;
		background: #e60012;
		color: #ffffff;
		display: grid;
		place-items: center;
		cursor: pointer;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
		transition: transform 0.2s ease;
	}

	.lightbox-close:hover {
		transform: scale(1.08);
	}

	.lightbox-img {
		width: 100%;
		max-height: calc(90vh - 54px);
		object-fit: contain;
		border-radius: 10px;
		border: 2px solid rgba(255, 255, 255, 0.24);
		box-shadow: 0 28px 64px rgba(0, 0, 0, 0.7);
		display: block;
	}

	.lightbox-caption {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		font-family: 'LINE Seed Sans TH', 'JetBrains Mono', monospace;
		font-size: 12.5px;
		color: #e2e8f0;
	}

	/* Mobile & Tablet Responsive Polish for PersonaAbout */
	@media (max-width: 768px) {
		.p5-section {
			padding: 72px 16px 84px;
		}

		.p5-cmd-head {
			padding: 10px 12px;
		}

		.strip-cat-title {
			font-size: 14px;
		}

		.skill-pill {
			padding: 5px 10px;
			font-size: 11.5px;
		}

		.year-be {
			font-size: clamp(38px, 12vw, 56px);
		}

		.honor-headline {
			font-size: clamp(18px, 5vw, 24px);
		}
	}
</style>
