import {sharingStatus} from '../../../lib/care-server';
import {getChatGPTUser} from '../../chatgpt-auth';
import {actions,instructions} from '../../../lib/cindy';
import {timeline,history,remember,checkOrigin,secret,savedRecords} from '../../../lib/server-cindy';
export async function GET(){const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in.'},{status:401});return Response.json({user_id:user.userId,messages:await timeline(user.userId),name:user.fullName?.split(' ')[0]||'Susan'},{headers:{'Cache-Control':'private, no-store'}})}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in to talk with Cindy.'},{status:401});if(!checkOrigin(request))return new Response('Forbidden',{status:403});
 const body=await request.json() as any;const text=String(body.text||'').trim();if(!text||text.length>2000)return Response.json({error:'Please send a shorter message.'},{status:400});
 const messages=await history(user.userId);await remember(user.userId,'user',text,user.userId,String(body.name||user.fullName||'Senior Member').slice(0,60));
 const key=secret();if(!key)return Response.json({error:'Cindy’s connection is not configured yet.'},{status:503});
 try{
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},signal:AbortSignal.timeout(25000),body:JSON.stringify({model:'gpt-4.1-mini',store:false,instructions:instructions(String(body.name||'Susan').slice(0,40))+'\nReturn a brief conversational reply and one proposed action. For actions, say only what you intend to do; the app reports the result separately. Current app state (client-reported, not proof of saved records): '+JSON.stringify({stage:body.stage,deferred:body.deferred})+'\nCurrent server-confirmed sharing: '+JSON.stringify(await sharingStatus(user.userId))+'\nActual saved check-ins: '+JSON.stringify(await savedRecords(user.userId)),input:[...messages.map(m=>({role:m.role==='event'?'developer':m.role,content:m.role==='user'&&m.author_name?m.author_name+': '+m.content:m.content})),{role:'user',content:text}],max_output_tokens:400,text:{format:{type:'json_schema',name:'cindy_turn',strict:true,schema:{type:'object',properties:{reply:{type:'string'},action:{type:'string',enum:actions}},required:['reply','action'],additionalProperties:false}}}})});
 if(!r.ok){return Response.json({error:r.status===429?'Cindy’s connection is busy or has reached its API limit. Please try again shortly.':'Cindy couldn’t connect. Please try again.'},{status:503})}
 const data=await r.json() as any;const output=data.output?.flatMap((x:any)=>x.content||[]).find((x:any)=>x.type==='output_text')?.text;const turn=JSON.parse(output);if(!actions.includes(turn.action)||typeof turn.reply!=='string')throw Error('Invalid turn');await remember(user.userId,'assistant',turn.reply);return Response.json(turn);
 }catch{return Response.json({error:'Cindy couldn’t finish that reply. Your current check-in has not been changed.'},{status:503})}
}
