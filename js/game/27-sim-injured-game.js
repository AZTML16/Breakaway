/* breakaway — SIM INJURED GAME */
// ============================================================
// SIM INJURED GAME
// ============================================================
function simInjuredGame(i){
  if(i!==G.weekGames){
    notify('FINISH GAME '+(G.weekGames+1)+' ON THE SCHEDULE FIRST','gold');
    return;
  }
  G._curGameIdx=i;
  var perWeek=getGamesPerWeek(G.leagueKey);
  var weekStart=(G.week-1)*perWeek;
  var opp=G.allOpponents[weekStart+i]||curOpponent;
  var homeScore=ri(1,4);
  var awayScore=ri(1,5);
  var won=homeScore>awayScore;
  var tied=homeScore===awayScore;
  if(tied){ if(Math.random()<0.5) homeScore++; else awayScore++; won=homeScore>awayScore; tied=false; }
  if(typeof G.w==='undefined'){G.w=0;G.l=0;G.otl=0;}
  if(won){G.w++;} else {G.l++;}
  applyGameResultStreak(won,false);
  syncUserStandingsRow();
  G.stamina=cl(G.stamina-ri(0,5),0,100);
  if(G.injWks>0){G.injWks--;}
  if(G.injWks<=0){
    G.isInjured=false;
    addNews(G.first+' '+G.last+' cleared from injury -- back in the lineup!','good');
    notify('BACK IN ACTION!','green');
  }
  var sc=homeScore+'-'+awayScore;
  addNews(G.team.n+' '+sc+' vs '+opp.n+' -- '+(won?'WIN':'LOSS')+' [DNP -- INJURED]',(won?'neutral':'bad'));
  G.weekGames++;
  renderHub();show('s-hub');
}

function simScratchedGame(i){
  if(i!==G.weekGames){
    notify('FINISH GAME '+(G.weekGames+1)+' ON THE SCHEDULE FIRST','gold');
    return;
  }
  G._curGameIdx=i;
  var perWeek=getGamesPerWeek(G.leagueKey);
  var weekStart=(G.week-1)*perWeek;
  var opp=G.allOpponents[weekStart+i]||curOpponent;
  var homeScore=ri(1,4);
  var awayScore=ri(1,5);
  var won=homeScore>awayScore;
  var tied=homeScore===awayScore;
  if(tied){ if(Math.random()<0.5) homeScore++; else awayScore++; won=homeScore>awayScore; tied=false; }
  if(typeof G.w==='undefined'){G.w=0;G.l=0;G.otl=0;}
  if(won){G.w++;} else {G.l++;}
  applyGameResultStreak(won,false);
  syncUserStandingsRow();
  G.morale=cl(G.morale-(won?0:2),0,100);
  var sc=homeScore+'-'+awayScore;
  addNews(G.team.n+' '+sc+' vs '+opp.n+' -- '+(won?'WIN':'LOSS')+' [DNP -- HEALTHY SCRATCH]',(won?'neutral':'bad'));
  G.weekGames++;
  renderHub();show('s-hub');
}
