import { ENV, zod } from "@typestackapp/cli/common/env"

export const tsapp = new ENV(
    {
        TSAPP_ENV_TYPE: zod.string(),
        TSAPP_PORT: zod.string(),
        TSAPP_IP: zod.string().ip(),
        TSAPP_SUBNET: zod.string(),
        TSAPP_TIME_ZONE: zod.string(),
        TSAPP_ENV_FILE: zod.string(),
        TSAPP_DOMAIN_NAME: zod.string(),
        TSAPP_INIT_PSW: zod.string(),
        TSAPP_INIT_EMAIL: zod.string().email(),
        TSAPP_RCS: zod.string().default("").optional(),
        TSAPP_NEXT_PORT: zod.string().default("8010").optional(),
        TSAPP_API_PORT: zod.string().default("8011").optional(),
        TSAPP_GRAPHQL_PORT: zod.string().default("8013").optional(),
    },
    {
        TSAPP_ENV_TYPE: "dev",
        TSAPP_PORT: "8000",
        TSAPP_IP: "10.44.44.44",
        TSAPP_SUBNET: "10.44.44.0/24",
        TSAPP_TIME_ZONE: "UTC",
        TSAPP_ENV_FILE: "../example.env",
        TSAPP_DOMAIN_NAME: "localhost",
        TSAPP_INIT_PSW: "root-psw",
        TSAPP_INIT_EMAIL: "test@test.com",
        TSAPP_RCS: "",
        TSAPP_NEXT_PORT: "8010",
        TSAPP_API_PORT: "8011",
        TSAPP_GRAPHQL_PORT: "8013"
    },
    {
        default: true,
    }
)

export const haproxy = new ENV(
    {
        HAPROXY_IP: zod.string().ip(),
        HAPROXY_PORT: zod.string(),
        HAPROXY_STATS_AUTH: zod.string(),
        HAPROXY_TSAPP_PORT: zod.string(),
    },
    {
        HAPROXY_IP: "10.44.44.41",
        HAPROXY_PORT: '["7443:443", "7444:9003", "7445:8404"]',
        HAPROXY_STATS_AUTH: "haproxy:root-psw",
        HAPROXY_TSAPP_PORT: "7443",
    },
    {
        default: true,
    }
)

export const certbot = new ENV(
    {
        CERTBOT_IP: zod.string().ip(),
        CERTBOT_PORT: zod.string(),
        CERTBOT_SELFSIGNED: zod.coerce.boolean().default(false).optional(),
        CERTBOT_INIT: zod.coerce.boolean().default(false).optional(),
        CERTBOT_RESTART_TIME: zod.string().default("12h").optional(), // [12s, 12h]
        CERTBOT_EXTRA_DOMAIN_NAMES: zod.string().default("").optional(), // -d a.foo.com -d *.bar.com
        CERTBOT_EMAIL: zod.string().email(),
    },
    {
        CERTBOT_IP: "10.44.44.40",
        CERTBOT_PORT: "80",
        CERTBOT_SELFSIGNED: true,
        CERTBOT_INIT: false,
        CERTBOT_RESTART_TIME: "12h",
        CERTBOT_EXTRA_DOMAIN_NAMES: "",
        CERTBOT_EMAIL: "test@test.com"
    }
)

export const mongo = new ENV(
    {
        MONGO_PORT: zod.string(),
        MONGO_IP: zod.string().ip(),
        MONGO_INITDB_NAME: zod.string(),
        MONGO_INITDB_ROOT_USERNAME: zod.string(),
        MONGO_INITDB_ROOT_PASSWORD: zod.string(),
        MONGO_KEY_PATH: zod.string(),
        MONGO_DB_PATH: zod.string(),
        MONGO_BIND_IP: zod.string().ip(),
    },
    {
        MONGO_PORT: "27017",
        MONGO_IP: "10.44.44.43",
        MONGO_INITDB_NAME: "tsapp",
        MONGO_INITDB_ROOT_USERNAME: "root",
        MONGO_INITDB_ROOT_PASSWORD: "root-psw",
        MONGO_KEY_PATH: "/configs/mongo/mongo.key",
        MONGO_DB_PATH: "/data/db/",
        MONGO_BIND_IP: "0.0.0.0"
    }
)

export const rabbitmq = new ENV(
    {
        RABBITMQ_PORT: zod.string(),
        RABBITMQ_IP: zod.string().ip(),
        RABBITMQ_DEFAULT_USER: zod.string(),
        RABBITMQ_DEFAULT_PASS: zod.string(),
    }, 
    {
        RABBITMQ_PORT: "7444",
        RABBITMQ_IP: "10.44.44.42",
        RABBITMQ_DEFAULT_USER: "root",
        RABBITMQ_DEFAULT_PASS: "root-psw",
    }
)

export const sftp = new ENV(
    {
        SFTP_PORT: zod.string().default("22"),
        SFTP_IP: zod.string().ip().default("10.44.44.46"),
    },
    {
        SFTP_PORT: "22",
        SFTP_IP: "10.44.44.46"
    }
)

export const wireguard = new ENV(
    {
        WIREGUARD_PORT: zod.string().default("51820"),
        WIREGUARD_IP: zod.string().ip().default("10.44.44.45"),
        WIREGUARD_SERVERURL: zod.string().default("auto"),
        WIREGUARD_PEERS: zod.coerce.number().int().default(50),
        WIREGUARD_PEERDNS: zod.string().ip().default("1.1.1.1"),
        WIREGUARD_ALLOWEDIPS: zod.string().default("10.44.44.0/24"),
        WIREGUARD_INTERNAL_SUBNET: zod.string().ip().default("10.10.1.0")
    },
    {
        WIREGUARD_PORT: "51820",
        WIREGUARD_IP: "10.44.44.45",
        WIREGUARD_SERVERURL: "auto",
        WIREGUARD_PEERS: 50,
        WIREGUARD_PEERDNS: "1.1.1.1",
        WIREGUARD_ALLOWEDIPS: "10.44.44.0/24",
        WIREGUARD_INTERNAL_SUBNET: "10.10.1.0"
    }
)

export const codeserver = new ENV(
    {
        CODESERVER_PORT: zod.string().default("8015"),
        CODESERVER_IP: zod.string().ip().default("10.44.44.47"),
        CODESERVER_PASSWORD: zod.string().default("root-psw"),
        CODESERVER_HASHED_PASSWORD: zod.string().default(""),
        CODESERVER_SUDO_PASSWORD: zod.string().default("root-psw"),
        CODESERVER_SUDO_PASSWORD_HASH: zod.string().default(""),
        CODESERVER_PROXY_DOMAIN: zod.string().default("codeserver"),
        CODESERVER_DEFAULT_WORKSPACE: zod.string().default("/tsapp/"),
    },
    {
        CODESERVER_PORT: "8015",
        CODESERVER_IP: "10.44.44.47",
        CODESERVER_PASSWORD: "root-psw",
        CODESERVER_HASHED_PASSWORD: "",
        CODESERVER_SUDO_PASSWORD: "root-psw",
        CODESERVER_SUDO_PASSWORD_HASH: "",
        CODESERVER_PROXY_DOMAIN: "codeserver",
        CODESERVER_DEFAULT_WORKSPACE: "/tsapp/"
    }
)