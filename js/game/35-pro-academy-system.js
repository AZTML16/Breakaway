/* breakaway — Pro club academies (Euro/Asia): U16 / U18 / U20 under one org, early signing path */
var PRO_ACADEMY_JUNIOR_LEAGUES=['NEJC','CEJC','ARJC','EWJC','AWJC'];
var JUNIOR_TO_PRO_LEAGUE_MAP={
  NEJC:['NEHL','FHL'],
  CEJC:['CEHL'],
  ARJC:['ARHL'],
  EWJC:['SDHL','FWHL'],
  AWJC:['AWHL']
};

var _proAcademyParentCache=null;

function isProAcademyJuniorLeague(leagueKey){
  return PRO_ACADEMY_JUNIOR_LEAGUES.indexOf(leagueKey||'')>=0;
}

function academyCityToken(teamName){
  var s=String(teamName||'').trim();
  if(!s) return '';
  return s.split(/\s+/)[0].toLowerCase().replace(/[^a-zà-öø-ÿ]/gi,'');
}

function buildProAcademyParentCache(){
  if(_proAcademyParentCache) return _proAcademyParentCache;
  _proAcademyParentCache={};
  var jk, proKeys, ji, pk, pros, pi, junior, pro, city;
  for(ji=0;ji<PRO_ACADEMY_JUNIOR_LEAGUES.length;ji++){
    jk=PRO_ACADEMY_JUNIOR_LEAGUES[ji];
    proKeys=JUNIOR_TO_PRO_LEAGUE_MAP[jk]||[];
    var juniors=(typeof TEAMS!=='undefined'&&TEAMS[jk])?TEAMS[jk]:[];
    for(pi=0;pi<juniors.length;pi++){
      junior=juniors[pi];
      city=academyCityToken(junior.n);
      if(!city) continue;
      for(pk=0;pk<proKeys.length;pk++){
        pros=(typeof TEAMS!=='undefined'&&TEAMS[proKeys[pk]])?TEAMS[proKeys[pk]]:[];
        for(var ti=0;ti<pros.length;ti++){
          pro=pros[ti];
          if(academyCityToken(pro.n)===city||pro.n.toLowerCase().indexOf(city)>=0){
            _proAcademyParentCache[jk+'|'+junior.n]={leagueKey:proKeys[pk],name:pro.n,e:pro.e||'[-]'};
            break;
          }
        }
        if(_proAcademyParentCache[jk+'|'+junior.n]) break;
      }
    }
  }
  return _proAcademyParentCache;
}

function getAcademyParentProTeam(juniorTeamName, juniorLeagueKey){
  var cache=buildProAcademyParentCache();
  return cache[(juniorLeagueKey||'')+'|'+(juniorTeamName||'')]||null;
}

function academyNatMatchScore(leagueKey, teamName, nat){
  var n=String(nat||'').toLowerCase();
  var tn=String(teamName||'').toLowerCase();
  if(!n) return 0;
  var map={
    NEJC:{'sweden':/stockholm|göteborg|malmö|luleå|linköping|skellefteå|örebro|karlstad/, 'finland':/turku|tampere|helsinki/, 'norway':/oslo/, 'denmark':/københavn/},
    CEJC:{'czech':/praha|brno/, 'germany':/berlin|münchen/, 'switzerland':/zürich|bern/, 'austria':/wien/, 'slovakia':/bratislava/, 'finland':/turku|helsinki/},
    ARJC:{'russia':/moscow|petersburg|kazan|novosibirsk|sochi|vladivostok/, 'japan':/yokohama/, 'korea':/seoul/, 'china':/beijing|harbin/, 'latvia':/riga/, 'kazakhstan':/astana|almaty/, 'uzbekistan':/tashkent/, 'kyrgyzstan':/bishkek/},
    EWJC:{'sweden':/stockholm|göteborg/, 'finland':/helsinki|tampere/},
    AWJC:{'japan':/yokohama|tokyo/, 'korea':/seoul/, 'china':/beijing|shanghai/}
  };
  var checks=map[leagueKey]||{};
  var keys=Object.keys(checks), i, j;
  for(i=0;i<keys.length;i++){
    if(n.indexOf(keys[i])<0) continue;
    if(checks[keys[i]].test(tn)) return 8;
  }
  return 0;
}

/** Home academy program from birthplace / nationality — no draft. */
function pickAcademyHomeTeam(leagueKey, nat, hometown){
  var teams=(typeof TEAMS!=='undefined'&&TEAMS[leagueKey])?TEAMS[leagueKey]:[];
  if(!teams.length) return {n:'Academy Club',e:'[-]'};
  buildProAcademyParentCache();
  var ht=String(hometown||'').toLowerCase();
  var scored=[], i, t, city, score;
  for(i=0;i<teams.length;i++){
    t=teams[i];
    city=academyCityToken(t.n);
    score=0;
    if(city&&ht.indexOf(city)>=0) score+=14;
    if(city&&ht.replace(/[^a-zà-öø-ÿ]/gi,'').indexOf(city.replace(/[^a-zà-öø-ÿ]/gi,''))>=0) score+=10;
    score+=academyNatMatchScore(leagueKey, t.n, nat);
    if(getAcademyParentProTeam(t.n, leagueKey)) score+=1;
    score+=Math.random()*1.5;
    scored.push({team:t, score:score});
  }
  scored.sort(function(a,b){return b.score-a.score;});
  return scored[0].team;
}

function pickAcademyAlternateTeams(leagueKey, homeTeam, count){
  var teams=(typeof TEAMS!=='undefined'&&TEAMS[leagueKey])?TEAMS[leagueKey]:[];
  var out=[], i;
  for(i=0;i<teams.length;i++){
    if(!homeTeam||teams[i].n!==homeTeam.n) out.push(teams[i]);
  }
  return shuf(out).slice(0, count||2);
}

/** U16 / U18 / U20 band within one academy org — age can play up if dominant. */
function getAcademyBandAgeRangeLabel(band){
  var b=String(band||'').toUpperCase().replace(/^J/,'U');
  if(b==='U16') return 'under 17 (age 16)';
  if(b==='U18') return 'under 19 (ages 17–18)';
  if(b==='U20'||b==='PRO_CALLUP') return 'under 21 (ages 19–20)';
  return '';
}

function getEuroAsianJuniorAgeTag(){
  return 'U16 under 17 · U18 under 19 · U20 under 21';
}

function getJuniorLeagueAgeTag(leagueKey){
  var min=typeof getJuniorMinAge==='function'?getJuniorMinAge():16;
  var max=typeof getJuniorMaxAge==='function'?getJuniorMaxAge():19;
  if(isProAcademyJuniorLeague(leagueKey)){
    return '[Ages '+min+'–'+max+' · '+getEuroAsianJuniorAgeTag()+']';
  }
  if(leagueKey==='USJL'){
    return '[Ages '+min+'–'+max+' · U17 age 16 · U18 ages 17–18]';
  }
  return '[Ages '+min+'–'+max+' only]';
}

function getAcademyAgeBand(age){
  age=age!=null?age:16;
  if(age<=16) return 'U16';
  if(age<=18) return 'U18';
  return 'U20';
}

function getAcademyUserSeasonBoost(){
  if(typeof G==='undefined'||!G) return false;
  var gp=G.gp||0;
  if(gp<8) return false;
  return (G.goals+G.assists)/gp>=0.45;
}

function getAcademyPlayingBand(age, pOvr, leagueKey, opts){
  opts=opts||{};
  age=age!=null?age:16;
  pOvr=pOvr||0;
  var band=getAcademyAgeBand(age);
  var hot=!!opts.allowUserBoost&&getAcademyUserSeasonBoost();
  if(age>=19) return (pOvr>=65||(hot&&pOvr>=62))?'PRO_CALLUP':'U20';
  if(band==='U18'&&(pOvr>=60||age>=18||(hot&&pOvr>=57))) return 'U20';
  if(band==='U16'&&(pOvr>=58||(hot&&pOvr>=55))) return 'U18';
  if(band==='U20'&&(pOvr>=65||(hot&&pOvr>=62))) return 'PRO_CALLUP';
  return band;
}

/** Weekly org stipend by academy band — U16/U18 free; U20 modest; pro salary only on call-up. */
function getAcademyWeeklyStipend(gender, leagueKey){
  var g=gender||(G&&G.gender)||'M';
  var lk=leagueKey||(G&&G.leagueKey)||'NEJC';
  if(typeof syncPlayerAcademyBand==='function'&&G&&isProAcademyJuniorLeague(G.leagueKey)) syncPlayerAcademyBand();
  var band=G&&G._academyBand?G._academyBand:(typeof getAcademyAgeBand==='function'?getAcademyAgeBand(G&&G.age):'U18');
  if(band==='U16'||band==='U18') return 0;
  if(band==='U20'){
    var u20Base=g==='M'?8500:4200;
    return Math.round((u20Base+rd(0,g==='M'?3500:1800))/52);
  }
  if(band==='PRO_CALLUP'){
    var pcBase=g==='M'?12000:6000;
    return Math.round((pcBase+rd(0,g==='M'?5000:2500))/52);
  }
  var bandMult=1;
  if(g==='M'){
    if(lk==='ARJC') return Math.round((295+rd(0,185))*bandMult);
    if(lk==='NEJC') return Math.round((275+rd(0,175))*bandMult);
    if(lk==='CEJC') return Math.round((255+rd(0,165))*bandMult);
    return Math.round((245+rd(0,155))*bandMult);
  }
  if(lk==='AWJC') return Math.round((135+rd(0,90))*bandMult);
  if(lk==='EWJC') return Math.round((150+rd(0,100))*bandMult);
  return Math.round((140+rd(0,95))*bandMult);
}

function getAcademyProSigningMinOvr(leagueKey){
  if(leagueKey==='CEJC') return 67;
  return 65;
}

function qualifiesForAcademyProOrgDeal(pOvr, leagueKey){
  return (pOvr||0)>=getAcademyProSigningMinOvr(leagueKey||'');
}

function calcAcademyOrgProSalary(parentLeagueKey, pOvr){
  var L=typeof LEAGUES!=='undefined'?LEAGUES[parentLeagueKey]:null;
  var base=L&&L.salBase?L.salBase:120000;
  var o=Math.max(60, pOvr||60);
  return Math.max(8000, Math.round((base*cl(0.12+(o-60)*0.009,0.08,0.26))/1000)*1000);
}

function buildAcademyOrgContract(leagueKey, gender, pOvr, juniorTeamName){
  var parent=getAcademyParentProTeam(juniorTeamName, leagueKey);
  var ovrN=pOvr||60;
  var proReady=qualifiesForAcademyProOrgDeal(ovrN, leagueKey);
  var yrs=ovrN>=76?3:(ovrN>=68?2:1);
  var proSal=proReady&&parent?calcAcademyOrgProSalary(parent.leagueKey, ovrN):0;
  return {
    contract:{
      sal:proSal,
      yrs:yrs,
      type:proReady?'ORG PRO DEAL':'ACADEMY CONTRACT',
      ntc:false,
      bonus:false,
      parentTeam:parent?parent.name:null,
      parentLeague:parent?parent.leagueKey:null
    },
    parentOrg:parent,
    weeklyStipend:proReady?0:getAcademyWeeklyStipend(gender, leagueKey)
  };
}

function stampAcademyParentOrg(juniorTeamName, leagueKey){
  if(!G) return null;
  var parent=getAcademyParentProTeam(juniorTeamName, leagueKey);
  if(!parent) return null;
  G._academyParentOrg={
    leagueKey:parent.leagueKey,
    teamName:parent.name,
    juniorLeagueKey:leagueKey||G.leagueKey
  };
  G._contractClubTeam=parent.name;
  G._contractSignedLeagueKey=parent.leagueKey;
  return parent;
}

function hasAcademyOrgContract(){
  if(!G||!G.contract||(G.contractYrsLeft||0)<=0) return false;
  var t=G.contract.type||'';
  return t==='ACADEMY CONTRACT'||t==='ORG PRO DEAL';
}

function maybeAcademyProGraduationOffer(){
  if(!G||!isProAcademyJuniorLeague(G.leagueKey)||!G._academyParentOrg) return;
  var pOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):0;
  if(!qualifiesForAcademyProOrgDeal(pOvr, G.leagueKey)) return;
  if(G.contract&&G.contract.type==='ORG PRO DEAL') return;
  if(G._academyProDealUpgraded===G.season) return;
  var parent=G._academyParentOrg;
  var sal=calcAcademyOrgProSalary(parent.leagueKey, pOvr);
  G.contract=G.contract||{sal:0,yrs:1,type:'ACADEMY CONTRACT',ntc:false,bonus:false};
  G.contract.type='ORG PRO DEAL';
  G.contract.sal=sal;
  G.contract.parentTeam=parent.teamName;
  G.contract.parentLeague=parent.leagueKey;
  G.contract.yrs=Math.max(G.contract.yrs||1, 2);
  G.contractYrsLeft=Math.max(G.contractYrsLeft||0, G.contract.yrs);
  G._academyProDealUpgraded=G.season;
  G._contractClubTeam=parent.teamName;
  G._contractSignedLeagueKey=parent.leagueKey;
  var minOvr=getAcademyProSigningMinOvr(G.leagueKey);
  addNews(parent.teamName+' ('+parent.leagueKey+'): organizational pro contract for '+G.first+' '+G.last+' — '+fmt(sal)+'/yr while you develop in '+G.league.short+' ('+minOvr+'+ OVR).','big');
}

function getAcademyOrgAllowedLeagueKeys(){
  if(!G||!G._academyParentOrg) return null;
  var jk=G._academyParentOrg.juniorLeagueKey||G.leagueKey;
  var pk=G._academyParentOrg.leagueKey;
  var semi=JUNIOR_TO_PRO_LEAGUE_MAP[jk]||[];
  var out=[jk];
  if(pk&&out.indexOf(pk)<0) out.push(pk);
  for(var i=0;i<semi.length;i++){
    if(out.indexOf(semi[i])<0) out.push(semi[i]);
  }
  return out;
}

function canAcademyJuniorReceiveProCallUp(){
  if(!G||!isProAcademyJuniorLeague(G.leagueKey)) return false;
  if(!hasAcademyOrgContract()&&!G._academyParentOrg) return false;
  syncPlayerAcademyBand();
  var band=G._academyBand||'';
  if(band==='PRO_CALLUP') return true;
  var pOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):0;
  if(qualifiesForAcademyProOrgDeal(pOvr, G.leagueKey)) return true;
  return pOvr>=(getAcademyEarlySignOvrThreshold(G.leagueKey)-5);
}

function getAcademyOrgContractBlurb(juniorTeamName, leagueKey, gender, pOvr){
  var pack=buildAcademyOrgContract(leagueKey, gender, pOvr||60, juniorTeamName);
  var parent=pack.parentOrg;
  var g=gender||'M';
  var html='<div class="vt" style="font-size:13px;color:var(--gold);margin-top:8px;border-left:3px solid var(--gold);padding-left:8px">';
  if(parent){
    html+='<b>ORGANIZATION CONTRACT:</b> Sign with parent club <b>'+parent.name+'</b> ('+parent.leagueKey+') — academy ice in '+String(LEAGUES[leagueKey]&&LEAGUES[leagueKey].short||leagueKey)+'. ';
  } else {
    html+='<b>ACADEMY CONTRACT:</b> Organizational deal required before you dress. ';
  }
  if(pack.contract.type==='ORG PRO DEAL'&&pack.contract.sal>0){
    html+='Parent club pro deal ~<b>'+fmt(pack.contract.sal)+'</b>/yr — paid only while on <b>pro call-ups</b> or in the <b>PRO_CALLUP</b> band; academy ice stays stipend-only until then.';
  } else {
    var bandLbl=typeof getYouthBandLabel==='function'?getYouthBandLabel(leagueKey,'U20'):'U20';
    html+='Organizational contract required — <b>no salary</b> on academy ice. ';
    if(typeof getAcademyAgeBand==='function'&&getAcademyAgeBand(G&&G.age||16)==='U16'){
      html+='<b>U16</b> is fully amateur (no pay). ';
    } else if(typeof getAcademyAgeBand==='function'&&getAcademyAgeBand(G&&G.age||16)==='U18'){
      html+='<b>U18</b> is fully amateur (no pay). ';
    } else {
      html+='At <b>'+bandLbl+'</b> you may receive a modest org stipend (~<b>'+fmt(pack.weeklyStipend*52)+'</b>/yr). ';
    }
    var minPro=getAcademyProSigningMinOvr(leagueKey);
    if(parent&&leagueKey==='ARJC'){
      html+='At <b>'+minPro+'+ OVR</b> the parent <b>ARHL</b> club tables an organizational pro salary — paid when you dress for the pro club.';
    } else if(parent){
      html+='At <b>'+minPro+'+ OVR</b> the parent pro club can upgrade you to an organizational pro deal (salary on pro ice only).';
    }
  }
  html+=' Dominant teens can play up a band at <b>60+ OVR</b> (or age 18+ for U20) — strong seasons move you up sooner. Parent org pro deal at <b>'+getAcademyProSigningMinOvr(leagueKey||'NEJC')+'+ OVR</b>.';
  html+='</div>';
  return html;
}

/** Infer U16/U18/U20 squad tag for an academy org (from roster ages or user band). */
function getAcademyOrgDisplayBand(leagueKey, teamName){
  if(!isProAcademyJuniorLeague(leagueKey)||!teamName) return null;
  if(typeof G!=='undefined'&&G&&G.team&&G.team.n===teamName&&G.leagueKey===leagueKey){
    if(typeof syncPlayerAcademyBand==='function') syncPlayerAcademyBand();
    return G._academyBand||getAcademyAgeBand(G.age);
  }
  if(typeof G==='undefined'||!G||!G.leagueRostersCache) return null;
  var ck=typeof rosterCacheKey==='function'?rosterCacheKey(leagueKey, teamName):null;
  if(!ck) return null;
  var roster=G.leagueRostersCache[ck];
  if(!roster||!roster.players||!roster.players.length) return null;
  var ages=[], topOvr=0, i, p;
  for(i=0;i<roster.players.length;i++){
    p=roster.players[i];
    if(p.isMe) continue;
    if((p.ovr||0)>topOvr) topOvr=p.ovr||0;
    if(p.pos!=='G'&&typeof p.age==='number') ages.push(p.age);
  }
  if(!ages.length) return null;
  ages.sort(function(a,b){return a-b;});
  var med=ages[Math.floor(ages.length/2)];
  return getAcademyPlayingBand(med, topOvr, leagueKey, {});
}

function syncPlayerAcademyBand(){
  if(!G||!isProAcademyJuniorLeague(G.leagueKey)) return;
  var pOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):60;
  G._academyBand=getAcademyPlayingBand(G.age,pOvr,G.leagueKey,{allowUserBoost:true});
}

function getAcademyEarlySignOvrThreshold(leagueKey){
  if(leagueKey==='ARJC') return 65;
  if(leagueKey==='NEJC') return 64;
  if(leagueKey==='CEJC') return 63;
  return 64;
}

/** GM early signing — dominate older band → parent pro club offer (same org). */
function maybeAcademyEarlyProOffer(){
  if(!G||!G.team||!isProAcademyJuniorLeague(G.leagueKey)) return;
  if(G.age<17||G.age>20) return;
  var parent=getAcademyParentProTeam(G.team.n,G.leagueKey);
  if(!parent||!LEAGUES[parent.leagueKey]) return;
  syncPlayerAcademyBand();
  var band=G._academyBand||getAcademyAgeBand(G.age);
  var pOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):60;
  var base=getAcademyEarlySignOvrThreshold(G.leagueKey);
  var need=band==='U20'?base:(band==='U18'?base+2:base+5);
  if(band!=='PRO_CALLUP'){
    var hot=getAcademyUserSeasonBoost();
    var bar=hot?Math.max(need-2, base):need;
    if(pOvr<bar) return;
  }
  if(G._academyEarlySignOffer&&G._academyEarlySignOffer.season===G.season) return;
  var rollCap=band==='PRO_CALLUP'?0.85:(band==='U20'?0.58:(getAcademyUserSeasonBoost()?0.48:0.38));
  if(Math.random()>rollCap) return;
  G._academyEarlySignOffer={
    parentTeam:parent.name,
    parentLeague:parent.leagueKey,
    season:G.season,
    band:band
  };
  addNews(parent.name+' academy: GM offers early organizational deal — '+G.first+' '+G.last+' signed to the pro pipeline ('+band+' dominance).','big');
}

function applyAcademyEarlySignOfferBias(offers, otherLeagues){
  if(!G||!G._academyEarlySignOffer||G._academyEarlySignOffer.season!==G.season) return offers;
  var pk=G._academyEarlySignOffer.parentLeague;
  if(pk&&otherLeagues.indexOf(pk)>=0&&offers.indexOf(pk)<0) offers.unshift(pk);
  return offers;
}

function getAcademyHubBlurb(){
  if(!G||!isProAcademyJuniorLeague(G.leagueKey)||!G.team) return '';
  syncPlayerAcademyBand();
  var parent=getAcademyParentProTeam(G.team.n,G.leagueKey);
  var band=G._academyBand||getAcademyAgeBand(G.age);
  var bandLbl=typeof getYouthBandLabel==='function'?getYouthBandLabel(G.leagueKey,band):band;
  var bandAge=getAcademyBandAgeRangeLabel(band);
  var teamLbl=typeof getTeamDisplayName==='function'?getTeamDisplayName(G.team.n,G.leagueKey,{academyBand:band}):G.team.n;
  var html='<div class="vt" style="font-size:13px;color:var(--acc);margin-bottom:10px;border-left:3px solid var(--acc);padding-left:8px">';
  html+='<b>Academy org</b> — playing <b>'+bandLbl+'</b>'+(bandAge?' ('+bandAge+')':'')+' with '+teamLbl;
  if(parent) html+=' (signed to <b>'+parent.name+'</b> / '+parent.leagueKey+').';
  else if(G.contract&&G.contract.type==='ORG PRO DEAL') html+=' (<b>ORG PRO DEAL</b> — '+fmt(G.contract.sal||0)+'/yr from parent org).';
  else if(G.contract&&G.contract.type==='ACADEMY CONTRACT') html+=' (<b>ACADEMY CONTRACT</b> with parent org).';
  if(band==='PRO_CALLUP'){
    html+=' <b>Pro-ready band</b> — parent club may dress you for '+parent.leagueKey+' games this season.';
  } else if(band!==getAcademyAgeBand(G.age)){
    html+=' <b>Playing up</b> — '+((G.gp||0)>=8&&(G.goals+G.assists)/(G.gp||1)>=0.45?'strong production or ':'')+'60+ OVR / age qualifies you for the next band.';
  }
  html+=' '+getEuroAsianJuniorAgeTag()+';';
  if(G.contract&&G.contract.type==='ORG PRO DEAL'&&(G.contract.sal||0)>0){
    html+=' parent pro salary <b>'+fmt(G.contract.sal)+'</b>/yr.';
  } else {
    html+=' org stipend ~'+fmt(getAcademyWeeklyStipend(G.gender,G.leagueKey))+'/wk.';
  }
  if(G._academyEarlySignOffer&&G._academyEarlySignOffer.season===G.season){
    html+=' <b>Early signing offer active</b> from '+G._academyEarlySignOffer.parentTeam+'.';
  }
  html+='</div>';
  return html;
}

function initProAcademyData(){
  buildProAcademyParentCache();
  if(typeof LEAGUES==='undefined') return;
  if(LEAGUES.NEJC){
    LEAGUES.NEJC.desc='Nordic pro academies — technical hockey, org contract with parent NEHL/FHL club. U16 under 17, U18 under 19, U20 under 21. Play up or earn pro call-ups.';
  }
  if(LEAGUES.CEJC){
    LEAGUES.CEJC.desc='Central European academies — technical, structured development; org contract with parent CEHL club. U16/U18/U20 bands; play up or graduate early.';
  }
  if(LEAGUES.ARJC){
    LEAGUES.ARJC.desc='Eurasian academies — technical hockey, org contract with parent ARHL club. U16 under 17, U18 under 19, U20 under 21; elite teens can play ARHL games.';
  }
  if(LEAGUES.EWJC){
    LEAGUES.EWJC.desc="European women's academies — org deal with SDHL/FWHL parent club. U16 under 17, U18 under 19, U20 under 21.";
  }
  if(LEAGUES.AWJC){
    LEAGUES.AWJC.desc="Asian women's academies — org contract with AWHL parent club. U16 under 17, U18 under 19, U20 under 21; play up or pro call-ups.";
  }
  if(LEAGUES.NEHL){
    LEAGUES.NEHL.desc='Nordic top tier — 14 teams, 52 games. Every club runs its own NEJC academy (U16/U18/U20).';
  }
  if(LEAGUES.FHL){
    LEAGUES.FHL.desc="Finland's top men's pro circuit — 15 clubs. Each operates a NEJC academy program with U16–U20 bands.";
  }
  if(LEAGUES.CEHL){
    LEAGUES.CEHL.desc='Central European pro loop — each CEHL club owns a CEJC academy with U16/U18/U20 squads.';
  }
  if(LEAGUES.ARHL){
    LEAGUES.ARHL.desc='Eurasian pro mega-league — 29 teams, each with an ARJC academy (U16/U18/U20) and early-signing pipeline.';
  }
}

initProAcademyData();
