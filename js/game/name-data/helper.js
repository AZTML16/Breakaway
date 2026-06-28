function uniq(arr) {
  var seen = {}, out = [], i, k;
  for (i = 0; i < arr.length; i++) {
    k = arr[i];
    if (!k || seen[k]) continue;
    seen[k] = 1;
    out.push(k);
  }
  return out;
}

function list(s) {
  return uniq(String(s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean));
}

function padTo(arr, min, filler) {
  var out = arr.slice(), i = 0;
  filler = filler || arr;
  while (out.length < min && filler.length) {
    out.push(filler[i % filler.length]);
    i++;
  }
  return uniq(out);
}

function normalizeCulture(raw, minCount) {
  minCount = minCount || 100;
  var M = raw.M || {}, F = raw.F || {};
  var mFirst = padTo(uniq(M.first || []), minCount, M.first || []);
  var fFirst = padTo(uniq(F.first || []), minCount, F.first || []);
  var mLast = padTo(uniq(M.last || []), minCount, M.last || []);
  var fLast = F.last && F.last.length ? padTo(uniq(F.last), minCount, F.last) : mLast.slice();
  return {
    M: { first: mFirst, last: mLast },
    F: { first: fFirst, last: fLast }
  };
}

module.exports = { uniq: uniq, list: list, padTo: padTo, normalizeCulture: normalizeCulture };
