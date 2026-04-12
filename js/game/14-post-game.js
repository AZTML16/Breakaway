/* breakaway — POST-GAME */
// ============================================================
// POST-GAME
// ============================================================
function endGame(){
  // For goalies: add bulk shots faced (key moments are snapshots; full game has 25-35+ shots)
  if(G.pos==='G'){
    var bulkShots=ri(22,34);
    var svRate=cl(0.88+(G.attrs.reflexes+G.attrs.positioning-120)*0.001,0.82,0.96);
    var bulkSaves=Math.round(bulkShots*svRate);
    var bulkGA=bulkShots-bulkSaves;
    gameStats.sv+=bulkSaves;
    gameStats.ga+=bulkGA;
    // Adjust scoreline to reflect extra goals
    gameAwayScore+=bulkGA;
  }
  var won=gameHomeScore>gameAwayScore;
  var tied=gameHomeScore===gameAwayScore;
  var gRnd=Math.round(gameStats.g);
  var aRnd=Math.round(gameStats.a);
  var pm=Math.round(gameStats.pm||0);
  if(G.xFactor==='careless' && (G._playoffCtx&&G._isPlayoffGame||G._worldStageCtx) && G.pos!=='G' && !won && !tied){
    pm=cl(pm-1-(Math.random()<0.45?1:0),-6,6);
  }
  var defBonus=0;
  if(G.pos==='D'){
    var blkPg=Math.round(gameStats.block||0);
    defBonus=(won?2:(tied?1:-1))+(blkPg>=2?1:0)+(blkPg>=4?1:0)+((gRnd+aRnd)>=1?1:0);
    defBonus=cl(defBonus,-2,5);
  }
  var pmTotal=G.pos==='D'?pm+defBonus:pm;
  var svpctRaw=gameStats.sv+gameStats.ga>0?gameStats.sv/(gameStats.sv+gameStats.ga):0;
  var svpctStr=gameStats.sv+gameStats.ga>0?formatSvPctFromRatio(svpctRaw):'---';
  var mAvg=getMomentScoresAverage();

  if(G._worldStageCtx){
    if(tied) won=Math.random()<0.5;
    var wctx=G._worldStageCtx;
    var ev=wctx.ev;
    wctx.stats.gp++;
    if(G.pos==='G'){wctx.stats.sv+=gameStats.sv;wctx.stats.ga+=gameStats.ga;}
    else {wctx.stats.g+=gRnd;wctx.stats.a+=aRnd;}
    G.stamina=cl(G.stamina-ri(5,12),0,100);
    G.morale=cl(G.morale+(G.xFactor==='careless'?(won?8:tied?3:-4):(won?8:tied?3:-6)),0,100);
    G.xp+=Math.round((G.pos==='G'?Math.round(ri(22,42)*getXFactorGoalieXpMult(getXFactorGameContext())):ri(30,55))*getPotentialXpMult(G.potential||'support'));
    var scW=gameHomeScore+'-'+gameAwayScore;
    addNews(ev.nt+' '+scW+' vs '+curOpponent.n+' ('+ev.tName+') -- '+(won?'WIN':'LOSS'),(won?'good':'bad'));
    if(gRnd>=2) addNews(G.first+' '+G.last+' scores '+gRnd+' -- multi-goal game!','big');
    if(aRnd>=2) addNews(G.first+' '+G.last+' picks up '+aRnd+' assists -- playmaking night!','big');
    if(G.pos!=='G') G.plusminus+=pmTotal;
    safeEl('pg2-home-n').textContent=ev.nt;
    safeEl('pg2-away-n').textContent=curOpponent.n;
    safeEl('pg2-home-s').textContent=gameHomeScore;
    safeEl('pg2-away-s').textContent=gameAwayScore;
    var rbW=safeEl('pg2-result');
    rbW.textContent=won?'WIN':tied?'TIE':'LOSS';
    rbW.style.borderColor=rbW.style.color=won?'var(--green)':tied?'var(--gold)':'var(--red)';
    var statsHtmlW='';
    if(G.pos==='G'){
      statsHtmlW='<div class="sgrid">'+
        '<div class="stbox"><div class="stlbl">GA</div><div class="stval" style="color:var(--red)">'+gameStats.ga+'</div></div>'+
        '<div class="stbox"><div class="stlbl">SV</div><div class="stval" style="color:var(--green)">'+gameStats.sv+'</div></div>'+
        '<div class="stbox"><div class="stlbl">SV%</div><div class="stval">'+svpctStr+'</div></div>'+
        '<div class="stbox"><div class="stlbl">TOT SH</div><div class="stval">'+(gameStats.sv+gameStats.ga)+'</div></div>'+
        '<div class="stbox"><div class="stlbl">W/L</div><div class="stval">'+(won?'W':tied?'T':'L')+'</div></div>'+
        '<div class="stbox"><div class="stlbl">STAM</div><div class="stval">'+Math.round(G.stamina)+'</div></div>'+
        '</div>';
    } else {
      statsHtmlW='<div class="sgrid">'+
        '<div class="stbox"><div class="stlbl">G</div><div class="stval" style="color:var(--red)">'+gRnd+'</div></div>'+
        '<div class="stbox"><div class="stlbl">A</div><div class="stval" style="color:var(--acc)">'+aRnd+'</div></div>'+
        '<div class="stbox"><div class="stlbl">PTS</div><div class="stval" style="color:var(--gold)">'+(gRnd+aRnd)+'</div></div>'+
        '<div class="stbox"><div class="stlbl">SOG</div><div class="stval">'+Math.round(gameStats.sog)+'</div></div>'+
        '<div class="stbox"><div class="stlbl">+/-</div><div class="stval" style="color:'+(pmTotal>=0?'var(--green)':'var(--red)')+'">'+(pmTotal>=0?'+':'')+pmTotal+'</div></div>'+
        '<div class="stbox"><div class="stlbl">STAM</div><div class="stval">'+Math.round(G.stamina)+'</div></div>'+
        '</div>';
    }
    var ratingW=getGameRating(G.pos,gRnd,aRnd,svpctRaw,won,mAvg);
    statsHtmlW+=buildPostgameRatingBlock(ratingW,mAvg);
    safeEl('pg2-stats').innerHTML=statsHtmlW;
    safeEl('pg2-news').innerHTML=G.news.slice(0,3).map(function(n){return n.txt;}).join('<br>');
    safeEl('pg2-next-btn').textContent='CONTINUE >';
    safeEl('pg2-next-btn').onclick=function(){afterWorldStagePlayableGame(won);};
    if(won) RetroSound.gameWin(); else if(tied) RetroSound.gameTie(); else RetroSound.gameLose();
    show('s-postgame');
    return;
  }

  if(G._playoffCtx&&G._isPlayoffGame){
    if(tied) won=Math.random()<0.5;
    var pctx=G._playoffCtx;
    pctx.myStats.gp++;
    if(G.pos==='G'){pctx.myStats.sv+=gameStats.sv;pctx.myStats.ga+=gameStats.ga;}
    else {pctx.myStats.g+=gRnd;pctx.myStats.a+=aRnd;}
    G.stamina=cl(G.stamina-ri(5,12),0,100);
    G.morale=cl(G.morale+(G.xFactor==='careless'?(won?7:tied?2:-3):(won?7:tied?2:-5)),0,100);
    G.xp+=Math.round((G.pos==='G'?Math.round(ri(18,38)*getXFactorGoalieXpMult(getXFactorGameContext())):ri(25,50))*getPotentialXpMult(G.potential||'support'));
    var scP=gameHomeScore+'-'+gameAwayScore;
    addNews('PLAYOFFS: '+G.team.n+' '+scP+' vs '+curOpponent.n+' -- '+(won?'WIN':'LOSS'),(won?'good':'bad'));
    if(gRnd>=2) addNews(G.first+' '+G.last+' scores '+gRnd+' -- multi-goal game!','big');
    if(aRnd>=2) addNews(G.first+' '+G.last+' picks up '+aRnd+' assists -- playmaking night!','big');
    if(G.pos!=='G') G.plusminus+=pmTotal;
    safeEl('pg2-home-n').textContent=G.team.n;
    safeEl('pg2-away-n').textContent=curOpponent.n;
    safeEl('pg2-home-s').textContent=gameHomeScore;
    safeEl('pg2-away-s').textContent=gameAwayScore;
    var rbP=safeEl('pg2-result');
    rbP.textContent=won?'WIN':tied?'TIE':'LOSS';
    rbP.style.borderColor=rbP.style.color=won?'var(--green)':tied?'var(--gold)':'var(--red)';
    var statsHtmlP='';
    if(G.pos==='G'){
      statsHtmlP='<div class="sgrid">'+
        '<div class="stbox"><div class="stlbl">GA</div><div class="stval" style="color:var(--red)">'+gameStats.ga+'</div></div>'+
        '<div class="stbox"><div class="stlbl">SV</div><div class="stval" style="color:var(--green)">'+gameStats.sv+'</div></div>'+
        '<div class="stbox"><div class="stlbl">SV%</div><div class="stval">'+svpctStr+'</div></div>'+
        '<div class="stbox"><div class="stlbl">TOT SH</div><div class="stval">'+(gameStats.sv+gameStats.ga)+'</div></div>'+
        '<div class="stbox"><div class="stlbl">W/L</div><div class="stval">'+(won?'W':tied?'T':'L')+'</div></div>'+
        '<div class="stbox"><div class="stlbl">STAM</div><div class="stval">'+Math.round(G.stamina)+'</div></div>'+
        '</div>';
    } else {
      statsHtmlP='<div class="sgrid">'+
        '<div class="stbox"><div class="stlbl">G</div><div class="stval" style="color:var(--red)">'+gRnd+'</div></div>'+
        '<div class="stbox"><div class="stlbl">A</div><div class="stval" style="color:var(--acc)">'+aRnd+'</div></div>'+
        '<div class="stbox"><div class="stlbl">PTS</div><div class="stval" style="color:var(--gold)">'+(gRnd+aRnd)+'</div></div>'+
        '<div class="stbox"><div class="stlbl">SOG</div><div class="stval">'+Math.round(gameStats.sog)+'</div></div>'+
        '<div class="stbox"><div class="stlbl">+/-</div><div class="stval" style="color:'+(pmTotal>=0?'var(--green)':'var(--red)')+'">'+(pmTotal>=0?'+':'')+pmTotal+'</div></div>'+
        '<div class="stbox"><div class="stlbl">STAM</div><div class="stval">'+Math.round(G.stamina)+'</div></div>'+
        '</div>';
    }
    var ratingP=getGameRating(G.pos,gRnd,aRnd,svpctRaw,won,mAvg);
    statsHtmlP+=buildPostgameRatingBlock(ratingP,mAvg);
    safeEl('pg2-stats').innerHTML=statsHtmlP;
    safeEl('pg2-news').innerHTML=G.news.slice(0,3).map(function(n){return n.txt;}).join('<br>');
    var _prP=pctx.pairs[pctx.pairIndex];
    var _hw=pctx.seriesHW,_aw=pctx.seriesAW;
    if(_prP){
      var _h0=_prP[0],_a0=_prP[1];
      if(won){ if(_h0.isMe) _hw++; else _aw++; } else { if(_h0.isMe) _aw++; else _hw++; }
    }
    var _serDone=!_prP || _hw>=PLAYOFF_SERIES_WINS || _aw>=PLAYOFF_SERIES_WINS;
    safeEl('pg2-next-btn').textContent=_serDone?(won?'BRACKET / NEXT ROUND >':'PLAYOFFS OVER >'):'NEXT PLAYOFF GAME >';
    safeEl('pg2-next-btn').onclick=function(){afterPlayoffPlayableGame(won);};
    if(won) RetroSound.gameWin(); else if(tied) RetroSound.gameTie(); else RetroSound.gameLose();
    show('s-postgame');
    return;
  }

  G.gp++;G.cGP++;
  if(typeof G.w==='undefined'){G.w=0;G.l=0;G.otl=0;}
  if(won){G.w++;} else if(tied){G.otl++;} else {G.l++;}
  if(G.standings){
    for(var i=0;i<G.standings.length;i++){
      if(G.standings[i].isMe){
        G.standings[i].gp=G.gp;
        G.standings[i].w=G.w;
        G.standings[i].l=G.l;
        G.standings[i].otl=G.otl;
        G.standings[i].pts=G.w*2+G.otl;
        break;
      }
    }
  }
  G.goals+=gRnd;G.assists+=aRnd;G.cGoals+=gRnd;G.cAssists+=aRnd;
  G.sog+=Math.round(gameStats.sog);G.cSOG+=Math.round(gameStats.sog);
  G.saves+=gameStats.sv;G.cSaves+=gameStats.sv;
  if(G.pos==='G'){G.goalsAgainst=(G.goalsAgainst||0)+gameStats.ga;G.cGoalsAgainst=(G.cGoalsAgainst||0)+gameStats.ga;}
  G.plusminus+=pmTotal;
  G.stamina=cl(G.stamina-ri(6,14),0,100);
  G.morale=cl(G.morale+(G.xFactor==='careless'?(won?5:tied?1:-2):(won?5:tied?1:-4)),0,100);
  if(!G.isInjured&&Math.random()<0.018) triggerInjury();
  G.xp+=Math.round((G.pos==='G'?Math.round(ri(14,38)*getXFactorGoalieXpMult(getXFactorGameContext())):ri(20,45))*getPotentialXpMult(G.potential||'support'));
  var sc=gameHomeScore+'-'+gameAwayScore;
  addNews(G.team.n+' '+sc+' vs '+curOpponent.n+' -- '+(won?'WIN':'LOSS'),(won?'good':'bad'));
  if(gRnd>=2) addNews(G.first+' '+G.last+' scores '+gRnd+' -- multi-goal game!','big');
  if(aRnd>=2) addNews(G.first+' '+G.last+' picks up '+aRnd+' assists -- playmaking night!','big');
  checkMilestones();
  // Refresh social messages after game
  G.socialMessages=generateSocialMessages();
  safeEl('pg2-home-n').textContent=G.team.n;
  safeEl('pg2-away-n').textContent=curOpponent.n;
  safeEl('pg2-home-s').textContent=gameHomeScore;
  safeEl('pg2-away-s').textContent=gameAwayScore;
  var rb=safeEl('pg2-result');
  rb.textContent=won?'WIN':tied?'TIE':'LOSS';
  rb.style.borderColor=rb.style.color=won?'var(--green)':tied?'var(--gold)':'var(--red)';
  var statsHtml='';
  if(G.pos==='G'){
    statsHtml='<div class="sgrid">'+
      '<div class="stbox"><div class="stlbl">GA</div><div class="stval" style="color:var(--red)">'+gameStats.ga+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SV</div><div class="stval" style="color:var(--green)">'+gameStats.sv+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SV%</div><div class="stval">'+svpctStr+'</div></div>'+
      '<div class="stbox"><div class="stlbl">TOT SH</div><div class="stval">'+(gameStats.sv+gameStats.ga)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">W/L</div><div class="stval">'+(won?'W':tied?'T':'L')+'</div></div>'+
      '<div class="stbox"><div class="stlbl">STAM</div><div class="stval">'+Math.round(G.stamina)+'</div></div>'+
      '</div>';
  } else {
    statsHtml='<div class="sgrid">'+
      '<div class="stbox"><div class="stlbl">G</div><div class="stval" style="color:var(--red)">'+gRnd+'</div></div>'+
      '<div class="stbox"><div class="stlbl">A</div><div class="stval" style="color:var(--acc)">'+aRnd+'</div></div>'+
      '<div class="stbox"><div class="stlbl">PTS</div><div class="stval" style="color:var(--gold)">'+(gRnd+aRnd)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SOG</div><div class="stval">'+Math.round(gameStats.sog)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">+/-</div><div class="stval" style="color:'+(pmTotal>=0?'var(--green)':'var(--red)')+'">'+(pmTotal>=0?'+':'')+pmTotal+'</div></div>'+
      '<div class="stbox"><div class="stlbl">STAM</div><div class="stval">'+Math.round(G.stamina)+'</div></div>'+
      '</div>';
  }
  // Game rating badge (blended: key-moment execution + box score)
  var rating=getGameRating(G.pos,gRnd,aRnd,svpctRaw,won,mAvg);
  statsHtml+=buildPostgameRatingBlock(rating,mAvg);
  safeEl('pg2-stats').innerHTML=statsHtml;
  safeEl('pg2-news').innerHTML=G.news.slice(0,3).map(function(n){return n.txt;}).join('<br>');
  G.weekGames++;
  var perWeek=getGamesPerWeek(G.leagueKey);
  var weekStart=(G.week-1)*perWeek;
  var hasMore=G._curGameIdx<perWeek-1&&G.allOpponents[weekStart+G._curGameIdx+1];
  if(G.weekGames>=perWeek||!hasMore){
    safeEl('pg2-next-btn').textContent='RETURN TO HUB &gt;';
    safeEl('pg2-next-btn').onclick=function(){renderHub();show('s-hub');};
  } else {
    safeEl('pg2-next-btn').textContent='NEXT GAME &gt;';
    safeEl('pg2-next-btn').onclick=function(){preGame(G._curGameIdx+1);};
  }
  if(Math.random()<0.01&&G.season>2&&(G.tradeOffersThisSeason||0)===0&&(G._tradeCooldownUntilGp||0)<=G.gp) triggerTrade();
  // Trades and press conferences based on form
  maybeTriggerTrade(gRnd,aRnd,won);
  setTimeout(function(){ maybeTriggerPostGamePressOnce(won,gRnd,aRnd); },380);
  if(won) RetroSound.gameWin(); else if(tied) RetroSound.gameTie(); else RetroSound.gameLose();
  show('s-postgame');
}
