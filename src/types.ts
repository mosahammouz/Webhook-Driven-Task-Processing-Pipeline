export type ActionType = "toUbberCase" | "filterPrice" | "addTimesTamp";
export type pipeline = {    // user will create this
    id: string,
    webhookPath: string, // url
    actionType : ActionType,
    actionConfig?: Record<string, any>;
    createdAt: Date;
}
