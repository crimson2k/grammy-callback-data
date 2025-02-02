import type { Schema, InferSchemaType } from "./types";

export class CallbackData<T extends Schema> {
  constructor(prefix: string, schema: T);
  
  pack(data: InferSchemaType<T>): string;
  
  unpack(callback: string): InferSchemaType<T>;
  
  filter(partial?: Partial<InferSchemaType<T>>): RegExp;
} 