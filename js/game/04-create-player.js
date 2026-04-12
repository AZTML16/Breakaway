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
      wh.textContent="WOMEN'S PATH: PROJECTION USES THE SAME TIERS IN THE WOMEN'S OVR CONTEXT (NOT THE MEN'S NUMBER LINE).";
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
  ptsLeft=20;
  var attrList=ATTRS[selPos];
  var base={};
  var arch=ARCHETYPES[selPos][selArch];
  var gAttr=(safeEl('c-gender')&&safeEl('c-gender').value)||'M';
  var baseStart=gAttr==='F'?30:(selPos==='G'?58:55);
  // Men: floor 40 on attrs (matches 55/58 base). Women: floor 22 so archetype minuses stay low — OVR stays low 30s, not low 40s.
  G._attrClampMin=gAttr==='F'?22:40;
  attrList.forEach(function(a){base[a]=baseStart;});
  if(arch && arch.boosts){
    Object.keys(arch.boosts).forEach(function(k){
      if(base[k]!==undefined) base[k]=cl(base[k]+arch.boosts[k],G._attrClampMin,92);
    });
  }
  G._baseAttrs=base;
  G._extraAttrs={};
  attrList.forEach(function(a){G._extraAttrs[a]=0;});
  renderAttrDist();
  show('s-attrs');
}

function renderAttrDist(){
  var attrList=ATTRS[selPos];
  var html='';
  var cmin=(typeof G._attrClampMin==='number')?G._attrClampMin:40;
  for(var i=0;i<attrList.length;i++){
    var a=attrList[i];
    var base=G._baseAttrs[a]||55;
    var extra=G._extraAttrs[a]||0;
    var total=cl(base+extra,cmin,99);
    var color=ATTR_COLORS[a]||'var(--mut)';
    var lbl=ATTR_LABELS[a]||a;
    html+='<div class="attr-row-d">';
    html+='<div class="slbl">'+lbl+'</div>';
    html+='<button class="attr-btn" onclick="chgAttr(\''+a+'\',-1)"'+(extra<=0?' disabled':'')+'>-</button>';
    html+='<div class="sbar"><div class="sfill" style="background:'+color+';width:'+total+'%"></div></div>';
    html+='<div class="sval" id="av-'+a+'">'+total+'</div>';
    html+='<button class="attr-btn" onclick="chgAttr(\''+a+'\',1)"'+(ptsLeft<=0||extra>=10?' disabled':'')+'>+</button>';
    html+='</div>';
  }
  safeEl('attr-dist').innerHTML=html;
  safeEl('pts-left').textContent=ptsLeft;
  renderAttrPreview();
}

function chgAttr(a,d){
  if(d>0&&ptsLeft<=0)return;
  if(d<0&&(G._extraAttrs[a]||0)<=0)return;
  if(d>0&&(G._extraAttrs[a]||0)>=10)return;
  G._extraAttrs[a]=(G._extraAttrs[a]||0)+d;
  ptsLeft-=d;
  renderAttrDist();
}

function renderAttrPreview(){
  var attrList=ATTRS[selPos];
  var finals={};
  var cmin=(typeof G._attrClampMin==='number')?G._attrClampMin:40;
  attrList.forEach(function(a){finals[a]=cl((G._baseAttrs[a]||55)+(G._extraAttrs[a]||0),cmin,99);});
  var html='';
  attrList.forEach(function(a){
    var color=ATTR_COLORS[a]||'var(--mut)';
    var lbl=ATTR_LABELS[a]||a;
    html+='<div class="srow"><div class="slbl">'+lbl+'</div><div class="sbar"><div class="sfill" style="background:'+color+';width:'+finals[a]+'%"></div></div><div class="sval">'+finals[a]+'</div></div>';
  });
  html+='<div style="margin-top:8px"><span class="badge gold">OVR '+ovr(finals)+'</span></div>';
  safeEl('attr-preview').innerHTML=html;
}

function computeCreateAttrsPreviewOvr(){
  var gender=safeEl('c-gender').value;
  var attrList=ATTRS[selPos];
  var arch=ARCHETYPES[selPos][selArch];
  var attrs={};
  var baseStartF=gender==='F'?30:(selPos==='G'?58:55);
  var attrClampMin=gender==='F'?22:40;
  attrList.forEach(function(a){attrs[a]=baseStartF;});
  if(arch && arch.boosts){
    Object.keys(arch.boosts).forEach(function(k){if(attrs[k]!==undefined)attrs[k]=cl(attrs[k]+arch.boosts[k],attrClampMin,92);});
  }
  attrList.forEach(function(a){attrs[a]=cl((G._baseAttrs&&G._baseAttrs[a]||attrs[a])+(G._extraAttrs&&G._extraAttrs[a]||0),attrClampMin,99);});
  return ovr(attrs);
}

function isPaidOverseasSemiProStartLeague(leagueKey){
  var L=LEAGUES[leagueKey];
  if(!L) return false;
  return (L.tier==='euro'||L.tier==='asia')&&(L.salBase||0)>0;
}

/** Age-16 create: block NCHA/NWCHA and paid SHL/Liiga/KHL-style starts unless preview OVR clears the bar. */
function isStartingCollegeOrPaidSemiProBlocked(leagueKey, gender, previewOvr){
  var L=LEAGUES[leagueKey];
  if(!L) return false;
  if(L.tier!=='college' && !isPaidOverseasSemiProStartLeague(leagueKey)) return false;
  var need=gender==='F'?START_LEAGUE_BYPASS_OVR_F:START_LEAGUE_BYPASS_OVR_M;
  return previewOvr<need;
}

function goToLeague(){
  var gender=safeEl('c-gender').value;
  var startKeys=gender==='M'?START_LEAGUES_M:START_LEAGUES_F;
  var previewOvr=computeCreateAttrsPreviewOvr();
  var needBypass=gender==='F'?START_LEAGUE_BYPASS_OVR_F:START_LEAGUE_BYPASS_OVR_M;
  var firstUn=null, ui;
  for(ui=0;ui<startKeys.length;ui++){
    if(!isStartingCollegeOrPaidSemiProBlocked(startKeys[ui], gender, previewOvr)){ firstUn=startKeys[ui]; break; }
  }
  var defaultK=firstUn||startKeys[0];
  if(!selLeague || startKeys.indexOf(selLeague)<0 || isStartingCollegeOrPaidSemiProBlocked(selLeague, gender, previewOvr)) selLeague=defaultK;
  var html='';
  for(var i=0;i<startKeys.length;i++){
    var k=startKeys[i]; var l=LEAGUES[k];
    var blocked=isStartingCollegeOrPaidSemiProBlocked(k, gender, previewOvr);
    var tierColor=l.tier==='junior'?'var(--acc)':l.tier==='college'?'var(--pur)':l.tier==='euro'?'var(--gold)':'var(--blue)';
    var isSel=selLeague===k?'sel':'';
    html+='<div class="lcard '+isSel+(blocked?' locked':'')+'" id="lc-'+k+'" onclick="pickLeague(\''+k+'\')">';
    html+='<div class="ltier" style="color:'+tierColor+'">'+l.tier.toUpperCase()+'</div>';
    html+='<div class="lname">'+stripBracketIcons(l.short)+' -- '+l.name+'</div>';
    html+='<div class="ldesc">'+l.desc+'  ['+l.games+' GAMES/SEASON]'+(blocked?' <span style="color:var(--gold)"> // At 16: '+needBypass+'+ preview OVR to jump here.</span>':'')+'</div>';
    html+='</div>';
  }
  safeEl('league-list').innerHTML=html;
  show('s-league');
}

function pickLeague(k){
  var gender=safeEl('c-gender').value;
  var previewOvr=computeCreateAttrsPreviewOvr();
  if(isStartingCollegeOrPaidSemiProBlocked(k, gender, previewOvr)){
    var need=gender==='F'?START_LEAGUE_BYPASS_OVR_F:START_LEAGUE_BYPASS_OVR_M;
    notify('That path targets 17+ unless preview OVR is '+need+'+ (yours: '+Math.round(previewOvr)+').','gold');
    return;
  }
  selLeague=k;
  var cards=document.querySelectorAll('#league-list .lcard');
  for(var i=0;i<cards.length;i++) cards[i].classList.remove('sel');
  var el=safeEl('lc-'+k);
  if(el) el.classList.add('sel');
}
