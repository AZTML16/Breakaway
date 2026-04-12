/* breakaway — RETIREMENT */
// ============================================================
// RETIREMENT
// ============================================================
function renderRetire(){
  var cp=G.cGoals+G.cAssists;
  var hof=calcHOF();
  var isGoalie=G.pos==='G';
  var tierLabel='';
  if(isGoalie){
    var cSvPctR=G.cSaves+(G.cGoalsAgainst||0)>0?(Math.round(G.cSaves/(G.cSaves+(G.cGoalsAgainst||0))*1000)/10):'--';
    tierLabel=hof>=100?'HALL OF FAME GOALTENDER':G.cSaves>=3000?'FRANCHISE NETMINDER':G.cSaves>=1500?'VETERAN STOPPER':G.cGP>=200?'JOURNEYMAN GOALIE':'CAREER BACKUP';
  } else {
    tierLabel=hof>=100?'HALL OF FAME INDUCTEE':cp>=1000?'FRANCHISE LEGEND':cp>=600?'FAN FAVOURITE':cp>=300?'SOLID PROFESSIONAL':'CAREER PLAYER';
  }
  safeEl('retire-hl').textContent=tierLabel;
  var statHtml='<div class="sgrid" style="margin-bottom:10px">';
  statHtml+='<div class="stbox"><div class="stlbl">SEASONS</div><div class="stval">'+(G.season-1)+'</div></div>';
  statHtml+='<div class="stbox"><div class="stlbl">GP</div><div class="stval">'+G.cGP+'</div></div>';
  if(isGoalie){
    var rSvPct=G.cSaves+(G.cGoalsAgainst||0)>0?(Math.round(G.cSaves/(G.cSaves+(G.cGoalsAgainst||0))*1000)/10)+'%':'--';
    var rGAA=G.cGP>0?Math.round(((G.cGoalsAgainst||0)/G.cGP)*100)/100:'--';
    statHtml+='<div class="stbox"><div class="stlbl">SV</div><div class="stval" style="color:var(--green)">'+G.cSaves+'</div></div>';
    statHtml+='<div class="stbox"><div class="stlbl">GA</div><div class="stval" style="color:var(--red)">'+(G.cGoalsAgainst||0)+'</div></div>';
    statHtml+='<div class="stbox"><div class="stlbl">SV%</div><div class="stval" style="color:var(--gold)">'+rSvPct+'</div></div>';
    statHtml+='<div class="stbox"><div class="stlbl">GAA</div><div class="stval">'+rGAA+'</div></div>';
  } else {
    statHtml+='<div class="stbox"><div class="stlbl">G</div><div class="stval" style="color:var(--red)">'+G.cGoals+'</div></div>';
    statHtml+='<div class="stbox"><div class="stlbl">A</div><div class="stval" style="color:var(--acc)">'+G.cAssists+'</div></div>';
    statHtml+='<div class="stbox"><div class="stlbl">PTS</div><div class="stval" style="color:var(--gold)">'+cp+'</div></div>';
    statHtml+='<div class="stbox"><div class="stlbl">AWARDS</div><div class="stval">'+G.awards.length+'</div></div>';
  }
  statHtml+='</div>';
  var rOg=getCareerOverallGradeDisplay();
  statHtml+='<div class="stbox" style="margin-bottom:10px;padding:10px 8px;text-align:center;border:1px solid var(--rl);background:var(--rink)">'+
    '<div class="stlbl">OVERALL PERFORMANCE</div>'+
    '<div class="stval" style="color:'+rOg.color+';font-size:22px;line-height:1.1">'+rOg.grade+'</div>'+
    '<div class="vt" style="font-size:12px;color:var(--mut);margin-top:6px;line-height:1.35">'+rOg.txt+'<br><span style="opacity:.88">'+rOg.sub+'</span></div>'+
    '</div>';
  statHtml+='<div class="vt" style="font-size:15px;color:var(--mut);line-height:1.8">';
  statHtml+='FINAL AGE: '+G.age+' &bull; FINAL OVR: '+ovr(G.attrs)+' &bull; CUPS: '+G.careerCups+'<br>';
  if(G.hometown) statHtml+='FROM: '+G.hometown+' &bull; ';
  statHtml+='#'+G.jersey+' &bull; '+G.nat+' &bull; '+(G.weight||180)+' LB';
  statHtml+='</div>';
  safeEl('retire-stats').innerHTML=statHtml;

  // Legacy section
  var aHtml='<div style="margin-bottom:14px;padding:12px;border:1px solid rgba(245,200,66,.3);background:rgba(245,200,66,.04)">';
  aHtml+='<div class="vt" style="font-size:22px;color:var(--gold);margin-bottom:6px">'+tierLabel+'</div>';
  // Legacy blurb
  var blurb='';
  if(isGoalie){
    blurb=G.cGP>=300?G.first+' '+G.last+' stood tall between the pipes for '+G.cGP+' career games. The save percentage of '+rSvPct+' tells only part of the story -- night after night, this was a goaltender opponents feared.':
           G.cGP>=100?'A reliable presence in net across multiple leagues. '+G.first+' '+G.last+' gave everything between the pipes and earned the respect of the game.':
           G.first+' '+G.last+' showed what it takes to compete at this level. The journey was the reward.';
  } else {
    blurb=cp>=500?G.first+' '+G.last+' retired with '+cp+' career points across '+G.cGP+' games -- a number that tells the story of a career built on skill, resilience, and an unshakeable love for the game.':
           cp>=200?'A professional career that spanned years and leagues. '+G.first+' '+G.last+' put up '+cp+' points and earned the respect of every dressing room they walked into.':
           G.first+' '+G.last+' lived the dream. From age 16 to retirement, every shift was earned.';
  }
  aHtml+='<div class="vt" style="font-size:15px;color:var(--mut);line-height:1.8">'+blurb+'</div>';
  aHtml+='</div>';
  if(G.careerCups>0){
    aHtml+='<div class="ni big" style="margin-bottom:8px">[^] '+G.careerCups+'x LEAGUE CHAMPION -- '+G.first+' '+G.last+' knew what winning felt like.</div>';
  }
  if(!G.awards.length){
    aHtml+='<div class="vt" style="font-size:14px;color:var(--mut)">NO INDIVIDUAL AWARDS -- BUT YOU PLAYED THE GAME THE RIGHT WAY.</div>';
  } else {
    for(var i=0;i<G.awards.length;i++){
      var a=G.awards[i];
      aHtml+='<div style="display:flex;align-items:center;gap:10px;padding:6px;border-bottom:1px solid rgba(122,184,224,.08)">';
      aHtml+='<div style="font-size:22px">AWD</div>';
      aHtml+='<div><div class="vt" style="font-size:15px;color:var(--gold)">'+a.name+'</div>';
      aHtml+='<div class="vt" style="font-size:12px;color:var(--mut)">'+a.desc+' -- SZN '+a.season+'</div></div></div>';
    }
  }
  safeEl('retire-legacy').innerHTML=aHtml;
}
