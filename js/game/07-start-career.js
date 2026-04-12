/* breakaway — START CAREER */
// ============================================================
// START CAREER
// ============================================================
function startCareer(){
  var first=toDisplayName(safeEl('c-first').value.trim()||'Alex');
  var last=toDisplayName(safeEl('c-last').value.trim()||'Storm');
  var nat=safeEl('c-nat').value;
  var gender=safeEl('c-gender').value;
  var year=parseInt(safeEl('c-year').value,10);
  var jersey=safeEl('c-jersey').value.trim()||String(ri(1,99));
  var hand=safeEl('c-hand').value;
  var heightInches=parseInt(safeEl('c-height').value,10)||70;
  var height=formatHeightFromInches(heightInches);
  var weight=roundWeightToTen(parseInt(safeEl('c-weight').value,10)||180);
  var hometownRaw=safeEl('c-hometown').value.trim();
  var hometown=toDisplayHometown(hometownRaw||nat);
  var favRaw=(safeEl('c-favorite-team')&&safeEl('c-favorite-team').value)||'';
  var favoriteTeam=null,favoriteTeamLeague=null;
  if(favRaw.indexOf('|')!==-1){
    var fp=favRaw.split('|');
    favoriteTeamLeague=fp[0];
    var tnm=fp.slice(1).join('|');
    var tlist=TEAMS[favoriteTeamLeague]||[];
    for(var fx=0;fx<tlist.length;fx++){
      if(tlist[fx].n===tnm){ favoriteTeam={n:tlist[fx].n,e:tlist[fx].e,leagueKey:favoriteTeamLeague}; break; }
    }
  }
  var lk=selLeague||'OJL';
  var tidx=G._selTeamIdx||0;
  var l=LEAGUES[lk];
  // Use _availableTeams if set (draft/offers system)
  var teamPool=G._availableTeams||(TEAMS[lk]||TEAMS['OJL']);
  var team=teamPool[tidx]||teamPool[0];
  // build attrs
  var attrList=ATTRS[selPos];
  var arch=ARCHETYPES[selPos][selArch];
  var attrs={};
  var baseStartF=gender==='F'?30:(selPos==='G'?58:55);
  var attrClampMin=gender==='F'?22:40;
  attrList.forEach(function(a){attrs[a]=baseStartF;});
  if(arch && arch.boosts){
    Object.keys(arch.boosts).forEach(function(k){if(attrs[k]!==undefined)attrs[k]=cl(attrs[k]+arch.boosts[k],attrClampMin,92);});
  }
  attrList.forEach(function(a){attrs[a]=cl((G._baseAttrs&&G._baseAttrs[a]||attrs[a])+(G._extraAttrs&&G._extraAttrs[a]||0),attrClampMin,99);});
  var pOvrInit=ovr(attrs);
  if(isStartingCollegeOrPaidSemiProBlocked(lk, gender, pOvrInit)){
    notify('At 16, pick a junior path or raise OVR ('+START_LEAGUE_BYPASS_OVR_M+'+ men / '+START_LEAGUE_BYPASS_OVR_F+'+ women) for college or overseas semi-pro.','red');
    return;
  }
  // Rare high-ceiling tracks so a few prospects can be 80+ by draft age.
  var devRoll=Math.random();
  var prospectTrack=devRoll<0.04?'generational':(devRoll<0.14?'elite':(devRoll<0.45?'high':'normal'));
  var growthMult=prospectTrack==='generational'?1.28:(prospectTrack==='elite'?1.16:(prospectTrack==='high'?1.08:1.0));
  var initContract=(function(){
    if(l.tier==='junior') return {sal:0,yrs:(pOvrInit>=78?3:pOvrInit>=68?2:1),type:'JUNIOR DEAL',ntc:false,bonus:false};
    if(l.tier==='college') return {sal:0,yrs:(pOvrInit>=78?4:pOvrInit>=68?3:2),type:'SCHOLARSHIP',ntc:false,bonus:false};
    var base=l.salBase||0;
    var sal=Math.round((base*cl(0.85+(pOvrInit-60)*0.015,0.7,1.5))/1000)*1000;
    if(lk===getProLeagueKeyByGender(gender)) return {sal:sal,yrs:3,type:'ENTRY LEVEL',ntc:false,bonus:false};
    return {sal:sal,yrs:2,type:'PRO CONTRACT',ntc:false,bonus:false};
  })();
  G={
    first:first,last:last,nat:nat,gender:gender,year:year,
    jersey:jersey,hand:hand,height:height,heightInches:heightInches,weight:weight,
    _physiqueStartHeightInches:heightInches,_physiqueStartWeight:weight,
    _heightGainBudget:gender==='F'?1:2,
    hometown:hometown,
    favoriteTeam:favoriteTeam,favoriteTeamLeague:favoriteTeamLeague,
    pos:selPos,subPos:selSubPos,arch:selArch,xFactor:(selXFactor&&X_FACTORS[selXFactor]?selXFactor:'none'),
    potential:(selPotential&&POTENTIALS[selPotential]?selPotential:'support'),
    age:16,season:1,
    leagueKey:lk,league:l,team:team,
    attrs:attrs,health:100,stamina:80,morale:70,
    gp:0,w:0,l:0,otl:0,goals:0,assists:0,plusminus:0,sog:0,saves:0,goalsAgainst:0,
    cGP:0,cGoals:0,cAssists:0,cSOG:0,cSaves:0,cGoalsAgainst:0,
    cMomentScoreSum:0,cMomentCount:0,cSimPerfSum:0,cSimPerfCount:0,
    careerEarnings:0,socialFollowers:0,
    week:1,weekGames:0,
    contract:initContract,
    contractYrsLeft:initContract.yrs,
    xp:100,news:[],seasonLog:[],awards:[],milestones:[],
    _seasonEndLoggedForSeason:0,
    playoffLog:[],worldStageLog:[],
    socialMessages:[],socialReactions:{},
    standings:[],wonCup:false,careerCups:0,
    allOpponents:[],activeTab:null,
    isInjured:false,injName:'',injWks:0,
    pendingContract:false,
    _inOffseason:false,
    streakType:'none',streakCount:0,
    _offseasonChoiceTaken:false,
    tradeOffersThisSeason:0,
    _lastTradeSeason:0,
    _tradeCooldownUntilGp:0,
    _tradeDemandSeason:0,
    _lastDraftAgeProcessed:0,
    draftRights:null,
    draftRound:0,
    everDrafted:false,
    isDraftFreeAgent:false,
    hadELC:false,
    elcYears:0,
    _draftStatusText:'DRAFT STATUS: NOT ELIGIBLE YET',
    leadershipRole:'',
    teamTenure:0,
    prospectTrack:prospectTrack,
    growthMult:growthMult,
    _goalieMaskWeek:null,
    _goalieWeekStartMask:null,
    _goalieBackupNamesForWeek:null,
    _lifeScenarioFired:0,
    _lifeScenarioLastCgp:-999,
    _lifeScenarioGuaranteeCgp:ri(120,280),
    _lifeScenarioRolledThisWeek:false,
    _originPlaceRaw:hometownRaw,
    _attrClampMin:attrClampMin
  };
  G.standings=buildStandings(lk);
  G.allOpponents=genSeason(lk,team);
  G.socialMessages=generateSocialMessages();
  addNews('Career begins with the '+team.n+'!','big');
  if(G.contract.sal>0) addNews('Signs '+G.contract.type+' contract -- '+fmt(G.contract.sal)+'/yr for '+G.contract.yrs+' years.','good');
  else addNews('Signs '+G.contract.type+' with '+team.n+' for '+G.contract.yrs+' year'+(G.contract.yrs!==1?'s':'')+'.','neutral');
  renderHub();
  beginCareerIntroSequence();
}
