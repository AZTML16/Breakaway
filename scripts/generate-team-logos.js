/**
 * Generate a unique SVG crest image for every team in TEAMS.
 * Output: assets/team-logos/{LEAGUE}/{slug}.svg + js/team-logos/asset-map.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = fs.readFileSync(path.join(ROOT, 'js/game/00-data.js'), 'utf8');
const m = DATA.match(/var TEAMS\s*=\s*\{([\s\S]*?)\n\};/);
if (!m) throw new Error('Could not parse TEAMS from 00-data.js');
eval('var TEAMS={' + m[1] + '\n};');

function hashStr(s) {
  s = String(s || '');
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function slugify(name) {
  return String(name || 'team')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'team';
}

function nickOf(name) {
  const p = String(name || '').trim().split(/\s+/);
  return p[p.length - 1] || 'Team';
}

function cityOf(name) {
  const p = String(name || '').trim().split(/\s+/);
  return p.slice(0, -1).join(' ') || p[0] || '';
}

const PACKS = [
  { bg: '#0f1f1d', a: '#27ae60', s: '#1abc9c', t: '#f7fbf9' },
  { bg: '#1f1510', a: '#e67e22', s: '#c0392b', t: '#fdf6f0' },
  { bg: '#181828', a: '#a29bfe', s: '#6c5ce7', t: '#f0eefc' },
  { bg: '#0c1c32', a: '#5dade2', s: '#2874a6', t: '#f2f8fd' },
  { bg: '#221410', a: '#e74c3c', s: '#f39c12', t: '#fff8f4' },
  { bg: '#141d38', a: '#f4d03f', s: '#e59866', t: '#fffdf5' },
  { bg: '#102a24', a: '#48c9b0', s: '#16a085', t: '#f0fdf9' },
  { bg: '#281830', a: '#f06292', s: '#9b59b6', t: '#fff5fb' },
  { bg: '#1a2530', a: '#f7dc6f', s: '#bb8fce', t: '#fafafa' },
  { bg: '#0d1a22', a: '#1abc9c', s: '#3498db', t: '#ecf8fc' },
  { bg: '#1c1c1c', a: '#ecf0f1', s: '#95a5a6', t: '#ffffff' },
  { bg: '#152026', a: '#8395a7', s: '#ffffff', t: '#f4f6f8' },
  { bg: '#1a0f18', a: '#e84393', s: '#6c3483', t: '#fdeef6' },
  { bg: '#0e1a12', a: '#00b894', s: '#00cec9', t: '#e8fff8' },
  { bg: '#251808', a: '#fdcb6e', s: '#e17055', t: '#fff9e6' },
  { bg: '#120a22', a: '#a29bfe', s: '#fd79a8', t: '#f5f0ff' },
  { bg: '#081a22', a: '#74b9ff', s: '#0984e3', t: '#eaf6ff' },
  { bg: '#221a0a', a: '#fab1a0', s: '#d63031', t: '#fff5f0' },
  { bg: '#0f1520', a: '#55efc4', s: '#00b894', t: '#eafff7' },
  { bg: '#1c1028', a: '#fd79a8', s: '#a29bfe', t: '#fff5fb' },
  { bg: '#2a1f38', a: '#e4c04d', s: '#9b7ed9', t: '#f2ebe3' },
  { bg: '#0a2463', a: '#c8102e', s: '#ffffff', t: '#e8eef8' },
  { bg: '#0c1f3e', a: '#d4af37', s: '#3d6fb8', t: '#ffffff' },
  { bg: '#1a2430', a: '#d62828', s: '#94a3b8', t: '#eef2f7' },
  { bg: '#0a1628', a: '#ffd700', s: '#c0c8d8', t: '#f8f9fc' },
  { bg: '#1a1208', a: '#ff6b00', s: '#8b4513', t: '#fff4e8' },
  { bg: '#002868', a: '#bf9b30', s: '#ffffff', t: '#f5f0e8' },
  { bg: '#2d2d2d', a: '#ff5722', s: '#78909c', t: '#fff5f0' },
  { bg: '#0d2137', a: '#7ec8e3', s: '#ffffff', t: '#e8f4fc' },
  { bg: '#1a2838', a: '#89cff0', s: '#e8f4f8', t: '#f8fcff' },
  { bg: '#0f1f2e', a: '#a8d8ea', s: '#ffffff', t: '#f0f8ff' },
  { bg: '#121820', a: '#ffeb3b', s: '#546e7a', t: '#f5f5f5' }
];

const PHL_PAL = {
  Monarchs: { bg: '#2a1f38', a: '#e4c04d', s: '#9b7ed9', t: '#f2ebe3' },
  Voyageurs: { bg: '#0a2463', a: '#c8102e', s: '#ffffff', t: '#e8eef8' },
  Ramparts: { bg: '#0c1f3e', a: '#d4af37', s: '#3d6fb8', t: '#ffffff' },
  Sentinels: { bg: '#1a2430', a: '#d62828', s: '#94a3b8', t: '#eef2f7' },
  Stars: { bg: '#0a1628', a: '#ffd700', s: '#c0c8d8', t: '#f8f9fc' },
  Outlaws: { bg: '#1a1208', a: '#ff6b00', s: '#8b4513', t: '#fff4e8' },
  Colonials: { bg: '#1c2840', a: '#c8102e', s: '#f5f0e6', t: '#ffffff' },
  Ironclad: { bg: '#2c3e50', a: '#95a5a6', s: '#5d6d7e', t: '#ecf0f1' },
  Snowhawks: { bg: '#0d2137', a: '#7ec8e3', s: '#ffffff', t: '#e8f4fc' },
  Founders: { bg: '#002868', a: '#bf9b30', s: '#ffffff', t: '#f5f0e8' },
  Smelters: { bg: '#2d2d2d', a: '#ff5722', s: '#78909c', t: '#fff5f0' },
  Diplomats: { bg: '#1a365d', a: '#c8102e', s: '#002868', t: '#f0f4f8' },
  Tundra: { bg: '#1a2838', a: '#89cff0', s: '#e8f4f8', t: '#f8fcff' },
  Blizzard: { bg: '#0f1f2e', a: '#a8d8ea', s: '#ffffff', t: '#f0f8ff' },
  Tempest: { bg: '#1a1f2e', a: '#4fc3f7', s: '#607d8b', t: '#e8f4f8' },
  Rivermen: { bg: '#0d2818', a: '#4fc3f7', s: '#2e7d32', t: '#e8fff0' },
  Troubadours: { bg: '#2d1b3d', a: '#9b59b6', s: '#f1c40f', t: '#faf0ff' },
  Mountaineers: { bg: '#1e3a2f', a: '#66bb6a', s: '#8d6e63', t: '#f0fff4' },
  Roughnecks: { bg: '#1a1a0a', a: '#ffc107', s: '#5d4037', t: '#fff8e0' },
  Drillers: { bg: '#261610', a: '#d84315', s: '#ff8f00', t: '#fff5e8' },
  Rainmakers: { bg: '#0c1929', a: '#42a5f5', s: '#b0bec5', t: '#e8f4ff' },
  Tidal: { bg: '#0a2a2a', a: '#26a69a', s: '#80cbc4', t: '#e0f7f4' },
  Altitude: { bg: '#2d1b4e', a: '#7e57c2', s: '#eceff1', t: '#f5f0ff' },
  Archers: { bg: '#1a0a0a', a: '#e53935', s: '#ffd54f', t: '#fff5f5' },
  Neon: { bg: '#1a0a1f', a: '#ff00ff', s: '#00e5ff', t: '#fff0ff' },
  Storm: { bg: '#121820', a: '#ffeb3b', s: '#546e7a', t: '#f5f5f5' },
  Tide: { bg: '#0a1e3c', a: '#00bcd4', s: '#ffffff', t: '#e0f7fa' },
  Surf: { bg: '#00695c', a: '#ffcc80', s: '#4db6ac', t: '#fff8e8' },
  Rail: { bg: '#263238', a: '#ff7043', s: '#90a4ae', t: '#eceff1' },
  Scorch: { bg: '#1f1008', a: '#ff5722', s: '#ffab40', t: '#fff3e0' }
};

const AFFILIATE = { PHL: 1, NAML: 1, OJL: 1, QMJL: 1, WJL: 1, USJL: 1, PWDL: 1 };

function colorsFor(teamName, leagueKey, idx) {
  const nick = nickOf(teamName);
  if (AFFILIATE[leagueKey] && PHL_PAL[nick]) return PHL_PAL[nick];
  const h = (hashStr(teamName + '|' + leagueKey + '|' + idx) ^ Math.imul(idx + 1, 0x9e3779b1)) >>> 0;
  return PACKS[h % PACKS.length];
}

/** Mascot mark paths in 256-space (centered ~128,100). */
function markFor(nick, a, s, t) {
  const n = String(nick || '').toLowerCase();
  const rules = [
    [/bear|grizz|bruin|polar/, () => `<ellipse cx="128" cy="98" rx="38" ry="42" fill="${a}"/><ellipse cx="128" cy="108" rx="16" ry="12" fill="${s}" opacity=".4"/><circle cx="112" cy="90" r="6" fill="${t}"/><circle cx="144" cy="90" r="6" fill="${t}"/><path d="M100 72 L108 52 M148 52 L156 72" stroke="${s}" stroke-width="7" stroke-linecap="round"/>`],
    [/wolf|husky|hound|coyote|copperhead|timberwolf|wolfpack/, () => `<path d="M128 55l-28 28-22 48q-6 32 22 42h56q28-10 22-42l-22-48-28-28z" fill="${a}"/><circle cx="112" cy="108" r="5" fill="${t}"/><circle cx="144" cy="108" r="5" fill="${t}"/><path d="M98 78l-12-22M158 78l12-22" stroke="${s}" stroke-width="6" stroke-linecap="round"/>`],
    [/eagle|hawk|falcon|raptor|snowhawk|seahawk|icehawk|redhawk|wildhawk|steelhawk|nighthawk/, () => `<path d="M100 60q40 0 56 36 14 48-28 78-12-36 0-68-24-46z" fill="${a}"/><path d="M118 82 L128 68 L138 82" fill="${s}"/><circle cx="142" cy="92" r="6" fill="${t}"/>`],
    [/shark|whale|whaler|whalemen|fish|gator/, () => `<ellipse cx="118" cy="110" rx="36" ry="22" fill="${a}"/><circle cx="148" cy="96" r="18" fill="${a}"/><path d="M158 92l28-12v24z" fill="${s}"/><circle cx="146" cy="90" r="3" fill="${t}"/>`],
    [/lion|tiger|tigres|lynx|cat|panther|thundercat|wildcat|cougar/, () => `<ellipse cx="128" cy="100" rx="36" ry="32" fill="${a}"/><path d="M92 88 Q78 70 96 78 M164 88 Q178 70 160 78" fill="${s}"/><circle cx="114" cy="96" r="5" fill="${t}"/><circle cx="142" cy="96" r="5" fill="${t}"/><path d="M118 118 Q128 126 138 118" fill="none" stroke="${s}" stroke-width="4"/>`],
    [/dragon|drakon|dragoons/, () => `<path d="M90 120 Q110 50 150 70 Q180 90 170 130 Q140 150 110 140 Q85 130 90 120z" fill="${a}"/><path d="M150 78 L175 55 L168 85" fill="${s}"/><circle cx="148" cy="88" r="5" fill="${t}"/>`],
    [/storm|thunder|tempest|lightning|bolt|volt|voltage|surge|cyclone|tornado/, () => `<path d="M150 48 L78 130 h40 L95 200 L185 105 h-42 L150 48z" fill="${a}"/><path d="M140 70 L125 110" stroke="${s}" stroke-width="5" opacity=".7"/>`],
    [/fire|blaze|forge|scorch|furnace|ember|torch|smelter|neon|founders?/, () => `<path d="M128 55q28 32 20 62 20 14 16 42-22 14-40 0-20-30 0-44 18-14 16-44-8-32 20-60z" fill="${a}"/><path d="M128 85q12 24 0 48" fill="${s}" opacity=".5"/>`],
    [/ice|frost|freeze|blizzard|tundra|glacier|chill|snow|winter|aurora/, () => `<path d="M128 50 L148 95 L200 100 L160 132 L172 185 L128 158 L84 185 L96 132 L56 100 L108 95 Z" fill="${a}"/><circle cx="128" cy="118" r="14" fill="${s}" opacity=".35"/>`],
    [/star|stellar|northstar|comet/, () => `<path d="M128 48l18 42 46 5-34 32 10 45-40-24-40 24 10-45-34-32 46-5z" fill="${a}"/><circle cx="128" cy="118" r="48" fill="none" stroke="${s}" stroke-width="3" opacity=".4"/>`],
    [/crown|king|monarch|royal|regal|queen/, () => `<path d="M128 55l16 42h42l-34 28 14 42-38-24-38 24 14-42-34-28h42z" fill="${a}"/><rect x="112" y="168" width="32" height="22" rx="4" fill="${s}"/>`],
    [/wave|tide|tidal|surf|rain|harbour|harbor|mariner|sailor|voyage|seafar|dock|skiff|rapide|rapids/, () => `<path d="M55 105 Q85 85 115 100 T175 100 T220 105" fill="none" stroke="${a}" stroke-width="12"/><path d="M55 130 Q85 110 115 125 T175 125 T220 130" fill="none" stroke="${s}" stroke-width="12"/><path d="M55 155 Q85 135 115 150 T175 150 T220 155" fill="none" stroke="${t}" stroke-width="7" opacity=".45"/>`],
    [/mountain|mountaineer|summit|peak|alpine|altitude|rock/, () => `<path d="M48 175 L95 85 L128 130 L165 70 L220 175 Z" fill="${s}"/><path d="M95 85 L128 55 L165 85" fill="${a}"/>`],
    [/iron|steel|rail|rivet|smelt|armor|armory|ironclad|ironmen|ironwomen|ironspire|ironhorse/, () => `<rect x="102" y="55" width="52" height="100" rx="6" fill="${s}"/><rect x="110" y="62" width="36" height="18" fill="${a}"/><rect x="110" y="92" width="36" height="14" fill="${a}" opacity=".7"/><path d="M78 175 h100" stroke="${a}" stroke-width="16" stroke-linecap="round"/>`],
    [/miner|driller|roughneck|copper|prospect/, () => `<path d="M90 175 V95 l12 55 12-42 12 42 12-55 v80" fill="none" stroke="${a}" stroke-width="10" stroke-linecap="round"/><path d="M78 162 h100" stroke="${s}" stroke-width="8"/>`],
    [/horse|mustang|stallion|colt|stampede/, () => `<path d="M90 115q12-48 58-52 24 28 18 62-28 12-46-6-18 22-40 16 6-18 10-20z" fill="${a}"/><circle cx="142" cy="88" r="7" fill="${t}"/>`],
    [/ghost|phantom|spectre/, () => `<path d="M128 55c-36 22-48 70-36 105l36-22 36 22c12-35 0-83-36-105z" fill="${a}" opacity=".9"/><circle cx="114" cy="100" r="5" fill="${t}"/><circle cx="142" cy="100" r="5" fill="${t}"/>`],
    [/bird|raven|owl|cardinal|phoenix|phœnix/, () => `<path d="M70 120 Q128 40 186 120 Q148 150 128 145 Q108 150 70 120z" fill="${a}"/><circle cx="148" cy="100" r="6" fill="${t}"/>`],
    [/fox|bison|buck|stag|ram|pronghorn|caribou|moose/, () => `<ellipse cx="128" cy="115" rx="34" ry="28" fill="${a}"/><path d="M100 85 L95 55 L110 78 M156 85 L161 55 L146 78" stroke="${s}" stroke-width="7" stroke-linecap="round"/><circle cx="116" cy="110" r="4" fill="${t}"/><circle cx="140" cy="110" r="4" fill="${t}"/>`],
    [/cannon|canon|grenadier|centurion|spartan|sentinel|rampart|fort|colonial|cadet|command|lancer/, () => `<path d="M128 50l48 18v58q0 36-48 52-48-16-48-52V68z" fill="${s}"/><path d="M128 62l36 14v48q0 26-36 38-36-12-36-38V76z" fill="${a}" opacity=".85"/><path d="M128 78 v70" stroke="${t}" stroke-width="4" opacity=".4"/>`],
    [/rocket|jet|pilot|torpedo|express|force|circuit/, () => `<path d="M128 48 L98 165 h20 L110 200 h36 L128 165 h20 Z" fill="${a}"/><circle cx="128" cy="95" r="10" fill="${s}"/>`],
    [/viking|northmen|northwomen|norwester|heritage/, () => `<path d="M80 140 Q128 50 176 140 L160 165 L128 150 L96 165 Z" fill="${a}"/><path d="M100 95 L90 70 M156 95 L166 70" stroke="${s}" stroke-width="8" stroke-linecap="round"/>`],
    [/valkyrie|siren|pride/, () => `<path d="M128 55c-30 20-40 70-28 105l28-20 28 20c12-35 2-85-28-105z" fill="${a}"/><path d="M100 90 L90 70 M156 90 L166 70" stroke="${s}" stroke-width="6"/>`],
    [/academy|program|scholar|university|nittany/, () => `<text x="128" y="125" text-anchor="middle" font-family="Georgia, serif" font-size="72" font-weight="700" fill="${a}">${escapeXml((nick || 'U').charAt(0).toUpperCase())}</text>`],
    [/lumber|logger|timber|woods|pine|forest/, () => `<path d="M128 55 v70 M95 70 l20 30 M161 70 l-20 30" stroke="${s}" stroke-width="10" stroke-linecap="round"/><path d="M78 175 Q110 105 128 95 Q146 105 178 175" fill="${a}"/>`],
    [/scout|ranger|trapper|renegade|outlaw|bandit|raider|maverick|wildcard/, () => `<path d="M128 55 L88 165 h28 L105 200 h46 L140 165 h28 Z" fill="${a}"/><path d="M115 100 h26" stroke="${s}" stroke-width="6"/>`],
    [/hornet|scorpion|viper/, () => `<ellipse cx="128" cy="110" rx="28" ry="40" fill="${a}"/><path d="M100 90 L70 70 M156 90 L186 70" stroke="${s}" stroke-width="6"/><circle cx="118" cy="100" r="4" fill="${t}"/><circle cx="138" cy="100" r="4" fill="${t}"/>`],
    [/blade|skate|ice(?!$)/, () => `<path d="M80 90 h96 v20 H80z" fill="${a}"/><path d="M90 110 L70 170 h20 L100 120 M166 110 L186 170 h-20 L156 120" fill="${s}"/>`],
    [/sun|solar|sunblazer/, () => `<circle cx="128" cy="110" r="42" fill="none" stroke="${a}" stroke-width="8"/><path d="M128 55 l16 48 -16-10 -16 10z" fill="${s}"/><path d="M128 48 v14 M128 158 v14 M70 110 h14 M172 110 h14" stroke="${t}" stroke-width="5" opacity=".5"/>`],
    [/castle|capital|metro|union|liberty|heritage/, () => `<path d="M70 160 V90 h20 v-20 h20 v20 h20 v-25 h20 v25 h20 v-20 h20 v70 Z" fill="${a}"/><rect x="110" y="120" width="36" height="40" fill="${s}" opacity=".5"/>`],
    [/dynamo|motor|machine/, () => `<circle cx="128" cy="110" r="48" fill="none" stroke="${a}" stroke-width="10"/><circle cx="128" cy="110" r="22" fill="${s}"/><circle cx="128" cy="110" r="8" fill="${t}"/>`],
    [/avalanche|dust|sandstorm|fog/, () => `<path d="M60 140 Q100 60 150 100 Q190 50 220 130 Q160 160 60 140z" fill="${a}"/><path d="M80 150 Q130 110 200 155" fill="none" stroke="${s}" stroke-width="8"/>`]
  ];
  for (let i = 0; i < rules.length; i++) {
    if (rules[i][0].test(n)) return rules[i][1]();
  }
  // Fallback monogram
  const ini = escapeXml((nick || 'T').slice(0, 2).toUpperCase());
  return `<circle cx="128" cy="108" r="48" fill="none" stroke="${a}" stroke-width="8"/><text x="128" y="122" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="48" font-weight="800" fill="${a}">${ini}</text>`;
}

function escapeXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shortNick(nick) {
  let s = String(nick || 'TEAM');
  if (s.length <= 10) return s.toUpperCase();
  s = s.replace(/(ettes|ians|men|ers|ors|s)$/i, '');
  if (s.length <= 10) return s.toUpperCase();
  return s.slice(0, 9).toUpperCase() + '.';
}

function shellPath(kind) {
  if (kind === 0) return 'M128 28 L210 58 V140 Q210 200 128 228 Q46 200 46 140 V58 Z'; // classic shield
  if (kind === 1) return 'M128 32 A90 90 0 1 1 127.9 32 Z'; // circle
  if (kind === 2) return 'M128 30 L205 75 L185 175 L128 220 L71 175 L51 75 Z'; // hex
  if (kind === 3) return 'M48 55 H208 V175 Q208 210 128 225 Q48 210 48 175 Z'; // banner
  return 'M128 28 L200 50 L215 130 Q200 200 128 228 Q56 200 41 130 L56 50 Z'; // pointed
}

function buildSvg(teamName, leagueKey, idx) {
  const nick = nickOf(teamName);
  const city = cityOf(teamName);
  const c = colorsFor(teamName, leagueKey, idx);
  const h = hashStr(teamName + '|' + leagueKey);
  const shell = h % 5;
  const d = shellPath(shell);
  const mark = markFor(nick, c.a, c.s, c.t);
  const wm = escapeXml(shortNick(nick));
  const cityTag = escapeXml((city || leagueKey).split(/\s+/)[0].slice(0, 10).toUpperCase());
  const fs = wm.length > 8 ? 22 : wm.length > 6 ? 26 : 30;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="${escapeXml(teamName)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c.bg}"/>
      <stop offset="1" stop-color="${c.s}" stop-opacity=".35"/>
    </linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity=".45"/>
    </filter>
  </defs>
  <rect width="256" height="256" fill="${c.bg}"/>
  <path d="${d}" fill="url(#g)" stroke="${c.a}" stroke-width="8" filter="url(#sh)"/>
  <path d="${d}" fill="none" stroke="${c.t}" stroke-width="2" opacity=".25"/>
  <g transform="translate(0,-6)">${mark}</g>
  <text x="128" y="38" text-anchor="middle" font-family="Oswald, Arial Narrow, sans-serif" font-size="14" font-weight="700" fill="${c.a}" letter-spacing="2">${cityTag}</text>
  <text x="128" y="228" text-anchor="middle" font-family="Bebas Neue, Impact, sans-serif" font-size="${fs}" font-weight="700" fill="${c.t}" letter-spacing="1">${wm}</text>
  <text x="128" y="246" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="${c.s}" opacity=".7">${escapeXml(leagueKey)}</text>
</svg>
`;
}

const outRoot = path.join(ROOT, 'assets', 'team-logos');
const map = {};
let count = 0;

for (const lk of Object.keys(TEAMS)) {
  const dir = path.join(outRoot, lk);
  fs.mkdirSync(dir, { recursive: true });
  const teams = TEAMS[lk] || [];
  for (let i = 0; i < teams.length; i++) {
    const name = teams[i].n;
    let slug = slugify(name);
    const key = lk + '|' + name;
    // avoid collisions
    let file = slug + '.svg';
    let tries = 0;
    while (fs.existsSync(path.join(dir, file)) && tries < 20) {
      tries++;
      file = slug + '-' + tries + '.svg';
    }
    const rel = 'assets/team-logos/' + lk + '/' + file;
    fs.writeFileSync(path.join(dir, file), buildSvg(name, lk, i), 'utf8');
    map[key] = rel;
    count++;
  }
}

const mapJs =
  '/** Auto-generated team logo asset map — do not edit by hand. */\n' +
  'var TEAM_LOGO_ASSET_MAP=' +
  JSON.stringify(map, null, 0) +
  ';\n' +
  'function teamLogoAssetPath(teamName, leagueKey){\n' +
  "  if(typeof TEAM_LOGO_ASSET_MAP==='undefined'||!TEAM_LOGO_ASSET_MAP) return null;\n" +
  "  var lk=String(leagueKey||'');\n" +
  "  var n=String(teamName||'');\n" +
  '  return TEAM_LOGO_ASSET_MAP[lk+"|"+n]||TEAM_LOGO_ASSET_MAP["|"+n]||null;\n' +
  '}\n';

fs.writeFileSync(path.join(ROOT, 'js', 'team-logos', 'asset-map.js'), mapJs, 'utf8');
fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify({ generated: new Date().toISOString(), count, map }, null, 2), 'utf8');

console.log('Generated', count, 'team logos → assets/team-logos/');
console.log('Wrote js/team-logos/asset-map.js');
