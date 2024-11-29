"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wireguard = void 0;
const env_1 = require("@typestackapp/cli/common/env");
exports.wireguard = new env_1.ENV({
    WIREGUARD_PORT: env_1.zod.string().default("51820"),
    WIREGUARD_SERVERURL: env_1.zod.string().default("auto"),
    WIREGUARD_PEERS: env_1.zod.coerce.number().int().default(50),
    WIREGUARD_PEERDNS: env_1.zod.string().ip().default("1.1.1.1"),
    WIREGUARD_ALLOWEDIPS: env_1.zod.string().default("10.44.44.0/24"),
    WIREGUARD_INTERNAL_SUBNET: env_1.zod.string().ip().default("10.10.1.0")
}, {
    WIREGUARD_PORT: "51820",
    WIREGUARD_SERVERURL: "auto",
    WIREGUARD_PEERS: 50,
    WIREGUARD_PEERDNS: "1.1.1.1",
    WIREGUARD_ALLOWEDIPS: "10.44.44.0/24",
    WIREGUARD_INTERNAL_SUBNET: "10.10.1.0"
});
//# sourceMappingURL=env.js.map