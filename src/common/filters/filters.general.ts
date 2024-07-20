import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { ExceptionHandler } from "./exception/exception.handler";


@Catch(ExceptionHandler)
export class GeneralFilter implements ExceptionFilter {
    catch(exception: ExceptionHandler, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const status = exception.getStatus();
        const response = ctx.getResponse();     
        const errorResponse = {
            success: false,
            statusCode: exception.getErrorReason().statusCode,
            message: exception.getErrorReason().message,
        };        
        response.status(status).json(errorResponse);
    }
}