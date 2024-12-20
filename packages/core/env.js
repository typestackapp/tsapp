"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeserver = exports.sftp = exports.rabbitmq = exports.mongo = exports.certbot = exports.haproxy = exports.tsapp = void 0;
const env_1 = require("@typestackapp/cli/common/env");
exports.tsapp = new env_1.ENV({
    TSAPP_ENV_TYPE: env_1.zod.string(),
    TSAPP_PORT: env_1.zod.string(),
    TSAPP_IP: env_1.zod.string().ip(),
    TSAPP_VOLUME: env_1.zod.string().default('["../:/tsapp/"]'),
    TSAPP_SUBNET: env_1.zod.string(),
    TSAPP_TIME_ZONE: env_1.zod.string(),
    TSAPP_DOMAIN_NAME: env_1.zod.string(),
    TSAPP_INIT_PSW: env_1.zod.string(),
    TSAPP_INIT_EMAIL: env_1.zod.string().email(),
    TSAPP_RCS: env_1.zod.string().default("").optional(),
    TSAPP_NEXT_PORT: env_1.zod.string().default("8010").optional(),
    TSAPP_API_PORT: env_1.zod.string().default("8011").optional(),
    TSAPP_GRAPHQL_PORT: env_1.zod.string().default("8013").optional(),
}, {
    TSAPP_ENV_TYPE: "dev",
    TSAPP_PORT: "8000",
    TSAPP_IP: "10.44.44.44",
    TSAPP_VOLUME: '["../:/tsapp/"]',
    TSAPP_SUBNET: "10.44.44.0/24",
    TSAPP_TIME_ZONE: "UTC",
    TSAPP_DOMAIN_NAME: "localhost",
    TSAPP_INIT_PSW: "root-psw",
    TSAPP_INIT_EMAIL: "test@test.com",
    TSAPP_RCS: "",
    TSAPP_NEXT_PORT: "8010",
    TSAPP_API_PORT: "8011",
    TSAPP_GRAPHQL_PORT: "8013"
}, {
    default: true,
});
exports.haproxy = new env_1.ENV({
    HAPROXY_IP: env_1.zod.string().ip(),
    HAPROXY_PORT: env_1.zod.string(),
    HAPROXY_STATS_AUTH: env_1.zod.string(),
    HAPROXY_TSAPP_PORT: env_1.zod.string(),
    HAPROXY_MAXCONN: env_1.zod.string()
}, {
    HAPROXY_IP: "10.44.44.41",
    HAPROXY_PORT: '["7443:443", "7444:9003", "7445:8404"]',
    HAPROXY_STATS_AUTH: "haproxy:root-psw",
    HAPROXY_TSAPP_PORT: "7443",
    HAPROXY_MAXCONN: "2048"
}, {
    default: true,
});
exports.certbot = new env_1.ENV({
    CERTBOT_IP: env_1.zod.string().ip(),
    CERTBOT_PORT: env_1.zod.string(),
    CERTBOT_SELFSIGNED: env_1.zod.coerce.boolean().default(false).optional(),
    CERTBOT_INIT: env_1.zod.coerce.boolean().default(false).optional(),
    CERTBOT_RESTART_TIME: env_1.zod.string().default("12h").optional(), // [12s, 12h]
    CERTBOT_EXTRA_DOMAIN_NAMES: env_1.zod.string().default("").optional(), // -d a.foo.com -d *.bar.com
    CERTBOT_EMAIL: env_1.zod.string().email(),
}, {
    CERTBOT_IP: "10.44.44.40",
    CERTBOT_PORT: "80",
    CERTBOT_SELFSIGNED: true,
    CERTBOT_INIT: false,
    CERTBOT_RESTART_TIME: "12h",
    CERTBOT_EXTRA_DOMAIN_NAMES: "",
    CERTBOT_EMAIL: "test@test.com"
}, {
    default: true,
});
exports.mongo = new env_1.ENV({
    MONGO_PORT: env_1.zod.string(),
    MONGO_IP: env_1.zod.string().ip(),
    MONGO_INITDB_NAME: env_1.zod.string(),
    MONGO_INITDB_ROOT_USERNAME: env_1.zod.string(),
    MONGO_INITDB_ROOT_PASSWORD: env_1.zod.string(),
    MONGO_KEY_PATH: env_1.zod.string(),
    MONGO_DB_PATH: env_1.zod.string(),
    MONGO_BIND_IP: env_1.zod.string().ip(),
}, {
    MONGO_PORT: "27017",
    MONGO_IP: "10.44.44.43",
    MONGO_INITDB_NAME: "tsapp",
    MONGO_INITDB_ROOT_USERNAME: "root",
    MONGO_INITDB_ROOT_PASSWORD: "root-psw",
    MONGO_KEY_PATH: "/configs/mongo/mongo.key",
    MONGO_DB_PATH: "/data/db/",
    MONGO_BIND_IP: "0.0.0.0"
});
exports.rabbitmq = new env_1.ENV({
    RABBITMQ_PORT: env_1.zod.string(),
    RABBITMQ_IP: env_1.zod.string().ip(),
    RABBITMQ_DEFAULT_USER: env_1.zod.string(),
    RABBITMQ_DEFAULT_PASS: env_1.zod.string(),
}, {
    RABBITMQ_PORT: "7444",
    RABBITMQ_IP: "10.44.44.42",
    RABBITMQ_DEFAULT_USER: "root",
    RABBITMQ_DEFAULT_PASS: "root-psw",
});
exports.sftp = new env_1.ENV({
    SFTP_PORT: env_1.zod.string().default("22"),
    SFTP_IP: env_1.zod.string().ip().default("10.44.44.46"),
}, {
    SFTP_PORT: "22",
    SFTP_IP: "10.44.44.46"
});
exports.codeserver = new env_1.ENV({
    CODESERVER_PORT: env_1.zod.string().default("8015"),
    CODESERVER_IP: env_1.zod.string().ip().default("10.44.44.47"),
    CODESERVER_PASSWORD: env_1.zod.string().default("root-psw"),
    CODESERVER_HASHED_PASSWORD: env_1.zod.string().default(""),
    CODESERVER_SUDO_PASSWORD: env_1.zod.string().default("root-psw"),
    CODESERVER_SUDO_PASSWORD_HASH: env_1.zod.string().default(""),
    CODESERVER_PROXY_DOMAIN: env_1.zod.string().default("codeserver"),
    CODESERVER_DEFAULT_WORKSPACE: env_1.zod.string().default("/tsapp/"),
}, {
    CODESERVER_PORT: "8015",
    CODESERVER_IP: "10.44.44.47",
    CODESERVER_PASSWORD: "root-psw",
    CODESERVER_HASHED_PASSWORD: "",
    CODESERVER_SUDO_PASSWORD: "root-psw",
    CODESERVER_SUDO_PASSWORD_HASH: "",
    CODESERVER_PROXY_DOMAIN: "codeserver",
    CODESERVER_DEFAULT_WORKSPACE: "/tsapp/"
});
//# sourceMappingURL=env.js.map