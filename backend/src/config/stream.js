// Cloudflare Stream API configuration
const STREAM_ACCOUNT_ID = process.env.CLOUDFLARE_STREAM_ACCOUNT_ID;
const STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

const STREAM_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${STREAM_ACCOUNT_ID}/stream`;

export { STREAM_API_BASE, STREAM_API_TOKEN };
