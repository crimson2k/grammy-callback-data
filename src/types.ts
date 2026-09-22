export interface BaseType<T = unknown> {
  parse(value: string): T;
  serialize(value: T): string;
}

export class StringType implements BaseType<string> {
  parse(value: string) {
    return value;
  }
  serialize(value: string) {
    if (typeof value !== "string") throw new Error("Expected a string value");
    return value;
  }
}

export class NumberType implements BaseType<number> {
  parse(value: string) {
    const number = Number(value);
    if (value.trim() === "" || !Number.isFinite(number)) {
      throw new Error(`Expected a finite number, received: ${value}`);
    }
    return number;
  }
  serialize(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("Expected a finite number value");
    }
    return String(value);
  }
}

export class BooleanType implements BaseType<boolean> {
  parse(value: string): boolean {
    if (value !== "0" && value !== "1") {
      throw new Error(`Expected boolean value "0" or "1", received: ${value}`);
    }
    return value === "1";
  }
  serialize(value: boolean) {
    if (typeof value !== "boolean") throw new Error("Expected a boolean value");
    return value ? "1" : "0";
  }
}

// DSL
export const t = {
  string: () => new StringType(),
  number: () => new NumberType(),
  boolean: () => new BooleanType(),
};
