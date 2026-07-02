/* breakaway — TEAM SELECT -- DRAFT / OFFERS SYSTEM */
// ============================================================
// TEAM SELECT -- DRAFT / OFFERS SYSTEM
// ============================================================
function goToTeamSelect(){
  var lk=selLeague||'OJL';
  var teams=TEAMS[lk]||TEAMS['OJL'];
  var l=LEAGUES[lk];
  var tier=l.tier;
  var html='';
  G._availableTeams=null;
  G._selTeamIdx=0;

  if(tier==='junior'){
    var nat=safeEl('c-nat')?safeEl('c-nat').value:'Canada';
    var hometown=(safeEl('c-hometown')&&safeEl('c-hometown').value.trim())||nat;
    var previewOvr=typeof getTeamSelectPreviewOvr==='function'?getTeamSelectPreviewOvr():60;
    var acGender=safeEl('c-gender')?safeEl('c-gender').value:'M';

    if(typeof isProAcademyJuniorLeague==='function'&&isProAcademyJuniorLeague(lk)){
      var homeTeam=typeof pickAcademyHomeTeam==='function'?pickAcademyHomeTeam(lk,nat,hometown):teams[0];
      var alternates=typeof pickAcademyAlternateTeams==='function'?pickAcademyAlternateTeams(lk,homeTeam,2):shuf(teams.slice()).slice(0,2);
      G._availableTeams=[homeTeam].concat(alternates);
      G._selTeamIdx=0;
      safeEl('team-select-hdr').textContent=l.short+' ACADEMY';
      safeEl('team-select-title').textContent='ORGANIZATION SIGNING';
      safeEl('team-select-sub').textContent='YOUR HOME CLUB OFFERS AN ACADEMY DEAL — OR SIGN WITH ANOTHER PROGRAM:';
      html+='<div class="vt" style="font-size:14px;color:var(--acc);margin-bottom:10px;border-left:3px solid var(--acc);padding-left:8px">';
      html+='No draft in '+l.short+'. You sign with a parent-club academy — PHL scouts can still draft you at 18 while you develop in Europe/Asia.';
      html+='</div>';
      html+='<div class="lcard sel" id="tc-0" onclick="pickTeam(0)">';
      html+='<span class="badge green">HOME ORG</span><br>';
      html+='<span class="vt" style="font-size:18px">'+homeTeam.n+'</span>';
      var homeParent=typeof getAcademyParentProTeam==='function'?getAcademyParentProTeam(homeTeam.n, lk):null;
      if(homeParent) html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:4px">Parent club: <b>'+homeParent.name+'</b> ('+homeParent.leagueKey+')</div>';
      if(typeof getAcademyOrgContractBlurb==='function') html+=getAcademyOrgContractBlurb(homeTeam.n, lk, acGender, previewOvr);
      html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:4px">Accept org contract — report to home academy camp</div>';
      html+='</div>';
      html+='<div class="vt" style="font-size:14px;color:var(--mut);margin:10px 0 6px">-- OR SIGN WITH ANOTHER ACADEMY PROGRAM --</div>';
      for(var ai=0;ai<alternates.length;ai++){
        html+='<div class="lcard" id="tc-'+(ai+1)+'" onclick="pickTeam('+(ai+1)+')">';
        html+='<span class="badge mut">OTHER PROGRAM</span><br>';
        html+='<span class="vt" style="font-size:16px">'+alternates[ai].n+'</span>';
        var altParent=typeof getAcademyParentProTeam==='function'?getAcademyParentProTeam(alternates[ai].n, lk):null;
        if(altParent) html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:3px">Parent: '+altParent.name+' ('+altParent.leagueKey+')</div>';
        html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:3px">Sign elsewhere — org deal with a different club</div>';
        html+='</div>';
      }
    } else {
    // CHL / USJL DRAFT DAY
    var draftRd=ri(1,4);
    var pick=ri(1,10);
    var pool=teams;
    if(lk==='USJL'&&typeof filterUsjlTeamsForPlayer==='function'){
      pool=filterUsjlTeamsForPlayer(teams, nat, 16);
      if(!pool.length) pool=teams;
    }
    var previewOvr=typeof getTeamSelectPreviewOvr==='function'?getTeamSelectPreviewOvr():60;
    var potKey=(typeof selPotential!=='undefined'&&typeof POTENTIALS!=='undefined'&&POTENTIALS[selPotential])?selPotential:'support';
    var usndtScout=lk==='USJL'&&typeof qualifiesForUsndtU17Invite==='function'&&qualifiesForUsndtU17Invite(previewOvr, potKey, nat, 16);
    var draftedTeam=(lk==='USJL'&&typeof pickUsjlDraftTeam==='function')
      ?pickUsjlDraftTeam(pool, nat, 16, previewOvr, potKey)
      :pool[ri(0,pool.length-1)];
    var undrafted=shuf(pool.filter(function(t){return t.n!==draftedTeam.n;})).slice(0,2);
    if(usndtScout&&typeof isUsndtU17Team==='function'&&!isUsndtU17Team(draftedTeam.n)){
      var u17Alt=typeof findUsndtU17Team==='function'?findUsndtU17Team(pool):null;
      if(u17Alt){
        var hasU17=false, ui;
        for(ui=0;ui<undrafted.length;ui++){ if(isUsndtU17Team(undrafted[ui].n)){ hasU17=true; break; } }
        if(!hasU17&&undrafted.length) undrafted[ri(0,undrafted.length-1)]=u17Alt;
        else if(!hasU17) undrafted.push(u17Alt);
      }
    }
    var allShown=[draftedTeam].concat(undrafted);
    G._availableTeams=allShown;
    G._selTeamIdx=0;
    safeEl('team-select-hdr').textContent=l.short+' DRAFT';
    safeEl('team-select-title').textContent=l.short.toUpperCase()+' DRAFT DAY';
    safeEl('team-select-sub').textContent='YOUR RIGHTS HAVE BEEN CLAIMED -- OR GO UNDRAFTED:';
    html+='<div class="draft-reveal">';
    html+='<div class="vt" style="font-size:12px;color:var(--mut);letter-spacing:2px;margin-bottom:4px">'+l.name.toUpperCase()+'</div>';
    html+='<div class="retro-puck-graphic lg" style="margin:8px 0"><div class="puck-disc"></div></div>';
    html+='<div class="draft-pick-num">ROUND '+draftRd+' — PICK '+pick+'</div>';
    html+='<div class="vt" style="font-size:26px;color:var(--wht);margin-bottom:4px">'+draftedTeam.n+'</div>';
    html+='<div class="vt" style="font-size:16px;color:var(--mut)">SELECTS YOU WITH THE '+pick+(pick===1?'ST':pick===2?'ND':pick===3?'RD':'TH')+' PICK</div>';
    html+='<div class="vt" style="font-size:15px;color:var(--gold);margin-top:6px">'+formatPlayerPositionLabel(selPos, selSubPos)+'</div>';
    if(usndtScout){
      var scoutTier=typeof getUsndtU17InviteTier==='function'?getUsndtU17InviteTier(previewOvr, potKey):'solid';
      html+='<div class="vt" style="font-size:13px;color:var(--acc);margin-top:8px;border-left:3px solid var(--acc);padding-left:8px">';
      html+='<b>USNDT U17 scouting:</b> ';
      if(scoutTier==='lock') html+='National staff view you as a top-end prospect — U17 is likely.';
      else if(scoutTier==='strong') html+='Elite projection or strong tools — heavy USNDT U17 interest.';
      else html+='Strong enough profile — USNDT U17 is in play (OVR '+Math.round(previewOvr)+').';
      html+='</div>';
    }
    if(lk==='USJL'&&typeof isUsndtU17Team==='function'&&isUsndtU17Team(draftedTeam.n)){
      html+='<div class="vt" style="font-size:13px;color:var(--acc);margin-top:8px">USNDT U17 (age 16) — <b>'+(typeof USNDT_U17_LEAGUE_GAMES!=='undefined'?USNDT_U17_LEAGUE_GAMES:36)+'</b> USJL league games plus <b>'+(typeof USNDT_U17_INTL_COUNT!=='undefined'?USNDT_U17_INTL_COUNT:8)+'</b> international tournaments. U18 track starts at age 17. USA eligibility required.</div>';
    } else     if(lk==='USJL'&&typeof isUsndtU18Team==='function'&&isUsndtU18Team(draftedTeam.n)){
      html+='<div class="vt" style="font-size:13px;color:var(--acc);margin-top:8px">USNDT U18 — <b>'+(typeof USNDT_U18_LEAGUE_GAMES!=='undefined'?USNDT_U18_LEAGUE_GAMES:26)+'</b> USJL games, heavy <b>'+(typeof USNDT_U18_COLLEGE_EXH!=='undefined'?USNDT_U18_COLLEGE_EXH:14)+'</b> college exhibition slate, CJL showcase + spring Challenge. <b>World Juniors priority</b> for Team USA U20. USA eligibility required.</div>';
    } else if(lk==='USJL'&&typeof isUsndtTeam==='function'&&isUsndtTeam(draftedTeam.n)){
      html+='<div class="vt" style="font-size:13px;color:var(--acc);margin-top:8px">US NATIONAL DEVELOPMENT TEAM — USA eligibility required.</div>';
    }
    html+='</div>';
    html+='<div class="lcard sel" id="tc-0" onclick="pickTeam(0)">';
    html+='<span class="badge gold">DRAFTED</span> <span class="vt" style="font-size:17px">'+draftedTeam.n+'</span>';
    html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:3px">Accept your draft rights -- report to camp</div>';
    html+='</div>';
    html+='<div class="vt" style="font-size:14px;color:var(--mut);margin:10px 0 6px">-- OR SIGN ELSEWHERE AS UNDRAFTED FREE AGENT --</div>';
    for(var i=0;i<undrafted.length;i++){
      html+='<div class="lcard" id="tc-'+(i+1)+'" onclick="pickTeam('+(i+1)+')">';
      html+='<span class="badge mut">UNDRAFTED FREE AGENT</span><br>';
      html+='<span class="vt" style="font-size:16px">'+undrafted[i].n+'</span>';
      html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:3px">Sign as undrafted -- potentially more ice time</div>';
      html+='</div>';
    }
    }
  } else if(tier==='local'){
    var nat=safeEl('c-nat')?safeEl('c-nat').value:'Canada';
    var homeTeam=typeof getLocalTeamForNat==='function'?getLocalTeamForNat(nat, l.gender):teams[0];
    var madeTeam=typeof qualifiesForLocalTeam==='function'?qualifiesForLocalTeam(nat):true;
    if(!madeTeam){
      G._availableTeams=null;
      G._selTeamIdx=-1;
      safeEl('team-select-hdr').textContent='TRYOUT DENIED';
      safeEl('team-select-title').textContent='LHL NOT AVAILABLE';
      safeEl('team-select-sub').textContent=(homeTeam?homeTeam.n.toUpperCase():nat.toUpperCase())+' — COMMUNITY CIRCUIT';
      html+='<div class="vt" style="font-size:14px;color:var(--red);margin-bottom:10px;border-left:3px solid var(--red);padding-left:8px">';
      html+='<b>LHL is for growing hockey markets.</b> From <b>'+nat+'</b>, start in junior or overseas development instead.';
      if(typeof getLocalBlockedNatHint==='function') html+=' '+getLocalBlockedNatHint(nat);
      html+='</div>';
      html+='<button type="button" class="btn bp bw" onclick="goToLeague()">BACK TO LEAGUE SELECT</button>';
    } else {
      G._availableTeams=[homeTeam];
      G._selTeamIdx=0;
      safeEl('team-select-hdr').textContent='HOME CLUB INVITE';
      safeEl('team-select-title').textContent='LOCAL COMMUNITY HOCKEY';
      safeEl('team-select-sub').textContent='YOUR REGIONAL CLUB WANTS YOU ON THE ROSTER:';
      html+='<div class="vt" style="font-size:14px;color:var(--acc);margin-bottom:10px;border-left:3px solid var(--acc);padding-left:8px">';
      html+='Lowest level — no tryout bar. <b>12 league games</b> plus community events over 9 weeks — strong development focus.';
      html+='</div>';
      html+='<div class="lcard sel" id="tc-0" onclick="pickTeam(0)">';
      html+='<span class="badge green">HOME CLUB</span><br>';
      html+='<span class="vt" style="font-size:18px">'+homeTeam.n+'</span>';
      html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:4px">Community program — no salary, all reps</div>';
      html+='</div>';
    }
  } else if(tier==='college'){
    // SCHOLARSHIP OFFERS
    var numOffers=ri(2,4);
    var offered=shuf(teams.slice()).slice(0,numOffers);
    G._availableTeams=offered;
    G._selTeamIdx=0;
    safeEl('team-select-hdr').textContent='SCHOLARSHIP OFFERS';
    safeEl('team-select-title').textContent='COLLEGE SCHOLARSHIP OFFERS';
    safeEl('team-select-sub').textContent='PROGRAMS HAVE EXTENDED OFFERS -- CHOOSE YOUR SCHOOL:';
    html+='<div class="vt" style="font-size:14px;color:var(--gold);margin-bottom:10px;border-left:3px solid var(--gold);padding-left:8px">'+numOffers+' SCHOOLS HAVE OFFERED YOU A FULL ATHLETIC SCHOLARSHIP</div>';
    for(var i=0;i<offered.length;i++){
      html+='<div class="lcard'+(i===0?' sel':'')+'" id="tc-'+i+'" onclick="pickTeam('+i+')">';
      html+='<span class="badge green">SCHOLARSHIP OFFER</span><br>';
      html+='<span class="vt" style="font-size:18px">'+offered[i].e+' '+offered[i].n+'</span>';
      html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:4px">Full athletic scholarship -- 4-year program -- tuition &amp; development</div>';
      html+='</div>';
    }
  } else {
    // EURO / ASIA / MINOR -- CONTRACT OFFERS
    var numOffers=ri(2,3);
    var offered=shuf(teams.slice()).slice(0,numOffers);
    G._availableTeams=offered;
    G._selTeamIdx=0;
    safeEl('team-select-hdr').textContent='CONTRACT OFFERS';
    safeEl('team-select-title').textContent='TEAMS INTERESTED IN SIGNING YOU';
    safeEl('team-select-sub').textContent='CHOOSE YOUR DESTINATION:';
    for(var i=0;i<offered.length;i++){
      var t=offered[i];
      var offerSal=l.salBase>0?Math.round(l.salBase*rd(0.82,1.22)/1000)*1000:0;
      var offerYrs=ri(1,3);
      html+='<div class="lcard'+(i===0?' sel':'')+'" id="tc-'+i+'" onclick="pickTeam('+i+')">';
      html+='<span class="vt" style="font-size:18px">'+t.e+' '+t.n+'</span>';
      if(offerSal>0){
        html+='<div class="vt" style="font-size:15px;color:var(--green);margin-top:4px">OFFER: '+fmt(offerSal)+'/yr — '+offerYrs+'-YEAR DEAL</div>';
      }
      html+='</div>';
    }
  }
  safeEl('team-list').innerHTML=html;
  show('s-team');
}

function pickTeam(i){
  G._selTeamIdx=i;
  var cards=document.querySelectorAll('#team-list .lcard');
  for(var j=0;j<cards.length;j++) cards[j].classList.remove('sel');
  var el=safeEl('tc-'+i);
  if(el) el.classList.add('sel');
}
