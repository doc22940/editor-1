import BaseProperty from "./BaseProperty";
import { editor } from "../../../editor/editor";
import { EVENT } from "../../../util/UIElement";
import { DEBOUNCE } from "../../../util/Event";


export default class TextFillProperty extends BaseProperty {

  getTitle() {
    return "Text Fill";
  }

  [EVENT('refreshSelection') + DEBOUNCE(100)]() {
    this.refreshShow('text');
  }

  refresh() {
    // update 를 어떻게 할지 고민 
    var current = editor.selection.current;

    if (current) {
      this.children.$fillColor.setValue(current['text-fill-color'] || 'rgba(0, 0, 0, 1)')      
      this.children.$strokeColor.setValue(current['text-stroke-color'] || 'rgba(0, 0, 0, 1)')      
      this.children.$width.setValue(current['text-stroke-width'] || '0px')      
    }
  }

  getBody() {
    return /*html*/`
      <div class='property-item animation-property-item'>
        <span class='add-timeline-property' data-property='text-fill-color'></span>
        <ColorViewEditor ref='$fillColor' label='Text Fill' removable="true" key='text-fill-color' onchange="changeColor" />
      </div>           
      <div class='property-item animation-property-item'>
        <span class='add-timeline-property' data-property='text-stroke-color'></span>
        <ColorViewEditor ref='$strokeColor' label='Text Stroke' removable="true" key='text-stroke-color' onchange="changeColor" />
      </div>                 

      <div class='property-item animation-property-item'>
        <span class='add-timeline-property' data-property='text-stroke-width'></span>
        <RangeEditor 
          ref='$width' 
          label='Stroke' 
          key="text-stroke-width" 
          removable="true" 
          onchange="changeRangeEditor" />
      </div>
    
    `;
  }

  [EVENT('changeColor')] (key, color, params) {
    this.trigger('changeRangeEditor', key, color);
  }

  [EVENT('changeRangeEditor')] (key, value) {

    editor.selection.reset({ 
      [key]: value
    })

    this.emit("refreshSelectionStyleView");
  }
}
