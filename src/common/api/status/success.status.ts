import { BaseCode } from "../base.api";

export class SuccessStatus implements BaseCode {
    private constructor(public success: boolean, public statusCode: number, public message: string) {}
    
    static readonly OK = new SuccessStatus(true, 200, '성공');
}