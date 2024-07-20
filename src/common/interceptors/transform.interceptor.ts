import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import ApiResponse from "../api/response.api";
import { SuccessStatus } from "../api/status/success.status";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>>{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map(data => {
                return {
                    success: SuccessStatus.OK.success,
                    statusCode: SuccessStatus.OK.statusCode,
                    message: SuccessStatus.OK.message,
                    data: data
                }
            })
        );
    }
}

