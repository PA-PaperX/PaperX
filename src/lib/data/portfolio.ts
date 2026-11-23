import type { IconName } from '$lib/components/VsIcons.svelte';
import type { BrandIconName } from '$lib/components/BrandIcons.svelte';

export type SectionId = 'hero.svelte' | 'README.md' | 'PRODUCT.md' | '.env';

export interface ExplorerFile {
	id: SectionId;
	name: string;
	path: string;
	icon: IconName;
}

export const PORTFOLIO_FILES: ExplorerFile[] = [
	{
		id: 'hero.svelte',
		name: 'hero.svelte',
		path: 'PaperX/hero.svelte',
		icon: 'file-svelte'
	},
	{
		id: 'README.md',
		name: 'README.md',
		path: 'PaperX/README.md',
		icon: 'file-readme'
	},
	{
		id: 'PRODUCT.md',
		name: 'PRODUCT.md',
		path: 'PaperX/PRODUCT.md',
		icon: 'file-md'
	},
	{
		id: '.env',
		name: '.env',
		path: 'PaperX/.env',
		icon: 'file-env'
	}
];

export interface CompetitionHonor {
	yearBe: string;
	yearAd: string;
	dateRange: string;
	medalBadge: string;
	nationalBadge: string;
	title: string;
	category: string;
	event: string;
	location: string;
	student: string;
	institution: string;
	teammates: string[];
	advisor: string;
	posterImage: string;
}

export const COMPETITION_HONOR: CompetitionHonor = {
	yearBe: '2568',
	yearAd: '2025',
	dateRange: '15–19 ธันวาคม 2568',
	medalBadge: 'GOLD MEDAL · 1ST RUNNER-UP',
	nationalBadge: 'NATIONAL QUALIFIER · ระดับชาติ',
	title: 'รางวัลรองชนะเลิศ อันดับ 1 · มาตรฐานระดับเหรียญทอง',
	category: 'ทักษะเทคโนโลยีสารสนเทศด้านโปรแกรมและเครือข่ายด้วยกระบวนการ DevOps (ระดับ ปวส.)',
	event: 'งานประชุมวิชาการองค์การนักวิชาชีพในอนาคตแห่งประเทศไทย (อวท.) ระดับภาคตะวันออกเฉียงเหนือ ครั้งที่ 35',
	location: 'จังหวัดกาฬสินธุ์',
	student: 'นายตรีทศเทพ อินพรหมมา (Film / PaperX)',
	institution: 'วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร',
	teammates: ['นายตรีทศเทพ อินพรหมมา', 'นายธนพล พ่ออามาตย์', 'นายชนะชัย พันธุพาน'],
	advisor: 'นายอดุล ศรีภักดี',
	posterImage: '/images/award-vec-devops.jpg'
};

export const PROFILE_DATA = {
	nickname: 'FILM',
	fullNameTh: 'นายตรีทศเทพ อินพรหมมา',
	codename: 'PaperX',
	alias: 'PasperX',
	role: 'Chief Technology Officer (CTO)',
	company: 'Hamster Software House Co., Ltd.',
	companyUrl: 'https://hamster-software.cloud/',
	college: 'วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร',
	avatarUrl: 'https://hamster-software.cloud/CTO.png',
	tagline: 'Full-Stack Engineer • DevOps National Finalist • Video & Broadcast Production',
	bioParagraphs: [
		'Chief Technology Officer (CTO) แห่ง Hamster Software House ผู้ขับเคลื่อนการออกแบบและพัฒนาสถาปัตยกรรมระบบซอฟต์แวร์ ครอบคลุม Web Platform, Enterprise ERP, POS และ Cloud Infrastructure พร้อมประสบการณ์แข่งขันทักษะ DevOps ระดับชาติ ในฐานะตัวแทนภาคตะวันออกเฉียงเหนือ ด้วยมาตรฐานผลงานระดับเหรียญทอง',
		'ภายใต้ชื่อ PaperX (Film) นักพัฒนา Full-Stack ที่สนใจงานด้าน Software Engineering และ Systems Development ตั้งแต่การพัฒนาซอฟต์แวร์ระดับระบบด้วย Rust และ Tauri เครื่องมือ AI และ Automation ไปจนถึง Web Application และ Platform ด้วย SvelteKit, Vue/Nuxt, Next.js, Bun, PHP และ Docker',
		'นอกจากนี้ยังมีประสบการณ์ด้าน Video Editing และ Broadcast Production สำหรับงานครีเอเตอร์และ VTuber โดยใช้เครื่องมืออย่าง Adobe Premiere Pro, After Effects, CapCut, DaVinci Resolve'
	],
	stats: [
		{ label: 'FRONTEND & MOTION', short: 'MOTION', score: 98 },
		{ label: 'SYSTEM ARCHITECTURE', short: 'ARCH', score: 96 },
		{ label: 'DEVOPS & INFRA', short: 'DEVOPS', score: 96 },
		{ label: 'VIDEO EDITING & VFX', short: 'EDITING', score: 95 },
		{ label: 'SECURITY & HOTFIX', short: 'SECURITY', score: 97 }
	],
	skillGroups: [
		{
			title: 'Frontend & Web UI',
			icon: 'cat-frontend' as BrandIconName,
			items: [
				{ name: 'SvelteKit', icon: 'svelte' as BrandIconName },
				{ name: 'TypeScript', icon: 'typescript' as BrandIconName },
				{ name: 'Vue.js', icon: 'vue' as BrandIconName },
				{ name: 'Nuxt', icon: 'nuxt' as BrandIconName },
				{ name: 'Next.js', icon: 'nextjs' as BrandIconName },
				{ name: 'React', icon: 'react' as BrandIconName },
				{ name: 'Tailwind CSS', icon: 'tailwind' as BrandIconName },
				{ name: 'HTML5 / CSS3', icon: 'html5' as BrandIconName }
			]
		},
		{
			title: 'Backend & Data',
			icon: 'cat-backend' as BrandIconName,
			items: [
				{ name: 'Bun', icon: 'bun' as BrandIconName },
				{ name: 'Node.js', icon: 'nodejs' as BrandIconName },
				{ name: 'PHP', icon: 'php' as BrandIconName },
				{ name: 'PostgreSQL', icon: 'postgresql' as BrandIconName },
				{ name: 'MySQL / SQL', icon: 'mysql' as BrandIconName },
				{ name: 'Drizzle ORM', icon: 'drizzle' as BrandIconName },
				{ name: 'Redis', icon: 'redis' as BrandIconName }
			]
		},
		{
			title: 'Systems, Desktop & AI',
			icon: 'cat-systems' as BrandIconName,
			items: [
				{ name: 'Rust', icon: 'rust' as BrandIconName },
				{ name: 'Tauri Desktop', icon: 'tauri' as BrandIconName },
				{ name: 'Python', icon: 'python' as BrandIconName },
				{ name: 'AI Agents & LLM', icon: 'ai-agent' as BrandIconName },
				{ name: 'Windows CLI / NVIDIA', icon: 'terminal-win' as BrandIconName },
				{ name: 'Vitest', icon: 'vitest' as BrandIconName }
			]
		},
		{
			title: 'DevOps & Cloud',
			icon: 'cat-devops' as BrandIconName,
			items: [
				{ name: 'Docker', icon: 'docker' as BrandIconName },
				{ name: 'Kubernetes', icon: 'kubernetes' as BrandIconName },
				{ name: 'Cloudflare', icon: 'cloudflare' as BrandIconName },
				{ name: 'GitHub Actions', icon: 'github-actions' as BrandIconName },
				{ name: 'Linux / Bash', icon: 'linux' as BrandIconName }
			]
		},
		{
			title: 'Video & Broadcast',
			icon: 'cat-video' as BrandIconName,
			items: [
				{ name: 'Premiere Pro', icon: 'premiere' as BrandIconName },
				{ name: 'After Effects', icon: 'aftereffects' as BrandIconName },
				{ name: 'CapCut', icon: 'capcut' as BrandIconName },
				{ name: 'DaVinci Resolve', icon: 'davinci' as BrandIconName },
				{ name: 'OBS Broadcast', icon: 'obs' as BrandIconName }
			]
		},
		{
			title: 'Design & Motion',
			icon: 'cat-motion' as BrandIconName,
			items: [
				{ name: 'Motion.dev', icon: 'motion' as BrandIconName },
				{ name: 'Figma', icon: 'figma' as BrandIconName },
				{ name: 'Playwright', icon: 'playwright' as BrandIconName },
				{ name: 'Aura Design System', icon: 'aura-ds' as BrandIconName }
			]
		}
	]
};

export interface ProjectDetailTheme {
	bg: string;
	text: string;
	highlight: string;
	btnBg: string;
	btnText: string;
}

export interface ProjectExtraLink {
	label: string;
	href: string;
}

export interface ProjectWork {
	id: string;
	code: string;
	title: string;
	shortTitle: string;
	year: string;
	domain: string;
	cardRank: string;
	clientOrType: string;
	category: string;
	lusionTags: string;
	services: string[];
	badge?: string;
	description: string;
	metricHeadline: string;
	metricDetail: string;
	tech: string[];
	link?: string;
	extraLinks?: ProjectExtraLink[];
	ctaText: string;
	previewImage: string;
	secondaryImage?: string;
	isAnimatedGif?: boolean;
	iconUrl?: string;
	accentColor: string;
	detailTheme: ProjectDetailTheme;
}

export interface MotionReelItem {
	id: string;
	projectIndex: number;
	label: string;
	sublabel: string;
	gifSrc: string;
}

export const MOTION_REELS: MotionReelItem[] = [
	{
		id: 'vtuber-reel',
		projectIndex: 4,
		label: 'VTUBER EDIT REEL · Reva Regalia『AST』',
		sublabel: 'PR · AE · CAPCUT · DAVINCI',
		gifSrc: '/images/vtuber-reel.gif'
	},
	{
		id: 'tiktok-amv-reel',
		projectIndex: 5,
		label: 'TIKTOK AMV REEL · @paflimhacker',
		sublabel: '15.3K VIEWS · AKAZA AMV',
		gifSrc: '/images/tiktok-amv-reel.gif'
	}
];

export const PROJECTS_DATA: ProjectWork[] = [
	{
		id: 'fivem-webstore',
		code: 'CASE // 01',
		title: 'WEB STORE SCRIPT FIVEM',
		shortTitle: 'NT FiveM Store',
		year: '2026',
		domain: 'nt-developer.online',
		cardRank: 'A',
		clientOrType: 'NT DEVELOPER STUDIO',
		category: 'Web App & API',
		lusionTags: 'CONCEPT • WEB STORE • CRM • API LICENSE • SECURITY',
		services: [
			'UX / UI Redesign',
			'Web Storefront',
			'CRM & HR Engine',
			'API License System',
			'Security Hardening'
		],
		badge: 'PRODUCTION LIVE',
		description:
			'ระบบ Web Store สำหรับขาย Script FiveM พร้อมระบบ CRM, HR และ API License สำหรับเชื่อมต่อกับ Script FiveM อย่างปลอดภัย',
		metricHeadline: 'ปรับโครงสร้าง UX/UI และระบบจัดการ Script ใหม่',
		metricDetail:
			'ออกแบบโครงสร้าง UX/UI ใหม่เพื่อให้จัดการ Script และสินค้าได้สะดวกขึ้น พร้อมปิดช่องโหว่ PHP2Shell และปรับปรุงความเร็วของระบบ',
		tech: ['Svelte', 'PostgreSQL', 'Redis', 'API License', 'Security Hardening'],
		link: 'https://nt-developer.online/',
		ctaText: 'LAUNCH PROJECT',
		previewImage: '/images/work-fivem.jpg',
		accentColor: '#e60012',
		detailTheme: {
			bg: '#141417',
			text: '#FFFDE6',
			highlight: '#FF3B4E',
			btnBg: '#FFFDE6',
			btnText: '#141417'
		}
	},
	{
		id: 'bunni-pos',
		code: 'IN-HOUSE // 02',
		title: 'Bunni POS',
		shortTitle: 'Bunni POS',
		year: '2026',
		domain: 'hamster-software.cloud',
		cardRank: 'K',
		clientOrType: 'HAMSTER SOFTWARE HOUSE',
		category: 'All-in-One POS Platform',
		lusionTags: 'PRODUCT • POS PLATFORM • WEB • DESIGN • HARDWARE SYNC',
		services: [
			'Product Design',
			'Cross-Platform POS',
			'Inventory & Analytics',
			'Cloudflare Edge',
			'Hardware Integration'
		],
		badge: 'เริ่มต้นที่ 199฿ ต่อเดือน',
		description:
			'ระบบจัดการร้านค้า All-in-One สำหรับร้านอาหาร บุฟเฟ่ต์ ร้านขายของชำ และร้านชั่งกิโล ครอบคลุมการจัดการสินค้า สต็อก ยอดขาย และรายงานสรุปผลในที่เดียว รองรับทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์',
		metricHeadline: 'ระบบ POS และการเชื่อมต่ออุปกรณ์หน้าร้านข้ามแพลตฟอร์ม',
		metricDetail:
			'รองรับการใช้งานข้ามระบบปฏิบัติการ พร้อมเชื่อมต่อฮาร์ดแวร์หน้าร้านเพื่อช่วยให้การบริหารสต็อกและยอดขายเป็นระบบมากขึ้น',
		tech: ['SvelteKit', 'TypeScript', 'PostgreSQL', 'Cloudflare', 'POS Hardware Sync'],
		link: 'https://hamster-software.cloud/',
		ctaText: 'LAUNCH PROJECT',
		previewImage: '/images/work-bunni.jpg',
		iconUrl: 'https://hamster-software.cloud/Bunni_POS_Kawaii.png',
		accentColor: '#fb7185',
		detailTheme: {
			bg: '#18141a',
			text: '#FFFDE0',
			highlight: '#F65893',
			btnBg: '#FFFDE0',
			btnText: '#192743'
		}
	},
	{
		id: 'banwangg',
		code: 'WORKSPACE // 03',
		title: 'banwangg (บ้านว่าง)',
		shortTitle: 'banwangg',
		year: '2026',
		domain: 'banwangg.app',
		cardRank: 'Q',
		clientOrType: 'PAPERX CORE WORKSPACE',
		category: 'Property & Interactive Map Platform',
		lusionTags: 'CONCEPT • PROPERTY • BTS/MRT MAP • SVELTEKIT • BUN',
		services: [
			'Interactive Transit Map',
			'Property Discovery UI',
			'Drizzle ORM Schema',
			'Playwright Map E2E',
			'Docker & Fly.io Ops'
		],
		badge: 'SVELTEKIT + DRIZZLE',
		description:
			'แพลตฟอร์มอสังหาริมทรัพย์และระบบค้นหาบ้านว่างแบบอินเทอร์แอคทีฟ มาพร้อมระบบแผนที่รถไฟฟ้า BTS / MRT ค้นหาตามทำเล, สถาปัตยกรรมฐานข้อมูล Drizzle ORM และชุดทดสอบ Playwright Map E2E เต็มรูปแบบ',
		metricHeadline: 'Full-Stack Transit Map & Property Engine',
		metricDetail:
			'ขับเคลื่อนด้วย Bun runtime, SvelteKit, Drizzle ORM, Biome, Docker และระบบค้นหาทรัพย์ตามสายรถไฟฟ้ากรุงเทพฯ',
		tech: ['SvelteKit', 'Drizzle ORM', 'Bun', 'Playwright Map', 'Fly.io', 'Docker'],
		link: 'https://hamster-software.cloud/',
		ctaText: 'LAUNCH PROJECT',
		previewImage: '/images/work-banwangg.jpg',
		accentColor: '#38bdf8',
		detailTheme: {
			bg: '#111620',
			text: '#F2F7FF',
			highlight: '#38BDF8',
			btnBg: '#F2F7FF',
			btnText: '#111620'
		}
	},
	{
		id: 'sytx-erp',
		code: 'IN-HOUSE // 04',
		title: 'SytxErp',
		shortTitle: 'SytxErp',
		year: '2026',
		domain: 'sytxerp.cloud',
		cardRank: 'J',
		clientOrType: 'HAMSTER SOFTWARE HOUSE',
		category: 'Enterprise Resource Planning',
		lusionTags: 'ENTERPRISE • ERP ARCHITECTURE • MODULAR • KUBERNETES',
		services: [
			'Modular ERP Core',
			'Accounting & Inventory',
			'Multi-Tenant Infra',
			'Kubernetes Scaling',
			'24/7 Enterprise SLA'
		],
		badge: 'ERP COMING SOON',
		description:
			'ระบบ Enterprise ERP ที่ออกแบบและพัฒนาโดยทีม In-house ของ Hamster Software House สำหรับการจัดการทรัพยากรองค์กร บัญชี และคลังสินค้า',
		metricHeadline: 'Modular Enterprise ERP',
		metricDetail:
			'สถาปัตยกรรมแบบ Modular ที่ออกแบบมาให้รองรับการขยายฟีเจอร์และการดูแลรักษาระยะยาวสำหรับงานองค์กร',
		tech: ['SvelteKit', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'Enterprise SLA'],
		link: 'https://hamster-software.cloud/',
		ctaText: 'LAUNCH PROJECT',
		previewImage: '/images/work-sytx.jpg',
		iconUrl: 'https://hamster-software.cloud/ChatGPT%20Image%20Sep%2021,%202026,%2004_25_22%20AM.png',
		accentColor: '#a855f7',
		detailTheme: {
			bg: '#15121d',
			text: '#F5F0FF',
			highlight: '#B978FF',
			btnBg: '#F5F0FF',
			btnText: '#15121D'
		}
	},
	{
		id: 'vtuber-editing',
		code: 'VIDEO // 05',
		title: 'VTuber Shorts Editing — Reva Regalia『AST』',
		shortTitle: 'VTuber Shorts Edit',
		year: '2026',
		domain: 'youtube.com/@RevaRegaliaAST',
		cardRank: '10',
		clientOrType: 'REVA REGALIA『AST』 (VTUBER)',
		category: 'VTuber Video Editing & Motion',
		lusionTags: 'VIDEO EDITING • VTUBER SHORTS • PR • AE • CAPCUT • DAVINCI',
		services: [
			'VTuber Highlight Cuts',
			'Kinetic Thai Captions',
			'VFX & Punch-In Zooms',
			'Premiere Pro & After Effects',
			'CapCut & DaVinci Resolve'
		],
		badge: 'LIVE MOTION GIF',
		description:
			'ผลงานตัดต่อคลิปสั้น YouTube Shorts ให้กับ VTuber ช่อง Reva Regalia『AST』 ("ชอบทุเรียน" และ "ฟ่อมมึงดิแชท" 1.1K+ views) เน้นจังหวะคัทคอมเมดี้, Kinetic Caption ภาษาไทย, เอฟเฟกต์ไฟ/ควัน/ซูมจังหวะมีม และ Sound Design ชวนดูจบคลิป',
		metricHeadline: 'Fast-Paced VTuber Shorts & Kinetic VFX',
		metricDetail:
			'ผลิตด้วยเวิร์กโฟลว์ Premiere Pro, After Effects, CapCut และ DaVinci Resolve ผสมจังหวะตัดต่อไวกับ VFX สไตล์อนิเมะ/สตรีมเมอร์',
		tech: ['Premiere Pro', 'After Effects', 'CapCut', 'DaVinci Resolve', 'Kinetic Type', 'VFX'],
		link: 'https://www.youtube.com/shorts/0wkf7uaarjc',
		extraLinks: [
			{ label: 'SHORT 01 · ชอบทุเรียน', href: 'https://www.youtube.com/shorts/Tw6-mk2TDAw' },
			{ label: 'SHORT 02 · ฟ่อมมึงดิแชท', href: 'https://www.youtube.com/shorts/0wkf7uaarjc' }
		],
		ctaText: 'WATCH ON YOUTUBE',
		previewImage: '/images/vtuber-reel.gif',
		isAnimatedGif: true,
		accentColor: '#c084fc',
		detailTheme: {
			bg: '#16111e',
			text: '#FCF5FF',
			highlight: '#C084FC',
			btnBg: '#FCF5FF',
			btnText: '#16111E'
		}
	},
	{
		id: 'tiktok-paflimhacker',
		code: 'CREATOR // 06',
		title: 'PaperX TikTok Channel (@paflimhacker)',
		shortTitle: 'TikTok @paflimhacker',
		year: '2026',
		domain: 'tiktok.com/@paflimhacker',
		cardRank: '9',
		clientOrType: 'PAPERX PERSONAL CHANNEL',
		category: 'Anime AMV & Gaming Edits',
		lusionTags: 'CREATOR CHANNEL • ANIME AMV • GAMING EDITS • AE • CAPCUT',
		services: [
			'Anime AMV Editing',
			'Typography & Lyrics VFX',
			'Gaming Highlight Cuts',
			'Color Grading (DaVinci)',
			'Short-Form Content Strategy'
		],
		badge: '25.7K TOP VIEWS · LIVE GIF',
		description:
			'ช่อง TikTok ส่วนตัวของ PaperX (@paflimhacker) รวบรวมผลงานตัดต่อ Anime AMV อย่าง อาคาสะ ปราสาทไร้ขอบเขต (15.3K views), จิ๋นซีฮ่องเต้, Elden Ring สไตล์มังงะ, คลิปเกม Jump Assemble (25.7K+ views) และงานคัสตอม Discord Profile Widget',
		metricHeadline: '25.7K+ Top Clip · 15.3K Akaza AMV · 4.6K+ Likes',
		metricDetail:
			'ทดลองเทคนิคการตัดต่อและ Motion Typography ทั้งใน After Effects, Premiere Pro, CapCut และ DaVinci Resolve ลงเผยแพร่จริงในคอมมูนิตี้อนิเมะและเกม',
		tech: ['After Effects', 'Premiere Pro', 'CapCut', 'DaVinci Resolve', 'AMV Sync', 'TikTok'],
		link: 'https://www.tiktok.com/@paflimhacker',
		ctaText: 'OPEN TIKTOK',
		previewImage: '/images/tiktok-amv-reel.gif',
		secondaryImage: '/images/work-tiktok-profile.jpg',
		isAnimatedGif: true,
		accentColor: '#ff2a5f',
		detailTheme: {
			bg: '#121116',
			text: '#FFF5F7',
			highlight: '#FF2A5F',
			btnBg: '#FFF5F7',
			btnText: '#121116'
		}
	}
];

export interface CensoredEnvVar {
	key: string;
	maskedValue: string;
	comment: string;
	trollReply: string;
}

export const ENV_CONTACTS: CensoredEnvVar[] = [
	{
		key: 'DATABASE_URL',
		maskedValue: '"postgresql://paperx:████████████████@ap-southeast-1.cloud:5432/prod"',
		comment: '# ฐานข้อมูลหลัก Production (ห้ามหลุดขึ้น Git เด็ดขาด)',
		trollReply: 'Access Denied — ไม่ให้แอบดูรหัสฐานข้อมูลหรอกครับ!'
	},
	{
		key: 'GITHUB_ACCESS_TOKEN',
		maskedValue: '"ghp_████████████████████████████████████"',
		comment: '# Personal Access Token สำหรับ Push ขึ้น github.com/PA-PaperX',
		trollReply: '403 Forbidden — ไฟล์ .env อยู่ใน .gitignore นะครับ!'
	},
	{
		key: 'HAMSTER_CLOUD_SECRET',
		maskedValue: '"hmst_live_████████████████████████████"',
		comment: '# คีย์ลับระบบ Hamster Software House & SytxErp',
		trollReply: 'ใจเย็นครับ! กดเปิดกี่รอบก็ไม่ให้เห็นคีย์ลับนะ'
	},
	{
		key: 'CLOUDFLARE_R2_KEY',
		maskedValue: '"cf_r2_████████████████████████████████"',
		comment: '# Storage Secret สำหรับไฟล์และสื่อทั้งหมด',
		trollReply: 'เซนเซอร์แน่นมากครับ เลื่อนลงไปดู GitHub ข้างล่างแทนดีกว่า ↓'
	},
	{
		key: 'JWT_SIGNING_SECRET',
		maskedValue: '"████████████████████████████████████████"',
		comment: '# Signing Key ระดับระบบตรวจสอบสิทธิ์',
		trollReply: 'Nice try! ตัวแปรนี้ถูกล็อกโดย PaperX Security'
	},
	{
		key: 'DEVOPS_K8S_TOKEN',
		maskedValue: '"k8s_prod_██████████████████████████████"',
		comment: '# คลัสเตอร์ DevOps (รางวัลเหรียญทองระดับภาคฯ)',
		trollReply: 'ไม่อนุญาตให้เปิดครับ! ลองเลื่อนลงไปกด Push ขึ้น GitHub เลย ↓'
	}
];

export interface SocialChannel {
	id: string;
	name: string;
	handle: string;
	href: string;
	icon: IconName;
	brandColor: string;
}

export const SOCIAL_LINKS: SocialChannel[] = [
	{
		id: 'tiktok',
		name: 'TikTok',
		handle: '@paflimhacker',
		href: 'https://www.tiktok.com/@paflimhacker',
		icon: 'tiktok',
		brandColor: '#ff2a5f'
	},
	{
		id: 'facebook',
		name: 'Facebook',
		handle: 'HACKERfilm',
		href: 'https://www.facebook.com/HACKERfilm',
		icon: 'facebook',
		brandColor: '#1877f2'
	},
	{
		id: 'instagram',
		name: 'Instagram',
		handle: '@9f_someone',
		href: 'https://www.instagram.com/9f_someone/',
		icon: 'instagram',
		brandColor: '#e4405f'
	},
	{
		id: 'youtube',
		name: 'YouTube',
		handle: '@PaperX-kr3yb',
		href: 'https://www.youtube.com/@PaperX-kr3yb',
		icon: 'youtube',
		brandColor: '#ff0033'
	},
	{
		id: 'github',
		name: 'GitHub',
		handle: 'PA-PaperX',
		href: 'https://github.com/PA-PaperX',
		icon: 'github',
		brandColor: '#8b949e'
	}
];

export const GITHUB_PROFILE = {
	displayName: 'Treethossathep Inpomma',
	username: 'PA-PaperX',
	pronouns: 'he/him',
	profileUrl: 'https://github.com/PA-PaperX',
	avatarSrc: 'https://avatars.githubusercontent.com/u/146032566?v=4',
	followers: 4,
	following: 5,
	repoCount: 34,
	starCount: 33,
	contributionsHeading: '337 contributions in the last year',
	years: ['2026', '2025', '2024', '2023'],
	monthLabels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
	// Exact 7-row (Sun..Sat) x 53-week real activity matrix from https://github.com/PA-PaperX!
	contributionMatrix: [
		'02002100030020000002000000000010000000100200001000300',
		'00000000000110000000000000022000000100000002001000100',
		'00000000000101000001000001000000000000000000020000000',
		'00001001200002000000000000000000010000000000404000010',
		'00001000000001000001000001000000020110000000403010100',
		'00000030000000000000000042000000021004000100401000000',
		'00000120000000000000020010000000020004000030100002200'
	],
	popularRepositories: [
		{
			name: 'TweakGame',
			url: 'https://github.com/PA-PaperX/TweakGame',
			visibility: 'Public',
			description: 'Competitive game configuration and NVIDIA profile utility for Windows',
			language: 'Rust',
			languageColor: '#dea584',
			stars: 2
		},
		{
			name: 'Esport_Control_Panel',
			url: 'https://github.com/PA-PaperX/Esport_Control_Panel',
			visibility: 'Public',
			description: '',
			language: 'HTML',
			languageColor: '#e34c26',
			stars: 1
		},
		{
			name: 'Aura-Full',
			url: 'https://github.com/PA-PaperX/Aura-Full',
			visibility: 'Public',
			description: '',
			language: 'HTML',
			languageColor: '#e34c26',
			stars: 1
		},
		{
			name: 'Wan-Sunthon-Phu',
			url: 'https://github.com/PA-PaperX/Wan-Sunthon-Phu',
			visibility: 'Public',
			description: '',
			language: 'TypeScript',
			languageColor: '#3178c6',
			stars: 1
		},
		{
			name: 'Rov-layout-esport',
			url: 'https://github.com/PA-PaperX/Rov-layout-esport',
			visibility: 'Public',
			description:
				'layout สำหรับสตรีมคู่กับ Esports Dash เป็นส่วนเสริมกับ Obs สำหรับสตรีมงานแข่งที่สะดวก',
			language: 'HTML',
			languageColor: '#e34c26',
			stars: 0
		},
		{
			name: 'PaperX-template',
			url: 'https://github.com/PA-PaperX/PaperX-template',
			visibility: 'Public',
			description: '',
			language: 'TypeScript',
			languageColor: '#3178c6',
			stars: 0
		}
	],
	achievements: [
		{
			name: 'Pull Shark',
			url: 'https://github.com/PA-PaperX?achievement=pull-shark&tab=achievements',
			imageSrc: 'https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png'
		}
	],
	organizations: [
		{
			name: 'secretdotorg',
			url: 'https://github.com/secretdotorg',
			avatarSrc: 'https://avatars.githubusercontent.com/u/217834644?s=64&v=4'
		},
		{
			name: 'hamster-software-house',
			url: 'https://github.com/hamster-software-house',
			avatarSrc: 'https://avatars.githubusercontent.com/u/257796303?s=64&v=4'
		},
		{
			name: 'ntdev-fivem',
			url: 'https://github.com/ntdev-fivem',
			avatarSrc: 'https://avatars.githubusercontent.com/u/353979162?s=64&v=4'
		},
		{
			name: 'it-technocom',
			url: 'https://github.com/it-technocom',
			avatarSrc: 'https://avatars.githubusercontent.com/u/354280441?s=64&v=4'
		}
	]
};
