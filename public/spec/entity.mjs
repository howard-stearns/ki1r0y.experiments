/*

  From the top down: Here we give you a feel for the way Ki1r0y views the world - without much about the why or how. Although the vocabulary is used in a specific way here, don't worry about the precise meaning just yet. 

  Ki1r0y lets you directly interact with a huge variety of things: roughly all of the "nouns" that you can see - the people, places, and things.
    Things are specific objects with their own identity: change even one bit (pun intended!) and they are a different thing. Things can be grouped into assemblies of other things.
    A place is something that retains its identity even as it is changed from one version to another. Places and things can also be grouped into a larger place.
  A composition is a big place that can be visited at a URL in the address bar. As the place changes, everone visiting that same composition sees the same changes together.
  The people visiting are also shown, as avatars, and you can interact with them, too. A person also retains its identity as it is changed, but you can only change your own data, and not that of other people.

  All of these people, places, and things are called entities. An entity is just a container for components that each perform some specific named role for that entity:
    A model, which is a set of properties that are automatically synchronized identically among all the users visiting the composition.
    Some named views, where each view component describes one way to display the subject entity.
    Some named actions, where each action component describes how do to one particular thing on the subject entity when asked to perform that action.

  Now, don't freak out, but the view and action components are themselves entities, which means they each have their own model, views, and actions. This is what let's you create a new way to display some content, or change how an entity responds to some action. This is how people can comment on any place or thing, or share code on social media. It's all just content of one kind or another. But there are three reasons that you don't need to go mind-tripping into some infinite loop about how this can possibly work:
  1. Ki1r0y isn't completely "turtles all the way down". For example, the user doesn't have direct access to the computer chips that run the software, the transistors on those chips, or the subatomic particles that interact with each other to make the transistors work.
  2. Within the models, some of the values are not Ki1r0y objects. Some are just numbers or text, and some are closed-off media that cannot be interacted with like Ki1r0y entities. For example, when you drag a .jpeg image around in Ki1r0y, you're really dragging a view entity whose synchronized model includes the current position (numbers) and whose subject is an entity that wraps the media.
  3. Ki1r0y is very lazy: it doesn't create any entities or execute any code until it needs to. For example, that image's view component is an entity that has a highlight action. But that same particular way to do the highlight action is also an entity that you should be able to drag around the screen and add to another entity. So that particular way of doing a highlight should have its own actions to grab it, or indeed to highlight it. But being lazy, ki1r0y does not create those action's until they are actually needed.

Finally, Ki1r0y makes a lot of use of properties and values. For example, you can always inspect any entity, and see the names of the properties in its model, and their values. You can change these values in the inspector (and they will change for everyone in the same composition). But instead of supplying a specific value interactively, a default value can be defined by a bit of code called a rule. In the inspector you can reset a value to let it be defined by the rule, and you can change the rule. Would you be suprised to learn that the rule is just another entity?

      
----------    

All of these entity role values (also called components) have a rule called 'entity' whose value is the entity to which they are attached:
    A view is an an object with a 'display' rule, serving as the value of an entity role. 
      For example, a model of text might define a role 'main' whose value is something that knows how to display text.
    An action is an object with a 'fire' rule.

  A component is an object with rules:
    A view component (or simply, "view") is itself another entity: [[is it? maybe we generate an entity on the fly when a component lives on its own?....]]
       The view entity has a role named 'entity' whose value is the entity that this view is attached to.
       A display view is one that has a visual appearance, specified by the rule named 'display'.
       An action is a view that has...
    A model component (or simply, "model") is conceptually an ordinary object (not itself an entity), 
      whose role is "model". (In fact, it is a Proxy, as specified below.)
      Every entity has exactly one role named 'model'.

  A component may have rule named 'role', whose string value is the default role name when added to a an entity.
  [[Explain on-demand roles, specs, and serialization]]
  We avoid being circular through the lazy evaluation of rules, prototype inheritance of rule definitions, and by models not being entities.

  invoking actions...
  dispatch:
     within views
     within models: 
        models should not be able to see views
        models should be able to invoke actions, dispatching up through the model ancestors to find the given role. 
          So INTERNAL DISPATCH mechanism must be able to see actions.
          OR... model actions are a slightly different beast, that are directly visible within models (and dispatchable from a view through the model).
              If the object-valued rules of models are ordinary objects, we'll have to create entities on the fly for dragging around?x`
  
  model proxy...

  
*/
import Registerable from "../registerable.mjs";
import Entity from "../entity.mjs";
window.Entity = Entity; window.Registerable = Registerable; // fixme remove

describe('Entity', function () {
  class SomeModel extends Registerable {
    simpleRule() { return 42; }
    a() { return 17; }
    b() { return this.a; }
    c() { return this.b; }
    promise() { return Promise.resolve(this.simpleRule); }
    usePromise() { return this.promise; }
  }
  SomeModel.register();
  class ViewUsesEntity extends Registerable {
    entity() { return null; }
    d() { return this.entity && this.entity.model.c; }
    e() { return this.d; }
    usePromise() { return this.entity && this.entity.model.usePromise; }
  }
  ViewUsesEntity.register();
  class OtherViewUsesEntity extends Registerable {
    entity() { return null; }
    d() { return this.entity ? (1 + this.entity.model.c) : 0; }
    e() { return 1 + this.d; }
    usePromise() { return 1 + this.entity.model.usePromise; }
  }
  OtherViewUsesEntity.register();
  
  let model, entity, component, component2;
  beforeEach(function () {
    model = new SomeModel();
    entity = new Entity({model});
    component = new ViewUsesEntity();
    component2 = new OtherViewUsesEntity();
  });

  describe('model', function () {
    describe('reference', function () {
      // Note: You cannot deliberately test whether an object is a Proxy. (You can infer by asking it do things that a proxy cannot do....)
      // So we do not define a test here to prove that entity.model is a Proxy.
      it('can be used to read a model rule.', function () {
        expect(entity.model.simpleRule).toBe(model.simpleRule);
      });
      it('tracks dependencies within model.', function () {
        expect(entity.model.c).toBe(17);
        model.a = 33;
        expect(entity.model.c).toBe(33);
      });
      it('automatically awaits promises within the model (but non-rule code has to await).', async function () {
        expect(await entity.model.usePromise).toBe(42);
      });
      describe('consumer', function () {
        beforeEach(function () {
          entity.attachComponent(component, 'test');
        });
        it('tracks dependencies across entities.', function () {
          expect(component.e).toBe(17);
          model.a = 33;
          expect(component.e).toBe(33);
        });
        it('automatically awaits promises across the entities.', async function () {
          expect(await component.usePromise).toBe(42);
        });
        xit('FIXME assignment to the other entity model go through the reflect action.', function () {
        });
      });
    });
  });

  describe('component', function () {
    it('can define role as the component is added.', function () {
      let roleName = 'rumpelstiltskin';
      expect(entity.attachComponent(component, roleName)).toBe(entity);
      expect(entity[roleName]).toBe(component);
      expect(component.entity).toBe(entity);
    });
    it('tracks dependencies as components change.', async function () {
      let roleName = 'foo';
      entity.attachComponent(component, roleName);
      expect(component.e).toBe(17);
      expect(await component.usePromise).toBe(42);

      // Set up some values that will be cleared when we change the entity.
      component2.entity = {model: {c: 0}};
      expect(component2.e).toBe(2);

      entity.attachComponent(component2, roleName);
      expect(component2.e).toBe(19);
      expect(await component2.usePromise).toBe(43);

      expect(component.entity).toBeFalsy();
      expect(component.e).toBeFalsy();
      expect(await component.usePromise).toBeFalsy();
    });
  });

  describe('Action', function () {
    describe('on model from within model', function () {
      it('can be invoked.', function () {
      });
      it('inherits up the model tree.', function () {
      });
    });
    describe('on model from within view', function () {
      it('can be invoked.', function () {
      });
      it('inherits up the model tree.', function () {
      });
    });
    describe('on view from within view', function () {
      it('can be invoked.', function () {
      });
      it('inherits up the model tree.', function () {
      });
    });
    describe('cannot be invoked on view within model.', function () {
    });
  });
});
