/* breakaway — TEAM ROSTER, DEPTH CHART, LEAGUE STATS */
// ============================================================
// TEAM ROSTER, DEPTH CHART, LEAGUE STATS
// ============================================================

var ROSTER_MALE_FIRST=[
  'Caden','Wyatt','Niko','Dmitri','Patrik','Alexei','Jordan','Connor','Brayden','Tomas',
  'Mikael','Owen','Sergei','Jesse','Tyler','Marcus','Stefan','Ryan','Kyle','Jake',
  'Luca','Carlos','Matteo','Kenji','Rafael','Ibrahim','Felix','Quinn','Devon','Reese'
];
var ROSTER_FEMALE_FIRST=[
  'Emma','Taylor','Sofia','Annika','Petra','Cassidy','Maya','Nadia','Jules','Raina',
  'Fatima','Yuki','Priya','Amara','Valentina','Zara','Elena','Hannah','Brooke','Sienna'
];
var ROSTER_LAST=[
  'Forsberg','Volkov','Haugen','Sundqvist','Malashenko','Kuznetsov','Ashworth','Healy',
  'Tremblay','Dvoracek','Lindqvist','Ritchie','Callahan','Fairbanks','Morrison','Kovacs',
  'Holmberg','Okafor','Bernier','Petrov','Tanaka','Zhang','Ferretti','Reyes','Russo',
  'Watanabe','Moura','Nguyen','Kowalczyk','Brandt','Ellis','Miles','Ng','Haber'
];
var COACH_FIRST=['Mike','John','Pierre','Andrei','Lars','Stefan','Chris','Dave','Marc','Paul'];
var COACH_LAST=['Sullivan','Babcock','Vigneault','Trotz','Ruff','Quenneville','Cooper','Keefe','Brind\'Amour','Tortorella'];
var F_ARCHES=['Sniper','Playmaker','PowerForward','TwoWay','Grinder'];
var D_ARCHES=['OffensiveD','TwoWayD','StayAtHome','ShutdownD'];
var DEPTH_F_SLOTS=['LW1','C1','RW1','LW2','C2','RW2','LW3','C3','RW3','LW4','C4','RW4'];
var DEPTH_D_SLOTS=['LD1','RD1','LD2','RD2','LD3','RD3'];
var DEPTH_G_SLOTS=['G1','G2'];

function isEuropeanStyleLeague(leagueKey){
  var k=leagueKey||'';
  return k==='NEHL'||k==='CEHL'||k==='ARHL'||k==='NEJC'||k==='CEJC'||k==='ARJC'||
    k==='SDHL'||k==='FWHL'||k==='AWHL'||k==='EWJC'||k==='AWJC';
}

function getLeagueRosterSkillOffset(leagueKey){
  var map={
    OJL:4, CWHL:3, QMJL:2, WJL:1, USJL:-1, USWDL:-1,
    NEJC:-2, CEJC:-1, ARJC:0, EWJC:-2, AWJC:-2,
    NCHA:1, NWCHA:0, NEHL:2, CEHL:1, ARHL:3, SDHL:1, FWHL:0, AWHL:0,
    NAML:5, PWDL:4, PHL:12, PWL:12
  };
  return map[leagueKey]!=null?map[leagueKey]:0;
}

function getLeagueScoringProfile(leagueKey){
  var L=LEAGUES[leagueKey]||{};
  var g=L.games||68;
  var tier=L.tier||'junior';
  var pts=88, gl=34, al=55;
  if(leagueKey==='PHL'){ pts=130; gl=50; al=80; }
  else if(leagueKey==='PWL'){ pts=52; gl=24; al=30; }
  else if(tier==='minor'){ pts=78; gl=32; al=48; }
  else if(tier==='college'){ pts=52; gl=24; al=30; }
  else if(tier==='euro'||tier==='asia'){
    if(leagueKey==='ARHL'){ pts=62; gl=22; al=42; }
    else { pts=42; gl=16; al=28; }
  }
  else if(leagueKey==='OJL'||leagueKey==='CWHL'){ pts=92; gl=38; al=56; }
  else if(leagueKey==='QMJL'||leagueKey==='WJL'){ pts=84; gl=34; al=52; }
  else if(leagueKey==='USJL'||leagueKey==='USWDL'){ pts=74; gl=30; al=46; }
  else if(tier==='junior'){ pts=68; gl=28; al=42; }
  return {games:g, ptsLeader:pts, gLeader:gl, aLeader:al};
}

function getLeagueSimScoringFactor(leagueKey){
  var p=getLeagueScoringProfile(leagueKey);
  var ref=88;
  return cl(p.ptsLeader/ref, 0.42, 1.18);
}

function rollRosterFirstName(leagueKey){
  var isF=(LEAGUES[leagueKey]||{}).gender==='F';
  var pool=isF?ROSTER_FEMALE_FIRST:ROSTER_MALE_FIRST;
  return pool[ri(0,pool.length-1)];
}

function rollPlayerHand(pos, subPos, leagueKey){
  var euro=isEuropeanStyleLeague(leagueKey);
  var leftPct=euro?0.68:0.60;
  if(pos==='D'){
    if(subPos==='LD') leftPct=0.78;
    else if(subPos==='RD') leftPct=0.22;
    else leftPct=0.55;
  } else if(pos==='F'){
    leftPct=euro?0.65:0.62;
  }
  return Math.random()<leftPct?'L':'R';
}

function preferredWingForHand(hand, leagueKey){
  if(isEuropeanStyleLeague(leagueKey)&&Math.random()<0.55){
    return hand==='L'?'RW':'LW';
  }
  return hand==='L'?'LW':'RW';
}

function pickNpcArchetype(pos){
  if(pos==='G') return 'Goalie';
  if(pos==='D') return D_ARCHES[ri(0,D_ARCHES.length-1)];
  return F_ARCHES[ri(0,F_ARCHES.length-1)];
}

function archShortLabel(arch){
  var m={
    Sniper:'SNP', Playmaker:'PLY', PowerForward:'PWR', TwoWay:'TWO', Grinder:'GRD',
    OffensiveD:'OFF-D', TwoWayD:'TWO-D', StayAtHome:'SAH', ShutdownD:'SHD', Goalie:'G'
  };
  return m[arch]||String(arch||'').slice(0,4).toUpperCase();
}

function genNpcOvr(pos, leagueKey, rank){
  var base=getLeagueBaselineOvr(leagueKey)+getLeagueRosterSkillOffset(leagueKey);
  var spread=pos==='G'?10:14;
  var top=base+spread*0.55;
  var bot=base-spread*0.45;
  var t=1-(rank||0)/20;
  return Math.round(cl(bot+(top-bot)*t+rd(-2.5,2.5), 38, 97));
}

function makeNpcPlayer(pos, leagueKey, rank, carry){
  if(carry){
    var aged=carry.age+1;
    var ovrN=carry.ovr;
    if(aged>=30) ovrN=Math.round(ovrN-rd(0.5,2.8));
    if(aged>=35) ovrN=Math.round(ovrN-rd(1,4));
    ovrN=cl(ovrN, 38, 97);
    if(aged>=38&&ovrN<52&&Math.random()<0.55) return null;
    return {
      id:carry.id, first:carry.first, last:carry.last, pos:carry.pos,
      pref:carry.pref||carry.subPos, hand:carry.hand, age:aged, arch:carry.arch,
      ovr:ovrN, isMe:false, team:carry.team
    };
  }
  var subPos;
  if(pos==='F'){
    var r=Math.random();
    subPos=r<0.34?'C':(r<0.67?'LW':'RW');
  } else if(pos==='D'){
    subPos=Math.random()<0.5?'LD':'RD';
  } else subPos='G';
  var hand=rollPlayerHand(pos, subPos, leagueKey);
  if(pos==='F'&&(subPos==='LW'||subPos==='RW')&&Math.random()<0.72){
    subPos=preferredWingForHand(hand, leagueKey);
  }
  return {
    id:'npc_'+ri(10000,99999)+'_'+Date.now().toString(36).slice(-4),
    first:rollRosterFirstName(leagueKey),
    last:ROSTER_LAST[ri(0,ROSTER_LAST.length-1)],
    pos:pos, pref:subPos, hand:hand,
    age:pos==='G'?ri(20,34):ri(17,33),
    arch:pickNpcArchetype(pos),
    ovr:genNpcOvr(pos, leagueKey, rank),
    isMe:false, team:null
  };
}

function pickCoach(teamName, prevCoach){
  if(prevCoach&&prevCoach.team===teamName&&Math.random()<0.72) return prevCoach;
  return {
    team:teamName,
    name:COACH_FIRST[ri(0,COACH_FIRST.length-1)]+' '+COACH_LAST[ri(0,COACH_LAST.length-1)],
    style:['balanced','skill','grind','defensive'][ri(0,3)]
  };
}

function lineComplementScore(a, b){
  if(!a||!b) return 0;
  var s=0;
  if(a.arch==='Playmaker'&&(b.arch==='Sniper'||b.arch==='PowerForward')) s+=3;
  if(b.arch==='Playmaker'&&(a.arch==='Sniper'||a.arch==='PowerForward')) s+=3;
  if(a.arch==='Grinder'&&b.arch==='Sniper') s+=1.5;
  if(a.hand!==b.hand) s+=0.8;
  if(a.pref==='C'||b.pref==='C') s+=0.4;
  return s;
}

function assignForwardLine(fwd, slots, start){
  var pool=fwd.slice().sort(function(a,b){return b.ovr-a.ovr;});
  var used={}, i, j, best, bestSc;
  for(i=0;i<4;i++){
    var lwS=slots[start+i*3], cS=slots[start+i*3+1], rwS=slots[start+i*3+2];
    var cCand=pool.filter(function(p){return !used[p.id]&&(p.pref==='C'||!p.pref);});
    cCand.sort(function(a,b){return b.ovr-a.ovr;});
    var cP=cCand[0]||pool.find(function(p){return !used[p.id];});
    if(!cP) continue;
    used[cP.id]=true;
    cS.player=cP; cP.depthSlot=cS.slot;
    var rem=pool.filter(function(p){return !used[p.id];});
    best=null; bestSc=-99;
    for(j=0;j<rem.length;j++){
      var sc=lineComplementScore(cP, rem[j]);
      if((rem[j].pref==='LW'||rem[j].hand==='L')&&rem[j].pref!=='RW') sc+=0.5;
      if(sc>bestSc){ bestSc=sc; best=rem[j]; }
    }
    if(best){ used[best.id]=true; lwS.player=best; best.depthSlot=lwS.slot; }
    rem=pool.filter(function(p){return !used[p.id];});
    best=null; bestSc=-99;
    for(j=0;j<rem.length;j++){
      var sc2=lineComplementScore(cP, rem[j]);
      if((rem[j].pref==='RW'||rem[j].hand==='R')&&rem[j].pref!=='LW') sc2+=0.5;
      if(sc2>bestSc){ bestSc=sc2; best=rem[j]; }
    }
    if(best){ used[best.id]=true; rwS.player=best; best.depthSlot=rwS.slot; }
  }
}

function assignDefensePairs(def, slots){
  var pool=def.slice().sort(function(a,b){return b.ovr-a.ovr;});
  var used={}, p, i;
  for(i=0;i<3;i++){
    var ld=slots[i*2], rd=slots[i*2+1];
    var ldC=pool.filter(function(x){return !used[x.id]&&(x.pref==='LD'||x.hand==='L');});
    ldC.sort(function(a,b){return b.ovr-a.ovr;});
    p=ldC[0]||pool.find(function(x){return !used[x.id];});
    if(!p) continue;
    used[p.id]=true; ld.player=p; p.depthSlot=ld.slot;
    var rdC=pool.filter(function(x){return !used[x.id]&&(x.pref==='RD'||x.hand==='R');});
    rdC.sort(function(a,b){return b.ovr-a.ovr;});
    p=rdC[0]||pool.find(function(x){return !used[x.id];});
    if(!p) continue;
    used[p.id]=true; rd.player=p; p.depthSlot=rd.slot;
  }
}

function buildDepthChartSlots(){
  var slots={forwards:[],defense:[],goalies:[]}, i;
  for(i=0;i<DEPTH_F_SLOTS.length;i++) slots.forwards.push({slot:DEPTH_F_SLOTS[i], player:null});
  for(i=0;i<DEPTH_D_SLOTS.length;i++) slots.defense.push({slot:DEPTH_D_SLOTS[i], player:null});
  for(i=0;i<DEPTH_G_SLOTS.length;i++) slots.goalies.push({slot:DEPTH_G_SLOTS[i], player:null});
  return slots;
}

function assignDepthChart(roster){
  var slots=buildDepthChartSlots();
  var fwd=roster.players.filter(function(p){return p.pos==='F'&&!p.isMe;});
  var def=roster.players.filter(function(p){return p.pos==='D'&&!p.isMe;});
  var goalies=roster.players.filter(function(p){return p.pos==='G'&&!p.isMe;});
  assignForwardLine(fwd, slots.forwards, 0);
  assignDefensePairs(def, slots.defense);
  goalies.sort(function(a,b){return b.ovr-a.ovr;});
  if(goalies[0]){ slots.goalies[0].player=goalies[0]; goalies[0].depthSlot='G1'; }
  if(goalies[1]){ slots.goalies[1].player=goalies[1]; goalies[1].depthSlot='G2'; }
  var me=roster.players.find(function(p){return p.isMe;});
  if(me){
    me.depthSlot=me.pref||me.subPos||'—';
    var target=null, tOvr=-1, i, sl;
    if(me.pos==='G'){
      target=slots.goalies[0];
    } else if(me.pos==='D'){
      for(i=0;i<slots.defense.length;i++){
        if(slots.defense[i].player&&slots.defense[i].player.ovr>tOvr){ tOvr=slots.defense[i].player.ovr; target=slots.defense[i]; }
      }
      if(!target) target=slots.defense[0];
    } else {
      for(i=0;i<slots.forwards.length;i++){
        sl=slots.forwards[i].slot;
        if((me.pref==='C'&&sl.charAt(0)==='C')||(me.pref==='LW'&&sl.indexOf('LW')===0)||(me.pref==='RW'&&sl.indexOf('RW')===0)){
          if(!target||!slots.forwards[i].player||slots.forwards[i].player.ovr<me.ovr) target=slots.forwards[i];
        }
      }
      if(!target) target=slots.forwards[0];
    }
    if(target){
      if(target.player&&!target.player.isMe) target.player.depthSlot='';
      target.player=me;
      me.depthSlot=target.slot;
    }
  }
  roster.depth=slots;
}

function buildTeamRoster(leagueKey, teamName, prevRoster){
  var sameTeam=prevRoster&&prevRoster.teamName===teamName;
  var coach=pickCoach(teamName, sameTeam?prevRoster.coach:null);
  var prevMap={};
  if(sameTeam&&prevRoster&&prevRoster.players){
    prevRoster.players.forEach(function(p){ if(!p.isMe) prevMap[p.id]=p; });
  }
  var players=[], rank=0, carryList=sameTeam?shuf(prevRoster.players.filter(function(p){return !p.isMe;})):[];

  function fillPos(pos, count){
    var ci=0, made=0;
    while(made<count){
      var carry=null;
      if(sameTeam&&ci<carryList.length){
        while(ci<carryList.length&&carryList[ci].pos!==pos) ci++;
        if(ci<carryList.length){ carry=carryList[ci]; ci++; }
      }
      var p=makeNpcPlayer(pos, leagueKey, rank++, carry);
      if(!p){
        p=makeNpcPlayer(pos, leagueKey, rank++, null);
      }
      p.team=teamName;
      players.push(p);
      made++;
    }
  }
  fillPos('F', 12);
  fillPos('D', 6);
  fillPos('G', 2);

  var roster={teamName:teamName, leagueKey:leagueKey, coach:coach, players:players, depth:null};
  syncUserPlayerIntoRoster(roster);
  assignDepthChart(roster);
  return roster;
}

function syncUserPlayerIntoRoster(roster){
  if(!G||!roster) return;
  var idx=-1;
  for(var i=0;i<roster.players.length;i++){ if(roster.players[i].isMe){ idx=i; break; } }
  var me={
    id:'user', first:G.first, last:G.last, pos:G.pos,
    pref:G.subPos||G.pos, hand:G.hand||'L',
    age:G.age, arch:G.arch, ovr:ovr(G.attrs,G.pos),
    isMe:true, team:G.team&&G.team.n
  };
  if(idx>=0) roster.players[idx]=me;
  else {
    if(G.pos==='G'){
      var gIdx=roster.players.findIndex(function(p){return p.pos==='G'&&!p.isMe;});
      if(gIdx>=0) roster.players[gIdx]=me; else roster.players.push(me);
    } else if(G.pos==='D'){
      var dIdx=roster.players.findIndex(function(p){return p.pos==='D'&&!p.isMe;});
      if(dIdx>=0) roster.players[dIdx]=me; else roster.players.push(me);
    } else {
      var fIdx=roster.players.findIndex(function(p){return p.pos==='F'&&!p.isMe;});
      if(fIdx>=0) roster.players[fIdx]=me; else roster.players.push(me);
    }
  }
}

function ensureTeamRoster(){
  if(!G||!G.team) return null;
  var key=(G.leagueKey||'')+'|'+G.team.n+'|'+(G.season||1);
  var sameTeam=G._teamRosterKey&&G._teamRosterKey.split('|')[1]===G.team.n;
  if(G._teamRosterKey===key&&G.teamRoster){
    syncUserPlayerIntoRoster(G.teamRoster);
    assignDepthChart(G.teamRoster);
    return G.teamRoster;
  }
  G.teamRoster=buildTeamRoster(G.leagueKey, G.team.n, sameTeam?G.teamRoster:null);
  G._teamRosterKey=key;
  return G.teamRoster;
}

function getSeasonProgressFraction(){
  if(!G||!G.league) return 0.5;
  var total=G.league.games||68;
  var perWeek=getGamesPerWeek(G.leagueKey);
  var played=Math.min(total, ((G.week||1)-1)*perWeek+(G.weekGames||0));
  if(G.gp>played) played=G.gp;
  return cl(played/total, 0.08, 1);
}

function synthPlayerSeasonStats(player, leagueKey, progress){
  var prof=getLeagueScoringProfile(leagueKey);
  var base=getLeagueBaselineOvr(leagueKey)+getLeagueRosterSkillOffset(leagueKey);
  var rel=(player.ovr-base)/18;
  var gp=Math.max(1, Math.round(prof.games*progress*rd(0.82,1.02)));
  if(player.isMe){
    gp=Math.max(gp, G.gp||0);
  }
  if(player.pos==='G'){
    var sa=Math.round(gp*rd(26, 34));
    var svPct=cl(0.885+rel*0.018+rd(-0.02,0.015), 0.86, 0.94);
    var sv=Math.round(sa*svPct);
    var ga=sa-sv;
  var w=Math.round(gp*cl(0.38+rel*0.12+rd(-0.08,0.08), 0.2, 0.72));
    return {gp:gp, g:0, a:0, pts:0, pm:0, sv:sv, ga:ga, w:w, player:player};
  }
  var ppg=cl((prof.ptsLeader/prof.games)*(0.55+rel*0.55)*rd(0.88,1.12), 0.15, 1.75);
  var pts=Math.round(gp*ppg);
  var gRate=cl(0.34+rel*0.08+rd(-0.06,0.06), 0.12, 0.52);
  var g=Math.round(pts*gRate);
  var a=Math.max(0, pts-g);
  var pm=Math.round(rd(-8, 18)+rel*10);
  if(player.isMe){
    g=G.goals||g; a=G.assists||a; pts=g+a; pm=G.plusminus||pm; gp=G.gp||gp;
  }
  return {gp:gp, g:g, a:a, pts:pts, pm:pm, sv:0, ga:0, w:0, player:player};
}

function buildLeaguePlayerStats(leagueKey){
  var teams=TEAMS[leagueKey]||[];
  var progress=getSeasonProgressFraction();
  var rows=[], t, p, roster, pi;
  ensureTeamRoster();
  for(t=0;t<teams.length;t++){
    var tn=teams[t].n;
    if(G.team&&tn===G.team.n&&G.teamRoster){
      roster=G.teamRoster;
    } else {
      roster=buildTeamRoster(leagueKey, tn, null);
    }
    for(pi=0;pi<roster.players.length;pi++){
      p=roster.players[pi];
      rows.push(synthPlayerSeasonStats(p, leagueKey, progress));
    }
  }
  return rows;
}

function ensureLeaguePlayerStats(){
  if(!G) return [];
  var key=(G.leagueKey||'')+'_'+(G.season||1)+'_'+(G.week||1)+'_'+(G.gp||0);
  if(G._leagueStatsKey===key&&G.leaguePlayerStats) return G.leaguePlayerStats;
  G.leaguePlayerStats=buildLeaguePlayerStats(G.leagueKey);
  G._leagueStatsKey=key;
  return G.leaguePlayerStats;
}

function renderDepthChartTab(){
  var el=safeEl('hub-depth-chart');
  if(!el) return;
  var roster=ensureTeamRoster();
  if(!roster){ el.innerHTML='<div class="vt" style="color:var(--mut)">NO ROSTER DATA</div>'; return; }
  var coach=roster.coach||{name:'Staff', style:'balanced'};
  var html='<div class="vt" style="font-size:13px;color:var(--mut);margin-bottom:10px;line-height:1.5">'+
    '<span style="color:var(--gold)">HEAD COACH:</span> '+escHtml(coach.name)+' &nbsp;·&nbsp; '+escHtml(String(coach.style).toUpperCase())+
    ' &nbsp;·&nbsp; Lines built around chemistry, handedness, and preferred spots.</div>';

  function cell(slot, pl){
    if(!pl) return '<div style="padding:6px 8px;border:1px dashed rgba(122,184,224,.2);color:var(--mut);font-size:12px">'+slot+' — —</div>';
    var hi=pl.isMe?'border:1px solid var(--gold);background:rgba(232,200,92,.1)':'border:1px solid rgba(122,184,224,.2);background:rgba(12,26,36,.45)';
    return '<div style="padding:6px 8px;'+hi+'">'+
      '<div style="font-size:11px;color:var(--mut)">'+slot+'</div>'+
      '<div style="font-size:14px;color:'+(pl.isMe?'var(--gold)':'var(--wht)')+'">'+escHtml(pl.first+' '+pl.last)+(pl.isMe?' (YOU)':'')+'</div>'+
      '<div style="font-size:11px;color:var(--acc)">'+archShortLabel(pl.arch)+' · '+pl.age+'y · OVR '+pl.ovr+' · '+pl.hand+'</div></div>';
  }

  html+='<div class="vt" style="font-size:12px;color:var(--gold);margin:8px 0 4px">FORWARDS</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">';
  var d=roster.depth, i;
  for(i=0;i<12;i++){
    var s=d.forwards[i];
    html+=cell(s.slot, s.player);
  }
  html+='</div>';
  html+='<div class="vt" style="font-size:12px;color:var(--gold);margin:8px 0 4px">DEFENSE</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:12px">';
  for(i=0;i<6;i++){
    s=d.defense[i];
    html+=cell(s.slot, s.player);
  }
  html+='</div>';
  html+='<div class="vt" style="font-size:12px;color:var(--gold);margin:8px 0 4px">GOALIES</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">';
  for(i=0;i<2;i++){
    s=d.goalies[i];
    var lbl=s.slot==='G1'?'STARTER':'BACKUP';
    html+=cell(lbl, s.player);
  }
  html+='</div>';
  el.innerHTML=html;
}

function renderLeagueLeadersTab(){
  var el=safeEl('hub-league-leaders');
  if(!el) return;
  var rows=ensureLeaguePlayerStats();
  var prof=getLeagueScoringProfile(G.leagueKey);
  var skaters=rows.filter(function(r){return r.player.pos!=='G';}).sort(function(a,b){return b.pts-a.pts;});
  var goalies=rows.filter(function(r){return r.player.pos==='G';}).sort(function(a,b){
    var sa=a.sv+a.ga, sb=b.sv+b.ga;
    var pA=sa>0?a.sv/sa:0, pB=sb>0?b.sv/sb:0;
    return pB-pA;
  });
  var html='<div class="vt" style="font-size:13px;color:var(--mut);margin-bottom:10px;line-height:1.5">'+
    escHtml(G.league.short)+' scoring pace — typical leader ~'+prof.ptsLeader+' PTS / '+prof.gLeader+' G / '+prof.aLeader+' A over '+prof.games+' GP. Stronger leagues run hotter (OJL &gt; USJL; euro runs tight).</div>';

  html+='<div class="vt" style="font-size:14px;color:var(--gold);margin:10px 0 6px">SKATER LEADERS</div>';
  html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-family:VT323,monospace;font-size:14px">';
  html+='<tr style="color:var(--mut);font-size:12px"><th style="text-align:left;padding:4px">#</th><th style="text-align:left">PLAYER</th><th>TEAM</th><th>GP</th><th>G</th><th>A</th><th>PTS</th><th>+/-</th></tr>';
  var n=Math.min(25, skaters.length), i, r;
  for(i=0;i<n;i++){
    r=skaters[i];
    var hi=r.player.isMe?' style="color:var(--gold)"':'';
    html+='<tr'+hi+'><td style="padding:4px">'+(i+1)+'</td><td>'+escHtml(r.player.first+' '+r.player.last)+(r.player.isMe?' *':'')+'</td>'+
      '<td style="font-size:12px">'+escHtml((r.player.team||'').split(' ').slice(-1)[0])+'</td>'+
      '<td>'+r.gp+'</td><td>'+r.g+'</td><td>'+r.a+'</td><td>'+r.pts+'</td><td>'+(r.pm>=0?'+':'')+r.pm+'</td></tr>';
  }
  html+='</table></div>';

  html+='<div class="vt" style="font-size:14px;color:var(--gold);margin:14px 0 6px">GOALIE LEADERS</div>';
  html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-family:VT323,monospace;font-size:14px">';
  html+='<tr style="color:var(--mut);font-size:12px"><th style="text-align:left;padding:4px">#</th><th style="text-align:left">GOALIE</th><th>TEAM</th><th>GP</th><th>SV%</th><th>GAA</th><th>W</th></tr>';
  n=Math.min(15, goalies.length);
  for(i=0;i<n;i++){
    r=goalies[i];
    var shots=r.sv+r.ga;
    var pct=shots>0?Math.round(r.sv/shots*1000)/10:'--';
    var gaa=r.gp>0?Math.round(r.ga/r.gp*100)/100:'--';
    var hi2=r.player.isMe?' style="color:var(--gold)"':'';
    html+='<tr'+hi2+'><td style="padding:4px">'+(i+1)+'</td><td>'+escHtml(r.player.first+' '+r.player.last)+(r.player.isMe?' *':'')+'</td>'+
      '<td style="font-size:12px">'+escHtml((r.player.team||'').split(' ').slice(-1)[0])+'</td>'+
      '<td>'+r.gp+'</td><td>'+pct+'%</td><td>'+gaa+'</td><td>'+r.w+'</td></tr>';
  }
  html+='</table></div>';
  html+='<div class="vt" style="font-size:11px;color:var(--mut);margin-top:8px">* = you · stats refresh as the season progresses</div>';
  el.innerHTML=html;
}

function getTeammateNameForNews(){
  var roster=ensureTeamRoster();
  if(!roster) return getRandomTalentName();
  var pool=roster.players.filter(function(p){return !p.isMe;});
  if(!pool.length) return getRandomTalentName();
  var p=pool[ri(0, pool.length-1)];
  return p.first+' '+p.last;
}
