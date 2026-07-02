/* breakaway — PROCEDURAL NAME GENERATOR */
// ============================================================
// Syllable-based names by culture — no fixed full-name lists
// ============================================================

function ngPick(arr){ return arr[ri(0,arr.length-1)]; }

function ngCap(s){
  if(!s) return '';
  return s.charAt(0).toUpperCase()+s.slice(1).toLowerCase();
}

function ngClean(s){
  if(!s) return '';
  s=String(s).replace(/[^a-zA-Z'\-\s]/g,'').replace(/\s+/g,' ').trim();
  if(s.length<2||s.length>18) return '';
  if(!/[aeiouy]/i.test(s)) return '';
  if(/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(s)) return '';
  if(/(.)\1{2,}/.test(s)) return '';
  return s;
}

function ngIsPlausibleName(n){
  if(!n||n.length<2||n.length>16) return false;
  var low=String(n).toLowerCase();
  var junk=['tybr','bran','quine','xim','ngu','zoya','kwa','jab','tyl','dyl','nath','bray','jes','marc','dev','quin','slgi','pwr','snp'];
  var i;
  for(i=0;i<junk.length;i++){
    if(low===junk[i]||low.indexOf(junk[i])===0&&low.length<6) return false;
  }
  return true;
}

/** Curated names loaded from name-pool-data.js (NG_REAL). */

function ngCanonicalCulture(c){
  if(c==='french') return 'franco';
  if(c==='arabic') return 'middleeastern';
  if(c==='latino') return 'latinamerican';
  if(c==='africa') return 'african';
  if(c==='european'||c==='germanic') return 'centraleuropean';
  if(c==='turkic') return 'middleeastern';
  return c;
}

function ngRealName(culture, gender, part){
  if(typeof NG_REAL==='undefined') return '';
  var c=NG_REAL[culture]||NG_REAL[ngCanonicalCulture(culture)];
  if(!c) return '';
  var g=gender==='F'?'F':'M';
  var pool=c[g]&&c[g][part];
  if(!pool||!pool.length) return '';
  return ngFinish(ngPick(pool));
}

function ngFinish(s){
  s=ngClean(s);
  return s?ngCap(s):'';
}

function ngJoin(parts){
  var out='', i;
  for(i=0;i<parts.length;i++) if(parts[i]) out+=parts[i];
  return ngFinish(out);
}

/* --- culture weights (diverse mix) --- */
var NG_CULTURES=['anglo','franco','centraleuropean','nordic','slavic','latin','latinamerican','middleeastern','southasia','eastasia','centralasian','berber','african'];

function ngPickCulture(){
  var w=[14,9,9,9,9,8,9,8,8,8,4,3,6];
  var roll=Math.random()*100, i, sum=0;
  for(i=0;i<NG_CULTURES.length;i++){
    sum+=w[i];
    if(roll<sum) return NG_CULTURES[i];
  }
  return 'anglo';
}

function ngPickCultureForLeague(leagueKey){
  var lk=String(leagueKey||'');
  var L=typeof LEAGUES!=='undefined'&&LEAGUES[lk]?LEAGUES[lk]:null;
  var tier=L?L.tier:'junior';
  var roll=Math.random()*100;
  if(lk==='QMJL'||lk==='NWCHA') return roll<72?'franco':'anglo';
  if(lk==='OJL'||lk==='WJL'||lk==='USJL'||lk==='NCHA'||lk==='NAML'||lk==='PHL'||lk==='CWHL'||lk==='USWDL'||lk==='PWL'||lk==='PWDL'){
    if(roll<52) return 'anglo';
    if(roll<72) return 'franco';
    if(roll<82) return 'nordic';
    if(roll<90) return 'slavic';
    return ngPickCulture();
  }
  if(lk==='NEHL'||lk==='NEJC'||lk==='SDHL'||lk==='EWJC') return roll<78?'nordic':'anglo';
  if(lk==='FHL'||lk==='FWHL') return roll<88?'nordic':(roll<95?'franco':'anglo');
  if(lk==='CEHL'||lk==='CEJC') return roll<55?'centraleuropean':(roll<78?'franco':'anglo');
  if(lk==='ARHL'||lk==='ARJC'||lk==='AWHL'||lk==='AWJC') return roll<48?'slavic':(roll<72?'nordic':'anglo');
  if(tier==='euro'||tier==='asia') return roll<40?'nordic':(roll<65?'slavic':'anglo');
  return ngPickCulture();
}

function ngPickFromWeighted(pool, weights){
  if(!pool||!pool.length) return 'anglo';
  var sum=0, i, roll;
  for(i=0;i<weights.length;i++) sum+=(weights[i]||0);
  if(sum<=0) return pool[ri(0,pool.length-1)];
  roll=Math.random()*sum;
  sum=0;
  for(i=0;i<pool.length;i++){
    sum+=(weights[i]||0);
    if(roll<sum) return pool[i];
  }
  return pool[pool.length-1];
}

/** Heritage pools — nationality ≠ ethnicity; passport country still has a likely diaspora mix. */
function ngHeritageForNat(nat){
  var n=typeof normalizePlayerNat==='function'?normalizePlayerNat(nat):String(nat||'').trim();
  if(n==='Canada'){
    return {pool:['anglo','franco','southasia','eastasia','latinamerican','african','middleeastern','slavic','nordic','centraleuropean'], w:[24,18,9,8,7,7,6,6,5,5]};
  }
  if(n==='United States'){
    return {pool:['anglo','southasia','latinamerican','african','eastasia','middleeastern','slavic','franco','nordic','centraleuropean'], w:[32,11,11,10,8,7,6,5,4,3]};
  }
  if(n==='Sweden'||n==='Finland'||n==='Norway'||n==='Denmark'){
    return {pool:['nordic','anglo','slavic','southasia','african','middleeastern','eastasia'], w:[58,14,10,6,5,4,3]};
  }
  if(n==='Russia'||n==='Ukraine'||n==='Belarus'||n==='Kazakhstan'){
    return {pool:['slavic','centralasian','nordic','anglo','eastasia','middleeastern','southasia'], w:[50,12,10,8,8,6,6]};
  }
  if(n==='Czech Republic'||n==='Slovakia'||n==='Poland'||n==='Hungary'||n==='Latvia'||n==='Lithuania'||n==='Estonia'||n==='Romania'||n==='Croatia'||n==='Serbia'||n==='Slovenia'){
    return {pool:['slavic','centraleuropean','anglo','nordic','southasia','african'], w:[48,18,12,8,7,7]};
  }
  if(n==='France'||n==='Belgium'){
    return {pool:['franco','anglo','african','middleeastern','latinamerican','southasia','slavic','berber'], w:[46,14,10,8,7,5,5,5]};
  }
  if(n==='Germany'||n==='Austria'||n==='Switzerland'||n==='Netherlands'){
    return {pool:['centraleuropean','anglo','slavic','middleeastern','southasia','african','franco'], w:[38,16,14,8,7,7,5]};
  }
  if(n==='Japan'||n==='South Korea'||n==='China'||n==='Mongolia'||n==='Thailand'||n==='Philippines'||n==='Indonesia'||n==='Malaysia'){
    return {pool:['eastasia','anglo','southasia','slavic','african','latinamerican'], w:[58,12,10,8,6,6]};
  }
  if(n==='India'||n==='Pakistan'||n==='Bangladesh'||n==='Sri Lanka'){
    return {pool:['southasia','anglo','middleeastern','eastasia','african','latinamerican'], w:[58,12,10,8,6,6]};
  }
  if(n==='Nigeria'||n==='Ghana'||n==='South Africa'||n==='Kenya'||n==='Ethiopia'){
    return {pool:['african','anglo','franco','middleeastern','southasia','latinamerican'], w:[52,14,10,8,7,6]};
  }
  if(n==='Saudi Arabia'||n==='Morocco'||n==='Egypt'||n==='Tunisia'||n==='Algeria'||n==='Iran'||n==='Turkey'){
    return {pool:['middleeastern','berber','african','southasia','anglo','franco','slavic','centralasian'], w:[42,12,10,10,8,8,6,4]};
  }
  if(n==='Brazil'||n==='Mexico'||n==='Argentina'||n==='Colombia'||n==='Chile'||n==='Peru'||n==='Venezuela'||n==='Uruguay'||n==='Costa Rica'||n==='Dominican Republic'||n==='Spain'||n==='Portugal'||n==='Italy'||n==='Greece'){
    return {pool:['latinamerican','latin','anglo','african','middleeastern','southasia','slavic'], w:[36,14,14,10,8,9,9]};
  }
  if(n==='United Kingdom'||n==='Ireland'||n==='Australia'||n==='New Zealand'){
    return {pool:['anglo','southasia','african','eastasia','middleeastern','latinamerican','slavic','centraleuropean'], w:[38,12,10,9,8,9,7,7]};
  }
  return {pool:NG_CULTURES.slice(), w:[14,9,9,9,9,8,9,8,8,8,4,3,6]};
}

function ngResolveCultureAlias(c){
  if(c==='germanic'||c==='european') return Math.random()<0.7?'centraleuropean':(Math.random()<0.5?'anglo':'nordic');
  if(c==='turkic') return Math.random()<0.75?'middleeastern':'centralasian';
  return ngCanonicalCulture(c);
}

function ngPickCultureForNat(nat){
  var h=ngHeritageForNat(nat);
  return ngResolveCultureAlias(ngPickFromWeighted(h.pool, h.w));
}

/** League-typical passport for NPCs — not the same as name heritage. */
function rollNpcNationality(leagueKey, teamName){
  if(teamName&&typeof isUsndtTeam==='function'&&isUsndtTeam(teamName)) return 'United States';
  if((leagueKey==='LHCM'||leagueKey==='LHLF')&&teamName&&typeof getLocalRegionNatsForTeam==='function'){
    var pool=getLocalRegionNatsForTeam(teamName);
    if(pool&&pool.length){
      if(Math.random()<0.82) return pool[ri(0,pool.length-1)];
      return ngPickIntlNat(pool);
    }
  }
  if(leagueKey==='ARHL'&&teamName&&typeof getArhlTeamRegion==='function'){
    var reg=getArhlTeamRegion(teamName);
    if(reg==='central_asia') return ngPickIntlNat(['Kazakhstan','Uzbekistan','Kyrgyzstan','Russia','Tajikistan','Turkmenistan']);
    if(reg==='east_asia') return ngPickIntlNat(['Japan','South Korea','China','China']);
    if(reg==='baltic') return ngPickIntlNat(['Latvia','Belarus','Russia','Russia']);
    if(reg==='russia') return ngPickIntlNat(['Russia','Russia','Russia','Belarus','Kazakhstan']);
  }
  var lk=String(leagueKey||'');
  var r=Math.random();
  if(lk==='OJL'||lk==='QMJL'||lk==='WJL'||lk==='CWHL'){
    if(r<0.78) return 'Canada';
    if(r<0.94) return 'United States';
    return ngPickIntlNat(['Sweden','Finland','Russia','Czech Republic','France','Germany','Slovakia']);
  }
  if(lk==='USJL'){
    /* Club USJL — mostly North American; top USA teens skew to USNDT, not imports. */
    if(r<0.42) return 'United States';
    if(r<0.78) return 'Canada';
    return ngPickIntlNat(['Sweden','Finland','Russia','Czech Republic','Germany','Slovakia','Latvia','Norway']);
  }
  if(lk==='NCHA'||lk==='NWCHA'||lk==='USWDL'){
    if(r<0.86) return 'United States';
    if(r<0.94) return 'Canada';
    return ngPickIntlNat(['Sweden','Finland','Russia','Czech Republic','Germany','Slovakia']);
  }
  if(lk==='NEHL'||lk==='FHL'||lk==='CEHL'||lk==='ARHL'||lk==='SDHL'||lk==='FWHL'||lk==='AWHL'){
    return ngPickIntlNat(['Sweden','Finland','Russia','Czech Republic','Germany','Slovakia','Latvia','Norway','France']);
  }
  if(lk==='NEJC'||lk==='CEJC'||lk==='ARJC'||lk==='EWJC'||lk==='AWJC'){
    return ngPickIntlNat(['Sweden','Finland','Russia','Czech Republic','Slovakia','Germany','Latvia','Norway']);
  }
  if(typeof NATS!=='undefined'&&NATS.length) return NATS[ri(0,NATS.length-1)].n;
  return r<0.5?'Canada':'United States';
}

function ngPickIntlNat(list){
  return list[ri(0,list.length-1)];
}

function ngGenerateNamePair(gender, leagueKey, nat){
  if(!nat&&typeof G!=='undefined'&&G&&G.nat) nat=G.nat;
  if(!nat) nat=rollNpcNationality(leagueKey);
  var heritage=ngHeritageForNat(nat);
  var firstCulture=ngResolveCultureAlias(ngPickFromWeighted(heritage.pool, heritage.w));
  var lastCulture=firstCulture;
  var mixRoll=Math.random();
  if(mixRoll<0.48){
    lastCulture=ngResolveCultureAlias(ngPickFromWeighted(heritage.pool, heritage.w));
    var guard=0;
    while(lastCulture===firstCulture&&guard<10){
      lastCulture=ngResolveCultureAlias(Math.random()<0.42?ngPickCulture():ngPickFromWeighted(heritage.pool, heritage.w));
      guard++;
    }
  } else if(mixRoll<0.62){
    firstCulture=ngResolveCultureAlias(Math.random()<0.55?ngPickCulture():ngPickFromWeighted(heritage.pool, heritage.w));
    lastCulture=ngResolveCultureAlias(Math.random()<0.55?ngPickCulture():ngPickFromWeighted(heritage.pool, heritage.w));
  } else if(leagueKey&&Math.random()<0.18){
    var leagueCulture=ngPickCultureForLeague(leagueKey);
    if(Math.random()<0.5) firstCulture=leagueCulture;
    else lastCulture=leagueCulture;
  }
  var first=ngFirstByCulture(firstCulture, gender);
  var last=ngLastByCulture(lastCulture);
  if(Math.random()<0.09&&firstCulture!==lastCulture){
    var altFirst=ngFirstByCulture(lastCulture, gender);
    if(altFirst&&altFirst!==first&&altFirst.length<=11) first=first+'-'+altFirst;
  }
  if(Math.random()<0.07&&firstCulture!==lastCulture){
    var altLast=ngLastByCulture(firstCulture);
    if(altLast&&altLast!==last&&altLast.length<=12) last=last+'-'+altLast;
  }
  return {
    first:first,
    last:last,
    culture:firstCulture,
    lastCulture:lastCulture,
    nat:nat,
    mixed:firstCulture!==lastCulture
  };
}

/* Anglo / North American */
function ngAngloFirst(gender){
  var real=ngRealName('anglo', gender, 'first');
  if(real&&Math.random()<0.78) return real;
  if(gender==='F'){
  var a=['em','ann','may','bro','cas','lun','paig','mor','aur','jun','har','oliv','soph','mad','ell','abig','chlo','grac','aur','viv','stell','rose','ivy','jade','ruby','faith','hope','skyl','blak','sydn','pey','kayl','mack','rees','dev','quin'];
  var b=['a','ie','ey','yn','elle','ine','ora','lyn','lee','rae','di','bel','beth','lynn','anne','ette','ina','isa','elle'];
  if(Math.random()<0.55) return ngJoin([ngPick(a),ngPick(b)]);
  var c=['tay','syd','vic','dan','kim','nat','sam','alex','char','jes','jam','mad','sam'];
  return ngJoin([ngPick(c),ngPick(b)]);
  }
  var a=['con','ty','bran','eth','ow','col','jack','ry','kyl','dyl','nath','coop','hun','cam','log','ben','zac','jord','conn','bray','jes','marc','dev','quin','grant','cole','luke','noah','liam','owen','mason','caleb','wyatt','caden','gavin','evan','nolan','trev','derr','gar','land','trist','bren','cor'];
  var b=['or','er','an','en','on','ey','us','ael','ton','den','ley','son','ett','in','is','yn','am','el','ie'];
  if(Math.random()<0.6) return ngJoin([ngPick(a),ngPick(b)]);
  return ngJoin([ngPick(a)]);
}

function ngAngloLast(){
  var real=ngRealName('anglo', 'M', 'last');
  if(real&&Math.random()<0.82) return real;
  if(Math.random()<0.18){
    var pre=['Mc','Mac','O\''];
    var r=['mill','neal','don','greg','lean','brid','guire','gann','nab','call'];
    return ngFinish(ngPick(pre)+ngCap(ngPick(r)));
  }
  var r=['mill','brook','field','wood','stone','ford','hart','well','dale','burn','land','gate','ridge','marsh','reed','fox','wolf','lake','creek','park','hill','green','black','white','young','long','fair','swift','cross','shaw','kent','blair','grant','cole','west','north','south','east','cliff','shore','bay','moor','heath','glen','pratt','banks','frost','snow','storm','steel','iron','gold','silver','copper','hunter','fisher','mason','taylor','baker','carter','porter','walker','turner','foster','cooper','bennett','brooks','hayes','jenkins','powell','ross','cole','ward','gray','price','hayes','myers','long','pierce','barnes','fisher','ellis','gibson','murray','wallace','graham','hamilton','griffin','wallace'];
  var s=['son','er','man','ton','ing','ham','ford','ley','worth','field','wood','stone','well','burn','land'];
  if(Math.random()<0.55) return ngJoin([ngPick(r),ngPick(s)]);
  return ngJoin([ngPick(r)]);
}

/* Nordic / Scandinavian */
function ngNordicFirst(gender){
  var real=ngRealName('nordic', gender, 'first');
  if(real&&Math.random()<0.76) return real;
  if(gender==='F'){
    var a=['ann','lin','ing','astr','sigr','fre','elin','pet','sof','kai','hed','gun','brit','run','solve','ing','mar','the','vil','ger'];
    var b=['a','ie','rid','ne','ka','ja','da','li','na','borg','dis','ny'];
    return ngJoin([ngPick(a),ngPick(b)]);
  }
  var a=['er','lar','mag','nik','bj','sven','hen','jon','ol','tor','fre','gust','and','osc','fel','mat','emm','vik','leif','stig','per','nils','jens','lars','magn','sten','arne','knut','ove'];
  var b=['ik','ar','us','as','or','olf','und','er','an','el','e','i'];
  if(Math.random()<0.35) return ngJoin([ngPick(a)]);
  return ngJoin([ngPick(a),ngPick(b)]);
}

function ngNordicLast(){
  var real=ngRealName('nordic', 'M', 'last');
  if(real&&Math.random()<0.8) return real;
  var r=['berg','lund','strom','fors','holm','quist','kvist','blad','gren','vik','dal','rud','heim','mark','lind','sund','ny','ek','borg','stad','rud','hagen','moen','bakke','strand','sol','vinter','sommer'];
  if(Math.random()<0.45) return ngJoin([ngPick(r),ngPick(['son','sen','sson','dotter','dottir'])]);
  if(Math.random()<0.7) return ngJoin([ngPick(r),ngPick(r)]);
  return ngJoin([ngPick(r),ngPick(['berg','strom','lund','vik','quist'])]);
}

/* Slavic / Eastern European */
function ngSlavicFirst(gender){
  var real=ngRealName('slavic', gender, 'first');
  if(real&&Math.random()<0.76) return real;
  if(gender==='F'){
    var a=['an','kat','nat','ol','mar','elen','irin','svet','oks','yul','vera','nina','dari','pol','mil','zoy','lud','gal','son','tan'];
    var b=['a','ia','iya','ena','ka','na','ra','la','ja','ya','ina','ka'];
    return ngJoin([ngPick(a),ngPick(b)]);
  }
  var a=['al','dmi','ni','pa','vla','i','mi','ser','an','iv','ole','yur','art','vik','bor','den','max','rom','stan','lev','pav','igor','mikh'];
  var b=['ek','or','ol','im','ar','ov','ev','an','el','il','us','ir'];
  return ngJoin([ngPick(a),ngPick(b)]);
}

function ngSlavicLast(){
  var real=ngRealName('slavic', 'M', 'last');
  if(real&&Math.random()<0.8) return real;
  var r=['petr','volk','roman','pop','kuzn','nov','ivan','bor','mor','kova','sokol','orlov','fedor','lebed','baran','zait','krav','shev','meln','gorsk','dub','moroz','sokol'];
  var s=['ov','ev','in','ski','sky','vich','ovich','enko','ak','yk','cz','wicz'];
  return ngJoin([ngPick(r),ngPick(s)]);
}

/* Latino / Hispanic */
function ngLatinoFirst(gender){
  var real=ngRealName('latino', gender, 'first');
  if(real&&Math.random()<0.76) return real;
  if(gender==='F'){
    var a=['sof','val','cam','mar','luc','dan','gab','ale','fer','jul','car','pat','adri','pau','lau','mon','isa','esm','roc','sil','ter','noe','pal','xim'];
    var b=['a','ia','ana','ela','ita','ina','isa','ette','ina'];
    return ngJoin([ngPick(a),ngPick(b)]);
  }
  var a=['car','mat','luc','die','san','mig','raf','fer','gui','ric','edu','jav','mar','ant','fel','sal','emi','gon','hor','jos','man','pio','ram','tom','vic'];
  var b=['los','o','an','el','io','us','ez','on','in','er','as'];
  return ngJoin([ngPick(a),ngPick(b)]);
}

function ngLatinoLast(){
  var real=ngRealName('latino', 'M', 'last');
  if(real&&Math.random()<0.8) return real;
  var r=['gar','rodr','mart','hern','lop','gonz','mor','rey','sil','torr','flor','river','cast','varg','ram','ort','del','nav','igle','sant','cruz','med','vega','pere','gome','diaz','ruiz','soto','chav','rom'];
  var s=['ez','es','iz','oz','as','os','is','ez'];
  if(Math.random()<0.25) return ngFinish('de '+ngCap(ngPick(r)+ngPick(s)));
  return ngJoin([ngPick(r),ngPick(s)]);
}

/* East Asian */
function ngEastAsiaFirst(gender){
  var real=ngRealName('eastasia', gender, 'first');
  if(real&&Math.random()<0.72) return real;
  var core=['ka','ta','sa','na','ma','yo','hi','ke','mi','ji','da','ha','ken','jun','wei','jin','hao','min','sun','woo','ji','tao','lei','ryu','sung','hyun','yuki','chen','ming','feng','liang','xiao','zhen','hui','bin','qin','rong','shan','ying'];
  var n=ri(2,3), out='', i;
  for(i=0;i<n;i++) out+=ngPick(core);
  if(gender==='F') out+=ngPick(['a','i','ko','mi','na','ya','ee','ae','lin','xin']);
  else out+=ngPick(['','o','u','n','ki','ro','to','shi','ho']);
  return ngFinish(out);
}

function ngEastAsiaLast(){
  var real=ngRealName('eastasia', 'M', 'last');
  if(real&&Math.random()<0.74) return real;
  var syl=['ta','na','ka','sa','to','wa','ya','ma','ko','su','zu','ki','ha','ra','mi','shi','moto','hara','kawa','mura','saki','tani','guchi','wata','abe','ito','sait','koba','endo','fuji','goto','inou','okad','shim','yama','zhang','wang','chen','liu','wu','huang','zhao','lin','yang','hu','xu','sun','ma','zhu','guo','he','gao','luo','zheng','liang','song','tang','han','feng','cao','peng','zeng','xiao','kim','park','choi','jung','kang','cho','yoon','jang','lim','han','seo','shin','bae','oh','nam','tran','nguyen','pham','hoang','vu','dang','bui','do','le'];
  var n=ri(2,3), out='', i;
  for(i=0;i<n;i++) out+=ngPick(syl);
  return ngFinish(out);
}

/* South Asian */
function ngSouthAsiaFirst(gender){
  var real=ngRealName('southasia', gender, 'first');
  if(real&&Math.random()<0.72) return real;
  if(gender==='F'){
    var a=['pri','an','deep','neh','ay','kav','ish','anu','div','meh','san','poo','rin','aar','ish','nisha','kavy','riya','sneha','adit'];
    var b=['a','i','ya','ika','ini','ita','sha','ni','vi','ka'];
    return ngJoin([ngPick(a),ngPick(b)]);
  }
  var a=['ar','vi','ra','dev','san','pra','ami','roh','kab','har','imr','raj','vik','sid','aar','nik','var','kar','man','sun','rah','deep','gau'];
  var b=['an','av','ul','am','it','esh','ar','eep','al','il','av'];
  return ngJoin([ngPick(a),ngPick(b)]);
}

function ngSouthAsiaLast(){
  var real=ngRealName('southasia', 'M', 'last');
  if(real&&Math.random()<0.74) return real;
  var r=['pat','shar','gup','sing','khan','nair','red','iyer','men','pill','namb','krish','agar','ban','chop','des','josh','kap','mal','meh','mukh','nanda','rao','sax','venk','bhatt','chatt','dutt','gand','kulk','mah','mish','pand','shet','thak','verm'];
  var s=['el','ma','ta','h','ar','ani','wal','kar','de','e','ani','ena'];
  return ngJoin([ngPick(r),ngPick(s)]);
}

/* West African */
function ngAfricaFirst(gender){
  var real=ngRealName('africa', gender, 'first');
  if(real&&Math.random()<0.72) return real;
  if(gender==='F'){
    var a=['am','ak','esh','nia','zur','ima','fat','yas','ada','chi','ebe','fol','ife','kem','nne','ola','sad','tem','uzu','yew'];
    var b=['a','e','i','ka','la','ma','na','ra','wa','ya'];
    return ngJoin([ngPick(a),ngPick(b)]);
  }
  var a=['kwa','ose','kof','jab','chu','olu','kw','ama','kob','yaw','kofi','tend','segu','ade','baba','chuk','emek','femi','gide','idri','juma','kend','ladi','mos','nana','obi','seg','taiw','udem','wale','yemi'];
  var b=['e','i','o','u','a','u','e','i'];
  if(Math.random()<0.5) return ngJoin([ngPick(a)]);
  return ngJoin([ngPick(a),ngPick(b)]);
}

function ngAfricaLast(){
  var real=ngRealName('africa', 'M', 'last');
  if(real&&Math.random()<0.74) return real;
  var r=['oka','okon','mens','boat','diall','tour','asam','bap','cont','dial','ebo','gyp','kon','mbah','nd','obi','ose','sow','traor','yaw','adey','baku','ciss','diop','fall','guey','kone','ndi','sall','sy','toure','zuma'];
  var s=['for','kwo','ah','eng','e','o','e','i','e'];
  return ngJoin([ngPick(r),ngPick(s)]);
}

/* Arabic / Middle Eastern */
function ngArabicFirst(gender){
  var real=ngRealName('arabic', gender, 'first');
  if(real&&Math.random()<0.72) return real;
  if(gender==='F'){
    var a=['fat','am','lay','noor','zay','yas','sam','haf','ran','leil','mari','nadi','sal','yara','zah','dina','hana','iman','jawa','lina','maya','nour','rana','sara','yas'];
    var b=['a','ah','ia','een','ima','ina','iya','la','ra'];
    return ngJoin([ngPick(a),ngPick(b)]);
  }
  var a=['om','ah','yus','ibr','khal','tar','sam','ami','has','abd','fai','ham','idr','jam','kar','mah','nad','omar','qas','ram','sam','tari','wale','yas','zay'];
  var b=['ar','ed','im','ir','id','an','el','il','us','if','ad','am'];
  return ngJoin([ngPick(a),ngPick(b)]);
}

function ngArabicLast(){
  var real=ngRealName('arabic', 'M', 'last');
  if(real&&Math.random()<0.74) return real;
  if(Math.random()<0.35){
    var pre=['Al-','Ben ','Abu ','El '];
    var r=['rash','hass','ibra','khal','mans','naj','qad','saud','zahr','fara','hus','jam','kar','mah','nab','omar','sale','taha','youn','zaya'];
    return ngFinish(ngPick(pre)+ngCap(ngPick(r)));
  }
  var r=['rash','hass','ibra','khal','mans','naj','qad','saud','zahr','fara','hus','jam','kar','mah','nab','omar','sale','taha','youn','zaya','amin','farh','ghaz','hani','jaf','kadi','mous','nass','qura','sab','tann','wahb'];
  var s=['i','ani','awi','oun','eh','id','ar','em'];
  return ngJoin([ngPick(r),ngPick(s)]);
}

/* French / French-Canadian */
function ngFrenchFirst(gender){
  var real=ngRealName('french', gender, 'first');
  if(real&&Math.random()<0.78) return real;
  if(gender==='F'){
    var a=['mar','jul','cam','chlo','man','soph','lea','emm','clar','just','rose','alice','cel','noe','oce','paul','rom','vict','zo','ade','agat','ana','char','elod','fann','gael','hele','in','jade','lou','mae'];
    var b=['ie','ine','ette','a','ia','elle','ene','e','y','ette'];
    return ngJoin([ngPick(a),ngPick(b)]);
  }
  var a=['ant','pie','luc','theo','hug','max','leo','loui','gab','raph','math','nico','oliv','alex','ben','char','dam','etie','fran','guil','hen','jac','juli','marc','pau','rem','seb','thom','vin','xav','yann'];
  var b=['oine','ien','as','el','an','us','is','il','eau','ier'];
  return ngJoin([ngPick(a),ngPick(b)]);
}

function ngFrenchLast(){
  var real=ngRealName('french', 'M', 'last');
  if(real&&Math.random()<0.82) return real;
  var r=['trem','bouch','gauth','lebl','morin','gagn','pel','lavo','bertr','dup','mart','rober','rich','fort','gira','caron','cote','paqu','lecl','beau','champ','desro','fort','gagne','houde','laf','marce','pellet','riv','sim','ther','vill','berge','charb','dub','fourn','garn','lam','lefe','merc','perra','rous','sav','tess','ver'];
  var s=['blay','ier','ois','and','eau','in','on','et','el','ot','at','ac'];
  if(Math.random()<0.2) return ngFinish('de '+ngCap(ngPick(r)+ngPick(s)));
  return ngJoin([ngPick(r),ngPick(s)]);
}

function ngFirstByCulture(culture, gender){
  culture=ngCanonicalCulture(culture);
  var n='', tries=0;
  while((!n||!ngIsPlausibleName(n))&&tries<12){
    if(culture==='anglo') n=ngAngloFirst(gender);
    else if(culture==='nordic') n=ngNordicFirst(gender);
    else if(culture==='slavic'||culture==='centraleuropean'||culture==='centralasian') n=ngSlavicFirst(gender);
    else if(culture==='latinamerican'||culture==='latin') n=ngLatinoFirst(gender);
    else if(culture==='eastasia') n=ngEastAsiaFirst(gender);
    else if(culture==='southasia') n=ngSouthAsiaFirst(gender);
    else if(culture==='african') n=ngAfricaFirst(gender);
    else if(culture==='middleeastern'||culture==='berber') n=ngArabicFirst(gender);
    else if(culture==='franco') n=ngFrenchFirst(gender);
    else n=ngAngloFirst(gender);
    tries++;
  }
  return n||'Ryan';
}

function ngLastByCulture(culture){
  culture=ngCanonicalCulture(culture);
  var n='', tries=0;
  while((!n||!ngIsPlausibleName(n))&&tries<12){
    if(culture==='anglo') n=ngAngloLast();
    else if(culture==='nordic') n=ngNordicLast();
    else if(culture==='slavic'||culture==='centraleuropean'||culture==='centralasian') n=ngSlavicLast();
    else if(culture==='latinamerican'||culture==='latin') n=ngLatinoLast();
    else if(culture==='eastasia') n=ngEastAsiaLast();
    else if(culture==='southasia') n=ngSouthAsiaLast();
    else if(culture==='african') n=ngAfricaLast();
    else if(culture==='middleeastern'||culture==='berber') n=ngArabicLast();
    else if(culture==='franco') n=ngFrenchLast();
    else n=ngAngloLast();
    tries++;
  }
  return n||'Miller';
}

function generateMaleFirstName(){
  return ngFirstByCulture(ngPickCulture(),'M');
}

function generateFemaleFirstName(){
  return ngFirstByCulture(ngPickCulture(),'F');
}

function generateLastName(){
  return ngLastByCulture(ngPickCulture());
}

function generateFirstName(gender){
  return gender==='F'?generateFemaleFirstName():generateMaleFirstName();
}

function rollMaleFirstName(){ return generateMaleFirstName(); }
function rollFemaleFirstName(){ return generateFemaleFirstName(); }
function rollLastName(){ return generateLastName(); }

function rollFirstNameForGender(gender){
  return generateFirstName(gender==='F'?'F':'M');
}

function rollFirstNameForLeague(leagueKey){
  var isF=(LEAGUES[leagueKey]||{}).gender==='F';
  return rollFirstNameForGender(isF?'F':'M');
}

function rollRandomPlayerName(gender){
  var g=gender;
  if(!g&&typeof G!=='undefined'&&G){
    if(G.league&&G.league.gender==='F') g='F';
    else if(G.gender) g=G.gender;
  }
  if(g!=='F') g='M';
  var lk=typeof G!=='undefined'&&G?G.leagueKey:null;
  var nat=typeof G!=='undefined'&&G?G.nat:null;
  var pair=ngGenerateNamePair(g==='F'?'F':'M', lk, nat);
  return pair.first+' '+pair.last;
}

function rollCoachName(leagueKey){
  var isF=(LEAGUES[leagueKey||'']||{}).gender==='F';
  var pair=ngGenerateNamePair(isF?'F':'M', leagueKey);
  return pair.first+' '+pair.last;
}

function getRandomTalentName(){
  return rollRandomPlayerName();
}

function rollNpcName(leagueKey, nat){
  var isF=(LEAGUES[leagueKey]||{}).gender==='F';
  var gender=isF?'F':'M';
  if(!nat) nat=rollNpcNationality(leagueKey);
  var pair, tries=0;
  do{
    pair=ngGenerateNamePair(gender, leagueKey, nat);
    tries++;
  }while(typeof G!=='undefined'&&G&&G.first===pair.first&&G.last===pair.last&&tries<24);
  return pair;
}

function suggestCreatePlayerName(){
  var gender='M', nat=null, lk=null;
  if(typeof safeEl==='function'){
    var gEl=safeEl('c-gender');
    var nEl=safeEl('c-nat');
    if(gEl) gender=gEl.value==='F'?'F':'M';
    if(nEl&&nEl.value) nat=nEl.value;
  }
  if(typeof selLeague!=='undefined'&&selLeague) lk=selLeague;
  return ngGenerateNamePair(gender, lk, nat);
}

function applySuggestedCreateName(){
  var pair=suggestCreatePlayerName();
  if(typeof safeEl!=='function') return;
  var f=safeEl('c-first'), l=safeEl('c-last');
  if(f) f.value=pair.first;
  if(l) l.value=pair.last;
}
