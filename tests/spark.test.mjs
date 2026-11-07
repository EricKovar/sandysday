import {test} from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {fixture,carePost} from './fixture.mjs';
async function read(f){return (await (await f.spark.GET()).json()).spark}
async function act(f,operation,text='',extra={}){const current=await read(f);const r=await f.spark.POST(new Request('https://preview.invalid/api/spark',{method:'POST',headers:{Origin:'https://preview.invalid','Content-Type':'application/json'},body:JSON.stringify({operation,text,revision:current?.revision||0,requestId:randomUUID(),...extra})}));return {status:r.status,...await r.json()}}
function solution(f){const s=JSON.parse(f.db.prepare('SELECT state FROM spark_sessions WHERE user_id=?').get('test-a').state);return [['fruit','birds','musical instruments'],['words','never','lining'],['eight','twenty','seven'],['banana','tulip','Tuesday'],['clock','towel','book']][s.round][s.variant]}
test('Spark: five real answers complete exactly once; receipt survives reload and is shared',async()=>{
 const f=fixture();let d=await act(f,'start');assert.equal(d.spark.status,'active');assert.equal(d.spark.round,0);assert.equal(d.spark.total,5);assert.ok(!JSON.stringify(d.spark).includes('answers'));
 for(let i=0;i<5;i++){const current=await read(f);const id=randomUUID();d=await act(f,'answer','I think it is '+solution(f),{requestId:id});assert.equal(d.status,200);assert.equal(d.spark.round,i);assert.equal(d.spark.awaitingNext,true);assert.equal(d.spark.autoAdvance,true);assert.equal(d.spark.question.prompt,current.question.prompt);assert.match(d.spark.feedback,/right|correct/);assert.match(d.spark.feedback,/The answer is/);const replay=await act(f,'answer','anything',{requestId:id,revision:current.revision});assert.deepEqual(replay.spark,d.spark);d=await act(f,'next');assert.equal(d.spark.round,i+1);assert.equal(d.spark.awaitingNext,false)}
 assert.equal((await read(f)).status,'completed');assert.equal(f.db.prepare("SELECT count(*) AS n FROM conversation_messages WHERE id LIKE 'spark-completed:%'").get().n,1);
 const timeline=await (await f.conversation.GET()).json();assert.ok(timeline.messages.some(m=>m.content.startsWith('Daily Spark completed.')));
});
test('Spark: incorrect answers, hints, pause/resume and skip preserve truthful progress',async()=>{
 const f=fixture();await act(f,'start');let d=await act(f,'answer','I do not know');assert.equal(d.spark.round,0);assert.match(d.spark.feedback,/Not quite.*hint:/);d=await act(f,'hint');assert.equal(d.spark.round,0);assert.ok(d.spark.feedback);await act(f,'pause');d=await act(f,'answer',solution(f));assert.equal(d.status,400);assert.equal((await read(f)).status,'paused');d=await act(f,'resume');assert.equal(d.spark.round,0);d=await act(f,'skip');assert.equal(d.spark.round,0);assert.equal(d.spark.skipped,1);assert.equal(d.spark.autoAdvance,false);assert.equal((await act(f,'skip')).status,400);await act(f,'pause');d=await act(f,'resume');assert.equal(d.spark.awaitingNext,true);assert.match(d.spark.feedback,/The answer is/);d=await act(f,'next');assert.equal(d.spark.round,1);d=await act(f,'stop');assert.equal(d.spark.status,'stopped');assert.equal(f.db.prepare("SELECT count(*) AS n FROM conversation_messages WHERE id LIKE 'spark-completed:%'").get().n,0);d=await act(f,'start');assert.equal(d.spark.round,0);assert.equal(d.spark.status,'active');
});
test('Spark: stale requests cannot advance another question; accounts stay isolated',async()=>{
 const f=fixture();const first=await act(f,'start');await act(f,'skip');const stale=await act(f,'next','',{revision:first.spark.revision});assert.equal(stale.status,409);assert.equal(stale.spark.round,0);assert.equal(stale.spark.awaitingNext,true);f.as({userId:'other',email:'other@example.invalid',fullName:'Other'});assert.equal(await read(f),null);await act(f,'start');assert.equal((await read(f)).round,0);f.as({userId:'test-a',email:'test-a@example.invalid',fullName:'Senior A'});assert.equal((await read(f)).awaitingNext,true);
});
test('Spark: authentication and origin checks protect writes',async()=>{
 const f=fixture();const r=await f.spark.POST(new Request('https://preview.invalid/api/spark',{method:'POST',headers:{Origin:'https://elsewhere.invalid'},body:'{}'}));assert.equal(r.status,403);f.as(null);assert.equal((await f.spark.GET()).status,401);assert.equal((await f.spark.POST(new Request('https://preview.invalid/api/spark',{method:'POST',body:'{}'}))).status,401);
});
test('Spark: completed sessions restart with different puzzles and never count a stop as completion',async()=>{
 const f=fixture();const first=await act(f,'start');for(let i=0;i<5;i++){await act(f,'skip');await act(f,'next')}assert.equal((await read(f)).status,'completed');const next=await act(f,'start');assert.notEqual(next.spark.id,first.spark.id);assert.notEqual(next.spark.question.prompt,first.spark.question.prompt);await act(f,'stop');assert.equal(f.db.prepare("SELECT count(*) AS n FROM conversation_messages WHERE id LIKE 'spark-completed:%'").get().n,1);
});
test('Spark: accepted Caregiver sees the completion in shared chat but not private chat',async()=>{
 const f=fixture();await act(f,'start');for(let i=0;i<5;i++){await act(f,'skip');await act(f,'next')}
 f.db.prepare('INSERT INTO care_connections (id,senior_id,caregiver_id,senior_name,caregiver_name,created_at) VALUES (?,?,?,?,?,?)').run(randomUUID(),'test-a','cg','Senior A','Caregiver',Date.now());
 f.as({userId:'cg',email:'cg@example.invalid',fullName:'Caregiver'});
 const shared=await (await f.chat.GET(new Request('https://preview.invalid/api/cindy-chat?senior=test-a&scope=shared'))).json();assert.ok(shared.messages.some(m=>m.content.startsWith('Daily Spark completed.')));
 const privateChat=await (await f.chat.GET(new Request('https://preview.invalid/api/cindy-chat?senior=test-a&scope=private'))).json();assert.equal(privateChat.messages.length,0);
 assert.equal(await read(f),null);
});
test('Spark: text Cindy receives the actual question and exposes the same guarded Spark actions as voice',async()=>{
 let called=false;const f=fixture({fetch:async(url,options)=>{called=true;const b=JSON.parse(options.body);assert.ok(b.instructions.includes('Server-confirmed Daily Spark:'));assert.ok(b.instructions.includes('"round":0'));assert.ok(b.text.format.schema.properties.action.enum.includes('spark_answer'));return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify({reply:'Let’s check that answer.',action:'spark_answer'})}]}]})}});
 await act(f,'start');const r=await f.conversation.POST(new Request('https://preview.invalid/api/conversation',{method:'POST',headers:{Origin:'https://preview.invalid','Content-Type':'application/json'},body:JSON.stringify({text:'Could the answer be fruit?',stage:'idle',name:'Senior A'})}));assert.equal(r.status,200);assert.equal((await r.json()).action,'spark_answer');assert.equal(called,true);
});

test('Spark: typed winter is graded without a model decision, gives a hint, and a correct answer is ready to auto-advance',async()=>{
 const f=fixture({fetch:async()=>{throw Error('Puzzle answers must not need the model')}});
 await act(f,'start');
 const state=JSON.parse(f.db.prepare('SELECT state FROM spark_sessions WHERE user_id=?').get('test-a').state);
 state.round=3;state.variant=2;
 f.db.prepare('UPDATE spark_sessions SET state=? WHERE user_id=?').run(JSON.stringify(state),'test-a');
 const r=await f.conversation.POST(new Request('https://preview.invalid/api/conversation',{method:'POST',headers:{Origin:'https://preview.invalid','Content-Type':'application/json'},body:JSON.stringify({text:'winter',stage:'idle',name:'Donna'})}));
 const turn=await r.json();assert.equal(turn.action,'spark_answer');assert.equal(turn.reply,'');
 let d=await act(f,'answer','winter');assert.equal(d.spark.round,3);assert.match(d.spark.feedback,/Not quite.*Two are seasons/);
 d=await act(f,'answer','Tuesday');assert.equal(d.spark.round,3);assert.match(d.spark.feedback,/right|correct/);
 const next=await f.conversation.POST(new Request('https://preview.invalid/api/conversation',{method:'POST',headers:{Origin:'https://preview.invalid','Content-Type':'application/json'},body:JSON.stringify({text:'Next question',stage:'idle',name:'Donna'})}));
 assert.equal((await next.json()).action,'spark_next');
 assert.equal((await act(f,'next')).spark.round,4);
});
