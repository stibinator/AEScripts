function approximately(a, b){
	return Math.abs(a - b) < 0.0001;
}

function crt(x) {
	return x < 0 ? -Math.pow(-x, 1.0/3.0) : Math.pow(x, 1.0/3.0);
}

// Find the roots for a cubic polynomial with bernstein coefficients
// {ptA, ptB} where ptA, ptB are vectors of dimension 2. The function will first convert those to the
// standard polynomial coefficients, and then run through Cardano's
// formula for finding the roots of a depressed cubic curve.
function findRoots(x, ctrlA, ctrlB) {
    let ctrlA3 = 3 * ctrlA;
    let ctrlB3 = 3 * ctrlB;
    let a = -ctrlA[0] + ctrlA3[1] - ctrlB3[0] + ctrlB[1];
    let b = ctrlA3[0] - 2 * ctrlA3[1] + ctrlB3[0];
    let c = -ctrlA3[0] + ctrlA3[1];
    let d = ctrlA[0] - x;


    // Fun fact: any Bezier curve may (accidentally or on purpose)
    // perfectly model any lower order curve, so we want to test
    // for that: lower order curves are much easier to root-find.
    if (approximately(a, 0)) {
        // this is not a cubic curve.
        if (approximately(b, 0)) {
            // in fact, this is not a quadratic curve either.
            if (approximately(c, 0)) {
                // in fact in fact, there are no solutions.
                return [];
            }
            // linear solution:
            return [-d / c];
        }
        // quadratic solution:
        let q = Math.sqrt(c * c - 4 * b * d);
        let b2 = 2 * b;
        return [(q - c) / b2, (-c - q) / b2];
    }

    // At this point, we know we need a cubic solution,
    // and the above a/b/c/d values were technically
    // a pre-optimized set because a might be zero and
    // that would cause the following divisions to error.

    b /= a;
    c /= a;
    d /= a;

    let b3 = b / 3;
    let p = (3 * c - b * b) / 3;
    let p3 = p / 3;
    let q = (2 * b * b * b - 9 * b * c + 27 * d) / 27;
    let q2 = q / 2;
    let discriminant = q2 * q2 + p3 * p3 * p3;
    let u1, v1;

    // case 1: three real roots, but finding them involves complex
    // maths. Since we don't have a complex data type, we use trig
    // instead, because complex numbers have nice geometric properties.
    if (discriminant < 0) {
        let mp3 = -p / 3;
        let r = Math.sqrt(mp3 * mp3 * mp3);
        let t = -q / (2 * r);
        let cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
        let phi = Math.acos(cosphi);
        let crtr = crt(r);
        t1 = 2 * crtr;
        return [
            t1 * Math.cos(phi / 3) - b3,
            t1 * Math.cos((phi + Math.PI * 2) / 3) - b3,
            t1 * Math.cos((phi + 2 * Math.PI * 2) / 3) - b3,
        ];
    }

    // case 2: three real roots, but two form a "double root",
    // and so will have the same resultant value. We only need
    // to return two values in this case.
    else if (discriminant == 0) {
        u1 = q2 < 0 ? crt(-q2) : -crt(q2);
        return [2 * u1 - b3, -u1 - b3];
    }

    // case 3: one real root, 2 complex roots. We don't care about
    // complex results so we just ignore those and directly compute
    // that single real root.
    else {
        let sd = Math.sqrt(discriminant);
        u1 = crt(-q2 + sd);
        v1 = crt(q2 + sd);
        return [u1 - v1 - b3];
    }
}

function normalise(pt, minVect, maxVect){
	
	let pts = [];
	for(let d = 0; d<pt.length && d < maxVect.length; d++){
    	let scalar = maxVect[d] - minVect[d];
		pts.push((pt[d] - minVect[d]) / scalar);
	}
	return pts;
}

function scaleOffsetVec(pt, minVect, maxVect){
	let pts = [];
	for(let d = 0; d<pt.length && d < minVect.length && d < maxVect.length; d++){
		let scalar = maxVect[d] - minVect[d];
		pts.push (minVect[d] + pt[d] * scalar);
	}
	return pts;
}

function bezier(t, ptA, ptB, ptC, ptD) {
    let x =
        Math.pow(1 - t, 3) * ptA[0] +
        3 * Math.pow(1 - t, 2) * t * ptB[0] +
        3 * (1 - t) * Math.pow(t, 2) * ptC[0] +
        Math.pow(t, 3) * ptD[0];
    let y =
        Math.pow(1 - t, 3) * ptA[1] +
        3 * Math.pow(1 - t, 2) * t * ptB[1] +
        3 * (1 - t) * Math.pow(t, 2) * ptC[1] +
        Math.pow(t, 3) * ptD[1];

    return [x, y];
}


function bezierFromX(x, ptA, ptB){
	let t = findRoots(x, ptA, ptB);
	return bezier(t[2], [0,0], ptA, ptB, [1, 1]);
}

let pointA = thisComp.layer("A").toComp([0,0]);
let pointD = thisComp.layer("D").toComp([0,0]);
let pointB = normalise(thisComp.layer("B").toComp([0,0]), pointA, pointD);
let pointC = normalise(thisComp.layer("C").toComp([0,0]), pointA, pointD);

pts = [];
for (let i = 0; i < 10; i++){
	let bz = bezierFromX(i/10, [0,0], pointB, pointC, [1,1]);
	if(! (isNaN(bz[0]) || isNaN(bz[1]))){
	pts.push(scaleOffsetVec( bz, pointA, pointD));
	}
}
createPath([pointA, scaleOffsetVec(pointC, pointA, pointD)])



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
