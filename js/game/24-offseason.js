/* breakaway — OFFSEASON */
// ============================================================
// OFFSEASON
// ============================================================
function getProLeagueKeyByGender(gender){return gender==='F'?'PWL':'PHL';}
function getMinorLeagueKeyByGender(gender){return gender==='F'?'PWDL':'NAML';}
function getSemiProLeagueKeysByGender(gender){return gender==='F'?['SDHL','FWHL','AWHL']:['NEHL','CEHL','ARHL'];}

function getTransitionLeagueOptions(){
  // Default pathway is lower levels; pro only via draft-rights signing.
  // Affiliate minors (NAML/PWDL) only if 75+ / 45+ OVR; otherwise semi-pro + dev only.
  var minorK=getMinorLeagueKeyByGender(G.gender);
  var opts=[minorK].concat(getSemiProLeagueKeysByGender(G.gender));
  opts=opts.filter(function(k){return LEAGUES[k];});
  if(ovr(G.attrs)<getProHardDevelopmentFloorOvr()){
    opts=opts.filter(function(k){return LEAGUES[k].tier!=='minor';});
  }
  return opts;
}

function getDemotionDestinationFromPHL(){
  var age=G.age||16;
  var devKeys=['NCHA','NWCHA','OJL','QMJL','WJL','CWHL','USJL','USWDL','NEJC','CEJC','ARJC','EWJC','AWJC'];
  var semiKeys=getSemiProLeagueKeysByGender(G.gender);
  var pool=(age<=20?devKeys:[]).concat(semiKeys);
  var valid=pool.filter(function(k){return LEAGUES[k]&&LEAGUES[k].gender===G.gender;});
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
  return (ppg<0.46 && (G.plusminus||0)<=-12) || ((G.plusminus||0)<=-22);
}

/** NAML/PWDL send-down from main pro (PHL/PWL): below gendered OVR bar, short tenure, age 18–29. Bad year = very likely; otherwise still rolls often. */
function qualifiesYoungProAffiliateDemotion(wasBadSeason, ageSeasonJustEnded){
  if(!G.league||G.league.tier!=='pro') return false;
  var proKey=getProLeagueKeyByGender(G.gender);
  if(G.leagueKey!==proKey) return false;
  var endedAge=ageSeasonJustEnded!=null?ageSeasonJustEnded:(G.age||16);
  if(endedAge<18||endedAge>=30) return false;
  if(ovr(G.attrs)>=getProAffiliateDemotionMaxOvr()) return false;
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

function canMoveToProLeague(targetKey){
  if(!LEAGUES[targetKey]) return true;
  var tTier=LEAGUES[targetKey].tier;
  if(tTier==='pro'){
    // Already in top pro league: can pick same league in offseason to switch teams (e.g. return toward former club).
    if(G.leagueKey===targetKey && G.league && G.league.tier==='pro') return true;
    if(G.league && G.league.tier==='pro' && targetKey===getProLeagueKeyByGender(G.gender)) return true;
    return !!(G.draftRights && G.draftRights.leagueKey===targetKey);
  }
  if(tTier==='minor'){
    if((G.age||16)<18) return false; // affiliate minors (NAML/PWDL): 18+
    // Already in pro/minor: free movement within system.
    if(G.league && (G.league.tier==='minor'||G.league.tier==='pro')) return true;
    // From junior/college/semi-pro: draft rights + men 75+ / women 45+ to join affiliate minors.
    if(!G.draftRights) return false;
    return ovr(G.attrs)>=getProHardDevelopmentFloorOvr();
  }
  return true;
}

/** Canada/USA skaters — PHL-style draft emphasis at age 18. */
function isNorthAmericanSkater(){
  var n=G.nat||'';
  return (n==='Canada'||n==='United States'||n==='Canadian'||n==='American') && G.pos!=='G';
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
      G._draftStatusText='DRAFT STATUS: NOT ELIGIBLE (NA JUNIORS/COLLEGE — DRAFT YEAR IS AGE 18)';
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
    var pre=ovr(G.attrs);
    var boomChance=track==='generational'?0.70:(track==='elite'?0.42:(track==='high'?0.18:0.06));
    if(pre>=72 && Math.random()<boomChance){
      var alBoom=ATTRS[G.pos]||[];
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

  var pOvr=ovr(G.attrs);
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
    (G.leagueKey==='ARHL'||G.leagueKey==='CEHL')?0.14:
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
    G.draftRights={leagueKey:proKey,team:draftedTeam.n,age:draftAge,round:round};
    G.draftRound=round;
    G.everDrafted=true;
    G.isDraftFreeAgent=false;
    G._draftStatusText='DRAFT STATUS: '+round+suffix+' ROUND BY '+draftedTeam.n.toUpperCase()+' ('+proKey+') -- RIGHTS ONLY';
    addNews('DRAFT DAY: '+G.first+' '+G.last+' selected in the '+round+suffix+' round by '+draftedTeam.n+' ('+proKey+').','big');
    addNews('DRAFT RIGHTS ONLY: '+G.first+' has not signed yet and will continue developing unless a contract is offered.','neutral');
    if(pOvr<76){
      addNews('Development path: '+G.first+' remains in '+G.league.short+' for now despite being drafted.','neutral');
    } else if(pOvr<getDraftClubElcMinOvr()){
      addNews('CLUB STANCE: '+draftedTeam.n+' holds your rights but will not offer an ELC until you are pro-ready ('+getDraftClubElcMinOvr()+'+ OVR) -- keep developing.','neutral');
    } else {
      addNews('ELC TRACK: '+G.first+' projected for ENTRY-LEVEL CONTRACT talks with '+draftedTeam.n+' (no auto-signing).','good');
    }
  } else {
    G.draftRights=null;
    G.draftRound=0;
    G.isDraftFreeAgent=true;
    G._draftStatusText='DRAFT STATUS: UNDRAFTED FREE AGENT';
    addNews('DRAFT DAY: '+G.first+' '+G.last+' goes undrafted -- now a free agent.','neutral');
    if(G.age<20) addNews('Eligible to stay in juniors through age 20 while evaluating offers.','neutral');
  }
}

function goToOffseason(){
  G.contractYrsLeft--;
  if((G.age>21) && (G.league.tier==='pro'||G.league.tier==='minor') && G.contractYrsLeft<=0){
    G.contract.type='UFA';
    G.contract.yrs=0;
    addNews('CONTRACT STATUS: '+G.first+' '+G.last+' is now a UFA.','neutral');
  }
  G._offseasonChoiceTaken=false;
  curFAOffers=[];
  _lastWorldStageHTML='';
  _lastWorldStageStats=null;
  runDraftEventIfEligible();
  var actions=[
    {id:'surgery',   icon:'[H]', name:'SURGERY & REHAB',   desc:'Restore health -- lose dev time.',      fn:function(){G.health=cl(G.health+35,0,100);addNews('Surgery complete -- health restored.','good');}},
    {id:'elite',     icon:'[T]', name:'ELITE SKILLS CAMP', desc:'Private coaching -- attr gains.',        fn:function(){if((G.age||16)>=26){G.morale=cl(G.morale+8,0,100);addNews('Skills camp -- mental reps and video work (physical ceiling reached at 26+).','neutral');return;}var pSk=getPotentialDevMult(G.potential||'support');var al=ATTRS[G.pos];var picks=shuf(al.slice()).slice(0,3);var cc=getAttrCapForAge(G.age||16);var cmin=typeof G._attrClampMin==='number'?G._attrClampMin:40;picks.forEach(function(a){G.attrs[a]=cl(G.attrs[a]+rd(1,2.5)*pSk,cmin,cc);});addNews('Skills camp -- significant improvement.','good');}},
    {id:'vacation',  icon:'[V]', name:'FULL VACATION',     desc:'Total rest -- morale and stamina.',      fn:function(){G.morale=cl(G.morale+30,0,100);G.stamina=cl(G.stamina+25,0,100);addNews('Vacation -- recharged.','good');}},
    {id:'media',     icon:'[M]', name:'MEDIA TOUR',        desc:'Commercials -- PR and brand boost.',     fn:function(){addNews('Media tour -- brand building done.','neutral');}},
    {id:'charity',   icon:'[C]', name:'CHARITY WORK',      desc:'Community impact -- morale boost.',      fn:function(){G.morale=cl(G.morale+18,0,100);addNews('Charity work -- huge goodwill.','good');}},
    {id:'gym',       icon:'[G]', name:'CONDITIONING CAMP', desc:'Pure physical -- strength and endurance.',fn:function(){var pg=getPotentialDevMult(G.potential||'support');if((G.age||16)<26&&G.attrs.physical)G.attrs.physical=cl(G.attrs.physical+Math.max(1,Math.round(2*pg)),40,99);G.stamina=cl(G.stamina+20,0,100);addNews('Conditioning camp -- '+((G.age||16)>=26?'stamina focus (no new physical ceiling at 26+).':'physically elite.'),'good');}}
  ];
  var html='';
  for(var i=0;i<actions.length;i++){
    var a=actions[i];
    html+='<button class="btn bs bw" style="padding:12px;text-align:left;margin-bottom:8px" onclick="doOffseasonAction(\''+a.id+'\')">';
    html+=stripBracketIcons(a.name)+'<br><span class="vt" style="font-size:12px;color:var(--mut)">'+a.desc+'</span></button>';
  }
  safeEl('offseason-actions').innerHTML=html;
  window._offseasonActions=actions;
  var offerCount=(curFAOffers&&curFAOffers.length)||0;
  var rightsText=G.draftRights?('DRAFT RIGHTS: '+G.draftRights.team+' ('+G.draftRights.leagueKey+') -- ROUND '+(G.draftRights.round||'?')):'DRAFT RIGHTS: NONE';
  var elcText='ELC STATUS: '+(G.contract&&G.contract.type==='ENTRY LEVEL'
    ? ('ACTIVE -- YEAR '+cl(3-(G.contractYrsLeft||0)+1,1,3)+'/3')
    : (G.hadELC?'COMPLETED':'NOT SIGNED'));
  safeEl('offseason-contract-status').innerHTML=
    'CONTRACT: '+(G.contract.type||'N/A')+' &bull; '+(G.contractYrsLeft>0?(G.contractYrsLeft+' YEAR(S) LEFT'):'EXPIRED')+'<br>'+
    'CURRENT VALUE: '+(G.contract&&G.contract.sal?fmt(G.contract.sal)+'/YR':'AMATEUR')+'<br>'+
    'OPEN OFFERS: '+offerCount+'<br>'+
    (G._draftStatusText||'DRAFT STATUS: --')+'<br>'+
    rightsText+'<br>'+
    elcText;
  var tier=G.league.tier;
  var advPanel=safeEl('league-advance-panel');
  var shouldAdv=['junior','college'].indexOf(tier)!==-1&&G.season>=3||['euro','asia'].indexOf(tier)!==-1&&G.season>=2;
  var shouldAdvMinor=tier==='minor'&&G.season>=2&&ovr(G.attrs)>=getProHardDevelopmentFloorOvr();
  if(shouldAdv||shouldAdvMinor){
    advPanel.style.display='block';
    var nextKeys=(NEXT_TIER[tier]&&NEXT_TIER[tier][G.gender])||[];
    var avail=nextKeys.filter(function(k){return LEAGUES[k]&&LEAGUES[k].tier!=='pro'&&canMoveToProLeague(k);});
    var ahtml='<div class="vt" style="font-size:15px;color:var(--mut);margin-bottom:10px">SCOUTS HAVE TAKEN NOTICE. YOUR OPTIONS:</div>';
    if(G.draftRights){
      ahtml+='<div class="vt" style="font-size:14px;color:var(--gold);margin-bottom:8px">'+
        (draftClubWillingToSignElc()
          ? 'YOU HAVE BEEN DRAFTED BY '+G.draftRights.team.toUpperCase()+' ('+G.draftRights.leagueKey+'). PRO SIGNING USES YOUR DRAFT RIGHTS WHEN YOU ACCEPT AN OFFER.'
          : 'DRAFT RIGHTS: '+G.draftRights.team.toUpperCase()+' ('+G.draftRights.leagueKey+') -- NO ELC FROM CLUB UNTIL '+getDraftClubElcMinOvr()+'+ OVR. KEEP DEVELOPING (JUNIOR / COLLEGE / SEMI-PRO) VIA LEAGUE SWITCH.')+
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
  var mustLeaveJunior=((tier==='junior'||tier==='college') && G.age>=20);
  var proKeyTop=getProLeagueKeyByGender(G.gender);
  if(mustLeaveJunior || (tier==='junior' && G.season>=1 && ovr(G.attrs)>=62) || G.isDraftFreeAgent || G.draftRights || tier==='pro'){
    switchPanel.style.display='block';
    var offerPool=mustLeaveJunior?getTransitionLeagueOptions():(tier==='pro'?getTransitionLeagueOptions():(G.gender==='M'?['OJL','QMJL','WJL','NCHA','USJL','NEJC','CEJC','ARJC','NEHL','CEHL','ARHL']:['CWHL','NWCHA','USWDL','EWJC','AWJC','SDHL','FWHL','AWHL']));
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
      return k!==G.leagueKey;
    });
    var switchOvr=ovr(G.attrs);
    var offers;
    if(tier==='pro'){
      var numPro=Math.min(3, Math.max(1, otherLeagues.length));
      offers=otherLeagues.slice(0,numPro);
    } else if(tier==='junior' && G.season>=2 && switchOvr>=66){
      var colPick=G.gender==='M'?'NCHA':'NWCHA';
      var euroPick;
      if(G.gender==='M'){
        if(G.leagueKey==='NEJC') euroPick='NEHL';
        else if(G.leagueKey==='CEJC') euroPick='CEHL';
        else if(G.leagueKey==='ARJC') euroPick='ARHL';
        else euroPick=['NEHL','CEHL'][ri(0,1)];
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
      (mustLeaveJunior?'AGE RULE: MUST MOVE TO MINOR/SEMI-PRO OR HIGHER THIS OFFSEASON.':
      (tier==='pro'?'LEAGUE SWITCH: OTHER LEAGUES ONLY (YOU ARE ALREADY IN '+G.league.short+').':
      (G.isDraftFreeAgent?'FREE AGENT OFFERS AVAILABLE:':'OFFERS AVAILABLE:')))+'</div>';
    if(tier==='junior' && G.season>=2 && switchOvr>=66 && !mustLeaveJunior){
      shtml+='<div class="vt" style="font-size:14px;color:var(--acc);margin-bottom:8px"><b>OPTIONAL:</b> You can stay in '+G.league.short+' or try <b>college</b> (NCHA/NWCHA) or <b>overseas semi-pro</b> (e.g. NEHL/CEHL/ARHL or women&rsquo;s SDHL/FWHL/AWHL) — harder, more structured hockey. Not required.</div>';
    }
    if(tier==='pro'){
      shtml+='<div class="vt" style="font-size:14px;color:var(--gold);margin-bottom:8px">Same-league team changes are handled in-season via trades/requests -- offseason here is for moving to a different league.</div>';
    } else if(!G.draftRights){
      shtml+='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:8px">'+getMinorLeagueKeyByGender(G.gender)+' FEEDS INTO '+proKeyTop+'. FIRST-TIME PRO ENTRY NEEDS DRAFT RIGHTS. AFFILIATE MINORS FROM DEV LEAGUES REQUIRE <b>'+getProHardDevelopmentFloorOvr()+'+ OVR</b> (MEN 75 / WOMEN 45), AGE 18+.</div>';
    } else {
      shtml+='<div class="vt" style="font-size:14px;color:var(--gold);margin-bottom:8px">DRAFTED BY '+G.draftRights.team.toUpperCase()+' ('+G.draftRights.leagueKey+'). '+
        (draftClubWillingToSignElc()
          ? 'ELC OFFERS APPEAR WHEN YOUR CONTRACT EXPIRES.'
          : 'BELOW '+getDraftClubElcMinOvr()+' OVR: NO ELC YET -- PICK A DEVELOPMENT LEAGUE BELOW. AT '+getDraftClubElcMinOvr()+'+: PRO MAY APPEAR HERE.')+
        '</div>';
    }
    for(var j=0;j<offers.length;j++){
      var k=offers[j]; var l=LEAGUES[k];
      shtml+='<div class="lcard" id="switch-'+k+'" onclick="pickSwitchLeague(\''+k+'\')">';
      shtml+='<div class="ltier" style="color:var(--acc)">'+l.tier.toUpperCase()+'</div>';
      shtml+='<div class="lname">'+stripBracketIcons(l.short)+' -- '+l.name+'</div>';
      shtml+='<div class="ldesc">'+l.desc+'</div></div>';
    }
    if(!mustLeaveJunior) shtml+='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:8px">-- OR -- <button class="btn bs" onclick="pickSwitchLeague(null)">STAY IN '+G.league.short+'</button></div>';
    safeEl('switch-content').innerHTML=shtml;
    G._switchLeague=offers[0]||null;
    }
  } else {
    switchPanel.style.display='none';
    G._switchLeague=null;
  }
  var cePanel=safeEl('contract-expire-panel');
  if(G.contractYrsLeft<=0){cePanel.style.display='block';generateFAOffers();}
  else cePanel.style.display='none';
  // International: SIM vs PLAY choice when eligible (otherwise auto messages only).
  startOffseasonWorldStageFlow();
}

function doOffseasonAction(id){
  if(G._offseasonChoiceTaken){
    notify('ONLY ONE OFFSEASON FOCUS ALLOWED','red');
    return;
  }
  var actions=window._offseasonActions||[];
  for(var i=0;i<actions.length;i++){
    if(actions[i].id===id){
      actions[i].fn();
      G._offseasonChoiceTaken=true;
      notify(actions[i].name+' COMPLETE','green');
      safeEl('offseason-actions').innerHTML='<div class="vt" style="font-size:14px;color:var(--gold)">OFFSEASON FOCUS LOCKED: '+actions[i].name+'</div>';
      return;
    }
  }
}

function pickAdvLeague(k){
  var cards=document.querySelectorAll('[id^="adv-"]');
  for(var i=0;i<cards.length;i++) cards[i].classList.remove('sel');
  if(k){
    if(!canMoveToProLeague(k)){
      notify('PRO MOVE REQUIRES DRAFT RIGHTS','red');
      addNews('Advancement blocked: must be drafted by a '+LEAGUES[k].short+' club before signing there.','bad');
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
    addNews('LEAGUE ADVANCEMENT: Promoted to the '+G.league.short+' with '+G.team.n+'.','big');
    notify('ADVANCED TO '+G.league.short.toUpperCase(),'gold');
    safeEl('league-advance-panel').style.display='none';
  }
}

function pickSwitchLeague(k){
  var cards=document.querySelectorAll('[id^="switch-"]');
  for(var i=0;i<cards.length;i++) cards[i].classList.remove('sel');
  if(k){
    if(!canMoveToProLeague(k)){
      notify('PRO MOVE REQUIRES DRAFT RIGHTS','red');
      addNews('Switch blocked: must be drafted first, then sign to join '+LEAGUES[k].short+'.','bad');
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
      addNews('LEAGUE SWITCH: Moved to the '+G.league.short+' with '+G.team.n+'.','big');
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
      return ovr(G.attrs)>=getProHardDevelopmentFloorOvr();
    }
    if(lk.tier==='pro'){
      if(G.league && G.league.tier==='pro') return true;
      return !!(G.draftRights && G.draftRights.leagueKey===k);
    }
    return true;
  });
  if(!potentialLeagues.length){
    safeEl('fa-offers').innerHTML='<div class="vt" style="font-size:14px;color:var(--mut)">NO QUALIFYING PRO/MINOR OFFERS YET. KEEP DEVELOPING OR NEGOTIATE WHERE YOU ARE.</div>';
    return;
  }
  var rightsActive=hasActiveDraftRights();
  var rteam=null;
  if(rightsActive){
    var rk=G.draftRights.leagueKey;
    var rl=LEAGUES[rk];
    rteam=getValidTeamForLeague(rk,G.draftRights.team);
    // Rights-holding club waits until you are pro-ready -- no phantom ELC while still developing.
    if(rl&&rteam&&draftClubWillingToSignElc()){
      var eliteReady=ovr(G.attrs)>=getEliteReadyOvrBar();
      var rsal=Math.round(rl.salBase*rd(eliteReady?1.0:0.9,eliteReady?1.25:1.15)/1000)*1000;
      curFAOffers.push({lk:rk,l:rl,team:rteam,sal:rsal,yrs:eliteReady?3:ri(2,4),rights:true,eliteReady:eliteReady});
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
    var num=ri(1,3);
    for(var i=0;i<num;i++){
      var lk=potentialLeagues[ri(0,potentialLeagues.length-1)];
      var l=LEAGUES[lk];
      var teams=TEAMS[lk]||[];
      var team=teams[ri(0,teams.length-1)];
      if(!team)continue;
      var sal=Math.round(l.salBase*rd(0.8,1.3)/1000)*1000;
      var yrs=ri(1,4);
      curFAOffers.push({lk:lk,l:l,team:team,sal:sal,yrs:yrs});
    }
  }
  var html='';
  var rightsDevHold=rightsActive && !draftClubWillingToSignElc();
  if(rightsDevHold){
    html+='<div class="vt" style="font-size:15px;color:var(--gold);margin-bottom:8px">DRAFT RIGHTS &mdash; '+G.draftRights.team.toUpperCase()+' ('+G.draftRights.leagueKey+')</div>';
    html+='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:12px;line-height:1.65">No contract offer from your drafting club until <b>'+getDraftClubElcMinOvr()+'+ OVR</b>. They still hold your rights. Use <b>LEAGUE SWITCH</b> above to stay in or move to <b>junior, college, semi-pro,</b> or overseas and keep developing.</div>';
  } else {
    html+='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:10px">YOU ARE A FREE AGENT. OFFERS:</div>';
  }
  if(!curFAOffers.length && !rightsDevHold){
    html+='<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:10px">NO QUALIFYING PRO/MINOR OFFERS YET. KEEP DEVELOPING OR NEGOTIATE WHERE YOU ARE.</div>';
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
  if(o.sal>0) G.careerEarnings=(G.careerEarnings||0)+Math.round(o.sal*0.08);
  G.standings=buildStandings(o.lk);
  G.allOpponents=genSeason(o.lk,o.team);
  addNews(G.first+' '+G.last+' signs '+o.yrs+'-year deal with '+o.team.n+' in the '+o.l.short+'!','big');
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
  var o=ovr(G.attrs);
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
  G._inOffseason=false;
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
      addNews('ROSTER MOVE: '+oldTeam2+' ('+oldLeague2+') assign '+G.first+' '+G.last+' to '+G.league.short+' -- under '+getProAffiliateDemotionMaxOvr()+' OVR, short tenure; development stint (OVR '+ovr(G.attrs)+').','neutral');
      notify('ASSIGNED TO '+G.league.short.toUpperCase(),'red');
    }
  }
  // Main pro (PHL/PWL) hard roster floor: sub-floor OVR reassigned to development leagues (gendered).
  if(G.leagueKey===getProLeagueKeyByGender(G.gender) && ovr(G.attrs)<getProHardDevelopmentFloorOvr()){
    var demoteKey=getDemotionDestinationFromPHL();
    if(demoteKey && LEAGUES[demoteKey]){
      var oldTeam=G.team.n, oldLeague=G.league.short;
      G.leagueKey=demoteKey;
      G.league=LEAGUES[demoteKey];
      G.team=getValidTeamForLeague(demoteKey,null);
      onTeamChangeLeadershipReset();
      G.standings=buildStandings(demoteKey);
      G.allOpponents=genSeason(demoteKey,G.team);
      addNews('ROSTER MOVE: '+oldTeam+' assign '+G.first+' '+G.last+' from '+oldLeague+' to '+G.league.short+' for development (OVR '+ovr(G.attrs)+').','neutral');
      notify('ASSIGNED TO '+G.league.short.toUpperCase(),'red');
    }
  }
  if((G.league.tier==='junior'||G.league.tier==='college') && G.age>20){
    var forced=getTransitionLeagueOptions();
    // Undrafted players route to semi-pro path first (not affiliate minors without OVR).
    var validForced=(forced||[]).filter(function(k){return canMoveToProLeague(k);});
    var semiFirst=getSemiProLeagueKeysByGender(G.gender).filter(function(k){return LEAGUES[k];});
    var fallbackSemi=semiFirst.length?semiFirst[0]:(ovr(G.attrs)>=getProHardDevelopmentFloorOvr()?getMinorLeagueKeyByGender(G.gender):(G.gender==='M'?'NEHL':'SDHL'));
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
      addNews('AGE RULE MOVE: '+G.first+' transitions from '+oldShort+' to '+G.league.short+'.','big');
    }
  }
  if(G.age>=30){
    // Aging: slow erosion from 30, ramps through mid-30s, very sharp after 35.
    var pen;
    if(G.age<33) pen=(G.age-29)*0.09;
    else if(G.age<35) pen=0.27+(G.age-32)*0.11;
    else pen=0.5+(G.age-34)*0.72;
    var al=ATTRS[G.pos];
    for(var i=0;i<al.length;i++){
      if(al[i]!=='stamina') G.attrs[al[i]]=cl(G.attrs[al[i]]-rd(0,pen),40,99);
    }
    G.stamina=cl(G.stamina-rd(0,pen*1.9),0,100);
  }
  if(G.age<=25){
    var al2=ATTRS[G.pos];
    var gm=(G.growthMult||1)*getPotentialDevMult(G.potential||'support');
    var yb=G.age<=17?1.6:(G.age<=19?1.38:(G.age<=22?1.05:(G.age<=24?0.7:0.45)));
    var oc=getAttrCapForAge(G.age||16);
    var omin=typeof G._attrClampMin==='number'?G._attrClampMin:40;
    for(var i=0;i<al2.length;i++) G.attrs[al2[i]]=cl(G.attrs[al2[i]]+rd(0,1.5*gm*yb),omin,oc);
  }
  G.gp=0;G.w=0;G.l=0;G.otl=0;G.goals=0;G.assists=0;G.plusminus=0;G.sog=0;G.saves=0;G.goalsAgainst=0;
  G.week=1;G.weekGames=0;G.isInjured=false;G.wonCup=false;G.milestones=[];
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
