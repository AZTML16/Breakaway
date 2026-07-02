/* breakaway — TEAM ROSTER, DEPTH CHART, LEAGUE STATS */
// ============================================================
// TEAM ROSTER, DEPTH CHART, LEAGUE STATS
// ============================================================

var F_ARCHES=['Sniper','Playmaker','PowerForward','TwoWay','Grinder'];
var D_ARCHES=['OffensiveD','TwoWayD','StayAtHome','ShutdownD'];
var DEPTH_F_SLOTS=['LW1','C1','RW1','LW2','C2','RW2','LW3','C3','RW3','LW4','C4','RW4'];
var DEPTH_D_SLOTS=['LD1','RD1','LD2','RD2','LD3','RD3'];
var DEPTH_G_SLOTS=['G1','G2'];
var DEPTH_PP_SLOTS=['1','2','3','4','5'];
var DEPTH_PK_SLOTS=['1','2','3','4'];
var ROSTER_POS_COUNTS={F:14,D:7,G:2};

function isEuropeanStyleLeague(leagueKey){
  var k=leagueKey||'';
  return k==='NEHL'||k==='FHL'||k==='CEHL'||k==='ARHL'||k==='NEJC'||k==='CEJC'||k==='ARJC'||
    k==='SDHL'||k==='FWHL'||k==='AWHL'||k==='EWJC'||k==='AWJC';
}

function isAsianJuniorLeague(leagueKey){
  var k=leagueKey||'';
  return k==='ARJC'||k==='AWJC';
}

function getLeagueNpcMaxAge(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  var tier=L.tier||'junior';
  if(tier==='junior') return typeof getJuniorMaxAge==='function'?getJuniorMaxAge():19;
  if(tier==='college') return typeof getCollegeMaxAge==='function'?getCollegeMaxAge():25;
  return 40;
}

function isEstablishedProLeague(leagueKey){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  return tier==='pro'||tier==='minor'||tier==='euro'||tier==='asia';
}

function hashTeamSeed(leagueKey, teamName){
  var h=0, s=String(teamName)+'|'+String(leagueKey||'');
  for(var i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0;
  return Math.abs(h);
}

/** Persistent team identity — offense, defense, depth, star power vary by club. */
function ensureTeamProfile(leagueKey, teamName){
  if(typeof G==='undefined'||!G) return {offense:1,defense:1,depth:1,starPower:1,composite:1};
  if(!G._teamProfiles) G._teamProfiles={};
  var ck=String(leagueKey||'')+'|'+String(teamName||'');
  if(G._teamProfiles[ck]) return G._teamProfiles[ck];
  var h=hashTeamSeed(leagueKey, teamName);
  var r1=(h%997)/997, r2=((h*7)%997)/997, r3=((h*13)%997)/997, r4=((h*19)%997)/997;
  var offense=0.86+r1*0.26;
  var defense=0.86+r2*0.26;
  var depth=0.86+r3*0.26;
  var starPower=0.86+r4*0.26;
  if(typeof isMajorJuniorEliteOrg==='function'&&isMajorJuniorEliteOrg(leagueKey, teamName)){
    starPower=Math.min(1.14, starPower+0.07);
    offense=Math.min(1.10, offense+0.04);
    depth=Math.min(1.08, depth+0.03);
  }
  var composite=offense*0.32+defense*0.28+depth*0.24+starPower*0.16;
  G._teamProfiles[ck]={offense:offense,defense:defense,depth:depth,starPower:starPower,composite:composite};
  return G._teamProfiles[ck];
}

function getTeamProfileOvrMod(leagueKey, teamName, rank){
  if(!teamName) return 0;
  var p=ensureTeamProfile(leagueKey, teamName);
  var r=rank||0;
  if(r<=1) return (p.starPower-1)*5+(p.offense-1)*2;
  if(r<=5) return (p.offense-1)*2+(p.depth-1)*1;
  if(r>=10) return (p.depth-1)*3;
  return (p.depth-1)*1.5;
}

function getTeamStandingsStrengthFromProfile(leagueKey, teamName){
  if(leagueKey==='USJL'&&typeof isUsndtOrgStandingsTeam==='function'&&isUsndtOrgStandingsTeam(teamName)){
    if(typeof getUsndtStandingsStrength==='function') return getUsndtStandingsStrength(teamName);
  }
  var p=ensureTeamProfile(leagueKey, teamName);
  var base=0.24+(p.composite-0.88)*0.52;
  if(typeof getMajorJuniorEliteOrgStandingsBonus==='function'){
    base+=getMajorJuniorEliteOrgStandingsBonus(leagueKey, teamName);
  }
  return cl(base, 0.15, 0.76);
}

function assignNpcCareerProfile(p, leagueKey, rank, teamName){
  if(!p||p.isMe) return;
  var age=p.age||22;
  var r=rank||0;
  if(isEliteProLeagueKey(leagueKey)){
    if(p.ovrCeiling==null){
      var prof=ensureTeamProfile(leagueKey, teamName);
      var roll=Math.random()+((r<=1)?(prof.starPower-1)*0.14:0);
      if(r===0&&roll<0.035){ p.npcTier='franchise'; p.ovrCeiling=ri(90,95); p.devRate=0.45; }
      else if(r<=2&&roll<0.12){ p.npcTier='star'; p.ovrCeiling=ri(85,89); p.devRate=0.55; }
      else if(r<=6){ p.npcTier='everyday'; p.ovrCeiling=ri(82,86); p.devRate=0.48; }
      else { p.npcTier='depth'; p.ovrCeiling=ri(80,83); p.devRate=0.26; }
    }
    var ceiling=p.ovrCeiling||84;
    if(r<=3&&age<=25){
      var youthGap=Math.round(Math.max(1, (27-age)*0.32)+(p.npcTier==='franchise'?3:(p.npcTier==='star'?2:1)));
      p.ovr=Math.round(cl(Math.min(p.ovr||80, ceiling-youthGap), 80, ceiling));
    } else {
      p.ovr=Math.round(cl(p.ovr||80, 80, ceiling));
    }
  } else if(isMinorProLeagueKey(leagueKey)){
    if(p.ovrCeiling==null){ p.ovrCeiling=ri(78,84); p.devRate=0.32; p.npcTier='prospect'; }
    p.ovr=Math.round(cl(p.ovr||72, 72, p.ovrCeiling));
  }
}

function rollNpcAgeForLeague(leagueKey, pos){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  var maxA=getLeagueNpcMaxAge(leagueKey);
  if(tier==='junior') return ri(typeof getJuniorMinAge==='function'?getJuniorMinAge():16, Math.min(typeof getJuniorMaxAge==='function'?getJuniorMaxAge():19, maxA-1));
  if(tier==='college') return ri(18, Math.min(24, maxA-1));
  if(tier==='local') return ri(16, Math.min(28, maxA-1));
  if(tier==='pro'){
    if(pos==='G') return ri(24, 38);
    return ri(22, 37);
  }
  if(tier==='minor'||tier==='euro'||tier==='asia'){
    if(pos==='G') return ri(22, 36);
    return ri(20, 35);
  }
  if(pos==='G') return ri(20, 34);
  return ri(18, Math.min(32, maxA));
}

function getJuniorAgeOvrBonus(age){
  if(age===16) return rd(-6, -1);
  if(age===17) return rd(-4, 1);
  if(age===18) return rd(-1, 4);
  if(age===19) return rd(1, 6);
  return rd(-1, 2);
}

function applyProAgeOvrModifier(age){
  if(age>=37) return -rd(4, 8);
  if(age>=34) return -rd(2.5, 5.5);
  if(age>=30) return -rd(1.2, 3.8);
  return 0;
}

/** Junior skill ladder (16–20): OJL best CHL > WJL (slightly behind, balanced) >> QMJL (weakest CHL) > USJL clubs > NEJC … */
function getLeagueRosterSkillOffset(leagueKey){
  var map={
    OJL:2, CWHL:2, WJL:1, USJL:1, USWDL:1, NEJC:-1,
    ARJC:-2, QMJL:-4, CEJC:-5,
    EWJC:-2, AWJC:-4,
    NCHA:1, NWCHA:0,
    NEHL:1, FHL:-1, CEHL:-7, SDHL:0, FWHL:-1, AWHL:0, ARHL:1,
    NAML:0, PWDL:0, PHL:1, PWL:1
  };
  return map[leagueKey]!=null?map[leagueKey]:0;
}

function isFinnishNejcTeam(teamName){
  if(!teamName) return false;
  return /Turku|Tampere|Helsinki/i.test(teamName);
}

function getJuniorRegionalOvrOffset(leagueKey, teamName){
  if(leagueKey==='NEJC'&&isFinnishNejcTeam(teamName)) return -2;
  if(isMajorJuniorEliteOrg(leagueKey, teamName)){
    if(leagueKey==='OJL') return 2.5;
    if(leagueKey==='WJL') return 1.5;
    return 1;
  }
  return 0;
}

/** OVR band per circuit — PHL roster core is 80–88; stars above. NAML tops out below PHL regulars. */
var MEN_LEAGUE_OVR_BANDS={
  PHL:{cap:99,floor:76,baseline:83,spread:5},
  NAML:{cap:84,floor:72,baseline:77,spread:5},
  NEHL:{cap:87,floor:58,baseline:74,spread:11},
  FHL:{cap:76,floor:48,baseline:60,spread:10},
  CEHL:{cap:66,floor:42,baseline:48,spread:7},
  ARHL:{cap:88,floor:58,baseline:75,spread:12},
  OJL:{cap:74,floor:52,baseline:58,spread:10},
  CWHL:{cap:74,floor:52,baseline:57,spread:10},
  USJL:{cap:72,floor:50,baseline:56,spread:9},
  USWDL:{cap:72,floor:50,baseline:56,spread:9},
  WJL:{cap:73,floor:51,baseline:57,spread:10},
  NEJC:{cap:70,floor:49,baseline:54,spread:9},
  ARJC:{cap:69,floor:48,baseline:53,spread:9},
  QMJL:{cap:65,floor:47,baseline:50,spread:8},
  CEJC:{cap:65,floor:46,baseline:49,spread:8},
  EWJC:{cap:68,floor:48,baseline:52,spread:8},
  AWJC:{cap:66,floor:46,baseline:50,spread:8},
  NCHA:{cap:84,floor:55,baseline:64,spread:12},
  NWCHA:{cap:84,floor:55,baseline:63,spread:12},
  LHCM:{cap:72,floor:46,baseline:52,spread:9},
  LHLF:{cap:72,floor:45,baseline:51,spread:9}
};

var WOMEN_LEAGUE_MEN_ANALOG={
  PWL:'PHL', PWDL:'NAML', CWHL:'OJL', NWCHA:'NCHA', USWDL:'USJL',
  EWJC:'NEJC', AWJC:'ARJC', SDHL:'NEHL', FWHL:'FHL', AWHL:'ARHL',
  LHLF:'LHCM'
};

function getMenAnalogLeagueKey(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  if(L.gender!=='F') return leagueKey;
  return WOMEN_LEAGUE_MEN_ANALOG[leagueKey]||leagueKey;
}

function getTierFallbackOvrBand(tier){
  if(tier==='local') return {cap:72,floor:46,baseline:52,spread:9};
  if(tier==='junior') return {cap:74,floor:52,baseline:58,spread:10};
  if(tier==='college') return {cap:84,floor:55,baseline:64,spread:12};
  if(tier==='euro'||tier==='asia') return {cap:87,floor:58,baseline:73,spread:11};
  if(tier==='minor') return {cap:83,floor:54,baseline:68,spread:10};
  if(tier==='pro') return {cap:99,floor:76,baseline:83,spread:5};
  if(tier==='minor') return {cap:84,floor:72,baseline:77,spread:5};
  return {cap:80,floor:52,baseline:62,spread:11};
}

function getLeagueOvrBands(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  var analog=getMenAnalogLeagueKey(leagueKey);
  var menBand=MEN_LEAGUE_OVR_BANDS[analog];
  if(!menBand){
    var tier=L.tier||'junior';
    if(L.gender==='F'&&tier==='pro') menBand=MEN_LEAGUE_OVR_BANDS.PHL;
    else if(L.gender==='F'&&tier==='minor') menBand=MEN_LEAGUE_OVR_BANDS.NAML;
    else menBand=getTierFallbackOvrBand(tier);
  }
  return {
    cap:menBand.cap,
    floor:menBand.floor,
    baseline:menBand.baseline,
    spread:menBand.spread
  };
}

function getLeagueOvrCap(leagueKey){
  return getLeagueOvrBands(leagueKey).cap;
}

function getLeagueOvrFloor(leagueKey){
  return getLeagueOvrBands(leagueKey).floor;
}

function getLeagueBaselineOvr(leagueKey){
  return getLeagueOvrBands(leagueKey).baseline;
}

function emptyPlayerStats(){
  return {gp:0,g:0,a:0,pts:0,pm:0,pim:0,sv:0,ga:0,w:0,gpMissed:0};
}

function copyStatBlock(target, source){
  if(!target||!source) return target;
  target.gp=source.gp||0; target.g=source.g||0; target.a=source.a||0; target.pts=source.pts||0;
  target.pm=source.pm||0; target.pim=source.pim||0; target.sv=source.sv||0; target.ga=source.ga||0;
  target.w=source.w||0; target.gpMissed=source.gpMissed||0;
  return target;
}

function ensureCareerLeagueStats(p, leagueKey){
  if(!p.careerLeagueStats) p.careerLeagueStats={};
  var ck=String(leagueKey||'');
  if(!p.careerLeagueStats[ck]) p.careerLeagueStats[ck]=emptyPlayerStats();
  return p.careerLeagueStats[ck];
}

function mergeSeasonIntoCareerLeagueStats(p, leagueKey){
  if(!p||!p.seasonStats) return;
  var s=p.seasonStats;
  if((s.gp||0)<1&&(s.pts||0)<1) return;
  var career=ensureCareerLeagueStats(p, leagueKey);
  career.gp+=s.gp||0; career.g+=s.g||0; career.a+=s.a||0; career.pts+=s.pts||0;
  career.pm+=s.pm||0; career.pim=(career.pim||0)+(s.pim||0);
  career.sv=(career.sv||0)+(s.sv||0); career.ga=(career.ga||0)+(s.ga||0);
  career.w=(career.w||0)+(s.w||0); career.gpMissed=(career.gpMissed||0)+(s.gpMissed||0);
}

function getCombinedCareerLeagueStats(p, leagueKey){
  var out=emptyPlayerStats();
  var ck=String(leagueKey||'');
  if(p.careerLeagueStats&&p.careerLeagueStats[ck]) copyStatBlock(out, p.careerLeagueStats[ck]);
  if(p.seasonStats){
    out.gp+=p.seasonStats.gp||0; out.g+=p.seasonStats.g||0; out.a+=p.seasonStats.a||0; out.pts+=p.seasonStats.pts||0;
    out.pm+=p.seasonStats.pm||0; out.pim=(out.pim||0)+(p.seasonStats.pim||0);
    out.sv=(out.sv||0)+(p.seasonStats.sv||0); out.ga=(out.ga||0)+(p.seasonStats.ga||0);
    out.w=(out.w||0)+(p.seasonStats.w||0); out.gpMissed=(out.gpMissed||0)+(p.seasonStats.gpMissed||0);
  }
  return out;
}

function getLeagueSeasonGameCount(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  if(L.games) return L.games;
  return getLeagueScoringProfile(leagueKey).games||68;
}

function getNpcDebutAgeForLeague(leagueKey){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  if(tier==='junior') return 16;
  if(tier==='college') return 18;
  if(tier==='pro'||tier==='minor') return 21;
  if(tier==='euro'||tier==='asia') return 20;
  if(tier==='local') return 16;
  return 18;
}

function rankToEstDepthLine(rank, pos){
  if(pos==='G') return (rank||0)===0?1:2;
  var r=rank||0;
  if(r<=2) return 1;
  if(r<=5) return 2;
  if(r<=8) return 3;
  return 4;
}

/** Completed league seasons before the current year (for pre-user career volume). */
function estimateNpcLeagueSeasons(player, leagueKey, rank){
  if(!player||player.rookie) return 0;
  if(player.juniorMate) return Math.max(0, Math.min(2, (player.age||17)-getNpcDebutAgeForLeague(leagueKey)));
  var age=player.age||20;
  var debut=getNpcDebutAgeForLeague(leagueKey);
  var span=Math.max(0, age-debut);
  if(span<=0) return 0;
  if(player.proProspect&&age<=debut+2) return Math.max(0, span-1);
  var line=rankToEstDepthLine(rank, player.pos);
  var tenure=span;
  if(line>=4) tenure=Math.max(1, Math.round(span*0.42+rd(-0.4,0.4)));
  else if(line===3) tenure=Math.max(1, Math.round(span*0.65+rd(-0.4,0.4)));
  else if(line===2) tenure=Math.max(1, Math.round(span*0.8+rd(-0.4,0.4)));
  if(line===1&&age>=26) tenure=Math.max(tenure, Math.round(span*0.86));
  if(line===1&&age>=30&&(player.ovr||0)>=88) tenure=Math.max(tenure, span-1);
  return Math.max(0, Math.min(span, tenure)-1);
}

function estimatePriorSeasonPpg(player, leagueKey, rank){
  var saveSlot=player.depthSlot;
  var line=rankToEstDepthLine(rank, player.pos);
  var fakeSlot=player.pos==='G'?(line===1?'G1':'G2'):
    (player.pos==='D'?(line===1?'LD1':line===2?'LD2':line===3?'LD3':'LD4'):
     (line===1?'C1':line===2?'C2':line===3?'C3':'C4'));
  player.depthSlot=fakeSlot;
  var ppg=getNpcTargetPpg(player, leagueKey);
  player.depthSlot=saveSlot;
  if((player.age||20)>=28&&(player.ovr||0)>=90) ppg*=rd(1.02,1.12);
  else if((player.age||20)>=24) ppg*=rd(0.9,1.04);
  else ppg*=rd(0.8,0.95);
  return ppg;
}

function synthesizeNpcPriorCareerBlock(player, leagueKey, rank, seasons){
  if(seasons<=0) return emptyPlayerStats();
  var gpPer=getLeagueSeasonGameCount(leagueKey);
  var line=rankToEstDepthLine(rank, player.pos);
  var avail=player.pos==='G'?(line===1?0.58:0.22):(line<=2?0.88:line===3?0.72:0.55);
  var gp=Math.round(seasons*gpPer*avail*rd(0.92,1.04));
  if(gp<12&&seasons>=1) gp=Math.max(12, Math.round(seasons*gpPer*0.42));
  var out=emptyPlayerStats();
  out.gp=gp;
  if(player.pos==='G'){
    var starts=Math.max(1, Math.round(gp*0.95));
    out.sv=Math.round(starts*ri(24,32)*rd(0.94,1.06));
    out.ga=Math.round(starts*rd(2.4,3.6));
    out.w=Math.round(starts*cl(0.46+((player.ovr||72)-72)/130, 0.36, 0.66));
    return out;
  }
  var ppg=estimatePriorSeasonPpg(player, leagueKey, rank);
  var pts=Math.max(0, Math.round(gp*ppg));
  var arch=player.arch||'TwoWay';
  var gShare=0.42;
  if(arch==='Sniper') gShare=0.62;
  else if(arch==='Playmaker') gShare=0.34;
  else if(arch==='Grinder') gShare=0.38;
  else if(player.pos==='D'&&arch==='OffensiveD') gShare=0.46;
  else if(player.pos==='D') gShare=0.38;
  out.g=Math.round(pts*gShare);
  out.a=Math.max(0, pts-out.g);
  out.pts=out.g+out.a;
  out.pm=Math.round((out.g+out.a*0.5-line*2.2)*rd(0.35,0.85));
  out.pim=Math.round(gp*rd(0.08,0.2)*(arch==='Grinder'?1.55:1));
  return out;
}

function seedNpcPriorCareerStatsIfNeeded(player, leagueKey, rank){
  if(!player||player.isMe||player._priorCareerSeeded) return;
  var career=ensureCareerLeagueStats(player, leagueKey);
  var gpPer=getLeagueSeasonGameCount(leagueKey)||72;
  var targetSeasons=estimateNpcLeagueSeasons(player, leagueKey, rank);
  var simSeasons=gpPer>0?Math.floor((career.gp||0)/Math.max(1, Math.round(gpPer*0.82))):0;
  var priorSeasons=Math.max(0, targetSeasons-simSeasons);
  if(priorSeasons<=0){
    player._priorCareerSeeded=true;
    return;
  }
  var block=synthesizeNpcPriorCareerBlock(player, leagueKey, rank, priorSeasons);
  career.gp+=block.gp||0;
  career.g+=block.g||0;
  career.a+=block.a||0;
  career.pts+=block.pts||0;
  career.pm+=block.pm||0;
  career.pim=(career.pim||0)+(block.pim||0);
  career.sv=(career.sv||0)+(block.sv||0);
  career.ga=(career.ga||0)+(block.ga||0);
  career.w=(career.w||0)+(block.w||0);
  player._priorCareerSeeded=true;
}

function seedRosterPriorCareerStats(roster){
  if(!roster||!roster.players||!roster.leagueKey) return;
  var lk=roster.leagueKey;
  var byPos={F:[],D:[],G:[]}, pos;
  roster.players.forEach(function(p){
    if(p.isMe) return;
    if(byPos[p.pos]) byPos[p.pos].push(p);
  });
  for(pos in byPos){
    if(!byPos.hasOwnProperty(pos)) continue;
    byPos[pos].sort(function(a,b){return (b.ovr||0)-(a.ovr||0);});
    byPos[pos].forEach(function(p,i){ seedNpcPriorCareerStatsIfNeeded(p, lk, i); });
  }
}

function healPlayerSeasonStats(p, leagueKey){
  if(!p||p.isMe) return;
  var s=ensurePlayerStats(p);
  var curSeason=G?G.season:1;
  var cal=typeof getLeagueCalendarGamesPlayed==='function'?getLeagueCalendarGamesPlayed(leagueKey):0;
  var staleSeason=(typeof p._statsSeason==='number'&&p._statsSeason!==curSeason);
  var npcExpected=cal;
  if(leagueKey==='USJL'&&p.team&&typeof getUsndtNpcLeagueGpCap==='function'){
    var usCap=getUsndtNpcLeagueGpCap(p.team);
    if(usCap!=null) npcExpected=Math.min(npcExpected, usCap);
  }
  if(typeof isLocalLeague==='function'&&isLocalLeague(leagueKey)&&typeof countLocalGamesThroughWeek==='function'){
    var syncWk=Math.max(0, typeof G._npcStatsSyncedWeek==='number'?G._npcStatsSyncedWeek:((G.week||1)-1));
    npcExpected=countLocalGamesThroughWeek(syncWk);
  }
  var staleGp=((s.gp||0)>0&&(
    (typeof isLocalLeague==='function'&&isLocalLeague(leagueKey)&&(s.gp||0)>npcExpected+2)||
    (s.gp>cal+10||((G.week||1)<=1&&(G.gp||0)===0&&(G._npcStatsSyncedWeek||0)===0&&cal<1))
  ));
  if((staleSeason&&((s.gp||0)>0||(s.pts||0)>0))||staleGp){
    mergeSeasonIntoCareerLeagueStats(p, leagueKey);
    p.seasonStats=emptyPlayerStats();
    s=ensurePlayerStats(p);
  }
  if(typeof clampUsndtPlayerSeasonStatsInPlace==='function') clampUsndtPlayerSeasonStatsInPlace(p, leagueKey);
  p._statsSeason=curSeason;
}

function clampUsndtPlayerSeasonStatsInPlace(p, leagueKey){
  if(!p||p.isMe||leagueKey!=='USJL'||!p.team) return;
  if(typeof getUsndtNpcLeagueGpCap!=='function') return;
  var cap=getUsndtNpcLeagueGpCap(p.team);
  if(cap==null) return;
  var s=ensurePlayerStats(p);
  if((s.gp||0)<=cap) return;
  var ratio=cap/(s.gp||1);
  s.gp=cap;
  s.g=Math.round((s.g||0)*ratio);
  s.a=Math.round((s.a||0)*ratio);
  s.pts=(s.g||0)+(s.a||0);
  s.pm=Math.round((s.pm||0)*ratio);
  s.pim=Math.round((s.pim||0)*ratio);
  s.sv=Math.round((s.sv||0)*ratio);
  s.ga=Math.round((s.ga||0)*ratio);
  s.w=Math.min(cap, Math.round((s.w||0)*ratio));
}

function finalizeLeagueSeasonBeforeReset(leagueKey, endedSeason){
  if(!G||!leagueKey||!endedSeason) return;
  var teams=TEAMS[leagueKey]||[];
  var t, ck, roster, pi, p;
  for(t=0;t<teams.length;t++){
    ck=String(leagueKey)+'|'+endedSeason+'|'+String(teams[t].n||'');
    roster=G.leagueRostersCache&&G.leagueRostersCache[ck];
    if(!roster||!roster.players) continue;
    for(pi=0;pi<roster.players.length;pi++){
      p=roster.players[pi];
      if(p.isMe) continue;
      mergeSeasonIntoCareerLeagueStats(p, leagueKey);
      p.seasonStats=emptyPlayerStats();
      p._statsSeason=G.season||1;
    }
  }
}

function resetLeagueRosterCachesForNewSeason(leagueKey){
  if(!G||!G.leagueRostersCache||!leagueKey) return;
  var cur=G.season||1;
  var prefix=String(leagueKey)+'|'+cur+'|';
  Object.keys(G.leagueRostersCache).forEach(function(k){
    if(k.indexOf(prefix)===0) delete G.leagueRostersCache[k];
  });
}

function mergeUserSeasonIntoCareerLeagueStats(){
  if(!G||!G.leagueKey) return;
  if(!G.careerLeagueStats) G.careerLeagueStats={};
  var ck=G.leagueKey;
  if(!G.careerLeagueStats[ck]) G.careerLeagueStats[ck]=emptyPlayerStats();
  var c=G.careerLeagueStats[ck];
  if((G.gp||0)<1){
    if(typeof mergeCallUpSeasonsIntoCareerLeagueStats==='function') mergeCallUpSeasonsIntoCareerLeagueStats();
    return;
  }
  c.gp+=G.gp||0; c.g+=G.goals||0; c.a+=G.assists||0; c.pts+=(G.goals||0)+(G.assists||0);
  c.pm+=G.plusminus||0; c.pim=(c.pim||0)+(G.pim||0);
  c.sv=(c.sv||0)+(G.saves||0); c.ga=(c.ga||0)+(G.goalsAgainst||0); c.w=(c.w||0)+(G.w||0);
  if(typeof mergeCallUpSeasonsIntoCareerLeagueStats==='function') mergeCallUpSeasonsIntoCareerLeagueStats();
}

function ensurePlayerStats(p){
  if(!p.seasonStats) p.seasonStats=emptyPlayerStats();
  if(typeof p.form!=='number') p.form=48+ri(0,12);
  if(typeof p.seasonStats.gpMissed!=='number') p.seasonStats.gpMissed=0;
  return p.seasonStats;
}

function rosterCacheKey(leagueKey, teamName){
  return String(leagueKey||'')+'|'+(G.season||1)+'|'+String(teamName||'');
}

function invalidateLeagueRosterCaches(){
  if(G) G.leagueRostersCache={};
  G._leagueStatsKey=null;
  G.leaguePlayerStats=null;
}

/**
 * Scoring pace / playstyle:
 * OJL — transition, quick, skilled, dynamic | WJL — structured, physical
 * QMJL — flashy skill entertainment | USJL — skill-based but structured
 * NEJC/CEJC/ARJC/EWJC/AWJC — technical eurasian academies
 */
function getLeagueScoringPaceClass(leagueKey){
  var lk=leagueKey||'';
  if(lk==='OJL'||lk==='CJL') return 'rungun';
  if(lk==='WJL') return 'structured';
  if(lk==='QMJL') return 'high';
  if(lk==='USJL'||lk==='USWDL') return 'structured';
  if(lk==='NEJC'||lk==='CEJC'||lk==='ARJC'||lk==='EWJC'||lk==='AWJC') return 'high';
  if(typeof isLocalLeague==='function'&&isLocalLeague(lk)) return 'rungun';
  if(lk==='PHL') return 'tight';
  if(lk==='CWHL') return 'high';
  if(lk==='NAML'||lk==='PWDL'||lk==='ARHL') return 'structured';
  if(lk==='NCHA'||lk==='NWCHA'||lk==='NEHL'||lk==='FHL'||lk==='SDHL'||lk==='FWHL'||lk==='PWL') return 'tight';
  if(lk==='CEHL'||lk==='AWHL') return 'lowskill';
  var tier=(LEAGUES[lk]||{}).tier||'junior';
  if(tier==='local'||tier==='pro') return 'rungun';
  if(tier==='junior') return 'high';
  if(tier==='college') return 'tight';
  if(tier==='minor') return 'structured';
  if(tier==='euro'||tier==='asia') return 'tight';
  return 'structured';
}

function getLeagueScoringPaceKnobs(paceClass){
  var knobs={
    rungun:   {npcScale:1.12, tierBoost:1.07, ppgCap:1.78, userSim:1.08, nightCapF:4, nightCapD:3},
    high:     {npcScale:1.06, tierBoost:1.03, ppgCap:1.52, userSim:1.02, nightCapF:4, nightCapD:3},
    structured:{npcScale:0.91, tierBoost:0.92, ppgCap:1.26, userSim:0.90, nightCapF:3, nightCapD:2},
    tight:    {npcScale:0.84, tierBoost:0.88, ppgCap:1.10, userSim:0.82, nightCapF:3, nightCapD:2},
    lowskill: {npcScale:0.76, tierBoost:0.84, ppgCap:0.96, userSim:0.74, nightCapF:2, nightCapD:2}
  };
  return knobs[paceClass]||knobs.structured;
}

/** Per-league pace tweaks on top of playstyle class. */
function getLeaguePaceKnobsForLeague(leagueKey){
  var lk=leagueKey||'';
  var k=getLeagueScoringPaceKnobs(getLeagueScoringPaceClass(lk));
  if(lk==='OJL') return {npcScale:1.14, tierBoost:1.08, ppgCap:1.82, userSim:1.10, nightCapF:4, nightCapD:3};
  if(lk==='WJL') return {npcScale:0.88, tierBoost:0.90, ppgCap:1.20, userSim:0.86, nightCapF:3, nightCapD:2};
  if(lk==='QMJL') return {npcScale:1.05, tierBoost:1.04, ppgCap:1.55, userSim:1.06, nightCapF:4, nightCapD:2};
  if(lk==='USJL') return {npcScale:0.93, tierBoost:0.94, ppgCap:1.30, userSim:0.92, nightCapF:3, nightCapD:2};
  if(lk==='NEJC'||lk==='CEJC'||lk==='ARJC'||lk==='EWJC'||lk==='AWJC'){
    var eurasian=lk==='ARJC'||lk==='EWJC';
    return {
      npcScale:eurasian?1.20:1.14,
      tierBoost:eurasian?1.10:1.06,
      ppgCap:eurasian?1.75:1.68,
      userSim:eurasian?1.14:1.10,
      nightCapF:4, nightCapD:3
    };
  }
  if(lk==='PHL'){
    return {npcScale:0.84, tierBoost:0.88, ppgCap:1.02, userSim:0.86, nightCapF:2, nightCapD:2};
  }
  if(lk==='NEHL'||lk==='FHL'||lk==='CEHL'||lk==='ARHL'||lk==='SDHL'||lk==='FWHL'||lk==='AWHL'){
    return {npcScale:0.76, tierBoost:0.82, ppgCap:0.90, userSim:0.78, nightCapF:2, nightCapD:2};
  }
  return k;
}

/** User SIM WEEK pace multiplier (per-game offensive environment). */
function getLeagueUserSimPaceMult(leagueKey){
  return getLeaguePaceKnobsForLeague(leagueKey).userSim;
}

function getLeagueScoringProfile(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  var g=L.games||68;
  /** Season totals for scoring leader (Art Ross pace). */
  var pts=78, gl=28, al=50;
  if(leagueKey==='PHL'){ pts=82; gl=28; al=54; }
  else if(leagueKey==='PWL'){ pts=38; gl=14; al=24; }
  else if(leagueKey==='OJL'||leagueKey==='CWHL'){ pts=leagueKey==='CWHL'?56:94; gl=leagueKey==='CWHL'?22:38; al=leagueKey==='CWHL'?34:52; }
  else if(leagueKey==='WJL'){ pts=86; gl=34; al=48; }
  else if(leagueKey==='CJL'){ pts=110; gl=44; al=66; }
  else if(leagueKey==='USJL'){ pts=70; gl=26; al=42; }
  else if(leagueKey==='QMJL'){ pts=66; gl=24; al=40; }
  else if(leagueKey==='NAML'||leagueKey==='PWDL'){ pts=leagueKey==='PWDL'?58:72; gl=leagueKey==='PWDL'?18:24; al=leagueKey==='PWDL'?40:48; }
  else if(leagueKey==='USWDL'){ pts=62; gl=20; al=42; }
  else if(leagueKey==='NCHA'){ pts=44; gl=14; al=30; }
  else if(leagueKey==='NWCHA'){ pts=40; gl=12; al=28; }
  else if(leagueKey==='NEHL'){ pts=46; gl=14; al=32; }
  else if(leagueKey==='FHL'){ pts=52; gl=16; al=36; }
  else if(leagueKey==='CEHL'){ pts=38; gl=12; al=26; }
  else if(leagueKey==='ARHL'){ pts=62; gl=20; al=42; }
  else if(leagueKey==='SDHL'){ pts=30; gl=10; al=20; }
  else if(leagueKey==='FWHL'){ pts=28; gl=9; al=19; }
  else if(leagueKey==='AWHL'){ pts=26; gl=8; al=18; }
  else if(leagueKey==='NEJC'){ pts=68; gl=24; al=44; }
  else if(leagueKey==='CEJC'){ pts=64; gl=22; al=42; }
  else if(leagueKey==='ARJC'){ pts=76; gl=28; al=48; }
  else if(leagueKey==='EWJC'){ pts=54; gl=18; al=36; }
  else if(leagueKey==='AWJC'){ pts=50; gl=16; al=34; }
  else if(typeof isLocalLeague==='function'&&isLocalLeague(leagueKey)){ pts=22; gl=14; al=8; }
  else {
    var pace=getLeagueScoringPaceClass(leagueKey);
    if(pace==='rungun'){ pts=90; gl=34; al=56; }
    else if(pace==='high'){ pts=82; gl=30; al=52; }
    else if(pace==='tight'){ pts=46; gl=14; al=32; }
    else if(pace==='lowskill'){ pts=28; gl=8; al=20; }
    else { pts=72; gl=24; al=48; }
  }
  return {games:g, ptsLeader:pts, gLeader:gl, aLeader:al, paceClass:getLeagueScoringPaceClass(leagueKey)};
}

/** Global dampener — tuned so league leaders land near ptsLeader after line/archetype mults. */
function getLeagueNpcScoringScale(leagueKey){
  return getLeaguePaceKnobsForLeague(leagueKey).npcScale;
}

function getNpcTargetPpgCap(leagueKey, player){
  var cap=getLeaguePaceKnobsForLeague(leagueKey).ppgCap;
  if(leagueKey==='PHL'){
    if(player&&player.pos==='D'&&player.arch==='OffensiveD'){
      if(typeof isPhlGenerationalOffensiveD==='function'&&isPhlGenerationalOffensiveD(player)) return 1.18;
      if(typeof isPhlEliteOffensiveD==='function'&&isPhlEliteOffensiveD(player)) return 1.10;
      return 1.06;
    }
    if(player&&player.pos==='D'&&player.arch==='TwoWayD'&&typeof isPhlDualThreatDefenseman==='function'&&isPhlDualThreatDefenseman(player)) return 0.82;
    if(player&&player.pos==='F'&&player.arch==='Playmaker'&&typeof isPhlGenerationalPlaymaker==='function'&&isPhlGenerationalPlaymaker(player)) return 1.22;
    if(player&&player.pos==='F'&&player.arch==='Playmaker'&&typeof isPhlElitePlaymaker==='function'&&isPhlElitePlaymaker(player)) return 1.10;
    if(player&&typeof isPhlGenerationalSniper==='function'&&isPhlGenerationalSniper(player)) return 1.22;
    if(player&&typeof isPhlEliteSniper==='function'&&isPhlEliteSniper(player)) return 1.1;
    return Math.min(cap, 0.88);
  }
  if(leagueKey==='ARJC'||leagueKey==='EWJC'||leagueKey==='NEJC'||leagueKey==='CEJC'||leagueKey==='AWJC'){
    if(player&&player.pos==='F'&&(player.arch==='Sniper'||player.arch==='Playmaker')) return Math.max(cap, 1.62);
  }
  return cap;
}

/** User player stub for PHL sniper / scoring helpers (shared with sim + playable). */
function getUserScoringProxy(line, perf){
  if(typeof G==='undefined'||!G) return null;
  return {
    isMe:true, pos:G.pos, arch:G.arch,
    ovr:typeof ovr==='function'?ovr(G.attrs,G.pos):0,
    depthSlot:null,
    scoringPulse:typeof G._scoringPulse==='number'?G._scoringPulse:1
  };
}

/** Season-to-season finishing variance — rare hot years can chase 60–70 goals in PHL. */
function ensureUserScoringPulse(){
  if(!G||G.pos==='G') return 1;
  var uOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):70;
  if(typeof G._scoringPulse!=='number'){
    G._scoringPulse=rd(0.88, Math.min(1.06, 0.78+uOvr/125));
    if(G.leagueKey==='PHL'&&G.arch==='Sniper'&&G.pos==='F'&&uOvr>95&&Math.random()<0.22){
      G._scoringPulse=rd(1.02, 1.1);
    } else if(G.leagueKey==='PHL'&&G.arch==='Playmaker'&&G.pos==='F'&&uOvr>93&&Math.random()<0.2){
      G._scoringPulse=rd(1.0, 1.08);
    }
  } else if(Math.random()<0.36){
    G._scoringPulse=cl(G._scoringPulse+rd(-0.1, 0.1), 0.84, 1.12);
  }
  return G._scoringPulse;
}

/** PHL L1 sniper — elite finishing pace (still rare to average 1 G/GP). */
function isPhlEliteSniper(player, line, perf){
  if(!player||player.pos!=='F'||player.arch!=='Sniper') return false;
  if(line==null&&player.depthSlot&&typeof getDepthLineFromSlot==='function') line=getDepthLineFromSlot(player.depthSlot, player.pos);
  if(line==null) line=3;
  if(perf==null&&typeof getOvrPerformanceMult==='function') perf=getOvrPerformanceMult(player,'PHL');
  if(perf==null) perf=0.85;
  var ovrN=player.ovr;
  if(ovrN==null&&player.isMe&&typeof G!=='undefined'&&G&&typeof ovr==='function') ovrN=ovr(G.attrs,G.pos);
  ovrN=ovrN||0;
  var pulse=typeof player.scoringPulse==='number'?player.scoringPulse:1;
  return line===1&&perf>=0.91&&ovrN>=89&&(pulse>=0.97||ovrN>=92);
}

/** Once-in-a-generation PHL goal scorer — elite sniper at 96+ OVR; can chase ~70 goals. */
function isPhlGenerationalSniper(player, line, perf){
  if(!isPhlEliteSniper(player, line, perf)) return false;
  var ovrN=player.ovr;
  if(ovrN==null&&player.isMe&&typeof G!=='undefined'&&G&&typeof ovr==='function') ovrN=ovr(G.attrs,G.pos);
  return (ovrN||0)>=96;
}

/** PHL top-pair offensive D — Norris pace (~0.9–1.0 PPG), goals not just assists. */
function isPhlEliteOffensiveD(player, line, perf){
  if(!player||player.pos!=='D'||player.arch!=='OffensiveD') return false;
  if(line==null&&player.depthSlot&&typeof getDepthLineFromSlot==='function') line=getDepthLineFromSlot(player.depthSlot, player.pos);
  if(line==null) line=3;
  if(perf==null&&typeof getOvrPerformanceMult==='function') perf=getOvrPerformanceMult(player,'PHL');
  if(perf==null) perf=0.85;
  var ovrN=player.ovr;
  if(ovrN==null&&player.isMe&&typeof G!=='undefined'&&G&&typeof ovr==='function') ovrN=ovr(G.attrs,G.pos);
  ovrN=ovrN||0;
  var pulse=typeof player.scoringPulse==='number'?player.scoringPulse:1;
  return line<=2&&perf>=0.90&&ovrN>=88&&(pulse>=0.96||ovrN>=91);
}

function isPhlGenerationalOffensiveD(player, line, perf){
  if(!isPhlEliteOffensiveD(player, line, perf)) return false;
  var ovrN=player.ovr;
  if(ovrN==null&&player.isMe&&typeof G!=='undefined'&&G&&typeof ovr==='function') ovrN=ovr(G.attrs,G.pos);
  return (ovrN||0)>=96;
}

/** PHL stay-at-home / two-way D with enough offense to show up on the scoresheet. */
function isPhlDualThreatDefenseman(player, line, perf){
  if(!player||player.pos!=='D') return false;
  if(player.arch!=='TwoWayD'&&player.arch!=='StayAtHome'&&player.arch!=='ShutdownD') return false;
  if(line==null&&player.depthSlot&&typeof getDepthLineFromSlot==='function') line=getDepthLineFromSlot(player.depthSlot, player.pos);
  if(line==null) line=3;
  if(perf==null&&typeof getOvrPerformanceMult==='function') perf=getOvrPerformanceMult(player,'PHL');
  if(perf==null) perf=0.85;
  var ovrN=player.ovr;
  if(ovrN==null&&player.isMe&&typeof G!=='undefined'&&G&&typeof ovr==='function') ovrN=ovr(G.attrs,G.pos);
  return line<=2&&perf>=0.86&&(ovrN||0)>=84;
}

/** PHL L1 playmaker — drives Art Ross pace. */
function isPhlElitePlaymaker(player, line, perf){
  if(!player||player.pos!=='F'||player.arch!=='Playmaker') return false;
  if(line==null&&player.depthSlot&&typeof getDepthLineFromSlot==='function') line=getDepthLineFromSlot(player.depthSlot, player.pos);
  if(line==null) line=3;
  if(perf==null&&typeof getOvrPerformanceMult==='function') perf=getOvrPerformanceMult(player,'PHL');
  if(perf==null) perf=0.85;
  var ovrN=player.ovr;
  if(ovrN==null&&player.isMe&&typeof G!=='undefined'&&G&&typeof ovr==='function') ovrN=ovr(G.attrs,G.pos);
  ovrN=ovrN||0;
  var pulse=typeof player.scoringPulse==='number'?player.scoringPulse:1;
  return line===1&&perf>=0.93&&ovrN>=92&&(pulse>=0.98||ovrN>=95);
}

/** Once-in-a-generation PHL playmaker — 96+ OVR; can chase ~100 assists. */
function isPhlGenerationalPlaymaker(player, line, perf){
  if(!isPhlElitePlaymaker(player, line, perf)) return false;
  var ovrN=player.ovr;
  if(ovrN==null&&player.isMe&&typeof G!=='undefined'&&G&&typeof ovr==='function') ovrN=ovr(G.attrs,G.pos);
  return (ovrN||0)>=96;
}

function getPhlNpcGoalPpg(player, line, perf, leagueKey){
  var prof=getLeagueScoringProfile(leagueKey);
  var lineShare=getNpcLineScoringShare(line, player.pos, leagueKey);
  var formMult=0.94+((player.form||50)/320);
  var teamOff=getTeamOffenseFactor(leagueKey, player.team);
  var pulse=ensureScoringPulse(player);
  var scale=getLeagueNpcScoringScale(leagueKey);
  var gPpg=(prof.gLeader/prof.games)*lineShare*perf*formMult*teamOff*pulse*scale;
  var ovrN=player.ovr||50;
  if(player.arch==='Sniper'){
    if(typeof isPhlGenerationalSniper==='function'&&isPhlGenerationalSniper(player,line,perf)) gPpg*=1.22;
    else if(typeof isPhlEliteSniper==='function'&&isPhlEliteSniper(player,line,perf)) gPpg*=1.10;
    else if(line===1&&ovrN>=92) gPpg*=0.92;
    else if(line===1&&ovrN>=88) gPpg*=0.72;
    else if(line===2&&ovrN>=86) gPpg*=0.48;
    else if(line<=2) gPpg*=0.38;
    else gPpg*=0.18;
  } else if(player.arch==='Playmaker'){
    if(typeof isPhlGenerationalPlaymaker==='function'&&isPhlGenerationalPlaymaker(player,line,perf)) gPpg*=0.68;
    else if(typeof isPhlElitePlaymaker==='function'&&isPhlElitePlaymaker(player,line,perf)) gPpg*=0.58;
    else if(line===1&&ovrN>=88) gPpg*=0.42;
    else gPpg*=0.26;
  } else {
    if(line===1&&ovrN>=90) gPpg*=0.78;
    else if(line<=2) gPpg*=0.52;
    else gPpg*=0.28;
  }
  return cl(gPpg, 0, 0.78);
}

function getPhlNpcAssistPpg(player, line, perf, leagueKey){
  var prof=getLeagueScoringProfile(leagueKey);
  var lineShare=getNpcLineScoringShare(line, player.pos, leagueKey);
  var formMult=0.94+((player.form||50)/320);
  var teamOff=getTeamOffenseFactor(leagueKey, player.team);
  var pulse=ensureScoringPulse(player);
  var scale=getLeagueNpcScoringScale(leagueKey);
  var aPpg=(prof.aLeader/prof.games)*lineShare*perf*formMult*teamOff*pulse*scale;
  var ovrN=player.ovr||50;
  if(player.arch==='Playmaker'){
    if(typeof isPhlGenerationalPlaymaker==='function'&&isPhlGenerationalPlaymaker(player,line,perf)) aPpg*=1.26;
    else if(typeof isPhlElitePlaymaker==='function'&&isPhlElitePlaymaker(player,line,perf)) aPpg*=1.10;
    else if(line===1&&ovrN>=90) aPpg*=0.96;
    else if(line===1&&ovrN>=86) aPpg*=0.78;
    else if(line===2&&ovrN>=84) aPpg*=0.54;
    else if(line<=2) aPpg*=0.40;
    else aPpg*=0.20;
  } else if(player.arch==='Sniper'){
    if(typeof isPhlGenerationalSniper==='function'&&isPhlGenerationalSniper(player,line,perf)) aPpg*=0.50;
    else if(typeof isPhlEliteSniper==='function'&&isPhlEliteSniper(player,line,perf)) aPpg*=0.44;
    else aPpg*=0.30;
  } else {
    if(line===1&&ovrN>=88) aPpg*=0.72;
    else if(line<=2) aPpg*=0.48;
    else aPpg*=0.26;
  }
  return cl(aPpg, 0, 1.55);
}

function ensurePhlDualThreatSplit(split, player, totalPts){
  if(!split||totalPts<=0) return split||{g:0,a:0};
  if(totalPts>=1&&split.g===0&&split.a===0){ split.a=1; return split; }
  if(totalPts>=2){
    if(player.arch==='Playmaker'&&split.g===0){ split.g=1; if(split.a>1) split.a--; }
    else if(player.arch==='Sniper'&&split.a===0){ split.a=1; if(split.g>1) split.g--; }
    else if(player.pos==='D'&&(player.arch==='OffensiveD'||player.arch==='TwoWayD')&&split.g===0&&Math.random()<0.62){ split.g=1; if(split.a>1) split.a--; }
    else if(split.g===0&&split.a>0&&Math.random()<0.28){ split.g=1; if(split.a>1) split.a--; }
  }
  return split;
}

function splitPhlForwardNight(player, line, perf, leagueKey, nightPtsCap){
  var gPpg=getPhlNpcGoalPpg(player,line,perf,leagueKey);
  var aPpg=getPhlNpcAssistPpg(player,line,perf,leagueKey);
  var exp=Math.max(0, Math.min(nightPtsCap, Math.round((gPpg+aPpg)*rd(0.72,1.28))));
  if(exp<=0&&Math.random()<0.14) exp=1;
  if(exp<=0) return {g:0,a:0};
  var gShare=typeof getArchetypeGoalPointShare==='function'?getArchetypeGoalPointShare(player.arch, player.pos, {line:line, perf:perf, leagueKey:'PHL'}):0.3;
  if(player.arch==='Playmaker') gShare=cl(gShare,0.20,0.38);
  else if(player.arch==='Sniper') gShare=cl(gShare,0.46,0.68);
  else gShare=cl(gShare,0.28,0.50);
  var split=typeof splitGoalsAssistsFromPoints==='function'?splitGoalsAssistsFromPoints(exp, gShare):{g:Math.round(exp*gShare),a:exp-Math.round(exp*gShare)};
  split=ensurePhlDualThreatSplit(split, player, exp);
  if(player.arch==='Sniper'&&typeof isPhlGenerationalSniper==='function'&&isPhlGenerationalSniper(player,line,perf)&&Math.random()<0.08) split.g=Math.min(nightPtsCap, split.g+1);
  if(player.arch==='Playmaker'&&typeof isPhlGenerationalPlaymaker==='function'&&isPhlGenerationalPlaymaker(player,line,perf)&&Math.random()<0.08) split.a=Math.min(nightPtsCap, split.a+1);
  return split;
}

function splitPhlOffensiveDNight(player, line, perf, leagueKey, targetPpg, nightPtsCap){
  var mult=1;
  if(typeof isPhlGenerationalOffensiveD==='function'&&isPhlGenerationalOffensiveD(player,line,perf)) mult=1.22;
  else if(typeof isPhlEliteOffensiveD==='function'&&isPhlEliteOffensiveD(player,line,perf)) mult=1.12;
  else if(line===1) mult=1.06;
  var exp=Math.max(0, Math.min(nightPtsCap, Math.round(targetPpg*mult*rd(0.78,1.22))));
  if(exp<=0&&Math.random()<0.18) exp=1;
  if(exp<=0) return {g:0,a:0};
  var gShare=0.40;
  if(typeof isPhlGenerationalOffensiveD==='function'&&isPhlGenerationalOffensiveD(player,line,perf)) gShare=0.44;
  var split=typeof splitGoalsAssistsFromPoints==='function'?splitGoalsAssistsFromPoints(exp, gShare):{g:0,a:exp};
  return ensurePhlDualThreatSplit(split, player, exp);
}

function getLeagueSimScoringFactor(leagueKey){
  var p=getLeagueScoringProfile(leagueKey);
  var ref=p.ptsLeader||92;
  return cl(p.ptsLeader/ref, 0.88, 1.12);
}

/** Per-league offensive environment vs baseline (OJL transition pace). */
function getLeagueTierScoringBoost(leagueKey){
  return getLeaguePaceKnobsForLeague(leagueKey).tierBoost;
}

function getNpcLineScoringShare(line, pos, leagueKey){
  if(pos==='G'||line>=5) return 0;
  var lk=leagueKey||'';
  var dBoost=(lk==='PHL'||lk==='PWL')&&pos==='D'?1.42:
    (lk==='WJL'&&pos==='D')?1.24:
    ((lk==='OJL'||lk==='CWHL'||lk==='NAML')&&pos==='D')?1.06:1;
  if(line===1) return (pos==='D'?0.40:0.56)*dBoost;
  if(line===2) return (pos==='D'?0.24:0.24)*dBoost;
  if(line===3) return (pos==='D'?0.14:0.15)*dBoost;
  return (pos==='D'?0.08:0.09)*dBoost;
}

function getNpcTargetPpg(player, leagueKey){
  var line=getDepthLineFromSlot(player.depthSlot, player.pos);
  if(line>=5) return 0;
  var prof=getLeagueScoringProfile(leagueKey);
  var leaderPpg=prof.ptsLeader/prof.games;
  var perf=getOvrPerformanceMult(player, leagueKey);
  var arch=getArchetypeStatMods(player.arch, player.pos);
  var posPts=getPosScoringMult(player.pos, player.arch, leagueKey);
  var formMult=0.94+((player.form||50)/320);
  var teamOff=getTeamOffenseFactor(leagueKey, player.team);
  var leagueFac=getLeagueSimScoringFactor(leagueKey);
  var tierBoost=getLeagueTierScoringBoost(leagueKey);
  var scale=getLeagueNpcScoringScale(leagueKey);
  var pulse=ensureScoringPulse(player);
  var lineShare=getNpcLineScoringShare(line, player.pos, leagueKey);
  var archBlend=0.64+arch.g*0.2+arch.a*0.16;
  var target=leaderPpg*lineShare*perf*posPts*formMult*teamOff*leagueFac*tierBoost*scale*pulse*archBlend;
  if(player.pos==='F'&&(player.pref||'C')==='C') target*=1.04;
  if(line===1&&perf>=0.92&&(player.arch==='Sniper'||player.arch==='Playmaker')) target*=1.05;
  if(leagueKey==='PHL'&&player.pos==='D'&&player.arch==='OffensiveD'&&line===1&&perf>=0.9) target*=1.32;
  if(leagueKey==='PHL'&&player.pos==='D'&&player.arch==='OffensiveD'&&typeof isPhlGenerationalOffensiveD==='function'&&isPhlGenerationalOffensiveD(player, line, perf)) target*=1.10;
  else if(leagueKey==='PHL'&&player.pos==='D'&&player.arch==='OffensiveD'&&typeof isPhlEliteOffensiveD==='function'&&isPhlEliteOffensiveD(player, line, perf)) target*=1.06;
  if(leagueKey==='PHL'&&player.pos==='D'&&player.arch==='TwoWayD'&&line<=2&&perf>=0.88) target*=1.14;
  if(leagueKey==='PHL'&&player.pos==='D'&&(player.arch==='StayAtHome'||player.arch==='ShutdownD')&&typeof isPhlDualThreatDefenseman==='function'&&isPhlDualThreatDefenseman(player, line, perf)) target*=1.08;
  if(leagueKey==='PHL'&&player.pos==='F'&&player.arch==='Sniper'&&line===1){
    if(typeof isPhlGenerationalSniper==='function'&&isPhlGenerationalSniper(player, line, perf)) target*=1.08;
    else if(typeof isPhlEliteSniper==='function'&&isPhlEliteSniper(player, line, perf)) target*=1.04;
  }
  if(leagueKey==='PHL'&&player.pos==='F'&&player.arch==='Playmaker'&&line===1){
    if(typeof isPhlGenerationalPlaymaker==='function'&&isPhlGenerationalPlaymaker(player, line, perf)) target*=1.12;
    else if(typeof isPhlElitePlaymaker==='function'&&isPhlElitePlaymaker(player, line, perf)) target*=1.06;
  }
  if(leagueKey==='QMJL'&&player.pos==='F'&&player.arch==='Playmaker'&&line<=2) target*=1.03;
  if(leagueKey==='QMJL'&&player.pos==='F'&&player.arch==='Sniper'&&line<=2) target*=1.04;
  return cl(target, 0.03, getNpcTargetPpgCap(leagueKey, player));
}

function makeRookieProspect(pos, leagueKey, teamName){
  var nm=rollNpcName(leagueKey);
  var age=ri(16,17);
  var subPos;
  if(pos==='F') subPos=['C','LW','RW'][ri(0,2)];
  else if(pos==='D') subPos=Math.random()<0.5?'LD':'RD';
  else subPos='G';
  return {
    id:'rook_'+ri(10000,99999)+'_'+Date.now().toString(36).slice(-4),
    first:nm.first, last:nm.last, nat:nm.nat, pos:pos, pref:subPos,
    hand:rollPlayerHand(pos, subPos, leagueKey),
    age:age, arch:pickNpcArchetype(pos, subPos),
    ovr:ri(58,63), isMe:false, team:teamName, leadership:'',
    proProspect:Math.random()<0.4, rookie:true,
    alumniFrom:'', juniorMate:false,
    seasonStats:emptyPlayerStats(), form:40+ri(0,12),
    scoringPulse:rd(0.76,1.24)
  };
}

function injectRookieProspects(players, leagueKey, teamName){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  var want=tier==='junior'?3:(tier==='college'?2:(isEstablishedProLeague(leagueKey)?0:1));
  if(!want) return;
  var pool=players.filter(function(p){return !p.isMe;}).sort(function(a,b){return a.ovr-b.ovr;});
  var n=0, i;
  for(i=0;i<pool.length&&n<want;i++){
    if(i>1&&Math.random()>0.55) continue;
    var rook=makeRookieProspect(pool[i].pos, leagueKey, teamName);
    var idx=players.indexOf(pool[i]);
    if(idx>=0){ players[idx]=rook; n++; }
  }
}

function isCanadianJuniorLeague(leagueKey){
  return leagueKey==='OJL'||leagueKey==='QMJL'||leagueKey==='WJL'||leagueKey==='CWHL';
}

/** Traditional powerhouse junior orgs — a few clubs carry most of each league's title equity. */
var MAJOR_JUNIOR_ELITE_ORGS={
  OJL:{
    'Kitchener Hounds':1,
    'London Mustangs':1,
    'Windsor Fury':1,
    'Sarnia Ramparts':1,
    'Flint Forge':1
  },
  QMJL:{
    'Québec Ramparts':1,
    'Saint John Tide':1
  }
};

function isMajorJuniorEliteOrg(leagueKey, teamName){
  var map=MAJOR_JUNIOR_ELITE_ORGS[leagueKey];
  return !!(map&&teamName&&map[teamName]);
}

function getMajorJuniorEliteOrgStandingsBonus(leagueKey, teamName){
  if(!isMajorJuniorEliteOrg(leagueKey, teamName)) return 0;
  if(leagueKey==='OJL') return 0.058;
  if(leagueKey==='QMJL') return 0.048;
  return 0;
}

function getMajorJuniorPlayoffPowerBonus(teamRow){
  if(!teamRow||!teamRow.team) return 0;
  var tn=teamRow.team.n;
  var lk=teamRow.leagueKey||(typeof G!=='undefined'&&G&&G._playoffCtx&&G._playoffCtx.memorialCup?null:G&&G.leagueKey);
  if(!lk&&typeof G!=='undefined'&&G&&G._cjlSeason&&G._cjlSeason.champions){
    var ck, ch;
    for(ck in G._cjlSeason.champions){
      if(G._cjlSeason.champions[ck]&&G._cjlSeason.champions[ck].n===tn){ lk=ck; break; }
    }
  }
  if(!lk) return 0;
  if(!isMajorJuniorEliteOrg(lk, tn)) return 0;
  if(lk==='OJL') return 0.12;
  if(lk==='QMJL') return 0.08;
  return 0;
}

/** Regular-season juggernauts face extra playoff resistance (especially young leagues). */
function getPlayoffRegularSeasonRegression(teamRow){
  if(!teamRow||!(teamRow.gp>0)) return 0;
  if(typeof G==='undefined'||!G||!G.league) return 0;
  var tier=G.league.tier||'';
  if(tier!=='junior'&&tier!=='college'&&tier!=='minor') return 0;
  var ppg=teamRow.pts/teamRow.gp;
  if(ppg>=2.35) return -0.16;
  if(ppg>=2.05) return -0.10;
  if(ppg>=1.85) return -0.06;
  return 0;
}

function getMajorJuniorGoalieOvrAdjust(leagueKey, teamName, rank){
  var r=rank||0;
  if(leagueKey==='OJL'){
    var adj=r===0?rd(2.5,5.5):(r<3?rd(1.5,3.5):rd(0.5,2));
    if(isMajorJuniorEliteOrg(leagueKey, teamName)&&r===0) adj+=rd(1,2.5);
    return adj;
  }
  if(leagueKey==='WJL'){
    return r===0?rd(1,3.5):(r<3?rd(0.5,2):rd(0,1));
  }
  if(leagueKey==='QMJL'){
    if(isMajorJuniorEliteOrg(leagueKey, teamName)) return r===0?rd(0,1.5):-rd(0,1);
    return -rd(2,4.5);
  }
  if(leagueKey==='CWHL') return -rd(0.5,2);
  return 0;
}

function getRegionalPositionOvrMod(leagueKey, nat, pos, subPos, rank){
  var r=rank||0, mod=0;
  if(r>=12) return 0;
  var isCan=nat==='Canada', isUsa=nat==='United States', isSwe=nat==='Sweden', isRus=nat==='Russia';
  if(leagueKey==='USJL'&&pos==='F'&&subPos==='LW'&&(isUsa||(!isCan&&Math.random()<0.3))) mod+=rd(1,3);
  if(leagueKey==='USJL'&&pos==='D'&&subPos==='RD'&&isUsa) mod+=rd(1,2.5);
  if(isCanadianJuniorLeague(leagueKey)&&pos==='F'&&subPos==='C'&&isCan) mod+=rd(1,3);
  if(isCanadianJuniorLeague(leagueKey)&&pos==='D'&&subPos==='LD'&&isCan) mod+=rd(1,2.5);
  if(leagueKey==='ARJC'&&pos==='F'&&subPos==='RW'&&(isRus||Math.random()<0.35)) mod+=rd(1,3);
  if(leagueKey==='NEJC'&&pos==='F'&&(subPos==='LW'||subPos==='RW')&&isSwe) mod+=rd(1,2.5);
  if(leagueKey==='NEJC'&&pos==='D'&&isSwe) mod+=rd(0.5,2);
  if(pos==='F'&&subPos==='C'&&r<7&&Math.random()<0.32) mod+=rd(0.5,1.5);
  return mod;
}

function balanceTeamForwardArchetypes(players){
  var fw=players.filter(function(p){return p.pos==='F';});
  if(fw.length<6) return;
  var sorted=fw.slice().sort(function(a,b){return (b.ovr||0)-(a.ovr||0);});
  var eliteOvr=(sorted[2]&&sorted[2].ovr)||(sorted[0]&&sorted[0].ovr)||60;
  var hasPm=false, hasSn=false, i;
  for(i=0;i<fw.length;i++){
    if(fw[i].arch==='Playmaker'&&(fw[i].ovr||0)>=eliteOvr-4) hasPm=true;
    if(fw[i].arch==='Sniper'&&(fw[i].ovr||0)>=eliteOvr-4) hasSn=true;
  }
  if(!hasPm){
    var pmCand=sorted.find(function(p){return p.pref==='C'||p.arch==='TwoWay'||p.arch==='PowerForward';})||sorted[1]||sorted[0];
    if(pmCand) pmCand.arch='Playmaker';
  }
  if(!hasSn){
    var snCand=sorted.find(function(p){return p.arch!=='Playmaker'&&(p.pref==='LW'||p.pref==='RW'||p.arch==='PowerForward');})||sorted[0];
    if(snCand&&snCand.arch==='Playmaker'&&sorted.length>2) snCand=sorted[2];
    if(snCand) snCand.arch='Sniper';
  }
  var pmRanked=sorted.filter(function(p){return p.arch==='Playmaker';});
  for(i=1;i<pmRanked.length;i++){
    if((pmRanked[i].ovr||0)<(pmRanked[0].ovr||0)-6){
      pmRanked[i].arch=Math.random()<0.5?'TwoWay':'PowerForward';
    } else if(i>=2&&(pmRanked[i].ovr||0)<eliteOvr+2){
      pmRanked[i].arch='TwoWay';
    }
  }
}

function rollPlayerHand(pos, subPos, leagueKey){
  if(pos==='G'){
    return Math.random()<0.84?'L':'R';
  }
  var euro=isEuropeanStyleLeague(leagueKey);
  var local=typeof isLocalLeague==='function'&&isLocalLeague(leagueKey);
  var leftPct=euro?0.68:(local?0.38:0.60);
  if(pos==='D'){
    if(subPos==='LD') leftPct=local?0.62:(euro?0.78:0.78);
    else if(subPos==='RD') leftPct=local?0.18:(euro?0.22:0.22);
    else leftPct=local?0.42:(euro?0.55:0.55);
  } else if(pos==='F'){
    leftPct=euro?0.65:(local?0.36:0.62);
  }
  return Math.random()<leftPct?'L':'R';
}

function preferredWingForHand(hand, leagueKey){
  if(isEuropeanStyleLeague(leagueKey)&&Math.random()<0.55){
    return hand==='L'?'RW':'LW';
  }
  return hand==='L'?'LW':'RW';
}

function pickNpcArchetype(pos, subPos){
  if(pos==='G') return 'Goalie';
  if(pos==='D'){
    var dr=Math.random();
    if(dr<0.34) return 'OffensiveD';
    if(dr<0.58) return 'TwoWayD';
    if(dr<0.82) return 'StayAtHome';
    return 'ShutdownD';
  }
  var sp=subPos||'C', r=Math.random();
  if(sp==='C'){
    if(r<0.18) return 'Playmaker';
    if(r<0.40) return 'Sniper';
    if(r<0.64) return 'PowerForward';
    if(r<0.84) return 'TwoWay';
    return 'Grinder';
  }
  if(r<0.1) return 'Sniper';
  if(r<0.24) return 'Playmaker';
  if(r<0.44) return 'PowerForward';
  if(r<0.68) return 'TwoWay';
  return 'Grinder';
}

function pickNpcArchetypeForRank(pos, subPos, leagueKey, rank){
  if(!isEstablishedProLeague(leagueKey)) return pickNpcArchetype(pos, subPos);
  var r=rank||0;
  if(pos==='G') return 'Goalie';
  if(pos==='D'){
    if(r===0){
      var dr=Math.random();
      if(dr<0.34) return 'OffensiveD';
      if(dr<0.68) return 'TwoWayD';
      if(dr<0.86) return 'ShutdownD';
      return 'StayAtHome';
    }
    if(r<4) return pickNpcArchetype(pos, subPos);
    if(r<8) return Math.random()<0.48?'StayAtHome':'TwoWayD';
    return Math.random()<0.55?'ShutdownD':'StayAtHome';
  }
  if(r<6) return pickNpcArchetype(pos, subPos);
  if(r<9){
    var dr=Math.random();
    if(dr<0.38) return 'TwoWay';
    if(dr<0.62) return 'Grinder';
    return pickNpcArchetype(pos, subPos);
  }
  return Math.random()<0.62?'Grinder':'TwoWay';
}

function computeProRoleLabel(p){
  if(!p||p.pos==='G'){
    if(p&&p.depthSlot==='G1') return 'Starter';
    return 'Backup';
  }
  if(p.depthSlot&&String(p.depthSlot).indexOf('SCR')>=0) return 'Healthy scratch';
  var line=getDepthLineFromSlot(p.depthSlot, p.pos);
  var onPp1=p.ppSlot&&String(p.ppSlot).indexOf('PP1')===0;
  var onPk1=p.pkSlot&&String(p.pkSlot).indexOf('PK1')===0;
  if(p.pos==='D'){
    if(line===1){
      if(p.arch==='OffensiveD') return onPp1?'PP QB · Top Pair':'Top-Pair Offense';
      if(p.arch==='ShutdownD'||p.arch==='StayAtHome') return onPk1?'Shutdown · PK1':'Top-Pair Defense';
      return 'Top Pair';
    }
    if(line===2) return onPk1?'PK · 2nd Pair':'Second Pair';
    return 'Third Pair';
  }
  if(line===1){
    if(p.arch==='Sniper') return onPp1?'Elite Scorer · PP1':'Top-Line Scorer';
    if(p.arch==='Playmaker') return onPp1?'PP1 Playmaker':'1st Line Playmaker';
    if(p.arch==='PowerForward') return 'Top-Line Power';
    return 'Top Line';
  }
  if(line===2) return onPp1?'2nd Line · PP':'Second Line';
  if(line===3){
    if(p.arch==='Grinder'||p.arch==='TwoWay') return onPk1?'Checker · PK1':'Checking Line';
    return 'Third Line';
  }
  if(line>=4) return '4th Line / Energy';
  return '';
}

function stampProRoleLabels(roster){
  if(!roster||!isEstablishedProLeague(roster.leagueKey||'')) return;
  roster.players.forEach(function(p){
    p.roleLabel=computeProRoleLabel(p);
  });
}

function getForwardPositionOvrMod(subPos, rank){
  var r=rank||0;
  if(subPos==='C'){
    if(r<3) return rd(1.5,4.5);
    if(r<7) return rd(0,2.5);
    return rd(-0.5,1.2);
  }
  if(subPos==='LW'||subPos==='RW'){
    if(r<2) return rd(-1,1.5);
    if(r<5) return rd(-1.5,0.5);
    return rd(-2.5,-0.5);
  }
  return 0;
}

function isEliteProLeagueKey(leagueKey){
  var analog=getMenAnalogLeagueKey(leagueKey);
  return analog==='PHL'||leagueKey==='PHL'||leagueKey==='PWL';
}

function isMinorProLeagueKey(leagueKey){
  return leagueKey==='NAML'||leagueKey==='PWDL';
}

/** 99 OVR = legendary peak; PHL regulars sit 80–88, 4th liners ~80, scratches rare sub-80. */
function applyEliteProOvrRankCaps(leagueKey, pos, rank, o, playerAge){
  if(!isEliteProLeagueKey(leagueKey)) return Math.round(o);
  var r=rank||0;
  var age=playerAge!=null?playerAge:28;
  if(pos==='G'){
    o=Math.max(o, r===0?76:74);
    if(r>=1) o=Math.min(o, 84);
    if(r===0){
      if(age>=28&&age<=33&&o>=90&&Math.random()<0.012) o=99;
      else o=Math.min(o, 91);
    }
    return Math.round(cl(o, 74, 99));
  }
  if(r===0){
    if(age>=28&&age<=33&&o>=90&&Math.random()<0.012) o=99;
    else if(o>=93) o=ri(88,91);
  } else if(r>=1&&o>=91) o=ri(85,89);
  else if(r>=2&&o>=88) o=Math.min(o, ri(84,87));
  else if(r>=4&&o>=86) o=Math.min(o, ri(82,85));
  else if(r>=6&&o>=84) o=Math.min(o, ri(81,84));
  else if(r>=9&&o>=82) o=Math.min(o, ri(80,83));
  else if(r>=12) o=Math.min(Math.max(o, 80), 82);
  else if(r>=14) o=Math.min(Math.max(o, 76), 81);
  return Math.round(cl(o, 76, 99));
}

function genMinorProNpcOvr(pos, leagueKey, rank, playerAge, subPos){
  var ceiling=typeof getMinorLeagueOvrCeiling==='function'?getMinorLeagueOvrCeiling():84;
  var floor=typeof getMinorLeagueOvrFloor==='function'?getMinorLeagueOvrFloor():72;
  var r=rank||0;
  var t=cl(1-(r/18), 0, 1);
  var o=floor+Math.pow(t, 1.15)*(ceiling-floor-2)+rd(-2,2);
  if(pos==='G'){
    if(r===0) o+=rd(1,4);
    else o-=rd(2,5);
  } else if(r<=2) o+=rd(0,2);
  else if(r>=10) o-=rd(1,3);
  if(playerAge!=null) o+=applyProAgeOvrModifier(playerAge)*0.4;
  if(r===0) o=Math.min(o, ceiling);
  else if(r>=1) o=Math.min(o, ceiling-1);
  return Math.round(cl(o, floor, ceiling));
}

function clampMinorProRosterOvrSpread(players, leagueKey){
  if(!isMinorProLeagueKey(leagueKey)||!players||!players.length) return;
  var ceiling=typeof getMinorLeagueOvrCeiling==='function'?getMinorLeagueOvrCeiling():84;
  var floor=typeof getMinorLeagueOvrFloor==='function'?getMinorLeagueOvrFloor():72;
  var skaters=players.filter(function(p){return !p.isMe&&p.pos!=='G';});
  var goalies=players.filter(function(p){return !p.isMe&&p.pos==='G';});
  skaters.sort(function(a,b){return (b.ovr||0)-(a.ovr||0);});
  goalies.sort(function(a,b){return (b.ovr||0)-(a.ovr||0);});
  var i, p;
  for(i=0;i<skaters.length;i++){
    p=skaters[i];
    if((p.ovr||0)>ceiling) p.ovr=ceiling;
    if(i<16&&(p.ovr||0)<floor+2) p.ovr=Math.max(p.ovr||0, floor+2);
  }
  for(i=0;i<goalies.length;i++){
    p=goalies[i];
    if((p.ovr||0)>ceiling-1) p.ovr=ceiling-1;
    if((p.ovr||0)<floor) p.ovr=floor;
  }
}

function genEliteProNpcOvr(pos, leagueKey, rank, playerAge, subPos, teamName){
  var base=83;
  var r=rank||0;
  var t=cl(1-(r/20), 0, 1);
  var o=80+Math.pow(t, 1.28)*(base+4-80)+rd(-1.2,1.2);
  if(teamName) o+=getTeamProfileOvrMod(leagueKey, teamName, rank);
  if(playerAge!=null&&playerAge<=24&&r<=3) o-=rd(1,3.5);
  if(pos==='D'){
    if(r===0) o+=rd(0,2);
    else if(r<=2) o+=rd(0,1.5);
    else if(r>=10) o-=rd(1,3);
  } else if(pos==='G'){
    if(r===0) o+=rd(1,4);
    else o-=rd(2,5);
  } else {
    if(r===0) o+=rd(0,2.5);
    else if(r<=2) o+=rd(0,1);
    else if(r>=10) o-=rd(1,3);
    if(pos==='F') o+=getForwardPositionOvrMod(subPos, rank)*0.45;
  }
  if(playerAge!=null) o+=applyProAgeOvrModifier(playerAge)*0.55;
  return applyEliteProOvrRankCaps(leagueKey, pos, rank, o, playerAge);
}

function clampEliteProRosterOvrSpread(players, leagueKey){
  if(!isEliteProLeagueKey(leagueKey)||!players||!players.length) return;
  var skaters=players.filter(function(p){return !p.isMe&&p.pos!=='G';});
  var goalies=players.filter(function(p){return !p.isMe&&p.pos==='G';});
  skaters.sort(function(a,b){return (b.ovr||0)-(a.ovr||0);});
  goalies.sort(function(a,b){return (b.ovr||0)-(a.ovr||0);});
  var i, p, capByRank, floorByRank;
  for(i=0;i<skaters.length;i++){
    p=skaters[i];
    if(i===0){ capByRank=92; floorByRank=86; }
    else if(i<=2){ capByRank=90; floorByRank=84; }
    else if(i<=5){ capByRank=88; floorByRank=82; }
    else if(i<=8){ capByRank=86; floorByRank=81; }
    else if(i<=12){ capByRank=84; floorByRank=80; }
    else if(i<=16){ capByRank=82; floorByRank=80; }
    else { capByRank=80; floorByRank=76; }
    if(p.ovrCeiling!=null) capByRank=Math.min(capByRank, p.ovrCeiling);
    if((p.ovr||0)>capByRank) p.ovr=capByRank;
    if(i<=16&&(p.ovr||0)<floorByRank) p.ovr=floorByRank;
  }
  for(i=0;i<goalies.length;i++){
    p=goalies[i];
    capByRank=i===0?90:82;
    floorByRank=i===0?76:74;
    if(p.ovrCeiling!=null) capByRank=Math.min(capByRank, p.ovrCeiling);
    if((p.ovr||0)>capByRank) p.ovr=capByRank;
    if((p.ovr||0)<floorByRank) p.ovr=floorByRank;
  }
}

function genNpcOvr(pos, leagueKey, rank, playerAge, subPos, teamName, nat){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  var bands=getLeagueOvrBands(leagueKey);
  var floor=bands.floor;
  var cap=bands.cap;
  if(tier==='junior'){
    var midMap={OJL:58,CWHL:57,WJL:57,USJL:56,USWDL:56,NEJC:54,ARJC:53,QMJL:50,CEJC:49,EWJC:51,AWJC:50};
    var depthCapMap={OJL:66,CWHL:66,WJL:65,USJL:64,USWDL:64,NEJC:62,ARJC:61,QMJL:58,CEJC:58,EWJC:59,AWJC:58};
    var starCapMap={OJL:74,CWHL:74,WJL:72,USJL:72,USWDL:72,NEJC:70,ARJC:69,QMJL:64,CEJC:65,EWJC:68,AWJC:66};
    var prospectChanceMap={OJL:0.22,CWHL:0.22,WJL:0.18,USJL:0.16,USWDL:0.16,NEJC:0.14,ARJC:0.12,QMJL:0.08,CEJC:0.08,EWJC:0.10,AWJC:0.08};
    var mid=midMap[leagueKey]!=null?midMap[leagueKey]:bands.baseline;
    var rankT=cl(1-((rank||0)/20), 0, 1);
    var rankBonus=Math.pow(rankT, 1.55)*10;
    var ageBonus=getJuniorAgeOvrBonus(playerAge);
    var prospect=(rank||0)<1&&Math.random()<(prospectChanceMap[leagueKey]!=null?prospectChanceMap[leagueKey]:0.12)?rd(1,3):0;
    var o=mid+rankBonus+ageBonus+prospect+rd(-4,4);
    if(pos==='F') o+=getForwardPositionOvrMod(subPos, rank);
    if(pos==='D'&&(rank||0)<4) o+=rd(-1,1);
    if((rank||0)>=2) o-=rd(1,4);
    if((rank||0)>=5) o-=rd(3,8);
    if((rank||0)>=8) o-=rd(4,10);
    if((rank||0)>=12) o-=rd(4,10);
    if((rank||0)>=16) o-=rd(2,7);
    if(playerAge<=16&&Math.random()<0.42) o-=rd(2,6);
    var depthCap=depthCapMap[leagueKey]!=null?depthCapMap[leagueKey]:64;
    if((rank||0)>=3) o=Math.min(o, depthCap);
    if((rank||0)>=6&&Math.random()<0.35) o=ri(floor+2, floor+8)+Math.round(rankBonus*0.08);
    if((rank||0)===0){
      var starCap=starCapMap[leagueKey]!=null?starCapMap[leagueKey]:74;
      if(Math.random()<0.16) o+=rd(2,4);
      else if(Math.random()<0.38) o+=rd(1,2);
      o=Math.min(o, starCap);
    }
    o+=getJuniorRegionalOvrOffset(leagueKey, teamName);
    o+=getRegionalPositionOvrMod(leagueKey, nat, pos, subPos, rank);
    if(pos==='G'&&isCanadianJuniorLeague(leagueKey)){
      o+=getMajorJuniorGoalieOvrAdjust(leagueKey, teamName, rank);
      if(leagueKey==='OJL') cap=Math.max(cap, isMajorJuniorEliteOrg(leagueKey, teamName)?70:69);
      else if(leagueKey==='WJL') cap=Math.max(cap, 68);
      else if(leagueKey==='QMJL') cap=Math.min(cap, isMajorJuniorEliteOrg(leagueKey, teamName)?64:62);
    } else if(pos==='G'&&(leagueKey==='USJL'||leagueKey==='NEJC'||leagueKey==='ARJC')){
      cap=Math.max(cap, leagueKey==='USJL'?72:71);
    }
    var usndtSquad=leagueKey==='USJL'&&teamName&&typeof isUsndtTeam==='function'&&isUsndtTeam(teamName);
    if(usndtSquad){
      cap=typeof isUsndtU18Team==='function'&&isUsndtU18Team(teamName)?76:74;
    }
    if(leagueKey==='USJL'&&teamName&&typeof isUsndtU18Team==='function'&&isUsndtU18Team(teamName)){
      o+=5+(rankT*7);
      if((rank||0)<4) o+=rd(1,4);
      if((rank||0)<8) o+=rd(0,2);
      if((rank||0)===0&&Math.random()<0.12) o+=rd(1,2);
    } else if(leagueKey==='USJL'&&teamName&&typeof isUsndtU17Team==='function'&&isUsndtU17Team(teamName)){
      o+=4+(rankT*6);
      if((rank||0)<4) o+=rd(1,3);
      if((rank||0)<8) o+=rd(0,1);
    } else if(usndtSquad){
      o+=4+(rankT*5);
      if((rank||0)<4) o+=rd(1,3);
    }
    return Math.round(cl(o, floor, cap));
  }
  if(isEliteProLeagueKey(leagueKey)){
    return genEliteProNpcOvr(pos, leagueKey, rank, playerAge, subPos, teamName);
  }
  if(isMinorProLeagueKey(leagueKey)){
    return genMinorProNpcOvr(pos, leagueKey, rank, playerAge, subPos);
  }
  var base=bands.baseline+getLeagueRosterSkillOffset(leagueKey)*0.35;
  var spread=bands.spread||(pos==='G'?10:12);
  var top=base+spread*0.42;
  var bot=base-spread*0.62;
  var t=cl(1-((rank||0)/20), 0, 1);
  var o=bot+(top-bot)*Math.pow(t, 0.92)+rd(-3,3);
  if(pos==='F') o+=getForwardPositionOvrMod(subPos, rank);
  if(pos==='D'&&(rank||0)<6) o+=rd(-1,2);
  if((rank||0)>=12) o-=rd(2,7);
  if((rank||0)>=14) o-=rd(1,4);
  if(playerAge!=null) o+=applyProAgeOvrModifier(playerAge);
  if(leagueKey==='ARHL'&&teamName&&typeof getArhlTeamSkillBonus==='function'){
    o+=getArhlTeamSkillBonus(typeof getArhlTeamRegion==='function'?getArhlTeamRegion(teamName):'russia');
  }
  if(pos==='G'&&isEstablishedProLeague(leagueKey)){
    o=Math.max(o, (rank||0)===0?70:68);
    if((rank||0)>=1) o=Math.min(o, 85);
  }
  return Math.round(cl(o, floor, cap));
}

function archShortLabel(arch){
  var m={
    Sniper:'SNP', Playmaker:'PLY', PowerForward:'PWR', TwoWay:'TWF', Grinder:'GRD',
    OffensiveD:'OFF-D', TwoWayD:'TWO-D', StayAtHome:'SAH', ShutdownD:'SHD', Goalie:'G'
  };
  return m[arch]||String(arch||'').slice(0,4).toUpperCase();
}

function ensureScoringPulse(p){
  if(typeof p.scoringPulse!=='number') p.scoringPulse=rd(0.88,1.08);
  else if(Math.random()<0.34) p.scoringPulse=cl(p.scoringPulse+rd(-0.12,0.12),0.82,1.12);
  return p.scoringPulse;
}

function getPositionScoringBias(player){
  if(player.pos==='D'){
    if(player.arch==='OffensiveD') return rd(1.16,1.32);
    if(player.arch==='TwoWayD') return rd(1.02,1.16);
    if(player.arch==='StayAtHome'||player.arch==='ShutdownD') return rd(0.92,1.06);
    return rd(0.86,1.0);
  }
  if(player.pos==='F'){
    if((player.pref||'C')==='C') return rd(1.06,1.18);
    if(player.arch==='Sniper') return rd(0.7,0.84);
    return rd(0.76,0.9);
  }
  return 1;
}

function rollWeeklyGames(perWeek, line, pos, player){
  if(pos==='G'){
    if(line!==1&&line!==2) return 0;
    var ovrN=player?player.ovr||50:50;
    var startShare=line===1?cl(0.58+(ovrN-66)/95, 0.45, 0.82):cl(0.10+(ovrN-66)/110, 0.05, 0.38);
    if(Math.random()<startShare) return perWeek;
    if(line===1&&Math.random()<0.22) return Math.max(0, perWeek-1);
    if(line===2&&Math.random()<0.35) return 1;
    return 0;
  }
  if(player&&player.injured&&(player.injWks||0)>0){
    player.injWks--;
    if(player.injWks<=0) player.injured=false;
    var sInj=ensurePlayerStats(player);
    sInj.gpMissed=(sInj.gpMissed||0)+perWeek;
    player._missReason='injury';
    return 0;
  }
  var gp=perWeek;
  if(line>=5){
    if(player){
      var sScr=ensurePlayerStats(player);
      sScr.gpMissed=(sScr.gpMissed||0)+perWeek;
      player._missReason='scratch';
    }
    return 0;
  }
  if(line>=4){
    gp=Math.max(0, perWeek-1);
    if(Math.random()<0.22) gp=Math.max(0, gp-1);
  } else if(line===3){
    if(Math.random()<0.1) gp=perWeek-1;
  } else if(Math.random()<0.04){
    gp=perWeek-1;
  }
  var missed=Math.max(0, perWeek-gp);
  if(missed>0&&player){
    var s=ensurePlayerStats(player);
    s.gpMissed=(s.gpMissed||0)+missed;
    player._missReason=(player.depthSlot&&String(player.depthSlot).indexOf('SCR')>=0)?'scratch':'limited';
  }
  return Math.max(0, gp);
}

function getLeagueCalendarGamesPlayed(leagueKey){
  if(typeof G==='undefined'||!G) return 0;
  if(typeof isLocalLeague==='function'&&isLocalLeague(leagueKey)&&typeof countCompletedLocalGames==='function'){
    return countCompletedLocalGames();
  }
  var perWeek=getGamesPerWeek(leagueKey||G.leagueKey);
  return Math.max(0, ((G.week||1)-1)*perWeek+(G.weekGames||0));
}

function formatLeaderGpCell(row, calendarGp){
  var gp=row.gp;
  var cal=calendarGp;
  if(row.player&&typeof getUsndtLeaderCalendarGp==='function'){
    cal=getUsndtLeaderCalendarGp(row.player, G&&G.leagueKey, calendarGp);
  }
  var missed=Math.max(0, cal-gp);
  if(missed<1) return String(gp);
  var title='Missed '+missed+' game'+(missed>1?'s':'');
  if(row.player.isMe&&G.isInjured) title+=' (injury)';
  else if(row.player.seasonStats&&(row.player.seasonStats.gpMissed||0)>0) title+=' (scratch/injury)';
  else if(row.player._missReason==='injury') title+=' (injury)';
  else if(row.player._missReason==='scratch'&&row.player.depthSlot&&String(row.player.depthSlot).indexOf('SCR')>=0) title+=' (healthy scratch)';
  else if(row.player._missReason==='limited') title+=' (limited ice)';
  if(missed>=2){
    return '<span style="color:var(--gold)" title="'+escHtml(title)+'">'+gp+'*</span>';
  }
  return gp+'<span style="color:var(--mut);font-size:11px" title="'+escHtml(title)+'">−'+missed+'</span>';
}

function makeNpcPlayer(pos, leagueKey, rank, carry, teamName){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  var floor=getLeagueOvrFloor(leagueKey);
  var cap=getLeagueOvrCap(leagueKey);
  if(carry){
    var aged=carry.age+1;
    if(aged>getLeagueNpcMaxAge(leagueKey)) return null;
    var ovrN=carry.ovr;
    if(tier==='junior') ovrN+=aged<=19?rd(0,2):-rd(0,2);
    else ovrN+=applyProAgeOvrModifier(aged);
    if(aged>=30) ovrN=Math.round(ovrN-rd(0.5,2.8));
    if(aged>=35) ovrN=Math.round(ovrN-rd(1,4));
    var ovrCap=carry.ovrCeiling!=null?Math.min(cap, carry.ovrCeiling):cap;
    ovrN=cl(ovrN, floor, ovrCap);
    if(aged>=38&&ovrN<52&&Math.random()<0.55) return null;
    mergeSeasonIntoCareerLeagueStats(carry, leagueKey);
    var npc={
      id:carry.id, first:carry.first, last:carry.last, pos:carry.pos,
      pref:carry.pref||carry.subPos, hand:carry.hand, age:aged, arch:carry.arch,
      ovr:ovrN, isMe:false, team:carry.team, leadership:carry.leadership||'',
      nat:carry.nat||rollNpcNationality(leagueKey),
      proProspect:!!carry.proProspect, alumniFrom:carry.alumniFrom||'',
      juniorMate:!!carry.juniorMate,
      careerLeagueStats:carry.careerLeagueStats||{},
      seasonStats:emptyPlayerStats(),
      _statsSeason:G?G.season:1,
      form:typeof carry.form==='number'?carry.form:50,
      scoringPulse:typeof carry.scoringPulse==='number'?carry.scoringPulse:rd(0.76,1.24),
      ovrCeiling:carry.ovrCeiling, npcTier:carry.npcTier, devRate:carry.devRate
    };
    assignNpcCareerProfile(npc, leagueKey, rank, teamName);
    return npc;
  }
  var subPos;
  if(pos==='F'){
    var r=Math.random();
    subPos=r<0.40?'C':(r<0.70?'LW':'RW');
  } else if(pos==='D'){
    subPos=Math.random()<0.5?'LD':'RD';
  } else subPos='G';
  var hand=rollPlayerHand(pos, subPos, leagueKey);
  if(pos==='F'&&(subPos==='LW'||subPos==='RW')&&Math.random()<0.72){
    subPos=preferredWingForHand(hand, leagueKey);
  }
  var age=rollNpcAgeForLeague(leagueKey, pos);
  var nat=typeof rollNpcNationality==='function'?rollNpcNationality(leagueKey, teamName):null;
  var nm=rollNpcName(leagueKey, nat);
  var ovrN=genNpcOvr(pos, leagueKey, rank, age, subPos, teamName, nat||nm.nat);
  if(leagueKey==='USJL'&&teamName&&typeof isUsndtTeam==='function'&&!isUsndtTeam(teamName)&&(nat||nm.nat)==='United States'&&(rank||0)<6){
    ovrN=Math.round(ovrN-rd(1,4));
  }
  var archPick=pickNpcArchetypeForRank(pos, subPos, leagueKey, rank);
  if(leagueKey==='USJL'&&teamName&&typeof isUsndtTeam==='function'&&isUsndtTeam(teamName)&&(rank||0)<6){
    if(pos==='F'&&Math.random()<0.58) archPick=['Sniper','Playmaker','PowerForward'][ri(0,2)];
    if(pos==='D'&&(rank||0)<4&&Math.random()<0.48) archPick='OffensiveD';
  }
  var pulse=rd(0.78,1.22);
  if(leagueKey==='USJL'&&teamName&&typeof isUsndtTeam==='function'&&isUsndtTeam(teamName)&&(rank||0)<6) pulse=rd(0.92,1.18);
  if(leagueKey==='PHL'&&pos==='F'&&archPick==='Sniper'&&(rank||0)===0&&ovrN>=86&&Math.random()<0.14) pulse=rd(1.02,1.12);
  var npc={
    id:'npc_'+ri(10000,99999)+'_'+Date.now().toString(36).slice(-4),
    first:nm.first, last:nm.last, nat:nat||nm.nat||rollNpcNationality(leagueKey, teamName),
    pos:pos, pref:subPos, hand:hand,
    age:age,
    arch:archPick,
    ovr:ovrN,
    isMe:false, team:null, leadership:'',
    proProspect:tier==='junior'&&(
      (leagueKey==='USJL'&&teamName&&typeof isUsndtTeam==='function'&&isUsndtTeam(teamName)&&(rank||0)<5)?Math.random()<0.72:
      ((rank||0)<4&&Math.random()<0.42)
    ),
    alumniFrom:'', juniorMate:false,
    seasonStats:emptyPlayerStats(), form:48+ri(0,14),
    _statsSeason:G?G.season:1,
    scoringPulse:pulse
  };
  assignNpcCareerProfile(npc, leagueKey, rank, teamName);
  return npc;
}

function pickCoach(teamName, leagueKey, prevCoach){
  var retain=isEstablishedProLeague(leagueKey)?0.88:0.72;
  if(prevCoach&&prevCoach.team===teamName&&Math.random()<retain) return prevCoach;
  return {
    team:teamName,
    name:rollCoachName(leagueKey),
    style:['balanced','skill','grind','defensive'][ri(0,3)]
  };
}

function lineComplementScore(a, b){
  if(!a||!b) return 0;
  var s=0;
  if(a.arch==='Playmaker'&&(b.arch==='Sniper'||b.arch==='PowerForward')) s+=5;
  if(b.arch==='Playmaker'&&(a.arch==='Sniper'||a.arch==='PowerForward')) s+=5;
  if(a.arch==='Sniper'&&b.arch==='Playmaker') s+=4;
  if(b.arch==='Sniper'&&a.arch==='Playmaker') s+=4;
  if(a.arch==='Grinder'&&b.arch==='Sniper') s+=1.5;
  if(a.hand!==b.hand) s+=0.8;
  if(a.pref==='C'||b.pref==='C') s+=0.4;
  if(typeof getTeammateChemistryBonus==='function') s+=getTeammateChemistryBonus(a,b);
  return s;
}

function getActiveSkaterPool(players, pos){
  var reserve=pos==='F'?2:1;
  var cap=pos==='F'?12:6;
  var sorted=players.slice().sort(function(a,b){
    var d=getHealthyScratchScore(b)-getHealthyScratchScore(a);
    if(d!==0) return d;
    return (b.ovr||50)-(a.ovr||50);
  });
  return sorted.slice(0, Math.min(cap, Math.max(0, sorted.length-reserve)));
}

function assignForwardLine(fwd, slots, start){
  var pool=getActiveSkaterPool(fwd, 'F');
  var used={}, i, j, best, bestSc, cP, lwP, rwP;
  for(i=0;i<4;i++){
    var lwS=slots[start+i*3], cS=slots[start+i*3+1], rwS=slots[start+i*3+2];
    cP=pickBestForDepthSlot(pool, used, 'C')||pickBestForDepthSlot(pool, used, null);
    if(i===0&&cP){
      var pmPool=pool.filter(function(p){return !used[p.id]&&(p.arch==='Playmaker'||p.pref==='C');});
      pmPool.sort(function(a,b){return getWeeklyDepthScore(b)-getWeeklyDepthScore(a);});
      if(pmPool[0]&&(pmPool[0].ovr||0)>=(cP.ovr||0)-5) cP=pmPool[0];
    }
    if(!cP) break;
    used[cP.id]=true;
    cS.player=cP; cP.depthSlot=cS.slot;
    var rem=pool.filter(function(p){return !used[p.id];});
    best=null; bestSc=-99;
    for(j=0;j<rem.length;j++){
      var sc=lineComplementScore(cP, rem[j]);
      if(i===0&&rem[j].arch==='Sniper') sc+=3;
      if((rem[j].pref==='LW'||rem[j].hand==='L')&&rem[j].pref!=='RW') sc+=0.5;
      sc+=getWeeklyDepthScore(rem[j])*0.04;
      if(sc>bestSc){ bestSc=sc; best=rem[j]; }
    }
    lwP=best||pickBestForDepthSlot(pool, used, 'LW')||pickBestForDepthSlot(pool, used, null);
    if(lwP){ used[lwP.id]=true; lwS.player=lwP; lwP.depthSlot=lwS.slot; }
    rem=pool.filter(function(p){return !used[p.id];});
    best=null; bestSc=-99;
    for(j=0;j<rem.length;j++){
      var sc2=lineComplementScore(cP, rem[j]);
      if(i===0&&rem[j].arch==='Sniper') sc2+=3;
      if((rem[j].pref==='RW'||rem[j].hand==='R')&&rem[j].pref!=='LW') sc2+=0.5;
      sc2+=getWeeklyDepthScore(rem[j])*0.04;
      if(sc2>bestSc){ bestSc=sc2; best=rem[j]; }
    }
    rwP=best||pickBestForDepthSlot(pool, used, 'RW')||pickBestForDepthSlot(pool, used, null);
    if(rwP){ used[rwP.id]=true; rwS.player=rwP; rwP.depthSlot=rwS.slot; }
  }
  fillEmptyDepthSlots(pool, slots, used);
}

function assignDefensePairs(def, slots){
  var pool=getActiveSkaterPool(def, 'D');
  var used={}, p, i;
  for(i=0;i<3;i++){
    var ld=slots[i*2], rd=slots[i*2+1];
    p=pickBestForDepthSlot(pool, used, 'LD')||pickBestForDepthSlot(pool, used, null);
    if(p){ used[p.id]=true; ld.player=p; p.depthSlot=ld.slot; }
    p=pickBestForDepthSlot(pool, used, 'RD')||pickBestForDepthSlot(pool, used, null);
    if(p){ used[p.id]=true; rd.player=p; p.depthSlot=rd.slot; }
  }
  fillEmptyDepthSlots(pool, slots, used);
}

function buildDepthChartSlots(){
  var slots={forwards:[],defense:[],goalies:[],pp1:[],pp2:[],pk1:[],pk2:[]}, i, lbl;
  for(i=0;i<DEPTH_F_SLOTS.length;i++) slots.forwards.push({slot:DEPTH_F_SLOTS[i], player:null});
  for(i=0;i<DEPTH_D_SLOTS.length;i++) slots.defense.push({slot:DEPTH_D_SLOTS[i], player:null});
  for(i=0;i<DEPTH_G_SLOTS.length;i++) slots.goalies.push({slot:DEPTH_G_SLOTS[i], player:null});
  for(i=0;i<DEPTH_PP_SLOTS.length;i++){
    lbl=DEPTH_PP_SLOTS[i];
    slots.pp1.push({slot:'PP1-'+lbl, player:null});
    slots.pp2.push({slot:'PP2-'+lbl, player:null});
  }
  for(i=0;i<DEPTH_PK_SLOTS.length;i++){
    lbl=DEPTH_PK_SLOTS[i];
    slots.pk1.push({slot:'PK1-'+lbl, player:null});
    slots.pk2.push({slot:'PK2-'+lbl, player:null});
  }
  return slots;
}

function getPowerPlayScore(p){
  var form=typeof p.form==='number'?p.form:50;
  var base=p.ovr*0.55+form*0.45;
  if(p.pos==='G') return -999;
  if(p.pos==='D'){
    if(p.arch==='OffensiveD') return base+14;
    if(p.arch==='TwoWayD') return base+8;
    if(p.arch==='StayAtHome') return base-4;
    if(p.arch==='ShutdownD') return base-8;
    return base;
  }
  if(p.arch==='Sniper') return base+12;
  if(p.arch==='Playmaker') return base+10;
  if(p.arch==='PowerForward') return base+8;
  if(p.arch==='TwoWay') return base+5;
  if(p.arch==='Grinder') return base-6;
  return base;
}

function getPenaltyKillScore(p){
  var form=typeof p.form==='number'?p.form:50;
  var base=p.ovr*0.55+form*0.45;
  if(p.pos==='G') return -999;
  if(p.pos==='D'){
    if(p.arch==='ShutdownD') return base+14;
    if(p.arch==='StayAtHome') return base+12;
    if(p.arch==='TwoWayD') return base+10;
    if(p.arch==='OffensiveD') return base-4;
    return base;
  }
  if(p.arch==='Grinder') return base+10;
  if(p.arch==='TwoWay') return base+8;
  if(p.arch==='PowerForward') return base+2;
  if(p.arch==='Playmaker') return base-2;
  if(p.arch==='Sniper') return base-8;
  return base;
}

function pickBestForSpecial(pool, used, scoreFn){
  var avail=pool.filter(function(p){return !used[p.id];});
  if(!avail.length) return null;
  var jitter=isEstablishedProLeague(_depthAssignLeagueKey)?rd(-0.6,0.6):rd(-4,4);
  avail.sort(function(a,b){return (scoreFn(b)+jitter)-(scoreFn(a)+jitter);});
  return avail[0];
}

function assignPowerPlayUnit(pool, used, unitSlots){
  var picked=[], p, i;
  var avail=pool.filter(function(pl){return pl.pos!=='G'&&!used[pl.id];});
  avail.sort(function(a,b){return getPowerPlayScore(b)-getPowerPlayScore(a);});
  var dCand=avail.filter(function(pl){return pl.pos==='D';});
  if(dCand.length){
    p=dCand[0];
    used[p.id]=true;
    picked.push(p);
  }
  while(picked.length<5){
    avail=pool.filter(function(pl){return pl.pos!=='G'&&!used[pl.id];});
    if(!avail.length) break;
    avail.sort(function(a,b){return getPowerPlayScore(b)-getPowerPlayScore(a);});
    p=avail[0];
    used[p.id]=true;
    picked.push(p);
  }
  picked.sort(function(a,b){return getPowerPlayScore(b)-getPowerPlayScore(a);});
  for(i=0;i<unitSlots.length&&i<picked.length;i++){
    unitSlots[i].player=picked[i];
    picked[i].ppSlot=unitSlots[i].slot;
  }
}

function assignPenaltyKillUnit(pool, used, unitSlots){
  var picked=[], p, i, n;
  var avail=pool.filter(function(pl){return pl.pos!=='G'&&!used[pl.id];});
  avail.sort(function(a,b){return getPenaltyKillScore(b)-getPenaltyKillScore(a);});
  var dCand=avail.filter(function(pl){return pl.pos==='D';});
  for(n=0;n<2&&n<dCand.length;n++){
    p=dCand[n];
    if(used[p.id]) continue;
    used[p.id]=true;
    picked.push(p);
  }
  var fCand=avail.filter(function(pl){return pl.pos==='F'&&!used[pl.id];});
  for(n=0;n<2&&n<fCand.length;n++){
    p=fCand[n];
    used[p.id]=true;
    picked.push(p);
  }
  while(picked.length<4){
    avail=pool.filter(function(pl){return pl.pos!=='G'&&!used[pl.id];});
    if(!avail.length) break;
    avail.sort(function(a,b){return getPenaltyKillScore(b)-getPenaltyKillScore(a);});
    p=avail[0];
    used[p.id]=true;
    picked.push(p);
  }
  picked.sort(function(a,b){return getPenaltyKillScore(b)-getPenaltyKillScore(a);});
  for(i=0;i<unitSlots.length&&i<picked.length;i++){
    unitSlots[i].player=picked[i];
    picked[i].pkSlot=unitSlots[i].slot;
  }
}

function assignSpecialTeams(skaters, slots){
  var ppUsed={}, pkUsed={};
  assignPowerPlayUnit(skaters, ppUsed, slots.pp1);
  assignPowerPlayUnit(skaters, ppUsed, slots.pp2);
  assignPenaltyKillUnit(skaters, pkUsed, slots.pk1);
  assignPenaltyKillUnit(skaters, pkUsed, slots.pk2);
}

function getDepthSortScore(p){
  var form=typeof p.form==='number'?p.form:50;
  var ovrN=p.ovr||50;
  var score=ovrN*0.80+form*0.20;
  if(ovrN>=95) score=Math.max(score, 95+form*0.04);
  else if(ovrN>=92) score=Math.max(score, 93+form*0.05);
  else if(ovrN>=88) score=Math.max(score, 89+form*0.07);
  else if(ovrN>=84) score=Math.max(score, 85+form*0.09);
  return score;
}

/** Higher = deserves to dress; lower = healthy-scratch candidate. Talent + recent form + season box score. */
function getHealthyScratchScore(p){
  if(!p) return 0;
  if(p.injured) return 999;
  var ovr=typeof p.ovr==='number'?p.ovr:50;
  var form=typeof p.form==='number'?p.form:50;
  if(typeof ensurePlayerStats==='function') ensurePlayerStats(p);
  var s=p.seasonStats||{};
  var gp=s.gp||0;
  var prod=0;
  if(gp>=1){
    var ppg=(s.pts||0)/gp;
    var pmPg=(s.pm||0)/gp;
    prod=ppg*14+pmPg*2.5+Math.min(1.4,(s.g||0)/gp)*5;
  } else {
    prod=ovr*0.1+form*0.06;
  }
  var score=ovr*0.38+form*0.37+prod*0.25;
  return score;
}

var _depthAssignLeagueKey='';

function getWeeklyDepthScore(p){
  var base=getDepthSortScore(p);
  if(p.isMe&&typeof getCoachRelationDepthBonus==='function') base+=getCoachRelationDepthBonus();
  var ovrN=p.ovr||50;
  if(ovrN>=92) return base+rd(-0.8,0.8);
  if(ovrN>=88) return base+rd(-1.2,1.2);
  if(isEstablishedProLeague(_depthAssignLeagueKey)) return base+rd(-1.5,1.5);
  return base+rd(-2.5,2.5);
}

function avgNpcForm(players){
  var list=(players||[]).filter(Boolean);
  if(!list.length) return 50;
  var s=0, i;
  for(i=0;i<list.length;i++) s+=(list[i].form||50);
  return s/list.length;
}

function getForwardLineSlots(depth, lineNum){
  var out=[], i, s;
  if(!depth||!depth.forwards) return out;
  for(i=0;i<depth.forwards.length;i++){
    s=depth.forwards[i];
    if(getDepthLineFromSlot(s.slot,'F')===lineNum) out.push(s);
  }
  return out;
}

function getDefensePairSlots(depth, pairNum){
  var out=[], i, s;
  if(!depth||!depth.defense) return out;
  for(i=0;i<depth.defense.length;i++){
    s=depth.defense[i];
    if(getDepthLineFromSlot(s.slot,'D')===pairNum) out.push(s);
  }
  return out;
}

function swapForwardLinePlayers(depth, lineA, lineB){
  var slotsA=getForwardLineSlots(depth, lineA);
  var slotsB=getForwardLineSlots(depth, lineB);
  if(slotsA.length<2||slotsB.length<2) return false;
  var wingOf=function(slot){ return String(slot).replace(/\d/g,''); };
  var mapA={}, mapB={}, w;
  slotsA.forEach(function(s){ mapA[wingOf(s.slot)]=s; });
  slotsB.forEach(function(s){ mapB[wingOf(s.slot)]=s; });
  for(w in mapA){
    if(!mapB[w]) continue;
    var sa=mapA[w], sb=mapB[w], pa=sa.player, pb=sb.player;
    sa.player=pb; sb.player=pa;
    if(pa) pa.depthSlot=sb.slot;
    if(pb) pb.depthSlot=sa.slot;
  }
  return true;
}

function swapDefensePairPlayers(depth, pairA, pairB){
  var slotsA=getDefensePairSlots(depth, pairA);
  var slotsB=getDefensePairSlots(depth, pairB);
  if(slotsA.length<2||slotsB.length<2) return false;
  var sideOf=function(slot){ return String(slot).indexOf('L')===0?'L':'R'; };
  var mapA={}, mapB={}, k;
  slotsA.forEach(function(s){ mapA[sideOf(s.slot)]=s; });
  slotsB.forEach(function(s){ mapB[sideOf(s.slot)]=s; });
  for(k in mapA){
    if(!mapB[k]) continue;
    var sa=mapA[k], sb=mapB[k], pa=sa.player, pb=sb.player;
    sa.player=pb; sb.player=pa;
    if(pa) pa.depthSlot=sb.slot;
    if(pb) pb.depthSlot=sa.slot;
  }
  return true;
}

function trySwapForwardLinesIfWarranted(depth, upperLine, lowerLine, formGap){
  var upper=getForwardLineSlots(depth, upperLine);
  var lower=getForwardLineSlots(depth, lowerLine);
  var fUpper=avgNpcForm(upper.map(function(s){return s.player;}));
  var fLower=avgNpcForm(lower.map(function(s){return s.player;}));
  if(fLower>fUpper+formGap) return swapForwardLinePlayers(depth, upperLine, lowerLine);
  return false;
}

function trySwapDefensePairsIfWarranted(depth, upperPair, lowerPair, formGap){
  var upper=getDefensePairSlots(depth, upperPair);
  var lower=getDefensePairSlots(depth, lowerPair);
  var fUpper=avgNpcForm(upper.map(function(s){return s.player;}));
  var fLower=avgNpcForm(lower.map(function(s){return s.player;}));
  if(fLower>fUpper+formGap) return swapDefensePairPlayers(depth, upperPair, lowerPair);
  return false;
}

function tryPromoteHotForward(depth, fromLine, toLine){
  var from=getForwardLineSlots(depth, fromLine);
  var to=getForwardLineSlots(depth, toLine);
  var hot=null, cold=null, hotSc=-1, coldSc=999, i, s, f;
  for(i=0;i<from.length;i++){
    s=from[i]; if(!s.player) continue;
    f=s.player.form||50;
    if(f>hotSc){ hotSc=f; hot=s; }
  }
  for(i=0;i<to.length;i++){
    s=to[i]; if(!s.player) continue;
    f=s.player.form||50;
    if(f<coldSc){ coldSc=f; cold=s; }
  }
  if(!hot||!cold||hotSc<coldSc+10) return false;
  var hp=hot.player, cp=cold.player;
  hot.player=cp; cold.player=hp;
  hp.depthSlot=cold.slot;
  cp.depthSlot=hot.slot;
  return true;
}

function refreshProSpecialUnit(roster, unitKey){
  var d=roster.depth, unit=d&&d[unitKey];
  if(!unit) return;
  var used={}, skaters=roster.players.filter(function(p){return p.pos==='F'||p.pos==='D';});
  if(unitKey==='pp2'&&d.pp1){
    d.pp1.forEach(function(s){ if(s.player) used[s.player.id]=true; });
  } else if(unitKey==='pk2'&&d.pk1){
    d.pk1.forEach(function(s){ if(s.player) used[s.player.id]=true; });
  }
  unit.forEach(function(s){
    if(s.player) delete used[s.player.id];
    s.player=null;
  });
  if(unitKey.indexOf('pp')===0) assignPowerPlayUnit(skaters, used, unit);
  else assignPenaltyKillUnit(skaters, used, unit);
}

function trySwapOneSpecialSpot(roster, unit, scoreFn, slotField){
  if(!unit||!unit.length) return false;
  var coldest=null, coldSc=999, i, s, f;
  for(i=0;i<unit.length;i++){
    s=unit[i]; if(!s.player) continue;
    f=scoreFn(s.player);
    if(f<coldSc){ coldSc=f; coldest=s; }
  }
  if(!coldest||!coldest.player) return false;
  var pool=roster.players.filter(function(p){
    return (p.pos==='F'||p.pos==='D')&&p.id!==coldest.player.id;
  });
  pool.sort(function(a,b){return scoreFn(b)-scoreFn(a);});
  var i2, cand=null;
  for(i2=0;i2<pool.length;i2++){
    if(scoreFn(pool[i2])>coldSc+8){ cand=pool[i2]; break; }
  }
  if(!cand) return false;
  unit.forEach(function(u){
    if(u.player&&u.player.id===cand.id) u.player=null;
  });
  coldest.player=cand;
  cand[slotField]=coldest.slot;
  return true;
}

function maybeProDepthAdjust(roster){
  if(!roster||!roster.depth||!isEstablishedProLeague(roster.leagueKey||'')) return;
  var d=roster.depth;
  var moved=false;
  if(Math.random()<0.16) moved=trySwapForwardLinesIfWarranted(d, 3, 4, 11)||moved;
  if(Math.random()<0.10) moved=trySwapForwardLinesIfWarranted(d, 2, 3, 14)||moved;
  if(Math.random()<0.04) moved=trySwapForwardLinesIfWarranted(d, 1, 2, 22)||moved;
  if(!moved&&Math.random()<0.12) tryPromoteHotForward(d, 4, 3);
  if(Math.random()<0.11) trySwapDefensePairsIfWarranted(d, 2, 3, 12);
  if(Math.random()<0.05) trySwapDefensePairsIfWarranted(d, 1, 2, 20);
  if(Math.random()<0.18) refreshProSpecialUnit(roster, 'pp2');
  if(Math.random()<0.1) trySwapOneSpecialSpot(roster, d.pp1, getPowerPlayScore, 'ppSlot');
  if(Math.random()<0.12) refreshProSpecialUnit(roster, 'pk2');
}

function pickBestForDepthSlot(pool, used, prefer){
  var avail=pool.filter(function(p){return !used[p.id];});
  if(!avail.length) return null;
  if(prefer){
    var pref=avail.filter(function(p){
      if(prefer==='C') return p.pref==='C'||p.pos==='F';
      if(prefer==='LW') return p.pref==='LW'||(p.hand==='L'&&p.pref!=='RW');
      if(prefer==='RW') return p.pref==='RW'||(p.hand==='R'&&p.pref!=='LW');
      if(prefer==='LD') return p.pref==='LD'||(p.hand==='L'&&p.pref!=='RD');
      if(prefer==='RD') return p.pref==='RD'||(p.hand==='R'&&p.pref!=='LD');
      return true;
    });
    if(pref.length) avail=pref;
  }
  avail.sort(function(a,b){
    var sa=getWeeklyDepthScore(a), sb=getWeeklyDepthScore(b);
    if(prefer){
      sa+=getDepthPrefSlotBonus(a, prefer);
      sb+=getDepthPrefSlotBonus(b, prefer);
    }
    return sb-sa;
  });
  return avail[0];
}

function getDepthPrefSlotBonus(player, slotPref){
  if(!player||!slotPref) return 0;
  var pref=player.pref;
  if(player.isMe&&typeof G!=='undefined'&&G&&(G.subPos||G.pos!=='G')) pref=G.subPos||pref;
  if(!pref) return 0;
  var match=false;
  if(slotPref==='C') match=pref==='C';
  else if(slotPref==='LW') match=pref==='LW';
  else if(slotPref==='RW') match=pref==='RW';
  else if(slotPref==='LD') match=pref==='LD';
  else if(slotPref==='RD') match=pref==='RD';
  if(!match) return 0;
  var ovrN=player.ovr||50;
  if(player.isMe&&typeof ovr==='function') ovrN=ovr(G.attrs,G.pos);
  return cl(2+(ovrN-58)/8, 1.5, 8);
}

function prefDepthSlotName(pos, pref, line){
  line=line||1;
  if(pos==='F'){
    if(pref==='C') return 'C'+line;
    if(pref==='LW') return 'LW'+line;
    if(pref==='RW') return 'RW'+line;
  }
  if(pos==='D'){
    if(pref==='LD') return 'LD'+line;
    if(pref==='RD') return 'RD'+line;
  }
  return null;
}

function getUserPreferredDepthChance(me, peers){
  var uOvr=me.ovr||0;
  if(me.isMe&&typeof ovr==='function') uOvr=ovr(G.attrs,G.pos);
  var better=0, i;
  for(i=0;i<peers.length;i++){ if((peers[i].ovr||0)>uOvr+1) better++; }
  var chance=cl(0.40+(uOvr-55)/75, 0.36, 0.94);
  if(better===0) chance=Math.max(chance, 0.84);
  else if(better===1) chance=Math.max(chance, 0.66);
  else if(better===2) chance=Math.max(chance, 0.50);
  return {chance:chance, better:better, uOvr:uOvr};
}

function ensureUserPreferredDepthSlot(roster){
  if(!G||!roster||!roster.depth) return;
  var me=null, i;
  for(i=0;i<roster.players.length;i++){ if(roster.players[i].isMe) me=roster.players[i]; }
  if(!me||me.pos==='G') return;
  var pref=G.subPos||me.pref;
  if(!pref||pref==='G') return;
  var peers=roster.players.filter(function(p){return p.pos===me.pos&&!p.isMe;});
  var placement=getUserPreferredDepthChance(me, peers);
  if(Math.random()>placement.chance) return;
  var line=Math.min(4, 1+placement.better);
  if(placement.better>0&&peers.length){
    peers.sort(function(a,b){return (b.ovr||0)-(a.ovr||0);});
    if(placement.uOvr>=(peers[0].ovr||0)-3) line=Math.max(1, line-1);
  }
  var want=prefDepthSlotName(me.pos, pref, line);
  if(!want) return;
  var unit=me.pos==='F'?roster.depth.forwards:roster.depth.defense;
  var target=null, myEntry=null;
  for(i=0;i<unit.length;i++){
    if(unit[i].slot===want) target=unit[i];
    if(unit[i].player&&unit[i].player.isMe) myEntry=unit[i];
  }
  if(!target||!myEntry||target===myEntry||!target.player) return;
  if(!target.player.isMe&&(target.player.ovr||0)>placement.uOvr+6) return;
  var other=target.player, mySlot=myEntry.slot;
  myEntry.player=me; me.depthSlot=want;
  target.player=other; other.depthSlot=mySlot;
}

function fillEmptyDepthSlots(pool, slots, used){
  var i, s, p;
  for(i=0;i<slots.length;i++){
    s=slots[i];
    if(s.player) continue;
    p=pickBestForDepthSlot(pool, used, null);
    if(!p) break;
    used[p.id]=true;
    s.player=p;
    p.depthSlot=s.slot;
  }
}

function ensureRosterPositionCounts(roster, leagueKey){
  if(!roster||!roster.players) return;
  var pos, need, have, missing, p, rank=18;
  for(pos in ROSTER_POS_COUNTS){
    need=ROSTER_POS_COUNTS[pos];
    have=roster.players.filter(function(pl){return pl.pos===pos;}).length;
    missing=need-have;
    while(missing>0){
      p=makeNpcPlayer(pos, leagueKey, rank++, null);
      if(p){
        p.team=roster.teamName;
        roster.players.push(p);
      }
      missing--;
    }
  }
}

function restoreDepthUnit(oldUnit, newUnit, byId, used, slotField){
  if(!oldUnit||!newUnit) return;
  var i, op, p;
  for(i=0;i<newUnit.length;i++){
    op=oldUnit[i]&&oldUnit[i].player;
    if(!op) continue;
    p=byId[op.id];
    if(!p||used[p.id]||p.injured) continue;
    if(p.depthSlot&&String(p.depthSlot).indexOf('SCR')>=0) continue;
    newUnit[i].player=p;
    p[slotField]=newUnit[i].slot;
    used[p.id]=true;
  }
}

function fillSpecialSlots(pool, used, unitSlots, scoreFn, slotField){
  var i, p, avail;
  for(i=0;i<unitSlots.length;i++){
    if(unitSlots[i].player) continue;
    avail=pool.filter(function(pl){return pl.pos!=='G'&&!used[pl.id];});
    if(!avail.length) break;
    avail.sort(function(a,b){return scoreFn(b)-scoreFn(a);});
    p=avail[0];
    used[p.id]=true;
    unitSlots[i].player=p;
    p[slotField]=unitSlots[i].slot;
  }
}

function assignDepthChartSticky(roster){
  var old=roster.depth;
  if(!old||!old.forwards||!old.forwards.length) return false;
  var slots=buildDepthChartSlots();
  var byId={}, used={};
  roster.players.forEach(function(p){ byId[p.id]=p; });
  restoreDepthUnit(old.forwards, slots.forwards, byId, used, 'depthSlot');
  restoreDepthUnit(old.defense, slots.defense, byId, used, 'depthSlot');
  restoreDepthUnit(old.goalies, slots.goalies, byId, used, 'depthSlot');
  var spareF=roster.players.filter(function(p){return p.pos==='F'&&!used[p.id];});
  var spareD=roster.players.filter(function(p){return p.pos==='D'&&!used[p.id];});
  fillEmptyDepthSlots(getActiveSkaterPool(spareF, 'F'), slots.forwards.filter(function(s){return !s.player;}), used);
  fillEmptyDepthSlots(getActiveSkaterPool(spareD, 'D'), slots.defense.filter(function(s){return !s.player;}), used);
  if(!slots.goalies[0].player||!slots.goalies[1].player){
    var goalies=roster.players.filter(function(p){return p.pos==='G'&&!used[p.id];});
    goalies.sort(function(a,b){return getWeeklyDepthScore(b)-getWeeklyDepthScore(a);});
    if(!slots.goalies[0].player&&goalies[0]){
      slots.goalies[0].player=goalies[0]; goalies[0].depthSlot='G1'; used[goalies[0].id]=true;
    }
    if(!slots.goalies[1].player&&goalies[1]){
      slots.goalies[1].player=goalies[1]; goalies[1].depthSlot='G2'; used[goalies[1].id]=true;
    }
  }
  var skaters=roster.players.filter(function(p){return p.pos==='F'||p.pos==='D';});
  var ppUsed={}, pkUsed={};
  restoreDepthUnit(old.pp1, slots.pp1, byId, ppUsed, 'ppSlot');
  restoreDepthUnit(old.pp2, slots.pp2, byId, ppUsed, 'ppSlot');
  restoreDepthUnit(old.pk1, slots.pk1, byId, pkUsed, 'pkSlot');
  restoreDepthUnit(old.pk2, slots.pk2, byId, pkUsed, 'pkSlot');
  fillSpecialSlots(skaters, ppUsed, slots.pp1, getPowerPlayScore, 'ppSlot');
  fillSpecialSlots(skaters, ppUsed, slots.pp2, getPowerPlayScore, 'ppSlot');
  fillSpecialSlots(skaters, pkUsed, slots.pk1, getPenaltyKillScore, 'pkSlot');
  fillSpecialSlots(skaters, pkUsed, slots.pk2, getPenaltyKillScore, 'pkSlot');
  if(typeof assignHealthyScratches==='function') assignHealthyScratches(roster, slots);
  roster.depth=slots;
  if(typeof ensureUserPreferredDepthSlot==='function') ensureUserPreferredDepthSlot(roster);
  stampProRoleLabels(roster);
  return true;
}

function assignDepthChart(roster, opts){
  opts=opts||{};
  var lk=roster.leagueKey||(G&&G.leagueKey)||'';
  _depthAssignLeagueKey=lk;
  var established=isEstablishedProLeague(lk);
  ensureRosterPositionCounts(roster, lk);
  if(roster._depthLocked&&!opts.forceRebuild&&assignDepthChartSticky(roster)){
    if(typeof ensureTeamRelations==='function') ensureTeamRelations(roster);
    _depthAssignLeagueKey='';
    return;
  }
  if(opts.forceRebuild) roster._depthLocked=false;
  roster.players.forEach(function(p){ p.depthSlot=null; p.ppSlot=null; p.pkSlot=null; });
  var slots=buildDepthChartSlots();
  var fwd=roster.players.filter(function(p){return p.pos==='F';});
  var def=roster.players.filter(function(p){return p.pos==='D';});
  var goalies=roster.players.filter(function(p){return p.pos==='G';});
  var skaters=fwd.concat(def);
  assignForwardLine(fwd, slots.forwards, 0);
  assignDefensePairs(def, slots.defense);
  goalies.sort(function(a,b){return getWeeklyDepthScore(b)-getWeeklyDepthScore(a);});
  if(goalies[0]){ slots.goalies[0].player=goalies[0]; goalies[0].depthSlot='G1'; }
  if(goalies[1]){ slots.goalies[1].player=goalies[1]; goalies[1].depthSlot='G2'; }
  assignSpecialTeams(skaters, slots);
  if(typeof assignHealthyScratches==='function') assignHealthyScratches(roster, slots);
  if(typeof ensureTeamRelations==='function') ensureTeamRelations(roster);
  roster.depth=slots;
  if(established) roster._depthLocked=true;
  else roster._depthLocked=true;
  if(typeof ensureUserPreferredDepthSlot==='function') ensureUserPreferredDepthSlot(roster);
  stampProRoleLabels(roster);
  _depthAssignLeagueKey='';
}

function assignTeamLeadership(players){
  players.forEach(function(p){
    if(!p.isMe) p.leadership='';
  });
  var pool=players.filter(function(p){return !p.isMe;});
  if(pool.length<3) return;
  var ranked=pool.slice().sort(function(a,b){
    return (b.age*1.4+b.ovr)-(a.age*1.4+a.ovr);
  });
  var capCand=ranked.filter(function(p){return p.age>=18;});
  capCand.sort(function(a,b){return b.ovr-a.ovr||b.age-a.age;});
  var captain=capCand[0]||ranked[0];
  captain.leadership='C';
  var altPool=pool.filter(function(p){return p!==captain;});
  altPool.sort(function(a,b){return b.ovr-a.ovr||b.age-a.age;});
  if(altPool[0]) altPool[0].leadership='A';
  if(altPool[1]) altPool[1].leadership='A';
}

function findAlumniForLeague(leagueKey, pos){
  if(!G.leagueAlumni||!G.leagueAlumni.length) return null;
  var gender=(LEAGUES[leagueKey]||{}).gender;
  var pool=G.leagueAlumni.filter(function(a){
    if(a.used) return false;
    if(a.gender&&gender&&a.gender!==gender) return false;
    if(pos&&a.pos!==pos) return false;
    return true;
  });
  if(!pool.length) return null;
  pool.sort(function(a,b){return (b.pts||0)-(a.pts||0);});
  var pick=pool[0];
  pick.used=true;
  return pick;
}

function findPromotedJuniorMate(leagueKey, pos, teamName){
  if(!G.juniorTeammateIds||!G.juniorTeammateIds.length) return null;
  if(!G.team||G.team.n!==teamName) return null;
  var i, mate;
  for(i=0;i<G.juniorTeammateIds.length;i++){
    mate=G.juniorTeammateIds[i];
    if(mate.promoted||mate.pos!==pos) continue;
    if(Math.random()>0.38) continue;
    mate.promoted=true;
    return mate;
  }
  return null;
}

function buildTeamRoster(leagueKey, teamName, prevRoster){
  var sameTeam=prevRoster&&prevRoster.teamName===teamName;
  var coach=pickCoach(teamName, leagueKey, sameTeam?prevRoster.coach:null);
  var floor=getLeagueOvrFloor(leagueKey);
  var cap=getLeagueOvrCap(leagueKey);
  var prevMap={};
  if(sameTeam&&prevRoster&&prevRoster.players){
    prevRoster.players.forEach(function(p){ if(!p.isMe) prevMap[p.id]=p; });
  }
  var players=[], rank=0, carryList=sameTeam?shuf(prevRoster.players.filter(function(p){return !p.isMe;})):[];

  function fillPos(pos, count){
    var ci=0, made=0, alumniUsed=0, mateUsed=0;
    while(made<count){
      var carry=null, p=null;
      if(sameTeam&&ci<carryList.length){
        while(ci<carryList.length&&carryList[ci].pos!==pos) ci++;
        if(ci<carryList.length){ carry=carryList[ci]; ci++; }
      }
      if(!carry&&alumniUsed<1&&Math.random()<0.22){
        var alum=findAlumniForLeague(leagueKey, pos);
        if(alum){
          p={
            id:alum.id||('alum_'+alum.first+'_'+alum.last),
            first:alum.first, last:alum.last, pos:alum.pos, pref:alum.pref||pos,
            hand:alum.hand||'L', age:Math.min(alum.age+1, getLeagueNpcMaxAge(leagueKey)),
            arch:alum.arch||pickNpcArchetype(pos),
            ovr:cl((alum.ovr||70)+rd(-2,3), floor, cap),
            isMe:false, team:teamName, leadership:'',
            proProspect:!!alum.proProspect, alumniFrom:alum.fromLeague||'',
            juniorMate:false, seasonStats:emptyPlayerStats(), form:52
          };
          alumniUsed++;
        }
      }
      if(!p&&!carry&&mateUsed<2){
        var mate=findPromotedJuniorMate(leagueKey, pos, teamName);
        if(mate){
          p={
            id:mate.id, first:mate.first, last:mate.last, pos:mate.pos,
            pref:mate.pref||mate.pos, hand:mate.hand||'L',
            age:Math.min((mate.age||18)+1, getLeagueNpcMaxAge(leagueKey)),
            arch:mate.arch||pickNpcArchetype(pos),
            ovr:cl((mate.ovr||62)+rd(0,4), floor, cap),
            isMe:false, team:teamName, leadership:'',
            proProspect:!!mate.proProspect, alumniFrom:'', juniorMate:true,
            seasonStats:emptyPlayerStats(), form:50
          };
          mateUsed++;
        }
      }
      if(!p){
        p=makeNpcPlayer(pos, leagueKey, rank++, carry, teamName);
        if(!p) p=makeNpcPlayer(pos, leagueKey, rank++, null, teamName);
      }
      p.team=teamName;
      players.push(p);
      made++;
    }
  }
  fillPos('F', 14);
  fillPos('D', 7);
  fillPos('G', 2);
  injectRookieProspects(players, leagueKey, teamName);
  balanceTeamForwardArchetypes(players);
  if(isEliteProLeagueKey(leagueKey)) clampEliteProRosterOvrSpread(players, leagueKey);
  if(isMinorProLeagueKey(leagueKey)) clampMinorProRosterOvrSpread(players, leagueKey);
  assignTeamLeadership(players);
  var roster={teamName:teamName, leagueKey:leagueKey, coach:coach, players:players, depth:null};
  syncUserPlayerIntoRoster(roster);
  assignDepthChart(roster);
  seedRosterPriorCareerStats(roster);
  return roster;
}

function syncUserPlayerIntoRoster(roster){
  if(!G||!roster||!roster.players) return;
  roster.players=roster.players.filter(function(p){return !p.isMe&&p.id!=='user';});
  if(!G.team||roster.teamName!==G.team.n||roster.leagueKey!==(G.leagueKey||'')) return;
  if(typeof ensureUserScoringPulse==='function') ensureUserScoringPulse();
  var uOvr=ovr(G.attrs,G.pos);
  var me={
    id:'user', first:G.first, last:G.last, pos:G.pos,
    pref:G.subPos||G.pos, hand:G.hand||'L',
    age:G.age, arch:G.arch, ovr:uOvr,
    isMe:true, team:G.team&&G.team.n, leadership:G.leadershipRole||'',
    seasonStats:null, form:48+ri(0,8),
    scoringPulse:typeof G._scoringPulse==='number'?G._scoringPulse:rd(0.82, Math.min(1.04, 0.72+uOvr/130))
  };
  var peers=roster.players.filter(function(p){return p.pos===G.pos;});
  if(peers.length){
    peers.sort(function(a,b){return a.ovr-b.ovr;});
    var idx=roster.players.indexOf(peers[0]);
    roster.players[idx]=me;
  } else {
    roster.players.push(me);
  }
  ensureRosterPositionCounts(roster, roster.leagueKey||G.leagueKey);
}

function getLeagueTeamRoster(leagueKey, teamName){
  if(G.team&&G.team.n===teamName&&G.leagueKey===leagueKey) return ensureTeamRoster();
  if(!G.leagueRostersCache) G.leagueRostersCache={};
  var ck=rosterCacheKey(leagueKey, teamName);
  if(G.leagueRostersCache[ck]) return G.leagueRostersCache[ck];
  var prevCk=leagueKey+'|'+(G.season-1)+'|'+teamName;
  var prev=G.leagueRostersCache[prevCk]||null;
  var roster=buildTeamRoster(leagueKey, teamName, prev);
  G.leagueRostersCache[ck]=roster;
  return roster;
}

function ensureTeamRoster(){
  if(!G||!G.team) return null;
  var key=(G.leagueKey||'')+'|'+G.team.n+'|'+(G.season||1);
  if(G._teamRosterKey===key&&G.teamRoster){
    syncUserPlayerIntoRoster(G.teamRoster);
    if(G.teamRoster.depth&&G.teamRoster._depthLocked) assignDepthChartSticky(G.teamRoster);
    else assignDepthChart(G.teamRoster);
    return G.teamRoster;
  }
  var prev=null;
  if(G.teamRoster&&G._teamRosterKey&&G._teamRosterKey.split('|')[1]===G.team.n) prev=G.teamRoster;
  else if(G.leagueRostersCache){
    var prevCk=String(G.leagueKey||'')+'|'+(G.season-1)+'|'+String(G.team.n||'');
    prev=G.leagueRostersCache[prevCk]||null;
  }
  G.teamRoster=buildTeamRoster(G.leagueKey, G.team.n, prev);
  G._teamRosterKey=key;
  if(G.teamRoster&&G.teamRoster.players){
    G.teamRoster.players.forEach(function(p){ if(!p.isMe) healPlayerSeasonStats(p, G.leagueKey); });
  }
  if(G.leagueRostersCache) G.leagueRostersCache[rosterCacheKey(G.leagueKey, G.team.n)]=G.teamRoster;
  return G.teamRoster;
}

function getSeasonProgressFraction(){
  if(!G||!G.league) return 0;
  if(typeof isLocalLeague==='function'&&isLocalLeague(G.leagueKey)){
    var total=typeof getLocalLeagueGameCount==='function'?getLocalLeagueGameCount(G.leagueKey):(G.league.games||12);
    if(total<=0) return 0;
    var played=typeof countCompletedLocalGames==='function'?countCompletedLocalGames():(G.gp||0);
    if(G.gp>played) played=G.gp;
    return cl(played/total, 0, 1);
  }
  var total=G.league.games||68;
  if(total<=0) return 0;
  var perWeek=getGamesPerWeek(G.leagueKey);
  var played=Math.min(total, ((G.week||1)-1)*perWeek+(G.weekGames||0));
  if(G.gp>played) played=G.gp;
  return cl(played/total, 0, 1);
}

function getDepthLineFromSlot(slot, pos){
  if(slot&&String(slot).indexOf('SCR')>=0) return 5;
  if(pos==='G') return slot==='G1'?1:2;
  if(!slot) return 4;
  var m=String(slot).match(/(\d)/);
  return m?parseInt(m[1],10):4;
}

/** Ice time share by depth slot — top lines play far more than 4th liners / backups. */
function getArchetypeStatMods(arch, pos){
  if(pos==='G') return {g:1, a:1, pim:0.6};
  var m={
    Sniper:{g:1.22,a:0.72,pim:0.55},
    Playmaker:{g:0.58,a:1.32,pim:0.62},
    PowerForward:{g:1.08,a:0.85,pim:1.2},
    TwoWay:{g:0.88,a:0.92,pim:1.0},
    Grinder:{g:0.48,a:0.52,pim:1.9},
    OffensiveD:{g:1.24,a:1.02,pim:0.95},
    TwoWayD:{g:0.96,a:0.94,pim:1.12},
    StayAtHome:{g:0.62,a:0.72,pim:1.28},
    ShutdownD:{g:0.52,a:0.66,pim:1.45}
  };
  return m[arch]||{g:0.9,a:0.9,pim:1};
}

function getOvrPerformanceMult(player, leagueKey){
  var bands=getLeagueOvrBands(leagueKey);
  var base=bands.baseline+getLeagueRosterSkillOffset(leagueKey);
  var spread=bands.spread||11;
  var rosterMid=base-spread*0.12;
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  var cap=tier==='junior'?1.06:(tier==='college'?1.1:1.14);
  var ovrN=player.ovr||50;
  if(ovrN>=96) return cl(1.10+(ovrN-96)*0.028, 1.10, 1.15);
  if(ovrN>=93) return cl(1.03+(ovrN-93)*0.023, 1.03, 1.10);
  if(ovrN>=90) return cl(0.97+(ovrN-90)*0.02, 0.97, 1.03);
  return cl(0.64+(ovrN-rosterMid)/30, 0.52, cap);
}

function getTeamOffenseFactor(leagueKey, teamName){
  if(!G._teamOffenseFactors) G._teamOffenseFactors={};
  var ck=String(leagueKey||'')+'|'+String(teamName||'')+'|'+(G.season||1);
  if(G._teamOffenseFactors[ck]==null){
    var base=1;
    if(typeof ensureTeamProfile==='function'&&teamName){
      base=ensureTeamProfile(leagueKey, teamName).offense;
    }
    if(leagueKey==='USJL'&&teamName&&typeof isUsndtU18Team==='function'&&isUsndtU18Team(teamName)){
      base=Math.max(base, 1.14);
    } else if(leagueKey==='USJL'&&teamName&&typeof isUsndtU17Team==='function'&&isUsndtU17Team(teamName)){
      base=Math.max(base, 1.10);
    } else if(leagueKey==='USJL'&&teamName&&typeof isUsndtTeam==='function'&&isUsndtTeam(teamName)){
      base=Math.max(base, 1.12);
    } else if(isMajorJuniorEliteOrg(leagueKey, teamName)){
      base=Math.max(base, leagueKey==='OJL'?1.06:1.04);
    } else if(!teamName){
      base=rd(0.9,1.1);
    }
    G._teamOffenseFactors[ck]=cl(base*rd(0.97,1.03), 0.82, 1.18);
  }
  return G._teamOffenseFactors[ck];
}

function getDepthUsageForLine(line, pos){
  if(pos==='G') return line===1?rd(0.84,0.96):rd(0.08,0.28);
  if(line===1) return rd(0.86,0.98);
  if(line===2) return rd(0.58,0.74);
  if(line===3) return rd(0.34,0.5);
  return rd(0.1,0.26);
}

function getLeagueGoalieSimKnobs(leagueKey, teamName){
  if(leagueKey==='OJL'){
    var elite=teamName&&isMajorJuniorEliteOrg('OJL', teamName);
    return {base:elite?0.912:0.908, floor:elite?0.900:0.896, ceil:elite?0.956:0.952, ovrScale:elite?0.99:0.96};
  }
  if(leagueKey==='WJL'){
    return {base:0.902, floor:0.890, ceil:0.946, ovrScale:0.92};
  }
  if(leagueKey==='QMJL'){
    var qElite=teamName&&isMajorJuniorEliteOrg('QMJL', teamName);
    return {base:qElite?0.888:0.882, floor:qElite?0.876:0.870, ceil:qElite?0.936:0.930, ovrScale:qElite?0.82:0.76};
  }
  if(leagueKey==='CWHL') return {base:0.896, floor:0.884, ceil:0.942, ovrScale:0.88};
  if(leagueKey==='USJL'||leagueKey==='NEJC'||leagueKey==='ARJC'||leagueKey==='CEJC') return {base:0.902, floor:0.890, ceil:0.948, ovrScale:0.94};
  if(leagueKey==='PHL'||leagueKey==='NAML'||leagueKey==='PWL') return {base:0.906, floor:0.894, ceil:0.954, ovrScale:1};
  return {base:0.900, floor:0.888, ceil:0.950, ovrScale:0.92};
}

function getLeagueGoalieLeaderMinGp(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  var g=L.games||68;
  if(leagueKey==='PHL') return Math.max(22, Math.round(g*0.30));
  if(L.tier==='pro') return Math.max(14, Math.round(g*0.24));
  if(L.tier==='minor') return Math.max(12, Math.round(g*0.22));
  if(L.tier==='junior'||L.tier==='college') return Math.max(8, Math.round(g*0.16));
  return Math.max(10, Math.round(g*0.20));
}

function getPosScoringMult(pos, arch, leagueKey){
  if(pos==='F') return 1;
  var lk=leagueKey||'';
  if(pos==='D'){
    if(arch==='OffensiveD') return (lk==='PHL'||lk==='PWL')?1.38:(lk==='OJL'||lk==='CWHL'||lk==='WJL'||lk==='NAML')?1.02:
      (lk==='ARJC'||lk==='NEJC'||lk==='CEJC'||lk==='EWJC'||lk==='AWJC')?1.18:1.12;
    if(arch==='TwoWayD') return (lk==='PHL'||lk==='PWL')?0.88:0.78;
    if(arch==='StayAtHome'||arch==='ShutdownD') return (lk==='PHL'||lk==='PWL')?0.58:0.48;
    return 0.52;
  }
  return 0.15;
}

function getPosPlusMinusMult(pos, arch){
  if(pos==='D'){
    if(arch==='StayAtHome'||arch==='ShutdownD') return 1.28;
    if(arch==='TwoWayD') return 1.05;
    if(arch==='OffensiveD') return 0.88;
    return 1.0;
  }
  if(pos==='F'){
    if(arch==='TwoWay') return 0.38;
    if(arch==='Grinder') return 0.32;
    return 0.26;
  }
  return 0.22;
}

function simWeeklyStatBlock(player, leagueKey, games){
  if(!games||games<=0) return null;
  var prof=getLeagueScoringProfile(leagueKey);
  var perf=getOvrPerformanceMult(player, leagueKey);
  var arch=getArchetypeStatMods(player.arch, player.pos);
  var line=getDepthLineFromSlot(player.depthSlot, player.pos);
  if(player.pos==='G'){
    var gKnobs=getLeagueGoalieSimKnobs(leagueKey, player.team);
    var sa=0, sv=0, ga=0, w=0, gi, shots, svPct, svR;
    var gPerf=getOvrPerformanceMult(player, leagueKey)*gKnobs.ovrScale;
    for(gi=0;gi<games;gi++){
      shots=Math.round(rd(24, 36));
      svPct=cl(gKnobs.base+gPerf*0.018+rd(-0.020,0.014), gKnobs.floor, gKnobs.ceil);
      svR=Math.round(shots*svPct);
      sa+=shots; sv+=svR; ga+=shots-svR;
      if(Math.random()<cl(0.28+gPerf*0.10+rd(-0.06,0.06),0.12,0.68)) w++;
    }
    return {gp:games,g:0,a:0,pts:0,pm:0,pim:0,sv:sv,ga:ga,w:w};
  }
  var targetPpg=getNpcTargetPpg(player, leagueKey);
    var paceKnobs=typeof getLeaguePaceKnobsForLeague==='function'?getLeaguePaceKnobsForLeague(leagueKey):{nightCapF:3,nightCapD:2};
  var nightPtsCap=player.pos==='D'?paceKnobs.nightCapD:paceKnobs.nightCapF;
  if(leagueKey==='PHL'&&player.pos==='F'){
    if(typeof isPhlGenerationalSniper==='function'&&isPhlGenerationalSniper(player, line, perf)) nightPtsCap=4;
    else if(typeof isPhlEliteSniper==='function'&&isPhlEliteSniper(player, line, perf)) nightPtsCap=3;
    else if(typeof isPhlGenerationalPlaymaker==='function'&&isPhlGenerationalPlaymaker(player, line, perf)) nightPtsCap=4;
    else if(typeof isPhlElitePlaymaker==='function'&&isPhlElitePlaymaker(player, line, perf)) nightPtsCap=3;
    else nightPtsCap=Math.min(nightPtsCap,3);
  } else if(leagueKey==='PHL'&&player.pos==='D'&&player.arch==='OffensiveD'){
    if(typeof isPhlGenerationalOffensiveD==='function'&&isPhlGenerationalOffensiveD(player, line, perf)) nightPtsCap=4;
    else if(typeof isPhlEliteOffensiveD==='function'&&isPhlEliteOffensiveD(player, line, perf)) nightPtsCap=3;
    else nightPtsCap=Math.min(nightPtsCap,3);
  }
  var g=0, a=0, pts=0, pim=0, pm=0, gi;
  for(gi=0;gi<games;gi++){
    var nightG=0, nightA=0;
    if(leagueKey==='PHL'&&player.pos==='F'){
      var phlSplit=splitPhlForwardNight(player,line,perf,leagueKey,nightPtsCap);
      nightG=phlSplit.g; nightA=phlSplit.a;
      g+=nightG; a+=nightA;
    } else if(leagueKey==='PHL'&&player.pos==='D'&&player.arch==='OffensiveD'&&line<=2){
      var odSplit=splitPhlOffensiveDNight(player,line,perf,leagueKey,targetPpg,nightPtsCap);
      nightG=odSplit.g; nightA=odSplit.a;
      g+=nightG; a+=nightA;
    } else if(leagueKey==='PHL'&&player.pos==='D'&&(player.arch==='TwoWayD'||player.arch==='StayAtHome'||player.arch==='ShutdownD')&&typeof isPhlDualThreatDefenseman==='function'&&isPhlDualThreatDefenseman(player,line,perf)){
      var dtPts=Math.max(0, Math.min(3, Math.round(targetPpg*rd(0.82,1.28))));
      if(dtPts>0){
        var dtGWt=player.arch==='TwoWayD'?0.38:(player.arch==='StayAtHome'?0.32:0.28);
        var dtSplit=typeof splitGoalsAssistsFromPoints==='function'?splitGoalsAssistsFromPoints(dtPts, dtGWt):{g:0,a:dtPts};
        dtSplit=ensurePhlDualThreatSplit(dtSplit, player, dtPts);
        g+=dtSplit.g; a+=dtSplit.a;
      }
    } else {
    var expPts=targetPpg*rd(0.82,1.22);
    if(Math.random()<0.16) expPts+=rd(0.35,1.05);
    if(line===1&&perf>=0.94&&player.arch==='Sniper'&&Math.random()<(leagueKey==='PHL'&&typeof isPhlGenerationalSniper==='function'&&isPhlGenerationalSniper(player,line,perf)?0.2:0.12)) expPts+=1;
    var nightPts=Math.max(0, Math.min(nightPtsCap, Math.round(expPts)));
    if(nightPts>0){
      var gWt=typeof getArchetypeGoalPointShare==='function'
        ?getArchetypeGoalPointShare(player.arch, player.pos, {line:line, perf:perf, leagueKey:leagueKey})
        :(typeof getLeagueGoalPointShare==='function'?getLeagueGoalPointShare(leagueKey):(typeof getDefaultGoalPointShare==='function'?getDefaultGoalPointShare():0.323));
      if(player.arch==='Sniper'&&line===1&&nightPts>=2){
        var snCap=(typeof isLocalLeague==='function'&&isLocalLeague(leagueKey))?0.68:(leagueKey==='PHL'||leagueKey==='PWL'?0.52:0.44);
        if(leagueKey==='PHL'&&typeof isPhlGenerationalSniper==='function'&&isPhlGenerationalSniper(player,line,perf)) snCap=0.62;
        else if(leagueKey==='PHL'&&typeof isPhlEliteSniper==='function'&&isPhlEliteSniper(player,line,perf)) snCap=0.56;
        gWt=cl(gWt+0.12, 0.48, snCap);
      }
      var split=typeof splitGoalsAssistsFromPoints==='function'?splitGoalsAssistsFromPoints(nightPts, gWt):{g:nightPts,a:0};
      nightG=split.g; nightA=split.a;
      if(player.pos==='D'&&player.arch==='OffensiveD'&&nightA>nightG+1&&nightG+nightA>=2) nightG=Math.min(nightPtsCap, nightG+1);
      if(player.pos==='D'&&(player.arch==='TwoWayD'||player.arch==='StayAtHome')&&nightPts>=1&&nightG===0&&Math.random()<0.28) nightG=1;
      g+=nightG; a+=nightA;
    }
    }
    if(Math.random()<0.16*arch.pim) pim+=ri(0,2);
    if(typeof rollSkaterGamePim==='function') pim+=rollSkaterGamePim(player.pos, player.arch, null);
    var depthPm=line===1?1:(line===2?0.78:(line===3?0.52:0.28));
    var teamPm=getTeamOffenseFactor(leagueKey, player.team);
    var ovrN=player.ovr||50;
    var winChance=cl(0.44+(teamPm-1)*0.18+(perf-0.85)*0.12,0.28,0.62);
    if(player.pos==='D'&&line<=2&&ovrN>=88) winChance+=0.05;
    else if(player.pos==='D'&&line===1&&(player.arch==='ShutdownD'||player.arch==='StayAtHome'||player.arch==='TwoWayD')&&ovrN>=84) winChance+=0.03;
    if(player.pos==='F'&&ovrN<80&&line>=3) winChance-=0.03;
    var nightWon=Math.random()<winChance;
    var nightTied=!nightWon&&Math.random()<0.07;
    if(typeof computeSkaterGamePlusMinus==='function'&&player.pos!=='G'){
      var nightPm=computeSkaterGamePlusMinus(nightWon, nightTied, nightG, nightA, nightG+nightA>0?1:0, player.pos, player.arch, 0);
      if(!nightWon&&!nightTied&&nightPm===0) nightPm=-1;
    if(player.pos==='D'){
        var dQual=cl((ovrN-68)/28,0,1)*cl(line<=2?1:0.55,0.35,1);
        nightPm=Math.round(nightPm*(0.82+dQual*0.55));
        if(line===1&&ovrN>=88) nightPm+=(nightWon?1:(nightTied?0:-1));
        if(line===1&&(player.arch==='ShutdownD'||player.arch==='StayAtHome'||player.arch==='TwoWayD')&&ovrN>=84) nightPm+=(nightWon?1:(nightTied?0:-1));
        else if(line===1&&player.arch==='OffensiveD'&&ovrN>=90) nightPm+=(nightWon?1:0);
      } else if(player.pos==='F') nightPm=Math.round(nightPm*0.58);
      pm+=Math.round(nightPm*depthPm);
    } else {
      var pmSign=nightWon?1:(nightTied?0:-1);
      var pmMag=rd(0.35,1.05)*depthPm*getPosPlusMinusMult(player.pos, player.arch);
      pm+=Math.round(pmSign*pmMag);
    }
  }
  pts=g+a;
  return {gp:games,g:g,a:a,pts:pts,pm:pm,pim:pim,sv:0,ga:0,w:0};
}

function accumulatePlayerStats(p, block){
  if(!block) return;
  if(G&&G.season) p._statsSeason=G.season;
  var s=ensurePlayerStats(p);
  s.gp+=block.gp; s.g+=block.g; s.a+=block.a; s.pts+=block.pts;
  s.pm+=block.pm; s.pim=(s.pim||0)+block.pim;
  s.sv=(s.sv||0)+block.sv; s.ga=(s.ga||0)+block.ga; s.w=(s.w||0)+block.w;
}

function updateNpcFormFromWeek(p, block, leagueKey){
  if(!block||p.isMe) return;
  var line=getDepthLineFromSlot(p.depthSlot, p.pos);
  var expected=getNpcTargetPpg(p, leagueKey)*(block.gp||0);
  var delta=(block.pts-expected)*3.8+(block.pm||0)*0.32;
  var cur=p.form||50;
  p.form=cl(cur+delta+rd(-6,6)+(50-cur)*0.14, 12, 96);
}

function developNpcRoster(players, leagueKey){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  var floor=getLeagueOvrFloor(leagueKey);
  var cap=getLeagueOvrCap(leagueKey);
  var established=isEstablishedProLeague(leagueKey);
  players.forEach(function(p){
    if(p.isMe) return;
    var st=ensurePlayerStats(p);
    var ppg=st.gp>0?st.pts/st.gp:0;
    if(tier==='junior'&&p.age<=(typeof getJuniorMaxAge==='function'?getJuniorMaxAge():19)){
      if(st.gp>=10&&ppg>=1.05&&Math.random()<0.34) p.ovr=cl(p.ovr+1, floor, cap);
      else if(st.gp>=8&&ppg>=0.78&&(p.form||50)>=56&&Math.random()<0.26) p.ovr=cl(p.ovr+1, floor, cap);
      else if(st.gp>=12&&ppg<0.22&&Math.random()<0.2) p.ovr=cl(p.ovr-1, floor, cap);
      else if((p.form||50)>=58&&Math.random()<0.18) p.ovr=cl(p.ovr+1, floor, cap);
      else if((p.form||50)<38&&Math.random()<0.12) p.ovr=cl(p.ovr-1, floor, cap);
    } else if(established){
      var ceiling=p.ovrCeiling!=null?p.ovrCeiling:cap;
      var dev=p.devRate!=null?p.devRate:(isEliteProLeagueKey(leagueKey)?0.1:0.18);
      var upChance=0.24*dev;
      if(isEliteProLeagueKey(leagueKey)) upChance=Math.min(0.14, upChance);
      if((p.ovr||0)>=ceiling) upChance*=0.15;
      else if(p.age<=26) upChance*=1.15;
      if(p.age<=27&&st.gp>=16&&ppg>=0.82&&Math.random()<upChance) p.ovr=cl(p.ovr+1, floor, ceiling);
      else if(p.age<=27&&st.gp>=12&&ppg>=0.62&&(p.form||50)>=56&&Math.random()<upChance*0.75) p.ovr=cl(p.ovr+1, floor, ceiling);
      else if(p.age<=30&&st.gp>=20&&ppg>=0.55&&Math.random()<upChance*0.58) p.ovr=cl(p.ovr+1, floor, ceiling);
      else if((p.form||50)>=60&&p.age<=32&&(p.ovr||0)<ceiling&&Math.random()<upChance*0.45) p.ovr=cl(p.ovr+1, floor, ceiling);
      else if(st.gp>=18&&ppg<0.18&&p.age>=27&&Math.random()<0.14) p.ovr=cl(p.ovr-1, floor, cap);
      else if(p.age>=35&&Math.random()<0.28) p.ovr=cl(p.ovr-1, floor, cap);
      else if(p.age>=32&&Math.random()<0.16) p.ovr=cl(p.ovr-1, floor, cap);
      else if(p.age>=30&&st.gp>=14&&ppg<0.22&&Math.random()<0.12) p.ovr=cl(p.ovr-1, floor, cap);
    } else if(p.age<=24&&st.gp>=12&&ppg>=0.55&&Math.random()<0.14) p.ovr=cl(p.ovr+1, floor, cap);
    else if(p.age<=24&&Math.random()<0.08) p.ovr=cl(p.ovr+1, floor, cap);
    else if(p.age>=31&&Math.random()<0.14) p.ovr=cl(p.ovr-1, floor, cap);
  });
  if(isEliteProLeagueKey(leagueKey)) clampEliteProRosterOvrSpread(players, leagueKey);
  if(isMinorProLeagueKey(leagueKey)) clampMinorProRosterOvrSpread(players, leagueKey);
}

function maybeShuffleAlternates(players, leagueKey){
  if(isEstablishedProLeague(leagueKey)){
    if(Math.random()>0.06) return;
  } else if(Math.random()>0.22) return;
  var alts=players.filter(function(p){return !p.isMe&&p.leadership==='A';});
  if(alts.length<2) return;
  if(Math.random()<0.5){
    var pool=players.filter(function(p){return !p.isMe&&p.leadership!=='C';});
    pool.sort(function(a,b){return b.ovr-a.ovr;});
    alts.forEach(function(p){ p.leadership=''; });
    if(pool[0]) pool[0].leadership='A';
    if(pool[1]) pool[1].leadership='A';
  }
}

function advanceRosterOneWeek(roster, leagueKey, weekNum){
  if(!roster||!roster.players) return;
  var established=isEstablishedProLeague(leagueKey);
  if(roster._depthLocked) assignDepthChartSticky(roster);
  else assignDepthChart(roster);
  var perWeek=getGamesPerWeek(leagueKey);
  var weekGameCap=perWeek;
  if(typeof isLocalLeague==='function'&&isLocalLeague(leagueKey)&&typeof getLocalGamesForWeek==='function'){
    weekGameCap=getLocalGamesForWeek(weekNum||1);
  }
  var usndtGpCap=(leagueKey==='USJL'&&roster.teamName&&typeof getUsndtNpcLeagueGpCap==='function')
    ?getUsndtNpcLeagueGpCap(roster.teamName):null;
  var pi, p, line, games, block;
  for(pi=0;pi<roster.players.length;pi++){
    p=roster.players[pi];
    if(p.isMe) continue;
    if(!p.injured&&Math.random()<(established?0.009:0.007)){
      p.injured=true;
      p.injWks=ri(1,3);
    }
    line=getDepthLineFromSlot(p.depthSlot, p.pos);
    games=rollWeeklyGames(weekGameCap, line, p.pos, p);
    if(usndtGpCap!=null){
      var curGp=ensurePlayerStats(p).gp||0;
      if(curGp>=usndtGpCap) continue;
      games=Math.min(games, usndtGpCap-curGp);
    }
    if(games<1) continue;
    block=simWeeklyStatBlock(p, leagueKey, games);
    accumulatePlayerStats(p, block);
    if(typeof clampUsndtPlayerSeasonStatsInPlace==='function') clampUsndtPlayerSeasonStatsInPlace(p, leagueKey);
    updateNpcFormFromWeek(p, block, leagueKey);
  }
  developNpcRoster(roster.players, leagueKey);
  maybeShuffleAlternates(roster.players, leagueKey);
  if(!established){
    if(roster._depthLocked) assignDepthChartSticky(roster);
    else assignDepthChart(roster);
  } else if(Math.random()<0.08){
    roster._depthLocked=false;
    assignDepthChart(roster, {forceRebuild:true});
  } else {
    assignDepthChart(roster);
    maybeProDepthAdjust(roster);
    stampProRoleLabels(roster);
  }
}

function resetLeagueNpcSeasonStats(leagueKey){
  var teams=TEAMS[leagueKey]||[], t, roster, pi, p;
  for(t=0;t<teams.length;t++){
    roster=getLeagueTeamRoster(leagueKey, teams[t].n);
    if(!roster||!roster.players) continue;
    for(pi=0;pi<roster.players.length;pi++){
      p=roster.players[pi];
      if(p.isMe) continue;
      if((p.seasonStats&&((p.seasonStats.gp||0)>0||(p.seasonStats.pts||0)>0))){
        mergeSeasonIntoCareerLeagueStats(p, leagueKey);
      }
      p.seasonStats=emptyPlayerStats();
      p._statsSeason=G?G.season:1;
    }
    G.leagueRostersCache[rosterCacheKey(leagueKey, teams[t].n)]=roster;
  }
}

function catchUpLeagueNpcStats(){
  if(!G||!G.leagueKey) return;
  var target=Math.max(0, (G.week||1)-1);
  if(typeof G._npcStatsSyncedWeek!=='number') G._npcStatsSyncedWeek=0;
  var teams=TEAMS[G.leagueKey]||[];
  if(typeof isLocalLeague==='function'&&isLocalLeague(G.leagueKey)&&teams.length&&typeof countLocalGamesThroughWeek==='function'){
    var syncWk=G._npcStatsSyncedWeek||0;
    var expected=countLocalGamesThroughWeek(syncWk);
    var probe=getLeagueTeamRoster(G.leagueKey, teams[0].n);
    var probeP=null, pi;
    if(probe&&probe.players){
      for(pi=0;pi<probe.players.length;pi++){
        if(!probe.players[pi].isMe&&getDepthLineFromSlot(probe.players[pi].depthSlot, probe.players[pi].pos)<=2){
          probeP=probe.players[pi];
          break;
        }
      }
    }
    if(probeP&&(ensurePlayerStats(probeP).gp||0)>expected+2){
      resetLeagueNpcSeasonStats(G.leagueKey);
      G._npcStatsSyncedWeek=0;
    }
  }
  if(G._npcStatsSyncedWeek>=target) return;
  var t, roster;
  while(G._npcStatsSyncedWeek<target){
    var simWeek=G._npcStatsSyncedWeek+1;
    for(t=0;t<teams.length;t++){
      roster=getLeagueTeamRoster(G.leagueKey, teams[t].n);
      advanceRosterOneWeek(roster, G.leagueKey, simWeek);
      G.leagueRostersCache[rosterCacheKey(G.leagueKey, teams[t].n)]=roster;
    }
    G._npcStatsSyncedWeek++;
  }
  G._leagueStatsKey=null;
}

function playerToStatRow(player, leagueKey){
  var view=G&&G._leadersViewMode;
  var mode=typeof isCareerLeadersViewMode==='function'&&isCareerLeadersViewMode(view)?'career':'season';
  if(player.isMe){
    if(mode==='career'){
      var cs=emptyPlayerStats();
      if(G.careerLeagueStats&&G.careerLeagueStats[leagueKey]) copyStatBlock(cs, G.careerLeagueStats[leagueKey]);
      cs.gp+=G.gp||0; cs.g+=G.goals||0; cs.a+=G.assists||0; cs.pts+=(G.goals||0)+(G.assists||0);
      cs.pm+=G.plusminus||0; cs.pim=(cs.pim||0)+(G.pim||0);
      cs.sv=(cs.sv||0)+(G.saves||0); cs.ga=(cs.ga||0)+(G.goalsAgainst||0); cs.w=(cs.w||0)+(G.w||0);
      return {gp:cs.gp,g:cs.g,a:cs.a,pts:cs.pts,pm:cs.pm,pim:cs.pim,sv:cs.sv,ga:cs.ga,w:cs.w,player:player};
    }
    return {
      gp:G.gp||0, g:G.goals||0, a:G.assists||0, pts:(G.goals||0)+(G.assists||0),
      pm:G.plusminus||0, pim:G.pim||0, sv:G.saves||0, ga:G.goalsAgainst||0, w:G.w||0,
      player:player
    };
  }
  healPlayerSeasonStats(player, leagueKey);
  if(typeof clampUsndtPlayerSeasonStatsInPlace==='function') clampUsndtPlayerSeasonStatsInPlace(player, leagueKey);
  var s=mode==='career'?getCombinedCareerLeagueStats(player, leagueKey):ensurePlayerStats(player);
  return {gp:s.gp,g:s.g,a:s.a,pts:s.pts,pm:s.pm,pim:s.pim||0,sv:s.sv||0,ga:s.ga||0,w:s.w||0,player:player};
}

function synthPlayerSeasonStats(player, leagueKey, progress){
  catchUpLeagueNpcStats();
  return playerToStatRow(player, leagueKey);
}

function buildLeaguePlayerStats(leagueKey){
  catchUpLeagueNpcStats();
  var teams=TEAMS[leagueKey]||[];
  var rows=[], t, p, roster, pi, seenMe=false;
  ensureTeamRoster();
  for(t=0;t<teams.length;t++){
    roster=getLeagueTeamRoster(leagueKey, teams[t].n);
    seedRosterPriorCareerStats(roster);
    for(pi=0;pi<roster.players.length;pi++){
      p=roster.players[pi];
      if(p.isMe){
        if(seenMe||!G.team||teams[t].n!==G.team.n) continue;
        seenMe=true;
      }
      rows.push(playerToStatRow(p, leagueKey));
    }
  }
  var view=G&&G._leadersViewMode;
  if(typeof mergeCareerLeaderRows==='function'&&typeof isCareerLeadersViewMode==='function'&&isCareerLeadersViewMode(view)){
    rows=mergeCareerLeaderRows(rows, leagueKey, {
      includeRetired:view==='career_all'||view==='career',
      activeOnly:view==='career_active'
    });
  }
  return rows;
}

function ensureLeaguePlayerStats(){
  if(!G) return [];
  var viewMode=G._leadersViewMode||'live';
  var key=(G.leagueKey||'')+'_'+(G.season||1)+'_'+(G.week||1)+'_'+(G.gp||0)+'_'+viewMode;
  if(viewMode==='archive'&&G._leadersArchiveIdx!=null) return getArchivedLeagueStatsRows();
  if(G._leagueStatsKey===key&&G.leaguePlayerStats) return G.leaguePlayerStats;
  G.leaguePlayerStats=buildLeaguePlayerStats(G.leagueKey);
  G._leagueStatsKey=key;
  return G.leaguePlayerStats;
}

function getFinalLeaguePlayerStats(){
  if(!G||!G.leagueKey) return [];
  if(typeof isLocalLeague==='function'&&isLocalLeague(G.leagueKey)){
    if(typeof ensureLeaguePlayerStats==='function') return ensureLeaguePlayerStats();
    return [];
  }
  var totalWeeks=typeof getSeasonWeekCount==='function'
    ? getSeasonWeekCount(G.leagueKey)
    : Math.ceil((G.league.games||68)/Math.max(1,getGamesPerWeek(G.leagueKey)));
  var teams=TEAMS[G.leagueKey]||[];
  var t, roster, simWeek;
  while((G._npcStatsSyncedWeek||0)<totalWeeks){
    simWeek=(G._npcStatsSyncedWeek||0)+1;
    for(t=0;t<teams.length;t++){
      roster=getLeagueTeamRoster(G.leagueKey, teams[t].n);
      advanceRosterOneWeek(roster, G.leagueKey, simWeek);
      G.leagueRostersCache[rosterCacheKey(G.leagueKey, teams[t].n)]=roster;
    }
    G._npcStatsSyncedWeek=(G._npcStatsSyncedWeek||0)+1;
  }
  return buildLeaguePlayerStats(G.leagueKey);
}

function serializeStatRow(r){
  var p=r.player||{};
  return {
    gp:r.gp, g:r.g, a:r.a, pts:r.pts, pm:r.pm, pim:r.pim||0, sv:r.sv, ga:r.ga, w:r.w,
    first:p.first, last:p.last, pos:p.pos, pref:p.pref||p.pos, hand:p.hand||'',
    ovr:p.ovr, team:p.team, isMe:!!p.isMe, leadership:p.leadership||'',
    alumniFrom:p.alumniFrom||'', juniorMate:!!p.juniorMate
  };
}

function snapshotJuniorTeammates(){
  if(!G||!G.league||G.league.tier!=='junior') return;
  var roster=ensureTeamRoster();
  if(!roster) return;
  var existing={};
  (G.juniorTeammateIds||[]).forEach(function(m){ existing[m.id]=m; });
  G.juniorTeammateIds=[];
  roster.players.filter(function(p){return !p.isMe;}).forEach(function(p){
    if(p.age>getJuniorMaxAge()) return;
    var prev=existing[p.id];
    G.juniorTeammateIds.push({
      id:p.id, first:p.first, last:p.last, pos:p.pos,
      pref:p.pref||p.pos, hand:p.hand, age:p.age,
      arch:p.arch, ovr:p.ovr,
      promoted:prev?!!prev.promoted:false
    });
  });
}

function registerLeagueAlumni(){
  if(!G||!G.league) return;
  var tier=G.league.tier;
  if(tier!=='junior'&&tier!=='college') return;
  var rows=getFinalLeaguePlayerStats();
  if(!G.leagueAlumni) G.leagueAlumni=[];
  var seen={}, i;
  G.leagueAlumni.forEach(function(a){ seen[a.id||a.first+a.last]=true; });
  var gender=G.league.gender||(G.gender||'M');
  var candidates=rows.filter(function(r){
    if(r.player.isMe) return false;
    if(r.player.proProspect) return true;
    return r.pts>=Math.max(20, Math.round((getLeagueScoringProfile(G.leagueKey).ptsLeader||50)*0.42));
  });
  candidates.sort(function(a,b){return b.pts-a.pts;});
  var added=0;
  for(i=0;i<candidates.length&&added<12;i++){
    var pl=candidates[i].player;
    var key=pl.id||pl.first+pl.last;
    if(seen[key]) continue;
    G.leagueAlumni.push({
      id:pl.id, first:pl.first, last:pl.last, pos:pl.pos, pref:pl.pref||pl.pos,
      hand:pl.hand, age:pl.age, arch:pl.arch, ovr:pl.ovr,
      proProspect:!!pl.proProspect, fromLeague:G.leagueKey,
      gender:gender, pts:candidates[i].pts, used:false
    });
    seen[key]=true;
    added++;
  }
}

function getArchivedLeagueStatsRows(){
  if(!G.leagueStatsArchive||G._leadersArchiveIdx==null) return [];
  var snap=G.leagueStatsArchive[G._leadersArchiveIdx];
  if(!snap||!snap.rows) return [];
  return snap.rows.map(function(r){
    return {
      gp:r.gp, g:r.g, a:r.a, pts:r.pts, pm:r.pm, pim:r.pim||0, sv:r.sv, ga:r.ga, w:r.w,
      player:{
        first:r.first, last:r.last, pos:r.pos, pref:r.pref||r.pos, hand:r.hand||'',
        ovr:r.ovr, team:r.team, isMe:!!r.isMe, leadership:r.leadership||'',
        alumniFrom:r.alumniFrom||'', juniorMate:!!r.juniorMate
      }
    };
  });
}

function renderLeadersControls(){
  var el=safeEl('hub-leaders-controls');
  if(!el||!G) return;
  var stat=G._leadersFilter||'pts';
  var posF=G._leadersPosFilter||'all';
  var view=G._leadersViewMode||'live';
  var goalieView=posF==='G';
  var html='<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-family:VT323,monospace;font-size:14px">';
  html+='<span style="color:var(--mut);margin-right:4px">SORT:</span>';
  if(goalieView){
    [{id:'svpct',lbl:'SV%'},{id:'gaa',lbl:'GAA'},{id:'w',lbl:'W'},{id:'sv',lbl:'SV'},{id:'ga',lbl:'GA'}].forEach(function(s){
      html+='<button type="button" class="btn '+(stat===s.id?'bp':'bs')+'" style="padding:4px 10px;font-size:13px" onclick="setLeadersFilter(\''+s.id+'\')">'+s.lbl+'</button>';
    });
  } else {
    ['pts','g','a','pm','pim'].forEach(function(s){
      html+='<button type="button" class="btn '+(stat===s?'bp':'bs')+'" style="padding:4px 10px;font-size:13px" onclick="setLeadersFilter(\''+s+'\')">'+s.toUpperCase()+'</button>';
    });
  }
  html+='<span style="color:var(--mut);margin:0 4px 0 10px">POS:</span>';
  ['all','F','D','G'].forEach(function(p){
    html+='<button type="button" class="btn '+(posF===p?'bp':'bs')+'" style="padding:4px 10px;font-size:13px" onclick="setLeadersPosFilter(\''+p+'\')">'+p+'</button>';
  });
  html+='<button type="button" class="btn bg2 bw" style="margin-left:10px;padding:4px 12px;font-size:13px" onclick="pinLeagueStatsSnapshot()">PIN SNAPSHOT</button>';
  html+='<select class="btn bs" style="margin-left:6px;padding:4px 8px;font-size:13px" onchange="setLeadersArchiveView(this.value)" title="This season = current year only. All-time = career totals in this league.">';
  html+='<option value="live"'+(view==='live'?' selected':'')+'>THIS SEASON ONLY</option>';
  html+='<option value="career_active"'+(view==='career_active'?' selected':'')+'>ALL-TIME ACTIVE</option>';
  html+='<option value="career_all"'+(view==='career_all'||view==='career'?' selected':'')+'>ALL-TIME (+ LEGENDS)</option>';
  if(G.leagueStatsArchive&&G.leagueStatsArchive.length){
    G.leagueStatsArchive.forEach(function(snap, idx){
      var lbl='S'+snap.season+' '+snap.leagueShort+' ('+(snap.statFilter||'pts').toUpperCase()+')';
      html+='<option value="'+idx+'"'+(view==='archive'&&G._leadersArchiveIdx===idx?' selected':'')+'>'+escHtml(lbl)+'</option>';
    });
  }
  html+='</select></div>';
  el.innerHTML=html;
}

function setLeadersFilter(stat){
  if(!G) return;
  G._leadersFilter=stat;
  G._leagueStatsKey=null;
  renderLeadersControls();
  renderLeagueLeadersTab();
}

function setLeadersPosFilter(pos){
  if(!G) return;
  var skaterStats=['pts','g','a','pm','pim'];
  var goalieStats=['svpct','gaa','w','sv','ga'];
  if(pos==='G'&&skaterStats.indexOf(G._leadersFilter||'pts')>=0) G._leadersFilter='svpct';
  if(pos!=='G'&&goalieStats.indexOf(G._leadersFilter||'')>=0) G._leadersFilter='pts';
  G._leadersPosFilter=pos;
  renderLeadersControls();
  renderLeagueLeadersTab();
}

function setLeadersArchiveView(val){
  if(!G) return;
  if(val==='live'){
    G._leadersViewMode='live';
    G._leadersArchiveIdx=null;
  } else if(val==='career_active'){
    G._leadersViewMode='career_active';
    G._leadersArchiveIdx=null;
  } else if(val==='career_all'||val==='career'){
    G._leadersViewMode='career_all';
    G._leadersArchiveIdx=null;
  } else {
    G._leadersViewMode='archive';
    G._leadersArchiveIdx=parseInt(val,10);
  }
  G._leagueStatsKey=null;
  renderLeadersControls();
  renderLeagueLeadersTab();
}

function pinLeagueStatsSnapshot(){
  if(!G) return;
  if(!G.leagueStatsArchive) G.leagueStatsArchive=[];
  var rows=buildLeaguePlayerStats(G.leagueKey);
  G.leagueStatsArchive.push({
    season:G.season, leagueKey:G.leagueKey, leagueShort:G.league.short,
    week:G.week, gp:G.gp, statFilter:G._leadersFilter||'pts',
    posFilter:G._leadersPosFilter||'all', savedAt:Date.now(),
    rows:rows.map(serializeStatRow)
  });
  if(G.leagueStatsArchive.length>24) G.leagueStatsArchive.shift();
  notify('Leaders snapshot saved','good');
  renderLeadersControls();
}

function maybeRefreshLinesAfterUserGame(){
  if(!G||!G.teamRoster) return;
  var roster=G.teamRoster, lk=G.leagueKey||'';
  if(roster._depthChartGp===G.gp&&roster._depthChartWeek===G.week) return;
  roster._depthChartGp=G.gp;
  roster._depthChartWeek=G.week;
  if(isEstablishedProLeague(lk)){
    if(Math.random()<0.28) maybeProDepthAdjust(roster);
    else assignDepthChartSticky(roster);
  } else if(Math.random()<0.14){
    assignDepthChart(roster);
  }
  if(G.leagueRostersCache&&roster.teamName) G.leagueRostersCache[rosterCacheKey(lk, roster.teamName)]=roster;
}

function maybeRefreshLinesAfterWeek(){
  if(!G||!G.teamRoster) return;
  var roster=G.teamRoster, lk=G.leagueKey||'';
  roster._depthChartGp=G.gp;
  roster._depthChartWeek=G.week;
  if(isEstablishedProLeague(lk)){
    if(Math.random()<0.32) maybeProDepthAdjust(roster);
    else if(roster._depthLocked) assignDepthChartSticky(roster);
    else assignDepthChart(roster);
  } else if(Math.random()<0.22){
    assignDepthChart(roster);
  }
  if(G.leagueRostersCache&&roster.teamName) G.leagueRostersCache[rosterCacheKey(lk, roster.teamName)]=roster;
}

function refreshHubDepthChartForDisplay(roster){
  if(!roster||!roster.players) return;
  syncUserPlayerIntoRoster(roster);
  if(!roster.depth||!roster._depthLocked) assignDepthChart(roster);
  else assignDepthChartSticky(roster);
  if(typeof assignHealthyScratches==='function'&&roster.depth) assignHealthyScratches(roster, roster.depth);
  stampProRoleLabels(roster);
  if(typeof G!=='undefined'&&G&&G.leagueRostersCache&&roster.teamName){
    G.leagueRostersCache[rosterCacheKey(roster.leagueKey||(G.leagueKey||''), roster.teamName)]=roster;
  }
}

function renderDepthChartTab(){
  var el=safeEl('hub-depth-chart');
  if(!el) return;
  var roster=ensureTeamRoster();
  if(!roster){ el.innerHTML='<div class="vt" style="color:var(--mut)">NO ROSTER DATA</div>'; return; }
  refreshHubDepthChartForDisplay(roster);
  var coach=roster.coach||{name:'Staff', style:'balanced'};
  var progress=getSeasonProgressFraction();
  var gpMap={};
  roster.players.forEach(function(pl){
    var st=synthPlayerSeasonStats(pl, G.leagueKey, progress);
    gpMap[pl.id||pl.first+pl.last]=st;
  });
  var html='<div class="vt" style="font-size:13px;color:var(--mut);margin-bottom:10px;line-height:1.5">'+
    '<span style="color:var(--gold)">HEAD COACH:</span> '+escHtml(coach.name)+' &nbsp;·&nbsp; '+escHtml(String(coach.style).toUpperCase());
  html+=' &nbsp;·&nbsp; <span style="color:var(--wht)">12F + 6D dress · 2F + 1D scratch (lowest rated / coldest)</span>';
  if(isEstablishedProLeague(G.leagueKey)){
    html+=' &nbsp;·&nbsp; <span style="color:#c9a84c">Lines stick until the next game or week</span>';
  } else {
    html+=' &nbsp;·&nbsp; <span style="color:var(--acc)">Lines stick until the next game or week</span>';
  }
  html+='</div>';

  function leadTag(pl){
    if(pl.leadership==='C') return ' <span style="color:var(--gold)">[C]</span>';
    if(pl.leadership==='A') return ' <span style="color:var(--acc)">[A]</span>';
    return '';
  }

  function cell(slot, pl){
    if(!pl) return '<div style="padding:6px 8px;border:1px dashed rgba(122,184,224,.2);color:var(--mut);font-size:12px">'+slot+' — —</div>';
    var hi=pl.isMe?'border:1px solid var(--gold);background:rgba(232,200,92,.1)':'border:1px solid rgba(122,184,224,.2);background:rgba(12,26,36,.45)';
    var st=gpMap[pl.id||pl.first+pl.last];
    var statTxt=st?(st.gp+' GP · '+st.g+'G '+st.a+'A · '+st.pim+' PIM'):'0 GP';
    var roleTxt=pl.roleLabel?' · <span style="color:#c9a84c">'+escHtml(pl.roleLabel)+'</span>':'';
    return '<div style="padding:6px 8px;'+hi+'">'+
      '<div style="font-size:11px;color:var(--mut)">'+slot+'</div>'+
      '<div style="font-size:14px;color:'+(pl.isMe?'var(--gold)':'var(--wht)')+'">'+escHtml(pl.first+' '+pl.last)+(pl.isMe?' (YOU)':'')+leadTag(pl)+'</div>'+
      '<div style="font-size:11px;color:var(--acc)">'+archShortLabel(pl.arch)+roleTxt+' · '+pl.age+'y · OVR '+pl.ovr+' · '+pl.hand+' · Fm '+Math.round(pl.form||50)+' · '+statTxt+'</div></div>';
  }

  function specialCell(idx, pl){
    if(!pl) return '<div style="padding:6px 8px;border:1px dashed rgba(122,184,224,.2);color:var(--mut);font-size:12px">'+idx+' — —</div>';
    var hi=pl.isMe?'border:1px solid var(--gold);background:rgba(232,200,92,.1)':'border:1px solid rgba(122,184,224,.2);background:rgba(12,26,36,.45)';
    var st=gpMap[pl.id||pl.first+pl.last];
    var statTxt=st?(st.gp+' GP · '+st.g+'G '+st.a+'A'):'0 GP';
    var spot=pl.pref&&pl.pref!=='G'?pl.pref:pl.pos;
    var roleTxt=pl.roleLabel?' · <span style="color:#c9a84c">'+escHtml(pl.roleLabel)+'</span>':'';
    return '<div style="padding:6px 8px;'+hi+'">'+
      '<div style="font-size:11px;color:var(--mut)">'+idx+' · '+escHtml(spot)+'</div>'+
      '<div style="font-size:14px;color:'+(pl.isMe?'var(--gold)':'var(--wht)')+'">'+escHtml(pl.first+' '+pl.last)+(pl.isMe?' (YOU)':'')+leadTag(pl)+'</div>'+
      '<div style="font-size:11px;color:var(--acc)">'+archShortLabel(pl.arch)+roleTxt+' · OVR '+pl.ovr+' · '+statTxt+'</div></div>';
  }

  function renderSpecialRow(label, color, unit){
    var row='<div class="vt" style="font-size:12px;color:'+color+';margin:8px 0 4px">'+label+'</div>';
    row+='<div style="display:grid;grid-template-columns:repeat('+unit.length+',1fr);gap:6px;margin-bottom:12px">';
    for(var ui=0;ui<unit.length;ui++){
      row+=specialCell(String(ui+1), unit[ui].player);
    }
    row+='</div>';
    return row;
  }

  html+='<div class="vt" style="font-size:12px;color:var(--gold);margin:8px 0 4px">FORWARDS</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">';
  var d=roster.depth, i;
  if(!d||!d.pp1){ assignDepthChart(roster); d=roster.depth; }
  for(i=0;i<12;i++){
    var s=d.forwards[i];
    html+=cell(s.slot, s.player);
  }
  html+='</div>';
  html+='<div class="vt" style="font-size:12px;color:var(--gold);margin:8px 0 4px">DEFENSE</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:12px">';
  for(i=0;i<6;i++){
    s=d.defense[i];
    html+=cell(s.slot, s.player);
  }
  html+='</div>';
  if(d.scratchF&&d.scratchF.length){
    html+='<div class="vt" style="font-size:12px;color:var(--mut);margin:8px 0 4px">HEALTHY SCRATCHES (FORWARDS) — lowest OVR / form / production</div>';
    html+='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:12px">';
    for(i=0;i<d.scratchF.length;i++){
      s=d.scratchF[i];
      html+=cell(s.slot, s.player);
    }
    html+='</div>';
  }
  if(d.scratchD&&d.scratchD.length){
    html+='<div class="vt" style="font-size:12px;color:var(--mut);margin:8px 0 4px">HEALTHY SCRATCH (DEFENSE) — lowest OVR / form / production</div>';
    html+='<div style="display:grid;grid-template-columns:repeat(1,1fr);gap:6px;margin-bottom:12px">';
    for(i=0;i<d.scratchD.length;i++){
      s=d.scratchD[i];
      html+=cell(s.slot, s.player);
    }
    html+='</div>';
  }
  html+=renderSpecialRow('POWER PLAY 1','#7ad4ff',d.pp1);
  html+=renderSpecialRow('POWER PLAY 2','#7ad4ff',d.pp2);
  html+=renderSpecialRow('PENALTY KILL 1','#e8a85c',d.pk1);
  html+=renderSpecialRow('PENALTY KILL 2','#e8a85c',d.pk2);
  html+='<div class="vt" style="font-size:12px;color:var(--gold);margin:8px 0 4px">GOALIES</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">';
  for(i=0;i<2;i++){
    s=d.goalies[i];
    var lbl=s.slot==='G1'?'STARTER':'BACKUP';
    html+=cell(lbl, s.player);
  }
  html+='</div>';
  el.innerHTML=html;
}

function renderLeagueLeadersTab(){
  var el=safeEl('hub-league-leaders');
  if(!el) return;
  var rows=ensureLeaguePlayerStats();
  var archived=G._leadersViewMode==='archive';
  var careerView=typeof isCareerLeadersViewMode==='function'&&isCareerLeadersViewMode(G._leadersViewMode);
  var snap=archived&&G.leagueStatsArchive?G.leagueStatsArchive[G._leadersArchiveIdx]:null;
  var leagueLbl=snap?snap.leagueShort:(G.league&&G.league.short)||'';
  var stat=G._leadersFilter||'pts';
  var posF=G._leadersPosFilter||'all';
  var hasPlayed=archived||careerView||(G.gp||0)>0||(G._npcStatsSyncedWeek||0)>0;
  var html='';
  if(careerView){
    var lbl=typeof getCareerLeadersViewLabel==='function'?getCareerLeadersViewLabel(G._leadersViewMode, leagueLbl):('ALL-TIME · '+leagueLbl);
    html+='<div class="vt" style="font-size:13px;color:var(--gold);margin-bottom:10px">'+escHtml(lbl)+'</div>';
  } else if(archived&&snap){
    html='<div class="vt" style="font-size:13px;color:var(--gold);margin-bottom:10px">S'+snap.season+' · '+escHtml(leagueLbl)+' (saved snapshot)</div>';
  } else {
    html+='<div class="vt" style="font-size:13px;color:var(--gold);margin-bottom:10px">SEASON '+G.season+' · '+escHtml(leagueLbl)+' — this season only</div>';
  }
  if(!hasPlayed){
    el.innerHTML=html;
    return;
  }

  function playerLabel(p){
    var s='';
    if(p.legend||p.retired) s+=' <span style="color:var(--mut);font-size:11px">[RET]</span>';
    if(p.leadership==='C') s+=' <span style="color:var(--gold)">[C]</span>';
    else if(p.leadership==='A') s+=' <span style="color:var(--acc)">[A]</span>';
    if(p.isMe) s+=' *';
    return s;
  }

  function teamCell(p){
    if(p.legend||p.retired) return escHtml(p.era||'RET');
    return escHtml((p.team||'').split(' ').slice(-1)[0]);
  }

  function posLabel(p){
    return escHtml(p.pref&&p.pref!==p.pos?p.pref:p.pos);
  }

  function sortSkaters(list){
    if(stat==='g') return list.sort(function(a,b){return b.g-a.g||b.pts-a.pts;});
    if(stat==='a') return list.sort(function(a,b){return b.a-a.a||b.pts-a.pts;});
    if(stat==='pm'){
      return list.sort(function(a,b){
        if(b.pm!==a.pm) return b.pm-a.pm;
        if(a.player.pos==='D'&&b.player.pos!=='D') return -1;
        if(b.player.pos==='D'&&a.player.pos!=='D') return 1;
        return b.pts-a.pts;
      });
    }
    if(stat==='pim') return list.sort(function(a,b){return (b.pim||0)-(a.pim||0)||b.pts-a.pts;});
    return list.sort(function(a,b){return b.pts-a.pts;});
  }

  function sortGoalies(list){
    if(stat==='gaa'){
      return list.sort(function(a,b){
        var gaaA=a.gp>0?a.ga/a.gp:99, gaaB=b.gp>0?b.ga/b.gp:99;
        if(gaaA!==gaaB) return gaaA-gaaB;
        var sa=a.sv+a.ga, sb=b.sv+b.ga;
        return (sb>0?b.sv/sb:0)-(sa>0?a.sv/sa:0);
      });
    }
    if(stat==='w') return list.sort(function(a,b){return b.w-a.w||(b.sv-a.sv);});
    if(stat==='sv') return list.sort(function(a,b){return b.sv-a.sv;});
    if(stat==='ga') return list.sort(function(a,b){return a.ga-b.ga||(b.sv-a.sv);});
    return list.sort(function(a,b){
      var sa=a.sv+a.ga, sb=b.sv+b.ga;
      var pA=sa>0?a.sv/sa:0, pB=sb>0?b.sv/sb:0;
      return pB-pA||b.gp-a.gp;
    });
  }

  var skaters=rows.filter(function(r){
    if(r.player.pos==='G') return false;
    if(r.gp<1&&!r.player.isMe) return false;
    if(posF==='F'&&r.player.pos!=='F') return false;
    if(posF==='D'&&r.player.pos!=='D') return false;
    return true;
  });
  sortSkaters(skaters);

  var goalies=rows.filter(function(r){
    if(r.player.pos!=='G') return false;
    if(r.player.isMe) return true;
    var minGp=typeof getLeagueGoalieLeaderMinGp==='function'?getLeagueGoalieLeaderMinGp(G.leagueKey):10;
    return (r.gp||0)>=minGp;
  });
  sortGoalies(goalies);

  var calGp=getLeagueCalendarGamesPlayed(G.leagueKey);
  if(posF!=='G'){
    var skaterLbl=posF==='D'?'DEFENSE':(posF==='F'?'FORWARD':'SKATER');
    html+='<div class="vt" style="font-size:14px;color:var(--gold);margin:10px 0 6px">'+skaterLbl+' LEADERS · '+stat.toUpperCase()+'</div>';
    if(careerView){
      html+='<div style="font-size:11px;color:var(--mut);margin-bottom:4px">Career totals in '+escHtml(leagueLbl)+(G._leadersViewMode==='career_active'?' · active players only':' · includes retired legends')+'</div>';
    } else {
      html+='<div style="font-size:11px;color:var(--mut);margin-bottom:4px">Calendar: '+calGp+' GP · <span style="color:var(--gold)">*</span> = missed 2+ games';
      if(G.leagueKey==='USJL') html+=' · USNDT on shorter USJL slates (U17 ~'+(typeof USNDT_U17_LEAGUE_GAMES!=='undefined'?USNDT_U17_LEAGUE_GAMES:36)+', U18 ~'+(typeof USNDT_U18_LEAGUE_GAMES!=='undefined'?USNDT_U18_LEAGUE_GAMES:26)+')';
      html+='</div>';
    }
    html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-family:VT323,monospace;font-size:14px">';
    html+='<tr style="color:var(--mut);font-size:12px"><th style="text-align:left;padding:4px">#</th><th style="text-align:left">PLAYER</th><th>POS</th><th>H</th><th>OVR</th><th>TEAM</th><th>GP</th><th>G</th><th>A</th><th>PTS</th><th>+/-</th><th>PIM</th></tr>';
    var n=Math.min(22, skaters.length), i, r;
    for(i=0;i<n;i++){
      r=skaters[i];
      var hi=r.player.isMe?' style="color:var(--gold)"':(r.player.legend?' style="color:var(--mut)"':'');
      html+='<tr'+hi+'><td style="padding:4px">'+(i+1)+'</td><td>'+escHtml(r.player.first+' '+r.player.last)+playerLabel(r.player)+'</td>'+
        '<td>'+posLabel(r.player)+'</td><td>'+escHtml(r.player.hand||'')+'</td><td>'+(r.player.ovr||'')+'</td>'+
        '<td style="font-size:12px">'+teamCell(r.player)+'</td>'+
        '<td>'+(careerView?r.gp:formatLeaderGpCell(r, calGp))+'</td><td>'+r.g+'</td><td>'+r.a+'</td><td>'+r.pts+'</td><td>'+(r.pm>=0?'+':'')+r.pm+'</td><td>'+(r.pim||0)+'</td></tr>';
    }
    html+='</table></div>';
  }

  if(posF==='G'){
    var gStatLbl=stat==='svpct'?'SV%':stat.toUpperCase();
    html+='<div class="vt" style="font-size:14px;color:var(--gold);margin:10px 0 6px">GOALIE LEADERS · '+gStatLbl+'</div>';
    html+='<div style="font-size:11px;color:var(--mut);margin-bottom:4px">Min '+((typeof getLeagueGoalieLeaderMinGp==='function')?getLeagueGoalieLeaderMinGp(G.leagueKey):10)+' GP · starters only</div>';
    html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-family:VT323,monospace;font-size:14px">';
    html+='<tr style="color:var(--mut);font-size:12px"><th style="text-align:left;padding:4px">#</th><th style="text-align:left">GOALIE</th><th>H</th><th>OVR</th><th>TEAM</th><th>GP</th><th>SV</th><th>GA</th><th>SV%</th><th>GAA</th><th>W</th><th>PIM</th></tr>';
    n=Math.min(22, goalies.length);
    for(i=0;i<n;i++){
      r=goalies[i];
      var shots=r.sv+r.ga;
      var pct=shots>0?formatSvPctFromRatio(r.sv/shots):'--';
      var gaa=r.gp>0?Math.round(r.ga/r.gp*1000)/1000:'--';
      var hi2=r.player.isMe?' style="color:var(--gold)"':(r.player.legend?' style="color:var(--mut)"':'');
      html+='<tr'+hi2+'><td style="padding:4px">'+(i+1)+'</td><td>'+escHtml(r.player.first+' '+r.player.last)+playerLabel(r.player)+'</td>'+
        '<td>'+escHtml(r.player.hand||'')+'</td><td>'+(r.player.ovr||'')+'</td>'+
        '<td style="font-size:12px">'+teamCell(r.player)+'</td>'+
        '<td>'+(careerView?r.gp:formatLeaderGpCell(r, calGp))+'</td><td>'+r.sv+'</td><td>'+r.ga+'</td><td>'+pct+'</td><td>'+gaa+'</td><td>'+r.w+'</td><td>'+(r.pim||0)+'</td></tr>';
    }
    html+='</table></div>';
  }
  el.innerHTML=html;
}

function getTeammateNameForNews(){
  var roster=ensureTeamRoster();
  if(!roster) return getRandomTalentName();
  var pool=roster.players.filter(function(p){return !p.isMe;});
  if(!pool.length) return getRandomTalentName();
  var p=pool[ri(0, pool.length-1)];
  return p.first+' '+p.last;
}
