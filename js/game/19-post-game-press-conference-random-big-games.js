/* breakaway — POST-GAME PRESS CONFERENCE (random, big games) */
// ============================================================
// POST-GAME PRESS CONFERENCE (random, big games)
// ============================================================
function trimPressLabel(t){
  t=String(t||'');
  return t.length>50?t.substring(0,48)+'…':t;
}
/** True when narrative fits a "tough questions" presser (not a celebration piece). */
function isPressStruggleContext(won, gRnd, aRnd){
  var pts=(gRnd||0)+(aRnd||0);
  var isG=G.pos==='G';
  var gpOk=G.gp>0;
  if(!gpOk) return false;
  if(isG){
    return (!won && pts<1) || G.morale<42 || (G.gp>=2 && G.w/G.gp<0.42);
  }
  return G.w/G.gp<0.45 || G.morale<45 || G.plusminus<=-4 || (!won && pts===0);
}
/** At most one press modal — avoids stacking staff chat on staff chat (jarring). */
function maybeTriggerPostGamePressOnce(won, gRnd, aRnd){
  if(!G) return;
  if(G.gp>=2 && isPressStruggleContext(won,gRnd,aRnd)) maybeTriggerBadPressConference(won,gRnd,aRnd);
  else maybeTriggerPressConference(won,gRnd,aRnd);
}
function maybeTriggerPressConference(won, gRnd, aRnd){
  var pts=(gRnd||0)+(aRnd||0);
  var isG=G.pos==='G';
  var isF=G.gender==='F';
  if(!isG && pts<2 && !G.wonCup) return;
  if(isG && pts<1 && !won && !G.wonCup) return;
  // Men: press conferences fire more often; women: same base rate as before
  if(isF){ if(Math.random()>0.48) return; }
  else { if(Math.random()>0.85) return; }
  var peer=pressRandomPeer();
  var critic=pressRandomCritic();
  var hdl=pressRandomHandle();
  var coach=pressRandomCoach();
  var questions;
  if(isF){
    questions=isG?[
      {q:'Strong game in net — what was working for you?',
       opts:[{t:'Tracking the puck through traffic.',m:3},{t:'Rebound control was a focus.',m:2},{t:'The guys cleared the crease.',m:3},{t:'Just happy to help the team.',m:2}]},
      {q:'How do you stay ready when the score is tight?',
       opts:[{t:'Stick to routine — breathe between whistles.',m:2},{t:'Trust the process we practiced.',m:3},{t:'Lean on the leadership group.',m:2},{t:'One save at a time.',m:2}]},
      {q:'Fans are excited about your season. What does that mean to you?',
       opts:[{t:'It means a lot — I play for them too.',m:3},{t:'I try to let my play speak.',m:2},{t:'Grateful for the support.',m:3},{t:'We are building something special.',m:2}]},
      {q:'What did you see from the defense in front of you tonight?',
       opts:[{t:'They battled hard — cleared bodies.',m:2},{t:'Communication was good.',m:2},{t:'We can always tighten gaps.',m:1},{t:'Proud of how they competed.',m:3}]},
      {q:'Any message for young goalies watching?',
       opts:[{t:'Work on skating and patience.',m:2},{t:'Have fun — the game should be joy first.',m:3},{t:'Find a mentor you trust.',m:2},{t:'Keep showing up.',m:2}]}
    ]:[
      {q:'Walk us through your night — what stood out?',
       opts:[{t:'The team played fast and connected.',m:2},{t:'I tried to keep my game simple.',m:2},{t:'We earned two points together.',m:3},{t:'Proud of the group effort.',m:2}]},
      {q:'What does this win mean for the room?',
       opts:[{t:'Momentum — we believe in each other.',m:3},{t:'We are taking it step by step.',m:2},{t:'Everyone contributed.',m:3},{t:'Long season — we stay humble.',m:2}]},
      {q:'You have been a bright spot. What are you working on?',
       opts:[{t:'Details at both ends — always.',m:2},{t:'Strength and conditioning.',m:2},{t:'Video with coaches.',m:2},{t:'Being a good teammate.',m:3}]},
      {q:'How do you handle expectations?',
       opts:[{t:'I focus on what I can control.',m:2},{t:'My teammates support me.',m:3},{t:'I lean on family and staff.',m:2},{t:'One day at a time.',m:2}]},
      {q:'What did '+coach+' emphasize this week?',
       opts:[{t:'Compete and communication.',m:2},{t:'Structure and pace.',m:2},{t:'Playing for each other.',m:3},{t:'Sticking to our identity.',m:2}]},
      {q:'Any advice for girls and boys who look up to you?',
       opts:[{t:'Dream big, work hard, be kind.',m:3},{t:'Stay in school and love the game.',m:2},{t:'Find joy in practice.',m:2},{t:'Believe in yourself.',m:2}]}
    ];
  } else {
  questions=isG?[
    {q:'Your reads looked composed. What were you tracking on late chances?',
     opts:[{t:'Puck first -- then hands. I did not chase ghosts.',m:3},{t:'Rebounds. We talked about second chances all week.',m:2},{t:'I stayed patient -- let them move first.',m:2},{t:'I was unbeatable tonight. Next question.',m:-3}]},
    {q:'Any nerves with the score tight late?',
     opts:[{t:'That is what you practice for.',m:2},{t:'I trust the guys in front of me.',m:3},{t:'Breathing and routine -- nothing fancy.',m:2},{t:'I do not get nervous.',m:-2}]},
    {q:'You had puck touches -- talk about playing it clean.',
     opts:[{t:'If I can help the breakout safely, I will.',m:2},{t:'I am not a third D -- easy plays only.',m:2},{t:'Coach wants aggression within the system.',m:1},{t:'Put me up for a Norris.',m:-4}]},
    {q:critic+' wrote that your style is "old school." Fair?',
     opts:[{t:'I stop pucks. Style points are for someone else.',m:2},{t:'I respect the article -- we can disagree.',m:2},{t:'Analytics are not stopping rubber for me.',m:1},{t:'He does not know the position.',m:-3}]},
    {q:'What did '+coach+' stress after the second?',
     opts:[{t:'Traffic and rebound control.',m:2},{t:'Staying square -- no fancy stuff.',m:2},{t:'Communication with the D.',m:3},{t:'Same speech as always.',m:-1}]},
    {q:'Fans on '+hdl+' debate your setup. Thoughts?',
     opts:[{t:'If it is comfortable and legal, I am good.',m:1},{t:'Gear is personal -- I do not read comments.',m:2},{t:'Shout-out to our equipment staff.',m:2},{t:'Tell them to buy a ticket.',m:-2}]},
    {q:'You and '+peer+' were jawing after a whistle -- all good?',
     opts:[{t:'Competitive game -- heat of the moment.',m:2},{t:'We are fine. Battle level was high.',m:2},{t:'I will keep that between us.',m:3},{t:'They started it.',m:-3}]}
  ]:[
    {q:'Take us through your mindset tonight.',
     opts:[{t:'I just tried to read the play and react.',m:2},{t:'We had a game plan and executed it.',m:1},{t:'Honestly, I was locked in from warmup.',m:2},{t:'I carried us tonight. Simple.',m:-2}]},
    {q:'What does this performance mean for the team?',
     opts:[{t:'It is a big 2 points for us. Nothing more.',m:1},{t:'This is what we are capable of every night.',m:2},{t:'The guys were unbelievable -- team win.',m:3},{t:'They should expect this from me now.',m:-2}]},
    {q:'Your '+pts+' point night -- what was the key?',
     opts:[{t:'Kept it simple. Puck management was clean.',m:2},{t:'My linemates put me in great positions.',m:3},{t:'I have been working on that in practice.',m:2},{t:'Natural talent took over.',m:-3}]},
    {q:peer+' said you two are "still building chemistry." Response?',
     opts:[{t:'We are getting there -- it is a process.',m:2},{t:'I love playing with him -- stats will come.',m:3},{t:'We talk on the bench every shift.',m:2},{t:'He needs to finish more.',m:-4}]},
    {q:'You are on a roll. How do you stay grounded?',
     opts:[{t:'Day by day. Cannot look too far ahead.',m:2},{t:'Teammates keep you honest -- no egos.',m:3},{t:'I just love playing.',m:2},{t:'I do not need grounding.',m:-3}]},
    {q:critic+' questioned your defensive detail. Fair?',
     opts:[{t:'I can be better away from the puck.',m:2},{t:'I respect the take -- I watch tape too.',m:2},{t:'Winning is the only column I care about.',m:1},{t:'He is chasing clicks.',m:-3}]},
    {q:'A post on '+hdl+' says you duck media. True?',
     opts:[{t:'I am here right now.',m:2},{t:'Schedule is what it is.',m:1},{t:'I prefer to speak with my play.',m:2},{t:'People need hobbies.',m:-2}]},
    {q:coach+' challenged the room this week. What changed?',
     opts:[{t:'Compete level -- details at both ends.',m:2},{t:'We simplified. Less thinking, more doing.',m:3},{t:'Accountability -- no easy shifts.',m:2},{t:'Nothing -- we got lucky.',m:-3}]},
    {q:'Critics say you take too many risks. What do you say?',
     opts:[{t:'I play with fire for a reason.',m:1},{t:'I make smart decisions too.',m:2},{t:'My team trusts my read.',m:1},{t:'Critics can keep talking.',m:-2}]},
    {q:'Locker-room distraction narrative -- response?',
     opts:[{t:'My focus is on winning.',m:2},{t:'I let my play do the talking.',m:1},{t:'This room knows I give 100%.',m:2},{t:'That story is nonsense.',m:-2}]}
  ];
  }
  var q=shuf(questions.slice())[0];
  openStaffChat('PRESS -- POST-GAME',
    [{sender:'Reporter @ '+G.league.short,color:'var(--mut)',text:q.q}],
    q.opts.map(function(opt){
      return {label:trimPressLabel(opt.t),fn:function(){
        G.morale=cl(G.morale+opt.m,0,100);
        notify((opt.m>=0?'+':'')+opt.m+' MORALE',opt.m>=0?'green':'red');
        addNews(G.first+' '+G.last+' (press): "'+opt.t+'"','neutral');
      }};
    })
  );
}

function maybeTriggerBadPressConference(won, gRnd, aRnd){
  if(G.gp<2) return;
  var pts=(gRnd||0)+(aRnd||0);
  var isG=G.pos==='G';
  var isF=G.gender==='F';
  var struggling=isG
    ? ((!won && pts<1) || G.morale<42 || (G.gp>0 && G.w/G.gp<0.42))
    : (G.w/G.gp<0.45 ||G.morale<45 ||G.plusminus<=-4 || (!won && pts===0));
  if(!struggling) return;
  // Men: tough press fires often. Women: rarely — and questions stay constructive, not cruel.
  if(isF){ if(Math.random()>0.88) return; }
  else { if(Math.random()>0.18) return; }
  var peer=pressRandomPeer();
  var critic=pressRandomCritic();
  var hdl=pressRandomHandle();
  var questions;
  if(isF){
    questions=isG?[
      {q:'A tough result — what is your focus heading into the next one?',
       opts:[{t:'Short memory — review and reset.',m:2},{t:'Supporting the team any way I can.',m:3},{t:'Extra work with the goalie coach.',m:2},{t:'We will bounce back together.',m:3}]},
      {q:'How are you taking care of yourself through a heavy schedule?',
       opts:[{t:'Sleep, nutrition, honest with trainers.',m:2},{t:'Leaning on teammates.',m:2},{t:'Keeping perspective.',m:3},{t:'Grateful for the opportunity to play.',m:2}]},
      {q:'What positives can you take from tonight?',
       opts:[{t:'We never quit.',m:2},{t:'Some good saves to build on.',m:2},{t:'Lessons for the next game.',m:2},{t:'The room stays connected.',m:3}]},
      {q:'Message to fans who are with you in the hard stretches?',
       opts:[{t:'Thank you — we hear you.',m:3},{t:'We are working every day.',m:2},{t:'Your support means everything.',m:3},{t:'Stick with us.',m:2}]}
    ]:[
      {q:'Rough patch — how do you keep the room together?',
       opts:[{t:'Communication and honesty.',m:3},{t:'Small goals each period.',m:2},{t:'Leaders stepping up.',m:2},{t:'We trust the process.',m:2}]},
      {q:'What are you personally working on this week?',
       opts:[{t:'Details at both ends.',m:2},{t:'Skating and puck support.',m:2},{t:'Video with coaches.',m:2},{t:'Staying positive for teammates.',m:3}]},
      {q:'How do you block out outside noise?',
       opts:[{t:'Focus on the locker room.',m:2},{t:'Family and close circle.',m:2},{t:'One day at a time.',m:2},{t:'I control my effort.',m:2}]},
      {q:'Anything you want fans to know after tonight?',
       opts:[{t:'We will keep fighting.',m:2},{t:'Appreciate everyone who supports us.',m:3},{t:'Long season ahead.',m:2},{t:'Proud to wear this jersey.',m:3}]},
      {q:'Coach challenged the group — how did you receive that?',
       opts:[{t:'Constructive — we all want to win.',m:2},{t:'Accountability is healthy.',m:2},{t:'We are in this together.',m:3},{t:'Turn the page tomorrow.',m:2}]}
    ];
  } else {
  questions=isG?[
    {q:'Tough night -- want any goal back?',
     opts:[{t:'A couple. I will clean it up on video.',m:2},{t:'They earned their looks.',m:1},{t:'I need to be sharper early.',m:2},{t:'The team hung me out.',m:-4}]},
    {q:'Fans on '+hdl+' are roasting rebound control. Response?',
     opts:[{t:'Fair -- I can control bodies better.',m:2},{t:'I do not read that stuff mid-season.',m:1},{t:'I will work with the goalie coach.',m:2},{t:'They should try stopping pucks.',m:-4}]},
    {q:critic+' called you "shaky in big moments." Fair?',
     opts:[{t:'I will use it as fuel.',m:1},{t:'I disagree with the premise.',m:0},{t:'I need one more save.',m:2},{t:'He never played.',m:-3}]},
    {q:'Is fatigue a factor with workload?',
     opts:[{t:'No excuses -- pros figure it out.',m:2},{t:'I am honest with trainers.',m:2},{t:'Everyone is tired in March.',m:1},{t:'Load management is a joke.',m:-3}]},
    {q:'Media says you are the story tonight — for the wrong reasons. Reply?',
     opts:[{t:'I own it. Bad night.',m:1},{t:'Ask me after I watch tape.',m:0},{t:'Save percentage lies sometimes.',m:-1},{t:'Ratings game — I stop pucks.',m:-2}]}
  ]:[
    {q:'You are in a tough stretch. How do you stay confident?',
     opts:[{t:'I trust my process.',m:2},{t:'I am watching film and learning.',m:2},{t:'Season is long.',m:1},{t:'People are overreacting.',m:-3}]},
    {q:'Trade chatter -- does it affect you?',
     opts:[{t:'I can only control my play.',m:2},{t:'Rumors are noise.',m:1},{t:'I block it out.',m:1},{t:'Move me then.',m:-4}]},
    {q:'How do you help when points are not coming?',
     opts:[{t:'Penalty kill and defensive reads.',m:2},{t:'Energy and leadership.',m:2},{t:'Traffic and space for others.',m:1},{t:'Not all on me.',m:-2}]},
    {q:peer+' posted a vague story after the game. Locker room okay?',
     opts:[{t:'We talk like adults.',m:2},{t:'Winning fixes a lot.',m:1},{t:'I am not commenting on social.',m:2},{t:'Ask him.',m:-3}]},
    {q:critic+' linked your slump to off-ice habits. Response?',
     opts:[{t:'My habits are pro-level.',m:1},{t:'I will not litigate my life in the press.',m:2},{t:'Focus is on tomorrow.',m:2},{t:'That is out of line.',m:-4}]},
    {q:'Coach called the effort "inconsistent." Do you agree?',
     opts:[{t:'We can all be better.',m:2},{t:'I own my shifts.',m:2},{t:'That is a fair challenge.',m:2},{t:'Call out who you mean.',m:-4}]},
    {q:'A thread on '+hdl+' compares you to a minor-league call-up. Motivated?',
     opts:[{t:'I stay off the apps.',m:2},{t:'Motivation is internal.',m:2},{t:'Let them talk.',m:1},{t:'I am still here -- they are not.',m:-2}]},
    {q:'Radio says you are "untradeable" — because nobody wants the contract. Fair?',
     opts:[{t:'Disrespectful. Next question.',m:-2},{t:'I am still here producing.',m:1},{t:'My game will talk.',m:0},{t:'They can say whatever.',m:-1}]}
  ];
  }
  var q=shuf(questions.slice())[0];
  var pTitle=isF?'PRESS -- CONVERSATION':'PRESS -- TOUGH QUESTIONS';
  var pSender=isF?('Reporter @ '+G.league.short):(critic+' (press room)');
  openStaffChat(pTitle,
    [{sender:pSender,color:'var(--mut)',text:q.q}],
    q.opts.map(function(opt){
      return {label:trimPressLabel(opt.t),fn:function(){
        G.morale=cl(G.morale+opt.m,0,100);
        notify((opt.m>=0?'+':'')+opt.m+' MORALE',opt.m>=0?'green':'red');
        addNews(G.first+' '+G.last+' (press): "'+opt.t+'"','neutral');
      }};
    })
  );
}

function getDemandTradeGate(){
  if(!G) return {ok:false,hint:''};
  if(G._inOffseason) return {ok:false,hint:'OFFSEASON'};
  if(G.season<2) return {ok:false,hint:'FROM SEASON 2'};
  if(G.gp<14) return {ok:false,hint:'NEED 14 GP'};
  if(pendingTrade) return {ok:false,hint:'TRADE PENDING'};
  if((G._tradeCooldownUntilGp||0)>G.gp) return {ok:false,hint:'COOLDOWN'};
  if((G._tradeDemandSeason|0)===G.season) return {ok:false,hint:'ONCE PER SEASON'};
  return {ok:true,hint:'BAD TEAM + YOUR NUMBERS UP'};
}
function demandTrade(){
  var g=getDemandTradeGate();
  if(!g.ok){ notify(g.hint,'gold'); return; }
  G._tradeDemandSeason=G.season;
  G.standings=buildStandings(G.leagueKey);
  var sorted=G.standings.slice().sort(function(a,b){return b.pts-a.pts;});
  var myI=-1,row=null;
  for(var i=0;i<sorted.length;i++){
    if(sorted[i].isMe){ myI=i; row=sorted[i]; break; }
  }
  if(myI<0||!row){ notify('STANDINGS ERROR','gold'); return; }
  var n=sorted.length;
  var denom=Math.max(1,row.w+row.l+row.otl);
  var winPct=row.w/denom;
  var badTeam=(myI>=Math.floor(n*0.58))||(winPct<0.39&&row.gp>=12);
  var o=ovr(G.attrs,G.pos);
  var bar=getPpgCaliberOvrThreshold(G.leagueKey);
  var myForm=(G.gp>=10&&(G.w/G.gp)>=0.52);
  var goodPlayer=(o>=bar-12)||myForm;
  if(!badTeam||!goodPlayer){
    addNews('Management: no trade market on you right now.','neutral');
    notify('NO LEVERAGE','gold');
    G.morale=cl(G.morale-4,0,100);
    G._tradeCooldownUntilGp=Math.max(G._tradeCooldownUntilGp||0,G.gp+10);
    return;
  }
  G.morale=cl(G.morale-6,0,100);
  addNews(G.first+' '+G.last+' demands a trade.','bad');
  if(Math.random()<0.52){
    addNews('GM working phones.','big');
    triggerTrade();
  } else {
    addNews('GM stalls trade talks.','neutral');
    G._tradeCooldownUntilGp=Math.max(G._tradeCooldownUntilGp||0,G.gp+14);
  }
}

function maybeTriggerTrade(gRnd,aRnd,won){
  if(G.season<2||G.gp<5||pendingTrade) return;
  if((G._tradeCooldownUntilGp||0)>G.gp) return;
  if((G.tradeOffersThisSeason||0)>=1) return;
  if((G._lastTradeSeason||0)===G.season) return;
  if(G.season===2 && G.gp<20) return; // prevent early season 2 trade spam
  var badForm=(G.gp>0 && (G.w/G.gp)<0.35)||G.morale<40||G.plusminus<=-5;
  if(!badForm) return;
  var winPct=G.gp>0?(G.w/G.gp):0.5;
  var chance=0.08 + Math.max(0, (0.35 - winPct)*0.35);
  if(Math.random() > chance) return;
  addNews('TRADE RUMORS: management exploring options after recent struggles.','neutral');
  triggerTrade();
}
