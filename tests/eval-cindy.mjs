import fs from 'node:fs';import assert from 'node:assert/strict';
import {instructions,actions,realtimeSession} from '../lib/cindy.ts';
const key=fs.readFileSync(new URL('../.env.local',import.meta.url),'utf8').trim().slice('OPENAI_API_KEY='.length);
const cases=[
 {label:'Natural affirmative',stage:'idle',history:[{role:'assistant',content:'Are you ready to take your medicine?'}],text:'Sure, let’s do that.',expect:'open_camera'},
 {label:'Gentle deferral',stage:'idle',history:[{role:'assistant',content:'Are you ready to take your medicine?'}],text:'Not yet, I want to finish my tea.',expect:'defer'},
 {label:'Change topic after deferral',stage:'idle',history:[{role:'user',content:'Not yet, please.'},{role:'assistant',content:'Of course. Take your time.'}],text:'Can we talk about gardening?',expect:'none',noMedication:true},
 {label:'Self-report is not completion',stage:'idle',text:'I already took it earlier.',expect:['none','defer']},
 {label:'Camera preview consent',stage:'preview',history:[{role:'assistant',content:'Your camera is ready. Say start when ready.'}],text:'Okay, start the recording please.',expect:'start_recording'},
 {label:'Finish recording',stage:'recording',text:'I’m all finished. Please save my video.',expect:'finish_checkin'},
 {label:'No discard after recording starts',stage:'recording',text:'Cancel this. I don’t want to save it.',expect:'none'},
 {label:'Recover failed upload',stage:'retry',text:'Could you try saving that again?',expect:'retry_upload'},
 {label:'Hypothetical is not a command',stage:'preview',text:'What happens if I say start recording?',expect:'none'},
 {label:'Mid-recording question does not finish',stage:'recording',text:'Can you still hear me?',expect:'none'}
];
let failures=0;
for(const c of cases){const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4.1-mini',store:false,instructions:instructions('Susan')+' Current app state: '+c.stage+'. Actual saved records: []. Return a brief reply and one proposed action. Do not claim action success.',input:[...(c.history||[]),{role:'user',content:c.text}],max_output_tokens:250,text:{format:{type:'json_schema',name:'turn',strict:true,schema:{type:'object',properties:{reply:{type:'string'},action:{type:'string',enum:actions}},required:['reply','action'],additionalProperties:false}}}})});assert.equal(r.status,200);const data=await r.json();const turn=JSON.parse(data.output.flatMap(x=>x.content||[]).find(x=>x.type==='output_text').text);const passed=(Array.isArray(c.expect)?c.expect.includes(turn.action):turn.action===c.expect)&&(!c.noMedication||!/medic|check.in/i.test(turn.reply));console.log((passed?'PASS ':'FAIL ')+c.label+' → '+turn.action);if(!passed){failures++;console.log(turn.reply)}}
const voice=await fetch('https://api.openai.com/v1/realtime/client_secrets',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({session:realtimeSession('Susan',[],[],'idle',false)})});if(voice.ok){console.log('PASS Realtime configuration and model access');await voice.arrayBuffer()}else{const e=await voice.json();console.log('FAIL Realtime configuration',voice.status,e.error?.code,e.error?.message);failures++}
assert.equal(failures,0,'Live evaluations failed');
