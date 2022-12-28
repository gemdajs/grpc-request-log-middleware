const {ServerInterceptingCall} = require("./server-interceptor");

const interceptor = (call, nextCall) => {

    if (!call.requestTime) {
        call.requestTime = new Date()
    }

    return new ServerInterceptingCall(nextCall(call), {
        // This is called on every incoming client request before sent to the original handler
        onReceiveMessage: (message, next) => {
            next(message);
        },
        // This is called on every outgoing server response before it is sent to the client
        onSendMessage: async (response, next) => {
            const data = {
                request: call.request,
                response,
                responseTime: new Date(),
                requestTime: call.requestTime,
                metadata: call.metadata
            };
            next(response);

            await logRequestData(data)
        },
    });
}



const {requestLoggerService} = require("./service.js")

const logRequestData = async (data) => {
    try {
        if (!data || typeof data !== "object") {
            console.log(data)
            return;
        }

        data.logKey = process.env.LOG_MS_KEY || ""
        data.logSecret = process.env.LOG_MS_SECRET || ""
        data.callType = "RPC"

        data = JSON.stringify(data)

        console.log(data)

        requestLoggerService.log({data}, (err, data) => {
            console.log(data, err)
        });
    } catch (e) {
        console.log(e);
    }
}

module.exports = interceptor