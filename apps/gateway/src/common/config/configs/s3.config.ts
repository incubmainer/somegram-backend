export class S3Config {
  accessKey: string;
  secretKey: string;
  connectionString: string;
  bucketName: string;
  publicUrl: string;
  region: string;
}
export const s3Config = (): S3Config => {
  const accessKey = process.env.S3_ACCESS_KEY;
  if (!accessKey) throw new Error('S3_ACCESS_KEY is not defined');
  const secretKey = process.env.S3_SECRET_KEY;
  if (!secretKey) throw new Error('S3_SECRET_KEY is not defined');
  const connectionString = process.env.S3_CONNECTION_STRING;
  if (!connectionString) throw new Error('S3_CONNECTION_STRING is not defined');
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) throw new Error('S3_BUCKET_NAME is not defined');
  const publicUrl = process.env.S3_PUBLIC_URL;
  if (!publicUrl) throw new Error('S3_PUBLIC_URL is not defined');
  const region = process.env.S3_REGION;
  if (!region) throw new Error('S3_REGION is not defined');

  return {
    accessKey,
    secretKey,
    connectionString,
    bucketName,
    publicUrl,
    region,
  };
};
