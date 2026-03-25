import type { Processor } from "./factory.js";

export class AddTimestampProcessor implements Processor {
  async process(payload: Record<string, any>, config?: Record<string, any>): Promise<Record<string, any>> {
    const field = config?.field || "timestamp";
    return { ...payload, [field]: new Date().toISOString() };
  }
}