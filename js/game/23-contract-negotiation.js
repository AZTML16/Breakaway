/* breakaway — CONTRACT NEGOTIATION */
// ============================================================
// CONTRACT NEGOTIATION
// ============================================================
function isContractNegotiationAllowed(){
  if(!G) return false;
  if(!G._inOffseason) return false;
  if((G.contractYrsLeft|0)>0) return false;
  return true;
}
function offerContract(forcedTeamName){
  if(!isContractNegotiationAllowed()){
    notify('CONTRACT TALKS: OFFSEASON ONLY WHEN YOUR DEAL EXPIRES','gold');
    return;
  }
  if(hasActiveDraftRights() && !draftClubWillingToSignElc() && (G.contractYrsLeft||0)<=0){
    var elcNeed=getDraftClubElcMinOvr();
    notify('RIGHTS CLUB: NO ELC UNTIL '+elcNeed+'+ OVR','gold');
    addNews(G.draftRights.team+' holds your rights -- no entry-level offer until you are pro-ready ('+elcNeed+'+ OVR). Keep developing.','neutral');
    return;
  }
  // Staff chat before going to negotiation screen
  var tname=forcedTeamName||G.team.n;
  var agentName=['Agent Reeves','Agent Kowalski','Agent Dubois','Agent Tanaka'][ri(0,3)];
  var gmName=['GM Harrington','GM Leclair','GM Ashworth','GM Sundqvist'][ri(0,3)];
  openStaffChat('CONTRACT OFFER -- '+tname.toUpperCase(),
    [{sender:gmName+' -- '+tname, color:'var(--gold)',
      text:'We want to keep you here. You\'ve been a big part of what we\'re building. We have an offer ready -- let\'s talk numbers.'},
     {sender:agentName+' (Your Agent)', color:'var(--acc)',
      text:'I\'ve seen what you\'re putting up. Don\'t undersell yourself. Know your value -- the market is there if they don\'t meet it.'}],
    [{label:'LET\'S NEGOTIATE', fn:function(){_startContractNegotiation(tname);}},
     {label:'JUST SHOW ME THE OFFER', fn:function(){_startContractNegotiation(tname);}}]
  );
}

function _startContractNegotiation(forcedTeamName){
  if(!isContractNegotiationAllowed()){
    notify('CONTRACT TALKS: OFFSEASON ONLY WHEN YOUR DEAL EXPIRES','gold');
    return;
  }
  G.pendingContract=true;
  var o=ovr(G.attrs,G.pos);
  var tier=G.league.tier;
  cnMinSal=G.league.salBase||0;
  cnMaxSal=tier==='pro'?o*200000:tier==='minor'?Math.min(350000,o*5000):tier==='euro'||tier==='asia'?o*5000:o*1000;
  cnTeamOffer={sal:Math.round(cnMaxSal*rd(0.65,0.8)),yrs:ri(1,4)};
  cnRounds=0;cnNTC=false;cnBonus=false;
  safeEl('cn-team').textContent=(forcedTeamName||G.team.n).toUpperCase();
  var salSlider=safeEl('cn-sal-slider');
  salSlider.min=Math.round(cnMinSal);
  salSlider.max=Math.round(cnMaxSal);
  salSlider.value=Math.round(cnTeamOffer.sal);
  safeEl('cn-yrs-slider').value=cnTeamOffer.yrs;
  safeEl('cn-ntc-btn').textContent='NTC: OFF';
  safeEl('cn-ntc-btn').className='btn bs bw';
  safeEl('cn-bonus-btn').textContent='BONUS: OFF';
  safeEl('cn-bonus-btn').className='btn bs bw';
  safeEl('cn-log').innerHTML='';
  updateContractUI();
  show('s-contract');
}

function updateContractUI(){
  var mySal=parseInt(safeEl('cn-sal-slider').value,10);
  var myYrs=parseInt(safeEl('cn-yrs-slider').value,10);
  safeEl('cn-my-sal-lbl').textContent=fmt(mySal)+'/YR';
  safeEl('cn-my-yrs-lbl').textContent=myYrs+' YR'+(myYrs!==1?'S':'');
  safeEl('cn-offer-sal').textContent=fmt(cnTeamOffer.sal)+'/YR';
  safeEl('cn-offer-yrs').textContent=cnTeamOffer.yrs+' YEAR'+(cnTeamOffer.yrs!==1?'S':'');
  var budgetPct=cnMaxSal>0?Math.round((cnTeamOffer.sal/cnMaxSal)*100):0;
  safeEl('cn-budget-bar').style.width=budgetPct+'%';
  safeEl('cn-budget-lbl').textContent='TEAM BUDGET USED: '+budgetPct+'%';
  var diff=mySal-cnTeamOffer.sal;
  var comp=diff<=0?'WITHIN BUDGET -- OFFER ACCEPTED IMMEDIATELY':diff<cnMaxSal*0.1?'SLIGHTLY ABOVE -- POSSIBLE COUNTER':diff<cnMaxSal*0.25?'WELL ABOVE -- RISKY ASK':'FAR ABOVE BUDGET -- LIKELY REJECTED';
  safeEl('cn-compatibility').textContent=comp;
}

function toggleNTC(){
  cnNTC=!cnNTC;
  safeEl('cn-ntc-btn').textContent='NTC: '+(cnNTC?'ON':'OFF');
  safeEl('cn-ntc-btn').className='btn '+(cnNTC?'bg2':'bs')+' bw';
}

function toggleBonus(){
  cnBonus=!cnBonus;
  safeEl('cn-bonus-btn').textContent='BONUS: '+(cnBonus?'ON':'OFF');
  safeEl('cn-bonus-btn').className='btn '+(cnBonus?'bg2':'bs')+' bw';
}

function sendOffer(){
  if(cnRounds>=3){addContractLog('MAX ROUNDS REACHED -- ACCEPT OR WALK.','red');return;}
  cnRounds++;
  var mySal=parseInt(safeEl('cn-sal-slider').value,10);
  var myYrs=parseInt(safeEl('cn-yrs-slider').value,10);
  var diff=mySal-cnTeamOffer.sal;
  var extra=(cnNTC?cnMaxSal*0.05:0)+(cnBonus?cnMaxSal*0.03:0);
  addContractLog('Round '+cnRounds+': You ask '+fmt(mySal)+'/yr -- '+myYrs+'yr'+(cnNTC?' + NTC':'')+(cnBonus?' + BONUS':''),'gold');
  if(diff+extra<=0){
    addContractLog('TEAM ACCEPTS YOUR TERMS!','green');
    finalizeContract(mySal,myYrs,cnNTC,cnBonus);
  } else if(diff+extra<cnMaxSal*0.15&&cnRounds<3){
    RetroSound.ping();
    var counter=Math.min(Math.round(cnTeamOffer.sal*1.05),Math.round(cnMaxSal*0.88));
    cnTeamOffer.sal=counter;
    addContractLog('Team counters: '+fmt(cnTeamOffer.sal)+'/yr -- '+cnTeamOffer.yrs+'yr','mut');
    updateContractUI();
  } else {
    RetroSound.notifyBad();
    addContractLog('TEAM CANNOT MEET YOUR DEMANDS.','red');
  }
}

function acceptCurrentOffer(){finalizeContract(cnTeamOffer.sal,cnTeamOffer.yrs,false,false);}

function walkAway(){
  RetroSound.walkAway();
  G.pendingContract=false;
  addNews(G.first+' '+G.last+' walks away -- enters free agency.','neutral');
  renderHub();show('s-hub');
}

function getProContractType(){
  if(G.league.tier!=='pro') return 'PRO CONTRACT';
  var topPro=getProLeagueKeyByGender(G.gender);
  if(G.leagueKey!==topPro) return 'UFA';
  // ELC is top-pro-only (PHL / PWL) and always the first 3-year starter contract.
  if(!G.hadELC) return 'ENTRY LEVEL';
  if(G.age<25 && G.draftRights && G.draftRights.team===G.team.n && G.draftRights.leagueKey===G.leagueKey) return 'RFA';
  if(G.age<25) return 'UFA';
  return 'UFA';
}

function hasActiveDraftRights(){
  return !!(G.draftRights && G.age<25);
}
/** Drafting club keeps your rights but will not table an ELC / pro offer below gendered bar (see getDraftClubElcMinOvr). */
function draftClubWillingToSignElc(){
  return ovr(G.attrs,G.pos)>=getDraftClubElcMinOvr();
}

function finalizeContract(sal,yrs,ntc,bonus){
  RetroSound.contractSign();
  var cType=(G.league.tier==='junior'||G.league.tier==='college')?'AMATEUR':getProContractType();
  if(G.league.tier==='minor'){
    var parent=getProLeagueKeyByGender(G.gender);
    cType='TWO-WAY ('+parent+')';
    yrs=Math.min(2,Math.max(1,yrs));
    ntc=false;
  }
  if(cType==='ENTRY LEVEL') yrs=3;
  G.contract={sal:sal,yrs:yrs,type:cType,ntc:ntc,bonus:bonus};
  if(cType==='ENTRY LEVEL'){G.hadELC=true;G.elcYears=3;}
  G.contractYrsLeft=yrs;G.pendingContract=false;
  if(sal>0){
    G.careerEarnings=(G.careerEarnings||0)+(bonus?Math.round(sal*0.1):0);
  }
  addNews(G.first+' '+G.last+' signs '+yrs+'-year deal worth '+fmt(sal*yrs)+' total!','big');
  notify('CONTRACT SIGNED!','gold');renderHub();show('s-hub');
}

function addContractLog(msg,color){
  var el=safeEl('cn-log');
  var c=color==='gold'?'var(--gold)':color==='green'?'var(--green)':color==='red'?'var(--red)':'var(--mut)';
  el.innerHTML+='<div class="vt" style="font-size:14px;color:'+c+';padding:4px 0;border-bottom:1px solid rgba(122,184,224,.08)">'+msg+'</div>';
  el.scrollTop=el.scrollHeight;
}
