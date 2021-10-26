// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
// === Sylvester ===
// Vector and Matrix mathematics modules for JavaScript
// Copyright (c) 2007 James Coglan
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR a PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

var Sylvester = {
  version: '0.1.3',
  precision: 1e-6
};

function Vector() {}
function Matrix() {}
function Line() {}
function Plane() {}
// Utility functions
var $V = Vector.create; //eslint-disable-line no-unused-vars
var $M = Matrix.create; //eslint-disable-line no-unused-vars
var $L = Line.create; //eslint-disable-line no-unused-vars
var $P = Plane.create; //eslint-disable-line no-unused-vars

Vector.prototype = {

  // Returns element i of the vector
  e: function (i) {
    return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
  },

  // Returns the number of elements the vector has
  dimensions: function () {
    return this.elements.length;
  },

  // Returns the magnitude ('length') of the vector
  magnitude: function () {
    return Math.sqrt(this.dot(this));
  },

  // Returns true iff the vector is equal to the argument
  eql: function (vector) {
    var n = this.elements.length;
    var v = vector.elements || vector;
    if (n !== v.length) { return false; }
    do {
      if (Math.abs(this.elements[n - 1] - v[n - 1]) > Sylvester.precision) { return false; }
    } while (--n);
    return true;
  },

  // Returns a copy of the vector
  dup: function () {
    return Vector.create(this.elements);
  },

  // Maps the vector to another vector according to the given function
  map: function (fn) {
    var elements = [];
    this.each(function (x, i) {
      elements.push(fn(x, i));
    });
    return Vector.create(elements);
  },

  // Calls the iterator for each element of the vector in turn
  each: function (fn) {
    var n = this.elements.length;
    var k = n;
    var i;
    do {
      i = k - n;
      fn(this.elements[i], i + 1);
    } while (--n);
  },

  // Returns a new vector created by normalizing the receiver
  toUnitVector: function () {
    var r = this.magnitude();
    if (r === 0) { return this.dup(); }
    return this.map(function (x) { return x / r; });
  },

  // Returns the angle between the vector and the argument (also a vector)
  angleFrom: function (vector) {
    var v = vector.elements || vector;
    var n = this.elements.length;
    // var k = n;
    // var i;
    if (n !== v.length) { return null; }
    var dot = 0;
    var mod1 = 0;
    var mod2 = 0;
    // Work things out in parallel to save time
    this.each(function (x, i) {
      dot += x * v[i - 1];
      mod1 += x * x;
      mod2 += v[i - 1] * v[i - 1];
    });
    mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
    if (mod1 * mod2 === 0) { return null; }
    var theta = dot / (mod1 * mod2);
    if (theta < -1) { theta = -1; }
    if (theta > 1) { theta = 1; }
    return Math.acos(theta);
  },

  componentAngle: function () {
    var xAxis = Vector.create([1, 0, 0]);
    var zAxis = Vector.create([0, 0, 1]);
    angleFromXaroundZ = this.scale([1, 1, 0]).angleFrom(xAxis); //angle around the Z axis
    angleFromXaroundY = this.scale([1, 0, 1]).angleFrom(xAxis); //angle around the Y axis
    angleFromZaroundX = this.scale([0, 1, 1]).angleFrom(zAxis); //angle around the X axis
    return {angleFromXaroundZ: angleFromXaroundZ, angleFromXaroundY: angleFromXaroundY, angleFromZaroundX: angleFromZaroundX};
  },

  // Returns true if the vector is parallel to the argument
  isParallelTo: function (vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (angle <= Sylvester.precision);
  },

  // Returns true iff the vector is antiparallel to the argument
  isAntiparallelTo: function (vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
  },

  // Returns true iff the vector is perpendicular to the argument
  isPerpendicularTo: function (vector) {
    var dot = this.dot(vector);
    return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
  },

  // Returns the result of adding the argument to the vector
  add: function (theVector) {
    var dim;
    var v = theVector.elements || theVector;
    if (this.elements.length !== v.length) {
      //pad the extra dimensions
      for (dim = 0; dim < this.dimensions(); dim++) {
        if (v.length <=  this.dimensions()) v.push(0);
      }
    }
    return this.map(function (x, i) { return x + v[i - 1]; });
  },

  // scales the vector by another vector, ie: <x,y>.scale(<a,b>) = <ax, by>
  // If the other vector has less dimensions than this the missing dimensions are scaled by 0
  //i.e. <x,y, z>.scale(<a,b>) = <ax, by, 0>
  // harsh, but fair
  scale: function (theVector) {
    var dim;
    var v = theVector.elements || theVector;
      //pad the extra dimensions
    for (dim = 0; dim < this.dimensions(); dim++) {
      if (v.length <  this.dimensions()) v.push(0);
    }

    return this.map(function (x, i) { return x * v[i - 1]; });
  },

  // couldn't think of a better name for the inverse of scale
  // <x,y>.divideByVec(<a,b>) = <a/x, b/y>
  divideByVec: function (theVector) {
    var dim;
    var v = theVector.elements || theVector;
    // pad with ones because divide. **PROBABLY WRONG**
    for (dim = 0; dim < this.dimensions(); dim++) {
      if (v.length <  this.dimensions()) v.push(1);
    }

    return this.map(function (x, i) { return x / v[i - 1]; });
  },

  // Returns the result of subtracting the argument from the vector
  subtract: function (vector) {
    var v = vector.elements || vector;
    for (dim = 0; dim < this.dimensions(); dim++) {
      if (v.length <  this.dimensions()) v.push(0);
    }
    return this.map(function (x, i) { return x - v[i - 1]; });
  },

  // Returns the result of multiplying the elements of the vector by the argument
  multiply: function (k) {
    return this.map(function (x) { return x * k; });
  },

  x: function (k) { return this.multiply(k); },

  divide: function (k) {
    return this.map(function (x) { return x / k; });
  },

  // Returns the scalar product of the vector with the argument
  // Both vectors must have equal dimensionality
  dot: function (theVector) {
    var v = theVector.elements || theVector;
    // var i;
    var product = 0;
    var n = this.elements.length;
    if (n !== v.length) { return null; }
    do {
      product += this.elements[n - 1] * v[n - 1];
    } while (--n);
    return product;
  },

  // Returns the vector product of the vector with the argument
  // Both vectors must have dimensionality 3
  cross: function (theVector) {
    var e = theVector.elements || theVector;
    if (this.elements.length !== 3 || e.length !== 3) { return null; }
    var a = this.elements;
    return Vector.create([
      (a[1] * e[2]) - (a[2] * e[1]),
      (a[2] * e[0]) - (a[0] * e[2]),
      (a[0] * e[1]) - (a[1] * B[0])
    ]);
  },

  // Returns the (absolute) largest element of the vector
  max: function () {
    var m = 0;
    var  n = this.elements.length;
    var  k = n;
    var  i;
    do {
      i = k - n;
      if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
    } while (--n);
    return m;
  },

  // Returns the index of the first match found
  indexOf: function (x) {
    var index = null;
    var  n = this.elements.length;
    var  k = n;
    var  i;
    do {
      i = k - n;
      if (index === null && this.elements[i] === x) {
        index = i + 1;
      }
    } while (--n);
    return index;
  },

  // Returns a diagonal matrix with the vector's elements as its diagonal elements
  toDiagonalMatrix: function () {
    return Matrix.diagonal(this.elements);
  },

  // Returns the result of rounding the elements of the vector
  round: function () {
    return this.map(function (x) { return Math.round(x); });
  },

  // Returns a copy of the vector with elements set to the given value if they
  // differ from it by less than Sylvester.precision
  snapTo: function (x, snapDist) {
    var precision = (object.isNull(snapDist)) ? Sylvester.precision : snapDist;
    return this.map(function (y) {
      return (Math.abs(y - x) <= precision) ? x : y;
    });
  },

  // Returns the vector's distance from the argument, when considered as a point in space
  distanceFrom: function (obj) {
    if (obj.anchor) { return obj.distanceFrom(this); }
    var v = obj.elements || obj;
    if (v.length !== this.elements.length) { return null; }
    var sum = 0;
    var  part;
    this.each(function (x, i) {
      part = x - v[i - 1];
      sum += part * part;
    });
    return Math.sqrt(sum);
  },

  // Returns true if the vector is point on the given line
  liesOn: function (line) {
    return line.contains(this);
  },

  // Return true iff the vector is a point in the given plane
  liesIn: function (plane) {
    return plane.contains(this);
  },

  // Rotates the vector about the given object. The object should be a
  // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
  rotate: function (t, obj) {
    var v;
    var  R;
    var  x;
    var  y;
    var  z;
    switch (this.elements.length) {
    case 2:
      v = obj.elements || obj;
      if (v.length !== 2) { return null; }
      R = Matrix.rotation(t).elements;
      x = this.elements[0] - v[0];
      y = this.elements[1] - v[1];
      return Vector.create([
        v[0] + R[0][0] * x + R[0][1] * y,
        v[1] + R[1][0] * x + R[1][1] * y
      ]);
      // break;
    case 3:
      if (!obj.direction) { return null; }
      var C = obj.pointClosestTo(this).elements;
      R = Matrix.rotation(t, obj.direction).elements;
      x = this.elements[0] - C[0];
      y = this.elements[1] - C[1];
      z = this.elements[2] - C[2];
      return Vector.create([
        C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
        C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
        C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
      ]);
      // break;
    default:
      return null;
    }
  },

  rotateX: function (t) {
    return this.rotate(t, Line.X);
  },
  rotateY: function (t) {
    return this.rotate(t, Line.Y);
  },
  rotateZ: function (t) {
    return this.rotate(t, Line.Z);
  },

  // Returns the result of reflecting the point in the given point, line or plane
  reflectionIn: function (obj) {
    if (obj.anchor) {
      // obj is a plane or line
      var P = this.elements.slice();
      var C = obj.pointClosestTo(P).elements;
      return Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
    }
      // obj is a point
    var Q = obj.elements || obj;
    if (this.elements.length !== Q.length) { return null; }
    return this.map(function (x, i) { return Q[i - 1] + (Q[i - 1] - x); });
  },

  // Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added
  to3D: function () {
    var v = this.dup();
    switch (v.elements.length) {
    case 3: break;
    case 2: v.elements.push(0); break;
    default: return null;
    }
    return v;
  },
  // Returns an array
  toArray: function () {
    var arr = [];
    for (i = 0; i < this.dimensions(); i++) {
      arr.push(this.elements[i]);
    }
    return arr;
  },

  // Returns a string representation of the vector
  inspect: function () {
    return '[' + this.elements.join(', ') + ']';
  },

  // Set vector's elements from an array
  setElements: function (els) {
    this.elements = (els.elements || els).slice();
    return this;
  },

  // retun the scalar projection of another vector a on this one b
  // p = a.b / ||b|
  scalarProjection: function (a) {
    var aDotB = this.dot(a);
    return aDotB / this.magnitude();
  },

  //return the vector projection of another vector (a) on this one (b)
  //b*(a.b)/||b|^2
  vectorProjection: function (a) {
    var aDotB = this.dot(a);
    return this.multiply( aDotB / Math.pow(this.magnitude(), 2) );
  }
};

// Constructor function
Vector.create = function (elements) {
  var v = new Vector();
  return v.setElements(elements);
};

// i, j, k unit vectors
Vector.i = Vector.create([1, 0, 0]);
Vector.j = Vector.create([0, 1, 0]);
Vector.k = Vector.create([0, 0, 1]);

// Random vector of size n
Vector.Random = function (n) {
  var i = n;
  var elements = [];
  do {
    elements.push(Math.random());
  } while (--i);
  return Vector.create(elements);
};

// Vector filled with zeros
Vector.zero = function (n) {
  var i = n;
  var elements = [];
  do {
    elements.push(0);
  } while (--i);
  return Vector.create(elements);
};


Matrix.prototype = {

  // Returns element (i,j) of the matrix
  e: function (i, j) {
    if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
    return this.elements[i - 1][j - 1];
  },

  // Returns row k of the matrix as a vector
  row: function (i) {
    if (i > this.elements.length) { return null; }
    return Vector.create(this.elements[i - 1]);
  },

  // Returns column k of the matrix as a vector
  col: function (j) {
    if (j > this.elements[0].length) { return null; }
    var col = [];
    var  n = this.elements.length;
    var  k = n;
    var  i;
    do {
      i = k - n;
      col.push(this.elements[i][j - 1]);
    } while (--n);
    return Vector.create(col);
  },

  // Returns the number of rows/columns the matrix has
  dimensions: function () {
    return {rows: this.elements.length, cols: this.elements[0].length};
  },

  // Returns the number of rows in the matrix
  rows: function () {
    return this.elements.length;
  },

  // Returns the number of columns in the matrix
  cols: function () {
    return this.elements[0].length;
  },

  // Returns true iff the matrix is equal to the argument. You can supply
  // a vector as the argument, in which case the receiver must be a
  // one-column matrix equal to the vector.
  eql: function (matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    if (this.elements.length !== M.length ||
        this.elements[0].length !== M[0].length) { return false; }
    var ni = this.elements.length;
    var  ki = ni;
    var  i;
    var  nj;
    var  kj = this.elements[0].length;
    var  j;
    do {
      i = ki - ni;
      nj = kj;
      do {
        j = kj - nj;
        if (Math.abs(this.elements[i][j] - M[i][j]) > Sylvester.precision) { return false; }
      } while (--nj);
    } while (--ni);
    return true;
  },

  // Returns a copy of the matrix
  dup: function () {
    return Matrix.create(this.elements);
  },

  // Maps the matrix to another matrix (of the same dimensions) according to the given function
  map: function (fn) {
    var els = [];
    var  ni = this.elements.length;
    var  ki = ni;
    var  i;
    var  nj;
    var  kj = this.elements[0].length;
    var  j;
    do {
      i = ki - ni;
      nj = kj;
      els[i] = [];
      do {
        j = kj - nj;
        els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
      } while (--nj);
    } while (--ni);
    return Matrix.create(els);
  },

  // Returns true iff the argument has the same dimensions as the matrix
  isSameSizeAs: function (matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    return (this.elements.length === M.length &&
        this.elements[0].length === M[0].length);
  },

  // Returns the result of adding the argument to the matrix
  add: function (matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function (x, i, j) { return x + M[i - 1][j - 1]; });
  },

  // Returns the result of subtracting the argument from the matrix
  subtract: function (matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function (x, i, j) { return x - M[i - 1][j - 1]; });
  },

  // Returns true iff the matrix can multiply the argument from the left
  canMultiplyFromLeft: function (matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    // this.columns should equal matrix.rows
    return (this.elements[0].length === M.length);
  },

  // Returns the result of multiplying the matrix from the right by the argument.
  // If the argument is a scalar then just multiply all the elements. If the argument is
  // a vector, a vector is returned, which saves you having to remember calling
  // col(1) on the result.
  multiply: function (matrix) {
    if (!matrix.elements) {
      return this.map(function (x) { return x * matrix; });
    }
    var returnVector = matrix.magnitude ? true : false;
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    if (!this.canMultiplyFromLeft(M)) { return null; }
    var ni = this.elements.length;
    var  ki = ni;
    var  i;
    var  nj;
    var  kj = M[0].length;
    var  j;
    var cols = this.elements[0].length;
    var  elements = [];
    var  sum;
    var  nc;
    var  c;
    do {
      i = ki - ni;
      elements[i] = [];
      nj = kj;
      do {
        j = kj - nj;
        sum = 0;
        nc = cols;
        do {
          c = cols - nc;
          sum += this.elements[i][c] * M[c][j];
        } while (--nc);
        elements[i][j] = sum;
      } while (--nj);
    } while (--ni);
    M = Matrix.create(elements);
    return returnVector ? M.col(1) : M;
  },

  x: function (matrix) { return this.multiply(matrix); },

  // Returns a submatrix taken from the matrix
  // Argument order is: start row, start col, nrows, ncols
  // Element selection wraps if the required index is outside the matrix's bounds, so you could
  // use this to perform row/column cycling or copy-augmenting.
  minor: function (a, b, c, d) {
    var elements = [];
    var  ni = c;
    var  i;
    var  nj;
    var  j;
    var rows = this.elements.length;
    var  cols = this.elements[0].length;
    do {
      i = c - ni;
      elements[i] = [];
      nj = d;
      do {
        j = d - nj;
        elements[i][j] = this.elements[(a + i - 1) % rows][(b + j - 1) % cols];
      } while (--nj);
    } while (--ni);
    return Matrix.create(elements);
  },

  // Returns the transpose of the matrix
  transpose: function () {
    var rows = this.elements.length;
    var  cols = this.elements[0].length;
    var elements = [];
    var  ni = cols;
    var  i;
    var  nj;
    var  j;
    do {
      i = cols - ni;
      elements[i] = [];
      nj = rows;
      do {
        j = rows - nj;
        elements[i][j] = this.elements[j][i];
      } while (--nj);
    } while (--ni);
    return Matrix.create(elements);
  },

  // Returns true iff the matrix is square
  isSquare: function () {
    return (this.elements.length === this.elements[0].length);
  },

  // Returns the (absolute) largest element of the matrix
  max: function () {
    var m = 0;
    var  ni = this.elements.length;
    var  ki = ni;
    var  i;
    var  nj;
    var  kj = this.elements[0].length;
    var  j;
    do {
      i = ki - ni;
      nj = kj;
      do {
        j = kj - nj;
        if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
      } while (--nj);
    } while (--ni);
    return m;
  },

  // Returns the indeces of the first match found by reading row-by-row from left to right
  indexOf: function (x) {
    var  ni = this.elements.length;
    var  ki = ni;
    var  i;
    var  nj;
    var  kj = this.elements[0].length;
    var  j;
    do {
      i = ki - ni;
      nj = kj;
      do {
        j = kj - nj;
        if (this.elements[i][j] === x) { return {i: i + 1, j: j + 1}; }
      } while (--nj);
    } while (--ni);
    return null;
  },

  // If the matrix is square, returns the diagonal elements as a vector.
  // Otherwise, returns null.
  diagonal: function () {
    if (!this.isSquare) {
      return null;
    }
    var els = [];
    var  n = this.elements.length;
    var  k = n;
    var  i;
    do {
      i = k - n;
      els.push(this.elements[i][i]);
    } while (--n);
    return Vector.create(els);
  },

  // Make the matrix upper (right) triangular by Gaussian elimination.
  // This method only adds multiples of rows to other rows. No rows are
  // scaled up or switched, and the determinant is preserved.
  toRightTriangular: function () {
    var M = this.dup();
    var els;
    var n = this.elements.length;
    var  k = n;
    var  i;
    var  np;
    var  kp = this.elements[0].length;
    var  p;
    do {
      i = k - n;
      if (M.elements[i][i] === 0) {
        for (j = i + 1; j < k; j++) {
          if (M.elements[j][i] !== 0) {
            els = []; np = kp;
            do {
              p = kp - np;
              els.push(M.elements[i][p] + M.elements[j][p]);
            } while (--np);
            M.elements[i] = els;
            break;
          }
        }
      }
      if (M.elements[i][i] !== 0) {
        for (j = i + 1; j < k; j++) {
          var multiplier = M.elements[j][i] / M.elements[i][i];
          els = []; np = kp;
          do {
            p = kp - np;
            // Elements with column numbers up to an including the number
            // of the row that we're subtracting can safely be set straight to
            // zero, since that's the point of this routine and it avoids having
            // to loop over and correct rounding errors later
            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
          } while (--np);
          M.elements[j] = els;
        }
      }
    } while (--n);
    return M;
  },

  toUpperTriangular: function () { return this.toRightTriangular(); },

  // Returns the determinant for square matrices
  determinant: function () {
    if (!this.isSquare()) { return null; }
    var M = this.toRightTriangular();
    var det = M.elements[0][0];
    var  n = M.elements.length - 1;
    var  k = n;
    var  i;
    do {
      i = k - n + 1;
      det = det * M.elements[i][i];
    } while (--n);
    return det;
  },

  det: function () { return this.determinant(); },

  // Returns true iff the matrix is singular
  isSingular: function () {
    return (this.isSquare() && this.determinant() === 0);
  },

  // Returns the trace for square matrices
  trace: function () {
    if (!this.isSquare()) { return null; }
    var tr = this.elements[0][0];
    var  n = this.elements.length - 1;
    var  k = n;
    var  i;
    do {
      i = k - n + 1;
      tr += this.elements[i][i];
    } while (--n);
    return tr;
  },

  tr: function () { return this.trace(); },

  // Returns the rank of the matrix
  rank: function () {
    var M = this.toRightTriangular();
    var rank = 0;
    var ni = this.elements.length;
    var  ki = ni;
    var  i;
    var  nj;
    var  kj = this.elements[0].length;
    var  j;
    do {
      i = ki - ni;
      nj = kj;
      do {
        j = kj - nj;
        if (Math.abs(M.elements[i][j]) > Sylvester.precision) { rank++; break; }
      } while (--nj);
    } while (--ni);
    return rank;
  },

  rk: function () { return this.rank(); },

  // Returns the result of attaching the given argument to the right-hand side of the matrix
  augment: function (matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Matrix.create(M).elements; }
    var T = this.dup();
    var  cols = T.elements[0].length;
    var ni = T.elements.length;
    var  ki = ni;
    var  i;
    var  nj;
    var  kj = M[0].length;
    var  j;
    if (ni !== M.length) { return null; }
    do {
      i = ki - ni;
      nj = kj;
      do {
        j = kj - nj;
        T.elements[i][cols + j] = M[i][j];
      } while (--nj);
    } while (--ni);
    return T;
  },

  // Returns the inverse (if one exists) using Gauss-Jordan
  inverse: function () {
    if (!this.isSquare() || this.isSingular()) { return null; }
    var ni = this.elements.length;
    var  ki = ni;
    var  i;
    var  j;
    var M = this.augment(Matrix.identity(ni)).toRightTriangular();
    var np;
    var  kp = M.elements[0].length;
    var  p;
    var  els;
    var  divisor;
    var inverseElements = [];
    var  newElement;
    // Matrix is non-singular so there will be no zeros on the diagonal
    // Cycle through rows from last to first
    do {
      i = ni - 1;
      // First, normalise diagonal elements to 1
      els = []; np = kp;
      inverseElements[i] = [];
      divisor = M.elements[i][i];
      do {
        p = kp - np;
        newElement = M.elements[i][p] / divisor;
        els.push(newElement);
        // Shuffle of the current row of the right hand side into the results
        // array as it will not be modified by later runs through this loop
        if (p >= ki) { inverseElements[i].push(newElement); }
      } while (--np);
      M.elements[i] = els;
      // Then, subtract this row from those above it to
      // give the identity matrix on the left hand side
      for (j = 0; j < i; j++) {
        els = []; np = kp;
        do {
          p = kp - np;
          els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
        } while (--np);
        M.elements[j] = els;
      }
    } while (--ni);
    return Matrix.create(inverseElements);
  },

  inv: function () { return this.inverse(); },

  // Returns the result of rounding all the elements
  round: function () {
    return this.map(function (x) { return Math.round(x); });
  },

  // Returns a copy of the matrix with elements set to the given value if they
  // differ from it by less than Sylvester.precision
  snapTo: function (x) {
    return this.map(function (p) {
      return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
    });
  },

  // Returns a string representation of the matrix
  inspect: function () {
    var matrixRows = [];
    var n = this.elements.length;
    var  k = n;
    var  i;
    do {
      i = k - n;
      matrixRows.push(Vector.create(this.elements[i]).inspect());
    } while (--n);
    return matrixRows.join('\n');
  },

  // Set the matrix's elements from an array. If the argument passed
  // is a vector, the resulting matrix will be a single column.
  setElements: function (els) {
    var i;
    var  elements = els.elements || els;
    if (typeof(elements[0][0]) !== 'undefined') {
      var ni = elements.length;
      var  ki = ni;
      var  nj;
      var  kj;
      var  j;
      this.elements = [];
      do {
        i = ki - ni;
        nj = elements[i].length; kj = nj;
        this.elements[i] = [];
        do {
          j = kj - nj;
          this.elements[i][j] = elements[i][j];
        } while (--nj);
      } while (--ni);
      return this;
    }
    var n = elements.length;
    var  k = n;
    this.elements = [];
    do {
      i = k - n;
      this.elements.push([elements[i]]);
    } while (--n);
    return this;
  }
};

// Constructor function
Matrix.create = function (elements) {
  var M = new Matrix();
  return M.setElements(elements);
};

// Identity matrix of size n
Matrix.identity = function (n) {
  var numEls = n;
  var els = [];
  var  k = numEls;
  var  i;
  var  nj;
  var  j;
  do {
    i = k - numEls;
    els[i] = []; nj = k;
    do {
      j = k - nj;
      els[i][j] = (i === j) ? 1 : 0;
    } while (--nj);
  } while (--numEls);
  return Matrix.create(els);
};

// Diagonal matrix - all off-diagonal elements are zero
Matrix.diagonal = function (elements) {
  var n = elements.length;
  var  k = n;
  var  i;
  var M = Matrix.identity(n);
  do {
    i = k - n;
    M.elements[i][i] = elements[i];
  } while (--n);
  return M;
};

// Rotation matrix about some axis. If no axis is
// supplied, assume we're after a 2D transform
Matrix.rotation = function (theta, a) {
  if (!a) {
    return Matrix.create([
      [Math.cos(theta),  -Math.sin(theta)],
      [Math.sin(theta),   Math.cos(theta)]
    ]);
  }
  var axis = a.dup();
  if (axis.elements.length !== 3) { return null; }
  var mod = axis.magnitude();
  var x = axis.elements[0] / mod;
  var  y = axis.elements[1] / mod;
  var  z = axis.elements[2] / mod;
  var s = Math.sin(theta);
  var c = Math.cos(theta);
  var t = 1 - c;
  // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
  // That proof rotates the co-ordinate system so theta
  // becomes -theta and sin becomes -sin here.
  return Matrix.create([
    [ t * x * x + c, t * x * y - s * z, t * x * z + s * y ],
    [ t * x * y + s * z, t * y * y + c, t * y * z - s * x ],
    [ t * x * z - s * y, t * y * z + s * x, t * z * z + c ]
  ]);
};

// Special case rotations
Matrix.rotationX = function (t) {
  var c = Math.cos(t);
  var s = Math.sin(t);
  return Matrix.create([
    [  1,  0,  0 ],
    [  0,  c, -s ],
    [  0,  s,  c ]
  ]);
};

Matrix.rotationY = function (t) {
  var c = Math.cos(t);
  var s = Math.sin(t);
  return Matrix.create([
    [  c,  0,  s ],
    [  0,  1,  0 ],
    [ -s,  0,  c ]
  ]);
};

Matrix.rotationZ = function (t) {
  var c = Math.cos(t);
  var  s = Math.sin(t);
  return Matrix.create([
    [  c, -s,  0 ],
    [  s,  c,  0 ],
    [  0,  0,  1 ]
  ]);
};

// Random matrix of n rows, m columns
Matrix.Random = function (n, m) {
  return Matrix.zero(n, m).map(
    function () { return Math.random(); }
  );
};

// Matrix filled with zeros
Matrix.zero = function (n, m) {
  var els = [];
  var  ni = n;
  var  i;
  var  nj;
  var  j;
  do {
    i = n - ni;
    els[i] = [];
    nj = m;
    do {
      j = m - nj;
      els[i][j] = 0;
    } while (--nj);
  } while (--ni);
  return Matrix.create(els);
};

Line.prototype = {

  // Returns true if the argument occupies the same space as the line
  eql: function (line) {
    return (this.isParallelTo(line) && this.contains(line.anchor));
  },

  // Returns a copy of the line
  dup: function () {
    return Line.create(this.anchor, this.direction);
  },

  // Returns the result of translating the line by the given vector/array
  translate: function (vector) {
    var v = vector.elements || vector;
    return Line.create([
      this.anchor.elements[0] + v[0],
      this.anchor.elements[1] + v[1],
      this.anchor.elements[2] + (v[2] || 0)
    ], this.direction);
  },

  // Returns true if the line is parallel to the argument. Here, 'parallel to'
  // means that the argument's direction is either parallel or antiparallel to
  // the line's own direction. a line is parallel to a plane if the two do not
  // have a unique intersection.
  isParallelTo: function (obj) {
    if (obj.normal) { return obj.isParallelTo(this); }
    var theta = this.direction.angleFrom(obj.direction);
    return (Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision);
  },

  // Returns the line's perpendicular distance from the argument,
  // which can be a point, a line or a plane
  distanceFrom: function (obj) {
    var N;
    var a;
    var  B;
    var P;
    var  d;
    var PA1;
    var  PA2;
    var  PA3;
    var modPA;
    var cosTheta;
    var sin2;
    if (obj.normal) { return obj.distanceFrom(this); }
    if (obj.direction) {
      // obj is a line
      if (this.isParallelTo(obj)) { return this.distanceFrom(obj.anchor); }
      N = this.direction.cross(obj.direction).toUnitVector().elements;
      a = this.anchor.elements;
      B = obj.anchor.elements;
      return Math.abs((a[0] - B[0]) * N[0] + (a[1] - B[1]) * N[1] + (a[2] - B[2]) * N[2]);
    }
      // obj is a point
    P = obj.elements || obj;
    a = this.anchor.elements;
    d = this.direction.elements;
    PA1 = P[0] - a[0];
    PA2 = P[1] - a[1];
    PA3 = (P[2] || 0) - a[2];
    modPA = Math.sqrt(PA1 * PA1 + PA2 * PA2 + PA3 * PA3);
    if (modPA === 0) return 0;
      // Assumes direction vector is normalized
    cosTheta = (PA1 * d[0] + PA2 * d[1] + PA3 * d[2]) / modPA;
    sin2 = 1 - cosTheta * cosTheta;
    return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
  },

  // Returns true iff the argument is a point on the line
  contains: function (point) {
    var dist = this.distanceFrom(point);
    return (dist !== null && dist <= Sylvester.precision);
  },

  // Returns true iff the line lies in the given plane
  liesIn: function (plane) {
    return plane.contains(this);
  },

  // Returns true iff the line has a unique point of intersection with the argument
  intersects: function (obj) {
    if (obj.normal) { return obj.intersects(this); }
    return (!this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision);
  },

  // Returns the unique intersection point with the argument, if one exists
  intersectionWith: function (obj) {
    if (obj.normal) { return obj.intersectionWith(this); }
    if (!this.intersects(obj)) { return null; }
    var P = this.anchor.elements;
    var X = this.direction.elements;
    var Q = obj.anchor.elements;
    var Y = obj.direction.elements;
    var X1 = X[0];
    var  X2 = X[1];
    var  X3 = X[2];
    var  Y1 = Y[0];
    var  Y2 = Y[1];
    var  Y3 = Y[2];
    var PsubQ1 = P[0] - Q[0];
    var  PsubQ2 = P[1] - Q[1];
    var  PsubQ3 = P[2] - Q[2];
    var XdotQsubP = - X1 * PsubQ1 - X2 * PsubQ2 - X3 * PsubQ3;
    var YdotPsubQ = Y1 * PsubQ1 + Y2 * PsubQ2 + Y3 * PsubQ3;
    var XdotX = X1 * X1 + X2 * X2 + X3 * X3;
    var YdotY = Y1 * Y1 + Y2 * Y2 + Y3 * Y3;
    var XdotY = X1 * Y1 + X2 * Y2 + X3 * Y3;
    var k = (XdotQsubP * YdotY / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
    return Vector.create([P[0] + k * X1, P[1] + k * X2, P[2] + k * X3]);
  },

  // Returns the point on the line that is closest to the given point or line
  pointClosestTo: function (obj) {
    var  a1,  a2,  a3, d,  e, d1,  d2,  d3,  e1,  e2,  e3, x, N, P, v, k; //eslint-disable-line one-var
    if (obj.direction) {
      // obj is a line
      if (this.intersects(obj)) { return this.intersectionWith(obj); }
      if (this.isParallelTo(obj)) { return null; }
      d = this.direction.elements;
      e = obj.direction.elements;
      d1 = d[0];
      d2 = d[1];
      d3 = d[2];
      e1 = e[0];
      e2 = e[1];
      e3 = e[2];
      // Create plane containing obj and the shared normal and intersect this with it
      // Thank you: http://www.cgafaq.info/wiki/Line-line_distance
      x = (d3 * e1 - d1 * e3);
      y = (d1 * e2 - d2 * e1);
      z = (d2 * e3 - d3 * e2);
      N = Vector.create([x * e3 - y * e2, y * e1 - z * e3, z * e2 - x * e1]);
      P = Plane.create(obj.anchor, N);
      return P.intersectionWith(this);
    }
      // obj is a point
    P = obj.elements || obj;
    if (this.contains(P)) { return Vector.create(P); }
    a = this.anchor.elements;
    d = this.direction.elements;
    d1 = d[0];
    d2 = d[1];
    d3 = d[2];
    a1 = a[0];
    a2 = a[1];
    a3 = a[2];
    x = d1 * (P[1] - a2) - d2 * (P[0] - a1);
    y = d2 * ((P[2] || 0) - a3) - d3 * (P[1] - a2);
    z = d3 * (P[0] - a1) - d1 * ((P[2] || 0) - a3);
    v = Vector.create([d2 * x - d3 * z, d3 * y - d1 * x, d1 * z - d2 * y]);
    k = this.distanceFrom(P) / v.magnitude();
    return Vector.create([
      P[0] + v.elements[0] * k,
      P[1] + v.elements[1] * k,
      (P[2] || 0) + v.elements[2] * k
    ]);
  },

  // Returns a copy of the line rotated by t radians about the given line. Works by
  // finding the argument's closest point to this line's anchor point (call this C) and
  // rotating the anchor about C. Also rotates the line's direction about the argument's.
  // Be careful with this - the rotation axis' direction affects the outcome!
  rotate: function (t, theLine) {
    // If we're working in 2D
    if (typeof(line.direction) === 'undefined') {
      line = Line.create(theLine.to3D(), Vector.k);
    }
    var R = Matrix.rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var a = this.anchor.elements;
    var  d = this.direction.elements;
    var C1 = C[0];
    var  C2 = C[1];
    var  C3 = C[2];
    var  a1 = a[0];
    var  a2 = a[1];
    var  a3 = a[2];
    var x = a1 - C1;
    var  y = a2 - C2;
    var  z = a3 - C3;
    return Line.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * d[0] + R[0][1] * d[1] + R[0][2] * d[2],
      R[1][0] * d[0] + R[1][1] * d[1] + R[1][2] * d[2],
      R[2][0] * d[0] + R[2][1] * d[1] + R[2][2] * d[2]
    ]);
  },

  // Returns the line's reflection in the given point or line
  reflectionIn: function (obj) {
    if (obj.normal) {
      // obj is a plane
      var a = this.anchor.elements;
      var  d = this.direction.elements;
      var a1 = a[0];
      var  a2 = a[1];
      var  a3 = a[2];
      var  d1 = d[0];
      var  d2 = d[1];
      var  d3 = d[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the line's direction vector to its anchor, then mirror that in the plane
      var AD1 = a1 + d1;
      var  AD2 = a2 + d2;
      var  AD3 = a3 + d3;
      var Q = obj.pointClosestTo([AD1, AD2, AD3]).elements;
      var newD = [Q[0] + (Q[0] - AD1) - newA[0], Q[1] + (Q[1] - AD2) - newA[1], Q[2] + (Q[2] - AD3) - newA[2]];
      return Line.create(newA, newD);
    } else if (obj.direction) {
      // obj is a line - reflection obtained by rotating PI radians about obj
      return this.rotate(Math.PI, obj);
    }
      // obj is a point - just reflect the line's anchor in it
    var P = obj.elements || obj;
    return Line.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.direction);
  },

  // Set the line's anchor point and direction.
  setVectors: function (theAnchor, theDirection) {
    // Need to do this so that line's properties are not
    // references to the arguments passed in
    anchor = Vector.create(theAnchor);
    direction = Vector.create(theDirection);
    if (anchor.elements.length === 2) {anchor.elements.push(0); }
    if (direction.elements.length === 2) { direction.elements.push(0); }
    if (anchor.elements.length > 3 || direction.elements.length > 3) { return null; }
    var mod = direction.magnitude();
    if (mod === 0) { return null; }
    this.anchor = anchor;
    this.direction = Vector.create([
      direction.elements[0] / mod,
      direction.elements[1] / mod,
      direction.elements[2] / mod
    ]);
    return this;
  }
};

// Constructor function
Line.create = function (anchor, direction) {
  var L = new Line();
  return L.setVectors(anchor, direction);
};

// Axes
Line.X = Line.create(Vector.zero(3), Vector.i);
Line.Y = Line.create(Vector.zero(3), Vector.j);
Line.Z = Line.create(Vector.zero(3), Vector.k);

Plane.prototype = {
  // Returns true iff the plane occupies the same space as the argument
  eql: function (plane) {
    return (this.contains(plane.anchor) && this.isParallelTo(plane));
  },

  // Returns a copy of the plane
  dup: function () {
    return Plane.create(this.anchor, this.normal);
  },

  // Returns the result of translating the plane by the given vector
  translate: function (vector) {
    var v = vector.elements || vector;
    return Plane.create([
      this.anchor.elements[0] + v[0],
      this.anchor.elements[1] + v[1],
      this.anchor.elements[2] + (v[2] || 0)
    ], this.normal);
  },

  // Returns true iff the plane is parallel to the argument. Will return true
  // if the planes are equal, or if you give a line and it lies in the plane.
  isParallelTo: function (obj) {
    var theta;
    if (obj.normal) {
      // obj is a plane
      theta = this.normal.angleFrom(obj.normal);
      return (Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision);
    } else if (obj.direction) {
      // obj is a line
      return this.normal.isPerpendicularTo(obj.direction);
    }
    return null;
  },

  // Returns true iff the receiver is perpendicular to the argument
  isPerpendicularTo: function (plane) {
    var theta = this.normal.angleFrom(plane.normal);
    return (Math.abs(Math.PI / 2 - theta) <= Sylvester.precision);
  },

  // Returns the plane's distance from the given object (point, line or plane)
  distanceFrom: function (obj) {
    var a;
    var  B;
    var  n;
    var P;
    if (this.intersects(obj) || this.contains(obj)) { return 0; }
    if (obj.anchor) {
      // obj is a plane or line
      a = this.anchor.elements;
      B = obj.anchor.elements;
      n = this.normal.elements;
      return Math.abs((a[0] - B[0]) * n[0] + (a[1] - B[1]) * n[1] + (a[2] - B[2]) * n[2]);
    }
      // obj is a point
    P = obj.elements || obj;
    a = this.anchor.elements;
    n = this.normal.elements;
    return Math.abs((a[0] - P[0]) * n[0] + (a[1] - P[1]) * n[1] + (a[2] - (P[2] || 0)) * n[2]);
  },

  // Returns true iff the plane contains the given point or line
  contains: function (obj) {
    if (obj.normal) { return null; }
    if (obj.direction) {
      return (this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction)));
    }
    var P = obj.elements || obj;
    var a = this.anchor.elements;
    var  n = this.normal.elements;
    var diff = Math.abs(n[0] * (a[0] - P[0]) + n[1] * (a[1] - P[1]) + n[2] * (a[2] - (P[2] || 0)));
    return (diff <= Sylvester.precision);
  },

  // Returns true iff the plane has a unique point/line of intersection with the argument
  intersects: function (obj) {
    if (typeof(obj.direction) === 'undefined' && typeof(obj.normal) === 'undefined') { return null; }
    return !this.isParallelTo(obj);
  },

  // Returns the unique intersection with the argument, if one exists. The result
  // will be a vector if a line is supplied, and a line if a plane is supplied.
  intersectionWith: function (obj) {
    var a, d, O, B, P, n, x, y; //eslint-disable-line one-var
    var multiplier;
    var direction;
    var solver;
    var inverse;
    var intersection;
    var anchor;
    if (!this.intersects(obj)) { return null; }
    if (obj.direction) {
      // obj is a line
      a = obj.anchor.elements;
      d = obj.direction.elements;
      P = this.anchor.elements;
      n = this.normal.elements;
      multiplier = (n[0] * (P[0] - a[0]) + n[1] * (P[1] - a[1]) + n[2] * (P[2] - a[2])) / (n[0] * d[0] + n[1] * d[1] + n[2] * d[2]);
      return Vector.create([a[0] + d[0] * multiplier, a[1] + d[1] * multiplier, a[2] + d[2] * multiplier]);
    } else if (obj.normal) {
      // obj is a plane
      direction = this.normal.cross(obj.normal).toUnitVector();
      // To find an anchor point, we find one co-ordinate that has a value
      // of zero somewhere on the intersection, and remember which one we picked
      n = this.normal.elements;
      a = this.anchor.elements;
      O = obj.normal.elements;
      B = obj.anchor.elements;
      solver = Matrix.zero(2, 2);
      i = 0;
      while (solver.isSingular()) {
        i++;
        solver = Matrix.create([
          [ n[i % 3], n[(i + 1) % 3] ],
          [ O[i % 3], O[(i + 1) % 3]  ]
        ]);
      }
      // Then we solve the simultaneous equations in the remaining dimensions
      inverse = solver.inverse().elements;
      x = n[0] * a[0] + n[1] * a[1] + n[2] * a[2];
      y = O[0] * B[0] + O[1] * B[1] + O[2] * B[2];
      intersection = [
        inverse[0][0] * x + inverse[0][1] * y,
        inverse[1][0] * x + inverse[1][1] * y
      ];
      anchor = [];
      for (var j = 1; j <= 3; j++) {
        // This formula picks the right element from intersection by
        // cycling depending on which element we set to zero above
        anchor.push((i === j) ? 0 : intersection[(j + (5 - i) % 3) % 3]);
      }
      return Line.create(anchor, direction);
    }
    return null;
  },

  // Returns the point in the plane closest to the given point
  pointClosestTo: function (point) {
    var P = point.elements || point;
    var a = this.anchor.elements;
    var  n = this.normal.elements;
    var dot = (a[0] - P[0]) * n[0] + (a[1] - P[1]) * n[1] + (a[2] - (P[2] || 0)) * n[2];
    return Vector.create([P[0] + n[0] * dot, P[1] + n[1] * dot, (P[2] || 0) + n[2] * dot]);
  },

  // Returns a copy of the plane, rotated by t radians about the given line
  // See notes on Line#rotate.
  rotate: function (t, line) {
    var R = Matrix.rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var a = this.anchor.elements;
    var  n = this.normal.elements;
    var C1 = C[0];
    var  C2 = C[1];
    var  C3 = C[2];
    var  a1 = a[0];
    var  a2 = a[1];
    var  a3 = a[2];
    var x = a1 - C1;
    var  y = a2 - C2;
    var  z = a3 - C3;
    return Plane.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * n[0] + R[0][1] * n[1] + R[0][2] * n[2],
      R[1][0] * n[0] + R[1][1] * n[1] + R[1][2] * n[2],
      R[2][0] * n[0] + R[2][1] * n[1] + R[2][2] * n[2]
    ]);
  },

  // Returns the reflection of the plane in the given point, line or plane.
  reflectionIn: function (obj) {
    if (obj.normal) {
      // obj is a plane
      var a = this.anchor.elements;
      var  n = this.normal.elements;
      var a1 = a[0];
      var  a2 = a[1];
      var  a3 = a[2];
      var  N1 = n[0];
      var  N2 = n[1];
      var  N3 = n[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the plane's normal to its anchor, then mirror that in the other plane
      var AN1 = a1 + N1;
      var  AN2 = a2 + N2;
      var  AN3 = a3 + N3;
      var Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
      var newN = [Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2]];
      return Plane.create(newA, newN);
    } else if (obj.direction) {
      // obj is a line
      return this.rotate(Math.PI, obj);
    }
      // obj is a point
    var P = obj.elements || obj;
    return Plane.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.normal);
  },

  // Sets the anchor point and normal to the plane. If three arguments are specified,
  // the normal is calculated by assuming the three points should lie in the same plane.
  // If only two are sepcified, the second is taken to be the normal. Normal vector is
  // normalised before storage.
  setVectors: function (theAnchor, vec1, vec2) {
    anchor = Vector.create(theAnchor);
    anchor = anchor.to3D(); if (anchor === null) { return null; }
    v1 = Vector.create(vec1);
    v1 = v1.to3D(); if (v1 === null) { return null; }
    if (typeof(vec2) === 'undefined') {
      v2 = null;
    } else {
      v2 = Vector.create(vec2);
      v2 = v2.to3D(); if (v2 === null) { return null; }
    }
    var a1 = anchor.elements[0];
    var  a2 = anchor.elements[1];
    var  a3 = anchor.elements[2];
    var v11 = v1.elements[0];
    var  v12 = v1.elements[1];
    var  v13 = v1.elements[2];
    var normal;
    var  mod;
    if (v2 !== null) {
      var v21 = v2.elements[0];
      var  v22 = v2.elements[1];
      var  v23 = v2.elements[2];
      normal = Vector.create([
        (v12 - a2) * (v23 - a3) - (v13 - a3) * (v22 - a2),
        (v13 - a3) * (v21 - a1) - (v11 - a1) * (v23 - a3),
        (v11 - a1) * (v22 - a2) - (v12 - a2) * (v21 - a1)
      ]);
      mod = normal.magnitude();
      if (mod === 0) { return null; }
      normal = Vector.create([normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod]);
    } else {
      mod = Math.sqrt(v11 * v11 + v12 * v12 + v13 * v13);
      if (mod === 0) { return null; }
      normal = Vector.create([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
    }
    this.anchor = anchor;
    this.normal = normal;
    return this;
  }
};

// Constructor function
Plane.create = function (anchor, v1, v2) {
  var P = new Plane();
  return P.setVectors(anchor, v1, v2);
};

// X-Y-Z planes
Plane.XY = Plane.create(Vector.zero(3), Vector.k);
Plane.YZ = Plane.create(Vector.zero(3), Vector.i);
Plane.ZX = Plane.create(Vector.zero(3), Vector.j);
Plane.YX = Plane.XY; Plane.ZY = Plane.YZ; Plane.XZ = Plane.ZX;

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see https://www.gnu.org/licenses/
