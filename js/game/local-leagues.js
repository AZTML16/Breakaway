/* breakaway — regional community hockey (LHCM / LHLF) */
/** Per-nation home club — closest community team, not just the regional default. */
var LOCAL_HOME_ZONES=[
  {region:'mexico_central',teamM:{n:'Mexico City Aztec Ice',e:'[M]'},teamF:{n:'Mexico City Aztec Ice',e:'[M]'},nats:['Mexico']},
  {region:'mexico_central',teamM:{n:'Monterrey Northern Ice',e:'[M]'},teamF:{n:'Monterrey Northern Ice',e:'[M]'},nats:['Guatemala','Belize','Honduras','El Salvador']},
  {region:'mexico_central',teamM:{n:'San José Central Ice',e:'[M]'},teamF:{n:'San José Central Ice',e:'[M]'},nats:['Costa Rica','Nicaragua']},
  {region:'mexico_central',teamM:{n:'Panama Canal Community',e:'[M]'},teamF:{n:'Panama Canal Community',e:'[M]'},nats:['Panama']},
  {region:'caribbean',teamM:{n:'Santo Domingo Reef Ice',e:'[R]'},teamF:{n:'Santo Domingo Reef Ice',e:'[R]'},nats:['Dominican Republic','Haiti','Cuba']},
  {region:'caribbean',teamM:{n:'Kingston Island Ice',e:'[R]'},teamF:{n:'Kingston Island Ice',e:'[R]'},nats:['Jamaica']},
  {region:'caribbean',teamM:{n:'Port of Spain Carnival Ice',e:'[R]'},teamF:{n:'Port of Spain Carnival Ice',e:'[R]'},nats:['Trinidad and Tobago','Barbados','Grenada','Saint Vincent and the Grenadines','Saint Lucia','Dominica','Saint Kitts and Nevis','Antigua and Barbuda']},
  {region:'caribbean',teamM:{n:'Santo Domingo Reef Ice',e:'[R]'},teamF:{n:'Santo Domingo Reef Ice',e:'[R]'},nats:['Bahamas']},
  {region:'south_america',teamM:{n:'Buenos Aires Pampas Ice',e:'[A]'},teamF:{n:'Buenos Aires Pampas Ice',e:'[A]'},nats:['Argentina','Uruguay','Paraguay']},
  {region:'south_america',teamM:{n:'São Paulo Tropical Ice',e:'[A]'},teamF:{n:'São Paulo Tropical Ice',e:'[A]'},nats:['Brazil']},
  {region:'south_america',teamM:{n:'Bogotá Highland Ice',e:'[A]'},teamF:{n:'Bogotá Highland Ice',e:'[A]'},nats:['Colombia','Venezuela']},
  {region:'south_america',teamM:{n:'Lima Andes Community',e:'[A]'},teamF:{n:'Lima Andes Community',e:'[A]'},nats:['Peru','Bolivia','Ecuador']},
  {region:'south_america',teamM:{n:'Santiago Andes Community',e:'[A]'},teamF:{n:'Santiago Andes Community',e:'[A]'},nats:['Chile']},
  {region:'south_america',teamM:{n:'Buenos Aires Pampas Ice',e:'[A]'},teamF:{n:'Buenos Aires Pampas Ice',e:'[A]'},nats:['Guyana','Suriname']},
  {region:'uk_ireland',teamM:{n:'Manchester Thames Ice',e:'[U]'},teamF:{n:'Manchester Thames Ice',e:'[U]'},nats:['United Kingdom']},
  {region:'uk_ireland',teamM:{n:'Dublin Emerald Community',e:'[U]'},teamF:{n:'Dublin Emerald Community',e:'[U]'},nats:['Ireland']},
  {region:'western_europe',teamM:{n:'Paris Seine Community',e:'[F]'},teamF:{n:'Paris Seine Community',e:'[F]'},nats:['France','Monaco','Andorra','Luxembourg','San Marino','Vatican City']},
  {region:'western_europe',teamM:{n:'Berlin Spree Community',e:'[F]'},teamF:{n:'Berlin Spree Community',e:'[F]'},nats:['Germany','Austria','Liechtenstein']},
  {region:'western_europe',teamM:{n:'Amsterdam Canal Ice',e:'[F]'},teamF:{n:'Amsterdam Canal Ice',e:'[F]'},nats:['Netherlands','Belgium']},
  {region:'western_europe',teamM:{n:'Milan Alps Community',e:'[F]'},teamF:{n:'Milan Alps Community',e:'[F]'},nats:['Switzerland']},
  {region:'iberia',teamM:{n:'Madrid Iberia Community',e:'[I]'},teamF:{n:'Madrid Iberia Community',e:'[I]'},nats:['Spain']},
  {region:'iberia',teamM:{n:'Lisbon Atlantic Community',e:'[I]'},teamF:{n:'Lisbon Atlantic Community',e:'[I]'},nats:['Portugal']},
  {region:'central_europe',teamM:{n:'Warsaw Vistula Community',e:'[P]'},teamF:{n:'Warsaw Vistula Community',e:'[P]'},nats:['Poland']},
  {region:'central_europe',teamM:{n:'Prague Bohemia Community',e:'[P]'},teamF:{n:'Prague Bohemia Community',e:'[P]'},nats:['Czech Republic','Slovakia']},
  {region:'central_europe',teamM:{n:'Budapest Danube Community',e:'[P]'},teamF:{n:'Budapest Danube Community',e:'[P]'},nats:['Hungary','Slovenia']},
  {region:'balkans',teamM:{n:'Belgrade Danube Ice',e:'[B]'},teamF:{n:'Belgrade Danube Ice',e:'[B]'},nats:['Serbia','Bulgaria']},
  {region:'balkans',teamM:{n:'Athens Aegean Community',e:'[B]'},teamF:{n:'Athens Aegean Community',e:'[B]'},nats:['Greece','Cyprus','Malta']},
  {region:'balkans',teamM:{n:'Bucharest Carpathian Ice',e:'[B]'},teamF:{n:'Bucharest Carpathian Ice',e:'[B]'},nats:['Romania']},
  {region:'balkans',teamM:{n:'Split Adriatic Community',e:'[B]'},teamF:{n:'Split Adriatic Community',e:'[B]'},nats:['Croatia','Montenegro','Bosnia and Herzegovina','North Macedonia','Albania']},
  {region:'baltic_caucasus',teamM:{n:'Kyiv Dnipro Community',e:'[K]'},teamF:{n:'Kyiv Dnipro Community',e:'[K]'},nats:['Ukraine','Belarus','Moldova']},
  {region:'baltic_caucasus',teamM:{n:'Riga Baltic Community',e:'[K]'},teamF:{n:'Riga Baltic Community',e:'[K]'},nats:['Latvia','Lithuania','Estonia']},
  {region:'baltic_caucasus',teamM:{n:'Tbilisi Caucasus Ice',e:'[K]'},teamF:{n:'Tbilisi Caucasus Ice',e:'[K]'},nats:['Georgia','Armenia','Azerbaijan']},
  {region:'middle_east',teamM:{n:'Dubai Sand Ice',e:'[D]'},teamF:{n:'Dubai Sand Ice',e:'[D]'},nats:['United Arab Emirates']},
  {region:'middle_east',teamM:{n:'Riyadh Desert Ice',e:'[D]'},teamF:{n:'Riyadh Desert Ice',e:'[D]'},nats:['Saudi Arabia']},
  {region:'middle_east',teamM:{n:'Doha Gulf Community',e:'[D]'},teamF:{n:'Doha Gulf Community',e:'[D]'},nats:['Qatar','Bahrain','Kuwait']},
  {region:'middle_east',teamM:{n:'Muscat Gulf Community',e:'[D]'},teamF:{n:'Muscat Gulf Community',e:'[D]'},nats:['Oman','Yemen']},
  {region:'middle_east',teamM:{n:'Istanbul Bosphorus Community',e:'[D]'},teamF:{n:'Istanbul Bosphorus Community',e:'[D]'},nats:['Turkey']},
  {region:'middle_east',teamM:{n:'Tehran Community Ice',e:'[D]'},teamF:{n:'Tehran Community Ice',e:'[D]'},nats:['Iran']},
  {region:'middle_east',teamM:{n:'Amman Community Ice',e:'[D]'},teamF:{n:'Amman Community Ice',e:'[D]'},nats:['Jordan','Lebanon','Syria','Palestine','Iraq']},
  {region:'north_africa',teamM:{n:'Cairo Desert Ice',e:'[E]'},teamF:{n:'Cairo Desert Ice',e:'[E]'},nats:['Egypt','Sudan','Libya']},
  {region:'north_africa',teamM:{n:'Casablanca Atlas Ice',e:'[E]'},teamF:{n:'Casablanca Atlas Ice',e:'[E]'},nats:['Morocco','Mauritania']},
  {region:'north_africa',teamM:{n:'Tunis Mediterranean Ice',e:'[E]'},teamF:{n:'Tunis Mediterranean Ice',e:'[E]'},nats:['Tunisia','Algeria']},
  {region:'west_africa',teamM:{n:'Lagos Community Ice',e:'[L]'},teamF:{n:'Lagos Community Ice',e:'[L]'},nats:['Nigeria','Benin','Togo']},
  {region:'west_africa',teamM:{n:'Accra Community Ice',e:'[L]'},teamF:{n:'Accra Community Ice',e:'[L]'},nats:['Ghana']},
  {region:'west_africa',teamM:{n:'Abidjan Lagoon Ice',e:'[L]'},teamF:{n:'Abidjan Lagoon Ice',e:'[L]'},nats:["Côte d'Ivoire",'Liberia','Sierra Leone','Guinea']},
  {region:'west_africa',teamM:{n:'Dakar Coastal Ice',e:'[L]'},teamF:{n:'Dakar Coastal Ice',e:'[L]'},nats:['Senegal','Mali','Burkina Faso','Niger','Gambia','Guinea-Bissau','Cabo Verde']},
  {region:'central_africa',teamM:{n:'Kinshasa River Ice',e:'[K]'},teamF:{n:'Kinshasa River Ice',e:'[K]'},nats:['Democratic Republic of the Congo','Congo','Central African Republic','Chad']},
  {region:'central_africa',teamM:{n:'Douala River Community',e:'[K]'},teamF:{n:'Douala River Community',e:'[K]'},nats:['Cameroon','Gabon','Equatorial Guinea','Sao Tome and Principe']},
  {region:'central_africa',teamM:{n:'Kinshasa River Ice',e:'[K]'},teamF:{n:'Kinshasa River Ice',e:'[K]'},nats:['Angola']},
  {region:'east_africa',teamM:{n:'Nairobi Savanna Ice',e:'[K]'},teamF:{n:'Nairobi Savanna Ice',e:'[K]'},nats:['Kenya','Tanzania','Uganda','Rwanda','Burundi','Somalia','South Sudan','Malawi']},
  {region:'east_africa',teamM:{n:'Addis Highland Ice',e:'[K]'},teamF:{n:'Addis Highland Ice',e:'[K]'},nats:['Ethiopia','Eritrea','Djibouti']},
  {region:'east_africa',teamM:{n:'Colombo Island Ice',e:'[I]'},teamF:{n:'Colombo Island Ice',e:'[I]'},nats:['Mauritius','Seychelles','Comoros']},
  {region:'southern_africa',teamM:{n:'Cape Town Ice Union',e:'[C]'},teamF:{n:'Cape Town Ice Union',e:'[C]'},nats:['South Africa','Namibia','Lesotho']},
  {region:'southern_africa',teamM:{n:'Johannesburg Ice Works',e:'[C]'},teamF:{n:'Johannesburg Ice Works',e:'[C]'},nats:['Botswana','Zambia','Zimbabwe','Eswatini']},
  {region:'southern_africa',teamM:{n:'Maputo Channel Ice',e:'[C]'},teamF:{n:'Maputo Channel Ice',e:'[C]'},nats:['Mozambique','Madagascar']},
  {region:'south_asia',teamM:{n:'Karachi Community Ice',e:'[I]'},teamF:{n:'Karachi Community Ice',e:'[I]'},nats:['Afghanistan','Pakistan']},
  {region:'south_asia',teamM:{n:'Delhi Himalayan Ice',e:'[I]'},teamF:{n:'Delhi Himalayan Ice',e:'[I]'},nats:['India','Nepal','Bhutan']},
  {region:'south_asia',teamM:{n:'Dhaka Delta Community',e:'[I]'},teamF:{n:'Dhaka Delta Community',e:'[I]'},nats:['Bangladesh']},
  {region:'south_asia',teamM:{n:'Colombo Island Ice',e:'[I]'},teamF:{n:'Colombo Island Ice',e:'[I]'},nats:['Sri Lanka','Maldives']},
  {region:'southeast_asia',teamM:{n:'Bangkok Mekong Ice',e:'[T]'},teamF:{n:'Bangkok Mekong Ice',e:'[T]'},nats:['Thailand','Laos','Cambodia','Myanmar']},
  {region:'southeast_asia',teamM:{n:'Ho Chi Minh Delta Ice',e:'[T]'},teamF:{n:'Ho Chi Minh Delta Ice',e:'[T]'},nats:['Vietnam','Timor-Leste']},
  {region:'southeast_asia',teamM:{n:'Kuala Lumpur Community',e:'[T]'},teamF:{n:'Kuala Lumpur Community',e:'[T]'},nats:['Malaysia','Singapore','Brunei']},
  {region:'southeast_asia',teamM:{n:'Jakarta Archipelago Ice',e:'[T]'},teamF:{n:'Jakarta Archipelago Ice',e:'[T]'},nats:['Indonesia']},
  {region:'southeast_asia',teamM:{n:'Manila Coral Ice',e:'[T]'},teamF:{n:'Manila Coral Ice',e:'[T]'},nats:['Philippines']},
  {region:'east_asia',teamM:{n:'Seoul Community Ice',e:'[S]'},teamF:{n:'Seoul Community Ice',e:'[S]'},nats:['South Korea','North Korea']},
  {region:'east_asia',teamM:{n:'Tokyo Community Ice',e:'[S]'},teamF:{n:'Tokyo Community Ice',e:'[S]'},nats:['Japan']},
  {region:'east_asia',teamM:{n:'Shanghai Community Ice',e:'[S]'},teamF:{n:'Shanghai Community Ice',e:'[S]'},nats:['China']},
  {region:'east_asia',teamM:{n:'Bishkek Steppe Community',e:'[B]'},teamF:{n:'Bishkek Steppe Community',e:'[B]'},nats:['Mongolia']},
  {region:'central_asia',teamM:{n:'Almaty Steppe Community',e:'[B]'},teamF:{n:'Almaty Steppe Community',e:'[B]'},nats:['Kazakhstan']},
  {region:'central_asia',teamM:{n:'Tashkent Silk Route Ice',e:'[B]'},teamF:{n:'Tashkent Silk Route Ice',e:'[B]'},nats:['Uzbekistan','Turkmenistan']},
  {region:'central_asia',teamM:{n:'Bishkek Steppe Community',e:'[B]'},teamF:{n:'Bishkek Steppe Community',e:'[B]'},nats:['Kyrgyzstan','Tajikistan']},
  {region:'oceania',teamM:{n:'Sydney Southern Cross Ice',e:'[A]'},teamF:{n:'Sydney Southern Cross Ice',e:'[A]'},nats:['Australia']},
  {region:'oceania',teamM:{n:'Melbourne Harbour Ice',e:'[A]'},teamF:{n:'Melbourne Harbour Ice',e:'[A]'},nats:['Australia']},
  {region:'oceania',teamM:{n:'Auckland Harbour Ice',e:'[A]'},teamF:{n:'Auckland Harbour Ice',e:'[A]'},nats:['New Zealand']},
  {region:'oceania',teamM:{n:'Suva Pacific Community',e:'[A]'},teamF:{n:'Suva Pacific Community',e:'[A]'},nats:['Fiji','Samoa','Tonga','Tuvalu','Vanuatu','Kiribati','Solomon Islands']},
  {region:'oceania',teamM:{n:'Port Moresby Highlands Ice',e:'[A]'},teamF:{n:'Port Moresby Highlands Ice',e:'[A]'},nats:['Papua New Guinea']},
  {region:'oceania',teamM:{n:'Sydney Southern Cross Ice',e:'[A]'},teamF:{n:'Sydney Southern Cross Ice',e:'[A]'},nats:['Marshall Islands','Micronesia','Nauru','Palau']}
];

var LOCAL_NAT_TO_REGION = {};
var LOCAL_NAT_HOME_TEAM = {};
var LOCAL_TEAM_TO_REGION = {};

/** Nations with established junior/pro paths — no LHL home club or circuit entry. */
var LOCAL_BLOCKED_HOCKEY_NATS={
  'Canada':1,'United States':1,
  'Sweden':1,'Finland':1,'Norway':1,'Denmark':1,'Iceland':1,
  'Russia':1
};

/** Extra circuit clubs (also registered from LOCAL_HOME_ZONES at init). */
var LOCAL_EXTRA_TEAM_DEFS=[
  {region:'central_europe', teamM:{n:'Budapest Danube Community',e:'[P]'}, teamF:{n:'Budapest Danube Community',e:'[P]'}},
  {region:'central_europe', teamM:{n:'Prague Bohemia Community',e:'[P]'}, teamF:{n:'Prague Bohemia Community',e:'[P]'}},
  {region:'western_europe', teamM:{n:'Berlin Spree Community',e:'[F]'}, teamF:{n:'Berlin Spree Community',e:'[F]'}},
  {region:'western_europe', teamM:{n:'Milan Alps Community',e:'[F]'}, teamF:{n:'Milan Alps Community',e:'[F]'}},
  {region:'western_europe', teamM:{n:'Amsterdam Canal Ice',e:'[F]'}, teamF:{n:'Amsterdam Canal Ice',e:'[F]'}},
  {region:'iberia', teamM:{n:'Lisbon Atlantic Community',e:'[I]'}, teamF:{n:'Lisbon Atlantic Community',e:'[I]'}},
  {region:'iberia', teamM:{n:'Barcelona Mediterranean Ice',e:'[I]'}, teamF:{n:'Barcelona Mediterranean Ice',e:'[I]'}},
  {region:'balkans', teamM:{n:'Bucharest Carpathian Ice',e:'[B]'}, teamF:{n:'Bucharest Carpathian Ice',e:'[B]'}},
  {region:'balkans', teamM:{n:'Split Adriatic Community',e:'[B]'}, teamF:{n:'Split Adriatic Community',e:'[B]'}},
  {region:'balkans', teamM:{n:'Athens Aegean Community',e:'[B]'}, teamF:{n:'Athens Aegean Community',e:'[B]'}},
  {region:'baltic_caucasus', teamM:{n:'Riga Baltic Community',e:'[K]'}, teamF:{n:'Riga Baltic Community',e:'[K]'}},
  {region:'baltic_caucasus', teamM:{n:'Tbilisi Caucasus Ice',e:'[K]'}, teamF:{n:'Tbilisi Caucasus Ice',e:'[K]'}},
  {region:'oceania', teamM:{n:'Melbourne Harbour Ice',e:'[A]'}, teamF:{n:'Melbourne Harbour Ice',e:'[A]'}},
  {region:'oceania', teamM:{n:'Auckland Harbour Ice',e:'[A]'}, teamF:{n:'Auckland Harbour Ice',e:'[A]'}},
  {region:'oceania', teamM:{n:'Suva Pacific Community',e:'[A]'}, teamF:{n:'Suva Pacific Community',e:'[A]'}},
  {region:'oceania', teamM:{n:'Port Moresby Highlands Ice',e:'[A]'}, teamF:{n:'Port Moresby Highlands Ice',e:'[A]'}},
  {region:'south_america', teamM:{n:'São Paulo Tropical Ice',e:'[A]'}, teamF:{n:'São Paulo Tropical Ice',e:'[A]'}},
  {region:'south_america', teamM:{n:'Lima Andes Community',e:'[A]'}, teamF:{n:'Lima Andes Community',e:'[A]'}},
  {region:'south_america', teamM:{n:'Bogotá Highland Ice',e:'[A]'}, teamF:{n:'Bogotá Highland Ice',e:'[A]'}},
  {region:'south_america', teamM:{n:'Santiago Andes Community',e:'[A]'}, teamF:{n:'Santiago Andes Community',e:'[A]'}},
  {region:'mexico_central', teamM:{n:'San José Central Ice',e:'[M]'}, teamF:{n:'San José Central Ice',e:'[M]'}},
  {region:'mexico_central', teamM:{n:'Monterrey Northern Ice',e:'[M]'}, teamF:{n:'Monterrey Northern Ice',e:'[M]'}},
  {region:'mexico_central', teamM:{n:'Panama Canal Community',e:'[M]'}, teamF:{n:'Panama Canal Community',e:'[M]'}},
  {region:'southern_africa', teamM:{n:'Johannesburg Ice Works',e:'[C]'}, teamF:{n:'Johannesburg Ice Works',e:'[C]'}},
  {region:'southern_africa', teamM:{n:'Maputo Channel Ice',e:'[C]'}, teamF:{n:'Maputo Channel Ice',e:'[C]'}},
  {region:'uk_ireland', teamM:{n:'Dublin Emerald Community',e:'[U]'}, teamF:{n:'Dublin Emerald Community',e:'[U]'}},
  {region:'middle_east', teamM:{n:'Riyadh Desert Ice',e:'[D]'}, teamF:{n:'Riyadh Desert Ice',e:'[D]'}},
  {region:'middle_east', teamM:{n:'Doha Gulf Community',e:'[D]'}, teamF:{n:'Doha Gulf Community',e:'[D]'}},
  {region:'middle_east', teamM:{n:'Muscat Gulf Community',e:'[D]'}, teamF:{n:'Muscat Gulf Community',e:'[D]'}},
  {region:'middle_east', teamM:{n:'Istanbul Bosphorus Community',e:'[D]'}, teamF:{n:'Istanbul Bosphorus Community',e:'[D]'}},
  {region:'middle_east', teamM:{n:'Tehran Community Ice',e:'[D]'}, teamF:{n:'Tehran Community Ice',e:'[D]'}},
  {region:'middle_east', teamM:{n:'Amman Community Ice',e:'[D]'}, teamF:{n:'Amman Community Ice',e:'[D]'}},
  {region:'southeast_asia', teamM:{n:'Manila Coral Ice',e:'[T]'}, teamF:{n:'Manila Coral Ice',e:'[T]'}},
  {region:'southeast_asia', teamM:{n:'Jakarta Archipelago Ice',e:'[T]'}, teamF:{n:'Jakarta Archipelago Ice',e:'[T]'}},
  {region:'southeast_asia', teamM:{n:'Ho Chi Minh Delta Ice',e:'[T]'}, teamF:{n:'Ho Chi Minh Delta Ice',e:'[T]'}},
  {region:'southeast_asia', teamM:{n:'Hanoi Red River Ice',e:'[T]'}, teamF:{n:'Hanoi Red River Ice',e:'[T]'}},
  {region:'southeast_asia', teamM:{n:'Kuala Lumpur Community',e:'[T]'}, teamF:{n:'Kuala Lumpur Community',e:'[T]'}},
  {region:'south_asia', teamM:{n:'Karachi Community Ice',e:'[I]'}, teamF:{n:'Karachi Community Ice',e:'[I]'}},
  {region:'south_asia', teamM:{n:'Colombo Island Ice',e:'[I]'}, teamF:{n:'Colombo Island Ice',e:'[I]'}},
  {region:'south_asia', teamM:{n:'Dhaka Delta Community',e:'[I]'}, teamF:{n:'Dhaka Delta Community',e:'[I]'}},
  {region:'caribbean', teamM:{n:'Kingston Island Ice',e:'[R]'}, teamF:{n:'Kingston Island Ice',e:'[R]'}},
  {region:'caribbean', teamM:{n:'Port of Spain Carnival Ice',e:'[R]'}, teamF:{n:'Port of Spain Carnival Ice',e:'[R]'}},
  {region:'north_africa', teamM:{n:'Casablanca Atlas Ice',e:'[E]'}, teamF:{n:'Casablanca Atlas Ice',e:'[E]'}},
  {region:'north_africa', teamM:{n:'Tunis Mediterranean Ice',e:'[E]'}, teamF:{n:'Tunis Mediterranean Ice',e:'[E]'}},
  {region:'west_africa', teamM:{n:'Accra Community Ice',e:'[L]'}, teamF:{n:'Accra Community Ice',e:'[L]'}},
  {region:'west_africa', teamM:{n:'Abidjan Lagoon Ice',e:'[L]'}, teamF:{n:'Abidjan Lagoon Ice',e:'[L]'}},
  {region:'west_africa', teamM:{n:'Dakar Coastal Ice',e:'[L]'}, teamF:{n:'Dakar Coastal Ice',e:'[L]'}},
  {region:'east_africa', teamM:{n:'Addis Highland Ice',e:'[K]'}, teamF:{n:'Addis Highland Ice',e:'[K]'}},
  {region:'central_africa', teamM:{n:'Douala River Community',e:'[K]'}, teamF:{n:'Douala River Community',e:'[K]'}},
  {region:'east_asia', teamM:{n:'Taipei Community Ice',e:'[S]'}, teamF:{n:'Taipei Community Ice',e:'[S]'}},
  {region:'east_asia', teamM:{n:'Tokyo Community Ice',e:'[S]'}, teamF:{n:'Tokyo Community Ice',e:'[S]'}},
  {region:'east_asia', teamM:{n:'Shanghai Community Ice',e:'[S]'}, teamF:{n:'Shanghai Community Ice',e:'[S]'}},
  {region:'central_asia', teamM:{n:'Almaty Steppe Community',e:'[B]'}, teamF:{n:'Almaty Steppe Community',e:'[B]'}},
  {region:'central_asia', teamM:{n:'Tashkent Silk Route Ice',e:'[B]'}, teamF:{n:'Tashkent Silk Route Ice',e:'[B]'}}
];

/** Regional defaults when a nation is missing from LOCAL_HOME_ZONES. */
var LOCAL_REGION_DEFS=[
  {id:'mexico_central', teamM:{n:'Mexico City Aztec Ice',e:'[M]'}, teamF:{n:'Mexico City Aztec Ice',e:'[M]'}},
  {id:'caribbean', teamM:{n:'Santo Domingo Reef Ice',e:'[R]'}, teamF:{n:'Santo Domingo Reef Ice',e:'[R]'}},
  {id:'south_america', teamM:{n:'Buenos Aires Pampas Ice',e:'[A]'}, teamF:{n:'Buenos Aires Pampas Ice',e:'[A]'}},
  {id:'uk_ireland', teamM:{n:'Manchester Thames Ice',e:'[U]'}, teamF:{n:'Manchester Thames Ice',e:'[U]'}},
  {id:'western_europe', teamM:{n:'Paris Seine Community',e:'[F]'}, teamF:{n:'Paris Seine Community',e:'[F]'}},
  {id:'iberia', teamM:{n:'Madrid Iberia Community',e:'[I]'}, teamF:{n:'Madrid Iberia Community',e:'[I]'}},
  {id:'central_europe', teamM:{n:'Warsaw Vistula Community',e:'[P]'}, teamF:{n:'Warsaw Vistula Community',e:'[P]'}},
  {id:'balkans', teamM:{n:'Belgrade Danube Ice',e:'[B]'}, teamF:{n:'Belgrade Danube Ice',e:'[B]'}},
  {id:'baltic_caucasus', teamM:{n:'Kyiv Dnipro Community',e:'[K]'}, teamF:{n:'Kyiv Dnipro Community',e:'[K]'}},
  {id:'middle_east', teamM:{n:'Dubai Sand Ice',e:'[D]'}, teamF:{n:'Dubai Sand Ice',e:'[D]'}},
  {id:'north_africa', teamM:{n:'Cairo Desert Ice',e:'[E]'}, teamF:{n:'Cairo Desert Ice',e:'[E]'}},
  {id:'west_africa', teamM:{n:'Lagos Community Ice',e:'[L]'}, teamF:{n:'Lagos Community Ice',e:'[L]'}},
  {id:'central_africa', teamM:{n:'Kinshasa River Ice',e:'[K]'}, teamF:{n:'Kinshasa River Ice',e:'[K]'}},
  {id:'east_africa', teamM:{n:'Nairobi Savanna Ice',e:'[K]'}, teamF:{n:'Nairobi Savanna Ice',e:'[K]'}},
  {id:'southern_africa', teamM:{n:'Cape Town Ice Union',e:'[C]'}, teamF:{n:'Cape Town Ice Union',e:'[C]'}},
  {id:'south_asia', teamM:{n:'Delhi Himalayan Ice',e:'[I]'}, teamF:{n:'Delhi Himalayan Ice',e:'[I]'}},
  {id:'southeast_asia', teamM:{n:'Bangkok Mekong Ice',e:'[T]'}, teamF:{n:'Bangkok Mekong Ice',e:'[T]'}},
  {id:'east_asia', teamM:{n:'Seoul Community Ice',e:'[S]'}, teamF:{n:'Seoul Community Ice',e:'[S]'}},
  {id:'central_asia', teamM:{n:'Bishkek Steppe Community',e:'[B]'}, teamF:{n:'Bishkek Steppe Community',e:'[B]'}},
  {id:'oceania', teamM:{n:'Sydney Southern Cross Ice',e:'[A]'}, teamF:{n:'Sydney Southern Cross Ice',e:'[A]'}}
];

var LOCAL_LHL_EVENT_TYPES=[
  {id:'development_camp', label:'Development Camp', icon:'[C]', desc:'On-ice testing, systems walk-throughs, and coach evaluations — no standings on the line.'},
  {id:'public_skate', label:'Community Public Skate', icon:'[S]', desc:'Help at the rink — newcomers, families, and growing the game locally.'},
  {id:'team_practice', label:'Team Practice Session', icon:'[P]', desc:'Structured drills with your community squad.'},
  {id:'skills_clinic', label:'Skills Clinic', icon:'[K]', desc:'Small-area skill work — edges, hands, and habits.'},
  {id:'try_hockey', label:'Try Hockey For Free Day', icon:'[T]', desc:'Volunteer shift — lend gear and teach first strides.'},
  {id:'dryland', label:'Dryland Training', icon:'[D]', desc:'Off-ice conditioning and mobility with the team.'},
  {id:'film_study', label:'Film Room Session', icon:'[F]', desc:'Break down clips — hockey IQ reps without a scoreboard.'},
  {id:'fundraising', label:'Rink Fundraiser Night', icon:'[R]', desc:'Community night to support local ice time.'},
  {id:'scrimmage', label:'Internal Scrimmage', icon:'[X]', desc:'Controlled scrimmage — lighter than a league game.'}
];

function isLocalLeague(leagueKey){
  return leagueKey==='LHCM'||leagueKey==='LHLF';
}

function getLocalLeagueKey(gender){
  return gender==='F'?'LHLF':'LHCM';
}

function getLocalAdvanceMinOvr(){
  return 58;
}

function isNatEligibleForLocalHockey(nat){
  var n=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat):String(nat||'');
  return !LOCAL_BLOCKED_HOCKEY_NATS[n];
}

function getLocalBlockedNatHint(nat){
  var n=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat):String(nat||'');
  if(n==='Canada'||n==='United States') return 'Canada and the U.S. have full junior paths — start in OJL, QMJL, WJL, or USJL.';
  if(n==='Russia') return 'Russia uses ARHL/ARJC — no LHL community circuit.';
  if(LOCAL_BLOCKED_HOCKEY_NATS[n]) return 'Established hockey nation — use NEJC or your regional junior/overseas path instead of LHL.';
  return '';
}

function qualifiesForLocalTeam(nat){
  return isNatEligibleForLocalHockey(nat);
}

function getLocalLeagueEntryHint(nat){
  if(!isNatEligibleForLocalHockey(nat)) return getLocalBlockedNatHint(nat);
  return 'Open entry — lowest level, all skill levels welcome. Strong dev focus. '+getLhlScoutingPathHint(nat);
}

function isEliteHockeyNation(nat){
  return !isNatEligibleForLocalHockey(nat);
}

/** Growing-market nations must log LHL tape before junior/college scouts notice them. */
function requiresLhlBeforeScouts(nat){
  return isNatEligibleForLocalHockey(nat);
}

function countCompletedLhlSeasons(playerState){
  var g=playerState||G;
  if(!g) return 0;
  if((g.lhlSeasonsCompleted||0)>=1) return g.lhlSeasonsCompleted;
  if(!g.seasonLog||!g.seasonLog.length) return 0;
  var c=0, i, s;
  for(i=0;i<g.seasonLog.length;i++){
    s=g.seasonLog[i];
    if(!s) continue;
    if(s.leagueKey==='LHCM'||s.leagueKey==='LHLF'){ c++; continue; }
    if(s.league==='LHL'||(s.league&&String(s.league).indexOf('LHL')>=0)) c++;
  }
  return c;
}

function hasLhlScoutingCredential(playerState){
  var g=playerState||G;
  if(!g) return false;
  if(!requiresLhlBeforeScouts(g.nat)) return true;
  return countCompletedLhlSeasons(g)>=1;
}

function syncLhlScoutingCredentialFromLog(){
  if(!G) return;
  var fromLog=countCompletedLhlSeasons(G);
  if(fromLog>(G.lhlSeasonsCompleted||0)) G.lhlSeasonsCompleted=fromLog;
}

function isEstablishedLeagueBlockedForNonHockeyNat(leagueKey, nat){
  if(!requiresLhlBeforeScouts(nat)) return false;
  var L=typeof LEAGUES!=='undefined'?LEAGUES[leagueKey]:null;
  if(!L||L.tier==='local') return false;
  return true;
}

function getNonHockeyStartLeagueBlockReason(nat){
  var n=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat):String(nat||'');
  return 'From '+n+', start in LHL — scouts need at least one full community season on tape before junior or college circuits will notice you.';
}

function getLhlScoutingPathHint(nat){
  if(!requiresLhlBeforeScouts(nat)) return '';
  return 'Scouts abroad need at least one full LHL season on film before junior or college offers.';
}

function filterLeaguesForScoutingCredential(leagueKeys){
  if(!leagueKeys||!leagueKeys.length) return leagueKeys||[];
  if(!G||hasLhlScoutingCredential(G)) return leagueKeys;
  if(!requiresLhlBeforeScouts(G.nat)) return leagueKeys;
  return leagueKeys.filter(function(k){
    var L=LEAGUES[k];
    return L&&L.tier==='local';
  });
}

function recordLhlSeasonIfComplete(){
  if(!G||!G.league||G.league.tier!=='local') return;
  if(G._lhlSeasonRecordedFor===G.season) return;
  G._lhlSeasonRecordedFor=G.season;
  G.lhlSeasonsCompleted=(G.lhlSeasonsCompleted||0)+1;
  if(G.lhlSeasonsCompleted===1&&requiresLhlBeforeScouts(G.nat)){
    addNews('SCOUT TAPE IN: One full LHL season on film — junior and college programs abroad are starting to watch.','good');
  }
}

function qualifiesForLocalAdvancePath(){
  if(!G||!G.league||G.league.tier!=='local') return false;
  if(requiresLhlBeforeScouts(G.nat)&&!hasLhlScoutingCredential(G)) return false;
  var o=typeof ovr==='function'?ovr(G.attrs,G.pos):0;
  return (G.season>=1&&o>=getLocalAdvanceMinOvr())||G.season>=2;
}

function getLocalAdvanceLeagueOptions(){
  if(!G) return [];
  if(G.gender==='F') return ['CWHL','USWDL','EWJC','AWJC','NWCHA'];
  return ['OJL','QMJL','WJL','USJL','NEJC','CEJC','ARJC','NCHA'];
}

function buildLocalNatRegionMap(){
  var map={}, i, j, z;
  for(i=0;i<LOCAL_HOME_ZONES.length;i++){
    z=LOCAL_HOME_ZONES[i];
    for(j=0;j<z.nats.length;j++) map[z.nats[j]]=z.region;
  }
  if(typeof NATS!=='undefined'){
    for(i=0;i<NATS.length;i++){
      var nn=NATS[i].n;
      if(!map[nn]&&!LOCAL_BLOCKED_HOCKEY_NATS[nn]) map[nn]='oceania';
    }
  }
  return map;
}

function buildLocalNatHomeTeamMap(){
  var map={}, i, j, z;
  for(i=0;i<LOCAL_HOME_ZONES.length;i++){
    z=LOCAL_HOME_ZONES[i];
    for(j=0;j<z.nats.length;j++) map[z.nats[j]]=z.teamM.n;
  }
  return map;
}

function findLocalTeamByName(teamName, gender){
  var lk=gender==='F'?'LHLF':'LHCM';
  var teams=typeof TEAMS!=='undefined'?(TEAMS[lk]||[]):[];
  var i;
  for(i=0;i<teams.length;i++){
    if(teams[i].n===teamName) return teams[i];
  }
  return null;
}

function getLocalHomeZoneTeamDef(nat, gender){
  var n=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat):String(nat||'');
  if(!LOCAL_NAT_HOME_TEAM||!Object.keys(LOCAL_NAT_HOME_TEAM).length) LOCAL_NAT_HOME_TEAM=buildLocalNatHomeTeamMap();
  var teamName=LOCAL_NAT_HOME_TEAM[n];
  if(!teamName) return null;
  var i, z;
  for(i=0;i<LOCAL_HOME_ZONES.length;i++){
    z=LOCAL_HOME_ZONES[i];
    if(z.teamM.n===teamName) return gender==='F'?z.teamF:z.teamM;
  }
  return null;
}

function getLocalRegionForNat(nat){
  var n=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat):String(nat||'');
  if(!LOCAL_NAT_TO_REGION||!Object.keys(LOCAL_NAT_TO_REGION).length) LOCAL_NAT_TO_REGION=buildLocalNatRegionMap();
  return LOCAL_NAT_TO_REGION[n]||'oceania';
}

function getLocalRegionDef(regionId){
  var i;
  for(i=0;i<LOCAL_REGION_DEFS.length;i++){
    if(LOCAL_REGION_DEFS[i].id===regionId) return LOCAL_REGION_DEFS[i];
  }
  return LOCAL_REGION_DEFS[LOCAL_REGION_DEFS.length-1];
}

function getLocalTeamForNat(nat, gender){
  if(!isNatEligibleForLocalHockey(nat)) return null;
  var fromZone=getLocalHomeZoneTeamDef(nat, gender);
  if(fromZone){
    var found=findLocalTeamByName(fromZone.n, gender);
    if(found) return found;
    return fromZone;
  }
  var def=getLocalRegionDef(getLocalRegionForNat(nat));
  return gender==='F'?def.teamF:def.teamM;
}

function getLocalRegionNatsForTeam(teamName){
  var tn=String(teamName||'');
  var nats=[], i, j, z;
  for(i=0;i<LOCAL_HOME_ZONES.length;i++){
    z=LOCAL_HOME_ZONES[i];
    if(z.teamM.n===tn||z.teamF.n===tn){
      for(j=0;j<z.nats.length;j++){
        if(nats.indexOf(z.nats[j])<0) nats.push(z.nats[j]);
      }
    }
  }
  if(nats.length) return nats;
  var rid=LOCAL_TEAM_TO_REGION[tn];
  if(!rid) return null;
  for(i=0;i<LOCAL_HOME_ZONES.length;i++){
    z=LOCAL_HOME_ZONES[i];
    if(z.region===rid){
      for(j=0;j<z.nats.length;j++){
        if(nats.indexOf(z.nats[j])<0) nats.push(z.nats[j]);
      }
    }
  }
  return nats.length?nats:null;
}

function isLocalScheduleEvent(slot){
  return !!(slot&&slot.eventType);
}

function getLocalEventDef(eventType){
  var i;
  for(i=0;i<LOCAL_LHL_EVENT_TYPES.length;i++){
    if(LOCAL_LHL_EVENT_TYPES[i].id===eventType) return LOCAL_LHL_EVENT_TYPES[i];
  }
  return null;
}

function makeLocalEventSlot(eventType){
  var def=getLocalEventDef(eventType);
  if(!def) def=LOCAL_LHL_EVENT_TYPES[0];
  return {eventType:def.id, label:def.label, desc:def.desc, e:def.icon, n:def.label};
}

function countCompletedLocalGames(){
  if(!G||!G.allOpponents||!G.allOpponents.length) return 0;
  var perWeek=(G.league&&G.league.gamesPerWeek)||2;
  var end=Math.min(G.allOpponents.length,((G.week||1)-1)*perWeek+(G.weekGames||0));
  var n=0, i;
  for(i=0;i<end;i++){
    if(!isLocalScheduleEvent(G.allOpponents[i])) n++;
  }
  return n;
}

function countCompletedLocalScheduleSlots(){
  if(!G||!G.allOpponents||!G.allOpponents.length) return 0;
  var perWeek=(G.league&&G.league.gamesPerWeek)||2;
  return Math.min(G.allOpponents.length, Math.max(0, ((G.week||1)-1)*perWeek+(G.weekGames||0)));
}

/** Regular-season calendar finished (handles 12-slot legacy saves and 18-slot current). */
function isLocalScheduleComplete(lk){
  if(!G||!G.allOpponents||!G.allOpponents.length) return false;
  var schedLen=G.allOpponents.length;
  var target=typeof getLocalSeasonScheduleSlots==='function'?getLocalSeasonScheduleSlots(lk||G.leagueKey):schedLen;
  target=Math.min(target, schedLen);
  return countCompletedLocalScheduleSlots()>=target;
}

function reconcileLeagueFromRegistry(){
  if(typeof G==='undefined'||!G||!G.leagueKey||typeof LEAGUES==='undefined') return;
  if(LEAGUES[G.leagueKey]) G.league=LEAGUES[G.leagueKey];
}

/** Restore G.league from registry when saves omit tier (breaks isLocal / schedule checks). */
function ensureLeagueContext(){
  if(typeof reconcileLeagueFromRegistry==='function') reconcileLeagueFromRegistry();
  if(typeof G!=='undefined'&&G&&G.leagueKey&&!G.league&&typeof LEAGUES!=='undefined'&&LEAGUES[G.leagueKey]){
    G.league=LEAGUES[G.leagueKey];
  }
}

/** Force LHL showcase to finish and enter offseason (escape hatch + auto-finish helper). */
function skipLocalShowcaseToOffseason(){
  if(!G||!(typeof isLocalLeague==='function'&&isLocalLeague(G.leagueKey))) return;
  if(typeof ensureLeagueContext==='function') ensureLeagueContext();
  if(G._playoffCtx&&G._playoffCtx.active){
    G._playoffCtx.eliminated=true;
    if(typeof fastSimRemainingPlayoffBracket==='function') fastSimRemainingPlayoffBracket();
  }
  if(!(G._playoffCtx&&G._playoffCtx.active)){
    if(typeof finishSeasonToOffseason==='function') finishSeasonToOffseason();
    else if(typeof goToOffseason==='function') goToOffseason();
  }
  G._inOffseason=true;
  G._playoffCtx=null;
  if(typeof continueOffseasonAfterDraft==='function'){
    try{ continueOffseasonAfterDraft(); }catch(eCont){}
  }
  try{show('s-offseason');}catch(eSkip){}
}

/** League games scheduled in a given week (1-based) — ignores event slots. */
function getLocalGamesForWeek(weekNum){
  if(!G||!G.allOpponents||!G.allOpponents.length){
    var lk=G&&G.leagueKey;
    if(lk&&typeof getLocalLeagueGameCount==='function'&&typeof getLocalSeasonWeekCount==='function'){
      var wks=getLocalSeasonWeekCount(lk)||9;
      return Math.max(1, Math.round(getLocalLeagueGameCount(lk)/wks));
    }
    return 1;
  }
  var perWeek=(G.league&&G.league.gamesPerWeek)||2;
  var weekStart=(Math.max(1, weekNum)-1)*perWeek;
  var n=0, i;
  for(i=weekStart;i<weekStart+perWeek&&i<G.allOpponents.length;i++){
    if(!isLocalScheduleEvent(G.allOpponents[i])) n++;
  }
  return n;
}

function countLocalGamesThroughWeek(weekNum){
  if(!G||!G.allOpponents||!G.allOpponents.length) return 0;
  var perWeek=(G.league&&G.league.gamesPerWeek)||2;
  var end=Math.min(G.allOpponents.length, Math.max(0, weekNum)*perWeek);
  var n=0, i;
  for(i=0;i<end;i++){
    if(!isLocalScheduleEvent(G.allOpponents[i])) n++;
  }
  return n;
}

function getLocalLeagueGameCount(lk){
  return (LEAGUES[lk]&&LEAGUES[lk].games)||12;
}

function getLocalLeagueEventCount(lk){
  return (LEAGUES[lk]&&LEAGUES[lk].localEvents)||6;
}

function getLocalSeasonScheduleSlots(lk){
  return getLocalLeagueGameCount(lk)+getLocalLeagueEventCount(lk);
}

function getLocalSeasonWeekCount(lk){
  var perWeek=(LEAGUES[lk]&&LEAGUES[lk].gamesPerWeek)||2;
  return Math.ceil(getLocalSeasonScheduleSlots(lk)/perWeek);
}

/** 12 league games + 6 community events across 9 weeks (2 slots/week). */
function genLocalSeason(lk, myTeam){
  var teams=(TEAMS[lk]||[]).filter(function(t){return t.n!==myTeam.n;});
  if(!teams.length) teams=(TEAMS[lk]||[]).slice();
  var perWeek=(LEAGUES[lk]&&LEAGUES[lk].gamesPerWeek)||2;
  var gameCount=getLocalLeagueGameCount(lk);
  var eventCount=getLocalLeagueEventCount(lk);
  var totalSlots=getLocalSeasonScheduleSlots(lk);
  var weekPattern=[
    ['game','game'],
    ['game','event'],
    ['game','event'],
    ['game','game'],
    ['game','event'],
    ['game','event'],
    ['game','event'],
    ['game','game'],
    ['game','event']
  ];
  var eventPool=shuf(LOCAL_LHL_EVENT_TYPES.map(function(ev){return ev.id;}));
  var eventIdx=0, slots=[], w, i, row, kind, oppPick, evId;
  var seasonN=(typeof G!=='undefined'&&G)?(G.season||1):1;
  var gamesPlaced=0, eventsPlaced=0;
  for(w=0;w<weekPattern.length&&slots.length<totalSlots;w++){
    row=weekPattern[w];
    for(i=0;i<perWeek&&slots.length<totalSlots;i++){
      if(seasonN===1&&w===0&&i===0){
        slots.push(makeLocalEventSlot('development_camp'));
        eventsPlaced++;
        continue;
      }
      kind=row[i]||'game';
      if(kind==='event'&&eventsPlaced<eventCount){
        evId=eventPool[eventIdx%eventPool.length];
        eventIdx++;
        slots.push(makeLocalEventSlot(evId));
        eventsPlaced++;
      } else if(gamesPlaced<gameCount){
        oppPick=teams[ri(0,teams.length-1)];
        slots.push({n:oppPick.n,e:oppPick.e||'[-]'});
        gamesPlaced++;
      } else if(eventsPlaced<eventCount){
        evId=eventPool[eventIdx%eventPool.length];
        eventIdx++;
        slots.push(makeLocalEventSlot(evId));
        eventsPlaced++;
      }
    }
  }
  while(gamesPlaced<gameCount){
    oppPick=teams[ri(0,teams.length-1)];
    slots.push({n:oppPick.n,e:oppPick.e||'[-]'});
    gamesPlaced++;
  }
  while(eventsPlaced<eventCount){
    evId=eventPool[eventIdx%eventPool.length];
    eventIdx++;
    slots.push(makeLocalEventSlot(evId));
    eventsPlaced++;
  }
  return slots;
}

function applyLocalEventAttrBump(count, strength){
  if(!G||(G.age||16)>=26) return;
  var dev=(G.league&&G.league.dev)||1.45;
  var pDev=typeof getPotentialDevMult==='function'?getPotentialDevMult(G.potential||'support'):1;
  var pool=G.pos!=='G'&&typeof SKATER_SUB_ATTR_KEYS!=='undefined'?SKATER_SUB_ATTR_KEYS.slice():(ATTRS[G.pos]||[]);
  if(!pool.length) return;
  var picks=shuf(pool.slice()).slice(0,Math.max(1,count));
  var capAge=typeof getAttrCapForAge==='function'?getAttrCapForAge(G.age||16):99;
  var amin=typeof G._attrClampMin==='number'?G._attrClampMin:40;
  var lkDev=G.leagueKey||'', tnDev=G.team&&G.team.n||'';
  for(var pi=0;pi<picks.length;pi++){
    var a=picks[pi];
    var leagueMult=typeof getLeagueAttrDevMultiplier==='function'?getLeagueAttrDevMultiplier(lkDev, tnDev, a):1;
    G.attrs[a]=cl(G.attrs[a]+rd(0.4,1.4)*dev*pDev*strength*leagueMult,amin,capAge);
  }
  if(G.pos!=='G'&&typeof syncLegacySkaterAttrsFromCategories==='function') syncLegacySkaterAttrsFromCategories(G.attrs);
}

function applyLocalScheduleEventEffects(eventType, simulated){
  var mult=simulated?0.6:1;
  var xpBase=14, moraleBase=4;
  switch(eventType){
    case 'development_camp':
      applyLocalEventAttrBump(3,1.9*mult);
      xpBase=32; moraleBase=7;
      break;
    case 'public_skate':
      applyLocalEventAttrBump(1,0.7*mult);
      xpBase=16; moraleBase=9;
      break;
    case 'team_practice':
      applyLocalEventAttrBump(2,1.35*mult);
      xpBase=22; moraleBase=5;
      break;
    case 'skills_clinic':
      applyLocalEventAttrBump(2,1.55*mult);
      xpBase=24; moraleBase=4;
      break;
    case 'try_hockey':
      applyLocalEventAttrBump(1,0.65*mult);
      xpBase=14; moraleBase=10;
      break;
    case 'dryland':
      if((G.age||16)<26&&G.attrs.physical) G.attrs.physical=cl(G.attrs.physical+Math.max(0.4,0.9*mult),40,99);
      G.stamina=cl((G.stamina||50)+Math.round(8*mult),0,100);
      xpBase=18; moraleBase=3;
      break;
    case 'film_study':
      applyLocalEventAttrBump(1,1.1*mult);
      xpBase=15; moraleBase=2;
      break;
    case 'fundraising':
      xpBase=12; moraleBase=8;
      break;
    case 'scrimmage':
      applyLocalEventAttrBump(2,1.25*mult);
      xpBase=20; moraleBase=5;
      break;
    default:
      applyLocalEventAttrBump(1,0.8*mult);
  }
  G.xp=(G.xp||0)+Math.round(xpBase*mult*(typeof getPotentialXpMult==='function'?getPotentialXpMult(G.potential||'support'):1));
  G.morale=cl((G.morale||50)+Math.round(moraleBase*mult),0,100);
  if(typeof updatePlayerConditioning==='function') updatePlayerConditioning({offseasonBoost:Math.round(3*mult)});
}

function getLocalEventNewsLine(slot, simulated){
  var tag=simulated?' [SIMULATED]':'';
  var lines={
    development_camp:G.team.n+' development camp — systems, testing, and coach feedback'+tag+'.',
    public_skate:'COMMUNITY NIGHT: '+G.first+' '+G.last+' helps run a public skate at the home rink'+tag+'.',
    team_practice:G.team.n+' full-team practice — reps without a scoreboard'+tag+'.',
    skills_clinic:'SKILLS CLINIC: '+G.first+' '+G.last+' works small-area detail with coaches'+tag+'.',
    try_hockey:'TRY HOCKEY DAY: '+G.last+' volunteers — first-time skaters on the ice'+tag+'.',
    dryland:G.team.n+' dryland session — strength and mobility'+tag+'.',
    film_study:G.team.n+' film room — breaking down habits and reads'+tag+'.',
    fundraising:'FUNDRAISER: '+G.team.n+' hosts a rink fundraiser night'+tag+'.',
    scrimmage:G.team.n+' internal scrimmage — controlled run-through'+tag+'.'
  };
  return lines[slot.eventType]||(slot.label+' with '+G.team.n+tag+'.');
}

function completeLocalScheduleEvent(idx, simulated){
  if(!G||!(typeof isLocalLeague==='function'&&isLocalLeague(G.leagueKey))) return;
  if(typeof ensureLeagueContext==='function') ensureLeagueContext();
  if(idx!==G.weekGames){
    notify('FINISH SLOT '+(G.weekGames+1)+' ON THE SCHEDULE FIRST','gold');
    return;
  }
  var perWeek=(G.league.gamesPerWeek)||2;
  var weekStart=((G.week||1)-1)*perWeek;
  var slot=G.allOpponents[weekStart+idx];
  if(!slot||!isLocalScheduleEvent(slot)) return;
  G._curGameIdx=idx;
  applyLocalScheduleEventEffects(slot.eventType, !!simulated);
  addNews(getLocalEventNewsLine(slot, !!simulated), simulated?'neutral':'good');
  G.weekGames=(G.weekGames||0)+1;
  if(simulated) notify('EVENT SIMULATED','gold');
  else notify(slot.label.toUpperCase(),'green');
  if(typeof maybeEndRegularSeason==='function') maybeEndRegularSeason();
  if(typeof renderHub==='function') renderHub();
}

function runLocalScheduleEvent(idx){
  completeLocalScheduleEvent(idx, false);
}

function simLocalScheduleEvent(idx){
  completeLocalScheduleEvent(idx, true);
}

function applyLocalCommunitySeasonAwards(sorted){
  if(!G||!G.league||G.league.tier!='local') return;
  var st=sorted&&sorted.length?sorted:(G.standings||[]);
  var awards=[];
  if(G.gp>=10){
    awards.push({name:'Community Ironman',icon:'[I]',desc:G.gp+' league games logged with '+G.team.n});
  }
  if((G.morale||0)>=72){
    awards.push({name:'Fan Favorite',icon:'[F]',desc:'Locker room & rink-side goodwill all season'});
  }
  if(G.pos!=='G'&&(G.goals+G.assists)>=Math.max(3,Math.floor(G.gp*0.45))){
    awards.push({name:'Showcase Scorer',icon:'[S]',desc:'Production in a short community schedule'});
  }
  if(G.pos==='G'&&G.gp>=3){
    var sv=G.saves+(G.goalsAgainst||0)>0?G.saves/(G.saves+(G.goalsAgainst||0)):0;
    if(sv>=0.88) awards.push({name:'Rink Guardian',icon:'[G]',desc:'Steady net in community games'});
  }
  if(G.wonCup){
    awards.push({name:'Community Champion',icon:'[C]',desc:'Won the '+G.league.short+' showcase'});
  }
  for(var i=0;i<awards.length;i++){
    G.awards=G.awards||[];
    G.awards.push({name:awards[i].name,icon:awards[i].icon,desc:awards[i].desc,season:G.season});
    addNews('COMMUNITY AWARD: '+awards[i].name+' — '+awards[i].desc+'.','good');
  }
}

function buildLocalSeasonRecapHTML(sorted){
  var st=sorted&&sorted.length?sorted:(G.standings||[]);
  var rank=-1,i;
  for(i=0;i<st.length;i++){ if(st[i].isMe){ rank=i+1; break; } }
  var html='<div style="color:var(--green);margin-bottom:8px">COMMUNITY SEASON RECAP</div>';
  html+='<div style="margin-bottom:6px">'+escHtml(G.team.n)+' finished <b>'+(rank>0?'#'+rank:'—')+'</b> in the circuit with <b>'+(G.w||0)+'-'+(G.l||0)+'-'+(G.otl||0)+'</b> in league games.</div>';
  html+='<div style="color:var(--mut);font-size:13px">Short schedule focus: development reps, rink events, and growing the game locally — not a full pro calendar.</div>';
  return html;
}

function initLocalHockeyLeagues(){
  if(typeof LEAGUES==='undefined'||typeof TEAMS==='undefined') return;

  LEAGUES.LHCM={
    name:'Local Hockey Community (Men)',
    short:'LHL',
    tier:'local',
    gender:'M',
    games:12,
    localEvents:6,
    gamesPerWeek:2,
    dev:1.45,
    salBase:0,
    desc:'Lowest-level community circuit — open to all skill levels, no tryout bar. 12 league games plus community events (practices, clinics, rink nights). Strong dev focus. Not available in Canada, the U.S., Nordics, or Russia (use junior paths there).'
  };
  LEAGUES.LHLF={
    name:'Local Hockey Community (Women)',
    short:'LHL',
    tier:'local',
    gender:'F',
    games:12,
    localEvents:6,
    gamesPerWeek:2,
    dev:1.45,
    salBase:0,
    desc:'Lowest-level community circuit — open to all skill levels, no tryout bar. 12 league games plus community events (practices, clinics, rink nights). Strong dev focus. Not available in Canada, the U.S., Nordics, or Russia (use junior paths there).'
  };

  var teamsM=[], teamsF=[], i, d, ex, z, seenM={}, seenF={};
  LOCAL_TEAM_TO_REGION={};
  function pushTeam(list, seen, team, regionId){
    if(!team||!team.n||seen[team.n]) return;
    seen[team.n]=1;
    list.push({n:team.n,e:team.e||'[-]'});
    LOCAL_TEAM_TO_REGION[team.n]=regionId;
  }
  for(i=0;i<LOCAL_REGION_DEFS.length;i++){
    d=LOCAL_REGION_DEFS[i];
    pushTeam(teamsM, seenM, d.teamM, d.id);
    pushTeam(teamsF, seenF, d.teamF, d.id);
  }
  for(i=0;i<LOCAL_HOME_ZONES.length;i++){
    z=LOCAL_HOME_ZONES[i];
    pushTeam(teamsM, seenM, z.teamM, z.region);
    pushTeam(teamsF, seenF, z.teamF, z.region);
  }
  for(i=0;i<LOCAL_EXTRA_TEAM_DEFS.length;i++){
    ex=LOCAL_EXTRA_TEAM_DEFS[i];
    pushTeam(teamsM, seenM, ex.teamM, ex.region);
    pushTeam(teamsF, seenF, ex.teamF, ex.region);
  }
  TEAMS.LHCM=teamsM;
  TEAMS.LHLF=teamsF;
  LOCAL_NAT_TO_REGION=buildLocalNatRegionMap();
  LOCAL_NAT_HOME_TEAM=buildLocalNatHomeTeamMap();

  if(typeof START_LEAGUES_M!=='undefined'&&START_LEAGUES_M.indexOf('LHCM')<0) START_LEAGUES_M.push('LHCM');
  if(typeof START_LEAGUES_F!=='undefined'&&START_LEAGUES_F.indexOf('LHLF')<0) START_LEAGUES_F.push('LHLF');
}

initLocalHockeyLeagues();
