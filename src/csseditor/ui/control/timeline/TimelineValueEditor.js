import UIElement, { EVENT } from "../../../../util/UIElement";
import CubicBezierEditor from "../../property-editor/CubicBezierEditor";
import { LOAD, CLICK, KEYDOWN, KEYUP, KEY, IF, PREVENT, ENTER } from "../../../../util/Event";
import CSSPropertyEditor from "../../property-editor/CSSPropertyEditor";

import { second, timecode } from "../../../../util/functions/time";
import { editor } from "../../../../editor/editor";
import { isUndefined } from "../../../../util/functions/func";
import icon from "../../icon/icon";

const  i18n = editor.initI18n('timeline.value.editor')

export default class TimelineValueEditor extends UIElement {
  components() {
    return {
      CSSPropertyEditor,
      CubicBezierEditor
    }
  }

  initState() {
    return {
      time: 0,
      timing: 'linear'
    };
  }

  updateData(opt) {
    this.setState(opt, false); 
    this.parent.trigger(this.props.onchange, this.state);
  }

  getProperties() {
    return [{
        key: this.state.property,
        value: isUndefined(this.state.value) ? '10px' : this.state.value ,
        editor: this.state.editor
    }].filter(it => it.key);
  }

  refresh () {

    var artboard = editor.selection.currentArtboard; 
    var code = '00:00:00:00';
    if (artboard) {
      var timeline = artboard.getSelectedTimeline();
      if (timeline) {
        code = timecode(timeline.fps, this.state.time)
      }
    }

    this.refs.$offsetTime.val(code)
    this.children.$propertyEditor.trigger('showCSSPropertyEditor', this.getProperties());      
    this.children.$cubicBezierEditor.trigger('showCubicBezierEditor', {
      timingFunction: this.state.timing
    });
  }

  template() {
    return /*html*/`
    <div class='timeline-value-editor'>
        <div class="tab number-tab" data-selected-value="1" ref="$tab">
            <div class="tab-header full" ref="$header">
                <div class="tab-item" data-value="1">
                    <label>${i18n('value')}</label>
                </div>          
                <div class="tab-item" data-value="2">
                    <label>${i18n('timing')}</label> 
                </div>                            
            </div>
            <div class="tab-body" ref="$body">
                <div class="tab-content padding-zero" data-value="1">
                    ${this.templateForOffset()}  
                    ${this.templateForProperty()}  
                </div>
                <div class="tab-content" data-value="2">
                    ${this.templateForTimingFunction()}
                </div>
            </div>
        </div>
    </div>
    `;
  }


  [CLICK("$header .tab-item:not(.empty-item)")](e) {
    this.refs.$tab.attr(
      "data-selected-value",
      e.$delegateTarget.attr("data-value")
    );
    this.refresh();
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

[KEYDOWN('$offsetTime')] (e) {
    if (!this.checkKey(e)) {
        e.preventDefault();
        e.stopPropagation()
        return false;
    }
}

[KEYUP('$offsetTime') + ENTER + IF('checkNumberOrTimecode') + PREVENT] (e) {
    var frame = this.refs.$offsetTime.value

    var artboard = editor.selection.currentArtboard;
    if (artboard) {
      var timeline = artboard.getSelectedTimeline();

      this.updateData({
        time: second(timeline.fps, frame)
      });
    }

}


  templateForOffset() {
    return /*html*/`
      <div class='offset-input'>
        <label>${i18n('time')}</label>
        <input type="text" ref='$offsetTime' />
        <button type="button" ref='$seek' title='Seek timeline'>${icon.gps_fixed}</button>
      </div>
    `
  }    

  [CLICK('$seek')] () {
    var artboard = editor.selection.currentArtboard;

    if (artboard) {
      artboard.seek(this.refs.$offsetTime.value, (it => {

        if ( it.layer.id === this.state.layerId && it.property === this.state.property) {
          return true; 
        }

        return false; 
      }))
      this.emit('playTimeline');
    }
  }

  templateForProperty() {
    return `<CSSPropertyEditor ref='$propertyEditor' hide-title='true' onchange='changePropertyEditor' />`
  }    

  [LOAD('$editor')] () {
      return ''
  }

  templateForTimingFunction () {
    return /*html*/`
    <div class='timing-function'>
      <CubicBezierEditor ref='$cubicBezierEditor' key="timing" value="${this.state.timingFunction}" onChange='changeCubicBezier' />
    </div>
    `
  }

  [EVENT('refreshPropertyValue')] () {

    var artboard = editor.selection.currentArtboard;
    if (artboard) {
      var selectedLayer = artboard.searchById(this.state.layerId); 

      if (selectedLayer) {
        var value = selectedLayer[this.state.property] + ''
        this.trigger('refreshOffsetValue', { value })
        this.updateData({ value })
      }
    }
  }

  [EVENT('refreshOffsetValue')] (offset) {
    this.setState({
        ...offset
    }, false)
    this.refresh();
  }

  [EVENT('changeCubicBezier')] (key, value) {
    this.updateData({ [key]: value + '' })
  }

  [EVENT('changePropertyEditor')] (obj) {
    if (obj.length)  {
        var it = obj[0]
        this.updateData({
            value: it.value + ''
        })
    }
  }

}
