import UIElement, { EVENT } from "../../../../util/UIElement";
import { THROTTLE, IF, PREVENT, KEYDOWN, KEYUP, KEY, ENTER, CLICK } from "../../../../util/Event";
import { editor } from "../../../../editor/editor";
import icon from "../../icon/icon";

export default class KeyframeTimeControl extends UIElement {
    template () {
        return /*html*/`
        <div class='keyframe-time-control'>
            <div class='time-manager'>
                <button type="button" ref='$timer'>${icon.timer}</button>
                <label><input type="text" ref='$currentTime' /></label>
                <label>FPS <input type="number" ref='$fps' min="0" max="999" /></label>
                <label><input type="text" ref='$duration' /></label>
            </div>
        </div>`
    }



    refresh () {
        this.refreshTimeInfo();
    }

    get currentTimeline () {
        var currentArtboard = editor.selection.currentArtboard;

        if (currentArtboard) {
            return currentArtboard.getSelectedTimeline();
        }

        return null; 
    }

    hasCurrentTimeline() {
        return !!this.currentTimeline;
    }

    refreshTimeInfo() {

        var timeline = this.currentTimeline;

        if (timeline) {

            this.refs.$currentTime.val(timeline.currentTimecode);
            this.refs.$duration.val(timeline.totalTimecode);
            this.refs.$fps.val(timeline.fps);
        }

    }

    refreshCurrentTime() {

        var timeline = this.currentTimeline;

        if (timeline) {
            this.refs.$currentTime.val(timeline.currentTimecode);
        }

    }


    [EVENT('playTimeline')] () {
        this.refreshCurrentTime()
    }

    [EVENT('refreshTimeline')] () {
        this.refresh();
    }

    [EVENT('moveTimeline', 'refreshSelection') + THROTTLE(10)] (){
        this.refresh();
    }

    [KEYUP('$fps') + ENTER] (e) {
        var fps = +this.refs.$fps.val();

        var artboard = editor.selection.currentArtboard;

        if (artboard) {
            artboard.setFps(fps);
            this.emit('moveTimeline');            
        }
    }

    checkNumberOrTimecode (e) {
        var value = e.target.value.trim();
        if ((+value) + '' === value) {
            return true; 
        } else if (value.match(/^[0-9:]+$/)) {
            return true; 
        }

        return false;
    }

    checkKey (e) {
        if (e.key.match(/^[0-9:]+$/)) {
            return true; 
        } else if (e.code === 'Backspace' || e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
            return true; 
        }

        return false; 
    }

    [CLICK('$timer')] () {
        var artboard = editor.selection.currentArtboard;

        if (artboard) {
            artboard.seek(this.refs.$currentTime.value, (it => {
                return true; 
            }))
            this.emit('playTimeline');
        }
    }

    [KEYDOWN('$currentTime')] (e) {
        if (!this.checkKey(e)) {
            e.preventDefault();
            e.stopPropagation()
            return false;
        }
    }

    [KEYUP('$currentTime') + ENTER + IF('checkNumberOrTimecode') + IF('hasCurrentTimeline') + PREVENT] (e) {
        var frame = this.refs.$currentTime.value
        var artboard = editor.selection.currentArtboard;

        if (artboard) {
            artboard.setTimelineCurrentTime(frame);
        }

        this.refresh();
        this.emit('moveTimeline');
    }



    [KEYDOWN('$duration')] (e) {
        if (!this.checkKey(e)) {
            e.preventDefault();
            e.stopPropagation()
            return false;
        }
    }

    [KEYUP('$duration') + ENTER + IF('checkNumberOrTimecode') + IF('hasCurrentTimeline') + PREVENT] (e) {

        var frame = this.refs.$duration.value
        var artboard = editor.selection.currentArtboard;

        if (artboard) {
            artboard.setTimelineTotalTime(frame);
        }

        this.refresh();
        this.emit('moveTimeline');
    }
}
