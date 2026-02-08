export type Bindings = {
  DB: D1Database
  BLOB: R2Bucket

  //AUTH vars
  JWT_SECRET: string
  SESSION_SECRET: string

  //R2 
  R2_BUCKET_NAME: string
  CF_ACCOUNT_ID: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string  
}