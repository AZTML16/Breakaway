/* breakaway — MILESTONES */
// ============================================================
// MILESTONES
// ============================================================
function checkMilestones(){
  var pts=G.goals+G.assists;
  var ms=G.milestones;
  function check(key,icon,title,body){
    if(ms.indexOf(key)===-1){
      ms.push(key);
      safeEl('m-ms-icon').textContent=stripBracketIcons(icon);
      safeEl('m-ms-title').textContent=title;
      safeEl('m-ms-body').textContent=stripBracketIcons(body);
      RetroSound.achievement();
      openM('m-milestone');
      notify(title,'gold');
    }
  }
  if(pts>=50) check('50pts','[*]','50 POINT SEASON!','YOU HIT THE 50-POINT MARK!');
  if(pts>=100) check('100pts','[!]','100 POINT SEASON!','CENTURY MARK -- ELITE STATUS!');
  if(pts>=150) check('150pts','[#]','150 POINT LEGENDARY RUN!','ALL-TIME OFFENSIVE TERRITORY.');
  if(G.goals>=50) check('50g','[G]','50 GOALS!','50 GOALS THIS SEASON -- ELITE SNIPER!');
  if(G.goals>=70) check('70g','[G+]','70 GOALS!','HISTORIC FINISHER SEASON.');
  if(G.assists>=80) check('80a','[~]','80 ASSISTS!','80 ASSISTS -- PLAYMAKER OF THE YEAR CANDIDATE!');
  if(G.assists>=100) check('100a','[~+]','100 ASSISTS!','HISTORIC VISION AND DISTRIBUTION.');
  if(G.cGP>=100) check('100gp','[+]','100 CAREER GAMES','A CENTURY OF PROFESSIONAL HOCKEY!');
  if(G.cGP>=500) check('500gp','[=]','500 CAREER GAMES','HALF A THOUSAND GAMES. VETERAN.');
  if(G.cGP>=1000) check('1000gp','[X]','1000 CAREER GAMES','RARE AIR -- TRUE IRONMAN CAREER.');
  if(G.goals>=1&&G.gp<=3) check('firstg','[1]','FIRST GOAL!','YOU ARE ON THE BOARD.');
  if(G.assists>=1&&G.gp<=3) check('firsta','[A1]','FIRST ASSIST!','PLAYMAKING STARTED.');
  if(G.gp>=1&&G.gp<=2&&pts>=2) check('faststart','[>>]','FAST START','MULTI-POINT DEBUT STRETCH.');
  if((G._seasonHotStreak||0)>=5) check('hot5','[^]','5-GAME HEATER','SUSTAINED PRODUCTION STREAK.');
  if(G.league&&G.league.tier==='local'&&G.gp>=10) check('lhlrep','[L]','COMMUNITY REGULAR','LOGGED A FULL LHL LEAGUE CALENDAR.');
}
