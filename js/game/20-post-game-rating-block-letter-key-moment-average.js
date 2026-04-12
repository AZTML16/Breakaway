/* breakaway — POST-GAME RATING BLOCK (letter + key-moment average) */
// ============================================================
// POST-GAME RATING BLOCK (letter + key-moment average)
// ============================================================
function buildPostgameRatingBlock(rating,mAvg){
  var h='<div style="display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px;border:1px solid var(--rl);background:var(--rink)">';
  h+='<div style="font-family:\'Press Start 2P\',monospace;font-size:18px;color:'+rating.color+'">'+rating.grade+'</div>';
  h+='<div class="vt" style="font-size:15px;color:var(--mut);line-height:1.45">'+rating.txt+'</div></div>';
  h+='<div class="vt" style="font-size:12px;color:var(--mut);margin-top:6px;opacity:.88">MOMENTS '+Math.round(mAvg)+'/100</div>';
  return h;
}
