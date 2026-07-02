/* breakaway — player bank balance, living costs, lifestyle purchases */

var PLAYER_PURCHASES=[
  {id:'team_dinner', label:'Team Dinner (linemates)', desc:'Pick up the tab — locker room loves it.', cost:2800, morale:5, tier:'small'},
  {id:'gear_pro', label:'Pro Gear Package', desc:'Top-shelf skates, stick, and bag refresh.', cost:9200, morale:4, tier:'small'},
  {id:'skills_coach', label:'Private Skills Coach', desc:'Extra ice and video work for a week.', cost:16500, morale:6, stamina:4, tier:'mid'},
  {id:'charity_gala', label:'Charity Gala Night', desc:'High-profile community event.', cost:42000, morale:9, followers:1200, tier:'mid'},
  {id:'luxury_watch', label:'Luxury Watch', desc:'Flex on and off the ice.', cost:68000, morale:8, followers:800, tier:'big'},
  {id:'sports_car', label:'Sports Car', desc:'Garage upgrade — arrival matters.', cost:125000, morale:12, followers:2500, once:true, flag:'_ownsSportsCar', tier:'big'},
  {id:'condo', label:'Downtown Condo', desc:'City penthouse between road trips.', cost:340000, morale:14, once:true, flag:'_ownsCondo', tier:'big'},
  {id:'lake_house', label:'Lake House', desc:'Off-season escape with the inner circle.', cost:580000, morale:16, once:true, flag:'_ownsLakeHouse', tier:'big'},
  {id:'supercar', label:'Supercar', desc:'The kind of car that ends up on social.', cost:295000, morale:11, followers:4000, once:true, flag:'_ownsSupercar', tier:'big', needsSal:400000},
  {id:'beach_estate', label:'Beach Estate', desc:'Ultimate off-ice trophy property.', cost:1200000, morale:18, followers:8000, once:true, flag:'_ownsBeachEstate', tier:'mega', needsSal:900000}
];

function isChlMajorJuniorLeague(leagueKey){
  var k=String(leagueKey||'');
  return k==='OJL'||k==='QMJL'||k==='WJL';
}

function getFinanceTierKey(){
  if(!G||!G.league) return 'junior';
  return G.league.tier||'junior';
}

/** Amateur costs are a fraction of listed pro prices. */
function getFinanceTierCostMult(){
  var tier=getFinanceTierKey();
  if(tier==='local') return 0.3;
  if(tier==='junior') return 0.36;
  if(tier==='college') return 0.46;
  if(tier==='minor') return 0.72;
  if(tier==='euro'||tier==='asia') return 0.84;
  return 1;
}

function getScaledPurchaseCost(item){
  if(!item) return 0;
  return Math.max(25, Math.round((item.cost||0)*getFinanceTierCostMult()));
}

function getRelationRepairCost(base){
  return Math.max(40, Math.round((base||0)*getFinanceTierCostMult()));
}

function ensurePlayerFinances(){
  if(!G) return;
  if(typeof G.bankBalance!=='number'){
    var ce=G.careerEarnings||0;
    var tier=getFinanceTierKey();
    var startCash=tier==='local'?600:(tier==='junior'?850:(tier==='college'?1200:2200));
    G.bankBalance=ce>0?Math.round(ce*0.28):((G.contract&&G.contract.sal>0)?Math.round(G.contract.sal*0.06):startCash);
  }
  if(typeof G.careerEarnings!=='number') G.careerEarnings=0;
  if(!Array.isArray(G.purchaseHistory)) G.purchaseHistory=[];
}

function creditPlayerMoney(amount, reason){
  if(!G||!(amount>0)) return;
  ensurePlayerFinances();
  G.bankBalance=(G.bankBalance||0)+Math.round(amount);
  G.careerEarnings=(G.careerEarnings||0)+Math.round(amount);
  if(reason) G._lastMoneyCredit=reason;
}

function getWeeklySalaryPay(){
  if(!G||G._inOffseason) return 0;
  var sal=(G.contract&&G.contract.sal)|0;
  if(sal<=0) return 0;
  if(G.contract&&G.contract.type==='ORG PRO DEAL'&&typeof isProAcademyJuniorLeague==='function'&&isProAcademyJuniorLeague(G.leagueKey)){
    var band=G._academyBand||'';
    var onProIce=band==='PRO_CALLUP'||(G._callUpCtx&&G._callUpCtx.active);
    if(!onProIce) return 0;
  }
  var perWk=getGamesPerWeek(G.leagueKey);
  var wks=Math.max(1,Math.ceil((G.league.games||68)/perWk));
  return Math.round(sal/wks);
}

function getChlWeeklyStipend(){
  var pOvr=typeof ovr==='function'?ovr(G.attrs,G.pos):65;
  var gp=G.gp||0;
  var perf=gp>0?(G.goals+G.assists)/gp:0;
  var floor=Math.round(5000/52);
  var ceil=Math.round(100000/52);
  var skill=cl((pOvr-58)/42,0,1);
  var perfBoost=cl(perf/1.2,0,0.35);
  return Math.round(cl(floor+skill*(ceil-floor)+perfBoost*(ceil-floor)*0.25, floor, ceil));
}

function getWeeklyStipend(){
  if(!G||G._inOffseason) return 0;
  var lk=G.leagueKey||'';
  var tier=getFinanceTierKey();
  var g=G.gender||'M';
  var contractSal=(G.contract&&G.contract.sal)|0;
  if(contractSal>0){
    if(G.contract.type==='ORG PRO DEAL'&&typeof isProAcademyJuniorLeague==='function'&&isProAcademyJuniorLeague(lk)){
      if(typeof getAcademyWeeklyStipend==='function') return getAcademyWeeklyStipend(g, lk);
    }
    return 0;
  }
  if(isChlMajorJuniorLeague(lk)&&g==='M'){
    return getChlWeeklyStipend();
  }
  if(typeof isProAcademyJuniorLeague==='function'&&isProAcademyJuniorLeague(lk)){
    if(typeof getAcademyWeeklyStipend==='function') return getAcademyWeeklyStipend(g, lk);
    return Math.round((g==='M'?275:145)+rd(0,g==='M'?175:95));
  }
  if(lk==='NCHA'||lk==='NWCHA'){
    return Math.round((g==='M'?175:130)+rd(0,g==='M'?125:95));
  }
  if(lk==='USJL') return Math.round(105+rd(0,75));
  if(tier==='junior'){
    if(lk==='CWHL'||lk==='USWDL') return Math.round(90+rd(0,60));
    return Math.round((g==='M'?70:55)+rd(0,50));
  }
  if(tier==='local') return Math.round(55+rd(0,45));
  if(tier==='college') return Math.round(80+rd(0,55));
  return 0;
}

function getWeeklyLivingCost(){
  if(!G) return 0;
  var tier=getFinanceTierKey();
  var lk=G.leagueKey||'';
  var sal=(G.contract&&G.contract.sal)|0;
  var base;
  if(isChlMajorJuniorLeague(lk)&&G.gender==='M'){
    base=85+rd(0,45);
  } else if(tier==='local'){
    base=95+rd(0,55);
  } else if(tier==='junior'){
    base=165+rd(0,75);
  } else if(tier==='college'){
    base=125+rd(0,70);
  } else if(tier==='minor'){
    base=420+rd(0,130);
  } else if(tier==='euro'||tier==='asia'){
    base=560+rd(0,150);
  } else if(tier==='pro'){
    base=780+rd(0,200);
  } else {
    base=320+rd(0,90);
  }
  if(sal>0) base+=Math.round(sal*0.00075);
  if(G._ownsCondo) base=Math.round(base*0.88);
  if(G._ownsLakeHouse||G._ownsBeachEstate) base+=Math.round(160+rd(0,80));
  if(G._ownsSportsCar||G._ownsSupercar) base+=Math.round(85+rd(0,55));
  return Math.max(60, Math.round(base));
}

function deductWeeklyLiving(){
  if(!G||G._inOffseason) return;
  ensurePlayerFinances();
  var cost=getWeeklyLivingCost();
  var before=G.bankBalance||0;
  G.bankBalance=Math.max(0, before-cost);
  G._lastLivingCost=cost;
  if(before<cost){
    G.morale=cl((G.morale||50)-4, 0, 100);
    if(Math.random()<0.35){
      addNews('BILLS PILE UP: Living costs outpaced the bank account this week.','bad');
    }
  } else if(before-cost<cost*1.5&&before<8000){
    G.morale=cl((G.morale||50)-1, 0, 100);
  }
}

function accrueWeeklyPlayerFinances(){
  if(!G||G._inOffseason) return;
  ensurePlayerFinances();
  var pay=getWeeklySalaryPay();
  var stipend=getWeeklyStipend();
  if(pay>0) creditPlayerMoney(pay, 'salary');
  else if(stipend>0) creditPlayerMoney(stipend, 'stipend');
  deductWeeklyLiving();
}

function getPurchaseById(id){
  for(var i=0;i<PLAYER_PURCHASES.length;i++){
    if(PLAYER_PURCHASES[i].id===id) return PLAYER_PURCHASES[i];
  }
  return null;
}

function playerOwnsPurchase(item){
  if(!item||!item.once||!item.flag) return false;
  return !!G[item.flag];
}

function buyPlayerPurchase(id){
  if(!G) return;
  ensurePlayerFinances();
  var item=getPurchaseById(id);
  if(!item){ notify('Unknown purchase.','red'); return; }
  if(playerOwnsPurchase(item)){
    notify('You already own that.','gold');
    return;
  }
  if(item.needsSal&&(G.contract.sal||0)<item.needsSal){
    notify('Need a bigger contract before that purchase.','gold');
    return;
  }
  var cost=getScaledPurchaseCost(item);
  if((G.bankBalance||0)<cost){
    notify('Not enough in the bank ('+fmt(G.bankBalance||0)+').','red');
    return;
  }
  G.bankBalance=(G.bankBalance||0)-cost;
  if(item.morale) G.morale=cl((G.morale||50)+(item.morale||0), 0, 100);
  if(item.stamina) G.stamina=cl((G.stamina||50)+(item.stamina||0), 0, 100);
  if(item.followers) G.socialFollowers=Math.min(9999999, (G.socialFollowers||0)+(item.followers||0));
  if(item.once&&item.flag) G[item.flag]=true;
  G.purchaseHistory.push({
    id:item.id, label:item.label, cost:cost,
    season:G.season||1, week:G.week||1, at:Date.now()
  });
  addNews(G.first+' '+G.last+' — '+item.label+' ('+fmt(cost)+').','good');
  notify(item.label.toUpperCase(),'gold');
  if(typeof renderContractTab==='function') renderContractTab();
  else if(typeof renderHub==='function') renderHub();
}

function renderPlayerFinanceSection(){
  ensurePlayerFinances();
  var bal=G.bankBalance||0;
  var career=G.careerEarnings||0;
  var weeklyPay=getWeeklySalaryPay();
  var stipend=getWeeklyStipend();
  var living=getWeeklyLivingCost();
  var net=weeklyPay+stipend-living;
  var stipLabel='';
  if(stipend>0){
    if(isChlMajorJuniorLeague(G.leagueKey)&&G.gender==='M') stipLabel='CHL stipend';
    else if(typeof isProAcademyJuniorLeague==='function'&&isProAcademyJuniorLeague(G.leagueKey)) stipLabel='academy org stipend';
    else if(G.leagueKey==='NCHA'||G.leagueKey==='NWCHA') stipLabel='scholarship + spending';
    else stipLabel='amateur stipend';
  }
  var html='<div style="background:var(--rink);border:1px solid var(--rl);padding:12px;margin:12px 0">'+
    '<div class="vt" style="font-size:14px;color:var(--mut)">FINANCES</div>'+
    '<div class="vt" style="font-size:12px;color:var(--mut);margin-top:4px">CAREER EARNINGS (LIFETIME)</div>'+
    '<div class="vt" style="font-size:18px;color:var(--acc);margin-bottom:8px">'+fmt(career)+'</div>'+
    '<div class="vt" style="font-size:12px;color:var(--mut)">CURRENT BALANCE</div>'+
    '<div class="cval-big" style="color:'+(bal<living?'var(--red)':'var(--gold)')+'">'+fmt(bal)+'</div>'+
    '<div class="vt" style="font-size:13px;color:var(--mut);margin-top:6px;line-height:1.5">'+
    (weeklyPay>0?('Salary: <span style="color:var(--green)">'+fmt(weeklyPay)+'</span>'):
      (stipend>0?('<span style="color:var(--green)">'+fmt(stipend)+'</span> /wk '+stipLabel):'No weekly pay'))+
    ' &nbsp;·&nbsp; Living: <span style="color:var(--red)">−'+fmt(living)+'</span> &nbsp;·&nbsp; '+
    'Net: <span style="color:'+(net>=0?'var(--green)':'var(--red)')+'">'+(net>=0?'+':'')+fmt(net)+'</span>'+
    '</div></div>';

  html+='<div class="vt" style="font-size:14px;color:var(--gold);margin:8px 0 6px">LIFESTYLE PURCHASES</div>';
    html+='<div class="vt" style="font-size:12px;color:var(--mut);margin-bottom:10px;line-height:1.45">Prices scale to your league level. CHL stipends scale with skill ($5k–$100k/season). Euro/Asia academies require an org contract — U16/U18 are free; U20 earns a modest stipend; parent-club salary pays only on pro call-ups.</div>';

  var tierColor={small:'var(--mut)',mid:'var(--acc)',big:'var(--gold)',mega:'#e8c85c'};
  var i, item, owned, afford, salOk, disabled, btnClass, moraleTxt, cost;
  for(i=0;i<PLAYER_PURCHASES.length;i++){
    item=PLAYER_PURCHASES[i];
    cost=getScaledPurchaseCost(item);
    owned=playerOwnsPurchase(item);
    afford=(G.bankBalance||0)>=cost;
    salOk=!item.needsSal||(G.contract.sal||0)>=item.needsSal;
    disabled=owned||!afford||!salOk;
    btnClass=disabled?'bs':'bg2';
    moraleTxt=(item.morale>0?'+':'')+item.morale+' morale';
    if(item.stamina) moraleTxt+=', +'+item.stamina+' stamina';
    if(item.followers) moraleTxt+=', +'+fmt(item.followers)+' followers';
    html+='<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px;margin-bottom:8px;border:1px solid rgba(122,184,224,.18);background:rgba(12,26,36,.35)">'+
      '<div style="flex:1 1 200px;min-width:0">'+
      '<div class="vt" style="font-size:15px;color:'+(tierColor[item.tier]||'var(--wht)')+'">'+escHtml(item.label)+(owned?' <span style="color:var(--green);font-size:12px">OWNED</span>':'')+'</div>'+
      '<div class="vt" style="font-size:12px;color:var(--mut);line-height:1.4">'+escHtml(item.desc)+'</div>'+
      '<div class="vt" style="font-size:11px;color:var(--acc);margin-top:4px">'+moraleTxt+'</div>'+
      '</div>'+
      '<div style="text-align:right;flex-shrink:0">'+
      '<div class="vt" style="font-size:17px;color:var(--gold)">'+fmt(cost)+'</div>'+
      '<button type="button" class="btn '+btnClass+'" style="margin-top:6px;padding:4px 12px;font-size:13px"'+(disabled?' disabled':'')+' onclick="buyPlayerPurchase(\''+item.id+'\')">'+(owned?'OWNED':(salOk?'BUY':'LOCKED'))+'</button>'+
      '</div></div>';
  }

  if(G.purchaseHistory&&G.purchaseHistory.length){
    html+='<div class="vt" style="font-size:12px;color:var(--mut);margin-top:10px">Recent: ';
    var recent=G.purchaseHistory.slice(-3).reverse(), r;
    for(r=0;r<recent.length;r++){
      if(r>0) html+=' · ';
      html+=escHtml(recent[r].label)+' ('+fmt(recent[r].cost)+')';
    }
    html+='</div>';
  }
  return html;
}
