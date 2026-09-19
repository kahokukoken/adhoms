import test from 'node:test';
import assert from 'node:assert/strict';
import { hashText, approveRecord } from '../scripts/social-queue.mjs';
import { publishApproved, selectRequest } from '../scripts/x-publish.mjs';
const candidate={id:'test-post',revision:1,account:'kahokuadhoms',text:'公開テスト'};
const approved=approveRecord(candidate,{id:candidate.id,revision:1,account:candidate.account,text_sha256:hashText(candidate.text),approved_at:'2026-09-19T00:00:00.000Z',public_storage_approved:true},[]);
test('selects request from verified git diff without payload file lists',()=>{
  const before='a'.repeat(40),after='b'.repeat(40);
  assert.equal(selectRequest({before,after},after,before,'A\tsocial/requests/test-post.json\n'),'social/requests/test-post.json');
  assert.throws(()=>selectRequest({before,after},after,before,'M\tsocial/requests/test-post.json\n'));
  assert.throws(()=>selectRequest({before,after},after,before,'A\tsocial/requests/test-post.json\nM\tscripts/x-publish.mjs\n'));
  assert.throws(()=>selectRequest({before,after},after,'c'.repeat(40),'A\tsocial/requests/test-post.json\n'));
});
function fixture(overrides={}) {
  const records=new Map();let sends=0;
  const deps={verify:async()=>{},claim:async(key,value)=>{if(records.has(key))throw Error('Already attempted');records.set(key,value);},send:async(text)=>{sends++;return {data:{id:'123456',text}};},save:async(key,value)=>{records.set(key,value);},...overrides};
  return {deps,records,count:()=>sends};
}
test('publishes exact approved text once and stores its URL',async()=>{
  const f=fixture();const result=await publishApproved(approved,approved.text_sha256,[],f.deps);
  assert.equal(result.url,'https://x.com/kahokuadhoms/status/123456');assert.equal(f.count(),1);
  await assert.rejects(publishApproved(approved,approved.text_sha256,[],f.deps),/Already attempted/);assert.equal(f.count(),1);
});
test('tampering and existing history block publication before any send',async()=>{
  const f=fixture();await assert.rejects(publishApproved({...approved,text:'改変'},approved.text_sha256,[],f.deps));
  await assert.rejects(publishApproved(approved,approved.text_sha256,[{id:approved.id}],f.deps));assert.equal(f.count(),0);
});
test('account verification failure prevents claim and send',async()=>{
  const f=fixture({verify:async()=>{throw Error('account mismatch');}});
  await assert.rejects(publishApproved(approved,approved.text_sha256,[],f.deps));assert.equal(f.records.size,0);assert.equal(f.count(),0);
});
test('ambiguous network failure leaves durable claim and blocks repeat',async()=>{
  let sent=0;const f=fixture({send:async()=>{sent++;throw Error('timeout');}});
  await assert.rejects(publishApproved(approved,approved.text_sha256,[],f.deps));
  await assert.rejects(publishApproved(approved,approved.text_sha256,[],f.deps),/Already attempted/);assert.equal(sent,1);
});
test('history save failure after send leaves claim and never retries',async()=>{
  const f=fixture({save:async()=>{throw Error('storage failure');}});
  await assert.rejects(publishApproved(approved,approved.text_sha256,[],f.deps));
  await assert.rejects(publishApproved(approved,approved.text_sha256,[],f.deps));assert.equal(f.count(),1);
});
