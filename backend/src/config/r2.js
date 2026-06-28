import AWS from 'aws-sdk';

// Cloudflare R2 uses S3-compatible API
const s3 = new AWS.S3({
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'auto',
});

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

export { s3, bucketName, publicUrl };
