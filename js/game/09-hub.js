/* breakaway — HUB */
// ============================================================
// HUB
// ============================================================
function renderHub(){
  if(typeof ensureProCallUpStintComplete==='function') ensureProCallUpStintComplete();
  if(typeof ensureCallUpHomeSnapshot==='function') ensureCallUpHomeSnapshot();
  if(typeof ensureLeagueContext==='function') ensureLeagueContext();
  if(G.leagueKey==='USJL'&&typeof normalizeUsndtTeamOnLoad==='function') normalizeUsndtTeamOnLoad();
  if(G._inOffseason){
    if(typeof goToOffseason==='function'&&G._offseasonInitializedForSeason!==G.season) goToOffseason();
    else {
      if(typeof continueOffseasonAfterDraft==='function'){
        try{ continueOffseasonAfterDraft(); }catch(eHubOs){}
      }
      if(typeof refreshOffseasonRecapPanels==='function') try{ refreshOffseasonRecapPanels(); }catch(eHubRf){}
    }
    try{ show('s-offseason'); }catch(eHubOff){}
    return;
  }
  if(!G._playoffCtx||!G._playoffCtx.active){
    if(typeof maybeEndRegularSeason==='function') maybeEndRegularSeason();
    if(G._inOffseason){
      try{ show('s-offseason'); }catch(eHubOff2){}
      return;
    }
  }
  var o=ovr(G.attrs,G.pos);
  var fullName=String(G.first+' '+G.last).trim();
  if(typeof syncPlayerAcademyBand==='function') syncPlayerAcademyBand();
  var myTeamLbl=typeof getTeamDisplayName==='function'?getTeamDisplayName(G.team.n,G.leagueKey,{academyBand:G._academyBand}):G.team.n;
  applyTeamTheme(G.team&&G.team.n?G.team.n:'TEAM');
  var hubLgShort=typeof getLeagueDisplayName==='function'&&G.leagueKey?getLeagueDisplayName(G.leagueKey,'short'):(G.league&&G.league.short?G.league.short:'');
  safeEl('hub-hdr').textContent=hubLgShort+' -- SEASON '+G.season+' -- '+G.year;
  safeEl('hub-pname').textContent=fullName;
  // Enhanced pmeta with jersey, hand, hometown
  var handLabel=G.hand==='L'?'L':'R';
  var posStr=(G.pos==='G'?'G':G.subPos+(G.secondarySubPos?' · also '+G.secondarySubPos:''));
  var leadTag=G.leadershipRole?(' -- '+G.leadershipRole):'';
  var homeStr=String(G.hometown||'').trim();
  safeEl('hub-pmeta').textContent=
    'Age '+G.age+' -- #'+G.jersey+leadTag+' -- '+posStr+' -- '+handLabel+' -- '+myTeamLbl+
    (homeStr?' -- '+homeStr:'')+' -- '+G.nat+' -- '+G.height+' -- '+(G.weight||180)+' LB';
  var teamIdent=safeEl('hub-team-ident');
  if(teamIdent) teamIdent.innerHTML='<span class="team-wordmark">'+myTeamLbl+'</span>';
  safeEl('hub-ovr').textContent='OVR '+o;
  var lbb=safeEl('hub-league-badge');
  if(lbb){
    lbb.textContent=stripBracketIcons(typeof getLeagueDisplayName==='function'&&G.leagueKey?getLeagueDisplayName(G.leagueKey,'short'):G.league.short);
    lbb.title=(typeof getLeagueDisplayName==='function'&&G.leagueKey?getLeagueDisplayName(G.leagueKey,'name'):(G.league.name||G.league.short))+' — '+G.league.tier.toUpperCase();
  }
  G.contract=G.contract||{sal:0,yrs:0,type:'AMATEUR',ntc:false,bonus:false};
  var yrsLeft=G.contractYrsLeft!=null?G.contractYrsLeft:(G.contract&&G.contract.yrs);
  var conText=(G.contract.type||'AMATEUR')+(G.contract.sal>0?' — '+fmt(G.contract.sal)+'/yr':' — AMATEUR');
  if(typeof yrsLeft==='number'&&yrsLeft>0) conText+=' ('+yrsLeft+' yr'+(yrsLeft!==1?'s':'')+')';
  safeEl('hub-contract-badge').textContent=conText;
  var cbb=safeEl('hub-contract-badge');
  if(cbb) cbb.title=G.contract.type+(G.contract.sal>0?(' · '+fmt(G.contract.sal)+' per season'):'');
  var me=G.morale;
  var mei=me>=80?':)':me>=60?':|':me>=40?':S':':(';
  safeEl('hub-morale-badge').textContent=mei+' '+me;
  var hubIc=safeEl('hub-icon');
  if(hubIc) hubIc.innerHTML=teamLogoSVG(G.team.n,72,G.leagueKey);
  var xfId=G.xFactor&&X_FACTORS[G.xFactor]?G.xFactor:'none';
  var xf=X_FACTORS[xfId]||X_FACTORS.none;
  var xfb=safeEl('hub-xfactor-badge');
  if(xfb){
    xfb.textContent=xFactorUiName(xfId);
    xfb.title=xf.desc;
  }
  var potId=G.potential&&POTENTIALS[G.potential]?G.potential:'support';
  var pot=POTENTIALS[potId];
  var potB=safeEl('hub-potential-badge');
  if(potB){
    potB.textContent=potentialUiShort(potId);
    potB.title=pot.desc;
  }
  var xpNxt=G.season*1200;
  safeEl('hub-xp').style.width=Math.min(100,G.xp/xpNxt*100)+'%';
  safeEl('hub-xp-lbl').textContent=G.xp+'/'+xpNxt;
  var perWkHub=getGamesPerWeek(G.leagueKey);
  var totalWks=typeof getSeasonWeekCount==='function'?getSeasonWeekCount(G.leagueKey):Math.ceil((G.league.games||68)/perWkHub);
  var psub=safeEl('hub-season-sub');
  var ptitle=safeEl('hub-season-ptitle');
  if(G._playoffCtx&&G._playoffCtx.active){
    if(typeof ensurePlayoffUserSeriesReady==='function') ensurePlayoffUserSeriesReady(G._playoffCtx);
    var boN=typeof getPlayoffSeriesWinsNeeded==='function'?getPlayoffSeriesWinsNeeded():4;
    var serHdr=boN<=1?'1 GAME':'BO'+boN+' (race to '+boN+')';
    if(ptitle) ptitle.innerHTML='PLAYOFFS <span style="color:var(--mut)">—</span> <span id="wk-lbl">'+escHtml(G._playoffCtx.roundName||'ROUND')+'</span> <span style="color:var(--mut)">·</span> <span id="wk-max">'+serHdr+'</span>';
    var _px=G._playoffCtx,_pr=_px.pairs&&_px.pairs[_px.pairIndex];
    var subP=(G.league&&G.league.tier==='local')
      ?'<b>COMMUNITY SHOWCASE</b> — top 8 clubs, single-game rounds. Play your matchup or sim the bracket. Eliminated? You go straight to offseason.'
      :(G._playoffCtx.memorialCup
        ?'<b>CJL MEMORIAL CUP</b> — round robin (2 pts/win), semifinal (2 vs 3), one-game final. <b>SIM ROUND</b> runs CPU games until yours — then <b>PLAY GAME</b> or <b>SIM MY SERIES</b>. #1 seed skips the semifinal.'
        :(G._playoffCtx.cjlUsndtChallenge
          ?'<b>CJL vs USNDT U18 CHALLENGE</b> — CJL All-Stars vs USNDT U18. 2 games (2 pts/win), 3-on-3 OT if tied.'
          :'<b>SIM ROUND</b> resolves CPU series up to yours. <b>SIM MY SERIES</b> fast-sims your matchup. <b>PLAY GAME</b> is one game at a time. Eliminated? Bracket auto-finishes — offseason next.'));
    if(_pr&&(_pr[0].isMe||_pr[1].isMe)&&!_px.eliminated){
      var _uW=_pr[0].isMe?_px.seriesHW:_px.seriesAW,_oW=_pr[0].isMe?_px.seriesAW:_px.seriesHW,_on=_pr[0].isMe?_pr[1].team.n:_pr[0].team.n;
      subP='Series tracker: you '+_uW+' — '+_oW+' '+_on+(boN<=1?'':' (first to '+boN+')')+'. '+subP;
    }
    if(psub) psub.textContent=subP;
  } else {
    if(ptitle) ptitle.innerHTML='WEEK <span id="wk-lbl">'+G.week+'</span> / <span id="wk-max">'+totalWks+'</span>';
    if(psub) psub.textContent=(G.league.tier==='local'
      ?'12 LEAGUE GAMES + COMMUNITY EVENTS — 9 weeks, 2 slots per week. Events do not count as GP.'
      :perWkHub+' GAMES THIS WEEK. CLICK TO PLAY EACH ONE:');
  }
  if(G.isInjured){
    safeEl('inj-banner').style.display='block';
    safeEl('inj-text').textContent=G.injName+' -- '+G.injWks+' WKS LEFT';
  } else {
    safeEl('inj-banner').style.display='none';
  }
  safeEl('s-gp').textContent=(typeof getHubSeasonStatBundle==='function'?getHubSeasonStatBundle().gp:G.gp);
  // Dynamic stat grid for goalies vs skaters
  if(typeof buildHubSeasonStatGridHtml==='function'){
    safeEl('hub-stat-grid').innerHTML=buildHubSeasonStatGridHtml();
  } else {
  var pm=G.plusminus;
  if(G.pos==='G'){
    var gaaSzn=G.gp>0?Math.round(((G.goalsAgainst||0)/G.gp)*100)/100:'--';
    safeEl('hub-stat-grid').innerHTML=
      '<div class="stbox"><div class="stlbl">GP</div><div class="stval">'+G.gp+'</div></div>'+
      '<div class="stbox"><div class="stlbl">GA</div><div class="stval" style="color:var(--red)">'+(G.goalsAgainst||0)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SV</div><div class="stval" style="color:var(--green)">'+G.saves+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SV%</div><div class="stval" style="color:var(--gold)">'+formatSvPctFromCounts(G.saves,G.goalsAgainst||0)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">GAA</div><div class="stval">'+gaaSzn+'</div></div>'+
      '<div class="stbox"><div class="stlbl">W-L-OTL</div><div class="stval" style="color:var(--gold)">'+(G.w||0)+'-'+(G.l||0)+'-'+(G.otl||0)+'</div></div>';
  } else {
    var pimClr=typeof getHubPimDisplayColor==='function'?getHubPimDisplayColor(G.pim,G.pos,G.arch,G.xFactor):'var(--text)';
    safeEl('hub-stat-grid').innerHTML=
      '<div class="stbox"><div class="stlbl">GP</div><div class="stval">'+G.gp+'</div></div>'+
      '<div class="stbox"><div class="stlbl">G</div><div class="stval" style="color:var(--red)">'+G.goals+'</div></div>'+
      '<div class="stbox"><div class="stlbl">A</div><div class="stval" style="color:var(--acc)">'+G.assists+'</div></div>'+
      '<div class="stbox"><div class="stlbl">PTS</div><div class="stval" style="color:var(--gold)">'+(G.goals+G.assists)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">+/-</div><div class="stval" style="color:'+(pm>=0?'var(--green)':'var(--red)')+'">'+(pm>=0?'+':'')+pm+'</div></div>'+
      '<div class="stbox"><div class="stlbl">PIM</div><div class="stval" style="color:'+pimClr+'">'+(G.pim||0)+'</div></div>';
  }
  }
  var hubSzn=typeof getHubSeasonStatBundle==='function'?getHubSeasonStatBundle():null;
  var msgs=[];
  if(G.pos==='G'){
    var svDisp=formatSvPctFromCounts(hubSzn?hubSzn.saves:G.saves,hubSzn?hubSzn.goalsAgainst:G.goalsAgainst||0);
    msgs.push(fullName+' -- '+(hubSzn?hubSzn.gp:G.gp)+'GP '+(hubSzn?hubSzn.saves:G.saves)+'SV SV%'+svDisp+' THIS SEASON');
  } else {
    var hubG=hubSzn?hubSzn.goals:G.goals, hubA=hubSzn?hubSzn.assists:G.assists;
    msgs.push(fullName+' -- '+(hubG+hubA)+' PTS ('+hubG+'G '+hubA+'A) THIS SEASON');
  }
  if(G._playoffCtx&&G._playoffCtx.active){
    msgs.push('PLAYOFFS — '+G._playoffCtx.roundName);
  } else {
    msgs.push(G.league.name.toUpperCase()+' · WEEK '+G.week);
    msgs.push(G.team.n.toUpperCase()+' — GAME DAY');
  }
  var divLbl=typeof getTeamDivisionName==='function'?getTeamDivisionName(G.leagueKey,G.team.n):'';
  if(divLbl) msgs.push(divLbl.toUpperCase()+' STANDINGS RACE');
  msgs.push('TIP: PRESS ? OR / FOR HELP');
  if(G.streakType && G.streakType!=='none' && G.streakCount>=2) msgs.push('TREND: '+G.streakType+G.streakCount+' STREAK');
  if(G.streakType && G.streakType!=='none' && G.streakCount>=4) msgs.push('ARENA ENERGY: '+G.streakType+G.streakCount+' -- EVERY SHIFT MATTERS');
  if(typeof draftClubWillingToSignElc==='function' && hasActiveDraftRights() && !draftClubWillingToSignElc())
    msgs.push('DRAFT: '+G.draftRights.team+' HOLDS RIGHTS (NO CONTRACT) — OVERSEAS SEMI-PRO OK · ELC AT '+getDraftClubElcMinOvr()+'+ OVR');
  if(typeof isPlayerUnderBindingContract==='function' && isPlayerUnderBindingContract())
    msgs.push('CONTRACT: '+getContractCircuitHint(G._contractCircuit||'')+' ('+(G.contractYrsLeft||0)+' YR LEFT)');
  if(G.morale>=88) msgs.push(G.first.toUpperCase()+' -- LOCKER ROOM VIBES: MORALE THROUGH THE ROOF');
  if(typeof isUserHealthyScratch==='function'&&isUserHealthyScratch()) msgs.push('DEPTH: HEALTHY SCRATCH — WAITING FOR A SPOT OR CALL-UP');
  if(G._callUpCtx&&G._callUpCtx.active) msgs.push('CALL-UP: '+G._callUpCtx.proTeamName+' ('+G._callUpCtx.gamesLeft+' GAMES LEFT)');
  if(G.league.tier==='pro' && G.gp>0 && (G.w/G.gp)<0.45) msgs.push('MEDIA: Press conference demand spikes after poor form.');
  if(G.streakCount>=3&&(G.streakType==='W'||G.streakType==='L')) msgs.push('STREAK: '+G.streakCount+(G.streakType==='W'?'W':'L'));
  if(G.news.length) msgs.push(G.news[0].txt);
  safeEl('hub-tick').textContent=shuf(msgs).join('  --  ');
  if(G.league.tier==='pro' && G.gp>0 && (G.w/G.gp)<0.5){
    if(G._mediaHeatWeek!==G.week && Math.random()<0.4){
      G._mediaHeatWeek=G.week;
      addNews('Media: A controversial stretch has the fanbase and commentators on edge.','bad');
    }
  }
  maybeMidSeasonPulse();
  renderWeekGames();
  renderNewsFeed();
  if(G.activeTab) hubTab(G.activeTab);
  maybeTriggerRandomLifeScenario();
}

function maybeMidSeasonPulse(){
  if(!G||G._inOffseason||G._playoffCtx&&G._playoffCtx.active) return;
  if(G._midSeasonPulseWeek===G.week) return;
  if(Math.random()>0.22) return;
  G._midSeasonPulseWeek=G.week;
  var tier=G.league&&G.league.tier||'';
  var lines=[
    {t:'Teammates grab post-practice food — locker room energy is up.',m:4,x:8},
    {t:'Local media ran a short feature on '+G.first+' '+G.last+'.',m:3,x:10},
    {t:'Equipment manager hooked you up with fresh steel — small edge.',m:2,x:6},
    {t:'Video coach dropped a clip breakdown on your habits.',m:2,x:12},
    {t:'Fan account posted a hype reel — followers tick up.',m:5,x:5,f:ri(20,80)}
  ];
  if(tier==='local'){
    lines.push({t:'Community night at the rink — families stayed late.',m:6,x:14});
    lines.push({t:'Try-hockey volunteers thanked you on social — good vibes.',m:5,x:10,f:ri(15,60)});
  }
  if(tier==='junior'||tier==='college'){
    lines.push({t:'Scouts were in the building this week — pressure, but motivation.',m:1,x:9});
  }
  var pick=lines[ri(0,lines.length-1)];
  G.morale=cl((G.morale||50)+pick.m,0,100);
  G.xp=(G.xp||0)+(pick.x||8);
  if(pick.f) G.socialFollowers=(G.socialFollowers||0)+pick.f;
  addNews(pick.t,'good');
}

function isMemorialCupSingleGamePhase(ctx){
  return !!(ctx&&ctx.memorialCup&&(ctx.mcPhase==='roundrobin'||ctx.mcPhase==='semifinal'||ctx.mcPhase==='final'));
}

function resetMemorialCupPairSeriesCounters(ctx){
  if(!ctx||!isMemorialCupSingleGamePhase(ctx)) return;
  ctx.seriesHW=0;
  ctx.seriesAW=0;
}

function ensurePlayoffUserSeriesReady(ctx){
  if(!ctx||ctx.eliminated) return;
  var pr=ctx.pairs&&ctx.pairIndex<ctx.pairs.length?ctx.pairs[ctx.pairIndex]:null;
  if(!pr||(!pr[0].isMe&&!pr[1].isMe)) return;
  var boN=typeof getPlayoffSeriesWinsNeeded==='function'?getPlayoffSeriesWinsNeeded():4;
  if(isMemorialCupSingleGamePhase(ctx)&&boN<=1&&(ctx.seriesHW>0||ctx.seriesAW>0)){
    resetMemorialCupPairSeriesCounters(ctx);
  }
}

function renderPlayoffHubPanel(){
  var el=safeEl('week-games');
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.active){ el.innerHTML=''; return; }
  if(ctx.eliminated){
    if(!G._playoffElimFinishing){
      G._playoffElimFinishing=true;
      try{ onPlayoffEliminated(); }finally{ G._playoffElimFinishing=false; }
    }
    if(G._inOffseason){
      try{show('s-offseason');}catch(ePE){}
      return;
    }
    el.innerHTML='<div class="vt" style="font-size:16px;color:var(--gold);margin-bottom:8px">SHOWCASE COMPLETE</div>'+
      '<div class="vt" style="font-size:14px;color:var(--mut);margin-bottom:10px">Finishing the bracket and opening offseason…</div>'+
      '<button type="button" class="btn bg bw" onclick="skipLocalShowcaseToOffseason()">GO TO OFFSEASON</button>';
    return;
  }
  var boN=typeof getPlayoffSeriesWinsNeeded==='function'?getPlayoffSeriesWinsNeeded():4;
  var serLabel=boN<=1?'one game (winner take all)':'best-of-'+(boN*2-1)+' · first to '+boN+' wins';
  var html='<div class="playoff-hub-bracket" style="border:1px solid var(--rl);background:var(--rink);padding:12px;margin-bottom:10px">';
  if(ctx.cjlUsndtChallenge){
    html+='<div class="vt" style="font-size:16px;color:var(--gold);margin-bottom:6px">CJL vs USNDT U18 CHALLENGE</div>';
    html+='<div class="vt" style="font-size:13px;color:var(--acc);margin-bottom:10px">'+escHtml(ctx.roundName||'Challenge Game')+' · 2 pts per win · 3-on-3 OT if tied</div>';
    html+='<div style="font-size:14px;margin-bottom:10px">CJL All-Stars <b style="color:var(--gold)">'+ctx.cjlSeriesPts+'</b> — USNDT U18 <b style="color:var(--gold)">'+ctx.usndtSeriesPts+'</b></div>';
    html+='<div style="font-size:12px;color:var(--mut);margin-bottom:8px">You represent: <b style="color:var(--wht)">'+(ctx.userSide==='cjl'?CJL_SELECT_NAME:USNDT_U18_TEAM_NAME)+'</b></div>';
  } else {
  html+='<div class="vt" style="font-size:16px;color:var(--gold);margin-bottom:6px">'+escHtml(ctx.memorialCup?'CJL MEMORIAL CUP':(G.league.short+' PLAYOFF BRACKET'))+'</div>';
  html+='<div class="vt" style="font-size:13px;color:var(--acc);margin-bottom:10px">'+escHtml(ctx.roundName||'ROUND')+' · '+serLabel+'</div>';
  if(ctx.memorialCup&&ctx.mcPhase==='roundrobin'&&ctx.rrStandings){
    html+='<div style="font-size:11px;color:var(--mut);margin-bottom:6px">ROUND ROBIN STANDINGS (2 pts/win)</div>';
    html+='<div style="display:grid;gap:4px;margin-bottom:10px;font-size:12px">';
    var rrTeams=ctx.teams||[];
    var rrSorted=rrTeams.slice().sort(function(a,b){
      return (ctx.rrStandings[b.team.n].pts||0)-(ctx.rrStandings[a.team.n].pts||0);
    });
    var ri2;
    for(ri2=0;ri2<rrSorted.length;ri2++){
      var rn=rrSorted[ri2].team.n, rs=ctx.rrStandings[rn];
      html+='<div style="padding:4px 6px;border:1px solid rgba(122,184,224,.15)">'+(ri2+1)+'. '+escHtml(rn)+' — <b>'+(rs.pts||0)+' PTS</b> ('+(rs.w||0)+'-'+(rs.l||0)+')'+(rrSorted[ri2].isMe?' · YOU':'')+'</div>';
    }
    html+='</div>';
  }
  }
  html+='<div style="font-size:11px;color:var(--mut);margin-bottom:6px">SEEDED FIELD</div>';
  html+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;font-family:VT323,monospace">';
  var f;
  for(f=0;f<ctx.summary.field.length;f++){
    html+='<span style="font-size:11px;padding:4px 6px;border:1px solid rgba(122,184,224,.2);color:var(--wht)">'+escHtml(ctx.summary.field[f])+'</span>';
  }
  html+='</div>';
  html+='<div style="font-size:11px;color:var(--mut);margin-bottom:6px">THIS ROUND</div>';
  var p;
  for(p=0;p<ctx.pairs.length;p++){
    var pr=ctx.pairs[p];
    var done=p<ctx.pairIndex;
    var cur=p===ctx.pairIndex;
    var line=teamLogoChip(pr[0].team.n,18,G.leagueKey)+' <span style="color:var(--wht)">'+escHtml(pr[0].team.n)+'</span> <span style="color:var(--mut)">vs</span> '+teamLogoChip(pr[1].team.n,18,G.leagueKey)+' <span style="color:var(--wht)">'+escHtml(pr[1].team.n)+'</span>';
    var st=done?' ✓ DONE':(cur?' · NOW':' · up next');
    if(cur&&(pr[0].isMe||pr[1].isMe)) st=' · YOUR SERIES';
    html+='<div style="padding:8px;border:1px solid rgba(122,184,224,.15);margin-bottom:6px;font-size:14px;line-height:1.35">'+(p+1)+'. '+line+' <span style="color:var(--mut);font-size:12px">'+st+'</span>';
    if(pr[0].isMe||pr[1].isMe){
      var uW=pr[0].isMe?ctx.seriesHW:ctx.seriesAW;
      var oW=pr[0].isMe?ctx.seriesAW:ctx.seriesHW;
      var oppNm=pr[0].isMe?pr[1].team.n:pr[0].team.n;
      html+='<div style="margin-top:8px;padding:6px 8px;background:rgba(232,200,92,.08);border:1px solid rgba(232,200,92,.25);font-size:13px;color:var(--wht)">'+
        '<span style="color:var(--gold)">SERIES TRACKER</span> · '+escHtml(G.team.n)+' <b style="color:var(--gold)">'+uW+'</b> — <b style="color:var(--gold)">'+oW+'</b> '+escHtml(oppNm)+
        (boN<=1?'':' · first to <b>'+boN+'</b> wins')+'</div>';
    } else if(done&&ctx._roundMatchups&&ctx._roundMatchups[p]){
      html+='<div style="margin-top:4px;font-size:12px;color:var(--mut)">'+escHtml(ctx._roundMatchups[p])+'</div>';
    }
    html+='</div>';
  }
  if(ctx.cjlUsndtChallenge&&ctx.challengeGameLog&&ctx.challengeGameLog.length){
    html+='<div style="font-size:11px;color:var(--mut);margin:8px 0 4px">COMPLETED GAMES</div>';
    var cg;
    for(cg=0;cg<ctx.challengeGameLog.length;cg++){
      html+='<div style="padding:4px 6px;font-size:12px;color:var(--wht);border-left:3px solid var(--acc);margin-bottom:4px">'+escHtml(ctx.challengeGameLog[cg])+'</div>';
    }
  }
  html+='</div>';
  ensurePlayoffUserSeriesReady(ctx);
  var prCur=(ctx.pairIndex<ctx.pairs.length)?ctx.pairs[ctx.pairIndex]:null;
  var userTurn=prCur&&(prCur[0].isMe||prCur[1].isMe)&&!ctx.eliminated;
  var boN=typeof getPlayoffSeriesWinsNeeded==='function'?getPlayoffSeriesWinsNeeded():4;
  var seriesLive=userTurn&&(ctx.seriesHW<boN&&ctx.seriesAW<boN);
  var mcBye=ctx.memorialCup&&ctx.mcPhase==='semifinal'&&ctx.mcSeed1&&ctx.mcSeed1.isMe&&!userTurn&&!ctx.eliminated;
  if(mcBye){
    html+='<div class="vt" style="font-size:13px;color:var(--gold);margin-bottom:8px;border-left:3px solid var(--gold);padding-left:8px">Round-robin <b>#1 seed</b> — semifinal bye. Use <b>SIM ROUND</b> to resolve the other semifinal, then play the championship.</div>';
  }
  if(userTurn&&seriesLive){
    html+='<button type="button" class="btn bp bw" style="margin-right:8px;margin-bottom:8px" onclick="startPlayoffPregameFromHub()">PLAY GAME</button>';
    html+='<button type="button" class="btn bs bw" style="margin-right:8px;margin-bottom:8px" onclick="simMyPlayoffSeriesFromHub()">SIM MY SERIES</button>';
  }
  html+='<button type="button" class="btn bs bw" style="margin-right:8px;margin-bottom:8px" onclick="simPlayoffRoundHubStep()">SIM ROUND</button>';
  if(ctx.memorialCup){
    html+='<button type="button" class="btn bs bw" style="margin-right:8px;margin-bottom:8px" onclick="simAllRemainingMemorialCupCpu()">SIM REST OF TOURNAMENT</button>';
  }
  if(typeof isLocalLeague==='function'&&isLocalLeague(G.leagueKey)){
    html+='<button type="button" class="btn bg bw" style="margin-right:8px;margin-bottom:8px" onclick="skipLocalShowcaseToOffseason()">FINISH SHOWCASE — OFFSEASON</button>';
  }
  el.innerHTML=html;
}

function startPlayoffPregameFromHub(){
  var hub=document.getElementById('s-hub');
  if(!hub||!hub.classList.contains('on')) return;
  var pre=document.getElementById('s-pregame');
  if(pre&&pre.classList.contains('on')) return;
  var ing=document.getElementById('s-ingame');
  if(ing&&ing.classList.contains('on')) return;
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.active||ctx.eliminated) return;
  ensurePlayoffUserSeriesReady(ctx);
  var boN=typeof getPlayoffSeriesWinsNeeded==='function'?getPlayoffSeriesWinsNeeded():4;
  var pr=ctx.pairs[ctx.pairIndex];
  if(!pr||(!pr[0].isMe&&!pr[1].isMe)) return;
  if(ctx.seriesHW>=boN||ctx.seriesAW>=boN) return;
  var opp=pr[0].isMe?pr[1]:pr[0];
  ctx.playoffOpponent={n:opp.team.n,e:opp.team.e||'[-]'};
  ctx.awaitingUserGame=true;
  G._isPlayoffGame=true;
  preGame(-1);
}

function tryCompletePlayoffRoundFromHub(){
  var ctx=G._playoffCtx;
  if(ctx&&ctx.memorialCup&&ctx.mcPhase==='roundrobin'&&typeof memorialCupOnRoundComplete==='function'){
    if(memorialCupOnRoundComplete()) return true;
  }
  if(ctx&&ctx.memorialCup&&(ctx.mcPhase==='semifinal'||ctx.mcPhase==='final')){
    if(ctx.pairIndex<ctx.pairs.length) return false;
    ctx.summary.rounds.push({name:ctx.roundName,matchups:ctx._roundMatchups.slice()});
    if(ctx.mcPhase==='semifinal'&&typeof advanceMemorialCupToChampionship==='function'){
      advanceMemorialCupToChampionship(ctx.winnersThisRound[0]);
      return true;
    }
    if(ctx.current.length<=1){
      finishPlayablePlayoffs();
      return true;
    }
  }
  if(ctx&&ctx.cjlUsndtChallenge) return false;
  if(!ctx||ctx.pairIndex<ctx.pairs.length) return false;
  ctx.summary.rounds.push({name:ctx.roundName,matchups:ctx._roundMatchups.slice()});
  ctx.current=ctx.winnersThisRound.slice();
  if(ctx.current.length<=1){
    finishPlayablePlayoffs();
    return true;
  }
  startPlayoffRoundPlayable();
  return true;
}

/** Fast-sim the full best-of-7 at the current pairing (hub). */
function resolveCurrentPlayoffUserSeriesSim(ctx){
  var pr=ctx.pairs[ctx.pairIndex];
  if(!pr||(!pr[0].isMe&&!pr[1].isMe)) return;
  var home=pr[0], away=pr[1];
  if(ctx.cjlUsndtChallenge&&typeof cjlUsndtAfterPlayableGame==='function'){
    var homeTeamWon=playoffSingleGameHomeWins(home,away);
    addPlayoffSimGameToMyStats();
    var userWon=(home.isMe&&homeTeamWon)||(away.isMe&&!homeTeamWon);
    cjlUsndtAfterPlayableGame(userWon, homeTeamWon);
    return;
  }
  if(ctx.memorialCup&&ctx.mcPhase!=='roundrobin'){
    if(playoffSingleGameHomeWins(home,away)) ctx.seriesHW++; else ctx.seriesAW++;
    addPlayoffSimGameToMyStats();
    var mcWin=ctx.seriesHW>ctx.seriesAW;
    var mcWinner=mcWin?home:away;
    var userRowMc=home.isMe?home:away;
    var oppRowMc=home.isMe?away:home;
    if(mcWinner.isMe){
      ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+userRowMc.team.n+' (YOU, SIM)');
      ctx.winnersThisRound.push(userRowMc);
      ctx.roundReached=ctx.roundName;
    } else {
      ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+oppRowMc.team.n+' (SIM)');
      ctx.winnersThisRound.push(oppRowMc);
      ctx.eliminated=true;
      ctx.roundReached=ctx.roundName;
      ctx.pairIndex++;
      onPlayoffEliminated();
      return;
    }
    ctx.pairIndex++;
    ctx.seriesHW=0;
    ctx.seriesAW=0;
    ctx.awaitingUserGame=false;
    G._isPlayoffGame=false;
    if(ctx.pairIndex>=ctx.pairs.length){
      ctx.summary.rounds.push({name:ctx.roundName,matchups:ctx._roundMatchups.slice()});
      if(ctx.mcPhase==='semifinal'&&typeof advanceMemorialCupToChampionship==='function'){
        advanceMemorialCupToChampionship(mcWinner);
      } else {
        ctx.current=[mcWinner];
        finishPlayablePlayoffs();
      }
    }
    return;
  }
  if(ctx.memorialCup&&ctx.mcPhase==='roundrobin'&&typeof memorialCupRecordRrGameFromSeries==='function'){
    if(playoffSingleGameHomeWins(home,away)) ctx.seriesHW++; else ctx.seriesAW++;
    addPlayoffSimGameToMyStats();
    memorialCupRecordRrGameFromSeries(home, away);
    ctx.pairIndex++;
    ctx.seriesHW=0;
    ctx.seriesAW=0;
    ctx.awaitingUserGame=false;
    G._isPlayoffGame=false;
    if(ctx.pairIndex>=ctx.pairs.length&&typeof memorialCupOnRoundComplete==='function') memorialCupOnRoundComplete();
    return;
  }
  var userRow=home.isMe?home:away;
  var oppRow=home.isMe?away:home;
  while(ctx.seriesHW<getPlayoffSeriesWinsNeeded() && ctx.seriesAW<getPlayoffSeriesWinsNeeded()){
    if(playoffSingleGameHomeWins(home,away)) ctx.seriesHW++;
    else ctx.seriesAW++;
    addPlayoffSimGameToMyStats();
  }
  var serWinner=ctx.seriesHW>ctx.seriesAW?home:away;
  var sh=ctx.seriesHW, sa=ctx.seriesAW;
  if(serWinner.isMe){
    ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+userRow.team.n+' (YOU, SIM) ('+sh+'-'+sa+')');
    addNews('YOU WIN '+ctx.roundName+' series '+sh+'-'+sa+' vs '+oppRow.team.n+' (simmed).','good');
    ctx.winnersThisRound.push(userRow);
    ctx.roundReached=ctx.roundName;
  } else {
    ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+oppRow.team.n+' ('+sh+'-'+sa+')');
    addNews('YOU LOSE '+ctx.roundName+' series '+sa+'-'+sh+' vs '+oppRow.team.n+' (simmed).','bad');
    ctx.winnersThisRound.push(oppRow);
    ctx.eliminated=true;
    ctx.roundReached=ctx.roundName;
    ctx.pairIndex++;
    onPlayoffEliminated();
    return;
  }
  ctx.seriesHW=0;
  ctx.seriesAW=0;
  ctx.pairIndex++;
  ctx.awaitingUserGame=false;
  G._isPlayoffGame=false;
}

/** includeUserSeries: when false and you are still alive, stop before your matchup so you can play or use SIM MY SERIES. When true (eliminated path), sim every series including yours. */
function simPlayoffCpuMatchupsInRound(includeUserSeries){
  includeUserSeries=!!includeUserSeries;
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.active) return;
  while(ctx.pairIndex<ctx.pairs.length){
    var pr=ctx.pairs[ctx.pairIndex];
    var home=pr[0], away=pr[1];
    if(home.isMe||away.isMe){
      if(!includeUserSeries){
        resetMemorialCupPairSeriesCounters(ctx);
        break;
      }
      resolveCurrentPlayoffUserSeriesSim(ctx);
      continue;
    }
    var ser=simPlayoffSeriesWinner(home,away);
    if(ctx.memorialCup&&ctx.mcPhase==='roundrobin'&&typeof memorialCupRecordRrGameFromSeries==='function'){
      ctx.seriesHW=ser.homeWins;
      ctx.seriesAW=ser.awayWins;
      memorialCupRecordRrGameFromSeries(home, away);
      addNews(ctx.roundName+': '+home.team.n+' vs '+away.team.n+' -> '+ser.winner.team.n+' ('+ser.homeWins+'-'+ser.awayWins+')','neutral');
      ctx.pairIndex++;
      resetMemorialCupPairSeriesCounters(ctx);
    } else {
      ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+ser.winner.team.n+' ('+ser.homeWins+'-'+ser.awayWins+')');
      addNews(ctx.roundName+': '+home.team.n+' vs '+away.team.n+' -> '+ser.winner.team.n+' ('+ser.homeWins+'-'+ser.awayWins+')','neutral');
      ctx.winnersThisRound.push(ser.winner);
      ctx.pairIndex++;
    }
  }
  tryCompletePlayoffRoundFromHub();
}

function simMyPlayoffSeriesFromHub(){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.active||ctx.eliminated) return;
  var pr=ctx.pairs[ctx.pairIndex];
  if(!pr||(!pr[0].isMe&&!pr[1].isMe)) return;
  ensurePlayoffUserSeriesReady(ctx);
  var boN=typeof getPlayoffSeriesWinsNeeded==='function'?getPlayoffSeriesWinsNeeded():4;
  if(ctx.seriesHW>=boN||ctx.seriesAW>=boN) return;
  resolveCurrentPlayoffUserSeriesSim(ctx);
  if(ctx.pairIndex>=ctx.pairs.length) tryCompletePlayoffRoundFromHub();
  if(G._playoffCtx&&G._playoffCtx.eliminated) onPlayoffEliminated();
  if(G._playoffCtx&&G._playoffCtx.active){ try{renderHub();}catch(eMy){} }
}

function simAllRemainingMemorialCupCpu(){
  if(typeof fastSimRemainingPlayoffBracket==='function') fastSimRemainingPlayoffBracket();
  if(G._playoffCtx&&G._playoffCtx.active){ try{renderHub();}catch(eMcAll){} }
}

/** Keep simming rounds while eliminated until a champion ends the playoffs. */
function flushEliminatedPlayoffsCpu(){
  var g=0;
  while(G._playoffCtx&&G._playoffCtx.eliminated&&G._playoffCtx.active&&g++<200){
    simPlayoffCpuMatchupsInRound(true);
  }
}

/** Sim CPU series this round (stops before your series if you are still in). If eliminated, finishes the whole bracket. */
function simPlayoffRoundHubStep(){
  var ctx=G._playoffCtx;
  simPlayoffCpuMatchupsInRound(!!(ctx&&ctx.eliminated));
  if(G._playoffCtx&&G._playoffCtx.eliminated) onPlayoffEliminated();
  if(G._playoffCtx&&G._playoffCtx.active){
    try{renderHub();}catch(eR0){}
  }
}

/** After elimination — sim every remaining series until a champion is crowned. */
function simAllRemainingPlayoffRoundsCpu(){
  flushEliminatedPlayoffsCpu();
  if(G._playoffCtx&&G._playoffCtx.active){
    try{renderHub();}catch(eR){}
  }
}

function renderWeekGames(){
  var el=safeEl('week-games');
  var perWeek=getGamesPerWeek(G.leagueKey);
  var totalWks=typeof getSeasonWeekCount==='function'?getSeasonWeekCount(G.leagueKey):Math.ceil((G.league.games||68)/perWeek);
  if(G._inOffseason){
    el.innerHTML='<div class="vt" style="font-size:16px;color:var(--gold)">OFFSEASON</div><div class="vt" style="font-size:14px;color:var(--mut);margin:8px 0">Season complete — finish contract talks and camp prep on the offseason screen.</div><button class="btn bp bw" onclick="typeof showOffseasonScreen===\'function\'?showOffseasonScreen():show(\'s-offseason\')">OFFSEASON SCREEN &gt;</button>';
    return;
  }
  if(G._playoffCtx&&G._playoffCtx.active){
    renderPlayoffHubPanel();
    return;
  }
  if(typeof isRegularSeasonComplete==='function'&&isRegularSeasonComplete()){
    if(typeof endRegSeason==='function'){
      endRegSeason();
      return;
    }
    el.innerHTML='<div class="vt" style="font-size:16px;color:var(--gold)">REGULAR SEASON COMPLETE!</div><button class="btn bp bw" onclick="endRegSeason()">PLAYOFFS / OFFSEASON &gt;</button>';
    return;
  }
  var weekStart=(G.week-1)*perWeek;
  var gMask=(G.pos==='G'&&!G.isInjured)?ensureGoalieStartMask():null;
  var html='';
  for(var i=0;i<perWeek;i++){
    var opp=G.allOpponents[weekStart+i];
    if(!opp) continue;
    var played=i<G.weekGames;
    var isEvent=(typeof isLocalScheduleEvent==='function'&&isLocalScheduleEvent(opp))||(typeof isUsndtExhibitionEvent==='function'&&isUsndtExhibitionEvent(opp));
    var injBlock=!isEvent&&G.isInjured&&G.league.tier!=='minor';
    var scratchBlock=!isEvent&&typeof isUserHealthyScratch==='function'&&isUserHealthyScratch();
    var youStart=!gMask||gMask[i];
    var bname=(G._goalieBackupNamesForWeek&&G._goalieBackupNamesForWeek[i])?G._goalieBackupNamesForWeek[i]:'BACKUP';
    html+='<div style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--rl);margin-bottom:6px;background:var(--rink)">';
    html+='<div class="vt" style="font-size:14px;color:var(--mut);width:72px">'+(isEvent?'EVENT':'GAME')+' '+(i+1)+'</div>';
    if(isEvent){
      html+='<div class="vt" style="font-size:15px;flex:1"><span style="color:var(--gold)">'+escHtml(opp.label||opp.n)+'</span>';
      if(opp.desc) html+='<span class="vt" style="font-size:12px;color:var(--mut);display:block;margin-top:4px">'+escHtml(opp.desc)+'</span>';
      if(G.isInjured) html+='<span class="vt" style="font-size:12px;color:var(--acc);display:block;margin-top:4px">Light participation — no game contact</span>';
      html+='</div>';
    } else {
    var oppLbl=typeof getTeamDisplayName==='function'?getTeamDisplayName(opp.n,G.leagueKey,{}):opp.n;
    html+='<div class="vt" style="font-size:15px;flex:1">'+teamLogoChip(G.team.n,20,G.leagueKey)+' '+myTeamLbl+' <span style="color:var(--mut)">VS</span> '+teamLogoChip(opp.n,20,G.leagueKey)+' '+oppLbl;
    if(G.pos==='G'&&!injBlock) html+='<span class="vt" style="font-size:12px;color:var(--mut);display:block;margin-top:4px">'+(youStart?'YOU START':'BENCH -- '+bname+' starts')+'</span>';
    if(scratchBlock) html+='<span class="vt" style="font-size:12px;color:var(--gold);display:block;margin-top:4px">HEALTHY SCRATCH — press box</span>';
    if(G._callUpCtx&&G._callUpCtx.active) html+='<span class="vt" style="font-size:12px;color:var(--gold);display:block;margin-top:4px">PRO CALL-UP ('+G._callUpCtx.gamesLeft+' left)</span>';
    html+='</div>';
    }
    if(played){
      html+='<span class="badge green">'+(isEvent?'DONE':'PLAYED')+'</span>';
    } else if(isEvent){
      var exFn=typeof isUsndtExhibitionEvent==='function'&&isUsndtExhibitionEvent(opp)?'runUsndtExhibition('+i+')':'runLocalScheduleEvent('+i+')';
      html+='<button class="btn bg" style="font-size:13px;padding:5px 12px" onclick="'+exFn+'">JOIN</button>';
      html+='<button class="btn bs" style="font-size:13px;padding:5px 10px;margin-left:4px" onclick="'+(typeof isUsndtExhibitionEvent==='function'&&isUsndtExhibitionEvent(opp)?'simUsndtExhibition('+i+')':'simLocalScheduleEvent('+i+')')+'">SIM</button>';
    } else if(scratchBlock){
      html+='<button class="btn bs" style="font-size:13px;padding:5px 12px" onclick="simScratchedGame('+i+')">SIM (SCRATCH)</button>';
    } else if(injBlock){
      html+='<button class="btn bd" style="font-size:13px;padding:4px 10px" onclick="simInjuredGame('+i+')">SIM INJ</button>';
    } else if(G.pos==='G'&&!youStart){
      html+='<button class="btn bs" style="font-size:13px;padding:5px 12px" onclick="simBackupGoalieGame('+i+')">SIM (BACKUP)</button>';
    } else {
      html+='<button class="btn bp" style="font-size:14px;padding:5px 12px" onclick="preGame('+i+')">PLAY</button>';
    }
    html+='</div>';
  }
  var allPlayed=G.weekGames>=perWeek;
  if(!allPlayed) html+='<button class="btn bg2 bw" style="pointer-events: auto;" onclick="window.simWeek()">SIM WEEK &gt;</button>';
  if(allPlayed) html+='<button class="btn bg2 bw" onclick="nextWeek()">END WEEK -- TRAIN &amp; CONTINUE &gt;</button>';
  el.innerHTML=html;
}

function renderNewsFeed(){
  var el=safeEl('news-feed');
  if(!G.news.length){el.innerHTML='<div class="vt" style="font-size:14px;color:var(--mut);padding:8px">NO NEWS YET.</div>';return;}
  var html='';
  var items=G.news.slice(0,25);
  for(var i=0;i<items.length;i++){
    var n=items[i];
    html+='<div class="ni '+n.type+'"><div class="nidate">WK '+n.week+'</div>'+n.txt+'</div>';
  }
  el.innerHTML=html;
}

function hubTab(tab){
  G.activeTab=tab;
  var tabs=['season','attrs','contract','standings','depth','team','leaders','career','awards','social'];
  for(var i=0;i<tabs.length;i++){
    var el=safeEl('tab-'+tabs[i]);
    if(el) el.style.display=tabs[i]===tab?'block':'none';
  }
  var tabBtns=document.querySelectorAll('.tab');
  for(var i=0;i<tabBtns.length;i++) tabBtns[i].classList.toggle('on',tabs[i]===tab);
  if(tab==='attrs') renderAttrTab();
  if(tab==='standings') renderStandingsTab();
  if(tab==='depth') renderDepthChartTab();
  if(tab==='team') renderTeamRelationsTab();
  if(tab==='leaders'){ renderLeadersControls(); renderLeagueLeadersTab(); }
  if(tab==='career') renderCareerTab();
  if(tab==='awards') renderAwardsTab();
  if(tab==='contract') renderContractTab();
  if(tab==='social') renderSocialTab();
}

function renderAttrTab(){
  var html='';
  var potK=G.potential&&POTENTIALS[G.potential]?G.potential:'support';
  html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-bottom:10px;line-height:1.45">'+
    '<span style="color:var(--acc)">Projection:</span> '+potentialTierWord(potK)+' — '+POTENTIALS[potK].desc+'</div>';
  html+='<div class="vt" style="font-size:12px;color:var(--mut);margin-bottom:10px;line-height:1.45">Ratings are grouped by category. <b>Hockey IQ</b> covers offensive/defensive reads and <b>agitation</b> (edge, pest, goon). <b>Defense</b> is gap, stick, and slot work. Physical condition is below.</div>';
  if(G.pos==='F'||G.pos==='D'){
    var spare=G.secondarySubPos?String(G.secondarySubPos):'';
    html+='<div class="vt" style="font-size:11px;color:var(--acc);margin-bottom:6px">LISTED: <b>'+String(G.subPos||'—')+'</b> &nbsp;·&nbsp; COMFORT SPARE: <b>'+(spare||'none')+'</b></div>';
    html+='<div class="vt" style="font-size:11px;color:var(--mut);margin-bottom:6px">Roster card spot</div>';
    html+='<div class="g2" style="margin-bottom:10px;gap:6px;flex-wrap:wrap">';
    if(G.pos==='F'){
      html+='<button type="button" class="btn '+(G.subPos==='C'?'bp':'bs')+'" onclick="hubChangeListedSubPos(\'C\')">C</button>';
      html+='<button type="button" class="btn '+(G.subPos==='LW'?'bp':'bs')+'" onclick="hubChangeListedSubPos(\'LW\')">LW</button>';
      html+='<button type="button" class="btn '+(G.subPos==='RW'?'bp':'bs')+'" onclick="hubChangeListedSubPos(\'RW\')">RW</button>';
    } else {
      html+='<button type="button" class="btn '+(G.subPos==='LD'?'bp':'bs')+'" onclick="hubChangeListedSubPos(\'LD\')">LD</button>';
      html+='<button type="button" class="btn '+(G.subPos==='RD'?'bp':'bs')+'" onclick="hubChangeListedSubPos(\'RD\')">RD</button>';
    }
    html+='</div>';
    html+='<div class="g2" style="margin-bottom:12px;gap:8px">'+
      '<button type="button" class="btn bs bw" onclick="hubTrainSkill()">EXTRA TRAINING</button>'+
      '<button type="button" class="btn bs bw" onclick="hubSwitchSkaterPos()">SWITCH F / D</button></div>';
  }
  function attrRow(k,v){
    var color=ATTR_COLORS[k]||'var(--mut)';
    var lbl=ATTR_LABELS[k]||k;
    var cmin=typeof G._attrClampMin==='number'?G._attrClampMin:40;
    var barW=typeof statBarPct==='function'?statBarPct(v,cmin,99):Math.round(v);
    return '<div class="srow"><div class="slbl">'+lbl+'</div><div class="sbar"><div class="sfill" style="'+(barW>0?'min-width:1px;':'')+'background:'+color+';width:'+barW+'%"></div></div><div class="sval">'+Math.round(v)+'</div></div>';
  }
  function catHeader(cd, catOvr){
    return '<div class="vt" style="font-size:12px;color:'+(cd.color||'var(--gold)')+';margin:10px 0 4px">'+cd.label+' <span style="color:var(--mut);font-size:11px">· '+catOvr+'</span></div>';
  }
  if(G.pos==='G'){
    var gk=ATTRS.G||[];
    for(var gi=0;gi<gk.length;gi++) html+=attrRow(gk[gi],G.attrs[gk[gi]]||0);
  } else if(typeof SKATER_ATTR_CATEGORIES!=='undefined'){
    var ck, cd, ci, subKey, catOvr;
    for(ck in SKATER_ATTR_CATEGORIES){
      if(!SKATER_ATTR_CATEGORIES.hasOwnProperty(ck)) continue;
      cd=SKATER_ATTR_CATEGORIES[ck];
      catOvr=typeof getCategoryAverage==='function'?getCategoryAverage(G.attrs,cd):55;
      html+=catHeader(cd, catOvr);
      for(ci=0;ci<cd.keys.length;ci++){
        subKey=cd.keys[ci];
        html+=attrRow(subKey, G.attrs[subKey]||0);
      }
    }
    html+='<div class="vt" style="font-size:12px;color:var(--acc);margin:10px 0 4px">BASE</div>';
    html+=attrRow('durability', G.attrs.durability||0);
    if((G.careerInjuryCount||0)>0){
      html+='<div class="vt" style="font-size:11px;color:var(--mut);margin-top:6px">Injury log: '+G.careerInjuryCount+' career · '+(G.seasonInjuryCount||0)+' this season</div>';
    }
  } else {
    html+='<div class="vt" style="font-size:12px;color:var(--gold);margin:4px 0">RATING (OVR)</div>';
    var rk=typeof SKATER_RATING_ATTR_KEYS!=='undefined'?SKATER_RATING_ATTR_KEYS:[];
    for(var ri=0;ri<rk.length;ri++) html+=attrRow(rk[ri],G.attrs[rk[ri]]||0);
    html+='<div class="vt" style="font-size:12px;color:var(--acc);margin:10px 0 4px">BASE</div>';
    var bk=typeof SKATER_BASE_ATTR_KEYS!=='undefined'?SKATER_BASE_ATTR_KEYS:[];
    for(var bi=0;bi<bk.length;bi++) html+=attrRow(bk[bi],G.attrs[bk[bi]]||0);
  }
  html+='<div class="vt" style="font-size:12px;color:var(--mut);margin-top:10px">PHYSICAL CONDITION</div>';
  safeEl('hub-attr-bars').innerHTML=html;
  var barPct=typeof statBarPct==='function'?statBarPct:function(v){return Math.min(100,Math.max(0,Math.round(v)));};
  safeEl('b-health').style.width=barPct(G.health,0,100)+'%';safeEl('v-health').textContent=Math.round(G.health);
  safeEl('b-stam').style.width=barPct(G.stamina,0,100)+'%';safeEl('v-stam').textContent=Math.round(G.stamina);
  safeEl('b-morale').style.width=barPct(G.morale,0,100)+'%';safeEl('v-morale').textContent=Math.round(G.morale);
}

function hubTrainSkill(){
  if(!G||G.pos==='G'){ notify('Extra training is for skaters.','gold'); return; }
  if((G._hubTrainWeek|0)==(G.week|0)){ notify('Already logged extra work this week.','gold'); return; }
  if((G.stamina|0)<18){ notify('Need more stamina (18+) before another heavy session.','red'); return; }
  G.stamina=cl(G.stamina-15,0,100);
  var cap=getAttrCapForAge(G.age||16);
  var amin=G._attrClampMin||40;
  var gain=rd(0.8,1.55)*getPotentialDevMult(G.potential||'support');
  var pick, lbl;
  if(typeof SKATER_ATTR_CATEGORIES!=='undefined'){
    var catList=[], ck;
    for(ck in SKATER_ATTR_CATEGORIES){ if(SKATER_ATTR_CATEGORIES.hasOwnProperty(ck)) catList.push(ck); }
    var catKey=catList[ri(0,catList.length-1)];
    var cd=SKATER_ATTR_CATEGORIES[catKey];
    pick=cd.keys[ri(0,cd.keys.length-1)];
    lbl=ATTR_LABELS[pick]||pick;
    G.attrs[pick]=cl(Math.round((G.attrs[pick]||55)+gain),amin,cap);
    if(typeof syncLegacySkaterAttrsFromCategories==='function') syncLegacySkaterAttrsFromCategories(G.attrs);
  } else if(typeof SKATER_RATING_ATTR_KEYS!=='undefined'&&SKATER_RATING_ATTR_KEYS.length){
    var trainPool=SKATER_RATING_ATTR_KEYS.filter(function(k){return k!=='conditioning';});
    pick=trainPool[ri(0,trainPool.length-1)];
    lbl=ATTR_LABELS[pick]||pick;
    G.attrs[pick]=cl(Math.round((G.attrs[pick]||55)+gain),amin,cap);
  } else return;
  G._hubTrainWeek=G.week;
  addNews('EXTRA TRAINING: '+String(lbl).toUpperCase()+' +'+Math.round(gain*10)/10+'.','good');
  renderHub(); hubTab('attrs');
}

function hubChangeListedSubPos(target){
  if(!G||G.pos==='G') return;
  var t=String(target||'');
  if(G.pos==='F'){
    if(t!=='C'&&t!=='LW'&&t!=='RW') return;
  } else if(G.pos==='D'){
    if(t!=='LD'&&t!=='RD') return;
  } else return;
  if(t===G.subPos){ notify('Already listed at '+t+'.','gold'); return; }
  if(G.secondarySubPos&&t===G.secondarySubPos){
    var old=G.subPos;
    G.subPos=t;
    G.secondarySubPos=old;
    G.morale=cl(G.morale-1,0,100);
    addNews('LISTING: Slide to comfort spare ('+t+') — coaches already knew you could play there.','neutral');
    renderHub(); hubTab('attrs');
    return;
  }
  if((G._hubSubPosHardWeek|0)===(G.week|0)){
    notify('Staff only wants one big position experiment per week. Use your comfort spare or wait.','gold');
    return;
  }
  if((G.stamina|0)<12){
    notify('Too tired to sell coaches on a new spot this week.','red');
    return;
  }
  G._hubSubPosHardWeek=G.week;
  G.stamina=cl(G.stamina-8,0,100);
  G.morale=cl(G.morale-9,0,100);
  G.subPos=t;
  delete G.secondarySubPos;
  try{ if(typeof ensureSecondarySubPos==='function') ensureSecondarySubPos(G); }catch(eSub){}
  addNews('LISTING: Roster card now '+t+' -- extra video and reps to win trust.','neutral');
  renderHub(); hubTab('attrs');
}

function hubSwitchSkaterPos(){
  if(!G||G.pos==='G') return;
  delete G.secondarySubPos;
  if(G.pos==='F'){
    G.pos='D';
    if(!ARCHETYPES.D[G.arch]) G.arch='TwoWayD';
    G.subPos=Math.random()<0.5?'LD':'RD';
  } else {
    G.pos='F';
    if(!ARCHETYPES.F[G.arch]) G.arch='TwoWay';
    G.subPos='C';
  }
  try{ if(typeof ensureUnifiedSkaterAttrs==='function') ensureUnifiedSkaterAttrs(G); }catch(eSw){}
  G.morale=cl(G.morale-4,0,100);
  addNews('LISTED POSITION: Now '+G.pos+' ('+G.subPos+') on the roster card.','neutral');
  renderHub(); hubTab('attrs');
}

function renderStandingsTab(){
  refreshStandings(G.leagueKey);
  var el=safeEl('hub-standings');
  var lk=G.leagueKey;
  var st=G.standings.slice().sort(function(a,b){return b.pts-a.pts;});
  var layout=getStandingsLayoutForLeague(lk);
  var html='<div class="hub-standings-wrap">';
  if(lk==='USJL'&&G.team&&typeof isUsndtTeam==='function'&&isUsndtTeam(G.team.n)){
    var u17g=typeof USNDT_U17_LEAGUE_GAMES!=='undefined'?USNDT_U17_LEAGUE_GAMES:36;
    var u18g=typeof USNDT_U18_LEAGUE_GAMES!=='undefined'?USNDT_U18_LEAGUE_GAMES:26;
    var orgg=typeof USNDT_ORG_USJL_GAMES!=='undefined'?USNDT_ORG_USJL_GAMES:62;
    var onU17=typeof isUsndtU17Team==='function'&&isUsndtU17Team(G.team.n);
    html+='<div class="vt" style="font-size:13px;color:var(--acc);margin-bottom:10px;border-left:3px solid var(--acc);padding-left:8px">';
    html+='<b>USNDT</b> — stacked USA stars; one org in USJL standings (<b>'+orgg+'</b> league games: U17 age 16 ~'+u17g+', U18 age 17+ ~'+u18g+'). ';
    html+=onU17?'Your <b>U17 squad</b> (age 16): USJL games + international tournaments.':'Your <b>U18 squad</b> (age 17+): USJL games + college exhibitions & CJL showcase (spring Challenge after season).';
    html+='</div>';
    html+='<div style="font-size:13px;margin-bottom:10px">Your USJL record: <b>'+(G.gp||0)+' GP</b> · <b>'+(G.w||0)+'W-'+(G.l||0)+'L-'+(G.otl||0)+'OTL</b></div>';
  } else if(lk==='USJL'&&G.team&&typeof isUsndtTeam==='function'&&!isUsndtTeam(G.team.n)){
    html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-bottom:10px;border-left:3px solid var(--mut);padding-left:8px">';
    html+='Most top Americans are on <b>USNDT</b> — a stacked national program that usually tops USJL standings (~'+((typeof USNDT_ORG_USJL_GAMES!=='undefined')?USNDT_ORG_USJL_GAMES:62)+' league games). Club rosters are mostly North American — stars concentrate on USNDT. ';
    if(typeof isUsaNationalTeamEligible==='function'&&isUsaNationalTeamEligible(G.nat)){
      html+='<b>World Juniors:</b> Team USA U20 picks the best Americans under 20 who are not on a full-time '+getProLeagueKeyByGender(G.gender)+' roster — <b>USNDT U18</b> gets priority, but strong club USJL players can still make the team.';
    }
    html+='</div>';
  }
  if(typeof getAcademyHubBlurb==='function'){
    var acBlurb=getAcademyHubBlurb();
    if(acBlurb) html+=acBlurb;
  }
  if(!layout){
    html+=standingsMiniTable(st);
    html+='</div>';
    el.innerHTML=html;
    return;
  }
  if(layout.mode==='divisions'){
    var di;
    for(di=0;di<layout.divisions.length;di++){
      var div=layout.divisions[di];
      html+='<div class="standings-div-head">'+div.name+'</div>';
      html+=standingsMiniTable(filterStandingsByTeamNames(st, div.teams));
    }
  } else if(layout.mode==='nested'){
    var ci, dj;
    for(ci=0;ci<layout.conferences.length;ci++){
      var conf=layout.conferences[ci];
      html+='<div class="standings-conf-head">'+conf.name+'</div>';
      for(dj=0;dj<conf.divisions.length;dj++){
        var div2=conf.divisions[dj];
        html+='<div class="standings-div-head">'+div2.name+'</div>';
        html+=standingsMiniTable(filterStandingsByTeamNames(st, div2.teams));
      }
    }
    html+='<div class="standings-overall-note">LEAGUE OVERALL</div>';
    html+=standingsMiniTable(st);
  }
  html+='</div>';
  el.innerHTML=html;
}

/** Remove duplicate season-log rows (same year/league/team/stats) from older saves or rare double-calls */
function dedupeSeasonLogEntries(log){
  if(!log||!log.length) return [];
  var seen={}, out=[];
  for(var i=0;i<log.length;i++){
    var e=log[i];
    var k=(e.year|0)+'|'+(e.league||'')+'|'+(e.team||'')+'|'+(e.gp|0)+'|'+(e.ovrVal|0)+'|'+(e.isGoalie?1:0)+'|'+(e.g|0)+'|'+(e.a|0)+'|'+(e.sv|0)+'|'+(e.ga|0);
    if(seen[k]) continue;
    seen[k]=true;
    out.push(e);
  }
  return out;
}

function renderCareerTab(){
  if(G.seasonLog&&G.seasonLog.length){
    var fixed=dedupeSeasonLogEntries(G.seasonLog);
    if(fixed.length<G.seasonLog.length) G.seasonLog=fixed;
  }
  if(typeof G._seasonEndLoggedForSeason!=='number') G._seasonEndLoggedForSeason=0;
  var cp=G.cGoals+G.cAssists;
  var cGrid=
    '<div class="stbox"><div class="stlbl">SEASONS</div><div class="stval">'+(G.season-1)+'</div></div>'+
    '<div class="stbox"><div class="stlbl">GP</div><div class="stval">'+G.cGP+'</div></div>'+
    (G.pos==='G'
      ? '<div class="stbox"><div class="stlbl">SV</div><div class="stval" style="color:var(--green)">'+G.cSaves+'</div></div>'+
        '<div class="stbox"><div class="stlbl">GA</div><div class="stval" style="color:var(--red)">'+(G.cGoalsAgainst||0)+'</div></div>'+
        '<div class="stbox"><div class="stlbl">SV%</div><div class="stval" style="color:var(--gold)">'+formatSvPctFromCounts(G.cSaves,G.cGoalsAgainst||0)+'</div></div>'+
        '<div class="stbox"><div class="stlbl">GAA</div><div class="stval">'+(G.cGP>0?Math.round(((G.cGoalsAgainst||0)/G.cGP)*100)/100:'--')+'</div></div>'
      : '<div class="stbox"><div class="stlbl">G</div><div class="stval" style="color:var(--red)">'+G.cGoals+'</div></div>'+
        '<div class="stbox"><div class="stlbl">A</div><div class="stval" style="color:var(--acc)">'+G.cAssists+'</div></div>'+
        '<div class="stbox"><div class="stlbl">PTS</div><div class="stval" style="color:var(--gold)">'+cp+'</div></div>'+
        '<div class="stbox"><div class="stlbl">OVR</div><div class="stval">'+ovr(G.attrs,G.pos)+'</div></div>');
  var og=getCareerOverallGradeDisplay();
  cGrid+='<div class="stbox" style="grid-column:1/-1;padding:10px 8px">'+
    '<div class="stlbl">OVERALL PERFORMANCE</div>'+
    '<div class="stval" style="color:'+og.color+';font-size:24px;line-height:1.1">'+og.grade+'</div>'+
    '<div class="vt" style="font-size:12px;color:var(--mut);margin-top:6px;line-height:1.35">'+og.txt+'<br><span style="opacity:.88">'+og.sub+'</span></div>'+
    '</div>';
  safeEl('career-stats-grid').innerHTML=cGrid;
  var sl=safeEl('season-log');
  var html='<div class="vt" style="font-size:14px;color:var(--gold);padding:6px 8px;border-bottom:1px solid rgba(122,184,224,.12)">ALL-TIME BY LEAGUE</div>';
  var byLeague={};
  for(var j=0;j<G.seasonLog.length;j++){
    var lg=G.seasonLog[j].league||'UNK';
    if(!byLeague[lg]) byLeague[lg]={gp:0,g:0,a:0,sv:0,ga:0,seasons:0,isGoalie:!!G.seasonLog[j].isGoalie};
    byLeague[lg].gp+=G.seasonLog[j].gp||0;
    byLeague[lg].seasons++;
    if(G.seasonLog[j].isGoalie){
      byLeague[lg].sv+=(G.seasonLog[j].sv||0);
      byLeague[lg].ga+=(G.seasonLog[j].ga||0);
    } else {
      byLeague[lg].g+=(G.seasonLog[j].g||0);
      byLeague[lg].a+=(G.seasonLog[j].a||0);
    }
  }
  var leagueKeys=Object.keys(byLeague);
  if(!leagueKeys.length){
    html+='<div class="vt" style="font-size:14px;color:var(--mut);padding:8px">FIRST SEASON IN PROGRESS...</div>';
  } else {
    for(var k=0;k<leagueKeys.length;k++){
      var lk=leagueKeys[k], row=byLeague[lk];
      html+='<div style="padding:7px;border-bottom:1px solid rgba(122,184,224,.07);font-family:VT323,monospace;font-size:14px">';
      html+='<span style="color:var(--gold)">'+lk+'</span> ';
      html+='<span style="color:var(--mut)">('+row.seasons+' season'+(row.seasons!==1?'s':'')+')</span> ';
      if(row.isGoalie){
        var svPct=formatSvPctFromCounts(row.sv,row.ga);
        var gaa=row.gp>0?Math.round((row.ga/row.gp)*100)/100:'--';
        html+=row.gp+'GP '+row.sv+'SV '+row.ga+'GA SV%'+svPct+' GAA'+gaa;
      } else {
        html+=row.gp+'GP '+row.g+'G '+row.a+'A '+(row.g+row.a)+'PTS';
      }
      html+='</div>';
    }
  }
  if(G.playoffLog&&G.playoffLog.length){
    html+='<div class="vt" style="font-size:14px;color:var(--gold);padding:8px 8px 6px;border-bottom:1px solid rgba(122,184,224,.12);margin-top:6px">PLAYOFF HISTORY</div>';
    var pl=G.playoffLog.slice().reverse();
    for(var p=0;p<pl.length;p++){
      var pr=pl[p];
      html+='<div style="padding:7px;border-bottom:1px solid rgba(122,184,224,.07);font-family:VT323,monospace;font-size:14px">';
      html+='<span style="color:var(--gold)">'+pr.year+'</span> ';
      html+='<span style="color:var(--mut)">'+pr.league+' '+pr.team+'</span> ';
      html+=pr.wonCup?'CHAMPION ':stripBracketIcons(pr.round)+' ';
      if(pr.isGoalie){
        var psvPct=formatSvPctFromCounts(pr.sv,pr.ga);
        html+=pr.gp+'GP '+pr.sv+'SV '+pr.ga+'GA SV%'+psvPct;
      } else {
        html+=pr.gp+'GP '+pr.g+'G '+pr.a+'A '+(pr.g+pr.a)+'PTS';
      }
      html+='</div>';
    }
  }
  if(G.worldStageLog&&G.worldStageLog.length){
    html+='<div class="vt" style="font-size:14px;color:var(--gold);padding:8px 8px 6px;border-bottom:1px solid rgba(122,184,224,.12);margin-top:6px">WORLD STAGE HISTORY</div>';
    var wl=G.worldStageLog.slice().reverse();
    for(var w=0;w<wl.length;w++){
      var wr=wl[w];
      html+='<div style="padding:7px;border-bottom:1px solid rgba(122,184,224,.07);font-family:VT323,monospace;font-size:14px">';
      html+='<span style="color:var(--gold)">'+wr.year+'</span> ';
      html+='<span style="color:var(--mut)">'+wr.team+' -- '+wr.tournament+'</span> ';
      html+='['+wr.medal+'] ';
      if(wr.isGoalie){
        var wsvPct=formatSvPctFromCounts(wr.sv,wr.ga);
        html+=wr.gp+'GP '+wr.sv+'SV '+wr.ga+'GA SV%'+wsvPct;
      } else {
        html+=wr.gp+'GP '+Math.round(wr.g)+'G '+Math.round(wr.a)+'A '+(Math.round(wr.g)+Math.round(wr.a))+'PTS';
      }
      html+='</div>';
    }
  }
  html+='<div class="vt" style="font-size:14px;color:var(--gold);padding:8px 8px 6px;border-bottom:1px solid rgba(122,184,224,.12);margin-top:6px">SEASON LOG</div>';
  var log=G.seasonLog.slice().reverse();
  for(var i=0;i<log.length;i++){
    var s=log[i];
    html+='<div style="padding:7px;border-bottom:1px solid rgba(122,184,224,.07);font-family:VT323,monospace;font-size:14px">';
    html+='<span style="color:var(--gold)">'+s.year+'</span> ';
    if(s.season!=null) html+='<span style="color:var(--acc);font-size:12px"> SZN '+s.season+'</span> ';
    html+='<span style="color:var(--mut)">'+s.league+' '+s.team+'</span> ';
    if(s.isGoalie){
      html+=s.gp+'GP '+s.sv+'SV '+s.ga+'GA SV%'+formatSeasonLogSvPct(s.svpct)+' GAA'+s.gaa;
    } else {
      html+=s.gp+'GP '+s.g+'G '+s.a+'A '+(s.g+s.a)+'PTS';
    }
    html+=' OVR '+s.ovrVal;
    if(s.wonCup) html+=' <span style="color:var(--gold)">CUP</span>';
    html+='</div>';
  }
  sl.innerHTML=html;
}

function renderAwardsTab(){
  var aw=safeEl('hub-awards');
  if(!G.awards.length){aw.innerHTML='<div class="vt" style="font-size:14px;color:var(--mut);padding:8px">NO AWARDS YET. KEEP GRINDING.</div>';return;}
  var html='';
  for(var i=0;i<G.awards.length;i++){
    var a=G.awards[i];
    html+='<div style="display:flex;align-items:center;gap:10px;padding:8px;border:1px solid rgba(245,200,66,.2);margin-bottom:5px">';
    html+='<div style="font-size:22px">AWD</div>';
    html+='<div><div class="vt" style="font-size:16px;color:var(--gold)">'+a.name+'</div>';
    html+='<div class="vt" style="font-size:13px;color:var(--mut)">'+a.desc+' -- SEASON '+a.season+'</div></div></div>';
  }
  aw.innerHTML=html;
  var hofPts=calcHOF();
  var pct=Math.min(100,hofPts);
  var status=hofPts>=100?'HALL OF FAME LOCK':hofPts>=70?'HOF BUBBLE':hofPts>=40?'SOLID PRO':'BUILDING';
  safeEl('hub-hof').innerHTML=
    '<div class="srow"><div class="slbl">LEGEND SCORE</div><div class="sbar"><div class="sfill" style="background:var(--gold);width:'+pct+'%"></div></div><div class="sval">'+Math.round(hofPts)+'</div></div>'+
    '<div class="vt" style="font-size:16px;color:var(--gold);margin-top:6px">'+status+'</div>';
}

function renderContractTab(){
  var c=G.contract;
  var elcLine='';
  var rightsLine='';
  if(c.type==='ENTRY LEVEL'){
    var yDone=cl(3-(G.contractYrsLeft||0)+1,1,3);
    elcLine='<div class="vt" style="font-size:14px;color:var(--gold);margin-top:6px">ELC PROGRESS: YEAR '+yDone+'/3</div>';
  } else if(G.hadELC){
    elcLine='<div class="vt" style="font-size:14px;color:var(--acc);margin-top:6px">ELC COMPLETED</div>';
  } else {
    elcLine='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:6px">ELC NOT STARTED</div>';
  }
  if(G.draftRights){
    var drNote=G.draftRights.team+' ('+G.draftRights.leagueKey+')';
    if(typeof isPlayerUnderBindingContract==='function' && isPlayerUnderBindingContract()){
      rightsLine='<div class="vt" style="font-size:14px;color:var(--gold);margin-top:6px">DRAFT RIGHTS: '+drNote+'</div>';
    } else {
      rightsLine='<div class="vt" style="font-size:14px;color:var(--gold);margin-top:6px">DRAFT RIGHTS: '+drNote+' — <span style="color:var(--acc)">rights only</span> (overseas semi-pro OK, no '+getProLeagueKeyByGender(G.gender)+' contract yet)</div>';
    }
  } else if(G._formerDraftClubName){
    rightsLine='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:6px">DRAFT RIGHTS: NONE — FORMER ENTRY CLUB: '+G._formerDraftClubName+'</div>';
  } else if(G.everDrafted){
    rightsLine='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:6px">DRAFT RIGHTS: PREVIOUSLY DRAFTED</div>';
  } else {
    rightsLine='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:6px">DRAFT RIGHTS: NONE</div>';
  }
  var bindingLine='';
  if(typeof isPlayerUnderBindingContract==='function' && isPlayerUnderBindingContract()){
    bindingLine='<div class="vt" style="font-size:14px;color:var(--acc);margin-top:8px;line-height:1.5"><b>CIRCUIT LOCK:</b> '+getContractCircuitHint(G._contractCircuit||'')+
      '. You cannot sign in another league until this deal expires or the club grants a <b>release</b> (offseason).</div>';
  }
  safeEl('hub-contract-info').innerHTML=
    '<div style="background:var(--rink);border:1px solid var(--rl);padding:12px;margin-bottom:10px">'+
    '<div class="vt" style="font-size:14px;color:var(--mut)">CURRENT CONTRACT</div>'+
    '<div class="cval-big">'+(c.sal>0?fmt(c.sal):'AMATEUR')+'</div>'+
    '<div class="vt" style="font-size:15px;color:var(--mut);margin-top:4px">'+c.type+' -- '+G.contractYrsLeft+' YR'+(G.contractYrsLeft!==1?'S':'')+' REMAINING</div>'+
    elcLine+
    rightsLine+
    bindingLine+
    (c.ntc?'<span class="badge green">NTC</span>':'')+
    (c.bonus?'<span class="badge blue">PERF BONUS</span>':'')+
    '</div>'+
    (typeof renderPlayerFinanceSection==='function'?renderPlayerFinanceSection():'')+
    '<div class="vt" style="font-size:15px;color:'+(G.contractYrsLeft<=1?'var(--red)':'var(--mut)')+'">'+
    (G.contractYrsLeft<=1?'CONTRACT EXPIRES THIS OFFSEASON — FREE AGENCY OPENS':'CONTRACT STATUS STABLE -- '+G.contractYrsLeft+' YEARS LEFT')+
    '</div>'+
    (function(){
      var rel='';
      if(typeof isPlayerUnderBindingContract==='function' && isPlayerUnderBindingContract() && G._inOffseason){
        rel='<div style="margin-top:10px"><button type="button" class="btn bd bw" onclick="requestContractRelease()">REQUEST CONTRACT RELEASE</button>'+
          '<div class="vt" style="font-size:12px;color:var(--mut);margin-top:6px">Ask to leave your circuit early. Club may buy you out — not guaranteed.</div></div>';
      }
      var dg=getDemandTradeGate();
      var op=!dg.ok?' style="opacity:.52"':'';
      var tit=dg.hint?(' title="'+dg.hint.replace(/"/g,'&quot;')+'"'):'';
      return rel+'<div style="margin-top:12px"><button class="btn bd bw"'+op+tit+' onclick="demandTrade()">DEMAND TRADE</button>'+
        '<div class="vt" style="font-size:12px;color:var(--mut);margin-top:6px;line-height:1.4">Same league, new team — needs weak club results plus strong personal play. Does not break your circuit lock.</div></div>';
    })();
}

function calcHOF(){
  var p=0;
  if(G.pos==='G'){
    // Goalies scored on GP, saves, save%, awards, cups
    p+=Math.min(30,G.cGP/15);
    p+=Math.min(20,G.cSaves/200);
    var cSvR=G.cSaves+(G.cGoalsAgainst||0)>0?G.cSaves/(G.cSaves+(G.cGoalsAgainst||0)):0;
    if(cSvR>=0.920) p+=15;
    else if(cSvR>=0.910) p+=8;
  } else {
    p+=Math.min(40,(G.cGoals+G.cAssists)/20);
  }
  p+=Math.min(30,G.awards.length*7);
  p+=G.careerCups*20;
  p+=Math.min(10,G.season*0.5);
  return Math.round(p);
}
