/* breakaway — WEEK / SEASON */
// ============================================================
// WEEK / SEASON
// ============================================================
function nextWeek(){
  if(G._playoffCtx&&G._playoffCtx.active) return;
  var dev=G.league.dev||1.1;
  if(G.league.tier==='pro') dev=Math.max(0.35,dev-0.15);
  else if(G.league.tier==='minor') dev=Math.max(0.6,dev-0.05);
  // Natural attribute development stops at age 26. Younger = much faster weekly gains, then tapers hard toward 25-26.
  if((G.age||16)<26){
    var youthW=G.age<=17?1.55:(G.age<=19?1.28:(G.age<=22?1.0:(G.age<=24?0.68:0.42)));
    var pDev=getPotentialDevMult(G.potential||'support');
    var amin=typeof G._attrClampMin==='number'?G._attrClampMin:40;
    var capAge=getAttrCapForAge(G.age||16);
    var attrList=ATTRS[G.pos];
    var lkDev=G.leagueKey||'';
    var tnDev=G.team&&G.team.n||'';
    for(var i=0;i<attrList.length;i++){
      var a=attrList[i];
      var leagueMult=getLeagueAttrDevMultiplier(lkDev, tnDev, a);
      var inc=rd(0,0.4)*dev*pDev*(G.morale/100)*youthW*leagueMult;
      if(typeof SKATER_BASE_ATTR_KEYS!=='undefined' && SKATER_BASE_ATTR_KEYS.indexOf(a)>=0) inc*=0.4;
      if(G.attrs[a]<capAge) G.attrs[a]=cl(G.attrs[a]+inc,amin,capAge);
    }
  }
  // tougher leagues introduce more media pressure and fatigue on bad weeks
  if(G.league.tier==='pro' && G.gp>0 && (G.w/G.gp) < 0.45){
    G.morale=cl(G.morale-5,0,100);
    addNews('MEDIA CRITICS: Low form in the '+G.league.short+' pile on the pressure.','bad');
  }

  G.health=cl(G.health+ri(3,8),0,100);
  G.stamina=cl(G.stamina+ri(10,20),0,100);
  G.week++;
  G.weekGames=0;
  G._lifeScenarioRolledThisWeek=false;
  // Refresh social messages weekly
  if(G.week%3===0) G.socialMessages=generateSocialMessages();
  // Add league-wide talent news occasionally
  if(Math.random()<0.55) addLeagueTalentNews();
  accrueWeeklySalary();
  tickSocialFollowers();
  renderHub();show('s-hub');
}

var PLAYOFF_SERIES_WINS=4;
/** Simmed playoff games: slightly flatter power curve + extra bite when your team is playing. */
var PLAYOFF_SIM_POWER_DIV=36;
var PLAYOFF_SIM_PLAYER_HURDLE=0.086;
function getPlayoffYoungLeagueSimHurdle(){
  if(typeof G==='undefined'||!G||!G.league) return 0;
  var t=G.league.tier;
  if(t==='junior'||t==='college') return 0.026;
  if(t==='minor') return 0.015;
  return 0;
}
function getPlayoffYoungLeaguePlayablePressure(){
  if(typeof G==='undefined'||!G||!G.league) return 0;
  var t=G.league.tier;
  if(t==='junior'||t==='college') return 0.03;
  if(t==='minor') return 0.017;
  return 0;
}
/** Extra bracket-sim power for physical/defensive profiles and brat/heavy hitter in playoffs (stacks with OVR). */
function getPlayoffSimGrindPowerBonus(){
  if(typeof G==='undefined'||!G||!G.attrs) return 0;
  var bon=((G.attrs.physical!=null?G.attrs.physical:60)-60)/50;
  if(G.pos==='D'){
    bon+=((G.attrs.defense||60)+(G.attrs.shotBlocking||60)+(G.attrs.positioning||60)-180)/110;
  }
  if(G.pos==='F'){
    bon+=((G.attrs.stickChecks||60)+(G.attrs.defense||60)+(G.attrs.anticipation||60)-180)/130;
  }
  if(G.xFactor==='brat') bon+=0.26;
  if(G.xFactor==='heavy_hitter') bon+=0.2;
  return cl(bon,-0.12,1.08);
}
function playoffSingleGameHomeWins(home,away){
  var pk=getXFactorPlayoffPowerMult();
  var homePower=(home.pts/(home.gp||1))+ (home.isMe?(ovr(G.attrs,G.pos)/5)*pk:0);
  var awayPower=(away.pts/(away.gp||1))+ (away.isMe?(ovr(G.attrs,G.pos)/5)*pk:0);
  if(home.isMe) homePower+=getPlayoffSimGrindPowerBonus();
  if(away.isMe) awayPower+=getPlayoffSimGrindPowerBonus();
  var prob=cl(0.5 + (homePower-awayPower)/PLAYOFF_SIM_POWER_DIV,0.1,0.9);
  if(home.isMe||away.isMe){
    var ph=PLAYOFF_SIM_PLAYER_HURDLE+getPlayoffYoungLeagueSimHurdle();
    if(home.isMe) prob=cl(prob-ph,0.06,0.93);
    else prob=cl(prob+ph,0.06,0.93);
  }
  return Math.random()<prob;
}
function simPlayoffSeriesWinner(home,away){
  var hw=0,aw=0;
  while(hw<PLAYOFF_SERIES_WINS && aw<PLAYOFF_SERIES_WINS){
    if(playoffSingleGameHomeWins(home,away)) hw++; else aw++;
  }
  return {winner:hw>aw?home:away,homeWins:hw,awayWins:aw};
}
/** One simmed playoff game toward ctx.myStats (playoff bracket fast-sim). */
function addPlayoffSimGameToMyStats(){
  var myStats=G._playoffCtx.myStats;
  myStats.gp++;
  if(G.pos==='G'){
    var psv=ri(24,40);
    var pga=ri(1,5);
    if(G.xFactor==='careless'&&typeof isCarelessSlumping==='function'&&isCarelessSlumping()) pga+=Math.random()<0.42?ri(1,2):0;
    myStats.sv+=psv;
    myStats.ga+=pga;
  } else {
    var pg=ri(0,2), pa=ri(0,2);
    var sp=getXFactorSkaterPtsMult('playoff');
    if(sp>1){
      if(Math.random()<(sp-1)*0.52) pg++;
      if(Math.random()<(sp-1)*0.44) pa++;
    } else if(sp<1){
      if(Math.random()<(1-sp)*0.48 && pg>0) pg--;
      if(Math.random()<(1-sp)*0.4 && pa>0) pa--;
    }
    pg=cl(pg,0,4); pa=cl(pa,0,4);
    myStats.g+=pg; myStats.a+=pa;
  }
}
function simulatePlayoffs(){
  var sorted=G.standings.slice().sort(function(a,b){return b.pts-a.pts;});
  var bracket=buildPlayoffBracketFromStandings(sorted, G.leagueKey);
  if(!bracket||bracket.length<2)return {wonCup:false,roundReached:'',summary:null};
  var divN=getPlayoffDivisionTeamLists(G.leagueKey).length;
  var poNote=(divN>=2?' — division winners + wild cards, re-seeded by points':' — seeded by points');
  addNews('PLAYOFFS BEGIN in '+G.league.short+' with '+bracket.length+' teams (best-of-7)'+poNote+'.','big');
  var roundReached='';
  var current=bracket;
  var roundNames={8:'Quarterfinals',4:'Semifinals',2:'Finals'};
  var summary={field:[],rounds:[],champion:''};
  var myStats={gp:0,g:0,a:0,sv:0,ga:0};
  for(var b=0;b<bracket.length;b++){
    summary.field.push((b+1)+'. '+bracket[b].team.n);
  }
  while(current.length>1){
    var next=[];
    var roundName=roundNames[current.length]||current.length+'-team round';
    addNews('PLAYOFF ROUND: '+roundName+' begins in '+G.league.short+'.','neutral');
    var roundRows=[];
    for(var i=0;i<current.length/2;i++){
      var home=current[i], away=current[current.length-1-i];
      var hW=0,aW=0;
      if(home.isMe||away.isMe){
        roundReached=roundName;
        while(hW<PLAYOFF_SERIES_WINS && aW<PLAYOFF_SERIES_WINS){
          if(playoffSingleGameHomeWins(home,away)) hW++; else aW++;
          myStats.gp++;
          if(G.pos==='G'){
            var psv=ri(24,40);
            var pga=ri(1,5);
            if(G.xFactor==='careless'&&isCarelessSlumping()) pga+=Math.random()<0.42?ri(1,2):0;
            myStats.sv+=psv;
            myStats.ga+=pga;
          } else {
            var pg=ri(0,2), pa=ri(0,2);
            var sp=getXFactorSkaterPtsMult('playoff');
            if(sp>1){
              if(Math.random()<(sp-1)*0.52) pg++;
              if(Math.random()<(sp-1)*0.44) pa++;
            } else if(sp<1){
              if(Math.random()<(1-sp)*0.48 && pg>0) pg--;
              if(Math.random()<(1-sp)*0.4 && pa>0) pa--;
            }
            pg=cl(pg,0,4); pa=cl(pa,0,4);
            myStats.g+=pg; myStats.a+=pa;
          }
        }
      } else {
        var ser=simPlayoffSeriesWinner(home,away);
        hW=ser.homeWins; aW=ser.awayWins;
      }
      var winner=hW>aW?home:away;
      var loser=winner===home?away:home;
      roundRows.push(home.team.n+' vs '+away.team.n+' -> '+winner.team.n+' ('+hW+'-'+aW+')');
      if(home.isMe||away.isMe){
        if(winner.isMe){
          addNews('YOU WIN '+roundName+' series '+hW+'-'+aW+' vs '+loser.team.n+'!','good');
          addNews('HEADLINE: '+G.first+' '+G.last+' helps '+G.team.n+' advance from the '+roundName+'.','big');
        } else {
          addNews('YOU LOSE '+roundName+' series '+aW+'-'+hW+' vs '+winner.team.n+'.','bad');
          addNews('HEADLINE: '+G.team.n+' eliminated in the '+roundName+'.','bad');
        }
      } else {
        addNews(roundName+': '+home.team.n+' vs '+away.team.n+' -> '+winner.team.n+' ('+hW+'-'+aW+')','neutral');
      }
      next.push(winner);
    }
    summary.rounds.push({name:roundName,matchups:roundRows});
    current=next;
  }
  var champion=current[0];
  summary.champion=champion.team.n;
  _lastPlayoffStats=myStats;
  if(champion.isMe){
    addNews('YOU WIN THE '+G.league.short+' CHAMPIONSHIP!','big');
    addNews('CHAMPIONSHIP HEADLINE: '+G.team.n+' capture the '+G.league.short+' title.','big');
    notify('CHAMPIONS!','gold');
    return {wonCup:true,roundReached:roundReached||'Finals',summary:summary};
  } else {
    addNews(champion.team.n+' wins the '+G.league.short+' championship.','good');
    addNews('CHAMPIONSHIP FINAL: '+champion.team.n+' close out the '+G.league.short+' season on top.','neutral');
    return {wonCup:false,roundReached:roundReached||'Finals',summary:summary};
  }
}

function initPlayablePlayoffs(){
  G._worldStageCtx=null;
  G.standings=buildStandings(G.leagueKey);
  var sorted=G.standings.slice().sort(function(a,b){return b.pts-a.pts;});
  var bracket=buildPlayoffBracketFromStandings(sorted, G.leagueKey);
  if(!bracket||bracket.length<2){
    addNews('Not enough playoff teams -- skipping playable bracket.','neutral');
    finishSeasonToOffseason();
    return;
  }
  var divN2=getPlayoffDivisionTeamLists(G.leagueKey).length;
  var poN2=(divN2>=2?' division winners + wild cards, re-seeded':' seeded by points');
  addNews('PLAYOFFS BEGIN (PLAYABLE) in '+G.league.short+' — '+bracket.length+' teams (best-of-7), '+poN2+'. Hub: SIM ROUND (CPU), SIM MY SERIES, or PLAY GAME each win.','big');
  G._playoffCtx={
    active:true,
    hubScheduleMode:true,
    current:bracket,
    summary:{field:[],rounds:[],champion:''},
    myStats:{gp:0,g:0,a:0,sv:0,ga:0},
    pairIndex:0,
    pairs:[],
    winnersThisRound:[],
    _roundMatchups:[],
    eliminated:false,
    wonCup:false,
    roundReached:'',
    roundName:'',
    playoffOpponent:{n:'',e:'[-]'},
    awaitingUserGame:false,
    seriesHW:0,
    seriesAW:0
  };
  for(var b=0;b<bracket.length;b++){
    G._playoffCtx.summary.field.push((b+1)+'. '+bracket[b].team.n);
  }
  startPlayoffRoundPlayable();
}

function startPlayoffRoundPlayable(){
  var ctx=G._playoffCtx;
  if(!ctx)return;
  var teams=ctx.current;
  if(teams.length<2){
    finishPlayablePlayoffs();
    return;
  }
  var roundNames={8:'Quarterfinals',4:'Semifinals',2:'Finals'};
  ctx.roundName=roundNames[teams.length]||(teams.length+'-team round');
  ctx.pairs=[];
  for(var i=0;i<teams.length/2;i++){
    ctx.pairs.push([teams[i],teams[teams.length-1-i]]);
  }
  ctx.pairIndex=0;
  ctx.winnersThisRound=[];
  ctx._roundMatchups=[];
  addNews('PLAYOFF ROUND: '+ctx.roundName+' begins in '+G.league.short+'.','neutral');
  if(ctx.hubScheduleMode){
    try{renderHub();}catch(eHub){}
    return;
  }
  processPlayoffPairQueue();
}

function processPlayoffPairQueue(){
  var ctx=G._playoffCtx;
  if(!ctx)return;
  if(ctx.pairIndex>=ctx.pairs.length){
    ctx.summary.rounds.push({name:ctx.roundName,matchups:ctx._roundMatchups.slice()});
    ctx.current=ctx.winnersThisRound.slice();
    if(ctx.current.length<=1){
      finishPlayablePlayoffs();
      return;
    }
    startPlayoffRoundPlayable();
    return;
  }
  var pr=ctx.pairs[ctx.pairIndex];
  var home=pr[0], away=pr[1];
  if(home.isMe||away.isMe){
    var opp=home.isMe?away:home;
    ctx.playoffOpponent={n:opp.team.n,e:opp.team.e||'[-]'};
    ctx.seriesHW=0;
    ctx.seriesAW=0;
    ctx.awaitingUserGame=true;
    G._isPlayoffGame=true;
    preGame(-1);
    return;
  }
  var ser=simPlayoffSeriesWinner(home,away);
  var winner=ser.winner;
  ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+winner.team.n+' ('+ser.homeWins+'-'+ser.awayWins+')');
  addNews(ctx.roundName+': '+home.team.n+' vs '+away.team.n+' -> '+winner.team.n+' ('+ser.homeWins+'-'+ser.awayWins+')','neutral');
  ctx.winnersThisRound.push(winner);
  ctx.pairIndex++;
  processPlayoffPairQueue();
}

function afterPlayoffPlayableGame(won){
  var ctx=G._playoffCtx;
  if(!ctx)return;
  var pr=ctx.pairs[ctx.pairIndex];
  if(!pr){
    if(ctx.hubScheduleMode&&ctx.pairIndex>=ctx.pairs.length){
      tryCompletePlayoffRoundFromHub();
      if(G._playoffCtx&&G._playoffCtx.eliminated) simAllRemainingPlayoffRoundsCpu();
      if(G._playoffCtx&&G._playoffCtx.active){ try{renderHub();}catch(ePc){} show('s-hub'); }
      return;
    }
    finishPlayablePlayoffs();
    return;
  }
  var home=pr[0], away=pr[1];
  var userRow=home.isMe?home:away;
  var oppRow=home.isMe?away:home;
  if(won){ if(home.isMe) ctx.seriesHW++; else ctx.seriesAW++; }
  else { if(home.isMe) ctx.seriesAW++; else ctx.seriesHW++; }
  if(ctx.seriesHW<PLAYOFF_SERIES_WINS && ctx.seriesAW<PLAYOFF_SERIES_WINS){
    if(ctx.hubScheduleMode){
      ctx.awaitingUserGame=false;
      G._isPlayoffGame=false;
      addNews('PLAYOFF SERIES: '+ctx.seriesHW+'-'+ctx.seriesAW+' vs '+oppRow.team.n+' — back to hub when ready.','neutral');
      try{renderHub();}catch(eH0){}
      show('s-hub');
      return;
    }
    ctx.awaitingUserGame=true;
    G._isPlayoffGame=true;
    addNews('PLAYOFF SERIES: '+ctx.seriesHW+'-'+ctx.seriesAW+' vs '+oppRow.team.n+'.','neutral');
    preGame(-1);
    return;
  }
  var sW=ctx.seriesHW>ctx.seriesAW?home:away;
  var hw=ctx.seriesHW, aw=ctx.seriesAW;
  if(sW.isMe){
    ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+userRow.team.n+' (YOU) ('+hw+'-'+aw+')');
    ctx.winnersThisRound.push(userRow);
    ctx.roundReached=ctx.roundName;
    addNews('YOU WIN '+ctx.roundName+' series '+hw+'-'+aw+' vs '+oppRow.team.n+'!','good');
  } else {
    ctx._roundMatchups.push(home.team.n+' vs '+away.team.n+' -> '+oppRow.team.n+' ('+hw+'-'+aw+')');
    ctx.winnersThisRound.push(oppRow);
    ctx.eliminated=true;
    ctx.roundReached=ctx.roundName;
    addNews('YOU LOSE '+ctx.roundName+' series '+aw+'-'+hw+' vs '+oppRow.team.n+'.','bad');
  }
  ctx.seriesHW=0;
  ctx.seriesAW=0;
  ctx.pairIndex++;
  ctx.awaitingUserGame=false;
  G._isPlayoffGame=false;
  if(ctx.hubScheduleMode){
    if(ctx.pairIndex>=ctx.pairs.length){
      tryCompletePlayoffRoundFromHub();
    }
    if(G._playoffCtx&&G._playoffCtx.eliminated){
      simAllRemainingPlayoffRoundsCpu();
    }
    if(G._playoffCtx&&G._playoffCtx.active){
      try{renderHub();}catch(eH1){}
      show('s-hub');
    }
    return;
  }
  processPlayoffPairQueue();
}

function finishPlayablePlayoffs(){
  var ctx=G._playoffCtx;
  if(!ctx){
    // Context already cleared after a normal finish — do not run season-end again (duplicate season log)
    return;
  }
  var champion=ctx.current[0];
  ctx.wonCup=!!(champion&&champion.isMe);
  ctx.summary.champion=champion?champion.team.n:'';
  G.wonCup=ctx.wonCup;
  _lastPlayoffStats=ctx.myStats;
  var playoffObj={wonCup:ctx.wonCup,roundReached:ctx.roundReached||'Finals',summary:ctx.summary};
  recordPlayoffLogFromResult(playoffObj);
  _lastPlayoffRecapHTML=buildPlayoffRecapHTML(playoffObj);
  G._playoffCtx=null;
  G._isPlayoffGame=false;
  if(G.wonCup){
    G.careerCups++;
    G.socialFollowers=(G.socialFollowers||0)+ri(500,2200);
    G.awards.push({name:'League Champion',icon:'[C]',desc:'Won the '+G.league.short+' championship',season:G.season});
    addNews('YOU WIN THE '+G.league.short+' CHAMPIONSHIP!','big');
    addNews('CHAMPIONSHIP HEADLINE: '+G.team.n+' capture the '+G.league.short+' title.','big');
    notify('CHAMPIONS!','gold');
  } else if(ctx.eliminated){
    addNews('Playoff run ended in the '+ctx.roundReached+'.','neutral');
  }
  if(champion&&!champion.isMe){
    addNews(champion.team.n+' wins the '+G.league.short+' championship.','good');
    addNews('CHAMPIONSHIP FINAL: '+champion.team.n+' close out the '+G.league.short+' season on top.','neutral');
  }
  finishSeasonToOffseason();
}

function buildPlayoffRecapHTML(playoff){
  if(!playoff||!playoff.summary) return 'NO PLAYOFF BRACKET AVAILABLE.';
  var html='<div style="margin-bottom:8px;color:var(--gold);font-size:15px">PLAYOFF FIELD</div>';
  html+='<div style="display:grid;grid-template-columns:1fr;gap:4px;margin-bottom:10px">';
  for(var f=0;f<playoff.summary.field.length;f++){
    html+='<div style="padding:6px;border:1px solid rgba(122,184,224,.2);background:rgba(12,26,36,.5)">'+playoff.summary.field[f]+'</div>';
  }
  html+='</div>';
  for(var i=0;i<playoff.summary.rounds.length;i++){
    var r=playoff.summary.rounds[i];
    html+='<div style="margin:10px 0 4px;color:var(--acc);font-size:15px">['+r.name.toUpperCase()+']</div>';
    for(var j=0;j<r.matchups.length;j++){
      html+='<div style="padding:6px;border-left:3px solid var(--acc);margin-bottom:4px;background:rgba(12,26,36,.35)">'+r.matchups[j]+'</div>';
    }
  }
  html+='<div style="margin-top:10px;padding:8px;border:1px solid rgba(46,204,113,.35);color:var(--green)">CHAMPION: '+playoff.summary.champion+'</div>';
  if(_lastPlayoffStats){
    if(G.pos==='G'){
      var psvPct=_lastPlayoffStats.sv+_lastPlayoffStats.ga>0?Math.round((_lastPlayoffStats.sv/(_lastPlayoffStats.sv+_lastPlayoffStats.ga))*1000)/10+'%':'--';
      html+='<div style="margin-top:8px">YOUR PLAYOFF STATS: '+_lastPlayoffStats.gp+'GP '+_lastPlayoffStats.sv+'SV '+_lastPlayoffStats.ga+'GA SV%'+psvPct+'</div>';
    } else {
      html+='<div style="margin-top:8px">YOUR PLAYOFF STATS: '+_lastPlayoffStats.gp+'GP '+_lastPlayoffStats.g+'G '+_lastPlayoffStats.a+'A '+(_lastPlayoffStats.g+_lastPlayoffStats.a)+'PTS</div>';
    }
  }
  return html;
}

var TOP_HOCKEY_COUNTRIES = [
  'Canada','United States','Swedish','Finnish','Russian','Czech','Slovak','Swiss','German',
  'Latvian','Danish','Norwegian','Belarusian','Japanese'
];

function isTopHockeyCountry(nat){
  return TOP_HOCKEY_COUNTRIES.indexOf(nat)!==-1;
}

// World Stage: some national programs are harder to qualify from than others.
// Differentiates "different countries harder to make" instead of a single binary gate.
function getWorldStageCountryDifficultyMult(nat){
  var map={
    'Canada':0.95,'United States':0.98,'Swedish':1.00,'Finnish':1.00,'Russian':1.02,
    'Czech':1.05,'Slovak':1.06,'Swiss':1.06,'German':1.07,
    'Latvian':1.10,'Danish':1.11,'Norwegian':1.12,'Belarusian':1.12,'Japanese':1.15
  };
  if(map[nat]) return map[nat];
  // Unknown programs are harder than the modeled field.
  return isTopHockeyCountry(nat)?1.10:1.20;
}

/** PHL clubs in major media markets — extra scrutiny / social heat (fishbowl). */
function isPhlBigMarketTeamName(teamName){
  if(!teamName) return false;
  return /Toronto|Montreal|New York|Boston|Philadelphia|Los Angeles|Chicago/i.test(String(teamName));
}
/** Recent world stage: played for Canada, no medal (men's national scrutiny). */
function lastWorldStageWasTeamCanadaNoMedal(){
  if(!G.worldStageLog||!G.worldStageLog.length) return false;
  var e=G.worldStageLog[G.worldStageLog.length-1];
  return e.team==='Team Canada' && (e.medal==='NONE'||!e.medal);
}

function getNationalTeamName(nat){
  var map={
    'Canada':'Team Canada',
    'United States':'Team USA',
    'Swedish':'Team Sweden',
    'Finnish':'Team Finland',
    'Russian':'Team Russia',
    'Czech':'Team Czechia',
    'Slovak':'Team Slovakia',
    'Swiss':'Team Switzerland',
    'German':'Team Germany',
    'Latvian':'Team Latvia',
    'Danish':'Team Denmark',
    'Norwegian':'Team Norway',
    'Belarusian':'Team Belarus',
    'Japanese':'Team Japan'
  };
  return map[nat]||('Team '+nat);
}

function pickRandomWorldOpponentLabel(){
  var pool=TOP_HOCKEY_COUNTRIES.filter(function(n){return n!==G.nat;});
  if(!pool.length) return 'WORLD SELECT TEAM';
  return getNationalTeamName(pool[ri(0,pool.length-1)]);
}

function beginWorldStagePlayableFromEval(ev){
  G._worldStageCtx={
    ev:ev,
    phase:'group',
    rrW:0,
    rrL:0,
    oppLabel:pickRandomWorldOpponentLabel(),
    stats:{gp:0,g:0,a:0,sv:0,ga:0},
    medal:'',
    htmlLines:[],
    madePlayoffs:false
  };
  _lastWorldStageHTML+='<div style="margin-bottom:8px;color:var(--gold);font-size:15px">'+ev.tName+': SELECTED FOR '+ev.nt.toUpperCase()+' (PLAYABLE)</div>';
  addNews('WORLD STAGE: '+G.first+' '+G.last+' selected for '+ev.nt+' at '+ev.tName+' (playable games).','big');
  preGame(0);
}

function finalizeWorldStagePlayable(ctx){
  var ev=ctx.ev;
  var tName=ev.tName, nt=ev.nt;
  var medal=ctx.medal||'';
  _lastWorldStageHTML+=ctx.htmlLines.join('');
  _lastWorldStageStats={
    team:nt,
    tournament:tName,
    gp:ctx.stats.gp||0,
    g:ctx.stats.g||0,
    a:ctx.stats.a||0,
    sv:ctx.stats.sv||0,
    ga:ctx.stats.ga||0
  };
  if(medal){
    G.awards.push({name:tName+' '+medal,icon:medal==='GOLD'?'[G]':medal==='SILVER'?'[S]':'[B]',desc:nt+' wins '+medal+' at '+tName,season:G.season});
    G.morale=cl(G.morale+(medal==='GOLD'?10:medal==='SILVER'?7:4),0,100);
    G.xp+=Math.round((medal==='GOLD'?180:medal==='SILVER'?130:90)*getPotentialXpMult(G.potential||'support'));
    notify(tName+' '+medal,'gold');
    _lastWorldStageHTML+='<div style="margin-top:8px;padding:8px;border:1px solid rgba(46,204,113,.35);color:var(--green)">RESULT: '+medal+' MEDAL</div>';
    addNews('WORLD STAGE RESULT: '+nt+' win '+medal+' at '+tName+'!','big');
  } else {
    if(nt==='Team Canada' && G.gender==='M'){
      G.morale=cl(G.morale-6,0,100);
      addNews('NATIONAL PRESSURE: Canada men finish without a medal — media and fans turn up the heat.','bad');
    } else {
      G.morale=cl(G.morale+2,0,100);
    }
    G.xp+=Math.round(40*getPotentialXpMult(G.potential||'support'));
    _lastWorldStageHTML+='<div style="margin-top:8px;padding:8px;border:1px solid rgba(122,184,224,.25)">RESULT: NO MEDAL</div>';
    addNews('WORLD STAGE RESULT: '+nt+' finish without a medal at '+tName+'.','neutral');
  }
  if(_lastWorldStageStats){
    G.worldStageLog=G.worldStageLog||[];
    G.worldStageLog.push({
      year:G.year,
      team:nt,
      tournament:tName,
      medal:medal||'NONE',
      isGoalie:G.pos==='G',
      gp:_lastWorldStageStats.gp||0,
      g:_lastWorldStageStats.g||0,
      a:_lastWorldStageStats.a||0,
      sv:_lastWorldStageStats.sv||0,
      ga:_lastWorldStageStats.ga||0
    });
    if(G.pos==='G'){
      var wsvPct=_lastWorldStageStats.sv+_lastWorldStageStats.ga>0?Math.round((_lastWorldStageStats.sv/(_lastWorldStageStats.sv+_lastWorldStageStats.ga))*1000)/10+'%':'--';
      _lastWorldStageHTML+='<div style="margin-top:6px">YOUR STATS: '+_lastWorldStageStats.gp+'GP '+_lastWorldStageStats.sv+'SV '+_lastWorldStageStats.ga+'GA SV%'+wsvPct+'</div>';
    } else {
      _lastWorldStageHTML+='<div style="margin-top:6px">YOUR STATS: '+_lastWorldStageStats.gp+'GP '+_lastWorldStageStats.g+'G '+_lastWorldStageStats.a+'A '+(_lastWorldStageStats.g+_lastWorldStageStats.a)+'PTS</div>';
    }
  }
  G._worldStageCtx=null;
  if(G._worldStagePlayQueue&&G._worldStagePlayQueue.length){
    startNextQueuedWorldStagePlayable();
  } else {
    closeOffseasonWorldStageAndShow();
  }
}

function afterWorldStagePlayableGame(won){
  var ctx=G._worldStageCtx;
  if(!ctx)return;
  var ev=ctx.ev;
  var tName=ev.tName, nt=ev.nt, teamPower=ev.teamPower;
  if(!won){
    var lossMorale=-1;
    if(nt==='Team Canada' && G.gender==='M') lossMorale=-3;
    G.morale=cl(G.morale+lossMorale,0,100);
  }
  if(ctx.phase==='group'){
    if(won) ctx.rrW++; else ctx.rrL++;
    ctx.htmlLines.push('<div style="padding:5px;border-left:3px solid var(--acc);margin-bottom:4px">GROUP GAME '+(ctx.rrW+ctx.rrL)+': '+(won?'W':'L')+'</div>');
    addNews(tName+' GROUP GAME '+(ctx.rrW+ctx.rrL)+': '+nt+' '+(won?'WIN':'LOSS')+'.','neutral');
    if(ctx.rrW+ctx.rrL<3){
      ctx.oppLabel=pickRandomWorldOpponentLabel();
      preGame(0);
      return;
    }
    ctx.madePlayoffs=ctx.rrW>=2 || (ctx.rrW===1 && Math.random()<0.35+teamPower*0.2);
    if(!ctx.madePlayoffs){
      ctx.htmlLines.push('<div style="margin-top:4px;color:var(--mut)">DID NOT REACH PLAYOFF STAGE.</div>');
      finalizeWorldStagePlayable(ctx);
      return;
    }
    addNews(tName+': '+nt+' advance to the playoff stage.','good');
    ctx.phase='semi';
    ctx.oppLabel='TOP INTERNATIONAL FIELD';
    preGame(0);
    return;
  }
  if(ctx.phase==='semi'){
    ctx.htmlLines.push('<div style="padding:5px;border-left:3px solid var(--gold);margin-bottom:4px">SEMIFINAL: '+(won?'W':'L')+'</div>');
    addNews(tName+' SEMIFINAL: '+nt+' '+(won?'WIN':'LOSS')+'.','neutral');
    if(won){
      ctx.phase='final';
      ctx.oppLabel='GOLD MEDAL GAME OPPONENT';
    } else {
      ctx.phase='bronze';
      ctx.oppLabel='BRONZE MEDAL GAME OPPONENT';
    }
    preGame(0);
    return;
  }
  if(ctx.phase==='final'){
    ctx.htmlLines.push('<div style="padding:5px;border-left:3px solid var(--gold);margin-bottom:4px">FINAL: '+(won?'W':'L')+'</div>');
    addNews(tName+' FINAL: '+nt+' '+(won?'WIN':'LOSS')+'.','big');
    ctx.medal=won?'GOLD':'SILVER';
    finalizeWorldStagePlayable(ctx);
    return;
  }
  if(ctx.phase==='bronze'){
    ctx.htmlLines.push('<div style="padding:5px;border-left:3px solid var(--gold);margin-bottom:4px">BRONZE GAME: '+(won?'W':'L')+'</div>');
    addNews(tName+' BRONZE GAME: '+nt+' '+(won?'WIN':'LOSS')+'.','neutral');
    ctx.medal=won?'BRONZE':'';
    finalizeWorldStagePlayable(ctx);
    return;
  }
}

function startNextQueuedWorldStagePlayable(){
  if(!G._worldStagePlayQueue||!G._worldStagePlayQueue.length){
    closeOffseasonWorldStageAndShow();
    return;
  }
  var nextEv=G._worldStagePlayQueue.shift();
  beginWorldStagePlayableFromEval(nextEv);
}

function startOffseasonWorldStageFlow(){
  var jev=evaluateWorldTournament('junior');
  var sev=evaluateWorldTournament('senior');
  if(!jev.ok) _lastWorldStageHTML+=jev.msg||'';
  if(!sev.ok) _lastWorldStageHTML+=sev.msg||'';
  if(jev.ok||sev.ok){
    var bits=[];
    if(jev.ok) bits.push('WORLD JUNIORS');
    if(sev.ok) bits.push('WORLD TOURNAMENT');
    openStaffChat('WORLD STAGE -- THIS OFFSEASON',
      [{sender:'National Program', color:'var(--gold)', text:'International duty: '+bits.join(' & ')+'. Simulate the full run or play the national-team games (same 3-moment games as league play).'}],
      [
        {label:'SIM TOURNAMENTS', fn:function(){
          if(jev.ok) runInternationalTournamentFromEval(jev);
          if(sev.ok) runInternationalTournamentFromEval(sev);
          closeOffseasonWorldStageAndShow();
        }},
        {label:'PLAY NATIONAL GAMES', fn:function(){
          G._worldStagePlayQueue=[];
          if(jev.ok) G._worldStagePlayQueue.push(jev);
          if(sev.ok) G._worldStagePlayQueue.push(sev);
          startNextQueuedWorldStagePlayable();
        }}
      ]
    );
    return;
  }
  closeOffseasonWorldStageAndShow();
}

function closeOffseasonWorldStageAndShow(){
  safeEl('offseason-playoff-recap').innerHTML=_lastPlayoffRecapHTML||'NO PLAYOFF RECAP YET.';
  safeEl('offseason-world-stage').innerHTML=_lastWorldStageHTML||'NO TOURNAMENT UPDATE YET.';
  G._inOffseason=true;
  show('s-offseason');
  setTimeout(function(){triggerOffseasonStaffChat();},400);
}

function evaluateWorldTournament(kind){
  var isJunior=kind==='junior';
  var tName=isJunior?'WORLD JUNIORS':'WORLD TOURNAMENT OF HOCKEY';
  var reqOvrBase=isJunior?64:78;
  var nt=getNationalTeamName(G.nat);
  if(isJunior){
    // World Juniors: U20 — under 20 only (no 18+ floor).
    if(G.age>=20) return {ok:false,msg:'<div>'+tName+': '+nt+' age ineligible (World Juniors — under 20 only).</div>'};
  } else {
    if(G.age<18) return {ok:false,msg:'<div>'+tName+': '+nt+' age ineligible (senior tournament — must be 18+).</div>'};
  }
  if(isJunior && G.leagueKey===getProLeagueKeyByGender(G.gender)) return {ok:false,msg:'<div>'+tName+': Ineligible as full-time '+getProLeagueKeyByGender(G.gender)+' player.</div>'};
  if(!isJunior && (G.year%4)!==0) return {ok:false,msg:'<div>'+tName+': Not held this year.</div>'};
  var countryMult=getWorldStageCountryDifficultyMult(G.nat);
  var reqOvr=reqOvrBase*countryMult;
  var pOvr=ovr(G.attrs,G.pos);
  var reqShow=Math.round(reqOvr);
  if(pOvr<reqOvr)
    return {ok:false,msg:'<div>'+tName+': Not selected by '+nt+' (OVR '+pOvr+' / req '+reqShow+').</div>'};
  var teamPower=cl((pOvr-reqOvr)/20 + (G.league.dev||1)*0.2 + rd(-0.15,0.25),0.05,1.2);
  return {ok:true,isJunior:isJunior,tName:tName,nt:nt,reqOvr:reqShow,pOvr:pOvr,teamPower:teamPower};
}

function runInternationalTournament(kind){
  var ev=evaluateWorldTournament(kind);
  if(!ev.ok){_lastWorldStageHTML+=ev.msg;return;}
  runInternationalTournamentFromEval(ev);
}

function runInternationalTournamentFromEval(ev){
  var isJunior=ev.isJunior;
  var tName=ev.tName, nt=ev.nt, pOvr=ev.pOvr;
  var teamPower=cl(ev.teamPower*getXFactorWorldTeamPowerMult(),0.05,1.35);
  _lastWorldStageHTML+='<div style="margin-bottom:8px;color:var(--gold);font-size:15px">'+tName+': SELECTED FOR '+nt.toUpperCase()+'</div>';
  addNews('WORLD STAGE: '+G.first+' '+G.last+' selected for '+nt+' at '+tName+'.','big');
  var rrW=0, rrL=0;
  for(var gix=1;gix<=3;gix++){
    var win=Math.random()<cl(0.45+teamPower*0.28,0.2,0.85);
    if(win) rrW++; else rrL++;
    _lastWorldStageHTML+='<div style="padding:5px;border-left:3px solid var(--acc);margin-bottom:4px">GROUP GAME '+gix+': '+(win?'W':'L')+'</div>';
    addNews(tName+' GROUP GAME '+gix+': '+nt+' '+(win?'WIN':'LOSS')+'.','neutral');
  }
  var madePlayoffs=rrW>=2 || (rrW===1 && Math.random()<0.35+teamPower*0.2);
  var medal='';
  if(madePlayoffs){
    addNews(tName+': '+nt+' advance to the playoff stage.','good');
    var semiWin=Math.random()<cl(0.45+teamPower*0.3,0.2,0.88);
    _lastWorldStageHTML+='<div style="padding:5px;border-left:3px solid var(--gold);margin-bottom:4px">SEMIFINAL: '+(semiWin?'W':'L')+'</div>';
    addNews(tName+' SEMIFINAL: '+nt+' '+(semiWin?'WIN':'LOSS')+'.','neutral');
    if(semiWin){
      var finalWin=Math.random()<cl(0.42+teamPower*0.3,0.18,0.86);
      medal=finalWin?'GOLD':'SILVER';
      _lastWorldStageHTML+='<div style="padding:5px;border-left:3px solid var(--gold);margin-bottom:4px">FINAL: '+(finalWin?'W':'L')+'</div>';
      addNews(tName+' FINAL: '+nt+' '+(finalWin?'WIN':'LOSS')+'.','big');
    } else {
      var bronzeWin=Math.random()<cl(0.5+teamPower*0.2,0.2,0.85);
      medal=bronzeWin?'BRONZE':'';
      _lastWorldStageHTML+='<div style="padding:5px;border-left:3px solid var(--gold);margin-bottom:4px">BRONZE GAME: '+(bronzeWin?'W':'L')+'</div>';
      addNews(tName+' BRONZE GAME: '+nt+' '+(bronzeWin?'WIN':'LOSS')+'.','neutral');
    }
  } else {
    _lastWorldStageHTML+='<div style="margin-top:4px;color:var(--mut)">DID NOT REACH PLAYOFF STAGE.</div>';
    addNews(tName+': '+nt+' exit after group stage.','neutral');
  }

  var gp=ri(4,7);
  if(G.pos==='G'){
    var shots=ri(70,130);
    var svRate=cl(0.89 + (pOvr-70)*0.001 + rd(-0.01,0.01),0.84,0.95);
    if(G.xFactor==='clutch') svRate=cl(svRate+0.009,0.84,0.956);
    if(G.xFactor==='regular_season') svRate=cl(svRate-0.007,0.84,0.95);
    if(G.xFactor==='careless'&&isCarelessSlumping()) svRate=cl(svRate-0.006,0.84,0.95);
    var sv=Math.round(shots*svRate);
    var ga=shots-sv;
    addNews((medal?medal+' MEDAL! ':'')+nt+' '+tName+' run -- '+G.first+' '+G.last+' posts '+sv+' SV and '+ga+' GA in '+gp+' games.','big');
    _lastWorldStageStats={team:nt,tournament:tName,gp:gp,sv:sv,ga:ga,g:0,a:0};
  } else {
    var pts=Math.max(0,Math.round(gp*(0.2 + (pOvr-60)*0.018 + rd(0,0.3))*getXFactorSkaterPtsMult('world')));
    var g=Math.round(pts*rd(0.35,0.6));
    var a=Math.max(0,pts-g);
    addNews((medal?medal+' MEDAL! ':'')+nt+' '+tName+' run -- '+G.first+' '+G.last+' records '+g+'G '+a+'A in '+gp+' games.','big');
    _lastWorldStageStats={team:nt,tournament:tName,gp:gp,g:g,a:a,sv:0,ga:0};
  }
  if(medal){
    G.awards.push({name:tName+' '+medal,icon:medal==='GOLD'?'[G]':medal==='SILVER'?'[S]':'[B]',desc:nt+' wins '+medal+' at '+tName,season:G.season});
    G.morale=cl(G.morale+(medal==='GOLD'?10:medal==='SILVER'?7:4),0,100);
    G.xp+=Math.round((medal==='GOLD'?180:medal==='SILVER'?130:90)*getPotentialXpMult(G.potential||'support'));
    notify(tName+' '+medal,'gold');
    _lastWorldStageHTML+='<div style="margin-top:8px;padding:8px;border:1px solid rgba(46,204,113,.35);color:var(--green)">RESULT: '+medal+' MEDAL</div>';
    addNews('WORLD STAGE RESULT: '+nt+' win '+medal+' at '+tName+'!','big');
  } else {
    if(nt==='Team Canada' && G.gender==='M'){
      G.morale=cl(G.morale-6,0,100);
      addNews('NATIONAL PRESSURE: Canada men finish without a medal — media and fans turn up the heat.','bad');
    } else {
      G.morale=cl(G.morale+2,0,100);
    }
    G.xp+=Math.round(40*getPotentialXpMult(G.potential||'support'));
    _lastWorldStageHTML+='<div style="margin-top:8px;padding:8px;border:1px solid rgba(122,184,224,.25)">RESULT: NO MEDAL</div>';
    addNews('WORLD STAGE RESULT: '+nt+' finish without a medal at '+tName+'.','neutral');
  }
  if(_lastWorldStageStats){
    G.worldStageLog=G.worldStageLog||[];
    G.worldStageLog.push({
      year:G.year,
      team:nt,
      tournament:tName,
      medal:medal||'NONE',
      isGoalie:G.pos==='G',
      gp:_lastWorldStageStats.gp||0,
      g:_lastWorldStageStats.g||0,
      a:_lastWorldStageStats.a||0,
      sv:_lastWorldStageStats.sv||0,
      ga:_lastWorldStageStats.ga||0
    });
    if(G.pos==='G'){
      var wsvPct=_lastWorldStageStats.sv+_lastWorldStageStats.ga>0?Math.round((_lastWorldStageStats.sv/(_lastWorldStageStats.sv+_lastWorldStageStats.ga))*1000)/10+'%':'--';
      _lastWorldStageHTML+='<div style="margin-top:6px">YOUR STATS: '+_lastWorldStageStats.gp+'GP '+_lastWorldStageStats.sv+'SV '+_lastWorldStageStats.ga+'GA SV%'+wsvPct+'</div>';
    } else {
      _lastWorldStageHTML+='<div style="margin-top:6px">YOUR STATS: '+_lastWorldStageStats.gp+'GP '+_lastWorldStageStats.g+'G '+_lastWorldStageStats.a+'A '+(_lastWorldStageStats.g+_lastWorldStageStats.a)+'PTS</div>';
    }
  }
}

function endRegSeason(){
  _lastPlayoffRecapHTML='';
  // Rebuild once here so playoff qualification uses current, stable standings.
  G.standings=buildStandings(G.leagueKey);
  var sorted=G.standings.slice().sort(function(a,b){return b.pts-a.pts;});
  var myIdx=0;
  for(var i=0;i<sorted.length;i++){if(sorted[i].isMe){myIdx=i;break;}}
  var madePlayoffs=myIdx<Math.ceil(sorted.length/2);
  if(madePlayoffs){
    initPlayablePlayoffs();
    notify('PLAYOFFS — HUB','gold');
    renderHub();
    show('s-hub');
    return;
  } else {
    G.wonCup=false;
    addNews(G.team.n+' misses the playoffs.','bad');
    _lastPlayoffRecapHTML='<div>'+G.team.n+' missed the playoffs this season.</div>';
  }
  finishSeasonToOffseason();
}

function finishSeasonToOffseason(){
  // One log row per season end (playoff paths could otherwise fire this multiple times)
  if(G._seasonEndLoggedForSeason===G.season){
    goToOffseason();
    return;
  }
  G._seasonEndLoggedForSeason=G.season;
  // Store season stats in log
  var logEntry={year:G.year,season:G.season,league:G.league.short,leagueKey:G.leagueKey,team:G.team.n.split(' ').slice(-1)[0],gp:G.gp,ovrVal:ovr(G.attrs,G.pos),wonCup:G.wonCup,isGoalie:G.pos==='G'};
  if(G.pos==='G'){
    var sSvPct=G.saves+(G.goalsAgainst||0)>0?(Math.round(G.saves/(G.saves+(G.goalsAgainst||0))*1000)/10):'--';
    var sGAA=G.gp>0?Math.round(((G.goalsAgainst||0)/G.gp)*100)/100:'--';
    logEntry.sv=G.saves; logEntry.ga=G.goalsAgainst||0; logEntry.svpct=sSvPct; logEntry.gaa=sGAA;
  } else {
    logEntry.g=G.goals; logEntry.a=G.assists;
  }
  G.seasonLog.push(logEntry);
  // Season awards
  checkSeasonAwards();
  goToOffseason();
}
