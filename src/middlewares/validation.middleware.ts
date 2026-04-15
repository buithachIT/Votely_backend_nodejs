import { sendError } from "@/helpers/response.helper";
import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

const validateBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });
    if (error) {
      const messages = error.details.map((detail) => detail.message).join(", ");
      return sendError(res, {
        message: messages,
        statusCode: 400,
      });
    }
    req.body = value;
    next();
  };
};

export { validateBody };
