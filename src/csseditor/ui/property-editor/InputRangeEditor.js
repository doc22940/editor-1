import UIElement, { EVENT } from "../../../util/UIElement";
import { Length } from "../../../editor/unit/Length";
import { LOAD, INPUT, CLICK, FOCUS, BLUR } from "../../../util/Event";
import icon from "../icon/icon";
import SelectEditor from "./SelectEditor";
import { OBJECT_TO_CLASS, OBJECT_TO_PROPERTY } from "../../../util/functions/func";

export default class InputRangeEditor extends UIElement {

    components() {
        return {
            SelectEditor
        }
    }

    initState() {
        var units = this.props.units || 'px,em,%';
        var value = Length.parse(this.props.value || Length.px(0));
        return {
            removable: this.props.removable === 'true',
            calc:  this.props.calc === 'true'  ? true : false,
            label: this.props.label || '',
            min: +this.props.min || 0,
            max: +this.props.max || 100,
            step: +this.props.step || 1,
            key: this.props.key,
            params: this.props.params || '',
            layout: this.props.layout || '',
            units,
            type: (value.unit === 'calc' || value.unit === 'var') ? 'calc' : 'range',
            value
        }
    }

    template () {
        return `<div class='small-editor' ref='$body'></div>`
    }

    [LOAD('$body')] () {

        var { min, max, step, label, calc, type, removable, layout } = this.state

        var value = +this.state.value.value.toString()

        if (isNaN(value)) {
            value = 0
        }

        var layoutClass = layout;

        var realValue = (+value).toString();

        return /*html*/`
        <div ${OBJECT_TO_PROPERTY({
            'data-selected-type': type,
            'ref': '$range',
            'class': OBJECT_TO_CLASS({
                'input-range-editor': true,
                'has-label': !!label,
                'has-calc': calc,
                'is-removable': removable,
                [layoutClass] : true 
            })
        })}>
            ${label ? `<label>${label}</label>` : '' }
            <div class='range-editor-type' data-type='range'>
                <div class='area'>
                    <input type='number' ref='$propertyNumber' value="${realValue}" min="${min}" max="${max}" step="${step}" />
                    
                    <SelectEditor ref='$unit' key='unit' value="${this.state.selectedUnit || this.state.value.unit}" options="${this.state.units}" onchange='changeUnit' />
                    
                </div>
            </div>
            <button type='button' class='remove' ref='$remove' title='Remove'>${icon.remove}</button>
        </div>
    `
    }

    getValue() {
        return this.state.value.clone(); 
    }

    setValue (value) {
        this.setState({
            value: Length.parse(value)
        })
    }

    [FOCUS('$propertyNumber')] (e) {
        this.refs.$range.addClass('focused');
    }

    [BLUR('$propertyNumber')] (e) {
        this.refs.$range.removeClass('focused');
    }


    [CLICK('$remove')] (e) {
        this.updateData({
            value: ''
        })
    }

    updateData (data) {
        this.setState(data, false)
        this.parent.trigger(this.props.onchange, this.props.key, this.state.value, this.props.params)
    }

    initValue () {
        if (this.state.value == '') {
            this.state.value = new Length(0, this.children.$unit.getValue())
        }   
    }

    [INPUT('$propertyNumber')] (e) {

        var value = +this.getRef('$propertyNumber').value; 
        
        this.initValue()

        this.updateData({ 
            value: new Length(value, this.children.$unit.getValue())
        });
    }

    [EVENT('changeUnit')] (key, value) {

        this.initValue();

        this.updateData({
            value: this.state.value.toUnit(value)
        })
    }

    [EVENT('changeVarType')] (key, unit) {
        this.updateData({
            value: new Length(this.refs.$calc.value, unit)
        })
    }
}