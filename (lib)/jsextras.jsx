// @target aftereffects
// license below
// more: https://blob.pureandapplied.com.au
//useful JS shit I found on Stack Overflow etc

function contains(arr, obj) { //eslint-disable-line no-unused-vars
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return true;
    }
  }
  return false;
}


// attach the .equals method to Array's prototype to call it on any array
Array.equals = function(array1, array2) { //eslint-disable-line no-unused-vars
  // if the other array is a falsy value, return
  if (!array2) {
    return false;
  }

  // compare lengths - can save a lot of time
  if (array1.length !== array2.length) {
    return false;
  }
  for (var i = 0, l = array1.length; i < l; i++) {
    // Check if we have nested arrays
    if (array1[i]instanceof Array && array2[i]instanceof Array) {
      // recurse into the nested arrays
      if (!array1[i].equals(array2[i])) {
        return false;
      }
    } else if (array1[i] !== array2[i]) {
      // Warning - two different object instances will never be equal: {x:20} !=
      // {x:20}
      return false;
    }
  }
  return true;
}
// Hide method from for-in loops
// Object.defineProperty(Array.prototype, 'equals', {enumerable: false}); //eslint-disable-line no-extend-native

// python-esque array range function
Array.range= function(a, b, step){
    var A= [];
    if(typeof a== 'number'){
        A[0]= a;
        step= step || 1;
        while(a+step<= b){
            A[A.length]= a+= step;
        }
    }
    else{
        var s= 'abcdefghijklmnopqrstuvwxyz';
        if(a=== a.toUpperCase()){
            b=b.toUpperCase();
            s= s.toUpperCase();
        }
        s= s.substring(s.indexOf(a), s.indexOf(b)+ 1);
        A= s.split('');        
    }
    return A;
}

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
