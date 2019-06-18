import UIElement, { EVENT } from "../../../../../util/UIElement";
import ColorPickerUI from "../../../../../colorpicker/index";
import { html } from "../../../../../util/functions/func";
import { Length, Position } from "../../../../../editor/unit/Length";
import { CHANGE_EDITOR, CHANGE_SELECTION } from "../../../../types/event";

export default class ColorPicker extends UIElement {
  afterRender() {
    // this.$el.hide();

    var defaultColor = "rgba(0, 0, 0, 0)";

    this.colorPicker = ColorPickerUI.create({
      type: "sketch",
      position: "inline",
      container: this.refs.$color.el,
      color: defaultColor,
      onChange: c => {
        this.changeColor(c);
      }
    });

    setTimeout(() => {
      this.colorPicker.dispatch("initColor", defaultColor);
    }, 100);
  }

  template() {
    return html`
      <div class="fill-picker">
        <div class="picker-tab-container" ref="$tabContainer">
          <div
            class="picker-tab-content selected"
            data-content-type="color"
            ref="$color"
          ></div>
        </div>
      </div>
    `;
  }

  changeColor(color) {
    this.emit(this.changeEvent, color, this.changeData);
  }

  [EVENT("showColorPicker")](config, data) {
    this.$el
      .css({
        top: Length.px(110),
        right: Length.px(320)
      })
      .show();

    this.changeEvent = config.changeEvent;
    this.changeData = data;
    this.colorPicker.initColorWithoutChangeEvent(config.color);

    this.emit("hidePicker");
  }

  [EVENT("hidePicker", "hideColorPicker", CHANGE_EDITOR, CHANGE_SELECTION)]() {
    this.$el.hide();
  }
}
