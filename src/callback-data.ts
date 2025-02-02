import type { Schema, InferSchemaType } from "./types";

export class CallbackData<T extends Schema> {
  private prefix: string;
  private schema: T;

  constructor(prefix: string, schema: T) {
    this.prefix = prefix;
    this.schema = schema;
  }

  pack(data: InferSchemaType<T>): string {
    const values = Object.entries(this.schema).map(([key]) => {
      const value = data[key as keyof typeof data];
      if (value === undefined) return "";
      if (this.schema[key].type === "boolean") {
        return (value as boolean) ? "1" : "0";
      }
      return String(value);
    });
    return [this.prefix, ...values].join(":");
  }

  unpack(callback: string): InferSchemaType<T> {
    const [prefix, ...values] = callback.split(":");
    if (prefix !== this.prefix) {
      throw new Error("Invalid callback prefix");
    }

    const result: Record<string, any> = {};
    const schemaEntries = Object.entries(this.schema);

    schemaEntries.forEach(([key, field], index) => {
      const value = values[index];
      if (value === "") {
        if (field.required) {
          throw new Error(`Required field ${key} is missing`);
        }
        result[key] = undefined;
      } else {
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

    return result as InferSchemaType<T>;
  }

  filter(partial?: Partial<InferSchemaType<T>>): RegExp {
    if (!partial) {
      return new RegExp(`^${this.prefix}:`);
    }

    const values = Object.entries(this.schema).map(([key]) => {
      const value = partial[key as keyof typeof partial];
      if (value === undefined) return "[^:]*";
      if (this.schema[key].type === "boolean") {
        return (value as boolean) ? "1" : "0";
      }
      return String(value);
    });

    return new RegExp(`^${this.prefix}:${values.join(":")}`);
  }
}
