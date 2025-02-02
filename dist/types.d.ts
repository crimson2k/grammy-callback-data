export declare const TYPES: {
    readonly string: "string";
    readonly number: "number";
    readonly boolean: "boolean";
};
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
    [K in keyof T]: T[K]["required"] extends false ? DataTypes[T[K]["type"]] | undefined : DataTypes[T[K]["type"]];
};
export declare const DataType: {
    readonly string: "string";
    readonly number: "number";
    readonly boolean: "boolean";
};
