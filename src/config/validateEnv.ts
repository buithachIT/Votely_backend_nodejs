import Joi from "joi";

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(8083),
  MONGO_URI: Joi.string().uri().required(),
  JWT_SECRET_KEY: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).optional(),
  FRONTEND_ORIGIN: Joi.string().uri().optional(),
}).unknown(true);

const validateEnv = (): void => {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    console.error("Environment validation failed:",
      error.details.map((detail) => detail.message).join(", ")
    );
    process.exit(1);
  }

  process.env.NODE_ENV = value.NODE_ENV;
  process.env.PORT = String(value.PORT);
  process.env.JWT_REFRESH_SECRET = value.JWT_REFRESH_SECRET || value.JWT_SECRET_KEY;
};

export default validateEnv;
