export interface BaseType<T = any> {
  parse(value: string): T;
  serialize(value: T): string;
}

export class StringType implements BaseType {
  parse(value: string) {
    return value;
  }
  serialize(value: any) {
    return String(value);
  }
}

export class NumberType implements BaseType {
  parse(value: string) {
    return Number(value);
  }
  serialize(value: any) {
    return String(value);
  }
}

export class BooleanType implements BaseType {
  parse(value: string) {
    return value === "1";
  }
  serialize(value: any) {
    return value ? "1" : "0";
  }
}

// DSL
export const t = {
  string: () => new StringType(),
  number: () => new NumberType(),
  boolean: () => new BooleanType(),
};
