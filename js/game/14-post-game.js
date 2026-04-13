/* breakaway — POST-GAME */
// ============================================================
// POST-GAME
// ============================================================
var _shootoutTimer=null;
var _shootoutMoment=null;
var _shootoutDoneCb=null;
var _shootoutTimerSec=10;

function clearShootoutTimer(){
  if(_shootoutTimer){ clearInterval(_shootoutTimer); _shootoutTimer=null; }
}

function updateShootoutScoreboard(){
  var h=safeEl('so-home-score'), a=safeEl('so-away-score');
  if(h) h.textContent=gameHomeScore;
  if(a) a.textContent=gameAwayScore;
}

function updateShootoutTimerUI(){
  var bar=safeEl('so-timer-bar');
  var num=safeEl('so-timer-num');
  if(!bar||!num) return;
  var pct=Math.max(0,_shootoutTimerSec/10)*100;
  bar.style.width=pct+'%';
  num.textContent=Math.ceil(Math.max(0,_shootoutTimerSec));
  if(_shootoutTimerSec<=3){bar.style.background='linear-gradient(90deg,var(--red),#ff6b7a)';bar.style.boxShadow='0 0 14px rgba(255,71,87,.5)';}
  else if(_shootoutTimerSec<=6){bar.style.background='linear-gradient(90deg,var(--gold),#ffe066)';bar.style.boxShadow='0 0 10px rgba(255,204,51,.35)';}
  else{bar.style.background='linear-gradient(90deg,var(--green),#5ef9a8)';bar.style.boxShadow='0 0 12px rgba(38,222,129,.4)';}
  try{RetroSound.timerTick(Math.ceil(Math.max(0,_shootoutTimerSec)));}catch(e){}
}

/** Playoff / world: multiple sudden-death OT rolls until someone scores. */
function resolveSuddenDeathOTForTiedGame(label){
  var tries=0;
  while(gameHomeScore===gameAwayScore&&tries<12){
    tries++;
    if(Math.random()<0.36) continue;
    if(Math.random()<0.52) gameHomeScore++;
    else gameAwayScore++;
  }
  if(gameHomeScore===gameAwayScore){
    if(Math.random()<0.5) gameHomeScore++;
    else gameAwayScore++;
  }
  if(label) addNews(label+': Sudden-death OT decides it.','neutral');
}

/** Regular season: up to two extra OT chances before shootout. Returns true if a winner was decided. */
function tryRegSeasonOvertimeTwoRounds(){
  for(var r=0;r<2;r++){
    if(Math.random()<0.42) continue;
    if(Math.random()<0.51) gameHomeScore++;
    else gameAwayScore++;
    if(gameHomeScore!==gameAwayScore){
      addNews('OVERTIME! '+(gameHomeScore>gameAwayScore?G.team.n+' wins in extra time.':G.team.n+' falls in OT.'),(gameHomeScore>gameAwayScore?'good':'bad'));
      return true;
    }
  }
  return false;
}

function getShootoutSkaterMoment(){
  if(!MOMENTS||!MOMENTS.F) return null;
  for(var si=0;si<MOMENTS.F.length;si++){
    var mm=MOMENTS.F[si];
    if(mm&&String(mm.ctx||'').indexOf('PENALTY SHOT')>=0) return mm;
  }
  return MOMENTS.F[0]||null;
}
function getShootoutGoalieMoment(){
  return MOMENTS&&MOMENTS.G&&MOMENTS.G[3]?MOMENTS.G[3]:null;
}

/** Mirrors in-game option roll (lighter modifiers for shootout only). */
function rollShootoutSuccess(opt, auto){
  var attrVal=getMomentAttrValue(opt.a,G);
  var base=auto?opt.s*0.5:opt.s;
  var attrBonus=(attrVal-60)*0.004;
  var moraleBonus=(G.morale-60)*0.001;
  var weightDelta=((G.weight||180)-190)/1000;
  var weightImpact=(G.pos==='G'||opt.a==='physical'||opt.a==='positioning')?weightDelta:(opt.a==='skating'?-weightDelta*0.8:0);
  var leagueDiff=(1.1-(G.league.dev||1.0))*0.10;
  var mediaStress=(G.morale<45?0.03:0)+(G.league.tier==='pro'?0.02:0);
  var wProTight=(G.league.gender==='F'&&G.league.tier==='pro')?0.042:0;
  var pwlTight=(G.leagueKey==='PWL')?0.03:0;
  var globalDifficulty=0.05+wProTight+pwlTight;
  var successThreshold=cl(base+attrBonus+moraleBonus+weightImpact-leagueDiff-mediaStress-globalDifficulty,0.07,0.91);
  return Math.random()<successThreshold;
}

function startShootoutThen(done){
  clearShootoutTimer();
  _shootoutDoneCb=typeof done==='function'?done:function(){};
  _shootoutMoment=G.pos==='G'?getShootoutGoalieMoment():getShootoutSkaterMoment();
  if(!_shootoutMoment||!_shootoutMoment.opts||!_shootoutMoment.opts.length) _shootoutMoment=getShootoutSkaterMoment();
  if(!_shootoutMoment||!_shootoutMoment.opts||!_shootoutMoment.opts.length){
    if(gameHomeScore===gameAwayScore){
      if(Math.random()<0.5) gameHomeScore++; else gameAwayScore++;
    }
    var cb=_shootoutDoneCb; _shootoutDoneCb=null;
    if(cb) cb();
    return;
  }
  safeEl('so-home-name').textContent=G.team.n;
  safeEl('so-away-name').textContent=curOpponent.n;
  updateShootoutScoreboard();
  safeEl('so-moment-num').textContent='SHOOTOUT -- YOUR TURN';
  safeEl('so-moment-ctx').textContent=_shootoutMoment.ctx||'';
  safeEl('so-moment-text').textContent=_shootoutMoment.text||'';
  var html='';
  for(var i=0;i<_shootoutMoment.opts.length;i++){
    var o=_shootoutMoment.opts[i];
    var riskColor=o.risk==='HIGH'?'var(--red)':o.risk==='MED'?'var(--gold)':'var(--green)';
    var lbl=ATTR_LABELS[o.a]||o.a;
    html+='<button type="button" class="opt-btn" id="so-opt-'+i+'" onclick="selectShootoutOption('+i+',false)">';
    html+='<span>'+stripBracketIcons(o.t)+'</span>';
    html+='<span class="attr-tag">['+lbl.toUpperCase()+']</span>';
    html+='<span class="risk-tag" style="color:'+riskColor+'">'+o.risk+'</span>';
    html+='</button>';
  }
  safeEl('so-moment-opts').innerHTML=html;
  safeEl('so-moment-result').style.display='none';
  _shootoutTimerSec=10;
  updateShootoutTimerUI();
  try{RetroSound.puck();}catch(e){}
  _shootoutTimer=setInterval(function(){
    _shootoutTimerSec-=0.1;
    updateShootoutTimerUI();
    if(_shootoutTimerSec<=0){
      clearShootoutTimer();
      var mx=Math.max(0,_shootoutMoment.opts.length-1);
      selectShootoutOption(ri(0,mx),true);
    }
  },100);
  show('s-shootout');
}

function selectShootoutOption(idx, auto){
  clearShootoutTimer();
  var btns=document.querySelectorAll('#so-moment-opts .opt-btn');
  for(var i=0;i<btns.length;i++) btns[i].disabled=true;
  var m=_shootoutMoment;
  if(!m||!m.opts||!m.opts.length){ var c2=_shootoutDoneCb; _shootoutDoneCb=null; if(c2) c2(); return; }
  var opt=m.opts[idx]||m.opts[0];
  var ok=rollShootoutSuccess(opt, auto);
  var rEl=safeEl('so-moment-result');
  rEl.style.display='block';
  var isG=G.pos==='G';
  if(isG){
    if(ok){
      gameHomeScore++;
      addNews('SHOOTOUT: You stone them -- '+G.team.n+' wins.','good');
      rEl.className='result-flash win';
      rEl.innerHTML='<div>SAVE! SHOOTOUT WIN.</div>';
      try{RetroSound.save();}catch(e){}
    } else {
      gameAwayScore++;
      addNews('SHOOTOUT: They beat you five-hole -- loss.','bad');
      rEl.className='result-flash lose';
      rEl.innerHTML='<div>GOAL AGAINST -- SHOOTOUT LOSS.</div>';
      try{RetroSound.goal();}catch(e){}
    }
  } else {
    if(ok){
      gameHomeScore++;
      addNews('SHOOTOUT: You score -- '+G.team.n+' wins.','good');
      rEl.className='result-flash win';
      rEl.innerHTML='<div>GOAL! SHOOTOUT WIN.</div>';
      try{RetroSound.goal();}catch(e){}
    } else {
      gameAwayScore++;
      addNews('SHOOTOUT: You miss -- they take the extra point.','bad');
      rEl.className='result-flash lose';
      rEl.innerHTML='<div>NO GOAL -- SHOOTOUT LOSS.</div>';
      try{RetroSound.uiLow();}catch(e){}
    }
  }
  updateShootoutScoreboard();
  var cb=_shootoutDoneCb;
  _shootoutDoneCb=null;
  setTimeout(function(){
    _shootoutMoment=null;
    if(cb) cb();
  },1600);
}

function endGame(){
  if(G.pos==='G'){
    var bulkShots=ri(22,34);
    var svRate=cl(0.88+(G.attrs.reflexes+G.attrs.positioning-120)*0.001,0.82,0.96);
    var bulkSaves=Math.round(bulkShots*svRate);
    var bulkGA=bulkShots-bulkSaves;
    gameStats.sv+=bulkSaves;
    gameStats.ga+=bulkGA;
    gameAwayScore+=bulkGA;
  }
  var regWon=gameHomeScore>gameAwayScore;
  var regTied=gameHomeScore===gameAwayScore;
  var isWorld=!!G._worldStageCtx;
  var isPlayoff=!!(G._playoffCtx&&G._isPlayoffGame);
  var isRegSeason=!isWorld&&!isPlayoff;

  if(regTied){
    if(isWorld) resolveSuddenDeathOTForTiedGame('WORLD');
    else if(isPlayoff) resolveSuddenDeathOTForTiedGame('PLAYOFFS');
    else if(isRegSeason){
      if(!tryRegSeasonOvertimeTwoRounds()){
        beginShootoutThen(function(){ finalizeEndGameBody(regWon, regTied); });
        return;
      }
    }
  }

  finalizeEndGameBody(regWon, regTied);
}

function finalizeEndGameBody(regWon, regTied){
  var won=gameHomeScore>gameAwayScore;
  var tied=gameHomeScore===gameAwayScore;
  if(tied){
    if(Math.random()<0.5) gameHomeScore++;
    else gameAwayScore++;
    won=gameHomeScore>gameAwayScore;
    tied=false;
    addNews('FINAL: Deadlock resolved.','neutral');
  }
  var gRnd=Math.round(gameStats.g);
  var aRnd=Math.round(gameStats.a);
  var pm=Math.round(gameStats.pm||0);
  if(G.xFactor==='careless' && (G._playoffCtx&&G._isPlayoffGame||G._worldStageCtx) && G.pos!=='G' && !regWon && !regTied){
    pm=cl(pm-1-(Math.random()<0.45?1:0),-6,6);
  }
  var blkPg=Math.round(gameStats.block||0);
  var defBonus=getArchetypeDefensivePlusMinusBonus(G.pos,G.arch,won,tied,gRnd,aRnd,blkPg);
  var pmTotal=G.pos==='G'?pm:(pm+defBonus);
  var svpctRaw=gameStats.sv+gameStats.ga>0?gameStats.sv/(gameStats.sv+gameStats.ga):0;
  var svpctStr=gameStats.sv+gameStats.ga>0?formatSvPctFromRatio(svpctRaw):'---';
  var mAvg=getMomentScoresAverage();

  if(G._worldStageCtx){
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
    safeEl('pg2-next-btn').textContent=_serDone?(won?'BRACKET / NEXT ROUND >':'PLAYOFFS OVER >'):'NEXT GAME >';
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
  maybeTriggerTrade(gRnd,aRnd,won);
  setTimeout(function(){ maybeTriggerPostGamePressOnce(won,gRnd,aRnd); },380);
  if(won) RetroSound.gameWin(); else if(tied) RetroSound.gameTie(); else RetroSound.gameLose();
  show('s-postgame');
}
