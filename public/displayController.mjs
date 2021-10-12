import Tree from "./tree.mjs";

// Executes display during construction, and then update, which is eager.
export default class DisplayController extends Tree {
  model() { return null; }
  display() { return ''; }
  update() { return this.children; }

  constructor(options) {
    super(options);
    this.display;
    Promise.resolve().then(_ => this.update);
  }
  // FIXME: Can't this be done by assigning the model?
  adopt(model) { this.resetDisplay(); this.model = model; return model; }
  resetDisplay() { let old = this.display; this.display = undefined; return old; }
}
DisplayController.register({
  ownEagerProperties: ['update'],
  nonRules: ['constructor', 'resetDisplay', 'adopt']
});
