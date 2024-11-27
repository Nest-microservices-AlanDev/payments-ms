import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
  STRIPE_ENDPOINTSECRET: string;
  NATS_SERVERS: string[];
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_ENDPOINTSECRET: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  stripe_secret: envVars.STRIPE_SECRET,
  stripe_success_url: envVars.STRIPE_SUCCESS_URL,
  stripe_cancel_url: envVars.STRIPE_CANCEL_URL,
  stripe_endpointsecret: envVars.STRIPE_ENDPOINTSECRET,
  natsServers: envVars.NATS_SERVERS,
};
