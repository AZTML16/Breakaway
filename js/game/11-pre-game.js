/* breakaway — PRE-GAME */
// ============================================================
// PRE-GAME
// ============================================================
function setPregamePlayButton(backupNight,gameIdx){
  var btn=safeEl('btn-play-game');
  if(!btn) return;
  if(backupNight){
    btn.textContent='SIM (BACKUP)';
    btn.onclick=function(){ simBackupGoalieGame(gameIdx); };
  } else {
    btn.textContent='PLAY GAME';
    btn.onclick=function(){ startGame(); };
  }
}
function preGame(idx){
  /* Playoffs: hub "play next" must work even if awaitingUserGame was cleared (e.g. after render). */
  var _px=G._playoffCtx;
  var _boN=typeof PLAYOFF_SERIES_WINS==='number'?PLAYOFF_SERIES_WINS:4;
  var _hubSeriesReady=_px&&_px.active&&_px.hubScheduleMode&&!_px.eliminated&&_px.pairIndex<_px.pairs.length;
  if(_hubSeriesReady){
    var _pair=_px.pairs[_px.pairIndex];
    _hubSeriesReady=!!(_pair&&(_pair[0].isMe||_pair[1].isMe)&&_px.seriesHW<_boN&&_px.seriesAW<_boN);
  }
  if(G._playoffCtx&&G._playoffCtx.active&&(G._playoffCtx.awaitingUserGame||_hubSeriesReady)){
    var pctx=G._playoffCtx;
    pctx.awaitingUserGame=false;
    var _pair=pctx.pairs&&pctx.pairs[pctx.pairIndex];
    if(_pair&&( _pair[0].isMe||_pair[1].isMe )){
      var _oppRow=_pair[0].isMe?_pair[1]:_pair[0];
      pctx.playoffOpponent={n:_oppRow.team.n,e:_oppRow.team.e||'[-]'};
    }
    curOpponent=pctx.playoffOpponent&&pctx.playoffOpponent.n?pctx.playoffOpponent:{n:'Opponent',e:'[-]'};
    G._curGameIdx=-1;
    var _ph=pctx.pairs[pctx.pairIndex];
    var _sTxt='';
    if(_ph && (pctx.seriesHW>0 || pctx.seriesAW>0)){
      var _u=_ph[0].isMe?_ph[0]:(_ph[1].isMe?_ph[1]:null);
      if(_u){
        var _uw=_ph[0].isMe?pctx.seriesHW:pctx.seriesAW;
        var _ol=_ph[0].isMe?pctx.seriesAW:pctx.seriesHW;
        _sTxt=' — Series '+_uw+'-'+_ol+' (you)';
      } else {_sTxt=' — Series '+pctx.seriesHW+'-'+pctx.seriesAW;}
    }
    safeEl('pg-hdr').textContent='PLAYOFFS -- '+pctx.roundName+_sTxt;
    safeEl('pg-home').textContent=G.team.n;
    markPuckSlot('pg-home-mark',stripBracketIcons(G.team.e));
    safeEl('pg-away').textContent=curOpponent.n;
    markPuckSlot('pg-away-mark',curOpponent.e);
    var prep=[
      'Playoff intensity -- every mistake is magnified.',
      'Opponent scouting report: structured breakout, strong special teams.',
      'Win and advance -- no second chances this round.'
    ];
    safeEl('scout-report').textContent=prep[ri(0,prep.length-1)];
    var pshtml='';
    for(var pi=0;pi<STRATEGIES.length;pi++){
      var ps=STRATEGIES[pi];
      pshtml+='<button class="btn '+(curStrategy===ps.id?'bp':'bs')+'" onclick="setStrategy(\''+ps.id+'\',this)">'+ps.name+'<br><span class="vt" style="font-size:12px;color:var(--mut)">'+ps.desc+'</span></button>';
    }
    safeEl('strategy-btns').innerHTML=pshtml;
    setPregamePlayButton(false,0);
    show('s-pregame');
    return;
  }
  if(G._worldStageCtx){
    var wctx=G._worldStageCtx;
    var ev=wctx.ev;
    curOpponent={n:wctx.oppLabel||'NATIONAL OPPONENT',e:'[*]'};
    G._curGameIdx=-2;
    var hdr=wctx.phase==='group'?(ev.tName+' -- GROUP GAME '+(wctx.rrW+wctx.rrL+1)):
      wctx.phase==='semi'?(ev.tName+' -- SEMIFINAL'):
      wctx.phase==='final'?(ev.tName+' -- FINAL'):
      (ev.tName+' -- BRONZE MEDAL GAME');
    safeEl('pg-hdr').textContent=hdr;
    safeEl('pg-home').textContent=ev.nt;
    markPuckSlot('pg-home-mark','[H]');
    safeEl('pg-away').textContent=curOpponent.n;
    markPuckSlot('pg-away-mark',curOpponent.e);
    var reports=[
      'International pace -- every shift matters.',
      'Opponent runs a heavy forecheck -- quick exits required.',
      'Neutral-zone chess match expected.',
      'Crowd noise is LOUD -- stay composed.'
    ];
    safeEl('scout-report').textContent=reports[ri(0,reports.length-1)];
    var shtml='';
    for(var wi=0;wi<STRATEGIES.length;wi++){
      var ws=STRATEGIES[wi];
      shtml+='<button class="btn '+(curStrategy===ws.id?'bp':'bs')+'" onclick="setStrategy(\''+ws.id+'\',this)">'+ws.name+'<br><span class="vt" style="font-size:12px;color:var(--mut)">'+ws.desc+'</span></button>';
    }
    safeEl('strategy-btns').innerHTML=shtml;
    setPregamePlayButton(false,0);
    show('s-pregame');
    return;
  }
  if(idx<0){
    notify('SELECT A GAME FROM THE HUB SCHEDULE.','gold');
    return;
  }
  G._pregameBackupNight=false;
  if(idx>=0){
    if(idx!==G.weekGames){
      notify('FINISH GAME '+(G.weekGames+1)+' ON THE SCHEDULE FIRST','gold');
      return;
    }
    if(G.pos==='G'&&!G.isInjured){
      var _gm=ensureGoalieStartMask();
      if(_gm&&!_gm[idx]) G._pregameBackupNight=true;
    }
  }
  var perWeek=getGamesPerWeek(G.leagueKey);
  var weekStart=(G.week-1)*perWeek;
  curOpponent=G.allOpponents[weekStart+idx]||{n:'Opponent',e:'[-]'};
  G._curGameIdx=idx;
  safeEl('pg-hdr').textContent='WEEK '+G.week+' -- GAME '+(idx+1);
  safeEl('pg-home').textContent=G.team.n;
  markPuckSlot('pg-home-mark',stripBracketIcons(G.team.e));
  safeEl('pg-away').textContent=curOpponent.n;
  markPuckSlot('pg-away-mark',curOpponent.e);
  var reports=[
    'Strong defensive team -- they play a tight neutral zone.',
    'High-scoring lineup -- expect a back-and-forth game.',
    'Goalie on a hot streak -- shots need to be prime.',
    'Big physical team -- protect the puck and battle hard.',
    'Lost 3 in a row -- expect desperation hockey.',
    'Playing their best hockey right now -- bring your A game.'
  ];
  safeEl('scout-report').textContent=reports[ri(0,reports.length-1)];
  var shtml='';
  for(var i=0;i<STRATEGIES.length;i++){
    var s=STRATEGIES[i];
    shtml+='<button class="btn '+(curStrategy===s.id?'bp':'bs')+'" onclick="setStrategy(\''+s.id+'\',this)">'+s.name+'<br><span class="vt" style="font-size:12px;color:var(--mut)">'+s.desc+'</span></button>';
  }
  safeEl('strategy-btns').innerHTML=shtml;
  setPregamePlayButton(!!G._pregameBackupNight,idx);
  show('s-pregame');
}

function setStrategy(id,btn){
  curStrategy=id;
  var btns=document.querySelectorAll('#strategy-btns button');
  for(var i=0;i<btns.length;i++) btns[i].className='btn bs';
  if(btn) btn.className='btn bp';
}
