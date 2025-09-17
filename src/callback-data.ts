import type { BaseType } from "./types";

type Schema = Record<string, BaseType<any>>;

type InferType<T> = T extends BaseType<infer V> ? V : never;
type InferSchema<S extends Schema> = {
  [K in keyof S]: InferType<S[K]>;
};

export class CallbackData<S extends Schema> {
  private readonly prefix: string;
  private readonly schema: S;
  private readonly keys: (keyof S)[];

  constructor(prefix: string, schema: S) {
    this.prefix = prefix;
    this.schema = schema;
    this.keys = Object.keys(schema) as (keyof S)[];
  }

  public pack(data: InferSchema<S>): string {
    const values = this.keys.map((key) => {
      const value = data[key];
      const type = this.schema[key];

      if (!type) throw new Error(`Missing schema for key: ${String(key)}`);
      return type.serialize(value);
    });

    return [this.prefix, ...values].join(":");
  }

  public unpack(payload: string): InferSchema<S> {
    const parts = payload.split(":");

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

      (result as any)[key] = type.parse(raw);
    }

    return result as InferSchema<S>;
  }

  public filter(clause?: Partial<InferSchema<S>>): RegExp {
    const pattern: string[] = [this.prefix];

    for (const key of this.keys) {
      const type = this.schema[key];
      const value = clause?.[key];

      if (!type) throw new Error(`Missing schema for key: ${String(key)}`);

      if (typeof value !== "undefined") {
        pattern.push(type.serialize(value));
      } else {
        pattern.push("[^:]+");
      }
    }

    return new RegExp(`^${pattern.join(":")}$`);
  }
}
