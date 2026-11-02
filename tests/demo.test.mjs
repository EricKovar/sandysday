import {test} from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {fixture,request} from './fixture.mjs';
async function guest(f){const token=await f.demoSession.createDemoToken();return '__Host-sandys-demo='+token}
function req(path,cookie,options={}){return new Request('https://preview.invalid'+path,{...options,headers:{'X-Sandys-Demo':'1',Cookie:cookie,Origin:'https://preview.invalid',...options.headers}})}
async function upload(f,cookie,id){const base=request(id);return f.route.POST(req('/api/checkins',cookie,{method:'POST',body:await base.formData()}))}
test('demo entry needs no account, issues a protected session cookie, and resumes or starts fresh',async()=>{
 const f=fixture();f.as(null);const r=await f.demoEntry.GET(new Request('https://preview.invalid/demo'));assert.equal(r.status,303);assert.equal(r.headers.get('location'),'https://preview.invalid/demo/home');const cookie=r.headers.get('set-cookie');assert.ok(cookie.includes('HttpOnly'));assert.ok(cookie.includes('Secure'));assert.ok(cookie.includes('SameSite=Lax'));assert.ok((await f.demoSession.demoUser(cookie)).userId.startsWith('demo:'));
 const resume=await f.demoEntry.GET(new Request('https://preview.invalid/demo',{headers:{Cookie:cookie}}));assert.equal(resume.headers.get('set-cookie'),null);const fresh=await f.demoEntry.GET(new Request('https://preview.invalid/demo?new=1',{headers:{Cookie:cookie}}));assert.notEqual(fresh.headers.get('set-cookie'),cookie);
});
test('demo identity never falls back to the signed-in real account; forged and expired cookies fail',async()=>{
 const f=fixture(),cookie=await guest(f);const user=await f.appUser.getAppUser(req('/api/conversation',cookie));assert.ok(user.userId.startsWith('demo:'));assert.equal(user.fullName,'Susan');assert.equal((await f.appUser.getAppUser(new Request('https://preview.invalid/api/conversation'))).userId,'test-a');assert.equal(await f.appUser.getAppUser(req('/api/conversation','forged=1')),null);
 const expired=await f.demoSession.createDemoToken(Date.now()-f.demoSession.DEMO_TTL-1000);assert.equal(await f.demoSession.demoUser('__Host-sandys-demo='+expired),null);const tampered=cookie.slice(0,-4)+'xxxx';assert.equal(await f.demoSession.demoUser(tampered),null);
});
test('anonymous demo browsers cannot read each other’s chats or recordings, or a real account’s video',async()=>{
 const f=fixture();const realId=randomUUID();assert.equal((await f.route.POST(request(realId))).status,200);f.as(null);const a=await guest(f),b=await guest(f);const videoId=randomUUID();assert.equal((await upload(f,a,videoId)).status,200);assert.equal((await f.route.GET(req('/api/checkins?video='+videoId,a))).status,200);assert.equal((await f.route.GET(req('/api/checkins?video='+videoId,b))).status,404);assert.equal((await f.route.GET(req('/api/checkins?video='+realId,a))).status,404);
 await f.events.POST(req('/api/events',a,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'user',content:'Guest A private demo message',id:randomUUID()})}));
 const chatA=await (await f.conversation.GET(req('/api/conversation',a))).json(),chatB=await (await f.conversation.GET(req('/api/conversation',b))).json();assert.ok(chatA.messages.some(m=>m.content.includes('Guest A')));assert.equal(chatB.messages.length,0);assert.notEqual(chatA.user_id,chatB.user_id);assert.equal((await f.route.GET(new Request('https://preview.invalid/api/checkins'))).status,401);
 assert.equal((await f.care.GET()).status,401);assert.equal((await f.chat.GET(req('/api/cindy-chat?scope=private&senior=test-a',a))).status,403);
});
test('voice supports repeated role-switch reconnects and keeps a bounded per-network limit',async()=>{
 let calls=0;const f=fixture({fetch:async()=>{calls++;return new Response('synthetic-sdp-answer')}});f.as(null);
 for(let i=0;i<21;i++){const cookie=await guest(f);const r=await f.realtime.POST(req('/api/realtime',cookie,{method:'POST',headers:{'cf-connecting-ip':'192.0.2.1','Content-Type':'application/json'},body:JSON.stringify({sdp:'synthetic-offer',name:'Susan',stage:'idle'})}));assert.equal(r.status,i<20?200:429)}
 assert.equal(calls,20);
});
test('failed provider voice starts do not consume the demo voice allowance',async()=>{
 let succeed=false;const f=fixture({fetch:async()=>succeed?new Response('synthetic-sdp-answer'):new Response('{}',{status:503})});f.as(null);const cookie=await guest(f);
 for(let i=0;i<24;i++){const r=await f.realtime.POST(req('/api/realtime',cookie,{method:'POST',headers:{'cf-connecting-ip':'192.0.2.2','Content-Type':'application/json'},body:JSON.stringify({sdp:'synthetic-offer',stage:'idle'})}));assert.equal(r.status,503)}
 assert.ok(f.db.prepare("SELECT count FROM demo_usage WHERE id LIKE '%:voice'").all().every(row=>row.count===0));
 succeed=true;const r=await f.realtime.POST(req('/api/realtime',cookie,{method:'POST',headers:{'cf-connecting-ip':'192.0.2.2','Content-Type':'application/json'},body:JSON.stringify({sdp:'synthetic-offer',stage:'idle'})}));assert.equal(r.status,200);
});
test('public guest access does not grant unlisted signed-in accounts access to tester APIs',async()=>{
 const f=fixture({realAuth:true,env:{SIGNED_IN_TEST_EMAILS:JSON.stringify(['tester@example.invalid'])}});
 f.headers({'oai-authenticated-user-id':'real-tester','oai-authenticated-user-email':'tester@example.invalid'});assert.equal((await f.nativeAuth.getChatGPTUser()).userId,'real-tester');
 f.headers({'oai-authenticated-user-id':'outsider','oai-authenticated-user-email':'outsider@example.invalid'});assert.equal(await f.nativeAuth.getChatGPTUser(),null);assert.equal((await f.conversation.GET()).status,401);assert.equal((await f.care.GET()).status,401);
 const cookie=await guest(f);assert.ok((await f.appUser.getAppUser(req('/api/conversation',cookie))).userId.startsWith('demo:'));
});
