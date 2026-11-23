<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ENV_CONTACTS } from '$lib/data/portfolio';
	import VsIcons from '$lib/components/VsIcons.svelte';
	import { isPartBuilt } from '$lib/swarm/state.svelte';

	interface Props {
		theme?: 'dark' | 'light';
	}

	let { theme = 'dark' }: Props = $props();
	let isLight = $derived(theme === 'light');

	// Playful Censored .env Troll state
	let deniedKey = $state<string | null>(null);
	let trollMessage = $state<string | null>(null);
	let trollCount = $state(0);
	let trollTimer: ReturnType<typeof setTimeout> | null = null;
	let shakeTimer: ReturnType<typeof setTimeout> | null = null;

	function triggerCensorTroll(key: string, msg: string) {
		deniedKey = null;
		requestAnimationFrame(() => {
			deniedKey = key;
		});
		trollCount += 1;
		trollMessage = msg;
		if (shakeTimer) clearTimeout(shakeTimer);
		shakeTimer = setTimeout(() => {
			if (deniedKey === key) deniedKey = null;
		}, 520);
		if (trollTimer) clearTimeout(trollTimer);
		trollTimer = setTimeout(() => {
			trollMessage = null;
		}, 3200);
	}

	onDestroy(() => {
		if (trollTimer) clearTimeout(trollTimer);
		if (shakeTimer) clearTimeout(shakeTimer);
	});
</script>

<section
	class="env-section"
	class:theme-light={isLight}
	data-theme={theme}
	aria-label=".env Censored Secrets"
>
	<div class="env-container">
		<!-- ACT 4A: CENSORED .env TROLL CARD (Locked & Redacted — Cannot Open!) -->
		<div
			class="env-editor-card"
			data-swarm-part="env-card"
			data-swarm-built={isPartBuilt('env-card') ? 'true' : undefined}
		>
			<div class="env-bar-head">
				<div class="env-bar-left">
					<VsIcons name="lock" size={13} color={isLight ? '#1a2ffb' : '#ff2a4b'} />
					<span class="env-bar-title">.env — PROTECTED BY .gitignore (READ-ONLY)</span>
				</div>
				<span class="env-bar-badge">CENSORED</span>
			</div>

			<div class="env-lines">
				{#each ENV_CONTACTS as item, idx (item.key)}
					{@const isShaking = deniedKey === item.key}
					<div
						class="env-row"
						class:denied-shake={isShaking}
						data-swarm-part="env-row-{idx}"
						data-swarm-built={isPartBuilt(`env-row-${idx}`) ? 'true' : undefined}
					>
						<span class="line-no">{idx + 1}</span>

						<div class="env-code">
							<div class="comment-line">{item.comment}</div>
							<div class="kv-line">
								<span class="env-key">{item.key}</span><span class="env-eq">=</span><button
									type="button"
									class="censored-val-btn"
									onclick={() => triggerCensorTroll(item.key, item.trollReply)}
									title="Locked secret"
								>
									<span class="censored-blur">{item.maskedValue}</span>
									<span class="censor-stripe" aria-hidden="true">REDACTED</span>
								</button>
							</div>
						</div>

						<div class="env-actions">
							<button
								type="button"
								class="env-btn locked-btn"
								onclick={() => triggerCensorTroll(item.key, item.trollReply)}
							>
								<VsIcons name="lock" size={12} color="currentColor" />
								<span>{isShaking ? 'Denied' : 'Reveal'}</span>
							</button>
						</div>
					</div>
				{/each}
			</div>

			{#if trollMessage}
				<div class="env-troll-toast" role="status" aria-live="polite">
					<VsIcons name="lock" size={14} color="#ffffff" />
					<span>{trollMessage}</span>
					{#if trollCount >= 2}
						<span class="troll-attempts">×{trollCount}</span>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Clean Scroll Cue inviting the user to keep scrolling down into the Fullscreen Terminal -->
		<div
			class="push-scroll-cue"
			data-swarm-part="env-connect"
			data-swarm-built={isPartBuilt('env-connect') ? 'true' : undefined}
		>
			<span class="cue-line"></span>
			<span class="cue-text">เลื่อนลงต่อเพื่อเปิด Terminal และ Push โปรเจกต์ขึ้น GitHub ↓</span>
			<span class="cue-line"></span>
		</div>
	</div>
</section>

<style>
	.env-section {
		position: relative;
		width: 100%;
		min-height: 78vh;
		display: flex;
		align-items: center;
		background: #040508;
		color: #f8fafc;
		padding: 84px 32px 96px;
		transition: background-color 0.45s ease, color 0.45s ease;
	}

	.env-container {
		width: 100%;
		max-width: 1080px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 36px;
	}

	.env-editor-card {
		position: relative;
		background: #0c0e14;
		border: 1px solid #252836;
		border-radius: 10px;
		overflow: hidden;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		box-shadow: 0 24px 56px rgba(0, 0, 0, 0.45);
	}

	.env-bar-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 11px 18px;
		background: #141720;
		border-bottom: 1px solid #232736;
	}

	.env-bar-left {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.env-bar-title {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: #cbd5e1;
	}

	.env-bar-badge {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.12em;
		padding: 2px 8px;
		border-radius: 4px;
		background: rgba(230, 0, 18, 0.18);
		border: 1px solid rgba(230, 0, 18, 0.5);
		color: #ff6478;
	}

	.env-lines {
		display: flex;
		flex-direction: column;
	}

	.env-row {
		display: grid;
		grid-template-columns: 38px 1fr auto;
		align-items: center;
		gap: 14px;
		padding: 14px 20px;
		border-bottom: 1px solid #181a24;
		transition: background 0.15s ease;
	}

	.env-row:last-child {
		border-bottom: none;
	}

	.env-row:hover {
		background: rgba(255, 255, 255, 0.025);
	}

	.env-row.denied-shake {
		animation: envDenyShake 0.44s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
		background: rgba(230, 0, 18, 0.12);
	}

	@keyframes envDenyShake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-7px);
		}
		40% {
			transform: translateX(7px);
		}
		60% {
			transform: translateX(-5px);
		}
		80% {
			transform: translateX(4px);
		}
	}

	.line-no {
		color: #4b5563;
		font-size: 12px;
		text-align: right;
		padding-right: 6px;
		user-select: none;
	}

	.env-code {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.comment-line {
		font-family: 'LINE Seed Sans TH', 'JetBrains Mono', monospace;
		font-size: 11.5px;
		color: #6a9955;
	}

	.kv-line {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 4px;
		font-size: 13px;
	}

	.env-key {
		color: #9cdcfe;
		font-weight: 600;
	}

	.env-eq {
		color: #d4d4d4;
	}

	.censored-val-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		border: 1px dashed rgba(230, 0, 18, 0.35);
		border-radius: 4px;
		background: rgba(230, 0, 18, 0.08);
		padding: 2px 8px;
		cursor: not-allowed;
		overflow: hidden;
		max-width: 100%;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 12.5px;
		transition: border-color 0.2s ease, background-color 0.2s ease;
	}

	.censored-val-btn:hover {
		border-color: #ff2a4b;
		background: rgba(230, 0, 18, 0.16);
	}

	.censored-blur {
		color: #ce9178;
		filter: blur(4.5px);
		user-select: none;
		letter-spacing: 0.03em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 390px;
	}

	.censor-stripe {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 9.5px;
		font-weight: 700;
		letter-spacing: 0.24em;
		color: rgba(255, 255, 255, 0.86);
		background: repeating-linear-gradient(
			-45deg,
			rgba(12, 14, 20, 0.72),
			rgba(12, 14, 20, 0.72) 6px,
			rgba(230, 0, 18, 0.22) 6px,
			rgba(230, 0, 18, 0.22) 12px
		);
	}

	.env-actions {
		display: flex;
		align-items: center;
	}

	.env-btn {
		cursor: not-allowed;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 11px;
		font-weight: 600;
		padding: 5px 11px;
		border-radius: 5px;
		background: #161924;
		border: 1px solid #2a2f42;
		color: #94a3b8;
		transition: all 0.18s ease;
	}

	.env-btn:hover {
		border-color: #ff2a4b;
		color: #ff6478;
		background: rgba(230, 0, 18, 0.12);
	}

	.env-troll-toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 18px;
		background: #c80018;
		color: #ffffff;
		font-family: 'LINE Seed Sans TH', 'JetBrains Mono', monospace;
		font-size: 13px;
		font-weight: 600;
		animation: toastSlideUp 0.26s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.troll-attempts {
		margin-left: auto;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 11px;
		padding: 2px 7px;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.32);
	}

	@keyframes toastSlideUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.push-scroll-cue {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 8px 0;
	}

	.cue-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
	}

	.cue-text {
		font-family: 'LINE Seed Sans TH', 'JetBrains Mono', monospace;
		font-size: 12.5px;
		letter-spacing: 0.04em;
		color: #94a3b8;
	}

	/* LIGHT MODE */
	.env-section.theme-light {
		background: #f0f1fa;
		color: #0f172a;
	}

	.env-section.theme-light .env-editor-card {
		background: #ffffff;
		border-color: #dce1f0;
		box-shadow: 0 18px 44px rgba(18, 28, 86, 0.07);
	}

	.env-section.theme-light .env-bar-head {
		background: #f6f7fc;
		border-bottom-color: #e2e6f2;
	}

	.env-section.theme-light .env-bar-title {
		color: #334155;
	}

	.env-section.theme-light .env-bar-badge {
		background: rgba(26, 47, 251, 0.1);
		border-color: rgba(26, 47, 251, 0.35);
		color: #1a2ffb;
	}

	.env-section.theme-light .env-row {
		border-bottom-color: #edf0f8;
	}

	.env-section.theme-light .env-row:hover {
		background: rgba(26, 47, 251, 0.025);
	}

	.env-section.theme-light .line-no {
		color: #94a3b8;
	}

	.env-section.theme-light .comment-line {
		color: #0e7a48;
	}

	.env-section.theme-light .env-key {
		color: #1a2ffb;
	}

	.env-section.theme-light .env-eq {
		color: #475569;
	}

	.env-section.theme-light .censored-val-btn {
		border-color: rgba(26, 47, 251, 0.28);
		background: rgba(26, 47, 251, 0.06);
	}

	.env-section.theme-light .censor-stripe {
		color: #1e293b;
		background: repeating-linear-gradient(
			-45deg,
			rgba(240, 241, 250, 0.85),
			rgba(240, 241, 250, 0.85) 6px,
			rgba(26, 47, 251, 0.14) 6px,
			rgba(26, 47, 251, 0.14) 12px
		);
	}

	.env-section.theme-light .env-btn {
		background: #f4f6fc;
		border-color: #d6dcef;
		color: #475569;
	}

	.env-section.theme-light .cue-line {
		background: linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.16), transparent);
	}

	.env-section.theme-light .cue-text {
		color: #475569;
	}

	@media (max-width: 640px) {
		.env-row {
			grid-template-columns: 26px minmax(0, 1fr);
			gap: 8px;
			padding: 12px 14px;
		}

		.env-actions {
			grid-column: 2;
			margin-top: 4px;
		}

		.censored-blur {
			max-width: 210px;
		}

		.env-bar-head {
			padding: 10px 12px;
			flex-wrap: wrap;
		}

		.env-troll-toast {
			padding: 10px 12px;
			font-size: 12px;
			flex-wrap: wrap;
		}
	}
</style>
