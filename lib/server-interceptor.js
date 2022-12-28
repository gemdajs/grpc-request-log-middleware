exports.ServerInterceptingCall = exports.BaseInterceptingCall = void 0;
const BaseInterceptingCall = /** @class */ (function () {
  function BaseInterceptingCall(call, callback, handler) {
    this.call = call;
    this.callback = callback;
    this.handler = handler;
  }
  BaseInterceptingCall.prototype.startOnReceiveMessage = function () {
    this.handler(this.call, this.callback);
  };
  BaseInterceptingCall.prototype.startOnSendMessage = function (response) {
    return response;
  };
  return BaseInterceptingCall;
}());

const ServerInterceptingCall = /** @class */ (function () {
  function ServerInterceptingCall(nextCall, config) {
    this.nextCall = nextCall;
    this.config = config;
  }
  ServerInterceptingCall.prototype.startOnSendMessage = function (response) {
    const _this = this;
    this.config.onSendMessage(response, function (rsp) {
      _this.nextCall.startOnSendMessage(rsp);
    });
  };
  ServerInterceptingCall.prototype.startOnReceiveMessage = function (message) {
    const _this = this;
    this.config.onReceiveMessage(message, function (msg) {
      _this.nextCall.startOnReceiveMessage(msg);
    });
  };
  return ServerInterceptingCall;
}());

module.exports = {
  ServerInterceptingCall, BaseInterceptingCall
}
