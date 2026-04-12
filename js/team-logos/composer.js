/**
 * Team crest composer (pro + college). Loaded after the main game script.
 * Requires: hashStr, escHtml, teamNameParts, phlFranchisePaletteForTeam, isCollegeLeagueKey,
 * teamColorPack, collegeMarkLetter, collegeBannerTag, teamInitials, hexBlend, hexDarken,
 * TEAM_LOGO_GRAPHIC_COUNT (from gfx-dispatch.js), teamLogoShellSVG, teamLogoStripeSVG, teamLogoGraphicSVG.
 */

/** Display fonts: mix of modern sporty / script and retro pixel (hash-stable per seed). */
function teamLogoFont(seed,forWordmark){
  var s=seed>>>0;
  var modern=(s%5)!==0;
  var wModern=['Bebas Neue, sans-serif','Oswald, sans-serif','Russo One, sans-serif','Righteous, cursive','Outfit, sans-serif','Dancing Script, cursive','Pacifico, cursive'];
  var wRetro=['VT323, monospace','Silkscreen, monospace','Press Start 2P, monospace'];
  var mModern=['Oswald, sans-serif','Russo One, sans-serif','Bebas Neue, sans-serif','Outfit, sans-serif'];
  var mRetro=['Silkscreen, monospace','Press Start 2P, monospace','VT323, monospace'];
  if(forWordmark){
    var w=modern?wModern:wRetro;
    return w[s%w.length];
  }
  var m=modern?mModern:mRetro;
  return m[s%m.length];
}

/** Scale down font size for long nicknames so text stays inside the 36×36 crest. */
function teamLogoFitFs(charCount,minFs,maxFs){
  var n=Math.max(1,charCount|0);
  if(n<=4) return maxFs;
  if(n<=7) return minFs+(maxFs-minFs)*0.72;
  if(n<=10) return minFs+(maxFs-minFs)*0.48;
  return Math.max(minFs,maxFs-(n-4)*0.38);
}

function teamLogoTextFitAttrs(str,optMinLen,textLengthMax){
  var L=String(str||'').length;
  var minLen=optMinLen!=null?optMinLen:9;
  if(L<minLen) return '';
  var tl=Math.min(textLengthMax!=null?textLengthMax:30,6+L*2.15);
  return ' textLength="'+tl.toFixed(1)+'" lengthAdjust="spacingAndGlyphs"';
}

/** Same string for all PHL-affiliate tiers with a franchise palette; else team + league. */
function teamLogoIdentityBlob(teamName,leagueKey){
  var lk=String(leagueKey||'');
  if(phlFranchisePaletteForTeam(teamName,lk))
    return String(teamNameParts(teamName).nick||'').toLowerCase()+'|phlcrest';
  return String(teamName||'TEAM')+'|'+lk;
}
/** Independent hash lanes reduce collisions: shell / stripe / icon / text are uncorrelated. */
function teamLogoRecipeFromTeam(teamName,leagueKey){
  var B=teamLogoIdentityBlob(teamName,leagueKey);
  var gc=typeof TEAM_LOGO_GRAPHIC_COUNT==='number'?TEAM_LOGO_GRAPHIC_COUNT:320;
  return {
    shell: hashStr(B+'|shell') & 15,
    stripe: hashStr(B+'|stripe') & 7,
    graphic: hashStr(B+'|graphic') % gc,
    textMode: hashStr(B+'|textm') & 7,
    wordStyle: hashStr(B+'|wstyle') & 3,
    wordSkew: (hashStr(B+'|wskew') % 19) - 9,
    wordOnly: (hashStr(B+'|wocrest') % 5) === 0,
    /* 0 classic, 1 action, 2 minimal, 3 slick sheen, 4 memorial ribbon, 5 roundel rings, 6 underline swoosh */
    crestFamily: hashStr(B+'|cvibe') % 7
  };
}

/** Extra layers inspired by real crest families (motion, clean uniforms, glossy, heritage). */
function teamLogoCrestVibe(uid,fam,cols){
  var ac=cols.accent,sc=cols.secondary||cols.sec,tx=cols.text;
  var behind='',front='',stripeKill=false,defExtra='';
  if(fam===1){
    behind=
      '<g opacity=".34" pointer-events="none"><path d="M2 18 L14 11 L32 16 L12 24 Z" fill="'+tx+'"/><path d="M4 22 L15 16 L30 20 L14 26 Z" fill="'+ac+'" opacity=".42"/></g>';
  }else if(fam===2){
    stripeKill=true;
    behind='<circle cx="18" cy="18" r="12.8" fill="none" stroke="'+ac+'" stroke-width=".22" opacity=".3"/>';
  }else if(fam===3){
    defExtra=
      '<linearGradient id="shine'+uid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".16"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".12"/></linearGradient>';
    front='<rect x="0.5" y="0.5" width="35" height="35" fill="url(#shine'+uid+')" opacity=".5"/>';
  }else if(fam===4){
    front=
      '<path d="M5 33 Q18 28.5 31 33" fill="none" stroke="'+sc+'" stroke-width=".5" opacity=".48"/><path d="M9 31.5 Q18 28 27 31.5" fill="none" stroke="'+ac+'" stroke-width=".32" opacity=".38"/>';
  }else if(fam===5){
    behind=
      '<circle cx="18" cy="18" r="14" fill="none" stroke="'+ac+'" stroke-width=".32" opacity=".26"/><circle cx="18" cy="18" r="10.8" fill="none" stroke="'+sc+'" stroke-width=".24" opacity=".2"/>';
  }else if(fam===6){
    front='<path d="M5 32.5 Q18 26.5 31 32.5" fill="none" stroke="'+ac+'" stroke-width=".85" stroke-linecap="round" opacity=".48"/>';
  }
  return {behind:behind,front:front,stripeKill:stripeKill,defExtra:defExtra};
}

/** Nickname wordmark: plain, slight rotation, or curved along an arc (defs + textPath). */
function teamLogoNickTextSVG(pathId,escText,font,fill,opt){
  opt=opt||{};
  var x=opt.x!=null?opt.x:18;
  var y=opt.y!=null?opt.y:31.5;
  var fs=opt.fs!=null?opt.fs:5;
  var style=(opt.style!=null?opt.style:0)&3;
  var skew=opt.skew!=null?opt.skew:0;
  var op=opt.op!=null?opt.op:0.92;
  var arcY=opt.arcY!=null?opt.arcY:9;
  var it=opt.italic?' font-style="italic"':'';
  var defs,svg;
  if(style===1){
    var fit1=teamLogoTextFitAttrs(escText,opt.fitMinLen,opt.fitMax);
    return {defs:'',svg:'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="'+font+'" font-size="'+fs+'" fill="'+fill+'"'+it+' opacity="'+op+'"'+fit1+' transform="rotate('+skew+' '+x+' '+(y-fs*0.35)+')">'+escText+'</text>'};
  }
  if(style===2){
    defs='<path id="'+pathId+'" d="M 5.5 '+y+' A 12.5 5.2 0 0 0 30.5 '+y+'" fill="none"/>';
    svg='<text font-family="'+font+'" font-size="'+fs+'" fill="'+fill+'"'+it+' opacity="'+op+'"><textPath href="#'+pathId+'" startOffset="50%" text-anchor="middle">'+escText+'</textPath></text>';
    return {defs:defs,svg:svg};
  }
  if(style===3){
    defs='<path id="'+pathId+'" d="M 5.5 '+arcY+' A 12.5 4.8 0 0 1 30.5 '+arcY+'" fill="none"/>';
    svg='<text font-family="'+font+'" font-size="'+fs+'" fill="'+fill+'"'+it+' opacity="'+op+'"><textPath href="#'+pathId+'" startOffset="50%" text-anchor="middle">'+escText+'</textPath></text>';
    return {defs:defs,svg:svg};
  }
  var fit0=teamLogoTextFitAttrs(escText,opt.fitMinLen,opt.fitMax);
  return {defs:'',svg:'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="'+font+'" font-size="'+fs+'" fill="'+fill+'"'+it+' opacity="'+op+'"'+fit0+'>'+escText+'</text>'};
}

function teamLogoMergeNickDefs(defs,nickDefs){
  if(!nickDefs) return defs;
  if(defs&&defs.indexOf('</defs>')>=0) return defs.replace('</defs>',nickDefs+'</defs>');
  return '<defs>'+nickDefs+'</defs>'+(defs||'');
}

function teamLogoClipPathDef(uid){
  return '<clipPath id="cp'+uid+'"><rect x="0" y="0" width="36" height="36"/></clipPath>';
}

function teamLogoMergeClipDef(defs,uid){
  return teamLogoMergeNickDefs(defs,teamLogoClipPathDef(uid));
}


// ============================================================
// TEAM LOGOS — NCAA / college SVG layouts
// ============================================================

/** Layout + mini-mark from independent lanes (same blob as pro logos for affiliates). */
function teamLogoSVGCollege(teamName,size,cols,leagueKey){
  var lk=String(leagueKey!=null?leagueKey:'');
  var B=teamLogoIdentityBlob(teamName,lk);
  var s=size||26;
  var letter=collegeMarkLetter(teamName);
  var bg=cols.bg, ac=cols.accent, sc=cols.secondary||cols.sec, tx=cols.text, bd=cols.trim||cols.border||'rgba(255,255,255,.12)';
  var sw=0.52;
  var uid='c'+(hashStr(B+'|cuid')%90000+100);
  var parts=teamNameParts(teamName);
  var nick=parts.nick||'TEAM';
  var wordmark=nick.length>12?nick.slice(0,12):nick;
  var wm=escHtml(wordmark);
  var tag=escHtml(collegeBannerTag(teamName));
  var simp=!!cols.simplePalette;
  if(simp) sc=hexBlend(bg,ac,0.42);
  var v=hashStr(B+'|collayout')%28;
  var monoFont=teamLogoFont(hashStr(B+'|cff0'),false), wordFont=teamLogoFont(hashStr(B+'|cff1'),true);
  var letterFont=teamLogoFont(hashStr(B+'|cLet'),false);
  var ini=teamInitials(teamName);
  var midBlend=hexBlend(bg,ac,simp?0.1:0.25);
  var gcx=typeof TEAM_LOGO_GRAPHIC_COUNT==='number'?TEAM_LOGO_GRAPHIC_COUNT:320;
  var gmark=hashStr(B+'|colgraphic')%gcx;
  var graphicMini='<g transform="translate(18,15) scale(.46) translate(-18,-14)" opacity="'+(simp?'.28':'.42')+'">'+teamLogoGraphicSVG(gmark,cols)+'</g>';
  var gBanner='<g transform="translate(4,7) scale(.76)">'+teamLogoGraphicSVG(gmark,cols)+'</g>';
  var cwmRot=(hashStr(B+'|cwmrot')%13)-6;
  function cwT(x,y,fs,fil,op,wm,it){
    var tr=cwmRot?' transform="rotate('+cwmRot+' '+x+' '+(y-1)+')"':'';
    var italic=it?' font-style="italic"':'';
    var fit=teamLogoTextFitAttrs(wm,8,28);
    return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="'+wordFont+'" font-size="'+fs+'" fill="'+fil+'" opacity="'+op+'"'+italic+tr+fit+'>'+wm+'</text>';
  }
  if((hashStr(B+'|cNm')%9)===0){
    var cn=teamLogoNickTextSVG('cn'+uid,wm,wordFont,tx,{y:20,fs:teamLogoFitFs(wordmark.length,6,11),style:hashStr(B+'|cs')&3,skew:(hashStr(B+'|csk')%11)-5,italic:(hashStr(B+'|cit')%2===0),op:0.93,fitMinLen:4,fitMax:30});
    var cdef=cn.defs?'<defs>'+cn.defs+'</defs>':'';
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      cdef+
      '<rect x="2.5" y="2.5" width="31" height="31" rx="3.5" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<text x="18" y="7.5" text-anchor="middle" font-family="'+monoFont+'" font-size="2.6" fill="'+ac+'" opacity=".75" textLength="26" lengthAdjust="spacingAndGlyphs">'+tag+'</text>'+
      cn.svg+
      '</svg>';
  }
  if(v===0){
    var fill0=simp?bg:('url(#rg'+uid+')');
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      (simp?'':'<defs><radialGradient id="rg'+uid+'"><stop offset="0" stop-color="'+midBlend+'"/><stop offset="1" stop-color="'+bg+'"/></radialGradient></defs>')+
      '<circle cx="18" cy="18" r="14.8" fill="'+fill0+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<circle cx="18" cy="18" r="12.5" fill="none" stroke="'+ac+'" stroke-width="'+(simp?'0.45':'0.65')+'" opacity="'+(simp?'.28':'.45')+'"/>'+
      '<text x="18" y="22.2" text-anchor="middle" font-family="'+letterFont+'" font-size="15" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,31,"4.2",tx,".9",wm,false)+
      '</svg>';
  }
  if(v===1){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M18 4.5 L31 9.5 V23 Q31 28 18 31.5 Q5 28 5 23 V9.5 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M10 10 H26" stroke="'+ac+'" stroke-width="1.6" opacity="'+(simp?'.22':'.35')+'"/>'+
      '<text x="18" y="20" text-anchor="middle" font-family="'+letterFont+'" font-size="11" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,28,"3.6",tx,".88",wm,false)+
      '</svg>';
  }
  if(v===2){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M5 5 L31 5 L5 31 Z" fill="'+sc+'" opacity="'+(simp?'.55':'.78')+'"/>'+
      '<path d="M31 5 L31 31 L5 31 Z" fill="'+bg+'"/>'+
      '<path d="M5 5 L31 5 L31 31 L5 31 Z" fill="none" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<text x="20" y="21" text-anchor="middle" font-family="'+monoFont+'" font-size="14" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,30,"3.4",tx,".9",wm,false)+
      '</svg>';
  }
  if(v===3){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<rect x="3" y="3" width="30" height="30" rx="3" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<rect x="3" y="3" width="11" height="30" fill="'+ac+'" opacity="'+(simp?'.14':'.2')+'"/>'+
      '<text x="8.5" y="22" text-anchor="middle" font-family="'+letterFont+'" font-size="9" fill="'+ac+'">'+letter+'</text>'+
      '<text x="22" y="12" text-anchor="middle" font-family="'+wordFont+'" font-size="3.2" fill="'+tx+'" opacity=".55">'+tag+'</text>'+
      cwT(22,24,"4",tx,".88",wm,false)+
      '</svg>';
  }
  if(v===4){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M5 5 H31 V21 Q31 28 18 32 Q5 28 5 21 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<rect x="8" y="7" width="20" height="3.5" fill="'+ac+'" opacity="'+(simp?'.15':'.25')+'"/>'+
      (!simp?'<rect x="10" y="23" width="16" height="1.8" fill="'+sc+'" opacity=".35"/>':'')+
      '<text x="18" y="19" text-anchor="middle" font-family="'+letterFont+'" font-size="16" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,28.5,"4.8",sc,".92",wm,true)+
      '</svg>';
  }
  if(v===5){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<polygon points="18,3.5 31.5,11 31.5,25 18,32.5 4.5,25 4.5,11" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<polygon points="18,7 27,12 27,23 18,29 9,23 9,12" fill="none" stroke="'+ac+'" stroke-width="0.5" opacity=".4"/>'+
      '<text x="18" y="21" text-anchor="middle" font-family="'+letterFont+'" font-size="10" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,28,"3.4",tx,".85",wm,false)+
      '</svg>';
  }
  if(v===6){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M4 6 H32 V26 H4 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      gBanner+
      '<rect x="20" y="14" width="13" height="12" rx="1" fill="rgba(0,0,0,.28)" stroke="'+ac+'" stroke-width="0.5"/>'+
      '<text x="26.5" y="22.5" text-anchor="middle" font-family="'+letterFont+'" font-size="9" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,33,"3.5",tx,".82",wm,false)+
      '</svg>';
  }
  if(v===7){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M5 6 H31 V24 Q31 30 18 33 Q5 30 5 24 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M5 10 H31" stroke="'+ac+'" stroke-width="3.2" opacity="'+(simp?'.55':'.72')+'"/>'+
      '<path d="M5 16 H31" stroke="'+sc+'" stroke-width="2.4" opacity=".5"/>'+
      (!simp?'<path d="M5 21 H31" stroke="'+tx+'" stroke-width="1.2" opacity=".2"/>':'')+
      '<text x="18" y="29" text-anchor="middle" font-family="'+monoFont+'" font-size="13" fill="'+tx+'">'+letter+'</text>'+
      '</svg>';
  }
  if(v===8){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<rect x="4" y="5" width="28" height="26" rx="5" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M4 14 H32 M4 22 H32" stroke="'+ac+'" stroke-width="1.2" opacity=".3"/>'+
      '<text x="18" y="19.5" text-anchor="middle" font-family="'+letterFont+'" font-size="10" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,28,"3.5",tx,".88",wm,false)+
      '</svg>';
  }
  if(v===9){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M18 5 L31 18 L18 31 L5 18 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M18 9 L27 18 L18 27 L9 18 Z" fill="none" stroke="'+ac+'" stroke-width="0.55" opacity=".45"/>'+
      '<text x="18" y="21" text-anchor="middle" font-family="'+letterFont+'" font-size="14" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,29,"3.2",tx,".85",wm,false)+
      '</svg>';
  }
  if(v===10){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<circle cx="18" cy="18" r="14.5" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<circle cx="18" cy="18" r="11.8" fill="none" stroke="'+sc+'" stroke-width="1.4" opacity="'+(simp?'.25':'.4')+'"/>'+
      '<text x="18" y="16" text-anchor="middle" font-family="'+monoFont+'" font-size="6" fill="'+ac+'">'+ini+'</text>'+
      '<text x="18" y="24.5" text-anchor="middle" font-family="'+letterFont+'" font-size="9" fill="'+tx+'">'+letter+'</text>'+
      '<text x="18" y="31" text-anchor="middle" font-family="'+wordFont+'" font-size="3.2" fill="'+tx+'" opacity=".75">'+tag+'</text>'+
      '</svg>';
  }
  if(v===11){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<rect x="3" y="3" width="30" height="30" rx="3" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<rect x="22" y="3" width="11" height="30" fill="'+ac+'" opacity="'+(simp?'.14':'.22')+'"/>'+
      '<text x="27.5" y="22" text-anchor="middle" font-family="'+letterFont+'" font-size="9" fill="'+ac+'">'+letter+'</text>'+
      '<text x="14" y="14" text-anchor="middle" font-family="'+wordFont+'" font-size="3.1" fill="'+tx+'" opacity=".55">'+tag+'</text>'+
      cwT(14,24,"4",tx,".88",wm,false)+
      '</svg>';
  }
  if(v===12){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<ellipse cx="18" cy="18" rx="15.2" ry="10.8" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<ellipse cx="18" cy="18" rx="12" ry="7.8" fill="none" stroke="'+ac+'" stroke-width="0.55" opacity=".38"/>'+
      '<text x="18" y="21.5" text-anchor="middle" font-family="'+letterFont+'" font-size="16" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,30,"3.4",tx,".86",wm,false)+
      '</svg>';
  }
  if(v===13){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M5 5 H31 L25 31 L11 31 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M9 9 H27 L23 26 L13 26 Z" fill="none" stroke="'+sc+'" stroke-width="0.6" opacity=".35"/>'+
      '<text x="18" y="21" text-anchor="middle" font-family="'+monoFont+'" font-size="15" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,29,"3.3",tx,".85",wm,false)+
      '</svg>';
  }
  if(v===14){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M4 7 L4 29 L32 18 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M8 11 L8 25 L26 18 Z" fill="'+ac+'" opacity="'+(simp?'.18':'.28')+'"/>'+
      '<text x="17" y="21" text-anchor="middle" font-family="'+letterFont+'" font-size="10" fill="'+tx+'">'+letter+'</text>'+
      '</svg>';
  }
  if(hashStr(B+'|bigL')%3===0 && v===15){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<circle cx="18" cy="18" r="15" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<text x="18" y="25" text-anchor="middle" font-family="'+letterFont+'" font-size="22" fill="'+ac+'">'+letter+'</text>'+
      '</svg>';
  }
  if(v===15){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M7 7 L29 5 L31 29 L5 31 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M10 10 L26 9 L27 25 L9 26 Z" fill="none" stroke="'+ac+'" stroke-width="0.65" opacity=".4"/>'+
      '<text x="18" y="20" text-anchor="middle" font-family="'+letterFont+'" font-size="14" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,28,"3.2",tx,".84",wm,false)+
      '</svg>';
  }
  if(v===16){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<rect x="3" y="3" width="30" height="30" rx="2" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      graphicMini+
      '<text x="18" y="22" text-anchor="middle" font-family="'+letterFont+'" font-size="12" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,31,"3.4",tx,".88",wm,false)+
      '</svg>';
  }
  if(v===17){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M8 4 H28 L32 10 V26 L28 32 H8 L4 26 V10 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M11 8 H25 L27 12 V24 L25 28 H11 L9 24 V12 Z" fill="none" stroke="'+ac+'" stroke-width="0.5" opacity=".35"/>'+
      '<text x="18" y="21" text-anchor="middle" font-family="'+monoFont+'" font-size="13" fill="'+ac+'">'+letter+'</text>'+
      cwT(18,29,"3.5",tx,".82",wm,false)+
      '</svg>';
  }
  if(v===18){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M18 4 L22 14 L33 15 L24 22 L27 33 L18 27 L9 33 L12 22 L3 15 L14 14 Z" fill="'+sc+'" opacity="'+(simp?'.25':'.4')+'"/>'+
      '<circle cx="18" cy="18" r="11" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<text x="18" y="22" text-anchor="middle" font-family="'+letterFont+'" font-size="14" fill="'+ac+'">'+letter+'</text>'+
      '<text x="18" y="31" text-anchor="middle" font-family="'+wordFont+'" font-size="3.2" fill="'+tx+'" opacity=".8">'+tag+'</text>'+
      '</svg>';
  }
  if(v===19){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<rect x="4" y="4" width="28" height="9" fill="'+ac+'" opacity=".75"/>'+
      '<rect x="4" y="13" width="28" height="10" fill="'+bg+'"/>'+
      '<rect x="4" y="23" width="28" height="9" fill="'+sc+'" opacity=".65"/>'+
      '<rect x="4" y="4" width="28" height="28" fill="none" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<text x="18" y="21.5" text-anchor="middle" font-family="'+letterFont+'" font-size="9" fill="'+tx+'">'+letter+'</text>'+
      cwT(18,30,"3.2",tx,".75",wm,false)+
      '</svg>';
  }
  if(v===20){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M7 24 A11.5 11.5 0 1 1 29 24" fill="none" stroke="'+ac+'" stroke-width="2.9" stroke-linecap="round"/>'+
      '<circle cx="18" cy="18" r="9.8" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<text x="18" y="21.5" text-anchor="middle" font-family="'+monoFont+'" font-size="12" fill="'+tx+'">'+letter+'</text>'+
      cwT(18,30,"3.4",ac,".75",wm,false)+
      '</svg>';
  }
  if(v===21){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M18 4 L31 9 V27 L18 32 L5 27 V9 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M18 4 L18 32 M5 9 L31 27 M31 9 L5 27" stroke="'+ac+'" stroke-width="0.35" opacity=".25"/>'+
      '<path d="M5 9 L18 4 L18 32 L5 27 Z" fill="'+sc+'" opacity="'+(simp?'.35':'.5')+'"/>'+
      '<text x="12" y="21" text-anchor="middle" font-family="'+letterFont+'" font-size="11" fill="'+tx+'">'+letter+'</text>'+
      '<text x="24" y="21" text-anchor="middle" font-family="'+wordFont+'" font-size="4" fill="'+ac+'" opacity=".9">'+ini+'</text>'+
      '</svg>';
  }
  if(v===22){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<rect x="3" y="3" width="30" height="30" rx="2" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<circle cx="13" cy="18" r="7.5" fill="none" stroke="'+ac+'" stroke-width="1.8" opacity=".85"/>'+
      '<circle cx="23" cy="18" r="7.5" fill="none" stroke="'+sc+'" stroke-width="1.8" opacity=".85"/>'+
      '<text x="18" y="22" text-anchor="middle" font-family="'+letterFont+'" font-size="8" fill="'+tx+'">'+letter+'</text>'+
      cwT(18,31,"3.2",tx,".7",wm,false)+
      '</svg>';
  }
  if(v===23){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M18 3 C10 3 6 12 6 18 C6 28 18 33 18 33 C18 33 30 28 30 18 C30 12 26 3 18 3 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<ellipse cx="18" cy="16" rx="6" ry="5" fill="'+ac+'" opacity="'+(simp?'.2':'.32')+'"/>'+
      '<text x="18" y="19" text-anchor="middle" font-family="'+monoFont+'" font-size="12" fill="'+tx+'">'+letter+'</text>'+
      cwT(18,28,"3.5",tx,".85",wm,false)+
      '</svg>';
  }
  if(v===24){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<defs><linearGradient id="lgM'+uid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+ac+'"/><stop offset="1" stop-color="'+hexBlend(ac,bg,0.45)+'"/></linearGradient></defs>'+
      '<rect x="2" y="2" width="32" height="32" rx="4" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<text x="18" y="24" text-anchor="middle" font-family="'+letterFont+'" font-size="26" fill="url(#lgM'+uid+')" font-weight="700" style="letter-spacing:-1px">'+letter+'</text>'+
      cwT(18,32.5,"3",tx,".88",wm,false)+
      '</svg>';
  }
  if(v===25){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<circle cx="18" cy="18" r="15.5" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<circle cx="18" cy="18" r="12" fill="none" stroke="'+sc+'" stroke-width="0.6" opacity=".4"/>'+
      '<text x="18" y="23.5" text-anchor="middle" font-family="'+letterFont+'" font-size="24" fill="'+ac+'" font-weight="700">'+letter+'</text>'+
      '<text x="18" y="8.5" text-anchor="middle" font-family="'+monoFont+'" font-size="2.8" fill="'+tx+'" opacity=".65" textLength="28" lengthAdjust="spacingAndGlyphs">'+tag+'</text>'+
      '</svg>';
  }
  if(v===26){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M18 3 L33 18 L18 33 L3 18 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M18 7 L29 18 L18 29 L7 18 Z" fill="none" stroke="'+ac+'" stroke-width="0.45" opacity=".35"/>'+
      '<text x="18" y="22" text-anchor="middle" font-family="'+letterFont+'" font-size="21" fill="'+tx+'" font-weight="700">'+letter+'</text>'+
      cwT(18,30.5,"2.9",ac,".82",wm,false)+
      '</svg>';
  }
  if(v===27){
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
      '<path d="M5 6 H31 V28 Q31 32 18 34 Q5 32 5 28 Z" fill="'+bg+'" stroke="'+bd+'" stroke-width="'+sw+'"/>'+
      '<path d="M8 9 H28 V26 Q28 29 18 30.5 Q8 29 8 26 Z" fill="'+hexBlend(bg,ac,0.12)+'" opacity="'+(simp?'.4':'.55')+'"/>'+
      '<text x="18" y="23" text-anchor="middle" font-family="'+letterFont+'" font-size="23" fill="'+ac+'" font-weight="700">'+letter+'</text>'+
      '</svg>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+
    '<rect x="3" y="3" width="30" height="30" rx="4" fill="'+bg+'" stroke="'+ac+'" stroke-width="1.2"/>'+
    '<text x="18" y="22" text-anchor="middle" font-family="'+letterFont+'" font-size="15" fill="'+ac+'">'+letter+'</text>'+
    cwT(18,31,"3.6",tx,"1",wm,false)+
    '</svg>';
}
// ============================================================
// TEAM LOGOS — pro / minor / junior composer
// ============================================================

function teamLogoSVG(teamName,size,leagueKey){
  var lk=String(leagueKey!=null?leagueKey:'');
  var cols=teamColorPack(teamName,lk);
  if(isCollegeLeagueKey(lk)) return teamLogoSVGCollege(teamName,size,cols,lk);
  var B=teamLogoIdentityBlob(teamName,lk);
  var r=teamLogoRecipeFromTeam(teamName,lk);
  var shell=cols.frameless ? (14+(hashStr(B+'|frsh')&1)) : r.shell;
  var t=teamInitials(teamName), s=size||26;
  var parts=teamNameParts(teamName);
  var monoFont=teamLogoFont(hashStr(B+'|pf0'),false), wordFont=teamLogoFont(hashStr(B+'|pf1'),true);
  var nick=parts.nick||'TEAM';
  var wordmark=escHtml(nick.length>11?nick.slice(0,11):nick);
  var bg=cols.bg, ac=cols.accent, sc=cols.secondary||cols.sec, tx=cols.text, bd=cols.trim||cols.border||'rgba(255,255,255,.12)';
  var sw=cols.echo?1.1:0.6;
  var uid='r'+(hashStr(B+'|puid')%80000+1000);
  var tm=r.textMode;
  var bg2=hexDarken(bg,.72);
  var defs='', shellSvg;
  if(cols.frameless){
    defs='<defs><linearGradient id="lg'+uid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+bg+'"/><stop offset="1" stop-color="'+bg2+'"/></linearGradient>'+
      '<pattern id="pt'+uid+'" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0 H4" stroke="rgba(255,255,255,.05)" stroke-width=".6"/></pattern></defs>';
    shellSvg='<rect x="1.5" y="1.5" width="33" height="33" rx="2.5" fill="url(#lg'+uid+')" stroke="'+bd+'" stroke-width="'+sw+'"/><rect x="1.5" y="1.5" width="33" height="33" rx="2.5" fill="url(#pt'+uid+')" opacity=".85"/>';
  }else{
    shellSvg=teamLogoShellSVG(shell,bg,bd,sw);
  }
  var stripeSvg=teamLogoStripeSVG(r.stripe,ac,sc);
  var vibe=teamLogoCrestVibe(uid,r.crestFamily,cols);
  if(vibe.defExtra) defs=teamLogoMergeNickDefs(defs,vibe.defExtra);
  if(vibe.stripeKill) stripeSvg='';
  if(r.wordOnly){
    defs=teamLogoMergeClipDef(defs,uid);
    var nickLen=Math.min(12,nick.length);
    var fsW=teamLogoFitFs(nickLen,5.4,11);
    var mainSt=hashStr(B+'|wom')&3;
    var wmMain=teamLogoNickTextSVG('wo'+uid+'1',wordmark,wordFont,tx,{y:20.5,fs:fsW,style:mainSt,skew:r.wordSkew,italic:(hashStr(B+'|woi')%2===0),op:0.94,fitMinLen:5,fitMax:30});
    var wmArc=teamLogoNickTextSVG('wo'+uid+'2',wordmark,wordFont,sc||ac,{y:31,fs:Math.max(3.1,fsW*0.42),style:2,skew:0,italic:true,op:0.74,fitMinLen:5,fitMax:30});
    var topIni='<text x="18" y="9.5" text-anchor="middle" font-family="'+monoFont+'" font-size="3.2" fill="'+ac+'" opacity=".88"'+teamLogoTextFitAttrs(escHtml(t),4,24)+'>'+escHtml(t)+'</text>';
    defs=teamLogoMergeNickDefs(defs,wmMain.defs+wmArc.defs);
    var wBody='<g clip-path="url(#cp'+uid+')">'+vibe.behind+topIni+wmMain.svg+wmArc.svg+vibe.front+'</g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+defs+shellSvg+stripeSvg+wBody+'</svg>';
  }
  function gl(sc,dy){
    var y=dy==null?16:dy;
    var sc2=Math.min(sc,1.02);
    return '<g transform="translate(18,'+y+') scale('+sc2+') translate(-18,-14)">'+teamLogoGraphicSVG(r.graphic,cols)+'</g>';
  }
  var nickLen=Math.min(12,nick.length);
  var wsty=r.wordStyle,wsk=r.wordSkew;
  var fsB=teamLogoFitFs(nickLen,3.5,5.3), fsH=teamLogoFitFs(nickLen,4.6,7.4), fsSm=teamLogoFitFs(nickLen,3.2,4.5);
  var wb=teamLogoNickTextSVG('p'+uid+'b',wordmark,wordFont,tx,{y:31.5,fs:fsB,style:wsty,skew:wsk,italic:true,op:0.92,fitMinLen:6,fitMax:29});
  var wh=teamLogoNickTextSVG('p'+uid+'h',wordmark,wordFont,ac,{y:24,fs:fsH,style:(wsty+1)&3,skew:wsk,italic:true,op:0.92,arcY:8,fitMinLen:6,fitMax:29});
  var w7=teamLogoNickTextSVG('p'+uid+'7',wordmark,wordFont,tx,{y:28.5,fs:fsSm,style:(wsty<=1?wsty:1),skew:(hashStr(B+'|w7')%15)-7,italic:true,op:0.88,fitMinLen:6,fitMax:28});
  var wMix=teamLogoNickTextSVG('p'+uid+'x',wordmark,wordFont,tx,{y:28.5,fs:fsSm,style:(wsty+2)&3,skew:wsk,italic:false,op:0.88,fitMinLen:6,fitMax:28});
  defs=teamLogoMergeClipDef(defs,uid);
  defs=teamLogoMergeNickDefs(defs,wb.defs+wh.defs+w7.defs+wMix.defs);
  var initialsTop='<text x="18" y="9.5" text-anchor="middle" font-family="'+monoFont+'" font-size="4.4" fill="'+ac+'" style="letter-spacing:.5px"'+teamLogoTextFitAttrs(escHtml(t),5,22)+'>'+escHtml(t)+'</text>';
  var initialsCorner='<text x="6" y="9" font-family="'+monoFont+'" font-size="3.2" fill="'+ac+'">'+escHtml(t)+'</text>';
  var wmBottom=wb.svg;
  var wmHero=wh.svg;
  var initHero='<text x="18" y="23.8" text-anchor="middle" font-family="'+monoFont+'" font-size="13.5" fill="'+ac+'"'+teamLogoTextFitAttrs(escHtml(t),4,26)+'>'+escHtml(t)+'</text>';
  var ring='<circle cx="18" cy="18" r="13" fill="none" stroke="'+ac+'" stroke-width=".45" opacity=".35"/>';
  var body;
  if(tm===0) body=initialsTop+gl(0.82)+wmBottom;
  else if(tm===1) body=initialsCorner+gl(0.96,17);
  else if(tm===2) body=wmHero;
  else if(tm===3) body=ring+initHero;
  else if(tm===4) body=gl(0.94,17)+wmBottom;
  else if(tm===5) body='<rect x="4" y="9" width="5" height="18" rx="1" fill="'+ac+'" opacity=".32"/><text x="6.5" y="21" text-anchor="middle" font-family="'+monoFont+'" font-size="4" fill="'+tx+'">'+escHtml(t.charAt(0))+'</text><g transform="translate(24,17) scale(0.76) translate(-18,-14)">'+teamLogoGraphicSVG(r.graphic,cols)+'</g>'+wmBottom;
  else if(tm===6) body=gl(1,18);
  else body='<g opacity=".2">'+gl(1.04,18)+'</g><text x="18" y="21" text-anchor="middle" font-family="'+monoFont+'" font-size="12" fill="'+ac+'"'+teamLogoTextFitAttrs(escHtml(t),4,24)+'>'+escHtml(t)+'</text>'+wMix.svg;
  body=vibe.behind+body+vibe.front;
  body='<g clip-path="url(#cp'+uid+')">'+body+'</g>';
  return '<svg xmlns="http://www.w3.org/2000/svg" class="team-crest-svg" viewBox="0 0 36 36" overflow="hidden" preserveAspectRatio="xMidYMid meet" width="'+s+'" height="'+s+'" aria-hidden="true">'+defs+shellSvg+stripeSvg+body+'</svg>';
}

function teamLogoChip(teamName,size,leagueKey){
  var s=size||26;
  var lk=(typeof leagueKey==='string'&&leagueKey)?leagueKey:(typeof G!=='undefined'&&G&&G.leagueKey?G.leagueKey:'');
  return '<span class="team-chip retro-logo-chip" title="'+String(teamName||'TEAM').replace(/"/g,'&quot;')+'" style="width:'+s+'px;height:'+s+'px">'+teamLogoSVG(teamName,s,lk)+'</span>';
}
