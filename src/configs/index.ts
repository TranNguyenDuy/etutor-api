import dotenv from "dotenv";
dotenv.config();

const env = process.env;
const NODE_ENV = env.NODE_ENV || "development";

export const AppConfigs = {
  ENV: NODE_ENV,
  PORT: env.PORT || 3000,
  JWT_SECRET: env.JWT_SECRET || "",
  CLIENT_ORIGIN: env.CLIENT_ORIGIN
};

export const MailConfigs = {
  host: env.MAIL_HOST,
  port: parseInt(env.MAIL_POST || '0', 10),
  account: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS
  }
};

export const AWSConfig = {
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  acessKeySecret: env.AWS_ACCESS_KEY_SECRET,
  region: env.AWS_REGION,
  buckets: {
    public: 'etutor-client'
  }
};