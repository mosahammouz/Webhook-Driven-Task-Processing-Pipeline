
export type ActionType = "toUbberCase" | "filterPrice" | "addTimesTamp" | "reverseString";
export type pipeline = {    // user will create this
    id: string,
    webhookPath: string, // url
    actionType : ActionType,
    actionConfig?: Record<string, any>, // me as a mousa i will define "field": "message", so action.config.field will retutm mesage
    createdAt: Date
}
export type job = {
    id: string,
    pipelineId: string,
    payload: Record<string, any>,
    status: string,
    attempts: number,
    createdAt: Date
}
export type Subscriber = {
    id: number;          
    pipelineId: string;  
    url: string;
    status: string;
}

