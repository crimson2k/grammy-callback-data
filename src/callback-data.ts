import type { BaseType } from "./types";

type Schema = Record<string, BaseType>;

type InferType<T> = T extends BaseType<infer V> ? V : never;
type InferSchema<S extends Schema> = {
  [K in keyof S]: InferType<S[K]>;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class CallbackData<S extends Schema> {
  private readonly prefix: string;
  private readonly schema: S;
  private readonly keys: (keyof S)[];

  constructor(prefix: string, schema: S) {
    if (prefix === "" || prefix.includes(":")) {
      throw new Error('Prefix must be non-empty and must not contain ":"');
    }
    this.prefix = prefix;
    this.schema = schema;
    this.keys = Object.keys(schema) as (keyof S)[];
  }

  public pack(data: InferSchema<S>): string {
    const values = this.keys.map((key) => {
      const value = data[key];
      const type = this.schema[key];

      if (!type) throw new Error(`Missing schema for key: ${String(key)}`);
      const serialized = type.serialize(value);
      if (serialized.includes(":")) {
        throw new Error(`Value for key ${String(key)} must not contain ":"`);
      }
      return serialized;
    });

    const payload = [this.prefix, ...values].join(":");
    const byteLength = Buffer.byteLength(payload, "utf8");
    if (byteLength > 64) {
      throw new Error(`Callback data is ${byteLength} bytes; maximum is 64 bytes`);
    }
    return payload;
  }

  public unpack(payload: string): InferSchema<S> {
    const parts = payload.split(":");
    if (parts[0] !== this.prefix) {
      throw new Error(`Expected callback prefix: ${this.prefix}`);
    }
    if (parts.length !== this.keys.length + 1) {
      throw new Error(`Expected ${this.keys.length} fields, received ${parts.length - 1}`);
    }

    const values = parts.slice(1);
    const result: Partial<InferSchema<S>> = {};

    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i] as keyof S;
      const raw = values[i];
      if (typeof raw === "undefined") {
        throw new Error(`Missing value at index ${i} for key: ${String(key)}`);
      }

      const type = this.schema[key];
      if (!type) throw new Error(`Missing schema for key: ${String(key)}`);

      result[key] = type.parse(raw) as InferSchema<S>[typeof key];
    }

    return result as InferSchema<S>;
  }

  public filter(clause?: Partial<InferSchema<S>>): RegExp {
    const pattern: string[] = [escapeRegex(this.prefix)];

    for (const key of this.keys) {
      const type = this.schema[key];
      const value = clause?.[key];

      if (!type) throw new Error(`Missing schema for key: ${String(key)}`);

      if (typeof value !== "undefined") {
        const serialized = type.serialize(value);
        if (serialized.includes(":")) {
          throw new Error(`Value for key ${String(key)} must not contain ":"`);
        }
        pattern.push(escapeRegex(serialized));
      } else {
        pattern.push("[^:]*");
      }
    }

    return new RegExp(`^${pattern.join(":")}(?![\\s\\S])`);
  }
}
