import { EVENT } from "../../../util/UIElement";
import { INPUT } from "../../../util/Event";
import CSSPropertyEditor from "../property-editor/CSSPropertyEditor";
import BasePopup from "./BasePopup";
import { editor } from "../../../editor/editor";

const i18n = editor.initI18n('selector.popup')

export default class SelectorPopup extends BasePopup {

  getTitle() {
    return i18n('title')
  }

  components() {
    return {
      CSSPropertyEditor
    }
  }

  initState() {
    return {
      selector: '',
      properties: []
    };
  }

  updateData(opt) {
    this.setState(opt, false); 
    this.emit("changeSelectorPopup", this.state);
  }

  getBody() {
    return `
    <div class='selector-popup' ref='$popup'>
      <div class="box">
        ${this.templateForSelector()}
        ${this.templateForProperty()}        
      </div>
    </div>`;
  }


  templateForProperty() {
    return /*html*/`<CSSPropertyEditor ref='$propertyEditor' onchange='changePropertyEditor' />`
  }    


  templateForSelector() {
    return /*html*/`
      <div class='name'>
        <label>${i18n('selector')}</label>
        <div class='input grid-1'>
          <input type='text' value='${this.state.selector}' ref='$selector'/>
        </div>
      </div>
    `
  }

  [INPUT('$selector')] (e) {
    if (this.refs.$selector.value.match(/^[a-zA-Z0-9\:\_\-\.\b]+$/)) {
      this.updateData({selector : this.refs.$selector.value })
    } else {
      e.preventDefault()
      e.stopPropagation()
      return false;
    }
  }
  
  refresh() {
    super.refresh()

    this.refs.$selector.val(this.state.selector);
    this.children.$propertyEditor.trigger('showCSSPropertyEditor', this.state.properties);
  }

  [EVENT('changePropertyEditor')] (properties) {
    this.updateData({
      properties
    });
  }

  [EVENT("showSelectorPopup")](data) {
    this.setState(data);
    this.refresh()

    this.show(250)
  }
}
