/* breakaway — LEAGUE TALENT NEWS (other players making headlines) */
// ============================================================
// LEAGUE TALENT NEWS (other players making headlines)
// Names: shared pool in name-pool.js
// ============================================================

function pickNewsLeagueTeam(excludeName){
  var pool=(TEAMS[G.leagueKey]||[]).slice();
  if(excludeName) pool=pool.filter(function(t){return t.n!==excludeName;});
  if(!pool.length) return {n:'a rival club'};
  return pool[ri(0,pool.length-1)];
}

function pickNewsRivalTeam(){
  var myTeam=G.team&&G.team.n;
  var perWeek=getGamesPerWeek(G.leagueKey);
  var weekStart=(G.week-1)*perWeek;
  var opp=null;
  if(G.allOpponents&&G.allOpponents.length){
    opp=G.allOpponents[weekStart+ri(0,perWeek-1)]||G.allOpponents[weekStart];
    if(opp&&typeof isLocalScheduleEvent==='function'&&isLocalScheduleEvent(opp)) opp=G.allOpponents[weekStart];
    if(opp&&opp.n===myTeam) opp=G.allOpponents[weekStart];
  }
  return opp&&opp.n?opp:pickNewsLeagueTeam(myTeam);
}

function pickNewsStandingsTeam(){
  if(G.standings&&G.standings.length){
    var row=G.standings[ri(0,Math.min(G.standings.length-1,14))];
    if(row&&row.team) return row.team;
  }
  return pickNewsLeagueTeam(G.team&&G.team.n);
}

function pickLeagueStarPlayer(leagueKey, minOvr, excludeTeam){
  var teams=(TEAMS[leagueKey]||[]).slice();
  if(excludeTeam) teams=teams.filter(function(t){return t.n!==excludeTeam;});
  if(!teams.length) return null;
  var tries=10, best=null, i, roster, pool;
  while(tries--){
    roster=typeof getLeagueTeamRoster==='function'?getLeagueTeamRoster(leagueKey, teams[ri(0,teams.length-1)].n):null;
    if(!roster||!roster.players) continue;
    pool=roster.players.filter(function(p){return !p.isMe&&(p.ovr||0)>=(minOvr||78);});
    if(!pool.length) pool=roster.players.filter(function(p){return !p.isMe;});
    pool.sort(function(a,b){return (b.ovr||0)-(a.ovr||0);});
    if(pool[0]&&(pool[0].ovr||0)>=(best?(best.ovr||0):0)) best=pool[0];
    if(best&&(best.ovr||0)>=(minOvr||82)) break;
  }
  return best;
}

function fmtNewsPlayer(p){
  if(!p) return getRandomTalentName();
  return (p.first||'')+' '+(p.last||'');
}

function getTradeDeadlineWeek(leagueKey){
  if(leagueKey==='PHL') return 19;
  if(leagueKey==='NAML') return 21;
  if(leagueKey==='PWL') return 8;
  if(leagueKey==='PWDL') return 18;
  return 0;
}

function isProTransactionLeague(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  return L.tier==='pro'||leagueKey==='PHL'||leagueKey==='NAML'||leagueKey==='PWL';
}

function fireBlockbusterTradeNews(leagueKey){
  var tA=pickNewsLeagueTeam(G.team&&G.team.n);
  var tB=pickNewsLeagueTeam(tA.n);
  var pA=pickLeagueStarPlayer(leagueKey, 84, tB.n);
  var pB=pickLeagueStarPlayer(leagueKey, 80, tA.n);
  var nA=fmtNewsPlayer(pA), nB=fmtNewsPlayer(pB);
  var ovrA=pA&&pA.ovr?pA.ovr:ri(84,92);
  var ovrB=pB&&pB.ovr?pB.ovr:ri(80,88);
  var picks=ri(1,3);
  var cash=['','',' a conditional pick,',' futures,'][ri(0,3)];
  var headlines=[
    'BLOCKBUSTER: '+tA.n+' acquire '+nA+' ('+ovrA+' OVR) from '+tB.n+' for '+nB+' ('+ovrB+' OVR)'+cash+' and '+picks+' pick'+(picks>1?'s':'')+'.',
    'TRADE DEADLINE STUNNER: '+tB.n+' send '+nA+' to '+tA.n+' in a '+ri(3,5)+'-piece megadeal — league sources call it a "franchise shift."',
    'SHOCK MOVE: '+nA+' traded to '+tA.n+' — '+nB+' and draft capital head the other way in a headline '+LEAGUES[leagueKey].short+' swap.'
  ];
  addNews(headlines[ri(0,headlines.length-1)],'big');
}

function maybeProTradeNews(leagueKey){
  var tA=pickNewsLeagueTeam(G.team&&G.team.n);
  var tB=pickNewsLeagueTeam(tA.n);
  var pA=pickLeagueStarPlayer(leagueKey, 78, tB.n);
  var pB=pickLeagueStarPlayer(leagueKey, 74, tA.n);
  var nA=fmtNewsPlayer(pA), nB=fmtNewsPlayer(pB);
  var lines=[
    'TRADE: '+tA.n+' land '+nA+' from '+tB.n+' for '+nB+' and a '+['2nd','3rd','4th'][ri(0,2)]+'-round pick.',
    'DEAL: '+tB.n+' ship '+nA+' to '+tA.n+' — depth-for-talent swap ahead of the playoff push.',
    'ROSTER MOVE: '+tA.n+' and '+tB.n+' complete a trade — '+nA+' changes sweaters.'
  ];
  addNews(lines[ri(0,lines.length-1)],'neutral');
}

function maybeTradeDeadlineBlockbusters(leagueKey){
  if(!G||G._tradeDeadlineFiredForSeason===G.season) return;
  G._tradeDeadlineFiredForSeason=G.season;
  var short=(LEAGUES[leagueKey]&&LEAGUES[leagueKey].short)||leagueKey;
  addNews('TRADE DEADLINE DAY: '+short+' phones melting — GMs chasing one more piece.','big');
  var n=ri(2,4), i;
  for(i=0;i<n;i++) fireBlockbusterTradeNews(leagueKey);
}

function maybeProRosterMoveNews(leagueKey){
  var team=pickNewsStandingsTeam();
  var p=pickLeagueStarPlayer(leagueKey, 76, team.n);
  var n=fmtNewsPlayer(p);
  var lines=[
    'WAIVERS: '+n+' claimed off waivers by '+team.n+'.',
    'RECALL: '+team.n+' recall '+n+' from the affiliate on a two-way deal.',
    'ASSIGNMENT: '+team.n+' send '+n+' down — cap/roster crunch.'
  ];
  addNews(lines[ri(0,lines.length-1)],'neutral');
}

function processLeagueTransactionNews(){
  if(!G||!G.leagueKey) return;
  var lk=G.leagueKey;
  if(!isProTransactionLeague(lk)) return;
  var deadline=getTradeDeadlineWeek(lk);
  if(deadline>0&&G.week===deadline){
    maybeTradeDeadlineBlockbusters(lk);
    return;
  }
  if(deadline>0&&G.week===deadline-1){
    addNews('TRADE DEADLINE TOMORROW: '+((LEAGUES[lk]&&LEAGUES[lk].short)||lk)+' rumor mill in overdrive.','neutral');
  }
  if(Math.random()<0.38) maybeProTradeNews(lk);
  else if(Math.random()<0.22) maybeProRosterMoveNews(lk);
}

function processOffseasonFreeAgencyNews(){
  if(!G||!G.leagueKey||!isProTransactionLeague(G.leagueKey)) return;
  if(G._faNewsFiredForSeason===G.season) return;
  G._faNewsFiredForSeason=G.season;
  var lk=G.leagueKey, short=(LEAGUES[lk]&&LEAGUES[lk].short)||lk;
  addNews('FREE AGENCY OPENS: '+short+' clubs hit the market — big money on the table.','big');
  var deals=ri(3,6), i, team, star, yrs, sal;
  for(i=0;i<deals;i++){
    team=pickNewsLeagueTeam(G.team&&G.team.n);
    star=pickLeagueStarPlayer(lk, 82, team.n)||{first:getRandomTalentName().split(' ')[0],last:getRandomTalentName().split(' ').slice(1).join(' '),ovr:ri(84,91)};
    yrs=ri(4,8);
    sal=lk==='PHL'?ri(6,14):ri(2,8);
    if(i===0){
      addNews('MEGA SIGNING: '+team.n+' agree to terms with '+fmtNewsPlayer(star)+' — reported '+yrs+' years, ~$'+sal+'M AAV.','big');
    } else if(i<3){
      addNews('FREE AGENCY: '+fmtNewsPlayer(star)+' signs with '+team.n+' ('+yrs+' yr, ~$'+sal+'M).','good');
    } else {
      addNews(team.n+' add '+fmtNewsPlayer(star)+' on a '+yrs+'-year deal.','neutral');
    }
  }
  if(Math.random()<0.55){
    var tA=pickNewsLeagueTeam(G.team&&G.team.n);
    var tB=pickNewsLeagueTeam(tA.n);
    addNews('SIGN-AND-TRADE: '+fmtNewsPlayer(pickLeagueStarPlayer(lk, 80, tB.n))+' lands with '+tA.n+' after a complicated FA routing.','neutral');
  }
}

function addLeagueTalentNews(){
  if(isProTransactionLeague(G.leagueKey)&&Math.random()<0.28){
    maybeProTradeNews(G.leagueKey);
    return;
  }
  var peerName=typeof getTeammateNameForNews==='function'?getTeammateNameForNews():getRandomTalentName();
  var myTeam=G.team&&G.team.n||'your club';
  var league=G.league.short||'league';
  var rival=pickNewsRivalTeam();
  var other=pickNewsStandingsTeam();
  var divLabel=typeof getTeamDivisionName==='function'?getTeamDivisionName(G.leagueKey,myTeam):'';
  var divBit=divLabel?(' the '+divLabel+' race'):'';
  var news=[
    function(){
      var n=peerName;
      addNews('INSIDE '+myTeam.toUpperCase()+': '+n+' tells local media the room is "hungry" after back-to-back '+league+' wins.','good');
    },
    function(){
      var n=getRandomTalentName();
      var t=pickNewsLeagueTeam(myTeam);
      addNews('TRADE RUMOR: '+t.n+' and '+rival.n+' linked in a '+ri(2,4)+'-team rumor mill swirl -- '+n+' name keeps surfacing.','neutral');
    },
    function(){
      var n=peerName;
      addNews(n+' named '+league+' Player of the Week -- '+ri(3,6)+' points and the building knew it was his night.','good');
    },
    function(){
      var n=getRandomTalentName();
      addNews(n+' inks a short extension with '+other.n+' -- "I want to finish what we started," he says.','neutral');
    },
    function(){
      var n=getRandomTalentName();
      addNews('INJURY WIRE: '+n+' ('+other.n+') out '+ri(2,6)+' weeks -- upper-body, no timetable for contact.','bad');
    },
    function(){
      var n=getRandomTalentName();
      addNews('SCOUTS BUZZ: '+n+' drawing eyes from pro staffs -- "He plays bigger than the box score," one director says.','neutral');
    },
    function(){
      var n=getRandomTalentName();
      addNews('HAT TRICK ALERT: '+n+' buries three as '+other.n+' erupts -- fans litter the ice with caps.','big');
    },
    function(){
      var n=getRandomTalentName();
      addNews(n+' hits '+ri(200,400)+' career points in '+league+' play -- standing ovation at the horn.','good');
    },
    function(){
      var n=peerName;
      addNews('BETWEEN THE PIPES: '+n+' steals '+league+' Goalie of the Week with a '+ri(28,36)+'-save shutout feel.','good');
    },
    function(){
      var n=getRandomTalentName();
      addNews('SOUND BITE: '+n+' ('+other.n+') -- "Nobody in our room is satisfied. We want the whole thing."','neutral');
    },
    function(){
      var n=getRandomTalentName();
      addNews('CONTRACT WATCH: Talks stall between '+other.n+' and '+n+' -- agent hints at a summer market.','neutral');
    },
    function(){
      var n=getRandomTalentName();
      addNews('OLD-TIME HOCKEY: '+n+' drops the gloves and rattles '+rival.n+' with '+ri(8,14)+' hits -- bench loves it.','neutral');
    },
    function(){
      var n=peerName;
      addNews(myTeam+' recalls '+n+' from the affiliate -- depth move before a heavy '+league+' week.','neutral');
    },
    function(){
      var n=getRandomTalentName();
      addNews(rival.n+' coach calls '+n+' "the guy who tilted the ice" after a '+ri(2,4)+'-goal night.','neutral');
    },
    function(){
      var n=getRandomTalentName();
      addNews(divBit?('STANDINGS HEAT'+divBit+': '+other.n+' leapfrog talk after a wild OT win.'):('STANDINGS SHAKE-UP: '+other.n+' climb the table after a wild OT win.'),'good');
    },
    function(){
      var n=getRandomTalentName();
      addNews('POWER PLAY SURGE: '+other.n+' click at '+ri(28,42)+'% over the last week -- '+n+' running point.','neutral');
    },
    function(){
      var n=peerName;
      addNews('TEAMMATE WATCH: '+n+' picks up a secondary assist on every '+myTeam+' goal this week -- quiet star.','good');
    },
    function(){
      var n=getRandomTalentName();
      addNews('ROAD TRIP GRIND: '+other.n+' bus through three cities in four nights -- '+n+' says legs are fine, minds are not.','neutral');
    },
    function(){
      addNews('RIVALRY REMINDER: '+myTeam+' and '+rival.n+' meet again soon -- last one had '+ri(48,62)+' combined hits.','neutral');
    },
    function(){
      var n=getRandomTalentName();
      addNews('ROOKIE SPOTLIGHT: '+n+' ('+other.n+') first multi-point game -- crowd chants his name in the third.','good');
    },
    function(){
      var n=getRandomTalentName();
      addNews('DISCIPLINE: '+n+' suspended one game for a late hit vs '+rival.n+' -- team will appeal.','bad');
    },
    function(){
      var n=getRandomTalentName();
      addNews('GOALIE DUEL: '+n+' and a '+rival.n+' netminder trade '+ri(30,38)+'-save periods -- final goes to a shootout.','neutral');
    }
  ];
  news[ri(0,news.length-1)]();
}
