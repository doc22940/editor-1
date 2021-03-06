import { isUndefined } from "./func";
import { Vect3 } from "./matrix";

export function round (n, k) {
    k = isUndefined(k) ? 1 : k; 
    return Math.round(n * k) / k;
}


export function degreeToRadian (degrees) {
    return degrees * Math.PI / 180;
}

export function div(num, divNum = 1) {
    return (num === 0) ? 0 : num / divNum;
}

/**
 * 
 * convert radian to degree 
 * 
 * @param {*} radian 
 * @returns {Number} 0..360
 */
export function radianToDegree(radian) {
    var angle =  radian * 180 / Math.PI;


    if (angle < 0) {   
        angle = 360 + angle
    }

    return angle; 
}


export function getXInCircle (angle, radius, centerX = 0) {
    return centerX + radius * Math.cos(degreeToRadian (angle))
}

export function getYInCircle (angle, radius, centerY = 0) {
    return centerY + radius * Math.sin(degreeToRadian(angle))
}    

export function getXYInCircle (angle, radius, centerX = 0, centerY = 0) {
    return {
        x : getXInCircle(angle, radius, centerX),
        y : getYInCircle(angle, radius, centerY)
    }
}

export function getDist (x, y, centerX = 0, centerY = 0) {
    return Math.sqrt( 
        Math.pow(Math.abs(centerX - x), 2) 
        + 
        Math.pow(Math.abs(centerY - y), 2) 
    )
}

export function calculateAngle (rx, ry) {
    return radianToDegree(Math.atan2(ry, rx))
}

export function calculateAngle360 (rx, ry) {
    return (radianToDegree(Math.atan2(ry, rx)) + 180) % 360
}

const UUID_REG = /[xy]/g

export function uuid(){
    var dt = new Date().getTime();
    var uuid = 'xxx12-xx-34xx'.replace(UUID_REG, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

export function uuidShort(){
    var dt = new Date().getTime();
    var uuid = 'idxxxxxxx'.replace(UUID_REG, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

const bezierCalc = {
    B1 : function (t) { return t*t*t },
    B2 : function (t) { return 3*t*t*(1-t) },
    B3 : function (t) { return 3*t*(1-t)*(1-t) },
    B4 : function (t) { return (1-t)*(1-t)*(1-t) }
}

export function cubicBezier (x1, y1, x2, y2) {
    var C1 = { x : 0, y : 0 };
    var C2 = { x : x1, y : y1 };
    var C3 = { x : x2, y : y2 };
    var C4 = { x : 1, y : 1 };

    return function (progress) {
        // var x = C1.x * bezierCalc.B1(p) + C2.x*bezierCalc.B2(p) + C3.x*bezierCalc.B3(p) + C4.x*bezierCalc.B4(p);
        // var y = C1.y * bezierCalc.B1(progress) + C2.y*bezierCalc.B2(progress) + C3.y*bezierCalc.B3(progress) + C4.y*bezierCalc.B4(progress);

        var y = C2.y*bezierCalc.B2(progress) + C3.y*bezierCalc.B3(progress) + bezierCalc.B4(progress);

        return 1 - y;
    }
}

export function getGradientLine(angle, box) {
    let length = Math.abs(box.width * Math.sin(angle)) + Math.abs(box.height * Math.cos(angle));
    let center = {
      x: box.x + box.width/2,
      y: box.y + box.height/2
    };
  
    let yDiff = Math.sin(angle-Math.PI/2) * length/2;
    let xDiff = Math.cos(angle-Math.PI/2) * length/2;
  
    return {
      length,
      center,
      start: {
        x: center.x - xDiff,
        y: center.y - yDiff
      },
      end: {
        x: center.x + xDiff,
        y: center.y + yDiff
      }
    };
}

// 외적 구하기 
export function CCW(A, B, C) {
    // cross (B - A, C - A)

    if (isUndefined(C)) {
        return Vect3.cross2d(A, B);
    }

    return Vect3.cross2d(Vect3.sub(B, A), Vect3.sub(C, A))
}

// refer to http://www.secmem.org/blog/2019/01/11/Deluanay_Triangulation/
export function incircle (a, b, c, d) {
    var ccw = CCW(a, b, c)

    var adx = a.x - d.x;
    var ady = a.y - d.y;
    var bdx = b.x - d.x;
    var bdy = b.y - d.y;
    var cdx = c.x - d.x;
    var cdy = c.y - d.y;

    var bdxcdy = bdx * cdy, cdxbdy = cdx * bdy;
    var cdxady = cdx * ady, adxcdy = adx * cdy;
    var adxbdy = adx * bdy, bdxady = bdx * ady;

    var alift = adx * adx + ady * ady;
    var blift = bdx * bdx + bdy * bdy;
    var clift = cdx * cdx + cdy * cdy;
    
    var det = alift * (bdxcdy - cdxbdy) + blift * (cdxady - adxcdy) + clift * (adxbdy - bdxady);
    
    if(ccw > 0) return det >= 0;
    else return det <= 0;
}

export function initPolygon (polygon, x, y) {

    var A = Vect3.create(Math.min(x, y), Math.max(x, y))

    var selectedIndex = -1; 
    for(var i = 0, len = polygon.length; i < len; i++ ) {
        if (Vect3.equal(polygon[i], A)) {
            selectedIndex = i;
            break; 
        }
    }

    if (selectedIndex > -1) {
        polygon.splice(selectedIndex, 1);
    } else {
        polygon.push(A)
    }
}

function swap (data, i, j) {
    var temp = data[i];
    data[i] = data[j]
    data[j] = temp 
}

export function Deluanay (points = []) {    

    var n = points.length;

    points[n] = Vect3.create(-2e9, -2e9)
    points[n+1] = Vect3.create(2e9, -2e9)
    points[n+2] = Vect3.create(0, 2e9)

    var triangle = [Vect3.create(n, n+1, n+2)] 

    for(var i = 0; i < n; i++) {
        let polygon = [];

        var complete = new Array(triangle.length);

        for(var j = 0; j < triangle.length; j++) {
            if(complete[j]) continue;
            var current = triangle[j];

            if (!current) continue;

            var a = points[current.x]
            var b = points[current.y]
            var c = points[current.z]
            var d = points[i]

            if(incircle(a, b, c, d)) {

                initPolygon(polygon, current.x, current.y)
                initPolygon(polygon, current.y, current.z)
                initPolygon(polygon, current.z, current.x)


                swap(complete, j, triangle.length - 1 ); 
                swap(triangle, j, triangle.length - 1);
                triangle.pop();
                j--;
                continue;
            }
            complete[j] = true;
        }

        polygon.forEach(current => {

            var a = points[current.x]
            var b = points[current.y]
            var d = points[i]

            if (CCW(a, b, d) === 0) {  // 0 은 평면 

            } else {
                triangle.push(Vect3.create(current.x, current.y, i))
            }
        })
    }

    // SuperTriangle delete    
    for(var i = 0; i < triangle.length; i++) {
        var current = triangle[i]

        if (current.x >= n || current.y >= n || current.z >= n) {
            swap(triangle, i, triangle.length - 1);
            triangle.pop();
            i--;
            continue; 
        }
    }

    return triangle.map(current => {
        return {
            a: points[current.x], 
            b: points[current.y], 
            c: points[current.z] 
        }
    })
}

export function generate_sample_points(width, height, xSize =  50, ySize = 50, boxSize = 100, variance = 1, func = () => Math.random()) {
  var points = [];
  var minX = -xSize; 
  var maxX = width + xSize;
  var minY = -ySize; 
  var maxY = height + ySize; 
  for (var x = minX; x < maxX; x += boxSize) {
    for (var y = minY; y < maxY; y += boxSize) {
        var tempX = Math.floor(x + (boxSize / 2) * (func() * variance * 2  - variance));
        var tempY = Math.floor(y + (boxSize / 2) * (func() * variance * 2  - variance));
        points[points.length] = { x: tempX, y: tempY }
    }
  }

  return points;
}

export function getCenterInTriangle (a, b, c) {
    return {
        x: (a.x + b.x + c.x) / 3 ,
        y: (a.y + b.y + c.y) / 3
    }
}

const splitReg = /[\b\t \,\n]/g;
export function normalize (str) {
    return str.trim().split(splitReg).filter(it => it).map(it  => +it);
}