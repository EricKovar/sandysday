import {demoLimit,refundDemoVoice} from '../../../lib/demo-limits';
import {moveState} from '../../../lib/server-move';
import {sparkView} from '../../../lib/server-spark';
import {sharingStatus} from '../../../lib/care-server';
import {getAppUser as getChatGPTUser} from '../../../lib/app-user';
import {realtimeSession} from '../../../lib/cindy';
import {history,checkOrigin,secret,savedRecords} from '../../../lib/server-cindy';
export async function POST(request:Request){
 const user=await getChatGPTUser(request);if(!user)return Response.json({error:'Please sign in to start voice.'},{status:401});if(!checkOrigin(request))return new Response('Forbidden',{status:403});
 let b:any;try{b=await request.json()}catch{return Response.json({error:'Voice could not start. Please try again.'},{status:400})}if(typeof b.sdp!=='string'||b.sdp.length>64000)return new Response('Invalid offer',{status:400});const key=secret();if(!key)return Response.json({error:'Voice is not configured.'},{status:503});
 const context=await history(user.userId);const records=await savedRecords(user.userId);
 const session=realtimeSession(String(b.name||'Susan').slice(0,40),context,records,b.stage,b.deferred,await sharingStatus(user.userId));
 session.instructions+='\nServer-confirmed Daily Spark: '+JSON.stringify(await sparkView(user.userId));
 session.instructions+='\nServer-confirmed Daily Move: '+JSON.stringify(await moveState(user.userId));
 if(user.userId.startsWith('demo:'))session.instructions+='\nThis is a no-login investor demo. The person is role-playing as Susan. Susan and Pat are connected within this isolated demo Care Circle. Pat can see Susan’s shared conversation, check-ins, and activities. Pat also has a separate private Cindy chat, never visible to Susan. Invitations to real people are unavailable. Explain that these are demo roles if needed; do not claim notifications were sent.';
 const form=new FormData();form.set('sdp',b.sdp);form.set('session',JSON.stringify(session));
 const limited=await demoLimit(user,'voice',request);if(limited)return limited;
 try{const r=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:'Bearer '+key},body:form,signal:AbortSignal.timeout(25000)});if(!r.ok){await refundDemoVoice(user,request);const e=await r.json().catch(()=>({})) as any;console.warn('Realtime setup failed',r.status,e.error?.code);return Response.json({error:r.status===429?'Voice reached its API limit. You can try again shortly.':'Voice could not connect. You can still type to Cindy.'},{status:503})}return new Response(await r.text(),{headers:{'Content-Type':'application/sdp','Cache-Control':'no-store'}})}catch{await refundDemoVoice(user,request);return Response.json({error:'Voice connection interrupted. You can still type to Cindy.'},{status:503})}
}
