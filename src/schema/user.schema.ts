import Joi from 'joi';

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required(),
  lastName: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^(0\d{9}|\+84\s?\d{9})$/)
    .required()
    .messages({
      'string.pattern.base':
        'Phone must start with 0 or +84 and have 10 digits total.',
    }),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match.' }),
  terms: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must accept the Terms & Conditions.',
    'any.required': 'You must accept the Terms & Conditions.',
  }),
  marketing_emails: Joi.boolean().default(false),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export { registerSchema, loginSchema };
