/* breakaway — INJURY */
// ============================================================
// INJURY
// ============================================================
function triggerInjury(){
  var injuries=[
    {n:'Upper Body Injury',wks:2,hl:15},{n:'Lower Body Injury',wks:3,hl:20},
    {n:'Concussion',wks:4,hl:30},{n:'Broken Hand',wks:6,hl:35},
    {n:'Knee Injury',wks:8,hl:45},{n:'Shoulder Separation',wks:6,hl:40}
  ];
  var inj=injuries[ri(0,injuries.length-1)];
  G.isInjured=true;G.injName=inj.n;G.injWks=inj.wks;
  G.health=cl(G.health-inj.hl,0,100);
  safeEl('m-injury-body').innerHTML=
    '<div style="font-size:42px;text-align:center;margin:10px 0">!</div>'+
    '<div class="vt" style="font-size:20px;color:var(--red);text-align:center;margin-bottom:10px">'+inj.n.toUpperCase()+'</div>'+
    '<div class="vt" style="font-size:15px;color:var(--mut);line-height:1.8">SEVERITY: '+(inj.wks<=3?'MINOR':inj.wks<=7?'MODERATE':'SERIOUS')+'<br>TIMELINE: '+inj.wks+' WEEKS<br>HEALTH: -'+inj.hl+'</div>';
  RetroSound.injury();
  openM('m-injury');
  addNews('INJURED: '+G.first+' '+G.last+' -- '+inj.n+' -- '+inj.wks+' wks','bad');
}
