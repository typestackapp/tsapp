"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
describe('Test build configs', () => {
    const source = {
        "string": "string",
        "number": 1,
        "@boolean": true,
        "@array": [1, 2, 3],
        "object": {
            "string": "string",
        },
        "@object_export": {
            "@string": "string",
            "string2": "string2",
        },
        "object_deep_mod": { "obj22": { "obj33": { "@number": 1 } } },
        "object_deep_source": { "obj2": { "obj3": { "@public": 1, "remove1": {}, "remove": { "s": 1 } } } },
        "@object_empty": {},
        "@object_empty2": {},
        "object_empty3": {},
    };
    const mod = {
        "string": "string2",
        "@number": 2,
        "@boolean": false,
        "array": [4, 5, 6],
        "object": {
            "string": "string2",
        },
        "object_deep": { "@obj2": { "obj3": { "number": 1 } } },
        "object_deep_mod": { "obj22": { "obj33": { "mod_number": 2 } } },
        "object_empty2": {},
    };
    it('test 1 should have correct output after applying mod', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = {
            "string": "string2",
            "number": 2,
            "boolean": false,
            "array": [4, 5, 6],
            "object": {
                "string": "string2",
            },
            "object_export": {
                "string": "string",
                "string2": "string2",
            },
            "object_deep": { "obj2": { "obj3": { "number": 1 } } },
            "object_deep_mod": { "obj22": { "obj33": { "number": 1, "mod_number": 2 } } },
            "object_deep_source": { "obj2": { "obj3": { "public": 1, "remove1": {}, "remove": { "s": 1 } } } },
            "object_empty": {},
            "object_empty2": {},
            "object_empty3": {},
        };
        const result = (0, util_1.getConfigObj)(mod, source, false);
        // console.log(JSON.stringify(result, null, 2))
        expect(result).toEqual(expected);
    }));
    it('test 2 should have correct public output after applying mod', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = {
            "number": 2,
            "boolean": false,
            "object_export": {
                "string": "string",
                "string2": "string2",
            },
            "object_deep": { "obj2": { "obj3": { "number": 1 } } },
            "object_deep_mod": { "obj22": { "obj33": { "number": 1 } } },
            "object_deep_source": { "obj2": { "obj3": { "public": 1 } } },
            "object_empty": {},
        };
        const result = (0, util_1.getConfigObj)(mod, source, true);
        // console.log(JSON.stringify(result, null, 2))
        expect(result).toEqual(expected);
    }));
    it('test 3 should have correct public output after applying emnpty mod', () => __awaiter(void 0, void 0, void 0, function* () {
        const expected = {
            "boolean": true,
            "array": [1, 2, 3],
            "object_export": {
                "string": "string",
                "string2": "string2",
            },
            "object_deep_mod": { "obj22": { "obj33": { "number": 1 } } },
            "object_deep_source": { "obj2": { "obj3": { "public": 1 } } },
            "object_empty": {},
            "object_empty2": {},
        };
        const result = (0, util_1.getConfigObj)({}, source, true);
        // console.log(JSON.stringify(result, null, 2))
        expect(result).toEqual(expected);
    }));
    it('bug 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const source = {
            "MESSAGE_TYPES": {
                "@Email": {},
                "Sms": {},
                "Template": {},
                "Queue": {}
            }
        };
        const expected = {
            "MESSAGE_TYPES": {
                "Email": {}
            }
        };
        const result = (0, util_1.getConfigObj)({}, source, true);
        expect(result).toEqual(expected);
    }));
    it('bug 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const source = {
            "EXAMPLE": "123"
        };
        const mod = {
            "custom": {
                "captcha": {
                    "enabled": false,
                    "email": "xxxxx@xxx.com",
                    "domains": ["localhost"],
                    "@site_key": "xxxxxxx1",
                    "secret_key": "xxxxxx2"
                },
            },
            "custom2": "123"
        };
        const expected = {
            "custom": {
                "captcha": {
                    "site_key": "xxxxxxx1",
                },
            },
        };
        const result = (0, util_1.getConfigObj)(mod, source, true);
        expect(result).toEqual(expected);
    }));
    it('bug 3', () => __awaiter(void 0, void 0, void 0, function* () {
        const source = {
            "custom": {
                "captcha": {
                    "enabled": false,
                    "email": "xxxxx@xxx.com",
                    "domains": ["localhost"],
                    "@site_key": "xxxxxxx1",
                    "@secret_key": {
                        "public1": {
                            "public2": "xxxxxx2"
                        }
                    },
                    "empty1": {
                        "empty2": {
                            "empty3": "string"
                        }
                    }
                },
            },
            "custom2": "123",
            "empty2": {}
        };
        const expected = {
            "custom": {
                "captcha": {
                    "@site_key": "xxxxxxx1",
                    "@secret_key": {
                        "public1": {
                            "public2": "xxxxxx2"
                        }
                    }
                },
            },
        };
        const result = (0, util_1.cleanDestObject)(source);
        // console.log(JSON.stringify(result, null, 2))
        expect(result).toEqual(expected);
    }));
    it('bug 4', () => __awaiter(void 0, void 0, void 0, function* () {
        const source = {
            "EXAMPLE": "123"
        };
        const mod = {
            "EXAMPLE": "1234",
            "custom0": { "some": { "random": "value" } },
            "custom": {
                "captcha": {
                    "site_key": {
                        "public1": {
                            "public2": "xxxxxxx1"
                        }
                    },
                    "secret_key": {
                        "public1": {
                            "@public2": "xxxxxx2"
                        }
                    }
                }
            }
        };
        const expected = {
            "custom": {
                "captcha": {
                    "secret_key": {
                        "public1": {
                            "public2": "xxxxxx2"
                        }
                    }
                }
            }
        };
        const result = (0, util_1.getConfigObj)(mod, source, true);
        // console.log(JSON.stringify(result, null, 2))
        expect(result).toEqual(expected);
    }));
    it('bug 5', () => __awaiter(void 0, void 0, void 0, function* () {
        const source = {
            "ACTIVE": {
                "main": {
                    "host": "rabbitmq",
                    "user": "root",
                    "psw": "root-psw",
                    "retry_time": 5000
                }
            },
            "EXAMPLES": {}
        };
        const mod = {
            "ACTIVE": {
                "main": {
                    "host": "rabbitmq",
                    "user": "root",
                    "---psw": "some-psw",
                    "retry_time": 5000
                }
            },
            "EXAMPLES": {}
        };
        const expected = {};
        const result = (0, util_1.getConfigObj)(mod, source, true);
        // console.log(JSON.stringify(result, null, 2))
        expect(result).toEqual(expected);
    }));
});
