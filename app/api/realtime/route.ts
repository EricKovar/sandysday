import {sharingStatus} from '../../../lib/care-server';
import {getChatGPTUser} from '../../chatgpt-auth';
import {realtimeSession} from '../../../lib/cindy';
import {history,checkOrigin,secret,savedRecords} from '../../../lib/server-cindy';
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in to start voice.'},{status:401});if(!checkOrigin(request))return new Response('Forbidden',{status:403});
 const b=await request.json() as any;if(typeof b.sdp!=='string'||b.sdp.length>64000)return new Response('Invalid offer',{status:400});const key=secret();if(!key)return Response.json({error:'Voice is not configured.'},{status:503});
 const context=await history(user.userId);const records=await savedRecords(user.userId);
 const session=realtimeSession(String(b.name||'Susan').slice(0,40),context,records,b.stage,b.deferred,await sharingStatus(user.userId));
 const form=new FormData();form.set('sdp',b.sdp);form.set('session',JSON.stringify(session));
 try{const r=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:'Bearer '+key},body:form,signal:AbortSignal.timeout(25000)});if(!r.ok){const e=await r.json().catch(()=>({})) as any;console.warn('Realtime setup failed',r.status,e.error?.code);return Response.json({error:r.status===429?'Voice reached its API limit. You can try again shortly.':'Voice could not connect. You can still type to Cindy.'},{status:503})}return new Response(await r.text(),{headers:{'Content-Type':'application/sdp','Cache-Control':'no-store'}})}catch{return Response.json({error:'Voice connection interrupted. You can still type to Cindy.'},{status:503})}
}
