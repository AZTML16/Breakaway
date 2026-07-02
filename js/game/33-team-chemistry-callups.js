/* breakaway — TEAM CHEMISTRY, RELATIONS, SCRATCHES, PRO CALL-UPS */
// ============================================================

var DEPTH_SCRATCH_F=['F-SCR1','F-SCR2'];
var DEPTH_SCRATCH_D=['D-SCR1'];

function relationLabel(score){
  var s=+score||50;
  if(s>=78) return {text:'Great chemistry', color:'var(--green)'};
  if(s>=62) return {text:'Good rapport', color:'var(--acc)'};
  if(s>=45) return {text:'Neutral', color:'var(--mut)'};
  if(s>=30) return {text:'Tense', color:'var(--gold)'};
  return {text:'Bad blood', color:'var(--red)'};
}

/** Safe string for inline onclick handlers (NPC ids are strings — JSON.stringify breaks HTML quotes). */
function jsClickArg(v){
  return "'"+String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+"'";
}

/** Cocky / loud profiles — room tolerance varies. */
function isCockyXFactor(xf){
  return xf==='regular_season'||xf==='careless'||xf==='clutch';
}

/** Hype, edge, and fight — many teammates love this energy. */
function isHypeFightProfile(xf, arch, pim){
  if(xf==='brat'||xf==='heavy_hitter'||xf==='regular_season') return true;
  if(arch==='Enforcer'||arch==='Grinder'||arch==='PowerForward') return true;
  return (+pim||0)>=28;
}

function isHardWorkerProfile(xf, arch){
  return xf==='hard_worker'||arch==='Grinder'||arch==='TwoWay'||arch==='ShutdownD'||arch==='StayAtHome';
}

function isUserStarProfile(){
  if(!G) return false;
  var uOvr=ovr(G.attrs,G.pos);
  var me=getUserRosterPlayer();
  var line=me&&me.depthSlot?getDepthLineFromSlot(me.depthSlot,G.pos):4;
  var ppg=G.gp>0?(G.goals+G.assists)/G.gp:0;
  if(G.leadershipRole==='C'||G.leadershipRole==='A') return true;
  if(line<=1&&uOvr>=70) return true;
  if(ppg>=0.82) return true;
  return uOvr>=76;
}

function getTeamSuccessRate(){
  if(G&&G.standings&&G.team){
    var i, s, gp;
    for(i=0;i<G.standings.length;i++){
      s=G.standings[i];
      if(s.isMe||(s.team&&s.team.n===G.team.n)){
        gp=s.gp||0;
        if(gp>=4) return s.w/gp;
        break;
      }
    }
  }
  if(G&&G.gp>0) return G.w/G.gp;
  return 0.5;
}

/** Stable per-NPC roll so chemistry does not flicker every refresh. */
function npcTraitRoll(p, threshold){
  var id=String(p.id||p.first+p.last||'');
  var h=0, i;
  for(i=0;i<id.length;i++) h=(h*31+id.charCodeAt(i))%997;
  return (h%100)/100<threshold;
}

function npcLovesHypeAndFight(p){
  if(p.arch==='Grinder'||p.arch==='Enforcer'||p.arch==='PowerForward') return true;
  if(p.arch==='TwoWay'||p.arch==='StayAtHome'||p.arch==='ShutdownD') return npcTraitRoll(p,0.62);
  if(p.leadership==='A') return npcTraitRoll(p,0.55);
  if(p.arch==='Sniper'||p.arch==='Playmaker'||p.arch==='OffensiveD') return npcTraitRoll(p,0.32);
  return npcTraitRoll(p,0.48);
}

function npcDislikesCocky(p){
  if(p.leadership==='C'||p.leadership==='A') return true;
  if(p.arch==='Grinder'||p.arch==='TwoWay'||p.arch==='ShutdownD'||p.arch==='StayAtHome') return true;
  if((p.age||20)>=28) return npcTraitRoll(p,0.72);
  return npcTraitRoll(p,0.42);
}

/** Specific reasons a teammate may not like you — shown in the Team tab when chemistry is low. */
function buildTeammateGrievances(tp){
  if(!G||!tp) return [];
  var out=[], xf=G.xFactor||'none', arch=G.arch||'', pim=G.pim||0, gp=G.gp||0;
  var teamBad=getTeamSuccessRate()<0.44, teamGood=getTeamSuccessRate()>=0.52;
  var star=isUserStarProfile(), cocky=isCockyXFactor(xf);
  var hypeFight=isHypeFightProfile(xf, arch, pim);
  var worker=isHardWorkerProfile(xf, arch);
  var pa=tp.arch||'';
  var ppg=gp>0?(G.goals+G.assists)/gp:0;
  var apg=gp>0?G.assists/gp:0;

  if(cocky&&npcDislikesCocky(tp)) out.push('Thinks you\'re full of yourself');
  if(star&&teamBad) out.push('Resents the star label while the team loses');
  if(star&&cocky&&teamBad) out.push('Media-first attitude rubs veterans wrong');
  if(xf==='careless'&&teamBad) out.push('Says you disappear when games get hard');
  if(xf==='careless'&&(G.stamina||80)<42&&gp>=4) out.push('Looks gassed — not pushing through');
  if(pim>=38&&pa!=='Enforcer'&&pa!=='Grinder'&&!hypeFight) out.push('Tired of your bad penalties');
  if(arch==='Sniper'&&(pa==='Playmaker'||pa==='TwoWay')&&gp>=6&&apg<0.25) out.push('Says you shoot instead of sharing the puck');
  if(arch==='Playmaker'&&pa==='Sniper'&&gp>=6&&ppg>=0.85&&apg<0.35) out.push('Wants more setup, less hero hockey');
  if(!worker&&(pa==='Grinder'||pa==='Enforcer'||tp.leadership==='C')) out.push('Doesn\'t think you outwork anyone');
  if(xf==='brat'&&!npcLovesHypeAndFight(tp)) out.push('Hates the drama and chirping you bring');
  if(xf==='brat'&&npcLovesHypeAndFight(tp)&&teamBad) out.push('Edge is fine — losing with noise is not');
  if(G.age<=17&&cocky&&(tp.age||20)>=27) out.push('Wants the rookie to listen more, talk less');
  if((G.plusminus||0)<=-10&&gp>=8) out.push('Blames you for the minus pile');
  if(typeof isUserHealthyScratch==='function'&&isUserHealthyScratch()&&(tp.leadership==='A'||tp.leadership==='C')) out.push('Doesn\'t like a scratch holding a roster spot');
  if(G.pos==='G'&&gp>=5){
    var shots=(G.saves||0)+(G.goalsAgainst||0);
    if(shots>=80&&(G.saves/shots)<0.88) out.push('Lost faith after recent starts in net');
  }
  if((G.morale||50)<38&&gp>=3) out.push('Says your body language tanks the room');
  if(star&&!teamGood&&pa==='Grinder') out.push('Big minutes without enough grunt work');
  if(hypeFight&&pim>=48&&(pa==='StayAtHome'||pa==='ShutdownD')) out.push('Physical play crossed the line too often');
  if(G.leadershipRole==='C'&&teamBad&&cocky) out.push('Captain talk without captain results');
  if(xf==='regular_season'&&teamBad&&npcDislikesCocky(tp)) out.push('Stats hunting while the team slides');
  if(gp>=10&&ppg<0.35&&star) out.push('Expected more production for the hype');
  if(teamGood&&cocky&&!worker&&pa==='TwoWay') out.push('Winning isn\'t enough — wants more professionalism');
  return out.slice(0,4);
}

function grievanceRepairBonus(action, grievances){
  if(!grievances||!grievances.length) return 0;
  var g=grievances.join(' ').toLowerCase(), b=0;
  if(action==='apologize'){
    if(g.indexOf('penalt')>=0||g.indexOf('crossed')>=0||g.indexOf('minus')>=0) b+=3;
    if(g.indexOf('full of yourself')>=0||g.indexOf('captain')>=0||g.indexOf('media')>=0) b+=2;
  }
  if(action==='talk'){
    if(g.indexOf('listen')>=0||g.indexOf('professional')>=0) b+=2;
    if(g.indexOf('body language')>=0||g.indexOf('disappear')>=0) b+=3;
  }
  if(action==='coffee'||action==='dinner'){
    if(g.indexOf('don\'t know')>=0||g.indexOf('drama')>=0||g.indexOf('room')>=0) b+=2;
    if(g.indexOf('sharing the puck')>=0||g.indexOf('setup')>=0) b+=1;
  }
  return b;
}

function computeTeammateRelationBase(p){
  var base=48+ri(-10,12);
  var xf=G.xFactor||'none';
  var arch=G.arch||'';
  var pim=G.pim||0;
  var teamWin=getTeamSuccessRate();
  var teamGood=teamWin>=0.52;
  var teamBad=teamWin<0.44;
  var star=isUserStarProfile();
  var cocky=isCockyXFactor(xf);
  var hypeFight=isHypeFightProfile(xf, arch, pim);
  var worker=isHardWorkerProfile(xf, arch);

  if(worker){
    base+=9;
    if(p.arch==='Grinder'||p.leadership==='C'||p.arch==='TwoWay') base+=5;
  }
  if(hypeFight&&npcLovesHypeAndFight(p)){
    base+=ri(7,15);
    if(xf==='brat'&&(p.arch==='Grinder'||p.arch==='Enforcer')) base+=8;
    if(xf==='heavy_hitter'&&p.arch!=='Sniper'&&p.arch!=='Playmaker') base+=6;
  } else if(hypeFight){
    base+=ri(1,5);
  }
  if(cocky&&npcDislikesCocky(p)){
    base-=ri(7,15);
    if(teamBad) base-=ri(3,8);
  }
  if(star){
    if(teamGood) base+=ri(5,12);
    else if(teamBad&&cocky) base-=ri(9,17);
    else if(teamBad) base-=ri(2,7);
    if(teamGood&&(p.arch==='Sniper'||p.arch==='Playmaker'||p.leadership==='C')) base+=4;
  }
  if(xf==='regular_season'){
    if(npcLovesHypeAndFight(p)) base+=5;
    if(npcDislikesCocky(p)&&!teamGood) base-=7;
  }
  if(xf==='careless'&&teamBad) base-=ri(4,11);
  if(p.leadership==='C') base+=teamGood&&star?7:3;
  if(p.leadership==='A') base+=4;
  if(p.juniorMate) base+=14;
  if(arch==='Playmaker'&&p.arch==='Sniper') base+=8;
  if(arch==='Grinder'&&p.arch==='Grinder') base+=6;
  var grievances=buildTeammateGrievances(p);
  if(grievances.length) base-=grievances.length*ri(2,5);
  return {base:cl(base,15,92), grievances:grievances};
}

function computeCoachRelationBase(coach){
  var fit=50;
  var xf=G.xFactor||'none';
  var teamWin=getTeamSuccessRate();
  var teamGood=teamWin>=0.52;
  var teamBad=teamWin<0.44;
  var star=isUserStarProfile();
  var cocky=isCockyXFactor(xf);
  if(xf==='hard_worker') fit+=10;
  if(isHardWorkerProfile(xf, G.arch)) fit+=4;
  if(xf==='brat'&&!teamGood) fit-=8;
  if(cocky&&teamBad) fit-=ri(6,12);
  if(star&&teamGood) fit+=8;
  if(star&&cocky&&teamBad) fit-=10;
  if(coach.style==='grind'&&(G.arch==='Grinder'||G.arch==='Enforcer')) fit+=10;
  if(coach.style==='skill'&&(G.arch==='Sniper'||G.arch==='Playmaker')) fit+=8;
  if(coach.style==='defensive'&&isHardWorkerProfile(xf, G.arch)) fit+=5;
  return cl(fit+ri(-5,5),18,92);
}

function applyWeeklyPersonalityRelationDrift(){
  if(!G||!G.teamRelations||!G.teamRelations.teammates) return;
  var xf=G.xFactor||'none';
  var teamWin=getTeamSuccessRate();
  var teamGood=teamWin>=0.52;
  var teamBad=teamWin<0.44;
  var star=isUserStarProfile();
  var cocky=isCockyXFactor(xf);
  var hypeFight=isHypeFightProfile(xf, G.arch, G.pim);
  var worker=isHardWorkerProfile(xf, G.arch);
  var id, rel, delta;
  for(id in G.teamRelations.teammates){
    if(!G.teamRelations.teammates.hasOwnProperty(id)) continue;
    rel=G.teamRelations.teammates[id];
    delta=0;
    if(worker) delta+=1;
    if(hypeFight&&teamGood) delta+=1;
    if(hypeFight&&teamBad&&xf==='brat') delta+=1;
    if(cocky&&teamBad) delta-=2;
    if(star&&teamGood) delta+=1;
    if(star&&cocky&&teamBad) delta-=2;
    if((G.pim||0)>=36&&hypeFight) delta+=1;
    rel.chemistry=cl(rel.chemistry+delta,15,95);
  }
  if(G.teamRelations.coach){
    var c=G.teamRelations.coach;
    if(worker) c.chemistry=cl(c.chemistry+1,15,95);
    if(cocky&&teamBad) c.chemistry=cl(c.chemistry-1,15,95);
    if(star&&teamGood) c.chemistry=cl(c.chemistry+1,15,95);
  }
}

function ensureTeamRelations(roster){
  if(!G||!roster) return;
  if(!G.teamRelations) G.teamRelations={coach:null, teammates:{}};
  var tr=G.teamRelations;
  var coach=roster.coach||{name:'Staff', style:'balanced'};
  if(!tr.coach||tr.coach.name!==coach.name){
    tr.coach={name:coach.name, style:coach.style, chemistry:computeCoachRelationBase(coach)};
  }
  roster.players.forEach(function(p){
    if(p.isMe||p.pos==='G') return;
    var id=p.id||p.first+p.last;
    var computed=computeTeammateRelationBase(p);
    if(!tr.teammates[id]){
      tr.teammates[id]={chemistry:computed.base, id:id, name:p.first+' '+p.last, grievances:computed.grievances.slice()};
    } else {
      tr.teammates[id].name=p.first+' '+p.last;
      tr.teammates[id].grievances=computed.grievances.slice();
    }
  });
}

function getTeammateRelation(playerId){
  if(!G||!G.teamRelations||!playerId) return 50;
  var t=G.teamRelations.teammates[playerId];
  return t?+t.chemistry||50:50;
}

function getCoachRelation(){
  if(!G||!G.teamRelations||!G.teamRelations.coach) return 50;
  return +G.teamRelations.coach.chemistry||50;
}

function getTeammateChemistryBonus(a, b){
  if(!a||!b) return 0;
  if(a.isMe) return (getTeammateRelation(b.id)-50)*0.08;
  if(b.isMe) return (getTeammateRelation(a.id)-50)*0.08;
  return 0;
}

function getCoachRelationDepthBonus(){
  return (getCoachRelation()-50)*0.06;
}

function getUserRosterPlayer(){
  if(!G||!G.teamRoster||!G.teamRoster.players) return null;
  for(var i=0;i<G.teamRoster.players.length;i++){
    if(G.teamRoster.players[i].isMe) return G.teamRoster.players[i];
  }
  return null;
}

function isScratchDepthSlot(slot){
  return slot&&String(slot).indexOf('SCR')>=0;
}

function isUserHealthyScratch(){
  var me=getUserRosterPlayer();
  return !!(me&&isScratchDepthSlot(me.depthSlot));
}

function isActiveProCallUp(){
  return !!(G&&G._callUpCtx&&G._callUpCtx.active);
}

function snapshotHomeSeasonStats(){
  return {
    gp:G.gp||0,w:G.w||0,l:G.l||0,otl:G.otl||0,
    goals:G.goals||0,assists:G.assists||0,plusminus:G.plusminus||0,
    pim:G.pim||0,sog:G.sog||0,saves:G.saves||0,goalsAgainst:G.goalsAgainst||0
  };
}

function restoreHomeSeasonStats(snap){
  if(!snap||!G) return;
  G.gp=snap.gp; G.w=snap.w; G.l=snap.l; G.otl=snap.otl;
  G.goals=snap.goals; G.assists=snap.assists; G.plusminus=snap.plusminus;
  G.pim=snap.pim; G.sog=snap.sog; G.saves=snap.saves; G.goalsAgainst=snap.goalsAgainst;
}

function ensureCallUpHomeSnapshot(){
  var ctx=G._callUpCtx;
  if(!ctx||!ctx.active||ctx.homeSeasonStats) return;
  var st=ctx.stintStats||{};
  ctx.homeSeasonStats={
    gp:Math.max(0,(G.gp||0)-(st.gp||0)),
    w:Math.max(0,(G.w||0)-(st.w||0)),
    l:Math.max(0,(G.l||0)-(st.l||0)),
    otl:Math.max(0,(G.otl||0)-(st.otl||0)),
    goals:Math.max(0,(G.goals||0)-(st.g||0)),
    assists:Math.max(0,(G.assists||0)-(st.a||0)),
    plusminus:(G.plusminus||0)-(st.pm||0),
    pim:Math.max(0,(G.pim||0)-(st.pim||0)),
    sog:Math.max(0,(G.sog||0)-(st.sog||0)),
    saves:Math.max(0,(G.saves||0)-(st.sv||0)),
    goalsAgainst:Math.max(0,(G.goalsAgainst||0)-(st.ga||0))
  };
}

function archiveCallUpStint(ctx){
  if(!ctx||!G) return;
  var st=ctx.stintStats||{};
  if(!(st.gp>0)) return;
  if(!G.seasonCallUps) G.seasonCallUps=[];
  var lg=LEAGUES[ctx.proLeagueKey];
  var i, existing=null;
  for(i=0;i<G.seasonCallUps.length;i++){
    var r=G.seasonCallUps[i];
    if(r.season===G.season&&r.leagueKey===ctx.proLeagueKey&&r.team===ctx.proTeamName){ existing=r; break; }
  }
  if(existing){
    existing.gp+=st.gp; existing.g=(existing.g||0)+(st.g||0); existing.a=(existing.a||0)+(st.a||0);
    existing.sv=(existing.sv||0)+(st.sv||0); existing.ga=(existing.ga||0)+(st.ga||0);
    existing.w=(existing.w||0)+(st.w||0); existing.l=(existing.l||0)+(st.l||0); existing.otl=(existing.otl||0)+(st.otl||0);
    existing.pm=(existing.pm||0)+(st.pm||0); existing.pim=(existing.pim||0)+(st.pim||0); existing.sog=(existing.sog||0)+(st.sog||0);
  } else {
    G.seasonCallUps.push({
      season:G.season,
      leagueKey:ctx.proLeagueKey,
      league:(lg&&lg.short)||ctx.proLeagueKey,
      team:ctx.proTeamName,
      gp:st.gp,g:st.g||0,a:st.a||0,sv:st.sv||0,ga:st.ga||0,
      w:st.w||0,l:st.l||0,otl:st.otl||0,pm:st.pm||0,pim:st.pim||0,sog:st.sog||0,
      isGoalie:G.pos==='G'
    });
  }
}

function formatCallUpStatLine(row){
  if(!row) return '';
  if(row.isGoalie||G.pos==='G'){
    return row.gp+' GP · '+row.sv+' SV · SV% '+formatSvPctFromCounts(row.sv,row.ga);
  }
  return row.gp+' GP · '+(row.g||0)+'G '+(row.a||0)+'A '+((row.g||0)+(row.a||0))+'PTS';
}

function buildSeasonCallUpSplitsHtml(){
  if(!G) return '';
  var html='', i, row, homeShort;
  if(isActiveProCallUp()){
    ensureCallUpHomeSnapshot();
    var cu=G._callUpCtx;
    homeShort=LEAGUES[cu.homeLeagueKey]?LEAGUES[cu.homeLeagueKey].short:cu.homeLeagueKey;
    var hs=cu.homeSeasonStats||{};
    html+='<div style="font-size:11px;color:var(--mut);margin-top:6px;line-height:1.45">'+escHtml(homeShort)+' '+escHtml(cu.homeTeam||'')+' (home): '+
      (hs.gp||0)+' GP'+(G.pos==='G'?'':' · '+(hs.goals||0)+'G '+(hs.assists||0)+'A')+'</div>';
  }
  var list=G.seasonCallUps||[];
  var merged={}, keys=[], ki, mk, row;
  for(i=0;i<list.length;i++){
    row=list[i];
    if(row.season!==G.season) continue;
    mk=(row.leagueKey||row.league||'')+'|'+row.team;
    if(!merged[mk]){
      merged[mk]={league:row.league,team:row.team,gp:0,g:0,a:0,sv:0,ga:0,isGoalie:!!row.isGoalie};
      keys.push(mk);
    }
    var m=merged[mk];
    m.gp+=row.gp||0; m.g+=row.g||0; m.a+=row.a||0; m.sv+=row.sv||0; m.ga+=row.ga||0;
  }
  for(ki=0;ki<keys.length;ki++){
    row=merged[keys[ki]];
    html+='<div style="font-size:11px;color:var(--gold);margin-top:4px;line-height:1.45">CALL-UP · '+escHtml(row.league||'')+' '+escHtml(row.team||'')+': '+formatCallUpStatLine(row)+'</div>';
  }
  return html;
}

function getHubSeasonStatBundle(){
  if(isActiveProCallUp()){
    ensureCallUpHomeSnapshot();
    var st=G._callUpCtx.stintStats||{};
    return {
      gp:st.gp||0,w:st.w||0,l:st.l||0,otl:st.otl||0,
      goals:st.g||0,assists:st.a||0,plusminus:st.pm||0,pim:st.pim||0,
      saves:st.sv||0,goalsAgainst:st.ga||0
    };
  }
  return {
    gp:G.gp||0,w:G.w||0,l:G.l||0,otl:G.otl||0,
    goals:G.goals||0,assists:G.assists||0,plusminus:G.plusminus||0,pim:G.pim||0,
    saves:G.saves||0,goalsAgainst:G.goalsAgainst||0
  };
}

function buildHubSeasonStatGridHtml(){
  var s=getHubSeasonStatBundle();
  var splits=buildSeasonCallUpSplitsHtml();
  var html;
  if(G.pos==='G'){
    var gaaSzn=s.gp>0?Math.round((s.goalsAgainst/s.gp)*100)/100:'--';
    html=
      '<div class="stbox"><div class="stlbl">GP</div><div class="stval">'+s.gp+'</div></div>'+
      '<div class="stbox"><div class="stlbl">GA</div><div class="stval" style="color:var(--red)">'+s.goalsAgainst+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SV</div><div class="stval" style="color:var(--green)">'+s.saves+'</div></div>'+
      '<div class="stbox"><div class="stlbl">SV%</div><div class="stval" style="color:var(--gold)">'+formatSvPctFromCounts(s.saves,s.goalsAgainst)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">GAA</div><div class="stval">'+gaaSzn+'</div></div>'+
      '<div class="stbox"><div class="stlbl">W-L-OTL</div><div class="stval" style="color:var(--gold)">'+s.w+'-'+s.l+'-'+s.otl+'</div></div>';
  } else {
    var pimClr=typeof getHubPimDisplayColor==='function'?getHubPimDisplayColor(s.pim,G.pos,G.arch,G.xFactor):'var(--text)';
    html=
      '<div class="stbox"><div class="stlbl">GP</div><div class="stval">'+s.gp+'</div></div>'+
      '<div class="stbox"><div class="stlbl">G</div><div class="stval" style="color:var(--red)">'+s.goals+'</div></div>'+
      '<div class="stbox"><div class="stlbl">A</div><div class="stval" style="color:var(--acc)">'+s.assists+'</div></div>'+
      '<div class="stbox"><div class="stlbl">PTS</div><div class="stval" style="color:var(--gold)">'+(s.goals+s.assists)+'</div></div>'+
      '<div class="stbox"><div class="stlbl">+/-</div><div class="stval" style="color:'+(s.plusminus>=0?'var(--green)':'var(--red)')+'">'+(s.plusminus>=0?'+':'')+s.plusminus+'</div></div>'+
      '<div class="stbox"><div class="stlbl">PIM</div><div class="stval" style="color:'+pimClr+'">'+s.pim+'</div></div>';
  }
  if(splits) html+='<div style="grid-column:1/-1">'+splits+'</div>';
  return html;
}

function pushCallUpSeasonLogEntries(){
  if(!G||!G.seasonCallUps||!G.seasonCallUps.length) return;
  var i, row, lg, entry;
  for(i=0;i<G.seasonCallUps.length;i++){
    row=G.seasonCallUps[i];
    if(row.season!==G.season||row._logged) continue;
    lg=row.league||row.leagueKey||'';
    entry={
      year:G.year,season:G.season,league:lg,leagueKey:row.leagueKey||'',
      team:String(row.team||'').split(' ').slice(-1)[0]||row.team||'',
      gp:row.gp,w:row.w,l:row.l,otl:row.otl,ovrVal:ovr(G.attrs,G.pos),
      wonCup:false,isGoalie:!!row.isGoalie,callUp:true
    };
    if(row.isGoalie||G.pos==='G'){
      entry.sv=row.sv||0; entry.ga=row.ga||0;
      entry.svpct=entry.sv+entry.ga>0?entry.sv/(entry.sv+entry.ga):null;
      entry.gaa=row.gp>0?Math.round((entry.ga/row.gp)*100)/100:'--';
    } else {
      entry.g=row.g||0; entry.a=row.a||0;
    }
    G.seasonLog.push(entry);
    row._logged=true;
  }
}

function mergeCallUpSeasonsIntoCareerLeagueStats(){
  if(!G||!G.seasonCallUps||!G.seasonCallUps.length) return;
  if(!G.careerLeagueStats) G.careerLeagueStats={};
  var i, row, ck, c;
  for(i=0;i<G.seasonCallUps.length;i++){
    row=G.seasonCallUps[i];
    if(row.season!==G.season||row._careerMerged) continue;
    ck=row.leagueKey;
    if(!ck) continue;
    if(!G.careerLeagueStats[ck]) G.careerLeagueStats[ck]=emptyPlayerStats();
    c=G.careerLeagueStats[ck];
    c.gp+=row.gp||0; c.g+=row.g||0; c.a+=row.a||0; c.pts+=(row.g||0)+(row.a||0);
    c.pm+=row.pm||0; c.pim=(c.pim||0)+(row.pim||0);
    c.sv=(c.sv||0)+(row.sv||0); c.ga=(c.ga||0)+(row.ga||0); c.w=(c.w||0)+(row.w||0);
    row._careerMerged=true;
  }
}

function isJuniorCallUpBlocked(){
  if(!G||!G.league||G.league.tier!=='junior') return false;
  if(typeof canAcademyJuniorReceiveProCallUp==='function'&&canAcademyJuniorReceiveProCallUp()) return false;
  return true;
}

function canPlayerReceiveProCallUp(){
  if(!G||!G.league||G._callUpCtx&&G._callUpCtx.active) return false;
  if(isJuniorCallUpBlocked()) return false;
  if(G.league.tier==='pro') return false;
  if(typeof isProAcademyJuniorLeague==='function'&&isProAcademyJuniorLeague(G.leagueKey)){
    return typeof hasAcademyOrgContract==='function'&&hasAcademyOrgContract()&&!!G._academyParentOrg;
  }
  return true;
}

function getCallUpParentClub(){
  if(typeof hasAcademyOrgContract==='function'&&hasAcademyOrgContract()&&G._academyParentOrg){
    return {leagueKey:G._academyParentOrg.leagueKey, teamName:G._academyParentOrg.teamName};
  }
  var proKey=typeof getProLeagueKeyByGender==='function'?getProLeagueKeyByGender(G.gender):'PHL';
  if(G.draftRights&&G.draftRights.leagueKey===proKey&&G.draftRights.team){
    return {leagueKey:proKey, teamName:G.draftRights.team};
  }
  if(G.league.tier==='minor'&&G.draftRights&&G.draftRights.team){
    return {leagueKey:proKey, teamName:G.draftRights.team};
  }
  if(G.draftRights&&G.draftRights.leagueKey&&G.draftRights.team){
    return {leagueKey:G.draftRights.leagueKey, teamName:G.draftRights.team};
  }
  if(G.league.tier==='minor'||G.league.tier==='college'){
    var teams=typeof TEAMS!=='undefined'?TEAMS[proKey]:null;
    if(teams&&teams.length){
      var pick=teams[ri(0,teams.length-1)];
      return {leagueKey:proKey, teamName:pick.n};
    }
  }
  return null;
}

function startProCallUp(parent, games, role){
  if(!parent||!games) return;
  G._callUpCtx={
    active:true,
    homeLeagueKey:G.leagueKey,
    homeTeam:G.team&&G.team.n,
    homeTeamObj:G.team?{n:G.team.n,e:G.team.e||'[-]'}:null,
    homeSeasonStats:snapshotHomeSeasonStats(),
    proLeagueKey:parent.leagueKey,
    proTeamName:parent.teamName,
    gamesLeft:games,
    gamesTotal:games,
    startWeek:G.week||1,
    role:role||'depth',
    stintStats:{gp:0,g:0,a:0,sv:0,ga:0,w:0,l:0,otl:0,pm:0,sog:0,pim:0,perfSum:0,badGames:0,lastPerf:0}
  };
  var proTeam=typeof getValidTeamForLeague==='function'
    ?getValidTeamForLeague(parent.leagueKey, parent.teamName)
    :{n:parent.teamName,e:'[-]'};
  G.team=proTeam;
  G.leagueKey=parent.leagueKey;
  G.league=LEAGUES[parent.leagueKey];
  G.teamRoster=null;
  G._teamRosterKey=null;
  var lg=LEAGUES[parent.leagueKey];
  addNews('CALL-UP: '+lg.short+' '+parent.teamName+' — '+games+' game'+(games>1?'s':'')+' as '+(role==='lineup'?'lineup depth':'extra depth')+'.','big');
  notify('PRO CALL-UP','gold');
}

function endProCallUpStint(reason){
  var ctx=G._callUpCtx;
  if(!ctx||!ctx.active) return;
  var homeLg=LEAGUES[ctx.homeLeagueKey];
  var proShort=LEAGUES[ctx.proLeagueKey]?LEAGUES[ctx.proLeagueKey].short:ctx.proLeagueKey;
  archiveCallUpStint(ctx);
  ensureCallUpHomeSnapshot();
  if(ctx.homeSeasonStats) restoreHomeSeasonStats(ctx.homeSeasonStats);
  G.leagueKey=ctx.homeLeagueKey;
  G.league=homeLg;
  G.team=ctx.homeTeamObj||{n:ctx.homeTeam,e:'[-]'};
  if(typeof getValidTeamForLeague==='function'){
    G.team=getValidTeamForLeague(ctx.homeLeagueKey, ctx.homeTeam);
  }
  G._callUpCtx=null;
  G.teamRoster=null;
  G._teamRosterKey=null;
  if(typeof syncUserStandingsRow==='function') syncUserStandingsRow();
  if(typeof refreshStandings==='function') refreshStandings(G.leagueKey);
  if(reason==='performance'){
    addNews(proShort+' '+ctx.proTeamName+' sends '+G.first+' '+G.last+' back down — the call-up wasn\'t working out.','bad');
    notify('SENT DOWN EARLY','red');
    G.morale=cl((G.morale||50)-8,0,100);
  } else {
    addNews('SENT DOWN: Back with '+homeLg.short+' '+G.team.n+'.','neutral');
    notify('RETURNED TO '+homeLg.short,'gold');
  }
}

function recordProCallUpGameResult(opts){
  var ctx=G._callUpCtx;
  if(!ctx||!ctx.active||!opts) return;
  if(!ctx.stintStats) ctx.stintStats={gp:0,g:0,a:0,sv:0,ga:0,w:0,l:0,otl:0,pm:0,sog:0,pim:0,perfSum:0,badGames:0,lastPerf:0};
  var st=ctx.stintStats;
  st.gp++;
  st.g+=opts.g||0;
  st.a+=opts.a||0;
  st.sv+=opts.sv||0;
  st.ga+=opts.ga||0;
  st.pm+=opts.pm||0;
  st.sog=(st.sog||0)+(opts.sog||0);
  st.pim=(st.pim||0)+(opts.pim||0);
  if(opts.won) st.w++;
  else if(opts.tied) st.otl++;
  else st.l++;
  var perfN=opts.perfN;
  if(typeof perfN!=='number'||!isFinite(perfN)){
    var gameSv=opts.sv||0, gameGa=opts.ga||0;
    var svpct=gameSv+gameGa>0?gameSv/(gameSv+gameGa):0;
    perfN=typeof blendedGamePerformanceNumeric==='function'
      ?blendedGamePerformanceNumeric(G.pos,opts.g||0,opts.a||0,svpct,!!opts.won,72)
      :50;
  }
  st.lastPerf=perfN;
  st.perfSum+=perfN;
  if(perfN<55) st.badGames++;
}

function shouldSendDownCallUpForPerformance(){
  var ctx=G._callUpCtx;
  if(!ctx||!ctx.active||!ctx.stintStats) return false;
  var st=ctx.stintStats;
  if(st.gp<1) return false;
  var avgPerf=st.perfSum/st.gp;
  var pts=st.g+st.a;

  if(st.lastPerf<=48) return true;

  if(G.pos==='G'){
    var svpct=st.sv+st.ga>0?st.sv/(st.sv+st.ga):0;
    if(st.gp===1&&svpct<0.84&&st.ga>=3) return true;
    if(st.gp>=2&&svpct<0.875&&avgPerf<55) return true;
    if(st.gp>=2&&st.badGames>=2&&avgPerf<62) return true;
    return false;
  }

  if(st.gp===1&&!st.w&&pts===0&&st.lastPerf<=52) return true;
  if(st.gp>=2&&pts===0&&(st.l+st.otl)>=2&&avgPerf<58) return true;
  if(st.gp>=2&&st.badGames>=2&&avgPerf<58) return true;
  if(st.gp>=2&&avgPerf<52) return true;
  return false;
}

function getProCallUpGamesPlayed(){
  var ctx=G._callUpCtx;
  if(!ctx||!ctx.active||!ctx.stintStats) return 0;
  return ctx.stintStats.gp||0;
}

function ensureProCallUpStintComplete(){
  var ctx=G._callUpCtx;
  if(!ctx||!ctx.active) return;
  if(getProCallUpGamesPlayed()>=(ctx.gamesTotal||0)) endProCallUpStint();
}

function tickProCallUpAfterGame(gameOpts){
  var ctx=G._callUpCtx;
  if(!ctx||!ctx.active) return;
  if(gameOpts) recordProCallUpGameResult(gameOpts);
  if(shouldSendDownCallUpForPerformance()){
    endProCallUpStint('performance');
    return;
  }
  ctx.gamesLeft--;
  if(ctx.gamesLeft>0){
    addNews('CALL-UP: '+ctx.gamesLeft+' pro game'+(ctx.gamesLeft>1?'s':'')+' left on this stint.','neutral');
    return;
  }
  endProCallUpStint();
}

function hubReturnFromProCallUp(){
  if(!G._callUpCtx||!G._callUpCtx.active) return;
  endProCallUpStint();
  if(typeof renderHub==='function') renderHub();
}

function rollWeeklyCallUpOffer(){
  if(!canPlayerReceiveProCallUp()) return;
  var parent=getCallUpParentClub();
  if(!parent) return;
  var uOvr=ovr(G.attrs,G.pos);
  var floor=typeof getProHardDevelopmentFloorOvr==='function'?getProHardDevelopmentFloorOvr():75;
  var academyJunior=typeof isProAcademyJuniorLeague==='function'&&isProAcademyJuniorLeague(G.leagueKey);
  if(academyJunior){
    floor-=10;
    if(typeof syncPlayerAcademyBand==='function') syncPlayerAcademyBand();
    if(G._academyBand==='PRO_CALLUP') floor-=6;
  }
  if(uOvr<floor-10) return;
  var chance=academyJunior?0.04:0.018;
  if(isUserHealthyScratch()) chance+=0.075;
  if(G.league.tier==='minor') chance+=0.035;
  if(G.draftRights) chance+=0.028;
  if(uOvr>=floor) chance+=0.04;
  if(getCoachRelation()>=65) chance+=0.015;
  if(academyJunior){
    if(G._academyBand==='PRO_CALLUP') chance+=0.14;
    else if(G._academyBand==='U20') chance+=0.05;
    if(uOvr>=getAcademyEarlySignOvrThreshold(G.leagueKey)) chance+=0.06;
  }
  if(Math.random()>=chance) return;
  var games=academyJunior&&G._academyBand==='PRO_CALLUP'?ri(2,5):ri(1,4);
  var role=(academyJunior&&(G._academyBand==='PRO_CALLUP'||uOvr>=getAcademyEarlySignOvrThreshold(G.leagueKey)))?'lineup':'depth';
  startProCallUp(parent, games, role);
}

function nudgeRelationsAfterWeek(){
  if(!G||!G.teamRelations) return;
  var roster=typeof ensureTeamRoster==='function'?ensureTeamRoster():null;
  if(!roster) return;
  ensureTeamRelations(roster);
  applyWeeklyPersonalityRelationDrift();
  var me=getUserRosterPlayer();
  if(me&&me.depthSlot){
    var mates=[], i, s, pl;
    var d=roster.depth;
    if(d){
      if(me.pos==='F'&&d.forwards){
        var myLine=getDepthLineFromSlot(me.depthSlot,'F');
        for(i=0;i<d.forwards.length;i++){
          s=d.forwards[i];
          if(s.player&&!s.player.isMe&&getDepthLineFromSlot(s.slot,'F')===myLine) mates.push(s.player);
        }
      }
      if(me.pos==='D'&&d.defense){
        var myPair=getDepthLineFromSlot(me.depthSlot,'D');
        for(i=0;i<d.defense.length;i++){
          s=d.defense[i];
          if(s.player&&!s.player.isMe&&getDepthLineFromSlot(s.slot,'D')===myPair) mates.push(s.player);
        }
      }
    }
    for(i=0;i<mates.length;i++){
      pl=mates[i];
      var rel=G.teamRelations.teammates[pl.id];
      if(!rel) continue;
      rel.chemistry=cl(rel.chemistry+(G.morale>=55?ri(0,2):ri(-2,0)),15,95);
    }
  }
  if(G.teamRelations.coach){
    var c=G.teamRelations.coach;
    if(G.gp>0){
      var ppg=(G.goals+G.assists)/Math.max(1,G.gp);
      if(ppg>=0.7) c.chemistry=cl(c.chemistry+1,15,95);
      else if(ppg<0.25&&G.gp>=5) c.chemistry=cl(c.chemistry-1,15,95);
    }
  }
}

function purgeScratchesFromActiveChart(slots){
  if(!slots) return;
  var units=[slots.forwards, slots.defense, slots.pp1, slots.pp2, slots.pk1, slots.pk2], u, i, pl;
  for(u=0;u<units.length;u++){
    if(!units[u]) continue;
    for(i=0;i<units[u].length;i++){
      pl=units[u][i].player;
      if(pl&&isScratchDepthSlot(pl.depthSlot)) units[u][i].player=null;
    }
  }
}

function collectActiveChartPlayerIds(slots){
  var ids={}, units=[slots.forwards, slots.defense, slots.goalies], u, i, pl;
  for(u=0;u<units.length;u++){
    if(!units[u]) continue;
    for(i=0;i<units[u].length;i++){
      pl=units[u][i].player;
      if(pl) ids[pl.id]=units[u][i].slot;
    }
  }
  return ids;
}

function getCoachOpinionText(chem){
  var c=+chem||50;
  var xf=G.xFactor||'none';
  var teamBad=getTeamSuccessRate()<0.44;
  var star=isUserStarProfile();
  if(c>=78) return '"Trusts your buy-in — you\'re coachable and show up."';
  if(c>=62){
    if(isHardWorkerProfile(xf,G.arch)) return '"Likes the work ethic. Keep stacking good shifts."';
    return '"No issues. You know the system."';
  }
  if(c>=45) return '"Watching you — need more consistency."';
  if(c>=30){
    if(isCockyXFactor(xf)&&teamBad) return '"Thinks you\'re worried about the wrong things while we lose."';
    return '"Friction in the room. Fix it or ice time slips."';
  }
  if(star&&isCockyXFactor(xf)) return '"Star label, bad body language — I\'m losing patience."';
  return '"Doesn\'t trust the commitment right now."';
}

function getTeammateOpinionText(tp, chem, tags){
  var c=+chem||50;
  var xf=G.xFactor||'none';
  var arch=G.arch||'';
  var pa=tp.arch||'';
  var star=isUserStarProfile();
  var teamBad=getTeamSuccessRate()<0.44;
  var teamGood=getTeamSuccessRate()>=0.52;
  tags=tags||'';
  if(c>=78){
    if(isHardWorkerProfile(xf,arch)) return '"Guy you want on a road trip — no drama, all work."';
    if(xf==='brat'||xf==='heavy_hitter') return '"Brings juice every night — room feeds off it."';
    if(pa==='Sniper'||pa==='Playmaker') return '"Makes my job easier — legit top-line trust."';
    return '"Real teammate. I\'d go to war with this guy."';
  }
  if(c>=62){
    if(tags.indexOf('linemate')>=0) return '"Good chemistry on the ice — we\'re figuring it out."';
    return '"Solid in the room. No complaints."';
  }
  if(c>=45) return '"Fine. We\'re not tight, but it\'s professional."';
  if(c>=30){
    if(isCockyXFactor(xf)&&star&&teamBad) return '"All the swagger, team\'s losing — prove it or pipe down."';
    if(isCockyXFactor(xf)) return '"Thinks the sun shines out of them. Annoying sometimes."';
    if(xf==='careless'&&teamBad) return '"Checks out when it\'s hard — hard to respect."';
    if(pa==='Grinder'||pa==='Enforcer') return '"Wants the glory without the grunt work."';
    return '"Something\'s off — don\'t love playing with them yet."';
  }
  if(isCockyXFactor(xf)&&star) return '"Big name, big mouth, team\'s paying for it."';
  if(xf==='brat') return '"Loves the attention more than the team."';
  if(isHardWorkerProfile(xf,arch)&&teamGood) return '"Works hard but we just don\'t click — feels cold."';
  if(pa==='Grinder') return '"Soft. Not my kind of player."';
  return '"Bad blood. I\'d rather be traded than keep this."';
}

function getRoomReputationBlurb(){
  var roster=typeof ensureTeamRoster==='function'?ensureTeamRoster():null;
  if(!roster||!G.teamRelations) return '';
  var list=roster.players.filter(function(p){return !p.isMe&&p.pos!=='G';});
  if(!list.length) return '';
  var sum=0, n=0, tense=0, i, rel;
  for(i=0;i<list.length;i++){
    rel=getTeammateRelation(list[i].id);
    sum+=rel; n++;
    if(rel<45) tense++;
  }
  var avg=n?sum/n:50;
  if(avg>=72&&tense===0) return 'The room rates you highly — you\'re one of the guys.';
  if(avg>=58) return 'Most teammates are fine with you — a few relationships could be warmer.';
  if(tense>=3) return 'Several guys have issues with you — the locker room feels split.';
  if(avg<40) return 'Word is you\'re not well liked right now — relationships need work.';
  return 'Mixed opinions in the room — some trust you, some don\'t.';
}

function ensureRelationRepairBudget(){
  if((G._relationRepairsWeek|0)!==(G.week|0)){
    G._relationRepairsWeek=G.week;
    G._relationRepairCount=0;
  }
}

function bumpRelation(targetId, delta, isCoach){
  if(!G.teamRelations) return 0;
  if(isCoach&&G.teamRelations.coach){
    G.teamRelations.coach.chemistry=cl(G.teamRelations.coach.chemistry+delta,15,95);
    return G.teamRelations.coach.chemistry;
  }
  var rel=G.teamRelations.teammates[targetId];
  if(!rel) return 0;
  rel.chemistry=cl(rel.chemistry+delta,15,95);
  return rel.chemistry;
}

function findRosterPlayerById(roster, id){
  if(!roster||!id) return null;
  for(var i=0;i<roster.players.length;i++){
    if(roster.players[i].id===id) return roster.players[i];
  }
  return null;
}

function hubRepairRelation(targetId, action){
  if(!G||!G.teamRelations) return;
  ensureRelationRepairBudget();
  if((G._relationRepairCount|0)>=3){
    notify('You\'ve done enough relationship work this week — try again next week.','gold');
    return;
  }
  var roster=typeof ensureTeamRoster==='function'?ensureTeamRoster():null;
  if(!roster) return;
  var isCoach=targetId==='coach';
  var tp=isCoach?null:findRosterPlayerById(roster, targetId);
  if(!isCoach&&!tp){ notify('Player not found.','red'); return; }
  var before=isCoach?getCoachRelation():getTeammateRelation(targetId);
  var name=isCoach?(G.teamRelations.coach&&G.teamRelations.coach.name||'Coach'):(tp.first+' '+tp.last);
  var relObj=!isCoach&&G.teamRelations.teammates[targetId]?G.teamRelations.teammates[targetId]:null;
  var grievances=relObj&&relObj.grievances?relObj.grievances:[];
  var delta=0, news='', tone='neutral', staminaCost=0, moneyCost=0, ok=true;

  if(action==='talk'){
    staminaCost=8;
    if((G.stamina|0)<staminaCost){ notify('Too tired for a real conversation (need '+staminaCost+' stamina).','red'); return; }
    if(before>=78){ delta=ri(0,2); news='Quick chat with '+name+' — already tight, but good to check in.'; }
    else if(before>=45){ delta=ri(2,6); news=name+' heard you out — tension eased a little.'; tone='good'; }
    else if(isCockyXFactor(G.xFactor)&&Math.random()<0.28){
      delta=ri(-1,2); news=name+' didn\'t buy the talk — came off cocky.'; tone=delta>0?'neutral':'bad';
    } else {
      delta=ri(4,9); news='Honest talk with '+name+' — walls came down some.'; tone='good';
    }
    delta+=grievanceRepairBonus('talk', grievances);
  } else if(action==='apologize'){
    staminaCost=5;
    if((G.stamina|0)<staminaCost){ notify('Need '+staminaCost+' stamina.','red'); return; }
    if(before>=70){ delta=ri(-1,1); news=name+' shrugged — "for what?" Awkward, but harmless.'; }
    else if(before<45){
      delta=ri(6,12); news='You owned it with '+name+' — respect for not ducking it.'; tone='good';
    } else {
      delta=ri(4,8); news='Apology accepted by '+name+' — room notices maturity.'; tone='good';
    }
    if(isCockyXFactor(G.xFactor)&&before<40&&Math.random()<0.32){
      delta=Math.max(1,delta-3); news=name+' thinks the apology was performative — but some of it landed.'; tone='neutral';
    }
    delta+=grievanceRepairBonus('apologize', grievances);
  } else if(action==='coffee'){
    staminaCost=5;
    if((G.stamina|0)<staminaCost){ notify('Need '+staminaCost+' stamina.','red'); return; }
    delta=ri(5,10)+grievanceRepairBonus('coffee', grievances);
    news='Coffee with '+name+' — off-ice bond helped.'; tone='good';
  } else if(action==='dinner'){
    moneyCost=typeof getRelationRepairCost==='function'?getRelationRepairCost(2800):2800;
    if(typeof ensurePlayerFinances==='function') ensurePlayerFinances();
    if((G.bankBalance||0)<moneyCost){ notify('Team dinner costs '+fmt(moneyCost)+' — not enough in the bank.','red'); return; }
    G.bankBalance=(G.bankBalance||0)-moneyCost;
    staminaCost=4;
    if((G.stamina|0)<staminaCost){ G.bankBalance+=moneyCost; notify('Need '+staminaCost+' stamina.','red'); return; }
    delta=ri(6,13)+grievanceRepairBonus('dinner', grievances);
    if(tp&&npcLovesHypeAndFight(tp)&&isHypeFightProfile(G.xFactor,G.arch,G.pim)) delta+=3;
    news='You picked up dinner for '+name+' — instant goodwill.'; tone='good';
    G.morale=cl(G.morale+2,0,100);
  } else if(action==='coach_meet'&&isCoach){
    staminaCost=6;
    if((G.stamina|0)<staminaCost){ notify('Need '+staminaCost+' stamina.','red'); return; }
    if(isHardWorkerProfile(G.xFactor,G.arch)) delta=ri(4,9);
    else if(isCockyXFactor(G.xFactor)&&getTeamSuccessRate()<0.45) delta=ri(0,3);
    else delta=ri(3,8);
    news='Film-room sit-down with '+name+' — cleared the air on your role.'; tone='good';
  } else if(action==='line_bond'){
    staminaCost=10;
    moneyCost=typeof getRelationRepairCost==='function'?getRelationRepairCost(4500):4500;
    if(typeof ensurePlayerFinances==='function') ensurePlayerFinances();
    if((G.bankBalance||0)<moneyCost){ notify('Line dinner runs '+fmt(moneyCost)+' — not enough in the bank.','red'); return; }
    if((G.stamina|0)<staminaCost){ notify('Need '+staminaCost+' stamina.','red'); return; }
    G.bankBalance-=moneyCost;
    var me=getUserRosterPlayer();
    var fixed=0, j, lm, rel;
    if(me&&roster.depth){
      var myLine=getDepthLineFromSlot(me.depthSlot,me.pos);
      var unit=me.pos==='F'?roster.depth.forwards:roster.depth.defense;
      if(unit&&!isScratchDepthSlot(me.depthSlot)){
        for(j=0;j<unit.length;j++){
          if(!unit[j].player||unit[j].player.isMe) continue;
          if(getDepthLineFromSlot(unit[j].slot,me.pos)!==myLine) continue;
          rel=G.teamRelations.teammates[unit[j].player.id];
          if(rel){ rel.chemistry=cl(rel.chemistry+ri(4,9),15,95); fixed++; }
        }
      }
    }
    if(fixed<1){ G.bankBalance+=moneyCost; notify('No linemates on the chart to invite.','gold'); return; }
    G.stamina=cl(G.stamina-staminaCost,0,100);
    G._relationRepairCount=(G._relationRepairCount||0)+1;
    addNews('LINE DINNER: You treated the unit — chemistry bumped with '+fixed+' teammate'+(fixed>1?'s':'')+'.','good');
    notify('LINE BONDING','green');
    renderHub(); hubTab('team');
    return;
  } else {
    notify('Unknown action.','red');
    return;
  }

  if(!ok) return;
  G.stamina=cl(G.stamina-staminaCost,0,100);
  var afterVal=bumpRelation(targetId, delta, isCoach);
  if(relObj&&afterVal>=50&&grievances.length){
    relObj.grievances=grievances.slice(1);
  } else if(relObj&&afterVal>=62){
    relObj.grievances=[];
  }
  G._relationRepairCount=(G._relationRepairCount||0)+1;
  addNews(news, tone);
  var afterRound=Math.round(afterVal);
  var beforeRound=Math.round(before);
  if(delta>=4) notify('BOND STRENGTHENED — '+beforeRound+' → '+afterRound,'green');
  else if(delta>0) notify('+'+delta+' chemistry ('+beforeRound+' → '+afterRound+')','gold');
  else notify('No progress with '+name+' ('+beforeRound+' → '+afterRound+')','red');
  renderHub(); hubTab('team');
}

function renderTeammateRelationCard(tp, tr, me, roster){
  var r2=tr.teammates[tp.id]||{chemistry:50};
  var lb2=relationLabel(r2.chemistry);
  var tags='';
  if(me&&tp.depthSlot&&!isScratchDepthSlot(tp.depthSlot)){
    if(me.pos==='F'&&tp.pos==='F'&&getDepthLineFromSlot(me.depthSlot,'F')===getDepthLineFromSlot(tp.depthSlot,'F')) tags+='linemate ';
    if(me.pos==='D'&&tp.pos==='D'&&getDepthLineFromSlot(me.depthSlot,'D')===getDepthLineFromSlot(tp.depthSlot,'D')) tags+='linemate ';
  }
  if(tp.ppSlot&&me&&me.ppSlot&&tp.ppSlot===me.ppSlot) tags+='pp ';
  if(tp.pkSlot&&me&&me.pkSlot&&tp.pkSlot===me.pkSlot) tags+='pk ';
  var opinion=getTeammateOpinionText(tp, r2.chemistry, tags);
  var tagHtml='';
  if(tags.indexOf('linemate')>=0) tagHtml+=' <span style="color:var(--acc);font-size:11px">linemate</span>';
  if(tags.indexOf('pp')>=0) tagHtml+=' <span style="color:#7ad4ff;font-size:11px">PP</span>';
  if(tags.indexOf('pk')>=0) tagHtml+=' <span style="color:#e8a85c;font-size:11px">PK</span>';
  var html='<div style="padding:10px;border:1px solid rgba(122,184,224,.18);margin-bottom:8px;background:rgba(12,26,36,.4)">';
  html+='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">';
  html+='<div><div style="font-size:14px;color:var(--wht)">'+escHtml(tp.first+' '+tp.last)+tagHtml+'</div>';
  html+='<div style="font-size:11px;color:var(--mut);margin-top:2px">'+archShortLabel(tp.arch)+(tp.leadership==='C'?' · C':tp.leadership==='A'?' · A':'')+'</div></div>';
  html+='<div style="text-align:right"><div style="font-size:12px;color:'+lb2.color+'">'+lb2.text+'</div>';
  html+='<div style="font-size:11px;color:var(--mut)">'+Math.round(r2.chemistry)+'/100</div></div></div>';
  html+='<div style="font-size:12px;color:var(--wht);font-style:italic;margin-top:8px;line-height:1.45;border-left:2px solid rgba(122,184,224,.35);padding-left:8px">'+escHtml(opinion)+'</div>';
  if(r2.grievances&&r2.grievances.length&&r2.chemistry<62){
    html+='<div style="font-size:11px;color:var(--gold);margin-top:8px;line-height:1.45"><b>Why they\'re cold:</b><ul style="margin:4px 0 0 16px;padding:0">';
    for(var gi=0;gi<r2.grievances.length;gi++){
      html+='<li>'+escHtml(r2.grievances[gi])+'</li>';
    }
    html+='</ul></div>';
  }
  if(r2.chemistry<62){
    html+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">';
    var tid=jsClickArg(tp.id);
    var dinnerCost=typeof getRelationRepairCost==='function'?getRelationRepairCost(2800):2800;
    html+='<button type="button" class="btn bs" style="font-size:11px;padding:4px 8px" onclick="hubRepairRelation('+tid+',\'talk\')">TALK IT OUT</button>';
    if(r2.chemistry<45) html+='<button type="button" class="btn bs" style="font-size:11px;padding:4px 8px" onclick="hubRepairRelation('+tid+',\'apologize\')">APOLOGIZE</button>';
    html+='<button type="button" class="btn bs" style="font-size:11px;padding:4px 8px" onclick="hubRepairRelation('+tid+',\'coffee\')">COFFEE</button>';
    html+='<button type="button" class="btn bs" style="font-size:11px;padding:4px 8px" onclick="hubRepairRelation('+tid+',\'dinner\')">DINNER ('+fmt(dinnerCost)+')</button>';
    html+='</div>';
  }
  html+='</div>';
  return html;
}

function assignHealthyScratches(roster, slots){
  if(!roster||!slots) return;
  purgeScratchesFromActiveChart(slots);
  function pickWorst(pos, count){
    return roster.players.filter(function(pl){
      return pl.pos===pos&&!pl.injured&&(pl.ovr||0)<87;
    })
      .sort(function(a,b){
        var d=getHealthyScratchScore(a)-getHealthyScratchScore(b);
        if(d!==0) return d;
        return (a.ovr||50)-(b.ovr||50);
      }).slice(0, count);
  }
  var scrF=pickWorst('F', DEPTH_SCRATCH_F.length);
  var scrD=pickWorst('D', DEPTH_SCRATCH_D.length);
  var scratchIds={}, i, pl;
  scrF.forEach(function(p){ scratchIds[p.id]=true; });
  scrD.forEach(function(p){ scratchIds[p.id]=true; });
  function evictIfScratch(unit, slotField){
    if(!unit) return;
    for(i=0;i<unit.length;i++){
      pl=unit[i].player;
      if(pl&&scratchIds[pl.id]){
        if(slotField) pl[slotField]=null;
        else pl.depthSlot=null;
        unit[i].player=null;
      }
    }
  }
  evictIfScratch(slots.forwards, null);
  evictIfScratch(slots.defense, null);
  evictIfScratch(slots.pp1, 'ppSlot');
  evictIfScratch(slots.pp2, 'ppSlot');
  evictIfScratch(slots.pk1, 'pkSlot');
  evictIfScratch(slots.pk2, 'pkSlot');
  function fillEmpties(unit, pos, slotField){
    if(!unit) return;
    var activeIds={}, j;
    for(j=0;j<unit.length;j++){
      if(unit[j].player) activeIds[unit[j].player.id]=true;
    }
    var pool=roster.players.filter(function(p){
      return p.pos===pos&&!scratchIds[p.id]&&!p.injured&&!activeIds[p.id];
    });
    pool.sort(function(a,b){
      var d=getHealthyScratchScore(b)-getHealthyScratchScore(a);
      if(d!==0) return d;
      return (b.ovr||50)-(a.ovr||50);
    });
    for(i=0;i<unit.length;i++){
      if(unit[i].player) continue;
      if(!pool.length) break;
      pl=pool.shift();
      unit[i].player=pl;
      if(slotField) pl[slotField]=unit[i].slot;
      else pl.depthSlot=unit[i].slot;
      activeIds[pl.id]=true;
    }
  }
  fillEmpties(slots.forwards, 'F', null);
  fillEmpties(slots.defense, 'D', null);
  if(typeof fillSpecialSlots==='function'){
    var skaters=roster.players.filter(function(p){return (p.pos==='F'||p.pos==='D')&&!scratchIds[p.id];});
    var ppUsed={}, pkUsed={};
    skaters.forEach(function(p){
      if(p.ppSlot) ppUsed[p.id]=true;
      if(p.pkSlot) pkUsed[p.id]=true;
    });
    fillSpecialSlots(skaters, ppUsed, slots.pp1, getPowerPlayScore, 'ppSlot');
    fillSpecialSlots(skaters, ppUsed, slots.pp2, getPowerPlayScore, 'ppSlot');
    fillSpecialSlots(skaters, pkUsed, slots.pk1, getPenaltyKillScore, 'pkSlot');
    fillSpecialSlots(skaters, pkUsed, slots.pk2, getPenaltyKillScore, 'pkSlot');
  }
  slots.scratchF=[];
  slots.scratchD=[];
  for(i=0;i<DEPTH_SCRATCH_F.length&&i<scrF.length;i++){
    pl=scrF[i];
    pl.depthSlot=DEPTH_SCRATCH_F[i];
    pl.ppSlot=null;
    pl.pkSlot=null;
    pl.roleLabel='Healthy scratch';
    slots.scratchF.push({slot:DEPTH_SCRATCH_F[i], player:pl});
  }
  for(i=0;i<DEPTH_SCRATCH_D.length&&i<scrD.length;i++){
    pl=scrD[i];
    pl.depthSlot=DEPTH_SCRATCH_D[i];
    pl.ppSlot=null;
    pl.pkSlot=null;
    pl.roleLabel='Healthy scratch';
    slots.scratchD.push({slot:DEPTH_SCRATCH_D[i], player:pl});
  }
  roster.players.forEach(function(p){
    if(isScratchDepthSlot(p.depthSlot)&&!scratchIds[p.id]){
      p.depthSlot=null;
      p.roleLabel='';
    }
    if(!scratchIds[p.id]&&p.roleLabel==='Healthy scratch') p.roleLabel='';
  });
}

function findDepthSlotForPlayer(depth, player){
  if(!depth||!player) return null;
  var units=[depth.forwards, depth.defense, depth.goalies, depth.scratchF, depth.scratchD];
  var u, i;
  for(u=0;u<units.length;u++){
    if(!units[u]) continue;
    for(i=0;i<units[u].length;i++){
      if(units[u][i].player===player) return units[u][i];
    }
  }
  return null;
}

function promoteScratchesForAbsences(roster){
  if(!roster||!roster.depth) return;
  var d=roster.depth, promoted=false;
  function tryPromote(scratchUnit, activeUnit, pos){
    var si, ai, scr, act, repl, i;
    for(si=0;si<(scratchUnit||[]).length;si++){
      scr=scratchUnit[si];
      if(!scr.player) continue;
      for(ai=0;ai<(activeUnit||[]).length;ai++){
        act=activeUnit[ai];
        if(!act.player) continue;
        if(act.player.injured||(act.player.form||50)<28){
          repl=scr.player;
          scr.player=act.player;
          act.player=repl;
          act.player.depthSlot=act.slot;
          scr.player.depthSlot=scr.slot;
          scr.player.roleLabel='Healthy scratch';
          scr.player.ppSlot=null;
          scr.player.pkSlot=null;
          act.player.roleLabel='';
          if(act.player.isMe||repl.isMe){
            addNews((repl.isMe?G.last:repl.first+' '+repl.last)+' draws in for '+(act.player.isMe?'you':act.player.first)+' — lineup change.','neutral');
          }
          promoted=true;
          return;
        }
      }
    }
  }
  tryPromote(d.scratchF, d.forwards, 'F');
  tryPromote(d.scratchD, d.defense, 'D');
  if(promoted){
    if(typeof assignHealthyScratches==='function') assignHealthyScratches(roster, d);
    if(typeof stampProRoleLabels==='function') stampProRoleLabels(roster);
  }
}

function renderTeamRelationsTab(){
  var el=safeEl('hub-team-relations');
  if(!el) return;
  var roster=typeof ensureTeamRoster==='function'?ensureTeamRoster():null;
  if(!roster){ el.innerHTML='<div class="vt" style="color:var(--mut)">NO TEAM DATA</div>'; return; }
  ensureTeamRelations(roster);
  ensureRelationRepairBudget();
  var tr=G.teamRelations;
  var repairsLeft=Math.max(0, 3-(G._relationRepairCount||0));
  var html='<div class="vt" style="font-size:13px;color:var(--mut);margin-bottom:10px;line-height:1.5">Teammates tell you what they think — mend tense relationships with the actions below (up to <b>3</b> moves per week).</div>';
  html+='<div style="padding:10px;border:1px solid rgba(232,200,92,.25);background:rgba(232,200,92,.06);margin-bottom:12px">'+
    '<div class="vt" style="font-size:12px;color:var(--gold)">WHAT THE ROOM THINKS OF YOU</div>'+
    '<div style="font-size:14px;color:var(--wht);margin-top:4px;line-height:1.45">'+escHtml(getRoomReputationBlurb())+'</div>'+
    '<div style="font-size:11px;color:var(--mut);margin-top:6px">Relationship moves left this week: '+repairsLeft+'</div></div>';
  var roomNote='';
  if(isHardWorkerProfile(G.xFactor,G.arch)) roomNote='Your rep: grinder/worker — respect builds if you keep showing up.';
  else if(isCockyXFactor(G.xFactor)&&isUserStarProfile()&&getTeamSuccessRate()<0.44) roomNote='Your rep: talented but cocky while losing — guys are talking.';
  else if(isHypeFightProfile(G.xFactor,G.arch,G.pim)) roomNote='Your rep: edge guy — half the room loves the energy.';
  else if(isCockyXFactor(G.xFactor)) roomNote='Your rep: confident — some vets want more humility.';
  if(roomNote) html+='<div class="vt" style="font-size:12px;color:var(--acc);margin-bottom:10px">'+escHtml(roomNote)+'</div>';
  if(G._callUpCtx&&G._callUpCtx.active){
    var cu=G._callUpCtx;
    var stintGp=typeof getProCallUpGamesPlayed==='function'?getProCallUpGamesPlayed():0;
    var homeShort=LEAGUES[cu.homeLeagueKey]?LEAGUES[cu.homeLeagueKey].short:cu.homeLeagueKey;
    html+='<div style="padding:10px;border:1px solid var(--gold);background:rgba(232,200,92,.1);margin-bottom:12px">'+
      '<div class="vt" style="color:var(--gold);font-size:15px">PRO CALL-UP ACTIVE</div>'+
      '<div class="vt" style="font-size:13px;color:var(--wht);margin-top:4px">'+escHtml(cu.proTeamName)+' ('+escHtml(cu.proLeagueKey)+') · '+cu.gamesLeft+' game'+(cu.gamesLeft>1?'s':'')+' left · '+escHtml(String(cu.role).toUpperCase())+' role</div>'+
      '<div class="vt" style="font-size:11px;color:var(--mut);margin-top:4px">Play poorly and the parent club can send you back early.</div>';
    if(stintGp>=(cu.gamesTotal||0)||cu.gamesLeft<=0){
      html+='<button type="button" class="btn bg" style="font-size:11px;padding:4px 10px;margin-top:8px" onclick="hubReturnFromProCallUp()">RETURN TO '+escHtml(homeShort)+'</button>';
    } else if(stintGp>0){
      html+='<div class="vt" style="font-size:11px;color:var(--mut);margin-top:6px">'+stintGp+' of '+cu.gamesTotal+' call-up games played.</div>';
    } else {
      html+='<button type="button" class="btn bs" style="font-size:11px;padding:4px 10px;margin-top:8px" onclick="if(confirm(\'Return to your home club? Only use this if you already finished your call-up games.\'))hubReturnFromProCallUp()">RETURN TO '+escHtml(homeShort)+'</button>';
    }
    html+='</div>';
  }
  if(isJuniorCallUpBlocked()){
    html+='<div class="vt" style="font-size:12px;color:var(--mut);margin-bottom:10px">Junior leagues: full-season commitment — no in-season pro call-ups.</div>';
  } else if(typeof isProAcademyJuniorLeague==='function'&&isProAcademyJuniorLeague(G.leagueKey)&&typeof hasAcademyOrgContract==='function'&&hasAcademyOrgContract()){
    html+='<div class="vt" style="font-size:12px;color:var(--acc);margin-bottom:10px">Academy org contract: play up a band when dominant, or earn short <b>'+(G._academyParentOrg&&G._academyParentOrg.leagueKey||'pro')+'</b> call-ups with '+escHtml(G._academyParentOrg&&G._academyParentOrg.teamName||'your parent club')+'.</div>';
  } else if(canPlayerReceiveProCallUp()){
    html+='<div class="vt" style="font-size:12px;color:var(--acc);margin-bottom:10px">Healthy scratches and strong minor/college play can earn short pro call-ups when a parent club needs depth.</div>';
  }
  if(tr.coach){
    var clb=relationLabel(tr.coach.chemistry);
    var cop=getCoachOpinionText(tr.coach.chemistry);
    html+='<div style="padding:10px;border:1px solid rgba(122,184,224,.25);margin-bottom:10px;background:rgba(12,26,36,.5)">'+
      '<div class="vt" style="font-size:12px;color:var(--gold)">HEAD COACH</div>'+
      '<div style="font-size:15px;color:var(--wht)">'+escHtml(tr.coach.name)+' <span style="font-size:12px;color:var(--mut)">('+escHtml(String(tr.coach.style).toUpperCase())+')</span></div>'+
      '<div style="font-size:12px;color:'+clb.color+';margin-top:4px">'+clb.text+' · '+Math.round(tr.coach.chemistry)+'/100</div>'+
      '<div style="font-size:12px;color:var(--wht);font-style:italic;margin-top:8px;line-height:1.45;border-left:2px solid rgba(122,184,224,.35);padding-left:8px">'+escHtml(cop)+'</div>';
    if(tr.coach.chemistry<62){
      html+='<button type="button" class="btn bs" style="font-size:11px;padding:4px 10px;margin-top:8px" onclick="hubRepairRelation(\'coach\',\'coach_meet\')">REQUEST FILM-ROOM MEETING</button>';
    }
    html+='</div>';
  }
  var me=getUserRosterPlayer();
  var lineMates=[];
  if(me&&roster.depth){
    var myLine=getDepthLineFromSlot(me.depthSlot, me.pos);
    var unit=me.pos==='F'?roster.depth.forwards:roster.depth.defense;
    if(unit&&!isScratchDepthSlot(me.depthSlot)){
      for(var i=0;i<unit.length;i++){
        var row=unit[i];
        if(row.player&&!row.player.isMe&&getDepthLineFromSlot(row.slot,me.pos)===myLine) lineMates.push(row.player);
      }
    }
  }
  if(lineMates.length){
    html+='<div class="vt" style="font-size:12px;color:var(--gold);margin:8px 0 4px">YOUR LINE / PAIR</div>';
    for(var j=0;j<lineMates.length;j++){
      html+=renderTeammateRelationCard(lineMates[j], tr, me, roster);
    }
    if(me&&!isScratchDepthSlot(me.depthSlot)){
      var lineDinnerCost=typeof getRelationRepairCost==='function'?getRelationRepairCost(4500):4500;
      html+='<button type="button" class="btn bp" style="font-size:12px;padding:6px 12px;margin-bottom:12px" onclick="hubRepairRelation(\'line\',\'line_bond\')">LINE DINNER — TREAT THE UNIT ('+fmt(lineDinnerCost)+')</button>';
    }
  } else if(isUserHealthyScratch()){
    html+='<div class="vt" style="font-size:13px;color:var(--gold);margin-bottom:8px">You are a healthy scratch — press box until a spot opens or a pro call-up arrives.</div>';
  }
  html+='<div class="vt" style="font-size:12px;color:var(--gold);margin:12px 0 4px">LOCKER ROOM — WHAT THEY THINK</div>';
  var list=roster.players.filter(function(p){return !p.isMe&&p.pos!=='G';});
  var lineIds={}, li;
  for(li=0;li<lineMates.length;li++) lineIds[lineMates[li].id]=true;
  list=list.filter(function(p){return !lineIds[p.id];});
  list.sort(function(a,b){return getTeammateRelation(a.id)-getTeammateRelation(b.id);});
  for(var k=0;k<list.length;k++){
    html+=renderTeammateRelationCard(list[k], tr, me, roster);
  }
  el.innerHTML=html;
}

function weeklyTeamSystemsTick(){
  var roster=typeof ensureTeamRoster==='function'?ensureTeamRoster():null;
  if(roster){
    ensureTeamRelations(roster);
    promoteScratchesForAbsences(roster);
  }
  nudgeRelationsAfterWeek();
  if(!G._callUpCtx||!G._callUpCtx.active) rollWeeklyCallUpOffer();
}
