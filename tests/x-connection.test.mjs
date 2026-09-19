import test from 'node:test';
import assert from 'node:assert/strict';
import { sign, checkConnection } from '../scripts/x-connection.mjs';

test('OAuth 1 signing matches the published OAuth example', () => {
  assert.equal(sign('GET', 'http://photos.example.net/photos', {
    file:'vacation.jpg',size:'original',oauth_consumer_key:'dpf43f3p2l4k3l03',
    oauth_token:'nnch734d00sl2jdk',oauth_nonce:'kllo9940pd9333jh',
    oauth_timestamp:'1191242096',oauth_signature_method:'HMAC-SHA1',oauth_version:'1.0'
  }, 'kd94hf93k423kf44', 'pfkkdhi9sl3r4s00'), 'tR3+Ty81lMeYAr/Fid0kMTYa/WM=');
});
const credentials = Object.fromEntries(['X_API_KEY','X_API_SECRET','X_ACCESS_TOKEN','X_ACCESS_TOKEN_SECRET'].map(k=>[k,'secret-value']));
test('missing secrets fail before network access', async()=>{
  await assert.rejects(checkConnection({},()=>assert.fail('network')), /Missing GitHub secret/);
});
test('connection uses only a fixed read-only endpoint and rejects another account', async()=>{
  await assert.rejects(checkConnection(credentials,async(url,options)=>{
    assert.equal(url,'https://api.x.com/2/users/me');
    assert.equal(options.method,'GET');
    assert.equal(options.redirect,'error');
    return new Response(JSON.stringify({data:{id:'123',username:'other'}}));
  }),/Account mismatch/);
});
test('does not expose server errors or credentials',async()=>{
  await assert.rejects(checkConnection(credentials,async()=>new Response('secret-value',{status:401})),e=>e.message==='X authentication check failed (HTTP 401)');
});
test('success verifies identity without claiming posting is tested',async()=>{
  const result=await checkConnection(credentials,async()=>new Response(JSON.stringify({data:{id:'123',username:'kahokuadhoms'}})));
  assert.deepEqual(result,{account:'kahokuadhoms',authenticated:true,posting_tested:false});
});
