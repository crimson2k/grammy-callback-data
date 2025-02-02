"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackData = void 0;
class CallbackData {
    constructor(prefix, schema) {
        this.prefix = prefix;
        this.schema = schema;
    }
    pack(data) {
        const values = Object.entries(this.schema).map(([key]) => {
            const value = data[key];
            if (value === undefined)
                return "";
            if (this.schema[key].type === "boolean") {
                return value ? "1" : "0";
            }
            return String(value);
        });
        return [this.prefix, ...values].join(":");
    }
    unpack(callback) {
        const [prefix, ...values] = callback.split(":");
        if (prefix !== this.prefix) {
            throw new Error("Invalid callback prefix");
        }
        const result = {};
        const schemaEntries = Object.entries(this.schema);
        schemaEntries.forEach(([key, field], index) => {
            const value = values[index];
            if (value === "") {
                if (field.required) {
                    throw new Error(`Required field ${key} is missing`);
                }
                result[key] = undefined;
            }
            else {
                switch (field.type) {
                    case "number":
                        result[key] = Number(value);
                        break;
                    case "boolean":
                        result[key] = value === "1";
                        break;
                    default:
                        result[key] = value;
                }
            }
        });
        return result;
    }
    filter(partial) {
        if (!partial) {
            return new RegExp(`^${this.prefix}:`);
        }
        const values = Object.entries(this.schema).map(([key]) => {
            const value = partial[key];
            if (value === undefined)
                return "[^:]*";
            if (this.schema[key].type === "boolean") {
                return value ? "1" : "0";
            }
            return String(value);
        });
        return new RegExp(`^${this.prefix}:${values.join(":")}`);
    }
}
exports.CallbackData = CallbackData;
