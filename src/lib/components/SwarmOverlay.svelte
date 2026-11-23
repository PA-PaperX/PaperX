<script lang="ts">
	import type { RenderedCursorState } from '$lib/swarm/director';

	let {
		cursors = []
	}: {
		cursors: RenderedCursorState[];
	} = $props();
</script>

{#if cursors.length > 0}
	<div class="swarm-layer" aria-hidden="true">
		<!-- SVG layer for crisp Figma-style smart alignment & spacing guide lines -->
		<svg class="guides-svg">
			{#each cursors as c (c.id)}
				{#if c.guideLine}
					<line
						x1={c.guideLine.x1}
						y1={c.guideLine.y1}
						x2={c.guideLine.x2}
						y2={c.guideLine.y2}
						stroke="#ff2a6d"
						stroke-width="1.25"
						stroke-dasharray="3 3"
					/>
					<circle cx={c.guideLine.x1} cy={c.guideLine.y1} r="2.5" fill="#ff2a6d" />
					<circle cx={c.guideLine.x2} cy={c.guideLine.y2} r="2.5" fill="#ff2a6d" />
				{/if}
			{/each}
		</svg>

		{#each cursors as c (c.id)}
			{#if c.guideLine?.label}
				<div
					class="guide-pill"
					style="
						left: {(c.guideLine.x1 + c.guideLine.x2) / 2}px;
						top: {(c.guideLine.y1 + c.guideLine.y2) / 2}px;
					"
				>
					{c.guideLine.label}
				</div>
			{/if}

			<!-- Dashed Draw Box (draw-box action) -->
			{#if c.drawBox}
				<div
					class="swarm-box"
					style="
						left: {c.drawBox.x}px;
						top: {c.drawBox.y}px;
						width: {c.drawBox.w}px;
						height: {c.drawBox.h}px;
						border-color: {c.color};
						background: {c.color}12;
					"
				>
					<span class="corner tl" style="border-color: {c.color}"></span>
					<span class="corner tr" style="border-color: {c.color}"></span>
					<span class="corner bl" style="border-color: {c.color}"></span>
					<span class="corner br" style="border-color: {c.color}"></span>
					<span class="dim-tag" style="background: {c.color}">
						{Math.round(c.drawBox.w)} × {Math.round(c.drawBox.h)}
					</span>
				</div>
			{/if}

			<!-- Sliding Translucent Ghost Clone Box (smart-duplicate / drop-asset action) -->
			{#if c.ghostBox}
				<div
					class="ghost-clone-box"
					style="
						left: {c.ghostBox.x}px;
						top: {c.ghostBox.y}px;
						width: {c.ghostBox.w}px;
						height: {c.ghostBox.h}px;
						border-color: {c.color};
					"
				>
					{#if c.ghostBox.assetUrl}
						<img src={c.ghostBox.assetUrl} alt="" class="ghost-asset-img" />
					{:else if c.ghostBox.label}
						<span class="ghost-clone-label">{c.ghostBox.label}</span>
					{/if}
				</div>
			{/if}

			<!-- Active Cursor (Pointer or I-Beam Typing) -->
			<div
				class="swarm-cursor"
				style="
					left: {c.cursorX}px;
					top: {c.cursorY}px;
					opacity: {c.opacity};
				"
			>
				{#if c.cursorType === 'ibeam'}
					<svg width="16" height="20" viewBox="0 0 16 20" fill="none" class="cursor-svg">
						<path
							d="M4 2H12M4 18H12M8 2V18"
							stroke={c.color}
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="cursor-svg">
						<path
							d="M4 3L11.5 21L14.5 13.5L22 10.5L4 3Z"
							fill={c.color}
							stroke="#ffffff"
							stroke-width="1.6"
							stroke-linejoin="round"
						/>
					</svg>
				{/if}

				<div class="cursor-pill" style="background: {c.color}">
					<span class="agent-name">{c.agent}</span>
					{#if c.actionTag}
						<span class="action-tag">{c.actionTag}</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.swarm-layer {
		position: fixed;
		inset: 0;
		z-index: 8500;
		pointer-events: none;
		overflow: hidden;
	}

	.guides-svg {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
	}

	.guide-pill {
		position: fixed;
		transform: translate(-50%, -50%);
		background: #ff2a6d;
		color: #ffffff;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 9px;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 3px;
		white-space: nowrap;
	}

	.swarm-box {
		position: fixed;
		border: 1px dashed;
		box-sizing: border-box;
	}

	.corner {
		position: absolute;
		width: 5px;
		height: 5px;
		background: #0a0a0f;
		border: 1px solid;
	}
	.corner.tl {
		top: -3px;
		left: -3px;
	}
	.corner.tr {
		top: -3px;
		right: -3px;
	}
	.corner.bl {
		bottom: -3px;
		left: -3px;
	}
	.corner.br {
		bottom: -3px;
		right: -3px;
	}

	.dim-tag {
		position: absolute;
		bottom: -17px;
		right: 0;
		color: #050609;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 9px;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 2px;
		white-space: nowrap;
	}

	.ghost-clone-box {
		position: fixed;
		border: 1.5px solid;
		border-radius: 6px;
		background: rgba(20, 24, 38, 0.55);
		backdrop-filter: blur(4px);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 10px;
		overflow: hidden;
		opacity: 0.85;
	}

	.ghost-clone-label {
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', sans-serif;
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ghost-asset-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0.9;
	}

	.swarm-cursor {
		position: fixed;
		transform: translate(-2px, -2px);
		will-change: left, top, opacity;
	}

	.cursor-svg {
		filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.6));
	}

	.cursor-pill {
		margin-left: 11px;
		margin-top: -4px;
		padding: 2px 7px;
		border-radius: 4px;
		border-top-left-radius: 1px;
		color: #08090d;
		font-family: 'JetBrains Mono', 'LINE Seed Sans TH', monospace;
		font-size: 10px;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		white-space: nowrap;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
	}

	.action-tag {
		background: rgba(0, 0, 0, 0.28);
		color: #ffffff;
		padding: 1px 4px;
		border-radius: 3px;
		font-weight: 500;
		font-size: 9px;
	}
</style>
