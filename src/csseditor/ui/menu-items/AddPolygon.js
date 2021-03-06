import MenuItem from "./MenuItem";
import icon from "../icon/icon";
 
export default class AddPolygon extends MenuItem {
  getIconString() {
    return icon.polygon;
  }
  getTitle() {
    return this.props.title || "Polygon";
  }

  isHideTitle() {
    return true; 
  }  

  clickButton(e) {
    this.emit('add.polygon');
  }

}
