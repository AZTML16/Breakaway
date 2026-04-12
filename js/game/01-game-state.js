/* breakaway — GAME STATE */
// ============================================================
// GAME STATE
// ============================================================
var G = {};
var momentTimer = null, timerSec = 10, curMoment = 0, gameMoments = [], gameMomentScores = [], gameStats = {}, curStrategy = 'bal';
var gameHomeScore = 0, gameAwayScore = 0;
var curOpponent = {n:'Opponent',e:'[-]'};
var cnNTC = false, cnBonus = false, cnRounds = 0, cnMaxSal = 0, cnMinSal = 0;
var cnTeamOffer = {sal:0,yrs:1};
var curFAOffers = [];
var pendingTrade = null;
var ptsLeft = 20;
var selPos = 'F', selSubPos = 'C', selArch = 'Sniper', selLeague = 'OJL';
var selXFactor = 'hard_worker';
var selPotential = 'support';
/** Personality / identity tag — tradeoffs + sim / playoff / world hooks */
var X_FACTORS = {
  clutch:          {name:'CLUTCH',          icon:'[*]', desc:'− REG SEASON (flat nights) · + PLAYOFFS & WORLD STAGE (raises ceiling when it matters).'},
  careless:        {name:'CARELESS',        icon:'[!]', desc:'Streaky: checks out when the team is losing / results pile up — but morale stays oddly steady. Playoffs & worlds: rises with the spotlight when things are going well (wins, confidence); soft D & extra GA mostly show up when the slump is on.'},
  hard_worker:     {name:'HARD WORKER',     icon:'[+]', desc:'+ consistency & XP · no flash — rarely steals the highlight reel.'},
  brat:            {name:'BRAT',            icon:'[B]', desc:'REG: fewer points & messy nights · PLAYOFFS/WORLD: thrives on noise — agitates, draws calls, rises when it counts.'},
  smart_iq:        {name:'SMART IQ',        icon:'[IQ]',desc:'+ reads & decisions · − sometimes overthinks / passes up risk.'},
  regular_season:  {name:'REG-SEASON STAR', icon:'[RS]',desc:'+ counting stats in the grind · − playoffs & best-on-best can shrink you.'},
  heavy_hitter:    {name:'HEAVY HITTER',    icon:'[H]', desc:'+ physical edge & wear-down · − extra PIM risk / fatigue in long runs.'},
  elite_vision:    {name:'ELITE VISION',    icon:'[EV]',desc:'+ playmaking & assist tilt · − shot-first selfish looks suffer.'},
  quick_release:   {name:'QUICK RELEASE',   icon:'[QR]', desc:'+ gets pucks off before lanes close (forward goal tilt) · − less time to scan — playmaking / setup suffers.'},
  good_stick:      {name:'GOOD STICK',      icon:'[⌇]',desc:'+ takeaways & stick checks (defense) · − can reach & take penalties.'},
  none:            {name:'NO X-FACTOR',     icon:'[--]',desc:'No special label — straight-line development.'}
};
var socialSubFilter = 'all';
var _pendingWeekSummaryCallback=null;
var _lastPlayoffRecapHTML='';
var _lastWorldStageHTML='';
var _lastPlayoffStats=null;
var _lastWorldStageStats=null;

function cl(v,a,b){return Math.max(a,Math.min(b,v));}
function ri(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function rd(a,b){return Math.random()*(b-a)+a;}
function shuf(arr){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=ri(0,i);var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function fmt(n){if(n>=1000000)return'$'+(Math.round(n/100000)/10)+'M';if(n>=1000)return'$'+Math.round(n/1000)+'K';return'$'+n;}
function fmtFollowers(n){
  n=Math.floor(n)||0;
  if(n>=1000000) return (n/1000000).toFixed(1)+'M';
  if(n>=10000) return Math.round(n/1000)+'K';
  return String(n);
}
function stripBracketIcons(s){
  return String(s==null?'':s).replace(/\[[^\]]*]/g,'').replace(/\s{2,}/g,' ').trim();
}
/** Display names: title-case words (handles save files that used ALL CAPS). */
function toDisplayName(s){
  s=String(s==null?'':s).trim();
  if(!s) return '';
  return s.split(/\s+/).map(function(w){
    if(!w) return '';
    if(w.indexOf('-')!==-1) return w.split('-').map(function(p){return toDisplayName(p);}).join('-');
    if(w.length===1) return w.toUpperCase();
    return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase();
  }).join(' ');
}
function toDisplayHometown(s){
  s=String(s==null?'':s).trim();
  if(!s) return '';
  var ix=s.indexOf(',');
  if(ix!==-1){
    var city=toDisplayName(s.slice(0,ix).trim());
    var rest=s.slice(ix+1).trim();
    if(!rest) return city;
    return city+', '+rest.toUpperCase();
  }
  return toDisplayName(s);
}
function normalizePlayerDisplayFields(o){
  if(!o||typeof o!=='object') return;
  if(o.first) o.first=toDisplayName(o.first);
  if(o.last) o.last=toDisplayName(o.last);
  if(o.hometown) o.hometown=toDisplayHometown(o.hometown);
}
function hexDarken(hex,f){
  var m=/^#([0-9a-f]{6})$/i.exec(hex||'');
  if(!m) return hex;
  var n=parseInt(m[1],16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  f=f==null?0.88:f;
  r=Math.round(r*f);g=Math.round(g*f);b=Math.round(b*f);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
function hexToRgba(hex,a){
  var m=/^#([0-9a-f]{6})$/i.exec(hex||'');
  if(!m||typeof a!=='number') return 'rgba(232,200,92,'+(a||0.4)+')';
  var n=parseInt(m[1],16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  return 'rgba('+r+','+g+','+b+','+a+')';
}
/** Blend two #RRGGBB colours (t=0 → a, t=1 → b). */
function hexBlend(hexA,hexB,t){
  var pa=/^#([0-9a-f]{6})$/i.exec(hexA||''), pb=/^#([0-9a-f]{6})$/i.exec(hexB||'');
  if(!pa||!pb) return hexA||'#040a12';
  t=cl(typeof t==='number'?t:0.5,0,1);
  var na=parseInt(pa[1],16), nb=parseInt(pb[1],16);
  var ra=(na>>16)&255,ga=(na>>8)&255,ba=na&255;
  var rb=(nb>>16)&255,gb=(nb>>8)&255,bb=nb&255;
  var r=Math.round(ra+(rb-ra)*t), g=Math.round(ga+(gb-ga)*t), b=Math.round(ba+(bb-ba)*t);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
function potentialTierWord(pk){
  var p=POTENTIALS[pk]||POTENTIALS.support;
  var map={MVP:'MVP',FRANCHISE:'Franchise',ELITE:'Elite',SUPPORT:'Support',DEPTH:'Depth',FRINGE:'Fringe',MINOR:'Minor'};
  return map[p.label]||p.label.charAt(0)+p.label.slice(1).toLowerCase();
}
function potentialUiShort(pk){
  return potentialTierWord(pk)+' potential';
}
function xFactorUiName(key){
  var xf=X_FACTORS[key]||X_FACTORS.none;
  var map={
    clutch:'Clutch',careless:'Careless',hard_worker:'Hard Worker',brat:'Brat',smart_iq:'Smart IQ',
    regular_season:'Reg-Season Star',heavy_hitter:'Heavy Hitter',elite_vision:'Elite Vision',
    quick_release:'Quick Release',good_stick:'Good Stick',none:'No X-Factor'
  };
  if(map[key]) return map[key];
  return stripBracketIcons(xf.name||'');
}
function hashStr(s){
  s=String(s||'');
  var h=2166136261>>>0;
  for(var i=0;i<s.length;i++){
    h^=s.charCodeAt(i);
    h=Math.imul(h,16777619)>>>0;
  }
  return h>>>0;
}
function teamPalette(){
  return {p:'var(--acc)',s:'var(--gold)',dark:'var(--rink)',border:'var(--rl)',text:'var(--wht)'};
}
/** PHL franchise nicknames (last word) → shared palette for farm/junior affiliates only (never college). */
var PHL_FRANCHISE_PALETTES={
  Monarchs:   {bg:'#2a1f38',accent:'#e4c04d',sec:'#9b7ed9',text:'#f2ebe3',trim:'#cfd5e6',style:0},
  Sentinels:  {bg:'#1a2430',accent:'#d62828',sec:'#94a3b8',text:'#eef2f7',trim:'#b8c0cc',style:1},
  Ramparts:   {bg:'#0c1f3e',accent:'#d4af37',sec:'#3d6fb8',text:'#ffffff',trim:'#a8c0e8',style:2},
  Voyageurs:  {bg:'#0a2463',accent:'#c8102e',sec:'#ffffff',text:'#e8eef8',trim:'#dde4f0',style:3}
};
/** Same crest as parent club only in pro/minor/major-junior/US junior chains (PHL↔NAML, OJL, etc.). */
var AFFILIATE_SHARED_LOGO_LEAGUES={PHL:1,NAML:1,OJL:1,QMJL:1,WJL:1,USJL:1,PWDL:1};
var PHL_NICKNAMES=(function(){
  var set={}, i, t, parts;
  for(i=0;i<TEAMS.PHL.length;i++){
    t=TEAMS.PHL[i].n;
    parts=t.split(/\s+/);
    if(parts.length) set[parts[parts.length-1]]=true;
  }
  return set;
})();
function phlFranchisePaletteForTeam(teamName, leagueKey){
  var lk=String(leagueKey||'');
  if(!AFFILIATE_SHARED_LOGO_LEAGUES[lk]) return null;
  var nick=teamNameParts(teamName).nick;
  if(!PHL_NICKNAMES[nick]||!PHL_FRANCHISE_PALETTES[nick]) return null;
  return PHL_FRANCHISE_PALETTES[nick];
}
function getTeamIndexInLeague(leagueKey, teamName){
  var arr=TEAMS[leagueKey];
  if(!arr||!teamName) return 0;
  for(var i=0;i<arr.length;i++){ if(arr[i].n===teamName) return i; }
  return (hashStr(teamName)%251)|0;
}
function isCollegeLeagueKey(lk){
  return lk==='NCHA'||lk==='NWCHA';
}
function collegeMarkLetter(teamName){
  var nick=teamNameParts(teamName).nick;
  if(!nick) return 'U';
  var ch=nick.charAt(0);
  if(!/[A-Za-z]/.test(ch)) ch='U';
  return ch.toUpperCase();
}
/** Short tag for college crest side panel (STATE / city chip) — escHtml before SVG. */
function collegeBannerTag(teamName){
  var parts=teamNameParts(teamName), c=String(parts.city||'').trim();
  if(/\bState\b/i.test(c)){
    var w=c.split(/\s+/).filter(Boolean)[0]||'ST';
    return w.length>5?w.slice(0,4).toUpperCase():w.toUpperCase();
  }
  if(/^U\.?S\.?\s/i.test(c)||/^United States/i.test(c)) return 'USA';
  var raw=c.replace(/^University of\s+/i,'').replace(/^The\s+/i,'');
  var tok=raw.split(/\s+/).filter(Boolean)[0]||'U';
  return tok.replace(/[^A-Za-z]/g,'').slice(0,4).toUpperCase()||'U';
}
/** Expanded, mostly-unique palettes for NCAA crests — `simple` = 2-tone look; omit or false = richer secondaries. */
var COLLEGE_JERSEY_PACKS=[
  {bg:'#1a1a2e',accent:'#f39c12',sec:'#d68910',text:'#f4f6f8',trim:'#7f8c8d',simple:true},
  {bg:'#2c1810',accent:'#e74c3c',sec:'#c0392b',text:'#fdf2f0',trim:'#a93226',simple:true},
  {bg:'#0d1b2a',accent:'#ffc857',sec:'#e8b44c',text:'#f8f9fa',trim:'#5c677d',simple:true},
  {bg:'#1b263b',accent:'#66fcf1',sec:'#45a29e',text:'#e8f4f8',trim:'#8892b0',simple:true},
  {bg:'#212121',accent:'#ff5252',sec:'#d32f2f',text:'#fafafa',trim:'#616161',simple:true},
  {bg:'#16213e',accent:'#e94560',sec:'#c73e54',text:'#f5f5f7',trim:'#6c6f8a',simple:true},
  {bg:'#1e3a2f',accent:'#7bed9f',sec:'#58b368',text:'#f0fff4',trim:'#4a7856',simple:true},
  {bg:'#2d132c',accent:'#ff6b9d',sec:'#c44569',text:'#fff5f8',trim:'#8b5a6b',simple:true},
  {bg:'#1a1f2e',accent:'#54a0ff',sec:'#2e86de',text:'#ebf5ff',trim:'#5f6f8a',simple:true},
  {bg:'#2f2438',accent:'#ffd93d',sec:'#f6c90e',text:'#fffbeb',trim:'#8b7a99',simple:true},
  {bg:'#0f1f1d',accent:'#27ae60',sec:'#1abc9c',text:'#f7fbf9',trim:'#b8ccc4'},
  {bg:'#1f1510',accent:'#e67e22',sec:'#c0392b',text:'#fdf6f0',trim:'#d4c4b8'},
  {bg:'#181828',accent:'#a29bfe',sec:'#6c5ce7',text:'#f0eefc',trim:'#c4c2dc'},
  {bg:'#0c1c32',accent:'#5dade2',sec:'#2874a6',text:'#f2f8fd',trim:'#a8c4de'},
  {bg:'#221410',accent:'#e74c3c',sec:'#f39c12',text:'#fff8f4',trim:'#e0c8bc'},
  {bg:'#141d38',accent:'#f4d03f',sec:'#e59866',text:'#fffdf5',trim:'#ddd4b8'},
  {bg:'#102a24',accent:'#48c9b0',sec:'#16a085',text:'#f0fdf9',trim:'#b0d4cc'},
  {bg:'#281830',accent:'#f06292',sec:'#9b59b6',text:'#fff5fb',trim:'#e0c8dc'},
  {bg:'#1a2530',accent:'#f7dc6f',sec:'#bb8fce',text:'#fafafa',trim:'#d5d8dc'},
  {bg:'#0d1a22',accent:'#1abc9c',sec:'#3498db',text:'#ecf8fc',trim:'#aed6f1'},
  {bg:'#152026',accent:'#8395a7',sec:'#ffffff',text:'#f4f6f8',trim:'#bdc3c7'},
  {bg:'#1a0f18',accent:'#e84393',sec:'#6c3483',text:'#fdeef6',trim:'#d7a8c8'},
  {bg:'#0e1a12',accent:'#00b894',sec:'#00cec9',text:'#e8fff8',trim:'#7dd3c0'},
  {bg:'#251808',accent:'#fdcb6e',sec:'#e17055',text:'#fff9e6',trim:'#f0c987'},
  {bg:'#120a22',accent:'#a29bfe',sec:'#fd79a8',text:'#f5f0ff',trim:'#c8b8e8'},
  {bg:'#081a22',accent:'#74b9ff',sec:'#0984e3',text:'#eaf6ff',trim:'#9ec8ea'},
  {bg:'#221a0a',accent:'#fab1a0',sec:'#d63031',text:'#fff5f0',trim:'#e8b4a8'},
  {bg:'#0f1520',accent:'#55efc4',sec:'#00b894',text:'#eafff7',trim:'#8fd4c1'},
  {bg:'#1c1028',accent:'#fd79a8',sec:'#a29bfe',text:'#fff5fb',trim:'#e0b8d8'},
  {bg:'#102018',accent:'#81ecec',sec:'#00b894',text:'#effffa',trim:'#a8ddd0'},
  {bg:'#201010',accent:'#ff7675',sec:'#fab1a0',text:'#fff0f0',trim:'#e8a8a8'},
  {bg:'#0a1620',accent:'#74b9ff',sec:'#a29bfe',text:'#f0f8ff',trim:'#b8c8e0'},
  {bg:'#18140c',accent:'#ffeaa7',sec:'#d63031',text:'#fffaf0',trim:'#e8d8a8'},
  {bg:'#120818',accent:'#dfe6e9',sec:'#b2bec3',text:'#ffffff',trim:'#c8ccd0'},
  {bg:'#0c1814',accent:'#55efc4',sec:'#636e72',text:'#e8fff8',trim:'#98b5aa'},
  {bg:'#1a1208',accent:'#fdcb6e',sec:'#6c5ce7',text:'#fff8e8',trim:'#d4c49a'},
  {bg:'#101828',accent:'#0984e3',sec:'#00cec9',text:'#e8f4ff',trim:'#90b8d8'},
  {bg:'#180c10',accent:'#ff7675',sec:'#6c5ce7',text:'#fff5f8',trim:'#d8a8b8'},
  {bg:'#0c1418',accent:'#00cec9',sec:'#0984e3',text:'#e8fcff',trim:'#88c4d4'},
  {bg:'#16100a',accent:'#e17055',sec:'#fdcb6e',text:'#fff5e8',trim:'#d8b898'},
  {bg:'#0a1814',accent:'#26de81',sec:'#20bf6b',text:'#e8fff0',trim:'#88d4a8'},
  {bg:'#140a1c',accent:'#a55eea',sec:'#26de81',text:'#f8f0ff',trim:'#c8a8e0'},
  {bg:'#101c14',accent:'#fed330',sec:'#0fb9b1',text:'#fffde8',trim:'#d8d088'},
  {bg:'#1c0c0c',accent:'#fc5c65',sec:'#fd9644',text:'#fff0f0',trim:'#e89890'},
  {bg:'#081820',accent:'#45aaf2',sec:'#4b7bec',text:'#e8f6ff',trim:'#98b8d8'},
  {bg:'#1c2838',accent:'#c9a227',sec:'#8b6914',text:'#f9f6ef',trim:'#6d4c41'},
  {bg:'#0a1628',accent:'#ff8c42',sec:'#e85d04',text:'#fff8f2',trim:'#1565c0'},
  {bg:'#241636',accent:'#b388ff',sec:'#7c4dff',text:'#f3e5f5',trim:'#ea80fc'},
  {bg:'#1a2e1a',accent:'#c6e377',sec:'#6a994e',text:'#f1faee',trim:'#386641'},
  {bg:'#3d1f1f',accent:'#ff6f61',sec:'#c44536',text:'#fff1f0',trim:'#f4a261'},
  {bg:'#1e2a3a',accent:'#00b4d8',sec:'#0077b6',text:'#e0f7fa',trim:'#90e0ef'},
  {bg:'#2b2d42',accent:'#ef233c',sec:'#d90429',text:'#edf2f4',trim:'#8d99ae'},
  {bg:'#132a13',accent:'#ffd60a',sec:'#ffc300',text:'#fffbeb',trim:'#2d6a4f'},
  {bg:'#231942',accent:'#ff7d00',sec:'#e85d04',text:'#fff3e6',trim:'#5a189a'}
];
function teamColorPack(teamName, leagueKey){
  var echo=phlFranchisePaletteForTeam(teamName, leagueKey);
  if(echo){
    return {
      bg:echo.bg,accent:echo.accent,secondary:echo.sec,text:echo.text,
      border:echo.trim?'rgba(255,255,255,.14)':'rgba(255,255,255,.12)',trim:echo.trim||'#d5dbe6',
      style:echo.style,echo:true,frameless:false,_logoHash:hashStr(teamName),_teamIdx:0,simplePalette:false
    };
  }
  var lk=String(leagueKey||'');
  var idx=getTeamIndexInLeague(lk, teamName);
  var nm=teamName||'TM';
  var h=(hashStr(nm+'|'+lk+'|'+idx)^Math.imul(idx+1,0x9e3779b1))>>>0;
  if(isCollegeLeagueKey(lk)){
    var ch=(hashStr(nm+'|NCAACREST|'+lk)^Math.imul(idx+11,0x85ebca6b)^Math.imul(nm.length,0x27d4eb2d))>>>0;
    var cp=COLLEGE_JERSEY_PACKS[ch%COLLEGE_JERSEY_PACKS.length];
    var ctrim=cp.trim||'#cfd8dc';
    var nickH=hashStr(teamNameParts(nm).nick||'nick');
    /* 24 layout shells × nickname xor × index → far fewer “twin” crests in standings */
    var cv=((ch^nickH)+Math.imul(idx,67)+Math.imul(nm.length,13))%24;
    var cfs=!!cp.simple;
    return {
      bg:cp.bg,accent:cp.accent,secondary:cp.sec,text:cp.text,
      border:'rgba(255,255,255,.1)',trim:ctrim,style:(ch+idx*13)%11,echo:false,
      frameless:((ch>>>5)^(idx*17))%5===0,simplePalette:cfs,_logoHash:ch,_teamIdx:idx,_collegeVariant:cv
    };
  }
  /* Large palette so same-league neighbours rarely share a crest */
  var packs=[
    {bg:'#0f1f1d',accent:'#27ae60',sec:'#1abc9c',text:'#f7fbf9',trim:'#b8ccc4'},
    {bg:'#1f1510',accent:'#e67e22',sec:'#c0392b',text:'#fdf6f0',trim:'#d4c4b8'},
    {bg:'#181828',accent:'#a29bfe',sec:'#6c5ce7',text:'#f0eefc',trim:'#c4c2dc'},
    {bg:'#0c1c32',accent:'#5dade2',sec:'#2874a6',text:'#f2f8fd',trim:'#a8c4de'},
    {bg:'#221410',accent:'#e74c3c',sec:'#f39c12',text:'#fff8f4',trim:'#e0c8bc'},
    {bg:'#141d38',accent:'#f4d03f',sec:'#e59866',text:'#fffdf5',trim:'#ddd4b8'},
    {bg:'#102a24',accent:'#48c9b0',sec:'#16a085',text:'#f0fdf9',trim:'#b0d4cc'},
    {bg:'#281830',accent:'#f06292',sec:'#9b59b6',text:'#fff5fb',trim:'#e0c8dc'},
    {bg:'#1a2530',accent:'#f7dc6f',sec:'#bb8fce',text:'#fafafa',trim:'#d5d8dc'},
    {bg:'#0d1a22',accent:'#1abc9c',sec:'#3498db',text:'#ecf8fc',trim:'#aed6f1'},
    {bg:'#1c1c1c',accent:'#ecf0f1',sec:'#95a5a6',text:'#ffffff',trim:'#7f8c8d'},
    {bg:'#152026',accent:'#8395a7',sec:'#ffffff',text:'#f4f6f8',trim:'#bdc3c7'},
    {bg:'#1a0f18',accent:'#e84393',sec:'#6c3483',text:'#fdeef6',trim:'#d7a8c8'},
    {bg:'#0e1a12',accent:'#00b894',sec:'#00cec9',text:'#e8fff8',trim:'#7dd3c0'},
    {bg:'#251808',accent:'#fdcb6e',sec:'#e17055',text:'#fff9e6',trim:'#f0c987'},
    {bg:'#120a22',accent:'#a29bfe',sec:'#fd79a8',text:'#f5f0ff',trim:'#c8b8e8'},
    {bg:'#081a22',accent:'#74b9ff',sec:'#0984e3',text:'#eaf6ff',trim:'#9ec8ea'},
    {bg:'#221a0a',accent:'#fab1a0',sec:'#d63031',text:'#fff5f0',trim:'#e8b4a8'},
    {bg:'#0f1520',accent:'#55efc4',sec:'#00b894',text:'#eafff7',trim:'#8fd4c1'},
    {bg:'#1c1028',accent:'#fd79a8',sec:'#a29bfe',text:'#fff5fb',trim:'#e0b8d8'},
    {bg:'#102018',accent:'#81ecec',sec:'#00b894',text:'#effffa',trim:'#a8ddd0'},
    {bg:'#201010',accent:'#ff7675',sec:'#fab1a0',text:'#fff0f0',trim:'#e8a8a8'},
    {bg:'#0a1620',accent:'#74b9ff',sec:'#a29bfe',text:'#f0f8ff',trim:'#b8c8e0'},
    {bg:'#18140c',accent:'#ffeaa7',sec:'#d63031',text:'#fffaf0',trim:'#e8d8a8'},
    {bg:'#120818',accent:'#dfe6e9',sec:'#b2bec3',text:'#ffffff',trim:'#c8ccd0'},
    {bg:'#0c1814',accent:'#55efc4',sec:'#636e72',text:'#e8fff8',trim:'#98b5aa'},
    {bg:'#1a1208',accent:'#fdcb6e',sec:'#6c5ce7',text:'#fff8e8',trim:'#d4c49a'},
    {bg:'#101828',accent:'#0984e3',sec:'#00cec9',text:'#e8f4ff',trim:'#90b8d8'},
    {bg:'#180c10',accent:'#ff7675',sec:'#6c5ce7',text:'#fff5f8',trim:'#d8a8b8'},
    {bg:'#0c1418',accent:'#00cec9',sec:'#0984e3',text:'#e8fcff',trim:'#88c4d4'},
    {bg:'#16100a',accent:'#e17055',sec:'#fdcb6e',text:'#fff5e8',trim:'#d8b898'},
    {bg:'#0a1814',accent:'#26de81',sec:'#20bf6b',text:'#e8fff0',trim:'#88d4a8'},
    {bg:'#140a1c',accent:'#a55eea',sec:'#26de81',text:'#f8f0ff',trim:'#c8a8e0'},
    {bg:'#101c14',accent:'#fed330',sec:'#0fb9b1',text:'#fffde8',trim:'#d8d088'},
    {bg:'#1c0c0c',accent:'#fc5c65',sec:'#fd9644',text:'#fff0f0',trim:'#e89890'},
    {bg:'#081820',accent:'#45aaf2',sec:'#4b7bec',text:'#e8f6ff',trim:'#98b8d8'}
  ];
  var p=packs[h%packs.length];
  var trim=p.trim||'#cfd8dc';
  var frameVar=((h>>>3)^(idx*13))%11;
  var frameless=!isCollegeLeagueKey(lk)&&(frameVar>=6);
  return {
    bg:p.bg,accent:p.accent,secondary:p.sec,text:p.text,
    border:'rgba(255,255,255,.1)',trim:trim,style:(h+idx*13)%11,echo:false,frameless:frameless,_logoHash:h,_teamIdx:idx,simplePalette:false
  };
}
function teamInitials(teamName){
  var parts=String(teamName||'TM').trim().split(/\s+/).filter(Boolean);
  if(!parts.length) return 'TM';
  if(parts.length===1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
}
function teamNameParts(teamName){
  var nm=String(teamName||'TEAM').replace(/\s+(W|JR)$/i,'').trim();
  /* Dev / affiliate tier words (not nicknames); strip so city + mascot parse correctly */
  nm=nm.replace(/\s+(Elite|Select|Premier|Academy|Reserve|Showcase|Alliance|Heritage|Summit|Beacon|Crest|Pulse|Program|Track|Circuit)$/i,'').trim();
  var p=nm.split(/\s+/).filter(Boolean);
  if(p.length<2) return {city:nm,nick:nm};
  return {city:p.slice(0,-1).join(' '),nick:p[p.length-1]};
}

/** Team colours: tint shell + panels + UI accents (gold/acc/ice/rl) from jersey palette. */
function applyTeamTheme(teamName){
  var r=document.documentElement;
  if(!teamName){
    ['--rink-soft','--rm-soft','--team-ice-glow','--rm','--gold','--acc','--ice','--rl','--glow-gold'].forEach(function(k){
      r.style.removeProperty(k);
    });
    try{
      var mt=document.querySelector('meta[name="theme-color"]');
      if(mt) mt.setAttribute('content','#040a12');
    }catch(e0){}
    return;
  }
  var lkTh=(typeof G!=='undefined'&&G&&G.leagueKey)?G.leagueKey:'';
  var c=teamColorPack(teamName,lkTh);
  var bg=c.bg, ac=c.accent, sc=c.secondary||c.sec||ac;
  /* Body + modals: stronger blend so the rink read as “your” colours (old 0.08–0.1 was nearly invisible). */
  r.style.setProperty('--rink-soft', hexBlend('#040a12', bg, 0.34));
  r.style.setProperty('--rm-soft', hexBlend('#081828', bg, 0.26));
  r.style.setProperty('--rm', hexBlend('#081828', bg, 0.22));
  r.style.setProperty('--team-ice-glow', hexToRgba(ac, 0.16));
  /* Primary UI accents — tabs, borders, highlights follow jersey accent + secondary. */
  var goldMix=hexBlend('#e8c85c', ac, 0.52);
  var accMix=hexBlend('#2ee6c8', sc, 0.42);
  var iceMix=hexBlend('#7ee8ff', ac, 0.38);
  var rlMix=hexBlend('#1a4a72', ac, 0.36);
  r.style.setProperty('--gold', goldMix);
  r.style.setProperty('--acc', accMix);
  r.style.setProperty('--ice', iceMix);
  r.style.setProperty('--rl', rlMix);
  r.style.setProperty('--glow-gold', hexToRgba(goldMix, 0.4));
  try{
    var m2=document.querySelector('meta[name="theme-color"]');
    if(m2) m2.setAttribute('content', hexBlend('#040a12', bg, 0.32));
  }catch(e1){}
}
/** Save % for UI from ratio 0..1 (e.g. 0.905 -> "90.5%"). */
function formatSvPctFromRatio(ratio){
  if(!(ratio>0)||!isFinite(ratio)) return '--';
  return (Math.round(ratio*1000)/10)+'%';
}
/** Season log rows may store svpct as percent (90.2) or legacy ratio (0.902). */
function formatSeasonLogSvPct(val){
  if(val==='--'||val==null||val==='') return '--';
  var n=typeof val==='number'?val:parseFloat(String(val),10);
  if(!isFinite(n)) return String(val);
  if(n>0 && n<=1) return (Math.round(n*1000)/10)+'%';
  return (Math.round(n*10)/10)+'%';
}
function ovr(attrs){var vals=Object.values(attrs);return Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length);}

/** Scout projection — dev rate nudges growth; ovrMin/Max kept for internal balance only. Attr caps are age-only. */
var POTENTIALS={
  mvp:{name:'MVP',label:'MVP',ovrMin:97,ovrMax:99,devRate:1.14,desc:'Rare Hart-level peak — scouts see you as a league MVP candidate. You can still miss or exceed it.'},
  franchise:{name:'FRANCHISE',label:'FRANCHISE',ovrMin:93,ovrMax:97,devRate:1.10,desc:'Face-of-the-franchise tier — the player a city builds around. Not a hard ceiling.'},
  elite:{name:'ELITE',label:'ELITE',ovrMin:88,ovrMax:93,devRate:1.05,desc:'Top-line / elite tools — drives offense and plays in every big situation.'},
  support:{name:'SUPPORT',label:'SUPPORT',ovrMin:83,ovrMax:88,devRate:1.0,desc:'Everyday middle-six support — reliable minutes, trusted role.'},
  depth:{name:'DEPTH',label:'DEPTH',ovrMin:78,ovrMax:85,devRate:0.86,desc:'Bottom-six / PK / depth minutes — limited offensive flash, high compete.'},
  fringe:{name:'FRINGE',label:'FRINGE',ovrMin:72,ovrMax:82,devRate:0.74,desc:'Bubble roster / AHL shuttle — fights for a jersey every season.'},
  minor:{name:'MINOR',label:'MINOR',ovrMin:40,ovrMax:75,minorUnder:true,devRate:0.62,desc:'Minor-league / spot call — toughest path to stick; scouts have doubts.'}
};
function getBaseAgeAttrCap(age){
  age=age||16;
  if(age<=20) return 99;
  if(age<=24) return 97;
  if(age<=28) return 96;
  return 92;
}
/** Max rating per attribute for this age (potential does not hard-cap attrs). */
function getAttrCapForAge(age){
  return cl(getBaseAgeAttrCap(age),65,99);
}
function escapeAttrTitle(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}
function getPotentialDevMult(potentialKey){
  var pk=(potentialKey&&POTENTIALS[potentialKey])?potentialKey:'support';
  return POTENTIALS[pk].devRate||1;
}
/** XP gains scale with the same curve (lower potential = slower season XP bar). */
function getPotentialXpMult(potentialKey){
  return cl(getPotentialDevMult(potentialKey),0.58,1.14);
}

function isGlitchEffectsEnabled(){
  try{return localStorage.getItem('breakawayGlitch')!=='0';}catch(e){return true;}
}
function onSettingsGlitchToggle(){
  var c=document.getElementById('set-glitch');
  try{localStorage.setItem('breakawayGlitch',c&&c.checked?'1':'0');}catch(e){}
}
/** Retro CRT layer toggles (localStorage). All default ON for full arcade vibe. */
function getFxBool(key,defVal){
  try{
    var v=localStorage.getItem(key);
    if(v===null||v==='') return defVal;
    return v!=='0';
  }catch(e){ return defVal; }
}
function applyRetroFxClasses(){
  var h=document.documentElement;
  var b=document.body;
  if(!h||!b) return;
  h.classList.toggle('fx-scanlines-off',!getFxBool('breakawayFxScanlines',true));
  h.classList.toggle('fx-phosphor-off',!getFxBool('breakawayFxPhosphor',true));
  b.classList.toggle('fx-grain-off',!getFxBool('breakawayFxGrain',true));
  b.classList.toggle('fx-bloom-off',!getFxBool('breakawayFxBloom',true));
  b.classList.toggle('fx-rgb-off',!getFxBool('breakawayFxRgb',true));
  b.classList.toggle('fx-vignette-off',!getFxBool('breakawayFxVignette',true));
  b.classList.toggle('fx-bezel-off',!getFxBool('breakawayFxBezel',true));
}
function onSettingsFxToggle(el){
  if(!el||!el.dataset.fx) return;
  try{ localStorage.setItem(el.dataset.fx, el.checked?'1':'0'); }catch(e){}
  applyRetroFxClasses();
}
function syncFxCheckboxesFromStorage(){
  var pairs=[
    ['set-fx-scan','breakawayFxScanlines'],
    ['set-fx-phosphor','breakawayFxPhosphor'],
    ['set-fx-grain','breakawayFxGrain'],
    ['set-fx-bloom','breakawayFxBloom'],
    ['set-fx-rgb','breakawayFxRgb'],
    ['set-fx-vignette','breakawayFxVignette'],
    ['set-fx-bezel','breakawayFxBezel']
  ];
  for(var i=0;i<pairs.length;i++){
    var el=document.getElementById(pairs[i][0]);
    if(el) el.checked=getFxBool(pairs[i][1],true);
  }
}
function applySettingsMusic(v){
  var p=cl(parseInt(v,10)||0,0,100);
  try{RetroSound.setMusicVolumePct(p);}catch(e){}
  var el=document.getElementById('set-music-pct');
  if(el) el.textContent=p+'%';
  updateSettingsHintText();
}
function applySettingsSfx(v){
  var p=cl(parseInt(v,10)||0,0,100);
  try{RetroSound.setSfxVolumePct(p);}catch(e){}
  var el=document.getElementById('set-sfx-pct');
  if(el) el.textContent=p+'%';
  updateSettingsHintText();
}
function refreshSettingsPanel(){
  try{
    var g=document.getElementById('set-glitch');
    if(g) g.checked=isGlitchEffectsEnabled();
    var mr=document.getElementById('set-music-range');
    var mu=document.getElementById('set-music-pct');
    if(mr&&RetroSound.getMusicVolumePct){ mr.value=String(RetroSound.getMusicVolumePct()); if(mu) mu.textContent=RetroSound.getMusicVolumePct()+'%';}
    var sr=document.getElementById('set-sfx-range');
    var su=document.getElementById('set-sfx-pct');
    if(sr&&RetroSound.getSfxVolumePct){ sr.value=String(RetroSound.getSfxVolumePct()); if(su) su.textContent=RetroSound.getSfxVolumePct()+'%';}
    syncFxCheckboxesFromStorage();
    refreshSaveSlotsUI();
  }catch(e){}
}
function updateSettingsHintText(){
  var h=document.getElementById('settings-hint');
  if(!h||!RetroSound.getMusicVolumePct) return;
  var m=RetroSound.getMusicVolumePct();
  var s=RetroSound.getSfxVolumePct();
  if(m<=0&&s<=0) h.textContent='ALL MUTED';
  else if(s<=0) h.textContent='NO SFX';
  else if(m<=0) h.textContent='NO MUSIC';
  else h.textContent='AUDIO / FX';
}
function openSettingsModal(){
  refreshSettingsPanel();
  openM('m-settings');
}

var SAVE_SLOT_COUNT=5;
var SAVE_KEY_PREFIX='breakawaySaveV2_';

function summarizeSnapshotForList(snap){
  if(!snap||!snap.G) return '—';
  var g=snap.G;
  var name=((g.first||'')+' '+(g.last||'')).trim()||'New player';
  var team=(g.team&&g.team.n)||'—';
  var wk=g.week!=null?g.week:'—';
  return name+' · WEEK '+wk+' · '+team;
}

function buildGameSnapshot(){
  var snap={
    v:2,
    savedAt:Date.now(),
    screenId:(document.querySelector('.screen.on')||{}).id||'s-title',
    summary:'',
    G:JSON.parse(JSON.stringify(G)),
    x:{
      timerSec:timerSec,curMoment:curMoment,gameMoments:gameMoments,gameStats:gameStats,curStrategy:curStrategy,
      gameHomeScore:gameHomeScore,gameAwayScore:gameAwayScore,curOpponent:curOpponent,
      cnNTC:cnNTC,cnBonus:cnBonus,cnRounds:cnRounds,cnMaxSal:cnMaxSal,cnMinSal:cnMinSal,
      cnTeamOffer:cnTeamOffer,curFAOffers:curFAOffers,pendingTrade:pendingTrade,
      ptsLeft:ptsLeft,selPos:selPos,selSubPos:selSubPos,selArch:selArch,selLeague:selLeague,socialSubFilter:socialSubFilter,
      _lastPlayoffRecapHTML:_lastPlayoffRecapHTML,
      _lastWorldStageHTML:_lastWorldStageHTML,
      _lastPlayoffStats:_lastPlayoffStats,
      _lastWorldStageStats:_lastWorldStageStats
    }
  };
  snap.summary=summarizeSnapshotForList(snap);
  return snap;
}

function reconcileTeamToLeague(){
  if(!G||!G.leagueKey||!G.team||!G.team.n) return;
  var pool=TEAMS[G.leagueKey];
  if(!pool||!pool.length) return;
  var found=false,i;
  for(i=0;i<pool.length;i++){
    if(pool[i].n===G.team.n){ found=true; break; }
  }
  if(!found) G.team=pool[0];
}
function applyGameSnapshot(snap){
  if(!snap||snap.v<1||!snap.G) return false;
  G=snap.G;
  normalizePlayerDisplayFields(G);
  reconcileTeamToLeague();
  if(G.xFactor==='sniper_xf') G.xFactor='quick_release';
  if(G.arch==='OQD') G.arch='OffensiveD';
  if(!G.potential||!POTENTIALS[G.potential]) G.potential='support';
  if(typeof G._inOffseason!=='boolean') G._inOffseason=false;
  if(typeof G.heightInches!=='number'||G.heightInches<=0) G.heightInches=parseHeightToInches(G.height);
  if(typeof G._physiqueStartHeightInches!=='number') G._physiqueStartHeightInches=G.heightInches;
  if(typeof G._physiqueStartWeight!=='number') G._physiqueStartWeight=G.weight||180;
  G.weight=roundWeightToTen(G.weight||180);
  G._physiqueStartWeight=roundWeightToTen(G._physiqueStartWeight||G.weight);
  if(typeof G._heightGainBudget!=='number') G._heightGainBudget=0;
  if(typeof G.cSimPerfSum!=='number') G.cSimPerfSum=0;
  if(typeof G.cSimPerfCount!=='number') G.cSimPerfCount=0;
  if(typeof G._tradeDemandSeason!=='number') G._tradeDemandSeason=0;
  if(typeof G.careerEarnings!=='number') G.careerEarnings=0;
  if(typeof G.socialFollowers!=='number') G.socialFollowers=800+ri(0,900);
  var x=snap.x||{};
  timerSec=(typeof x.timerSec==='number'&&x.timerSec>=0)?x.timerSec:10;
  curMoment=x.curMoment|0;
  gameMoments=Array.isArray(x.gameMoments)?x.gameMoments:[];
  gameStats=x.gameStats&&typeof x.gameStats==='object'?x.gameStats:{};
  curStrategy=x.curStrategy||'bal';
  gameHomeScore=+x.gameHomeScore||0;
  gameAwayScore=+x.gameAwayScore||0;
  curOpponent=x.curOpponent&&typeof x.curOpponent==='object'?x.curOpponent:{n:'Opponent',e:'[-]'};
  cnNTC=!!x.cnNTC;cnBonus=!!x.cnBonus;cnRounds=+x.cnRounds||0;cnMaxSal=+x.cnMaxSal||0;cnMinSal=+x.cnMinSal||0;
  cnTeamOffer=x.cnTeamOffer&&typeof x.cnTeamOffer==='object'?x.cnTeamOffer:{sal:0,yrs:1};
  curFAOffers=Array.isArray(x.curFAOffers)?x.curFAOffers:[];
  pendingTrade=x.pendingTrade!=null?x.pendingTrade:null;
  ptsLeft=+x.ptsLeft||0;
  selPos=x.selPos||'F';selSubPos=x.selSubPos||'C';selArch=x.selArch||'Sniper';selLeague=x.selLeague||'OJL';
  if(selArch==='OQD') selArch='OffensiveD';
  socialSubFilter=x.socialSubFilter||'all';
  _lastPlayoffRecapHTML=String(x._lastPlayoffRecapHTML!=null?x._lastPlayoffRecapHTML:'');
  _lastWorldStageHTML=String(x._lastWorldStageHTML!=null?x._lastWorldStageHTML:'');
  _lastPlayoffStats=x._lastPlayoffStats!=null?x._lastPlayoffStats:null;
  _lastWorldStageStats=x._lastWorldStageStats!=null?x._lastWorldStageStats:null;
  try{
    if(G.team&&G.team.n) applyTeamTheme(G.team.n);
    else applyTeamTheme(null);
  }catch(eTheme){}
  return true;
}

function refreshUIRAfterLoad(screenId){
  var id=screenId||'s-hub';
  try{
    if(id==='s-hub'){ renderHub(); return; }
    if(id==='s-ingame'){
      safeEl('ig-home-name').textContent=G._worldStageCtx?G._worldStageCtx.ev.nt:G.team.n;
      safeEl('ig-away-name').textContent=curOpponent.n;
      updateScoreboard();
      window._resumeTimerSec=(timerSec>0&&timerSec<=10)?timerSec:null;
      showMoment();
      return;
    }
    if(id==='s-pregame'){
      if(G._worldStageCtx){ preGame(0); return; }
      if(G._playoffCtx){
        G._playoffCtx.awaitingUserGame=true;
        preGame(0);
        return;
      }
      var idx=typeof G._curGameIdx==='number'?G._curGameIdx:0;
      if(idx>=0) preGame(idx);
      else{ renderHub(); show('s-hub'); notify('PREGAME RESTORE — HUB','gold'); }
      return;
    }
    if(id==='s-offseason'){
      G._inOffseason=true;
      safeEl('offseason-playoff-recap').innerHTML=_lastPlayoffRecapHTML;
      safeEl('offseason-world-stage').innerHTML=_lastWorldStageHTML;
      return;
    }
    if(id==='s-postgame'){
      renderHub(); show('s-hub'); notify('POSTGAME SCREEN RESET — HUB','gold'); return;
    }
    if(id==='s-create'||id==='s-arch'||id==='s-potential'||id==='s-xfactor'||id==='s-attrs'||id==='s-league'||id==='s-team'){
      renderHub(); show('s-hub'); notify('CREATE FLOW — OPENED HUB','gold'); return;
    }
    if(id==='s-contract'||id==='s-retire'||id==='s-howto'||id==='s-title'){
      renderHub(); show('s-hub'); notify('LOADED — HUB','gold'); return;
    }
    renderHub(); show('s-hub'); notify('OPENED HUB (safe)','gold');
  }catch(e){
    console.warn(e);
    try{renderHub();show('s-hub');notify('UI REFRESH ISSUE — HUB','red');}catch(e2){}
  }
}

function refreshSaveSlotsUI(){
  var el=document.getElementById('save-slots-container');
  if(!el) return;
  var html='';
  for(var s=1;s<=SAVE_SLOT_COUNT;s++){
    var meta=null;
    try{
      var raw=localStorage.getItem(SAVE_KEY_PREFIX+s);
      if(raw) meta=JSON.parse(raw);
    }catch(e){}
    var line=meta&&meta.summary?escHtml(meta.summary):'<span class="save-slot-meta"><b>EMPTY SLOT '+s+'</b></span>';
    if(meta&&meta.savedAt){
      try{line+='<br><span style="font-size:11px;opacity:.75">'+escHtml(new Date(meta.savedAt).toLocaleString())+'</span>';}catch(e2){}
    }
    html+='<div class="save-slot-row"><div class="save-slot-meta">'+line+'</div>';
    html+='<button type="button" class="btn bs" style="padding:4px 8px;font-size:12px" onclick="saveGameToSlot('+s+')">SAVE</button>';
    html+='<button type="button" class="btn bp" style="padding:4px 8px;font-size:12px" onclick="loadGameFromSlot('+s+')"'+(meta?'':' disabled')+'>LOAD</button>';
    html+='<button type="button" class="btn bd" style="padding:4px 8px;font-size:12px" onclick="clearGameSlot('+s+')"'+(meta?'':' disabled')+'>CLR</button></div>';
  }
  el.innerHTML=html;
}

function saveGameToSlot(slot){
  if(slot<1||slot>SAVE_SLOT_COUNT) return;
  function doSave(){
    try{
      var snap=buildGameSnapshot();
      var json=JSON.stringify(snap);
      localStorage.setItem(SAVE_KEY_PREFIX+slot,json);
      showSaveNotice('CAREER SAVED','Slot '+slot+' stored in this browser. Load it anytime from Settings.', 'saved');
      refreshSaveSlotsUI();
    }catch(e){
      if(e&&(e.name==='QuotaExceededError'||e.code===22)){
        showSaveNotice('STORAGE FULL','Free some browser storage, then try again.', 'error');
      } else {
        showSaveNotice('SAVE FAILED','Something went wrong writing your career.', 'error');
      }
    }
  }
  try{
    var had=null;
    try{had=localStorage.getItem(SAVE_KEY_PREFIX+slot);}catch(e0){}
    if(had&&had.length>10){
      confirmInGame('Overwrite save in slot '+slot+'?\n\nThe file already in this slot will be replaced.', doSave);
    } else {
      doSave();
    }
  }catch(e){
    showSaveNotice('SAVE FAILED','Could not access browser storage.', 'error');
  }
}

function loadGameFromSlot(slot){
  if(slot<1||slot>SAVE_SLOT_COUNT) return;
  var raw=null;
  try{raw=localStorage.getItem(SAVE_KEY_PREFIX+slot);}catch(e){}
  if(!raw){
    showSaveNotice('EMPTY SLOT','No career is saved in slot '+slot+'.', 'info');
    return;
  }
  confirmInGame('Load slot '+slot+'?\n\nAny unsaved progress in this session will be discarded.', function(){
    var snap=null;
    try{snap=JSON.parse(raw);}catch(e){
      showSaveNotice('CORRUPT SAVE','Slot '+slot+' could not be read.', 'error');
      return;
    }
    if(!applyGameSnapshot(snap)){
      showSaveNotice('INVALID SAVE','Slot '+slot+' is missing required data.', 'error');
      return;
    }
    clearTimerInterval();
    try{_pendingWeekSummaryCallback=null;}catch(e){}
    window._resumeTimerSec=null;
    closeM('m-settings');
    var sid=snap.screenId||'s-hub';
    show(sid);
    refreshUIRAfterLoad(sid);
    RetroSound.runWhenReady(function(){ try{RetroSound.syncMusicForScreen(sid);}catch(e){} });
    showSaveNotice('CAREER LOADED','Slot '+slot+' — welcome back.', 'ok');
  });
}

function clearGameSlot(slot){
  if(slot<1||slot>SAVE_SLOT_COUNT) return;
  try{
    if(!localStorage.getItem(SAVE_KEY_PREFIX+slot)){
      showSaveNotice('ALREADY EMPTY','Slot '+slot+' has no save data.', 'info');
      return;
    }
    confirmInGame('Delete save in slot '+slot+'?\n\nThis cannot be undone.', function(){
      try{
        localStorage.removeItem(SAVE_KEY_PREFIX+slot);
        showSaveNotice('SLOT CLEARED','Slot '+slot+' is now empty.', 'ok');
        refreshSaveSlotsUI();
      }catch(e){
        showSaveNotice('CLEAR FAILED','Could not remove that slot.', 'error');
      }
    });
  }catch(e){
    showSaveNotice('CLEAR FAILED','Could not access storage.', 'error');
  }
}

function show(id){
  var tgt=document.getElementById(id);
  if(!tgt){console.warn('show: missing screen',id);return;}
  if(id==='s-title'){
    try{applyTeamTheme(null);}catch(eTh0){}
  } else if(typeof G!=='undefined'&&G&&G.team&&G.team.n&&(id==='s-hub'||id==='s-ingame'||id==='s-pregame'||id==='s-postgame'||id==='s-offseason')){
    try{applyTeamTheme(G.team.n);}catch(eTh1){}
  }
  var reduceMotion=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var allowGlitchFX=!reduceMotion&&isGlitchEffectsEnabled();
  /* Full CRT cut: game beats + intro/load/story (more common than before) */
  var fullGlitchIds={'s-pregame':1,'s-ingame':1,'s-postgame':1,'s-game-intro':1,'s-story-opening':1,'s-game-loading':1};
  /* Softer snap: hub, career UI, create flow — always micro-glitch */
  var softMicroIds={'s-hub':1,'s-offseason':1,'s-contract':1,'s-create':1,'s-arch':1,'s-potential':1,'s-xfactor':1,'s-attrs':1,'s-league':1,'s-team':1,'s-howto':1,'s-retire':1};
  var isBigGameTransition=!!fullGlitchIds[id];
  var isSoftMicro=!isBigGameTransition&&!!softMicroIds[id];
  var randomMicro=!isBigGameTransition&&!isSoftMicro&&Math.random()<0.26;
  var doGlitchVisual=isBigGameTransition&&allowGlitchFX;
  var doGlitchMicro=(isSoftMicro||randomMicro)&&allowGlitchFX;
  var go=document.getElementById('glitch-overlay');
  if(go){
    go.classList.remove('glitch-active','glitch-micro-active','gv0','gv1','gv2');
  }
  if(doGlitchVisual){
    try{document.body.classList.add('glitching');}catch(e){}
    if(go){
      go.classList.add('gv'+ri(0,2));
      go.classList.add('glitch-active');
      go.setAttribute('aria-hidden','false');
    }
  } else if(doGlitchMicro){
    if(go){
      go.classList.add('gv'+ri(0,2));
      go.classList.add('glitch-micro-active');
      go.setAttribute('aria-hidden','false');
    }
  }
  var screens=document.querySelectorAll('.screen');
  for(var i=0;i<screens.length;i++) screens[i].classList.remove('on');
  tgt.classList.add('on');
  if(doGlitchVisual){
    tgt.classList.add('screen-glitch-in');
    tgt.classList.remove('gv-rev','gv-blur','screen-glitch-micro','gv-rev-micro','gv-blur-micro');
    var gvMode=ri(0,2);
    if(gvMode===1) tgt.classList.add('gv-rev');
    else if(gvMode===2) tgt.classList.add('gv-blur');
  } else if(doGlitchMicro){
    tgt.classList.add('screen-glitch-micro');
    tgt.classList.remove('gv-rev-micro','gv-blur-micro','screen-glitch-in','gv-rev','gv-blur');
    var gvm=ri(0,2);
    if(gvm===1) tgt.classList.add('gv-rev-micro');
    else if(gvm===2) tgt.classList.add('gv-blur-micro');
  }
  if(doGlitchVisual){
    setTimeout(function(){
      try{document.body.classList.remove('glitching');}catch(e){}
      var go2=document.getElementById('glitch-overlay');
      if(go2){
        go2.classList.remove('glitch-active','glitch-micro-active','gv0','gv1','gv2');
        go2.setAttribute('aria-hidden','true');
      }
      var done=document.getElementById(id);
      if(done&&done.classList) done.classList.remove('screen-glitch-in','gv-rev','gv-blur','screen-glitch-micro','gv-rev-micro','gv-blur-micro');
    },780);
  } else if(doGlitchMicro){
    setTimeout(function(){
      var go2=document.getElementById('glitch-overlay');
      if(go2){
        go2.classList.remove('glitch-micro-active','glitch-active','gv0','gv1','gv2');
        go2.setAttribute('aria-hidden','true');
      }
      var done=document.getElementById(id);
      if(done&&done.classList) done.classList.remove('screen-glitch-micro','gv-rev-micro','gv-blur-micro');
    },580);
  }
  RetroSound.runWhenReady(function(){
    if(isBigGameTransition&&allowGlitchFX) RetroSound.glitchTransition(id);
    else if(doGlitchMicro) RetroSound.glitchMicro();
    if(id==='s-pregame') RetroSound.whistle();
    RetroSound.syncMusicForScreen(id);
  });
  syncDocumentTitle(id);
}
/** Browser tab title by screen (career name on hub). */
function syncDocumentTitle(screenId){
  try{
    var sid=screenId||((document.querySelector('.screen.on')||{}).id)||'';
    if(sid==='s-hub'&&typeof G!=='undefined'&&G&&G.first){
      var n=(String(G.first||'')+' '+String(G.last||'')).trim()||'PLAYER';
      var t=(G.team&&G.team.n)?String(G.team.n):'';
      document.title=t?n+' · '+t+' — BREAKAWAY':n+' — BREAKAWAY';
      return;
    }
    if(sid==='s-ingame'){ document.title='IN GAME — BREAKAWAY'; return; }
    if(sid==='s-pregame'){ document.title='PREGAME — BREAKAWAY'; return; }
    if(sid==='s-postgame'){ document.title='POSTGAME — BREAKAWAY'; return; }
    if(sid==='s-offseason'){ document.title='OFFSEASON — BREAKAWAY'; return; }
    document.title='BREAKAWAY — Hockey Career Sim';
  }catch(e){}
}

/** In-game: number keys pick moment options (1 = first button, etc.) */
(function initMomentHotkeys(){
  if(window._bkMomentKeysBound) return;
  window._bkMomentKeysBound=true;
  document.addEventListener('keydown',function(e){
    var ing=document.getElementById('s-ingame');
    if(!ing||!ing.classList.contains('on')) return;
    var t=e.target;
    if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||(t.isContentEditable))) return;
    var k=e.key;
    if(k<'1'||k>'9') return;
    var btns=document.querySelectorAll('#moment-opts .opt-btn');
    var idx=parseInt(k,10)-1;
    if(idx>=0&&idx<btns.length&&!btns[idx].disabled) btns[idx].click();
  },false);
})();

/** Escape closes top modal; ? or / on hub opens HOW TO. */
(function initModalEscAndHubHelp(){
  if(window._bkEscHub) return;
  window._bkEscHub=true;
  document.addEventListener('keydown',function(e){
    var key=e.key||'';
    var t=e.target;
    if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||(t.isContentEditable))) return;
    if(key==='Escape'){
      var howto=document.getElementById('s-howto');
      if(howto&&howto.classList.contains('on')){
        e.preventDefault();
        if(typeof G!=='undefined'&&G&&G.first) show('s-hub');
        else show('s-title');
        try{RetroSound.uiLow();}catch(x){}
        return;
      }
      var mod=document.querySelector('.mbg.open');
      if(!mod){
        var all=document.querySelectorAll('.mbg');
        for(var i=0;i<all.length;i++){
          if(all[i].style&&all[i].style.display==='flex'){ mod=all[i]; break; }
        }
      }
      if(mod&&mod.id){
        e.preventDefault();
        closeM(mod.id);
        try{RetroSound.uiLow();}catch(x){}
      }
      return;
    }
    if(key==='?'||key==='/'){
      var hub=document.getElementById('s-hub');
      if(hub&&hub.classList.contains('on')){
        e.preventDefault();
        show('s-howto');
        try{RetroSound.ui();}catch(x){}
      }
    }
  },false);
})();

function closeM(id){
  if(id==='m-save-notice'&&_saveNoticeTimer){
    clearTimeout(_saveNoticeTimer);
    _saveNoticeTimer=null;
  }
  var el=document.getElementById(id);
  if(el){el.style.display='none';el.classList.remove('open');}
}
/** In-game confirm (replaces browser confirm() — all prompts stay in UI). */
var _confirmAction=null;
function confirmInGame(message,onYes,onNo){
  _confirmAction={yes:onYes||function(){},no:onNo||function(){}};
  var box=safeEl('m-confirm-body');
  box.textContent=String(message||'');
  openM('m-confirm');
}
function confirmInGameYes(){
  closeM('m-confirm');
  var a=_confirmAction;
  _confirmAction=null;
  if(a&&a.yes){ try{a.yes();}catch(e){console.warn(e);} }
}
function confirmInGameNo(){
  closeM('m-confirm');
  var a=_confirmAction;
  _confirmAction=null;
  if(a&&a.no){ try{a.no();}catch(e){console.warn(e);} }
}
var _saveNoticeTimer=null;
function closeSaveNoticeModal(){
  if(_saveNoticeTimer){ clearTimeout(_saveNoticeTimer); _saveNoticeTimer=null; }
  closeM('m-save-notice');
}
/** In-game save/load feedback (replaces browser dialogs + toast-only save hints). kind: ok | saved | error | info — ok/saved auto-dismiss */
function showSaveNotice(title, body, kind){
  kind=kind||'ok';
  if(_saveNoticeTimer){ clearTimeout(_saveNoticeTimer); _saveNoticeTimer=null; }
  var tEl=safeEl('m-save-notice-title');
  var bEl=safeEl('m-save-notice-body');
  tEl.textContent=title||'NOTICE';
  tEl.style.color=kind==='error'?'var(--red)':kind==='info'?'var(--gold)':'var(--green)';
  bEl.textContent=body||'';
  openM('m-save-notice');
  if(kind==='ok'||kind==='saved'){
    try{
      if(kind==='saved') RetroSound.save();
      else RetroSound.notifyGood();
    }catch(eN){}
    _saveNoticeTimer=setTimeout(function(){
      _saveNoticeTimer=null;
      var el=document.getElementById('m-save-notice');
      if(el&&el.classList.contains('open')) closeM('m-save-notice');
    },2400);
  } else if(kind==='error'){
    try{RetroSound.notifyBad();}catch(eN2){}
  } else {
    try{RetroSound.notifyGold();}catch(eN3){}
  }
}
function openM(id){
  RetroSound.runWhenReady(function(){
    if(id!=='m-settings') try{RetroSound.modal();}catch(e0){}
    var el=document.getElementById(id);
    if(el){
      el.style.display='flex';
      el.classList.add('open');
      var box=el.querySelector&&el.querySelector('.mbox');
      if(box&&box.classList&&id!=='m-settings'){
        var rm=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(!rm&&isGlitchEffectsEnabled()){
          box.classList.remove('glitch-modal-in');
          void box.offsetWidth;
          box.classList.add('glitch-modal-in');
          setTimeout(function(){try{box.classList.remove('glitch-modal-in');}catch(e2){}},420);
        }
      }
      setTimeout(function(){
        try{
          var fb=el.querySelector&&el.querySelector('.mbox button,.mbox .btn');
          if(fb&&fb.focus&&!fb.disabled) fb.focus();
        }catch(fe){}
      },60);
    } else {
      console.warn('openM missing', id);
    }
  });
}
function safeEl(id){
  var el = document.getElementById(id);
  if(el) return el;
  return {textContent:'', innerHTML:'', value:'', style:{}, classList:{add:function(){},remove:function(){}}, onclick:null};
}
function escHtml(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
/** Small CSS puck + VT323 abbrev (bitmap fonts confuse O/0) */
function markPuckSlot(elId, abbrevText){
  var el=safeEl(elId);
  if(!el||el.innerHTML===undefined) return;
  var t=abbrevText==null||abbrevText===''?'--':stripBracketIcons(String(abbrevText));
  el.innerHTML='<div class="retro-puck-graphic sm" style="margin-right:8px"><div class="puck-disc"></div></div><span class="team-abbrev">'+escHtml(t)+'</span>';
}

// --- Retro 8-bit SFX + procedural BGM (Web Audio API, no files) ---
var RetroSound=(function(){
  var ctx=null,enabled=true,bgmEnabled=true,_timerBeepCeil=-1;
  var SFX_BUS_GAIN=0.68,MUSIC_BUS_GAIN=0.2;
  var musicGainNode=null,sfxMasterGain=null,masterLim=null,_musicTimer=null,_musicStep=0,_musicTrack=null,_musicBpm=100,_musicSteps=null;
  var musicVolMul=1,sfxVolMul=1;
  try{enabled=localStorage.getItem('breakawaySound')!=='0';}catch(e){}
  try{bgmEnabled=localStorage.getItem('breakawayBgm')!=='0';}catch(e){}
  try{
    var mvRaw=localStorage.getItem('breakawayMusicVol');
    var svRaw=localStorage.getItem('breakawaySfxVol');
    if(mvRaw!==null&&mvRaw!==''){
      var mi=parseInt(mvRaw,10);
      if(!isNaN(mi)&&mi>=0&&mi<=100){
        musicVolMul=mi/100;
        bgmEnabled=mi>0;
      }
    }else{
      musicVolMul=bgmEnabled?1:0;
    }
    if(svRaw!==null&&svRaw!==''){
      var si=parseInt(svRaw,10);
      if(!isNaN(si)&&si>=0&&si<=100){
        sfxVolMul=si/100;
        enabled=si>0;
      }
    }else{
      sfxVolMul=enabled?1:0;
    }
  }catch(eVol){}
  function applyBusVolumes(){
    try{
      if(sfxMasterGain&&sfxMasterGain.context) sfxMasterGain.gain.value=SFX_BUS_GAIN*sfxVolMul;
      if(musicGainNode&&musicGainNode.context) musicGainNode.gain.value=MUSIC_BUS_GAIN*musicVolMul;
    }catch(eB){}
  }
  var TRACKS={
    title:{bpm:92,steps:[196,0,247,262,311,0,349,392,349,311,262,247,220,196,174,196,262,311,349,392,440,392,349,330,349,392,440,523,392,349,311,262]},
    menu:{bpm:104,steps:[262,330,392,523,392,349,330,349,294,349,392,440,392,349,330,294,262,294,330,349,392,440,494,523,587,523,494,440,392,349,330,262]},
    hub:{bpm:112,steps:[130,0,164,196,174,196,220,0,196,174,164,174,196,220,262,247,196,233,262,294,262,247,220,196,174,196,220,262,294,330,349,392]},
    arena:{bpm:142,steps:[196,-1,262,-1,330,-1,392,-1,523,494,440,392,-1,349,392,440,262,-1,330,-1,392,-1,440,-1,523,587,523,494,-1,440,392,349]}
  };
  /** 8th-note grid percussion (step % 8). Melody + drums share the same clock. */
  var PERC={
    title:{kick:[0,4],snare:[],hat:[1,3,5,7],rim:[2,6]},
    menu:{kick:[0,4],snare:[2,6],hat:[1,3,5,7],rim:[]},
    hub:{kick:[0,4],snare:[2,6],hat:[1,3,5,7],rim:[6]},
    arena:{kick:[0,2,3,4,6,7],snare:[2,6],hat:[0,1,2,3,4,5,6,7],rim:[1,5],crashEvery:16}
  };
  var _brokenCurve=null;
  function brokenShaperCurve(){
    if(_brokenCurve) return _brokenCurve;
    var n=1024;
    _brokenCurve=new Float32Array(n);
    for(var i=0;i<n;i++){
      var x=(i/(n-1))*2-1;
      var grit=Math.sin(x*41)*0.055+Math.sin(x*3.2)*0.095+Math.sin(x*77)*0.022;
      var y=Math.tanh((x+grit)*3.55)+Math.sign(x)*0.14*Math.sin(x*17);
      _brokenCurve[i]=Math.max(-0.98,Math.min(0.98,y));
    }
    return _brokenCurve;
  }
  var _musicRawCurve=null;
  /** Raw cheap-synth grit: asymmetric fold + buzz harmonics (BGM). */
  function musicRawGritCurve(){
    if(_musicRawCurve) return _musicRawCurve;
    var n=1024;
    _musicRawCurve=new Float32Array(n);
    for(var i=0;i<n;i++){
      var x=(i/(n-1))*2-1;
      var a=Math.abs(x);
      var k=Math.sign(x)*(Math.pow(a,0.72)+0.18*Math.sin(x*41));
      var y=Math.tanh((k+Math.sin(x*33)*0.14+Math.sin(x*7)*0.065+Math.sin(x*59)*0.04)*4.15);
      y+=Math.sign(x)*0.13*Math.sin(x*19)+Math.sign(x)*0.06*Math.sin(x*47);
      _musicRawCurve[i]=Math.max(-0.98,Math.min(0.98,y));
    }
    return _musicRawCurve;
  }
  function sfxJitterSec(){ return (Math.random()-0.5)*0.0042; }
  function detuneMul(){ return 1+(Math.random()-0.5)*0.038; }
  /** Harsh / cheap speaker — maps soft waves to gnarlier ones when opts.grit */
  function pickWave(w,grit){
    if(!grit) return w||'square';
    if(w==='triangle') return Math.random()<0.55?'square':'sawtooth';
    if(w==='sine') return 'square';
    return w||'square';
  }
  function init(){
    if(ctx) return ctx;
    try{
      var AC=window.AudioContext||window.webkitAudioContext;
      ctx=new AC({latencyHint:'interactive'});
    }catch(e1){
      try{ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}
    }
    return ctx;
  }
  /** Master limiter + makeup: SFX+BGM sum here so we can push gain without anemic peaks. */
  function ensureMasterChain(c){
    if(!masterLim||masterLim.ctx!==c){
      masterLim={ctx:c};
      var comp=c.createDynamicsCompressor();
      var mk=c.createGain();
      mk.gain.value=0.58;
      comp.threshold.value=-34;
      comp.knee.value=30;
      comp.ratio.value=2.2;
      comp.attack.value=0.006;
      comp.release.value=0.11;
      comp.connect(mk);
      mk.connect(c.destination);
      masterLim.comp=comp;
      masterLim.makeup=mk;
    }
    return masterLim.comp;
  }
  /** Route SFX through one gain node (easier to hear; avoids some routing quirks). */
  function ensureSfxGain(c){
    var sink=ensureMasterChain(c);
    if(!sfxMasterGain||sfxMasterGain.context!==c){
      sfxMasterGain=c.createGain();
      sfxMasterGain.connect(sink);
    }
    sfxMasterGain.gain.value=SFX_BUS_GAIN*sfxVolMul;
    return sfxMasterGain;
  }
  /** Resume only if context already exists — NEVER call init() from visibility/timer (breaks autoplay). */
  function resumeIfPossible(){
    if(!ctx||ctx.state==='closed') return;
    if(ctx.state==='running') return;
    ctx.resume().catch(function(){});
  }
  /** Browsers start AudioContext suspended until a user gesture; schedule only after running. */
  function withRunning(fn){
    var c=init();
    if(!c) return;
    function go(){ try{fn(c);}catch(e){} }
    if(c.state==='running') go();
    else{
      var p=c.resume();
      if(p&&typeof p.then==='function') p.then(go).catch(function(){ go(); });
      else setTimeout(go,0);
    }
  }
  function ensureMusicGain(){
    var c=init();
    if(!c) return null;
    var sink=ensureMasterChain(c);
    if(!musicGainNode||musicGainNode.context!==c){
      musicGainNode=c.createGain();
      musicGainNode.connect(sink);
    }
    musicGainNode.gain.value=MUSIC_BUS_GAIN*musicVolMul;
    return musicGainNode;
  }
  function resume(){
    var c=init();
    if(c&&c.state==='suspended') c.resume().catch(function(){});
  }
  function stopMusicInternal(){
    if(_musicTimer){clearInterval(_musicTimer);_musicTimer=null;}
    _musicTrack=null;_musicStep=0;_musicSteps=null;
  }
  function musicNoiseBurst(dur,vol){
    if(!bgmEnabled) return;
    withRunning(function(c){
      var mg=ensureMusicGain();
      if(!mg) return;
      var len=Math.floor(c.sampleRate*Math.max(0.02,dur)),n=c.createBuffer(1,len,c.sampleRate),d=n.getChannelData(0);
      var last=0;
      for(var i=0;i<len;i++){
        var r=(Math.random()*2-1);
        last=last*0.35+r*0.65;
        var v=last*0.82+(Math.random()*2-1)*0.26;
        d[i]=Math.round(v*10)/10;
      }
      var src=c.createBufferSource();src.buffer=n;
      var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=900+Math.random()*1400;hp.Q.value=0.5;
      var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6800+Math.random()*2800;lp.Q.value=0.75;
      var sh=c.createWaveShaper();sh.curve=musicRawGritCurve();try{sh.oversample='4x';}catch(e0){}
      var g=c.createGain();
      src.connect(hp);hp.connect(lp);lp.connect(sh);sh.connect(g);g.connect(mg);
      var t=c.currentTime;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol*(0.42+Math.random()*0.07),t+0.006);
      g.gain.exponentialRampToValueAtTime(0.001,t+dur*0.92);
      src.start(t);
    });
  }
  function musicBeep(freq,dur,wave,vol){
    if(!bgmEnabled) return;
    withRunning(function(c){
      var mg=ensureMusicGain();
      if(!mg) return;
      var t=c.currentTime,f0=freq*detuneMul(),f1=f0*(1.0028+Math.random()*0.003);
      var osc=c.createOscillator(),osc2=c.createOscillator(),g=c.createGain(),g2=c.createGain(),mix=c.createGain();
      var w=wave||'square';
      var rw=Math.random();
      if(w==='square') w=rw<0.68?'square':(rw<0.92?'sawtooth':'triangle');
      else if(w==='triangle') w=rw<0.5?'sawtooth':'square';
      osc.type=w;osc2.type=w;
      osc.frequency.setValueAtTime(f0,t);
      osc2.frequency.setValueAtTime(f1,t);
      try{
        osc.frequency.exponentialRampToValueAtTime(f0*(0.982+Math.random()*0.02),t+Math.min(dur*0.7,0.12));
      }catch(e0){}
      var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=120+Math.random()*90;hp.Q.value=0.55;
      var peak=c.createBiquadFilter();peak.type='peaking';peak.frequency.value=2400+Math.random()*800;peak.Q.value=1.25;peak.gain.value=3.6;
      var filt=c.createBiquadFilter();filt.type='lowpass';filt.frequency.setValueAtTime(6200+Math.random()*3800,t);filt.Q.value=0.58;
      var sh=c.createWaveShaper();sh.curve=musicRawGritCurve();try{sh.oversample='4x';}catch(e1){}
      var sh2=c.createWaveShaper();sh2.curve=brokenShaperCurve();try{sh2.oversample='2x';}catch(e2){}
      g2.gain.value=0.32+Math.random()*0.12;
      osc.connect(g);osc2.connect(g2);g2.connect(g);
      g.connect(hp);hp.connect(peak);peak.connect(filt);filt.connect(sh);sh.connect(sh2);sh2.connect(mix);mix.connect(mg);
      var vm=vol*(0.38+Math.random()*0.05);
      mix.gain.setValueAtTime(0,t);
      mix.gain.linearRampToValueAtTime(vm,t+0.003);
      mix.gain.exponentialRampToValueAtTime(0.0008,t+dur*0.94);
      var nbuf=c.createBuffer(1,Math.floor(c.sampleRate*Math.max(0.015,dur*0.85)),c.sampleRate),nd=nbuf.getChannelData(0);
      for(var i=0;i<nd.length;i++) nd[i]=Math.round((Math.random()*2-1)*12)/12;
      var ns=c.createBufferSource();ns.buffer=nbuf;var ng=c.createGain();ng.gain.value=vm*0.12;
      ns.connect(ng);ng.connect(mg);
      osc.start(t);osc2.start(t);ns.start(t);
      osc.stop(t+dur+0.05);osc2.stop(t+dur+0.05);ns.stop(t+dur);
    });
  }
  /** In-game only: stacked “chorus” — sub + lead + 5th + octave up (arena energy). */
  function musicBeepArena(freq,dur,wave,vol){
    if(!bgmEnabled) return;
    withRunning(function(c){
      var mg=ensureMusicGain();
      if(!mg) return;
      var t=c.currentTime;
      var f0=freq*detuneMul();
      var ratios=[0.5,1,1.5,2];
      var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=90+Math.random()*70;hp.Q.value=0.45;
      var peak=c.createBiquadFilter();peak.type='peaking';peak.frequency.value=1900+Math.random()*650;peak.Q.value=1.15;peak.gain.value=3.2;
      var filt=c.createBiquadFilter();filt.type='lowpass';filt.frequency.setValueAtTime(5200+Math.random()*2200,t);filt.Q.value=0.62;
      var sh=c.createWaveShaper();sh.curve=musicRawGritCurve();try{sh.oversample='4x';}catch(e3){}
      var sh2=c.createWaveShaper();sh2.curve=brokenShaperCurve();try{sh2.oversample='2x';}catch(e4){}
      var mix=c.createGain();
      var wv=wave||'square';
      var rw2=Math.random();
      if(wv==='square') wv=rw2<0.55?'square':(rw2<0.88?'sawtooth':'triangle');
      else wv=rw2<0.6?'sawtooth':'square';
      var levels=[0.1,0.5,0.22,0.09];
      for(var k=0;k<ratios.length;k++){
        var fr=Math.max(36,f0*ratios[k]*(1+(Math.random()-0.5)*0.012));
        var osc=c.createOscillator(),osc2=c.createOscillator(),g=c.createGain(),g2=c.createGain(),gg=c.createGain();
        osc.type=wv;osc2.type=wv;
        osc.frequency.setValueAtTime(fr,t);
        osc2.frequency.setValueAtTime(fr*(1.003+Math.random()*0.003),t);
        try{
          osc.frequency.exponentialRampToValueAtTime(fr*(0.988+Math.random()*0.015),t+Math.min(dur*0.65,0.1));
        }catch(e0){}
        g2.gain.value=0.26+Math.random()*0.09;
        osc.connect(g);osc2.connect(g2);g2.connect(g);
        gg.gain.value=levels[k]*(0.9+Math.random()*0.05);
        g.connect(gg);gg.connect(hp);
        osc.start(t);osc2.start(t);
        osc.stop(t+dur+0.06);osc2.stop(t+dur+0.06);
      }
      hp.connect(peak);peak.connect(filt);filt.connect(sh);sh.connect(sh2);sh2.connect(mix);mix.connect(mg);
      var vm=vol*(0.4+Math.random()*0.045);
      mix.gain.setValueAtTime(0,t);
      mix.gain.linearRampToValueAtTime(vm,t+0.0025);
      mix.gain.exponentialRampToValueAtTime(0.0008,t+dur*0.93);
      var nbuf=c.createBuffer(1,Math.floor(c.sampleRate*Math.max(0.016,dur*0.88)),c.sampleRate),nd=nbuf.getChannelData(0);
      for(var i=0;i<nd.length;i++) nd[i]=Math.round((Math.random()*2-1)*10)/10;
      var ns=c.createBufferSource();ns.buffer=nbuf;var ng=c.createGain();ng.gain.value=vm*0.1;
      ns.connect(ng);ng.connect(mg);
      ns.start(t);ns.stop(t+dur);
    });
  }
  function playMusicStep(s,noteSec){
    if(s===0||s===undefined) return;
    if(s===-1){musicNoiseBurst(noteSec*0.85,_musicTrack==='arena'?0.3:0.26);return;}
    if(typeof s==='number'&&s>0){
      if(_musicTrack==='arena') musicBeepArena(s,noteSec*0.86,'square',1);
      else musicBeep(s,noteSec*0.88,'square',1);
    }
  }
  function musicPercKickAt(c,t,stepSec,vol){
    var mg=ensureMusicGain();
    if(!mg) return;
    var osc=c.createOscillator(),g=c.createGain();
    osc.type='sine';
    var f0=118+Math.random()*10;
    osc.frequency.setValueAtTime(f0,t);
    try{osc.frequency.exponentialRampToValueAtTime(52+Math.random()*6,t+0.07);}catch(e1){}
    var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=220;lp.Q.value=0.7;
    osc.connect(g);g.connect(lp);lp.connect(mg);
    var vm=(vol||0.42)*(0.92+Math.random()*0.08);
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(vm,t+0.003);
    g.gain.exponentialRampToValueAtTime(0.0009,t+0.11+stepSec*0.15);
    osc.start(t);osc.stop(t+0.18);
  }
  function musicPercSnareAt(c,t,stepSec,vol){
    var mg=ensureMusicGain();
    if(!mg) return;
    var len=Math.floor(c.sampleRate*0.09),buf=c.createBuffer(1,len,c.sampleRate),ch=buf.getChannelData(0);
    for(var i=0;i<len;i++) ch[i]=(Math.random()*2-1)*(0.55+0.45*Math.exp(-i/(len*0.22)));
    var src=c.createBufferSource();src.buffer=buf;
    var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=1200;hp.Q.value=0.5;
    var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=8800+Math.random()*1200;lp.Q.value=0.6;
    var g=c.createGain();
    src.connect(hp);hp.connect(lp);lp.connect(g);g.connect(mg);
    var vm=(vol||0.38)*(0.9+Math.random()*0.1);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vm,t+0.002);
    g.gain.exponentialRampToValueAtTime(0.0009,t+0.07+stepSec*0.08);
    var osc=c.createOscillator(),gt=c.createGain();
    osc.type='triangle';osc.frequency.value=185+Math.random()*12;
    gt.gain.value=vm*0.22;
    osc.connect(gt);gt.connect(mg);
    osc.start(t);osc.stop(t+0.06);
    src.start(t);
  }
  function musicPercHatAt(c,t,stepSec,vol,open){
    var mg=ensureMusicGain();
    if(!mg) return;
    var dur=open?Math.min(0.09,0.045+stepSec*0.35):Math.min(0.05,0.022+stepSec*0.2);
    var len=Math.max(32,Math.floor(c.sampleRate*dur)),buf=c.createBuffer(1,len,c.sampleRate),ch=buf.getChannelData(0);
    for(var i=0;i<len;i++) ch[i]=(Math.random()*2-1)*0.9;
    var src=c.createBufferSource();src.buffer=buf;
    var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=5000+Math.random()*1800;hp.Q.value=0.4;
    var bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=9800+Math.random()*2500;bp.Q.value=0.85;
    var g=c.createGain();
    src.connect(hp);hp.connect(bp);bp.connect(g);g.connect(mg);
    var vm=(vol||0.2)*(0.85+Math.random()*0.12)*(open?1.15:1);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vm,t+0.0015);
    g.gain.exponentialRampToValueAtTime(0.0008,t+dur*0.95);
    src.start(t);
  }
  function musicPercRimAt(c,t,stepSec,vol){
    var mg=ensureMusicGain();
    if(!mg) return;
    var osc=c.createOscillator(),g=c.createGain();
    osc.type='square';
    osc.frequency.setValueAtTime(800+Math.random()*40,t);
    var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4200;lp.Q.value=1.2;
    osc.connect(g);g.connect(lp);lp.connect(mg);
    var vm=(vol||0.18)*(0.9+Math.random()*0.08);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vm,t+0.001);
    g.gain.exponentialRampToValueAtTime(0.0008,t+0.035+stepSec*0.1);
    osc.start(t);osc.stop(t+0.07);
  }
  function musicPercCrashAt(c,t,stepSec){
    var mg=ensureMusicGain();
    if(!mg) return;
    var len=Math.floor(c.sampleRate*Math.min(0.55,0.35+stepSec*1.2)),buf=c.createBuffer(1,len,c.sampleRate),ch=buf.getChannelData(0);
    for(var i=0;i<len;i++) ch[i]=(Math.random()*2-1)*(0.62*Math.exp(-i/(len*0.09))+0.12*Math.exp(-i/(len*0.35)));
    var src=c.createBufferSource();src.buffer=buf;
    var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=700+Math.random()*500;hp.Q.value=0.45;
    var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=11500+Math.random()*2200;lp.Q.value=0.55;
    var g=c.createGain();
    src.connect(hp);hp.connect(lp);lp.connect(g);g.connect(mg);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.095,t+0.018);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.42+stepSec*0.2);
    src.start(t);
  }
  function playPercussion(theme,stepIdx,stepSec){
    if(!bgmEnabled) return;
    var P=PERC[theme];
    if(!P) return;
    var ph=stepIdx%8;
    withRunning(function(c){
      var t=c.currentTime;
      var pk=P.kick||[],ps=P.snare||[],phat=P.hat||[],pr=P.rim||[];
      if(theme==='arena'&&P.crashEvery&&(stepIdx%P.crashEvery)===0) musicPercCrashAt(c,t,stepSec);
      if(pk.indexOf(ph)>=0) musicPercKickAt(c,t,stepSec,theme==='title'?0.14:theme==='arena'?0.22:0.17);
      if(ps.indexOf(ph)>=0) musicPercSnareAt(c,t,stepSec,theme==='title'?0.09:theme==='arena'?0.2:0.15);
      if(phat.indexOf(ph)>=0){
        var isOpen=theme==='arena'&&(ph===3||ph===7);
        musicPercHatAt(c,t,stepSec,theme==='title'?0.065:theme==='arena'?0.09:0.075,isOpen);
      }
      if(pr.indexOf(ph)>=0) musicPercRimAt(c,t,stepSec,theme==='arena'?0.075:theme==='hub'?0.065:0.05);
    });
  }
  function startMusic(theme){
    var T=TRACKS[theme];
    if(!T) return;
    if(_musicTrack===theme&&_musicTimer) return;
    stopMusicInternal();
    if(!bgmEnabled) return;
    withRunning(function(){
      if(!bgmEnabled) return;
      _musicTrack=theme;_musicBpm=T.bpm;_musicSteps=T.steps;_musicStep=0;
      var stepSec=(60/_musicBpm)/2;
      var stepMs=Math.max(46,Math.round(stepSec*1000));
      _musicTimer=setInterval(function(){
        if(!bgmEnabled){stopMusicInternal();return;}
        if(!_musicSteps||!_musicSteps.length) return;
        var idx=_musicStep;
        var s=_musicSteps[idx%_musicSteps.length];
        _musicStep++;
        playMusicStep(s,stepSec);
        playPercussion(_musicTrack,idx,stepSec);
      },stepMs);
    });
  }
  function syncMusicInternal(){
    var el=document.querySelector('.screen.on');
    var id=el?el.id:'s-title';
    syncMusicForScreenImpl(id);
  }
  function syncMusicForScreenImpl(screenId){
    if(!bgmEnabled){stopMusicInternal();return;}
    var id=screenId||'';
    if(id==='s-title'||id==='s-howto'||id==='s-game-intro') startMusic('title');
    else if(id==='s-create'||id==='s-arch'||id==='s-potential'||id==='s-xfactor'||id==='s-attrs'||id==='s-league'||id==='s-team'||id==='s-game-loading') startMusic('menu');
    else if(id==='s-ingame') startMusic('arena');
    else startMusic('hub');
  }
  /** Schedule one SFX tone — detuned, filtered, waveshaped, jittered (broken-cheap-arcade feel). */
  function scheduleSfxTone(c,tWhen,freq,dur,wave,vol,slideTo){
    var out=ensureSfxGain(c);
    var tJ=tWhen+sfxJitterSec();
    var f=freq*detuneMul();
    var osc=c.createOscillator(),osc2=c.createOscillator(),g=c.createGain(),g2=c.createGain();
    var w=pickWave(wave,true);
    osc.type=w;osc2.type=w;
    osc.frequency.setValueAtTime(f,tJ);
    osc2.frequency.setValueAtTime(f*(1.0033+Math.random()*0.004),tJ);
    if(slideTo) try{
      osc.frequency.exponentialRampToValueAtTime(Math.max(30,slideTo),tJ+dur*0.88);
      osc2.frequency.exponentialRampToValueAtTime(Math.max(30,slideTo)*1.0033,tJ+dur*0.88);
    }catch(e2){}
    g2.gain.value=0.14+Math.random()*0.12;
    var filt=c.createBiquadFilter();
    filt.type='lowpass';
    filt.frequency.setValueAtTime(3800+Math.random()*5200,tJ);
    filt.Q.value=0.65+Math.random()*0.75;
    var sh=c.createWaveShaper();sh.curve=brokenShaperCurve();
    osc.connect(g);osc2.connect(g2);g2.connect(g);
    g.connect(filt);filt.connect(sh);sh.connect(out);
    var vm=Math.min(0.52,vol*0.82);
    g.gain.setValueAtTime(0,tJ);
    g.gain.linearRampToValueAtTime(vm,tJ+0.002+Math.random()*0.0025);
    g.gain.linearRampToValueAtTime(0,tJ+Math.max(dur*0.9,0.016));
    osc.start(tJ);osc2.start(tJ);
    osc.stop(tJ+dur+0.08);osc2.stop(tJ+dur+0.08);
    var nb=Math.floor(c.sampleRate*Math.max(0.008,dur*0.5)),b=c.createBuffer(1,nb,c.sampleRate),ch=b.getChannelData(0);
    for(var i=0;i<nb;i++) ch[i]=(Math.random()*2-1)*0.72;
    var ns=c.createBufferSource();ns.buffer=b;var ng=c.createGain();ng.gain.value=vm*0.09;
    ns.connect(ng);ng.connect(out);
    ns.start(tJ);ns.stop(tJ+dur*0.82);
  }
  function noiseBurstAt(c,t,dur,vol){
    var out=ensureSfxGain(c);
    var tJ=t+sfxJitterSec()*0.6;
    var len=Math.floor(c.sampleRate*Math.max(0.02,dur)),buf=c.createBuffer(1,len,c.sampleRate),ch=buf.getChannelData(0);
    var z=0;
    for(var i=0;i<len;i++){
      z=z*0.42+(Math.random()*2-1)*0.58;
      ch[i]=z*0.85+(Math.random()*2-1)*0.18;
    }
    var src=c.createBufferSource();src.buffer=buf;
    var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=400+Math.random()*900;hp.Q.value=0.5;
    var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7000+Math.random()*5000;lp.Q.value=0.8;
    var sh=c.createWaveShaper();sh.curve=brokenShaperCurve();
    var g=c.createGain();
    src.connect(hp);hp.connect(lp);lp.connect(sh);sh.connect(g);g.connect(out);
    var vm=Math.min(0.5,vol*0.78);
    g.gain.setValueAtTime(0,tJ);g.gain.linearRampToValueAtTime(vm,tJ+0.008+Math.random()*0.006);
    g.gain.linearRampToValueAtTime(0,tJ+dur*0.95);
    src.start(tJ);
  }
  function beep(freq,dur,wave,vol,slideTo){
    if(!enabled) return;
    withRunning(function(c){
      scheduleSfxTone(c,c.currentTime,freq,dur,wave,vol,slideTo);
    });
  }
  /** Arpeggio: all notes scheduled on AudioContext timeline (not setTimeout). */
  function arp(seq,stepMs,wave,vol){
    if(!enabled) return;
    var sm=Math.max(36,(stepMs||68)*0.9);
    withRunning(function(c){
      var t0=c.currentTime+sfxJitterSec()*0.5,stepSec=sm/1000,noteDur=Math.min(0.1,stepSec*0.82);
      var wv=wave||'sawtooth';
      for(var i=0;i<seq.length;i++){
        scheduleSfxTone(c,t0+i*stepSec,seq[i],noteDur,wv,vol||0.46,null);
      }
    });
  }
  function noiseBurst(dur,vol){
    if(!enabled) return;
    withRunning(function(c){
      noiseBurstAt(c,c.currentTime,dur,vol);
    });
  }
  return{
    setEnabled:function(v){
      enabled=!!v;
      try{localStorage.setItem('breakawaySound',enabled?'1':'0');}catch(e){}
      if(!enabled){
        sfxVolMul=0;
        try{localStorage.setItem('breakawaySfxVol','0');}catch(e1){}
      }else{
        if(sfxVolMul<0.0001) sfxVolMul=1;
        try{localStorage.setItem('breakawaySfxVol',String(Math.round(sfxVolMul*100)));}catch(e2){}
      }
      applyBusVolumes();
    },
    isEnabled:function(){return enabled;},
    setBgmEnabled:function(v){
      bgmEnabled=!!v;
      try{localStorage.setItem('breakawayBgm',bgmEnabled?'1':'0');}catch(e){}
      if(!bgmEnabled){
        musicVolMul=0;
        stopMusicInternal();
        try{localStorage.setItem('breakawayMusicVol','0');}catch(e1){}
      }else{
        if(musicVolMul<0.0001) musicVolMul=1;
        try{localStorage.setItem('breakawayMusicVol',String(Math.round(musicVolMul*100)));}catch(e2){}
        syncMusicInternal();
      }
      applyBusVolumes();
    },
    isBgmEnabled:function(){return bgmEnabled;},
    setMusicVolumePct:function(p){
      p=Math.max(0,Math.min(100,Math.round(Number(p)||0)));
      musicVolMul=p/100;
      bgmEnabled=p>0;
      try{
        localStorage.setItem('breakawayMusicVol',String(p));
        localStorage.setItem('breakawayBgm',bgmEnabled?'1':'0');
      }catch(e){}
      applyBusVolumes();
      if(!bgmEnabled) stopMusicInternal();
      else syncMusicInternal();
    },
    setSfxVolumePct:function(p){
      p=Math.max(0,Math.min(100,Math.round(Number(p)||0)));
      sfxVolMul=p/100;
      enabled=p>0;
      try{
        localStorage.setItem('breakawaySfxVol',String(p));
        localStorage.setItem('breakawaySound',enabled?'1':'0');
      }catch(e){}
      applyBusVolumes();
    },
    getMusicVolumePct:function(){return Math.max(0,Math.min(100,Math.round(musicVolMul*100)));},
    getSfxVolumePct:function(){return Math.max(0,Math.min(100,Math.round(sfxVolMul*100)));},
    syncMusicForScreen:function(id){syncMusicForScreenImpl(id);},
    stopMusic:function(){stopMusicInternal();},
    runWhenReady:function(fn){withRunning(function(){ fn(); });},
    init:init,resume:resume,resumeIfPossible:resumeIfPossible,resetTimerBeep:function(){_timerBeepCeil=-1;},
    timerTick:function(sec){
      if(!enabled||sec<1||sec>3) return;
      if(_timerBeepCeil!==sec){_timerBeepCeil=sec;beep(880-sec*120,0.035,'square',0.22);}
    },
    ui:function(){beep(520,0.05,'square',0.32);},
    uiLow:function(){beep(380,0.04,'triangle',0.22);},
    uiBlip:function(){beep(740,0.028,'square',0.26);},
    modal:function(){
      if(!enabled) return;
      withRunning(function(c){var t=c.currentTime;scheduleSfxTone(c,t,660,0.06,'triangle',0.28,null);scheduleSfxTone(c,t+0.055,880,0.05,'triangle',0.2,null);});
    },
    tab:function(){beep(600,0.038,'square',0.24);},
    advance:function(){beep(440,0.032,'triangle',0.2);},
    attrTick:function(){beep(880,0.02,'square',0.16);},
    ping:function(){
      if(!enabled) return;
      withRunning(function(c){var t=c.currentTime;scheduleSfxTone(c,t,523,0.04,'square',0.22,null);scheduleSfxTone(c,t+0.045,659,0.05,'square',0.18,null);});
    },
    careerStart:function(){arp([392,494,587,698,784,880],55,'square',0.3);},
    contractSign:function(){arp([523,659,784,988],72,'square',0.28);},
    walkAway:function(){arp([392,330,262,196],95,'triangle',0.22);},
    tradeWhoosh:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime,seq=[330,415,523,659],stepSec=0.06,noteDur=0.08;
        noiseBurstAt(c,t,0.06,0.12);
        for(var i=0;i<seq.length;i++) scheduleSfxTone(c,t+i*stepSec,seq[i],noteDur,'square',0.26,null);
      });
    },
    injury:function(){
      if(!enabled) return;
      withRunning(function(c){var t=c.currentTime;scheduleSfxTone(c,t,120,0.1,'sawtooth',0.28,null);scheduleSfxTone(c,t+0.07,90,0.14,'sawtooth',0.22,null);});
    },
    seasonTurn:function(){arp([349,440,523,659],80,'square',0.24);},
    achievement:function(){arp([784,988,1174,1318],55,'square',0.22);},
    notifyGold:function(){arp([784,988,1174],70,'square',0.28);},
    notifyBad:function(){
      if(!enabled) return;
      withRunning(function(c){var t=c.currentTime;scheduleSfxTone(c,t,180,0.12,'sawtooth',0.3,null);scheduleSfxTone(c,t+0.06,140,0.14,'sawtooth',0.22,null);});
    },
    notifyGood:function(){arp([523,659,784],75,'square',0.3);},
    /** Goal — big rising fanfare + siren tail */
    goal:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime,sm=0.048,stepSec=sm,noteDur=0.085;
        var seq=[392,494,587,698,784,988,1174,1318];
        for(var i=0;i<seq.length;i++) scheduleSfxTone(c,t+i*stepSec,seq[i],noteDur,'square',0.34,null);
        noiseBurstAt(c,t+0.38,0.14,0.22);
        scheduleSfxTone(c,t+0.42,880,0.1,'square',0.3,null);
        scheduleSfxTone(c,t+0.52,1046,0.14,'square',0.26,null);
      });
    },
    assist:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime,sm=0.055;
        var seq=[523,659,784,988,1174];
        for(var i=0;i<seq.length;i++) scheduleSfxTone(c,t+i*sm,seq[i],0.07,'square',0.28,null);
      });
    },
    /** Clean save — metallic “clang” + pad noise */
    save:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        scheduleSfxTone(c,t,1318,0.05,'square',0.38,null);
        scheduleSfxTone(c,t+0.045,1174,0.045,'square',0.34,null);
        scheduleSfxTone(c,t+0.09,988,0.06,'square',0.32,null);
        noiseBurstAt(c,t+0.02,0.055,0.2);
        scheduleSfxTone(c,t+0.12,740,0.08,'triangle',0.22,null);
      });
    },
    puck:function(){beep(620,0.03,'square',0.2);},
    /** Play whistled / dead — skater: shot saved, play stops */
    playStoppage:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        noiseBurstAt(c,t,0.05,0.14);
        scheduleSfxTone(c,t,620,0.04,'square',0.24,null);
        scheduleSfxTone(c,t+0.045,440,0.12,'triangle',0.26,null);
        scheduleSfxTone(c,t+0.1,330,0.1,'triangle',0.2,null);
      });
    },
    /** Goalie: messy save — metal + pad stack, play continues */
    partialSave:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        scheduleSfxTone(c,t,1174,0.04,'square',0.3,null);
        noiseBurstAt(c,t+0.015,0.06,0.17);
        scheduleSfxTone(c,t+0.07,784,0.08,'triangle',0.24,null);
        scheduleSfxTone(c,t+0.12,523,0.1,'triangle',0.2,null);
      });
    },
    /** Shot blocked / defensive denial */
    defensiveStop:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        noiseBurstAt(c,t,0.035,0.2);
        scheduleSfxTone(c,t,220,0.1,'sawtooth',0.32,null);
        scheduleSfxTone(c,t+0.07,165,0.08,'square',0.26,null);
        scheduleSfxTone(c,t+0.14,440,0.05,'square',0.22,null);
      });
    },
    /** Turnover / bad play (skaters) */
    turnover:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        scheduleSfxTone(c,t,240,0.11,'sawtooth',0.3,null);
        scheduleSfxTone(c,t+0.1,180,0.12,'sawtooth',0.28,null);
        scheduleSfxTone(c,t+0.2,95,0.2,'sawtooth',0.34,null);
        noiseBurstAt(c,t+0.08,0.12,0.18);
      });
    },
    /** Puck in the net — you (goalie) got beat */
    goalAgainst:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        scheduleSfxTone(c,t,349,0.18,'sawtooth',0.28,null);
        scheduleSfxTone(c,t+0.16,247,0.22,'sawtooth',0.32,null);
        scheduleSfxTone(c,t+0.32,165,0.28,'sawtooth',0.3,null);
        noiseBurstAt(c,t+0.2,0.16,0.22);
        scheduleSfxTone(c,t+0.45,130,0.35,'sawtooth',0.26,null);
      });
    },
    partial:function(){this.playStoppage();},
    /** Legacy horn — rare UI/game use */
    buzz:function(){beep(95,0.18,'sawtooth',0.34);},
    /** CRT / tape-splice glitch — big screen cuts (pregame, faceoff, final horn) */
    glitchTransition:function(screenId){
      if(!enabled) return;
      var sid=screenId||'';
      var post=sid==='s-postgame';
      var ing=sid==='s-ingame';
      withRunning(function(c){
        var t=c.currentTime;
        var i,j;
        for(i=0;i<9;i++) noiseBurstAt(c,t+i*0.028,0.03+Math.random()*0.028,0.14+Math.random()*0.14);
        for(j=0;j<26;j++){
          var f=70+Math.pow(Math.random(),1.55)*4800;
          scheduleSfxTone(c,t+j*0.012,f,0.01+Math.random()*0.02,'square',0.09+Math.random()*0.15,null);
        }
        for(i=0;i<9;i++) scheduleSfxTone(c,t+0.08+i*0.022,880/Math.pow(1.42,i),0.032,'sawtooth',0.17+Math.random()*0.07,null);
        scheduleSfxTone(c,t+0.06,55,0.14,'sine',0.36,null);
        scheduleSfxTone(c,t+0.07,2400,0.022,'square',0.11,null);
        scheduleSfxTone(c,t+0.095,1100,0.024,'square',0.1,null);
        if(ing){
          scheduleSfxTone(c,t+0.24,1664,0.045,'square',0.24,null);
          scheduleSfxTone(c,t+0.29,1396,0.055,'square',0.2,null);
          scheduleSfxTone(c,t+0.34,2093,0.035,'triangle',0.16,null);
        } else if(post){
          scheduleSfxTone(c,t+0.22,196,0.18,'sawtooth',0.3,null);
          scheduleSfxTone(c,t+0.36,110,0.22,'sawtooth',0.28,null);
          noiseBurstAt(c,t+0.3,0.07,0.12);
        } else {
          scheduleSfxTone(c,t+0.2,880,0.05,'triangle',0.22,null);
          scheduleSfxTone(c,t+0.215,1320,0.04,'square',0.14,null);
          noiseBurstAt(c,t+0.26,0.06,0.13);
        }
      });
    },
    /** Short tape-crackle — micro screen cuts, hub, create flow, toasts (not full arena cut) */
    glitchMicro:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        var i,j;
        for(i=0;i<5;i++) noiseBurstAt(c,t+i*0.02,0.018+Math.random()*0.022,0.07+Math.random()*0.09);
        for(j=0;j<14;j++){
          var f=100+Math.pow(Math.random(),1.65)*3800;
          scheduleSfxTone(c,t+j*0.013,f,0.007+Math.random()*0.014,'square',0.055+Math.random()*0.09,null);
        }
        scheduleSfxTone(c,t+0.035,65,0.07,'sine',0.2,null);
        scheduleSfxTone(c,t+0.048,1650,0.014,'square',0.075,null);
        noiseBurstAt(c,t+0.09,0.035,0.07);
      });
    },
    arena:function(){arp([196,262,330,392],100,'triangle',0.22);},
    whistle:function(){
      if(!enabled) return;
      withRunning(function(c){var t=c.currentTime;noiseBurstAt(c,t,0.08,0.15);scheduleSfxTone(c,t,440,0.12,'triangle',0.2,null);});
    },
    gameWin:function(){arp([523,659,784,1046],90,'square',0.28);},
    gameLose:function(){arp([392,349,294,262],110,'triangle',0.22);},
    gameTie:function(){
      if(!enabled) return;
      withRunning(function(c){var t=c.currentTime;scheduleSfxTone(c,t,587,0.1,'triangle',0.24,null);scheduleSfxTone(c,t+0.12,587,0.1,'triangle',0.2,null);});
    },
    /** --- UI buttons: distinct cues so every control has feedback --- */
    buttonPrimary:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        scheduleSfxTone(c,t,392,0.052,'square',0.38,null);
        scheduleSfxTone(c,t+0.042,587,0.058,'square',0.34,null);
      });
    },
    buttonSecondary:function(){beep(560,0.034,'square',0.3);},
    buttonDanger:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        scheduleSfxTone(c,t,165,0.095,'sawtooth',0.28,null);
        scheduleSfxTone(c,t+0.048,125,0.095,'sawtooth',0.22,null);
      });
    },
    buttonAction:function(){arp([330,415,523],38,'square',0.3);},
    buttonToggle:function(){beep(1020,0.02,'square',0.24);},
    buttonSelect:function(){
      if(!enabled) return;
      withRunning(function(c){
        var t=c.currentTime;
        scheduleSfxTone(c,t,698,0.042,'square',0.3,null);
        scheduleSfxTone(c,t+0.04,988,0.038,'square',0.24,null);
      });
    },
    buttonOption:function(){
      if(!enabled) return;
      withRunning(function(c){var t=c.currentTime;scheduleSfxTone(c,t,620,0.055,'square',0.3,null);scheduleSfxTone(c,t+0.05,880,0.048,'square',0.22,null);});
    },
    buttonSocial:function(){beep(540,0.038,'square',0.28);},
    attrMinus:function(){beep(300,0.025,'square',0.2);},
    attrPlus:function(){beep(760,0.025,'square',0.24);},
    /** Route clicks on buttons / cards to the right cue (see global click listener). */
    playForElement:function(el){
      if(!enabled||!el) return;
      try{
        if(el.closest&&el.closest('[data-no-sfx]')) return;
      }catch(e){}
      var tag=(el.tagName||'').toUpperCase();
      if(tag==='BUTTON'||tag==='INPUT'){
        if(el.disabled) return;
      }
      var id=el.id||'';
      if(id==='btn-play-game'||id==='btn-start-career') return;
      var cl=el.classList;
      if(!cl) return;
      if(cl.contains('attr-btn')){
        var tx=(el.textContent||'').trim();
        if(tx==='-'){this.attrMinus();return;}
        if(tx==='+'){this.attrPlus();return;}
        this.uiBlip();
        return;
      }
      if(cl.contains('opt-btn')){this.buttonOption();return;}
      if(cl.contains('social-btn')){this.buttonSocial();return;}
      if(cl.contains('tab')){this.tab();return;}
      if(cl.contains('arch-card')||cl.contains('lcard')){this.buttonSelect();return;}
      if(cl.contains('btn')){
        if(cl.contains('bd')){this.buttonDanger();return;}
        if(cl.contains('bg2')){this.buttonAction();return;}
        if(cl.contains('bp')){this.buttonPrimary();return;}
        if(cl.contains('bs')){this.buttonSecondary();return;}
        this.buttonSecondary();
        return;
      }
    },
  };
})();
function hideAudioUnlockHint(){
  var h=document.getElementById('audio-unlock-hint');
  if(h) h.style.display='none';
}
/** If SFX was saved as OFF, nothing plays — point user to Settings. */
function refreshAudioHintBanner(){
  var h=document.getElementById('audio-unlock-hint');
  if(!h) return;
  try{
    if(localStorage.getItem('breakawaySound')==='0'){
      h.style.display='block';
      h.innerHTML='<span class="ab">!</span> <b>SFX IS OFF</b> (saved). Open <b>SETTINGS</b> (bottom-right) &mdash; raise <b>SOUND EFFECTS</b>, then tap the page. <span class="ab">!</span>';
    }
  }catch(e){}
}
/** Legacy API — maps to volume sliders */
function toggleRetroSound(){
  var turnOn=!RetroSound.isEnabled();
  RetroSound.setSfxVolumePct(turnOn?100:0);
  updateSettingsHintText();
  if(turnOn){
    hideAudioUnlockHint();
    var c=RetroSound.init();
    function s(){RetroSound.syncMusicForScreen((document.querySelector('.screen.on')||{}).id);}
    if(c&&c.state!=='running') c.resume().then(s).catch(s);
    else s();
    try{RetroSound.buttonToggle();}catch(e){}
  }
}
function toggleRetroBgm(){
  var turnOn=!RetroSound.isBgmEnabled();
  RetroSound.setMusicVolumePct(turnOn?100:0);
  updateSettingsHintText();
  if(turnOn){
    hideAudioUnlockHint();
    var c=RetroSound.init();
    function s(){RetroSound.syncMusicForScreen((document.querySelector('.screen.on')||{}).id);}
    if(c&&c.state!=='running') c.resume().then(s).catch(s);
    else s();
  }
}
function syncSoundToggleButton(){updateSettingsHintText();}
function syncBgmToggleButton(){updateSettingsHintText();}
(function(){
  var armed=false;
  function armWebAudio(){
    if(armed) return;
    if(!RetroSound.isEnabled()&&!RetroSound.isBgmEnabled()) return;
    var c=RetroSound.init();
    if(!c) return;
    function afterOk(){
      if(armed) return;
      armed=true;
      hideAudioUnlockHint();
      var el=document.querySelector('.screen.on');
      RetroSound.syncMusicForScreen(el?el.id:'s-title');
      try{RetroSound.uiLow();}catch(e){}
    }
    if(c.state==='running'){ afterOk(); return; }
    var p=c.resume();
    if(p&&typeof p.then==='function') p.then(afterOk).catch(function(){ afterOk(); });
    else afterOk();
  }
  document.addEventListener('pointerdown',armWebAudio,{capture:true,passive:true});
  document.addEventListener('click',armWebAudio,{capture:true});
  document.addEventListener('touchstart',armWebAudio,{capture:true,passive:true});
  document.addEventListener('keydown',function(e){
    var k=e.key||'';
    if(k==='Enter'||k===' '||e.code==='Space') armWebAudio();
  },{capture:true});
  document.addEventListener('visibilitychange',function(){
    if(document.hidden) return;
    try{RetroSound.resumeIfPossible();}catch(e){}
    if(RetroSound.isBgmEnabled&&RetroSound.isBgmEnabled()){
      try{RetroSound.syncMusicForScreen((document.querySelector('.screen.on')||{}).id);}catch(e2){}
    }
  });
})();
(function(){
  document.addEventListener('click',function(e){
    var t=e.target;
    if(!t||!t.closest) return;
    var hit=t.closest('button,.arch-card,.lcard');
    if(!hit) return;
    try{RetroSound.playForElement(hit);}catch(ex){}
  },true);
})();


function notify(txt,col){
  txt=stripBracketIcons(txt);
  col=col||'gold';
  if(col==='red') RetroSound.notifyBad();
  else if(col==='green') RetroSound.notifyGood();
  else if(col==='blue') RetroSound.ui();
  else RetroSound.notifyGold();
  var n=document.createElement('div');
  var rm=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  n.className='notif'+((rm||!isGlitchEffectsEnabled())?'':' notif-glitch');
  var c=col==='red'?'var(--red)':col==='green'?'var(--green)':col==='blue'?'var(--blue)':'var(--gold)';
  n.style.borderColor=c;
  n.innerText=txt;
  document.body.appendChild(n);
  setTimeout(function(){n.classList.add('out');setTimeout(function(){if(n.parentNode)n.parentNode.removeChild(n);},300);},2800);
}
function addNews(txt,type){
  type=type||'neutral';
  txt=stripBracketIcons(txt);
  G.news.unshift({txt:txt,type:type,week:G.week});
  if(G.news.length>50)G.news.pop();
}
