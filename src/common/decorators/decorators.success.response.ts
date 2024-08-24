import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import ResponseDto from '../api/response.api';

export function ApiSuccessResponse<
  TModel extends Type<any> | Record<string, any>,
>(model?: TModel) {
  const schema: any = {
    allOf: [
      { $ref: getSchemaPath(ResponseDto) },
      model && typeof model === 'function'
        ? {
            properties: {
              data: {
                $ref: getSchemaPath(model),
              },
            },
          }
        : model && typeof model === 'object'
          ? {
              properties: {
                data: {
                  type: 'object',
                  properties: model,
                },
              },
            }
          : {},
    ],
  };

  const decorators = [ApiExtraModels(ResponseDto)];

  if (typeof model === 'function') {
    decorators.push(ApiExtraModels(model));
  }

  decorators.push(ApiOkResponse({ schema }));

  return applyDecorators(...decorators);
}
