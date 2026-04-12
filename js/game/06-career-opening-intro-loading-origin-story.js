/* breakaway — CAREER OPENING — INTRO / LOADING / ORIGIN STORY */
// ============================================================
// CAREER OPENING — INTRO / LOADING / ORIGIN STORY
// ============================================================
var _careerIntroLoadTimer=null;
function hashStr(s){
  var h=0;
  s=String(s||'');
  for(var i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; }
  return Math.abs(h);
}
/** Infer origin "flavor" from hometown text; unknown/empty → deterministic random archetype. */
function inferOriginFlavor(placeRaw,natLabel,displayHometownUpper){
  var raw=(placeRaw||'').trim();
  var nat=String(natLabel||'');
  var natUp=nat.toUpperCase();
  var disp=String(displayHometownUpper||'').trim();
  var isPlaceholder=!raw;
  var h=raw.toLowerCase();
  var flavor=null;
  if(!isPlaceholder){
    var rules=[
      [/farm|prairie|wheat|corn|rural|barn|acre|field|silo|harvest/i,'prairie'],
      [/yukon|alaska|northwest territories|iqaluit|whitehorse|yellowknife|arctic|polar|tundra|northern|thunder bay|north bay|iqaluit|nuuk|reykjavik|helsinki|rovaniemi|tromso|norilsk/i,'north'],
      [/desert|phoenix|vegas|dallas|houston|miami|tropical|humid|palm|mesa|tucson|austin|dubai|riyadh|jeddah|singapore|bangkok|mumbai|delhi/i,'heat'],
      [/forest|woods|timber|boreal|pine|cedar|maple|muskoka|oregon|vermont|maine|upper peninsula/i,'forest'],
      [/coast|harbor|harbour|shore|bay|beach|island|cape|nova scotia|pei|victoria|halifax|seaside|fisher/i,'coast'],
      [/mountain|denver|boulder|calgary|aspen|banff|canmore|rockies|alpine|peak|summit|salt lake|reno/i,'mountain'],
      [/toronto|montreal|vancouver|chicago|boston|new york|brooklyn|queens|manhattan|london|paris|tokyo|detroit|philadelphia|los angeles|minneapolis|seattle|pittsburgh|atlanta|urban|metro|downtown|suburb|city hall|projects/i,'city']
    ];
    for(var r=0;r<rules.length;r++){
      if(rules[r][0].test(h)){ flavor=rules[r][1]; break; }
    }
    if(!flavor){
      var pool=['city','prairie','north','heat','forest','coast','mountain','smalltown'];
      flavor=pool[hashStr(h+'|'+nat)%pool.length];
    }
  } else {
    var pool2=['city','prairie','north','heat','forest','coast','mountain','smalltown'];
    flavor=pool2[hashStr(nat+'|'+String(disp))%pool2.length];
  }
  return {flavor:flavor,isPlaceholder:isPlaceholder};
}
function composeOriginStory(G){
  var archDef=ARCHETYPES[G.pos]&&ARCHETYPES[G.pos][G.arch]?ARCHETYPES[G.pos][G.arch]:null;
  var archName=archDef&&archDef.name?archDef.name:String(G.arch);
  var nat=G.nat||'';
  var leagueShort=G.league&&G.league.short?G.league.short:'LEAGUE';
  var teamName=G.team&&G.team.n?G.team.n:'YOUR TEAM';
  var placeRaw=G._originPlaceRaw!=null?G._originPlaceRaw:'';
  var homeDisplay=G.hometown||'';
  var inf=inferOriginFlavor(placeRaw,nat,homeDisplay);
  var flavor=inf.flavor;
  var placeName=placeRaw?escHtml(placeRaw.toUpperCase()):('THE '+escHtml(String(nat).toUpperCase())+' HEARTLAND');
  var archKey=String(G.arch||'');
  var posSoul='';
  if(G.pos==='F'){
    if(archKey==='Sniper'||archKey==='PowerForward') posSoul='You chase the quiet before the release — when the net looks bigger than the moment.';
    else if(archKey==='Playmaker'||archKey==='TwoWay') posSoul='You read seams the way other kids read texts — late, loud, and always one pass ahead.';
    else if(archKey==='Grinder'||archKey==='Enforcer') posSoul='You learned the game in board battles and bruises — respect earned in inches, not highlights.';
    else posSoul='You wanted the puck when the clock got honest — when pretty breaks down and someone still has to score.';
  } else if(G.pos==='D'){
    if(archKey==='OffensiveD') posSoul='You grew up wanting the blue line to be a weapon — not a parking spot.';
    else if(archKey==='StayAtHome'||archKey==='ShutdownD') posSoul='You fall in love with taking away time — the boring magic of being impossible to beat.';
    else posSoul='You see the rush before it forms — angles first, panic never.';
  } else {
    if(archKey==='Butterfly'||archKey==='Hybrid') posSoul='You treat the crease like geometry — quiet feet, patient hands, chaos on your terms.';
    else if(archKey==='Reflex') posSoul='You trust the twitch before the thought — the save that arrives before the doubt.';
    else posSoul='You learned to love the noise but live in silence — the puck always tells the truth last.';
  }
  var body=[];
  var openers={
    city:'Neon bleed, subway rumble, and practice ice booked like party halls. '+placeName+' did not hand you space — it taught you to steal it.',
    prairie:'Horizon for miles, gravel for sound, and a rink where the Zamboni was the biggest celebrity. '+placeName+' was not a backdrop — it was the whole sermon.',
    north:'Air that hurts to breathe and ice that never asks permission. In '+placeName+', winter was not weather — it was a second coach with a whistle.',
    heat:'Humidity in the lungs and sun that turns asphalt into an oven between periods. '+placeName+' trained you to sprint the pace, not chase it.',
    forest:'Pine sap, logging roads, and a sheet where the boards had stories. '+placeName+' smelled like woodsmoke and stubborn hope.',
    coast:'Salt on the wind and gulls over parking lots — tempo wired into you before you knew what a system was. '+placeName+' moved like the tide: rude, honest, on time.',
    mountain:'Elevation that steals your breath and hills that humble your legs. '+placeName+' made every stride feel borrowed — so you learned to spend them wisely.',
    smalltown:'Two stoplights, one grocery line where everyone knows your number, and a rink that felt bigger than the town. '+placeName+' was small on the map — huge in the mouth.'
  };
  var openersPh={
    city:'You left the "where" blank on purpose — but you still grew up where sirens and skate guards share the same night.',
    prairie:'You did not name a dot on the map — you still know the sound of bus tires on gravel and the smell of cold barn wood.',
    north:'Wherever home was, winter arrived early and stayed late — a season that did not negotiate.',
    heat:'Sun-cooked asphalt and locker rooms that never quite dry out — you learned to love a fast heartbeat.',
    forest:'Your first reads were branches and bad ice — systems came later, instinct came first.',
    coast:'You were raised on wind and hurry — the ocean in your ear, the clock in your legs.',
    mountain:'Thin air teaches humility fast — you learned to budget oxygen like money.',
    smalltown:'Some kids get billboards. You got a community rink and a name everybody mispronounced until you made them learn.'
  };
  var p1=inf.isPlaceholder?openersPh[flavor]:openers[flavor];
  body.push('<div class="p">'+p1+'<span class="mut">['+flavor.toUpperCase()+' ORIGIN]</span></div>');
  var mid='';
  if(inf.isPlaceholder){
    mid='You did not owe strangers your coordinates — only this: a '+escHtml(nat)+' kid with a chip, a dream, and a willingness to outwork the story.';
  } else {
    mid='You wrote '+placeName+' in ink — not as myth, but as proof. Home was never abstract; it had a temperature and a zip code.';
  }
  body.push('<div class="p">'+mid+'</div>');
  body.push('<div class="p"><span style="color:var(--gold)">'+escHtml(archName)+'</span> — '+posSoul+'</div>');
  var tier=G.league&&G.league.tier?G.league.tier:'';
  var tierNote=tier==='junior'?'early buses, loud rinks, and scouts who watch everything':tier==='college'?'books, blades, and the scholarship clock':tier==='pro'?'contracts, cameras, and no nights off':tier==='minor'?'mileage, pay stubs, and proving it again tomorrow':tier==='euro'||tier==='asia'?'new flags, new languages, same net':'league pace and real consequences';
  body.push('<div class="p">At sixteen, the '+escHtml(leagueShort)+' stops being a daydream and becomes a calendar: '+tierNote+'. The <span style="color:var(--acc)">'+escHtml(teamName)+'</span> sweater is the next page — written in ice time.</div>');
  var headlines={
    city:'NEON & KNIVES / CITY KID',
    prairie:'SKY & SOIL / PRAIRIE FIRE',
    north:'FROST & FORTITUDE / NORTH STAR',
    heat:'SUN & SWEAT / HEAT CHECK',
    forest:'PINE & PATHS / WOODSMOKE KID',
    coast:'SALT & SWELL / COAST RUNNER',
    mountain:'PEAK & PRESSURE / RIDGELINE',
    smalltown:'SIGNS & WHISPERS / HOMETOWN HERO'
  };
  var tag='PROLOGUE — '+G.first+' '+G.last+' / '+flavor.toUpperCase()+' THREAD';
  return {
    headline:headlines[flavor]||'YOUR PATH',
    tagline:tag,
    html:body.join('')
  };
}
function beginCareerIntroSequence(){
  var lines=[
    ['Every legend starts as a save file — then it has to earn the myth.','Locking in name, birthplace, and the quiet hunger that does not show up on a spreadsheet.'],
    ['The tape does not care about your story — only your habits.','Assembling the rink, the room, and the version of you that shows up when it is ugly.'],
    ['Nobody hands you a league — you steal minutes until they stick.','Compiling your world: bus routes, bad ice, good dreams.'],
    ['Cold steel. Warm blood. Same game since forever.','Your first season is loading — sharpen the edges.'],
    ['Hockey does not ask permission. It asks for proof.','Calibrating your path: pace, place, and what you do when nobody is clapping.'],
    ['You are not a highlight yet — you are a decision.','Feeding data to destiny: hometown thread, position, pulse.']
  ];
  var pick=lines[hashStr((G&&G.first||'')+'|'+(G&&G.last||''))%lines.length];
  safeEl('intro-cold-line1').textContent=pick[0];
  safeEl('intro-cold-line2').textContent=pick[1];
  show('s-game-intro');
}
function continueCareerColdOpen(){
  if(_careerIntroLoadTimer){clearInterval(_careerIntroLoadTimer);_careerIntroLoadTimer=null;}
  var reduceMotion=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var msgs=shuf([
    'Scanning barns, bus routes, and bad ice...',
    'Melting snow off the glass...',
    'Teaching the crowd how to pronounce your name...',
    'Spawning coaches with opinions...',
    'Importing late-night rink snacks...',
    'Negotiating fate with a random number generator...',
    'Warming up the Zamboni of destiny...'
  ]);
  var mi=0;
  safeEl('career-load-status').textContent=msgs[0]||'Loading...';
  show('s-game-loading');
  var fill=safeEl('career-load-fill');
  var pctEl=safeEl('career-load-pct');
  var start=Date.now();
  var dur=reduceMotion?380:2200+ri(0,420);
  var lastPct=-1;
  var tick=function(){
    var t=Date.now()-start;
    var pct=Math.min(100,Math.round((t/dur)*100));
    if(pct!==lastPct){
      lastPct=pct;
      fill.style.width=pct+'%';
      pctEl.textContent=pct+'%';
      if(Math.floor(t/480)>mi&&mi<msgs.length-1){ mi++; safeEl('career-load-status').textContent=msgs[mi]; }
    }
    if(t>=dur){
      if(_careerIntroLoadTimer){clearInterval(_careerIntroLoadTimer);_careerIntroLoadTimer=null;}
      showCareerStoryScreen();
      return;
    }
  };
  _careerIntroLoadTimer=setInterval(tick,reduceMotion?40:60);
  tick();
}
function showCareerStoryScreen(){
  var pack=composeOriginStory(G);
  G._originStory=pack;
  safeEl('story-headline').textContent=pack.headline;
  safeEl('story-tagline').textContent=pack.tagline;
  safeEl('story-body').innerHTML=pack.html;
  show('s-story-opening');
}
function finishCareerOriginAndEnterHub(){
  show('s-hub');
  notify('WELCOME TO THE '+G.team.n.toUpperCase()+'!');
  try{RetroSound.careerStart();}catch(e){}
}
