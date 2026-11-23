<script lang="ts">
	export type MascotKind = 'claude' | 'gemini' | 'chatgpt';

	interface Props {
		kind: MascotKind;
		theme?: 'dark' | 'light';
		size?: number;
		interactive?: boolean;
		walking?: boolean;
		floating?: boolean;
		waving?: boolean;
		quips?: string[];
		label?: string;
	}

	const DEFAULT_QUIPS: Record<MascotKind, string[]> = {
		claude: ['git push main ✓', '337 commits!', '* Grooving...'],
		gemini: ['0 bugs found ★', 'Svelte 5 speed!', 'Gemini starlight!'],
		chatgpt: ['Ship to prod!', 'Clean architecture ✓', 'Orbiting GitHub!']
	};

	let {
		kind,
		theme = 'dark',
		size = 44,
		interactive = true,
		walking = false,
		floating = false,
		waving = false,
		quips,
		label
	}: Props = $props();

	let isLight = $derived(theme === 'light');
	let activeQuips = $derived(quips ?? DEFAULT_QUIPS[kind]);
	let quipIdx = $state(0);
	let showBubble = $state(false);
	let hopping = $state(false);
	let bubbleTimer: ReturnType<typeof setTimeout> | null = null;

	function triggerInteract() {
		if (!interactive) return;
		quipIdx = (quipIdx + 1) % activeQuips.length;
		showBubble = true;
		hopping = false;
		requestAnimationFrame(() => {
			hopping = true;
		});
		if (bubbleTimer) clearTimeout(bubbleTimer);
		bubbleTimer = setTimeout(() => {
			showBubble = false;
			hopping = false;
		}, 2400);
	}

	function handleEnter() {
		if (!interactive) return;
		showBubble = true;
	}

	function handleLeave() {
		if (!interactive) return;
		if (!hopping) showBubble = false;
	}
</script>

{#snippet mascotArtwork()}
	{#if kind === 'claude'}
		<!-- Authentic Anthropic Claude Code "Clawd" 8-bit pixel mascot (#D97757) -->
		<svg viewBox="0 0 13 9" width={size} height={size} shape-rendering="crispEdges" class="pixel-svg">
			<rect x="2" y="1" width="9" height="5" fill="#D97757" />
			<rect x="2" y="1" width="9" height="1" fill="#E4886A" />
			<rect x="1" y="3" width="1" height="1" fill="#D97757" />
			<rect x="11" y="3" width="1" height="1" fill="#D97757" />
			<g class="pixel-eyes">
				<rect x="4" y="2" width="1" height="2" fill="#0d1117" />
				<rect x="8" y="2" width="1" height="2" fill="#0d1117" />
			</g>
			<g class="legs-a">
				<rect x="2" y="6" width="1" height="2" fill="#D97757" />
				<rect x="8" y="6" width="1" height="2" fill="#D97757" />
			</g>
			<g class="legs-b">
				<rect x="4" y="6" width="1" height="2" fill="#C46546" />
				<rect x="10" y="6" width="1" height="2" fill="#C46546" />
			</g>
		</svg>
	{:else if kind === 'gemini'}
		<!-- Official Google Gemini 4-point multicolored star (transparent PNG + celestial starlight spin!) -->
		<span class="cosmic-badge gemini-badge" style="width: {size}px; height: {size}px;">
			<span class="gemini-aura" aria-hidden="true"></span>
			<img
				src="/images/ai-gemini.png"
				alt="Gemini"
				width={size}
				height={size}
				class="brand-logo-img gemini-star-spin"
				draggable="false"
			/>
		</span>
	{:else}
		<!-- Official OpenAI ChatGPT hexagonal knot (transparent PNG + smooth planetary rotation!) -->
		<span class="cosmic-badge chatgpt-badge" style="width: {size}px; height: {size}px;">
			<span class="chatgpt-aura" aria-hidden="true"></span>
			<img
				src="/images/ai-chatgpt.png"
				alt="ChatGPT"
				width={size}
				height={size}
				class="brand-logo-img chatgpt-knot-spin"
				class:invert-dark={!isLight}
				draggable="false"
			/>
		</span>
	{/if}
{/snippet}

{#if interactive}
	<button
		type="button"
		class="pixel-mascot-btn kind-{kind}"
		class:is-light={isLight}
		class:is-walking={walking}
		class:is-floating={floating}
		class:is-waving={waving}
		class:is-hopping={hopping}
		onclick={triggerInteract}
		onmouseenter={handleEnter}
		onmouseleave={handleLeave}
		aria-label={label ?? `${kind} AI buddy`}
		title={label ?? `${kind} AI buddy`}
	>
		{#if showBubble}
			<span class="pixel-bubble" role="status">
				<span class="bubble-tag"
					>{kind === 'claude' ? 'CLAUDE' : kind === 'gemini' ? 'GEMINI' : 'CHATGPT'}</span
				>
				<span>{activeQuips[quipIdx]}</span>
			</span>
		{/if}

		<span class="sprite-body" style="width: {size}px; height: {size}px;">
			{@render mascotArtwork()}
		</span>
	</button>
{:else}
	<!-- Ambient / Cosmic Orbit variant (used in Terminal Header & vyom.lol Cosmic Portal!) -->
	<span
		class="pixel-mascot-static kind-{kind}"
		class:is-light={isLight}
		style="width: {size}px; height: {size}px;"
		aria-hidden="true"
	>
		{@render mascotArtwork()}
	</span>
{/if}

<style>
	.pixel-mascot-btn {
		position: relative;
		border: none;
		padding: 0;
		background: transparent;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		outline: none;
	}

	.pixel-mascot-static {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.sprite-body {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.pixel-svg {
		display: block;
		image-rendering: pixelated;
		filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.28));
	}

	/* Real Transparent Brand Logos with Signature Celestial Motion */
	.cosmic-badge {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.brand-logo-img {
		position: relative;
		z-index: 2;
		width: 86%;
		height: 86%;
		object-fit: contain;
		display: block;
		user-select: none;
	}

	/* Gemini: Celestial 4-point star slow sway/spin + breathing 4-color starlight aura */
	.gemini-aura {
		position: absolute;
		inset: -14%;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(96, 165, 250, 0.45) 0%,
			rgba(234, 67, 53, 0.2) 45%,
			rgba(52, 168, 83, 0.14) 68%,
			transparent 78%
		);
		filter: blur(6px);
		animation: geminiAuraPulse 3.2s ease-in-out infinite;
		pointer-events: none;
	}

	.gemini-star-spin {
		filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.55));
		animation: geminiStarTwinkle 9s ease-in-out infinite;
	}

	@keyframes geminiStarTwinkle {
		0%,
		100% {
			transform: rotate(0deg) scale(1);
		}
		25% {
			transform: rotate(18deg) scale(1.07);
		}
		50% {
			transform: rotate(90deg) scale(0.97);
		}
		75% {
			transform: rotate(108deg) scale(1.06);
		}
	}

	@keyframes geminiAuraPulse {
		0%,
		100% {
			opacity: 0.58;
			transform: scale(0.92);
		}
		50% {
			opacity: 1;
			transform: scale(1.16);
		}
	}

	/* ChatGPT: Smooth planetary knot spin + crisp glowing white in Dark / crisp obsidian in Light */
	.chatgpt-aura {
		position: absolute;
		inset: -10%;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(16, 163, 127, 0.34) 0%,
			rgba(148, 197, 255, 0.16) 52%,
			transparent 76%
		);
		filter: blur(5px);
		animation: chatgptAuraPulse 3.6s ease-in-out infinite;
		pointer-events: none;
	}

	.chatgpt-knot-spin {
		animation: chatgptPlanetSpin 14s linear infinite;
		filter: drop-shadow(0 2px 6px rgba(15, 23, 42, 0.25));
	}

	.chatgpt-knot-spin.invert-dark {
		filter: invert(1) drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))
			drop-shadow(0 0 14px rgba(16, 163, 127, 0.35));
	}

	@keyframes chatgptPlanetSpin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes chatgptAuraPulse {
		0%,
		100% {
			opacity: 0.45;
			transform: scale(0.94);
		}
		50% {
			opacity: 0.9;
			transform: scale(1.12);
		}
	}

	.pixel-mascot-btn:hover .sprite-body {
		transform: translateY(-4px) scale(1.1);
	}

	.pixel-mascot-btn.is-hopping .sprite-body {
		animation: pixelHop 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}

	@keyframes pixelHop {
		0% {
			transform: translateY(0) scale(1);
		}
		35% {
			transform: translateY(-13px) scale(1.12, 0.92);
		}
		65% {
			transform: translateY(-2px) scale(0.95, 1.06);
		}
		100% {
			transform: translateY(0) scale(1);
		}
	}

	/* Periodic cute 8-bit eye blink for Clawd */
	.pixel-eyes {
		transform-box: fill-box;
		transform-origin: center;
		animation: pixelBlink 4.2s steps(1) infinite;
	}

	@keyframes pixelBlink {
		0%,
		94%,
		100% {
			transform: scaleY(1);
		}
		96%,
		98% {
			transform: scaleY(0.18);
		}
	}

	/* Walking scuttle cycle for Clawd patrolling the Contribution Graph */
	.is-walking .legs-a {
		animation: stepA 0.46s steps(2) infinite;
	}

	.is-walking .legs-b {
		animation: stepB 0.46s steps(2) infinite;
	}

	.is-walking .sprite-body {
		animation: walkBob 0.46s steps(2) infinite;
	}

	@keyframes stepA {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-0.8px);
		}
	}

	@keyframes stepB {
		0% {
			transform: translateY(-0.8px);
		}
		50% {
			transform: translateY(0);
		}
	}

	@keyframes walkBob {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-2px);
		}
	}

	/* Gentle cosmic float bob for Gemini */
	.is-floating .sprite-body {
		animation: geminiFloat 2.8s ease-in-out infinite;
	}

	@keyframes geminiFloat {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	/* Gentle orbital bob for ChatGPT */
	.is-waving .sprite-body {
		animation: chatOrbitBob 3.2s ease-in-out infinite;
	}

	@keyframes chatOrbitBob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}

	/* Speech Bubble on hover/click */
	.pixel-bubble {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px;
		border-radius: 6px;
		background: #0d1117;
		border: 1.5px solid #30363d;
		color: #f0f6fc;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 11px;
		font-weight: 600;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.36);
		z-index: 30;
		pointer-events: none;
		animation: bubblePop 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.is-light .pixel-bubble {
		background: #ffffff;
		border-color: #d0d7de;
		color: #1f2328;
		box-shadow: 0 8px 20px rgba(15, 23, 42, 0.14);
	}

	.pixel-bubble::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: #30363d;
	}

	.is-light .pixel-bubble::after {
		border-top-color: #d0d7de;
	}

	.bubble-tag {
		font-size: 9px;
		padding: 1px 5px;
		border-radius: 3px;
		font-weight: 700;
		letter-spacing: 0.06em;
	}

	.kind-claude .bubble-tag {
		background: rgba(217, 119, 87, 0.22);
		color: #f39a7d;
	}

	.kind-gemini .bubble-tag {
		background: rgba(96, 165, 250, 0.22);
		color: #60a5fa;
	}

	.kind-chatgpt .bubble-tag {
		background: rgba(16, 163, 127, 0.22);
		color: #10a37f;
	}

	@keyframes bubblePop {
		from {
			opacity: 0;
			transform: translate(-50%, 6px) scale(0.92);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0) scale(1);
		}
	}
</style>
