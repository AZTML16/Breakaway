/* breakaway — STAFF CONVERSATIONS */
// ============================================================
// STAFF CONVERSATIONS
// ============================================================
function openStaffChat(title, lines, replies){
  // lines = [{sender, text, color?}]
  // replies = [{label, fn}]
  safeEl('staffchat-title').textContent=title;
  var body='';
  for(var i=0;i<lines.length;i++){
    var l=lines[i];
    body+='<div style="margin-bottom:12px;padding:10px;border:1px solid var(--rl);background:var(--rink)">';
    body+='<div class="vt" style="font-size:13px;color:'+(l.color||'var(--gold)')+';margin-bottom:4px">'+l.sender+'</div>';
    body+='<div class="vt" style="font-size:16px;line-height:1.6;color:var(--wht)">'+l.text+'</div>';
    body+='</div>';
  }
  safeEl('staffchat-body').innerHTML=body;
  var rHtml='';
  if(replies&&replies.length){
    for(var j=0;j<replies.length;j++){
      rHtml+='<button class="btn bp bw" onclick="staffChatReply('+j+')">'+replies[j].label+'</button>';
    }
  }
  safeEl('staffchat-replies').innerHTML=rHtml;
  window._staffChatReplies=replies||[];
  openM('m-staffchat');
}

function staffChatReply(idx){
  var r=window._staffChatReplies[idx];
  // Close first so callbacks can open a follow-up staff chat (e.g. playoffs -> world stage)
  // without this close firing immediately after and dismissing the new modal.
  closeM('m-staffchat');
  if(r&&r.fn) r.fn();
}

function applyLifeScenarioChoice(s,choiceIdx){
  if(!G||!s||!s.choices||!s.choices[choiceIdx]) return;
  var c=s.choices[choiceIdx];
  if(c.moraleSet!==undefined&&c.moraleSet!==null) G.morale=cl(c.moraleSet,0,100);
  else G.morale=cl(G.morale+(c.moraleDelta||0),0,100);
  var n=(c.news||'Off-ice moment.').replace(/\{F\}/g,G.first).replace(/\{L\}/g,G.last)
    .replace(/\{PEER\}/g,pressRandomPeer()).replace(/\{CRITIC\}/g,pressRandomCritic()).replace(/\{HANDLE\}/g,pressRandomHandle());
  addNews(n,c.newsTone||'neutral');
  if(c.notify) notify(c.notify,c.notifyColor||'gold');
  G._lifeScenarioFired=(G._lifeScenarioFired||0)+1;
  G._lifeScenarioLastCgp=G.cGP;
  if(G._lifeScenarioFired===1) addNews('Rare off-ice situation -- these do not happen often in a career.','neutral');
  G.socialMessages=generateSocialMessages();
}

function openRandomLifeScenario(){
  var list=LIFE_RANDOM_SCENARIOS;
  if(!list||!list.length||!G) return;
  var s=list[ri(0,list.length-1)];
  var story=expandLifePlaceholders(s.story);
  var lines=[{sender:expandLifePlaceholders(s.sender||'OFF-ICE'),color:'var(--acc)',text:story}];
  var replies=[];
  for(var j=0;j<s.choices.length;j++){
    (function(idx){
      replies.push({label:expandLifePlaceholders(s.choices[idx].label),fn:function(){applyLifeScenarioChoice(s,idx);}});
    })(j);
  }
  openStaffChat(expandLifePlaceholders(s.headline||'OUT OF NOWHERE'),lines,replies);
}

function maybeTriggerRandomLifeScenario(){
  if(!G||!G.first) return;
  if(G._playoffCtx||G._worldStageCtx) return;
  if(G._lifeScenarioRolledThisWeek) return;
  var minGap=52;
  if((G._lifeScenarioFired||0)>0&&(G.cGP-(G._lifeScenarioLastCgp||0))<minGap){
    G._lifeScenarioRolledThisWeek=true;
    return;
  }
  var p=(G._lifeScenarioFired||0)>0?0.0045:0.0075;
  if((G._lifeScenarioFired||0)===0&&G.cGP>=(G._lifeScenarioGuaranteeCgp||9999)) p=1;
  G._lifeScenarioRolledThisWeek=true;
  if(Math.random()>p) return;
  openRandomLifeScenario();
}

function triggerTradeConversation(newTeam){
  var coach=COACH_NAMES[ri(0,COACH_NAMES.length-1)];
  var lines=[
    {sender:'GM Harrington -- '+G.team.n, color:'var(--mut)',
     text:'We\'ve worked out a deal. '+newTeam.n+' reached out -- they want you badly. '+(ri(1,3))+' draft picks coming back our way.'},
    {sender:coach, color:'var(--acc)',
     text:'It\'s been a privilege coaching you here. You\'re going to a good situation. Their system will suit your game.'},
    {sender:newTeam.e+' '+newTeam.n+' -- New Club', color:'var(--gold)',
     text:'We\'re excited to bring you in. You\'re exactly the '+(G.pos==='G'?'goaltender':'player')+' we\'ve been looking for. #'+G.jersey+' will look good in our colours.'}
  ];
  var replies=[
    {label:'ACCEPT TRADE', fn:function(){acceptTrade();}},
    {label:'INVOKE NTC -- DECLINE', fn:function(){declineTrade();}}
  ];
  pendingTrade={team:newTeam};
  G.tradeOffersThisSeason=(G.tradeOffersThisSeason||0)+1;
  G._tradeCooldownUntilGp=Math.max(G._tradeCooldownUntilGp||0,G.gp+12);
  openStaffChat('TRADE OFFER -- '+newTeam.n.toUpperCase(), lines, G.contract.ntc?replies:[
    {label:'ACCEPT TRADE', fn:function(){acceptTrade();}},
    {label:'FORCED -- NO NTC', fn:function(){acceptTrade();}}
  ]);
}

function triggerOffseasonStaffChat(){
  var coach=COACH_NAMES[ri(0,COACH_NAMES.length-1)];
  var tier=G.league.tier;
  var scenarios=[
    // Contract expiring
    function(){
      if(G.contractYrsLeft<=0){
        openStaffChat('OFFSEASON MEETING -- CONTRACT',
          [{sender:'GM Harrington', color:'var(--gold)',
            text:'Your contract is up. We\'d love to bring you back but you have every right to explore your options. What are you thinking?'},
           {sender:coach, color:'var(--acc)',
            text:'From a coach\'s perspective -- you fit this system perfectly. I\'d love to have you back for another run.'}],
          [{label:'I WANT TO STAY', fn:function(){G.morale=cl(G.morale+8,0,100);addNews(G.first+' signals desire to re-sign with '+G.team.n+'.','neutral');}},
           {label:'EXPLORING OPTIONS', fn:function(){addNews(G.first+' '+G.last+' will test the market this offseason.','neutral');}},
           {label:'JUST SHOW ME THE MONEY', fn:function(){G.morale=cl(G.morale-5,0,100);addNews(G.first+' seeking top dollar in free agency.','neutral');}}]
        );
        return true;
      }
      return false;
    },
    // Possible promotion
    function(){
      if(['junior','college'].indexOf(tier)!==-1&&G.season>=2){
        var nextLg=NEXT_TIER[tier]&&NEXT_TIER[tier][G.gender]?NEXT_TIER[tier][G.gender][0]:'PHL';
        var scoutName=getRandomTalentName().split(' ')[0]+' (Scout)';
        openStaffChat('OFFSEASON MEETING -- ADVANCEMENT',
          [{sender:scoutName+' -- '+nextLg+' Affiliate', color:'var(--gold)',
            text:'We\'ve had eyes on you for most of this season. Your numbers and your compete level -- it translates. We want to talk about a spot with us next year.'},
           {sender:coach, color:'var(--acc)',
            text:'I told them everything I know. It\'s your time. I\'d go for it if I were you. This league is ready for the next chapter.'}],
          [{label:'LET\'S DO IT', fn:function(){G.morale=cl(G.morale+10,0,100);addNews(G.first+' intends to make the jump to the '+nextLg+'.','big');}},
           {label:'STAY ONE MORE YEAR', fn:function(){addNews(G.first+' chooses to stay in '+G.league.short+' for development.','neutral');}},
           {label:'I NEED TO THINK', fn:function(){addNews(G.first+' weighing options after strong season.','neutral');}}]
        );
        return true;
      }
      return false;
    },
    // General end-of-season debrief
    function(){
      var pts=G.goals+G.assists;
      var svPct=G.saves+(G.goalsAgainst||0)>0?Math.round((G.saves/(G.saves+(G.goalsAgainst||0))*1000))/10:0;
      openStaffChat('END-OF-SEASON DEBRIEF',
        [{sender:coach, color:'var(--gold)',
          text:G.pos==='G'
            ? (svPct>=92?'That was a season, '+G.first+'. '+svPct+' SV% and calm under pressure. You pushed this team.':
               svPct>=90?'Solid year in net. Some stretches I\'d want back, but the compete level was there. We build on this.':
               'Tough season, '+G.first+'. But I\'ve watched you grow in net. The work behind closed doors is not going unnoticed.')
            : (pts>=30?'That was a season, '+G.first+'. '+pts+' points. You pushed this team. I\'m proud of what you built this year.':
               pts>=15?'Solid year. Some stretches I\'d want back but the compete level was there. We build on this.':
               'Tough season, '+G.first+'. But I\'ve watched you grow. The work you put in behind closed doors -- it\'s not going unnoticed.')},
         {sender:'GM Harrington', color:'var(--mut)',
          text:G.morale>=70?'Management is pleased with the direction. We\'re confident in what you bring to this room every day.':
                'I\'ll be honest with you -- we need more from this club. But that starts with everyone, including the front office.'}],
        [{label:'WE BUILD FROM HERE', fn:function(){G.morale=cl(G.morale+5,0,100);}},
         {label:'I\'M MOTIVATED', fn:function(){G.morale=cl(G.morale+8,0,100);G.xp+=Math.round(50*getPotentialXpMult(G.potential||'support'));}},
         {label:'I HAVE CONCERNS', fn:function(){addNews(G.first+' requests meeting with management ahead of next season.','neutral');}}]
      );
      return true;
    }
  ];
  // Try scenarios in order, stop at first match
  for(var i=0;i<scenarios.length;i++){
    if(scenarios[i]()) break;
  }
}
