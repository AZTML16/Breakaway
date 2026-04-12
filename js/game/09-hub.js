/* breakaway — HUB */
// ============================================================
// HUB
// ============================================================
function renderHub(){
  var o=ovr(G.attrs);
  var fullName=String(G.first+' '+G.last).trim();
  applyTeamTheme(G.team&&G.team.n?G.team.n:'TEAM');
  safeEl('hub-hdr').textContent=G.league.short+' -- SEASON '+G.season+' -- '+G.year;
  safeEl('hub-pname').textContent=fullName;
  // Enhanced pmeta with jersey, hand, hometown
  var handLabel=G.hand==='L'?'L':'R';
  var posStr=(G.pos==='G'?'G':G.subPos);
  var leadTag=G.leadershipRole?(' -- '+G.leadershipRole):'';
  var homeStr=String(G.hometown||'').trim();
  safeEl('hub-pmeta').textContent=
    'AGE '+G.age+' -- #'+G.jersey+leadTag+' -- '+posStr+' -- '+handLabel+' -- '+G.team.n+
    (homeStr?' -- '+homeStr:'')+' -- '+G.nat+' -- '+G.height+' -- '+(G.weight||180)+' LB';
  var teamIdent=safeEl('hub-team-ident');
  if(teamIdent) teamIdent.innerHTML='<span class="team-wordmark">'+G.team.n+'</span>';
  safeEl('hub-ovr').textContent='OVR '+o;
  safeEl('hub-league-badge').textContent=stripBracketIcons(G.league.short);
  var conText=G.contract.type+(G.contract.sal>0?' -- '+fmt(G.contract.sal):' -- AMATEUR');
  safeEl('hub-contract-badge').textContent=conText;
  var me=G.morale;
  var mei=me>=80?':)':me>=60?':|':me>=40?':S':':(';
  safeEl('hub-morale-badge').textContent=mei+' '+me;
  var hubIc=safeEl('hub-icon');
  if(hubIc) hubIc.innerHTML=teamLogoSVG(G.team.n,72,G.leagueKey);
  if(G.xFactor==='sniper_xf') G.xFactor='quick_release';
  if(G.arch==='OQD') G.arch='OffensiveD';
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
  var totalWks=Math.ceil((G.league.games||68)/perWkHub);
  var psub=safeEl('hub-season-sub');
  var ptitle=safeEl('hub-season-ptitle');
  if(G._playoffCtx&&G._playoffCtx.active){
    var boN=typeof PLAYOFF_SERIES_WINS==='number'?PLAYOFF_SERIES_WINS:4;
    var serHdr=boN<=1?'1 GAME':'BO'+boN+' (race to '+boN+')';
    if(ptitle) ptitle.innerHTML='PLAYOFFS <span style="color:var(--mut)">—</span> <span id="wk-lbl">'+escHtml(G._playoffCtx.roundName||'ROUND')+'</span> <span style="color:var(--mut)">·</span> <span id="wk-max">'+serHdr+'</span>';
    var _px=G._playoffCtx,_pr=_px.pairs&&_px.pairs[_px.pairIndex];
    var subP='Your series is best-of-7 when you play. <b>SIM ROUND</b> resolves every series in this round (yours too). If you are eliminated, the rest of the bracket sims and you head to the offseason.';
    if(_pr&&(_pr[0].isMe||_pr[1].isMe)&&!_px.eliminated){
      var _uW=_pr[0].isMe?_px.seriesHW:_px.seriesAW,_oW=_pr[0].isMe?_px.seriesAW:_px.seriesHW,_on=_pr[0].isMe?_pr[1].team.n:_pr[0].team.n;
      subP='Series tracker: you '+_uW+' — '+_oW+' '+_on+(boN<=1?'':' (first to '+boN+')')+'. '+subP;
    }
    if(psub) psub.textContent=subP;
  } else {
    if(ptitle) ptitle.innerHTML='WEEK <span id="wk-lbl">'+G.week+'</span> / <span id="wk-max">'+totalWks+'</span>';
    if(psub) psub.textContent=perWkHub+' GAMES THIS WEEK. CLICK TO PLAY EACH ONE:';
  }
  if(G.isInjured){
    safeEl('inj-banner').style.display='block';
    safeEl('inj-text').textContent=G.injName+' -- '+G.injWks+' WKS LEFT';
  } else {
    safeEl('inj-banner').style.display='none';
  }
  safeEl('s-gp').textContent=G.gp;
  // Dynamic stat grid for goalies vs skaters
  var pm=G.plusminus;
  if(G.pos==='G'){
    var svpctSzn=G.saves+(G.goalsAgainst||0)>0?Math.round(G.saves/(G.saves+(G.goalsAgainst||0))*1000)/10:'--';
    var gaaSzn=G.gp>0?Math.round(((G.goalsAgainst||0)/G.gp)*100)/100:'--';
    safeEl('hub-stat-grid').innerHTML=
      '<div class="stbox"><div class="stlbl">GP</div><div class="stval">'+G.gp+'</div></div>'+
      '<div class="stbox"><div class="stlbl">GA</div><div class="stval" style="color:var(--red)">'+(G.goalsAgainst||0)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SV</div><div class="stval" style="color:var(--green)">'+G.saves+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SV%</div><div class="stval" style="color:var(--gold)">'+(svpctSzn==='--'?svpctSzn:svpctSzn+'%')+'</div></div>'+
      '<div class="stbox"><div class="stlbl">GAA</div><div class="stval">'+gaaSzn+'</div></div>'+
      '<div class="stbox"><div class="stlbl">W/L</div><div class="stval" style="color:'+(pm>=0?'var(--green)':'var(--red)')+'">'+(pm>=0?'+':'')+pm+'</div></div>';
  } else {
    safeEl('hub-stat-grid').innerHTML=
      '<div class="stbox"><div class="stlbl">GP</div><div class="stval">'+G.gp+'</div></div>'+
      '<div class="stbox"><div class="stlbl">G</div><div class="stval" style="color:var(--red)">'+G.goals+'</div></div>'+
      '<div class="stbox"><div class="stlbl">A</div><div class="stval" style="color:var(--acc)">'+G.assists+'</div></div>'+
      '<div class="stbox"><div class="stlbl">PTS</div><div class="stval" style="color:var(--gold)">'+(G.goals+G.assists)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">+/-</div><div class="stval" style="color:'+(pm>=0?'var(--green)':'var(--red)')+'">'+(pm>=0?'+':'')+pm+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SOG</div><div class="stval">'+G.sog+'</div></div>';
  }
  var msgs=[];
  if(G.pos==='G'){
    var svDisp=G.saves+(G.goalsAgainst||0)>0?(Math.round(G.saves/(G.saves+(G.goalsAgainst||0))*1000)/10)+'%':'--';
    msgs.push(fullName+' -- '+G.gp+'GP '+G.saves+'SV SV%'+svDisp+' THIS SEASON');
  } else {
    msgs.push(fullName+' -- '+(G.goals+G.assists)+' PTS ('+G.goals+'G '+G.assists+'A) THIS SEASON');
    if(G.gp>0){
      var ppgH=(G.goals+G.assists)/G.gp, bar=getPpgCaliberOvrThreshold(G.leagueKey);
      if(ppgH>=1&&o>=bar) msgs.push('PPG CALIBER FOR '+G.league.short+' (OVR '+Math.round(o)+' / TYPICAL BAR ~'+bar+')');
    }
  }
  if(G._playoffCtx&&G._playoffCtx.active){
    msgs.push('PLAYOFFS — '+G._playoffCtx.roundName);
  } else {
    msgs.push(G.team.n.toUpperCase()+' GAME DAY');
  }
  msgs.push('LEAGUE SCORING RACE HEATING UP');
  msgs.push('SCOUTS IN THE HOUSE TONIGHT');
  msgs.push('TIP: PRESS ? OR / FOR HOW TO');
  if(G.streakType && G.streakType!=='none' && G.streakCount>=2) msgs.push('TREND: '+G.streakType+G.streakCount+' STREAK');
  if(G.streakType && G.streakType!=='none' && G.streakCount>=4) msgs.push('ARENA ENERGY: '+G.streakType+G.streakCount+' -- EVERY SHIFT MATTERS');
  if(typeof draftClubWillingToSignElc==='function' && hasActiveDraftRights() && !draftClubWillingToSignElc())
    msgs.push('DRAFT: '+G.draftRights.team+' HOLDS RIGHTS -- DEV TRACK (TARGET '+getDraftClubElcMinOvr()+'+ OVR)');
  if(G.morale>=88) msgs.push(G.first.toUpperCase()+' -- LOCKER ROOM VIBES: MORALE THROUGH THE ROOF');
  if(G.league.tier==='pro' && G.gp>0 && (G.w/G.gp)<0.45) msgs.push('MEDIA: Press conference demand spikes after poor form.');
  if(G.news.length) msgs.push(G.news[0].txt);
  safeEl('hub-tick').textContent=shuf(msgs).join('  --  ');
  if(G.league.tier==='pro' && G.gp>0 && Math.random()<0.12 && (G.w/G.gp)<0.5){
    addNews('Media: A controversial performance has the fanbase and commentators on edge.','bad');
  }
  renderWeekGames();
  renderNewsFeed();
  if(G.activeTab) hubTab(G.activeTab);
  maybeTriggerRandomLifeScenario();
}

function renderPlayoffHubPanel(){
  var el=safeEl('week-games');
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.active){ el.innerHTML=''; return; }
  var boN=typeof PLAYOFF_SERIES_WINS==='number'?PLAYOFF_SERIES_WINS:4;
  var serLabel=boN<=1?'one game (winner take all)':'best-of-'+(boN*2-1)+' · first to '+boN+' wins';
  var html='<div class="playoff-hub-bracket" style="border:1px solid var(--rl);background:var(--rink);padding:12px;margin-bottom:10px">';
  html+='<div class="vt" style="font-size:16px;color:var(--gold);margin-bottom:6px">'+escHtml(G.league.short)+' PLAYOFF BRACKET</div>';
  html+='<div class="vt" style="font-size:13px;color:var(--acc);margin-bottom:10px">'+escHtml(ctx.roundName||'ROUND')+' · '+serLabel+'</div>';
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
  html+='</div>';
  var prCur=(ctx.pairIndex<ctx.pairs.length)?ctx.pairs[ctx.pairIndex]:null;
  var userTurn=prCur&&(prCur[0].isMe||prCur[1].isMe)&&!ctx.eliminated;
  var seriesLive=userTurn&&(ctx.seriesHW<boN&&ctx.seriesAW<boN);
  if(userTurn&&seriesLive){
    html+='<button type="button" class="btn bp bw" style="margin-right:8px;margin-bottom:8px" onclick="startPlayoffPregameFromHub()">PLAY NEXT PLAYOFF GAME</button>';
  }
  html+='<button type="button" class="btn bs bw" style="margin-right:8px;margin-bottom:8px" onclick="simPlayoffRoundHubStep()">SIM ROUND (ALL SERIES)</button>';
  if(ctx.eliminated){
    html+='<button type="button" class="btn bd bw" style="margin-right:8px;margin-bottom:8px" onclick="simAllRemainingPlayoffRoundsCpu()">SIM ALL REMAINING ROUNDS</button>';
    html+='<div class="vt" style="margin-top:8px;color:var(--mut)">Eliminated — <b>SIM ROUND</b> or <b>SIM ALL REMAINING ROUNDS</b> to crown a champion.</div>';
  }
  html+='<button type="button" class="btn bd bw" style="margin-bottom:8px" onclick="simEntirePlayoffsFromHub()">RE-SIM ENTIRE PLAYOFFS (RESET BRACKET)</button>';
  el.innerHTML=html;
}

function startPlayoffPregameFromHub(){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.active||ctx.eliminated) return;
  var pr=ctx.pairs[ctx.pairIndex];
  if(!pr||(!pr[0].isMe&&!pr[1].isMe)) return;
  var opp=pr[0].isMe?pr[1]:pr[0];
  ctx.playoffOpponent={n:opp.team.n,e:opp.team.e||'[-]'};
  ctx.awaitingUserGame=true;
  G._isPlayoffGame=true;
  preGame(-1);
}

function tryCompletePlayoffRoundFromHub(){
  var ctx=G._playoffCtx;
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

function simPlayoffCpuMatchupsInRound(){
  var ctx=G._playoffCtx;
  if(!ctx||!ctx.active) return;
  while(ctx.pairIndex<ctx.pairs.length){
    var pr=ctx.pairs[ctx.pairIndex];
    var home=pr[0], away=pr[1];
    if(home.isMe||away.isMe){
      var userRow=home.isMe?home:away;
      var oppRow=home.isMe?away:home;
      while(ctx.seriesHW<PLAYOFF_SERIES_WINS && ctx.seriesAW<PLAYOFF_SERIES_WINS){
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
      }
      ctx.seriesHW=0;
      ctx.seriesAW=0;
      ctx.pairIndex++;
      ctx.awaitingUserGame=false;
      G._isPlayoffGame=false;
      continue;
    }
    var ser=simPlayoffSeriesWinner(home,away);
    ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+ser.winner.team.n+' ('+ser.homeWins+'-'+ser.awayWins+')');
    addNews(ctx.roundName+': '+home.team.n+' vs '+away.team.n+' -> '+ser.winner.team.n+' ('+ser.homeWins+'-'+ser.awayWins+')','neutral');
    ctx.winnersThisRound.push(ser.winner);
    ctx.pairIndex++;
  }
  tryCompletePlayoffRoundFromHub();
}

/** Keep simming rounds while eliminated until a champion ends the playoffs. */
function flushEliminatedPlayoffsCpu(){
  var g=0;
  while(G._playoffCtx&&G._playoffCtx.eliminated&&G._playoffCtx.active&&g++<200){
    simPlayoffCpuMatchupsInRound();
  }
}

/** One click: finish this round (including your series if needed), then auto-run the rest if you are out. */
function simPlayoffRoundHubStep(){
  simPlayoffCpuMatchupsInRound();
  flushEliminatedPlayoffsCpu();
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

function simEntirePlayoffsFromHub(){
  confirmInGame('Sim the entire playoffs from scratch (fast)? Your current bracket progress will be replaced by one full simulation.', function(){
    G._playoffCtx=null;
    G._isPlayoffGame=false;
    var playoff=simulatePlayoffs();
    G.wonCup=playoff.wonCup;
    recordPlayoffLogFromResult(playoff);
    _lastPlayoffRecapHTML=buildPlayoffRecapHTML(playoff);
    if(G.wonCup){
      G.careerCups++;
      G.socialFollowers=(G.socialFollowers||0)+ri(500,2200);
      G.awards.push({name:'League Champion',icon:'[C]',desc:'Won the '+G.league.short+' championship',season:G.season});
    } else {
      addNews('Playoffs (sim): eliminated in the '+(playoff.roundReached||'playoffs')+'.','neutral');
    }
    finishSeasonToOffseason();
    renderHub();
  });
}

function renderWeekGames(){
  var el=safeEl('week-games');
  var perWeek=getGamesPerWeek(G.leagueKey);
  var totalWks=Math.ceil((G.league.games||68)/perWeek);
  if(G._playoffCtx&&G._playoffCtx.active){
    renderPlayoffHubPanel();
    return;
  }
  if(G.week>totalWks){
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
    var injBlock=G.isInjured&&G.league.tier!=='minor';
    var youStart=!gMask||gMask[i];
    var bname=(G._goalieBackupNamesForWeek&&G._goalieBackupNamesForWeek[i])?G._goalieBackupNamesForWeek[i]:'BACKUP';
    html+='<div style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--rl);margin-bottom:6px;background:var(--rink)">';
    html+='<div class="vt" style="font-size:14px;color:var(--mut);width:60px">GAME '+(i+1)+'</div>';
    html+='<div class="vt" style="font-size:15px;flex:1">'+teamLogoChip(G.team.n,20,G.leagueKey)+' '+G.team.n+' <span style="color:var(--mut)">VS</span> '+teamLogoChip(opp.n,20,G.leagueKey)+' '+opp.n;
    if(G.pos==='G'&&!injBlock) html+='<span class="vt" style="font-size:12px;color:var(--mut);display:block;margin-top:4px">'+(youStart?'YOU START':'BENCH -- '+bname+' starts')+'</span>';
    html+='</div>';
    if(played){
      html+='<span class="badge green">PLAYED</span>';
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
  var tabs=['season','attrs','contract','standings','career','awards','social'];
  for(var i=0;i<tabs.length;i++){
    var el=safeEl('tab-'+tabs[i]);
    if(el) el.style.display=tabs[i]===tab?'block':'none';
  }
  var tabBtns=document.querySelectorAll('.tab');
  for(var i=0;i<tabBtns.length;i++) tabBtns[i].classList.toggle('on',tabs[i]===tab);
  if(tab==='attrs') renderAttrTab();
  if(tab==='standings') renderStandingsTab();
  if(tab==='career') renderCareerTab();
  if(tab==='awards') renderAwardsTab();
  if(tab==='contract') renderContractTab();
  if(tab==='social') renderSocialTab();
}

function renderAttrTab(){
  var html='';
  var keys=Object.keys(G.attrs);
  var potK=G.potential&&POTENTIALS[G.potential]?G.potential:'support';
  html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-bottom:10px;line-height:1.45">'+
    '<span style="color:var(--acc)">PROJECTION:</span> '+potentialTierWord(potK)+' — '+POTENTIALS[potK].desc+'</div>';
  for(var i=0;i<keys.length;i++){
    var k=keys[i]; var v=G.attrs[k];
    var color=ATTR_COLORS[k]||'var(--mut)';
    var lbl=ATTR_LABELS[k]||k;
    html+='<div class="srow"><div class="slbl">'+lbl+'</div><div class="sbar"><div class="sfill" style="background:'+color+';width:'+Math.round(v)+'%"></div></div><div class="sval">'+Math.round(v)+'</div></div>';
  }
  safeEl('hub-attr-bars').innerHTML=html;
  safeEl('b-health').style.width=G.health+'%';safeEl('v-health').textContent=Math.round(G.health);
  safeEl('b-stam').style.width=G.stamina+'%';safeEl('v-stam').textContent=Math.round(G.stamina);
  safeEl('b-morale').style.width=G.morale+'%';safeEl('v-morale').textContent=Math.round(G.morale);
}

function renderStandingsTab(){
  G.standings = buildStandings(G.leagueKey);
  var el=safeEl('hub-standings');
  var lk=G.leagueKey;
  var st=G.standings.slice().sort(function(a,b){return b.pts-a.pts;});
  var layout=getStandingsLayoutForLeague(lk);
  var html='<div class="hub-standings-wrap">';
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
        '<div class="stbox"><div class="stlbl">SV%</div><div class="stval" style="color:var(--gold)">'+(G.cSaves+(G.cGoalsAgainst||0)>0?(Math.round(G.cSaves/(G.cSaves+(G.cGoalsAgainst||0))*1000)/10)+'%':'--')+'</div></div>'+
        '<div class="stbox"><div class="stlbl">GAA</div><div class="stval">'+(G.cGP>0?Math.round(((G.cGoalsAgainst||0)/G.cGP)*100)/100:'--')+'</div></div>'
      : '<div class="stbox"><div class="stlbl">G</div><div class="stval" style="color:var(--red)">'+G.cGoals+'</div></div>'+
        '<div class="stbox"><div class="stlbl">A</div><div class="stval" style="color:var(--acc)">'+G.cAssists+'</div></div>'+
        '<div class="stbox"><div class="stlbl">PTS</div><div class="stval" style="color:var(--gold)">'+cp+'</div></div>'+
        '<div class="stbox"><div class="stlbl">OVR</div><div class="stval">'+ovr(G.attrs)+'</div></div>');
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
        var svPct=row.sv+row.ga>0?(Math.round((row.sv/(row.sv+row.ga))*1000)/10)+'%':'--';
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
        var psvPct=pr.sv+pr.ga>0?(Math.round((pr.sv/(pr.sv+pr.ga))*1000)/10)+'%':'--';
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
        var wsvPct=wr.sv+wr.ga>0?(Math.round((wr.sv/(wr.sv+wr.ga))*1000)/10)+'%':'--';
        html+=wr.gp+'GP '+wr.sv+'SV '+wr.ga+'GA SV%'+wsvPct;
      } else {
        html+=wr.gp+'GP '+wr.g+'G '+wr.a+'A '+(wr.g+wr.a)+'PTS';
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
    rightsLine='<div class="vt" style="font-size:14px;color:var(--gold);margin-top:6px">DRAFT RIGHTS: '+G.draftRights.team+' ('+G.draftRights.leagueKey+')</div>';
  } else if(G._formerDraftClubName){
    rightsLine='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:6px">DRAFT RIGHTS: NONE &mdash; FORMER ENTRY CLUB: '+G._formerDraftClubName+'</div>';
  } else if(G.everDrafted){
    rightsLine='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:6px">DRAFT RIGHTS: PREVIOUSLY DRAFTED</div>';
  } else {
    rightsLine='<div class="vt" style="font-size:14px;color:var(--mut);margin-top:6px">DRAFT RIGHTS: NONE</div>';
  }
  safeEl('hub-contract-info').innerHTML=
    '<div style="background:var(--rink);border:1px solid var(--rl);padding:12px;margin-bottom:10px">'+
    '<div class="vt" style="font-size:14px;color:var(--mut)">CURRENT CONTRACT</div>'+
    '<div class="vt" style="font-size:13px;color:var(--acc);margin-top:4px">CAREER EARNINGS '+fmt(G.careerEarnings||0)+'</div>'+
    '<div class="cval-big">'+(c.sal>0?fmt(c.sal):'AMATEUR')+'</div>'+
    '<div class="vt" style="font-size:15px;color:var(--mut);margin-top:4px">'+c.type+' -- '+G.contractYrsLeft+' YR'+(G.contractYrsLeft!==1?'S':'')+' REMAINING</div>'+
    elcLine+
    rightsLine+
    (c.ntc?'<span class="badge green">NTC</span>':'')+
    (c.bonus?'<span class="badge blue">PERF BONUS</span>':'')+
    '</div>'+
    '<div class="vt" style="font-size:15px;color:'+(G.contractYrsLeft<=1?'var(--red)':'var(--mut)')+'">'+
    (G.contractYrsLeft<=1?'CONTRACT EXPIRES THIS OFFSEASON':'CONTRACT STATUS STABLE -- '+G.contractYrsLeft+' YEARS LEFT')+
    '</div>'+
    (function(){
      var dg=getDemandTradeGate();
      var op=!dg.ok?' style="opacity:.52"':'';
      var tit=dg.hint?(' title="'+dg.hint.replace(/"/g,'&quot;')+'"'):'';
      return '<div style="margin-top:12px"><button class="btn bd bw"'+op+tit+' onclick="demandTrade()">DEMAND TRADE</button>'+
        '<div class="vt" style="font-size:12px;color:var(--mut);margin-top:6px;line-height:1.4">NEEDS LOW STANDINGS OR BAD CLUB WIN RATE PLUS STRONG OVR OR WINNING PERSONAL RECORD.</div></div>';
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
