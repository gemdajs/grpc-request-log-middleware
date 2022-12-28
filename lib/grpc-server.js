const grpc = require('@grpc/grpc-js');
const {BaseInterceptingCall} = require('./server-interceptor');

const middleware = require("./middleware.js")

class GrpcServer extends grpc.Server {
  interceptors = [];

  constructor(options) {
    super(options);
    if (!options.interceptors) {
      options.interceptors = []
    }

    options.interceptors.push(middleware)

    this.interceptors = options.interceptors;
  }

  addService(
    service, implementation) {
    const interceptedImplementation = Object.entries(implementation).reduce(
      (prev, [name, handler]) => {
        const interceptedHandler = (
          call,
          callback,
        ) => {
          const interceptedCallback = (...args) => {
            const [status, value, ...rest] = args;
            const response = {
              status,
              value,
            };
            this.getInterceptingCall(
              call,
              callback,
              handler,
            ).startOnSendMessage(response);

            callback(response.status, response.value, ...rest);
          };

          this.getInterceptingCall(
            call,
            interceptedCallback,
            handler,
          ).startOnReceiveMessage(call.request);
        };

        return {
          ...prev,
          [name]: interceptedHandler,
        };
      },
      {},
    );

    super.addService(service, interceptedImplementation);
  }

  getInterceptingCall(
    call,
    callback,
    handler,
  ) {
    const getCall = this.interceptors.reduceRight(
      (nextServerCall, nextInterceptor) => {
        return (currentCall) => nextInterceptor(currentCall, nextServerCall);
      },
      (finalCall) => new BaseInterceptingCall(finalCall, callback, handler),
    );

    return getCall(call);
  }
}

module.exports = GrpcServer;
