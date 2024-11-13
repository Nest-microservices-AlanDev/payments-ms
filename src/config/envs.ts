import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  STRIIPE_SUCCESS_URL: string;
  STRIIPE_CANCEL_URL: string;
  STRIPE_ENDPOINTSECRET: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    STRIIPE_SUCCESS_URL: joi.string().required(),
    STRIIPE_CANCEL_URL: joi.string().required(),
    STRIPE_ENDPOINTSECRET: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error {error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  stripe_secret: envVars.STRIPE_SECRET,
  striipe_success_url: envVars.STRIIPE_SUCCESS_URL,
  striipe_cancel_url: envVars.STRIIPE_CANCEL_URL,
  stripe_endpointsecret: envVars.STRIPE_ENDPOINTSECRET,
};
