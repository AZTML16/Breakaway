/* breakaway — IN-GAME */
// ============================================================
// IN-GAME
// ============================================================
function startGame(){
  gameHomeScore=ri(0,2);
  gameAwayScore=ri(0,3);
  gameStats={g:0,a:0,sog:0,block:0,sv:0,ga:0,pm:0};
  curMoment=0;
  gameMomentScores=[];
  var pool=MOMENTS[G.pos]||MOMENTS['F'];
  gameMoments=shuf(pool.slice()).slice(0,4);
  safeEl('ig-home-name').textContent=G._worldStageCtx?G._worldStageCtx.ev.nt:G.team.n;
  safeEl('ig-away-name').textContent=curOpponent.n;
  updateScoreboard();
  show('s-ingame');
  RetroSound.arena();
  showMoment();
}

function showMoment(){
  if(curMoment>=gameMoments.length){endGame();return;}
  var m=gameMoments[curMoment];
  safeEl('ig-hdr').textContent='MOMENT '+(curMoment+1)+'/4 -- '+(G._worldStageCtx?G._worldStageCtx.ev.nt:G.team.n);
  safeEl('moment-num').textContent='KEY MOMENT '+(curMoment+1)+' OF 4';
  var periods=['1ST','2ND','3RD'];
  var per=periods[curMoment]||'OT';
  var mins=ri(4,18); var secs=ri(0,59);
  safeEl('ig-period').textContent=per+' -- '+mins+':'+(secs<10?'0':'')+secs;
  var sits=['EVEN STRENGTH','POWER PLAY','SHORTHANDED'];
  safeEl('ig-situation').textContent=sits[ri(0,2)];
  safeEl('moment-ctx').textContent=m.ctx||'';
  safeEl('moment-text').textContent=m.text;
  safeEl('moment-result').style.display='none';
  var html='';
  for(var i=0;i<m.opts.length;i++){
    var o=m.opts[i];
    var riskColor=o.risk==='HIGH'?'var(--red)':o.risk==='MED'?'var(--gold)':'var(--green)';
    var lbl=ATTR_LABELS[o.a]||o.a;
    // Show expected reward type
    var rewardIcon=o.reward==='assist'?'ASSIST':o.reward==='goal'?'GOAL':o.reward==='save'?'SAVE':o.reward==='fight'?'FIGHT':o.reward==='scrum'?'SCRUM':o.reward==='block'?'STOP':'PLAY';
    html+='<button class="opt-btn" id="opt-'+i+'" onclick="selectOption('+i+',false)">';
    html+='<span>'+stripBracketIcons(o.t)+'</span>';
    html+='<span class="attr-tag">['+lbl.toUpperCase()+'] &mdash; '+rewardIcon+'</span>';
    html+='<span class="risk-tag" style="color:'+riskColor+'">'+o.risk+'</span>';
    html+='</button>';
  }
  safeEl('moment-opts').innerHTML=html;
  RetroSound.puck();
  startTimer();
}

function startTimer(){
  clearTimerInterval();
  RetroSound.resetTimerBeep();
  if(typeof window._resumeTimerSec==='number'&&window._resumeTimerSec>0&&window._resumeTimerSec<=10){
    timerSec=window._resumeTimerSec;
    window._resumeTimerSec=null;
  }else{
    timerSec=10;
  }
  updateTimerUI();
  momentTimer=setInterval(function(){
    timerSec-=0.1;
    updateTimerUI();
    if(timerSec<=0){clearTimerInterval();var mm=gameMoments[curMoment];var mx=mm&&mm.opts?Math.max(0,mm.opts.length-1):3;selectOption(ri(0,mx),true);}
  },100);
}

function clearTimerInterval(){
  if(momentTimer){clearInterval(momentTimer);momentTimer=null;}
}

function updateTimerUI(){
  var bar=safeEl('timer-bar');
  var num=safeEl('timer-num');
  if(!bar)return;
  var pct=Math.max(0,timerSec/10)*100;
  bar.style.width=pct+'%';
  num.textContent=Math.ceil(Math.max(0,timerSec));
  if(timerSec<=3){bar.style.background='linear-gradient(90deg,var(--red),#ff6b7a)';bar.style.boxShadow='0 0 14px rgba(255,71,87,.5)';}
  else if(timerSec<=6){bar.style.background='linear-gradient(90deg,var(--gold),#ffe066)';bar.style.boxShadow='0 0 10px rgba(255,204,51,.35)';}
  else{bar.style.background='linear-gradient(90deg,var(--green),#5ef9a8)';bar.style.boxShadow='0 0 12px rgba(38,222,129,.4)';}
  RetroSound.timerTick(Math.ceil(Math.max(0,timerSec)));
}
