<script lang="ts">
	export type IconName =
		| 'files'
		| 'search'
		| 'git-branch'
		| 'extensions'
		| 'chevron-right'
		| 'chevron-down'
		| 'ellipsis'
		| 'sidebar-left'
		| 'replay'
		| 'sun'
		| 'moon'
		| 'file-svelte'
		| 'file-default'
		| 'file-readme'
		| 'file-md'
		| 'file-env'
		| 'folder'
		| 'folder-open'
		| 'copy'
		| 'check'
		| 'external'
		| 'mail'
		| 'phone'
		| 'globe'
		| 'map-pin'
		| 'tiktok'
		| 'youtube'
		| 'facebook'
		| 'instagram'
		| 'github'
		| 'lock'
		| 'terminal'
		| 'star'
		| 'repo'
		| 'users'
		| 'trophy'
		| 'close'
		| 'vscode';

	let {
		name,
		size = 16,
		color = 'currentColor',
		className = ''
	}: {
		name: IconName;
		size?: number;
		color?: string;
		className?: string;
	} = $props();
</script>

{#if name === 'files'}
	<!-- Authentic VS Code Codicon: files -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M17.5 0H8.5L7 1.5V6H2.5L1 7.5V22.5L2.5 24H14.5L16 22.5V18H20.5L22 16.5V4.5L17.5 0ZM17.5 2.12L19.88 4.5H17.5V2.12ZM14.5 22.5H2.5V7.5H7V16.5L8.5 18H14.5V22.5ZM20.5 16.5H8.5V1.5H16V6H20.5V16.5Z"
			fill={color}
		/>
	</svg>
{:else if name === 'search'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M15.25 1a8.25 8.25 0 0 0-6.18 13.72L1 22.88l1.12 1.12 8.05-8.12A8.251 8.251 0 1 0 15.25 1zm0 15a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5z"
			fill={color}
		/>
	</svg>
{:else if name === 'git-branch'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.492 2.492 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25zM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM3.5 3.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0z"
			fill={color}
		/>
	</svg>
{:else if name === 'extensions'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M13.5 1.5L15 0h7.5L24 1.5V9l-1.5 1.5H15L13.5 9V1.5zm1.5 0V9h7.5V1.5H15zM0 4.5L1.5 3H9l1.5 1.5V12h7.5l1.5 1.5V21l-1.5 1.5h-18L0 21V4.5zm1.5 0V12H9V4.5H1.5zm0 9V21H9v-7.5H1.5zm9 0V21H18v-7.5h-7.5z"
			fill={color}
		/>
	</svg>
{:else if name === 'chevron-right'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M10.072 8.024L5.715 3.667l.618-.62L11 7.716v.618L6.333 13l-.618-.619 4.357-4.357z"
			fill={color}
		/>
	</svg>
{:else if name === 'chevron-down'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z"
			fill={color}
		/>
	</svg>
{:else if name === 'ellipsis'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
			fill={color}
		/>
	</svg>
{:else if name === 'sidebar-left'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M2 2L1 3v10l1 1h12l1-1V3l-1-1H2zm0 11V3h4v10H2zm5 0V3h7v10H7z"
			fill={color}
		/>
	</svg>
{:else if name === 'replay'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M12.75 8a4.75 4.75 0 0 1-8.61 2.76l-.9.62A5.85 5.85 0 0 0 13.85 8 5.85 5.85 0 0 0 4.5 3.31V1.5H3.4v3.85h3.85V4.25H5.06A4.75 4.75 0 0 1 12.75 8z"
			fill={color}
		/>
	</svg>
{:else if name === 'sun'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
	</svg>
{:else if name === 'moon'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
	</svg>
{:else if name === 'file-svelte'}
	<!-- Authentic Svelte Orange S Logo Icon -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M19.2 4.9c-1.8-2.5-5.3-3.2-7.9-1.6L6.8 6.1C5 7.2 4.1 9.3 4.5 11.4c.2.8.5 1.5 1 2.1-.4.6-.7 1.3-.8 2.1-.4 2.1.4 4.3 2.1 5.6 1.8 1.4 4.3 1.6 6.3.4l4.5-2.8c1.8-1.1 2.7-3.2 2.3-5.3-.2-.8-.5-1.5-1-2.1.4-.6.7-1.3.8-2.1.4-1.6.1-3.1-.5-4.4z"
			fill="#ff3e00"
		/>
		<path
			d="M11.1 19.6c-1.3.4-2.8-.1-3.6-1.3-.5-.7-.7-1.6-.5-2.5l.1-.5.4.3c.9.7 2 1.1 3.1 1.3l.3.1v.3c0 .4.1.7.4 1 .4.4 1 .5 1.5.2l4.5-2.8c.5-.3.8-.9.7-1.5-.1-.6-.6-1.1-1.2-1.2l-2.3-.5c-1.6-.4-3-1.4-3.7-2.9-.7-1.5-.6-3.3.3-4.7.5-.7 1.1-1.3 1.8-1.7l4.5-2.8c1.3-.8 3-.5 4 .7.7.9.9 2.1.6 3.2l-.1.5-.4-.3c-.9-.7-2-1.1-3.1-1.3l-.3-.1V4.5c0-.4-.1-.7-.4-1-.4-.4-1-.5-1.5-.2L8.1 6.1c-.5.3-.8.9-.7 1.5.1.6.6 1.1 1.2 1.2l2.3.5c1.6.4 3 1.4 3.7 2.9.7 1.5.6 3.3-.3 4.7-.5.7-1.1 1.3-1.8 1.7l-1.4 1z"
			fill="#ffffff"
		/>
	</svg>
{:else if name === 'file-default'}
	<!-- Generic neutral file icon shown mid-rename before a known extension is typed -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M6 3h8l5 5v13H6V3zm7.5 1.5V9H18"
			stroke="#9ca3af"
			stroke-width="1.6"
			stroke-linejoin="round"
		/>
	</svg>
{:else if name === 'file-readme'}
	<!-- Authentic VS Code Seti Info Circle Icon for README.md -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<circle cx="12" cy="12" r="9" stroke="#42a5f5" stroke-width="1.8" />
		<circle cx="12" cy="8" r="1.3" fill="#42a5f5" />
		<path d="M12 11.2V16.8" stroke="#42a5f5" stroke-width="2" stroke-linecap="round" />
	</svg>
{:else if name === 'file-md'}
	<!-- Authentic VS Code Seti Markdown M + Down Arrow Icon -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M2.5 16.5V7.5H4.6L7.2 11.2L9.8 7.5H11.9V16.5H9.8V10.7L7.2 14.3L4.6 10.7V16.5H2.5Z"
			fill="#519aba"
		/>
		<path
			d="M17.5 7.5V13.2H14.8L18.5 17.2L22.2 13.2H19.5V7.5H17.5Z"
			fill="#519aba"
		/>
	</svg>
{:else if name === 'file-env'}
	<!-- Authentic VS Code Seti Config/Env Sliders Icon -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<rect x="4" y="3" width="16" height="18" rx="2" stroke="#eab308" stroke-width="1.6" />
		<path d="M9 7v10M15 7v10" stroke="#eab308" stroke-width="1.5" stroke-linecap="round" />
		<rect x="7" y="9" width="4" height="2.5" rx="0.5" fill="#eab308" />
		<rect x="13" y="13" width="4" height="2.5" rx="0.5" fill="#eab308" />
	</svg>
{:else if name === 'folder'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M3 6a2 2 0 0 1 2-2h4.2l2 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"
			fill="#90a4ae"
		/>
	</svg>
{:else if name === 'folder-open'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M3 6a2 2 0 0 1 2-2h4.2l2 2H19a2 2 0 0 1 2 2v2H5.5L3 18V6z"
			fill="#90a4ae"
		/>
		<path d="M5.5 10H22l-2.3 9H3.2l2.3-9z" fill="#b0bec5" />
	</svg>
{:else if name === 'copy'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
		<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
	</svg>
{:else if name === 'check'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<path d="M20 6L9 17l-5-5" />
	</svg>
{:else if name === 'external'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<path d="M7 17L17 7M7 7h10v10" />
	</svg>
{:else if name === 'mail'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<rect width="20" height="16" x="2" y="4" rx="2" />
		<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
	</svg>
{:else if name === 'phone'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
	</svg>
{:else if name === 'globe'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<circle cx="12" cy="12" r="10" />
		<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
	</svg>
{:else if name === 'map-pin'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
		<circle cx="12" cy="10" r="3" />
	</svg>
{:else if name === 'tiktok'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M15.4 3h-2.8v11.6a2.7 2.7 0 1 1-1.9-2.6V9.1a5.5 5.5 0 1 0 4.7 5.5V8.6c1.1.8 2.4 1.3 3.8 1.3V7.2c-2-.1-3.6-1.8-3.8-4.2z"
			fill={color}
		/>
	</svg>
{:else if name === 'youtube'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
			fill={color}
		/>
		<polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="#ffffff" />
	</svg>
{:else if name === 'facebook'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94z"
			fill={color}
		/>
	</svg>
{:else if name === 'instagram'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<rect x="2.5" y="2.5" width="19" height="19" rx="5" />
		<circle cx="12" cy="12" r="4.2" />
		<circle cx="17.5" cy="6.5" r="1.1" fill={color} stroke="none" />
	</svg>
{:else if name === 'github'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
			fill={color}
		/>
	</svg>
{:else if name === 'lock'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<rect x="4" y="11" width="16" height="10" rx="2" />
		<path d="M8 11V7a4 4 0 0 1 8 0v4" />
	</svg>
{:else if name === 'terminal'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<polyline points="4 17 10 11 4 5" />
		<line x1="12" y1="19" x2="20" y2="19" />
	</svg>
{:else if name === 'star'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"
			fill={color}
		/>
	</svg>
{:else if name === 'repo'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"
			fill={color}
		/>
	</svg>
{:else if name === 'users'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"
			fill={color}
		/>
	</svg>
{:else if name === 'trophy'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className}>
		<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
		<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
		<path d="M4 22h16" />
		<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
		<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
		<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
	</svg>
{:else if name === 'close'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" class={className}>
		<path
			d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
			fill={color}
		/>
	</svg>
{:else if name === 'vscode'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={className}>
		<path
			d="M17.5 1.2L7.3 10.6 3.1 7.3 1 8.4v7.2l2.1 1.1 4.2-3.3 10.2 9.4 5.5-2.7V3.9L17.5 1.2zm0 15.8L10.7 12l6.8-5v10z"
			fill="#007acc"
		/>
	</svg>
{/if}
