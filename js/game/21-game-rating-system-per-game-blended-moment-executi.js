/* breakaway — GAME RATING SYSTEM (per-game: blended moment execution + stat line) */
// ============================================================
// GAME RATING SYSTEM (per-game: blended moment execution + stat line)
// ============================================================
function getGameRating(pos,gRnd,aRnd,svpct,won,momentAvg){
  var N=blendedGamePerformanceNumeric(pos,gRnd,aRnd,svpct,won,momentAvg);
  return performanceNumericToLetterGrade(N);
}
