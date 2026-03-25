import type { Processor } from "./factory.js";

export class ReverseStringProcessor implements Processor {
  async process(payload: Record<string, any>, config?: Record<string, any>): Promise<Record<string, any>> {
    const field = config?.field;
    if (!field || !(field in payload)) return payload;
    return { ...payload, [field]: String(payload[field]).split("").reverse().join("") };
  }
}