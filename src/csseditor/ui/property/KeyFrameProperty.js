import BaseProperty from "./BaseProperty";
import icon from "../icon/icon";
import {
  LOAD,
  CLICK,
  PREVENT,
  DEBOUNCE
} from "../../../util/Event";

import { editor } from "../../../editor/editor";
import { EVENT } from "../../../util/UIElement";

import { Keyframe } from "../../../editor/css-property/Keyframe";

export default class KeyFrameProperty extends BaseProperty {
  getTitle() {
    return editor.i18n('keyframe.property.title');
  }
  getBody() {
    return `<div class='keyframe-list' ref='$keyframeList'></div>`;
  }

  getTools() {
    return `
      <button type="button" ref="$add" title="add Filter">${icon.add}</button>
    `;
  }

  makeProperty (property) {
    var key = property.key
    if (key === 'x') key = 'left';
    else if (key === 'y') key = 'top';

    return /*html*/`
      <div class='offset-property-item'>
        <label>${key}:</label>
        <div class='value'>${property.value}</div>
      </div>
    `
  }

  makeOffset (offset) {
    return /*html*/`
      <div class='offset'>
        <label>${offset.offset}</label>
        <div class='properties'>
          ${offset.properties.map(p => {
            return this.makeProperty (p);
          }).join('')}
        </div>        
      </div>
    `    
  }

  makeKeyframeTemplate (keyframe, index) {
    index = index.toString()
    return /*html*/`
      <div class='keyframe-item' data-selected-value='${keyframe.selectedType}' ref='$keyframeIndex${index}' data-index='${index}'>
        <div class='title'>
          <div class='name'>${keyframe.name}</div>
          <div class='tools'>
            <div class='group'>
              <button type="button" data-type='list'>${icon.list}</button>
              <button type="button" data-type='code'>${icon.code}</button>
            </div>
            <button type="button" class="del" data-index="${index}">${icon.remove2}</button>
          </div>
        </div>
        <div class='offset-list'>
          <div class='container'>
            ${keyframe.offsets.map(o => {
              return /*html*/`
              <div class='offset' style='left: ${o.offset}; background-color: ${o.color}'></div>
              `
            }).join('')}
          </div>
        </div>
        <div class='keyframe-code' data-type='list'>
          ${keyframe.offsets.map(offset => {
            return this.makeOffset(offset);
          }).join('')}
        </div>
        <div class='keyframe-code' data-type='code'>
          <pre>${keyframe.toString().trim()}</pre>
        </div>        
      </div>
    `
  }

  [CLICK('$keyframeList .keyframe-item .title .group button[data-type]')] (e) {
    var $keyframeItem = e.$delegateTarget.closest('keyframe-item');
    var index  = +$keyframeItem.attr('data-index');
    var type = e.$delegateTarget.attr('data-type');

    var current = editor.selection.currentProject;
    if (!current) return;

    var currentKeyframe = current.keyframes[index];

    if (currentKeyframe) {
      currentKeyframe.reset({
        selectedType: type
      });
    }

    $keyframeItem.attr('data-selected-value', type)

  }

  [CLICK('$keyframeList .keyframe-item .offset-list')] (e) {
    var index  = +e.$delegateTarget.closest('keyframe-item').attr('data-index');

    var current = editor.selection.currentProject;
    if (!current) return;


    this.viewKeyframePicker(index);

  }

  [CLICK('$keyframeList .del') + PREVENT] (e) {
    var removeIndex = e.$delegateTarget.attr("data-index");
    var current = editor.selection.currentProject;
    if (!current) return;

    current.removeKeyframe(removeIndex);

    this.emit('refreshStyleView', current);

    this.refresh();
  }

  [EVENT('refreshSelection') + DEBOUNCE(100)] () {
    this.refreshShowIsNot('project');
  }


  [LOAD("$keyframeList")]() {
    var current = editor.selection.currentProject;

    if (!current) return '';

    var keyframes = current.keyframe ? Keyframe.parseStyle(current) : current.keyframes;

    current.keyframe = ''
    current.keyframes = keyframes;

    return keyframes.map((keyframe, index) => {
      return this.makeKeyframeTemplate(keyframe, index);
    });
  }

  [CLICK("$add")]() {

    var current = editor.selection.currentProject;
    if (current) {
      current.createKeyframe();
      this.refresh();
      this.emit('refreshStyleView', current, true);
    } else {
      alert('Please select a project.')
    }

  }

  viewKeyframePicker(index) {
    if (typeof this.selectedIndex === "number") {
      this.selectItem(this.selectedIndex, false);
    }

    this.selectedIndex = +index;
    this.selectItem(this.selectedIndex, true);
    this.current = editor.selection.currentProject;

    if (!this.current) return;
    this.currentKeyframe = this.current.keyframes[
      this.selectedIndex
    ];

    this.viewKeyframePropertyPopup();
  }


  
  selectItem(selectedIndex, isSelected = true) {
    if (isSelected) {
      this.getRef('$keyframeIndex', selectedIndex).addClass("selected");
    } else {
      this.getRef('$keyframeIndex', selectedIndex).removeClass("selected");
    }

    if (this.current) {
      this.current.keyframes.forEach((it, index) => {
        it.selected = index === selectedIndex;
      });
    }
  }  

  viewKeyframePropertyPopup(position) {
    this.current = editor.selection.currentProject;

    if (!this.current) return;
    this.currentKeyframe = this.current.keyframes[
      this.selectedIndex
    ];

    const back = this.currentKeyframe;

    const name = back.name
    const offsets = back.offsets

    this.emit("showKeyframePopup", {
      position,
      name, 
      offsets
    });
  }

  [EVENT('changeKeyframePopup')] (data) {
    var project = editor.selection.currentProject;

    if (!project) return;
    this.currentKeyframe = project.keyframes[
      this.selectedIndex
    ];

    if (this.currentKeyframe) {
      this.currentKeyframe.reset(data);
    }

    this.refresh();
    this.emit('refreshStyleView', project);
  }

}
