import { HttpStatus } from "@nestjs/common";
import { BaseCode } from "../base.api";

export class ErrorStatus implements BaseCode {
    
    private constructor(public success: boolean, public statusCode: number, public message: string) {}

    // 가장 일반적인 에러
    static readonly INTERNAL_SERVER_ERROR = new ErrorStatus(false, 500, '서버 에러, 관리자에게 문의하세요.');
    static readonly BAD_REQUEST = new ErrorStatus(false, 400, "잘못된 요청입니다.");

}