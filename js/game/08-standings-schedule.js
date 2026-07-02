/* breakaway — STANDINGS + SCHEDULE */
// ============================================================
// STANDINGS + SCHEDULE
// ============================================================
function teamStandingsStrength(teamName, lk){
  if(typeof getTeamStandingsStrengthFromProfile==='function'){
    return getTeamStandingsStrengthFromProfile(lk, teamName);
  }
  var h=0, s=String(teamName)+'|'+String(lk||'');
  for(var i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0;
  var base=0.22+((Math.abs(h)%1000)/1000)*0.48;
  if(lk==='USJL'&&typeof isUsndtOrgStandingsTeam==='function'&&isUsndtOrgStandingsTeam(teamName)){
    if(typeof getUsndtStandingsStrength==='function') return getUsndtStandingsStrength(teamName);
    return cl(base+0.32, 0.72, 0.86);
  }
  if(typeof getMajorJuniorEliteOrgStandingsBonus==='function'){
    base+=getMajorJuniorEliteOrgStandingsBonus(lk, teamName);
  }
  return cl(base, 0.14, 0.86);
}

/** Worst-to-best draft order for a pro league (weak teams pick first). */
function getProDraftOrder(proKey){
  var teams=TEAMS[proKey]||[];
  var rows=teams.map(function(t){
    return {team:t, strength:teamStandingsStrength(t.n, proKey)};
  });
  rows.sort(function(a,b){return a.strength-b.strength;});
  return rows.map(function(r){return r.team;});
}

function getProDraftPickTeam(proKey, pickQuality){
  var order=getProDraftOrder(proKey);
  if(!order.length) return {n:'Pro Club'};
  var idx=Math.floor(cl(pickQuality, 0, 0.999)*(order.length-1));
  return order[idx]||order[0];
}

function initStandings(lk){
  var teams=(TEAMS[lk]||TEAMS['OJL']).slice();
  if(lk==='USJL'&&typeof collapseUsjlStandingsTeams==='function') teams=collapseUsjlStandingsTeams(teams);
  var result=[], i, t, isMe;
  for(i=0;i<teams.length;i++){
    t=teams[i];
    isMe=(G&&G.team&&(t.n===G.team.n||(typeof isUsndtTeam==='function'&&isUsndtTeam(G.team.n)&&typeof isUsndtOrgStandingsTeam==='function'&&isUsndtOrgStandingsTeam(t.n))));
    result.push({
      team:t, gp:0, w:0, l:0, otl:0, pts:0, isMe:isMe,
      leagueKey:lk, strength:teamStandingsStrength(t.n, lk)
    });
  }
  return result;
}

/** Stable league table — CPU strength is fixed per team; only calendar games advance. */
function refreshStandings(lk){
  if(typeof G==='undefined'||!G) return [];
  var teams=(TEAMS[lk]||[]);
  if(lk==='USJL'&&typeof collapseUsjlStandingsTeams==='function') teams=collapseUsjlStandingsTeams(teams);
  if(!G.standings||!G.standings.length||G.standings[0].leagueKey!==lk||G.standings.length!==teams.length){
    G.standings=initStandings(lk);
  }
  var totalGames=LEAGUES[lk].games||68;
  if(lk==='USJL'&&G.leagueKey===lk&&G.team&&typeof isUsndtTeam==='function'&&isUsndtTeam(G.team.n)&&typeof getUsndtSquadLeagueGames==='function'){
    totalGames=getUsndtSquadLeagueGames(G.team.n);
  }
  var perWeek=getGamesPerWeek(lk);
  var played=0;
  if(G.leagueKey===lk){
    var lkTier=LEAGUES[lk]&&LEAGUES[lk].tier;
    if(lkTier==='local'&&typeof countCompletedLocalGames==='function'){
      played=countCompletedLocalGames();
    } else if(lk==='USJL'&&typeof getUsjlLeagueProgress==='function'){
      played=getUsjlLeagueProgress();
      if(typeof isUsndtTeam==='function'&&isUsndtTeam(G.team&&G.team.n)){
        played=Math.min(totalGames, G.gp||0);
      } else {
        played=Math.min((LEAGUES.USJL&&LEAGUES.USJL.games)||62, played);
      }
    } else {
      played=Math.min(totalGames,((G.week-1)*perWeek)+(G.weekGames||0));
    }
  }
  for(var i=0;i<G.standings.length;i++){
    var row=G.standings[i];
    if(!row.team) continue;
    row.leagueKey=lk;
    row.isMe=!!(G.team&&(row.team.n===G.team.n||(typeof isUsndtTeam==='function'&&isUsndtTeam(G.team.n)&&typeof isUsndtOrgStandingsTeam==='function'&&isUsndtOrgStandingsTeam(row.team.n))));
    if(row.isMe){
      row.gp=G.gp||0;
      row.w=G.w||0;
      row.l=G.l||0;
      row.otl=G.otl||0;
    } else {
      if(typeof row.strength!=='number') row.strength=teamStandingsStrength(row.team.n, lk);
      var simGp=lk==='USJL'&&typeof getUsjlTeamStandingsGp==='function'?getUsjlTeamStandingsGp(row.team.n):played;
      row.gp=simGp;
      var winPct=cl(row.strength,0.14,0.76);
      row.w=Math.round(row.gp*winPct);
      var rem=Math.max(0,row.gp-row.w);
      row.otl=Math.round(rem*0.12);
      row.l=rem-row.otl;
    }
    row.pts=row.w*2+row.otl;
  }
  G.standings.sort(function(a,b){return b.pts-a.pts;});
  return G.standings;
}

function buildStandings(lk){
  return refreshStandings(lk);
}

function applyGameResultStreak(won, tied){
  if(typeof G==='undefined'||!G) return;
  var prevType=G.streakType||'none';
  if(won){
    G.streakType='W';
    G.streakCount=(prevType==='W'?G.streakCount:0)+1;
    G._curHotStreak=(G._curHotStreak||0)+1;
    if(G._curHotStreak>(G._seasonHotStreak||0)) G._seasonHotStreak=G._curHotStreak;
  } else if(tied){
    G.streakType='OTL';
    G.streakCount=(prevType==='OTL'?G.streakCount:0)+1;
    G._curHotStreak=0;
  } else {
    G.streakType='L';
    G.streakCount=(prevType==='L'?G.streakCount:0)+1;
    G._curHotStreak=0;
  }
}

function syncUserStandingsRow(){
  if(!G||!G.standings) return;
  var gp,w,l,otl;
  if(G._callUpCtx&&G._callUpCtx.active&&G._callUpCtx.stintStats){
    var st=G._callUpCtx.stintStats;
    gp=st.gp||0; w=st.w||0; l=st.l||0; otl=st.otl||0;
  } else {
    gp=G.gp||0; w=G.w||0; l=G.l||0; otl=G.otl||0;
  }
  for(var i=0;i<G.standings.length;i++){
    var isMeRow=G.standings[i].team&&(G.standings[i].team.n===G.team.n||(typeof isUsndtTeam==='function'&&isUsndtTeam(G.team.n)&&typeof isUsndtOrgStandingsTeam==='function'&&isUsndtOrgStandingsTeam(G.standings[i].team.n)));
    if(G.standings[i].isMe||isMeRow){
      G.standings[i].isMe=true;
      G.standings[i].gp=gp;
      G.standings[i].w=w;
      G.standings[i].l=l;
      G.standings[i].otl=otl;
      G.standings[i].pts=w*2+otl;
      break;
    }
  }
}

function getGamesPerWeek(lk){
  return (LEAGUES[lk] && LEAGUES[lk].gamesPerWeek) ? LEAGUES[lk].gamesPerWeek : 3;
}

function getSeasonWeekCount(lk){
  if(typeof isLocalLeague==='function'&&isLocalLeague(lk)&&typeof getLocalSeasonWeekCount==='function'){
    return getLocalSeasonWeekCount(lk);
  }
  if(lk==='USJL'&&typeof G!=='undefined'&&G&&G.team&&typeof isUsndtTeam==='function'&&isUsndtTeam(G.team.n)&&typeof getUsndtSquadLeagueGames==='function'){
    var pw=getGamesPerWeek(lk);
    return Math.ceil((getUsndtSquadLeagueGames(G.team.n)+getUsndtSquadExtraSlots(G.team.n))/pw);
  }
  var L=LEAGUES[lk]||{};
  return Math.ceil((L.games||68)/getGamesPerWeek(lk));
}

/** True when the regular-season calendar is finished (all LHL slots done, or week past schedule). */
function isRegularSeasonComplete(leagueKey){
  if(typeof G==='undefined'||!G) return false;
  if(typeof ensureLeagueContext==='function') ensureLeagueContext();
  if(G._seasonEndLoggedForSeason===G.season) return true;
  var lk=leagueKey||G.leagueKey;
  if(typeof isLocalLeague==='function'&&isLocalLeague(lk)){
    if(typeof isLocalScheduleComplete==='function'&&isLocalScheduleComplete(lk)) return true;
    var slots=typeof getLocalSeasonScheduleSlots==='function'?getLocalSeasonScheduleSlots(lk):18;
    var perWeek=(G.league.gamesPerWeek)||2;
    var done=((G.week||1)-1)*perWeek+(G.weekGames||0);
    if(G.allOpponents&&G.allOpponents.length>0&&done>=G.allOpponents.length) return true;
    if(done>=slots) return true;
  }
  if(!G.league) return false;
  if(G.allOpponents&&G.allOpponents.length>0){
    var perWk=getGamesPerWeek(lk);
    var done=((G.week||1)-1)*perWk+(G.weekGames||0);
    if(done>=G.allOpponents.length) return true;
  }
  var totalWks=typeof getSeasonWeekCount==='function'?getSeasonWeekCount(lk):Math.ceil((G.league.games||68)/Math.max(1,getGamesPerWeek(lk)));
  return (G.week||1)>totalWks;
}

function maybeEndRegularSeason(){
  if(!G||G._inOffseason||(G._playoffCtx&&G._playoffCtx.active)) return;
  if(typeof isRegularSeasonComplete!=='function'||!isRegularSeasonComplete()) return;
  if(typeof endRegSeason==='function') endRegSeason();
}

/** OVR at which you're considered "PPG-caliber" for this league. */
function getPpgCaliberOvrThreshold(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  var base=65;
  if(leagueKey==='PHL'||leagueKey==='PWL') base=82;
  else if(leagueKey==='NAML'||leagueKey==='PWDL') base=72;
  else if(L.tier==='college') base=75;
  else if(leagueKey==='CEHL') base=50;
  else if(leagueKey==='FHL') base=62;
  else if(leagueKey==='NEHL') base=72;
  else if(L.tier==='euro'||L.tier==='asia') base=78;
  else if(L.tier==='minor') base=74;
  else if(L.tier==='minor') base=74;
  else if(L.tier==='local') base=52;
  else if(L.tier==='junior'){
    if(leagueKey==='OJL'||leagueKey==='CWHL') base=65;
    else if(leagueKey==='QMJL'||leagueKey==='WJL') base=64;
    else if(leagueKey==='USJL'||leagueKey==='USWDL') base=62;
    else if(leagueKey==='NEJC'||leagueKey==='CEJC'||leagueKey==='ARJC'||leagueKey==='EWJC'||leagueKey==='AWJC') base=58;
    else base=63;
  }
  return base;
}

var DRAFT_CLUB_ELC_MIN_OVR_MEN=76;
function getDraftClubElcMinOvr(){
  return DRAFT_CLUB_ELC_MIN_OVR_MEN;
}
function getPhlRosterFloorOvr(){
  return 80;
}
function getMinorLeagueOvrCeiling(){
  return 84;
}
function getMinorLeagueOvrFloor(){
  return 72;
}
function getPhlPromotionFromMinorOvr(){
  return 85;
}
function playerTooGoodForMinorLeague(playerOvr){
  return (playerOvr||0)>=getMinorLeagueOvrCeiling();
}
function playerQualifiesForPhlRoster(playerOvr){
  return (playerOvr||0)>=getPhlRosterFloorOvr();
}
function getEliteReadyOvrBar(){
  return 85;
}
function getProAffiliateDemotionMaxOvr(){
  return 83;
}
function getProHardDevelopmentFloorOvr(){
  return getPhlRosterFloorOvr();
}

function recordPlayoffLogFromResult(playoff){
  if(!playoff||playoff.roundReached==null||playoff.roundReached==='') return;
  G.playoffLog=G.playoffLog||[];
  G.playoffLog.push({
    year:G.year,
    league:G.league.short,
    team:G.team.n,
    round:playoff.roundReached,
    wonCup:!!playoff.wonCup,
    isGoalie:G.pos==='G',
    gp:_lastPlayoffStats?_lastPlayoffStats.gp:0,
    g:_lastPlayoffStats?_lastPlayoffStats.g:0,
    a:_lastPlayoffStats?_lastPlayoffStats.a:0,
    sv:_lastPlayoffStats?_lastPlayoffStats.sv:0,
    ga:_lastPlayoffStats?_lastPlayoffStats.ga:0
  });
}

function evaluateLeadershipAtSeasonEnd(){
  var completedTenure=(G.teamTenure||0)+1;
  var elite=false, decent=false, severe=false;
  if(G.pos==='G'){
    var sv=(G.saves+(G.goalsAgainst||0))>0?G.saves/(G.saves+(G.goalsAgainst||0)):0;
    elite=sv>=0.925; decent=sv>=0.905; severe=sv<0.885;
  } else {
    var ppg=G.gp>0?(G.goals+G.assists)/G.gp:0;
    var ppgBar=getPpgCaliberOvrThreshold(G.leagueKey);
    var oLead=ovr(G.attrs,G.pos);
    elite=ppg>=1.0&&oLead>=ppgBar;
    decent=ppg>=0.65&&oLead>=Math.max(48,ppgBar-12);
    severe=ppg<0.35||oLead<Math.max(42,ppgBar-22);
  }
  if(G.leadershipRole==='C'){
    // Captains are rarely stripped out of respect.
    if((severe||G.morale<35) && Math.random()<0.08){
      G.leadershipRole='A';
      addNews('Leadership update: '+G.first+' '+G.last+' moves from C to A after a difficult year.','neutral');
    }
  } else if(G.leadershipRole==='A'){
    if(completedTenure>=3 && elite && G.morale>=70 && Math.random()<0.45){
      G.leadershipRole='C';
      addNews('Named CAPTAIN: '+G.first+' '+G.last+' earns the C for '+G.team.n+'.','big');
      notify('NAMED CAPTAIN','gold');
    } else if((severe||G.morale<40) && Math.random()<0.35){
      G.leadershipRole='';
      addNews('Leadership update: '+G.first+' '+G.last+' loses alternate duties.','neutral');
    }
  } else {
    if(completedTenure>=1 && decent && G.morale>=55 && Math.random()<0.6){
      G.leadershipRole='A';
      addNews('Named ALTERNATE: '+G.first+' '+G.last+' earns an A for '+G.team.n+'.','good');
    }
  }
}

function onTeamChangeLeadershipReset(){
  if(G.leadershipRole==='C'){
    if(Math.random()<0.12){
      G.leadershipRole='A';
      addNews('New room, same respect: '+G.first+' keeps a letter (A) after move.','neutral');
    } else {
      addNews('Out of respect, '+G.first+' '+G.last+' keeps the C with new club leadership group.','good');
    }
  } else if(G.leadershipRole==='A'){
    if(Math.random()<0.45) G.leadershipRole='';
  }
  G.teamTenure=0;
  G._teamRosterKey=null;
  G._leagueStatsKey=null;
  G.teamRoster=null;
  G.leaguePlayerStats=null;
  if(G.league&&G.league.tier!=='junior'&&Array.isArray(G.juniorTeammateIds)){
    G.juniorTeammateIds.forEach(function(m){ m.promoted=false; });
  }
  maybeClearDraftRightsIfLeftHoldingClub();
}

/** Leaving the club that held your entry rights (same pro league, different team) ends those rights -- you are not a "new draftee" anymore. */
function maybeClearDraftRightsIfLeftHoldingClub(){
  if(!G.draftRights) return;
  var dr=G.draftRights;
  if(G.leagueKey===dr.leagueKey && G.team && G.team.n!==dr.team){
    G._formerDraftClubName=dr.team;
    G.draftRights=null;
    G._draftStatusText='DRAFT RIGHTS: NONE (LEFT ORIGINAL CLUB)';
    addNews('Draft/list rights released: no longer property of '+dr.team+' after roster change.','neutral');
  }
}

function genSeason(lk,myTeam){
  if(typeof isLocalLeague==='function'&&isLocalLeague(lk)&&typeof genLocalSeason==='function'){
    return genLocalSeason(lk,myTeam);
  }
  if(lk==='USJL'&&typeof genUsjlSeason==='function'){
    return genUsjlSeason(lk,myTeam);
  }
  var teams=TEAMS[lk]||[];
  var opp=teams.filter(function(t){return t.n!==myTeam.n;});
  if(!opp.length) opp=teams.slice();
  var perWeek=getGamesPerWeek(lk);
  var totalWeeks=Math.ceil((LEAGUES[lk].games||68)/perWeek);
  var games=[];
  for(var w=0;w<totalWeeks;w++){
    var pick=shuf(opp.slice()).slice(0,perWeek);
    while(pick.length<perWeek) pick.push(opp[ri(0,opp.length-1)]);
    for(var i=0;i<pick.length;i++) games.push(pick[i]);
  }
  return games;
}

// Goalies do not start every game -- backup gets some nights (mask per week).
var BACKUP_GOALIE_NAMES=[
  'Casey Vaughn','Riley Korchak','Sam Okonkwo','Alex Petrenko','Jordan Miles','Morgan Ellis',
  'Quinn Haber','Devon Sato','Jamie Forsyth','Taylor Ng','Reese Kowalczyk','Skyler Brandt',
  'Avery Cho','Drew Kaminski','Blake Sorokin','Cameron Yates','Logan Petrov','Sidney Okoro'
];
function buildGoalieStartMask(perWeek){
  var mask=[],j;
  for(j=0;j<perWeek;j++) mask.push(true);
  if(perWeek<=1) return mask;
  var sitouts=1;
  if(perWeek>=3&&Math.random()<0.3) sitouts=2;
  if(perWeek>=4&&Math.random()<0.18) sitouts=Math.min(sitouts+1,perWeek-1);
  sitouts=Math.min(sitouts,perWeek-1);
  var idxs=[];
  for(j=0;j<perWeek;j++) idxs.push(j);
  idxs=shuf(idxs);
  for(j=0;j<sitouts;j++) mask[idxs[j]]=false;
  var any=false;
  for(j=0;j<perWeek;j++) if(mask[j]) any=true;
  if(!any) mask[ri(0,perWeek-1)]=true;
  return mask;
}
function ensureGoalieStartMask(){
  if(G.pos!=='G') return null;
  var perWeek=getGamesPerWeek(G.leagueKey);
  if(G._goalieMaskWeek!==G.week){
    G._goalieMaskWeek=G.week;
    G._goalieWeekStartMask=buildGoalieStartMask(perWeek);
    G._goalieBackupNamesForWeek=[];
    for(var i=0;i<perWeek;i++){
      G._goalieBackupNamesForWeek[i]=BACKUP_GOALIE_NAMES[ri(0,BACKUP_GOALIE_NAMES.length-1)];
    }
  }
  return G._goalieWeekStartMask;
}
/** Team game with backup in net -- no GP / saves / GA for you. */
function simBackupGoalieNight(opp,gameIndex,weeklyStats){
  var backup=(G._goalieBackupNamesForWeek&&G._goalieBackupNamesForWeek[gameIndex])?G._goalieBackupNamesForWeek[gameIndex]:BACKUP_GOALIE_NAMES[0];
  var perf=ovr(G.attrs,G.pos);
  var baseline=getLeagueBaselineOvr(G.leagueKey);
  var rel=(perf-baseline)/20;
  var perfBias=cl(rel,-1.2,1.4);
  var teamBase=2.05+perfBias*0.45+rd(-1.15,1.05);
  var oppBase=2.38-perfBias*0.22+rd(-1.05,1.05);
  var home=Math.max(0,Math.round(teamBase));
  var away=Math.max(0,Math.round(oppBase));
  if(home===away&&Math.random()<0.55) home++;
  if(away===home+1&&Math.random()<0.2) home++;
  var won=home>away;
  var tied=home===away;
  if(tied){ if(Math.random()<0.5) home++; else away++; won=home>away; tied=false; }
  if(typeof G.w==='undefined'){G.w=0;G.l=0;G.otl=0;}
  if(won){G.w++;} else {G.l++;}
  applyGameResultStreak(won,false);
  syncUserStandingsRow();
  var sc=home+'-'+away;
  addNews(G.team.n+' '+sc+' vs '+opp.n+' -- '+(won?'WIN':'LOSS')+' [BACKUP: '+backup+' -- YOU DID NOT DRESS]',(won?'good':'bad'));
  G.morale=cl(G.morale+(won?2:tied?0:-2),0,100);
  G.xp+=Math.round(ri(4,10)*getPotentialXpMult(G.potential||'support'));
  if(weeklyStats) weeklyStats.backupNights=(weeklyStats.backupNights||0)+1;
}
function simBackupGoalieGame(i){
  if(G.pos!=='G'||G.isInjured) return;
  if(i!==G.weekGames){
    notify('FINISH GAME '+(G.weekGames+1)+' ON THE SCHEDULE FIRST','gold');
    return;
  }
  var mask=ensureGoalieStartMask();
  if(!mask||mask[i]){
    notify('YOU ARE LISTED AS STARTER -- USE PLAY','gold');
    return;
  }
  var perWeek=getGamesPerWeek(G.leagueKey);
  var weekStart=(G.week-1)*perWeek;
  var opp=G.allOpponents[weekStart+i];
  if(!opp) return;
  curOpponent=opp;
  G._curGameIdx=i;
  simBackupGoalieNight(opp,i,null);
  G.weekGames++;
  renderHub();
  show('s-hub');
}
