import { ErrorStatus } from '../api/status/error.status';
import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

export function ApiFailureResponse(...errors: ErrorStatus[]) {
  const examples = errors.reduce((acc, error, index) => {
    acc[`USER_400_${index + 1}`] = {
      summary: `Example ${index + 1}`,
      value: {
        success: error.success,
        statusCode: error.statusCode,
        message: error.message,
      },
    };
    return acc;
  }, {});

  return applyDecorators(
    ApiExtraModels(ErrorStatus),
    ApiResponse({
      status: 400,
      description: 'Validation errors',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              statusCode: { type: 'number' },
              message: { type: 'string' },
            },
          },
          examples,
        },
      },
    }),
  );
}
