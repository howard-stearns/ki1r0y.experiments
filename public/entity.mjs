import { Rule } from "./@kilroy-code/rules/index.mjs";
//import Registerable from "./registerable.mjs";

/*
  mechanism to add a component to an entity
  If a role is specified (by argument or as a rule in the component), it has that name in the entity
  Otherwise, it is added as a child. (Maybe also defining a name in the entity as specified by a rule in the component?)

  specs uses this mechanism to add each component in either the specified role or as a child.

  components also have a rule named entity whose value is the entity
  the entity has a rule for each role, whose value is the component
  however the value of the model role is a proxy that passes rule reads through to the model, 
  but rule assignments are reflected over the wire. (the value of objects serialize on the wire as id, while others are serialized normally recursively)
     Is that wire reflection implemented as an action?
     is model.foo = 17  <==> model.send('foo', 17) <===> model.foo(17) ?
  
  some actions are initiated by the browser, and bubble up through the display hierarchy. E.g., the behavior might be defined within an upper container region object.
  when an action is added to a view, the event listener is set up on the display, so that browser events are handled by the action object
  code can also invoke synthetic events that bubble up the same way, through the browser's mechanism.

  some actions are initiated by code, and bubble up through the model hierarchy, rooted in the composition. ...how...? e.g., save or copy.

  an action needs access to:
  - the target entity (which for browser events is the entity whose display object is the event.target.)
  - event properties that differ from one kind of event to another, e.g., event.dataTransfer, event.preventDefault(), event.offsetX
  - a value, e.g, to toggle the highlight action on or off

  should the code that implements an action be a rule or just a method?

  rule involving a promise? but what about constraints where "second half" has to be broken up?
  sometimes (not often) we need to know when the action completed (or round-tripped in the case of a model messages).

  should it return a value? e.g., the 'copy' action. Maybe side effect the event (or event.detail) instead?

  How do we invoke an action? Should it look the same from any component, including a model?


  potential puns:
  drop view A onto view B 
    invokes B's 'add' action (B.add.do(A))
      if A and B are general content, this invokes B's model's 'add' action (B.model.add.do(A))
         which sends the 'add' message though the reflector to all B, with A as argument
           which all B models handle by adding the A model as a child
             which causes the B view to add the A view as a DOM child
      but if B is the value display for property C in an property editor that is currently displaying model D
         B's 'add' action assigns D.model[C] = A
           which sends the C message to all D.model 
             which causes D to update the value shown
      but if A is an action????

  modelRoot
    boxA - parent:modelRoot
      boxB - parent:boxA
    boxC - parent:boxC

  appRoot
    content <== everyone sees the same
      boxView
        boxView 
         boxView
        boxView
    treeView <== everyone sees the same
      node
        node
          node
        node
    inspector <== private to me
    breadcrumbs <== private to me
      parent
      selected
      child1

entityR
  model:modelRoot
  boxView: boxViewR
    subject:entityR
    model:domDivR
  treeView:
    subject:entityR
    model:interactiveNodeR 
  inspectorView: appInspector (or empty)
entityA
  model:boxB
  boxView:
    subject:entityA
    model:domDivA
  treeView:
    subject:entityA
    model:treeViewNodeA
  inspectorView: appInspector
    subject:entityA
    model:inspector
  breadcrumbView: 
    subject:entityA
    model:breadcrumbElement
app
  model:ki1r0y
  subject:entityR  <== what happens when we navigate to a new subject? all displays must change! Is the subject a composition (with a url) or content?
  boxView: appBoxView
  treeView: appTreeView
  inspectorView: appInspector
  breadcrumbView

- on assumption that entity.model is a proxy with modified access,
  what how does an action effect a view entity.model.display ??

entity is live machinery for action dispatch:
  manages dom event listeners as roles are added/removed/changed
  action event handler has access to targetEntity that corresponds to dom event.target
  when action event handler dispatches on targetEntity, it defaults/propogates to targetEntity "parent"
hack: Entity.for(domElement) => entity
      adding a component that has display, adds display => entity to the map?
      hack because it doesn't track changes, and it isn't lazy

contructor: ... who has affordances, and when???? ...
pointerdown: (on afforance entities only)
             preventDefault, stopPropagation
             capture event clientX, clientY
             capture getComputedStyle(eventTarget.model.display.parentElement) left, top
             horizontalCorner, verticalCorner (or these can be defined in eventTarget.model)
             capture adjusted eventTarget.model.display.parentElement width or height
             eventTarget.onpointermove = updatePosition (which reflects entity.MODEL.position and related assignments across the wire)
             eventTarget.setPointerCapture(event.pointerId);
pointerdown: (generally) if lastClicked !== eventTarget, set lastClicked and direction and select top non-root on path
             otherwise, select next on path in direction, reversing direction if needed
pointerup: eventTarget.model.display.onpointermove=null; eventTarget.model.display.releasePointerCapture(event.pointerId);
dragstart: targetEntity.dispatch('captureDataTransfer', event); 
           update dataTransfer.effectAllowed from bucky keys;
           stash targetEntity.MODEL.display.style and set it's opacity
dragend: restore saved targetEntity.MODEL.display.style
dragenter: targetEntity.dispatch('dragover', event); if dataTransfer.dropEffect !== 'none', 
           eventTarget.MODEL.display.classList.add('dragover')    BUT don't replicate!!!
dragleave: eventTarget.MODEL.display.classList.remove('dragover') BUT don't replicate!!!
drop: targetEntity.dispatch(dataTransfer.dropEffect, event)
dragover: if targetEntity supports what is in dataTransfer.effectAllowed, preventDefault and return dataTransfer.dropEffect=(what is supported)
          else dataTransfer.dropEffect='none',
none: no-op
captureDataTransfer: encode targetEntity as various mime types in dataTransfer
retrieveDataTransfer: get entity referred to by dataTransfer, putting result in event.details
copy: targetEntity.dispatch('retrieveData', event);
      REPLICATED copy the event.details it produces; 
      event.details.dispatch('dragEnd', event); 
      copy.dispatch('captureDataTransfer', event);
      targetEntity.dispatch('move', event);
move: targetEntity.dispatch('retrieveDataTransfer', event); 
      REPLICATED set event.details offsets from dataTransfer; 
      targetEntity.target.subject.MODEL.parent = event.details
 
examples:
- drop one treeViewNode onto another: 
  dropped content is reparented, for everyone. everything dependent on content adjusts
- adjust a main display node corner affordance: 
  content gets new input dimensions in parent (height/width/left/right), for everyone. Everything adjusts (including, e.g., in inspectors)
- adjust inspector corner affordance: 
  display of my own inspector changes style. 
- select a main display node:
  inspector, breadcrumbs, and other displays get new subject and multiple displays highlight this object for me alone, but my avatar and selection marker update for everyone
- pointer select of shared display element
  click to select highest applicable item below root. click again in same spot to move one down towards the target. after reaching target goes back up.
- select an inspector cell:
  my shared selection marker (if any) is cancelled, and my private selection marker is on this cell
- hover over a main display node: 
  that display node's halo (not the halo of the subject) shows up just for me.
- [[how do you create and use a new kind of inspector?]]

*/

export default class Entity {
  constructor({model, tree}) {
    this.model = model;
  }
  model() { return null; }
  subject() { return null; }
  attachComponent(component, role = component.role) {
    // Remove any old data related to component.
    if (component.entity) {
      component.entity[component.role] = null;
    }
    if (this[role]) { // Entity already has role. Clear it's entity.
      this[role].entity = null;
    } else { // New role for this entity. Make it a rule to track dependencies.
      Rule.attach(this, role);
    }
    // Now we can actually add it:
    component.entity = this;
    if (component.role !== role) component.role = role;
    this[role] = component;
    if (component.display) Entity.fixme.set(component.display, this);
    return this;
  }
  static for(domElement) {
    return this.fixme.get(domElement);
  }
}
Entity.fixme = new WeakMap();
//Entity.register();
Rule.rulify(Entity.prototype, {ruleNames: ['model', 'subject']});
