exports.LatestMessage = class LatestMessage {
  constructor() {
    this.message = '';
    this.previousMessage = '';
  }
  setMessage(string) {
    this.previousMessage = this.message;
    this.message = string;
  }
  getMessage() {
    return this.message;
  }
};
