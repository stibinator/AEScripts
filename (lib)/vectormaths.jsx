//library of useful vector and geometry functions
function makeArray(num, arrLen, padding) {
  var newArr;
  var i;
  if (num) { //check that there is a num
    if ( Object.prototype.toString.call( num ) === '[object Array]' ) {
      newArr = num; //it's an array all good
    } else {
      if (isNaN(num)) throw new Error('in vectorMaths makeArray: one of those numbers aint a number');
      newArr = [num];
    }
  } else {
    newArr = [0];
  }
  if (arrLen) { //fill up the array with padding or zeroes
    for ( i = 0; i < arrLen; i++) {
      newArr[i] = newArr[i] || padding;
    }
  }
  return newArr;
}

function vDiff(a, b) { //eslint-disable-line no-unused-vars
  var i;
  var d = [];
  var vec1 = makeArray(a);
  var vec2 = makeArray(b);
  var dims = Math.max(vec1.length, vec2.length);
  for (i = 0; i < dims; i++) {
    vec1[i] = vec1[i] || 0;
    vec2[i] = vec2[i] || 0;
    d[i] = vec1[i] - vec2[i];
  }
  return d;
}


function vSum(a, b) { //eslint-disable-line no-unused-vars
  var i;
  var sum = [];
  var vec1 = makeArray(a);
  var vec2 = makeArray(b);
  var dims = Math.max(vec1.length, vec2.length);
  for (i = 0; i < dims; i++) {
    vec1[i] = vec1[i] || 0;
    vec2[i] = vec2[i] || 0;
    sum[i] = vec1[i] + vec2[i];
  }
  return sum;
}

function vSMult(a, b) {//eslint-disable-line no-unused-vars
  //takes two objects, one of which is a scalar and multiplies them, returning a vector
  var vec = [];
  var scal;
  var i;
  if (Object.prototype.toString.call(a) === '[object Number]') {
    scal = a;
    vec = makeArray(b);
  } else if (Object.prototype.toString.call(b) === '[object Number]') {
    scal = b;
    vec = makeArray(a);
  } else {
    throw new Error('at least one input to vMult must be a scalar');
  }
  for (i = 0; i < vec.length; i++) {
    vec[i] *= scal;
  }
  return vec;
}

function vScale(a, b) {//eslint-disable-line no-unused-vars
  //scales a vector [a1, a2,..] by [s1, s2, ..]
  // to return [a1*s1, a2 * s2, ...]
  // if an array value is missing then it gets scaled by 0. Harsh, but fair.
  var vec1 = makeArray(a);
  var vec2 = makeArray(b);
  var dims = Math.max(vec1.length, vec2.length);
  var scaledVec = [];
  for (i = 0; i < dims; i++) {
    vec1[i] = vec1[i] || 0;
    vec2[i] = vec2[i] || 0;
    scaledVec[i] = vec1[i] * vec2[i];
  }
  return scaledVec;
}

function vDiv(a, b) { //eslint-disable-line no-unused-vars
  // divides a vector [a1, a2,..] by [s1, s2, ..]
  // to return [a1/s1, a2/s2, ...]
  // if an array value is missing in the denominator then it truncates the length of the output.
  var vec1 = makeArray(a);
  var vec2 = makeArray(b);
  var dims = vec2.length; //the length of the divisor determines the length of the output array
  var scaledVec = [];
  for (i = 0; i < dims; i++) {
    vec1[i] = vec1[i] || 0;
    vec2[i] = vec2[i] || 1;
    scaledVec[i] = vec1[i] / vec2[i];
  }
  return scaledVec;
}

function vSDiv(a, b) {//eslint-disable-line no-unused-vars
  // takes two objects, one of which is a scalar and divides them, returning a vector
  // Because order is important with division,
  // if the divisor  is a scalar it returns [v[0]/s, v[1]/s... v[length]/s]
  // if the divisor is a vector it returns [s/v[0], s/[v1]... s/v[length]]
  var vec = [];
  var scalar;
  var i;
  if (Object.prototype.toString.call(a) === '[object Number]') {
    scalar = a;
    vec = makeArray(b);
    for (i = 0; i < vec.length; i++) {
      if (scalar === 0) throw new Error('Divide by zero error in vSDiv'); //I just learned how to throw errors, can you tell?
      vec[i] = scalar / vec[i];
    }
  } else if (Object.prototype.toString.call(b) === '[object Number]') {
    scalar = b;
    vec = makeArray(a);
    for (i = 0; i < vec.length; i++) {
      if (scalar === 0) throw new Error('Divide by zero error in vSDiv');
      vec[i] /= scalar;
    }
  } else {
    throw new Error('at least one input to vMult must be a scalar');
  }
  return vec;
}

function vLen(a, b) {
  ///returns the magnitude of the length between two objects, either of which can be a scalar, or multidimensional vector
  var d = [];
  var vec2 = [];
  var vec1 = [];
  var sqrSum = 0;
  if (!a) throw new Error('vLen needs a vector or two. Or at least a scalar, anything? even 0 will do');
  vec1 = makeArray(a);
  vec2 = makeArray(b);
  d = vDiff(vec1, vec2);
  sqrSum = 0;
  while (d.length) {
    sqrSum += Math.pow(d.pop(), 2); //sum the squares
  }
  return Math.sqrt(sqrSum);
}

function vectorLength(a, b) { //eslint-disable-line no-unused-vars
  //I wrote an older not-as-good version of vlen and some scripts may come looking for it here
  return vLen(a, b);
}

function radiansToDegrees(rad) { //eslint-disable-line no-unused-vars
  return rad / Math.PI * 180.0;
}

function degreesToRadians(deg) {//eslint-disable-line no-unused-vars
  return deg / 180.0 * Math.PI;
}

/**
* Clamps a number. Based on Zevan's idea: http://actionsnippet.com/?p=475
* params: val, min, max
* Author: Jakub Korzeniowski
* Agency: Softhis
* http://www.softhis.com
*/
(function () {Math.clamp = function (a, b, c) {return Math.max(b, Math.min(c, a));};})();

//should return 6
//degreesToRadians(radiansToDegrees(vectorLength([3, 0, 4], [0, Math.sqrt(11), 0])));
makeArray(1, 3);
