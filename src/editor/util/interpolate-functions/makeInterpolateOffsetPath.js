import { editor } from "../../editor";
import PathParser from "../../parse/PathParser";
import makeInterpolateOffset from "./offset-path/makeInterpolateOffset";
import { Length } from "../../unit/Length";
import { calculateAngle } from "../../../util/functions/math";
import { Transform } from "../../css-property/Transform";

export function makeInterpolateOffsetPath(layer, property, startValue, endValue) {

    var [id, distance, rotateStatus, rotate] = startValue.split(',').map(it =>it.trim());

    var startObject = {id, distance: Length.parse(distance || '0%'), rotateStatus: rotateStatus || 'auto', rotate: Length.parse(rotate || '0deg') }

    var artboard = editor.selection.currentArtboard
    var innerInterpolate = (rate, t) => {
        return { x, y }
    }

    var innerInterpolateAngle = (rotateStatus, currentAngle) => {

        var resultAngle = 0; 

        switch (rotateStatus) {
        case 'angle': 
            resultAngle =  startObject.rotate.value; 
            break; 
        case 'auto angle': 
            resultAngle =  currentAngle + startObject.rotate.value; 
            break; 
        case 'reverse': 
            resultAngle = currentAngle + 180;
            break; 
        case 'auto' : 
            resultAngle = currentAngle;
            break; 
        }

        return resultAngle;
    }

    var screenX = 0, screenY = 0

    if (artboard) {
        var pathLayer = artboard.searchById(startObject.id);
        screenX = pathLayer.screenX.value
        screenY = pathLayer.screenY.value        

        innerInterpolate = (rate, t, timing) => {
            var parser = new PathParser(pathLayer.d);            
            var {totalLength, interpolateList} = makeInterpolateOffset(parser.segments); 

            var distance = startObject.distance.toPx(totalLength)
            var dt = distance / totalLength;

            t = (t + dt )

            if (t > 1) {
                t -= 1; 
            }

            var obj = interpolateList[0]    
            if (t === 0) {
                obj = interpolateList[0]    
            } else if (t === 1) {
                obj = interpolateList[interpolateList.length-1]    
            }

            var arr = interpolateList.find(it => {
                return it.startT <= t && t < it.endT
            });

            if (arr) {
                obj = arr
            }
            
            var newT = (t - obj.startT)/(obj.endT - obj.startT)
            var newRate = timing(newT)

            return {
                ...obj.interpolate(newRate, newT, timing),
                totalLength: obj.totalLength
            }
        }

    }

    return (rate, t, timing) => {

        // apply tranform-origin in real time 

        var arr = (layer['transform-origin'] || '50% 50%').split(' ').map(it => Length.parse(it))
        var tx = arr[0].toPx(layer.width.value);
        var ty = arr[1].toPx(layer.height.value);

        var obj = innerInterpolate(rate, t, timing); 

        var results = {
            x: obj.x + screenX - tx.value,
            y: obj.y + screenY - ty.value
        }

        layer.setScreenX(results.x)
        layer.setScreenY(results.y)

        if (startObject.rotateStatus === 'element') {
            // NOOP 
        } else {
            var current = obj
            var next = innerInterpolate(rate + 1/obj.totalLength, t + 1/obj.totalLength, timing); 
            var angle = calculateAngle(next.x - current.x, next.y - current.y)

            if (!isNaN(angle)) {
                var newAngle = Length.deg(innerInterpolateAngle(startObject.rotateStatus, angle))

                layer.reset({
                    transform: Transform.rotate(layer.transform, newAngle)
                })
            }
        }


        return results;
    }

}
