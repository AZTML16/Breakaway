/* breakaway — TEAM SELECT -- DRAFT / OFFERS SYSTEM */
// ============================================================
// TEAM SELECT -- DRAFT / OFFERS SYSTEM
// ============================================================
function goToTeamSelect(){
  var lk=selLeague||'OJL';
  var teams=TEAMS[lk]||TEAMS['OJL'];
  var l=LEAGUES[lk];
  var tier=l.tier;
  var html='';
  G._availableTeams=null;
  G._selTeamIdx=0;

  if(tier==='junior'){
    // DRAFT DAY -- one team drafts you
    var draftRd=ri(1,4);
    var pick=ri(1,10);
    var draftedTeam=teams[ri(0,teams.length-1)];
    var undrafted=shuf(teams.filter(function(t){return t.n!==draftedTeam.n;})).slice(0,2);
    var allShown=[draftedTeam].concat(undrafted);
    G._availableTeams=allShown;
    G._selTeamIdx=0;
    safeEl('team-select-hdr').textContent=l.short+' DRAFT';
    safeEl('team-select-title').textContent=l.short.toUpperCase()+' DRAFT DAY';
    safeEl('team-select-sub').textContent='YOUR RIGHTS HAVE BEEN CLAIMED -- OR GO UNDRAFTED:';
    html+='<div class="draft-reveal">';
    html+='<div class="vt" style="font-size:12px;color:var(--mut);letter-spacing:2px;margin-bottom:4px">'+l.name.toUpperCase()+'</div>';
    html+='<div class="retro-puck-graphic lg" style="margin:8px 0"><div class="puck-disc"></div></div>';
    html+='<div class="draft-pick-num">ROUND '+draftRd+' &mdash; PICK '+pick+'</div>';
    html+='<div class="vt" style="font-size:26px;color:var(--wht);margin-bottom:4px">'+draftedTeam.n+'</div>';
    html+='<div class="vt" style="font-size:16px;color:var(--mut)">SELECTS YOU WITH THE '+pick+(pick===1?'ST':pick===2?'ND':pick===3?'RD':'TH')+' PICK</div>';
    html+='</div>';
    html+='<div class="lcard sel" id="tc-0" onclick="pickTeam(0)">';
    html+='<span class="badge gold">DRAFTED</span> <span class="vt" style="font-size:17px">'+draftedTeam.n+'</span>';
    html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:3px">Accept your draft rights -- report to camp</div>';
    html+='</div>';
    html+='<div class="vt" style="font-size:14px;color:var(--mut);margin:10px 0 6px">-- OR SIGN ELSEWHERE AS UNDRAFTED FREE AGENT --</div>';
    for(var i=0;i<undrafted.length;i++){
      html+='<div class="lcard" id="tc-'+(i+1)+'" onclick="pickTeam('+(i+1)+')">';
      html+='<span class="badge mut">UNDRAFTED FREE AGENT</span><br>';
      html+='<span class="vt" style="font-size:16px">'+undrafted[i].n+'</span>';
      html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:3px">Sign as undrafted -- potentially more ice time</div>';
      html+='</div>';
    }
  } else if(tier==='college'){
    // SCHOLARSHIP OFFERS
    var numOffers=ri(2,4);
    var offered=shuf(teams.slice()).slice(0,numOffers);
    G._availableTeams=offered;
    G._selTeamIdx=0;
    safeEl('team-select-hdr').textContent='SCHOLARSHIP OFFERS';
    safeEl('team-select-title').textContent='COLLEGE SCHOLARSHIP OFFERS';
    safeEl('team-select-sub').textContent='PROGRAMS HAVE EXTENDED OFFERS -- CHOOSE YOUR SCHOOL:';
    html+='<div class="vt" style="font-size:14px;color:var(--gold);margin-bottom:10px;border-left:3px solid var(--gold);padding-left:8px">'+numOffers+' SCHOOLS HAVE OFFERED YOU A FULL ATHLETIC SCHOLARSHIP</div>';
    for(var i=0;i<offered.length;i++){
      html+='<div class="lcard'+(i===0?' sel':'')+'" id="tc-'+i+'" onclick="pickTeam('+i+')">';
      html+='<span class="badge green">SCHOLARSHIP OFFER</span><br>';
      html+='<span class="vt" style="font-size:18px">'+offered[i].e+' '+offered[i].n+'</span>';
      html+='<div class="vt" style="font-size:13px;color:var(--mut);margin-top:4px">Full athletic scholarship -- 4-year program -- tuition &amp; development</div>';
      html+='</div>';
    }
  } else {
    // EURO / ASIA / MINOR -- CONTRACT OFFERS
    var numOffers=ri(2,3);
    var offered=shuf(teams.slice()).slice(0,numOffers);
    G._availableTeams=offered;
    G._selTeamIdx=0;
    safeEl('team-select-hdr').textContent='CONTRACT OFFERS';
    safeEl('team-select-title').textContent='TEAMS INTERESTED IN SIGNING YOU';
    safeEl('team-select-sub').textContent='CHOOSE YOUR DESTINATION:';
    for(var i=0;i<offered.length;i++){
      var t=offered[i];
      var offerSal=l.salBase>0?Math.round(l.salBase*rd(0.82,1.22)/1000)*1000:0;
      var offerYrs=ri(1,3);
      html+='<div class="lcard'+(i===0?' sel':'')+'" id="tc-'+i+'" onclick="pickTeam('+i+')">';
      html+='<span class="vt" style="font-size:18px">'+t.e+' '+t.n+'</span>';
      if(offerSal>0){
        html+='<div class="vt" style="font-size:15px;color:var(--green);margin-top:4px">OFFER: '+fmt(offerSal)+'/yr &mdash; '+offerYrs+'-YEAR DEAL</div>';
      }
      html+='</div>';
    }
  }
  safeEl('team-list').innerHTML=html;
  show('s-team');
}

function pickTeam(i){
  G._selTeamIdx=i;
  var cards=document.querySelectorAll('#team-list .lcard');
  for(var j=0;j<cards.length;j++) cards[j].classList.remove('sel');
  var el=safeEl('tc-'+i);
  if(el) el.classList.add('sel');
}
