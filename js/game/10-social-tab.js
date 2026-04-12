/* breakaway — SOCIAL TAB */
// ============================================================
// SOCIAL TAB
// ============================================================
function generateSocialMessages(){
  var msgs=[];
  var isWomens=G.gender==='F';
  var pts=G.goals+G.assists;
  var svPctNow=G.saves+(G.goalsAgainst||0)>0?(G.saves/(G.saves+(G.goalsAgainst||0))):0;
  var o=ovr(G.attrs);
  var namePool=G.gender==='M'?SOCIAL_NAMES_M:SOCIAL_NAMES_F;
  var names=shuf(namePool.slice()).slice(0,8);
  var coach=COACH_NAMES[ri(0,COACH_NAMES.length-1)];
  var fansUsed=shuf(FAN_HANDLES.slice()).slice(0,7);
  var haterHandles=['AnonymousPuck','BenchCritic99','OverratedWatchers','HockeyHaters_','RealTalkArena','IceTrollDaily','TradeHimNow_','BardownTrolls','ShiftWatcher404','NoClutchZone','BenchHimTonight','TapeRoomBurner'];
  var haterHandle=haterHandles[ri(0,haterHandles.length-1)];

  // === TEAMMATES ===
  if((G.pos==='G'&&G.gp>=8&&svPctNow>=0.91)||(G.pos!=='G'&&pts>=10)){
    msgs.push({type:'teammate',sender:names[0],handle:makeTeammateHandle(names[0],0),
      text:G.pos==='G'
        ? 'That stretch you\'re on is something else. '+G.saves+' saves and a '+(Math.round(svPctNow*1000)/10)+' SV%. Keep that energy going.'
        : 'That stretch you\'re on is something else. '+G.goals+'G '+G.assists+'A. Keep that energy going.',mood:'good',idx:msgs.length});
  } else {
    msgs.push({type:'teammate',sender:names[0],handle:makeTeammateHandle(names[0],0),
      text:'Been grinding with you every shift. Your work in the corners doesn\'t show up on the scoresheet but we all see it.',mood:'neutral',idx:msgs.length});
  }
  if(G.morale>=75){
    msgs.push({type:'teammate',sender:names[1],handle:makeTeammateHandle(names[1],1),
      text:'Love the energy you bring to practice. Whole squad is feeding off it.',mood:'good',idx:msgs.length});
  } else if(G.morale<50){
    msgs.push({type:'teammate',sender:names[1],handle:makeTeammateHandle(names[1],1),
      text:'Hey -- rough stretch. Happens to everyone. Come find me before practice. We\'ll work through it.',mood:'neutral',idx:msgs.length});
  } else {
    msgs.push({type:'teammate',sender:names[1],handle:makeTeammateHandle(names[1],11),
      text:'Line chemistry is clicking right now. When you\'re in that zone on the rush it\'s a different game.',mood:'good',idx:msgs.length});
  }
  msgs.push({type:'teammate',sender:names[2],handle:makeTeammateHandle(names[2],2),
    text:'Playing on your line is making me better. That '+(G.pos==='F'?'vision on the rush':'gap control in the d-zone')+' -- actually insane.',mood:'good',idx:msgs.length});
  msgs.push({type:'teammate',sender:names[3],handle:makeTeammateHandle(names[3],3),
    text:'Room service or the steakhouse tonight? Your call, #'+G.jersey+'. You earned it this week.',mood:'good',idx:msgs.length});
  if(G.isInjured){
    msgs.push({type:'teammate',sender:names[4],handle:makeTeammateHandle(names[4],4),
      text:'Get healthy. We\'ll hold it down. The room misses having #'+G.jersey+' out there.',mood:'neutral',idx:msgs.length});
  }
  if(G.season>=3){
    msgs.push({type:'teammate',sender:names[5]||names[0],handle:makeTeammateHandle(names[5]||names[0],5),
      text:''+ri(3,5)+' seasons in this league and I\'ve played with some talent. '+G.first+' -- you\'re one of the best I\'ve lined up with.',mood:'good',idx:msgs.length});
  }

  // === COACHING STAFF ===
  var strongSeasonLine=(G.pos==='G' ? (G.gp>=8&&svPctNow>=0.91) : pts>=8);
  msgs.push({type:'staff',sender:coach,handle:makeStaffHandle('Head Coach'),
    text:strongSeasonLine?'Film session confirmed what the numbers show -- you\'ve been excellent. Scouts are watching every shift.':
      'Need more consistency in your '+(G.pos==='G'?'post integration on short-side shots.':'neutral zone reads.')+' Good effort, just need the details locked in.',mood:strongSeasonLine?'good':'neutral',idx:msgs.length});
  msgs.push({type:'staff',sender:'Asst GM Pearce',handle:makeStaffHandle('Management'),
    text:G.contractYrsLeft<=1?'We want to get your situation sorted well before the deadline. You\'re a priority for this organization.':
      'You\'re exactly what we envisioned when we brought you in. Building something real here.',mood:G.contractYrsLeft<=1?'neutral':'good',idx:msgs.length});
  msgs.push({type:'staff',sender:'Skills Coach Tanaka',handle:makeStaffHandle('Development'),
    text:'Been watching your '+(G.pos==='G'?'lateral movement on the short side -- real improvement this week.':G.pos==='D'?'gap control in the d-zone. Noticed a big jump in your reads.':'release on the '+(G.hand==='L'?'forehand snap.':'backhand.')+' Work is paying off.'),mood:'good',idx:msgs.length});
  msgs.push({type:'staff',sender:'Trainer Morneau',handle:makeStaffHandle('Medical'),
    text:G.health<70?'Let\'s be smart about load management this week. Your body needs to be right for the stretch run.':'Recovery numbers are excellent. Whatever you\'re doing this offseason -- keep doing it.',mood:G.health<70?'neutral':'good',idx:msgs.length});
  if(G.season>=2){
    msgs.push({type:'staff',sender:'Scout Horowitz',handle:makeStaffHandle('Scouting'),
      text:'Kept your name in our reports since you came up. '+G.first+' '+G.last+' -- #'+G.jersey+' -- is a player. National teams are going to come calling.',mood:'good',idx:msgs.length});
  }

  // Pro media pressure when struggling (rarer in women's game — newer league, less legacy toxicity)
  if(G.league.tier==='pro' && G.gp>0 && (G.w/G.gp) < 0.43){
    if(!isWomens || Math.random()<0.32){
      msgs.push({type:'staff',sender:'Hockey Analyst -- TSN',handle:'@MediaMaven',
        text:'Tough stretch in '+G.league.short+' for #'+G.jersey+'. Is confidence cracking? Fans want answers now.',mood:'bad',idx:msgs.length});
      msgs.push({type:'fan',sender:'@IceTimeInsider',handle:'@IceTimeInsider',
        text:'Every loss has us screaming for a lineup shake. #'+G.jersey+' is in the hot seat.',mood:'bad',idx:msgs.length});
      var phlFishbowl=!isWomens&&G.leagueKey==='PHL'&&isPhlBigMarketTeamName(G.team&&G.team.n);
      if(!isWomens && (phlFishbowl?Math.random()<0.88:Math.random()<0.62)){
        msgs.push({type:'fan',sender:'SportsRadio '+ri(1,9)+'AM',handle:'@DriveTimeHotTake',
          text:'Caller pile-on: "'+G.last+' is why we can\'t close." Lines jammed — hosts say the market is "done making excuses" for #'+G.jersey+'.',mood:'bad',idx:msgs.length});
      }
    } else {
      msgs.push({type:'fan',sender:fansUsed[0],handle:fanHandleVariant(fansUsed[0],0),
        text:'Rough patch for the team but #'+G.jersey+' is still driving play — fans who watch every shift see it. Stay with them.',mood:'good',idx:msgs.length});
    }
  }

  // === FANS === (men: more skepticism / pressure; women: warmer default mix)
  if(isWomens){
    msgs.push({type:'fan',sender:fansUsed[0],handle:fanHandleVariant(fansUsed[0],0),
      text:'#'+G.jersey+' '+G.last+' is my favourite player on this roster rn. Every game something happens with that kid.',mood:'good',idx:msgs.length});
    if(o>=75){
      msgs.push({type:'fan',sender:fansUsed[1],handle:fanHandleVariant(fansUsed[1],1),
        text:'People genuinely sleep on '+G.first+' '+G.last+' but if you watch every shift they are doing something elite. Top player in this league fr.',mood:'good',idx:msgs.length});
    }
    msgs.push({type:'fan',sender:fansUsed[2],handle:fanHandleVariant(fansUsed[2],2),
      text:(G.hometown?'Kid from '+G.hometown+' making it in the '+G.league.short+'. ':'')+g_fanStat()+' Love watching this player.',mood:'good',idx:msgs.length});
    if(G.wonCup||G.careerCups>0){
      msgs.push({type:'fan',sender:fansUsed[3],handle:fanHandleVariant(fansUsed[3],3),
        text:'CHAMPION. '+G.last+' has that winner DNA. Straight up.',mood:'good',idx:msgs.length});
    } else {
      msgs.push({type:'fan',sender:fansUsed[3],handle:fanHandleVariant(fansUsed[3],3),
        text:'Hope this team gets '+G.last+' some hardware. Deserves to be on a winner. Do something management.',mood:'neutral',idx:msgs.length});
    }
    msgs.push({type:'fan',sender:fansUsed[4],handle:fanHandleVariant(fansUsed[4],4),
      text:'Caught the game last night. That play in the '+(ri(0,1)?'second':'third')+' period by #'+G.jersey+' -- standing ovation from our section. What a sequence.',mood:'good',idx:msgs.length});
  } else {
    var mFan1=Math.random()<0.42;
    msgs.push({type:'fan',sender:fansUsed[0],handle:fanHandleVariant(fansUsed[0],0),
      text:mFan1?('#'+G.jersey+' '+G.last+' — fine player. But this market wants playoff proof, not "good process" quotes.'):
        ('#'+G.jersey+' '+G.last+' is my favourite player on this roster rn. Every game something happens with that kid.'),mood:mFan1?'neutral':'good',idx:msgs.length});
    if(o>=75&&Math.random()<0.52){
      msgs.push({type:'fan',sender:fansUsed[1],handle:fanHandleVariant(fansUsed[1],1),
        text:'People genuinely sleep on '+G.first+' '+G.last+' but if you watch every shift they are doing something elite. Top player in this league fr.',mood:'good',idx:msgs.length});
    } else if(o>=75){
      msgs.push({type:'fan',sender:fansUsed[1],handle:fanHandleVariant(fansUsed[1],1),
        text:'High OVR, big hype — where are the signature wins? The league is watching the next "empty numbers" story.',mood:'bad',idx:msgs.length});
    }
    var mFan3=Math.random()<0.48;
    msgs.push({type:'fan',sender:fansUsed[2],handle:fanHandleVariant(fansUsed[2],2),
      text:mFan3?((G.hometown?'Kid from '+G.hometown+' — ':'')+'I\'m not seeing consistent impact shift-to-shift. '+G.league.short+' is unforgiving.'):
        ((G.hometown?'Kid from '+G.hometown+' making it in the '+G.league.short+'. ':'')+g_fanStat()+' Love watching this player.'),mood:mFan3?'neutral':'good',idx:msgs.length});
    if(G.wonCup||G.careerCups>0){
      msgs.push({type:'fan',sender:fansUsed[3],handle:fanHandleVariant(fansUsed[3],3),
        text:'CHAMPION. '+G.last+' has that winner DNA. Straight up.',mood:'good',idx:msgs.length});
    } else {
      var cynicalHope=Math.random()<0.45;
      msgs.push({type:'fan',sender:fansUsed[3],handle:fanHandleVariant(fansUsed[3],3),
        text:cynicalHope?('Another year, same story for '+G.last+'. '+G.team.n+' pays for stars — fans pay for wins.'):
          ('Hope this team gets '+G.last+' some hardware. Deserves to be on a winner. Do something management.'),mood:cynicalHope?'bad':'neutral',idx:msgs.length});
    }
    var mFan5=Math.random()<0.5;
    msgs.push({type:'fan',sender:fansUsed[4],handle:fanHandleVariant(fansUsed[4],4),
      text:mFan5?('Last night: one good shift, three quiet ones. That\'s the book on #'+G.jersey+' until it isn\'t.'):
        ('Caught the game last night. That play in the '+(ri(0,1)?'second':'third')+' period by #'+G.jersey+' -- standing ovation from our section. What a sequence.'),mood:mFan5?'neutral':'good',idx:msgs.length});
    var menLoveNeutral=shuf([
      {t:'Not always pretty but #'+G.jersey+' competes. That\'s my guy.',m:'good'},
      {t:'Quietly putting up useful minutes — '+G.last+' does the dirty work.',m:'good'},
      {t:'Weather forecast: hate in the mentions. I still think '+G.first+' brings it.',m:'good'},
      {t:'Neutral take: '+G.last+' is fine. Not a superstar, not a liability — just a pro.',m:'neutral'},
      {t:'Split fanbase on '+G.last+' but I\'m watching the same shifts as the haters — calmer than the noise.',m:'neutral'},
      {t:'Box score watchers vs eye-test crowd fighting again. I\'m just here for the hockey.',m:'neutral'},
      {t:'Love the way #'+G.jersey+' draws penalties. Smart hockey.',m:'good'},
      {t:'Road trip grind — '+G.first+' still showing up. Respect.',m:'good'}
    ].slice());
    for(var mi=0;mi<4;mi++){
      var row=menLoveNeutral[mi]; if(!row) break;
      var fh=FAN_HANDLES[ri(0,FAN_HANDLES.length-1)];
      msgs.push({type:'fan',sender:fh,handle:fanHandleVariant(fh,20+mi),
        text:row.t,mood:row.m==='good'?'good':'neutral',idx:msgs.length});
    }
    msgs.push({type:'fan',sender:'HockeyBiz Podcast',handle:'@HockeyBizPod',
      text:Math.random()<0.55?('Rant segment: "'+G.last+' is the problem" — co-host pushes back: "You\'re being ridiculous." Debate gets heated.'):
        ('Segment idea: fair or foul to call '+G.first+' "polarizing"? Chat is split 60/40.'),mood:'neutral',idx:msgs.length});
  }

  // === CRITICS, RIVALS & HATERS (men's side: heavier; women's: newer scene — more growth/support, fewer pile-ons) ===
  var critic=CRITIC_NAMES[ri(0,CRITIC_NAMES.length-1)];
  var rivalName=getRandomTalentName();
  var haterHandles2=['AnonymousPuck','BenchCritic99','OverratedWatchers','HockeyHaters_','RealTalkArena','IceTrollDaily','TradeHimNow_','BardownTrolls','ShiftWatcher404','NoClutchZone','BenchHimTonight','TapeRoomBurner','xGPolice','PuckWatcherLive'];

  // Professional critic (credible, measured but harsh)
  var proComments=[
    'Watched the tape from the last four games. '+G.last+'\'s defensive zone reads are a liability at this level. The offensive numbers are there but the two-way game needs serious work.',
    'I\'ve been critical of the '+G.first+' '+G.last+' hype for a while. Good player -- not a franchise piece. There\'s a difference and the numbers back that up at crunch time.',
    'Here\'s an honest take: '+G.last+' plays big in easy matchups and goes quiet against top competition. That trend is too consistent to ignore now.',
    G.pos==='G'?'The save percentage looks okay on paper but the quality-adjusted numbers on '+G.last+' are concerning. Facing third-line shots at a high rate inflates that stat considerably.':
      'Tracking '+G.last+'\'s shifts over the last three weeks -- the defensive zone starts tell a story the boxscore doesn\'t. Possession numbers are below average.',
    'I don\'t doubt the effort. What I question is whether '+G.first+' '+G.last+' has the hockey sense to be a consistent contributor against quality opposition. The jury is still out.',
    'At this stage of development, you want to see more from '+G.last+'. The foundation is there but too many games where the impact just isn\'t there.',
    'Special teams tape is rough this month. Coaches will tolerate mistakes -- not repeated ones. '+G.last+' is on notice.',
    'The offensive flashes are obvious, but I need to see details shift-to-shift before calling '+G.last+' a true top-line impact player.'
  ];

  // Rival player trash talk (another player in the league)
  var rivalComments=[
    'Keep seeing '+G.last+' getting praised. Come play at our end of the ice for a shift and we\'ll see.',
    'No disrespect but '+G.last+'\'s numbers against our team are pretty telling. Some players just don\'t show up.',
    'People compare me to '+G.last+'? I\'ll let the points do the talking. Check the head-to-head.',
    G.pos==='G'?rivalName+' here -- scored twice last time we played '+G.last+'. Just saying.':
      rivalName+' -- I\'ve outscored '+G.last+' in every head-to-head this season. Media loves the narrative though.',
    'Play us in a tight one and see who actually wins the 50/50 battles. Talk is cheap.'
  ];

  // Troll / random online hater
  var trollComments=[
    'Overrated. There I said it. Stats are padded and everyone in the building knows it.',
    'How does #'+G.jersey+' still have a job? Watching beer league on Sundays I see better.',
    'Trade bait at best. '+G.team.n+' should move on and get someone who shows up in big games.',
    'Every time the game actually matters, '+G.last+' disappears. Classic regular season stat padder.',
    pts<5?G.goals+'G '+G.assists+'A this season is genuinely embarrassing. Replacement-level output.':'Lucky bounces. Anyone could put those numbers up with those linemates on a soft schedule.',
    'Media builds these narratives around average players every year. '+G.last+' is fine. Nothing special.',
    'Not going to @ them but if you watch the actual hockey it\'s pretty clear '+G.last+' gets bailed out constantly.',
    'Every analytics account says the same thing: empty calories production.',
    'If this is a "future star", the bar is on the floor.'
  ];
  var menExtraTrolls=[
    'Your contract is a cap crime. '+G.last+' should donate half the AAV to charity and ride the bus.',
    'Soft. No jam. '+G.team.n+' fans deserve a real competitor — not a highlight-reel coward.',
    'National TV every time you touch the puck for the wrong reasons. Embarrassing brand for the logo.',
    'Dressing room source (allegedly): players tired of the act. Media circling. Tick tock.',
    'PP1 minutes and you still ghost when the building gets loud. Spare us the "process" quotes.',
    'Hope '+G.last+' enjoys cashing cheques — because nobody\'s cashing wins on his account.',
    'I\'d rather ice a bag of pucks than watch another coast-to-coast turnover from #'+G.jersey+'.',
    'Tell your agent to stop begging for All-Star votes. The tape is ugly.',
    'You get outworked by AHL call-ups. '+G.team.n+' should be embarrassed to dress you.',
    'Zero killer instinct. '+G.first+' plays like the game owes him something.',
    'Your own mother would boo that defensive effort. Brutal.',
    'Trade him for futures. I mean it. '+G.last+' is a luxury this team can\'t afford to lose with.',
    'Keyboard warriors? Nah — real fans in the building are DONE with this act.',
    'Injury-prone, drama-prone, scoreboard-absent. Triple threat.',
    'If "almost" paid rent, '+G.last+' would own the city. But it doesn\'t.'
  ];
  var menTabloid=[
    'TABLOID: "'+G.last+'\'s inner circle \'split\' on whether the star is committed" — anonymous quotes everywhere.',
    'THREAD: 4K quote-tweets dragging '+G.first+' for last night\'s interview. Comms already drafting a statement.',
    'Podcast clip going viral: "Is '+G.last+' actually a winning player or just marketing?" Debate is ugly.'
  ];

  if(isWomens){
    var growSupport=shuf([
      'Women\'s hockey keeps climbing and '+G.first+' '+G.last+' is a huge reason people tune in — pace, skill, compete every night.',
      'So proud our city gets to watch '+G.last+' in the '+G.league.short+'. Kids in the stands are wearing #'+G.jersey+'.',
      'The league is still young and '+G.first+' is helping define what pro women\'s hockey looks like. Love this energy.',
      'Crowd was loud for #'+G.jersey+' last game — this is what growing the game looks like. More of this.',
      'Representation matters. '+G.first+' taking big minutes and leading by example matters. Full stop.',
      'Unsung stuff in '+G.last+'\'s game — board battles, backcheck, PK. Real fans notice.',
      'My daughter wants to play because players like '+G.first+' are on the screen. Bigger than any stat line.',
      'Solid take: '+G.first+' has been a bright spot. Room and city are lucky to have that compete.'
    ].slice());
    msgs.push({type:'fan',sender:fansUsed[5]||fansUsed[0],handle:fanHandleVariant(fansUsed[5]||fansUsed[0],5),
      text:growSupport[0],mood:'good',idx:msgs.length});
    msgs.push({type:'fan',sender:fansUsed[6]||fansUsed[1],handle:fanHandleVariant(fansUsed[6]||fansUsed[1],6),
      text:growSupport[1]||growSupport[0],mood:'good',idx:msgs.length});
    msgs.push({type:'fan',sender:'Youth Hockey Parent',handle:'@GrowTheGame_'+ri(100,999),
      text:'My kid watches '+G.first+' every week. Seeing a real pro path means everything — thank you for repping.',mood:'good',idx:msgs.length});
    if(Math.random()<0.34){
      msgs.push({type:'fan',sender:critic.n,handle:critic.role,
        text:shuf(proComments)[0],mood:'bad',idx:msgs.length});
    }
    if(Math.random()<0.26){
      msgs.push({type:'fan',sender:haterHandles2[ri(0,haterHandles2.length-1)],handle:'@'+haterHandles2[ri(0,haterHandles2.length-1)]+' -- Online',
        text:shuf(trollComments)[0],mood:'bad',idx:msgs.length});
    }
    if(Math.random()<0.18){
      msgs.push({type:'fan',sender:rivalName,handle:'Rival Player -- '+G.league.short,
        text:shuf(rivalComments)[0],mood:'bad',idx:msgs.length});
    }
  } else {
    // Men's game: bigger media machine — more pile-ons, talk radio, tabloid energy
    var numNeg=ri(4,6);
    msgs.push({type:'fan',sender:critic.n,handle:critic.role,
      text:shuf(proComments)[0],mood:'bad',idx:msgs.length});
    msgs.push({type:'fan',sender:haterHandles2[ri(0,haterHandles2.length-1)],handle:'@'+haterHandles2[ri(0,haterHandles2.length-1)]+' -- Online',
      text:shuf(trollComments)[0],mood:'bad',idx:msgs.length});
    msgs.push({type:'fan',sender:haterHandles2[ri(0,haterHandles2.length-1)]+'_2',handle:'@'+haterHandles2[ri(0,haterHandles2.length-1)]+' -- Online',
      text:shuf(menExtraTrolls)[0],mood:'bad',idx:msgs.length});
    msgs.push({type:'fan',sender:rivalName,handle:'Rival Player -- '+G.league.short,
      text:shuf(rivalComments)[0],mood:'bad',idx:msgs.length});
    if(numNeg>=5){
      var crit2=CRITIC_NAMES[ri(0,CRITIC_NAMES.length-1)];
      msgs.push({type:'fan',sender:crit2.n,handle:crit2.role,
        text:shuf(proComments)[ri(1,proComments.length-1)],mood:'bad',idx:msgs.length});
    }
    if(numNeg>=6){
      msgs.push({type:'fan',sender:'RumorWire Hockey',handle:'@RumorWire',
        text:shuf(menTabloid)[0],mood:'bad',idx:msgs.length});
    }
    var mTrollExtra=shuf(menExtraTrolls.slice());
    msgs.push({type:'fan',sender:'Burner_'+ri(100,999),handle:'@IceBurnerFeed',
      text:mTrollExtra[0],mood:'bad',idx:msgs.length});
    msgs.push({type:'fan',sender:'ArenaBooBirds',handle:'@RealFanVoice',
      text:(mTrollExtra[1]||mTrollExtra[0]),mood:'bad',idx:msgs.length});
    if(G.leagueKey==='PHL' && isPhlBigMarketTeamName(G.team&&G.team.n)){
      msgs.push({type:'fan',sender:'Market Desk',handle:'@PHL_Fishbowl',
        text:G.team.n.toUpperCase()+' is a content economy: every shift is a headline. '+G.last+' is learning what "big market" means — fair or not.',mood:'bad',idx:msgs.length});
      msgs.push({type:'fan',sender:'BoardsNation',handle:'@BoardsNation',
        text:'Toronto/Montreal/NY-tier pressure: fans aren\'t patient. '+G.first+' either delivers in April or the narrative writes itself.',mood:'bad',idx:msgs.length});
    }
    if((G.nat==='Canada'||G.nat==='Canadian') && lastWorldStageWasTeamCanadaNoMedal()){
      msgs.push({type:'fan',sender:'Hockey Canada Heat',handle:'@CanadaHockeyDesk',
        text:'Whole country still rewinding that tournament. Men\'s Team Canada expectations aren\'t "try hard" — it\'s gold-or-scrutiny. '+G.last+' knows.',mood:'bad',idx:msgs.length});
    }
  }

  return msgs;
}

function g_fanStat(){
  var s=[
    'The hockey IQ is off the charts.',
    'Athleticism doesn\'t lie.',
    'Work ethic you can\'t teach.',
    'Compete level every single shift.',
    'One of the most complete players in the league at their age.',
    'Relentless forecheck and details every shift.',
    'Skating mechanics are elite for this level.',
    'Big-game player energy whenever lights are bright.',
    'That release is pure danger in the slot.'
  ];
  return s[ri(0,s.length-1)];
}

function renderSocialTab(){
  // Refresh messages occasionally
  if(!G.socialMessages||G.socialMessages.length<3) G.socialMessages=generateSocialMessages();

  // Profile card
  var posStr=(G.pos==='G'?'GOALIE':G.subPos==='C'?'CENTRE':G.subPos==='LW'?'LEFT WING':G.subPos==='RW'?'RIGHT WING':G.subPos==='LD'?'LEFT DEFENSE':'RIGHT DEFENSE');
  var ovrVal=ovr(G.attrs);
  var statBadge='';
  if(G.pos==='G'){
    var svpctCard=G.saves+(G.goalsAgainst||0)>0?(Math.round(G.saves/(G.saves+(G.goalsAgainst||0))*1000)/10)+'%':'--';
    statBadge='<span class="badge blue">'+G.saves+'SV  SV%'+svpctCard+'</span>';
  } else {
    statBadge='<span class="badge blue">'+G.goals+'G '+G.assists+'A</span>';
  }
  var xfP=(G.xFactor&&X_FACTORS[G.xFactor])?('<span class="badge mut" title="'+(X_FACTORS[G.xFactor].desc||'')+'">'+xFactorUiName(G.xFactor)+'</span>'):'';
  var potS=G.potential&&POTENTIALS[G.potential]?G.potential:'support';
  var potP='<span class="badge acc" title="'+escapeAttrTitle(POTENTIALS[potS].desc)+'">'+potentialUiShort(potS)+'</span>';
  safeEl('social-profile').innerHTML=
    '<div class="player-card-full">'+
    '<div style="display:flex;align-items:flex-start;gap:14px">'+
    '<div class="hub-team-crest" style="width:88px;height:88px">'+teamLogoSVG(G.team.n,88,G.leagueKey)+'</div>'+
    '<div style="flex:1;min-width:0">'+
    '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:4px">'+
    '<span class="jersey-big" style="margin:0">#'+G.jersey+'</span>'+
    '<span class="badge mut" style="font-size:12px">@ '+fmtFollowers(G.socialFollowers||0)+' followers</span>'+
    '</div>'+
    '<div class="vt" style="font-size:12px;color:var(--mut);margin-bottom:6px">'+posStr+'</div>'+
    '<div>'+
    '<div class="vt" style="font-size:22px;color:var(--wht)">'+(G.first+' '+G.last)+'</div>'+
    '<div class="vt" style="font-size:14px;color:var(--mut);line-height:1.8">'+
    (G.hometown?(G.hometown+' &bull; '):'')+G.nat+'<br>'+
    G.height+' / '+(G.weight||180)+' LB &bull; '+(G.pos==='G'?'CATCHES':'SHOOTS')+' '+G.hand+'<br>'+
    (G.favoriteTeam?'<span style="color:var(--acc)">FAV TEAM GROWING UP:</span> '+G.favoriteTeam.n+(G.favoriteTeamLeague&&LEAGUES[G.favoriteTeamLeague]?' ('+LEAGUES[G.favoriteTeamLeague].short+')':'')+'<br>':'')+
    'AGE '+G.age+' &bull; '+G.league.short+' &bull; '+G.team.n+
    '</div>'+
    '<div style="margin-top:6px">'+
    '<span class="badge gold">OVR '+ovrVal+'</span>'+
    statBadge+
    potP+
    xfP+
    (G.careerCups>0?'<span class="badge green">'+G.careerCups+'x CHAMP</span>':'')+
    '</div>'+
    '</div></div></div>';

  renderSocialFeed();
}

function socialSubTab(filter){
  socialSubFilter=filter;
  var stabs=document.querySelectorAll('#social-subtabs .tab');
  var filters=['all','teammates','staff','fans'];
  for(var i=0;i<stabs.length;i++) stabs[i].classList.toggle('on',filters[i]===filter);
  var fd=safeEl('social-feed');
  if(fd&&fd.classList){
    var rm=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!rm&&isGlitchEffectsEnabled()){
      fd.classList.remove('feed-glitch-refresh');
      void fd.offsetWidth;
      fd.classList.add('feed-glitch-refresh');
      setTimeout(function(){try{fd.classList.remove('feed-glitch-refresh');}catch(e){}},340);
    }
  }
  renderSocialFeed();
}

function renderSocialFeed(){
  var feed=safeEl('social-feed');
  if(!feed||!G.socialMessages) return;
  var msgs=G.socialMessages.filter(function(m){
    if(socialSubFilter==='all') return true;
    return m.type===socialSubFilter;
  });
  if(!msgs.length){
    feed.innerHTML='<div class="vt" style="font-size:14px;color:var(--mut);padding:10px">NOTHING HERE YET.</div>';
    return;
  }
  var html='';
  for(var i=0;i<msgs.length;i++){
    var m=msgs[i];
    var reacted=G.socialReactions&&G.socialReactions[m.idx];
    var isHater=m.mood==='bad';
    // Distinguish pro critics (handle doesn't contain 'Online' and doesn't contain '@') from trolls
    var isPro=isHater&&m.handle&&m.handle.indexOf('@')!==0&&m.handle.indexOf('Online')===-1&&m.handle.indexOf('Hater')===-1;
    var isRival=isHater&&m.handle&&m.handle.indexOf('Rival Player')!==-1;
    var typeIcon='';
    var borderCol=isRival?'var(--pur)':isPro?'rgba(255,140,0,.6)':'var(--red)';
    var extraStyle=isHater?' style="border-left-color:'+borderCol+'"':'';
    html+='<div class="social-msg '+m.type+'"'+extraStyle+'>';
    html+='<div class="social-sender" style="'+(isRival?'color:var(--pur)':isPro?'color:#ff8c00':isHater?'color:var(--red)':'')+'">'+stripBracketIcons(typeIcon+' '+m.sender)+'</div>';
    html+='<div class="social-handle" style="'+(isHater?'opacity:.75':'')+'">'+m.handle+'</div>';
    html+='<div class="social-text" style="'+(isPro?'color:rgba(255,200,150,.9)':isRival?'color:rgba(220,180,255,.9)':isHater?'color:rgba(255,180,180,.85)':'')+'">'+m.text+'</div>';
    html+='<div class="social-actions">';
    if(!isHater){
      html+='<button class="social-btn'+(reacted&&reacted.like?' reacted':'')+'" onclick="reactMessage('+m.idx+',\'like\')">'+
        (reacted&&reacted.like?'&#9829; LIKED':'&#9825; LIKE')+'</button>';
      html+='<button class="social-btn" onclick="openRespond('+m.idx+')">&#9993; RESPOND</button>';
    } else {
      var ignoreLabel=isRival?'BLOCK RIVAL':isPro?'NOTED':'IGNORE';
      html+='<button class="social-btn" style="color:var(--mut);font-size:11px" onclick="reactMessage('+m.idx+',\'ignore\')">'+
        (reacted&&reacted.ignore?'&#10003; DONE':ignoreLabel)+'</button>';
      if(isPro||isRival){
        html+='<button class="social-btn" onclick="openRespond('+m.idx+')">&#9993; RESPOND</button>';
      }
    }
    html+='</div></div>';
  }
  feed.innerHTML=html;
}

function reactMessage(idx,type){
  if(!G.socialReactions) G.socialReactions={};
  if(!G.socialReactions[idx]) G.socialReactions[idx]={};
  G.socialReactions[idx][type]=!G.socialReactions[idx][type];
  if(G.socialReactions[idx][type]){
    var msg=G.socialMessages&&G.socialMessages[idx]?G.socialMessages[idx]:null;
    var delta=1;
    if(type==='ignore'&&msg&&msg.mood==='bad') delta=2;
    if(type==='ignore'&&msg&&msg.mood!=='bad') delta=-1;
    G.morale=cl(G.morale+delta,0,100);
    notify((delta>=0?'+':'')+delta+' MORALE',delta>=0?'green':'red');
    if(type==='like') G.socialFollowers=Math.min(99999999,(G.socialFollowers||0)+ri(14,52));
  }
  renderSocialFeed();
}

function openRespond(idx){
  var msg=G.socialMessages[idx];
  if(!msg) return;
  safeEl('m-respond-title').textContent='RESPOND TO '+msg.sender.toUpperCase();
  safeEl('m-respond-ctx').textContent='"'+msg.text+'"';
  var opts=[];
  if(msg.type==='teammate'){
    opts=[
      {t:'Thanks, means a lot coming from you.',effect:{morale:3},label:'GRATEFUL'},
      {t:'We all pull together. Team effort.',effect:{morale:2},label:'TEAM FIRST'},
      {t:'Just doing my job. Back to work.',effect:{morale:1},label:'FOCUSED'},
      {t:'Not here for speeches. We move.',effect:{morale:-2},label:'COLD'}
    ];
  } else if(msg.type==='staff'){
    opts=[
      {t:'Understood, Coach. I\'ll be ready.',effect:{morale:4},label:'COMMITTED'},
      {t:'Appreciate the feedback. Working on it.',effect:{morale:2},label:'RECEPTIVE'},
      {t:'I hear you. Let me think on it.',effect:{morale:1},label:'THOUGHTFUL'},
      {t:'I disagree with that read.',effect:{morale:-3},label:'DEFENSIVE'}
    ];
  } else if(msg.mood==='bad'&&msg.handle&&msg.handle.indexOf('Rival')!==-1){
    // Rival response
    opts=[
      {t:'Let the ice do the talking. See you out there.',effect:{morale:5},label:'CONFIDENT'},
      {t:'Respect the competition. No comment.',effect:{morale:2},label:'PROFESSIONAL'},
      {t:'Focus on your own game. I focus on mine.',effect:{morale:3},label:'UNBOTHERED'}
    ];
  } else if(msg.mood==='bad'&&msg.handle&&msg.handle.indexOf('@')!==0){
    // Professional critic response
    opts=[
      {t:'Appreciate the analysis. Motivation noted.',effect:{morale:4},label:'COMPOSED'},
      {t:'Respectfully disagree. Watch the tape again.',effect:{morale:3},label:'PUSHBACK'},
      {t:'I\'ll let my next game answer that.',effect:{morale:5},label:'FOCUSED'},
      {t:'You have no clue what happens in our room.',effect:{morale:-4},label:'HEATED'}
    ];
  } else {
    opts=[
      {t:'Thank you! Keep supporting the team.',effect:{morale:3},label:'APPRECIATIVE'},
      {t:'Really means everything. Let\'s go!',effect:{morale:4},label:'ENERGIZED'},
      {t:G.team.n+' fans are the best. Period.',effect:{morale:5},label:'FAN LOVE'},
      {t:'If you doubt me, keep watching.',effect:{morale:-1},label:'EDGY'}
    ];
  }
  var html='';
  for(var i=0;i<opts.length;i++){
    var op=opts[i];
    html+='<button class="opt-btn" onclick="sendResponse('+idx+',\''+op.t.replace(/'/g,'&apos;')+'\','+op.effect.morale+')">';
    html+='<span class="badge gold">'+op.label+'</span><br>';
    html+='<span>'+op.t+'</span>';
    html+='<span class="attr-tag">'+(op.effect.morale>=0?'+':'')+op.effect.morale+' MORALE</span>';
    html+='</button>';
  }
  safeEl('m-respond-opts').innerHTML=html;
  openM('m-respond');
}

function sendResponse(idx,txt,moraleGain){
  var g=Number(moraleGain);
  if(!isFinite(g)) g=0;
  G.morale=cl(G.morale+g,0,100);
  if(!G.socialReactions) G.socialReactions={};
  if(!G.socialReactions[idx]) G.socialReactions[idx]={};
  G.socialReactions[idx].responded=true;
  notify((g>=0?'+':'')+g+' MORALE',g>=0?'green':'red');
  closeM('m-respond');
  renderSocialFeed();
}
