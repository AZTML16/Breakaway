/* breakaway — SIM WEEK */
// ============================================================
// SIM WEEK
// ============================================================
function getLeagueBaselineOvr(leagueKey){
  var perLeague={
    // Men
    OJL:64, QMJL:62, WJL:61, USJL:60, NCHA:67,
    NEJC:54, CEJC:55, ARJC:56,
    NEHL:70, CEHL:72, ARHL:74, NAML:78, PHL:90,
    // Women (tighter baselines vs men — sim was too generous, esp. PWL)
    CWHL:64, USWDL:62, NWCHA:68, EWJC:52, AWJC:53, SDHL:72, FWHL:73, AWHL:74, PWDL:81, PWL:93
  };
  if(Object.prototype.hasOwnProperty.call(perLeague,leagueKey)) return perLeague[leagueKey];
  var lk=LEAGUES[leagueKey]||{};
  var tier=lk.tier||'junior';
  var fallback={junior:61,college:66,euro:71,asia:73,minor:78,pro:89};
  return fallback[tier]||68;
}

function addSimMediaMoment(won, gameStats, opp){
  var totalPts=(gameStats.g||0)+(gameStats.a||0);
  var hasGoalieLine=G.pos==='G' && ((gameStats.sv||0)+(gameStats.ga||0))>0;
  var svPct=hasGoalieLine ? (gameStats.sv/(gameStats.sv+gameStats.ga)) : 0;
  var pressure=(G.gp>0 && (G.w/G.gp)<0.45) || G.morale<45 || G.plusminus<=-5;
  var hotNight=(G.pos==='G' ? svPct>=0.92 : totalPts>=2);
  var chance=hotNight ? 0.35 : (pressure ? 0.25 : 0.12);
  if(Math.random()>chance) return;
  if(hasGoalieLine){
    var svTxt=Math.round(svPct*1000)/10;
    addNews('MEDIA AVAILABILITY: "'+(won?'We stayed composed in our zone.':'I need one or two of those back.')+'" -- '+G.first+' '+G.last+' after a '+gameStats.sv+'SV, '+gameStats.ga+'GA night (SV% '+svTxt+'%) vs '+opp.n+'.','neutral');
    return;
  }
  var quote = hotNight ? 'I just trusted my reads and attacked space.' :
    (pressure ? (G.xFactor==='careless' ? 'Everyone\'s loud — I\'m fine with that.' : 'No excuses. I have to be better and lead the response.') : 'We stuck to details and managed the game the right way.');
  addNews('MEDIA AVAILABILITY: "'+quote+'" -- '+G.first+' '+G.last+' after '+totalPts+' point(s) vs '+opp.n+'.','neutral');
}

// Sim week: no hard weekly cap -- "good" weeks cluster ~6-9 PTS (F); D scoring is lower, esp. shutdown/stay-at-home.
function getSimDefenseScoringTier(){
  if(G.pos!=='D') return 'F';
  var da=G.arch||'';
  if(da==='OffensiveD') return 'Doff';
  if(da==='TwoWayD') return 'Dtwo';
  if(da==='StayAtHome'||da==='ShutdownD') return 'Dmin';
  return 'Dlow';
}
function getSimMaxPointsPerGame(perWeek,tier){
  if(tier==='F') return perWeek<=3 ? 5 : 4;
  if(tier==='Doff') return perWeek<=3 ? 3 : 2;
  if(tier==='Dtwo') return perWeek<=3 ? 2 : 2;
  if(tier==='Dmin') return 1;
  return perWeek<=3 ? 2 : 1;
}
/** reg | playoff | world — used for XP and PTS multipliers */
function getXFactorGameContext(){
  if(G._worldStageCtx) return 'world';
  if(G._playoffCtx&&G._isPlayoffGame) return 'playoff';
  return 'reg';
}
/** Careless: streaky — performance drops when the team is in a real slump (not just “bad stats”). */
function isCarelessSlumping(){
  if(G.xFactor!=='careless') return false;
  if(G.streakType==='L' && (G.streakCount||0)>=2) return true;
  if((G.gp||0)>=8){
    var gpv=G.gp||1;
    if((G.w||0)/gpv<0.36) return true;
  }
  return false;
}
/** Careless: “up” — confidence / hot streak (playoff spotlight bonus). */
function isCarelessRidingHigh(){
  if(G.xFactor!=='careless') return false;
  if(G.streakType==='W' && (G.streakCount||0)>=2) return true;
  if((G.morale||0)>=62) return true;
  return false;
}
/** Skater-only: PTS expectation by season phase (goalies: use goalie XP mult). */
function getXFactorSkaterPtsMult(region){
  if(G.pos==='G') return 1;
  region=region||'reg';
  var xf=G.xFactor||'none';
  if(xf==='clutch'){
    if(region==='reg') return 0.9;
    if(region==='playoff'||region==='world') return 1.1;
    return 1;
  }
  if(xf==='regular_season'){
    if(region==='reg') return 1.05;
    if(region==='playoff') return 0.88;
    if(region==='world') return 0.92;
    return 1;
  }
  if(xf==='careless'){
    if(region==='reg'){
      if(isCarelessSlumping()) return 0.78;
      return 0.94;
    }
    if(region==='playoff'||region==='world'){
      if(isCarelessSlumping()) return 0.93;
      if(isCarelessRidingHigh()) return 1.12;
      return 1.03;
    }
    return 1;
  }
  if(xf==='brat'){
    if(region==='reg') return 0.82;
    if(region==='playoff') return 1.14;
    if(region==='world') return 1.09;
    return 1;
  }
  if(xf==='hard_worker') return region==='reg'?1.03:1.01;
  if(xf==='smart_iq') return 1.025;
  if(xf==='elite_vision' && (G.pos==='F'||G.pos==='D')) return 1.045;
  if(xf==='quick_release' && G.pos==='F') return 1.065;
  if(xf==='good_stick' && G.pos==='D') return region==='playoff'?1.06:1.04;
  if(xf==='heavy_hitter' && (G.pos==='D'||G.pos==='F')) return region==='playoff'||region==='world'?1.08:1.02;
  return 1;
}
/** OVR contribution in playoff bracket sim (win odds + stat feel). */
function getXFactorPlayoffPowerMult(){
  var xf=G.xFactor||'none';
  if(xf==='clutch') return 1.08;
  if(xf==='regular_season') return 0.9;
  if(xf==='brat') return 1.1;
  if(xf==='careless'){
    if(isCarelessSlumping()) return 0.94;
    if(isCarelessRidingHigh()) return 1.08;
    return 1;
  }
  if(xf==='hard_worker') return 1.03;
  if(xf==='smart_iq'||xf==='elite_vision') return 1.02;
  if(xf==='quick_release') return G.pos==='F'?1.05:1;
  if(xf==='good_stick') return G.pos==='D'?1.07:1;
  if(xf==='heavy_hitter') return (G.pos==='D'||G.pos==='F')?1.06:1.03;
  return 1;
}
/** National team tournament win odds (sim path). */
function getXFactorWorldTeamPowerMult(){
  var xf=G.xFactor||'none';
  if(xf==='clutch') return 1.08;
  if(xf==='regular_season') return 0.92;
  if(xf==='hard_worker') return 1.03;
  if(xf==='careless'){
    if(isCarelessSlumping()) return 0.94;
    if(isCarelessRidingHigh()) return 1.08;
    return 1;
  }
  if(xf==='brat') return 1.04;
  if(xf==='smart_iq'||xf==='elite_vision') return 1.03;
  if(xf==='quick_release'&&G.pos==='F') return 1.04;
  if(xf==='good_stick'&&G.pos==='D') return 1.04;
  if(xf==='heavy_hitter') return 1.02;
  return 1;
}
/** Goalie XP from games — context-aware (clutch shines playoffs/world). */
function getXFactorGoalieXpMult(ctx){
  ctx=ctx||'reg';
  var xf=G.xFactor||'none';
  if(xf==='clutch'){
    if(ctx==='reg') return 0.93;
    if(ctx==='playoff'||ctx==='world') return 1.1;
    return 1;
  }
  if(xf==='regular_season'){
    if(ctx==='reg') return 1.05;
    if(ctx==='playoff'||ctx==='world') return 0.9;
    return 1;
  }
  if(xf==='hard_worker') return ctx==='reg'?1.06:1.03;
  if(xf==='smart_iq') return 1.03;
  if(xf==='careless'){
    if(ctx==='reg'){
      if(isCarelessSlumping()) return 0.82;
      return 0.94;
    }
    if(ctx==='playoff'||ctx==='world'){
      if(isCarelessSlumping()) return 0.93;
      if(isCarelessRidingHigh()) return 1.08;
      return 1.02;
    }
    return 1;
  }
  if(xf==='brat'){
    if(ctx==='reg') return 0.92;
    if(ctx==='playoff'||ctx==='world') return 1.05;
    return 1;
  }
  if(xf==='elite_vision'||xf==='quick_release'||xf==='good_stick') return 1;
  return 1;
}
/** Extra dampening on simmed PTS/G for women's circuits (PWL strongest). */
function getSimWomenLeagueScoringFactor(leagueKey, league){
  if(!league||league.gender!=='F') return 1;
  if(leagueKey==='PWL') return 0.82;
  if(leagueKey==='PWDL') return 0.9;
  if(league.tier==='pro') return 0.93;
  if(league.tier==='minor') return 0.94;
  return 0.96;
}
/** Extra scoring vs weak leagues when you tower above the league (e.g. elite in OJL). */
function simDominationScoringBoost(baseline,rel){
  if(rel<=0.25) return 0;
  if(baseline<=62) return cl(rel*0.5,0,1.35);
  if(baseline<=65) return cl(rel*0.38,0,1.05);
  if(baseline<=68) return cl(rel*0.22,0,0.75);
  if(baseline<=72 && rel>0.65) return cl((rel-0.45)*0.35,0,0.55);
  return 0;
}
function simSkaterGoalAssistSplit(totalPts, perfBias, won){
  var out={g:0,a:0};
  if(totalPts<=0) return out;
  var pGoal=0.34;
  if(G.pos==='D'){
    pGoal=0.19;
    var da=G.arch||'';
    if(da==='OffensiveD') pGoal=0.26;
    else if(da==='TwoWayD') pGoal=0.18;
    else if(da==='StayAtHome'||da==='ShutdownD') pGoal=0.1;
  } else {
    // All forward positions use the same goal vs assist mix; centres earn more total points in simWeek().
    pGoal=0.32;
    var fa=G.arch||'';
    if(fa==='Sniper'||fa==='PowerForward') pGoal+=0.07;
    if(fa==='Playmaker') pGoal-=0.08;
    if(fa==='TwoWay') pGoal-=0.04;
    if(fa==='Grinder'||fa==='Enforcer') pGoal-=0.09;
  }
  if((G.xFactor==='elite_vision'||G.xFactor==='smart_iq') && (G.pos==='F'||G.pos==='D')) pGoal-=0.07;
  if(G.xFactor==='quick_release' && G.pos==='F') pGoal+=0.09;
  if(G.xFactor==='good_stick' && G.pos==='D') pGoal-=0.05;
  pGoal=cl(pGoal+perfBias*0.035+(won?0.025:-0.02),0.11,0.46);
  for(var p=0;p<totalPts;p++){
    if(Math.random()<pGoal) out.g++;
  }
  out.a=totalPts-out.g;
  return out;
}

function simWeek(){
  if(G._playoffCtx&&G._playoffCtx.active) return;
  var perWeek=getGamesPerWeek(G.leagueKey);
  var weekStart=(G.week-1)*perWeek;
  var weeklyStats={g:0,a:0,w:0,l:0,otl:0,pm:0,staminaLoss:0,sv:0,ga:0,pressHits:0,backupNights:0};
  var teamGamesSimmed=0;
  var playerGamesSimmed=0;
  var missedInjuryGames=0;
  var baseline=getLeagueBaselineOvr(G.leagueKey);
  for(var i=G.weekGames;i<perWeek;i++){
    var opp=G.allOpponents[weekStart+i];
    if(!opp){
      console.warn('simWeek: missing opp index', weekStart+i);
      continue;
    }
    curOpponent=opp;
    G._curGameIdx=i;
    if(G.pos==='G'&&!G.isInjured){
      var _gMask=ensureGoalieStartMask();
      if(_gMask&&!_gMask[i]){
        simBackupGoalieNight(opp,i,weeklyStats);
        G.weekGames++;
        teamGamesSimmed++;
        continue;
      }
    }
    if(G.isInjured){
      var injHome=ri(1,4);
      var injAway=ri(1,5);
      var injWon=injHome>injAway;
      var injTied=injHome===injAway;
      if(injWon){G.w++;weeklyStats.w++;} else if(injTied){G.otl++;weeklyStats.otl++;} else {G.l++;weeklyStats.l++;}
      var prevInjType=G.streakType||'none';
      if(injWon){
        G.streakType='W';
        G.streakCount=(prevInjType==='W'?G.streakCount:0)+1;
      } else if(injTied){
        G.streakType='OTL';
        G.streakCount=(prevInjType==='OTL'?G.streakCount:0)+1;
      } else {
        G.streakType='L';
        G.streakCount=(prevInjType==='L'?G.streakCount:0)+1;
      }
      var injSc=injHome+'-'+injAway;
      addNews(G.team.n+' '+injSc+' vs '+opp.n+' -- '+(injWon?'WIN':injTied?'OTL':'LOSS')+' [DNP -- INJURED]',(injWon?'neutral':'bad'));
      G.weekGames++;
      teamGamesSimmed++;
      missedInjuryGames++;
      continue;
    }
    // Simulate game
    var playerOvr=ovr(G.attrs);
    var leagueDev=G.league.dev||1.0;
    var rel=(playerOvr-baseline)/20; // Relative to league average: same OVR means different value by tier.
    var perfBias=cl(rel,-1.2,1.4);
    // Keep sim competitive, but avoid overly punishing team results.
    var teamBase=2.35 + perfBias*0.62 + rd(-1.0,1.1);
    var oppBase=2.35 - perfBias*0.28 + rd(-1.0,1.0);
    gameHomeScore=Math.max(0,Math.round(teamBase));
    gameAwayScore=Math.max(0,Math.round(oppBase));
    gameStats={g:0,a:0,sog:0,block:0,sv:0,ga:0,pm:0};
    if(G.pos==='G'){
      var totalShots=ri(24,38);
      var svRate=cl(0.89 + perfBias*0.016 + (leagueDev-1)*0.008 + rd(-0.012,0.01),0.83,0.955);
      var saves=Math.round(totalShots*svRate);
      var ga=totalShots-saves;
      gameStats.sv=saves;
      gameStats.ga=ga;
      gameHomeScore=Math.max(0,Math.round(2.7 + perfBias*0.28 + rd(-1.0,1.0)));
      gameAwayScore=ga;
      gameStats.pm=0;
    } else {
      var dTier=getSimDefenseScoringTier();
      var maxThisGame=getSimMaxPointsPerGame(perWeek,dTier);
      var relSkill=(playerOvr-baseline)/20;
      var ptSkill=cl(relSkill*1.22,-0.9,2.85);
      var domBoost=simDominationScoringBoost(baseline,relSkill);
      // Centres: more touches / PP time -> higher point expectation; same G/A ratio as wings (split above).
      var centreBoost=(dTier==='F'&&(G.subPos||'')==='C')?0.28:0;
      var expGamePts;
      if(dTier==='F'){
        // Forwards: strong weeks often land 6-9 PTS/week in 3-4 GP when hot vs league.
        var fwdCore=0.48+ptSkill*0.98+centreBoost+domBoost+rd(0,0.82);
        expGamePts=cl(fwdCore,0,maxThisGame);
        if(ptSkill>=1.0 && Math.random()<cl(0.1+ptSkill*0.1+domBoost*0.14,0.08,0.38)){
          expGamePts=cl(expGamePts+ri(1,2),0,maxThisGame);
        }
      } else if(dTier==='Doff'){
        var offDCore=0.66+ptSkill*0.36+domBoost*0.3+rd(0,0.48);
        expGamePts=cl(offDCore,0,maxThisGame);
        if(ptSkill>=0.95 && Math.random()<0.16) expGamePts=cl(expGamePts+1,0,maxThisGame);
      } else if(dTier==='Dtwo'){
        expGamePts=cl(0.4+ptSkill*0.26+domBoost*0.18+rd(0,0.36),0,maxThisGame);
      } else if(dTier==='Dmin'){
        expGamePts=cl(0.12+ptSkill*0.12+domBoost*0.07+rd(0,0.22),0,maxThisGame);
      } else {
        expGamePts=cl(0.22+ptSkill*0.2+domBoost*0.12+rd(0,0.28),0,maxThisGame);
      }
      var wSimFac=getSimWomenLeagueScoringFactor(G.leagueKey,G.league);
      expGamePts=cl(expGamePts*wSimFac*getXFactorSkaterPtsMult('reg'),0,maxThisGame);
      var gamePts=Math.min(maxThisGame,Math.max(0,Math.round(expGamePts+rd(-0.35,0.55))));
      var gaSplit=simSkaterGoalAssistSplit(gamePts,perfBias,gameHomeScore>gameAwayScore);
      gameStats.g=gaSplit.g;
      gameStats.a=gaSplit.a;
      gameStats.sog=Math.max(1,Math.round(ri(2,5)+gamePts+perfBias*0.9));
      var blk=G.pos==='D'?ri(0,3):ri(0,2);
      if(G.xFactor==='good_stick'&&G.pos==='D') blk+=Math.random()<0.48?1:0;
      if(G.xFactor==='heavy_hitter'&&(G.pos==='D'||G.pos==='F')) blk+=Math.random()<0.24?1:0;
      if(G.xFactor==='careless'&&isCarelessSlumping()&&(G.pos==='D'||G.pos==='F')&&Math.random()<0.38) blk=Math.max(0,blk-1);
      gameStats.block=blk;
      // Smoother +/-; defensemen get a stronger two-way / shutdown tilt.
      var defSkill=((G.attrs.mental||60)+(G.attrs.physical||60)-120)/30;
      var defBias=(G.pos==='D'?0.88:0) + cl(defSkill,-0.6,0.9)*(G.pos==='D'?0.42:0.35) + (gameStats.block>=2?(G.pos==='D'?0.42:0.3):0) + (G.pos==='D'&&gameStats.block>=1?0.18:0);
      var rawPm=(gameHomeScore>gameAwayScore?1:gameHomeScore<gameAwayScore?-1:0) + ((gameStats.g+gameStats.a)>=2?1:0) + defBias + rd(-0.62,0.62);
      gameStats.pm=cl(rawPm,-2,G.pos==='D'?3:2);
    }
    // Light team-support tilt: close games can swing either way, but less often against the player.
    if(gameHomeScore===gameAwayScore && Math.random()<0.58) gameHomeScore++;
    if(gameAwayScore===gameHomeScore+1 && Math.random()<0.22) gameHomeScore++;
    var won=gameHomeScore>gameAwayScore;
    var tied=gameHomeScore===gameAwayScore;
    G.gp++;G.cGP++;
    if(won){G.w++;weeklyStats.w++;} else if(tied){G.otl++;weeklyStats.otl++;} else {G.l++;weeklyStats.l++;}
    var prevType=G.streakType||'none';
    if(won){
      G.streakType='W';
      G.streakCount=(prevType==='W'?G.streakCount:0)+1;
    } else if(tied){
      G.streakType='OTL';
      G.streakCount=(prevType==='OTL'?G.streakCount:0)+1;
    } else {
      G.streakType='L';
      G.streakCount=(prevType==='L'?G.streakCount:0)+1;
    }
    var gRnd=Math.round(gameStats.g);
    var aRnd=Math.round(gameStats.a);
    G.goals+=gRnd;G.assists+=aRnd;G.cGoals+=gRnd;G.cAssists+=aRnd;
    weeklyStats.g+=gRnd;weeklyStats.a+=aRnd;
    G.sog+=Math.round(gameStats.sog);G.cSOG+=Math.round(gameStats.sog);
    G.saves+=gameStats.sv;G.cSaves+=gameStats.sv;
    if(G.pos==='G'){G.goalsAgainst=(G.goalsAgainst||0)+gameStats.ga;G.cGoalsAgainst=(G.cGoalsAgainst||0)+gameStats.ga; weeklyStats.sv+=gameStats.sv; weeklyStats.ga+=gameStats.ga;}
    var pm=Math.round(gameStats.pm||0);G.plusminus+=pm;
    weeklyStats.pm+=pm;
    var staminaLoss=ri(5,15);
    G.stamina=cl(G.stamina-staminaLoss,0,100);
    weeklyStats.staminaLoss+=staminaLoss;
    var md=won?3:tied?1:-3;
    if(G.xFactor==='careless'){
      if(won) md=2;
      else if(tied) md=1;
      else md=0;
    }
    G.morale=cl(G.morale+md,0,100);
    if(G.pos==='G'){
      G.xp+=Math.round(ri(9,22)*getXFactorGoalieXpMult('reg')*getPotentialXpMult(G.potential||'support'));
    } else {
      G.xp+=Math.round(ri(14,30)*getPotentialXpMult(G.potential||'support'));
    }
    if(!G.isInjured&&Math.random()<(G.xFactor==='careless'?0.022:0.012)) triggerInjury();
    var sc=gameHomeScore+'-'+gameAwayScore;
    addNews(G.team.n+' '+sc+' vs '+opp.n+' -- '+(won?'WIN':tied?'OTL':'LOSS')+' [SIMULATED]',(won?'good':tied?'neutral':'bad'));
    if(gRnd>=2) addNews(G.first+' '+G.last+' scores '+gRnd+' -- multi-goal game!','big');
    if(aRnd>=2) addNews(G.first+' '+G.last+' picks up '+aRnd+' assists -- playmaking night!','big');
    addSimMediaMoment(won, gameStats, opp);
    var svpctSim=gameStats.sv+gameStats.ga>0?gameStats.sv/(gameStats.sv+gameStats.ga):0;
    var simPerfN=blendedGamePerformanceNumeric(G.pos,gRnd,aRnd,svpctSim,won,72);
    if(typeof G.cSimPerfSum!=='number') G.cSimPerfSum=0;
    if(typeof G.cSimPerfCount!=='number') G.cSimPerfCount=0;
    G.cSimPerfSum+=simPerfN;
    G.cSimPerfCount++;
    if(G.xFactor==='brat'&&G.pos!=='G'&&won&&Math.random()<0.14){
      addNews('AFTER THE WHISTLE: '+G.last+' gets under the other bench -- they take a frustration penalty.','neutral');
    }
    if(G.xFactor==='heavy_hitter'&&(G.pos==='D'||G.pos==='F')&&Math.random()<0.07){
      addNews('ROUGHING AFTER THE PLAY -- '+G.last+' finishes the hit, sits two minutes.','bad');
      G.morale=cl(G.morale-1,0,100);
    }
    if(Math.random()<0.2) weeklyStats.pressHits++;
    if(G.standings){
      for(var s=0;s<G.standings.length;s++){
        if(G.standings[s].isMe){
          G.standings[s].gp=G.gp;
          G.standings[s].w=G.w;
          G.standings[s].l=G.l;
          G.standings[s].otl=G.otl;
          G.standings[s].pts=G.w*2+G.otl;
          break;
        }
      }
    }
    G.weekGames++;
    teamGamesSimmed++;
    playerGamesSimmed++;
  }
  if(missedInjuryGames>0 && G.injWks>0){
    G.injWks--;
    if(G.injWks<=0){
      G.injWks=0;
      G.isInjured=false;
      addNews(G.first+' '+G.last+' cleared from injury -- back in the lineup!','good');
      notify('BACK IN ACTION!','green');
    }
  }
  // Calculate weekly grade
  var totalPts=weeklyStats.g+weeklyStats.a;
  var avgPts=playerGamesSimmed>0?totalPts/playerGamesSimmed:0;
  var weeklyGrade;
  if(G.pos==='G'){
    var avgSvPct= weeklyStats.sv + weeklyStats.ga > 0 ? weeklyStats.sv / (weeklyStats.sv + weeklyStats.ga) : 0;
    weeklyGrade = avgSvPct >= 0.93 ? 'A+' : avgSvPct >= 0.91 ? 'A' : avgSvPct >= 0.885 ? 'B' : 'C';
  } else if(G.pos==='D'){
    weeklyGrade = avgPts >= 1.55 ? 'A+' : avgPts >= 1.05 ? 'A' : avgPts >= 0.52 ? 'B' : 'C';
  } else {
    weeklyGrade = avgPts >= 2.35 ? 'A+' : avgPts >= 1.65 ? 'A' : avgPts >= 0.92 ? 'B' : 'C';
  }
  if(playerGamesSimmed===0 && missedInjuryGames>0) weeklyGrade='--';
  // Build summary
  var html='<div>WEEK '+G.week+' SUMMARY</div>';
  html+='<div>Team Games: '+teamGamesSimmed+' | Your starts (GP): '+playerGamesSimmed+'</div>';
  if(G.pos==='G'&&(weeklyStats.backupNights||0)>0) html+='<div>Backup nights (no GP): '+weeklyStats.backupNights+'</div>';
  if(missedInjuryGames>0) html+='<div>DNP (Injury): '+missedInjuryGames+' game(s)</div>';
  if(G.pos==='G'){
    var weekSv=weeklyStats.sv, weekGa=weeklyStats.ga;
    var weekSvPct=weekSv+weekGa>0?(Math.round((weekSv/(weekSv+weekGa))*1000)/10)+'%':'--';
    var weekGaa=playerGamesSimmed>0?Math.round((weekGa/playerGamesSimmed)*100)/100:'--';
    html+='<div>SV: '+weekSv+' | GA: '+weekGa+' | SV%: '+weekSvPct+' | GAA: '+weekGaa+'</div>';
  } else {
    html+='<div>G: '+weeklyStats.g+' | A: '+weeklyStats.a+' | PTS: '+totalPts+' | +/-: '+(weeklyStats.pm>0?'+':'')+weeklyStats.pm+'</div>';
  }
  html+='<div>W: '+weeklyStats.w+' | L: '+weeklyStats.l+' | OTL: '+weeklyStats.otl+'</div>';
  var streakLabel=G.streakType==='none'?'--':(G.streakType+G.streakCount);
  html+='<div>Streak: '+streakLabel+' | Media Events: '+weeklyStats.pressHits+'</div>';
  html+='<div>Stamina Loss: -'+weeklyStats.staminaLoss+'</div>';
  if(G.pos==='G'){
    var ssnF=(G.saves||0)+(G.goalsAgainst||0);
    var ssnPct=ssnF>0?(Math.round((G.saves/ssnF)*1000)/10)+'%':'--';
    html+='<div style="font-size:13px;color:var(--gold);margin-top:8px;border-top:1px solid rgba(122,184,224,.12);padding-top:6px">SEASON: '+G.gp+' GP &mdash; '+G.saves+' SV &middot; '+ssnPct+'</div>';
  } else {
    html+='<div style="font-size:13px;color:var(--gold);margin-top:8px;border-top:1px solid rgba(122,184,224,.12);padding-top:6px">SEASON: '+G.gp+' GP &mdash; '+(G.goals+G.assists)+' PTS ('+G.goals+'G '+G.assists+'A)</div>';
  }
  html+='<div>';
  html+='<div style="font-size:18px;color:'+(weeklyGrade==='A+'?'gold':weeklyGrade==='A'?'green':weeklyGrade==='B'?'orange':'gray')+'">'+weeklyGrade+'</div>';
  html+='<div>WEEKLY GRADE</div></div>';
  var el = document.getElementById('m-weeksummary-body');
  if(el) el.innerHTML=html;
  openM('m-weeksummary');
  _pendingWeekSummaryCallback=(function(ws){
    return function(){
      var wonWeek=ws.w > ws.l + ws.otl;
      var wg=ws.g, wa=ws.a;
      setTimeout(function(){
        maybeTriggerPostGamePressOnce(wonWeek, wg, wa);
        setTimeout(function(){ maybeTriggerTrade(wg, wa, wonWeek); }, 500);
      },220);
    };
  })(weeklyStats);
}

function closeWeekSummary(){
  closeM('m-weeksummary');
  var cb=_pendingWeekSummaryCallback;
  _pendingWeekSummaryCallback=null;
  if(typeof cb==='function') cb();
  nextWeek();
}
