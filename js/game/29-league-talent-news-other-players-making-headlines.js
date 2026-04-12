/* breakaway — LEAGUE TALENT NEWS (other players making headlines) */
// ============================================================
// LEAGUE TALENT NEWS (other players making headlines)
// ============================================================
var TALENT_FIRST = [
  'Caden','Wyatt','Niko','Dmitri','Patrik','Alexei','Jordan','Connor','Brayden','Tomas',
  'Mikael','Owen','Sergei','Jesse','Tyler','Marcus','Stefan','Ryan','Kyle','Jake',
  'Mohammad','Yusuf','Hiroshi','Wei','Luca','Carlos','Aarav','Matteo','Kenji','Rafael',
  'Emma','Taylor','Sofia','Annika','Petra','Cassidy','Maya','Nadia','Jules','Raina',
  'Fatima','Yuki','Priya','Amara','Valentina','Ibrahim','Arjun','Hamid','Felix','Zara'
];
var TALENT_LAST = [
  'Forsberg','Volkov','Haugen','Sundqvist','Malashenko','Kuznetsov','Ashworth','Healy',
  'Tremblay','Dvoracek','Lindqvist','Ritchie','Callahan','Fairbanks','Morrison','Kovacs',
  'Holmberg','Okafor','Bernier','Petrov','Al-Rashid','Okonkwo','Tanaka','Zhang','Ferretti',
  'Reyes','Sharma','Russo','Watanabe','Moura','Diallo','Nair','Rezaei','Nguyen','Osei'
];

function getRandomTalentName(){
  return TALENT_FIRST[ri(0,TALENT_FIRST.length-1)]+' '+TALENT_LAST[ri(0,TALENT_LAST.length-1)];
}

function addLeagueTalentNews(){
  var news=[
    function(){var n=getRandomTalentName();addNews(n+' hits '+ri(2,5)+' points in last 3 games -- leading scorer push in '+G.league.short+'.','neutral');},
    function(){var n=getRandomTalentName();addNews(n+' traded to '+shuf(TEAMS[G.leagueKey]||[{n:'rival'}])[0].n+' -- blockbuster move shakes up the league.','neutral');},
    function(){var n=getRandomTalentName();addNews(n+' named '+G.league.short+' Player of the Week after '+ri(3,5)+'-point outing.','neutral');},
    function(){var n=getRandomTalentName();addNews(n+' signs extension -- stays with club through next season.','neutral');},
    function(){var n=getRandomTalentName();addNews(n+' placed on injured reserve -- '+ri(2,6)+' week timeline.','neutral');},
    function(){var n=getRandomTalentName();addNews('Scouts raving about '+n+' -- projected top prospect for upcoming draft.','neutral');},
    function(){var n=getRandomTalentName();addNews(n+' notches hat trick -- '+G.league.short+' fans calling it one of the best performances of the year.','neutral');},
    function(){var n=getRandomTalentName();addNews(n+' passes '+ri(200,400)+' career points -- milestone night at home.','neutral');},
    function(){addNews(G.team.n+' sign depth forward ahead of trade deadline -- management bolsters lineup.','neutral');},
    function(){var n=getRandomTalentName();addNews(n+' speaks out: \'We\'re not satisfied. This team is built to win.\'','neutral');},
    function(){var n=getRandomTalentName();addNews('League insiders link '+n+' to a potential summer move after contract talks stall.','neutral');},
    function(){var n=getRandomTalentName();addNews(n+' posts '+ri(8,15)+' hits in a rivalry game -- tone-setting performance.','neutral');},
    function(){addNews('Front office rumors: '+G.league.short+' clubs exploring major cap-clearing deals before camp.','neutral');}
  ];
  // Pick 1-2 random news items
  var picks=shuf(news.slice()).slice(0,ri(1,2));
  picks.forEach(function(fn){fn();});
}
