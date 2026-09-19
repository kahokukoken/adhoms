import { createHmac, randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const encode = value => encodeURIComponent(value).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
export function sign(method, url, parameters, consumerSecret, tokenSecret) {
  const normalized = Object.entries(parameters).map(([k,v])=>[encode(k),encode(v)])
    .sort(([a,b],[c,d])=>a<c?-1:a>c?1:b<d?-1:b>d?1:0).map(([k,v])=>`${k}=${v}`).join('&');
  const base = [method,url,normalized].map(encode).join('&');
  return createHmac('sha1', `${encode(consumerSecret)}&${encode(tokenSecret)}`).update(base).digest('base64');
}

export async function checkConnection(env, request = fetch) {
  for (const name of ['X_API_KEY','X_API_SECRET','X_ACCESS_TOKEN','X_ACCESS_TOKEN_SECRET']) {
    if (typeof env[name] !== 'string' || !env[name].trim()) throw new Error(`Missing GitHub secret: ${name}`);
  }
  const url = 'https://api.x.com/2/users/me';
  const oauth = {oauth_consumer_key:env.X_API_KEY,oauth_token:env.X_ACCESS_TOKEN,
    oauth_nonce:randomBytes(16).toString('hex'),oauth_timestamp:String(Math.floor(Date.now()/1000)),
    oauth_signature_method:'HMAC-SHA1',oauth_version:'1.0'};
  oauth.oauth_signature = sign('GET',url,oauth,env.X_API_SECRET,env.X_ACCESS_TOKEN_SECRET);
  const authorization = 'OAuth ' + Object.entries(oauth).map(([k,v])=>`${encode(k)}="${encode(v)}"`).join(', ');
  let response;
  try {
    response = await request(url,{method:'GET',headers:{Authorization:authorization},redirect:'error',signal:AbortSignal.timeout(20000)});
  } catch { throw new Error('X connection failed or timed out; no retry performed'); }
  if (!response.ok) throw new Error(`X authentication check failed (HTTP ${response.status})`);
  let body;
  try { body=await response.json(); } catch { throw new Error('Invalid X response'); }
  if (!body?.data?.id || typeof body.data.username !== 'string') throw new Error('Invalid X identity response');
  if (body.data.username.toLowerCase() !== 'kahokuadhoms') throw new Error('Account mismatch: expected @kahokuadhoms');
  return {account:'kahokuadhoms',authenticated:true,posting_tested:false};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(await checkConnection(process.env))); }
  catch (error) { console.error(error.message); process.exitCode=1; }
}
