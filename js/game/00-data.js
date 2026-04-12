/* breakaway — DATA */
// ============================================================
// DATA
// ============================================================

var NATS = [
  {c:'CA',n:'Canada'},{c:'US',n:'United States'},{c:'SE',n:'Swedish'},
  {c:'FI',n:'Finnish'},{c:'RU',n:'Russian'},{c:'CZ',n:'Czech'},
  {c:'SK',n:'Slovak'},{c:'CH',n:'Swiss'},{c:'DE',n:'German'},
  {c:'AT',n:'Austrian'},{c:'LV',n:'Latvian'},{c:'BY',n:'Belarusian'},
  {c:'SI',n:'Slovenian'},{c:'DK',n:'Danish'},{c:'NO',n:'Norwegian'},
  {c:'FR',n:'French'},{c:'JP',n:'Japanese'},{c:'KR',n:'South Korean'},
  {c:'CN',n:'Chinese'},{c:'AU',n:'Australian'},{c:'HU',n:'Hungarian'},
  {c:'PL',n:'Polish'},{c:'IT',n:'Italian'},{c:'KZ',n:'Kazakhstani'},
  {c:'UA',n:'Ukrainian'},{c:'NL',n:'Dutch'},{c:'BE',n:'Belgian'},
  {c:'GB',n:'British'},{c:'IE',n:'Irish'},{c:'BR',n:'Brazilian'},
  {c:'MX',n:'Mexican'},{c:'ZA',n:'South African'},{c:'NG',n:'Nigerian'},
  {c:'GH',n:'Ghanaian'},{c:'IN',n:'Indian'},{c:'TR',n:'Turkish'},
  {c:'SA',n:'Saudi Arabian'},{c:'EE',n:'Estonian'},{c:'LT',n:'Lithuanian'},
  {c:'RO',n:'Romanian'},{c:'HR',n:'Croatian'},{c:'RS',n:'Serbian'},
  {c:'NZ',n:'New Zealander'},{c:'AR',n:'Argentinian'},{c:'CO',n:'Colombian'},
  {c:'PT',n:'Portuguese'},{c:'ES',n:'Spanish'},{c:'GR',n:'Greek'},
  {c:'MA',n:'Moroccan'},{c:'IR',n:'Iranian'},{c:'MN',n:'Mongolian'},
  {c:'EG',n:'Egyptian'},{c:'TN',n:'Tunisian'},{c:'DZ',n:'Algerian'},
  {c:'KE',n:'Kenyan'},{c:'ET',n:'Ethiopian'},{c:'PK',n:'Pakistani'},
  {c:'BD',n:'Bangladeshi'},{c:'LK',n:'Sri Lankan'},{c:'PH',n:'Filipino'},
  {c:'TH',n:'Thai'},{c:'ID',n:'Indonesian'},{c:'MY',n:'Malaysian'},
  {c:'CL',n:'Chilean'},{c:'PE',n:'Peruvian'},{c:'VE',n:'Venezuelan'},
  {c:'UY',n:'Uruguayan'},{c:'CR',n:'Costa Rican'},{c:'DO',n:'Dominican'}
];

/** Schedule / team counts mirror real circuits (fictional names): PHL≈NHL, NAML≈AHL, OJL≈OHL, QMJL≈QMJHL, WJL≈WHL, NCHA≈NCAA D-I men, USJL≈USHL, NEJC/CEJC/ARJC≈overseas junior pipelines, NEHL≈SHL, CEHL≈Liiga, ARHL≈KHL, PWL≈PWHL, PWDL≈minor pro women, EWJC/AWJC≈women overseas junior, etc. */
var LEAGUES = {
  PHL:  {name:'Pro Hockey League',short:'PHL',tier:'pro',gender:'M',games:82,gamesPerWeek:4,dev:0.7,salBase:750000,desc:'Top mens pro — 32 clubs, 82-game schedule (NHL-style).'},
  NAML: {name:'North American Minors League',short:'NAML',tier:'minor',gender:'M',games:72,gamesPerWeek:3,dev:0.9,salBase:60000,desc:'PHL farm system — 32 teams, 72 games (AHL-style); clubs that share a PHL nickname use the same crest colours as the parent club.'},
  OJL:  {name:'Ontario Junior League',short:'OJL',tier:'junior',gender:'M',games:68,dev:1.4,salBase:0,desc:'Ontario major junior — 20 teams, 68 games (OHL-style).'},
  QMJL: {name:'Quebec-Maritimes Junior League',short:'QMJL',tier:'junior',gender:'M',games:68,dev:1.3,salBase:0,desc:'Quebec & Maritimes juniors — 18 teams, 68 games (QMJHL-style).'},
  WJL:  {name:'Western Junior League',short:'WJL',tier:'junior',gender:'M',games:68,dev:1.3,salBase:0,desc:'Western major junior — 22 teams, 68 games (WHL-style).'},
  NCHA: {name:"Nat'l Collegiate Hockey Assoc.",short:'NCHA',tier:'college',gender:'M',games:34,dev:1.2,salBase:0,desc:'U.S. Division I only — 50 programs, ~34-game regular season (NCAA-style).'},
  USJL: {name:'US Junior League',short:'USJL',tier:'junior',gender:'M',games:62,dev:1.2,salBase:0,desc:'Premier US junior — 16 teams, 62 games (USHL-style).'},
  NEJC: {name:'Northern European Junior Circuit',short:'NEJC',tier:'junior',gender:'M',games:44,dev:1.35,salBase:0,desc:'Nordic development — same hockey culture as NEHL but lighter pace and competition until you are ready.'},
  CEJC: {name:'Central European Junior Circuit',short:'CEJC',tier:'junior',gender:'M',games:46,dev:1.32,salBase:0,desc:'Continental feeder — CEHL-style structure, easier nights than the paid league.'},
  ARJC: {name:'Eurasian Junior Circuit',short:'ARJC',tier:'junior',gender:'M',games:48,dev:1.28,salBase:0,desc:'Russia & Asia-Pacific program hockey — developmental step before ARHL money and travel.'},
  NEHL: {name:'Northern European Hockey League',short:'NEHL',tier:'euro',gender:'M',games:52,dev:1.1,salBase:55000,desc:'Swedish top tier — 14 teams, 52 games (SHL-style).'},
  CEHL: {name:'Central European Hockey League',short:'CEHL',tier:'euro',gender:'M',games:60,dev:1.1,salBase:50000,desc:'Finnish elite league — 15 teams, 60 games (Liiga-style).'},
  ARHL: {name:'Asian-Russian Hockey League',short:'ARHL',tier:'asia',gender:'M',games:68,dev:1.0,salBase:120000,desc:'Eurasian mega-league — 24 teams, 68 games (KHL-style).'},
  PWL:  {name:"Pro Women's League",short:'PWL',tier:'pro',gender:'F',games:24,dev:0.7,salBase:75000,desc:"Elite women's pro — 6 teams, 24-game season (PWHL-style length)."},
  PWDL: {name:"Pro Women's Development League",short:'PWDL',tier:'minor',gender:'F',games:56,dev:0.9,salBase:28000,desc:"Pro farm league — 12 teams, 56 games (AHL-style women's dev)."},
  CWHL: {name:"Canadian Women's Hockey League",short:'CWHL',tier:'junior',gender:'F',games:38,dev:1.3,salBase:0,desc:"Canadian junior women's loop — 10 teams, 38-game slate (major junior women's style)."},
  NWCHA:{name:"Nat'l Women's Collegiate Hockey Assoc.",short:'NWCHA',tier:'college',gender:'F',games:34,dev:1.1,salBase:0,desc:"U.S. Division I women — 14 programs, ~34 games (all schools U.S.-based)."},
  USWDL:{name:"US Women's Development League",short:'USWDL',tier:'junior',gender:'F',games:52,dev:1.2,salBase:0,desc:"US junior development — 16 teams (USHL-style footprint)."},
  EWJC:{name:"European Women's Junior Circuit",short:'EWJC',tier:'junior',gender:'F',games:36,dev:1.22,salBase:0,desc:"European women's program loop — same road as SDHL/FWHL but softer competition while you develop."},
  AWJC:{name:"Asian Women's Junior Circuit",short:'AWJC',tier:'junior',gender:'F',games:34,dev:1.2,salBase:0,desc:"Asian women's program hockey — feeder path into AWHL contracts."},
  SDHL: {name:"Swedish Development Hockey League",short:'SDHL',tier:'euro',gender:'F',games:36,dev:1.1,salBase:18000,desc:"Sweden women's SDHL — 10 teams, 36 games."},
  FWHL: {name:"Finnish Women's Hockey League",short:'FWHL',tier:'euro',gender:'F',games:36,dev:1.1,salBase:16000,desc:"Finland women's top loop — 10 teams, 36 games."},
  AWHL: {name:"Asian Women's Hockey League",short:'AWHL',tier:'asia',gender:'F',games:36,dev:1.0,salBase:20000,desc:"Asia women's pro — 8 teams, 36 games."}
};

// TEAMS — fictional names; counts mirror LEAGUES (see comment above).
var TEAMS = {
  PHL: [
    {n:'Toronto Monarchs',e:'[T]'},{n:'Montreal Voyageurs',e:'[M]'},{n:'Quebec City Ramparts',e:'[Q]'},
    {n:'Ottawa Sentinels',e:'[O]'},{n:'Los Angeles Stars',e:'[L]'},{n:'Dallas Outlaws',e:'[D]'},
    {n:'Boston Colonials',e:'[B]'},{n:'New York Ironclad',e:'[N]'},{n:'Buffalo Snowhawks',e:'[B]'},
    {n:'Philadelphia Founders',e:'[P]'},{n:'Pittsburgh Smelters',e:'[P]'},{n:'Washington Diplomats',e:'[W]'},
    {n:'Winnipeg Tundra',e:'[W]'},{n:'Minneapolis Blizzard',e:'[M]'},{n:'Chicago Tempest',e:'[C]'},
    {n:'Detroit Rivermen',e:'[D]'},{n:'Columbus Sentinels',e:'[C]'},{n:'Nashville Troubadours',e:'[N]'},
    {n:'Vancouver Mountaineers',e:'[V]'},{n:'Calgary Roughnecks',e:'[C]'},{n:'Edmonton Drillers',e:'[E]'},
    {n:'Seattle Rainmakers',e:'[S]'},{n:'San Jose Tidal',e:'[S]'},{n:'Denver Altitude',e:'[D]'},
    {n:'St. Louis Archers',e:'[S]'},{n:'Las Vegas Neon',e:'[L]'},{n:'Tampa Bay Storm',e:'[T]'},
    {n:'Miami Tide',e:'[M]'},{n:'Raleigh Storm',e:'[R]'},{n:'Anaheim Surf',e:'[A]'},
    {n:'Newark Rail',e:'[N]'},{n:'Phoenix Scorch',e:'[P]'}
  ],
  NAML: [
    {n:'Sudbury Copperheads',e:'[-]'},{n:'Sault Ste. Marie Norwesters',e:'[-]'},{n:'Thunder Bay Voyageurs',e:'[-]'},
    {n:'Moncton Harbourmen',e:'[-]'},{n:'Charlottetown Privateers',e:'[-]'},{n:'Fredericton Fogcutters',e:'[-]'},
    {n:'Kelowna Sunblazers',e:'[-]'},{n:'Lethbridge Chinooks',e:'[-]'},{n:'Red Deer Renegades',e:'[-]'},
    {n:'Brandon Plainsmen',e:'[-]'},{n:'Saskatoon Wheatmen',e:'[-]'},{n:'Rochester Ironhorses',e:'[-]'},
    {n:'Hartford Whalemen',e:'[-]'},{n:'Springfield Armory',e:'[-]'},{n:'Providence Seafarers',e:'[-]'},
    {n:'Charlotte Copperheads',e:'[-]'},{n:'Milwaukee Lakeshore',e:'[-]'},{n:'Grand Rapids Furnace',e:'[-]'},
    {n:'Rockford Rivets',e:'[-]'},{n:'Iowa Threshers',e:'[-]'},
    {n:'Bakersfield Blaze',e:'[-]'},{n:'Coachella Sun',e:'[-]'},{n:'Henderson Silver',e:'[-]'},
    {n:'Hershey Forge',e:'[-]'},{n:'Lehigh Valley Ghosts',e:'[-]'},{n:'Ontario Regals',e:'[-]'},
    {n:'San Diego Surf',e:'[-]'},{n:'Tucson Dust',e:'[-]'},{n:'Utica Ice',e:'[-]'},
    {n:'Cleveland Rock',e:'[-]'},{n:'Wilkes-Barre Steel',e:'[-]'},{n:'Belleville Runners',e:'[-]'}
  ],
  OJL: [
    {n:'Barrie Monarchs',e:'[O]'},{n:'Brampton Express',e:'[O]'},{n:'Erie Shore',e:'[O]'},
    {n:'Flint Forge',e:'[O]'},{n:'Guelph Sentinels',e:'[O]'},{n:'Hamilton Steelhawks',e:'[O]'},
    {n:'Kingston Ironclad',e:'[O]'},{n:'Kitchener Hounds',e:'[O]'},{n:'London Mustangs',e:'[O]'},
    {n:'Mississauga Steel',e:'[O]'},{n:'Niagara Rapids',e:'[O]'},{n:'North Bay Voyageurs',e:'[O]'},
    {n:'Oshawa Crushers',e:'[O]'},{n:'Ottawa Rapids',e:'[O]'},{n:'Owen Sound Storm',e:'[O]'},
    {n:'Peterborough Grenadiers',e:'[O]'},{n:'Sarnia Ramparts',e:'[O]'},
    {n:'Sault Ste. Marie Northmen',e:'[O]'},{n:'Sudbury Timbermen',e:'[O]'},{n:'Windsor Fury',e:'[O]'}
  ],
  QMJL: [
    {n:'Québec Ramparts',e:'[Q]'},{n:'Chicoutimi Saguenéens',e:'[Q]'},{n:'Rimouski Vikings',e:'[Q]'},
    {n:'Baie-Comeau Drakons',e:'[Q]'},{n:'Drummondville Canons',e:'[Q]'},{n:'Moncton Wildcards',e:'[Q]'},
    {n:'Halifax Longshots',e:'[Q]'},{n:'Charlottetown Gardiens',e:'[Q]'},
    {n:'Gatineau Rapides',e:'[Q]'},{n:'Rouyn-Noranda Mineurs',e:'[Q]'},{n:'Val-d\'Or Prospecteurs',e:'[Q]'},
    {n:'Sherbrooke Phœnix',e:'[Q]'},{n:'Victoriaville Tigres',e:'[Q]'},{n:'Shawinigan Rapides',e:'[Q]'},
    {n:'Saint John Tide',e:'[Q]'},{n:'Cape Breton Highlanders',e:'[Q]'},{n:'Bathurst Acier',e:'[Q]'},
    {n:'Laval Fusées',e:'[Q]'}
  ],
  WJL: [
    {n:'Calgary Wranglers',e:'[W]'},{n:'Lethbridge Cyclones',e:'[W]'},{n:'Red Deer Stags',e:'[W]'},
    {n:'Kelowna Sunblazers',e:'[W]'},{n:'Vancouver Northmen',e:'[W]'},{n:'Victoria Islanders',e:'[W]'},
    {n:'Kamloops Blazers',e:'[W]'},{n:'Prince George Roughriders',e:'[W]'},{n:'Saskatoon Plainsmen',e:'[W]'},
    {n:'Regina Pronghorns',e:'[W]'},{n:'Edmonton Forge',e:'[W]'},{n:'Medicine Hat Suns',e:'[W]'},
    {n:'Moose Jaw Steel',e:'[W]'},{n:'Brandon Wheatmen',e:'[W]'},{n:'Swift Current Stampede',e:'[W]'},
    {n:'Portland Winter',e:'[W]'},{n:'Tri-City Outlaws',e:'[W]'},{n:'Spokane Chiefs',e:'[W]'},
    {n:'Everett Silvertips',e:'[W]'},{n:'Wenatchee Wild',e:'[W]'},{n:'Prince Albert Raiders',e:'[W]'},
    {n:'Winnipeg Icehawks',e:'[W]'}
  ],
  NCHA: [
    {n:'Minnesota State Grizzlies',e:'[U]'},{n:'Wisconsin Badgers',e:'[U]'},{n:'Ohio Rivermen',e:'[U]'},
    {n:'Michigan Stags',e:'[U]'},{n:'Western Michigan Rivermen',e:'[U]'},{n:'Ferris State Forge',e:'[U]'},
    {n:'Bowling Green Falcons',e:'[U]'},{n:'Miami Ohio Redhawks',e:'[U]'},{n:'Bemidji State Lumberjacks',e:'[U]'},
    {n:'Penn Ridge',e:'[U]'},{n:'Boston Univ Renegades',e:'[U]'},{n:'Maine Lumbermen',e:'[U]'},
    {n:'Vermont Mountainmen',e:'[U]'},{n:'Northeastern Wolves',e:'[U]'},{n:'Providence Pilots',e:'[U]'},
    {n:'UMass Rail',e:'[U]'},{n:'Quinnipiac Stags',e:'[U]'},{n:'Sacred Heart Saints',e:'[U]'},
    {n:'Harvard Pilgrims',e:'[U]'},{n:'Dartmouth Pines',e:'[U]'},{n:'North Dakota Frost',e:'[U]'},
    {n:'Denver Snowhawks',e:'[U]'},{n:'St Cloud Storm',e:'[U]'},{n:'Omaha Mavericks',e:'[U]'},
    {n:'Colorado College Northmen',e:'[U]'},{n:'Minnesota Duluth Tide',e:'[U]'},{n:'Northern Michigan Frost',e:'[U]'},
    {n:'Lake Superior Lakers',e:'[U]'},{n:'Alaska Ice',e:'[U]'},{n:'Arizona Scorch',e:'[U]'},
    {n:'Cornell Ironclad',e:'[U]'},{n:'Yale Scholars',e:'[U]'},{n:'Princeton Ivy',e:'[U]'},
    {n:'St Lawrence Skiffs',e:'[U]'},{n:'Clarkson Sentinels',e:'[U]'},{n:'RIT Forge',e:'[U]'},
    {n:'Notre Dame Saints',e:'[U]'},{n:'Lindenwood Lions',e:'[U]'},{n:'Michigan Tech Huskies',e:'[U]'},
    {n:'Air Force Jets',e:'[U]'},{n:'Army Cadets',e:'[U]'},{n:'Gulf Coast Gators',e:'[U]'},
    {n:'Ridge State Mountaineers',e:'[U]'},{n:'Bay State Breakers',e:'[U]'},{n:'Pacific Northwest Eagles',e:'[U]'},
    {n:'Urban State Roadrunners',e:'[U]'},{n:'Atlantic College Seahawks',e:'[U]'},{n:'Keystone Commonwealth Pride',e:'[U]'},
    {n:'Great Plains Bison',e:'[U]'},{n:'Desert State Scorpions',e:'[U]'}
  ],
  USJL: [
    {n:'Chicago Chill',e:'[U]'},{n:'Detroit Copperheads',e:'[U]'},{n:'Minneapolis Lumberjacks',e:'[U]'},
    {n:'Milwaukee Lakeshore',e:'[U]'},{n:'Pittsburgh Forge',e:'[U]'},{n:'Boston Colonials',e:'[U]'},
    {n:'Rochester Ironhorses',e:'[U]'},{n:'Hartford Whalemen',e:'[U]'},{n:'Providence Seafarers',e:'[U]'},
    {n:'Cleveland Crushers',e:'[U]'},{n:'Green Bay Forge',e:'[U]'},{n:'Madison Capitals',e:'[U]'},
    {n:'Dubuque Saints',e:'[U]'},{n:'Cedar Rapids Riders',e:'[U]'},{n:'Youngstown Spectres',e:'[U]'},
    {n:'Sioux Falls Stampede',e:'[U]'}
  ],
  NEJC: [
    {n:'Luleå Top Circuit',e:'[J]'},{n:'Stockholm Crown Program',e:'[J]'},{n:'Göteborg Iron Academy',e:'[J]'},
    {n:'Malmö Straits Program',e:'[J]'},{n:'Turku Lynx Circuit',e:'[J]'},{n:'Tampere Iron Track',e:'[J]'},
    {n:'Karlstad Regional Program',e:'[J]'},{n:'Linköping Storm Academy',e:'[J]'},{n:'Skellefteå Mines Top Circuit',e:'[J]'},
    {n:'Örebro Steel Program',e:'[J]'}
  ],
  CEJC: [
    {n:'Praha Ironspire Program',e:'[J]'},{n:'Brno Thunder Track',e:'[J]'},{n:'Zürich Snow Lions Program',e:'[J]'},
    {n:'Bern Ridge Academy',e:'[J]'},{n:'Berlin Polar Program',e:'[J]'},{n:'München Stormcrow Track',e:'[J]'},
    {n:'Bratislava Viper Program',e:'[J]'},{n:'Wien Wolfpack Program',e:'[J]'},{n:'Turku Blaze Circuit',e:'[J]'},
    {n:'Helsinki Ice Program',e:'[J]'}
  ],
  ARJC: [
    {n:'Moscow Dynamo Program',e:'[J]'},{n:'St. Petersburg Skater Track',e:'[J]'},{n:'Kazan Bison Program',e:'[J]'},
    {n:'Novosibirsk Sibir Circuit',e:'[J]'},{n:'Yokohama Freeze Academy',e:'[J]'},{n:'Seoul Icehawk Program',e:'[J]'},
    {n:'Beijing Dragon Track',e:'[J]'},{n:'Riga Tide Program',e:'[J]'},{n:'Sochi Shore Circuit',e:'[J]'},
    {n:'Vladivostok Tide Program',e:'[J]'},{n:'Astana Nomad Track',e:'[J]'},{n:'Harbin Ice Program',e:'[J]'}
  ],
  NEHL: [
    {n:'Stockholm Crowns',e:'[N]'},{n:'Göteborg Ironmen',e:'[N]'},{n:'Helsinki Lynx',e:'[N]'},
    {n:'Tampere Ironmen',e:'[N]'},{n:'Oslo Valkyries',e:'[N]'},{n:'København Cannons',e:'[N]'},
    {n:'Luleå Polarbears',e:'[N]'},{n:'Turku Timberwolves',e:'[N]'},
    {n:'Malmö Tide',e:'[N]'},{n:'Karlstad Crowns',e:'[N]'},{n:'Jönköping Jets',e:'[N]'},
    {n:'Linköping Storm',e:'[N]'},{n:'Örebro Steel',e:'[N]'},{n:'Skellefteå Wolves',e:'[N]'}
  ],
  CEHL: [
    {n:'Praha Ironspire',e:'[C]'},{n:'Brno Thundercats',e:'[C]'},{n:'Zürich Snowlions',e:'[C]'},
    {n:'Bern Avalanche',e:'[C]'},{n:'Berlin Polarbears',e:'[C]'},{n:'München Stormcrows',e:'[C]'},
    {n:'Bratislava Vipers',e:'[C]'},{n:'Wien Wolfpack',e:'[C]'},
    {n:'Turku Blaze',e:'[C]'},{n:'Tampere Force',e:'[C]'},{n:'Oulu North',e:'[C]'},
    {n:'Helsinki Ice',e:'[C]'},{n:'Jyvaskyla Storm',e:'[C]'},{n:'Rauma Dockers',e:'[C]'},
    {n:'Lappeenranta Spark',e:'[C]'}
  ],
  ARHL: [
    {n:'Moscow Dynamo',e:'[R]'},{n:'St. Petersburg Skaters',e:'[R]'},{n:'Kazan Bisons',e:'[R]'},
    {n:'Novosibirsk Sibirs',e:'[R]'},{n:'Yokohama Freeze',e:'[R]'},{n:'Sapporo Polarbears',e:'[R]'},
    {n:'Seoul Icehawks',e:'[R]'},{n:'Beijing Dragoons',e:'[R]'},
    {n:'Yaroslavl Express',e:'[R]'},{n:'Nizhny Torpedoes',e:'[R]'},{n:'Riga Tide',e:'[R]'},
    {n:'Sochi Shore',e:'[R]'},{n:'Vladivostok Tide',e:'[R]'},{n:'Kunlun Dragons',e:'[R]'},
    {n:'Minsk Wolves',e:'[R]'},{n:'Moscow Centurions',e:'[R]'},{n:'Omsk Outlaws',e:'[R]'},
    {n:'Ufa Bolts',e:'[R]'},{n:'Magnitogorsk Steel',e:'[R]'},{n:'Chelyabinsk Forge',e:'[R]'},
    {n:'Astana Nomads',e:'[R]'},{n:'Ekaterinburg Motors',e:'[R]'},{n:'Cherepovets Steel',e:'[R]'}
  ],
  PWL: [
    {n:'Toronto Furies',e:'[P]'},{n:'Montreal Carabins',e:'[P]'},{n:'Boston Pride',e:'[P]'},
    {n:'New York Riveters',e:'[P]'},{n:'Minneapolis Whitecaps',e:'[P]'},{n:'Vancouver Amazons',e:'[P]'}
  ],
  PWDL: [
    {n:'Sudbury Copperheads',e:'[D]'},{n:'Thunder Bay Frost',e:'[D]'},{n:'Moncton Tides',e:'[D]'},
    {n:'Rochester Ironhorses',e:'[D]'},{n:'Hartford Whalemen',e:'[D]'},{n:'Providence Seafarers',e:'[D]'},
    {n:'Kelowna Sunblazers',e:'[D]'},{n:'Brandon Plainswomen',e:'[D]'},{n:'Milwaukee Lakeshore',e:'[D]'},
    {n:'Grand Rapids Furnace',e:'[D]'},{n:'Iowa Threshers',e:'[D]'},{n:'Charlotte Copperheads W',e:'[D]'}
  ],
  CWHL: [
    {n:'Toronto Furies Select',e:'[C]'},{n:'Montreal Carabins Premier',e:'[C]'},{n:'Calgary Inferno Reserve',e:'[C]'},
    {n:'Vancouver Amazons Academy',e:'[C]'},{n:'Ottawa Charge Alliance',e:'[C]'},{n:'Winnipeg Tundra',e:'[C]'},
    {n:'Halifax Mariners',e:'[C]'},{n:'Edmonton Northwomen',e:'[C]'},{n:'Québec Heritage',e:'[C]'},
    {n:'Saskatoon Starlight',e:'[C]'}
  ],
  NWCHA: [
    {n:'Minnesota State Bears',e:'[U]'},{n:'Wisconsin Badgers',e:'[U]'},{n:'Michigan Tech Huskies',e:'[U]'},
    {n:'Denver Snowhawks',e:'[U]'},{n:'Minnesota Golden',e:'[U]'},{n:'Ohio State Buckeyes',e:'[U]'},
    {n:'Colgate Raiders',e:'[U]'},{n:'Cornell Ironclad',e:'[U]'},{n:'Boston Univ Renegades',e:'[U]'},
    {n:'Vermont Mountainmen',e:'[U]'},{n:'Clarkson Sentinels',e:'[U]'},{n:'Connecticut Shore Whales',e:'[U]'},
    {n:'Granite State Wildcats',e:'[U]'},{n:'Empire State Lions W',e:'[U]'}
  ],
  USWDL: [
    {n:'Boston Blades',e:'[U]'},{n:'Providence Seafarers',e:'[U]'},{n:'Rochester Ironhorses',e:'[U]'},
    {n:'Hartford Whalemen',e:'[U]'},{n:'Detroit Valkyries Summit',e:'[U]'},{n:'Minneapolis Tempest',e:'[U]'},
    {n:'Chicago Sirens Pulse',e:'[U]'},{n:'Milwaukee Lakeshore',e:'[U]'},{n:'Cleveland Comets',e:'[U]'},
    {n:'Buffalo Beauts Beacon',e:'[U]'},{n:'Pittsburgh Forge',e:'[U]'},{n:'New Jersey Tide',e:'[U]'},
    {n:'Philadelphia Liberty',e:'[U]'},{n:'Washington Pride Crest',e:'[U]'},{n:'Nashville Ice',e:'[U]'},
    {n:'Dallas Meridian',e:'[U]'}
  ],
  EWJC: [
    {n:'Stockholm Sirens Program',e:'[J]'},{n:'Göteborg Iron Program',e:'[J]'},{n:'Luleå Polar Program',e:'[J]'},
    {n:'Malmö Tide Academy',e:'[J]'},{n:'Helsinki Lynx Circuit',e:'[J]'},{n:'Tampere Iron Program',e:'[J]'},
    {n:'Turku Timber Track',e:'[J]'},{n:'Oslo Valkyrie Program',e:'[J]'}
  ],
  AWJC: [
    {n:'Sapporo Polar Program',e:'[J]'},{n:'Tōkyō Ice Track',e:'[J]'},{n:'Seoul Comet Program',e:'[J]'},
    {n:'Beijing Dragon Program',e:'[J]'},{n:'Shanghai Pearl Circuit',e:'[J]'},{n:'Taipei Frost Academy',e:'[J]'},
    {n:'Busan Thunder Program',e:'[J]'},{n:'Hong Kong Harbor Program',e:'[J]'}
  ],
  SDHL: [
    {n:'Stockholm Crowns',e:'[S]'},{n:'Göteborg Ironwomen',e:'[S]'},{n:'Malmö Northwomen',e:'[S]'},
    {n:'Luleå Polarbears',e:'[S]'},{n:'Linköping Lightning',e:'[S]'},{n:'Skellefteå Timberwolves',e:'[S]'},
    {n:'Brynas',e:'[S]'},{n:'HV71',e:'[S]'},{n:'Djurgården',e:'[S]'},{n:'Örebro HK W',e:'[S]'}
  ],
  FWHL: [
    {n:'Helsinki Lynx',e:'[F]'},{n:'Turku Timberwolves',e:'[F]'},{n:'Tampere Ironwomen',e:'[F]'},
    {n:'Espoo Northwomen',e:'[F]'},{n:'Lahti Snowlions',e:'[F]'},{n:'Oulu Polarbears',e:'[F]'},
    {n:'Karpat',e:'[F]'},{n:'HIFK',e:'[F]'},{n:'Ilves',e:'[F]'},{n:'TPS',e:'[F]'}
  ],
  AWHL: [
    {n:'Sapporo Polarbears',e:'[A]'},{n:'Tōkyō Icehawks',e:'[A]'},{n:'Seoul Comets',e:'[A]'},
    {n:'Busan Thunder',e:'[A]'},{n:'Beijing Dragoons',e:'[A]'},{n:'Shanghai Dragons',e:'[A]'},
    {n:'Shenzhen Tide',e:'[A]'},{n:'Taipei Frost W',e:'[A]'}
  ]
};

/** Conferences / divisions for standings UI (team full names must match TEAMS). */
var LEAGUE_STANDINGS_LAYOUT={
  PHL:{mode:'nested',conferences:[
    {name:'EASTERN CONFERENCE',divisions:[
      {name:'ATLANTIC DIVISION',teams:['Toronto Monarchs','Montreal Voyageurs','Ottawa Sentinels','Boston Colonials','Buffalo Snowhawks','Detroit Rivermen','Tampa Bay Storm','Miami Tide']},
      {name:'METROPOLITAN DIVISION',teams:['Quebec City Ramparts','New York Ironclad','Philadelphia Founders','Pittsburgh Smelters','Washington Diplomats','Columbus Sentinels','Raleigh Storm','Newark Rail']}
    ]},
    {name:'WESTERN CONFERENCE',divisions:[
      {name:'CENTRAL DIVISION',teams:['Winnipeg Tundra','Minneapolis Blizzard','Chicago Tempest','Dallas Outlaws','Nashville Troubadours','St. Louis Archers','Denver Altitude','Las Vegas Neon']},
      {name:'PACIFIC DIVISION',teams:['Vancouver Mountaineers','Calgary Roughnecks','Edmonton Drillers','Seattle Rainmakers','San Jose Tidal','Los Angeles Stars','Anaheim Surf','Phoenix Scorch']}
    ]}
  ]},
  NAML:{mode:'nested',conferences:[
    {name:'EASTERN CONFERENCE',divisions:[
      {name:'NORTHEAST DIVISION',teams:['Sudbury Copperheads','Sault Ste. Marie Norwesters','Thunder Bay Voyageurs','Moncton Harbourmen','Charlottetown Privateers','Fredericton Fogcutters','Kelowna Sunblazers','Lethbridge Chinooks']},
      {name:'ATLANTIC DIVISION',teams:['Red Deer Renegades','Brandon Plainsmen','Saskatoon Wheatmen','Rochester Ironhorses','Hartford Whalemen','Springfield Armory','Providence Seafarers','Charlotte Copperheads']}
    ]},
    {name:'WESTERN CONFERENCE',divisions:[
      {name:'CENTRAL DIVISION',teams:['Milwaukee Lakeshore','Grand Rapids Furnace','Rockford Rivets','Iowa Threshers','Bakersfield Blaze','Coachella Sun','Henderson Silver','Hershey Forge']},
      {name:'PACIFIC DIVISION',teams:['Lehigh Valley Ghosts','Ontario Regals','San Diego Surf','Tucson Dust','Utica Ice','Cleveland Rock','Wilkes-Barre Steel','Belleville Runners']}
    ]}
  ]},
  OJL:{mode:'divisions',divisions:[
    {name:'EAST DIVISION',teams:['Ottawa Rapids','Kingston Ironclad','Peterborough Grenadiers','Oshawa Crushers','Barrie Monarchs']},
    {name:'CENTRAL DIVISION',teams:['Mississauga Steel','Brampton Express','Niagara Rapids','Hamilton Steelhawks','Guelph Sentinels']},
    {name:'WEST DIVISION',teams:['Kitchener Hounds','London Mustangs','Windsor Fury','Sarnia Ramparts','Erie Shore']},
    {name:'NORTH DIVISION',teams:['North Bay Voyageurs','Sudbury Timbermen','Sault Ste. Marie Northmen','Owen Sound Storm','Flint Forge']}
  ]},
  QMJL:{mode:'divisions',divisions:[
    {name:'MARITIMES DIVISION',teams:['Halifax Longshots','Charlottetown Gardiens','Moncton Wildcards','Cape Breton Highlanders','Saint John Tide','Bathurst Acier']},
    {name:'QUEBEC EAST DIVISION',teams:['Québec Ramparts','Chicoutimi Saguenéens','Rimouski Vikings','Baie-Comeau Drakons','Drummondville Canons','Victoriaville Tigres']},
    {name:'QUEBEC WEST DIVISION',teams:['Gatineau Rapides','Rouyn-Noranda Mineurs','Val-d\'Or Prospecteurs','Sherbrooke Phœnix','Shawinigan Rapides','Laval Fusées']}
  ]},
  WJL:{mode:'nested',conferences:[
    {name:'EASTERN CONFERENCE',divisions:[
      {name:'EAST DIVISION',teams:['Winnipeg Icehawks','Brandon Wheatmen','Regina Pronghorns','Saskatoon Plainsmen','Moose Jaw Steel','Swift Current Stampede','Prince Albert Raiders','Medicine Hat Suns','Lethbridge Cyclones','Red Deer Stags','Calgary Wranglers']}
    ]},
    {name:'WESTERN CONFERENCE',divisions:[
      {name:'WEST DIVISION',teams:['Edmonton Forge','Kelowna Sunblazers','Vancouver Northmen','Victoria Islanders','Kamloops Blazers','Prince George Roughriders','Portland Winter','Tri-City Outlaws','Spokane Chiefs','Everett Silvertips','Wenatchee Wild']}
    ]}
  ]},
  NCHA:{mode:'nested',conferences:[
    {name:'BIG TEN ICE',divisions:[{name:'BIG TEN ICE',teams:['Minnesota State Grizzlies','Wisconsin Badgers','Ohio Rivermen','Michigan Stags','Western Michigan Rivermen','Ferris State Forge','Bowling Green Falcons','Miami Ohio Redhawks','Bemidji State Lumberjacks','Penn Ridge']}]},
    {name:'HOCKEY EASTERN',divisions:[{name:'HOCKEY EASTERN',teams:['Boston Univ Renegades','Maine Lumbermen','Vermont Mountainmen','Northeastern Wolves','Providence Pilots','UMass Rail','Quinnipiac Stags','Sacred Heart Saints','Harvard Pilgrims','Dartmouth Pines']}]},
    {name:'CENTRAL COLLEGIATE',divisions:[{name:'CENTRAL COLLEGIATE',teams:['North Dakota Frost','Denver Snowhawks','St Cloud Storm','Omaha Mavericks','Colorado College Northmen','Minnesota Duluth Tide','Northern Michigan Frost','Lake Superior Lakers','Alaska Ice','Arizona Scorch']}]},
    {name:'IVY-ECAC',divisions:[{name:'IVY-ECAC',teams:['Cornell Ironclad','Yale Scholars','Princeton Ivy','St Lawrence Skiffs','Clarkson Sentinels','RIT Forge','Notre Dame Saints','Lindenwood Lions','Michigan Tech Huskies','Air Force Jets']}]},
    {name:'ATLANTIC & INDEPENDENT',divisions:[{name:'ATLANTIC & INDEPENDENT',teams:['Army Cadets','Gulf Coast Gators','Ridge State Mountaineers','Bay State Breakers','Pacific Northwest Eagles','Urban State Roadrunners','Atlantic College Seahawks','Keystone Commonwealth Pride','Great Plains Bison','Desert State Scorpions']}]}
  ]},
  NWCHA:{mode:'nested',conferences:[
    {name:'WEST COLLEGIATE',divisions:[{name:'WEST COLLEGIATE',teams:['Minnesota State Bears','Wisconsin Badgers','Michigan Tech Huskies','Denver Snowhawks','Minnesota Golden','Ohio State Buckeyes','Colgate Raiders']}]},
    {name:'EAST COLLEGIATE',divisions:[{name:'EAST COLLEGIATE',teams:['Cornell Ironclad','Boston Univ Renegades','Vermont Mountainmen','Clarkson Sentinels','Connecticut Shore Whales','Granite State Wildcats','Empire State Lions W']}]}
  ]}
};

function buildAutoStandingsLayout(lk,numDiv){
  var teams=TEAMS[lk];
  if(!teams||teams.length<10) return null;
  numDiv=numDiv||4;
  var names=[], i;
  for(i=0;i<teams.length;i++) names.push(teams[i].n);
  var n=names.length;
  var base=Math.floor(n/numDiv), extra=n%numDiv;
  var divisions=[], idx=0;
  for(i=0;i<numDiv;i++){
    var sz=base+(i<extra?1:0);
    if(sz<1) continue;
    divisions.push({name:'DIVISION '+(divisions.length+1),teams:names.slice(idx,idx+sz)});
    idx+=sz;
  }
  return divisions.length?{mode:'divisions',divisions:divisions}:null;
}

function getStandingsLayoutForLeague(lk){
  if(LEAGUE_STANDINGS_LAYOUT[lk]) return LEAGUE_STANDINGS_LAYOUT[lk];
  var autoKeys={ARHL:4,USJL:4,NEHL:2,CEHL:2,PWDL:3,CWHL:2,USWDL:4,SDHL:2,FWHL:2,AWHL:2,NEJC:2,CEJC:2,ARJC:2,EWJC:2,AWJC:2};
  if(autoKeys[lk]) return buildAutoStandingsLayout(lk,autoKeys[lk]);
  return null;
}

function standingsRowHtml(s,rank){
  var name=s.team.n.split(' ').slice(-1)[0];
  var lk=s.leagueKey||(typeof G!=='undefined'&&G&&G.leagueKey?G.leagueKey:'');
  return '<div class="srow2'+(s.isMe?' me':'')+'"><div>'+rank+'</div><div>'+teamLogoChip(s.team.n,18,lk)+' '+stripBracketIcons(s.team.e)+' '+name+'</div><div>'+s.w+'</div><div>'+s.l+'</div><div>'+s.otl+'</div><div>'+s.pts+'</div></div>';
}

function standingsMiniTable(rows){
  var html='<div class="srow2 hd"><div>#</div><div>TEAM</div><div>W</div><div>L</div><div>OT</div><div>PTS</div></div>';
  var i;
  for(i=0;i<rows.length;i++) html+=standingsRowHtml(rows[i],i+1);
  return html;
}

function filterStandingsByTeamNames(st, teamNames){
  var set={}, i, j;
  for(i=0;i<teamNames.length;i++) set[teamNames[i]]=true;
  var out=[];
  for(j=0;j<st.length;j++){
    if(set[st[j].team.n]) out.push(st[j]);
  }
  out.sort(function(a,b){return b.pts-a.pts;});
  return out;
}

/** Division slices for playoff qualification (same structure as standings layout). */
function getPlayoffDivisionTeamLists(lk){
  var L=getStandingsLayoutForLeague(lk);
  if(!L){
    var teams=TEAMS[lk]||[];
    if(!teams.length) return [];
    return [{name:'LEAGUE',teams:teams.map(function(t){return t.n;})}];
  }
  var out=[], ci, dj;
  if(L.mode==='divisions'){
    for(ci=0;ci<L.divisions.length;ci++) out.push({name:L.divisions[ci].name,teams:L.divisions[ci].teams.slice()});
    return out;
  }
  if(L.mode==='nested'){
    for(ci=0;ci<L.conferences.length;ci++){
      var conf=L.conferences[ci];
      for(dj=0;dj<conf.divisions.length;dj++){
        out.push({name:conf.name+' · '+conf.divisions[dj].name,teams:conf.divisions[dj].teams.slice()});
      }
    }
    return out;
  }
  return [];
}

function playoffTargetFieldSize(n){
  if(n<2) return 0;
  var evenMax=n%2===0?n:n-1;
  var want=Math.min(8, Math.max(4, Math.floor(n/2)*2));
  return Math.min(want, evenMax);
}

/** Division winners + wild cards (remaining spots by league points), then seeded 1..n for bracket pairings. */
function buildPlayoffBracketFromStandings(sorted, leagueKey){
  var lk=leagueKey||(typeof G!=='undefined'&&G&&G.leagueKey)||'';
  var n=sorted.length;
  if(n<2) return null;
  var divLists=getPlayoffDivisionTeamLists(lk);
  var targetSize=playoffTargetFieldSize(n);
  if(targetSize<2) return null;
  var used={}, winners=[], i, divRows, w;
  for(i=0;i<divLists.length;i++){
    divRows=filterStandingsByTeamNames(sorted, divLists[i].teams);
    if(divRows.length){
      w=divRows[0];
      if(!used[w.team.n]){ winners.push(w); used[w.team.n]=true; }
    }
  }
  var wild=[];
  for(i=0;i<sorted.length;i++){
    if(!used[sorted[i].team.n]) wild.push(sorted[i]);
  }
  var need=targetSize-winners.length;
  var bracket;
  if(need<0){
    winners.sort(function(a,b){return b.pts-a.pts;});
    bracket=winners.slice(0,targetSize);
  } else {
    bracket=winners.concat(wild.slice(0,need));
  }
  bracket.sort(function(a,b){return b.pts-a.pts;});
  var qualifyN=Math.ceil(n/2);
  var meRow=null, myIdx=-1;
  for(i=0;i<sorted.length;i++){
    if(sorted[i].isMe){ meRow=sorted[i]; myIdx=i; break; }
  }
  if(meRow && myIdx>=0 && myIdx<qualifyN && bracket.indexOf(meRow)===-1 && bracket.length){
    bracket[bracket.length-1]=meRow;
  }
  if(bracket.length%2===1) bracket=bracket.slice(0,bracket.length-1);
  if(bracket.length<2) return null;
  return bracket;
}

var START_LEAGUES_M = ['OJL','QMJL','WJL','NCHA','USJL','NEJC','CEJC','ARJC'];
var START_LEAGUES_F = ['CWHL','NWCHA','USWDL','EWJC','AWJC'];
/** At career start (age 16), college and paid overseas semi-pro need 17+ or preview OVR at/above this bar. */
var START_LEAGUE_BYPASS_OVR_M=72;
var START_LEAGUE_BYPASS_OVR_F=50;

var ARCHETYPES = {
  F: {
    Sniper:       {name:'Sniper',      icon:'[*]', desc:'Pure goal scorer. Deadly accuracy, elite shot.',      boosts:{shooting:15,stickhandling:5,physical:-8,passing:-3}},
    Playmaker:    {name:'Playmaker',   icon:'[~]', desc:'Elite vision and distribution. Creates for others.',  boosts:{passing:16,stickhandling:10,skating:5,physical:-8,shooting:-5}},
    PowerForward: {name:'Power Fwd',   icon:'[!]', desc:'Big body scorer. Dominates corners and crease.',      boosts:{physical:14,shooting:8,stamina:5,skating:-5,stickhandling:-4}},
    TwoWay:       {name:'Two-Way',     icon:'[=]', desc:'Responsible at both ends. Reliable production.',      boosts:{positioning:12,passing:6,physical:4,stamina:4}},
    Grinder:      {name:'Grinder',     icon:'[G]', desc:'Outworks everyone. Low skill ceiling, high motor.',   boosts:{physical:16,stamina:14,shooting:-12,stickhandling:-10,passing:-4}},
    Enforcer:     {name:'Enforcer',    icon:'[X]', desc:'Protector. Fights, hits, intimidates.',               boosts:{physical:20,stamina:8,shooting:-16,passing:-12,stickhandling:-8}}
  },
  D: {
    OffensiveD:   {name:'Offensive D', icon:'[+]', desc:'Offensive defenseman — joins the attack, shoots and passes from the blue line.', boosts:{passing:18,skating:10,defense:-12,shotBlocking:-6}},
    StayAtHome:   {name:'Stay-at-Home',icon:'[S]', desc:'No offense, all defense. Hard to play against.',      boosts:{defense:16,physical:12,shotBlocking:10,skating:-6,passing:-8}},
    TwoWayD:      {name:'Two-Way D',   icon:'[=]', desc:'Balanced blueliner. Competent in both zones.',        boosts:{defense:8,passing:8,skating:5,physical:3}},
    ShutdownD:    {name:'Shutdown D',  icon:'[L]', desc:'Assignment: stop the other teams best player.',       boosts:{defense:18,positioning:12,skating:4,shotBlocking:8,passing:-10}}
  },
  G: {
    Butterfly:    {name:'Butterfly',   icon:'[B]', desc:'Positioning and post-sealing. Classic modern style.', boosts:{positioning:16,reboundControl:10,glove:-4,stamina:4}},
    Reflex:       {name:'Reflex',      icon:'[R]', desc:'Quick-twitch athlete. Reacts faster than anyone.',   boosts:{reflexes:16,glove:10,blocker:6,positioning:-5,stamina:-4}},
    Hybrid:       {name:'Hybrid',      icon:'[H]', desc:'Mix of styles. Adaptable and modern.',               boosts:{reflexes:8,positioning:8,glove:5,blocker:5}},
    BigBody:      {name:'Big Body',    icon:'[W]', desc:'Takes away space. Positionally elite goaltender.',   boosts:{positioning:14,reboundControl:12,stamina:8,reflexes:-6,glove:-4}}
  }
};

var ATTRS = {
  F: ['skating','shooting','stickhandling','passing','positioning','physical','stamina'],
  D: ['skating','passing','defense','physical','shotBlocking','positioning','stamina'],
  G: ['reflexes','positioning','glove','blocker','reboundControl','mental','stamina']
};

/** Weekly attr growth multiplier by league path (OJL balanced, QMJL skill/creative, WJL heavy, euro technical, ARHL creative/slow, Asian clubs budget, college well-rounded). */
function getLeagueAttrDevMultiplier(leagueKey, teamName, attr){
  var lk=leagueKey||'';
  var tn=String(teamName||'');
  var M={};
  var chinaKhl=/Beijing|Kunlun|Shanghai|Shenzhen/i.test(tn);
  var asiaPac=/Seoul|Yokohama|Sapporo|Tokyo|Busan|Taipei|Astana/i.test(tn);

  if(lk==='OJL'){
    M={skating:1.12,positioning:1.08,physical:1.07,stickhandling:1.07,passing:1.07,shooting:1.06,stamina:1.05,defense:1.05,shotBlocking:1.04,
      reflexes:1.05,glove:1.04,blocker:1.04,reboundControl:1.04,mental:1.05};
  } else if(lk==='QMJL'){
    M={physical:0.8,defense:0.84,shotBlocking:0.87,stickhandling:1.14,passing:1.12,positioning:0.92,stamina:0.94,skating:0.96,shooting:0.98,
      reflexes:0.94,glove:0.95,blocker:0.95,reboundControl:0.93,mental:1.08};
  } else if(lk==='WJL'){
    M={physical:1.13,shooting:1.05,defense:1.06,shotBlocking:1.04,stickhandling:0.89,passing:0.92,skating:0.98,stamina:1.03,
      reflexes:1.03,glove:1.04,blocker:1.06,reboundControl:1.05,mental:0.97};
  } else if(lk==='USJL'){
    M={positioning:0.88,physical:0.9,stamina:0.95,defense:0.93,shotBlocking:0.94,
      mental:0.92,reflexes:0.96};
  } else if(lk==='NEJC'||lk==='CEJC'||lk==='ARJC'){
    M={passing:1.06,stickhandling:1.05,positioning:1.04,skating:1.03,defense:1.02,shooting:1.02,physical:0.97,stamina:1.02,
      mental:1.04,reflexes:1.03,glove:1.02,blocker:1.02,reboundControl:1.02};
  } else if(lk==='EWJC'||lk==='AWJC'){
    M={passing:1.05,positioning:1.04,skating:1.03,stickhandling:1.03,stamina:1.02,physical:0.95,
      reflexes:1.03,glove:1.02,blocker:1.02,reboundControl:1.02,mental:1.03};
  } else if(lk==='NEHL'||lk==='CEHL'){
    M={passing:1.1,positioning:1.08,stickhandling:1.07,skating:1.03,defense:1.03,physical:0.93,shooting:1.02,
      mental:1.06,reflexes:1.04,glove:1.03,blocker:1.03,reboundControl:1.04};
  } else if(lk==='ARHL'){
    if(chinaKhl){
      M={physical:0.72,stamina:0.78,skating:0.8,positioning:0.88,stickhandling:1.08,passing:1.06,shooting:0.95,defense:0.85,shotBlocking:0.86,
        reflexes:0.82,glove:0.84,blocker:0.84,reboundControl:0.83,mental:0.9};
    } else if(asiaPac){
      M={skating:0.9,physical:0.88,stamina:0.92,stickhandling:1.05,passing:1.04,positioning:0.94,
        reflexes:0.93,glove:0.94,blocker:0.94,reboundControl:0.93,mental:0.95};
    } else {
      M={stickhandling:1.12,passing:1.1,shooting:1.04,skating:0.86,stamina:0.9,positioning:0.96,physical:0.97,
        reflexes:0.94,glove:0.95,blocker:0.95,reboundControl:0.94,mental:1.1};
    }
  } else if(lk==='NCHA'||lk==='NWCHA'){
    M={skating:1.03,shooting:1.03,stickhandling:1.04,passing:1.04,positioning:1.05,defense:1.04,physical:0.93,stamina:1.02,
      reflexes:1.04,glove:1.03,blocker:1.03,reboundControl:1.04,mental:1.05};
  } else if(lk==='CWHL'){
    M={skating:1.05,passing:1.05,positioning:1.04,stickhandling:1.04,stamina:1.03,
      reflexes:1.03,glove:1.02,blocker:1.02,reboundControl:1.02,mental:1.04};
  } else if(lk==='USWDL'){
    M={positioning:0.9,physical:0.92,defense:0.93,mental:0.93};
  } else if(lk==='PWDL'){
    M={positioning:0.93,physical:0.95,mental:0.96};
  } else if(lk==='SDHL'||lk==='FWHL'){
    M={passing:1.08,positioning:1.06,stickhandling:1.05,skating:1.02,physical:0.94,
      reflexes:1.05,glove:1.04,mental:1.05};
  } else if(lk==='AWHL'){
    if(/Seoul|Beijing|Shanghai|Tokyo|Sapporo|Shenzhen|Taipei|Busan/i.test(tn)){
      M={physical:0.78,stamina:0.85,skating:0.88,passing:1.05,positioning:0.9,
        reflexes:0.88,glove:0.9,blocker:0.9,reboundControl:0.88,mental:0.92};
    } else {
      M={passing:1.05,positioning:1.03,stickhandling:1.03};
    }
  }

  var v=M[attr];
  return cl(typeof v==='number'?v:1,0.62,1.28);
}
var ATTR_LABELS = {
  skating:'SKATING',shooting:'SHOOTING',stickhandling:'STICKHAND',passing:'PASSING',
  positioning:'POSITIONING',physical:'PHYSICAL',stamina:'STAMINA',defense:'DEFENSE',
  shotBlocking:'SHOT-BLOCK',reflexes:'REFLEXES',glove:'GLOVE',blocker:'BLOCKER',
  reboundControl:'REB CTRL',mental:'MENTAL'
};
var ATTR_COLORS = {
  skating:'#00d2d3',shooting:'#d63031',stickhandling:'#fd79a8',passing:'#6c5ce7',
  positioning:'#0984e3',physical:'#e17055',stamina:'#00b894',defense:'#74b9ff',
  shotBlocking:'#a29bfe',reflexes:'#ff7675',glove:'#fdcb6e',blocker:'#81ecec',
  reboundControl:'#55efc4',mental:'#dfe6e9'
};

// MOMENTS -- passing plays now give assists, not goals
var MOMENTS = {
  F: [
    {text:"BREAKAWAY! You beat the last defender clean -- just you and the goalie.",ctx:"SCORING CHANCE -- BREAKAWAY",
     opts:[
       {t:"BACKHAND DEKE -- go to backhand",a:'stickhandling',risk:'HIGH',s:0.60,pa:0.25,reward:'goal',icon:'>'},
       {t:"TOP SHELF SNAP -- pick a corner",a:'shooting',risk:'MED',s:0.50,pa:0.30,reward:'goal',icon:'^'},
       {t:"FIVE-HOLE SLIDE -- thread the needle",a:'shooting',risk:'MED',s:0.45,pa:0.35,reward:'goal',icon:'>'},
       {t:"PULL BACK -- dish to trailing teammate",a:'passing',risk:'LOW',s:0.75,pa:0.15,reward:'assist',icon:'<'}
     ]},
    {text:"POWER PLAY! Set up in the circle. One-timer opportunity through a screen.",ctx:"POWER PLAY -- MAN ADVANTAGE",
     opts:[
       {t:"ONE-TIMER -- full force from the circle",a:'shooting',risk:'HIGH',s:0.55,pa:0.30,reward:'goal',icon:'!'},
       {t:"WAIT -- let point shoot, crash for rebound",a:'positioning',risk:'LOW',s:0.65,pa:0.25,reward:'goal',icon:'_'},
       {t:"REDIRECT PASS -- back door feed",a:'passing',risk:'MED',s:0.68,pa:0.20,reward:'assist',icon:'>'},
       {t:"FAKE AND SNAP -- sell the move",a:'stickhandling',risk:'MED',s:0.50,pa:0.30,reward:'goal',icon:'*'}
     ]},
    {text:"2-ON-1! You have the puck, one defender between you and a streaking winger.",ctx:"RUSH CHANCE -- TIED GAME",
     opts:[
       {t:"SHOOT -- beat the goalie now",a:'shooting',risk:'MED',s:0.45,pa:0.35,reward:'goal',icon:'^'},
       {t:"PASS -- hit the winger backdoor",a:'passing',risk:'MED',s:0.72,pa:0.15,reward:'assist',icon:'>'},
       {t:"DEKE THE DEFENDER -- create the lane",a:'stickhandling',risk:'HIGH',s:0.50,pa:0.20,reward:'goal',icon:'~'},
       {t:"BACK-PASS -- reset the play",a:'passing',risk:'LOW',s:0.62,pa:0.30,reward:'assist',icon:'<'}
     ]},
    {text:"BOARD BATTLE -- their big defenseman has you pinned. Puck loose.",ctx:"DEFENSIVE ZONE -- CORNER BATTLE",
     opts:[
       {t:"MUSCLE THROUGH -- use your body",a:'physical',risk:'MED',s:0.60,pa:0.25,reward:'assist',icon:'!'},
       {t:"SPIN AND MOVE -- use footwork",a:'skating',risk:'HIGH',s:0.50,pa:0.20,reward:'assist',icon:'~'},
       {t:"BACKHAND OUT -- chip to your D",a:'stickhandling',risk:'LOW',s:0.70,pa:0.20,reward:'assist',icon:'>'},
       {t:"OUTLET PASS -- spring your linemate",a:'passing',risk:'LOW',s:0.76,pa:0.18,reward:'assist',icon:'*'}
     ]},
    {text:"PENALTY SHOT! The arena goes dead quiet. Just you and the goalie.",ctx:"PENALTY SHOT -- ALL ON YOU",
     opts:[
       {t:"FOREHAND DEKE -- patience then release",a:'stickhandling',risk:'HIGH',s:0.58,pa:0.10,reward:'goal',icon:'~'},
       {t:"BACKHAND ROOF -- go high backhand",a:'stickhandling',risk:'HIGH',s:0.52,pa:0.08,reward:'goal',icon:'^'},
       {t:"SNAP SHOT -- shoot early, catch off guard",a:'shooting',risk:'MED',s:0.45,pa:0.05,reward:'goal',icon:'!'},
       {t:"HIGH GLOVE -- beat them clean",a:'shooting',risk:'MED',s:0.48,pa:0.05,reward:'goal',icon:'^'}
     ]},
    {text:"CYCLING LOW! Your line is controlling the zone -- puck comes to you on the half-wall.",ctx:"ZONE CYCLE -- POSSESSION GAME",
     opts:[
       {t:"SHOOT THROUGH THE SCREEN",a:'shooting',risk:'MED',s:0.44,pa:0.32,reward:'goal',icon:'!'},
       {t:"FEED THE CROSS-SLOT PASS",a:'passing',risk:'LOW',s:0.74,pa:0.18,reward:'assist',icon:'>'},
       {t:"WALK IN AND SNAP IT",a:'stickhandling',risk:'HIGH',s:0.48,pa:0.22,reward:'goal',icon:'~'},
       {t:"RESET TO THE POINT",a:'passing',risk:'LOW',s:0.70,pa:0.22,reward:'assist',icon:'<'}
     ]},
    {text:"PK -- shot lane opens. You are the forward who has to get in the lane or the puck goes through.",ctx:"PENALTY KILL -- SHOT BLOCK",
     opts:[
       {t:"LAY OUT -- EAT THE SLAPPER",a:'positioning',risk:'HIGH',s:0.52,pa:0.22,reward:'block',icon:'!'},
       {t:"STICK IN LANE -- DEFLECT WIDE",a:'stickhandling',risk:'MED',s:0.58,pa:0.25,reward:'block',icon:'-'},
       {t:"READ AND STEP -- TIMING BLOCK",a:'positioning',risk:'MED',s:0.62,pa:0.22,reward:'block',icon:'_'},
       {t:"LET IT THROUGH -- TRUST THE GOALIE",a:'positioning',risk:'LOW',s:0.68,pa:0.18,reward:'block',icon:'*'}
     ]},
    {text:"BACKCHECK! Their forward breaks out -- you are the F3 hunting the puck carrier through the neutral zone.",ctx:"200-FOOT GAME -- BACKCHECK",
     opts:[
       {t:"ANGLE AND LIFT -- STEAL CLEAN",a:'stickhandling',risk:'HIGH',s:0.50,pa:0.20,reward:'assist',icon:'~'},
       {t:"BODY FINISH -- RUB HIM OUT",a:'physical',risk:'MED',s:0.56,pa:0.24,reward:'assist',icon:'!'},
       {t:"STICK ON PUCK -- FORCE DUMP",a:'positioning',risk:'LOW',s:0.72,pa:0.20,reward:'assist',icon:'>'},
       {t:"TAKE A PENALTY -- DESPERATE REACH",a:'physical',risk:'HIGH',s:0.38,pa:0.15,reward:'assist',icon:'X'}
     ]},
    {text:"FIGHT OR FLIGHT -- their tough guy squares you up after a clean hit. Crowd is howling.",ctx:"SCRAP -- TILT",
     opts:[
       {t:"DROP 'EM -- ANSWER THE BELL",a:'physical',risk:'HIGH',s:0.48,pa:0.18,reward:'fight',icon:'X'},
       {t:"SKATE TO THE BOX -- DRAW HIM OFF",a:'skating',risk:'MED',s:0.62,pa:0.22,reward:'assist',icon:'>'},
       {t:"SMART TALK -- NO GLOVES",a:'positioning',risk:'LOW',s:0.70,pa:0.20,reward:'assist',icon:'*'},
       {t:"TURTLE -- NOT WORTH IT",a:'positioning',risk:'LOW',s:0.55,pa:0.28,reward:'block',icon:'_'}
     ]},
    {text:"CREASE SCRUM -- whistle gone but six bodies pile on the goalie. Puck is under a forest of sticks.",ctx:"NET-FRONT WAR -- SCRUM",
     opts:[
       {t:"DIG LIKE A DOG -- FREE THE PUCK",a:'physical',risk:'HIGH',s:0.50,pa:0.20,reward:'scrum',icon:'!'},
       {t:"COOL HEAD -- PULL BACK",a:'positioning',risk:'LOW',s:0.74,pa:0.22,reward:'block',icon:'_'},
       {t:"HELP THE GOALIE -- COVER STICKS",a:'positioning',risk:'MED',s:0.65,pa:0.22,reward:'scrum',icon:'>'},
       {t:"SHOVE THROUGH -- CREATE SPACE",a:'physical',risk:'MED',s:0.58,pa:0.22,reward:'scrum',icon:'X'}
     ]},
    {text:"DEFENSIVE ZONE -- you are low F1 on a cycle. They try to force a seam through your triangle.",ctx:"DEFENSIVE STRUCTURE -- LOW FORWARD",
     opts:[
       {t:"TAKE THE LANE -- STICK IN PASSING LANE",a:'positioning',risk:'MED',s:0.64,pa:0.22,reward:'block',icon:'>'},
       {t:"FRONT NET BOXOUT",a:'physical',risk:'MED',s:0.60,pa:0.22,reward:'block',icon:'!'},
       {t:"QUICK CHIP -- CLEAR THE ZONE",a:'passing',risk:'LOW',s:0.72,pa:0.20,reward:'assist',icon:'^'},
       {t:"READ INTERCEPTION -- PICK THE PASS",a:'positioning',risk:'HIGH',s:0.48,pa:0.18,reward:'assist',icon:'*'}
     ]}
  ],
  D: [
    {text:"Their top line on a 3-on-2 against your pair. Shooter has it at the hash.",ctx:"DEFENSIVE RUSH -- 3-ON-2",
     opts:[
       {t:"ANGLE THE SHOOTER -- force wide",a:'defense',risk:'LOW',s:0.65,pa:0.25,reward:'block',icon:'>'},
       {t:"POKE CHECK -- go for the puck",a:'shotBlocking',risk:'HIGH',s:0.45,pa:0.25,reward:'block',icon:'-'},
       {t:"STAY IN LANE -- trust the goalie",a:'positioning',risk:'LOW',s:0.70,pa:0.20,reward:'block',icon:'_'},
       {t:"PHYSICAL PLAY -- rub them out",a:'physical',risk:'MED',s:0.55,pa:0.20,reward:'block',icon:'!'}
     ]},
    {text:"POWER PLAY POINT! You're loaded up, screened in front.",ctx:"POWER PLAY -- D AT THE POINT",
     opts:[
       {t:"SLAP SHOT -- full force, see what happens",a:'passing',risk:'HIGH',s:0.35,pa:0.45,reward:'assist',icon:'!'},
       {t:"FAKE SLAPPER -- wrist shot five-hole",a:'passing',risk:'MED',s:0.45,pa:0.35,reward:'assist',icon:'~'},
       {t:"MOVE IT -- find the open forward",a:'passing',risk:'LOW',s:0.78,pa:0.15,reward:'assist',icon:'>'},
       {t:"WALK IN -- skate down to the circle",a:'skating',risk:'HIGH',s:0.40,pa:0.30,reward:'assist',icon:'>'}
     ]},
    {text:"Puck behind your net under pressure. Forecheckers closing fast.",ctx:"BREAKOUT -- UNDER PRESSURE",
     opts:[
       {t:"RIM THE BOARDS -- get it out safe",a:'passing',risk:'LOW',s:0.75,pa:0.20,reward:'assist',icon:'>'},
       {t:"CARRY IT OUT -- beat the forechecker",a:'skating',risk:'HIGH',s:0.50,pa:0.20,reward:'assist',icon:'>'},
       {t:"HEADMAN PASS -- spring the forward",a:'passing',risk:'MED',s:0.68,pa:0.22,reward:'assist',icon:'^'},
       {t:"BANK OFF BOARDS -- up to winger",a:'defense',risk:'MED',s:0.65,pa:0.25,reward:'assist',icon:'>'}
     ]},
    {text:"Their big winger drives to the net in overtime. You are the last line.",ctx:"NET-FRONT BATTLE -- OT",
     opts:[
       {t:"BOX THEM OUT -- clean body position",a:'physical',risk:'LOW',s:0.72,pa:0.20,reward:'block',icon:'_'},
       {t:"STICK CHECK -- go for the puck",a:'shotBlocking',risk:'MED',s:0.55,pa:0.25,reward:'block',icon:'-'},
       {t:"PUSH THEM WIDE -- use your size",a:'physical',risk:'MED',s:0.60,pa:0.25,reward:'block',icon:'>'},
       {t:"SIGNAL GOALIE -- call for help",a:'positioning',risk:'LOW',s:0.68,pa:0.25,reward:'block',icon:'*'}
     ]},
    {text:"You stapled their star to the glass -- clean hit -- and their enforcer is already over the boards.",ctx:"FIGHT OR FLIGHT -- AFTER THE HIT",
     opts:[
       {t:"ANSWER -- DROP THE MITTS",a:'physical',risk:'HIGH',s:0.46,pa:0.16,reward:'fight',icon:'X'},
       {t:"BACK AWAY -- LET TEAMMATES IN",a:'positioning',risk:'LOW',s:0.72,pa:0.22,reward:'block',icon:'_'},
       {t:"JERSEY JAB -- DRAW THE EXTRA",a:'physical',risk:'MED',s:0.54,pa:0.22,reward:'fight',icon:'!'},
       {t:"SKATE TO THE BENCH -- COOL IT",a:'skating',risk:'MED',s:0.66,pa:0.24,reward:'assist',icon:'<'}
     ]},
    {text:"SCRUM IN THE BLUE PAINT -- you are tangled with two forwards. Whistle is late. Refs are sprinting in.",ctx:"PILE-UP -- SCRUM",
     opts:[
       {t:"WIN THE WALL -- CLEAR THE CREASE",a:'physical',risk:'HIGH',s:0.52,pa:0.20,reward:'scrum',icon:'!'},
       {t:"COVER AND FREEZE",a:'positioning',risk:'MED',s:0.64,pa:0.22,reward:'block',icon:'_'},
       {t:"YANK THE PUCK OUT",a:'passing',risk:'MED',s:0.58,pa:0.22,reward:'scrum',icon:'~'},
       {t:"DIVE ON IT -- NO SHOT",a:'shotBlocking',risk:'HIGH',s:0.48,pa:0.18,reward:'block',icon:'-'}
     ]},
    {text:"You jumped the rush -- odd-man with your forwards. You are the trailer with a lane.",ctx:"OFFENSE -- D JOINS THE RUSH",
     opts:[
       {t:"ACTIVATE -- HIT THE TRAIL ONE-TIMER",a:'passing',risk:'HIGH',s:0.42,pa:0.30,reward:'goal',icon:'!'},
       {t:"DELAY -- DISH ACROSS SLOT",a:'passing',risk:'MED',s:0.68,pa:0.20,reward:'assist',icon:'>'},
       {t:"DRIVE NET -- SCREEN AND TIP",a:'physical',risk:'MED',s:0.55,pa:0.25,reward:'goal',icon:'^'},
       {t:"PULL BACK -- RESET HIGH",a:'passing',risk:'LOW',s:0.75,pa:0.18,reward:'assist',icon:'<'}
     ]},
    {text:"Shot from the point -- you are the shot-blocking lane. Big wind-up coming.",ctx:"PK -- D BLOCK",
     opts:[
       {t:"FULL EXTENSION BLOCK",a:'shotBlocking',risk:'HIGH',s:0.50,pa:0.22,reward:'block',icon:'-'},
       {t:"ANGLE AND LET GOALIE SEE",a:'positioning',risk:'LOW',s:0.70,pa:0.20,reward:'block',icon:'_'},
       {t:"ONE-TIMER READ -- GET BIG",a:'defense',risk:'MED',s:0.62,pa:0.22,reward:'block',icon:'!'},
       {t:"BANK OFF SHIN PAD -- CLEAR",a:'shotBlocking',risk:'MED',s:0.56,pa:0.22,reward:'block',icon:'>'}
     ]}
  ],
  G: [
    {text:"BREAKAWAY -- shooter in alone, makes their move at the top of the circle.",ctx:"BREAKAWAY -- SHOOTER ALONE",
     opts:[
       {t:"CHALLENGE HARD -- cut angle early",a:'positioning',risk:'MED',s:0.58,pa:0.20,reward:'save',icon:'>'},
       {t:"STAY BACK -- butterfly and wait",a:'reflexes',risk:'LOW',s:0.52,pa:0.25,reward:'save',icon:'_'},
       {t:"POKE CHECK -- slide the pad out",a:'reflexes',risk:'HIGH',s:0.50,pa:0.15,reward:'save',icon:'-'},
       {t:"READ AND REACT -- commit when they commit",a:'mental',risk:'LOW',s:0.62,pa:0.20,reward:'save',icon:'*'}
     ]},
    {text:"SCREENED SHOT from the point -- you can't see the puck cleanly.",ctx:"SCREENED SHOT -- PP AGAINST",
     opts:[
       {t:"TRACK THROUGH TRAFFIC -- use instincts",a:'reflexes',risk:'HIGH',s:0.50,pa:0.20,reward:'save',icon:'*'},
       {t:"BUTTERFLY -- seal the bottom",a:'positioning',risk:'MED',s:0.58,pa:0.25,reward:'save',icon:'_'},
       {t:"MOVE THE SCREEN -- direct your D",a:'mental',risk:'LOW',s:0.65,pa:0.20,reward:'save',icon:'*'},
       {t:"BLOCKER SIDE -- protect the opening",a:'blocker',risk:'MED',s:0.55,pa:0.25,reward:'save',icon:'>'}
     ]},
    {text:"ONE-TIMER from the circle -- shooter winds up fast. No time to think.",ctx:"ONE-TIMER -- SPLIT SECOND",
     opts:[
       {t:"GLOVE SIDE -- extend and catch",a:'glove',risk:'HIGH',s:0.55,pa:0.20,reward:'save',icon:'*'},
       {t:"BUTTERFLY DROP -- seal low",a:'positioning',risk:'MED',s:0.60,pa:0.20,reward:'save',icon:'_'},
       {t:"BLOCKER -- deflect and control",a:'blocker',risk:'MED',s:0.52,pa:0.25,reward:'save',icon:'>'},
       {t:"SET POSITION -- be where they shoot",a:'positioning',risk:'LOW',s:0.65,pa:0.18,reward:'save',icon:'_'}
     ]},
    {text:"PENALTY SHOT against you. The arena holds its breath.",ctx:"PENALTY SHOT -- EVERYTHING ON LINE",
     opts:[
       {t:"FORCE THEM WIDE -- aggressive challenge",a:'positioning',risk:'HIGH',s:0.55,pa:0.10,reward:'save',icon:'>'},
       {t:"READ THE HANDS -- wait for the tell",a:'reflexes',risk:'MED',s:0.60,pa:0.10,reward:'save',icon:'*'},
       {t:"STAY BIG -- butterfly at last second",a:'mental',risk:'MED',s:0.58,pa:0.10,reward:'save',icon:'_'},
       {t:"POKE CHECK -- slide at their feet",a:'reflexes',risk:'HIGH',s:0.52,pa:0.08,reward:'save',icon:'-'}
     ]},
    {text:"Their goalie skates to your crease during a TV timeout -- chirping, gloves half off. Crowd is feral.",ctx:"GOALIE VS GOALIE -- FIGHT?",
     opts:[
       {t:"MEET HIM -- TRASH TALK ONLY",a:'mental',risk:'LOW',s:0.72,pa:0.20,reward:'save',icon:'*'},
       {t:"SQUARE UP -- RARE GOALIE TILT",a:'physical',risk:'HIGH',s:0.42,pa:0.14,reward:'fight',icon:'X'},
       {t:"SKATE AWAY -- ICE COLD",a:'positioning',risk:'LOW',s:0.78,pa:0.22,reward:'save',icon:'_'},
       {t:"WAVE HIM OFF -- MOCKING BOW",a:'mental',risk:'MED',s:0.62,pa:0.22,reward:'save',icon:'>'}
     ]},
    {text:"PILE IN THE CREASE -- you are under three bodies. Glove ripped off. Puck is inches from the line.",ctx:"GOALIE IN THE SCRUM",
     opts:[
       {t:"COVER -- SMOTHER THROUGH THE CHAOS",a:'positioning',risk:'MED',s:0.60,pa:0.22,reward:'scrum',icon:'_'},
       {t:"KICK SAVE STACK -- WILD",a:'reflexes',risk:'HIGH',s:0.52,pa:0.18,reward:'scrum',icon:'!'},
       {t:"FREEZE WHISTLE -- HOLD FOR INTERFERENCE",a:'mental',risk:'LOW',s:0.68,pa:0.22,reward:'save',icon:'*'},
       {t:"PUNCH AT THE PUCK -- DESPERATION",a:'physical',risk:'HIGH',s:0.46,pa:0.16,reward:'scrum',icon:'X'}
     ]},
    {text:"EMPTY NET -- you are up late. They pulled their goalie. You are the last man back with a chance.",ctx:"EMPTY NET -- GOALIE GOAL?",
     opts:[
       {t:"CARRY AND FIRE -- FULL SEND",a:'passing',risk:'HIGH',s:0.38,pa:0.25,reward:'goal',icon:'!'},
       {t:"BANK OFF THE GLASS -- SAFE CLEAR",a:'mental',risk:'LOW',s:0.78,pa:0.18,reward:'save',icon:'_'},
       {t:"RIM IT DEEP -- POSSESSION",a:'passing',risk:'MED',s:0.70,pa:0.20,reward:'assist',icon:'>'},
       {t:"PASS TO STREAKING F -- SPRING 2-ON-0",a:'passing',risk:'MED',s:0.62,pa:0.22,reward:'assist',icon:'^'}
     ]},
    {text:"You play the puck behind your net -- stretch pass springs a breakaway the other way.",ctx:"GOALIE PLAYMAKER",
     opts:[
       {t:"THREAD THE BANK PASS -- PRIMARY APPLE",a:'passing',risk:'MED',s:0.58,pa:0.22,reward:'assist',icon:'>'},
       {t:"SAFE OFF THE GLASS",a:'mental',risk:'LOW',s:0.76,pa:0.18,reward:'save',icon:'_'},
       {t:"BOLD CLEAR THROUGH MID -- RISK/REWARD",a:'passing',risk:'HIGH',s:0.48,pa:0.20,reward:'assist',icon:'!'},
       {t:"EAT IT -- FREEZE FOR FACEOFF",a:'reboundControl',risk:'LOW',s:0.72,pa:0.22,reward:'save',icon:'*'}
     ]}
  ]
};

var STRATEGIES = [
  {id:'aggr',name:'AGGRESSIVE', desc:'High pressure. More big chances -- more risk.',        offBonus:1.2,defPenalty:0.85},
  {id:'bal', name:'BALANCED',   desc:'Play your game. No modifiers. Pure skill.',             offBonus:1.0,defPenalty:1.0},
  {id:'def', name:'DEFENSIVE',  desc:'Lock it down. Win ugly 2-1 games.',                    offBonus:0.8,defPenalty:1.2},
  {id:'pp',  name:'PP FOCUS',   desc:'Capitalize on power plays. Better man-advantage moments.', offBonus:1.15,defPenalty:0.95}
];

var NEXT_TIER = {
  junior:  {M:['NAML','PHL'],  F:['PWDL','PWL']},
  college: {M:['NAML','PHL'],  F:['PWDL','PWL']},
  euro:    {M:['PHL','NAML'],  F:['PWL','PWDL']},
  asia:    {M:['PHL','NAML'],  F:['PWL','PWDL']},
  minor:   {M:['PHL'],         F:['PWL']}
};

// SOCIAL SYSTEM DATA
var SOCIAL_NAMES_M = [
  'Jake Morrison','Tyler Kovacs','Brandon Leclair','Mike Zalenski','Stefan Holmberg',
  'Marcus Webb','Kyle Bernier','Dani Saarinen','Ryan Okafor','Lukas Petrov',
  'Caden Tremblay','Wyatt Forsberg','Niko Haugen','Dmitri Volkov','Jesse Fairbanks',
  'Alexei Kuznetsov','Jordan Ashworth','Patrik Sundqvist','Connor Healy','Mikael Lindqvist',
  'Brayden Callahan','Tomas Dvoracek','Owen Ritchie','Sergei Malashenko','Nick Carvalho',
  'Mohammad Al-Rashid','Yusuf Okonkwo','Hiroshi Tanaka','Wei Zhang','Jamal Osei',
  'Luca Ferretti','Carlos Reyes','Aarav Sharma','Matteo Russo','Kenji Watanabe',
  'Rafael Moura','Ibrahim Diallo','Arjun Nair','Hamid Rezaei','Felix Nguyen', 'Rajeshna Patel', 'Diyaco El-Diablo'
];
var SOCIAL_NAMES_F = [
  'Emma Morrison','Taylor Kovacs','Brianna Leclair','Mia Zalenski','Sofia Holmberg',
  'Maya Webb','Dani Saarinen','Raina Okafor','Luisa Petrov','Keiran Walsh',
  'Cassidy Forsberg','Hana Lindqvist','Nadia Volkov','Jules Ashworth','Petra Dvoracek',
  'Skylar Callahan','Annika Sundqvist','Riley Fairbanks','Izzy Carvalho','Bea Tremblay',
  'Chloe Ritchie','Vera Malashenko','Sasha Kuznetsov','Margot Healy','Imogen Bernier',
  'Fatima Al-Hassani','Yuki Tanaka','Priya Sharma','Amara Diallo','Mei-Ling Chen',
  'Valentin Russo','Aisha Osei','Layla Rezaei','Ingrid Haugen','Zara Okonkwo'
];
var COACH_NAMES = [
  'Coach Williams','Coach Bruneau','Coach Reilly','Coach MacPherson','Coach Lindqvist',
  'Coach Bertrand','Coach Hakala','Coach Petranuk','Coach Delacroix','Coach Aziz',
  'Coach Yamamoto','Coach Kowalski','Coach Ferreira','Coach Nkosi','Coach Andersen'
];
var FAN_HANDLES = [
  'HockeyFan2039','PuckHead99','IceTimeDaily','GoalieNerd42','SlapshotKing',
  'HatTrick_Hank','5HolePete','BlueLine_Believer','DraftKingHockey','ArenaRoar',
  'IceColdTakes','RinkRat_Real','PuckDropper','XtraAttacker','BenchWarmersPod',
  'NightOwlPuck','TopShelfTalk','GloveSidePete','BardownDaily','OffWideDave',
  'HockeyHeads99','TwoMinuteMajor','IceTimeInsider','ScoutReport_','SixthSkater',
  'PuckDad_SE','HockeyMom_FI','IceTime_JP','RinkLife_RU','PuckFans_ON',
  'xHockeyTalk','BlueLineChronicles','IceReport_','TopCornerDaily97','NightlyPuck', 'TORMonarks34', 'Quebxican66'
];
// Professional critics and analysts who appear in the hater/critic section
var CRITIC_NAMES = [
  {n:'Dave Korhonen',role:'Hockey Analyst -- TSN Radio'},
  {n:'Pierre Delacroix',role:'Senior Columnist -- The Hockey Review'},
  {n:'Greg Ashworth',role:'Former Pro -- Now Broadcaster'},
  {n:'Mark Callahan',role:'PHL Insider -- Daily Puck'},
  {n:'Elaine Nkosi',role:'Hockey Analytics -- IceScore Media'},
  {n:'Janne Heikkinen',role:'NEHL Correspondent -- Puck Europe'},
  {n:'Viktor Sorokin',role:'Former PHL Scout -- Retired'},
  {n:'Lisa Carrington',role:'Hockey Journalist -- The Ice Sheet'}
];

function pressRandomPeer(){
  var p=(G&&G.gender==='F'?SOCIAL_NAMES_F:SOCIAL_NAMES_M);
  return p[ri(0,p.length-1)];
}
function pressRandomCritic(){
  return CRITIC_NAMES[ri(0,CRITIC_NAMES.length-1)].n;
}
function pressRandomHandle(){
  return FAN_HANDLES[ri(0,FAN_HANDLES.length-1)];
}
function pressRandomCoach(){
  return COACH_NAMES[ri(0,COACH_NAMES.length-1)];
}
function expandLifePlaceholders(str){
  if(!G||!G.first) return String(str||'');
  return String(str||'').replace(/\{F\}/g,G.first).replace(/\{L\}/g,G.last)
    .replace(/\{PEER\}/g,pressRandomPeer()).replace(/\{CRITIC\}/g,pressRandomCritic()).replace(/\{HANDLE\}/g,pressRandomHandle());
}

// Rare off-ice scenarios: professionalism, annoying fans, locker-room cancer only. Gender-neutral copy (they/them).
var LIFE_RANDOM_SCENARIOS=[
  {headline:'FANS -- VIRAL LIE ABOUT YOU',sender:'YOUR PHONE -- 2:14 AM',
   story:'A hockey meme page posts a loop of someone who looks like you fanning cash in a lobby. Fans and reply-guys tag you: "counting the bag." Wrong watch, wrong city -- not you -- but the pile-on is brutal and sponsors are asking questions.',
   choices:[
     {label:'PRO RESPONSE -- CALM FACT-CHECK VIDEO',moraleDelta:20,news:'{F} proves it was a lookalike. The room and PR breathe a little.',newsTone:'good',notify:'CLEARED THE AIR',notifyColor:'green'},
     {label:'SCORCHED-EARTH CLAPBACK',moraleSet:100,news:'You torch the page. Feels incredible; comms is not happy.',newsTone:'good',notify:'MORALE: MAX',notifyColor:'gold'},
     {label:'DELETE APPS -- GO DARK',moraleSet:14,news:'Silence lets fans narrate for you. Humiliation sticks in the room.',newsTone:'bad',notify:'SPIRAL',notifyColor:'red'}
   ]},
  {headline:'LOCKER ROOM -- LINE-CROSSING "JOKE"',sender:'TEAM OUTING / PHONES UP',
   story:'At a mall event with the club, a teammate yanks your pants down "for laughs." Crowd phones go up; security is moving in. The room will judge how you handle it.',
   choices:[
     {label:'ICE-COLD SMILE -- DARE THEM TO POST',moraleDelta:26,news:'{F} sells unbothered. Clips exist -- you kept composure on camera.',newsTone:'neutral',notify:'PRO MASK ON',notifyColor:'gold'},
     {label:'CONFRONT THEM -- ACCOUNTABILITY NOW',moraleSet:100,news:'You call out the prank in front of staff. Awkward -- but your line is drawn.',newsTone:'good',notify:'BOUNDARIES SET',notifyColor:'green'},
     {label:'BAIL ON THE TRIP',moraleSet:11,news:'You vanish. Whispers of "soft" in the room; the clip still lives online.',newsTone:'bad',notify:'MORALE CRATER',notifyColor:'red'}
   ]},
  {headline:'PROFESSIONALISM -- TEAM STANDARDS',sender:'GM + CAPTAIN -- SAME EMAIL THREAD',
   story:'You rolled into video review twenty minutes late in non-team-issue sweats, phone buzzing on camera. Staff clipped it for leadership. They want one professional response before a fine or a scratch.',
   choices:[
     {label:'OWN IT -- APOLOGIZE TO ROOM + STAFF',moraleSet:100,news:'{F} takes the L in front of everyone. Standards reset; respect rebounds.',newsTone:'good',notify:'PRO STANDARD',notifyColor:'green'},
     {label:'DEFLECT -- "SCHEDULE WAS UNCLEAR"',moraleDelta:-22,news:'Nobody buys it. The clip stays in the folder.',newsTone:'bad',notify:'CREDIBILITY HIT',notifyColor:'red'},
     {label:'GHOST -- "MY AGENT WILL CALL"',moraleSet:20,news:'Reads as entitlement. Coaches file it for later.',newsTone:'bad',notify:'UNPROFESSIONAL TAG',notifyColor:'gold'}
   ]},
  {headline:'LOCKER ROOM CANCER -- PICK A SIDE',sender:'TWO VETS -- LOW VOICES',
   story:'Two respected vets pull you aside: they are running a "players only" session trashing the coach -- toxic, personal, career-ending if it leaks. They want you there tonight. "No neutrals."',
   choices:[
     {label:'REFUSE -- "NOT MY ROOM"',moraleDelta:24,news:'{F} walks. Cold stares -- you sleep clean.',newsTone:'good',notify:'STOOD ALONE',notifyColor:'green'},
     {label:'SHOW UP -- LISTEN ONLY',moraleSet:22,news:'You hear too much. Now you are complicit in your own head.',newsTone:'bad',notify:'POISONED ROOM',notifyColor:'red'},
     {label:'GO ALL-IN -- AIR IT OUT',moraleSet:100,news:'You vent. Catharsis -- then you are on a list.',newsTone:'neutral',notify:'CATHARSIS',notifyColor:'gold'}
   ]},
  {headline:'FANS -- HOTEL LOBBY MOB',sender:'AWAY TRIP -- SECURITY RADIO',
   story:'A pack of fans corners you at the team hotel demanding selfies and autographs past the time staff said "no." They are filming; one yells you "owe" the city because of your contract.',
   choices:[
     {label:'THIRTY SECONDS -- THANK + EXIT WITH SECURITY',moraleSet:100,news:'Boring clip, clean exit. Pro move.',newsTone:'good',notify:'DE-ESCALATED',notifyColor:'green'},
     {label:'FIRM NO -- WALK THROUGH',moraleDelta:8,news:'Half the comments call you cold; half defend boundaries.',newsTone:'neutral',notify:'LINE HELD',notifyColor:'gold'},
     {label:'SNAP -- TELL THEM OFF ON CAMERA',moraleSet:16,news:'You become the villain of their montage. Team comms groans.',newsTone:'bad',notify:'FAN BAIT',notifyColor:'red'}
   ]},
  {headline:'LOCKER ROOM -- LEAKED VENT',sender:'TABLOID + TEAM GROUP CHAT',
   story:'Someone leaks a cropped screenshot of you venting about a linemate after a bad loss -- reads like pure hate today. They have not said a word in the room yet; fans are picking sides.',
   choices:[
     {label:'APOLOGIZE TO THEM 1-ON-1 FIRST',moraleSet:100,news:'Brutal talk. They respect the direct approach; tension eases.',newsTone:'good',notify:'FACE TO FACE',notifyColor:'green'},
     {label:'PR STATEMENT -- LEGAL TONE',moraleDelta:-22,news:'Sounds like denial. Your linemate feels lawyered, not heard.',newsTone:'bad',notify:'COLDER ROOM',notifyColor:'red'},
     {label:'CLAIM FAKE / HACKED',moraleSet:20,news:'Nobody buys it. Credibility tanks.',newsTone:'bad',notify:'CREDIBILITY GONE',notifyColor:'red'}
   ]},
  {headline:'FANS -- GAS STATION LIVESTREAM',sender:'PUBLIC -- PHONES UP',
   story:'A fan blocks your car demanding an autograph, then flips when you say you are late. They are live -- comments chanting "arrogant" and "overpaid."',
   choices:[
     {label:'SIGN QUICK -- KILL THE FEED',moraleDelta:14,news:'Scribble and go. Clip stays dull. Win.',newsTone:'good',notify:'DE-ESCALATED',notifyColor:'green'},
     {label:'STAY IN CAR -- SECURITY ONLY',moraleSet:100,news:'You refuse to perform for the camera. Your line, your rules.',newsTone:'good',notify:'BOUNDARIES',notifyColor:'gold'},
     {label:'YELL BACK -- MATCH THEIR ENERGY',moraleSet:12,news:'You are the villain of their clip forever.',newsTone:'bad',notify:'VIRAL MELTDOWN',notifyColor:'red'}
   ]},
  {headline:'PROFESSIONALISM -- CHARITY MIC',sender:'GALA -- SILENT CROWD',
   story:'You ad-lib a dig at the host city\'s team. The room goes dead. A crew member at the side stage will not look up from their shoes.',
   choices:[
     {label:'OWN IT -- APOLOGIZE ON MIC',moraleSet:100,news:'Painful thirty seconds -- then real applause for owning it.',newsTone:'good',notify:'RECOVERED',notifyColor:'green'},
     {label:'DOUBLE DOWN -- "TOUGH CROWD"',moraleDelta:-35,news:'Boo birds. Clip never dies.',newsTone:'bad',notify:'DISASTER',notifyColor:'red'},
     {label:'FAKE LAUGH -- FLEE THE STAGE',moraleSet:24,news:'Headlines say you "stormed off." Looks thin.',newsTone:'bad',notify:'HUMILIATED',notifyColor:'red'}
   ]},
  {headline:'LOCKER ROOM -- CLIQUE FREEZE-OUT',sender:'ROAD TRIP -- QUIET STALL',
   story:'A clique skipped you from a "optional" team dinner, then posted a group pic with a caption about "who really wants it." Half the room liked it. Feels like cancer by a thousand cuts.',
   choices:[
     {label:'ADDRESS IT WITH LEADERSHIP -- CALM',moraleDelta:30,news:'Captain hears you. Not fixed -- but the air moves.',newsTone:'good',notify:'LOGGED',notifyColor:'green'},
     {label:'CALL THEM OUT IN THE ROOM',moraleSet:18,news:'Volume goes up. Sides harden; coaches clock the noise.',newsTone:'bad',notify:'ROOM SPLITS',notifyColor:'red'},
     {label:'ICE OUT -- GIVE NOTHING BACK',moraleSet:100,news:'You go flat professional. They lose their reaction; you feel untouchable tonight.',newsTone:'good',notify:'PRO WALL',notifyColor:'gold'}
   ]},
  {headline:'FANS + MEDIA -- FAKE TRADE STORY',sender:'HOCKEY TWITTER / GM TEXT',
   story:'Accounts with huge followings say you demanded a trade at a bar. Your agent says fiction. Your GM sends a single "?". Fans are already burning your jersey in replies.',
   choices:[
     {label:'CALL GM -- STRAIGHT STORY',moraleSet:100,news:'Five-minute call. Awkward laugh. Trust patched.',newsTone:'good',notify:'SQUASHED',notifyColor:'green'},
     {label:'POST "CAP" MEME',moraleDelta:-28,news:'Management reads disrespect. Room side-eyes.',newsTone:'bad',notify:'BAD LOOK',notifyColor:'red'},
     {label:'SILENCE -- LET AGENT ONLY',moraleSet:21,news:'The lie echoes for days while you say nothing.',newsTone:'bad',notify:'NOISE',notifyColor:'gold'}
   ]},
  {headline:'LOCKER CANCER -- SUBTWEET WAR',sender:'PASSIVE-AGGRESSIVE FEED',
   story:'A teammate you thought you were cool with posts a lyric obviously aimed at you -- "some want the C but will not block a shot." Half the team liked it. Fans are screenshotting.',
   choices:[
     {label:'PULL THEM ASIDE -- NO AUDIENCE',moraleSet:100,news:'Ugly honest talk. Maybe not friends -- the cancer pauses.',newsTone:'good',notify:'DIRECT',notifyColor:'green'},
     {label:'SUBTWEET BACK',moraleSet:15,news:'Fans pick teams. Dressing room becomes a split screen.',newsTone:'bad',notify:'LOCKER CANCER',notifyColor:'red'},
     {label:'LAUGH IN THEIR FACE AT PRACTICE',moraleDelta:-20,news:'They double down. Coaches notice the edge.',newsTone:'bad',notify:'TENSION UP',notifyColor:'red'}
   ]},
  {headline:'FANS -- SEASON-TICKET LETTER CIRCLES',sender:'INBOX + LOCAL RADIO',
   story:'A season-ticket holder blast-email claims you "hate the kids and the city" because you did not stop for twenty signatures after a loss. Radio picks it up. The org wants a professional stance by noon.',
   choices:[
     {label:'SHORT VIDEO -- KIND, CLEAR, NO EXCUSES',moraleSet:100,news:'You set the record straight without torching fans. Boring wins.',newsTone:'good',notify:'PRO RESET',notifyColor:'green'},
     {label:'CLAP BACK AT "TOXIC" FANS',moraleSet:10,news:'The letter-writer becomes a martyr; sponsors flinch.',newsTone:'bad',notify:'PR NIGHTMARE',notifyColor:'red'},
     {label:'IGNORE -- "NOT MY JOB"',moraleSet:23,news:'Silence reads as arrogance. The story grows.',newsTone:'bad',notify:'UNPRO LOOK',notifyColor:'gold'}
   ]},
  {headline:'MEDIA -- HANDLE WAR',sender:'NOTIFICATIONS -- SOCIAL',
   story:'{HANDLE} posts a cut-up of your shifts with a sarcastic caption. {CRITIC} quotes it on radio within the hour. Teammate {PEER} texts you a screenshot -- "you good?"',
   choices:[
     {label:'SHORT CLARIFICATION POST -- NO HEAT',moraleDelta:18,news:'{F} kills the spiral with boring facts. Room appreciates it.',newsTone:'good',notify:'DEFUSED',notifyColor:'green'},
     {label:'DM TEAMMATE -- LAUGH IT OFF',moraleDelta:22,news:'You and {PEER} go for coffee. The meme dies faster.',newsTone:'good',notify:'TEAM BOND',notifyColor:'gold'},
     {label:'QUOTE-TWEET WITH SARCASM',moraleDelta:-24,news:'Algorithm rewards anger. Sponsors send worried emails.',newsTone:'bad',notify:'AMPLIFIED',notifyColor:'red'}
   ]},
  {headline:'STAFF -- VIDEO MEETING GONE WRONG',sender:'COACHING STAFF -- VIDEO CALL',
   story:'During a team tactics call your mic un-mutes while you mutter about line combos. Half the staff heard it.',
   choices:[
     {label:'APOLOGIZE IMMEDIATELY -- OWN IT',moraleSet:100,news:'{F} apologizes on the call. Awkward silence -- then nods.',newsTone:'good',notify:'OWNED',notifyColor:'green'},
     {label:'BLAME THE DOG / WIFI',moraleDelta:-18,news:'Nobody buys it. It becomes a running joke -- not the good kind.',newsTone:'bad',notify:'CRINGE',notifyColor:'red'},
     {label:'PRIVATE TEXT TO HEAD COACH',moraleDelta:14,news:'You clean it up offline. Practice is tense but professional.',newsTone:'neutral',notify:'PATCHED',notifyColor:'gold'}
   ]},
  {headline:'PEERS -- ROOKIE DINNER INVOICE',sender:'VETERANS GROUP CHAT',
   story:'Vets "volunteer" you to organize rookie dinner. The group chat invoice is absurd -- and {PEER} is the loudest voice demanding premium steak.',
   choices:[
     {label:'PAY YOUR SHARE -- KEEP PEACE',moraleDelta:12,news:'Expensive night -- but you earned quiet respect.',newsTone:'neutral',notify:'PAID UP',notifyColor:'gold'},
     {label:'PUSH BACK -- CAP THE BILL',moraleDelta:20,news:'{F} sets a limit. Some vets grumble -- most respect the spine.',newsTone:'good',notify:'BOUNDARIES',notifyColor:'green'},
     {label:'GHOST THE CHAT',moraleDelta:-28,news:'They roast you on the plane. Room gets cold.',newsTone:'bad',notify:'BAD LOOK',notifyColor:'red'}
   ]},
  {headline:'PRESS -- LOBBY AMBUSH',sender:'MEDIA -- SIDE DOOR',
   story:'{CRITIC} corners you leaving the rink with a live mic: "Some say you are stat-padding in a weak league." Fans are recording.',
   choices:[
     {label:'CALM ONE-LINER -- MOVE',moraleDelta:20,news:'{F} does not take the bait. Clip dies in 12 hours.',newsTone:'good',notify:'PRO',notifyColor:'green'},
     {label:'ENGAGE -- STATS + CONTEXT',moraleDelta:10,news:'You talk too long -- but you sound smart.',newsTone:'neutral',notify:'WORDY',notifyColor:'gold'},
     {label:'WALK THROUGH THEM',moraleDelta:-10,news:'Headlines: "STARS SNUB MEDIA."',newsTone:'bad',notify:'COLD SHOULDER',notifyColor:'red'}
   ]}
];
