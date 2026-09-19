import { randomBytes } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { approveRecord, recordPublication, validateStore } from './social-queue.mjs';
import { checkConnection, sign } from './x-connection.mjs';

export async function publishApproved(approved, expectedHash, history, deps) {
  const {id,revision,account,text,text_sha256,approved_at}=approved;
  const validated=approveRecord({id,revision,account,text},{id,revision,account,text_sha256,approved_at,public_storage_approved:true},[]);
  if (Object.keys(approved).sort().join()!==Object.keys(validated).sort().join() || approved.status!==validated.status || approved.schema_version!==1 || expectedHash!==text_sha256) throw Error('Approval mismatch');
  if(history.some(x=>x.id===id || x.text_sha256===text_sha256))throw Error('Already posted');
  // Conservative text-only upper bound. URLs and complex emoji are not expanded.
  if([...text].length*2>280)throw Error('Text exceeds conservative length limit');
  await deps.verify();
  await deps.claim(`social/attempts/${text_sha256}.json`,{id,text_sha256,status:'attempt_reserved',reserved_at:new Date().toISOString()});
  // Claim persists even on timeout, process termination, rejection or storage failure.
  const result=await deps.send(text);
  if(!/^\d+$/.test(result?.data?.id ?? ''))throw Error('Invalid post response; reserved attempt requires manual review');
  const url=`https://x.com/kahokuadhoms/status/${result.data.id}`;
  deps.report?.(url);
  const record=recordPublication(approved,{url,recorded_at:new Date().toISOString(),verification:result.data.text===text?'text_compared':'user_reported_unverified',observed_text:result.data.text===text?text:null},history);
  await deps.save(`social/history/${id}.json`,record);
  return record;
}

const encode=v=>encodeURIComponent(v).replace(/[!'()*]/g,c=>`%${c.charCodeAt(0).toString(16).toUpperCase()}`);
async function sendPost(text,env) {
  const url='https://api.x.com/2/tweets';
  const oauth={oauth_consumer_key:env.X_API_KEY,oauth_token:env.X_ACCESS_TOKEN,oauth_nonce:randomBytes(16).toString('hex'),oauth_timestamp:String(Math.floor(Date.now()/1000)),oauth_signature_method:'HMAC-SHA1',oauth_version:'1.0'};
  oauth.oauth_signature=sign('POST',url,oauth,env.X_API_SECRET,env.X_ACCESS_TOKEN_SECRET);
  let response;
  try {response=await fetch(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:'OAuth '+Object.entries(oauth).map(([k,v])=>`${encode(k)}="${encode(v)}"`).join(', '),'Content-Type':'application/json'},body:JSON.stringify({text})});}
  catch {throw Error('Publication outcome unknown; do not retry');}
  if(!response.ok)throw Error(`X publication rejected (HTTP ${response.status}); attempt retained, no retry`);
  try {return await response.json();}catch{throw Error('Publication response unreadable; do not retry');}
}
async function createRecord(path,value,env) {
  let response;
  try {response=await fetch(`https://api.github.com/repos/kahokukoken/adhoms/contents/${path}`,{method:'PUT',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify({branch:'main',message:'docs: record X publication state',content:Buffer.from(JSON.stringify(value,null,2)+'\n').toString('base64')})});}
  catch {throw Error('State write outcome unknown; stopped without retry');}
  if(response.status!==201)throw Error(`State creation refused (HTTP ${response.status}); existing attempt or permission issue`);
}
export function selectRequest(event,head,parent,diff) {
  if(event.deleted || event.forced || !/^[0-9a-f]{40}$/.test(event.before??'') || !/^[0-9a-f]{40}$/.test(event.after??'') || head!==event.after || parent!==event.before)throw Error('Expected a single new commit');
  const lines=diff.trim().split('\n');
  if(lines.length!==1 || !/^A\tsocial\/requests\/[A-Za-z0-9_-]+\.json$/.test(lines[0]))throw Error('Request commit must only add one publication request');
  return lines[0].slice(2);
}
async function main(env) {
  if(env.GITHUB_REPOSITORY!=='kahokukoken/adhoms' || env.GITHUB_REF!=='refs/heads/main' || env.GITHUB_EVENT_NAME!=='push' || !env.GITHUB_TOKEN)throw Error('Unsupported execution context');
  const event=JSON.parse(await readFile(env.GITHUB_EVENT_PATH,'utf8'));
  const git=async(...args)=>(await promisify(execFile)('git',args)).stdout.trim();
  const head=await git('rev-parse','HEAD');
  const parent=await git('show','-s','--format=%P','HEAD');
  const path=selectRequest(event,head,parent,await git('diff','--name-status','HEAD^','HEAD'));
  const request=JSON.parse(await readFile(path,'utf8'));
  if(Object.keys(request).sort().join()!=='id,text_sha256' || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(request.id) || path!==`social/requests/${request.id}.json`)throw Error('Invalid request');
  await validateStore('social');
  const approved=JSON.parse(await readFile(`social/approved/${request.id}.json`,'utf8'));
  const history=await Promise.all((await readdir('social/history')).filter(x=>x.endsWith('.json')).map(async x=>JSON.parse(await readFile(`social/history/${x}`,'utf8'))));
  const result=await publishApproved(approved,request.text_sha256,history,{verify:()=>checkConnection(env),claim:(p,v)=>createRecord(p,v,env),send:text=>sendPost(text,env),save:(p,v)=>createRecord(p,v,env),report:url=>console.log(`X_POST_URL=${url}`)});
  console.log(JSON.stringify({status:result.status,url:result.url}));
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  main(process.env).catch(error=>{console.error(error.message.startsWith('X ')||error.message.startsWith('State ')||error.message.startsWith('Publication ')?error.message:'Publication stopped; check request, approval and account. No automatic retry.');process.exitCode=1;});
}
