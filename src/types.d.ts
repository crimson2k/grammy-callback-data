export type DataType = {
  string: string;
  number: number;
  boolean: boolean;
};

export const DataType: {
  string: "string";
  number: "number";
  boolean: "boolean";
};

export type SchemaField = {
  type: keyof typeof DataType;
  required?: boolean;
};

export type Schema = {
  [key: string]: SchemaField;
};

export type InferSchemaType<T extends Schema> = {
  [K in keyof T]: T[K]["required"] extends false
    ? T[K]["type"] extends keyof DataType
      ? DataType[T[K]["type"]] | undefined
      : never
    : T[K]["type"] extends keyof DataType
    ? DataType[T[K]["type"]]
    : never;
}; 