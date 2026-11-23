<script lang="ts">
	export type BrandIconName =
		| 'svelte'
		| 'typescript'
		| 'tailwind'
		| 'nextjs'
		| 'react'
		| 'vue'
		| 'nuxt'
		| 'html5'
		| 'bun'
		| 'nodejs'
		| 'php'
		| 'postgresql'
		| 'mysql'
		| 'drizzle'
		| 'redis'
		| 'rust'
		| 'tauri'
		| 'python'
		| 'ai-agent'
		| 'terminal-win'
		| 'vitest'
		| 'docker'
		| 'kubernetes'
		| 'cloudflare'
		| 'github-actions'
		| 'linux'
		| 'figma'
		| 'motion'
		| 'playwright'
		| 'aura-ds'
		| 'premiere'
		| 'aftereffects'
		| 'capcut'
		| 'davinci'
		| 'obs'
		| 'cat-frontend'
		| 'cat-backend'
		| 'cat-systems'
		| 'cat-devops'
		| 'cat-motion'
		| 'cat-video';

	let {
		name,
		size = 15
	}: {
		name: BrandIconName;
		size?: number;
	} = $props();
</script>

{#if name === 'svelte'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M19.2 4.9c-1.8-2.5-5.3-3.2-7.9-1.6L6.8 6.1C5 7.2 4.1 9.3 4.5 11.4c.2.8.5 1.5 1 2.1-.4.6-.7 1.3-.8 2.1-.4 2.1.4 4.3 2.1 5.6 1.8 1.4 4.3 1.6 6.3.4l4.5-2.8c1.8-1.1 2.7-3.2 2.3-5.3-.2-.8-.5-1.5-1-2.1.4-.6.7-1.3.8-2.1.4-1.6.1-3.1-.5-4.4z"
			fill="#ff3e00"
		/>
		<path
			d="M11.1 19.6c-1.3.4-2.8-.1-3.6-1.3-.5-.7-.7-1.6-.5-2.5l.1-.5.4.3c.9.7 2 1.1 3.1 1.3l.3.1v.3c0 .4.1.7.4 1 .4.4 1 .5 1.5.2l4.5-2.8c.5-.3.8-.9.7-1.5-.1-.6-.6-1.1-1.2-1.2l-2.3-.5c-1.6-.4-3-1.4-3.7-2.9-.7-1.5-.6-3.3.3-4.7.5-.7 1.1-1.3 1.8-1.7l4.5-2.8c1.3-.8 3-.5 4 .7.7.9.9 2.1.6 3.2l-.1.5-.4-.3c-.9-.7-2-1.1-3.1-1.3l-.3-.1V4.5c0-.4-.1-.7-.4-1-.4-.4-1-.5-1.5-.2L8.1 6.1c-.5.3-.8.9-.7 1.5.1.6.6 1.1 1.2 1.2l2.3.5c1.6.4 3 1.4 3.7 2.9.7 1.5.6 3.3-.3 4.7-.5.7-1.1 1.3-1.8 1.7l-1.4 1z"
			fill="#ffffff"
		/>
	</svg>
{:else if name === 'typescript'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect x="2" y="2" width="20" height="20" rx="3" fill="#3178c6" />
		<path
			d="M6.2 12.2h4.6v1.4H9.3V19H7.7v-5.4H6.2v-1.4zm6.4 4.8c.5.5 1.2.8 2 .8.9 0 1.4-.3 1.4-.9 0-.5-.4-.8-1.4-1.1l-.9-.3c-1.3-.4-2.1-1.1-2.1-2.2 0-1.4 1.2-2.3 2.9-2.3 1.1 0 2 .3 2.7.9l-.8 1.2c-.5-.4-1.2-.7-1.9-.7-.8 0-1.3.3-1.3.8 0 .5.4.8 1.4 1.1l.9.3c1.4.4 2.2 1.1 2.2 2.3 0 1.5-1.2 2.4-3.1 2.4-1.3 0-2.3-.4-3-.9l1-1.4z"
			fill="#ffffff"
		/>
	</svg>
{:else if name === 'tailwind'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M12 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 1.9 1.4 1 1 2.1 2.1 4.6 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.8-1.9-1.4C15.6 7.1 14.5 6 12 6zM7 12c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 1.9 1.4 1 1 2.1 2.1 4.6 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.8-1.9-1.4C10.6 13.1 9.5 12 7 12z"
			fill="#38bdf8"
		/>
	</svg>
{:else if name === 'nextjs'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="12" r="10" fill="#ffffff" />
		<path
			d="M8.5 16.5V7.8l8.6 11.4c-.5.3-1 .5-1.6.7L9.8 12v4.5H8.5zm6.5-8.7h1.3v6.2l-1.3-1.7V7.8z"
			fill="#0a0a0f"
		/>
	</svg>
{:else if name === 'react'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="12" r="2.1" fill="#61dafb" />
		<ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="#61dafb" stroke-width="1.5" />
		<ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)" stroke="#61dafb" stroke-width="1.5" />
		<ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)" stroke="#61dafb" stroke-width="1.5" />
	</svg>
{:else if name === 'vue'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M2 4h4l6 10.4L18 4h4L12 21 2 4z" fill="#41b883" />
		<path d="M6 4h3.6L12 8.2 14.4 4H18l-6 10.4L6 4z" fill="#35495e" />
	</svg>
{:else if name === 'nuxt'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M9.8 5.2L2.2 18.5h15.2L9.8 5.2z" fill="#00dc82" />
		<path d="M15.4 8.2l-6.4 10.3h12.8L15.4 8.2z" fill="#00a86b" opacity="0.9" />
	</svg>
{:else if name === 'html5'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M4 3h16l-1.5 16.2L12 21l-6.5-1.8L4 3z" fill="#e34f26" />
		<path d="M12 4.5v14.8l5.2-1.4L18.4 4.5H12z" fill="#f06529" />
		<path d="M7.5 8h9l-.2 2.2H9.8l.2 2.2h6.1l-.5 5-3.6 1-3.6-1-.2-2.6h2.2l.1 1 1.5.4 1.5-.4.2-2.2H7.9L7.5 8z" fill="#ffffff" />
	</svg>
{:else if name === 'bun'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<ellipse cx="12" cy="13" rx="9.5" ry="7.2" fill="#fbf0df" />
		<circle cx="9" cy="12.5" r="1.2" fill="#1e1b18" />
		<circle cx="15" cy="12.5" r="1.2" fill="#1e1b18" />
		<path d="M10.8 14.2c.6.7 1.8.7 2.4 0" stroke="#e11d48" stroke-width="1.4" stroke-linecap="round" />
	</svg>
{:else if name === 'nodejs'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M12 2L3.5 7v10L12 22l8.5-5V7L12 2z" fill="#539e43" />
		<path d="M12 6.5l4.8 2.8v5.4L12 17.5l-4.8-2.8V9.3L12 6.5z" fill="#0d1117" opacity="0.25" />
		<text x="12" y="14.5" text-anchor="middle" fill="#ffffff" font-size="7.5" font-weight="800" font-family="sans-serif">JS</text>
	</svg>
{:else if name === 'php'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<ellipse cx="12" cy="12" rx="10" ry="6.2" fill="#777bb4" />
		<text x="12" y="14.4" text-anchor="middle" fill="#ffffff" font-size="7.2" font-weight="800" font-style="italic" font-family="sans-serif">php</text>
	</svg>
{:else if name === 'postgresql'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M12 3C7.6 3 4.5 5.4 4.5 9.2c0 2.5 1.1 4.6 2.8 5.9l-.5 4.4 3.4-2c.6.1 1.2.2 1.8.2 4.4 0 7.5-2.6 7.5-6.5C19.5 6.4 16.4 3 12 3z"
			fill="#336791"
		/>
		<circle cx="9.5" cy="9.5" r="1.1" fill="#ffffff" />
		<circle cx="14.5" cy="9.5" r="1.1" fill="#ffffff" />
		<path d="M12 11.5v5.5c0 1.2.8 2 2 2" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
	</svg>
{:else if name === 'mysql'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<ellipse cx="12" cy="6" rx="7.5" ry="2.8" fill="#00758f" />
		<path d="M4.5 6v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6" stroke="#f29111" stroke-width="1.7" />
		<path d="M4.5 12v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6" stroke="#00758f" stroke-width="1.7" />
	</svg>
{:else if name === 'drizzle'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M7 16l3.5-8M11.5 17l4-9M16 15l2.5-6"
			stroke="#c5f74f"
			stroke-width="2.5"
			stroke-linecap="round"
		/>
	</svg>
{:else if name === 'redis'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M12 4L3 8.5 12 13l9-4.5L12 4z" fill="#ef4444" />
		<path d="M3 12.2L12 16.7l9-4.5" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
		<path d="M3 15.8L12 20.3l9-4.5" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{:else if name === 'rust'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="12" r="8.2" stroke="#f74c00" stroke-width="2.2" stroke-dasharray="2.4 1.3" />
		<circle cx="12" cy="12" r="6.4" fill="#f74c00" />
		<text x="12" y="15.2" text-anchor="middle" fill="#ffffff" font-size="9.5" font-weight="900" font-family="sans-serif">R</text>
	</svg>
{:else if name === 'tauri'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="9.2" cy="9.2" r="5.6" stroke="#24c8db" stroke-width="2" />
		<circle cx="14.8" cy="14.8" r="5.6" stroke="#ffc131" stroke-width="2" />
		<circle cx="9.2" cy="9.2" r="1.8" fill="#ffc131" />
		<circle cx="14.8" cy="14.8" r="1.8" fill="#24c8db" />
	</svg>
{:else if name === 'python'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M11.8 3C8.2 3 8.5 4.6 8.5 4.6V6.8h3.5v.7H6.2S3 7.1 3 11.7c0 4.6 2.8 4.4 2.8 4.4h1.7v-2.2s-.1-2.8 2.7-2.8h4.7s2.6.1 2.6-2.5V4.8S18 3 11.8 3z" fill="#3776ab" />
		<path d="M12.2 21c3.6 0 3.3-1.6 3.3-1.6v-2.2H12v-.7h5.8s3.2.4 3.2-4.2c0-4.6-2.8-4.4-2.8-4.4h-1.7v2.2s.1 2.8-2.7 2.8H9.1s-2.6-.1-2.6 2.5v3.8S6 21 12.2 21z" fill="#ffd343" />
	</svg>
{:else if name === 'ai-agent'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M12 2.5l2.4 6.1 6.1 2.4-6.1 2.4-2.4 6.1-2.4-6.1-6.1-2.4 6.1-2.4L12 2.5z" fill="#a855f7" />
		<circle cx="18.5" cy="5.5" r="1.6" fill="#38bdf8" />
		<circle cx="5.5" cy="18.5" r="1.4" fill="#d97757" />
	</svg>
{:else if name === 'terminal-win'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect x="2.5" y="4" width="19" height="16" rx="3" fill="#1e293b" stroke="#64748b" stroke-width="1.4" />
		<path d="M6.5 9l3.5 3-3.5 3M12 15h5" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{:else if name === 'vitest'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M13 3L5 13.5h5.5L9.5 21 19 10.5h-5.5L13 3z" fill="#fcc72b" stroke="#729b1b" stroke-width="1.2" stroke-linejoin="round" />
	</svg>
{:else if name === 'docker'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect x="6" y="9" width="2.8" height="2.4" rx="0.4" fill="#2496ed" />
		<rect x="9.5" y="9" width="2.8" height="2.4" rx="0.4" fill="#2496ed" />
		<rect x="13" y="9" width="2.8" height="2.4" rx="0.4" fill="#2496ed" />
		<rect x="9.5" y="6" width="2.8" height="2.4" rx="0.4" fill="#2496ed" />
		<path
			d="M3 12.5h15.5c.8-1 1.6-1.2 2.5-.8-.2 1.2-.8 2-1.8 2.4-1.2 3.2-4.2 5.4-8.4 5.4-4.5 0-7.8-2.6-7.8-7z"
			fill="#2496ed"
		/>
	</svg>
{:else if name === 'kubernetes'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<polygon points="12,2 20.5,6.8 20.5,17.2 12,22 3.5,17.2 3.5,6.8" fill="#326ce5" />
		<circle cx="12" cy="12" r="3.4" stroke="#ffffff" stroke-width="1.6" />
		<path d="M12 5.5v3M12 15.5v3M6.2 8.7l2.6 1.5M15.2 13.8l2.6 1.5M17.8 8.7l-2.6 1.5M8.8 13.8l-2.6 1.5" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" />
	</svg>
{:else if name === 'cloudflare'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M17.5 16.5H6.2a3.7 3.7 0 0 1-.5-7.3A5.2 5.2 0 0 1 15.8 8a3.8 3.8 0 0 1 1.7 8.5z"
			fill="#f38020"
		/>
		<path d="M16.5 16.5h2.7a2.3 2.3 0 0 0 .4-4.5" stroke="#faad3f" stroke-width="1.8" stroke-linecap="round" />
	</svg>
{:else if name === 'github-actions'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="6.5" cy="6.5" r="2.6" stroke="#2088ff" stroke-width="1.8" />
		<circle cx="6.5" cy="17.5" r="2.6" stroke="#2088ff" stroke-width="1.8" />
		<circle cx="17.5" cy="12" r="2.6" stroke="#2088ff" stroke-width="1.8" />
		<path d="M9 7.2l6 3.6M9 16.8l6-3.6" stroke="#2088ff" stroke-width="1.7" stroke-linecap="round" />
	</svg>
{:else if name === 'linux'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<ellipse cx="12" cy="13.5" rx="5.5" ry="6.8" fill="#1e293b" />
		<ellipse cx="12" cy="14.5" rx="3.4" ry="4.5" fill="#f8fafc" />
		<circle cx="10.6" cy="8.5" r="0.9" fill="#ffffff" />
		<circle cx="13.4" cy="8.5" r="0.9" fill="#ffffff" />
		<polygon points="12,9.6 10.4,11 13.6,11" fill="#f59e0b" />
		<ellipse cx="9.2" cy="19.8" rx="2.1" ry="1.1" fill="#f59e0b" />
		<ellipse cx="14.8" cy="19.8" rx="2.1" ry="1.1" fill="#f59e0b" />
	</svg>
{:else if name === 'figma'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M9 3h3v6H9a3 3 0 1 1 0-6z" fill="#f24e1e" />
		<path d="M12 3h3a3 3 0 1 1 0 6h-3V3z" fill="#ff7262" />
		<path d="M12 9h3a3 3 0 1 1 0 6h-3V9z" fill="#1abcfe" />
		<path d="M9 9h3v6H9a3 3 0 1 1 0-6z" fill="#a259ff" />
		<path d="M9 15h3v3a3 3 0 1 1-3-3z" fill="#0acf83" />
	</svg>
{:else if name === 'motion'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M4 5l5.5 14h3L18 5h-3.2l-3.6 9.5L7.5 5H4z" fill="#fde047" />
		<circle cx="18.5" cy="17" r="2.2" fill="#e60012" />
	</svg>
{:else if name === 'playwright'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M4 7c2.5-1.5 6-1.5 8.5 0v7c0 2.5-2 4.5-4.3 4.5S4 16.5 4 14V7z" fill="#2ead33" />
		<path d="M11.5 5.5c2.5-1.5 6-1.5 8.5 0v7c0 2.5-2 4.5-4.3 4.5s-4.2-2-4.2-4.5v-7z" fill="#e2574c" />
	</svg>
{:else if name === 'aura-ds'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect x="3" y="3" width="8" height="8" rx="2" fill="#ec4899" />
		<rect x="13" y="3" width="8" height="8" rx="2" fill="#8b5cf6" />
		<rect x="3" y="13" width="8" height="8" rx="2" fill="#38bdf8" />
		<rect x="13" y="13" width="8" height="8" rx="2" fill="#f59e0b" />
	</svg>
{:else if name === 'premiere'}
	<!-- Authentic Adobe Premiere Pro (Pr) Badge -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect x="2" y="2" width="20" height="20" rx="4" fill="#00005b" stroke="#9999ff" stroke-width="1.4" />
		<text x="12" y="15.8" text-anchor="middle" fill="#9999ff" font-size="11" font-weight="800" font-family="sans-serif">Pr</text>
	</svg>
{:else if name === 'aftereffects'}
	<!-- Authentic Adobe After Effects (Ae) Badge -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect x="2" y="2" width="20" height="20" rx="4" fill="#00005b" stroke="#c89eff" stroke-width="1.4" />
		<text x="12" y="15.8" text-anchor="middle" fill="#c89eff" font-size="10.5" font-weight="800" font-family="sans-serif">Ae</text>
	</svg>
{:else if name === 'capcut'}
	<!-- Authentic CapCut Ribbon Mark -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect x="2" y="2" width="20" height="20" rx="4.5" fill="#111216" stroke="rgba(255,255,255,0.28)" stroke-width="1.1" />
		<path d="M6.5 8.5L17.5 15.5M17.5 8.5L6.5 15.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
		<path d="M6.5 8.5v7M17.5 8.5v7" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.45" />
	</svg>
{:else if name === 'davinci'}
	<!-- Authentic DaVinci Resolve Tri-Color Color-Wheel Mark -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="7.4" r="4.2" fill="#ff3b5c" />
		<circle cx="7.8" cy="14.8" r="4.2" fill="#22c55e" />
		<circle cx="16.2" cy="14.8" r="4.2" fill="#38bdf8" />
		<circle cx="12" cy="12.2" r="2.2" fill="#0b0c12" />
	</svg>
{:else if name === 'obs'}
	<!-- OBS Studio Broadcast Pinwheel Mark -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="12" r="9.5" fill="#1e293b" stroke="#94a3b8" stroke-width="1.4" />
		<circle cx="12" cy="8.2" r="2.7" fill="#f8fafc" />
		<circle cx="8.7" cy="14" r="2.7" fill="#38bdf8" />
		<circle cx="15.3" cy="14" r="2.7" fill="#f43f5e" />
	</svg>
{:else if name === 'cat-frontend'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<polyline points="16 18 22 12 16 6" />
		<polyline points="8 6 2 12 8 18" />
	</svg>
{:else if name === 'cat-backend'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<ellipse cx="12" cy="5" rx="9" ry="3" />
		<path d="M3 5v14a9 3 0 0 0 18 0V5" />
		<path d="M3 12a9 3 0 0 0 18 0" />
	</svg>
{:else if name === 'cat-systems'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<rect x="4" y="4" width="16" height="16" rx="2" />
		<rect x="9" y="9" width="6" height="6" />
		<path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
	</svg>
{:else if name === 'cat-devops'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
	</svg>
{:else if name === 'cat-motion'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
	</svg>
{:else if name === 'cat-video'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<rect x="2" y="4" width="20" height="16" rx="2.5" />
		<polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none" />
		<path d="M7 4v16M17 4v16" opacity="0.45" />
	</svg>
{/if}
