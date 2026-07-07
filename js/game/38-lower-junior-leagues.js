/* breakaway — LOWER NORTH-AMERICAN JUNIOR LADDER
 * Tier-II/III junior circuits that sit BELOW the CHL (OJL/QMJL/WJL) and USJL.
 * Path for late skill/size bloomers: Junior C -> B -> A -> CHL/USJL -> PHL draft -> pro.
 * These leagues are NOT PHL-draft eligible directly; you must earn a promotion to
 * the CHL/USJL first, then get drafted from there.
 */

/** Every lower junior league key (men + women). */
var LOWER_JUNIOR_LEAGUE_KEYS=['CJAL','CJBL','CJCL','USJD','WJDL'];

/** True for the tier-II/III junior feeders below the CHL / USJL / CWHL / USWDL. */
function isLowerJuniorLeague(leagueKey){
  return LOWER_JUNIOR_LEAGUE_KEYS.indexOf(leagueKey||'')!==-1;
}

/** Promotion ladder — where a dominant player in each lower junior league can move up to. */
var JUNIOR_PROMOTION_LADDER={
  CJCL:['CJBL'],
  CJBL:['CJAL'],
  CJAL:['OJL','QMJL','WJL','USJL'],
  USJD:['USJL','CJAL'],
  WJDL:['CWHL','USWDL']
};

/** Min OVR at which each lower junior league starts fielding promotion offers. */
var JUNIOR_PROMOTION_MIN_OVR={
  CJCL:49,
  CJBL:53,
  CJAL:58,
  USJD:55,
  WJDL:53
};

/** Min OVR to enter CHL / USJL / CWHL / USWDL directly (skip tier-II/III). */
var MAJOR_JUNIOR_DIRECT_START_OVR=58;

function getMajorJuniorDirectStartMinOvr(){
  return MAJOR_JUNIOR_DIRECT_START_OVR;
}

function isMajorJuniorLeagueKey(leagueKey){
  var k=leagueKey||'';
  return k==='OJL'||k==='QMJL'||k==='WJL'||k==='USJL'||k==='CWHL'||k==='USWDL';
}

/** Canada/USA skaters with enough tools to start in CHL/USJL (or CWHL/USWDL) at 16. */
function qualifiesForMajorJuniorDirectStart(previewOvr, nat, gender){
  previewOvr=previewOvr||0;
  if(previewOvr<getMajorJuniorDirectStartMinOvr()) return false;
  gender=gender||'M';
  nat=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat):String(nat||'');
  return nat==='Canada'||nat==='United States';
}

function pickMajorJuniorDirectStartLeague(nat, hometown, gender){
  gender=gender||'M';
  nat=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat):String(nat||'');
  if(gender==='F'){
    return nat==='United States'?'USWDL':'CWHL';
  }
  if(nat==='United States') return 'USJL';
  if(nat==='Canada'){
    if(typeof getPlayerTerritoryJuniorLeague==='function'){
      var home=getPlayerTerritoryJuniorLeague(hometown, nat, gender);
      if(home&&LEAGUES[home]) return home;
    }
    return 'OJL';
  }
  return null;
}

function getMajorJuniorLeagueOptionsForPlayer(nat, gender, hometown){
  gender=gender||'M';
  nat=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat):String(nat||'');
  var opts;
  if(gender==='F') opts=nat==='United States'?['USWDL','CWHL']:['CWHL','USWDL'];
  else if(nat==='United States') opts=['USJL','OJL','QMJL','WJL'];
  else if(nat==='Canada'){
    var home=typeof getPlayerTerritoryJuniorLeague==='function'?getPlayerTerritoryJuniorLeague(hometown, nat, gender):null;
    opts=['OJL','QMJL','WJL','USJL'];
    if(home&&opts.indexOf(home)>=0) opts=[home].concat(opts.filter(function(k){return k!==home;}));
  } else return [];
  return opts.filter(function(k){return LEAGUES[k]&&LEAGUES[k].gender===gender;});
}

/** Next-rung league keys for the player's current lower junior league (gender-filtered). */
function getJuniorPromotionOptions(){
  if(!G||!isLowerJuniorLeague(G.leagueKey)) return [];
  var lk=G.leagueKey;
  var po=typeof ovr==='function'?ovr(G.attrs,G.pos):0;
  var nat=typeof normalizePlayerNat==='function'?normalizePlayerNat(G.nat):String(G.nat||'');
  var majors=getMajorJuniorLeagueOptionsForPlayer(nat, G.gender, G.hometown);
  if(po>=getMajorJuniorDirectStartMinOvr()+6&&majors.length) return majors.slice();
  if(po>=getMajorJuniorDirectStartMinOvr()&&(lk==='CJAL'||lk==='USJD')&&majors.length) return majors.slice();
  var opts=(JUNIOR_PROMOTION_LADDER[lk]||[]).slice();
  if(po>=getMajorJuniorDirectStartMinOvr()){
    if(lk==='CJCL'&&opts.indexOf('CJAL')<0) opts.push('CJAL');
    if(lk==='CJBL'&&majors.length) opts=opts.concat(majors);
    if(lk==='USJD'&&opts.indexOf('USJL')<0) opts.unshift('USJL');
    if(lk==='WJDL'&&po>=getMajorJuniorDirectStartMinOvr()+4) opts=majors.length?majors.slice():opts;
  }
  var seen={}, out=[], i;
  for(i=0;i<opts.length;i++){
    if(seen[opts[i]]||!LEAGUES[opts[i]]||LEAGUES[opts[i]].gender!==G.gender) continue;
    seen[opts[i]]=true;
    out.push(opts[i]);
  }
  return out;
}

function getJuniorPromotionMinOvr(leagueKey){
  var v=JUNIOR_PROMOTION_MIN_OVR[leagueKey||''];
  return typeof v==='number'?v:56;
}

/** Points-per-game a player put up this season (0 for goalies / no games). */
function lowerJuniorSeasonPpg(){
  if(!G||G.pos==='G'||!(G.gp>0)) return 0;
  return ((G.goals||0)+(G.assists||0))/G.gp;
}

/**
 * A lower-junior player earns a call-up when they've either reached the OVR bar
 * for their level OR flat-out dominated the scoresheet (late bloomers who pop).
 */
function qualifiesForJuniorPromotion(){
  if(!G||!G.league||G.league.tier!=='junior'||!isLowerJuniorLeague(G.leagueKey)) return false;
  if((G.season||1)<1) return false;
  var po=typeof ovr==='function'?ovr(G.attrs,G.pos):0;
  var bar=getJuniorPromotionMinOvr(G.leagueKey);
  if(po>=bar) return true;
  // Dominated the league despite a modest rating — the classic late bloomer.
  if(G.pos==='G'){
    var sv=(G.saves||0)+(G.goalsAgainst||0)>0?(G.saves/((G.saves||0)+(G.goalsAgainst||0))):0;
    return G.gp>=Math.max(8,(G.league.games||40)*0.4)&&sv>=0.915&&po>=bar-4;
  }
  var ppg=lowerJuniorSeasonPpg();
  return G.gp>=Math.max(8,(G.league.games||40)*0.4)&&ppg>=1.15&&po>=bar-5;
}

/** Draft-status blurb shown to lower-junior players (they can't be PHL-drafted yet). */
function getLowerJuniorDraftStatusText(){
  var up=getJuniorPromotionOptions();
  var toName=up.length&&LEAGUES[up[up.length-1]]?LEAGUES[up[up.length-1]].short:'the CHL/USJL';
  return 'DRAFT STATUS: NOT PHL-ELIGIBLE — EARN A CALL-UP TO '+String(toName).toUpperCase()+' FIRST';
}

/**
 * Push promotion (call-up) offers into the offseason FA panel for a qualifying
 * lower-junior player. Called from generateOffseasonContractOffers.
 */
function appendJuniorPromotionOffers(){
  if(typeof curFAOffers==='undefined'||!G||!G.team) return;
  if(!qualifiesForJuniorPromotion()) return;
  var keys=getJuniorPromotionOptions();
  var po=typeof ovr==='function'?ovr(G.attrs,G.pos):0;
  var added=0, i;
  for(i=0;i<keys.length&&added<3;i++){
    var lk=keys[i];
    var l=LEAGUES[lk];
    var teams=TEAMS[lk]||[];
    if(!l||!teams.length) continue;
    if(typeof offerAlreadyHasLeague==='function'&&offerAlreadyHasLeague(lk)) continue;
    if(typeof canJoinLeagueByAge==='function'&&!canJoinLeagueByAge(lk)) continue;
    var team=teams[Math.floor(Math.random()*teams.length)];
    // CHL clubs honour home territory unless the player signs as an import.
    var isImport=typeof isChlTerritoryMismatch==='function'&&typeof isChlTerritoryLeague==='function'&&
      isChlTerritoryLeague(lk)&&isChlTerritoryMismatch(lk,G.hometown,G.nat,G.gender);
    curFAOffers.push({
      lk:lk, l:l, team:team,
      sal:0,
      stipendWeekly:typeof estimateWeeklyStipendForOffer==='function'?estimateWeeklyStipendForOffer(lk):undefined,
      yrs:po>=72?3:(po>=64?2:1),
      juniorDeal:true,
      movementOffer:true,
      juniorPromotion:true,
      importCareer:isImport
    });
    added++;
  }
}

/** Lateral moves within the same lower-junior league when not yet ready for a call-up. */
function appendLowerJuniorTransferOffers(){
  if(typeof curFAOffers==='undefined'||!G||!G.team||!isLowerJuniorLeague(G.leagueKey)) return;
  if((G.season||1)<1) return;
  var lk=G.leagueKey;
  var l=LEAGUES[lk];
  if(!l) return;
  var candidates=shuf((TEAMS[lk]||[]).filter(function(t){return t.n!==G.team.n;}));
  var n=Math.min(2, candidates.length), i;
  for(i=0;i<n;i++){
    var team=candidates[i];
    if(typeof offerAlreadyHasTeam==='function'&&offerAlreadyHasTeam(lk, team.n)) continue;
    curFAOffers.push({
      lk:lk, l:l, team:team,
      sal:0,
      stipendWeekly:typeof estimateWeeklyStipendForOffer==='function'?estimateWeeklyStipendForOffer(lk):undefined,
      yrs:1,
      juniorDeal:true,
      movementOffer:true,
      lowerJuniorTransfer:true
    });
  }
}

/** In-season hub guidance for lower-junior development path. */
function getLowerJuniorHubBlurb(){
  if(!G||!isLowerJuniorLeague(G.leagueKey)||!G.team) return '';
  var po=typeof ovr==='function'?ovr(G.attrs,G.pos):0;
  var bar=getJuniorPromotionMinOvr(G.leagueKey);
  var up=getJuniorPromotionOptions();
  var nextShort=up.length&&LEAGUES[up[0]]?LEAGUES[up[0]].short:'CHL/USJL';
  var qual=qualifiesForJuniorPromotion();
  var html='<div class="vt" style="font-size:13px;color:var(--acc);margin-bottom:10px;border-left:3px solid var(--acc);padding-left:8px">';
  html+='<b>Development ladder</b> — OVR <b>'+Math.round(po)+'</b> / '+bar+' needed for call-up';
  if(G.gp>0&&G.pos!=='G') html+=' · <b>'+((G.goals+G.assists)/G.gp).toFixed(2)+' PPG</b> (dominate at ~1.15+ to force a look)';
  else if(G.gp>0&&G.pos==='G'){
    var sv=(G.saves||0)+((G.goalsAgainst||0)||0)>0?G.saves/((G.saves||0)+(G.goalsAgainst||0)):0;
    html+=' · SV% <b>'+(sv*100).toFixed(1)+'</b>';
  }
  html+='. Next rung: <b>'+(typeof stripBracketIcons==='function'?stripBracketIcons(nextShort):nextShort)+'</b>.';
  if(po>=getMajorJuniorDirectStartMinOvr()) html+=' <span style="color:var(--gold)">Strong enough for CHL/USJL — call-ups can skip rungs.</span>';
  if(qual) html+=' <span style="color:var(--gold)">Call-up eligible — check offseason offers.</span>';
  html+=' PHL draft opens after a major-junior promotion.</div>';
  return html;
}
