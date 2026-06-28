/* breakaway — SEASON AWARDS */
// ============================================================
// SEASON AWARDS
// ============================================================
function leagueAwardMinGp(){
  if(!G||!G.league) return 20;
  var total=G.league.games||68;
  return Math.max(12, Math.round(total*0.45));
}

function userLeadsCategory(rows, category){
  if(!rows||!rows.length||!G) return false;
  var minGp=leagueAwardMinGp();
  var meRow=null, i;
  for(i=0;i<rows.length;i++){
    if(rows[i].player&&rows[i].player.isMe){ meRow=rows[i]; break; }
  }
  if(!meRow||meRow.gp<minGp) return false;

  if(category==='pts'){
    if(G.pos==='G') return false;
    var sk=rows.filter(function(r){return r.player.pos!=='G'&&r.gp>=minGp;});
    sk.sort(function(a,b){return b.pts-a.pts||b.g-a.g;});
    return sk.length&&sk[0].player.isMe;
  }
  if(category==='goals'){
    if(G.pos==='G') return false;
    sk=rows.filter(function(r){return r.player.pos!=='G'&&r.gp>=minGp;});
    sk.sort(function(a,b){return b.g-a.g||b.pts-a.pts;});
    return sk.length&&sk[0].player.isMe;
  }
  if(category==='assists'){
    if(G.pos==='G') return false;
    sk=rows.filter(function(r){return r.player.pos!=='G'&&r.gp>=minGp;});
    sk.sort(function(a,b){return b.a-a.a||b.pts-a.pts;});
    return sk.length&&sk[0].player.isMe;
  }
  if(category==='defense'){
    if(G.pos!=='D') return false;
    var defs=rows.filter(function(r){return r.player.pos==='D'&&r.gp>=minGp;});
    defs.sort(function(a,b){return b.pm-a.pm||b.pts-a.pts;});
    return defs.length&&defs[0].player.isMe;
  }
  if(category==='goalie'){
    if(G.pos!=='G') return false;
    var gs=rows.filter(function(r){return r.player.pos==='G'&&r.gp>=minGp;});
    gs.sort(function(a,b){
      var sa=a.sv+a.ga, sb=b.sv+b.ga;
      return (sb>0?b.sv/sb:0)-(sa>0?a.sv/sa:0);
    });
    return gs.length&&gs[0].player.isMe;
  }
  return false;
}

function checkSeasonAwards(){
  var pts=G.goals+G.assists;
  var o=ovr(G.attrs,G.pos);
  var tier=G.league.tier;
  var rows=typeof getFinalLeaguePlayerStats==='function'?getFinalLeaguePlayerStats():[];

  if(userLeadsCategory(rows, 'pts')){
    G.awards.push({name:G.league.short+' Scoring Champion',icon:'[*]',desc:pts+' points — league leader',season:G.season});
    addNews(G.first+' '+G.last+' wins the '+G.league.short+' scoring title with '+pts+' points!','big');
    notify('SCORING CHAMPION!','gold');
  }
  if(userLeadsCategory(rows, 'goals')){
    G.awards.push({name:G.league.short+' Goals Leader',icon:'[G]',desc:G.goals+' goals — league leader',season:G.season});
    addNews(G.first+' '+G.last+' leads '+G.league.short+' with '+G.goals+' goals.','big');
    notify('GOALS LEADER!','gold');
  }
  if(userLeadsCategory(rows, 'assists')){
    G.awards.push({name:G.league.short+' Assists Leader',icon:'[A]',desc:G.assists+' assists — league leader',season:G.season});
    addNews(G.first+' '+G.last+' leads '+G.league.short+' with '+G.assists+' assists.','big');
    notify('ASSISTS LEADER!','gold');
  }
  if(userLeadsCategory(rows, 'defense')){
    G.awards.push({name:G.league.short+' Best Defenseman',icon:'[D]',desc:'League-best +/− of '+(G.plusminus>=0?'+':'')+G.plusminus,season:G.season});
    addNews(G.first+' '+G.last+' wins Best Defenseman in '+G.league.short+'.','big');
    notify('BEST DEFENSEMAN!','gold');
  }
  if(userLeadsCategory(rows, 'goalie')){
    var svPctR=G.saves+(G.goalsAgainst||0)>0?G.saves/(G.saves+(G.goalsAgainst||0)):0;
    G.awards.push({name:G.league.short+' Top Goaltender',icon:'[G]',desc:'League-best SV% of '+(Math.round(svPctR*1000)/10)+'%',season:G.season});
    addNews(G.first+' '+G.last+' wins Top Goaltender — elite '+(Math.round(svPctR*1000)/10)+'% save percentage.','big');
    notify('TOP GOALTENDER!','gold');
  }

  if(G.pos!=='G'&&pts>=40&&tier==='pro'&&!userLeadsCategory(rows, 'pts')){
    G.awards.push({name:'All-Star Selection',icon:'[A]',desc:'Named to the '+G.league.short+' All-Star team',season:G.season});
    addNews(G.first+' '+G.last+' named to the '+G.league.short+' All-Star team.','big');
  }

  if(tier==='pro'&&o>=85&&(pts>=70||G.wonCup)){
    if(Math.random()<0.3){
      G.awards.push({name:'League MVP',icon:'[M]',desc:'Most Valuable Player — '+G.league.short,season:G.season});
      addNews(G.first+' '+G.last+' wins the '+G.league.short+' MVP award!','big');
      notify('MVP!','gold');
    }
  }

  if(G.season===1&&G.gp>=leagueAwardMinGp()&&pts>=20){
    G.awards.push({name:'Rookie of the Year',icon:'[R]',desc:'Best first-year player in '+G.league.short,season:G.season});
    addNews(G.first+' '+G.last+' wins Rookie of the Year!','big');
  }
}
