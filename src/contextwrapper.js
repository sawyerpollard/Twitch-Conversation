exports.ContextWrapper = class ContextWrapper {
  constructor() {
    this.contexts = new Map();
  }
  setContext(username = null, context) {
    this.contexts.set(username, context);
  }
  getContext(username = null) {
    return this.contexts.get(username);
  }
};
