import Entity from './entity.mjs';
import Tree from './tree.mjs';
import Registerable from "./registerable.mjs";

import { DomElement } from './dom.mjs';
class List extends DomElement { // Mostly cribbed from mdc.mjs
  text() {
    return this.model ? this.model.text : '';
  }
  elementTag() {
    return this.text ? 'li' : 'ul';
  }
  childContainerTag() {
    return (this.text && this.mirrors.length) ? 'ul' : '';
  }
  groupFormatting() { // The className for a 'ul' element, if any, on which li style will be built.
    return (this.parent && this.parent.groupFormatting) || '';
  }
  elementFormatting() {
    if (!this.groupFormatting) return '';
    if (!this.text) return this.groupFormatting;
    return this.groupFormatting + '-item';
  }
  labelDisplay() {
    if (!this.groupFormatting) return this.display;
    let label = this.createDisplay('span', this.elementFormatting + '__text');
    this.display.append(label);
    return label;
  }
  display() {
    let display = super.__display();
    if (this.text && this.groupFormatting) {
      let ripple = this.createDisplay('span', 'mdc-list-item__ripple');
      display.append(ripple);
      this.ripple = new MDCRipple(display);
    }
    //this.list = new MDCList(display);
    return display;
  }
  mirrorClass() {
    return this.constructor;
  }
}
List.register({nonRules: ['constructor', 'createDisplay', 'attachTo']});

class Action extends Registerable {}
class NoteClick extends Action {
  handleEvent(event) {
    console.log(event.type, event.target, Entity.for(event.target));
  }
}
[Action, NoteClick].forEach(c => c.register({nonRules: ['constructor', 'handleEvent']}));

const model = new Tree({specs: [
  {text: "first item"},
  {text: "second item", specs: [
    {text: "second item first subitem"},
    {text: "second item second subitem", specs: [
      {text: "second item second subitem first sub-subitem"},
      {text: "second item second subitem second sub-subitem"},
      {text: "second item second subitem third sub-subitem"}
    ]},
    {text: "second item third subitem"} 
  ]},
  {text: "third item"}
]});

const treeDisplay = new List({model});
//document.body.append(treeDisplay.display);
const treeEntity = new Entity({model});

treeEntity.attachComponent(treeDisplay, 'tree');
for (let [role, constructor] of Object.entries({
  click: NoteClick
})) {
  let action = new constructor();
  treeEntity.attachComponent(action, role);
  treeEntity.tree.display.addEventListener(role, action, {});
}

document.body.append(treeEntity.tree.display);
