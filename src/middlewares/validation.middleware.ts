import { sendError } from '@/helpers/response.helper';
import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

const validateBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });
    if (error) {
      const errors = error.details.reduce<Record<string, string>>(
        (acc, detail) => {
          const field = detail.path.join('.');
          acc[field] = detail.message.replace(/['"]/g, '');
          return acc;
        },
        {},
      );
      return sendError(res, {
        message: 'Dữ liệu không hợp lệ',
        statusCode: 400,
        errors,
      });
    }
    req.body = value;
    next();
  };
};

export { validateBody };
