/* breakaway — CREATE PLAYER */
// ============================================================
// CREATE PLAYER
// ============================================================
function setPos(pos, btn){
  selPos = pos;
  var btns = document.querySelectorAll('#pos-btns button');
  for(var i=0;i<btns.length;i++) btns[i].className='btn bs';
  if(btn) btn.className='btn bp';
  var sub = safeEl('pos-sub');
  if(pos==='F'){
    selSubPos='C';
    sub.innerHTML='<button class="btn bp" onclick="setSubPos(\'C\',this)">C</button><button class="btn bs" onclick="setSubPos(\'LW\',this)">LW</button><button class="btn bs" onclick="setSubPos(\'RW\',this)">RW</button>';
  } else if(pos==='D'){
    selSubPos='LD';
    sub.innerHTML='<button class="btn bp" onclick="setSubPos(\'LD\',this)">LD</button><button class="btn bs" onclick="setSubPos(\'RD\',this)">RD</button>';
  } else {
    selSubPos='G';
    sub.innerHTML='';
  }
}

function setSubPos(p,btn){
  selSubPos=p;
  var btnss=document.querySelectorAll('#pos-sub button');
  for(var i=0;i<btnss.length;i++) btnss[i].className='btn bs';
  if(btn) btn.className='btn bp';
}

function goToArchetype(){
  var list=safeEl('arch-list');
  var archs=ARCHETYPES[selPos];
  var html='';
  var keys=Object.keys(archs);
  for(var i=0;i<keys.length;i++){
    var k=keys[i]; var a=archs[k];
    var bKeys=Object.keys(a.boosts);
    var bHtml='';
    for(var j=0;j<bKeys.length;j++){
      var attr=bKeys[j]; var v=a.boosts[attr];
      var lbl=ATTR_LABELS[attr]||attr;
      var sign=v>0?'+':'';
      bHtml+='<span class="badge '+(v>0?'green':'red')+'" style="font-size:11px">'+lbl+' '+sign+v+'</span>';
    }
    html+='<div class="arch-card'+(selArch===k?' sel':'')+'" id="arch-'+k+'" onclick="pickArch(\''+k+'\')">';
    html+='<div class="arch-name">'+stripBracketIcons(a.name)+'</div>';
    html+='<div class="arch-desc">'+a.desc+'</div>';
    html+='<div style="margin-top:6px">'+bHtml+'</div></div>';
  }
  list.innerHTML=html;
  show('s-arch');
}

function pickArch(k){
  selArch=k;
  var cards=document.querySelectorAll('.arch-card');
  for(var i=0;i<cards.length;i++) cards[i].classList.remove('sel');
  var el=safeEl('arch-'+k);
  if(el) el.classList.add('sel');
}

function goToPotential(){
  var gSel=(safeEl('c-gender')&&safeEl('c-gender').value)||'M';
  var wh=safeEl('potential-w-hint');
  if(wh){
    if(gSel==='F'){
      wh.style.display='block';
      wh.textContent="Women's path: projection uses the same tiers in the women's OVR context (not the men's number line).";
    } else {
      wh.style.display='none';
      wh.textContent='';
    }
  }
  var plist=safeEl('potential-list');
  var phtml='';
  var pOrder=['mvp','franchise','elite','support','depth','fringe','minor'];
  for(var pi=0;pi<pOrder.length;pi++){
    var pid=pOrder[pi];
    var pr=POTENTIALS[pid];
    if(!pr) continue;
    phtml+='<div class="arch-card'+(selPotential===pid?' sel':'')+'" id="pot-'+pid+'" onclick="pickPotential(\''+pid+'\')">';
    phtml+='<div class="arch-name">'+pr.label+'</div>';
    phtml+='<div class="arch-desc">'+pr.desc+'</div></div>';
  }
  plist.innerHTML=phtml;
  show('s-potential');
}
function goToXFactor(){
  var list=safeEl('xfactor-list');
  var html='';
  var keys=Object.keys(X_FACTORS);
  for(var i=0;i<keys.length;i++){
    var id=keys[i];
    var xf=X_FACTORS[id];
    html+='<div class="arch-card'+(selXFactor===id?' sel':'')+'" id="xf-'+id+'" onclick="pickXFactor(\''+id+'\')">';
    html+='<div class="arch-name">'+stripBracketIcons(xf.name)+'</div>';
    html+='<div class="arch-desc">'+xf.desc+'</div></div>';
  }
  list.innerHTML=html;
  show('s-xfactor');
}
function pickPotential(id){
  if(!POTENTIALS[id]) return;
  selPotential=id;
  var cards=document.querySelectorAll('#potential-list .arch-card');
  for(var i=0;i<cards.length;i++) cards[i].classList.remove('sel');
  var el=safeEl('pot-'+id);
  if(el) el.classList.add('sel');
}
function pickXFactor(id){
  if(!X_FACTORS[id]) return;
  selXFactor=id;
  var cards=document.querySelectorAll('#xfactor-list .arch-card');
  for(var i=0;i<cards.length;i++) cards[i].classList.remove('sel');
  var el=safeEl('xf-'+id);
  if(el) el.classList.add('sel');
}

function goToAttributes(){
  var gAttr=(safeEl('c-gender')&&safeEl('c-gender').value)||'M';
  ptsLeft=typeof getCreatePointBudget==='function'?getCreatePointBudget(gAttr):20;
  var ptsMaxEl=safeEl('pts-budget-max');
  if(ptsMaxEl) ptsMaxEl.textContent=ptsLeft;
  G._attrClampMin=40;
  G._extraAttrs={};
  if(selPos==='G'){
    var attrList=ATTRS.G||[];
    var baseStart=58;
    var base={};
    attrList.forEach(function(a){ base[a]=baseStart; });
    var arch=ARCHETYPES.G[selArch];
    if(arch&&arch.boosts){
      Object.keys(arch.boosts).forEach(function(k){
        if(base[k]!==undefined) base[k]=cl(base[k]+arch.boosts[k],G._attrClampMin,92);
      });
    }
    G._baseAttrs=base;
    attrList.forEach(function(a){ G._extraAttrs[a]=0; });
  } else {
    var hand=(safeEl('c-hand')&&safeEl('c-hand').value)||'R';
    G._baseAttrs=typeof buildSkaterCreateBases==='function'?buildSkaterCreateBases(selPos, selArch, gAttr, hand):{};
    getCreateSkaterAttrKeys().forEach(function(k){ G._extraAttrs[k]=0; });
  }
  renderAttrDist();
  show('s-attrs');
}

function renderAttrDistRow(a){
  var cmin=(typeof G._attrClampMin==='number')?G._attrClampMin:40;
  var base=G._baseAttrs[a]||50;
  var extra=G._extraAttrs[a]||0;
  var total=cl(base+extra,cmin,99);
  var barW=typeof statBarPct==='function'?statBarPct(total,cmin,99):total;
  var color=ATTR_COLORS[a]||'var(--mut)';
  var lbl=ATTR_LABELS[a]||a;
  var gAttr=(safeEl('c-gender')&&safeEl('c-gender').value)||'M';
  var maxBoost=typeof getCreateMaxSubBoost==='function'?getCreateMaxSubBoost(gAttr):8;
  var html='<div class="attr-row-d">';
  html+='<div class="slbl">'+lbl+'</div>';
  html+='<button class="attr-btn" onclick="chgAttr(\''+a+'\',-1)"'+(extra<=0?' disabled':'')+'>-</button>';
  html+='<div class="sbar"><div class="sfill" style="'+(barW>0?'min-width:1px;':'')+'background:'+color+';width:'+barW+'%"></div></div>';
  html+='<div class="sval" id="av-'+a+'">'+total+'</div>';
  html+='<button class="attr-btn" onclick="chgAttr(\''+a+'\',1)"'+(ptsLeft<=0||extra>=maxBoost?' disabled':'')+'>+</button>';
  html+='</div>';
  return html;
}

function renderAttrDist(){
  var html='';
  var gAttr=(safeEl('c-gender')&&safeEl('c-gender').value)||'M';
  var budget=typeof getCreatePointBudget==='function'?getCreatePointBudget(gAttr):20;
  if(selPos==='G'){
    var attrList=ATTRS.G||[];
    for(var gi=0;gi<attrList.length;gi++) html+=renderAttrDistRow(attrList[gi]);
  } else if(typeof SKATER_ATTR_CATEGORIES!=='undefined'){
    var ck, cd, ci, subKey, catAvg;
    html+='<div class="vt" style="font-size:12px;color:var(--mut);margin-bottom:8px;line-height:1.45">Archetype sets your starting shape. Spend <b>'+budget+' points</b> on sub-ratings below.<br>'+
      '<span style="color:var(--acc)">'+((safeEl('c-hand')&&safeEl('c-hand').value)==='L'?'Left shot: +accuracy/precision':'Right shot: +power')+'</span> (small edge).</div>';
    for(ck in SKATER_ATTR_CATEGORIES){
      if(!SKATER_ATTR_CATEGORIES.hasOwnProperty(ck)) continue;
      cd=SKATER_ATTR_CATEGORIES[ck];
      catAvg=typeof getCategoryAverage==='function'?getCategoryAverage(G._baseAttrs,cd):50;
      html+='<div class="vt" style="font-size:12px;color:'+(cd.color||'var(--gold)')+';margin:10px 0 4px">'+cd.label+' <span style="color:var(--mut);font-size:11px">start ~'+catAvg+'</span></div>';
      for(ci=0;ci<cd.keys.length;ci++){
        subKey=cd.keys[ci];
        html+=renderAttrDistRow(subKey);
      }
    }
    html+='<div class="vt" style="font-size:12px;color:var(--acc);margin:10px 0 4px">BASE</div>';
    html+=renderAttrDistRow('durability');
  } else {
    var attrList=ATTRS[selPos]||[];
    for(var i=0;i<attrList.length;i++) html+=renderAttrDistRow(attrList[i]);
  }
  safeEl('attr-dist').innerHTML=html;
  safeEl('pts-left').textContent=ptsLeft;
  var ptsMaxEl=safeEl('pts-budget-max');
  if(ptsMaxEl) ptsMaxEl.textContent=budget;
  renderAttrPreview();
}

function chgAttr(a,d){
  var gAttr=(safeEl('c-gender')&&safeEl('c-gender').value)||'M';
  var maxBoost=typeof getCreateMaxSubBoost==='function'?getCreateMaxSubBoost(gAttr):8;
  if(d>0&&ptsLeft<=0)return;
  if(d<0&&(G._extraAttrs[a]||0)<=0)return;
  if(d>0&&(G._extraAttrs[a]||0)>=maxBoost)return;
  G._extraAttrs[a]=(G._extraAttrs[a]||0)+d;
  ptsLeft-=d;
  renderAttrDist();
}

function renderAttrPreview(){
  var gender=(safeEl('c-gender')&&safeEl('c-gender').value)||'M';
  var cmin=40;
  var attrs=typeof finalizeCreateSkaterAttrs==='function'
    ?finalizeCreateSkaterAttrs(selPos, gender, G._baseAttrs||{}, G._extraAttrs||{})
    :{};
  var html='';
  function previewRow(k,v){
    var color=ATTR_COLORS[k]||'var(--acc)';
    var barW=typeof statBarPct==='function'?statBarPct(v,cmin,99):v;
    return '<div class="srow"><div class="slbl">'+(ATTR_LABELS[k]||k)+'</div><div class="sbar"><div class="sfill" style="background:'+color+';width:'+barW+'%"></div></div><div class="sval">'+(attrs[k]||0)+'</div></div>';
  }
  if(selPos==='G'){
    var gk=ATTRS.G||[];
    for(var gi=0;gi<gk.length;gi++) html+=previewRow(gk[gi], attrs[gk[gi]]||0);
  } else if(typeof SKATER_ATTR_CATEGORIES!=='undefined'){
    var ck, cd, ci, subKey, catOvr;
    for(ck in SKATER_ATTR_CATEGORIES){
      if(!SKATER_ATTR_CATEGORIES.hasOwnProperty(ck)) continue;
      cd=SKATER_ATTR_CATEGORIES[ck];
      catOvr=typeof getCategoryAverage==='function'?getCategoryAverage(attrs,cd):0;
      html+='<div class="vt" style="font-size:11px;color:'+(cd.color||'var(--gold)')+';margin:6px 0 2px">'+cd.label+' '+catOvr+'</div>';
      for(ci=0;ci<cd.keys.length;ci++){
        subKey=cd.keys[ci];
        html+=previewRow(subKey, attrs[subKey]||0);
      }
    }
    html+=previewRow('durability', attrs.durability||0);
  }
  html+='<div style="margin-top:8px"><span class="badge gold">OVR '+ovr(attrs, selPos)+'</span></div>';
  safeEl('attr-preview').innerHTML=html;
}

function computeCreateAttrsPreviewOvr(){
  var gender=safeEl('c-gender').value;
  if(selPos==='G'){
    var attrList=ATTRS.G||[];
    var arch=ARCHETYPES.G[selArch];
    var attrs={};
    var baseStart=58;
    var attrClampMin=40;
    attrList.forEach(function(a){attrs[a]=baseStart;});
    if(arch&&arch.boosts){
      Object.keys(arch.boosts).forEach(function(k){if(attrs[k]!==undefined)attrs[k]=cl(attrs[k]+arch.boosts[k],attrClampMin,92);});
    }
    attrList.forEach(function(a){attrs[a]=cl((G._baseAttrs&&G._baseAttrs[a]||attrs[a])+(G._extraAttrs&&G._extraAttrs[a]||0),attrClampMin,99);});
    return ovr(attrs, selPos);
  }
  var attrs=finalizeCreateSkaterAttrs(selPos, gender, G._baseAttrs||{}, G._extraAttrs||{});
  return ovr(attrs, selPos);
}

function isPaidOverseasSemiProStartLeague(leagueKey){
  var L=LEAGUES[leagueKey];
  if(!L) return false;
  return (L.tier==='euro'||L.tier==='asia')&&(L.salBase||0)>0;
}

/** Age-16 create: block NCHA/NWCHA and paid SHL/Liiga/KHL-style starts unless preview OVR clears the bar. */
function isJuniorLeagueBlockedForAge(leagueKey, age){
  var L=LEAGUES[leagueKey];
  if(!L||L.tier!=='junior') return false;
  if(typeof isJuniorEligibleAge==='function') return !isJuniorEligibleAge(age);
  var a=age||16;
  return a<16||a>19;
}

function isStartingCollegeOrPaidSemiProBlocked(leagueKey, gender, previewOvr){
  var L=LEAGUES[leagueKey];
  if(!L) return false;
  if(L.tier!=='college' && !isPaidOverseasSemiProStartLeague(leagueKey)) return false;
  var need=START_LEAGUE_BYPASS_OVR_M;
  return previewOvr<need;
}

function isLocalLeagueBlockedForNat(leagueKey, nat){
  var L=LEAGUES[leagueKey];
  if(!L||L.tier!=='local') return false;
  if(typeof isNatEligibleForLocalHockey==='function'&&!isNatEligibleForLocalHockey(nat)) return true;
  if(typeof qualifiesForLocalTeam==='function') return !qualifiesForLocalTeam(nat);
  return false;
}

function getLocalLeagueBlockReason(nat){
  if(typeof isNatEligibleForLocalHockey==='function'&&!isNatEligibleForLocalHockey(nat)){
    return typeof getLocalBlockedNatHint==='function'?getLocalBlockedNatHint(nat):'Established hockey nation — LHL is for growing markets only.';
  }
  return 'LHL unavailable from '+nat+'.';
}

function goToLeague(){
  var gender=safeEl('c-gender').value;
  var startKeys=gender==='M'?START_LEAGUES_M:START_LEAGUES_F;
  var previewOvr=computeCreateAttrsPreviewOvr();
  var needBypass=START_LEAGUE_BYPASS_OVR_M;
  var natEl=safeEl('c-nat');
  var homeNat=natEl&&natEl.value?natEl.value:'Canada';
  var firstUn=null, ui;
  for(ui=0;ui<startKeys.length;ui++){
    if(isStartingCollegeOrPaidSemiProBlocked(startKeys[ui], gender, previewOvr)) continue;
    if(isLocalLeagueBlockedForNat(startKeys[ui], homeNat)) continue;
    firstUn=startKeys[ui]; break;
  }
  var defaultK=firstUn||startKeys[0];
  if(!selLeague || startKeys.indexOf(selLeague)<0 || isStartingCollegeOrPaidSemiProBlocked(selLeague, gender, previewOvr)) selLeague=defaultK;
  if(isLocalLeagueBlockedForNat(selLeague, homeNat)){
    for(ui=0;ui<startKeys.length;ui++){
      if(!isLocalLeagueBlockedForNat(startKeys[ui], homeNat)&&!isStartingCollegeOrPaidSemiProBlocked(startKeys[ui], gender, previewOvr)){
        selLeague=startKeys[ui]; break;
      }
    }
  }
  var html='';
  for(var i=0;i<startKeys.length;i++){
    var k=startKeys[i]; var l=LEAGUES[k];
    var blocked=isStartingCollegeOrPaidSemiProBlocked(k, gender, previewOvr);
    if(!blocked) blocked=isJuniorLeagueBlockedForAge(k, 16);
    if(!blocked) blocked=isLocalLeagueBlockedForNat(k, homeNat);
    var tierColor=l.tier==='local'?'var(--green)':l.tier==='junior'?'var(--acc)':l.tier==='college'?'var(--pur)':l.tier==='euro'?'var(--gold)':'var(--blue)';
    var isSel=selLeague===k?'sel':'';
    var localNote='';
    if(l.tier==='local'&&typeof getLocalTeamForNat==='function'){
      var ht=getLocalTeamForNat(homeNat, gender);
      if(typeof isNatEligibleForLocalHockey==='function'&&!isNatEligibleForLocalHockey(homeNat)){
        localNote=' <span style="color:var(--red)">Not available from '+homeNat+' — use junior/overseas paths.</span>';
        if(typeof getLocalBlockedNatHint==='function') localNote+=' '+getLocalBlockedNatHint(homeNat);
      } else {
        if(ht) localNote=' Home club: <b>'+ht.n+'</b>.';
        localNote+=' <span style="color:var(--green)">Open entry — lowest level, strong development.</span>';
        if(typeof getLocalLeagueEntryHint==='function') localNote+=' '+getLocalLeagueEntryHint(homeNat);
      }
    }
    html+='<div class="lcard '+isSel+(blocked?' locked':'')+'" id="lc-'+k+'" onclick="pickLeague(\''+k+'\')">';
    html+='<div class="ltier" style="color:'+tierColor+'">'+l.tier.toUpperCase()+'</div>';
    html+='<div class="lname">'+stripBracketIcons(l.short)+' -- '+l.name+'</div>';
    html+='<div class="ldesc">'+l.desc+(l.tier==='junior'?' <span style="color:var(--acc)">[Ages 16–19 only]</span>':'')+(l.tier==='local'?' <span style="color:var(--green)">[12 games + 6 events]</span>':'')+localNote+'  ['+(l.tier==='local'?'12 G + 6 EVENTS':l.games+' GAMES/SEASON')+']'+(blocked&&l.tier!=='local'&&l.tier!=='junior'?' <span style="color:var(--gold)"> // At 16: '+needBypass+'+ preview OVR to jump here.</span>':'')+(blocked&&l.tier==='local'?' <span style="color:var(--red)"> // '+escHtml(getLocalLeagueBlockReason(homeNat))+'</span>':'')+'</div>';
    html+='</div>';
  }
  safeEl('league-list').innerHTML=html;
  show('s-league');
}

function pickLeague(k){
  var gender=safeEl('c-gender').value;
  var previewOvr=computeCreateAttrsPreviewOvr();
  var nat=safeEl('c-nat')?safeEl('c-nat').value:'Canada';
  if(isStartingCollegeOrPaidSemiProBlocked(k, gender, previewOvr)){
    var need=START_LEAGUE_BYPASS_OVR_M;
    notify('That path targets 17+ unless preview OVR is '+need+'+ (yours: '+Math.round(previewOvr)+').','gold');
    return;
  }
  if(isLocalLeagueBlockedForNat(k, nat)){
    notify(getLocalLeagueBlockReason(nat),'gold');
    return;
  }
  if(isJuniorLeagueBlockedForAge(k, 16)){
    notify('Junior leagues are ages 16–19 only.','gold');
    return;
  }
  selLeague=k;
  var cards=document.querySelectorAll('#league-list .lcard');
  for(var i=0;i<cards.length;i++) cards[i].classList.remove('sel');
  var el=safeEl('lc-'+k);
  if(el) el.classList.add('sel');
}
