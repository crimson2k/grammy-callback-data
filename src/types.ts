export const TYPES = {
  string: "string",
  number: "number",
  boolean: "boolean",
} as const;

export type DataType = (typeof TYPES)[keyof typeof TYPES];
export type DataTypes = {
  [TYPES.string]: string;
  [TYPES.number]: number;
  [TYPES.boolean]: boolean;
};

export type SchemaField = {
  type: DataType;
  required?: boolean;
};

export type Schema = Record<string, SchemaField>;

export type InferSchemaType<T extends Schema> = {
  [K in keyof T]: T[K]["required"] extends false
    ? DataTypes[T[K]["type"]] | undefined
    : DataTypes[T[K]["type"]];
};

export const DataType = TYPES; 