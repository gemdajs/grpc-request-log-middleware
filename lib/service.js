
const PROTO_PATH = __dirname + "/log.proto";

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const def = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

const RequestLogService = grpc.loadPackageDefinition(def).request_log.RequestLogService;
const service = new RequestLogService(
    process.env.LOG_MS_SERVER_URL,
    grpc.credentials.createInsecure()
);

module.exports = {
    requestLoggerService: service
};
