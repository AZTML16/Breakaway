/* breakaway — SEASON AWARDS */
// ============================================================
// SEASON AWARDS
// ============================================================
function checkSeasonAwards(){
  var pts=G.goals+G.assists;
  var o=ovr(G.attrs);
  var tier=G.league.tier;
  // Scoring title / top performer
  if(G.pos!=='G'&&pts>=60){
    G.awards.push({name:G.league.short+' Scoring Champion',icon:'[*]',desc:pts+' points in one season',season:G.season});
    addNews(G.first+' '+G.last+' wins the '+G.league.short+' scoring title with '+pts+' points!','big');
    notify('SCORING CHAMPION!','gold');
  } else if(G.pos!=='G'&&pts>=40&&tier==='pro'){
    G.awards.push({name:'All-Star Selection',icon:'[A]',desc:'Named to the '+G.league.short+' All-Star team',season:G.season});
    addNews(G.first+' '+G.last+' named to the '+G.league.short+' All-Star team.','big');
  }
  if(G.pos==='G'&&G.gp>=20){
    var svPctR=G.saves+(G.goalsAgainst||0)>0?G.saves/(G.saves+(G.goalsAgainst||0)):0;
    if(svPctR>=0.930){
      G.awards.push({name:'Top Goaltender',icon:'[G]',desc:'League-best SV% of '+(Math.round(svPctR*1000)/10)+'%',season:G.season});
      addNews(G.first+' '+G.last+' wins Top Goaltender -- elite '+(Math.round(svPctR*1000)/10)+'% save percentage.','big');
      notify('TOP GOALTENDER!','gold');
    }
  }
  // MVP consideration (pro only, high OVR + production)
  if(tier==='pro'&&o>=85&&(pts>=70||G.wonCup)){
    if(Math.random()<0.3){
      G.awards.push({name:'League MVP',icon:'[M]',desc:'Most Valuable Player -- '+G.league.short,season:G.season});
      addNews(G.first+' '+G.last+' wins the '+G.league.short+' MVP award!','big');
      notify('MVP!','gold');
    }
  }
  // Rookie of the year
  if(G.season===1&&pts>=20){
    G.awards.push({name:'Rookie of the Year',icon:'[R]',desc:'Best first-year player in '+G.league.short,season:G.season});
    addNews(G.first+' '+G.last+' wins Rookie of the Year!','big');
  }
}
