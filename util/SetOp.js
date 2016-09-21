module.exports.cloneSet = cloneSet;
module.exports.union = union;
module.exports.interset = interset;
module.exports.minus = minus;
module.exports.include = include;
module.exports.equal = equal;

// functional style


function cloneSet(s) {
  var tmpSet = new Set();
  for (var v of s) {
    tmpSet.add(v);
  }
  return tmpSet;
}

function union(s1, s2) {
  var newSet = new Set();
  for (var tmp1 of s1) {
    newSet.add(tmp1);
  }
  for (var tmp2 of s2) {
    newSet.add(tmp2);
  }
  return newSet;
}

function interset(s1, s2) {
  var newSet = new Set();
  for (var tmp1 of s1) {
    for (var tmp2 of s2) {
      if (tmp1 === tmp2) newSet.add(tmp1);
    }
  }
  return newSet;
}

function minus(s1, s2) {
  var newSet = cloneSet(s1);
  for (var tmp of s2) {
    newSet.delete(tmp);
  }
  return newSet;
}

// s1 include s2
function include(s1, s2) {
  for (var tmp of s2) {
    if (!s1.has(tmp)) return false;
  }
  return true;
}

function equal(s1, s2) {
  return s1.size === s2.size && include(s1, s2) && include(s2, s1);
}
