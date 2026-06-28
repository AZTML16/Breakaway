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

/** Junior skill ladder — OJL > WJL > NEJC > QMJL > ARJC > CEJC (weakest). */
function getLeagueRosterSkillOffset(leagueKey){
  var map={
    OJL:2, CWHL:2, WJL:1, NEJC:0, QMJL:-1, USJL:-1, USWDL:-1,
    ARJC:-2, EWJC:-2, AWJC:-3, CEJC:-4,
    NCHA:1, NWCHA:0,
    NEHL:1, FHL:-1, CEHL:-7, SDHL:0, FWHL:-1, AWHL:0, ARHL:1,
    NAML:0, PWDL:0, PHL:1, PWL:1
  };
  return map[leagueKey]!=null?map[leagueKey]:0;
}

/** OVR band per circuit — same standards for men's and women's leagues. */
var MEN_LEAGUE_OVR_BANDS={
  PHL:{cap:99,floor:72,baseline:86,spread:12},
  NAML:{cap:83,floor:54,baseline:68,spread:10},
  NEHL:{cap:87,floor:58,baseline:74,spread:11},
  FHL:{cap:76,floor:48,baseline:60,spread:10},
  CEHL:{cap:66,floor:42,baseline:48,spread:7},
  ARHL:{cap:88,floor:58,baseline:75,spread:12},
  OJL:{cap:80,floor:58,baseline:64,spread:12},
  CWHL:{cap:80,floor:58,baseline:63,spread:12},
  QMJL:{cap:80,floor:57,baseline:59,spread:12},
  WJL:{cap:80,floor:57,baseline:62,spread:12},
  USJL:{cap:79,floor:56,baseline:57,spread:11},
  USWDL:{cap:79,floor:56,baseline:57,spread:11},
  NCHA:{cap:84,floor:55,baseline:64,spread:12},
  NWCHA:{cap:84,floor:55,baseline:63,spread:12},
  NEJC:{cap:78,floor:52,baseline:60,spread:10},
  CEJC:{cap:74,floor:46,baseline:52,spread:9},
  ARJC:{cap:77,floor:50,baseline:55,spread:10},
  EWJC:{cap:78,floor:52,baseline:56,spread:10},
  AWJC:{cap:78,floor:51,baseline:55,spread:10},
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
  if(tier==='junior') return {cap:80,floor:58,baseline:60,spread:12};
  if(tier==='college') return {cap:84,floor:55,baseline:64,spread:12};
  if(tier==='euro'||tier==='asia') return {cap:87,floor:58,baseline:73,spread:11};
  if(tier==='minor') return {cap:83,floor:54,baseline:68,spread:10};
  if(tier==='pro') return {cap:99,floor:72,baseline:86,spread:12};
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

function healPlayerSeasonStats(p, leagueKey){
  if(!p||p.isMe) return;
  var s=ensurePlayerStats(p);
  var curSeason=G?G.season:1;
  var cal=typeof getLeagueCalendarGamesPlayed==='function'?getLeagueCalendarGamesPlayed(leagueKey):0;
  var staleSeason=(typeof p._statsSeason==='number'&&p._statsSeason!==curSeason);
  var npcExpected=cal;
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
  p._statsSeason=curSeason;
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
  if((G.gp||0)<1) return;
  c.gp+=G.gp||0; c.g+=G.goals||0; c.a+=G.assists||0; c.pts+=(G.goals||0)+(G.assists||0);
  c.pm+=G.plusminus||0; c.pim=(c.pim||0)+(G.pim||0);
  c.sv=(c.sv||0)+(G.saves||0); c.ga=(c.ga||0)+(G.goalsAgainst||0); c.w=(c.w||0)+(G.w||0);
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

function getLeagueScoringProfile(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  var g=L.games||68;
  var tier=L.tier||'junior';
  /** Season-total targets for the league scoring leader (Art Ross pace), not an average player. */
  var pts=88, gl=32, al=56;
  if(leagueKey==='PHL'){ pts=118; gl=46; al=72; }
  else if(leagueKey==='PWL'){ pts=42; gl=18; al=24; }
  else if(tier==='minor'){ pts=92; gl=34; al=58; }
  else if(tier==='college'){
    if(leagueKey==='NWCHA'){ pts=48; gl=20; al=28; }
    else { pts=52; gl=22; al=30; }
  }
  else if(tier==='euro'||tier==='asia'){
    if(leagueKey==='ARHL'){ pts=72; gl=26; al=46; }
    else if(leagueKey==='NEHL'){ pts=64; gl=24; al=40; }
    else if(leagueKey==='FHL'){ pts=48; gl=16; al=32; }
    else if(leagueKey==='CEHL'){ pts=20; gl=8; al=12; }
    else if(leagueKey==='SDHL'||leagueKey==='FWHL'){ pts=46; gl=18; al=28; }
    else if(leagueKey==='AWHL'){ pts=42; gl=16; al=26; }
    else { pts=58; gl=22; al=36; }
  }
  else if(leagueKey==='OJL'||leagueKey==='CWHL'){ pts=92; gl=36; al=56; }
  else if(leagueKey==='QMJL'){ pts=90; gl=35; al=55; }
  else if(leagueKey==='WJL'){ pts=88; gl=34; al=54; }
  else if(leagueKey==='USJL'){ pts=82; gl=32; al=50; }
  else if(leagueKey==='USWDL'){ pts=68; gl=26; al=42; }
  else if(leagueKey==='NEJC'){ pts=62; gl=26; al=36; }
  else if(leagueKey==='CEJC'){ pts=54; gl=22; al=32; }
  else if(leagueKey==='ARJC'){ pts=60; gl=24; al=36; }
  else if(leagueKey==='EWJC'){ pts=52; gl=20; al=32; }
  else if(leagueKey==='AWJC'){ pts=48; gl=18; al=30; }
  else if(tier==='local'){ pts=22; gl=14; al=8; }
  else if(tier==='junior'){ pts=84; gl=32; al=52; }
  return {games:g, ptsLeader:pts, gLeader:gl, aLeader:al};
}

/** Global dampener — tuned so league leaders land near ptsLeader after line/archetype mults. */
function getLeagueNpcScoringScale(leagueKey){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  if(tier==='local') return 1.05;
  if(tier==='junior') return 1.12;
  if(tier==='college') return 1.04;
  if(tier==='euro'||tier==='asia') return 1;
  if(tier==='minor') return 0.98;
  if(tier==='pro') return 1;
  return 0.95;
}

function getNpcTargetPpgCap(leagueKey){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  if(tier==='local') return 1.08;
  if(tier==='junior') return 1.55;
  if(tier==='college') return 1.72;
  if(tier==='minor') return 1.95;
  if(tier==='pro') return 2.2;
  if(tier==='euro'||tier==='asia') return 1.45;
  return 1.35;
}

function getLeagueSimScoringFactor(leagueKey){
  var p=getLeagueScoringProfile(leagueKey);
  var ref=88;
  return cl(p.ptsLeader/ref, 0.38, 1.05);
}

/** Juniors/college score a bit more freely than pro; kept modest so totals stay realistic. */
function getLeagueTierScoringBoost(leagueKey){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  if(tier==='local') return 1.04;
  if(tier==='junior') return 1.06;
  if(tier==='college') return 1.02;
  if(tier==='euro'||tier==='asia') return 0.98;
  if(tier==='minor') return 0.96;
  if(tier==='pro') return 0.94;
  return 1;
}

function getNpcLineScoringShare(line, pos){
  if(pos==='G'||line>=5) return 0;
  if(line===1) return pos==='D'?0.3:0.56;
  if(line===2) return pos==='D'?0.2:0.24;
  if(line===3) return pos==='D'?0.12:0.15;
  return pos==='D'?0.07:0.09;
}

function getNpcTargetPpg(player, leagueKey){
  var line=getDepthLineFromSlot(player.depthSlot, player.pos);
  if(line>=5) return 0;
  var prof=getLeagueScoringProfile(leagueKey);
  var leaderPpg=prof.ptsLeader/prof.games;
  var perf=getOvrPerformanceMult(player, leagueKey);
  var arch=getArchetypeStatMods(player.arch, player.pos);
  var posPts=getPosScoringMult(player.pos, player.arch);
  var formMult=0.94+((player.form||50)/320);
  var teamOff=getTeamOffenseFactor(leagueKey, player.team);
  var leagueFac=getLeagueSimScoringFactor(leagueKey);
  var tierBoost=getLeagueTierScoringBoost(leagueKey);
  var scale=getLeagueNpcScoringScale(leagueKey);
  var pulse=ensureScoringPulse(player);
  var lineShare=getNpcLineScoringShare(line, player.pos);
  var archBlend=0.64+arch.g*0.2+arch.a*0.16;
  var target=leaderPpg*lineShare*perf*posPts*formMult*teamOff*leagueFac*tierBoost*scale*pulse*archBlend;
  if(player.pos==='F'&&(player.pref||'C')==='C') target*=1.04;
  if(line===1&&perf>=0.92&&(player.arch==='Sniper'||player.arch==='Playmaker')) target*=1.05;
  return cl(target, 0.03, getNpcTargetPpgCap(leagueKey));
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

function rollPlayerHand(pos, subPos, leagueKey){
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
    if(r<0.24) return 'Playmaker';
    if(r<0.44) return 'Sniper';
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

function genNpcOvr(pos, leagueKey, rank, playerAge, subPos, teamName){
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  var bands=getLeagueOvrBands(leagueKey);
  var floor=bands.floor;
  var cap=bands.cap;
  if(tier==='junior'){
    var midMap={OJL:64, CWHL:63, WJL:62, NEJC:60, QMJL:58, USJL:57, USWDL:57, ARJC:55, EWJC:55, AWJC:54, CEJC:52};
    var mid=midMap[leagueKey]!=null?midMap[leagueKey]:bands.baseline;
    var rankT=cl(1-((rank||0)/20), 0, 1);
    var rankBonus=Math.pow(rankT, 1.42)*14;
    var ageBonus=getJuniorAgeOvrBonus(playerAge);
    var prospect=(rank||0)<2&&Math.random()<0.32?rd(1,4):0;
    var o=mid+rankBonus+ageBonus+prospect+rd(-5,5);
    if(pos==='F') o+=getForwardPositionOvrMod(subPos, rank);
    if(pos==='D'&&(rank||0)<6) o+=rd(-1,2);
    if((rank||0)>=8) o-=rd(3,9);
    if((rank||0)>=12) o-=rd(4,10);
    if((rank||0)>=16) o-=rd(2,7);
    if(playerAge<=16&&Math.random()<0.38) o-=rd(2,5);
    if((rank||0)>=6&&Math.random()<0.3) o=ri(58,62)+Math.round(rankBonus*0.12);
    return Math.round(cl(o, floor, cap));
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
    if(player.arch==='OffensiveD') return rd(1.1,1.28);
    if(player.arch==='TwoWayD') return rd(0.98,1.12);
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
    if(line!==1) return Math.random()<0.14?1:0;
    return perWeek;
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
  var missed=Math.max(0, calendarGp-gp);
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
    ovrN=cl(ovrN, floor, cap);
    if(aged>=38&&ovrN<52&&Math.random()<0.55) return null;
    mergeSeasonIntoCareerLeagueStats(carry, leagueKey);
    return {
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
      scoringPulse:typeof carry.scoringPulse==='number'?carry.scoringPulse:rd(0.76,1.24)
    };
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
  return {
    id:'npc_'+ri(10000,99999)+'_'+Date.now().toString(36).slice(-4),
    first:nm.first, last:nm.last, nat:nat||nm.nat||rollNpcNationality(leagueKey, teamName),
    pos:pos, pref:subPos, hand:hand,
    age:age,
    arch:pickNpcArchetypeForRank(pos, subPos, leagueKey, rank),
    ovr:genNpcOvr(pos, leagueKey, rank, age, subPos, teamName),
    isMe:false, team:null, leadership:'',
    proProspect:tier==='junior'&&(rank||0)<4&&Math.random()<0.42,
    alumniFrom:'', juniorMate:false,
    seasonStats:emptyPlayerStats(), form:48+ri(0,14),
    _statsSeason:G?G.season:1,
    scoringPulse:rd(0.78,1.22)
  };
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
  if(a.arch==='Playmaker'&&(b.arch==='Sniper'||b.arch==='PowerForward')) s+=3;
  if(b.arch==='Playmaker'&&(a.arch==='Sniper'||a.arch==='PowerForward')) s+=3;
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
    if(!cP) break;
    used[cP.id]=true;
    cS.player=cP; cP.depthSlot=cS.slot;
    var rem=pool.filter(function(p){return !used[p.id];});
    best=null; bestSc=-99;
    for(j=0;j<rem.length;j++){
      var sc=lineComplementScore(cP, rem[j]);
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
    if(p.arch==='TwoWayD') return base+6;
    if(p.arch==='StayAtHome') return base-4;
    if(p.arch==='ShutdownD') return base-8;
    return base;
  }
  if(p.arch==='Sniper') return base+12;
  if(p.arch==='Playmaker') return base+10;
  if(p.arch==='PowerForward') return base+8;
  if(p.arch==='TwoWay') return base+3;
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
    if(p.arch==='TwoWayD') return base+8;
    if(p.arch==='OffensiveD') return base-6;
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
  p=pickBestForSpecial(pool, used, function(pl){return pl.pos==='D'?getPowerPlayScore(pl):-999;});
  if(p){ used[p.id]=true; picked.push(p); }
  while(picked.length<5){
    p=pickBestForSpecial(pool, used, getPowerPlayScore);
    if(!p) break;
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
  for(n=0;n<2;n++){
    p=pickBestForSpecial(pool, used, function(pl){return pl.pos==='D'?getPenaltyKillScore(pl):-999;});
    if(p){ used[p.id]=true; picked.push(p); }
  }
  for(n=0;n<2;n++){
    p=pickBestForSpecial(pool, used, function(pl){return pl.pos==='F'?getPenaltyKillScore(pl):-999;});
    if(p){ used[p.id]=true; picked.push(p); }
  }
  while(picked.length<4){
    p=pickBestForSpecial(pool, used, getPenaltyKillScore);
    if(!p) break;
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
  var used={}, pool=skaters.slice();
  assignPowerPlayUnit(pool, used, slots.pp1);
  assignPowerPlayUnit(pool, used, slots.pp2);
  assignPenaltyKillUnit(pool, used, slots.pk1);
  assignPenaltyKillUnit(pool, used, slots.pk2);
}

function getDepthSortScore(p){
  var form=typeof p.form==='number'?p.form:50;
  return p.ovr*0.5+form*0.5;
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
  return ovr*0.38+form*0.37+prod*0.25;
}

var _depthAssignLeagueKey='';

function getWeeklyDepthScore(p){
  var base=getDepthSortScore(p);
  if(p.isMe&&typeof getCoachRelationDepthBonus==='function') base+=getCoachRelationDepthBonus();
  if(isEstablishedProLeague(_depthAssignLeagueKey)) return base+rd(-2,2);
  return base+rd(-5,5);
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
  if(Math.random()<0.22) moved=trySwapForwardLinesIfWarranted(d, 3, 4, 8)||moved;
  if(Math.random()<0.14) moved=trySwapForwardLinesIfWarranted(d, 2, 3, 10)||moved;
  if(Math.random()<0.07) moved=trySwapForwardLinesIfWarranted(d, 1, 2, 14)||moved;
  if(!moved&&Math.random()<0.16) tryPromoteHotForward(d, 4, 3);
  if(Math.random()<0.15) trySwapDefensePairsIfWarranted(d, 2, 3, 9);
  if(Math.random()<0.08) trySwapDefensePairsIfWarranted(d, 1, 2, 13);
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
  avail.sort(function(a,b){return getWeeklyDepthScore(b)-getWeeklyDepthScore(a);});
  return avail[0];
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
  var i, p;
  for(i=0;i<unitSlots.length;i++){
    if(unitSlots[i].player) continue;
    p=pickBestForSpecial(pool, used, scoreFn);
    if(!p) break;
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
  var stUsed={};
  Object.keys(used).forEach(function(k){ stUsed[k]=true; });
  restoreDepthUnit(old.pp1, slots.pp1, byId, stUsed, 'ppSlot');
  restoreDepthUnit(old.pp2, slots.pp2, byId, stUsed, 'ppSlot');
  restoreDepthUnit(old.pk1, slots.pk1, byId, stUsed, 'pkSlot');
  restoreDepthUnit(old.pk2, slots.pk2, byId, stUsed, 'pkSlot');
  fillSpecialSlots(skaters, stUsed, slots.pp1, getPowerPlayScore, 'ppSlot');
  fillSpecialSlots(skaters, stUsed, slots.pp2, getPowerPlayScore, 'ppSlot');
  fillSpecialSlots(skaters, stUsed, slots.pk1, getPenaltyKillScore, 'pkSlot');
  fillSpecialSlots(skaters, stUsed, slots.pk2, getPenaltyKillScore, 'pkSlot');
  if(typeof assignHealthyScratches==='function') assignHealthyScratches(roster, slots);
  roster.depth=slots;
  stampProRoleLabels(roster);
  return true;
}

function assignDepthChart(roster, opts){
  opts=opts||{};
  var lk=roster.leagueKey||(G&&G.leagueKey)||'';
  _depthAssignLeagueKey=lk;
  var established=isEstablishedProLeague(lk);
  ensureRosterPositionCounts(roster, lk);
  if(established&&roster._depthLocked&&!opts.forceRebuild&&assignDepthChartSticky(roster)){
    if(typeof ensureTeamRelations==='function') ensureTeamRelations(roster);
    _depthAssignLeagueKey='';
    return;
  }
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
  assignTeamLeadership(players);
  var roster={teamName:teamName, leagueKey:leagueKey, coach:coach, players:players, depth:null};
  syncUserPlayerIntoRoster(roster);
  assignDepthChart(roster);
  return roster;
}

function syncUserPlayerIntoRoster(roster){
  if(!G||!roster||!roster.players) return;
  roster.players=roster.players.filter(function(p){return !p.isMe&&p.id!=='user';});
  if(!G.team||roster.teamName!==G.team.n||roster.leagueKey!==(G.leagueKey||'')) return;
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
    assignDepthChart(G.teamRoster);
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
    OffensiveD:{g:0.8,a:1.08,pim:0.95},
    TwoWayD:{g:0.62,a:0.78,pim:1.15},
    StayAtHome:{g:0.42,a:0.52,pim:1.35},
    ShutdownD:{g:0.35,a:0.45,pim:1.6}
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
  return cl(0.64+(player.ovr-rosterMid)/30, 0.52, cap);
}

function getTeamOffenseFactor(leagueKey, teamName){
  if(!G._teamOffenseFactors) G._teamOffenseFactors={};
  var ck=String(leagueKey||'')+'|'+String(teamName||'')+'|'+(G.season||1);
  if(G._teamOffenseFactors[ck]==null) G._teamOffenseFactors[ck]=rd(0.9, 1.1);
  return G._teamOffenseFactors[ck];
}

function getDepthUsageForLine(line, pos){
  if(pos==='G') return line===1?rd(0.84,0.96):rd(0.08,0.28);
  if(line===1) return rd(0.86,0.98);
  if(line===2) return rd(0.58,0.74);
  if(line===3) return rd(0.34,0.5);
  return rd(0.1,0.26);
}

function getPosScoringMult(pos, arch){
  if(pos==='F') return 1;
  if(pos==='D') return arch==='OffensiveD'?0.64:(arch==='TwoWayD'?0.4:0.28);
  return 0.15;
}

function getPosPlusMinusMult(pos, arch){
  if(pos==='D'){
    if(arch==='StayAtHome'||arch==='ShutdownD') return 0.85;
    if(arch==='TwoWayD') return 0.68;
    return 0.5;
  }
  if(pos==='F') return 0.42;
  return 0.28;
}

function simWeeklyStatBlock(player, leagueKey, games){
  if(!games||games<=0) return null;
  var prof=getLeagueScoringProfile(leagueKey);
  var perf=getOvrPerformanceMult(player, leagueKey);
  var arch=getArchetypeStatMods(player.arch, player.pos);
  var line=getDepthLineFromSlot(player.depthSlot, player.pos);
  if(player.pos==='G'){
    var sa=0, sv=0, ga=0, w=0, gi, shots, svPct, svR;
    for(gi=0;gi<games;gi++){
      shots=Math.round(rd(24, 36));
      svPct=cl(0.868+perf*0.022+rd(-0.028,0.018), 0.845, 0.942);
      svR=Math.round(shots*svPct);
      sa+=shots; sv+=svR; ga+=shots-svR;
      if(Math.random()<cl(0.3+perf*0.12+rd(-0.08,0.08),0.15,0.72)) w++;
    }
    return {gp:games,g:0,a:0,pts:0,pm:0,pim:0,sv:sv,ga:ga,w:w};
  }
  var targetPpg=getNpcTargetPpg(player, leagueKey);
  var tier=(LEAGUES[leagueKey]||{}).tier||'junior';
  var nightPtsCap=tier==='junior'?3:(tier==='college'?4:5);
  var g=0, a=0, pts=0, pim=0, pm=0, gi;
  for(gi=0;gi<games;gi++){
    var nightG=0, nightA=0;
    var expPts=targetPpg*rd(0.82,1.22);
    if(Math.random()<0.16) expPts+=rd(0.35,1.05);
    if(line===1&&perf>=0.94&&player.arch==='Sniper'&&Math.random()<0.12) expPts+=1;
    var nightPts=Math.max(0, Math.min(nightPtsCap, Math.round(expPts)));
    if(nightPts>0){
      var gWt=typeof getArchetypeGoalPointShare==='function'
        ?getArchetypeGoalPointShare(player.arch, player.pos, {line:line, perf:perf, leagueKey:leagueKey})
        :(typeof getLeagueGoalPointShare==='function'?getLeagueGoalPointShare(leagueKey):(typeof getDefaultGoalPointShare==='function'?getDefaultGoalPointShare():0.323));
      if(player.arch==='Sniper'&&line===1&&nightPts>=2&&Math.random()<0.14) gWt=cl(gWt+0.08, 0.08, 0.78);
      var split=typeof splitGoalsAssistsFromPoints==='function'?splitGoalsAssistsFromPoints(nightPts, gWt):{g:nightPts,a:0};
      nightG=split.g; nightA=split.a;
      g+=nightG; a+=nightA;
    }
    if(Math.random()<0.16*arch.pim) pim+=ri(0,2);
    if(typeof rollSkaterGamePim==='function') pim+=rollSkaterGamePim(player.pos, player.arch, null);
    var depthPm=line===1?1:(line===2?0.78:(line===3?0.52:0.28));
    var teamPm=getTeamOffenseFactor(leagueKey, player.team);
    var winChance=cl(0.44+(teamPm-1)*0.18+(perf-0.85)*0.12,0.28,0.62);
    var nightWon=Math.random()<winChance;
    var nightTied=!nightWon&&Math.random()<0.07;
    if(typeof computeSkaterGamePlusMinus==='function'&&player.pos!=='G'){
      var nightPm=computeSkaterGamePlusMinus(nightWon, nightTied, nightG, nightA, nightG+nightA>0?1:0, player.pos, player.arch, 0);
      if(!nightWon&&!nightTied&&nightPm===0) nightPm=-1;
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
      if(p.age<=27&&st.gp>=16&&ppg>=0.82&&Math.random()<0.24) p.ovr=cl(p.ovr+1, floor, cap);
      else if(p.age<=27&&st.gp>=12&&ppg>=0.62&&(p.form||50)>=56&&Math.random()<0.18) p.ovr=cl(p.ovr+1, floor, cap);
      else if(p.age<=30&&st.gp>=20&&ppg>=0.55&&Math.random()<0.14) p.ovr=cl(p.ovr+1, floor, cap);
      else if((p.form||50)>=60&&p.age<=32&&Math.random()<0.12) p.ovr=cl(p.ovr+1, floor, cap);
      else if(st.gp>=18&&ppg<0.18&&p.age>=27&&Math.random()<0.14) p.ovr=cl(p.ovr-1, floor, cap);
      else if(p.age>=35&&Math.random()<0.18) p.ovr=cl(p.ovr-1, floor, cap);
      else if(p.age>=32&&Math.random()<0.1) p.ovr=cl(p.ovr-1, floor, cap);
    } else if(p.age<=24&&st.gp>=12&&ppg>=0.55&&Math.random()<0.14) p.ovr=cl(p.ovr+1, floor, cap);
    else if(p.age<=24&&Math.random()<0.08) p.ovr=cl(p.ovr+1, floor, cap);
    else if(p.age>=31&&Math.random()<0.14) p.ovr=cl(p.ovr-1, floor, cap);
  });
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
  assignDepthChart(roster);
  var perWeek=getGamesPerWeek(leagueKey);
  var weekGameCap=perWeek;
  if(typeof isLocalLeague==='function'&&isLocalLeague(leagueKey)&&typeof getLocalGamesForWeek==='function'){
    weekGameCap=getLocalGamesForWeek(weekNum||1);
  }
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
    block=simWeeklyStatBlock(p, leagueKey, games);
    accumulatePlayerStats(p, block);
    updateNpcFormFromWeek(p, block, leagueKey);
  }
  developNpcRoster(roster.players, leagueKey);
  maybeShuffleAlternates(roster.players, leagueKey);
  if(!established){
    assignDepthChart(roster);
  } else if(Math.random()<0.1){
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
  var mode=G&&G._leadersViewMode==='career'?'career':'season';
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
    for(pi=0;pi<roster.players.length;pi++){
      p=roster.players[pi];
      if(p.isMe){
        if(seenMe||!G.team||teams[t].n!==G.team.n) continue;
        seenMe=true;
      }
      rows.push(playerToStatRow(p, leagueKey));
    }
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
  var html='<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-family:VT323,monospace;font-size:14px">';
  html+='<span style="color:var(--mut);margin-right:4px">SORT:</span>';
  ['pts','g','a','pm','pim'].forEach(function(s){
    html+='<button type="button" class="btn '+(stat===s?'bp':'bs')+'" style="padding:4px 10px;font-size:13px" onclick="setLeadersFilter(\''+s+'\')">'+s.toUpperCase()+'</button>';
  });
  html+='<span style="color:var(--mut);margin:0 4px 0 10px">POS:</span>';
  ['all','F','D','G'].forEach(function(p){
    html+='<button type="button" class="btn '+(posF===p?'bp':'bs')+'" style="padding:4px 10px;font-size:13px" onclick="setLeadersPosFilter(\''+p+'\')">'+p+'</button>';
  });
  html+='<button type="button" class="btn bg2 bw" style="margin-left:10px;padding:4px 12px;font-size:13px" onclick="pinLeagueStatsSnapshot()">PIN SNAPSHOT</button>';
  html+='<select class="btn bs" style="margin-left:6px;padding:4px 8px;font-size:13px" onchange="setLeadersArchiveView(this.value)" title="This season = current year only. All-time = career totals in this league.">';
  html+='<option value="live"'+(view==='live'?' selected':'')+'>THIS SEASON ONLY</option>';
  html+='<option value="career"'+(view==='career'?' selected':'')+'>ALL-TIME (THIS LEAGUE)</option>';
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
  G._leadersPosFilter=pos;
  renderLeadersControls();
  renderLeagueLeadersTab();
}

function setLeadersArchiveView(val){
  if(!G) return;
  if(val==='live'){
    G._leadersViewMode='live';
    G._leadersArchiveIdx=null;
  } else if(val==='career'){
    G._leadersViewMode='career';
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

function refreshHubDepthChartForDisplay(roster){
  if(!roster||!roster.players) return;
  var lk=roster.leagueKey||(typeof G!=='undefined'&&G?G.leagueKey:'')||'';
  syncUserPlayerIntoRoster(roster);
  roster.players.forEach(function(p){
    if(p.isMe) return;
    p.form=cl((p.form||50)+rd(-4,6),12,96);
  });
  var d=roster.depth;
  if(isEstablishedProLeague(lk)){
    maybeProDepthAdjust(roster);
    if(d){
      trySwapForwardLinesIfWarranted(d,2,3,3);
      trySwapForwardLinesIfWarranted(d,3,4,3);
      trySwapDefensePairsIfWarranted(d,2,3,3);
      trySwapDefensePairsIfWarranted(d,1,2,5);
      tryPromoteHotForward(d,4,3);
      refreshProSpecialUnit(roster, Math.random()<0.55?'pp2':'pp1');
      refreshProSpecialUnit(roster, Math.random()<0.55?'pk2':'pk1');
      trySwapOneSpecialSpot(roster, d.pp1, getPowerPlayScore, 'ppSlot');
      trySwapOneSpecialSpot(roster, d.pk1, getPenaltyKillScore, 'pkSlot');
    }
    if(d&&typeof assignHealthyScratches==='function') assignHealthyScratches(roster, d);
    stampProRoleLabels(roster);
  } else {
    roster._depthLocked=false;
    assignDepthChart(roster, {forceRebuild:true});
  }
  if(typeof G!=='undefined'&&G&&G.leagueRostersCache&&roster.teamName){
    G.leagueRostersCache[rosterCacheKey(lk, roster.teamName)]=roster;
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
    html+=' &nbsp;·&nbsp; <span style="color:#c9a84c">Lines refresh when you open this tab</span>';
  } else {
    html+=' &nbsp;·&nbsp; <span style="color:var(--acc)">Depth reshuffled each visit</span>';
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
  var careerView=G._leadersViewMode==='career';
  var snap=archived&&G.leagueStatsArchive?G.leagueStatsArchive[G._leadersArchiveIdx]:null;
  var leagueLbl=snap?snap.leagueShort:(G.league&&G.league.short)||'';
  var stat=G._leadersFilter||'pts';
  var posF=G._leadersPosFilter||'all';
  var hasPlayed=archived||(G.gp||0)>0||(G._npcStatsSyncedWeek||0)>0;
  var html='';
  if(careerView){
    html+='<div class="vt" style="font-size:13px;color:var(--gold);margin-bottom:10px">ALL-TIME · '+escHtml(leagueLbl)+' (career totals in this league, includes current season)</div>';
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
    if(p.leadership==='C') s+=' <span style="color:var(--gold)">[C]</span>';
    else if(p.leadership==='A') s+=' <span style="color:var(--acc)">[A]</span>';
    if(p.isMe) s+=' *';
    return s;
  }

  function posLabel(p){
    return escHtml(p.pref&&p.pref!==p.pos?p.pref:p.pos);
  }

  function sortSkaters(list){
    if(stat==='g') return list.sort(function(a,b){return b.g-a.g||b.pts-a.pts;});
    if(stat==='a') return list.sort(function(a,b){return b.a-a.a||b.pts-a.pts;});
    if(stat==='pm') return list.sort(function(a,b){return b.pm-a.pm||b.pts-a.pts;});
    if(stat==='pim') return list.sort(function(a,b){return (b.pim||0)-(a.pim||0)||b.pts-a.pts;});
    return list.sort(function(a,b){return b.pts-a.pts;});
  }

  var skaters=rows.filter(function(r){
    if(r.player.pos==='G') return false;
    if(r.gp<1&&!r.player.isMe) return false;
    if(posF==='F'&&r.player.pos!=='F') return false;
    if(posF==='D'&&r.player.pos!=='D') return false;
    return true;
  });
  sortSkaters(skaters);

  var goalies=rows.filter(function(r){return r.player.pos==='G';}).sort(function(a,b){
    var sa=a.sv+a.ga, sb=b.sv+b.ga;
    var pA=sa>0?a.sv/sa:0, pB=sb>0?b.sv/sb:0;
    return pB-pA;
  });

  var calGp=getLeagueCalendarGamesPlayed(G.leagueKey);
  if(posF!=='G'){
    html+='<div class="vt" style="font-size:14px;color:var(--gold);margin:10px 0 6px">SKATER LEADERS · '+stat.toUpperCase()+'</div>';
    if(careerView){
      html+='<div style="font-size:11px;color:var(--mut);margin-bottom:4px">Career totals in '+escHtml(leagueLbl)+'</div>';
    } else {
      html+='<div style="font-size:11px;color:var(--mut);margin-bottom:4px">Calendar: '+calGp+' GP · <span style="color:var(--gold)">*</span> = missed 2+ games</div>';
    }
    html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-family:VT323,monospace;font-size:14px">';
    html+='<tr style="color:var(--mut);font-size:12px"><th style="text-align:left;padding:4px">#</th><th style="text-align:left">PLAYER</th><th>POS</th><th>H</th><th>OVR</th><th>TEAM</th><th>GP</th><th>G</th><th>A</th><th>PTS</th><th>+/-</th><th>PIM</th></tr>';
    var n=Math.min(25, skaters.length), i, r;
    for(i=0;i<n;i++){
      r=skaters[i];
      var hi=r.player.isMe?' style="color:var(--gold)"':'';
      html+='<tr'+hi+'><td style="padding:4px">'+(i+1)+'</td><td>'+escHtml(r.player.first+' '+r.player.last)+playerLabel(r.player)+'</td>'+
        '<td>'+posLabel(r.player)+'</td><td>'+escHtml(r.player.hand||'')+'</td><td>'+(r.player.ovr||'')+'</td>'+
        '<td style="font-size:12px">'+escHtml((r.player.team||'').split(' ').slice(-1)[0])+'</td>'+
        '<td>'+(careerView?r.gp:formatLeaderGpCell(r, calGp))+'</td><td>'+r.g+'</td><td>'+r.a+'</td><td>'+r.pts+'</td><td>'+(r.pm>=0?'+':'')+r.pm+'</td><td>'+(r.pim||0)+'</td></tr>';
    }
    html+='</table></div>';
  }

  if(posF==='all'||posF==='G'){
    html+='<div class="vt" style="font-size:14px;color:var(--gold);margin:14px 0 6px">GOALIE LEADERS</div>';
    html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-family:VT323,monospace;font-size:14px">';
    html+='<tr style="color:var(--mut);font-size:12px"><th style="text-align:left;padding:4px">#</th><th style="text-align:left">GOALIE</th><th>H</th><th>OVR</th><th>TEAM</th><th>GP</th><th>SV%</th><th>GAA</th><th>W</th><th>PIM</th></tr>';
    n=Math.min(15, goalies.filter(function(r){return r.gp>=1||r.player.isMe;}).length);
    var gList=goalies.filter(function(r){return r.gp>=1||r.player.isMe;});
    for(i=0;i<n;i++){
      r=gList[i];
      var shots=r.sv+r.ga;
      var pct=shots>0?formatSvPctFromRatio(r.sv/shots):'--';
      var gaa=r.gp>0?Math.round(r.ga/r.gp*100)/100:'--';
      var hi2=r.player.isMe?' style="color:var(--gold)"':'';
      html+='<tr'+hi2+'><td style="padding:4px">'+(i+1)+'</td><td>'+escHtml(r.player.first+' '+r.player.last)+playerLabel(r.player)+'</td>'+
        '<td>'+escHtml(r.player.hand||'')+'</td><td>'+(r.player.ovr||'')+'</td>'+
        '<td style="font-size:12px">'+escHtml((r.player.team||'').split(' ').slice(-1)[0])+'</td>'+
        '<td>'+r.gp+'</td><td>'+pct+'</td><td>'+gaa+'</td><td>'+r.w+'</td><td>'+(r.pim||0)+'</td></tr>';
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
