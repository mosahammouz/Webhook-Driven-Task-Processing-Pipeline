import { ProcessorFactory } from "./factory.js";
import { ToUpperCaseProcessor } from "./toUpperCaseProcessor.js";
import { AddTimestampProcessor } from "./addTimestampProcessor.js";
import { FilterPriceProcessor } from "./filterPriceProcessor.js";
import { ReverseStringProcessor } from "./reverseStringProcessor.js";
// Register all processors at startup 
ProcessorFactory.registerProcessor("toUbberCase", new ToUpperCaseProcessor());
ProcessorFactory.registerProcessor("addTimesTamp", new AddTimestampProcessor());
ProcessorFactory.registerProcessor("filterPrice", new FilterPriceProcessor());
ProcessorFactory.registerProcessor("reverseString", new ReverseStringProcessor());