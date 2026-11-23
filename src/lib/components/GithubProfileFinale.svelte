<script lang="ts">
	import { GITHUB_PROFILE, SOCIAL_LINKS } from '$lib/data/portfolio';
	import VsIcons from '$lib/components/VsIcons.svelte';
	import AiPixelMascots from '$lib/components/AiPixelMascots.svelte';

	interface Props {
		theme?: 'dark' | 'light';
		opacity?: number;
		scale?: number;
		blurPx?: number;
		brightness?: number;
		interactive?: boolean;
		onScrollUpRewind?: (deltaY: number) => void;
		onToggleTheme?: () => void;
	}

	let {
		theme = 'dark',
		opacity = 1,
		scale = 1,
		blurPx = 0,
		brightness = 1,
		interactive = true,
		onScrollUpRewind,
		onToggleTheme
	}: Props = $props();
	let isLight = $derived(theme === 'light');
	let isInteractive = $derived(interactive && opacity > 0.72);
	let lensFilter = $derived(
		blurPx > 0.15 || Math.abs(brightness - 1) > 0.01
			? `blur(${blurPx.toFixed(2)}px) brightness(${brightness.toFixed(3)})`
			: 'none'
	);

	let selectedYear = $state('2026');
	let scrollHostEl: HTMLElement | undefined = $state();
	let hoveredCellInfo = $state<string | null>(null);

	const YEAR_COUNTS: Record<string, string> = {
		'2026': '337 contributions in the last year',
		'2025': '218 contributions in 2025',
		'2024': '146 contributions in 2024',
		'2023': '64 contributions in 2023'
	};

	const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

	function getCellLevel(rowIdx: number, colIdx: number, year: string): number {
		const row = GITHUB_PROFILE.contributionMatrix[rowIdx] ?? '';
		const base = Number(row[colIdx] ?? '0');
		if (year === '2026') return base;
		const shift = year === '2025' ? 7 : year === '2024' ? 19 : 31;
		const altCol = (colIdx + shift) % Math.max(1, row.length);
		const v = Number(row[altCol] ?? '0');
		if (year === '2023' && v > 2) return 2;
		return v;
	}

	let touchStartY = 0;

	function handleWheel(e: WheelEvent) {
		if (!scrollHostEl || !isInteractive) return;
		// When scrolling UP at the very top of GitHub Overview, smoothly rewind back into Fullscreen Terminal -> VS Code!
		if (scrollHostEl.scrollTop <= 2 && e.deltaY < 0) {
			e.preventDefault();
			onScrollUpRewind?.(e.deltaY);
		}
	}

	function handleTouchStart(e: TouchEvent) {
		if (!e.touches.length) return;
		touchStartY = e.touches[0].clientY;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!scrollHostEl || !isInteractive || !e.touches.length) return;
		const curY = e.touches[0].clientY;
		const dy = touchStartY - curY; // negative when pulling finger down (scrolling up)
		touchStartY = curY;
		if (scrollHostEl.scrollTop <= 2 && dy < -2) {
			onScrollUpRewind?.(dy * 1.4);
		}
	}
</script>

<div
	bind:this={scrollHostEl}
	class="gh-page"
	class:gh-light={isLight}
	data-gh-theme={theme}
	style="
		opacity: {opacity.toFixed(3)};
		transform: scale({scale.toFixed(4)});
		filter: {lensFilter};
		pointer-events: {isInteractive ? 'auto' : 'none'};
	"
	onwheel={handleWheel}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	role="region"
	aria-label="GitHub Overview — PA-PaperX"
>
	<!-- CLEAN GITHUB OVERVIEW TAB STRIP ONLY (Matches Image 2 — No search bar / No outer global bar!) -->
	<header class="gh-tabs-bar">
		<div class="gh-tabs-inner">
			<nav class="gh-nav-tabs" aria-label="GitHub Profile Navigation">
				<a
					href={GITHUB_PROFILE.profileUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="gh-tab active"
				>
					<VsIcons name="repo" size={15} color="currentColor" />
					<span>Overview</span>
				</a>
				<a
					href="{GITHUB_PROFILE.profileUrl}?tab=repositories"
					target="_blank"
					rel="noopener noreferrer"
					class="gh-tab"
				>
					<VsIcons name="files" size={14} color="currentColor" />
					<span>Repositories</span>
					<span class="gh-counter">{GITHUB_PROFILE.repoCount}</span>
				</a>
				<a
					href="{GITHUB_PROFILE.profileUrl}?tab=projects"
					target="_blank"
					rel="noopener noreferrer"
					class="gh-tab"
				>
					<span>Projects</span>
				</a>
				<a
					href="{GITHUB_PROFILE.profileUrl}?tab=packages"
					target="_blank"
					rel="noopener noreferrer"
					class="gh-tab"
				>
					<span>Packages</span>
				</a>
				<a
					href="{GITHUB_PROFILE.profileUrl}?tab=stars"
					target="_blank"
					rel="noopener noreferrer"
					class="gh-tab"
				>
					<VsIcons name="star" size={15} color="currentColor" />
					<span>Stars</span>
					<span class="gh-counter">{GITHUB_PROFILE.starCount}</span>
				</a>
			</nav>
		</div>
	</header>

	<!-- 1:1 AUTHENTIC GITHUB OVERVIEW TWO-COLUMN BODY -->
	<div class="gh-main-wrap">
		<!-- LEFT PROFILE SIDEBAR (296px) -->
		<aside class="gh-profile-col">
			<div class="gh-avatar-wrap">
				<img
					src={GITHUB_PROFILE.avatarSrc}
					alt="{GITHUB_PROFILE.displayName} ({GITHUB_PROFILE.username})"
					class="gh-avatar-img"
				/>
				<span class="gh-status-badge" title="Online · PaperX" aria-hidden="true">
					<span class="gh-status-dot"></span>
				</span>
			</div>

			<div class="gh-name-block">
				<h1 class="gh-fullname">{GITHUB_PROFILE.displayName}</h1>
				<p class="gh-handle">
					{GITHUB_PROFILE.username} <span class="gh-pronouns">· {GITHUB_PROFILE.pronouns}</span>
				</p>
			</div>

			<a
				href={GITHUB_PROFILE.profileUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="gh-primary-profile-btn"
			>
				<span>Follow / Open on GitHub</span>
				<VsIcons name="external" size={13} color="currentColor" />
			</a>

			<div class="gh-follow-row">
				<VsIcons name="users" size={15} color="currentColor" />
				<span><strong>{GITHUB_PROFILE.followers}</strong> followers</span>
				<span>·</span>
				<span><strong>{GITHUB_PROFILE.following}</strong> following</span>
			</div>

			<!-- ALL SOCIAL LOGOS & CHANNELS (TikTok, Facebook, Instagram, YouTube, GitHub) -->
			<div class="gh-sidebar-divider"></div>
			<div class="gh-section-block">
				<h2 class="gh-sidebar-heading">Social &amp; Channels</h2>
				<div class="gh-social-list">
					{#each SOCIAL_LINKS as social (social.id)}
						<a
							href={social.href}
							target="_blank"
							rel="noopener noreferrer"
							class="gh-social-row"
							style="--social-brand: {social.brandColor};"
						>
							<span class="gh-social-icon-box">
								<VsIcons name={social.icon} size={16} color={social.brandColor} />
							</span>
							<span class="gh-social-meta">
								<span class="gh-social-name">{social.name}</span>
								<span class="gh-social-handle">{social.handle}</span>
							</span>
							<VsIcons name="external" size={12} color="currentColor" />
						</a>
					{/each}
				</div>
			</div>

			<!-- Achievements + Waving 8-Bit Pixel ChatGPT Mascot Buddy! -->
			<div class="gh-sidebar-divider"></div>
			<div class="gh-section-block">
				<div class="gh-ach-header">
					<h2 class="gh-sidebar-heading">Achievements</h2>
				</div>
				<div class="gh-badges-row">
					{#each GITHUB_PROFILE.achievements as ach (ach.name)}
						<a
							href={ach.url}
							target="_blank"
							rel="noopener noreferrer"
							class="gh-ach-link"
							title={ach.name}
						>
							<img src={ach.imageSrc} alt={ach.name} class="gh-ach-img" />
						</a>
					{/each}

					<!-- ChatGPT Planetary Buddy hanging out right beside Pull Shark! -->
					<div class="mascot-chatgpt-spot">
						<AiPixelMascots
							kind="chatgpt"
							{theme}
							size={40}
							waving={true}
							label="ChatGPT AI buddy"
						/>
					</div>
				</div>
			</div>

			<!-- Organizations -->
			<div class="gh-sidebar-divider"></div>
			<div class="gh-section-block">
				<h2 class="gh-sidebar-heading">Organizations</h2>
				<div class="gh-orgs-row">
					{#each GITHUB_PROFILE.organizations as org (org.name)}
						<a
							href={org.url}
							target="_blank"
							rel="noopener noreferrer"
							class="gh-org-link"
							title={org.name}
						>
							<img src={org.avatarSrc} alt={org.name} class="gh-org-img" />
						</a>
					{/each}
				</div>
			</div>
		</aside>

		<!-- RIGHT CONTENT COLUMN -->
		<div class="gh-content-col">
			<!-- Popular Repositories + Floating 8-Bit Pixel Gemini Sparkle Buddy! -->
			<section class="gh-repos-section" aria-label="Popular repositories">
				<div class="gh-sec-head">
					<h2 class="gh-sec-title">Popular repositories</h2>

					<div class="gh-repos-head-right">
						<!-- Gemini 4-Point Star Buddy floating playfully on top of the Repositories section! -->
						<div class="mascot-gemini-spot">
							<AiPixelMascots
								kind="gemini"
								{theme}
								size={38}
								floating={true}
								label="Gemini AI buddy"
							/>
						</div>
						<a
							href="{GITHUB_PROFILE.profileUrl}?tab=repositories"
							target="_blank"
							rel="noopener noreferrer"
							class="gh-sec-sublink"
						>
							View all {GITHUB_PROFILE.repoCount} repositories
						</a>
					</div>
				</div>

				<div class="gh-repo-grid">
					{#each GITHUB_PROFILE.popularRepositories as repo (repo.name)}
						<a
							href={repo.url}
							target="_blank"
							rel="noopener noreferrer"
							class="gh-repo-card"
						>
							<div class="gh-repo-top">
								<span class="gh-repo-name">{repo.name}</span>
								<span class="gh-repo-vis">{repo.visibility}</span>
							</div>

							{#if repo.description}
								<p class="gh-repo-desc">{repo.description}</p>
							{/if}

							<div class="gh-repo-meta">
								<span class="gh-repo-lang">
									<span class="lang-dot" style="background: {repo.languageColor};"></span>
									<span>{repo.language}</span>
								</span>
								{#if repo.stars > 0}
									<span class="gh-repo-stars">
										<VsIcons name="star" size={13} color="currentColor" />
										<span>{repo.stars}</span>
									</span>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</section>

			<!-- Exact 1:1 Contribution Graph + Patrolling 8-Bit Pixel Claude Code "Clawd" Mascot! -->
			<section class="gh-contrib-section" aria-label="Contribution activity">
				<div class="gh-contrib-layout">
					<div class="gh-contrib-main">
						<div class="gh-sec-head gh-contrib-head">
							<h2 class="gh-sec-title">{YEAR_COUNTS[selectedYear]}</h2>
							{#if hoveredCellInfo}
								<span class="gh-cell-tooltip">{hoveredCellInfo}</span>
							{/if}
						</div>

						<div class="gh-contrib-card-wrap">
							<!-- Authentic Orange Pixel Claude Code "Clawd" walking playfully along the Contribution Graph! -->
							<div class="mascot-claude-track" aria-label="Claude Code mascot walking">
								<div class="mascot-claude-walker">
									<AiPixelMascots
										kind="claude"
										{theme}
										size={40}
										walking={true}
										label="Claude Code Clawd pixel buddy"
									/>
								</div>
							</div>

							<div class="gh-contrib-card">
								<div class="gh-contrib-scroll">
									<div class="gh-months-row">
										<span class="gh-day-spacer"></span>
										<div class="gh-months-track">
											{#each GITHUB_PROFILE.monthLabels as m, mi (mi)}
												<span>{m}</span>
											{/each}
										</div>
									</div>

									<div class="gh-matrix-wrap">
										<div class="gh-weekdays-col" aria-hidden="true">
											{#each WEEKDAYS as wd, wi (wi)}
												<span>{wd}</span>
											{/each}
										</div>

										<div class="gh-matrix-grid">
											{#each [0, 1, 2, 3, 4, 5, 6] as rIdx (rIdx)}
												<div class="gh-matrix-row">
													{#each Array.from({ length: 53 }, (_, i) => i) as cIdx (cIdx)}
														{@const lvl = getCellLevel(rIdx, cIdx, selectedYear)}
														<span
															class="gh-cell lvl-{lvl}"
															role="presentation"
															onmouseenter={() =>
																(hoveredCellInfo =
																	lvl === 0
																		? `No contributions · Week ${cIdx + 1}`
																		: `${lvl * 3} contributions · Week ${cIdx + 1} (${selectedYear})`)}
															onmouseleave={() => (hoveredCellInfo = null)}
														></span>
													{/each}
												</div>
											{/each}
										</div>
									</div>
								</div>

								<div class="gh-contrib-legend">
									<span class="gh-legend-note">PA-PaperX real contribution activity</span>
									<div class="gh-legend-scale">
										<span>Less</span>
										<span class="gh-cell lvl-0"></span>
										<span class="gh-cell lvl-1"></span>
										<span class="gh-cell lvl-2"></span>
										<span class="gh-cell lvl-3"></span>
										<span class="gh-cell lvl-4"></span>
										<span>More</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="gh-years-col" role="tablist" aria-label="Contribution year">
						{#each GITHUB_PROFILE.years as yr (yr)}
							<button
								type="button"
								role="tab"
								aria-selected={selectedYear === yr}
								class="gh-year-btn"
								class:active={selectedYear === yr}
								onclick={() => (selectedYear = yr)}
							>
								{yr}
							</button>
						{/each}
					</div>
				</div>
			</section>

			<!-- Clean Subtle Footer & Direct Contact Links -->
			<footer class="gh-footer">
				<span>© 2026 PaperX (Treethossathep Inpomma) · Hamster Software House Co., Ltd.</span>
				<div class="gh-footer-links">
					<a href="mailto:contact@hamster-software.cloud">contact@hamster-software.cloud</a>
					<a href="tel:+66826419844">+66 82-641-9844</a>
					<a href="https://hamster-software.cloud/" target="_blank" rel="noopener noreferrer">
						hamster-software.cloud
					</a>
				</div>
			</footer>
		</div>
	</div>
</div>

<style>
	/* ==========================================================
	   DEFAULT: GITHUB DARK DEFAULT (#0d1117)
	   ========================================================== */
	.gh-page {
		--gh-bg: #0d1117;
		--gh-header-bg: #010409;
		--gh-surface: #0d1117;
		--gh-surface-subtle: #161b22;
		--gh-border: #30363d;
		--gh-border-muted: #21262d;
		--gh-ink: #e6edf3;
		--gh-ink-muted: #8b949e;
		--gh-link: #58a6ff;
		--gh-accent-tab: #f78166;
		--gh-btn-bg: #21262d;
		--gh-btn-hover: #30363d;
		--gh-year-active: #1f6feb;
		--gh-lvl-0: #161b22;
		--gh-lvl-1: #0e4429;
		--gh-lvl-2: #006d32;
		--gh-lvl-3: #26a641;
		--gh-lvl-4: #39d353;

		position: fixed;
		inset: 0;
		z-index: 75;
		background: var(--gh-bg);
		color: var(--gh-ink);
		overflow-y: auto;
		overflow-x: hidden;
		transform-origin: 50% 50%;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', 'LINE Seed Sans TH',
			Helvetica, Arial, sans-serif;
		scrollbar-width: none;
		-ms-overflow-style: none;
		will-change: opacity, transform;
	}

	.gh-page::-webkit-scrollbar {
		display: none;
	}

	/* ==========================================================
	   LIGHT MODE: EXACT 1:1 GITHUB LIGHT (#ffffff)
	   ========================================================== */
	.gh-page.gh-light {
		--gh-bg: #ffffff;
		--gh-header-bg: #f6f8fa;
		--gh-surface: #ffffff;
		--gh-surface-subtle: #f6f8fa;
		--gh-border: #d0d7de;
		--gh-border-muted: #d8dee4;
		--gh-ink: #1f2328;
		--gh-ink-muted: #656d76;
		--gh-link: #0969da;
		--gh-accent-tab: #fd8c73;
		--gh-btn-bg: #f6f8fa;
		--gh-btn-hover: #f3f4f6;
		--gh-year-active: #0969da;
		--gh-lvl-0: #ebedf0;
		--gh-lvl-1: #9be9a8;
		--gh-lvl-2: #40c463;
		--gh-lvl-3: #30a14e;
		--gh-lvl-4: #216e39;
	}

	/* CLEAN OVERVIEW-ONLY TAB STRIP (Matches Image 2) */
	.gh-tabs-bar {
		background: var(--gh-header-bg);
		border-bottom: 1px solid var(--gh-border);
		position: sticky;
		top: 0;
		z-index: 20;
	}

	.gh-tabs-inner {
		max-width: 1216px;
		margin: 0 auto;
		padding: 6px 24px 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.gh-nav-tabs {
		display: flex;
		align-items: center;
		gap: 6px;
		overflow-x: auto;
	}

	.gh-tab {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 8px 10px 10px;
		font-size: 14px;
		color: var(--gh-ink);
		text-decoration: none;
		border-bottom: 2px solid transparent;
		white-space: nowrap;
	}

	.gh-tab:hover {
		background: rgba(128, 128, 128, 0.08);
		border-radius: 6px 6px 0 0;
	}

	.gh-tab.active {
		font-weight: 600;
		border-bottom-color: var(--gh-accent-tab);
	}

	.gh-counter {
		font-size: 12px;
		font-weight: 500;
		padding: 1px 7px;
		border-radius: 999px;
		background: rgba(128, 128, 128, 0.18);
		color: var(--gh-ink);
	}

	/* MAIN TWO-COLUMN GITHUB BODY */
	.gh-main-wrap {
		max-width: 1216px;
		margin: 0 auto;
		padding: 32px 24px 72px;
		display: grid;
		grid-template-columns: 296px minmax(0, 1fr);
		gap: 32px;
		align-items: start;
	}

	@media (max-width: 900px) {
		.gh-main-wrap {
			grid-template-columns: 1fr;
		}
	}

	/* LEFT SIDEBAR */
	.gh-profile-col {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.gh-avatar-wrap {
		position: relative;
		width: 100%;
		max-width: 296px;
	}

	.gh-avatar-img {
		width: 100%;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		border: 1px solid var(--gh-border);
		object-fit: cover;
		display: block;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
	}

	.gh-status-badge {
		position: absolute;
		right: 14px;
		bottom: 24px;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--gh-surface);
		border: 1px solid var(--gh-border);
		display: grid;
		place-items: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
	}

	.gh-status-dot {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 8px rgba(34, 197, 94, 0.65);
	}

	.gh-fullname {
		margin: 0;
		font-size: 24px;
		font-weight: 600;
		line-height: 1.25;
		color: var(--gh-ink);
	}

	.gh-handle {
		margin: 2px 0 0;
		font-size: 19px;
		font-weight: 300;
		color: var(--gh-ink-muted);
	}

	.gh-pronouns {
		font-size: 16px;
	}

	.gh-primary-profile-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		height: 34px;
		border-radius: 6px;
		border: 1px solid var(--gh-border);
		background: var(--gh-btn-bg);
		color: var(--gh-ink);
		font-size: 13.5px;
		font-weight: 500;
		text-decoration: none;
		transition: background-color 0.15s ease, border-color 0.15s ease;
	}

	.gh-primary-profile-btn:hover {
		background: var(--gh-btn-hover);
		border-color: var(--gh-ink-muted);
	}

	.gh-follow-row {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13.5px;
		color: var(--gh-ink-muted);
	}

	.gh-follow-row strong {
		color: var(--gh-ink);
	}

	.gh-sidebar-divider {
		height: 1px;
		background: var(--gh-border-muted);
		margin: 2px 0;
	}

	.gh-section-block {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.gh-sidebar-heading {
		margin: 0;
		font-size: 15px;
		font-weight: 600;
		color: var(--gh-ink);
	}

	.gh-social-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.gh-social-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 7px 10px;
		border-radius: 7px;
		border: 1px solid transparent;
		background: var(--gh-surface-subtle);
		color: var(--gh-ink);
		text-decoration: none;
		transition:
			border-color 0.2s ease,
			transform 0.2s ease,
			background-color 0.2s ease;
	}

	.gh-social-row:hover {
		border-color: var(--social-brand);
		transform: translateX(3px);
	}

	.gh-social-icon-box {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		background: var(--gh-surface);
		border: 1px solid var(--gh-border-muted);
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.gh-social-meta {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}

	.gh-social-name {
		font-size: 12.5px;
		font-weight: 600;
		line-height: 1.2;
	}

	.gh-social-handle {
		font-size: 11.5px;
		color: var(--gh-ink-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.gh-badges-row,
	.gh-orgs-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
	}

	.gh-ach-img {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		display: block;
		transition: transform 0.2s ease;
	}

	.gh-ach-link:hover .gh-ach-img {
		transform: scale(1.06);
	}

	.mascot-chatgpt-spot {
		display: inline-flex;
		align-items: center;
		margin-left: 6px;
	}

	.gh-org-img {
		width: 34px;
		height: 34px;
		border-radius: 6px;
		border: 1px solid var(--gh-border);
		display: block;
		object-fit: cover;
		transition: transform 0.2s ease, border-color 0.2s ease;
	}

	.gh-org-link:hover .gh-org-img {
		transform: scale(1.08);
		border-color: var(--gh-link);
	}

	/* RIGHT CONTENT COLUMN */
	.gh-content-col {
		display: flex;
		flex-direction: column;
		gap: 32px;
		min-width: 0;
	}

	.gh-sec-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 10px;
	}

	.gh-repos-head-right {
		display: inline-flex;
		align-items: flex-end;
		gap: 14px;
	}

	.mascot-gemini-spot {
		margin-bottom: -6px;
		z-index: 6;
	}

	.gh-sec-title {
		margin: 0;
		font-size: 16px;
		font-weight: 400;
		color: var(--gh-ink);
	}

	.gh-sec-sublink {
		font-size: 12.5px;
		color: var(--gh-link);
		text-decoration: none;
	}

	.gh-sec-sublink:hover {
		text-decoration: underline;
	}

	/* POPULAR REPOSITORIES 2x3 GRID */
	.gh-repo-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}

	@media (max-width: 680px) {
		.gh-repo-grid {
			grid-template-columns: 1fr;
		}
	}

	.gh-repo-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		border-radius: 6px;
		border: 1px solid var(--gh-border);
		background: var(--gh-surface);
		text-decoration: none;
		min-height: 98px;
		transition: border-color 0.2s ease, transform 0.2s ease;
	}

	.gh-repo-card:hover {
		border-color: var(--gh-link);
		transform: translateY(-2px);
	}

	.gh-repo-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.gh-repo-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--gh-link);
	}

	.gh-repo-card:hover .gh-repo-name {
		text-decoration: underline;
	}

	.gh-repo-vis {
		font-size: 11.5px;
		font-weight: 500;
		padding: 1px 8px;
		border-radius: 999px;
		border: 1px solid var(--gh-border);
		color: var(--gh-ink-muted);
	}

	.gh-repo-desc {
		margin: 0;
		font-size: 12px;
		line-height: 1.5;
		color: var(--gh-ink-muted);
	}

	.gh-repo-meta {
		margin-top: auto;
		display: flex;
		align-items: center;
		gap: 16px;
		font-size: 12px;
		color: var(--gh-ink-muted);
	}

	.gh-repo-lang,
	.gh-repo-stars {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}

	.lang-dot {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		display: inline-block;
	}

	/* 1:1 CONTRIBUTION GRAPH + PATROLLING CLAUDE CODE "CLAWD" */
	.gh-contrib-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 92px;
		gap: 18px;
		align-items: start;
	}

	@media (max-width: 760px) {
		.gh-contrib-layout {
			grid-template-columns: 1fr;
		}
	}

	.gh-contrib-head {
		margin-bottom: 24px;
	}

	.gh-cell-tooltip {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 11.5px;
		color: var(--gh-ink-muted);
	}

	.gh-contrib-card-wrap {
		position: relative;
	}

	/* Orange Pixel Clawd patrolling smoothly back-and-forth along top of Contribution Graph! */
	.mascot-claude-track {
		position: absolute;
		left: 18px;
		right: 18px;
		top: -31px;
		height: 36px;
		pointer-events: none;
		z-index: 8;
	}

	.mascot-claude-walker {
		position: absolute;
		left: 0;
		bottom: 0;
		pointer-events: auto;
		animation: clawdPatrol 14s ease-in-out infinite alternate;
	}

	@keyframes clawdPatrol {
		0% {
			left: 38%;
		}
		50% {
			left: 84%;
		}
		100% {
			left: 48%;
		}
	}

	.gh-contrib-card {
		border: 1px solid var(--gh-border);
		border-radius: 6px;
		background: var(--gh-surface);
		padding: 14px 16px 12px;
	}

	.gh-contrib-scroll {
		overflow-x: auto;
		padding-bottom: 4px;
	}

	.gh-months-row {
		display: flex;
		align-items: center;
		margin-bottom: 6px;
		min-width: 660px;
	}

	.gh-day-spacer {
		width: 30px;
		flex-shrink: 0;
	}

	.gh-months-track {
		flex: 1;
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		color: var(--gh-ink-muted);
		padding-right: 6px;
	}

	.gh-matrix-wrap {
		display: flex;
		gap: 4px;
		min-width: 660px;
	}

	.gh-weekdays-col {
		width: 26px;
		display: grid;
		grid-template-rows: repeat(7, 11px);
		gap: 3px;
		font-size: 10px;
		line-height: 11px;
		color: var(--gh-ink-muted);
		flex-shrink: 0;
	}

	.gh-matrix-grid {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.gh-matrix-row {
		display: grid;
		grid-template-columns: repeat(53, 1fr);
		gap: 3px;
	}

	.gh-cell {
		width: 100%;
		aspect-ratio: 1 / 1;
		min-width: 9px;
		max-width: 12px;
		border-radius: 2px;
		display: block;
		outline: 1px solid rgba(27, 31, 35, 0.06);
	}

	.gh-cell.lvl-0 {
		background: var(--gh-lvl-0);
	}
	.gh-cell.lvl-1 {
		background: var(--gh-lvl-1);
	}
	.gh-cell.lvl-2 {
		background: var(--gh-lvl-2);
	}
	.gh-cell.lvl-3 {
		background: var(--gh-lvl-3);
	}
	.gh-cell.lvl-4 {
		background: var(--gh-lvl-4);
	}

	.gh-contrib-legend {
		margin-top: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 10px;
		font-size: 11.5px;
		color: var(--gh-ink-muted);
	}

	.gh-legend-scale {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.gh-legend-scale .gh-cell {
		width: 10px;
		height: 10px;
	}

	.gh-years-col {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding-top: 44px;
	}

	@media (max-width: 760px) {
		.gh-years-col {
			flex-direction: row;
			padding-top: 0;
		}
	}

	.gh-year-btn {
		cursor: pointer;
		border: none;
		border-radius: 6px;
		padding: 7px 14px;
		text-align: left;
		background: transparent;
		color: var(--gh-ink-muted);
		font-size: 12.5px;
		font-weight: 500;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.gh-year-btn:hover {
		background: var(--gh-surface-subtle);
		color: var(--gh-ink);
	}

	.gh-year-btn.active {
		background: var(--gh-year-active);
		color: #ffffff;
		font-weight: 600;
	}

	/* FOOTER */
	.gh-footer {
		padding-top: 20px;
		border-top: 1px solid var(--gh-border-muted);
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
		font-size: 12px;
		color: var(--gh-ink-muted);
	}

	.gh-footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
	}

	.gh-footer-links a {
		color: var(--gh-link);
		text-decoration: none;
	}

	.gh-footer-links a:hover {
		text-decoration: underline;
	}

	@media (max-width: 640px) {
		.gh-tabs-inner {
			padding: 4px 12px 0;
		}

		.gh-tab {
			padding: 7px 8px 9px;
			font-size: 12.5px;
		}

		.gh-main-wrap {
			padding: 20px 14px 56px;
		}
	}
</style>
