import UIElement, { EVENT } from "../../../../util/UIElement";
import { CLICK, INPUT, BIND } from "../../../../util/Event";
import icon from "../../icon/icon";
import { editor } from "../../../../editor/editor";

const i18n = editor.initI18n('timeline.play.control')

export default class TimelinePlayControl extends UIElement {
    
    template() {
        return /*html*/`
            <div class='timeline-play-control' >
                <div class='row'>
                    <div class='play-buttons' ref='$playButtons' data-status='${this.state.status}'>
                        <button type="button" data-value='play' class='play' title='${i18n('play')}'>${icon.play}</button>
                        <button type="button" data-value='pause' class='pause' title='${i18n('pause')}'>${icon.pause}</button>                
                        <button type="button" data-value='first' class='first' title='${i18n('first')}'>${icon.skip_prev}</button>
                        <button type="button" data-value='prev' class='prev' title='${i18n('prev')}'>${icon.fast_rewind}</button>                    
                        <button type="button" data-value='next' class='next' title='${i18n('next')}'>${icon.fast_forward}</button>
                        <button type="button" data-value='last' class='last' title='${i18n('last')}'>${icon.skip_next}</button>
                    </div>
                </div>
                <div class='row'>            
                    <label title='Speed'>${i18n('speed')}</label>
                    <div class='input speed-number' >
                        <input type='number' min="0.1" max="10" step="0.1" ref='$speed' value='${this.state.speed}' />
                    </div>
                </div>                
                <div class='row'>            
                    <label><span ref='$repeatStatus'>${i18n('repeat')}</span></label>
                    <div class='input' >
                        <input type='number' min="0" max="100" step="1" ref='$iteration' value='${this.state.iterationCount}' />
                    </div> 
                </div>
                <div class='row'>
                    <label> ${i18n('direction')}</label>
                    <div class='direction-buttons' ref='$direction' data-selected-direction='${this.state.direction}'>
                        <button type="button" data-value='normal' title='${i18n('normal')}'>${icon.arrowRight}</button>
                        <button type="button" data-value='alternate' title='${i18n('alternate')}'>${icon.alternate}</button>
                        <button type="button" data-value='reverse' title='${i18n('reverse')}' style='transform: rotateY(180deg)'>${icon.arrowRight}</button>
                        <button type="button" data-value='alternate-reverse' title='${i18n('alternate.reverse')}' style='transform: rotateY(180deg)'>${icon.alternate_reverse}</button>
                    </div>
                </div>                                
            </div>
        `
    }

    initState() {

        var speed = 1
        var iterationCount = 1
        var direction = 'normal'

        var timeline = this.getSelectedTimeline();

        if (timeline) {
            var { speed, iterationCount, direction } = timeline; 
        }


        return {
            status: 'pause',
            speed,
            iterationCount,
            direction
        }
    }


    getSelectedTimeline () {

        var artboard = editor.selection.currentArtboard;
        if (artboard) {
            return artboard.getSelectedTimeline();
        }
    }

    updateData(obj) {
        this.setState(obj, false);
        var artboard = editor.selection.currentArtboard;
        if (artboard) {
            artboard.setTimelineInfo(obj);
        }
    }

    [CLICK('$playButtons button')] (e) {

        var status = e.$delegateTarget.attr('data-value')

        this.setState({ status })

        if (status === 'play') {
            this.play();
        } else if (status === 'pause') {
            this.pause();
        } else if (status === 'first') {
            this.first();
        } else if (status === 'prev') {
            this.prev();
        } else if (status === 'next') {
            this.next()
        } else if (status === 'last') {
            this.last()
        }

    }

    first () {
        this.emit('first.timeline')
        editor.changeMode('SELECTION');
        this.emit('after.change.mode')
    }

    prev () {
        this.emit('prev.timeline')
        editor.changeMode('SELECTION');
        this.emit('after.change.mode')
    }
    
    next () {
        this.emit('next.timeline')
        editor.changeMode('SELECTION');
        this.emit('after.change.mode')           
    }
    
    last () {
        this.emit('last.timeline')
        editor.changeMode('SELECTION');
        this.emit('after.change.mode')             
    }    

    play () {
        this.emit('play.timeline', this.state.speed, this.state.iterationCount, this.state.direction);
    }

    pause () {
        this.emit('pause.timeline');
        editor.changeMode('SELECTION');
        this.emit('after.change.mode')
    }

    [EVENT('stopTimeline')] () {
        this.updateData({
            status: 'pause'
        })
    }
   
    [CLICK('$direction button')] (e) {
        this.updateData({
            direction: e.$delegateTarget.attr('data-value')
        })
        this.refresh();        
    }    

    [CLICK('$repeatStatus')] (e) {

        var count = this.refs.$iteration.value; 
        var iterationCount = 0; 

        if (count === 0) {
            iterationCount = 1; 
        } 

        this.updateData({ iterationCount })
        this.refs.$iteration.val(iterationCount);
        this.bindData('$repeatStatus');
    }

    [INPUT('$iteration')] (e) {
        this.updateData({
            iterationCount: +this.refs.$iteration.value
        })
        this.bindData('$repeatStatus');
    }

    [INPUT('$speed')] (e) {
        this.updateData({
            speed: +this.refs.$speed.value 
        })
    }    


    [BIND('$repeatStatus')] () {
        return {
            text: this.state.iterationCount === 0 ? i18n('infinite'): i18n('repeat')
        }
    }    

    [BIND('$playButtons')] () {
        return {
            'data-status': this.state.status
        }
    }

    [BIND('$direction') ] () {
        return {
            'data-selected-direction' : this.state.direction
        }
    }    

    [EVENT('selectTimeline')] () {
        this.refresh();
    } 

}