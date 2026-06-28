/* breakaway — OFFSEASON */
// ============================================================
// OFFSEASON
// ============================================================
function getProLeagueKeyByGender(gender){return gender==='F'?'PWL':'PHL';}
function getMinorLeagueKeyByGender(gender){return gender==='F'?'PWDL':'NAML';}
function getSemiProLeagueKeysByGender(gender){return gender==='F'?['SDHL','FWHL','AWHL']:['NEHL','FHL','CEHL','ARHL'];}

/** Leagues you may play in while a pro deal with that club/circuit is active (incl. dev loans). */
var CONTRACT_CIRCUIT_LEAGUES={
  na_pro_m:['PHL','NAML','OJL','QMJL','WJL','USJL','NCHA','NEJC','CEJC','ARJC'],
  na_pro_f:['PWL','PWDL','CWHL','NWCHA','USWDL','EWJC','AWJC'],
  arhl:['ARHL','ARJC'],
  nehl:['NEHL','NEJC'],
  fhl:['FHL','NEJC'],
  cehl:['CEHL','CEJC'],
  sdhl:['SDHL','EWJC'],
  fwhl:['FWHL'],
  awhl:['AWHL','AWJC']
};

function getContractCircuit(leagueKey){
  var k=String(leagueKey||'');
  if(k==='PHL'||k==='NAML'||k==='OJL'||k==='QMJL'||k==='WJL'||k==='USJL'||k==='NCHA') return 'na_pro_m';
  if(k==='PWL'||k==='PWDL'||k==='CWHL'||k==='NWCHA'||k==='USWDL') return 'na_pro_f';
  if(k==='ARHL'||k==='ARJC') return 'arhl';
  if(k==='NEHL'||k==='NEJC') return 'nehl';
  if(k==='FHL') return 'fhl';
  if(k==='CEHL'||k==='CEJC') return 'cehl';
  if(k==='SDHL'||k==='EWJC') return 'sdhl';
  if(k==='FWHL') return 'fwhl';
  if(k==='AWHL'||k==='AWJC') return 'awhl';
  return '';
}

function getContractCircuitLeagues(circuit){
  return CONTRACT_CIRCUIT_LEAGUES[circuit]||null;
}

function getContractCircuitHint(circuit){
  if(circuit==='na_pro_m') return 'PHL/NAML two-way, NA junior/college loans, rare overseas junior loans (NEJC/CEJC/ARJC)';
  if(circuit==='na_pro_f') return 'PWL/PWDL two-way, women\'s junior/college loans, rare EWJC/AWJC loans';
  if(circuit==='arhl') return 'ARHL + ARJC development';
  if(circuit==='nehl') return 'NEHL + NEJC';
  if(circuit==='fhl') return 'FHL + NEJC (Finland)';
  if(circuit==='cehl') return 'CEHL + CEJC (Central Europe)';
  if(circuit==='sdhl') return 'SDHL + EWJC';
  if(circuit==='fwhl') return 'FWHL';
  if(circuit==='awhl') return 'AWHL + AWJC';
  return 'your signing league';
}

function stampContractBinding(leagueKey, teamName){
  var circuit=getContractCircuit(leagueKey);
  if(!circuit) return;
  G._contractSignedLeagueKey=leagueKey;
  G._contractClubTeam=teamName||'';
  G._contractCircuit=circuit;
}

function ensureContractBindingStamped(){
  if(!G||(G.contractYrsLeft||0)<=0) return;
  if(G._contractCircuit) return;
  if(G.leagueKey) stampContractBinding(G._contractSignedLeagueKey||G.leagueKey, (G._contractClubTeam||G.team&&G.team.n));
}

function isPlayerUnderBindingContract(){
  if(!G||!G.contract) return false;
  if((G.contractYrsLeft||0)<=0) return false;
  var t=String(G.contract.type||'');
  if(t==='AMATEUR'||t==='JUNIOR DEAL'||t==='SCHOLARSHIP') return false;
  if(G.league&&(G.league.tier==='junior'||G.league.tier==='college'||G.league.tier==='local')) return false;
  return true;
}

function isContractLeagueMoveAllowed(targetKey){
  if(!isPlayerUnderBindingContract()) return true;
  ensureContractBindingStamped();
  var circuit=G._contractCircuit||getContractCircuit(G._contractSignedLeagueKey||G.leagueKey);
  var allowed=getContractCircuitLeagues(circuit);
  if(!allowed) return true;
  return allowed.indexOf(targetKey)>=0;
}

function getContractMoveBlockReason(targetKey){
  ensureContractBindingStamped();
  var circuit=G._contractCircuit||getContractCircuit(G._contractSignedLeagueKey||G.leagueKey);
  var club=G._contractClubTeam||(G.team&&G.team.n)||'your club';
  var yrs=G.contractYrsLeft||0;
  var tgt=LEAGUES[targetKey]?LEAGUES[targetKey].short:targetKey;
  return 'Contract: '+club+' ('+(G.league&&G.league.short||'')+') — '+yrs+' yr(s) left. Cannot join '+tgt+' while under this deal. Allowed: '+getContractCircuitHint(circuit)+'. Request a release or wait for free agency.';
}

function clearContractCircuitBinding(){
  if(!G) return;
  G._contractCircuit=null;
  G._contractSignedLeagueKey=null;
  G._contractClubTeam=null;
}

function getContractRightsGuideHtml(){
  var minorK=getMinorLeagueKeyByGender(G&&G.gender==='F'?'F':'M');
  var proK=getProLeagueKeyByGender(G&&G.gender==='F'?'F':'M');
  return '<div style="margin-top:10px;padding:10px 12px;border:1px solid rgba(122,184,224,.22);background:rgba(8,18,28,.45);line-height:1.65">'+
    '<div style="font-size:12px;color:var(--gold);margin-bottom:6px">CONTRACTS, DRAFT &amp; FREE AGENCY</div>'+
    '<div style="font-size:13px;color:var(--mut)">'+
    '<b>Draft rights &ne; contract:</b> A '+proK+' pick only holds your <b>rights</b> — not a salary deal. With rights and <b>no contract</b>, you can still play overseas semi-pro (NEHL/CEHL/ARHL, etc.) or stay in junior/college until the club offers an ELC at <b>'+getDraftClubElcMinOvr()+'+ OVR</b>.<br>'+
    '<b>Under contract:</b> Tied to that circuit until years left hit zero — then you are <b>free to leave</b> that system (UFA/RFA). '+proK+' deals include '+minorK+' two-way and dev loans (NA junior/college; rarely overseas juniors). An <b>ARHL</b> deal keeps you in Eurasia until expiry or release.<br>'+
    '<b>Free agency:</b> Contract expired = new offers anywhere your rights allow. '+proK+' entry still needs matching draft rights; overseas pro does not.<br>'+
    '</div></div>';
}

function requestContractRelease(){
  if(!isPlayerUnderBindingContract()){
    notify('NO BINDING PRO CONTRACT','gold');
    return;
  }
  if(G._releaseRequestThisOffseason){
    notify('ALREADY ASKED THIS OFFSEASON','gold');
    return;
  }
  G._releaseRequestThisOffseason=true;
  var chance=0.24;
  if((G.morale||50)<42) chance+=0.14;
  if(ovr(G.attrs,G.pos)>=getLeagueOvrCap(G.leagueKey)-6) chance+=0.12;
  if((G.teamTenure||0)>=2) chance+=0.08;
  if(G.contract&&G.contract.ntc) chance-=0.06;
  if((G.contractYrsLeft||0)>=3) chance-=0.08;
  chance=cl(chance,0.08,0.72);
  if(Math.random()<chance){
    var buyout=Math.round((G.contract.sal||0)*0.3);
    G.contractYrsLeft=0;
    clearContractCircuitBinding();
    addNews(G.team.n+' grants '+G.first+' '+G.last+' a contract release'+(buyout?(' (buyout ~'+fmt(buyout)+')'):'')+' — you may sign elsewhere.','big');
    convertPlayerToFreeAgency('Club granted release');
    notify('RELEASE GRANTED — FREE TO SIGN','gold');
  } else {
    addNews(G.team.n+' declines a release — honor your contract ('+(G.contractYrsLeft||0)+' yr(s) left) or accept a development assignment within the org.','neutral');
    notify('RELEASE DENIED','red');
  }
}
/** Juniors: ages 16–19 only (must leave before age 20). College: through age 25. */
function getJuniorMinAge(){return 16;}
function getJuniorMaxAge(){return 19;}
function getCollegeMaxAge(){return 25;}
function isJuniorEligibleAge(age){
  age=age||16;
  return age>=getJuniorMinAge()&&age<=getJuniorMaxAge();
}
function canJoinLeagueByAge(targetKey){
  if(!LEAGUES[targetKey]) return true;
  var age=G.age||16;
  var tier=LEAGUES[targetKey].tier;
  if(tier==='junior' && !isJuniorEligibleAge(age)) return false;
  if(tier==='college' && age>getCollegeMaxAge()) return false;
  return true;
}
function isPlayerRfaStatus(){
  if(!G||!G.contract) return false;
  if(G.contract.type==='RFA') return true;
  return getProContractType()==='RFA' && (G.contractYrsLeft||0)<=0;
}
function getRfaCompPickBurden(salAsk,maxSal){
  if(maxSal<=0) return 0;
  return cl((salAsk/maxSal)-0.55,0,0.55)/0.12;
}
function convertPlayerToFreeAgency(reason){
  var wasRfa=isPlayerRfaStatus()||getProContractType()==='RFA';
  G.contract=G.contract||{sal:0,yrs:0,type:'UFA',ntc:false,bonus:false};
  G.contract.type=wasRfa?'RFA':'UFA';
  G.contract.yrs=0;
  G.contract.sal=0;
  G.contractYrsLeft=0;
  clearContractCircuitBinding();
  addNews((reason||'CONTRACT LAPSE')+': '+G.first+' '+G.last+' is now a '+(wasRfa?'restricted':'unrestricted')+' free agent.','neutral');
  generateFAOffers();
  if(!curFAOffers.length) appendFallbackLeagueOffers();
  safeEl('contract-expire-panel').style.display='block';
}
function appendFallbackLeagueOffers(){
  var gender=G.gender;
  var keys=[];
  keys=keys.concat(getSemiProLeagueKeysByGender(gender));
  if(gender==='M') keys=keys.concat(['NEJC','CEJC','ARJC','NEHL','FHL','CEHL','ARHL']);
  else keys=keys.concat(['EWJC','AWJC','SDHL','FWHL','AWHL']);
  keys=keys.filter(function(k){
    if(!LEAGUES[k]||LEAGUES[k].gender!==gender) return false;
    if(!canJoinLeagueByAge(k)) return false;
    return true;
  });
  keys=shuf(keys);
  var i, lk, l, teams, team, dup;
  for(i=0;i<keys.length&&curFAOffers.length<4;i++){
    lk=keys[i];
    dup=false;
  for(var j=0;j<curFAOffers.length;j++){ if(curFAOffers[j].lk===lk){ dup=true; break; } }
    if(dup) continue;
    l=LEAGUES[lk];
    teams=TEAMS[lk]||[];
    if(!teams.length) continue;
    team=teams[ri(0,teams.length-1)];
    curFAOffers.push({lk:lk,l:l,team:team,sal:Math.max(0,l.salBase||0),yrs:ri(1,3),fallback:true});
  }
}
function handleExpiredContractBeforeCamp(){
  if((G.contractYrsLeft||0)>0) return true;
  if(G._offseasonContractSigned) return true;
  if(G.league&&(G.league.tier==='junior'||G.league.tier==='college'||G.league.tier==='local')) return true;
  if(G.contract&&G.contract.type==='AMATEUR') return true;
  if(G._worldFaceoffInvited && G._worldFaceoffDeclined){
    convertPlayerToFreeAgency('Declined World Faceoff and no new club deal');
  } else if((G.contractYrsLeft||0)<=0 && !G._offseasonContractSigned){
    convertPlayerToFreeAgency('No contract signed before training camp');
  }
  if((G.contractYrsLeft||0)>0) return true;
  if(curFAOffers.length){
    notify('SIGN A DEAL OR ACCEPT A FALLBACK OFFER','gold');
    safeEl('contract-expire-panel').style.display='block';
    generateFAOffers();
    return false;
  }
  if(!curFAOffers.length) appendFallbackLeagueOffers();
  if(curFAOffers.length){
    notify('NO PRO INTEREST — OVERSEAS / SEMI-PRO OFFERS ONLY','gold');
    safeEl('contract-expire-panel').style.display='block';
    return false;
  }
  return true;
}

/** OVR band for college / overseas semi-pro when too good for juniors but not pro-ready. */
function getDevPathCollegeSemiMinOvr(){return 68;}
function getDevPathCollegeSemiMaxOvr(){return 74;}
function qualifiesForCollegeSemiProDevPath(){
  if(!G||!G.attrs) return false;
  var o=ovr(G.attrs,G.pos);
  if(o<getDevPathCollegeSemiMinOvr()||o>getDevPathCollegeSemiMaxOvr()) return false;
  if(G.league&&G.league.tier==='pro') return false;
  if(hasActiveDraftRights()&&draftClubWillingToSignElc()) return false;
  return true;
}
function buildCollegeSemiProLeagueKeys(){
  var college=G.gender==='M'?'NCHA':'NWCHA';
  return [college].concat(getSemiProLeagueKeysByGender(G.gender)).filter(function(k){return LEAGUES[k]&&LEAGUES[k].gender===G.gender;});
}
function pickCollegeSemiProSwitchOffers(otherLeagues){
  var col=G.gender==='M'?'NCHA':'NWCHA';
  var semi=getSemiProLeagueKeysByGender(G.gender);
  var out=[], j, k;
  if(otherLeagues.indexOf(col)>=0) out.push(col);
  for(j=0;j<semi.length;j++){
    k=semi[j];
    if(otherLeagues.indexOf(k)>=0&&out.indexOf(k)<0) out.push(k);
  }
  var rest=shuf(otherLeagues.filter(function(x){return out.indexOf(x)<0;}));
  for(j=0;j<rest.length&&out.length<6;j++){
    if(out.indexOf(rest[j])<0) out.push(rest[j]);
  }
  return out;
}
function appendOverseasProOffersWhileRightsHeld(){
  if(!hasActiveDraftRights()) return;
  if(isPlayerUnderBindingContract()) return;
  if(draftClubWillingToSignElc()) return;
  var semi=shuf(getSemiProLeagueKeysByGender(G.gender).slice());
  var i, lk, l, teams, team, dup, j;
  for(i=0;i<semi.length;i++){
    lk=semi[i];
    l=LEAGUES[lk];
    if(!l||l.gender!==G.gender) continue;
    dup=false;
    for(j=0;j<curFAOffers.length;j++){ if(curFAOffers[j].lk===lk){ dup=true; break; } }
    if(dup) continue;
    teams=TEAMS[lk]||[];
    if(!teams.length) continue;
    team=teams[ri(0,teams.length-1)];
    curFAOffers.push({
      lk:lk, l:l, team:team,
      sal:Math.max(0,l.salBase||0),
      yrs:ri(1,3),
      overseasPro:true,
      rightsNote:G.draftRights.team+' ('+G.draftRights.leagueKey+') still holds NA rights'
    });
  }
}

function appendCollegeSemiProFAOffers(){
  if(!qualifiesForCollegeSemiProDevPath()) return;
  var keys=shuf(buildCollegeSemiProLeagueKeys());
  var have={}, i, lk, l, teams, team;
  for(i=0;i<keys.length;i++){
    lk=keys[i];
    if(have[lk]) continue;
    have[lk]=true;
    l=LEAGUES[lk];
    teams=TEAMS[lk]||[];
    if(!teams.length) continue;
    team=teams[ri(0,teams.length-1)];
    var dup=false, j;
    for(j=0;j<curFAOffers.length;j++){ if(curFAOffers[j].lk===lk){ dup=true; break; } }
    if(dup) continue;
    curFAOffers.push({
      lk:lk, l:l, team:team,
      sal:Math.max(0,l.salBase||0),
      yrs:lk==='NCHA'||lk==='NWCHA'?ri(3,4):ri(1,3),
      devPath:true
    });
  }
}

function getTransitionLeagueOptions(){
  // Default pathway is lower levels within your contract circuit; pro only via draft-rights signing.
  // Affiliate minors (NAML/PWDL) only at 75+ OVR from dev paths; otherwise semi-pro + dev only.
  var minorK=getMinorLeagueKeyByGender(G.gender);
  var opts=[minorK].concat(getSemiProLeagueKeysByGender(G.gender));
  opts=opts.filter(function(k){return LEAGUES[k]&&canJoinLeagueByAge(k);});
  if(ovr(G.attrs,G.pos)<getProHardDevelopmentFloorOvr()){
    opts=opts.filter(function(k){return LEAGUES[k].tier!=='minor';});
  }
  return opts;
}

function getDemotionDestinationFromPHL(){
  var age=G.age||16;
  var devKeys=['NCHA','NWCHA','OJL','QMJL','WJL','CWHL','USJL','USWDL','NEJC','CEJC','ARJC','EWJC','AWJC'];
  var semiKeys=getSemiProLeagueKeysByGender(G.gender);
  var pool=(age<=getJuniorMaxAge()?devKeys.filter(function(k){return canJoinLeagueByAge(k);}):[]).concat(semiKeys);
  if(age<=getCollegeMaxAge()){
    var col=G.gender==='M'?'NCHA':'NWCHA';
    if(LEAGUES[col]&&pool.indexOf(col)<0) pool.unshift(col);
  }
  var valid=pool.filter(function(k){return LEAGUES[k]&&LEAGUES[k].gender===G.gender&&canJoinLeagueByAge(k);});
  return valid.length?valid[0]:semiKeys[0];
}

function hadBadProSeason(){
  if(!G.league || G.league.tier!=='pro') return false;
  if((G.gp||0)<18) return false;
  if(G.pos==='G'){
    var shots=(G.saves||0)+(G.goalsAgainst||0);
    if(shots<220) return false;
    var sv=shots>0?(G.saves/shots):0;
    return sv<0.895 || (G.goalsAgainst||0)>=Math.max(26,Math.round((G.gp||0)*1.9));
  }
  var ppg=(G.gp>0)?((G.goals+G.assists)/G.gp):0;
  return (ppg<0.46 && (G.plusminus||0)<=-8) || ((G.plusminus||0)<=-14);
}

/** NAML/PWDL send-down from main pro (PHL/PWL): below gendered OVR bar, short tenure, age 18–29. Bad year = very likely; otherwise still rolls often. */
function qualifiesYoungProAffiliateDemotion(wasBadSeason, ageSeasonJustEnded){
  if(!G.league||G.league.tier!=='pro') return false;
  var proKey=getProLeagueKeyByGender(G.gender);
  if(G.leagueKey!==proKey) return false;
  var endedAge=ageSeasonJustEnded!=null?ageSeasonJustEnded:(G.age||16);
  if(endedAge<18||endedAge>=30) return false;
  if(ovr(G.attrs,G.pos)>=getProAffiliateDemotionMaxOvr()) return false;
  if((G.teamTenure||0)>2) return false;
  if(wasBadSeason) return Math.random()<0.86;
  return Math.random()<0.44;
}

function getValidTeamForLeague(leagueKey, preferredName){
  var teams=TEAMS[leagueKey]||[];
  if(!teams.length) return G.team;
  if(preferredName){
    for(var i=0;i<teams.length;i++){ if(teams[i].n===preferredName) return teams[i]; }
  }
  return shuf(teams.slice())[0];
}

/** Same pro league, new team (offseason). Prefer former rights club or random club != current. */
function getAlternateTeamSameProLeague(leagueKey, currentTeamName, preferredName){
  var teams=TEAMS[leagueKey]||[];
  if(!teams.length) return G.team;
  if(preferredName && preferredName!==currentTeamName){
    for(var i=0;i<teams.length;i++){ if(teams[i].n===preferredName) return teams[i]; }
  }
  var pool=teams.filter(function(t){return t.n!==currentTeamName;});
  if(!pool.length) return teams[0];
  return shuf(pool.slice())[0];
}

/** European / Asian junior circuits — easier path into matching paid overseas leagues. */
function isOverseasJuniorLeague(leagueKey){
  var k=leagueKey||'';
  return k==='NEJC'||k==='CEJC'||k==='ARJC'||k==='EWJC'||k==='AWJC';
}
/** Min OVR for full college + semi-pro offer pack after year 2 in junior (NA vs overseas). */
function getJuniorCollegeSemiPackMinOvr(){
  return isOverseasJuniorLeague(G.leagueKey)?54:58;
}
/** Min OVR to unlock the league switch panel early in junior (after year 1). */
var JUNIOR_EARLY_SWITCH_PANEL_OVR=56;

function canMoveToProLeague(targetKey){
  if(!LEAGUES[targetKey]) return true;
  if(!canJoinLeagueByAge(targetKey)) return false;
  var tTier=LEAGUES[targetKey].tier;
  if(tTier==='pro'){
    // Already in top pro league: can pick same league in offseason to switch teams (e.g. return toward former club).
    if(G.leagueKey===targetKey && G.league && G.league.tier==='pro') return true;
    if(G.league && G.league.tier==='pro' && targetKey===getProLeagueKeyByGender(G.gender)) return true;
    return !!(G.draftRights && G.draftRights.leagueKey===targetKey);
  }
  if(tTier==='minor'){
    if((G.age||16)<18) return false;
    if(G.league && (G.league.tier==='minor'||G.league.tier==='pro')) return isContractLeagueMoveAllowed(targetKey);
    if(!G.draftRights) return false;
    return ovr(G.attrs,G.pos)>=getProHardDevelopmentFloorOvr() && isContractLeagueMoveAllowed(targetKey);
  }
  if(!isContractLeagueMoveAllowed(targetKey)) return false;
  return true;
}

/** Canada/USA skaters — PHL-style draft emphasis at age 18. */
function isNorthAmericanSkater(){
  var n=typeof normalizePlayerNat==='function'?normalizePlayerNat(G.nat):String(G.nat||'');
  return (n==='Canada'||n==='United States') && G.pos!=='G';
}

/** North American junior or college leagues — PHL draft entry is the upcoming age-18 year only. */
function isNaJuniorOrCollegeLeague(leagueKey){
  var k=leagueKey||'';
  return k==='OJL'||k==='QMJL'||k==='WJL'||k==='USJL'||k==='NCHA'||
    k==='CWHL'||k==='USWDL'||k==='NWCHA';
}

function runDraftEventIfEligible(){
  var tier=G.league.tier;
  var draftAge=(G.age||16)+1; // offseason event evaluates upcoming season age
  if(tier==='pro'||tier==='minor') {G._draftStatusText='DRAFT STATUS: ALREADY PRO ELIGIBLE'; return;}
  if(G.everDrafted){
    if(G.draftRights){
      G._draftStatusText='DRAFT STATUS: RIGHTS HELD BY '+G.draftRights.team.toUpperCase()+' ('+G.draftRights.leagueKey+')';
    } else {
      G._draftStatusText='DRAFT STATUS: PREVIOUSLY DRAFTED';
    }
    return;
  }
  var naPipe=isNaJuniorOrCollegeLeague(G.leagueKey);
  if(naPipe){
    if(draftAge!==18){
      G._draftStatusText='DRAFT STATUS: NOT ELIGIBLE (NA JUNIORS/COLLEGE — DRAFT YEAR IS YOUR AGE-18 SEASON)';
      return;
    }
  } else {
    if(draftAge<18||draftAge>20){G._draftStatusText='DRAFT STATUS: NOT ELIGIBLE (AGES 18-20 OUTSIDE NA JUNIORS/COLLEGE)'; return;}
  }
  if(G._lastDraftAgeProcessed===draftAge) return;
  G._lastDraftAgeProcessed=draftAge;

  // Draft-year breakout: rare prospects can pop at 18 (esp. NA draft year).
  if(draftAge===18 && G.league && G.league.tier!=='pro'){
    var track=G.prospectTrack||'normal';
    var pre=ovr(G.attrs,G.pos);
    var boomChance=track==='generational'?0.70:(track==='elite'?0.42:(track==='high'?0.18:0.06));
    if(pre>=72 && Math.random()<boomChance){
      var alBoom=(G.pos!=='G'&&typeof SKATER_RATING_ATTR_KEYS!=='undefined')?SKATER_RATING_ATTR_KEYS.slice():(ATTRS[G.pos]||[]);
      var nBoost=track==='generational'?5:(track==='elite'?4:3);
      var boomCap=getAttrCapForAge(G.age||18);
      var bmin=typeof G._attrClampMin==='number'?G._attrClampMin:40;
      var pBoom=getPotentialDevMult(G.potential||'support');
      shuf(alBoom.slice()).slice(0,nBoost).forEach(function(a){
        G.attrs[a]=cl(G.attrs[a]+rd(0.9,2.2)*pBoom,bmin,boomCap);
      });
      addNews('DRAFT-YEAR LEAP: Scouts note a major jump from '+G.first+' '+G.last+' entering draft season.','good');
    }
  }

  var pOvr=ovr(G.attrs,G.pos);
  var baseline=getLeagueBaselineOvr(G.leagueKey);
  // Normalize production by league difficulty so tougher leagues are scouted correctly.
  var perf=(G.pos==='G')
    ? ((G.saves+(G.goalsAgainst||0))>0?(G.saves/(G.saves+(G.goalsAgainst||0))-0.89)*5.2:0)
    : (function(){
      var ppg=G.gp>0?(G.goals+G.assists)/G.gp:0;
      var expectedPpg=cl(0.62 - (baseline-62)*0.012,0.32,0.72);
      return ppg-expectedPpg;
    })();
  // Harder development leagues get stronger scout weighting.
  var scoutLeagueBoost=(G.leagueKey==='NCHA'||G.leagueKey==='NWCHA')?0.16:
    (G.leagueKey==='ARHL'||G.leagueKey==='CEHL'||G.leagueKey==='FHL')?0.14:
    (G.leagueKey==='NEHL'||G.leagueKey==='SDHL'||G.leagueKey==='FWHL'||G.leagueKey==='AWHL')?0.12:
    (G.leagueKey==='NEJC'||G.leagueKey==='CEJC'||G.leagueKey==='ARJC'||G.leagueKey==='EWJC'||G.leagueKey==='AWJC')?0.09:
    (G.leagueKey==='OJL'||G.leagueKey==='QMJL'||G.leagueKey==='WJL'||G.leagueKey==='CWHL')?0.10:0.07;
  var leagueDifficultyBoost=cl((baseline-62)*0.006,-0.01,0.10);
  // NA skaters: centered on draft at 18. ROW / NA goalies: eligible 18-20, mostly picked at 18.
  var naSk=isNorthAmericanSkater();
  var ageBoost=naSk
    ? (draftAge===18?0.18:draftAge===19?0.06:0.03)
    : (draftAge===18?0.13:draftAge===19?0.10:0.06);
  var chance=cl(0.54 + ageBoost + scoutLeagueBoost + leagueDifficultyBoost + (pOvr-60)*0.014 + perf*0.22,0.48,0.98);
  if(naSk){
    if(draftAge===18) chance=Math.max(chance,0.78);
    if(draftAge===19) chance=Math.max(chance,0.58);
    if(draftAge===20) chance=Math.max(chance,0.50);
  } else {
    if(draftAge===18) chance=Math.max(chance,0.70);
    if(draftAge===19) chance=Math.max(chance,0.64);
    if(draftAge===20) chance=Math.max(chance,0.58);
  }
  if(pOvr>=78) chance=Math.max(chance,0.90);
  if(pOvr>=84) chance=Math.max(chance,0.96);
  var drafted=Math.random()<chance;
  if(drafted){
    var proKey=getProLeagueKeyByGender(G.gender);
    var teams=TEAMS[proKey]||[];
    var draftedTeam=teams.length?shuf(teams.slice())[0]:{n:'Pro Club'};
    var draftScore=cl(0.55 + (pOvr-60)*0.02 + perf*0.25 + rd(-0.1,0.12),0.05,0.99);
    var round=Math.min(7,Math.max(1,8-Math.floor(draftScore*7.2)));
    var suffix=round===1?'ST':round===2?'ND':round===3?'RD':'TH';
    var pick=ri(1,32);
    G.draftRights={leagueKey:proKey,team:draftedTeam.n,age:draftAge,round:round,pos:G.pos,subPos:G.subPos||G.pos};
    G.draftRound=round;
    G.everDrafted=true;
    G.isDraftFreeAgent=false;
    var posLbl=formatPlayerPositionLabel(G.pos, G.subPos);
    G._draftStatusText='DRAFT STATUS: '+round+suffix+' ROUND BY '+draftedTeam.n.toUpperCase()+' ('+proKey+') -- '+posLbl+' -- RIGHTS ONLY';
    G._proDraftReveal={
      team:draftedTeam.n, leagueKey:proKey, round:round, suffix:suffix, pick:pick,
      posLbl:posLbl, playerName:G.first+' '+G.last, pOvr:pOvr
    };
    addNews('DRAFT DAY: '+G.first+' '+G.last+' ('+posLbl+') selected in the '+round+suffix+' round by '+draftedTeam.n+' ('+proKey+').','big');
    addNews('DRAFT RIGHTS ONLY: '+G.first+' has not signed yet and will continue developing unless a contract is offered.','neutral');
    if(pOvr<76){
      addNews('Development path: '+G.first+' remains in '+G.league.short+' for now despite being drafted.','neutral');
    } else if(pOvr<getDraftClubElcMinOvr()){
      addNews('CLUB STANCE: '+draftedTeam.n+' holds your rights but will not offer an ELC until you are pro-ready ('+getDraftClubElcMinOvr()+'+ OVR) -- keep developing.','neutral');
    } else {
      addNews('ELC TRACK: '+G.first+' projected for ENTRY-LEVEL CONTRACT talks with '+draftedTeam.n+' (no auto-signing).','good');
    }
    return true;
  } else {
    G.draftRights=null;
    G.draftRound=0;
    G.isDraftFreeAgent=true;
    G._draftStatusText='DRAFT STATUS: UNDRAFTED FREE AGENT';
    addNews('DRAFT DAY: '+G.first+' '+G.last+' goes undrafted -- now a free agent.','neutral');
    if(G.age<=getJuniorMaxAge()) addNews('Eligible to stay in juniors through age '+getJuniorMaxAge()+' — must move on before age '+(getJuniorMaxAge()+1)+'.','neutral');
  }
  return false;
}

function showProDraftRevealScreen(){
  var d=G._proDraftReveal;
  if(!d) return false;
  var lg=LEAGUES[d.leagueKey]||{};
  var lgName=(lg.short||d.leagueKey).toUpperCase();
  var pickTxt='ROUND '+d.round+' — PICK '+d.pick;
  var rights='DRAFT RIGHTS ONLY — NO CONTRACT YET';
  if((d.pOvr||0)<76){
    rights+=' — STAY IN '+String(G.league&&G.league.short||'AMATEUR').toUpperCase()+' AND KEEP DEVELOPING';
  } else if(typeof getDraftClubElcMinOvr==='function'&&(d.pOvr||0)<getDraftClubElcMinOvr()){
    rights+=' — CLUB WANTS '+getDraftClubElcMinOvr()+'+ OVR BEFORE AN ELC';
  } else {
    rights+=' — ENTRY-LEVEL TALKS POSSIBLE WHEN YOU ARE READY TO SIGN';
  }
  safeEl('pro-draft-league').textContent=lgName+' DRAFT';
  safeEl('pro-draft-pick').innerHTML=pickTxt;
  safeEl('pro-draft-team').textContent=d.team;
  safeEl('pro-draft-sub').textContent='SELECTS';
  safeEl('pro-draft-player').textContent=(d.playerName||'').toUpperCase()+' — '+String(d.posLbl||'').toUpperCase();
  safeEl('pro-draft-rights').textContent=rights;
  try{if(typeof RetroSound!=='undefined'&&RetroSound.play) RetroSound.play('big');}catch(eS){}
  show('s-pro-draft');
  return true;
}

function dismissProDraftReveal(){
  G._proDraftReveal=null;
  continueOffseasonAfterDraft();
}

function getOffseasonRecommendations(){
  var out={byId:{}, notes:[]};
  if(!G) return out;
  if(typeof ensureInjuryTracking==='function') ensureInjuryTracking();
  var health=G.health||100;
  var stam=G.stamina||80;
  var morale=G.morale||70;
  var age=G.age||16;
  var seasonInj=G.seasonInjuryCount||0;
  var careerInj=G.careerInjuryCount||0;
  var dur=G.attrs&&G.attrs.durability||70;
  var injured=!!G._enteredOffseasonInjured||!!G.isInjured;
  var ruined=!!G._careerRuinedInjury;
  var tier=G.league&&G.league.tier||'junior';

  function add(id, level, reason){
    var prev=out.byId[id];
    if(!prev||levelRank(level)>levelRank(prev.level)){
      out.byId[id]={level:level, reason:reason};
    }
  }
  function levelRank(l){
    if(l==='urgent') return 3;
    if(l==='strong') return 2;
    return 1;
  }

  if(injured){
    add('surgery','urgent','You finished the season hurt — team doctors want you in surgery & rehab immediately.');
    out.notes.push(G.first.toUpperCase()+', you are still injured. Rehab is not optional if you want to protect your career.');
  } else if(seasonInj>=3){
    add('surgery','urgent',seasonInj+' injuries this season — medical staff strongly recommend a full rehab block.');
    out.notes.push('TRAINING STAFF: Too many injuries this year ('+seasonInj+'). Surgery & rehab is strongly recommended.');
  } else if(seasonInj>=2){
    add('surgery','strong','Multiple injuries this season — offseason rehab lowers complication risk.');
    out.notes.push('MEDICAL: You have been banged up ('+seasonInj+' injuries). Rehab is the recommended path.');
  } else if(careerInj>=5){
    add('surgery','strong','Injury history is piling up ('+careerInj+' career) — structured rehab is advised.');
    out.notes.push('DOCTORS: Long injury log. Consider surgery & rehab before pushing training again.');
  }

  if(ruined){
    add('surgery','urgent','Career-altering damage on file — only proper medical care limits further decline.');
    if(out.notes.indexOf('DOCTORS: Prior long-term injury damage detected. Rehab is critical.')<0){
      out.notes.push('DOCTORS: Prior long-term injury damage detected. Rehab is critical.');
    }
  }

  if(!injured&&health<52){
    add('surgery','strong','Health is very low ('+Math.round(health)+') — doctors recommend rehab over training camps.');
  } else if(!injured&&dur<45){
    add('surgery','strong','Durability is poor — medical staff recommend rehab to rebuild your body.');
  }

  var needsRehab=out.byId.surgery&&(out.byId.surgery.level==='urgent'||out.byId.surgery.level==='strong');

  if(!needsRehab&&age<26&&(tier==='junior'||tier==='college'||tier==='minor')){
    add('elite','recommended','Still developing — skills camp is a strong offseason investment.');
  }
  if(!needsRehab&&age<24&&stam<50){
    add('gym','recommended','Stamina is low — conditioning camp builds your base for next season.');
  }
  if(!needsRehab&&morale<40){
    add('vacation','recommended','Morale is crushed — full rest is recommended before another grind.');
  } else if(!needsRehab&&morale<55&&stam<45){
    add('vacation','recommended','You look run down — vacation could reset body and mind.');
  }
  if(!needsRehab&&morale>=40&&morale<62){
    add('charity','recommended','Community work is a good morale lift without skipping recovery.');
  }
  if(!needsRehab&&(tier==='pro'||tier==='minor')&&morale>=58&&health>=60){
    add('media','recommended','Pro spotlight — media tour keeps your brand active in the offseason.');
  }

  if(needsRehab&&out.byId.vacation){
    delete out.byId.vacation;
  }

  return out;
}

function offseasonRecSortScore(actionId, rec){
  var r=rec.byId[actionId];
  if(!r) return 0;
  if(r.level==='urgent') return 100;
  if(r.level==='strong') return 70;
  return 40;
}

function renderOffseasonActionButtons(actions, rec){
  var advisorHtml='';
  if(rec.notes&&rec.notes.length){
    advisorHtml='<div class="vt" style="font-size:13px;color:var(--gold);margin-bottom:12px;padding:10px 12px;border:1px solid rgba(232,200,92,.35);background:rgba(12,26,36,.5);line-height:1.55">'+
      '<div style="font-size:11px;color:var(--mut);margin-bottom:4px">STAFF RECOMMENDATION</div>'+
      rec.notes.map(function(n){ return escHtml(n); }).join('<br>')+'</div>';
  }
  var sorted=actions.slice().sort(function(a,b){
    return offseasonRecSortScore(b.id,rec)-offseasonRecSortScore(a.id,rec);
  });
  var html=advisorHtml;
  var i, a, r, col, lbl, badge, reasonLine, btnStyle;
  for(i=0;i<sorted.length;i++){
    a=sorted[i];
    r=rec.byId[a.id];
    badge=''; reasonLine='';
    btnStyle='padding:12px;text-align:left;margin-bottom:8px;width:100%';
    if(r){
      col=r.level==='urgent'?'var(--red)':(r.level==='strong'?'var(--gold)':'#7ad4ff');
      lbl=r.level==='urgent'?'URGENT':(r.level==='strong'?'STRONGLY RECOMMENDED':'RECOMMENDED');
      badge=' <span class="vt" style="font-size:11px;color:'+col+'">['+lbl+']</span>';
      reasonLine='<br><span class="vt" style="font-size:11px;color:'+col+'">'+escHtml(r.reason)+'</span>';
      if(r.level==='urgent'||r.level==='strong') btnStyle+=';border-color:rgba(232,200,92,.5)';
    }
    html+='<button type="button" class="btn bs bw" style="'+btnStyle+'" onclick="doOffseasonAction(\''+a.id+'\')">';
    html+=stripBracketIcons(a.name)+badge+'<br><span class="vt" style="font-size:12px;color:var(--mut)">'+a.desc+'</span>'+reasonLine+'</button>';
  }
  return html;
}

function goToOffseason(){
  G.contractYrsLeft--;
  if(typeof ensureInjuryTracking==='function') ensureInjuryTracking();
  G._enteredOffseasonInjured=!!G.isInjured;
  G._offseasonMedical=false;
  if((G.contractYrsLeft||0)<=0){
    clearContractCircuitBinding();
  }
  if(G.league && (G.league.tier==='pro'||G.league.tier==='minor'||G.league.tier==='euro'||G.league.tier==='asia') && G.contractYrsLeft<=0){
    G.contract=G.contract||{sal:0,yrs:0,type:'UFA',ntc:false,bonus:false};
    G.contract.type=getProContractType()==='RFA'?'RFA':'UFA';
    G.contract.yrs=0;
    addNews('CONTRACT STATUS: '+G.first+' '+G.last+' is now a '+G.contract.type+' — free to sign a new deal (any circuit your rights allow).','neutral');
  }
  G._offseasonChoiceTaken=false;
  G._offseasonContractSigned=false;
  G._releaseRequestThisOffseason=false;
  G._worldFaceoffInvited=false;
  G._worldFaceoffDeclined=false;
  curFAOffers=[];
  _lastWorldStageHTML='';
  _lastWorldStageStats=null;
  var justDrafted=runDraftEventIfEligible();
  if(justDrafted&&G._proDraftReveal){
    G._inOffseason=true;
    if(showProDraftRevealScreen()) return;
    G._proDraftReveal=null;
  }
  continueOffseasonAfterDraft();
}

function buildSeasonRecapHTML(){
  if(!G) return '';
  var o=typeof ovr==='function'?ovr(G.attrs,G.pos):0;
  var tier=G.league&&G.league.tier||'';
  var html='<div style="color:var(--gold);font-size:15px;margin-bottom:8px">SEASON '+G.season+' RECAP — '+escHtml(G.league.short)+'</div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">';
  html+='<div style="padding:8px;border:1px solid rgba(122,184,224,.2)"><span style="color:var(--mut)">TEAM</span><br><b>'+escHtml(G.team.n)+'</b></div>';
  html+='<div style="padding:8px;border:1px solid rgba(122,184,224,.2)"><span style="color:var(--mut)">RECORD</span><br><b>'+(G.w||0)+'-'+(G.l||0)+'-'+(G.otl||0)+'</b> · '+G.gp+' GP</div>';
  html+='<div style="padding:8px;border:1px solid rgba(122,184,224,.2)"><span style="color:var(--mut)">OVR</span><br><b>'+Math.round(o)+'</b></div>';
  html+='<div style="padding:8px;border:1px solid rgba(122,184,224,.2)"><span style="color:var(--mut)">MORALE</span><br><b>'+Math.round(G.morale||50)+'</b></div>';
  html+='</div>';
  if(G.pos==='G'){
    html+='<div style="margin-bottom:6px">Line: <b>'+G.saves+' SV</b> · '+G.goalsAgainst+' GA · SV% '+formatSvPctFromCounts(G.saves,G.goalsAgainst||0)+'</div>';
  } else {
    html+='<div style="margin-bottom:6px">Line: <b>'+G.goals+'G '+G.assists+'A '+(G.goals+G.assists)+'PTS</b> · '+G.plusminus+' +/-</div>';
  }
  if(G._seasonHotStreak&&G._seasonHotStreak>=3){
    html+='<div style="color:var(--acc);margin-bottom:6px">Hot streak peak: '+G._seasonHotStreak+' straight positive games.</div>';
  }
  if(tier==='local'){
    html+='<div style="color:var(--mut);font-size:13px">Community path — development-first calendar with mixed games and rink events.</div>';
  } else if(tier==='junior'){
    html+='<div style="color:var(--mut);font-size:13px">Junior circuit — draft stock and ice time matter as much as the scoreboard.</div>';
  }
  if(G.wonCup) html+='<div style="color:var(--green);margin-top:8px"><b>League champion</b> this season.</div>';
  return html;
}

function continueOffseasonAfterDraft(){
  var actions=[
    {id:'surgery',   icon:'[H]', name:'SURGERY & REHAB',   desc:'Medical staff -- restore health, protect career.', fn:function(){G._offseasonMedical=true;G.health=cl(G.health+35,0,100);if(G.attrs&&G.attrs.durability)G.attrs.durability=cl(G.attrs.durability+rd(4,9),22,99);G.isInjured=false;G.injWks=0;G.injName='';addNews('Surgery & rehab -- medical staff handled lingering damage.','good');}},
    {id:'elite',     icon:'[T]', name:'ELITE SKILLS CAMP', desc:'Private coaching -- attr gains.',        fn:function(){if((G.age||16)>=26){G.morale=cl(G.morale+8,0,100);addNews('Skills camp -- mental reps and video work (physical ceiling reached at 26+).','neutral');return;}var pSk=getPotentialDevMult(G.potential||'support');var pool=(G.pos!=='G'&&typeof SKATER_RATING_ATTR_KEYS!=='undefined')?SKATER_RATING_ATTR_KEYS.filter(function(k){return k!=='conditioning';}):ATTRS[G.pos];var picks=shuf(pool.slice()).slice(0,3);var cc=getAttrCapForAge(G.age||16);var cmin=typeof G._attrClampMin==='number'?G._attrClampMin:40;picks.forEach(function(a){G.attrs[a]=cl(G.attrs[a]+rd(1,2.5)*pSk,cmin,cc);});if(typeof updatePlayerConditioning==='function')updatePlayerConditioning({offseasonBoost:6});addNews('Skills camp -- significant improvement.','good');}},
    {id:'vacation',  icon:'[V]', name:'FULL VACATION',     desc:'Total rest -- morale and stamina.',      fn:function(){G.morale=cl(G.morale+30,0,100);G.stamina=cl(G.stamina+25,0,100);if(typeof updatePlayerConditioning==='function')updatePlayerConditioning({offseasonDecay:8});addNews('Vacation -- recharged.','good');}},
    {id:'media',     icon:'[M]', name:'MEDIA TOUR',        desc:'Commercials -- PR and brand boost.',     fn:function(){addNews('Media tour -- brand building done.','neutral');}},
    {id:'charity',   icon:'[C]', name:'CHARITY WORK',      desc:'Community impact -- morale boost.',      fn:function(){G.morale=cl(G.morale+18,0,100);addNews('Charity work -- huge goodwill.','good');}},
    {id:'pickup',    icon:'[P]', name:'PICK-UP HOCKEY',    desc:'Local rink run -- casual reps & morale.', fn:function(){G.morale=cl(G.morale+10,0,100);G.xp=(G.xp||0)+18;if((G.age||16)<26&&G.attrs.stickhandling)G.attrs.stickhandling=cl(G.attrs.stickhandling+rd(0.4,1.1),40,getAttrCapForAge(G.age||16));addNews('Pick-up hockey -- hands and confidence up.','good');}},
    {id:'film',      icon:'[F]', name:'SELF SCOUTING',     desc:'Break down your shifts -- hockey IQ.',   fn:function(){G.xp=(G.xp||0)+22;if(G.attrs.positioning)G.attrs.positioning=cl(G.attrs.positioning+rd(0.5,1.2),40,getAttrCapForAge(G.age||16));if(G.attrs.anticipation)G.attrs.anticipation=cl(G.attrs.anticipation+rd(0.3,0.9),40,getAttrCapForAge(G.age||16));addNews('Film room on your own game -- reads sharpened.','good');}},
    {id:'gym',       icon:'[G]', name:'CONDITIONING CAMP', desc:'Pure physical -- strength and endurance.',fn:function(){var pg=getPotentialDevMult(G.potential||'support');if((G.age||16)<26&&G.attrs.physical)G.attrs.physical=cl(G.attrs.physical+Math.max(1,Math.round(2*pg)),40,99);G.stamina=cl(G.stamina+20,0,100);if(typeof updatePlayerConditioning==='function')updatePlayerConditioning({offseasonBoost:14});addNews('Conditioning camp -- '+((G.age||16)>=26?'stamina focus (no new physical ceiling at 26+).':'physically elite.'),'good');}}
  ];
  var rec=getOffseasonRecommendations();
  window._offseasonRec=rec;
  safeEl('offseason-actions').innerHTML=renderOffseasonActionButtons(actions, rec);
  window._offseasonActions=actions;
  ensureContractBindingStamped();
  var offerCount=(curFAOffers&&curFAOffers.length)||0;
  var rightsText=G.draftRights?('DRAFT RIGHTS: '+G.draftRights.team+' ('+G.draftRights.leagueKey+') -- ROUND '+(G.draftRights.round||'?')):'DRAFT RIGHTS: NONE';
  var elcText='ELC STATUS: '+(G.contract&&G.contract.type==='ENTRY LEVEL'
    ? ('ACTIVE -- YEAR '+cl(3-(G.contractYrsLeft||0)+1,1,3)+'/3')
    : (G.hadELC?'COMPLETED':'NOT SIGNED'));
  safeEl('offseason-contract-status').innerHTML=
    'CONTRACT: '+(G.contract.type||'N/A')+' &bull; '+(G.contractYrsLeft>0?(G.contractYrsLeft+' YEAR(S) LEFT'):'EXPIRED')+'<br>'+
    'CURRENT VALUE: '+(G.contract&&G.contract.sal?fmt(G.contract.sal)+'/YR':'AMATEUR')+'<br>'+
    (isPlayerUnderBindingContract()
      ?('BOUND TO: '+(G._contractClubTeam||G.team.n)+' &bull; '+getContractCircuitHint(G._contractCircuit||'')+'<br>')
      :'')+
    'OPEN OFFERS: '+offerCount+'<br>'+
    (G._draftStatusText||'DRAFT STATUS: --')+'<br>'+
    rightsText+'<br>'+
    elcText+
    getContractRightsGuideHtml()+
    (isPlayerUnderBindingContract()
      ?'<div style="margin-top:10px"><button type="button" class="btn bd bw" onclick="requestContractRelease()">REQUEST CONTRACT RELEASE</button>'+
        '<div class="vt" style="font-size:12px;color:var(--mut);margin-top:6px">Ask out of your deal to sign elsewhere. Club may buy you out — not guaranteed.</div></div>'
      :'');
  var tier=G.league.tier;
  var advPanel=safeEl('league-advance-panel');
  var shouldAdv=['junior','college'].indexOf(tier)!==-1&&G.season>=3||['euro','asia'].indexOf(tier)!==-1&&G.season>=2;
  var shouldAdvMinor=tier==='minor'&&G.season>=2&&ovr(G.attrs,G.pos)>=getProHardDevelopmentFloorOvr();
  if(shouldAdv||shouldAdvMinor){
    advPanel.style.display='block';
    var nextKeys=(NEXT_TIER[tier]&&NEXT_TIER[tier][G.gender])||[];
    var avail=nextKeys.filter(function(k){return LEAGUES[k]&&LEAGUES[k].tier!=='pro'&&canMoveToProLeague(k);});
    var ahtml='<div class="vt" style="font-size:15px;color:var(--mut);margin-bottom:10px">SCOUTS HAVE TAKEN NOTICE. YOUR OPTIONS:</div>';
    if(G.draftRights){
      ahtml+='<div class="vt" style="font-size:14px;color:var(--gold);margin-bottom:8px">'+
        (draftClubWillingToSignElc()
          ? 'YOU HAVE BEEN DRAFTED BY '+G.draftRights.team.toUpperCase()+' ('+G.draftRights.leagueKey+'). PRO SIGNING USES YOUR DRAFT RIGHTS WHEN YOU ACCEPT AN OFFER.'
          : 'DRAFT RIGHTS: '+G.draftRights.team.toUpperCase()+' ('+G.draftRights.leagueKey+') — <b>rights only, no contract</b>. Develop in NA or overseas semi-pro; ELC at '+getDraftClubElcMinOvr()+'+ OVR.')+
        '</div>';
    } else if(tier==='minor'){
      ahtml+='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:8px">'+G.league.short+' IS AFFILIATED TO '+getProLeagueKeyByGender(G.gender)+'. YOU CANNOT JUMP TO PRO UNLESS DRAFTED.</div>';
    }
    for(var j=0;j<avail.length;j++){
      var k=avail[j]; var l=LEAGUES[k];
      ahtml+='<div class="lcard" id="adv-'+k+'" onclick="pickAdvLeague(\''+k+'\')">';
      ahtml+='<div class="ltier" style="color:var(--gold)">'+l.tier.toUpperCase()+'</div>';
      ahtml+='<div class="lname">'+stripBracketIcons(l.short)+' -- '+l.name+'</div>';
      ahtml+='<div class="ldesc">'+l.desc+'</div></div>';
    }
    ahtml+='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:8px">-- OR -- <button class="btn bs" onclick="pickAdvLeague(null)">STAY IN '+G.league.short+'</button></div>';
    safeEl('advance-content').innerHTML=ahtml;
    G._advLeague=avail[0]||null;
  } else {
    advPanel.style.display='none';
    G._advLeague=null;
  }
  var switchPanel=safeEl('league-switch-panel');
  var mustLeaveJunior=(tier==='junior' && G.age>getJuniorMaxAge());
  var mustLeaveCollege=(tier==='college' && G.age>getCollegeMaxAge());
  var mustLeaveAmateur=mustLeaveJunior||mustLeaveCollege;
  var proKeyTop=getProLeagueKeyByGender(G.gender);
  if(mustLeaveAmateur || qualifiesForLocalAdvancePath() || (tier==='junior' && G.season>=1 && ovr(G.attrs,G.pos)>=JUNIOR_EARLY_SWITCH_PANEL_OVR) || qualifiesForCollegeSemiProDevPath() || G.isDraftFreeAgent || G.draftRights || tier==='pro'){
    switchPanel.style.display='block';
    var offerPool=mustLeaveAmateur?getTransitionLeagueOptions():(tier==='local'?getLocalAdvanceLeagueOptions().filter(function(k){return LEAGUES[k]&&canJoinLeagueByAge(k);}):(tier==='pro'?getTransitionLeagueOptions():(G.gender==='M'?['OJL','QMJL','WJL','NCHA','USJL','NEJC','CEJC','ARJC','NEHL','FHL','CEHL','ARHL']:['CWHL','NWCHA','USWDL','EWJC','AWJC','SDHL','FWHL','AWHL'])));
    // Common pathway: strong juniors can jump to college scholarship after year 1.
    if(tier==='junior' && G.season>=1){
      var collegeKey=G.gender==='M'?'NCHA':'NWCHA';
      if(offerPool.indexOf(collegeKey)===-1) offerPool.unshift(collegeKey);
    }
    // Drafted players: pro destination in the switcher only once the club would offer (ELC-ready OVR).
    var draftedFastTrack=G.draftRights && draftClubWillingToSignElc();
    if(draftedFastTrack && G.draftRights.leagueKey!==G.leagueKey && offerPool.indexOf(G.draftRights.leagueKey)===-1) offerPool.unshift(G.draftRights.leagueKey);
    var otherLeagues=offerPool.filter(function(k){
      if(!LEAGUES[k]||!canMoveToProLeague(k)) return false;
      if(!isContractLeagueMoveAllowed(k)) return false;
      return k!==G.leagueKey;
    });
    var switchOvr=ovr(G.attrs,G.pos);
    var offers;
    if(tier==='pro'){
      var numPro=Math.min(3, Math.max(1, otherLeagues.length));
      offers=otherLeagues.slice(0,numPro);
    } else if(qualifiesForCollegeSemiProDevPath()){
      offers=pickCollegeSemiProSwitchOffers(otherLeagues);
      if(!offers.length) offers=shuf(otherLeagues).slice(0,Math.min(4,otherLeagues.length));
    } else if(tier==='junior' && G.season>=2 && switchOvr>=getJuniorCollegeSemiPackMinOvr()){
      var colPick=G.gender==='M'?'NCHA':'NWCHA';
      var euroPick;
      if(G.gender==='M'){
        if(G.leagueKey==='NEJC') euroPick=['NEHL','FHL'][ri(0,1)];
        else if(G.leagueKey==='CEJC') euroPick='CEHL';
        else if(G.leagueKey==='ARJC') euroPick='ARHL';
        else euroPick=['NEHL','FHL','CEHL'][ri(0,2)];
      } else {
        if(G.leagueKey==='AWJC') euroPick='AWHL';
        else if(G.leagueKey==='EWJC') euroPick=['SDHL','FWHL'][ri(0,1)];
        else euroPick=['SDHL','FWHL'][ri(0,1)];
      }
      var priority=[];
      if(otherLeagues.indexOf(colPick)>=0) priority.push(colPick);
      if(otherLeagues.indexOf(euroPick)>=0) priority.push(euroPick);
      var restPool=shuf(otherLeagues.filter(function(x){return priority.indexOf(x)<0;}));
      offers=priority.slice();
      for(var oix=0;oix<restPool.length && offers.length<6;oix++){
        if(offers.indexOf(restPool[oix])<0) offers.push(restPool[oix]);
      }
    } else {
      var numOffers=Math.min(3, Math.max(1, Math.floor((switchOvr-58)/10)));
      offers=shuf(otherLeagues).slice(0,numOffers);
    }
    if(draftedFastTrack && G.draftRights && G.draftRights.leagueKey!==G.leagueKey && offers.indexOf(G.draftRights.leagueKey)===-1) offers.unshift(G.draftRights.leagueKey);
    if(!offers.length){
      var shtmlEmpty='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:10px">NO OTHER LEAGUES TO SWITCH TO RIGHT NOW. USE <b>STAY</b> OR HANDLE MOVES IN-SEASON.</div>';
      safeEl('switch-content').innerHTML=shtmlEmpty+'<div class="vt" style="margin-top:8px"><button class="btn bs" onclick="pickSwitchLeague(null)">STAY IN '+G.league.short+'</button></div>';
      G._switchLeague=null;
    } else {
    var shtml='<div class="vt" style="font-size:15px;color:var(--mut);margin-bottom:10px">'+
      (mustLeaveAmateur?(mustLeaveJunior?'Age rule: must leave junior hockey before age 20 — college, semi-pro, or overseas.':'Age rule: college eligibility ended (25+) — semi-pro, euro, or asia leagues only.'):
      (tier==='pro'?'LEAGUE SWITCH: OTHER LEAGUES ONLY (YOU ARE ALREADY IN '+G.league.short+').':
      (G.isDraftFreeAgent?'FREE AGENT OFFERS AVAILABLE:':'OFFERS AVAILABLE:')))+'</div>';
    if(qualifiesForCollegeSemiProDevPath() && !mustLeaveAmateur){
      shtml+='<div class="vt" style="font-size:14px;color:var(--acc);margin-bottom:8px"><b>DEVELOPMENT PATH:</b> At OVR '+Math.round(switchOvr)+' you are strong for juniors but below pro/AHL bars — <b>college</b> (NCHA/NWCHA) and <b>overseas semi-pro</b> (NEHL/CEHL/ARHL, SDHL/FWHL/AWHL) are actively recruiting.</div>';
    } else if(tier==='local' && !mustLeaveAmateur){
      shtml+='<div class="vt" style="font-size:14px;color:var(--acc);margin-bottom:8px"><b>PATHWAY OPEN:</b> At OVR '+Math.round(switchOvr)+' you can try <b>junior</b> or <b>college</b> circuits — or stay in community hockey another year to keep developing.</div>';
    } else if(tier==='junior' && G.season>=2 && switchOvr>=getJuniorCollegeSemiPackMinOvr() && !mustLeaveAmateur){
      shtml+='<div class="vt" style="font-size:14px;color:var(--acc);margin-bottom:8px"><b>OPTIONAL:</b> You can stay in '+G.league.short+' or try <b>college</b> (NCHA/NWCHA) or <b>overseas semi-pro</b> (e.g. NEHL/CEHL/ARHL or women's SDHL/FWHL/AWHL) — harder, more structured hockey. Not required.</div>';
    }
    if(tier==='pro'){
      shtml+='<div class="vt" style="font-size:14px;color:var(--gold);margin-bottom:8px">Pro deals bind you to your circuit: '+getMinorLeagueKeyByGender(G.gender)+' two-way, plus junior/college <b>loans</b> if you are not roster-ready. Cross-league moves (e.g. overseas) need a release or expired contract.</div>';
    } else if(isPlayerUnderBindingContract()){
      shtml+='<div class="vt" style="font-size:14px;color:var(--gold);margin-bottom:8px"><b>CONTRACT:</b> '+getContractCircuitHint(G._contractCircuit||'')+'. Other circuits are blocked until your deal ends or you earn a release.</div>';
    } else if(!G.draftRights){
      shtml+='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:8px">'+getMinorLeagueKeyByGender(G.gender)+' feeds '+proKeyTop+'. First pro entry needs <b>draft rights</b>. Affiliate minors from dev leagues need <b>'+getProHardDevelopmentFloorOvr()+'+ OVR</b>, age 18+.</div>';
    } else {
      shtml+='<div class="vt" style="font-size:14px;color:var(--gold);margin-bottom:8px">DRAFTED BY '+G.draftRights.team.toUpperCase()+' ('+G.draftRights.leagueKey+'). '+
        (draftClubWillingToSignElc()
          ? 'ELC OFFERS APPEAR WHEN YOUR CONTRACT EXPIRES.'
          : 'RIGHTS ONLY — NO '+getProLeagueKeyByGender(G.gender)+' CONTRACT YET. PLAY OVERSEAS SEMI-PRO OR DEV LEAGUES; ELC AT '+getDraftClubElcMinOvr()+'+ OVR.')+
        '</div>';
    }
    for(var j=0;j<offers.length;j++){
      var k=offers[j]; var l=LEAGUES[k];
      shtml+='<div class="lcard" id="switch-'+k+'" onclick="pickSwitchLeague(\''+k+'\')">';
      shtml+='<div class="ltier" style="color:var(--acc)">'+l.tier.toUpperCase()+'</div>';
      shtml+='<div class="lname">'+stripBracketIcons(l.short)+' -- '+l.name+'</div>';
      shtml+='<div class="ldesc">'+l.desc+'</div></div>';
    }
    if(!mustLeaveAmateur) shtml+='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:8px">-- OR -- <button class="btn bs" onclick="pickSwitchLeague(null)">STAY IN '+G.league.short+'</button></div>';
    safeEl('switch-content').innerHTML=shtml;
    G._switchLeague=offers[0]||null;
    }
  } else {
    switchPanel.style.display='none';
    G._switchLeague=null;
  }
  var cePanel=safeEl('contract-expire-panel');
  if(G.contractYrsLeft<=0 && G.league && G.league.tier!=='junior' && G.league.tier!=='college' && G.league.tier!=='local'){
    cePanel.style.display='block';
    generateFAOffers();
  } else {
    cePanel.style.display='none';
  }
  // International: SIM vs PLAY choice when eligible (otherwise auto messages only).
  startOffseasonWorldStageFlow();
}

function doOffseasonAction(id){
  if(G._offseasonChoiceTaken){
    notify('ONLY ONE OFFSEASON FOCUS ALLOWED','red');
    return;
  }
  var rec=window._offseasonRec||{byId:{}};
  var surgRec=rec.byId.surgery;
  if(surgRec&&(surgRec.level==='urgent'||surgRec.level==='strong')&&id!=='surgery'){
    addNews('MEDICAL STAFF: '+G.first+' chose not to follow the rehab recommendation.','bad');
    if(surgRec.level==='urgent') notify('Doctors warned against skipping rehab','red');
  }
  var actions=window._offseasonActions||[];
  for(var i=0;i<actions.length;i++){
    if(actions[i].id===id){
      actions[i].fn();
      G._offseasonChoiceTaken=true;
      notify(actions[i].name+' COMPLETE','green');
      var lockedLbl=actions[i].name;
      if(surgRec&&id==='surgery'&&(surgRec.level==='urgent'||surgRec.level==='strong')){
        lockedLbl+=' — staff-approved recovery plan';
      }
      safeEl('offseason-actions').innerHTML='<div class="vt" style="font-size:14px;color:var(--gold)">OFFSEASON FOCUS LOCKED: '+escHtml(lockedLbl)+'</div>';
      return;
    }
  }
}

function pickAdvLeague(k){
  var cards=document.querySelectorAll('[id^="adv-"]');
  for(var i=0;i<cards.length;i++) cards[i].classList.remove('sel');
  if(k){
    if(!canMoveToProLeague(k)){
      notify('MOVE BLOCKED','red');
      if(!isContractLeagueMoveAllowed(k)) addNews(getContractMoveBlockReason(k),'bad');
      else addNews('Advancement blocked: must be drafted by a '+LEAGUES[k].short+' club before signing there.','bad');
      return;
    }
    var el=safeEl('adv-'+k);if(el)el.classList.add('sel');
    var targetTeamName=(G.draftRights&&G.draftRights.leagueKey===k)?G.draftRights.team:null;
    G.leagueKey = k;
    G.league = LEAGUES[k];
    G.team=getValidTeamForLeague(k,targetTeamName);
    onTeamChangeLeadershipReset();
    G.standings = buildStandings(k);
    G.allOpponents = genSeason(k, G.team);
    G.socialMessages = generateSocialMessages();
    addNews('LEAGUE ADVANCEMENT: Promoted to the '+G.league.short+' with '+G.team.n+' as a '+formatPlayerPositionLabel(G.pos, G.subPos)+'.','big');
    notify('ADVANCED TO '+G.league.short.toUpperCase(),'gold');
    safeEl('league-advance-panel').style.display='none';
  }
}

function pickSwitchLeague(k){
  var cards=document.querySelectorAll('[id^="switch-"]');
  for(var i=0;i<cards.length;i++) cards[i].classList.remove('sel');
  if(k){
    if(!canMoveToProLeague(k)){
      notify('MOVE BLOCKED','red');
      if(!isContractLeagueMoveAllowed(k)) addNews(getContractMoveBlockReason(k),'bad');
      else addNews('Switch blocked: must be drafted first, then sign to join '+LEAGUES[k].short+'.','bad');
      return;
    }
    var el=safeEl('switch-'+k);if(el)el.classList.add('sel');
    var prevTeamName=G.team&&G.team.n;
    var sameProResign=(k===G.leagueKey&&LEAGUES[k]&&LEAGUES[k].tier==='pro');
    var targetTeamName=(G.draftRights&&G.draftRights.leagueKey===k)?G.draftRights.team:null;
    if(sameProResign && !targetTeamName && G._formerDraftClubName) targetTeamName=G._formerDraftClubName;
    if(!sameProResign){
      G.leagueKey = k;
      G.league = LEAGUES[k];
      G.team=getValidTeamForLeague(k,targetTeamName);
    } else {
      G.team=getAlternateTeamSameProLeague(k,prevTeamName,targetTeamName);
    }
    onTeamChangeLeadershipReset();
    if(sameProResign){
      addNews('PRO ROSTER MOVE: '+G.first+' '+G.last+' now with '+G.team.n+' in '+G.league.short+'.','big');
      notify('NEW TEAM: '+G.team.n.toUpperCase(),'gold');
    } else {
      addNews('LEAGUE SWITCH: Moved to the '+G.league.short+' with '+G.team.n+' as a '+formatPlayerPositionLabel(G.pos, G.subPos)+'.','big');
      notify('SWITCHED LEAGUES','gold');
    }
    G.standings = buildStandings(G.leagueKey);
    G.allOpponents = genSeason(G.leagueKey, G.team);
    G.socialMessages = generateSocialMessages();
    safeEl('league-switch-panel').style.display='none';
  }
}

function generateFAOffers(){
  curFAOffers=[];
  var gender=G.gender;
  var potentialLeagues=['PHL','PWL','NAML','PWDL'].filter(function(k){return LEAGUES[k]&&LEAGUES[k].gender===gender;});
  potentialLeagues=potentialLeagues.filter(function(k){
    var lk=LEAGUES[k];
    if(!lk) return false;
    if(lk.tier==='minor'){
      if((G.age||16)<18) return false;
      if(G.league && (G.league.tier==='minor'||G.league.tier==='pro')) return true;
      return ovr(G.attrs,G.pos)>=getProHardDevelopmentFloorOvr();
    }
    if(lk.tier==='pro'){
      if(G.league && G.league.tier==='pro') return true;
      return !!(G.draftRights && G.draftRights.leagueKey===k);
    }
    return true;
  });
  if(!potentialLeagues.length && !hasActiveDraftRights() && !isPlayerRfaStatus()){
    appendCollegeSemiProFAOffers();
    appendFallbackLeagueOffers();
    renderFAOffersPanel(rightsActive,false);
    return;
  }
  var rightsActive=hasActiveDraftRights()||isPlayerRfaStatus();
  var rteam=null;
  if(rightsActive){
    var rk=G.draftRights.leagueKey;
    var rl=LEAGUES[rk];
    rteam=getValidTeamForLeague(rk,G.draftRights.team);
    // Rights-holding club waits until you are pro-ready -- no phantom ELC while still developing.
    if(rl&&rteam&&draftClubWillingToSignElc()){
      var eliteReady=ovr(G.attrs,G.pos)>=getEliteReadyOvrBar();
      var rsal=Math.round(rl.salBase*rd(eliteReady?0.88:0.82,eliteReady?1.08:1.02)/1000)*1000;
      curFAOffers.push({lk:rk,l:rl,team:rteam,sal:rsal,yrs:eliteReady?3:ri(2,4),rights:true,eliteReady:eliteReady,rfa:isPlayerRfaStatus()});
    }
    if(isPlayerRfaStatus() && !curFAOffers.length && rl&&rteam){
      addNews(G.draftRights.team+' will not match a big RFA number without heavy draft-pick compensation — take a team-friendly deal or walk.','neutral');
    }
    // Offer sheets only once you are in the "ready" band (same bar as draft club).
    if(draftClubWillingToSignElc() && Math.random()<0.12){
      var proK=getProLeagueKeyByGender(gender);
      var pl=LEAGUES[proK];
      var pteams=(TEAMS[proK]||[]).filter(function(t){return !rteam || t.n!==rteam.n;});
      if(pl&&pteams.length){
        var pteam=pteams[ri(0,pteams.length-1)];
        var psal=Math.round(pl.salBase*rd(1.0,1.25)/1000)*1000;
        curFAOffers.push({lk:proK,l:pl,team:pteam,sal:psal,yrs:ri(1,3),offerSheet:true});
      }
    }
  } else {
    var po=ovr(G.attrs,G.pos);
    var num=cl(Math.floor((po-50)/5)+2,2,14);
    if(G.contract&&G.contract.type==='UFA') num=Math.max(num,5);
    var used={}, i2;
    for(i2=0;i2<num;i2++){
      var lk=potentialLeagues[ri(0,potentialLeagues.length-1)];
      if(used[lk]) continue;
      used[lk]=true;
      var l=LEAGUES[lk];
      var teams=TEAMS[lk]||[];
      var team=teams[ri(0,teams.length-1)];
      if(!team) continue;
      var salMult=0.75+Math.min(0.45,(po-60)*0.012);
      var sal=Math.round(l.salBase*rd(salMult,salMult+0.35)/1000)*1000;
      var yrs=ri(1,4);
      curFAOffers.push({lk:lk,l:l,team:team,sal:sal,yrs:yrs});
    }
  }
  appendOverseasProOffersWhileRightsHeld();
  appendCollegeSemiProFAOffers();
  if(!curFAOffers.length) appendFallbackLeagueOffers();
  renderFAOffersPanel(rightsActive,rightsActive && !draftClubWillingToSignElc());
}

function renderFAOffersPanel(rightsActive,rightsDevHold){
  var html='';
  if(rightsDevHold){
    html+='<div class="vt" style="font-size:15px;color:var(--gold);margin-bottom:8px">DRAFT RIGHTS — '+G.draftRights.team.toUpperCase()+' ('+G.draftRights.leagueKey+')</div>';
    html+='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:12px;line-height:1.65">No '+getProLeagueKeyByGender(G.gender)+' contract yet — they hold your <b>rights</b> only. Below <b>'+getDraftClubElcMinOvr()+'+ OVR</b> they will not table an ELC. You can still sign <b>overseas semi-pro</b> below or use <b>League Switch</b> for junior/college/overseas paths. Rights stay with the drafting club for NA pro entry.</div>';
  } else {
    html+='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:10px">YOU ARE A '+(isPlayerRfaStatus()?'RESTRICTED':'UNRESTRICTED')+' FREE AGENT — PRIOR CONTRACT EXPIRED. YOU MAY LEAVE YOUR OLD CIRCUIT AND SIGN A NEW DEAL:</div>';
    if(isPlayerRfaStatus()){
      html+='<div class="vt" style="font-size:13px;color:var(--gold);margin-bottom:8px">RFA: Your club must match, but a huge ask costs them multiple draft picks — team-friendly money signs faster.</div>';
    } else if(G.contract&&G.contract.type==='UFA'){
      html+='<div class="vt" style="font-size:13px;color:var(--acc);margin-bottom:8px">UFA: Market is open — strong OVR draws a wide offer sheet.</div>';
    }
  }
  if(!curFAOffers.length && !rightsDevHold){
    html+='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:10px">NO PRO OFFERS — STEP DOWN TO EURO / ASIA / SEMI-PRO BELOW, OR NEGOTIATE WHERE YOU ARE.</div>';
  }
  for(var i=0;i<curFAOffers.length;i++){
    var o=curFAOffers[i];
    html+='<div style="background:var(--rink);border:1px solid var(--rl);padding:12px;margin-bottom:8px">';
    html+='<div class="vt" style="font-size:16px">'+stripBracketIcons(o.team.e)+' '+o.team.n+' -- '+stripBracketIcons(o.l.short)+'</div>';
    html+='<div class="cval-big">'+fmt(o.sal)+'/YR</div>';
    html+='<div class="vt" style="font-size:14px;color:var(--mut)">'+o.yrs+'-YEAR DEAL -- TOTAL '+fmt(o.sal*o.yrs)+'</div>';
    if(o.rights) html+='<div class="vt" style="font-size:13px;color:var(--gold)">YOUR RIGHTS-HOLDING TEAM</div>';
    if(o.eliteReady) html+='<div class="vt" style="font-size:13px;color:var(--good)">HIGH-END READY ('+getEliteReadyOvrBar()+'+ OVR)</div>';
    if(o.offerSheet) html+='<div class="vt" style="font-size:13px;color:var(--acc)">RARE OFFER SHEET</div>';
    if(o.devPath) html+='<div class="vt" style="font-size:13px;color:var(--good)">DEVELOPMENT PATH — COLLEGE / SEMI-PRO</div>';
    if(o.overseasPro) html+='<div class="vt" style="font-size:13px;color:var(--acc)">OVERSEAS PRO — '+escHtml(o.rightsNote||'NA draft rights unchanged')+'</div>';
    if(o.fallback) html+='<div class="vt" style="font-size:13px;color:var(--mut)">LOWER-LEAGUE PATH — NO PRO INTEREST</div>';
    html+='<button class="btn bp" style="margin-top:8px;font-size:14px;padding:6px 14px" onclick="signFAOffer('+i+')">SIGN HERE</button>';
    html+='</div>';
  }
  html+='<button class="btn bd bw" style="margin-top:6px" onclick="offerContract()">NEGOTIATE DEAL</button>';
  safeEl('fa-offers').innerHTML=html;
  safeEl('offseason-contract-status').innerHTML=
    'CONTRACT: '+(G.contract.type||'N/A')+' &bull; '+(G.contractYrsLeft>0?(G.contractYrsLeft+' YEAR(S) LEFT'):'EXPIRED')+'<br>'+
    'CURRENT VALUE: '+(G.contract&&G.contract.sal?fmt(G.contract.sal)+'/YR':'AMATEUR')+'<br>'+
    'OPEN OFFERS: '+curFAOffers.length;
}

function signFAOffer(i){
  var o=curFAOffers[i];if(!o)return;
  if(o.l&&o.l.tier==='pro' && (!G.league||G.league.tier!=='pro') && !(G.draftRights && G.draftRights.leagueKey===o.lk)){
    notify('PRO SIGNING REQUIRES DRAFT RIGHTS','red');
    addNews('Signing blocked: must hold draft rights to join '+o.l.short+' from lower levels.','bad');
    return;
  }
  if(o.l&&o.l.tier==='pro' && hasActiveDraftRights() && G.draftRights.team!==o.team.n){
    // Keep rights system meaningful; outside signings while rights-active are very rare.
    if(Math.random()>0.15){
      notify('RIGHTS TEAM MATCHED YOUR DEAL','red');
      addNews('Rights control: '+G.draftRights.team+' retain your rights. Outside pro signing denied.','neutral');
      return;
    }
  }
  G.leagueKey=o.lk;G.league=o.l;G.team=o.team;
  onTeamChangeLeadershipReset();
  var faType;
  if(G.league.tier==='pro') faType=getProContractType();
  else if(G.league.tier==='minor') faType='TWO-WAY ('+getProLeagueKeyByGender(G.gender)+')';
  else faType='PRO CONTRACT';
  var yrs=(faType==='ENTRY LEVEL')?3:(G.league.tier==='minor'?Math.min(2,Math.max(1,o.yrs)):o.yrs);
  G.contract={sal:o.sal,yrs:yrs,type:faType,ntc:false,bonus:false};
  if(faType==='ENTRY LEVEL'){G.hadELC=true;G.elcYears=3;}
  G.contractYrsLeft=yrs;
  G._offseasonContractSigned=true;
  stampContractBinding(o.lk, o.team.n);
  if(o.sal>0){
    var sb=Math.round(o.sal*0.08);
    if(typeof creditPlayerMoney==='function') creditPlayerMoney(sb, 'signing');
    else G.careerEarnings=(G.careerEarnings||0)+sb;
  }
  G.standings=buildStandings(o.lk);
  G.allOpponents=genSeason(o.lk,o.team);
  addNews(G.first+' '+G.last+' ('+formatPlayerPositionLabel(G.pos, G.subPos)+') signs '+o.yrs+'-year deal with '+o.team.n+' in the '+o.l.short+'!','big');
  if(o.overseasPro&&G.draftRights){
    addNews(G.draftRights.team+' ('+G.draftRights.leagueKey+') still holds your NA draft rights — no '+getProLeagueKeyByGender(G.gender)+' contract until they offer an ELC.','neutral');
  }
  G.socialMessages=generateSocialMessages();
  RetroSound.contractSign();
  notify('SIGNED!','gold');
  safeEl('contract-expire-panel').style.display='none';
}

/** Older pros (~36+) in PHL/PWL with mid-tier OVR: lower league or retire (staff chat). Hub still loads underneath. */
function maybeOfferVeteranProExit(){
  var pk=getProLeagueKeyByGender(G.gender);
  if(G.leagueKey!==pk) return;
  var a=G.age||16;
  if(a<36) return;
  var o=ovr(G.attrs,G.pos);
  if(o<72||o>83) return;
  if((G._veteranCrossroadsOfferedSeason||0)===G.season) return;
  G._veteranCrossroadsOfferedSeason=G.season;
  var semiOpts=shuf(getSemiProLeagueKeysByGender(G.gender).filter(function(k){return LEAGUES[k];}));
  var destKey=semiOpts[0]||getMinorLeagueKeyByGender(G.gender);
  var destL=LEAGUES[destKey];
  if(!destL) return;
  openStaffChat('VETERAN ROSTER -- '+G.league.short,[
    {sender:'GM / Hockey Ops',color:'var(--mut)',text:'At age '+a+' the club is getting younger. You\'re still a useful player (OVR '+o+'), but pro minutes and cap space are tight. You can continue outside the top league, walk away on your terms, or try to squeeze one more year here.'},
    {sender:'Agent',color:'var(--acc)',text:'This is the fork in the road -- be honest about what you want next.'}
  ],[
    {label:'PLAY IN '+destL.short+' / LOWER PATH',fn:function(){
      G.leagueKey=destKey;G.league=destL;G.team=getValidTeamForLeague(destKey,null);
      onTeamChangeLeadershipReset();
      G.standings=buildStandings(destKey);
      G.allOpponents=genSeason(destKey,G.team);
      if(!G.contract) G.contract={sal:0,yrs:1,type:'PRO CONTRACT',ntc:false,bonus:false};
      if(!G.contract.sal||G.contract.sal<destL.salBase) G.contract.sal=destL.salBase;
      G.contractYrsLeft=Math.max(G.contractYrsLeft||0,1);
      addNews('Career move: '+G.first+' '+G.last+' shifts to '+destL.short+' as the organization prioritizes a younger pro group.','neutral');
      notify(destL.short.toUpperCase(),'gold');
      renderHub();show('s-hub');
    }},
    {label:'RETIRE',fn:function(){retire();}},
    {label:'ONE MORE PRO YEAR',fn:function(){
      addNews(G.first+' '+G.last+' and '+G.team.n+' run it back in '+G.league.short+' for another season.','neutral');
      notify('BACK FOR ANOTHER YEAR','gold');
      renderHub();show('s-hub');
    }}
  ]);
}

function nextSeason(){
  if(!handleExpiredContractBeforeCamp()) return;
  if(typeof evaluateOffseasonInjuryFallout==='function'&&evaluateOffseasonInjuryFallout()) return;
  G._inOffseason=false;
  G._offseasonMedical=false;
  G._enteredOffseasonInjured=false;
  if(typeof ensureInjuryTracking==='function') ensureInjuryTracking();
  G.seasonInjuryCount=0;
  RetroSound.seasonTurn();
  evaluateLeadershipAtSeasonEnd();
  var wasBadProSeason=hadBadProSeason();
  if(G._advLeague&&G._advLeague!==G.leagueKey){
    var newL=LEAGUES[G._advLeague];
    var newTeams=TEAMS[G._advLeague]||[];
    var newTeam=newTeams[ri(0,newTeams.length-1)]||G.team;
    G.leagueKey=G._advLeague;G.league=newL;G.team=newTeam;
    onTeamChangeLeadershipReset();
    G.standings=buildStandings(G._advLeague);
    G.allOpponents=genSeason(G._advLeague,newTeam);
    if(!G.contract.sal||G.contract.sal<newL.salBase) G.contract.sal=newL.salBase;
    addNews('PROMOTED: '+G.first+' '+G.last+' joins the '+newL.short+'!','big');
    notify('PROMOTED TO '+newL.short+'!','gold');
  }
  var _ageSeasonEnded=G.age;
  G.age++;G.season++;G.year++;
  applyPhysiqueGrowthAfterAgeUp(_ageSeasonEnded,G.age);
  if(qualifiesYoungProAffiliateDemotion(wasBadProSeason,_ageSeasonEnded)){
    var downKey=getMinorLeagueKeyByGender(G.gender);
    if(downKey && LEAGUES[downKey]){
      var oldTeam2=G.team.n, oldLeague2=G.league.short;
      G.leagueKey=downKey;
      G.league=LEAGUES[downKey];
      G.team=getValidTeamForLeague(downKey,null);
      onTeamChangeLeadershipReset();
      G.standings=buildStandings(downKey);
      G.allOpponents=genSeason(downKey,G.team);
      addNews('ROSTER MOVE: '+oldTeam2+' ('+oldLeague2+') assign '+G.first+' '+G.last+' to '+G.league.short+' -- under '+getProAffiliateDemotionMaxOvr()+' OVR, short tenure; development stint (OVR '+ovr(G.attrs,G.pos)+').','neutral');
      notify('ASSIGNED TO '+G.league.short.toUpperCase(),'red');
    }
  }
  // Main pro (PHL/PWL) hard roster floor: sub-floor OVR reassigned to development leagues (gendered).
  if(G.leagueKey===getProLeagueKeyByGender(G.gender) && ovr(G.attrs,G.pos)<getProHardDevelopmentFloorOvr()){
    var demoteKey=getDemotionDestinationFromPHL();
    if(demoteKey && LEAGUES[demoteKey]){
      var oldTeam=G.team.n, oldLeague=G.league.short;
      G.leagueKey=demoteKey;
      G.league=LEAGUES[demoteKey];
      G.team=getValidTeamForLeague(demoteKey,null);
      onTeamChangeLeadershipReset();
      G.standings=buildStandings(demoteKey);
      G.allOpponents=genSeason(demoteKey,G.team);
      addNews('ROSTER MOVE: '+oldTeam+' assign '+G.first+' '+G.last+' from '+oldLeague+' to '+G.league.short+' for development (OVR '+ovr(G.attrs,G.pos)+').','neutral');
      notify('ASSIGNED TO '+G.league.short.toUpperCase(),'red');
    }
  }
  if(G.league.tier==='junior' && G.age>getJuniorMaxAge()){
    var forced=getTransitionLeagueOptions();
    if(G.age<=getCollegeMaxAge()){
      var collegeK=G.gender==='M'?'NCHA':'NWCHA';
      if(LEAGUES[collegeK]&&forced.indexOf(collegeK)<0) forced.unshift(collegeK);
    }
    var validForced=(forced||[]).filter(function(k){return canMoveToProLeague(k);});
    var semiFirst=getSemiProLeagueKeysByGender(G.gender).filter(function(k){return LEAGUES[k]&&canJoinLeagueByAge(k);});
    var fallbackSemi=semiFirst.length?semiFirst[0]:(ovr(G.attrs,G.pos)>=getProHardDevelopmentFloorOvr()?getMinorLeagueKeyByGender(G.gender):(G.gender==='M'?'NEHL':'SDHL'));
    var forcedKey=(validForced&&validForced.length)?validForced[0]:fallbackSemi;
    if(LEAGUES[forcedKey]){
      var oldShort=G.league.short;
      G.leagueKey=forcedKey;G.league=LEAGUES[forcedKey];
      var teams=TEAMS[forcedKey]||[];
      if(teams.length) G.team=shuf(teams.slice())[0];
      onTeamChangeLeadershipReset();
      G.standings=buildStandings(forcedKey);
      G.allOpponents=genSeason(forcedKey,G.team);
      if(!G.contract||G.contract.sal<LEAGUES[forcedKey].salBase){
        var forcedType=(LEAGUES[forcedKey].tier==='pro')?getProContractType():'PRO CONTRACT';
        var fYrs=(forcedType==='ENTRY LEVEL')?3:1;
        G.contract={sal:LEAGUES[forcedKey].salBase,yrs:fYrs,type:forcedType,ntc:false,bonus:false};
        if(forcedType==='ENTRY LEVEL'){G.hadELC=true;G.elcYears=3;}
        G.contractYrsLeft=Math.max(fYrs,G.contractYrsLeft||0);
      }
      addNews('Age rule: '+G.first+' is too old for junior hockey — moves from '+oldShort+' to '+G.league.short+'.','big');
    }
  }
  if(G.league.tier==='college' && G.age>getCollegeMaxAge()){
    var semiOnly=getSemiProLeagueKeysByGender(G.gender).concat(G.gender==='M'?['NEHL','FHL','CEHL','ARHL']:['SDHL','FWHL','AWHL']);
    semiOnly=semiOnly.filter(function(k){return LEAGUES[k]&&canJoinLeagueByAge(k);});
    var colFallback=semiOnly.length?semiOnly[0]:(G.gender==='M'?'NEHL':'SDHL');
    if(LEAGUES[colFallback]){
      var oldShortC=G.league.short;
      G.leagueKey=colFallback;G.league=LEAGUES[colFallback];
      var teamsC=TEAMS[colFallback]||[];
      if(teamsC.length) G.team=shuf(teamsC.slice())[0];
      onTeamChangeLeadershipReset();
      G.standings=buildStandings(colFallback);
      G.allOpponents=genSeason(colFallback,G.team);
      addNews('Age rule: '+G.first+' is past college eligibility — continues in '+G.league.short+'.','big');
    }
  }
  if(G.age>=30){
    // Aging: slow erosion from 30, ramps through mid-30s, very sharp after 35.
    var pen;
    if(G.age<33) pen=(G.age-29)*0.09;
    else if(G.age<35) pen=0.27+(G.age-32)*0.11;
    else pen=0.5+(G.age-34)*0.72;
    var amin=typeof G._attrClampMin==='number'?G._attrClampMin:40;
    if(G.pos!=='G'&&typeof SKATER_ATTR_CATEGORIES!=='undefined'){
      var ck, cd, ai, ak;
      for(ck in SKATER_ATTR_CATEGORIES){
        if(!SKATER_ATTR_CATEGORIES.hasOwnProperty(ck)) continue;
        cd=SKATER_ATTR_CATEGORIES[ck];
        for(ai=0;ai<cd.keys.length;ai++){
          ak=cd.keys[ai];
          if(ak==='agility'||ak==='speed') G.attrs[ak]=cl(G.attrs[ak]-rd(0,pen*1.1),25,99);
          else G.attrs[ak]=cl(G.attrs[ak]-rd(0,pen),amin,99);
        }
      }
      if(typeof syncLegacySkaterAttrsFromCategories==='function') syncLegacySkaterAttrsFromCategories(G.attrs);
      if(G.attrs.durability) G.attrs.durability=cl(G.attrs.durability-rd(0,pen*0.35),25,99);
    } else {
      var al=ATTRS[G.pos];
      for(var i=0;i<al.length;i++){
        var ak2=al[i];
        G.attrs[ak2]=cl(G.attrs[ak2]-rd(0,pen),40,99);
      }
    }
    G.stamina=cl(G.stamina-rd(0,pen*1.9),0,100);
  }
  if(G.age<=25){
    var al2=G.pos!=='G'&&typeof SKATER_SUB_ATTR_KEYS!=='undefined'?SKATER_SUB_ATTR_KEYS.slice():(ATTRS[G.pos]||[]);
    var gm=(G.growthMult||1)*getPotentialDevMult(G.potential||'support');
    var yb=G.age<=17?1.6:(G.age<=19?1.38:(G.age<=22?1.05:(G.age<=24?0.7:0.45)));
    var oc=getAttrCapForAge(G.age||16);
    var omin=typeof G._attrClampMin==='number'?G._attrClampMin:40;
    for(var i=0;i<al2.length;i++) G.attrs[al2[i]]=cl(G.attrs[al2[i]]+rd(0,1.5*gm*yb),omin,oc);
    if(G.pos!=='G'&&typeof syncLegacySkaterAttrsFromCategories==='function') syncLegacySkaterAttrsFromCategories(G.attrs);
  }
  if(typeof mergeUserSeasonIntoCareerLeagueStats==='function') mergeUserSeasonIntoCareerLeagueStats();
  if(typeof finalizeLeagueSeasonBeforeReset==='function') finalizeLeagueSeasonBeforeReset(G.leagueKey, G.season-1);
  if(typeof resetLeagueRosterCachesForNewSeason==='function') resetLeagueRosterCachesForNewSeason(G.leagueKey);
  G.gp=0;G.w=0;G.l=0;G.otl=0;G.goals=0;G.assists=0;G.plusminus=0;G.pim=0;G.sog=0;G.saves=0;G.goalsAgainst=0;
  G.week=1;G.weekGames=0;G.isInjured=false;G.wonCup=false;G.milestones=[];
  if(typeof updatePlayerConditioning==='function') updatePlayerConditioning();
  G._leagueStatsKey=null;
  G._npcStatsSyncedWeek=0;
  G._teamOffenseFactors={};
  G._teamRosterKey=null;
  G.teamRoster=null;
  pendingTrade=null;
  G.tradeOffersThisSeason=0;
  G._tradeCooldownUntilGp=12;
  G.health=cl(G.health+20,0,100);
  G.standings=buildStandings(G.leagueKey);
  G.allOpponents=genSeason(G.leagueKey,G.team);
  G.contractYrsLeft=Math.max(0,G.contractYrsLeft);
  G.teamTenure=(G.teamTenure||0)+1;
  G.socialMessages=generateSocialMessages();
  G.socialReactions={};
  addNews('SEASON '+G.season+' -- '+G.first+' '+G.last+' reports to training camp, age '+G.age+'.','neutral');
  maybeOfferVeteranProExit();
  if(G.age>=38&&Math.random()<0.4){
    safeEl('rp-age').textContent=G.age;
    openM('m-retire-prompt');
    return;
  }
  if(G.age>=44) retire();
  else{renderHub();show('s-hub');}
}

function retire(){closeM('m-retire-prompt');renderRetire();show('s-retire');}
function oneMoreYear(){closeM('m-retire-prompt');addNews(G.first+' '+G.last+' plays one more season at age '+G.age+'.','neutral');renderHub();show('s-hub');}
