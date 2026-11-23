<script lang="ts">
	import AiPixelMascots from '$lib/components/AiPixelMascots.svelte';

	interface Props {
		theme?: 'dark' | 'light';
		/** Overall scroll progress inside the terminal push script (0.00 -> 1.00) */
		progress: number;
		/** Opacity for entering/exiting the fullscreen terminal backdrop (0 -> 1 -> 0) */
		opacity: number;
		/** Inner subtle scale on entrance (0.94 -> 1.0) */
		scale?: number;
		/** Vortex implosion progress (0 -> 1) pulling terminal text into the Octocat singularity */
		implodeP?: number;
	}

	let {
		theme = 'dark',
		progress = 0,
		opacity = 0,
		scale = 1,
		implodeP = 0
	}: Props = $props();
	let isLight = $derived(theme === 'light');

	function clamp01(v: number) {
		return Math.max(0, Math.min(1, v));
	}

	function range(v: number, s: number, e: number) {
		return clamp01((v - s) / Math.max(0.0001, e - s));
	}

	function sliceTyped(text: string, p: number) {
		const n = Math.floor(clamp01(p) * text.length);
		return text.slice(0, n);
	}

	// 100% Scroll-Scrubbed Terminal Script (Scroll DOWN prints forward / Scroll UP rewinds & erases cleanly 1:1!)
	const CMD1 = 'git status';
	const CMD2 = 'git add . && git commit -m "feat: ship PaperX portfolio"';
	const CMD3 = 'git push -u origin main';

	let cmd1P = $derived(range(progress, 0.02, 0.11));
	let out1a = $derived(progress >= 0.12);
	let out1b = $derived(progress >= 0.16);
	let out1c = $derived(progress >= 0.2);

	let cmd2P = $derived(range(progress, 0.24, 0.42));
	let out2a = $derived(progress >= 0.44);
	let out2b = $derived(progress >= 0.48);

	let cmd3P = $derived(range(progress, 0.52, 0.65));
	let out3a = $derived(progress >= 0.67);
	let pushPct = $derived(Math.round(range(progress, 0.69, 0.89) * 100));
	let out3Bar = $derived(progress >= 0.69);
	let out3Remote = $derived(progress >= 0.9);
	let out3Done = $derived(progress >= 0.94);

	let activePromptCmd = $derived.by(() => {
		if (progress < 0.12) return 'cmd1';
		if (progress >= 0.24 && progress < 0.44) return 'cmd2';
		if (progress >= 0.52 && progress < 0.67) return 'cmd3';
		return 'bottom';
	});

	let barBlocks = $derived.by(() => {
		const total = 24;
		const filled = Math.round((pushPct / 100) * total);
		return '█'.repeat(filled) + '░'.repeat(total - filled);
	});

	const SPINNERS = ['*', '✻', '✽', '✶', '✳', '✢'];
	let spinnerGlyph = $derived(SPINNERS[Math.floor(progress * 42) % SPINNERS.length]);
	let scrollPercent = $derived(Math.round(clamp01(progress) * 100));
	let innerScale = $derived(scale * (1 - 0.84 * Math.pow(clamp01(implodeP), 1.45)));
	let innerRotate = $derived(-13 * Math.pow(clamp01(implodeP), 1.35));
	let innerOpacity = $derived(1 - Math.pow(clamp01(implodeP), 1.15));
	let innerBlur = $derived(9 * Math.pow(clamp01(implodeP), 1.6));
</script>

<div
	class="fs-terminal"
	class:fs-light={isLight}
	style="
		opacity: {opacity.toFixed(3)};
		pointer-events: none;
	"
	aria-label="Fullscreen Scroll-Scrubbed Git Push Terminal"
>
	<div
		class="fs-term-inner"
		style="
			transform: scale({innerScale.toFixed(4)}) rotate({innerRotate.toFixed(2)}deg);
			opacity: {innerOpacity.toFixed(3)};
			filter: blur({innerBlur.toFixed(1)}px);
		"
	>
		<!-- Authentic Claude Code v2.0.0 Top Side-by-Side Mascot Header -->
		<div class="claude-cli-header">
			<div class="cli-clawd-wrap">
				<AiPixelMascots kind="claude" size={56} interactive={false} />
			</div>

			<div class="cli-meta-lines">
				<div class="cli-title-row">
					<span class="cli-brand">PaperX CLI</span>
					<span class="cli-ver">Claude Code v2.0.0</span>
				</div>
				<div class="cli-sub">Claude Code · Gemini · ChatGPT · DevOps Pipeline</div>
				<div class="cli-path">C:\Users\PaperX\Portfolio</div>
			</div>
		</div>

		<!-- Fullscreen Scroll-Scrubbed Output Stream -->
		<div class="cli-stream">
			<!-- STEP 1: git status -->
			{#if progress >= 0.01}
				<div class="cli-cmd-bar">
					<span class="cli-gt">&gt;</span>
					<span class="cli-cmd-text">{sliceTyped(CMD1, cmd1P)}</span>
					{#if activePromptCmd === 'cmd1'}
						<span class="cli-caret"></span>
					{/if}
				</div>
			{/if}

			{#if out1a}
				<div class="cli-line info">• On branch <span class="hl-coral">main</span></div>
			{/if}
			{#if out1b}
				<div class="cli-line warn">
					  Ignored: <code>.env</code> (protected by .gitignore — redacted ✓)
				</div>
			{/if}
			{#if out1c}
				<div class="cli-line muted">
					  Modified: hero.svelte · README.md · PRODUCT.md · award-vec-devops.jpg
				</div>
			{/if}

			<!-- STEP 2: git add && commit -->
			{#if progress >= 0.24}
				<div class="cli-cmd-bar">
					<span class="cli-gt">&gt;</span>
					<span class="cli-cmd-text">{sliceTyped(CMD2, cmd2P)}</span>
					{#if activePromptCmd === 'cmd2'}
						<span class="cli-caret"></span>
					{/if}
				</div>
			{/if}

			{#if out2a}
				<div class="cli-line info">• [main 8f4c2a1] feat: ship PaperX portfolio</div>
			{/if}
			{#if out2b}
				<div class="cli-line muted">
					  ∴ 6 files changed, 1842 insertions(+), 0 deletions(-)
				</div>
			{/if}

			<!-- STEP 3: git push -u origin main -->
			{#if progress >= 0.52}
				<div class="cli-cmd-bar">
					<span class="cli-gt">&gt;</span>
					<span class="cli-cmd-text">{sliceTyped(CMD3, cmd3P)}</span>
					{#if activePromptCmd === 'cmd3'}
						<span class="cli-caret"></span>
					{/if}
				</div>
			{/if}

			{#if out3a}
				<div class="cli-line muted">  Enumerating objects: 34, done.</div>
			{/if}
			{#if out3Bar}
				<div class="cli-line coral">
					  {spinnerGlyph} Pushing objects [{barBlocks}] {pushPct}% · {(3.42 * (pushPct / 100)).toFixed(2)} MiB
				</div>
			{/if}
			{#if out3Remote}
				<div class="cli-line info">  To https://github.com/PA-PaperX/PaperX.git</div>
				<div class="cli-line success">     3a9e1b0..8f4c2a1  main -&gt; main</div>
			{/if}
			{#if out3Done}
				<div class="cli-line success-bright">
					✓ Deploy เสร็จสมบูรณ์ — เลื่อนลงต่อเพื่อพุ่งเข้าพอร์ทัล GitHub (PA-PaperX) ↓
				</div>
			{/if}
		</div>

		<!-- Authentic Claude Code Bottom Hairline Prompt & Status Footer -->
		<div class="cli-bottom">
			<div class="cli-rule"></div>
			<div class="cli-input-row">
				<span class="cli-gt">&gt;</span>
				<span class="cli-input-hint">
					{out3Done
						? 'Portal Armed — keep scrolling to dive through GitHub Octocat'
						: 'Scroll down to push · Scroll up to rewind'}
				</span>
				{#if activePromptCmd === 'bottom'}
					<span class="cli-caret"></span>
				{/if}
			</div>
			<div class="cli-rule"></div>

			<div class="cli-footer-meta">
				<span>PaperX <span class="hl-coral">(main)</span></span>
				<span class="cli-scroll-pct">SCROLL SCRUB · {scrollPercent}%</span>
			</div>
		</div>
	</div>
</div>

<style>
	.fs-terminal {
		position: fixed;
		inset: 0;
		z-index: 78;
		background: #06141a;
		color: #e6edf3;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(24px, 5vw, 64px);
		overflow: hidden;
		will-change: opacity;
	}

	.fs-terminal.fs-light {
		background: #f4f6fc;
		color: #0f172a;
	}

	.fs-term-inner {
		width: 100%;
		max-width: 980px;
		height: 100%;
		max-height: 680px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 24px;
		transform-origin: center center;
		will-change: transform, opacity, filter;
	}

	/* Authentic Claude Code Side-by-Side Header */
	.claude-cli-header {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.cli-clawd-wrap {
		flex-shrink: 0;
	}

	.cli-meta-lines {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.cli-title-row {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}

	.cli-brand {
		font-size: 16px;
		font-weight: 700;
		color: #ffffff;
	}

	.fs-light .cli-brand {
		color: #0f172a;
	}

	.cli-ver {
		font-size: 13px;
		color: #7c939d;
	}

	.cli-sub,
	.cli-path {
		font-size: 12.5px;
		color: #6b848f;
	}

	/* Output Stream */
	.cli-stream {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
		overflow: hidden;
		font-size: clamp(12.5px, 1.3vw, 14.5px);
		line-height: 1.65;
	}

	.cli-cmd-bar {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 6px 12px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.06);
		width: fit-content;
		max-width: 100%;
		margin-top: 6px;
	}

	.fs-light .cli-cmd-bar {
		background: rgba(26, 47, 251, 0.08);
	}

	.cli-gt {
		color: #7c939d;
		font-weight: 700;
	}

	.cli-cmd-text {
		color: #f8fafc;
		font-weight: 600;
	}

	.fs-light .cli-cmd-text {
		color: #0f172a;
	}

	.cli-line {
		white-space: pre-wrap;
		word-break: break-word;
	}

	.cli-line.info {
		color: #e2eef3;
	}

	.fs-light .cli-line.info {
		color: #1e293b;
	}

	.cli-line.muted {
		color: #6f8a96;
	}

	.cli-line.warn {
		color: #fbbf24;
	}

	.fs-light .cli-line.warn {
		color: #b45309;
	}

	.cli-line.warn code {
		padding: 1px 5px;
		border-radius: 3px;
		background: rgba(251, 191, 36, 0.14);
	}

	.cli-line.coral {
		color: #d97757;
		font-weight: 600;
	}

	.cli-line.success {
		color: #4ade80;
		font-weight: 600;
	}

	.cli-line.success-bright {
		margin-top: 6px;
		color: #4ade80;
		font-family: 'LINE Seed Sans TH', 'JetBrains Mono', monospace;
		font-weight: 700;
	}

	.fs-light .cli-line.success,
	.fs-light .cli-line.success-bright {
		color: #15803d;
	}

	.hl-coral {
		color: #d97757;
		font-weight: 600;
	}

	.cli-caret {
		display: inline-block;
		width: 8px;
		height: 16px;
		background: #e6edf3;
		animation: cliBlink 0.72s steps(2) infinite;
	}

	.fs-light .cli-caret {
		background: #0f172a;
	}

	@keyframes cliBlink {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	/* Bottom Hairline Input Box (Authentic Claude Code Chrome) */
	.cli-bottom {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.cli-rule {
		height: 1px;
		width: 100%;
		background: rgba(148, 179, 194, 0.24);
	}

	.fs-light .cli-rule {
		background: rgba(15, 23, 42, 0.15);
	}

	.cli-input-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 2px 4px;
		font-size: 13px;
	}

	.cli-input-hint {
		color: #6b848f;
	}

	.cli-footer-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
		color: #6b848f;
	}

	.cli-scroll-pct {
		letter-spacing: 0.08em;
	}

	@media (max-width: 640px) {
		.fs-terminal {
			padding: 16px;
		}

		.fs-term-inner {
			gap: 14px;
			max-height: 92vh;
		}

		.claude-cli-header {
			gap: 12px;
		}

		.cli-brand {
			font-size: 14px;
		}

		.cli-ver,
		.cli-sub,
		.cli-path {
			font-size: 11px;
		}

		.cli-stream {
			font-size: 11.5px;
			gap: 6px;
		}

		.cli-cmd-bar {
			padding: 5px 8px;
			gap: 6px;
		}

		.cli-input-row {
			font-size: 11.5px;
		}
	}
</style>
