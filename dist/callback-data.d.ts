import type { Schema, InferSchemaType } from "./types";
export declare class CallbackData<T extends Schema> {
    private prefix;
    private schema;
    constructor(prefix: string, schema: T);
    pack(data: InferSchemaType<T>): string;
    unpack(callback: string): InferSchemaType<T>;
    filter(partial?: Partial<InferSchemaType<T>>): RegExp;
}
