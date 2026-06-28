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

function addLeagueTalentNews(){
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
