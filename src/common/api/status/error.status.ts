import { BaseCode } from '../base.api';

export class ErrorStatus implements BaseCode {
  private constructor(
    public success: boolean,
    public statusCode: number,
    public message: string,
  ) {}

  // 가장 일반적인 에러
  static readonly INTERNAL_SERVER_ERROR = new ErrorStatus(
    false,
    500,
    '서버 에러, 관리자에게 문의하세요.',
  );
  static readonly BAD_REQUEST = new ErrorStatus(
    false,
    400,
    '잘못된 요청입니다.',
  );

  //사용자 에러
  static readonly MEMBER_NOT_FOUND = new ErrorStatus(
    false,
    400,
    '사용자를 찾을 수 없습니다.',
  );
  static readonly MEMBER_INFO_NOT_FOUND = new ErrorStatus(
    false,
    400,
    '사용자 입력 정보가 부족합니다.',
  );
  static readonly EMAIL_ALREADY_TAKEN = new ErrorStatus(
    false,
    400,
    '이 이메일은 이미 사용 중입니다.',
  );
  static readonly NICKNAME_ALREADY_TAKEN = new ErrorStatus(
    false,
    400,
    '이 닉네임은 이미 사용 중입니다.',
  );
  static readonly FAVORITE_ALREADY_EXISTS = new ErrorStatus(
    false,
    400,
    '이미 등록한 관심 사용자입니다.',
  );
  static readonly FAVORITE_REQUEST_ALREADY_SENT = new ErrorStatus(
    false,
    400,
    '이미 요청을 보낸 사용자입니다.',
  );
  static readonly FAVORITE_REQUEST_NOT_FOUND = new ErrorStatus(
    false,
    400,
    '관심 사용자 등록 요청이 존재하지 않습니다.',
  );
  static readonly FAVORITE_NOT_FOUND = new ErrorStatus(
    false,
    400,
    '관심 사용자를 찾을 수 없습니다.',
  );
  static readonly MEMBER_DETAIL_NOT_FOUND = new ErrorStatus(
    false,
    400,
    '사용자 상세 정보를 찾을 수 없습니다.',
  );

  //이벤트 에러
  static readonly EVENT_CONTENTS_NOT_FOUND = new ErrorStatus(
    false,
    400,
    '내용은 필수 입력 항목입니다.',
  );
  static readonly INVALID_PASSWORD = new ErrorStatus(
    false,
    400,
    '틀린 비밀번호 입니다.',
  );
  static readonly EVENT_NOT_FOUND = new ErrorStatus(
    false,
    400,
    '해당 이벤트가 존재하지 않습니다.',
  );
  static readonly INVALID_GEO_LOCATION = new ErrorStatus(
    false,
    400,
    '유효한 위도와 경도를 입력해 주세요.',
  );
  static readonly INVALID_DISASTER_LEVEL = new ErrorStatus(
    false,
    400,
    '유효한 재난 단계를 입력해 주세요.',
  );
  static readonly UNABLE_TO_FIND_ADDRESS = new ErrorStatus(
    false,
    400,
    '주소를 찾을 수 없습니다.',
  );

  //S3 에러
  static readonly S3_UPLOAD_FAILURE = new ErrorStatus(
    false,
    400,
    '이미지 업로드에 실패했습니다.',
  );

  static readonly S3_CONFIG_ERROR = new ErrorStatus(
    false,
    400,
    'S3 설정 정보가 잘못되었습니다.',
  );

  static readonly EVENT_ALREADY_LIKED = new ErrorStatus(
    false,
    400,
    '이미 좋아요 누른 게시물입니다.',
  );

  static readonly FIREBASE_CONFIG_ERROR = new ErrorStatus(
    false,
    400,
    'Firebase 설정 정보가 잘못되었습니다.',
  );
  static readonly FIREBASE_MESSAGE_ERROR = new ErrorStatus(
    false,
    400,
    'Push 메시지를 보내는데 실패했습니다',
  );
}
