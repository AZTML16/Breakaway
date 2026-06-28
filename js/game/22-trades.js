/* breakaway — TRADES */
// ============================================================
// TRADES
// ============================================================
function triggerTrade(){
  if(pendingTrade) return;
  var teams=TEAMS[G.leagueKey]||[];
  var filtered=teams.filter(function(t){return t.n!==G.team.n;});
  if(!filtered.length)return;
  var newTeam=shuf(filtered)[0];
  triggerTradeConversation(newTeam);
}

function acceptTrade(){
  if(!pendingTrade)return;
  var keepWeek=G.week, keepWeekGames=G.weekGames, keepCurIdx=G._curGameIdx;
  G.team=pendingTrade.team;
  onTeamChangeLeadershipReset();
  refreshStandings(G.leagueKey);
  G.week=keepWeek;G.weekGames=keepWeekGames;G._curGameIdx=keepCurIdx;
  G.morale=cl(G.morale+ri(-8,6),0,100);
  G._lastTradeSeason=G.season;
  G._tradeCooldownUntilGp=999; // no more in-season repeat trade loops
  addNews('TRADED: '+G.first+' '+G.last+' moves to '+G.team.n+'!','big');
  G.socialMessages=generateSocialMessages();
  pendingTrade=null;closeM('m-trade');renderHub();
  RetroSound.tradeWhoosh();
  notify('TRADED TO '+G.team.n.toUpperCase(),'gold');
}

function declineTrade(){
  if(!pendingTrade) return;
  RetroSound.ping();
  if(G.contract.ntc){
    addNews(G.first+' '+G.last+' invokes NTC -- trade blocked.','neutral');
  } else {
    addNews(G.first+' '+G.last+' declines the trade to '+pendingTrade.team.n+'.','neutral');
  }
  G._tradeCooldownUntilGp=G.gp+24;
  pendingTrade=null;
  closeM('m-trade');
}
