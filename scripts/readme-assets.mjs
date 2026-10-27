// Generates the profile README artwork in docs/readme/: hero banner, metrics strip, project and skill icons,
// divider (SVG, light and dark) and the showcase (PNG), composed from live screenshots of juangomezb.com.
//
//   npm install && npm run readme:assets
//
// GitHub shows README images through <img>: plain SVG, no external fonts or scripts. CSS animations inside the
// SVG do run there, and they stop under prefers-reduced-motion.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../docs/readme/", import.meta.url));
await mkdir(out, { recursive: true });

const site = "https://www.juangomezb.com";

// The personal brand is the one on juangomezb.com (emerald and violet), so the profile and the site read as one;
// amber is the accent every project README shares.
const brand = { emerald: "#047857", mint: "#10b981", violet: "#7c3aed", lilac: "#a78bfa", amber: "#f59e0b", green: "#16a34a" };

const themes = {
	dark: { bg: "#0a0f0d", panel: "#111816", card: "#151d1a", border: "#26332e", text: "#f1f5f9", muted: "#94a3b8", line: "#2a3833", dot: "#ffffff", dotOpacity: 0.06, orb: 0.3, accent: brand.mint },
	light: { bg: "#f6faf8", panel: "#ffffff", card: "#ffffff", border: "#dbe7e1", text: "#0f172a", muted: "#475569", line: "#d3e2da", dot: "#047857", dotOpacity: 0.07, orb: 0.14, accent: brand.emerald },
};

const sans = `'Segoe UI', Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif`;
const mono = `'Cascadia Code', 'SFMono-Regular', Consolas, Menlo, monospace`;
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function defs(t) {
	return `
	<linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${brand.mint}"/><stop offset=".55" stop-color="${brand.violet}"/><stop offset="1" stop-color="${brand.lilac}"/></linearGradient>
	<linearGradient id="metric" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${brand.mint}"/><stop offset=".6" stop-color="${brand.violet}"/><stop offset="1" stop-color="${brand.amber}"/></linearGradient>
	<radialGradient id="orbMain"><stop offset="0" stop-color="${brand.mint}" stop-opacity="${t.orb}"/><stop offset="1" stop-color="${brand.mint}" stop-opacity="0"/></radialGradient>
	<radialGradient id="orbViolet"><stop offset="0" stop-color="${brand.violet}" stop-opacity="${t.orb * 0.8}"/><stop offset="1" stop-color="${brand.violet}" stop-opacity="0"/></radialGradient>
	<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${t.dot}" fill-opacity="${t.dotOpacity}"/></pattern>`;
}

// ── Hero: who I am, and what my projects have in common — every claim comes with a measured number ──────────────
// The figures are the ones each project's README and juangomezb.com case study publish.
const heroProjects = [
	["data-chat", "#be123c", "75 / 75", "eval questions right"],
	["docs-assistant", "#0f766e", "98 %", "hit@5, bilingual eval"],
	["invoice-extractor", "#1d4ed8", "0 / 42", "false auto-approvals"],
];

function hero(name) {
	const t = themes[name];
	const W = 1280;
	const H = 460;
	const chips = [".NET 10", "Claude", "MCP", "RAG · pgvector", "Next.js"];
	let x = 72;
	const chipSvg = chips
		.map((chip) => {
			const w = chip.length * 8.4 + 30;
			const g = `<g transform="translate(${x} 352)"><rect width="${w}" height="32" rx="16" fill="${t.panel}" stroke="${t.border}"/><text x="${w / 2}" y="21" text-anchor="middle" font-family="${sans}" font-size="14" font-weight="600" fill="${t.text}">${escape(chip)}</text></g>`;
			x += w + 8;
			return g;
		})
		.join("");

	const cards = heroProjects
		.map(
			([project, color, value, label], i) => `
<g transform="translate(676 ${58 + i * 112})" filter="url(#soft)"><g class="pop" style="animation-delay:${0.2 + i * 0.2}s">
	<rect width="264" height="88" rx="16" fill="${t.card}" stroke="${t.border}"/>
	<circle cx="22" cy="26" r="5" fill="${color}"/>
	<text x="34" y="30" font-family="${mono}" font-size="12.5" font-weight="700" fill="${t.text}">${project}</text>
	<text x="18" y="64" font-family="${sans}" font-size="24" font-weight="800" letter-spacing="-.02em" fill="url(#metric)">${escape(value)}</text>
	<text x="${18 + value.length * 13 + 14}" y="62" font-family="${sans}" font-size="12" fill="${t.muted}">${escape(label)}</text>
</g></g>
<path d="M940 ${102 + i * 112} C 966 ${102 + i * 112}, 966 230, 992 230" fill="none" stroke="${i === 1 ? brand.amber : t.accent}" stroke-width="2.2" class="flow"/>`,
		)
		.join("");

	const checks = ["evals and results in the repo", "cost metered on every call", "failures published too"]
		.map((line, i) => `<path d="M18 ${70 + i * 26}l4 4 8-8" fill="none" stroke="${t.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><text x="38" y="${75 + i * 26}" font-family="${sans}" font-size="12.5" fill="${t.muted}">${line}</text>`)
		.join("");

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">Juan Gómez</title>
<desc id="desc">Senior Software Engineer, .NET and AI, remote. 15+ years of .NET; now building AI that is measured: Claude behind a port, evals with real numbers, every call metered. Open to senior roles and freelance .NET and AI projects.</desc>
<style>
	.flow { stroke-dasharray: 6 7; animation: flow 1.6s linear infinite; }
	.pop { opacity: 0; animation: pop .5s ease-out forwards; }
	.glow { animation: glow 2.4s ease-in-out infinite alternate; }
	@keyframes flow { to { stroke-dashoffset: -26; } }
	@keyframes pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
	@keyframes glow { from { opacity: .55; } to { opacity: 1; } }
	@media (prefers-reduced-motion: reduce) { .flow, .glow { animation: none; } .pop { animation: none; opacity: 1; } }
</style>
<defs>${defs(t)}
	<clipPath id="frame"><rect width="${W}" height="${H}" rx="28"/></clipPath>
	<filter id="soft" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="${name === "dark" ? 0.45 : 0.12}"/></filter>
</defs>
<g clip-path="url(#frame)">
	<rect width="${W}" height="${H}" fill="${t.bg}"/>
	<rect width="${W}" height="${H}" fill="url(#dots)"/>
	<circle cx="180" cy="40" r="340" fill="url(#orbMain)"/>
	<circle cx="1080" cy="470" r="360" fill="url(#orbViolet)"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="28" fill="none" stroke="${t.border}"/>

<g transform="translate(72 70)">
	<rect width="404" height="30" rx="15" fill="${t.panel}" stroke="${t.border}"/>
	<circle cx="18" cy="15" r="4.5" fill="${brand.mint}" class="glow"/>
	<text x="31" y="20" font-family="${sans}" font-size="12.5" font-weight="700" letter-spacing=".1em" fill="${t.muted}">SENIOR SOFTWARE ENGINEER · .NET + AI · REMOTE</text>
</g>
<text x="66" y="176" font-family="${sans}" font-size="70" font-weight="800" letter-spacing="-.03em" fill="${t.text}">Juan <tspan fill="url(#brand)">Gómez</tspan></text>
<text x="72" y="232" font-family="${sans}" font-size="24" font-weight="600" fill="${t.text}">15+ years of .NET. Now building AI that is measured.</text>
<text x="72" y="270" font-family="${sans}" font-size="20" fill="${t.muted}">Claude behind a port, evals with real numbers, every call metered.</text>
<text x="72" y="302" font-family="${sans}" font-size="20" fill="${t.muted}">Open to senior roles and freelance .NET + AI projects.</text>
${chipSvg}
${cards}

<!-- What every project shares -->
<g transform="translate(992 130)" filter="url(#soft)">
	<rect width="220" height="200" rx="18" fill="${t.card}" stroke="${t.border}"/>
	<text x="18" y="34" font-family="${sans}" font-size="11.5" font-weight="700" letter-spacing=".08em" fill="${t.accent}">MEASURED, NOT CLAIMED</text>
	${checks}
	<g transform="translate(18 152)"><g class="pop" style="animation-delay:.9s">
		<rect width="148" height="24" rx="12" fill="${brand.green}" fill-opacity=".14" stroke="${brand.green}"/>
		<text x="74" y="16.5" text-anchor="middle" font-family="${sans}" font-size="12" font-weight="700" fill="${brand.green}">built in public ✓</text>
	</g></g>
	<circle cx="200" cy="29" r="4.5" fill="${brand.amber}" class="glow"/>
</g>
</svg>
`;
}

// ── Metrics: career facts from the CV, and the projects published on juangomezb.com ─────────────────────────
const metricItems = [
	["15+ years", "building software", "since 2010"],
	["6 brands", "on the platforms I build today", "Europe, Central America, Caribbean"],
	["7", "open-source .NET + AI projects", "results measured in each repo"],
	[">99.9%", "availability in production", "multinational platforms"],
];

function metrics(name) {
	const t = themes[name];
	const W = 1280;
	const H = 150;
	const col = W / metricItems.length;
	const cells = metricItems
		.map(
			([value, label, note], i) => `
	<g transform="translate(${col * i + col / 2} 0)">
		<text y="64" text-anchor="middle" font-family="${sans}" font-size="40" font-weight="800" letter-spacing="-.02em" fill="url(#metric)">${escape(value)}</text>
		<text y="94" text-anchor="middle" font-family="${sans}" font-size="16" font-weight="600" fill="${t.text}">${escape(label)}</text>
		<text y="116" text-anchor="middle" font-family="${sans}" font-size="13.5" fill="${t.muted}">${escape(note)}</text>
	</g>${i > 0 ? `<line x1="${col * i}" y1="36" x2="${col * i}" y2="114" stroke="${t.border}"/>` : ""}`,
		)
		.join("");
	const label = metricItems.map(([value, label, note]) => `${value} ${label}, ${note}.`).join(" ");
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escape(label)}">
<defs>${defs(t)}</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="${t.panel}" stroke="${t.border}"/>
${cells}
</svg>
`;
}

// ── Icons: Lucide glyphs (ISC license) on a gradient tile. Projects wear their own README's brand ──────────────
const glyphs = {
	"booking-agent": '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
	"data-chat": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
	"docs-assistant": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>',
	"invoice-extractor": '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
	"dotnet-ai-template": '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
	"talent-mcp": '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
	"claude-pr-review-bot": '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="6" y1="9" y2="21"/>',
	ai: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
	backend: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
	modernization: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
	frontend: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/>',
	cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
	leadership: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
};

const tiles = {
	"booking-agent": ["#4338ca", "#a5b4fc"],
	"data-chat": ["#be123c", "#fda4af"],
	"docs-assistant": ["#0f766e", "#2dd4bf"],
	"invoice-extractor": ["#1d4ed8", "#38bdf8"],
	"dotnet-ai-template": ["#334155", "#84cc16"],
	"talent-mcp": ["#2563eb", "#38bdf8"],
	"claude-pr-review-bot": ["#7c3aed", "#a78bfa"],
	ai: ["#047857", "#10b981"],
	backend: ["#5b21b6", "#a78bfa"],
	modernization: ["#b45309", "#fbbf24"],
	frontend: ["#0e7490", "#22d3ee"],
	cloud: ["#1e3a8a", "#60a5fa"],
	leadership: ["#9f1239", "#fb7185"],
};

function iconSvg(name) {
	const [from, to] = tiles[name];
	return `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="56" height="56" rx="16" fill="url(#g)"/>
<rect x=".75" y=".75" width="54.5" height="54.5" rx="15.25" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/>
<g transform="translate(16 16)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyphs[name]}</g>
</svg>
`;
}

const divider = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="24" viewBox="0 0 1280 24" aria-hidden="true">
<defs><linearGradient id="d" x1="0" x2="1"><stop offset="0" stop-color="${brand.mint}" stop-opacity="0"/><stop offset=".3" stop-color="${brand.mint}"/><stop offset=".7" stop-color="${brand.violet}"/><stop offset="1" stop-color="${brand.violet}" stop-opacity="0"/></linearGradient></defs>
<rect y="11" width="1280" height="2" rx="1" fill="url(#d)"/>
<rect x="632" y="4" width="16" height="16" rx="5" fill="${brand.emerald}"/><path d="M636.5 12l2.5 2.5 4.5-5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

for (const name of ["dark", "light"]) {
	await writeFile(`${out}hero-${name}.svg`, hero(name));
	await writeFile(`${out}metrics-${name}.svg`, metrics(name));
}

for (const name of Object.keys(glyphs)) {
	await writeFile(`${out}icon-${name}.svg`, iconSvg(name));
}

await writeFile(`${out}divider.svg`, divider);

// ── Showcase: the live portfolio — home and the projects page — as two browser windows on each theme ──────────
const browser = await chromium.launch();

async function capture(path, colorScheme) {
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme });
	await page.route("**/_vercel/**", (route) => route.abort());
	await page.goto(`${site}${path}`, { waitUntil: "networkidle", timeout: 120_000 });
	await page.waitForTimeout(1500);
	const image = `data:image/png;base64,${(await page.screenshot()).toString("base64")}`;
	await page.close();
	return image;
}

for (const name of ["dark", "light"]) {
	const t = themes[name];
	const home = await capture("/en", name);
	const projects = await capture("/en/projects", name);
	const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5 });
	const window = (left, top, width, url, image, z) => `
		<div class="window" style="left:${left}px;top:${top}px;width:${width}px;z-index:${z}"><div class="bar"><span class="d" style="background:#f87171"></span><span class="d" style="background:#fbbf24"></span><span class="d" style="background:#34d399"></span>
			<span class="url">${url}</span></div><div class="view"><img src="${image}"></div></div>`;
	await page.setContent(
		`<!doctype html><html><head><meta charset="utf-8"><style>
		* { box-sizing: border-box; margin: 0; } body { width: 100vw; height: 100vh; overflow: hidden; position: relative; background: ${t.bg}; font-family: ${sans}; }
		.dots { position: absolute; inset: 0; background-image: radial-gradient(${t.dot} 1px, transparent 1.2px); background-size: 22px 22px; opacity: ${t.dotOpacity * 1.4}; }
		.orb { position: absolute; border-radius: 50%; filter: blur(100px); }
		.o1 { width: 700px; height: 700px; left: -200px; top: -260px; background: ${brand.mint}; opacity: ${name === "dark" ? 0.3 : 0.16}; }
		.o2 { width: 700px; height: 700px; right: -220px; bottom: -300px; background: ${brand.violet}; opacity: ${name === "dark" ? 0.25 : 0.14}; }
		.window { position: absolute; border-radius: 16px; overflow: hidden; background: ${t.panel}; border: 1px solid ${t.border};
			box-shadow: 0 50px 100px -20px rgba(0,0,0,${name === "dark" ? 0.65 : 0.25}); }
		.bar { height: 40px; display: flex; align-items: center; gap: 8px; padding: 0 14px; border-bottom: 1px solid ${t.border}; }
		.d { width: 11px; height: 11px; border-radius: 50%; }
		.url { margin: 0 auto; width: 340px; height: 26px; border-radius: 8px; background: ${t.bg}; border: 1px solid ${t.border}; color: ${t.muted};
			font-size: 12.5px; display: flex; align-items: center; justify-content: center; }
		.view { overflow: hidden; } .view img { display: block; width: 100%; }
		</style></head><body><div class="dots"></div><div class="orb o1"></div><div class="orb o2"></div>
		${window(340, 50, 1200, "juangomezb.com/en/projects", projects, 1)}${window(50, 430, 760, "juangomezb.com", home, 2)}</body></html>`,
		{ waitUntil: "load" },
	);
	await page.screenshot({ path: `${out}showcase-${name}.png` });
	await page.close();
}

await browser.close();
console.log(`README artwork written to ${out}`);
