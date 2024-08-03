import { HttpStatus } from "@nestjs/common";
import { BaseCode } from "../base.api";

export class ErrorStatus implements BaseCode {
    
    private constructor(public success: boolean, public statusCode: number, public message: string) {}

    // 가장 일반적인 에러
    static readonly INTERNAL_SERVER_ERROR = new ErrorStatus(false, 500, '서버 에러, 관리자에게 문의하세요.');
    static readonly BAD_REQUEST = new ErrorStatus(false, 400, "잘못된 요청입니다.");
    static readonly MEMBER_NOT_FOUND = new ErrorStatus(false, 400, "사용자를 찾을 수 없습니다.");
    static readonly EVENT_CONTENTS_NOT_FOUND = new ErrorStatus(false, 400, "내용은 필수 입력 항목입니다.");
    static readonly EVENT_NOT_FOUND = new ErrorStatus(false, 400, "해당 이벤트가 존재하지 않습니다.");

}