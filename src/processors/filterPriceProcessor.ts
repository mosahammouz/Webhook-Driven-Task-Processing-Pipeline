import type { Processor } from "./factory.js";

export class FilterPriceProcessor implements Processor {
  async process(payload: Record<string, any>, config?: Record<string, any>): Promise<Record<string, any>> {
    const min = config?.min;
    const priceField = config?.field || "price";

    if (typeof min !== "number" || typeof payload[priceField] !== "number") return payload;

    if (payload[priceField] < min) {
      throw new Error("FILTERED"); // signals job should fail
    }

    return payload;
  }
}