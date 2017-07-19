exports.LatestContext = class LatestContext {
  constructor() {
    this.context = {};
  }
  setContext(context) {
    this.context = context;
  }
  getContext() {
    return this.context;
  }
};
