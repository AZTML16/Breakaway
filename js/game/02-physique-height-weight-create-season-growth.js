/* breakaway — PHYSIQUE (HEIGHT / WEIGHT) — CREATE + SEASON GROWTH */
// ============================================================
// PHYSIQUE (HEIGHT / WEIGHT) — CREATE + SEASON GROWTH
// ============================================================
function parseHeightToInches(h){
  if(typeof h==='number' && !isNaN(h) && h>48 && h<96) return Math.round(h);
  var s=String(h==null?'':h).replace(/\u2019/g,"'").replace(/"/g,'');
  var m=s.match(/(\d+)\s*['']\s*(\d+)/);
  if(m) return parseInt(m[1],10)*12+parseInt(m[2],10);
  return 70;
}
function formatHeightFromInches(inches){
  inches=cl(Math.round(inches),54,86);
  var ft=Math.floor(inches/12), inch=inches-ft*12;
  return ft+"'"+inch+'"';
}
/** All listed playing weights are in 10-lb increments. */
function roundWeightToTen(w){
  w=+w||0;
  return Math.round(cl(w,95,320)/10)*10;
}
/** Total listed-weight gain from age 16 to late 30s (lighter teen frames fill out more). */
function careerWeightGainTotal(sw,isF){
  sw=roundWeightToTen(cl(sw,95,320));
  var lean=cl((200-sw)/105,0,1);
  var maleGain=Math.round(52+lean*22);
  maleGain=cl(maleGain,25,85);
  if(isF) return Math.round(maleGain*0.48);
  return maleGain;
}
/** Target weight by age — gradual gain through career; most by late 20s, more to ~38; men gain more. */
function getTargetWeightForAge(age, gender, startW){
  var sw=roundWeightToTen(cl(startW,95,320));
  var isF=gender==='F';
  var total=careerWeightGainTotal(sw,isF);
  var midFrac=isF?0.82:0.78;
  var midGain=total*midFrac;
  var lateGain=total-midGain;
  if(age<=16) return roundWeightToTen(sw);
  if(age<=27){
    var t=(age-16)/11;
    return roundWeightToTen(sw+midGain*t);
  }
  if(age<=40){
    var t2=(age-27)/13;
    return roundWeightToTen(sw+midGain+lateGain*t2);
  }
  return roundWeightToTen(sw+total);
}
function applyPhysiqueGrowthAfterAgeUp(prevAge, newAge){
  if(!G||newAge<=prevAge) return;
  var g=G.gender||'M';
  var startW=typeof G._physiqueStartWeight==='number'?G._physiqueStartWeight:(G.weight||180);
  var startH=typeof G._physiqueStartHeightInches==='number'?G._physiqueStartHeightInches:parseHeightToInches(G.height);
  if(typeof G._physiqueStartWeight!=='number') G._physiqueStartWeight=roundWeightToTen(startW);
  if(typeof G._physiqueStartHeightInches!=='number') G._physiqueStartHeightInches=startH;
  if(typeof G.heightInches!=='number'||G.heightInches<=0) G.heightInches=startH;
  var tgtW=getTargetWeightForAge(newAge, g, startW);
  var oldW=G.weight||startW;
  G.weight=roundWeightToTen(tgtW);
  var heightAgeMax=g==='F'?18:20;
  if(newAge>=17 && newAge<=heightAgeMax && (G._heightGainBudget|0)>0){
    var chance=g==='F'?0.32:0.38;
    var maxIn=startH+(g==='F'?1:2);
    if(Math.random()<chance && (G.heightInches||startH)<maxIn){
      G.heightInches=Math.min((G.heightInches||startH)+1,maxIn);
      G._heightGainBudget=Math.max(0,(G._heightGainBudget|0)-1);
      G.height=formatHeightFromInches(G.heightInches);
      addNews('GROWTH: Now listed at '+G.height+'.','neutral');
    }
  }
  if(newAge<=40 && Math.abs(G.weight-oldW)>=10){
    addNews('BODY: Playing weight now '+G.weight+' LB (age '+newAge+').','neutral');
  }
}
function fillCreateHeightWeightSelects(){
  var g=safeEl('c-gender').value||'M';
  var hSel=safeEl('c-height');
  var wSel=safeEl('c-weight');
  if(!hSel||!wSel) return;
  var prevH=hSel.value, prevW=wSel.value;
  hSel.innerHTML='';
  wSel.innerHTML='';
  var hMin=g==='M'?66:61, hMax=g==='M'?80:74;
  for(var hi=hMin;hi<=hMax;hi++){
    var ho=document.createElement('option');
    ho.value=String(hi);
    ho.text=formatHeightFromInches(hi);
    hSel.appendChild(ho);
  }
  var wMin=g==='M'?110:100, wMax=g==='M'?280:220;
  for(var w=wMin;w<=wMax;w+=10){
    var wo=document.createElement('option');
    wo.value=String(w);
    wo.text=w+' LB';
    wSel.appendChild(wo);
  }
  var defH=g==='M'?'70':'66', defW=g==='M'?'180':'142';
  hSel.value=prevH&&[].some.call(hSel.options,function(o){return o.value===prevH;})?prevH:defH;
  wSel.value=prevW&&[].some.call(wSel.options,function(o){return o.value===prevW;})?prevW:defW;
}

function makeTeammateHandle(senderName, salt){
  var team=G.team&&G.team.n?G.team.n:'Team';
  var slug=team.replace(/[^a-z0-9]+/gi,'').slice(0,10)||'club';
  var j=String(G.jersey||0);
  var parts=String(senderName||'').trim().split(/\s+/);
  var ini=((parts[0]?parts[0][0]:'?')+(parts[1]?parts[1][0]:'?')).toLowerCase();
  var h=hashStr(String(senderName)+String(salt)+team+j)%9;
  if(h===0) return '@'+slug+'_'+j;
  if(h===1) return '@'+j+ini+ri(0,9);
  if(h===2) return '@benchwarmer_'+ri(100,999);
  if(h===3) return '@'+ini+ri(10,99);
  if(h===4) return '#'+j+' · '+team.split(/\s+/).slice(-1)[0];
  if(h===5) return '@'+slug+'.'+ri(1,9);
  if(h===6) return '@shift_'+ri(200,899);
  if(h===7) return '@'+ini+'_'+ri(1,9);
  return '@roomie_'+slug;
}
function makeStaffHandle(roleLabel){
  var team=G.team&&G.team.n?G.team.n:'Team';
  var slug=team.replace(/[^a-z0-9]+/gi,'').slice(0,8)||'tm';
  var h=hashStr(roleLabel+team)%6;
  if(h===0) return roleLabel.replace(/\s+/g,'').toLowerCase()+'@'+slug;
  if(h===1) return '@staff_'+slug+'_'+ri(1,9);
  if(h===2) return '@'+slug+'_'+roleLabel.slice(0,4).toLowerCase().replace(/\s+/g,'');
  if(h===3) return '@bench_'+ri(300,899);
  if(h===4) return roleLabel.split(/\s+/).map(function(w){return w[0];}).join('').toLowerCase()+'@'+slug;
  return roleLabel+' — '+team;
}
function fanHandleVariant(base, idx){
  var b=String(base||'fan');
  var h=hashStr(b+idx)%7;
  if(h===0) return '@'+b;
  if(h===1) return '@'+b+ri(1,9);
  if(h===2) return '@'+b+'_'+ri(10,99);
  if(h===3) return '@'+b.slice(0,Math.min(10,b.length))+ri(100,999);
  if(h===4) return '@'+b.charAt(0)+ri(1000,9999);
  if(h===5) return '@'+b+'x'+ri(0,9);
  return '@ice_'+b+ri(1,99);
}
function accrueWeeklySalary(){
  if(!G||G._inOffseason) return;
  var sal=(G.contract&&G.contract.sal)|0;
  if(sal<=0) return;
  var perWk=getGamesPerWeek(G.leagueKey);
  var wks=Math.max(1,Math.ceil((G.league.games||68)/perWk));
  G.careerEarnings=(G.careerEarnings||0)+Math.round(sal/wks);
}
function tickSocialFollowers(){
  if(!G) return;
  var base=ri(0,5)+(G.morale>=70?3:0)+(G.morale>=85?4:0);
  if((G.wonCup||G.careerCups)&&Math.random()<0.08) base+=ri(8,30);
  G.socialFollowers=Math.min(9999999,(G.socialFollowers||0)+base);
}
