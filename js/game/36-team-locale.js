/* breakaway — locale names in Latin letters (hockey style).
 * Leagues: only QMJL + euro/asia get native shorts — OJL/WJL/CWHL/etc. stay English.
 * Teams: native language per region; English regions (UK, Maritimes QMJL, Jamaica, Oceania) stay English. */
var LEAGUE_YOUTH_STYLE={
  OJL:'U',WJL:'U',USJL:'U',CWHL:'U',USWDL:'U',NCHA:'U',NWCHA:'U',
  NEJC:'J',NEHL:'J',EWJC:'J',SDHL:'J',
  FHL:'U',FWHL:'U',
  CEJC:'J',CEHL:'U',
  ARJC:'U',ARHL:'U',AWJC:'U',AWHL:'U'
};

var LEAGUE_NATIVE_NAMES={
  QMJL:{name:'Ligue junior du Quebec-Maritimes',short:'LJQM'},
  NEJC:{name:'Nordisk juniorkrets',short:'NJK'},
  CEJC:{name:'Stredoevropsky juniorsky okruh',short:'SJO'},
  ARJC:{name:'Yevraziyskiy yuniorskiy krug',short:'EYuK'},
  NEHL:{name:'Nordisk elitehockeyliga',short:'NEL'},
  FHL:{name:'Suomen jaakiekkoiliiga',short:'SJL'},
  CEHL:{name:'Mitteleuropaische Eishockeyliga',short:'MEHL'},
  ARHL:{name:'Yevraziyskaya khokkeynaya liga',short:'EKHL'},
  EWJC:{name:'Europeisk damjuniorcircuit',short:'EDJK'},
  AWJC:{name:'Aziatisk damejuniorcircuit',short:'ADJK'},
  SDHL:{name:'Svenska damhockeyligan',short:'SDHL'},
  FWHL:{name:'Suomen naisten jaakiekkoiliiga',short:'SNJL'},
  AWHL:{name:'Aziatisk damehockeyliga',short:'ADHL'}
};

/** North American + CWHL stay English — restored before locale overrides. */
var LEAGUE_ENGLISH_DEFAULTS={
  OJL:{name:'Ontario Junior League',short:'OJL'},
  WJL:{name:'Western Junior League',short:'WJL'},
  USJL:{name:'US Junior League',short:'USJL'},
  NCHA:{name:"Nat'l Collegiate Hockey Assoc.",short:'NCHA'},
  CWHL:{name:"Canadian Women's Junior League",short:'CWHL'},
  NWCHA:{name:"Nat'l Women's Collegiate Hockey Assoc.",short:'NWCHA'},
  USWDL:{name:"US Women's Development League",short:'USWDL'},
  LHCM:{name:'Local Hockey Community (Men)',short:'LHL'},
  LHLF:{name:'Local Hockey Community (Women)',short:'LHL'}
};

/** Global old → new team name map (merged into RENAMED_TEAMS on init). */
var TEAM_LOCALE_RENAMES={};

var LHL_TEAM_RENAMES={
  'Mexico City Aztec Ice':'HC Ciudad de Mexico Azteca',
  'Monterrey Northern Ice':'HC Monterrey del Norte',
  'San José Central Ice':'HC San Jose Central',
  'Panama Canal Community':'HC Comunidad Canal de Panama',
  'Santo Domingo Reef Ice':'HC Arrecife Santo Domingo',
  'Port of Spain Carnival Ice':'HC Carnaval Puerto Espana',
  'Buenos Aires Pampas Ice':'HC Pampas Buenos Aires',
  'São Paulo Tropical Ice':'HC Tropical Sao Paulo',
  'Bogotá Highland Ice':'HC Altiplano Bogota',
  'Lima Andes Community':'HC Comunidad Andina Lima',
  'Santiago Andes Community':'HC Comunidad Andina Santiago',
  'Paris Seine Community':'HC Paris-Seine',
  'Berlin Spree Community':'EHC Berlin Spree',
  'Amsterdam Canal Ice':'HC Amsterdam Gracht',
  'Milan Alps Community':'HC Milano Alpi',
  'Madrid Iberia Community':'HC Comunidad Madrid',
  'Lisbon Atlantic Community':'HC Comunidade Lisboa Atlantico',
  'Barcelona Mediterranean Ice':'HC Barcelona Mediterraneo',
  'Warsaw Vistula Community':'HC Warszawa Wisla',
  'Prague Bohemia Community':'HC Praha Bohemia',
  'Budapest Danube Community':'HC Budapest Duna',
  'Belgrade Danube Ice':'HC Beograd Dunav',
  'Athens Aegean Community':'HC Athina Aigaio',
  'Bucharest Carpathian Ice':'HC Bucuresti Carpati',
  'Split Adriatic Community':'HC Split Jadran',
  'Kyiv Dnipro Community':'HC Kyiv Dnipro',
  'Riga Baltic Community':'HC Riga Baltija',
  'Tbilisi Caucasus Ice':'HC Tbilisi Kavkasia',
  'Istanbul Bosphorus Community':'Istanbul Bogaz SK',
  'Casablanca Atlas Ice':'HC Casablanca Atlas',
  'Tunis Mediterranean Ice':'HC Tunis Mediterranee',
  'Dakar Coastal Ice':'HC Dakar Littoral',
  'Abidjan Lagoon Ice':'HC Abidjan Lagune',
  'Kinshasa River Ice':'HC Kinshasa Fleuve',
  'Douala River Community':'HC Douala Fleuve',
  'Dubai Sand Ice':'Nadi Dubayy al-Rimal',
  'Riyadh Desert Ice':'Nadi al-Riyadh al-Sahra',
  'Doha Gulf Community':'Nadi al-Dawha al-Khaleej',
  'Muscat Gulf Community':'Nadi Masqat al-Khaleej',
  'Tehran Community Ice':'Nadi Barf Tehran',
  'Amman Community Ice':'Nadi Amman al-Jalid',
  'Cairo Desert Ice':'Nadi al-Qahira al-Sahra',
  'Karachi Community Ice':'HC Karachi Barf',
  'Delhi Himalayan Ice':'HC Dilli Himalaya',
  'Dhaka Delta Community':'HC Dhaka Delta',
  'Bangkok Mekong Ice':'HC Krung Thep Chao Phraya',
  'Ho Chi Minh Delta Ice':'HC TP Ho Chi Minh Song Cuu Long',
  'Hanoi Red River Ice':'HC Ha Noi Song Hong',
  'Kuala Lumpur Community':'HC Kuala Lumpur',
  'Jakarta Archipelago Ice':'HC Jakarta Kepulauan',
  'Manila Coral Ice':'HC Maynila Coral',
  'Seoul Community Ice':'HC Seoul Community',
  'Tokyo Community Ice':'HC Tokyo Community',
  'Shanghai Community Ice':'HC Shanghai Shequ',
  'Taipei Community Ice':'HC Taipei Shequ',
  'Bishkek Steppe Community':'HC Bishkek Steppe',
  'Almaty Steppe Community':'HC Almaty Steppe',
  'Tashkent Silk Route Ice':'HC Tashkent Ipak Yoli'
};

/** Saves from an earlier locale pass (native scripts) → current Latin hockey names. */
var LOCALE_SCRIPT_ERA_MIGRATIONS={
  'Hielo Azteca Ciudad de México':'HC Ciudad de Mexico Azteca',
  'Hockey Communautaire Paris-Seine':'HC Paris-Seine',
  'HC Dubai Sand':'Nadi Dubayy al-Rimal','HC Riyadh Desert':'Nadi al-Riyadh al-Sahra',
  'HC Doha Gulf':'Nadi al-Dawha al-Khaleej','HC Muscat Gulf':'Nadi Masqat al-Khaleej',
  'HC Cairo Desert':'Nadi al-Qahira al-Sahra','HC Amman Community':'Nadi Amman al-Jalid',
  'HC Tehran Community':'Nadi Barf Tehran',
  'Nadi al-Atlas ad-Dar al-Bayda':'HC Casablanca Atlas',
  'Nadi Tunis al-Bahr al-Mutawassit':'HC Tunis Mediterranee',
  'Nadi Dakar al-Sahel':'HC Dakar Littoral','Nadi Abidjan al-Buhayra':'HC Abidjan Lagune',
  'Nadi Kinshasa al-Nahr':'HC Kinshasa Fleuve','Nadi Douala al-Nahr':'HC Douala Fleuve',
  'Halifax Longue-Vue':'Halifax Longshots','Moncton Bisons':'Moncton Wildcards',
  'Saint John Marees':'Saint John Tide','Cap-Breton Highlanders':'Cape Breton Highlanders',
  'Московское Динамо':'Dynamo Moskva','Санкт-Петербург СКА':'SKA Sankt-Peterburg',
  'Stockholms Kronor':'Djurgardens IF','Göteborgs Järn':'Frolunda HC',
  'Helsingin Ilves':'HIFK','Tampereen Kärpät':'Tappara',
  '横浜フリーズ':'Yokohama Freeze HC','서울 아이스호크':'Anyang Halla',
  '北京龙骑兵':'Kunlun Red Star Beijing','上海龙':'Shanghai Dragons'
};

var PRO_TEAM_RENAMES={
  QMJL:{
    'Baie-Comeau Drakons':'Baie-Comeau Dragons',
    'Laval Fusées':'Laval Fusees'
  },
  NEJC:{
    'Luleå Top Circuit':'Lulea HF','Stockholm Crown Program':'Djurgardens IF',
    'Göteborg Iron Academy':'Frolunda HC','Malmö Straits Program':'Malmo Redhawks',
    'Turku Lynx Circuit':'TPS Turku','Tampere Iron Track':'Tappara',
    'Karlstad Regional Program':'Farjestad BK','Linköping Storm Academy':'Linkoping HC',
    'Skellefteå Mines Top Circuit':'Skelleftea AIK','Örebro Steel Program':'Orebro HK'
  },
  CEJC:{
    'Praha Ironspire Program':'HC Sparta Praha','Brno Thunder Track':'HC Kometa Brno',
    'Zürich Snow Lions Program':'ZSC Lions Zurich','Bern Ridge Academy':'SC Bern',
    'Berlin Polar Program':'Eisbaren Berlin','München Stormcrow Track':'EHC Munchen',
    'Bratislava Viper Program':'HC Slovan Bratislava','Wien Wolfpack Program':'Vienna Capitals',
    'Turku Blaze Circuit':'HIFK','Helsinki Ice Program':'HIFK'
  },
  ARJC:{
    'Moscow Dynamo Program':'Dynamo Moskva','St. Petersburg Skater Track':'SKA Sankt-Peterburg',
    'Kazan Bison Program':'Ak Bars Kazan','Novosibirsk Sibir Circuit':'Sibir Novosibirsk',
    'Yokohama Freeze Academy':'Yokohama Freeze HC','Seoul Icehawk Program':'Anyang Halla',
    'Beijing Dragon Track':'Kunlun Red Star Beijing','Riga Tide Program':'Dinamo Riga',
    'Sochi Shore Circuit':'HC Sochi','Vladivostok Tide Program':'Admiral Vladivostok',
    'Astana Nomad Track':'Barys Astana','Harbin Ice Program':'Harbin Ice HC',
    'Almaty Snowleopard Program':'Barys Nur-Sultan','Tashkent Steppe Track':'Humo Tashkent',
    'Bishkek Pamir Circuit':'HC Bishkek'
  },
  NEHL:{
    'Stockholm Crowns':'Djurgardens IF','Göteborg Ironmen':'Frolunda HC',
    'Helsinki Lynx':'HIFK','Tampere Ironmen':'Tappara',
    'Oslo Cannons':'Valerenga IF','København Cannons':'Rungsted Seier Capital',
    'Luleå Polarbears':'Lulea HF','Turku Timberwolves':'TPS',
    'Malmö Tide':'Malmo Redhawks','Karlstad Crowns':'Farjestad BK',
    'Jönköping Jets':'HV71','Linköping Storm':'Linkoping HC',
    'Örebro Steel':'Orebro HK','Skellefteå Wolves':'Skelleftea AIK'
  },
  FHL:{
    'Helsinki Ice':'HIFK','Tampere Force':'Tappara','Turku Blaze':'TPS',
    'Oulu North':'Karpat Oulu','Jyvaskyla Storm':'JYP Jyvaskyla','Rauma Dockers':'Lukko Rauma',
    'Lappeenranta Spark':'SaiPa Lappeenranta','Espoo Metro':'K-Espoo','Lahti Lightning':'Pelicans Lahti',
    'Kouvola Steel':'KooKoo Kouvola','Joensuu Forest':'Jokipojat Joensuu','Mikkeli Rapids':'Jukurit Mikkeli',
    'Hameenlinna Forge':'HPK Hameenlinna','Porin Tide':'Assat Pori','Vaasa Breeze':'Sport Vaasa'
  },
  CEHL:{
    'Praha Ironspire':'HC Sparta Praha','Brno Thundercats':'HC Kometa Brno',
    'Zürich Snowlions':'ZSC Lions Zurich','Bern Avalanche':'SC Bern',
    'Berlin Polarbears':'Eisbaren Berlin','München Stormcrows':'EHC Red Bull Munchen',
    'Bratislava Vipers':'HC Slovan Bratislava','Wien Wolfpack':'Vienna Capitals',
    'Warsaw Vistula':'GKS Tychy','Krakow Eagles':'Cracovia Krakow',
    'Budapest Danube':'Ferencvarosi TC','Hamburg Tide':'Hamburg Freezers',
    'Köln Rhiners':'Kolner Haie','Ljubljana Alpine':'HK Olimpija Ljubljana','Zagreb Union':'KHL Medvescak Zagreb'
  },
  ARHL:{
    'Moscow Dynamo':'Dynamo Moskva','St. Petersburg Skaters':'SKA Sankt-Peterburg',
    'Kazan Bisons':'Ak Bars Kazan','Novosibirsk Sibirs':'Sibir Novosibirsk',
    'Yaroslavl Express':'Lokomotiv Yaroslavl','Nizhny Torpedoes':'Torpedo Nizhny Novgorod',
    'Sochi Shore':'HC Sochi','Vladivostok Tide':'Admiral Vladivostok',
    'Moscow Centurions':'CSKA Moskva','Omsk Outlaws':'Avangard Omsk',
    'Ufa Bolts':'Salavat Yulaev Ufa','Magnitogorsk Steel':'Metallurg Magnitogorsk',
    'Chelyabinsk Forge':'Traktor Chelyabinsk','Ekaterinburg Motors':'Avtomobilist Yekaterinburg',
    'Cherepovets Steel':'Severstal Cherepovets','Astana Nomads':'Barys Astana',
    'Almaty Snowleopards':'Barys Nur-Sultan','Tashkent Steppe Hawks':'Humo Tashkent',
    'Bishkek Mountain Kings':'HC Bishkek','Ashgabat Sandstorms':'Nadi Ahal Kum',
    'Dushanbe Pamir':'Nadi Pamir Dushanbe','Samarkand Silk Route':'Nadi Samarkand Rasta-i Abrisham',
    'Riga Tide':'Dinamo Riga','Minsk Wolves':'Dinamo Minsk',
    'Yokohama Freeze':'Yokohama Freeze HC','Sapporo Polarbears':'Nippon Paper Cranes',
    'Seoul Icehawks':'Anyang Halla','Beijing Dragoons':'Kunlun Red Star Beijing','Kunlun Dragons':'Kunlun Red Star'
  },
  EWJC:{
    'Stockholm Sirens Program':'Djurgardens IF Dam','Göteborg Iron Program':'Frolunda HC Dam',
    'Luleå Polar Program':'Lulea HF Dam','Malmö Tide Academy':'Malmo Redhawks Dam',
    'Helsinki Lynx Circuit':'HIFK Dam','Tampere Iron Program':'Tappara Dam',
    'Turku Timber Track':'TPS Dam','Oslo Valkyrie Program':'Stavanger Oilers Dam'
  },
  AWJC:{
    'Sapporo Polar Program':'Nippon Paper Cranes','Tōkyō Ice Track':'Tokyo Icehawks',
    'Seoul Comet Program':'Anyang Halla','Beijing Dragon Program':'Kunlun Red Star Beijing',
    'Shanghai Pearl Circuit':'Shanghai Dragons','Taipei Frost Academy':'Taipei Frost',
    'Busan Thunder Program':'Busan Thunder','Hong Kong Harbor Program':'Hong Kong Harbour'
  },
  SDHL:{
    'Stockholm Crowns':'Djurgardens IF Dam','Göteborg Ironwomen':'Frolunda HC Dam',
    'Malmö Northwomen':'Malmo Redhawks Dam','Luleå Polarbears':'Lulea HF Dam',
    'Linköping Lightning':'Linkoping HC Dam','Skellefteå Timberwolves':'Skelleftea AIK Dam',
    'Gävle Embers':'Brynas IF Dam','Växjö Hawks':'HV71 Dam',
    'Stockholm Royals W':'AIK Dam','Örebro Owls':'Orebro HK Dam'
  },
  FWHL:{
    'Helsinki Lynx':'HIFK Naiset','Turku Timberwolves':'TPS Naiset',
    'Tampere Ironwomen':'Tappara Naiset','Espoo Northwomen':'K-Espoo Naiset',
    'Lahti Snowlions':'Pelicans Naiset','Oulu Polarbears':'Karpat Naiset',
    'Oulu Caribou':'Karpat Oulu Naiset','Helsinki Crown':'HIFK Naiset',
    'Tampere Lynx':'Tappara Naiset','Turku Sailors':'TPS Naiset'
  },
  AWHL:{
    'Sapporo Polarbears':'Nippon Paper Cranes','Tōkyō Icehawks':'Tokyo Icehawks',
    'Seoul Comets':'Seoul Comets','Busan Thunder':'Busan Thunder',
    'Beijing Dragoons':'Kunlun Red Star Beijing','Shanghai Dragons':'Shanghai Dragons',
    'Shenzhen Tide':'Shenzhen KRS Vanke','Taipei Frost W':'Taipei Frost'
  }
};

function getLeagueYouthStyle(leagueKey){
  if(!leagueKey) return 'U';
  return LEAGUE_YOUTH_STYLE[leagueKey]||'U';
}

/** U20 in English → J20 (Nordic/Czech) etc. band is U16/U18/U20 or J16/J18/J20. */
function getYouthBandLabel(leagueKey, band){
  var b=String(band||'U20').toUpperCase().replace(/^U/,'').replace(/^J/,'');
  var age=parseInt(b,10);
  if(!age||isNaN(age)) age=20;
  var style=getLeagueYouthStyle(leagueKey);
  return style+age;
}

function getLeagueDisplayName(leagueKey, field){
  field=field||'name';
  var nat=LEAGUE_NATIVE_NAMES[leagueKey];
  if(nat&&nat[field]) return nat[field];
  if(typeof LEAGUES!=='undefined'&&LEAGUES[leagueKey]){
    var L=LEAGUES[leagueKey];
    if(field==='short'&&L.short) return L.short;
    if(L.name) return L.name;
  }
  return leagueKey||'';
}

function refreshPlayerLeagueLocale(){
  if(typeof G==='undefined'||!G||!G.leagueKey||typeof LEAGUES==='undefined'||!LEAGUES[G.leagueKey]) return;
  G.league=LEAGUES[G.leagueKey];
}

function isAcademyLeagueWithYouthTag(leagueKey){
  return typeof isProAcademyJuniorLeague==='function'&&isProAcademyJuniorLeague(leagueKey);
}

/** Display name — appends J18/U18 band for academy junior leagues when band is known. */
function getTeamDisplayName(teamName, leagueKey, opts){
  opts=opts||{};
  var n=String(teamName||'').trim();
  if(!n) return '';
  n=n.replace(/\s+J$/,'').replace(/\s+U16$/,'').replace(/\s+U18$/,'').replace(/\s+U20$/,'')
    .replace(/\s+J16$/,'').replace(/\s+J18$/,'').replace(/\s+J20$/,'');
  if(!isAcademyLeagueWithYouthTag(leagueKey)) return n;
  var band=opts.academyBand;
  if(band===undefined&&opts.inferBand!==false&&typeof getAcademyOrgDisplayBand==='function'){
    band=getAcademyOrgDisplayBand(leagueKey, teamName);
  }
  if(!band) return n;
  if(band==='PRO_CALLUP') band='U20';
  var tag=getYouthBandLabel(leagueKey, band);
  if(n.indexOf(' '+tag)<0&&n.indexOf(' '+band)<0&&!/\s[UJ]\d{2}$/.test(n)){
    return n+' '+tag;
  }
  return n;
}

function mergeTeamRenames(map){
  var k, oldN, newN;
  for(k in map){
    if(!map.hasOwnProperty(k)) continue;
    for(oldN in map[k]){
      if(!map[k].hasOwnProperty(oldN)) continue;
      newN=map[k][oldN];
      TEAM_LOCALE_RENAMES[oldN]=newN;
    }
  }
}

function renameTeamObject(team, renameMap){
  if(!team||!team.n||!renameMap[team.n]) return;
  team.n=renameMap[team.n];
}

function patchTeamsArray(leagueKey, renameMap){
  if(typeof TEAMS==='undefined'||!TEAMS[leagueKey]||!renameMap) return;
  var i, t;
  for(i=0;i<TEAMS[leagueKey].length;i++){
    t=TEAMS[leagueKey][i];
    if(t&&renameMap[t.n]) t.n=renameMap[t.n];
  }
}

function patchStandingsLayoutRenames(renameMap){
  if(typeof LEAGUE_STANDINGS_LAYOUT==='undefined'||!renameMap) return;
  var lk, layout, ci, di, ti, teams, newTeams, oldN;
  for(lk in LEAGUE_STANDINGS_LAYOUT){
    if(!LEAGUE_STANDINGS_LAYOUT.hasOwnProperty(lk)) continue;
    layout=LEAGUE_STANDINGS_LAYOUT[lk];
    function patchList(list){
      if(!list) return;
      for(ti=0;ti<list.length;ti++){
        oldN=list[ti];
        if(renameMap[oldN]) list[ti]=renameMap[oldN];
      }
    }
    if(layout.conferences){
      for(ci=0;ci<layout.conferences.length;ci++){
        if(!layout.conferences[ci].divisions) continue;
        for(di=0;di<layout.conferences[ci].divisions.length;di++){
          patchList(layout.conferences[ci].divisions[di].teams);
        }
      }
    }
    if(layout.divisions){
      for(di=0;di<layout.divisions.length;di++) patchList(layout.divisions[di].teams);
    }
  }
}

function patchArhlTeamRegionRenames(renameMap){
  if(typeof ARHL_TEAM_REGION==='undefined'||!renameMap) return;
  var next={}, k;
  for(k in ARHL_TEAM_REGION){
    if(!ARHL_TEAM_REGION.hasOwnProperty(k)) continue;
    next[renameMap[k]||k]=ARHL_TEAM_REGION[k];
  }
  for(k in next){
    if(next.hasOwnProperty(k)) ARHL_TEAM_REGION[k]=next[k];
  }
}

function patchLocalZoneTeamNames(){
  var zones=[typeof LOCAL_HOME_ZONES!=='undefined'?LOCAL_HOME_ZONES:null,
    typeof LOCAL_EXTRA_TEAM_DEFS!=='undefined'?LOCAL_EXTRA_TEAM_DEFS:null,
    typeof LOCAL_REGION_DEFS!=='undefined'?LOCAL_REGION_DEFS:null];
  var zi, z, list, i, item;
  for(zi=0;zi<zones.length;zi++){
    list=zones[zi];
    if(!list) continue;
    for(i=0;i<list.length;i++){
      item=list[i];
      if(!item) continue;
      renameTeamObject(item.teamM, LHL_TEAM_RENAMES);
      renameTeamObject(item.teamF, LHL_TEAM_RENAMES);
    }
  }
}

function applyLeagueNativeNames(){
  var lk, nat, en;
  if(typeof LEAGUES==='undefined') return;
  for(lk in LEAGUE_ENGLISH_DEFAULTS){
    if(!LEAGUE_ENGLISH_DEFAULTS.hasOwnProperty(lk)||!LEAGUES[lk]) continue;
    en=LEAGUE_ENGLISH_DEFAULTS[lk];
    if(en.name) LEAGUES[lk].name=en.name;
    if(en.short) LEAGUES[lk].short=en.short;
  }
  for(lk in LEAGUE_NATIVE_NAMES){
    if(!LEAGUE_NATIVE_NAMES.hasOwnProperty(lk)||!LEAGUES[lk]) continue;
    nat=LEAGUE_NATIVE_NAMES[lk];
    if(nat.name) LEAGUES[lk].name=nat.name;
    if(nat.short) LEAGUES[lk].short=nat.short;
  }
}

function initTeamLocaleData(){
  if(typeof TEAMS==='undefined') return;
  patchLocalZoneTeamNames();
  mergeTeamRenames(PRO_TEAM_RENAMES);
  var lk;
  for(lk in PRO_TEAM_RENAMES){
    if(PRO_TEAM_RENAMES.hasOwnProperty(lk)) patchTeamsArray(lk, PRO_TEAM_RENAMES[lk]);
  }
  for(lk in LHL_TEAM_RENAMES){
    if(LHL_TEAM_RENAMES.hasOwnProperty(lk)) TEAM_LOCALE_RENAMES[lk]=LHL_TEAM_RENAMES[lk];
  }
  patchTeamsArray('LHCM', LHL_TEAM_RENAMES);
  patchTeamsArray('LHLF', LHL_TEAM_RENAMES);
  patchStandingsLayoutRenames(TEAM_LOCALE_RENAMES);
  patchArhlTeamRegionRenames(PRO_TEAM_RENAMES.ARHL||{});
  applyLeagueNativeNames();
  if(typeof LOCAL_TEAM_TO_REGION!=='undefined'){
    var next={}, k, nk;
    for(k in LOCAL_TEAM_TO_REGION){
      if(!LOCAL_TEAM_TO_REGION.hasOwnProperty(k)) continue;
      nk=LHL_TEAM_RENAMES[k]||k;
      next[nk]=LOCAL_TEAM_TO_REGION[k];
    }
    LOCAL_TEAM_TO_REGION=next;
  }
  if(typeof buildLocalNatHomeTeamMap==='function') LOCAL_NAT_HOME_TEAM=buildLocalNatHomeTeamMap();
  if(typeof buildLocalNatRegionMap==='function') LOCAL_NAT_TO_REGION=buildLocalNatRegionMap();
  if(typeof RENAMED_TEAMS!=='undefined'){
    for(lk in TEAM_LOCALE_RENAMES){
      if(TEAM_LOCALE_RENAMES.hasOwnProperty(lk)) RENAMED_TEAMS[lk]=TEAM_LOCALE_RENAMES[lk];
    }
    for(lk in LOCALE_SCRIPT_ERA_MIGRATIONS){
      if(LOCALE_SCRIPT_ERA_MIGRATIONS.hasOwnProperty(lk)) RENAMED_TEAMS[lk]=LOCALE_SCRIPT_ERA_MIGRATIONS[lk];
    }
  }
}

initTeamLocaleData();

/** CHL / USJL home territory from birthplace — first career league should match unless import. */
function getPlayerTerritoryJuniorLeague(hometown, nat, gender){
  gender=gender||'M';
  if(gender!=='M') return null;
  var n=String(nat||'').trim();
  if(n==='United States') return 'USJL';
  if(n!=='Canada') return null;
  var h=String(hometown||'').toLowerCase();
  if(/\b(quebec|québec|\bqc\b|montreal|montréal|halifax|saint john|st\. john|moncton|charlottetown|fredericton|sydney|new brunswick|nova scotia|prince edward|newfoundland|maritime|québec city|quebec city)\b/.test(h)) return 'QMJL';
  if(/\b(british columbia|\bbc\b|alberta|\bab\b|saskatchewan|\bsk\b|manitoba|\bmb\b|vancouver|calgary|edmonton|winnipeg|regina|saskatoon|medicine hat|lethbridge|victoria|kelowna|brandon|moose jaw|prince albert|red deer|kamloops)\b/.test(h)) return 'WJL';
  if(/\b(ontario|\bon\b|toronto|ottawa|london|windsor|kitchener|hamilton|sarnia|sudbury|oshawa|mississauga|barrie|guelph|kingston|peterborough|flint|niagara|brantford|sault)\b/.test(h)) return 'OJL';
  return 'OJL';
}

function isChlTerritoryLeague(leagueKey){
  var k=leagueKey||'';
  return k==='OJL'||k==='QMJL'||k==='WJL'||k==='USJL';
}

function isChlTerritoryMismatch(leagueKey, hometown, nat, gender){
  if(!isChlTerritoryLeague(leagueKey)) return false;
  var home=getPlayerTerritoryJuniorLeague(hometown, nat, gender);
  return !!home&&home!==leagueKey;
}

function getChlTerritoryLabel(leagueKey){
  if(leagueKey==='OJL') return 'Ontario (OJL)';
  if(leagueKey==='QMJL') return 'Quebec & Maritimes (QMJL/LJQM)';
  if(leagueKey==='WJL') return 'Western Canada (WJL)';
  if(leagueKey==='USJL') return 'United States (USJL)';
  return '';
}
