/* breakaway — INIT */
// ============================================================
// INIT
// ============================================================
function initSelectors(){
  var ys=safeEl('c-year');
  for(var y=1960;y<=2030;y++){var o=document.createElement('option');o.value=y;o.text=y;ys.appendChild(o);}
  ys.value=2006;
  var ns=safeEl('c-nat');
  NATS.forEach(function(n){var o=document.createElement('option');o.value=n.n;o.text='['+n.c+'] '+n.n;ns.appendChild(o);});
  // random default jersey
  safeEl('c-jersey').value=ri(1,99);
  setPos('F', document.querySelector('#pos-btns button'));
  populateFavoriteTeamSelect();
  updateSettingsHintText();
  refreshAudioHintBanner();
  try{
    if(window.location.protocol==='file:'){
      var ah=document.getElementById('audio-unlock-hint');
      if(ah) ah.innerHTML+='<br><span style="color:var(--gold);font-size:9px;letter-spacing:1px">FILE:// MAY BLOCK WEB AUDIO -- TRY LIVE SERVER / LOCALHOST.</span>';
    }
  }catch(e){}
  applyRetroFxClasses();
  fillCreateHeightWeightSelects();
}

function populateFavoriteTeamSelect(){
  var sel=safeEl('c-favorite-team');
  if(!sel) return;
  var g=safeEl('c-gender').value||'M';
  sel.innerHTML='';
  var o0=document.createElement('option');
  o0.value=''; o0.text='-- NONE / SKIP --';
  sel.appendChild(o0);
  var keys=Object.keys(LEAGUES).sort();
  for(var ki=0;ki<keys.length;ki++){
    var lk=keys[ki];
    var L=LEAGUES[lk];
    if(!L||L.gender!==g) continue;
    var teams=TEAMS[lk]||[];
    for(var ti=0;ti<teams.length;ti++){
      var t=teams[ti];
      var o=document.createElement('option');
      o.value=lk+'|'+t.n;
      o.text=t.n+' ('+L.short+')';
      sel.appendChild(o);
    }
  }
}

function onGenderChange(){
  selLeague = safeEl('c-gender').value === 'M' ? 'OJL' : 'CWHL';
  populateFavoriteTeamSelect();
  fillCreateHeightWeightSelects();
  try{
    var cur=document.querySelector('.screen.on');
    if(cur&&cur.id==='s-potential') goToPotential();
    else if(cur&&cur.id==='s-xfactor') goToXFactor();
  }catch(e){}
}
