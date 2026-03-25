export interface Processor {
  process(payload: Record<string, any>, config?: Record<string, any>): Promise<Record<string, any>>;
}

export class ProcessorFactory {
  private static registry: Record<string, Processor> = {};

  static getProcessor(actionType: string): Processor | null {
    return this.registry[actionType] || null;  // return the value
  }

  static registerProcessor(actionType: string, processor: Processor) {
    this.registry[actionType] = processor; // set value
  }
}