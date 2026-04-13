/* breakaway — SELECT OPTION -- FIXED: passing = assist, not goal */
// ============================================================
// SELECT OPTION -- FIXED: passing = assist, not goal
// ============================================================
function selectOption(idx,auto){
  clearTimerInterval();
  var btns=document.querySelectorAll('.opt-btn');
  for(var i=0;i<btns.length;i++) btns[i].disabled=true;
  var m=gameMoments[curMoment];
  if(!m)return;
  var opt=m.opts[idx]||m.opts[0];
  var attrVal=getMomentAttrValue(opt.a,G);
  var base=auto?opt.s*0.5:opt.s;
  var attrBonus=(attrVal-60)*0.004;
  var moraleBonus=(G.morale-60)*0.001;
  var weightDelta=((G.weight||180)-190)/1000;
  var weightImpact=0;
  if(G.pos==='G' || opt.a==='physical' || opt.a==='positioning' || opt.a==='stickChecks') weightImpact=weightDelta;
  if(opt.a==='skating' || opt.a==='agility') weightImpact=-weightDelta*0.8;
  var leagueDiff=(1.1 - (G.league.dev||1.0))*0.10; // higher league harder, lower league easier
  var mediaStress=(G.morale<45?0.03:0) + (G.league.tier==='pro'?0.02:0);
  // Women's top league: slightly tougher reads (PWL extra) — sim points tuned separately too
  var wProTight=(G.league.gender==='F'&&G.league.tier==='pro')?0.042:0;
  var pwlTight=(G.leagueKey==='PWL')?0.03:0;
  // overall promotion of difficulty: goals/assists are a little rarer
  var globalDifficulty=0.08+wProTight+pwlTight;
  var playoffPressure=(G._playoffCtx&&G._isPlayoffGame)?(0.082+getPlayoffYoungLeaguePlayablePressure()):0;
  var playoffGrindEdge=0;
  if(G._playoffCtx&&G._isPlayoffGame){
    var phGr=(G.attrs.physical||60)-60;
    playoffGrindEdge+=phGr/850;
    if(G.pos==='D') playoffGrindEdge+=((G.attrs.defense||60)+(G.attrs.shotBlocking||60)-120)/720;
    if(opt.a==='physical') playoffGrindEdge+=0.044;
    if(G.pos==='D'&&(opt.a==='defense'||opt.a==='shotBlocking'||opt.a==='positioning')) playoffGrindEdge+=0.036;
    if(G.xFactor==='brat'){
      if(opt.a==='physical'||opt.reward==='fight'||opt.reward==='scrum') playoffGrindEdge+=0.048;
      if(G.pos==='D') playoffGrindEdge+=0.024;
    }
    if(G.xFactor==='heavy_hitter'&&opt.a==='physical') playoffGrindEdge+=0.038;
    playoffGrindEdge=cl(playoffGrindEdge,0,0.13);
  }
  var successThreshold=cl(base+attrBonus+moraleBonus+weightImpact+playoffGrindEdge-leagueDiff-mediaStress-globalDifficulty-playoffPressure,0.03,0.92);
  var roll=Math.random();
  var outcome='fail';
  if(roll<successThreshold) outcome='success';
  else if(roll<base+attrBonus+moraleBonus+opt.pa) outcome='partial';
  var partialMax=base+attrBonus+moraleBonus+(opt.pa||0);
  var mq=computeMomentQualityScore(roll,successThreshold,partialMax);
  gameMomentScores.push(mq);
  if(typeof G.cMomentScoreSum!=='number') G.cMomentScoreSum=0;
  if(typeof G.cMomentCount!=='number') G.cMomentCount=0;
  G.cMomentScoreSum+=mq;
  G.cMomentCount++;
  var resultText='',resultClass='lose';
  // Use per-option reward type for clean assist/goal routing
  var reward=opt.reward||'goal';
  if(outcome==='success'){
    if(G.pos==='G'){
      if(reward==='goal'){
        gameStats.g++;
        gameHomeScore++;
        resultText='EMPTY NET! GOALIE GOAL!';
        resultClass='win';
        updateScoreboard();
        RetroSound.goal();
      } else if(reward==='assist'){
        gameStats.a++;
        gameHomeScore++;
        resultText='FROM THE CREASE -- PRIMARY ASSIST!';
        resultClass='win';
        updateScoreboard();
        RetroSound.assist();
      } else if(reward==='fight'){
        gameStats.pm=(gameStats.pm||0)+5;
        resultText='YOU WIN THE GOALIE SCRAP -- ARENA ERUPTS!';
        resultClass='win';
        RetroSound.defensiveStop();
      } else if(reward==='scrum'){
        gameStats.sv++;
        resultText='YOU OWN THE PILE -- WHISTLE!';
        resultClass='win';
        RetroSound.save();
      } else {
        gameStats.sv++;
        resultText='SAVE! STOPPED IT CLEAN!';
        resultClass='win';
        RetroSound.save();
      }
    } else if(reward==='assist'){
      gameStats.a++;
      gameHomeScore++;
      resultText='GREAT PASS! SETS UP THE GOAL!';
      resultClass='win';
      updateScoreboard();
      RetroSound.assist();
    } else if(reward==='goal'){
      gameStats.g++;
      gameHomeScore++;
      resultText='GOAL! PUTS IT HOME!';
      resultClass='win';
      updateScoreboard();
      RetroSound.goal();
    } else if(reward==='fight'){
      gameStats.pm=(gameStats.pm||0)+2;
      resultText='YOU WIN THE TILT -- BENCH LOSES IT!';
      resultClass='win';
      RetroSound.defensiveStop();
    } else if(reward==='scrum'){
      gameStats.block++;
      resultText='YOU DIG IT OUT -- MASSIVE FOR THE ROOM!';
      resultClass='win';
      RetroSound.defensiveStop();
    } else if(reward==='block'){
      gameStats.block++;
      resultText='GREAT DEFENSIVE PLAY!';
      resultClass='win';
      RetroSound.defensiveStop();
    } else {
      resultText='SUCCESSFUL PLAY!';
      resultClass='win';
      RetroSound.puck();
    }
    G.morale=cl(G.morale+2,0,100);
  } else if(outcome==='partial'){
    if(G.pos==='G'){
      if(reward==='goal'||reward==='assist'){
        resultText='CLOSE -- NO LUCK ON THE STAT SHEET.';
        resultClass='partial';
        RetroSound.partialSave();
      } else if(reward==='fight'){
        gameStats.pm=(gameStats.pm||0)+2;
        resultText='REF STEPS IN -- BOTH GET ROUGHING.';
        resultClass='partial';
        RetroSound.partial();
      } else {
        resultText='TOUGH SAVE -- GOT A PIECE OF IT.';
        resultClass='partial';
        RetroSound.partialSave();
      }
    } else if(reward==='assist'){
      gameStats.sog++;
      resultText='PASS SLIGHTLY OFF -- SHOT ON GOAL CREATED.';
      resultClass='partial';
      RetroSound.partial();
    } else if(reward==='fight'||reward==='scrum'){
      gameStats.pm=(gameStats.pm||0)+2;
      resultText='MESSY -- NO CLEAR WIN ON EITHER SIDE.';
      resultClass='partial';
      RetroSound.partial();
    } else if(reward==='block'){
      resultText='GOOD READ -- CHANCE STILL ALIVE.';
      resultClass='partial';
      RetroSound.partial();
    } else {
      gameStats.sog++;
      resultText='GOOD SHOT -- GOALIE MADE THE SAVE.';
      resultClass='partial';
      RetroSound.partial();
    }
  } else {
    if(G.pos==='G'){
      gameStats.ga++;
      gameAwayScore++;
      updateScoreboard();
      if(reward==='goal') resultText='OFF TARGET -- NO GOALIE GOAL!';
      else if(reward==='assist') resultText='TURNOVER -- THEY COUNTER!';
      else if(reward==='fight') resultText='YOU GET TUNED -- NOT YOUR NIGHT.';
      else resultText='BEAT CLEAN -- PUCK IN!';
    } else {
      if(reward==='fight'){
        gameStats.pm=(gameStats.pm||0)+5;
        resultText='YOU EAT THE DECISION -- LONG WALK.';
      } else {
        resultText='DID NOT WORK -- TURNOVER!';
      }
    }
    G.morale=cl(G.morale-(reward==='fight'&&G.pos!=='G'?5:3),0,100);
    resultClass='lose';
    if(G.pos==='G') RetroSound.goalAgainst(); else RetroSound.turnover();
  }
  if(auto) resultText='AUTO: '+resultText;
  var lbl=ATTR_LABELS[opt.a]||opt.a;
  var rEl=safeEl('moment-result');
  rEl.style.display='block';
  var rmR=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  rEl.className='result-flash '+resultClass+((rmR||!isGlitchEffectsEnabled())?'':' result-glitch-pop');
  rEl.innerHTML='<div>'+resultText+'</div><div class="vt" style="font-size:13px;margin-top:6px;opacity:.7">['+lbl.toUpperCase()+' -- '+(auto?'AUTO':'PLAYER')+' -- '+outcome.toUpperCase()+']</div>';
  setTimeout(function(){curMoment++;showMoment();},1750);
}

function updateScoreboard(){
  safeEl('ig-home-score').textContent=gameHomeScore;
  safeEl('ig-away-score').textContent=gameAwayScore;
}

/** 0–100 score for one key moment: success, how "close" partials were, and failed near-misses */
function computeMomentQualityScore(roll,successThreshold,partialMax){
  var st=cl(successThreshold,0.02,0.98);
  var pm=cl(partialMax,st+0.002,0.998);
  if(roll<st){
    var cushion=(st-roll)/st;
    return cl(88+cushion*12,88,100);
  }
  if(roll<pm){
    var span=pm-st;
    var closeness=span>1e-6?(1-(roll-st)/span):0.5;
    return cl(40+closeness*40,38,82);
  }
  var tail=1-pm;
  var near=tail>1e-6?(1-(roll-pm)/tail):0.5;
  return cl(6+near*34,5,45);
}

function getMomentScoresAverage(){
  if(!gameMomentScores||!gameMomentScores.length) return 72;
  var s=0;
  for(var i=0;i<gameMomentScores.length;i++) s+=gameMomentScores[i];
  return s/gameMomentScores.length;
}

function blendedGamePerformanceNumeric(pos,gRnd,aRnd,svpct,won,momentAvg){
  var m=(typeof momentAvg==='number'&&isFinite(momentAvg))?cl(momentAvg,0,100):72;
  if(pos==='G'){
    var svN=svpct>=0.96?95:svpct>=0.93?87:svpct>=0.90?76:svpct>=0.86?63:44;
    return cl(m*0.56+svN*0.44,0,100);
  }
  var ptN=(gRnd+aRnd)>=3?93:(gRnd+aRnd)>=2?83:(gRnd+aRnd)>=1?(won?71:58):(won?54:35);
  return cl(m*0.58+ptN*0.42,0,100);
}

/** Maps blended 0–100 performance to letter + copy (moments weighted vs box score) */
function performanceNumericToLetterGrade(n){
  n=cl(n,0,100);
  if(n>=90) return {grade:'A+',color:'var(--gold)',txt:'ELITE'};
  if(n>=81) return {grade:'A',color:'var(--green)',txt:'STRONG'};
  if(n>=72) return {grade:'B',color:'var(--acc)',txt:'SOLID'};
  if(n>=63) return {grade:'C',color:'var(--mut)',txt:'MIXED'};
  if(n>=52) return {grade:'C-',color:'var(--mut)',txt:'SCRAPPY'};
  return {grade:'D',color:'var(--red)',txt:'ROUGH'};
}

function getCareerOverallGradeDisplay(){
  var pc=G.cMomentCount||0;
  var sc=G.cSimPerfCount||0;
  var total=pc+sc;
  if(total<=0){
    return {grade:'—',color:'var(--mut)',txt:'NO GAMES YET',sub:'PLAYED MOMENTS AND SIMMED GAMES BOTH COUNT'};
  }
  var avg=((G.cMomentScoreSum||0)+(G.cSimPerfSum||0))/total;
  var lg=performanceNumericToLetterGrade(avg);
  var parts=[];
  if(pc>0) parts.push('PLAY '+pc+' MOMENTS');
  if(sc>0) parts.push('SIM '+sc+' GP');
  parts.push('AVG '+Math.round(avg)+'/100');
  return {grade:lg.grade,color:lg.color,txt:lg.txt,sub:parts.join(' · ')};
}
