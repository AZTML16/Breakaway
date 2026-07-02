/* breakaway — CJL Memorial Cup + US National Development Team (USJL) + CJL vs USNDT Challenge */
var CJL_MAJOR_JUNIOR_KEYS=['OJL','QMJL','WJL'];
var USNDT_U17_TEAM_NAME='USNDT U17';
var USNDT_U18_TEAM_NAME='USNDT U18';
var USNDT_LEGACY_TEAM_NAME='US National Development Team';
var CJL_SELECT_NAME='CJL All-Stars';
/** One org in USJL standings; U17/U18 are roster tracks under the same program. */
var USNDT_ORG_STANDINGS_NAME='US National Development Team';
var USNDT_U17_LEAGUE_GAMES=36;
var USNDT_U18_LEAGUE_GAMES=26;
var USNDT_ORG_USJL_GAMES=62;
var USNDT_U17_INTL_COUNT=8;
var USNDT_U17_DEV_COUNT=4;
var USNDT_U18_COLLEGE_EXH=14;
var USNDT_U18_CJL_SHOWCASE=1;
var USNDT_U18_DEV_COUNT=2;
/** @deprecated use squad helpers */
var USNDT_LEAGUE_GAMES=USNDT_U17_LEAGUE_GAMES;
var USNDT_EXHIBITION_COUNT=USNDT_U18_COLLEGE_EXH;
var CJL_CHALLENGE_WIN_PTS=2;

function getUsndtSquadLeagueGames(teamName){
  if(isUsndtU17Team(teamName)) return USNDT_U17_LEAGUE_GAMES;
  if(isUsndtU18Team(teamName)) return USNDT_U18_LEAGUE_GAMES;
  return USNDT_ORG_USJL_GAMES;
}

/** Countable USJL league GP for a USNDT squad track (exhibitions / intl do not count). */
function getUsndtNpcLeagueGpCap(teamName){
  if(!teamName||!isUsndtTeam(teamName)) return null;
  return getUsndtSquadLeagueGames(teamName);
}

/** Leader table "calendar GP" — USNDT players are on shorter USJL slates than clubs. */
function getUsndtLeaderCalendarGp(player, leagueKey, fallbackCal){
  if(leagueKey!=='USJL'||!player) return fallbackCal;
  var teamName=player.team||(player.isMe&&G&&G.team?G.team.n:null);
  var cap=getUsndtNpcLeagueGpCap(teamName);
  if(cap==null) return fallbackCal;
  return Math.min(fallbackCal, cap);
}

function getUsndtSquadExtraSlots(teamName){
  if(isUsndtU17Team(teamName)) return USNDT_U17_DEV_COUNT+USNDT_U17_INTL_COUNT;
  if(isUsndtU18Team(teamName)) return USNDT_U18_COLLEGE_EXH+USNDT_U18_CJL_SHOWCASE+USNDT_U18_DEV_COUNT;
  return 0;
}

function isUsndtOrgStandingsTeam(teamName){
  return teamName===USNDT_ORG_STANDINGS_NAME;
}

/** USJL table shows one USNDT row; U17/U18 squads are not separate standings entries. */
function collapseUsjlStandingsTeams(teams){
  if(!teams) return [];
  var out=[], sawUsndt=false, i;
  for(i=0;i<teams.length;i++){
    if(isUsndtTeam(teams[i].n)){
      if(!sawUsndt){
        out.push({n:USNDT_ORG_STANDINGS_NAME,e:'[★]'});
        sawUsndt=true;
      }
    } else out.push(teams[i]);
  }
  return out;
}

function isUserOnUsndtOrg(){
  return !!(G&&G.team&&isUsndtTeam(G.team.n));
}

var CJL_MEMORIAL_HOSTS=[
  {city:'London', team:{n:'London Mustangs',e:'[O]'}, leagueKey:'OJL'},
  {city:'Halifax', team:{n:'Halifax Longshots',e:'[Q]'}, leagueKey:'QMJL'},
  {city:'Regina', team:{n:'Regina Pronghorns',e:'[W]'}, leagueKey:'WJL'},
  {city:'Sherbrooke', team:{n:'Sherbrooke Phœnix',e:'[Q]'}, leagueKey:'QMJL'},
  {city:'Edmonton', team:{n:'Edmonton Forge',e:'[W]'}, leagueKey:'WJL'},
  {city:'Kingston', team:{n:'Kingston Ironclad',e:'[O]'}, leagueKey:'OJL'},
  {city:'Québec City', team:{n:'Québec Ramparts',e:'[Q]'}, leagueKey:'QMJL'},
  {city:'Kelowna', team:{n:'Kelowna Sunblazers',e:'[W]'}, leagueKey:'WJL'}
];

var MEMORIAL_CUP_RR_PAIRINGS=[
  [[0,1],[2,3]],
  [[0,2],[1,3]],
  [[0,3],[1,2]]
];

function isCjlMajorJuniorLeague(leagueKey){
  return CJL_MAJOR_JUNIOR_KEYS.indexOf(leagueKey||'')>=0;
}

function isUsndtU17Team(teamName){
  return teamName===USNDT_U17_TEAM_NAME;
}

function isUsndtU18Team(teamName){
  return teamName===USNDT_U18_TEAM_NAME;
}

function isUsndtTeam(teamName){
  return isUsndtU17Team(teamName)||isUsndtU18Team(teamName)||teamName===USNDT_LEGACY_TEAM_NAME;
}

/** USNDT stacks most top American juniors — used for standings, sim, and roster quality. */
function getUsndtStandingsStrength(teamName){
  var h=0, s=String(teamName||'')+'|USJL';
  for(var i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0;
  return cl(0.72+((Math.abs(h)%1000)/1000)*0.12, 0.72, 0.86);
}

function getUsndtSimRosterBoost(){
  return 0.38;
}

function getUsndtPlayoffPowerBonus(teamRow){
  if(!teamRow||!teamRow.team) return 0;
  var n=teamRow.team.n;
  if(isUsndtU18Team(n)) return 0.44;
  if(n===CJL_SELECT_NAME) return 0.40;
  if(isUsndtU17Team(n)) return 0.34;
  return 0;
}

function getUsndtChallengeTeamName(){
  return USNDT_U18_TEAM_NAME;
}

function normalizeUsndtTeamOnLoad(){
  if(typeof syncUsndtTeamTrackForAge==='function') syncUsndtTeamTrackForAge(false);
}

/** U17 = age 16 only; U18 = age 17+ (draft-year / college exhibition track). */
function getUsndtTeamNameForAge(playerAge){
  playerAge=playerAge!=null?playerAge:16;
  return playerAge>=17?USNDT_U18_TEAM_NAME:USNDT_U17_TEAM_NAME;
}

function filterUsndtTeamByAge(teamName, playerAge){
  playerAge=playerAge!=null?playerAge:16;
  if(isUsndtU17Team(teamName)) return playerAge<=16;
  if(isUsndtU18Team(teamName)) return playerAge>=17;
  return true;
}

/** Keep player on the correct USNDT squad track for their age; regen schedule when track changes. */
function syncUsndtTeamTrackForAge(announce){
  if(!G||G.leagueKey!=='USJL'||!G.team||!isUsndtTeam(G.team.n)) return false;
  var age=G.age||16;
  var target=getUsndtTeamNameForAge(age);
  if(G.team.n===target) return false;
  G.team={n:target,e:G.team.e||'[★]'};
  if(typeof onTeamChangeLeadershipReset==='function') onTeamChangeLeadershipReset();
  if(typeof genSeason==='function') G.allOpponents=genSeason('USJL',G.team);
  if(typeof G.league==='object'&&G.league&&typeof getUsndtSquadLeagueGames==='function'){
    G.league=Object.assign({}, G.league, {games:getUsndtSquadLeagueGames(G.team.n)});
  }
  if(announce&&isUsndtU18Team(G.team.n)){
    addNews('USNDT: Age '+age+' — U18 roster track (college exhibitions, CJL pipeline).','good');
  }
  return true;
}

/** Before spring events — ensure 17+ players are on U18. */
function prepareUsndtForSpringEvents(){
  if(!G||G.leagueKey!=='USJL'||!G.team) return;
  syncUsndtTeamTrackForAge(false);
}

function applyUsndtAgePromotion(){
  if(!G||G.leagueKey!=='USJL'||!G.team||!isUsndtTeam(G.team.n)) return;
  syncUsndtTeamTrackForAge(true);
}

function isUsaNationalTeamEligible(nat){
  nat=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat||''):(nat||'');
  return nat==='United States';
}

function isCanadaNationalEligible(nat){
  nat=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat||''):(nat||'');
  return nat==='Canada';
}

function ensureCjlSeasonState(){
  if(!G) return;
  if(!G._cjlSeason||G._cjlSeason.season!==G.season){
    G._cjlSeason={season:G.season, champions:{}, host:null, memorialDone:false, challengeDone:false};
  }
}

function simulateMajorJuniorChampion(leagueKey){
  ensureCjlSeasonState();
  if(G._cjlSeason.champions[leagueKey]) return G._cjlSeason.champions[leagueKey];
  var teams=TEAMS[leagueKey]||[];
  if(!teams.length) return null;
  var sorted=teams.slice();
  var elitePool=typeof isMajorJuniorEliteOrg==='function'?teams.filter(function(t){return isMajorJuniorEliteOrg(leagueKey, t.n);}):[];
  if(leagueKey==='OJL'){
    sorted=shuf(sorted).slice(0, Math.min(6, sorted.length));
    if(elitePool.length&&Math.random()<0.64){
      var ep=elitePool[ri(0, elitePool.length-1)];
      G._cjlSeason.champions[leagueKey]={n:ep.n, e:ep.e||'[-]', leagueKey:leagueKey};
      return G._cjlSeason.champions[leagueKey];
    }
  } else if(leagueKey==='QMJL'){
    sorted=shuf(sorted).slice(0, Math.min(4, sorted.length));
    if(elitePool.length&&Math.random()<0.58){
      var epQ=elitePool[ri(0, elitePool.length-1)];
      G._cjlSeason.champions[leagueKey]={n:epQ.n, e:epQ.e||'[-]', leagueKey:leagueKey};
      return G._cjlSeason.champions[leagueKey];
    }
  } else if(leagueKey==='WJL'){
    sorted=shuf(sorted).slice(0, Math.min(5, sorted.length));
  } else {
    sorted=shuf(sorted).slice(0, Math.min(4, sorted.length));
  }
  var pick=sorted[ri(0, sorted.length-1)];
  G._cjlSeason.champions[leagueKey]={n:pick.n, e:pick.e||'[-]', leagueKey:leagueKey};
  return G._cjlSeason.champions[leagueKey];
}

function pickMemorialCupHost(season){
  var h=CJL_MEMORIAL_HOSTS[(season||1)%CJL_MEMORIAL_HOSTS.length];
  return {city:h.city, team:{n:h.team.n, e:h.team.e||'[-]'}, leagueKey:h.leagueKey};
}

function buildMemorialCupField(){
  ensureCjlSeasonState();
  CJL_MAJOR_JUNIOR_KEYS.forEach(function(lk){
    if(!G._cjlSeason.champions[lk]) simulateMajorJuniorChampion(lk);
  });
  var host=pickMemorialCupHost(G.season);
  G._cjlSeason.host=host;
  var field=[], lk, ch, i;
  for(i=0;i<CJL_MAJOR_JUNIOR_KEYS.length;i++){
    lk=CJL_MAJOR_JUNIOR_KEYS[i];
    ch=G._cjlSeason.champions[lk];
    if(!ch) continue;
    var isMe=!!(G.team&&G.team.n===ch.n&&G.leagueKey===lk);
    field.push({
      team:{n:ch.n, e:ch.e||'[-]'},
      leagueKey:lk,
      leagueShort:LEAGUES[lk]?LEAGUES[lk].short:lk,
      pts:ri(78, 98),
      gp:68,
      isMe:isMe,
      label:LEAGUES[lk]?LEAGUES[lk].short:lk+' CHAMP'
    });
  }
  var hostIsChamp=field.some(function(r){return r.team.n===host.team.n;});
  if(hostIsChamp){
    var hostLk=host.leagueKey;
    var hostChamp=G._cjlSeason.champions[hostLk];
    var hostTeams=TEAMS[hostLk]||[];
    var runnerUp=null, ti;
    for(ti=0;ti<hostTeams.length;ti++){
      if(hostChamp&&hostTeams[ti].n===hostChamp.n) continue;
      if(hostTeams[ti].n===host.team.n) continue;
      runnerUp=hostTeams[ti];
      break;
    }
    if(!runnerUp&&hostTeams.length>1) runnerUp=hostTeams[1];
    if(runnerUp){
      field.push({
        team:{n:runnerUp.n, e:runnerUp.e||'[-]'},
        leagueKey:hostLk,
        leagueShort:LEAGUES[hostLk]?LEAGUES[hostLk].short:hostLk,
        pts:ri(72, 90),
        gp:68,
        isMe:!!(G.team&&G.team.n===runnerUp.n&&G.leagueKey===hostLk),
        label:(LEAGUES[hostLk]?LEAGUES[hostLk].short:hostLk)+' RUNNER-UP'
      });
    }
  } else {
    field.push({
      team:{n:host.team.n, e:host.team.e||'[-]'},
      leagueKey:host.leagueKey,
      leagueShort:'HOST',
      pts:ri(62, 82),
      gp:68,
      isMe:!!(G.team&&G.team.n===host.team.n),
      label:'HOST ('+host.city+')'
    });
  }
  field.sort(function(a,b){return b.pts-a.pts;});
  return field;
}

function standingRowToPlayoffTeam(row){
  return {
    team:{n:row.team.n, e:row.team.e||'[-]'},
    pts:row.pts||0,
    gp:row.gp||68,
    isMe:!!row.isMe,
    leagueKey:row.leagueKey||null
  };
}

function initMemorialCupRrStandings(teams){
  var st={}, i;
  for(i=0;i<teams.length;i++){
    st[teams[i].team.n]={pts:0,w:0,l:0,gp:0,gf:0,ga:0};
  }
  return st;
}

function memorialCupUpdateRrStanding(teamName, won, gf, ga){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.rrStandings||!ctx.rrStandings[teamName]) return;
  var s=ctx.rrStandings[teamName];
  s.gp++;
  s.gf=(s.gf||0)+(gf||0);
  s.ga=(s.ga||0)+(ga||0);
  if(won){ s.w++; s.pts+=2; }
  else { s.l++; }
}

function startMemorialCupRoundRobinRound(roundIdx){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.teams) return;
  var pairings=MEMORIAL_CUP_RR_PAIRINGS[roundIdx];
  if(!pairings) return;
  ctx.rrRound=roundIdx;
  ctx.roundName='Round Robin — Round '+(roundIdx+1);
  ctx.pairs=[];
  var p, teams=ctx.teams;
  for(p=0;p<pairings.length;p++){
    ctx.pairs.push([teams[pairings[p][0]], teams[pairings[p][1]]]);
  }
  ctx.pairIndex=0;
  ctx.winnersThisRound=[];
  ctx._roundMatchups=[];
  ctx.seriesHW=0;
  ctx.seriesAW=0;
  G._playoffSeriesWins=1;
}

function memorialCupRecordRrGameFromSeries(home, away){
  var ctx=G._playoffCtx;
  var hw=ctx.seriesHW, aw=ctx.seriesAW;
  var homeWon=hw>aw;
  var lowG=ri(2,5), highG=ri(lowG+1,7);
  var hg=homeWon?highG:lowG;
  var ag=homeWon?lowG:highG;
  memorialCupUpdateRrStanding(home.team.n, homeWon, hg, ag);
  memorialCupUpdateRrStanding(away.team.n, !homeWon, ag, hg);
  ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+(homeWon?home.team.n:away.team.n)+' ('+hg+'-'+ag+')');
}

function memorialCupOnRoundComplete(){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.memorialCup||ctx.mcPhase!=='roundrobin') return false;
  if(ctx.pairIndex<ctx.pairs.length) return false;
  ctx.summary.rounds.push({name:ctx.roundName, matchups:ctx._roundMatchups.slice()});
  if(ctx.rrRound<2){
    startMemorialCupRoundRobinRound(ctx.rrRound+1);
    addNews('CJL Memorial Cup round robin — round '+(ctx.rrRound+1)+' begins.','neutral');
    try{renderHub();}catch(eMcRr){}
    return true;
  }
  advanceMemorialCupToFinals();
  return true;
}

function sortMemorialCupRrTeams(teams, rrSt){
  return teams.slice().sort(function(a,b){
    var sa=rrSt[a.team.n], sb=rrSt[b.team.n];
    if(sb.pts!==sa.pts) return sb.pts-sa.pts;
    var diffA=(sa.gf||0)-(sa.ga||0), diffB=(sb.gf||0)-(sb.ga||0);
    if(diffB!==diffA) return diffB-diffA;
    return sb.w-sa.w;
  });
}

function advanceMemorialCupToFinals(){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.teams) return;
  var sorted=sortMemorialCupRrTeams(ctx.teams, ctx.rrStandings);
  var seed1=sorted[0], seed2=sorted[1], seed3=sorted[2];
  ctx.mcSeed1=seed1;
  G._playoffSeriesWins=1;
  ctx.mcPhase='semifinal';
  ctx.roundName='Memorial Cup Semifinal';
  ctx.current=[seed2, seed3];
  ctx.pairs=[[seed2, seed3]];
  ctx.pairIndex=0;
  ctx.winnersThisRound=[];
  ctx._roundMatchups=[];
  ctx.seriesHW=0;
  ctx.seriesAW=0;
  ctx.eliminated=!(seed2.isMe||seed3.isMe);
  addNews('MEMORIAL CUP SEMIFINAL — '+seed2.team.n+' vs '+seed3.team.n+' (one game). '+seed1.team.n+' awaits in the final.','big');
  addNews('Round robin complete — 1st place earns a bye; 2nd vs 3rd for the other final spot.','neutral');
  try{renderHub();}catch(eMcFin){}
}

function advanceMemorialCupToChampionship(semiWinner){
  var ctx=G._playoffCtx;
  if(!ctx||!semiWinner) return;
  var seed1=ctx.mcSeed1;
  if(!seed1) return;
  G._playoffSeriesWins=1;
  ctx.mcPhase='final';
  ctx.roundName='Memorial Cup Final';
  ctx.current=[seed1, semiWinner];
  ctx.pairs=[[seed1, semiWinner]];
  ctx.pairIndex=0;
  ctx.winnersThisRound=[];
  ctx._roundMatchups=[];
  ctx.seriesHW=0;
  ctx.seriesAW=0;
  ctx.eliminated=!(seed1.isMe||semiWinner.isMe);
  addNews('MEMORIAL CUP FINAL — '+seed1.team.n+' vs '+semiWinner.team.n+' (championship game).','big');
  try{renderHub();}catch(eMcCh){}
}

function initMemorialCupPlayoffBracket(field){
  if(!field||field.length<4){
    addNews('CJL Memorial Cup cancelled — not enough qualifiers.','neutral');
    return false;
  }
  G._worldStageCtx=null;
  G._playoffElimAutoRun=false;
  G._cjlTournamentActive=true;
  G._playoffSeriesWins=1;
  var bracket=field.slice(0,4).map(standingRowToPlayoffTeam);
  var host=pickMemorialCupHost(G.season);
  var hostChampInField=field.some(function(r){return r.team.n===host.team.n;});
  addNews('CJL MEMORIAL CUP — '+host.city+' hosts. Round robin, semifinal, one-game final.','big');
  addNews(hostChampInField
    ?'FIELD: Three league champions plus host-city runner-up (host league won — runner-up fills the fourth slot).'
    :'FIELD: OJL, QMJL, WJL champions plus host city.','neutral');
  G._playoffCtx={
    active:true,
    memorialCup:true,
    mcPhase:'roundrobin',
    hubScheduleMode:true,
    teams:bracket,
    rrStandings:initMemorialCupRrStandings(bracket),
    rrRound:0,
    current:bracket,
    summary:{field:[],rounds:[],champion:''},
    myStats:{gp:0,g:0,a:0,sv:0,ga:0},
    pairIndex:0,
    pairs:[],
    winnersThisRound:[],
    _roundMatchups:[],
    eliminated:false,
    wonCup:false,
    roundReached:'',
    roundName:'',
    playoffOpponent:{n:'',e:'[-]'},
    awaitingUserGame:false,
    seriesHW:0,
    seriesAW:0
  };
  for(var b=0;b<bracket.length;b++){
    var lbl=field[b]&&field[b].label?field[b].label:(b+1)+'.';
    G._playoffCtx.summary.field.push(lbl+' '+bracket[b].team.n);
  }
  startMemorialCupRoundRobinRound(0);
  notify('CJL MEMORIAL CUP','gold');
  try{renderHub();show('s-hub');}catch(eMc){}
  return true;
}

function simMemorialCupRrGame(home, away){
  var homeWon=playoffSingleGameHomeWins(home, away);
  var lowG=ri(2,5), highG=ri(lowG+1,7);
  var hg=homeWon?highG:lowG;
  var ag=homeWon?lowG:highG;
  return {homeWon:homeWon, hg:hg, ag:ag, line:home.team.n+' vs '+away.team.n+' -> '+(homeWon?home.team.n:away.team.n)+' ('+hg+'-'+ag+')'};
}

function simMemorialCupBracketCpu(field){
  var teams=field.slice(0,4).map(standingRowToPlayoffTeam);
  var host=pickMemorialCupHost(G.season);
  var summary={field:[],rounds:[],champion:''};
  var rrSt=initMemorialCupRrStandings(teams);
  field.forEach(function(r,i){
    summary.field.push((r.label||('T'+(i+1)))+' '+r.team.n);
  });
  var rnd, p, pairings, g, home, away, res;
  for(rnd=0;rnd<3;rnd++){
    pairings=MEMORIAL_CUP_RR_PAIRINGS[rnd];
    var matchups=[];
    for(p=0;p<pairings.length;p++){
      home=teams[pairings[p][0]];
      away=teams[pairings[p][1]];
      res=simMemorialCupRrGame(home, away);
      if(res.homeWon){ rrSt[home.team.n].pts+=2; rrSt[home.team.n].w++; rrSt[away.team.n].l++; }
      else { rrSt[away.team.n].pts+=2; rrSt[away.team.n].w++; rrSt[home.team.n].l++; }
      rrSt[home.team.n].gp++; rrSt[away.team.n].gp++;
      matchups.push(res.line);
    }
    summary.rounds.push({name:'Round Robin — Round '+(rnd+1), matchups:matchups});
  }
  var sorted=sortMemorialCupRrTeams(teams, rrSt);
  var seed1=sorted[0], seed2=sorted[1], seed3=sorted[2];
  var semiRes=simMemorialCupRrGame(seed2, seed3);
  summary.rounds.push({name:'Memorial Cup Semifinal', matchups:[semiRes.line]});
  var semiWinner=semiRes.homeWon?seed2:seed3;
  var finRes=simMemorialCupRrGame(seed1, semiWinner);
  summary.rounds.push({name:'Memorial Cup Final', matchups:[finRes.line]});
  summary.champion=(finRes.homeWon?seed1:semiWinner).team.n;
  return {summary:summary, champion:finRes.homeWon?seed1:semiWinner, hostCity:host.city};
}

function addMemorialCupCpuRecap(result){
  if(!result||!result.summary) return;
  var html='<div style="color:var(--gold);font-size:15px;margin-bottom:8px">CJL MEMORIAL CUP — '+escHtml(result.hostCity||'')+'</div>';
  html+='<div style="font-size:13px;color:var(--mut);margin-bottom:8px">Round robin, semifinal (2 vs 3), one-game final — CHL-style national junior championship.</div>';
  var f;
  for(f=0;f<result.summary.field.length;f++){
    html+='<div style="padding:4px 6px;border:1px solid rgba(122,184,224,.15);margin-bottom:4px">'+escHtml(result.summary.field[f])+'</div>';
  }
  for(f=0;f<result.summary.rounds.length;f++){
    var r=result.summary.rounds[f];
    html+='<div style="margin:8px 0 4px;color:var(--acc)">'+escHtml(r.name)+'</div>';
    for(var j=0;j<r.matchups.length;j++){
      html+='<div style="padding:4px;border-left:3px solid var(--acc);margin-bottom:4px">'+escHtml(r.matchups[j])+'</div>';
    }
  }
  html+='<div style="margin-top:8px;color:var(--green)"><b>MEMORIAL CUP CHAMPION:</b> '+escHtml(result.summary.champion)+'</div>';
  _lastPlayoffRecapHTML=(_lastPlayoffRecapHTML||'')+html;
  addNews(result.summary.champion+' wins the CJL Memorial Cup in '+result.hostCity+'.','big');
  G._memorialCupChampion=result.summary.champion;
  G._cjlSeason.memorialDone=true;
  G._cjlTournamentActive=false;
}

function beginCjlMemorialCupSequence(leagueChampionRow){
  if(!G||!isCjlMajorJuniorLeague(G.leagueKey)) return false;
  ensureCjlSeasonState();
  if(G._cjlSeason.memorialDone) return false;
  G._wonLeagueChampionship=!!G.wonCup;
  G._memorialCupChampion=null;
  G.wonCup=false;
  if(leagueChampionRow&&leagueChampionRow.team){
    G._cjlSeason.champions[G.leagueKey]={
      n:leagueChampionRow.team.n,
      e:leagueChampionRow.team.e||'[-]',
      leagueKey:G.leagueKey
    };
  }
  var field=buildMemorialCupField();
  var userIn=field.some(function(r){return r.isMe;});
  if(userIn){
    return initMemorialCupPlayoffBracket(field);
  }
  addMemorialCupCpuRecap(simMemorialCupBracketCpu(field));
  return false;
}

function finishMemorialCupToOffseason(){
  G._cjlTournamentActive=false;
  G._cjlSeason.memorialDone=true;
  G._memorialCupWon=!!G.wonCup;
  if(G._memorialCupWon){
    G._memorialCupChampion=G.team&&G.team.n?G.team.n:(G._memorialCupChampion||'');
    G.awards.push({name:'CJL Memorial Cup Champion',icon:'[C]',desc:'Won the Canadian Junior League national title',season:G.season});
    addNews('YOU WIN THE CJL MEMORIAL CUP — Canadian Junior League champion!','big');
    notify('MEMORIAL CUP CHAMPIONS!','gold');
  } else if(G._wonLeagueChampionship){
    addNews('League champion, but the Memorial Cup goes to '+(G._memorialCupChampion||'another club')+'.','neutral');
  }
  if(typeof captureSeasonRecapSnapshot==='function') captureSeasonRecapSnapshot();
  else if(typeof buildSeasonRecapHTML==='function') G._lastSeasonRecapHTML=buildSeasonRecapHTML();
  if(typeof prepareUsndtForSpringEvents==='function') prepareUsndtForSpringEvents();
  if(typeof beginCjlUsndtChallenge==='function'&&beginCjlUsndtChallenge()) return;
  finishSeasonToOffseason();
  try{show('s-offseason');}catch(eMcOff){}
}

/* ---- CJL vs USNDT Challenge (2 games, 2 pts/win, 3-on-3 OT if tied) ---- */

function isPhlDraftEligibleProspect(){
  if(!G||!G.league) return false;
  var age=G.age||16;
  if(age!==18) return false;
  if(isCjlMajorJuniorLeague(G.leagueKey)&&isCanadaNationalEligible(G.nat)) return true;
  if(G.leagueKey==='USJL'&&isUsaNationalTeamEligible(G.nat)) return true;
  return false;
}

function getCjlSelectMinOvr(){
  return 66;
}

function userSelectedForCjlSelect(){
  if(!G||!isCjlMajorJuniorLeague(G.leagueKey)) return false;
  if(!isPhlDraftEligibleProspect()||!isCanadaNationalEligible(G.nat)) return false;
  var pOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):60;
  var perf=G.gp>0?(G.goals+G.assists)/G.gp:0;
  return pOvr>=getCjlSelectMinOvr()||perf>=0.85;
}

function userSelectedForUsndtChallengeSide(){
  if(!G||G.leagueKey!=='USJL'||!isUsaNationalTeamEligible(G.nat)) return false;
  if(isUsndtU17Team(G.team&&G.team.n)) return false;
  if(isUsndtU18Team(G.team&&G.team.n)) return true;
  var age=G.age||16;
  if(age!==18) return false;
  var pOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):60;
  return pOvr>=getCjlSelectMinOvr();
}

function shouldRunCjlUsndtChallenge(){
  if(!G) return false;
  if(!isPhlDraftEligibleProspect()&&!isCjlMajorJuniorLeague(G.leagueKey)&&G.leagueKey!=='USJL') return false;
  ensureCjlSeasonState();
  if(G._cjlSeason.challengeDone) return false;
  return isCjlMajorJuniorLeague(G.leagueKey)||G.leagueKey==='USJL';
}

function buildCjlSelectTeamRow(isMe){
  return {team:{n:CJL_SELECT_NAME,e:'[C]'}, pts:0, gp:0, isMe:!!isMe, label:'CJL SELECT'};
}

function buildUsndtChallengeTeamRow(isMe){
  return {team:{n:USNDT_U18_TEAM_NAME,e:'[18]'}, pts:0, gp:0, isMe:!!isMe, label:'USNDT U18'};
}

function simChallengeOtWinner(cjlPower, usndtPower){
  var periods=0;
  while(periods<8){
    periods++;
    var cjlGoal=0.28+(cjlPower-usndtPower)*0.22+rd(-0.06,0.06);
    var usGoal=0.28+(usndtPower-cjlPower)*0.22+rd(-0.06,0.06);
    if(Math.random()<cjlGoal) return {winner:'cjl', periods:periods};
    if(Math.random()<usGoal) return {winner:'usndt', periods:periods};
  }
  return {winner: cjlPower>=usndtPower?'cjl':'usndt', periods:periods};
}

function simCjlUsndtChallengeCpu(){
  var cjlPow=rd(0.50,0.64), usPow=rd(0.54,0.68);
  var cjlPts=0, usPts=0, lines=[];
  var g1=playoffSingleGameHomeWins(buildCjlSelectTeamRow(false), buildUsndtChallengeTeamRow(false));
  if(g1){ cjlPts+=CJL_CHALLENGE_WIN_PTS; lines.push('Game 1: '+CJL_SELECT_NAME+' def. '+USNDT_U18_TEAM_NAME+' (+2 CJL)'); }
  else { usPts+=CJL_CHALLENGE_WIN_PTS; lines.push('Game 1: '+USNDT_U18_TEAM_NAME+' def. '+CJL_SELECT_NAME+' (+2 USNDT U18)'); }
  var g2=playoffSingleGameHomeWins(buildUsndtChallengeTeamRow(false), buildCjlSelectTeamRow(false));
  if(g2){ usPts+=CJL_CHALLENGE_WIN_PTS; lines.push('Game 2: '+USNDT_U18_TEAM_NAME+' def. '+CJL_SELECT_NAME+' (+2 USNDT U18)'); }
  else { cjlPts+=CJL_CHALLENGE_WIN_PTS; lines.push('Game 2: '+CJL_SELECT_NAME+' def. '+USNDT_U18_TEAM_NAME+' (+2 CJL)'); }
  var winnerSide, otLine='';
  if(cjlPts===usPts){
    var ot=simChallengeOtWinner(cjlPow, usPow);
    winnerSide=ot.winner;
    otLine='Tied 2-2 after two games — 3-on-3 OT ('+ot.periods+'×20 min): '+(winnerSide==='cjl'?CJL_SELECT_NAME:USNDT_U18_TEAM_NAME)+' scores.';
    lines.push(otLine);
  } else {
    winnerSide=cjlPts>usPts?'cjl':'usndt';
  }
  var champName=winnerSide==='cjl'?CJL_SELECT_NAME:USNDT_U18_TEAM_NAME;
  return {summary:{field:[CJL_SELECT_NAME+' (PHL draft-eligible CJL All-Stars)', USNDT_U18_TEAM_NAME+' (US National Development Team U18)'], rounds:[{name:'CJL vs USNDT U18 Challenge (2 games, 2 pts/win)', matchups:lines}], champion:champName}, winnerSide:winnerSide, cjlPts:cjlPts, usPts:usPts};
}

function addCjlUsndtChallengeCpuRecap(result){
  if(!result||!result.summary) return;
  var html='<div style="color:var(--gold);font-size:15px;margin-bottom:8px">CJL vs USNDT CHALLENGE</div>';
  html+='<div style="font-size:13px;color:var(--mut);margin-bottom:8px">PHL draft-eligible CJL All-Stars vs USNDT U18 — 2 games (2 pts per win), 3-on-3 OT if tied.</div>';
  var f;
  for(f=0;f<result.summary.field.length;f++){
    html+='<div style="padding:4px 6px;border:1px solid rgba(122,184,224,.15);margin-bottom:4px">'+escHtml(result.summary.field[f])+'</div>';
  }
  for(f=0;f<result.summary.rounds.length;f++){
    var r=result.summary.rounds[f];
    html+='<div style="margin:8px 0 4px;color:var(--acc)">'+escHtml(r.name)+'</div>';
    for(var j=0;j<r.matchups.length;j++){
      html+='<div style="padding:4px;border-left:3px solid var(--acc);margin-bottom:4px">'+escHtml(r.matchups[j])+'</div>';
    }
  }
  html+='<div style="margin-top:8px;color:var(--green)"><b>WINNER:</b> '+escHtml(result.summary.champion)+'</div>';
  _lastPlayoffRecapHTML=(_lastPlayoffRecapHTML||'')+html;
  addNews(result.summary.champion+' wins the CJL vs USNDT Challenge.','big');
  G._cjlSeason.challengeDone=true;
}

function cjlUsndtHomeTeamWonFromUserResult(home, away, userWon){
  if(!home||!away) return !!userWon;
  if(home.isMe) return !!userWon;
  if(away.isMe) return !userWon;
  return !!userWon;
}

function recordCjlUsndtChallengeGame(home, away, homeTeamWon, scoreLine){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.cjlUsndtChallenge||!home||!away) return false;
  var cjlWon=(home.team.n===CJL_SELECT_NAME)?!!homeTeamWon:!homeTeamWon;
  if(cjlWon) ctx.cjlSeriesPts+=CJL_CHALLENGE_WIN_PTS;
  else ctx.usndtSeriesPts+=CJL_CHALLENGE_WIN_PTS;
  var winnerName=cjlWon?CJL_SELECT_NAME:USNDT_U18_TEAM_NAME;
  var line=home.team.n+' vs '+away.team.n+(scoreLine?' '+scoreLine:'')+' -> '+winnerName+' (+2 pts)';
  if(!ctx.challengeGameLog) ctx.challengeGameLog=[];
  ctx.challengeGameLog.push(line);
  ctx._roundMatchups=ctx.challengeGameLog.slice();
  return cjlWon;
}

function buildCjlUsndtChallengeRecapHTML(playoffObj){
  if(!playoffObj||!playoffObj.summary) return '';
  var html='<div style="color:var(--gold);font-size:15px;margin-bottom:8px">CJL vs USNDT CHALLENGE</div>';
  html+='<div style="font-size:13px;color:var(--mut);margin-bottom:8px">PHL draft-eligible CJL All-Stars vs USNDT U18 — 2 games (2 pts per win), 3-on-3 OT if tied.</div>';
  var ctx=G._playoffCtx;
  var cjlPts=playoffObj.cjlSeriesPts!=null?playoffObj.cjlSeriesPts:(ctx&&ctx.cjlSeriesPts);
  var usPts=playoffObj.usndtSeriesPts!=null?playoffObj.usndtSeriesPts:(ctx&&ctx.usndtSeriesPts);
  if(cjlPts!=null&&usPts!=null){
    html+='<div style="font-size:14px;margin-bottom:10px">Series: CJL All-Stars <b style="color:var(--gold)">'+cjlPts+'</b> — USNDT U18 <b style="color:var(--gold)">'+usPts+'</b></div>';
  }
  var f;
  for(f=0;f<playoffObj.summary.field.length;f++){
    html+='<div style="padding:4px 6px;border:1px solid rgba(122,184,224,.15);margin-bottom:4px">'+escHtml(playoffObj.summary.field[f])+'</div>';
  }
  for(f=0;f<playoffObj.summary.rounds.length;f++){
    var r=playoffObj.summary.rounds[f];
    html+='<div style="margin:8px 0 4px;color:var(--acc)">'+escHtml(r.name)+'</div>';
    for(var j=0;j<r.matchups.length;j++){
      html+='<div style="padding:4px;border-left:3px solid var(--acc);margin-bottom:4px">'+escHtml(r.matchups[j])+'</div>';
    }
  }
  html+='<div style="margin-top:8px;color:var(--green)"><b>WINNER:</b> '+escHtml(playoffObj.summary.champion||'')+'</div>';
  return html;
}

function initCjlUsndtChallengePlayable(userSide){
  G._worldStageCtx=null;
  G._playoffElimAutoRun=false;
  G._playoffSeriesWins=1;
  var cjlRow=buildCjlSelectTeamRow(userSide==='cjl');
  var usRow=buildUsndtChallengeTeamRow(userSide==='usndt');
  addNews('CJL vs USNDT U18 CHALLENGE — PHL draft-eligible CJL All-Stars vs the USNDT U18 program.','big');
  addNews('Format: 2 games (2 standings pts per win). Tied? 3-on-3 overtime — 20-minute periods until someone scores.','neutral');
  G._playoffCtx={
    active:true,
    cjlUsndtChallenge:true,
    hubScheduleMode:true,
    userSide:userSide,
    cjlTeam:cjlRow,
    usndtTeam:usRow,
    cjlSeriesPts:0,
    usndtSeriesPts:0,
    challengeGame:0,
    challengeGameLog:[],
    otPhase:false,
    otPeriods:0,
    homeIsCjl:true,
    summary:{field:[CJL_SELECT_NAME+' vs '+USNDT_U18_TEAM_NAME], rounds:[], champion:''},
    myStats:{gp:0,g:0,a:0,sv:0,ga:0},
    pairIndex:0,
    pairs:[],
    winnersThisRound:[],
    _roundMatchups:[],
    eliminated:false,
    wonCup:false,
    roundReached:'',
    roundName:'CJL vs USNDT U18 Challenge',
    playoffOpponent:{n:'',e:'[-]'},
    awaitingUserGame:false,
    seriesHW:0,
    seriesAW:0
  };
  startCjlUsndtChallengeGame();
  notify('CJL vs USNDT CHALLENGE','gold');
  try{renderHub();show('s-hub');}catch(eCh){}
  return true;
}

function startCjlUsndtChallengeGame(){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.cjlUsndtChallenge) return;
  var home, away, label;
  if(ctx.otPhase){
    label='3-on-3 OT — Period '+(ctx.otPeriods+1)+' (5 min, sudden death)';
    home=ctx.homeIsCjl?ctx.cjlTeam:ctx.usndtTeam;
    away=ctx.homeIsCjl?ctx.usndtTeam:ctx.cjlTeam;
  } else {
    label='Challenge Game '+(ctx.challengeGame+1)+' of 2';
    if(ctx.challengeGame===0){
      home=ctx.cjlTeam; away=ctx.usndtTeam; ctx.homeIsCjl=true;
    } else {
      home=ctx.usndtTeam; away=ctx.cjlTeam; ctx.homeIsCjl=false;
    }
  }
  ctx.roundName=label;
  ctx.pairs=[[home, away]];
  ctx.pairIndex=0;
  ctx.seriesHW=0;
  ctx.seriesAW=0;
  ctx.winnersThisRound=[];
}

function beginCjlUsndtChallenge(){
  if(!shouldRunCjlUsndtChallenge()) return false;
  if(typeof prepareUsndtForSpringEvents==='function') prepareUsndtForSpringEvents();
  var onCjl=userSelectedForCjlSelect();
  var onUsndt=userSelectedForUsndtChallengeSide();
  if(onCjl&&onUsndt) onUsndt=isUsndtU18Team(G.team&&G.team.n);
  if(onCjl) return initCjlUsndtChallengePlayable('cjl');
  if(onUsndt) return initCjlUsndtChallengePlayable('usndt');
  addCjlUsndtChallengeCpuRecap(simCjlUsndtChallengeCpu());
  G._cjlSeason.challengeDone=true;
  return false;
}

function cjlUsndtAfterPlayableGame(userWon, homeTeamWon, scoreLine){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.cjlUsndtChallenge) return;
  var pr=ctx.pairs[ctx.pairIndex];
  if(!pr) return;
  var home=pr[0], away=pr[1];
  if(homeTeamWon==null) homeTeamWon=cjlUsndtHomeTeamWonFromUserResult(home, away, userWon);
  if(ctx.otPhase){
    var otCjlWon=(home.team.n===CJL_SELECT_NAME)?!!homeTeamWon:!homeTeamWon;
    var otWinner=otCjlWon?CJL_SELECT_NAME:USNDT_U18_TEAM_NAME;
    var otLine=home.team.n+' vs '+away.team.n+(scoreLine?' '+scoreLine:'')+' -> '+otWinner+' (OT)';
    if(!ctx.challengeGameLog) ctx.challengeGameLog=[];
    ctx.challengeGameLog.push(otLine);
    ctx._roundMatchups=ctx.challengeGameLog.slice();
    finishCjlUsndtChallengeFromSide(otCjlWon?'cjl':'usndt', userWon);
    return;
  }
  recordCjlUsndtChallengeGame(home, away, homeTeamWon, scoreLine);
  ctx.challengeGame++;
  G._isPlayoffGame=false;
  ctx.awaitingUserGame=false;
  if(ctx.challengeGame>=2){
    if(ctx.cjlSeriesPts===ctx.usndtSeriesPts){
      ctx.otPhase=true;
      ctx.otPeriods=0;
      addNews('Challenge tied '+ctx.cjlSeriesPts+'-'+ctx.usndtSeriesPts+' after two games — 3-on-3 OT (5-min periods) until someone scores.','big');
      startCjlUsndtChallengeGame();
      try{renderHub();show('s-hub');}catch(eOt){}
      return;
    }
    finishCjlUsndtChallengeFromSide(ctx.cjlSeriesPts>ctx.usndtSeriesPts?'cjl':'usndt', userWon);
    return;
  }
  addNews('Challenge series: CJL '+ctx.cjlSeriesPts+' — USNDT U18 '+ctx.usndtSeriesPts+'.','neutral');
  startCjlUsndtChallengeGame();
  try{renderHub();show('s-hub');}catch(eG2){}
}

function finishCjlUsndtChallengeFromSide(winnerSide, userWon){
  var ctx=G._playoffCtx;
  if(!ctx) return;
  var champName=winnerSide==='cjl'?CJL_SELECT_NAME:USNDT_U18_TEAM_NAME;
  var matchups=(ctx.challengeGameLog&&ctx.challengeGameLog.length)?ctx.challengeGameLog.slice():(ctx._roundMatchups||[]).slice();
  ctx.summary.rounds.push({name:ctx.otPhase?'3-on-3 Overtime':'CJL vs USNDT U18 Challenge', matchups:matchups});
  ctx.summary.champion=champName;
  ctx.wonCup=!!(userWon&&(ctx.userSide===winnerSide));
  G.wonCup=ctx.wonCup;
  if(ctx.wonCup){
    G.awards.push({name:'CJL vs USNDT Challenge Champion',icon:'[★]',desc:'Won the cross-border junior showcase',season:G.season});
    addNews('YOU WIN THE CJL vs USNDT CHALLENGE!','big');
  }
  addNews(champName+' wins the CJL vs USNDT Challenge.','big');
  G._cjlSeason.challengeDone=true;
  var playoffObj={
    wonCup:ctx.wonCup,
    roundReached:'Final',
    summary:ctx.summary,
    cjlSeriesPts:ctx.cjlSeriesPts,
    usndtSeriesPts:ctx.usndtSeriesPts
  };
  if(typeof recordPlayoffLogFromResult==='function') recordPlayoffLogFromResult(playoffObj);
  if(typeof buildCjlUsndtChallengeRecapHTML==='function'){
    _lastPlayoffRecapHTML=(_lastPlayoffRecapHTML||'')+buildCjlUsndtChallengeRecapHTML(playoffObj);
  } else if(typeof buildPlayoffRecapHTML==='function'){
    _lastPlayoffRecapHTML=(_lastPlayoffRecapHTML||'')+buildPlayoffRecapHTML(playoffObj);
  }
  if(typeof _lastPlayoffStats!=='undefined') _lastPlayoffStats=ctx.myStats;
  G._playoffCtx=null;
  G._isPlayoffGame=false;
  finishSeasonToOffseason();
  try{show('s-offseason');}catch(eChFin){}
}

function deriveCjlUsndtWinnerSide(ctx){
  if(!ctx) return 'cjl';
  if(ctx.usndtSeriesPts>ctx.cjlSeriesPts) return 'usndt';
  if(ctx.cjlSeriesPts>ctx.usndtSeriesPts) return 'cjl';
  var log=ctx.challengeGameLog||[], cjlWins=0, usWins=0, i;
  for(i=0;i<log.length;i++){
    if(log[i].indexOf('-> '+CJL_SELECT_NAME)>=0) cjlWins++;
    else if(log[i].indexOf('-> '+USNDT_U18_TEAM_NAME)>=0) usWins++;
  }
  return usWins>cjlWins?'usndt':'cjl';
}

function finishCjlUsndtChallengeToOffseason(){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.cjlUsndtChallenge) return;
  finishCjlUsndtChallengeFromSide(deriveCjlUsndtWinnerSide(ctx), false);
}

function memorialCupAfterRrGame(won){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.memorialCup||ctx.mcPhase!=='roundrobin') return false;
  var pr=ctx.pairs[ctx.pairIndex];
  if(!pr) return false;
  memorialCupRecordRrGameFromSeries(pr[0], pr[1]);
  return false;
}

/* ---- USNDT schedule / exhibitions ---- */

function isUsndtNonLeagueEvent(opp){
  return !!(opp&&(opp.usndtExhibition||opp.usndtIntl||opp.usndtDev||opp.usndtCjlShowcase));
}

function isUsndtExhibitionEvent(opp){
  return isUsndtNonLeagueEvent(opp);
}

function pickNchaExhibitionOpponent(){
  var pool=TEAMS.NCHA||[];
  if(!pool.length) return {n:'College All-Stars',e:'[U]',usndtExhibition:true,label:'COLLEGE EXHIBITION',desc:'NCHA exhibition — U18 reps vs NCAA talent (no USJL GP).'};
  var t=pool[ri(0,pool.length-1)];
  return {
    n:t.n, e:t.e||'[U]', usndtExhibition:true,
    label:'COLLEGE EXHIBITION vs '+t.n,
    desc:'Exhibition vs '+t.n+' — NCAA pace, no USJL standings / GP.'
  };
}

var USNDT_INTL_EVENTS=[
  {n:'Five Nations Showcase',e:'[★]',desc:'Elite U17 programs — round robin vs Canada, Sweden, Finland.'},
  {n:'NTDP International',e:'[★]',desc:'U17 USA vs top European national dev teams.'},
  {n:'World Selects Tournament',e:'[★]',desc:'Invitation event vs global U17 all-star programs.'},
  {n:'Junior Elite Series',e:'[★]',desc:'Cross-border showcase vs NEJC academy all-stars.'},
  {n:'Hlinka Gretzky Cup',e:'[★]',desc:'Prestige international U17 tournament.'},
  {n:'Global Prospects Classic',e:'[★]',desc:'Scouting-heavy event vs Asian and European academies.'},
  {n:'Four Nations U17',e:'[★]',desc:'USA U17 vs Canada, Sweden, and Finland dev rosters.'},
  {n:'World U17 Challenge',e:'[★]',desc:'Annual elite international U17 championship.'}
];

function pickUsndtIntlEvent(){
  var ev=USNDT_INTL_EVENTS[ri(0,USNDT_INTL_EVENTS.length-1)];
  return {n:ev.n,e:ev.e,usndtIntl:true,label:'U17 INTERNATIONAL: '+ev.n,desc:ev.desc+' (no USJL GP).'};
}

function pickUsndtCjlShowcaseEvent(){
  return {
    n:CJL_SELECT_NAME, e:'[★]', usndtCjlShowcase:true,
    label:'CJL SHOWCASE vs '+CJL_SELECT_NAME,
    desc:'Single-game showcase vs Canadian Junior League all-stars — leads into spring CJL Challenge (no USJL GP).'
  };
}

function pickUsndtDevEvent(forU17){
  if(forU17){
    return {
      n:'USNDT U17 Internal Scrimmage',e:'[17]',usndtDev:true,
      label:'U17 DEVELOPMENT SCRIMMAGE',
      desc:'Intra-program reps — skills, systems, and video (no USJL GP).'
    };
  }
  return {
    n:'USNDT U18 Pro Habits Camp',e:'[18]',usndtDev:true,
    label:'U18 DEVELOPMENT SESSION',
    desc:'Internal pro-prep work with staff — no USJL standings impact.'
  };
}

function genUsjlSeason(lk, myTeam){
  var teams=(TEAMS[lk]||[]).filter(function(t){
    return t.n!==myTeam.n&&!isUsndtTeam(t.n)&&!isUsndtOrgStandingsTeam(t.n);
  });
  if(!teams.length) teams=(TEAMS[lk]||[]).filter(function(t){ return !isUsndtTeam(t.n); });
  var perWeek=(LEAGUES[lk]&&LEAGUES[lk].gamesPerWeek)||3;
  var isU17=isUsndtU17Team(myTeam.n);
  var isU18=isUsndtU18Team(myTeam.n);
  var leagueGames=isU17?USNDT_U17_LEAGUE_GAMES:(isU18?USNDT_U18_LEAGUE_GAMES:((LEAGUES[lk]&&LEAGUES[lk].games)||62));
  var extraSlots=[];
  var ei;
  if(isU17){
    for(ei=0;ei<USNDT_U17_INTL_COUNT;ei++) extraSlots.push('intl');
    for(ei=0;ei<USNDT_U17_DEV_COUNT;ei++) extraSlots.push('dev');
  } else if(isU18){
    for(ei=0;ei<USNDT_U18_COLLEGE_EXH;ei++) extraSlots.push('college');
    for(ei=0;ei<USNDT_U18_CJL_SHOWCASE;ei++) extraSlots.push('cjl');
    for(ei=0;ei<USNDT_U18_DEV_COUNT;ei++) extraSlots.push('dev');
  }
  var totalSlots=leagueGames+extraSlots.length;
  var totalWeeks=Math.ceil(totalSlots/perWeek);
  var weekPattern=[], w, i;
  for(w=0;w<totalWeeks;w++){
    var row=[];
    for(i=0;i<perWeek;i++) row.push('game');
    weekPattern.push(row);
  }
  if(extraSlots.length){
    var totalCells=totalWeeks*perWeek;
    for(i=0;i<extraSlots.length;i++){
      var pos=Math.floor((i+0.5)*totalCells/extraSlots.length);
      if(isU18) pos=Math.floor(((i+0.35)*totalCells)/extraSlots.length);
      var wk=Math.floor(pos/perWeek);
      var col=pos%perWeek;
      if(weekPattern[wk]) weekPattern[wk][col]=extraSlots[i];
    }
  }
  var slots=[], gamesPlaced=0, eventsPlaced=0, evType;
  for(w=0;w<weekPattern.length;w++){
    var row=weekPattern[w];
    for(i=0;i<row.length;i++){
      evType=row[i];
      if(evType!=='game'&&eventsPlaced<extraSlots.length){
        if(evType==='college') slots.push(pickNchaExhibitionOpponent());
        else if(evType==='intl') slots.push(pickUsndtIntlEvent());
        else if(evType==='cjl') slots.push(pickUsndtCjlShowcaseEvent());
        else slots.push(pickUsndtDevEvent(isU17));
        eventsPlaced++;
      } else if(gamesPlaced<leagueGames){
        var oppPick=teams[ri(0,teams.length-1)];
        slots.push({n:oppPick.n,e:oppPick.e||'[-]'});
        gamesPlaced++;
      }
    }
  }
  while(gamesPlaced<leagueGames){
    var o=teams[ri(0,teams.length-1)];
    slots.push({n:o.n,e:o.e||'[-]'});
    gamesPlaced++;
  }
  while(eventsPlaced<extraSlots.length){
    evType=extraSlots[eventsPlaced];
    if(evType==='college') slots.push(pickNchaExhibitionOpponent());
    else if(evType==='intl') slots.push(pickUsndtIntlEvent());
    else if(evType==='cjl') slots.push(pickUsndtCjlShowcaseEvent());
    else slots.push(pickUsndtDevEvent(isU17));
    eventsPlaced++;
  }
  return slots;
}

function getUsjlClubGames(){
  return (typeof LEAGUES!=='undefined'&&LEAGUES.USJL&&LEAGUES.USJL.games)||62;
}

/** League games completed (excludes USNDT college exhibitions). */
function getUsjlLeagueProgress(){
  if(typeof G==='undefined'||!G||G.leagueKey!=='USJL') return 0;
  if(isUsndtTeam(G.team&&G.team.n)) return G.gp||0;
  var perWeek=(G.league&&G.league.gamesPerWeek)||3;
  return Math.min(getUsjlClubGames(), ((G.week||1)-1)*perWeek+(G.weekGames||0));
}

/** Per-team GP on the USJL table — org plays full 62-game USJL slate (U17+U18 split internally). */
function getUsjlTeamStandingsGp(teamName){
  var clubGp=getUsjlClubGames();
  if(isUsndtOrgStandingsTeam(teamName)){
    if(G&&G.team&&isUsndtTeam(G.team.n)){
      var squadGp=getUsndtSquadLeagueGames(G.team.n);
      return Math.min(USNDT_ORG_USJL_GAMES, Math.max(0, Math.round((G.gp||0)*USNDT_ORG_USJL_GAMES/squadGp)));
    }
    return Math.min(USNDT_ORG_USJL_GAMES, typeof getUsjlLeagueProgress==='function'?getUsjlLeagueProgress():0);
  }
  if(G&&G.team&&isUsndtTeam(G.team.n)){
    return Math.min(clubGp, Math.max(0, Math.round((G.gp||0)*clubGp/getUsndtSquadLeagueGames(G.team.n))));
  }
  return Math.min(clubGp, typeof getUsjlLeagueProgress==='function'?getUsjlLeagueProgress():0);
}

function applyUsndtSpecialEventEffects(slot){
  G.morale=cl((G.morale||50)+ri(4,10),0,100);
  var xpBase=slot&&slot.usndtIntl?ri(18,30):(slot&&slot.usndtCjlShowcase?ri(20,32):(slot&&slot.usndtDev?ri(12,22):ri(14,24)));
  G.xp=(G.xp||0)+xpBase;
  if((G.age||16)<26&&G.attrs){
    var cap=typeof getAttrCapForAge==='function'?getAttrCapForAge(G.age||16):99;
    var cmin=typeof G._attrClampMin==='number'?G._attrClampMin:40;
    if(G.attrs.positioning) G.attrs.positioning=cl(G.attrs.positioning+rd(0.3,0.9),cmin,cap);
    if(G.attrs.anticipation) G.attrs.anticipation=cl(G.attrs.anticipation+rd(0.2,0.7),cmin,cap);
    if(slot&&slot.usndtIntl&&G.attrs.composure) G.attrs.composure=cl(G.attrs.composure+rd(0.2,0.6),cmin,cap);
  }
}

function usndtSpecialEventNews(slot, simulated){
  var tag=simulated?'SIM ':'';
  if(slot.usndtIntl) return tag+'U17 INTERNATIONAL: '+G.first+' '+G.last+' at '+slot.n+' (no USJL GP).';
  if(slot.usndtCjlShowcase) return tag+'CJL SHOWCASE: '+G.first+' '+G.last+' vs '+slot.n+' — preview of spring CJL Challenge (no USJL GP).';
  if(slot.usndtDev) return tag+(isUsndtU17Team(G.team.n)?'U17 DEV':'U18 DEV')+': '+G.first+' '+G.last+' — '+slot.n+' (no USJL GP).';
  return tag+'COLLEGE EXHIBITION: '+G.first+' '+G.last+' vs '+slot.n+' — U18 NCHA reps (no USJL GP).';
}

function completeUsndtExhibition(idx, simulated){
  if(!G||G.leagueKey!=='USJL'||!isUsndtTeam(G.team.n)) return;
  if(idx!==G.weekGames){
    notify('FINISH SLOT '+(G.weekGames+1)+' ON THE SCHEDULE FIRST','gold');
    return;
  }
  var perWeek=(G.league&&G.league.gamesPerWeek)||3;
  var slot=G.allOpponents[((G.week||1)-1)*perWeek+idx];
  if(!slot||!isUsndtNonLeagueEvent(slot)) return;
  G._curGameIdx=idx;
  applyUsndtSpecialEventEffects(slot);
  addNews(usndtSpecialEventNews(slot, simulated),'good');
  G.weekGames=(G.weekGames||0)+1;
  var note=slot.usndtIntl?'TOURNAMENT COMPLETE':(slot.usndtCjlShowcase?'CJL SHOWCASE COMPLETE':(slot.usndtDev?'DEV SESSION COMPLETE':'EXHIBITION COMPLETE'));
  notify(simulated?note+' (SIM)':note,'gold');
  if(typeof maybeEndRegularSeason==='function') maybeEndRegularSeason();
  if(typeof renderHub==='function') renderHub();
}

function runUsndtExhibition(idx){ completeUsndtExhibition(idx, false); }
function simUsndtExhibition(idx){ completeUsndtExhibition(idx, true); }

function isHighPotentialForUsndt(potentialKey){
  return potentialKey==='elite'||potentialKey==='franchise'||potentialKey==='mvp';
}

/** OVR at team select from create-screen attrs (before career starts). */
function getTeamSelectPreviewOvr(){
  if(typeof G==='undefined'||!G) return 60;
  var gender=(typeof safeEl==='function'&&safeEl('c-gender'))?safeEl('c-gender').value:'M';
  var pos=typeof selPos!=='undefined'?selPos:'F';
  if(pos==='G'){
    var attrList=(typeof ATTRS!=='undefined'&&ATTRS.G)?ATTRS.G:[];
    var attrs={}, a, arch=(typeof ARCHETYPES!=='undefined'&&ARCHETYPES.G)?ARCHETYPES.G[selArch]:null;
    for(a=0;a<attrList.length;a++) attrs[attrList[a]]=(G._baseAttrs&&G._baseAttrs[attrList[a]]!=null)?G._baseAttrs[attrList[a]]:58;
    if(arch&&arch.boosts){
      Object.keys(arch.boosts).forEach(function(k){ if(attrs[k]!==undefined) attrs[k]=cl(attrs[k]+arch.boosts[k],40,92); });
    }
    for(a=0;a<attrList.length;a++){
      attrs[attrList[a]]=cl((G._baseAttrs&&G._baseAttrs[attrList[a]]||attrs[attrList[a]])+(G._extraAttrs&&G._extraAttrs[attrList[a]]||0),40,99);
    }
    return typeof ovr==='function'?ovr(attrs,'G'):60;
  }
  var attrs=typeof finalizeCreateSkaterAttrs==='function'
    ?finalizeCreateSkaterAttrs(pos, gender, G._baseAttrs||{}, G._extraAttrs||{})
    :{};
  return typeof ovr==='function'?ovr(attrs,pos):60;
}

/** USA prospects with elite projection or strong current tools can land USNDT U17 (age 16 only). */
function qualifiesForUsndtU17Invite(pOvr, potentialKey, nat, playerAge){
  playerAge=playerAge!=null?playerAge:16;
  if(!isUsaNationalTeamEligible(nat)) return false;
  if(playerAge!==16) return false;
  if(isHighPotentialForUsndt(potentialKey)) return true;
  pOvr=pOvr||0;
  if(pOvr>=68) return true;
  if(potentialKey==='support'&&pOvr>=64) return true;
  if(potentialKey==='depth'&&pOvr>=70) return true;
  return false;
}

function getUsndtU17InviteTier(pOvr, potentialKey){
  if(potentialKey==='mvp'||potentialKey==='franchise') return 'lock';
  if(potentialKey==='elite'||(pOvr||0)>=72) return 'strong';
  if((pOvr||0)>=68||(potentialKey==='support'&&(pOvr||0)>=65)) return 'solid';
  return 'longshot';
}

function getUsndtU17DraftChance(pOvr, potentialKey){
  var tier=getUsndtU17InviteTier(pOvr, potentialKey);
  if(tier==='lock') return 0.9;
  if(tier==='strong') return 0.68;
  if(tier==='solid') return 0.45;
  return 0.15;
}

function findUsndtU17Team(pool){
  if(!pool) return null;
  for(var i=0;i<pool.length;i++){
    if(isUsndtU17Team(pool[i].n)) return pool[i];
  }
  return null;
}

function pickUsjlDraftTeam(pool, nat, playerAge, pOvr, potentialKey){
  if(!pool||!pool.length) return null;
  var u17=findUsndtU17Team(pool);
  if(u17&&typeof qualifiesForUsndtU17Invite==='function'&&qualifiesForUsndtU17Invite(pOvr, potentialKey, nat, playerAge)){
    if(Math.random()<getUsndtU17DraftChance(pOvr, potentialKey)) return u17;
  }
  return pool[ri(0, pool.length-1)];
}

function filterUsjlTeamsForPlayer(teams, nat, playerAge){
  if(!teams) return [];
  playerAge=playerAge!=null?playerAge:(typeof G!=='undefined'&&G&&G.age?G.age:16);
  return teams.filter(function(t){
    if(isUsndtTeam(t.n)){
      if(!isUsaNationalTeamEligible(nat)) return false;
      return filterUsndtTeamByAge(t.n, playerAge);
    }
    return true;
  });
}

function isUsaWorldJuniorsPipelinePlayer(){
  if(!G||!isUsaNationalTeamEligible(G.nat)) return false;
  return isUsndtU18Team(G.team&&G.team.n);
}

/** Team USA U20: any American under 20 not on a full-time pro roster — USNDT U18 gets the largest OVR discount. */
function getUsaWorldJuniorsOvrDiscount(){
  if(!G||!isUsaNationalTeamEligible(G.nat)) return 0;
  if(G.leagueKey==='USJL'&&isUsndtU18Team(G.team&&G.team.n)) return 4.5;
  if(G.leagueKey==='USJL'&&isUsndtU17Team(G.team&&G.team.n)) return 1;
  if(G.leagueKey==='NCHA'||G.leagueKey==='NWCHA') return 1.5;
  return 0;
}

function getUsndtWorldJuniorsOvrDiscount(){
  return getUsaWorldJuniorsOvrDiscount();
}

function getUsndtOffseasonSwitchBlurb(switchOvr){
  if(!G||!isUsndtTeam(G.team&&G.team.n)) return '';
  var age=G.age||16;
  var draftAge=age+1;
  if(isUsndtU17Team(G.team.n)){
    return '<div class="vt" style="font-size:14px;color:var(--acc);margin-bottom:8px"><b>USNDT U17 (age 16):</b> <b>'+USNDT_U17_LEAGUE_GAMES+'</b> USJL league games plus <b>'+USNDT_U17_INTL_COUNT+'</b> international tournaments. You move to <b>U18</b> at age 17.</div>';
  }
  if(isUsndtU18Team(G.team.n)&&draftAge===18){
    return '<div class="vt" style="font-size:14px;color:var(--acc);margin-bottom:8px"><b>USNDT U18:</b> Draft year — CJL Challenge vs PHL draft-eligible CJL All-Stars. Most commit to NCHA college or turn pro after this season.</div>';
  }
  if(isUsndtU18Team(G.team.n)){
    return '<div class="vt" style="font-size:14px;color:var(--acc);margin-bottom:8px"><b>USNDT U18 squad:</b> <b>'+USNDT_U18_LEAGUE_GAMES+'</b> USJL league games, <b>'+USNDT_U18_COLLEGE_EXH+'</b> college exhibitions, CJL showcase + spring <b>CJL Challenge</b>. <b>World Juniors priority</b> — Team USA U20 favors USNDT call-ups.</div>';
  }
  return '';
}

function applyUsndtOffseasonOfferBias(offers, otherLeagues, tier){
  if(!G||!isUsndtTeam(G.team&&G.team.n)||tier!=='junior') return offers;
  var age=G.age||16;
  var draftAge=age+1;
  var colPick=G.gender==='M'?'NCHA':'NWCHA';
  var pOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):60;
  if(draftAge===18&&otherLeagues.indexOf(colPick)>=0&&offers.indexOf(colPick)<0){
    offers.unshift(colPick);
  }
  if(age===16&&pOvr>=66&&typeof qualifiesForUsndtU17Invite==='function'&&qualifiesForUsndtU17Invite(pOvr, G.potential, G.nat, age)&&Math.random()<0.5&&offers.indexOf('USJL')<0&&otherLeagues.indexOf('USJL')>=0){
    offers.push('USJL');
  }
  return offers;
}

/** Mid-season path: elite club USJL Americans can get called to U17. */
function maybeRecruitToUsndtU17(){
  if(!G||G.leagueKey!=='USJL'||!G.team||isUsndtTeam(G.team.n)) return;
  if((G.age||16)!==16||!isUsaNationalTeamEligible(G.nat)) return;
  var pOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):60;
  var pot=G.potential||'support';
  if(!qualifiesForUsndtU17Invite(pOvr, pot, G.nat, G.age)) return;
  if(G._usndtRecruitSeason===G.season) return;
  if(Math.random()>getUsndtU17DraftChance(pOvr, pot)*0.4) return;
  G.team={n:USNDT_U17_TEAM_NAME,e:'[★]'};
  G._usndtRecruitSeason=G.season;
  if(typeof onTeamChangeLeadershipReset==='function') onTeamChangeLeadershipReset();
  if(typeof genSeason==='function') G.allOpponents=genSeason('USJL',G.team);
  if(typeof G.league==='object'&&G.league&&typeof getUsndtSquadLeagueGames==='function'){
    G.league=Object.assign({}, G.league, {games:getUsndtSquadLeagueGames(G.team.n)});
  }
  addNews('USNDT U17 recruits '+G.first+' '+G.last+' from club USJL — national development roster.','big');
}

function initCjlUsndtData(){
  if(typeof LEAGUES!=='undefined'&&!LEAGUES.CJL){
    LEAGUES.CJL={
      name:'Canadian Junior League',
      short:'CJL',
      tier:'junior',
      gender:'M',
      games:4,
      gamesPerWeek:1,
      dev:1.42,
      salBase:0,
      desc:'National umbrella for OJL, QMJL, and WJL — Memorial Cup (round robin + BO7 final) each spring. High-scoring circuit; leaders often hit 95–130 pts.'
    };
  }
  if(typeof TEAMS!=='undefined'&&TEAMS.USJL){
    TEAMS.USJL=TEAMS.USJL.filter(function(t){ return t.n!==USNDT_LEGACY_TEAM_NAME; });
    var usndtSquads=[{n:USNDT_U18_TEAM_NAME,e:'[18]'},{n:USNDT_U17_TEAM_NAME,e:'[17]'}];
    var si, hasNm, ti;
    for(si=0;si<usndtSquads.length;si++){
      hasNm=false;
      for(ti=0;ti<TEAMS.USJL.length;ti++){
        if(TEAMS.USJL[ti].n===usndtSquads[si].n){ hasNm=true; break; }
      }
      if(!hasNm) TEAMS.USJL.unshift(usndtSquads[si]);
    }
  }
  if(typeof LEAGUES!=='undefined'&&LEAGUES.USJL){
    LEAGUES.USJL.desc='Premier U.S. junior — 16 import-heavy clubs plus USNDT (U17 age 16; U18 age 17+ with college exhibitions & CJL). USNDT dominates the '+USNDT_ORG_USJL_GAMES+'-game org standings record.';
    LEAGUES.USJL.dev=1.32;
  }
  if(typeof LEAGUES!=='undefined'&&LEAGUES.OJL){
    LEAGUES.OJL.desc='Ontario major junior — 20 teams, 68 games. Primary feeder to CJL Memorial Cup scoring races.';
  }
}

initCjlUsndtData();
