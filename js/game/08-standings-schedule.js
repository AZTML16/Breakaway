/* breakaway — STANDINGS + SCHEDULE */
// ============================================================
// STANDINGS + SCHEDULE
// ============================================================
function buildStandings(lk){
  var teams=(TEAMS[lk]||TEAMS['OJL']).slice();
  var shuffled=shuf(teams);
  var result=[];
  var totalGames=LEAGUES[lk].games||68;
  var perWeek=getGamesPerWeek(lk);
  var played=0;
  if(typeof G!=='undefined'&&G&&G.leagueKey===lk){
    played=Math.min(totalGames,((G.week-1)*perWeek)+(G.weekGames||0));
  }
  for(var i=0;i<shuffled.length;i++){
    var t=shuffled[i];
    var isMe=(G&&G.team&&t.n===G.team.n);
    var gp=isMe?G.gp:Math.max(0,Math.min(totalGames,played+ri(-1,1)));
    var w,l,otl;
    if(isMe){
      w=G.w||0; l=G.l||0; otl=G.otl||0;
      gp=Math.max(gp,G.gp);
    } else {
      var strength=(shuffled.length-i)/(shuffled.length-1||1);
      var winPct=cl(0.24 + strength*0.42 + (ri(-8,8)/100),0.14,0.76);
      w=Math.round(gp*winPct);
      var rem=Math.max(0,gp-w);
      otl=Math.round(rem*0.12);
      l=rem-otl;
    }
    result.push({team:t,gp:gp,w:w,l:l,otl:otl,pts:w*2+otl,isMe:isMe,leagueKey:lk});
  }
  result.sort(function(a,b){return b.pts-a.pts;});
  return result;
}

function getGamesPerWeek(lk){
  return (LEAGUES[lk] && LEAGUES[lk].gamesPerWeek) ? LEAGUES[lk].gamesPerWeek : 3;
}

/** OVR at which you're considered "PPG-caliber" for this league (women's leagues: -30 vs men's bar — e.g. PWL 60 vs PHL 90). */
function getPpgCaliberOvrThreshold(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  var isF=L.gender==='F';
  var base=72;
  if(leagueKey==='PHL'||leagueKey==='PWL') base=90;
  else if(L.tier==='college') base=70;
  else if(L.tier==='junior'){
    base=65;
    if(leagueKey==='NEJC'||leagueKey==='CEJC'||leagueKey==='ARJC'||leagueKey==='EWJC'||leagueKey==='AWJC') base=60;
  } else if(L.tier==='euro'||L.tier==='asia'){
    var harder=['NEHL','CEHL','ARHL','SDHL','FWHL','AWHL'];
    base= harder.indexOf(leagueKey)!==-1 ? 75 : 70;
  }
  if(isF) base-=30;
  return Math.max(28, base);
}

/** Men's ELC-ready bar; women's path is 30 OVR lower (e.g. 80 → 50). */
var DRAFT_CLUB_ELC_MIN_OVR_MEN=80;
function getDraftClubElcMinOvr(){
  if(typeof G==='undefined'||!G) return DRAFT_CLUB_ELC_MIN_OVR_MEN;
  return G.gender==='F'?Math.max(25, DRAFT_CLUB_ELC_MIN_OVR_MEN-30):DRAFT_CLUB_ELC_MIN_OVR_MEN;
}
function getEliteReadyOvrBar(){
  if(typeof G==='undefined'||!G) return 83;
  return G.gender==='F'?Math.max(40, 83-30):83;
}
function getProAffiliateDemotionMaxOvr(){
  if(typeof G==='undefined'||!G) return 80;
  return G.gender==='F'?50:80;
}
/** Men 75 / women 45 (-30): (1) main-pro hard floor before reassignment, (2) min OVR to join NAML/PWDL from junior/college/semi-pro — below = stay dev path. */
function getProHardDevelopmentFloorOvr(){
  if(typeof G==='undefined'||!G) return 75;
  return G.gender==='F'?45:75;
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
  var sc=home+'-'+away;
  addNews(G.team.n+' '+sc+' vs '+opp.n+' -- '+(won?'WIN':tied?'TIE':'LOSS')+' [BACKUP: '+backup+' -- YOU DID NOT DRESS]',(won?'good':tied?'neutral':'bad'));
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
