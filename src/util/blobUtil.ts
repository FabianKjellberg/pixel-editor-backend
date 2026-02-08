import { AwsClient } from "aws4fetch"
import { Bindings } from "../env"

export function makeSigner(env: Bindings) {
  return new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  })
}

export function makeObjectUrl(env: Bindings, key: string, expiresSeconds: number) {
  const base = `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`
  return `${base}/${env.R2_BUCKET_NAME}/${key}?X-Amz-Expires=${expiresSeconds}`
}    