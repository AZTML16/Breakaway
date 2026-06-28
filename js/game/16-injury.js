/* breakaway — INJURY */
// ============================================================
// INJURY
// ============================================================

function ensureInjuryTracking(){
  if(!G) return;
  if(typeof G.careerInjuryCount!=='number') G.careerInjuryCount=0;
  if(typeof G.seasonInjuryCount!=='number') G.seasonInjuryCount=0;
  if(!Array.isArray(G.injuryHistory)) G.injuryHistory=[];
}

function recordInjuryEvent(name){
  ensureInjuryTracking();
  G.careerInjuryCount++;
  G.seasonInjuryCount++;
  G.injuryHistory.push({name:name,season:G.season||1,week:G.week||1,age:G.age||16});
  if(G.injuryHistory.length>32) G.injuryHistory.shift();
}

function applyInjuryAttrDamage(penMap){
  if(!G||!G.attrs||!penMap) return;
  var a=G.attrs, amin=typeof G._attrClampMin==='number'?G._attrClampMin:40;
  var k;
  for(k in penMap){
    if(!penMap.hasOwnProperty(k)) continue;
    if(typeof a[k]==='number') a[k]=cl(a[k]+penMap[k], amin, 99);
  }
  if(typeof syncLegacySkaterAttrsFromCategories==='function') syncLegacySkaterAttrsFromCategories(a);
}

function pickMinorInjury(){
  var list=[
    {n:'Upper Body Injury',wks:2,hl:15,pen:{}},
    {n:'Lower Body Injury',wks:3,hl:20,pen:{}},
    {n:'Groin Strain',wks:2,hl:12,pen:{agility:-1,speed:-1}},
    {n:'Wrist Sprain',wks:3,hl:18,pen:{handSpeed:-2,release:-1}},
    {n:'Foot Contusion',wks:2,hl:14,pen:{speed:-2,balance:-1}}
  ];
  return list[ri(0,list.length-1)];
}

function pickModerateInjury(){
  var list=[
    {n:'Concussion',wks:4,hl:30,pen:{offensiveAwareness:-3,defensiveAwareness:-2,balance:-2},dur:-4},
    {n:'Broken Hand',wks:6,hl:35,pen:{handSpeed:-4,release:-3,passTouch:-2}},
    {n:'Knee Sprain',wks:5,hl:38,pen:{agility:-4,speed:-3,balance:-2}},
    {n:'Shoulder Separation',wks:6,hl:40,pen:{bodyChecking:-3,strength:-2,release:-2}},
    {n:'High Ankle Sprain',wks:7,hl:42,pen:{speed:-4,agility:-3,technique:-2}}
  ];
  return list[ri(0,list.length-1)];
}

function pickSevereInjury(){
  var list=[
    {n:'Torn MCL',wks:12,hl:50,pen:{speed:-6,agility:-5,balance:-4,technique:-2},dur:-6},
    {n:'Labrum Tear',wks:14,hl:52,pen:{release:-5,passAccuracy:-4,bodyChecking:-4},dur:-5},
    {n:'Broken Leg',wks:16,hl:55,pen:{speed:-8,agility:-6,balance:-5,technique:-3},dur:-8},
    {n:'Significant Concussion',wks:10,hl:48,pen:{offensiveAwareness:-6,defensiveAwareness:-5,agitation:-3,balance:-3},dur:-7}
  ];
  return list[ri(0,list.length-1)];
}

function pickCareerRuiningInjury(){
  var list=[
    {n:'Degenerative Hip Condition',wks:20,hl:60,pen:{speed:-10,agility:-9,technique:-6,balance:-7,bodyChecking:-5},dur:-12,ruined:true},
    {n:'Repeated Concussion Protocol',wks:18,hl:55,pen:{offensiveAwareness:-9,defensiveAwareness:-8,agitation:-4,passVision:-4},dur:-10,ruined:true},
    {n:'Shattered Ankle (Surgery)',wks:22,hl:58,pen:{speed:-11,agility:-10,technique:-5,balance:-8},dur:-11,ruined:true},
    {n:'Spinal Nerve Impingement',wks:24,hl:62,pen:{strength:-8,balance:-9,bodyChecking:-7,gapControl:-6},dur:-13,ruined:true}
  ];
  return list[ri(0,list.length-1)];
}

function pickCareerEndingInjury(){
  var list=[
    {n:'Career-Ending Knee Reconstruction',wks:40,hl:80,endCareer:true},
    {n:'Spinal Cord Trauma',wks:52,hl:90,endCareer:true},
    {n:'Catastrophic Head Injury',wks:30,hl:85,endCareer:true},
    {n:'Multiple Ligament Failure',wks:36,hl:75,endCareer:true}
  ];
  return list[ri(0,list.length-1)];
}

function rollInjurySeverity(){
  ensureInjuryTracking();
  var dur=G.attrs&&G.attrs.durability||70;
  var hist=G.careerInjuryCount||0;
  var r=Math.random();
  if(hist>=6&&r<0.025) return pickCareerEndingInjury();
  if(hist>=4&&r<0.055) return pickCareerRuiningInjury();
  if((hist>=3||dur<42)&&r<0.12) return pickSevereInjury();
  if((hist>=2||dur<55)&&r<0.22) return pickModerateInjury();
  return pickMinorInjury();
}

function forceCareerEndingInjury(inj, reason){
  ensureInjuryTracking();
  G.isInjured=false;
  G.injWks=0;
  G.injName=inj.n;
  G._careerEndedInjury=inj.n;
  addNews('CAREER OVER: '+G.first+' '+G.last+' -- '+inj.n+(reason?(' ('+reason+')'):''),'bad');
  notify('CAREER-ENDING INJURY','red');
  safeEl('m-injury-body').innerHTML=
    '<div style="font-size:42px;text-align:center;margin:10px 0">!!</div>'+
    '<div class="vt" style="font-size:20px;color:var(--red);text-align:center;margin-bottom:10px">'+inj.n.toUpperCase()+'</div>'+
    '<div class="vt" style="font-size:15px;color:var(--mut);line-height:1.8">CAREER ENDING<br>'+(reason||'Doctors recommend retirement.')+'</div>';
  RetroSound.injury();
  openM('m-injury');
  setTimeout(function(){
    closeM('m-injury');
    if(typeof retire==='function') retire();
  }, 2200);
}

function applyInjuryPenalties(inj){
  if(!inj||!G||!G.attrs||G.pos==='G') return;
  if(inj.pen) applyInjuryAttrDamage(inj.pen);
  if(inj.dur) G.attrs.durability=cl((G.attrs.durability||70)+inj.dur, 18, 99);
  if(inj.ruined){
    G.morale=cl(G.morale-rd(12,22), 0, 100);
    G._careerRuinedInjury=inj.n;
    addNews('LONG-TERM DAMAGE: '+inj.n+' -- attributes may never fully recover.','bad');
  }
}

function showInjuryModal(inj){
  var sev=inj.endCareer?'CATASTROPHIC':(inj.ruined?'CAREER-ALTERING':(inj.wks<=3?'MINOR':inj.wks<=7?'MODERATE':'SERIOUS'));
  safeEl('m-injury-body').innerHTML=
    '<div style="font-size:42px;text-align:center;margin:10px 0">!</div>'+
    '<div class="vt" style="font-size:20px;color:var(--red);text-align:center;margin-bottom:10px">'+inj.n.toUpperCase()+'</div>'+
    '<div class="vt" style="font-size:15px;color:var(--mut);line-height:1.8">SEVERITY: '+sev+'<br>TIMELINE: '+inj.wks+' WEEKS<br>HEALTH: -'+inj.hl+
    (inj.ruined?'<br><span style="color:var(--gold)">Permanent attribute damage possible</span>':'')+'</div>';
  RetroSound.injury();
  openM('m-injury');
}

function triggerInjury(){
  ensureInjuryTracking();
  var inj=rollInjurySeverity();
  recordInjuryEvent(inj.n);
  if(inj.endCareer){
    forceCareerEndingInjury(inj, 'Suffered during play.');
    return;
  }
  G.isInjured=true;
  G.injName=inj.n;
  G.injWks=inj.wks;
  G.health=cl(G.health-inj.hl,0,100);
  applyInjuryPenalties(inj);
  showInjuryModal(inj);
  addNews('INJURED: '+G.first+' '+G.last+' -- '+inj.n+' -- '+inj.wks+' wks','bad');
}

function evaluateOffseasonInjuryFallout(){
  if(!G) return false;
  ensureInjuryTracking();
  var hist=G.careerInjuryCount||0;
  var seasonInj=G.seasonInjuryCount||0;
  var woreInjury=!!G._enteredOffseasonInjured;
  var gotMed=!!G._offseasonMedical;
  if(gotMed){
    G.health=cl(G.health+28,0,100);
    if(G.attrs&&G.attrs.durability) G.attrs.durability=cl(G.attrs.durability+rd(3,8), 22, 99);
    G.isInjured=false;
    G.injWks=0;
    G.injName='';
    return false;
  }
  if(!woreInjury&&seasonInj<2&&hist<4) return false;
  var risk=0.006;
  if(seasonInj>=3) risk+=0.014;
  if(hist>=5) risk+=0.016;
  if(woreInjury) risk+=0.022;
  if((G.age||16)>=32) risk+=0.01;
  if(G.attrs&&(G.attrs.durability||70)<45) risk+=0.014;
  if(Math.random()>=risk) return false;
  var inj=Math.random()<0.18?pickCareerEndingInjury():pickCareerRuiningInjury();
  recordInjuryEvent(inj.n+' (offseason)');
  if(inj.endCareer){
    forceCareerEndingInjury(inj, 'Complications after playing through injuries without proper medical care.');
    return true;
  }
  applyInjuryPenalties(inj);
  G.isInjured=true;
  G.injName=inj.n;
  G.injWks=Math.max(4, Math.round(inj.wks*0.45));
  G.health=cl(G.health-inj.hl*0.5, 0, 100);
  G.morale=cl(G.morale-rd(8,16), 0, 100);
  addNews('OFFSEASON SETBACK: '+G.first+' -- '+inj.n+' without proper rehab.','bad');
  notify('INJURY COMPLICATIONS','red');
  return false;
}
