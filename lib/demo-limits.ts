import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
const limits={chat:120,voice:20,search:15,video:8,events:800} as const;
type Kind=keyof typeof limits;
async function buckets(user:{userId:string},kind:Kind,request?:Request){
 const h=request?.headers||await headers(),ip=h.get('cf-connecting-ip')||'unavailable';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String((env as any).DEMO_SESSION_SECRET)+':demo-limit:'+ip));
 const fingerprint=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
 const day=new Date().toISOString().slice(0,10),scope=ip==='unavailable'?user.userId:fingerprint;
 return [{id:scope+':'+day+':'+kind,cap:limits[kind]},{id:'all:'+day+':'+kind,cap:kind==='voice'?80:limits[kind]*20}];
}
async function refund(id:string){await env.DB!.prepare('UPDATE demo_usage SET count=count-1 WHERE id=? AND count>0').bind(id).run()}
export async function refundDemoVoice(user:{userId:string},request?:Request){if(!user.userId.startsWith('demo:'))return;for(const bucket of await buckets(user,'voice',request))await refund(bucket.id)}
export async function demoLimit(user:{userId:string},kind:Kind,request?:Request){
 if(!user.userId.startsWith('demo:'))return null;
 const reserved:string[]=[];
 for(const bucket of await buckets(user,kind,request)){
  const row=await env.DB!.prepare('INSERT INTO demo_usage (id,count) VALUES (?,1) ON CONFLICT(id) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').bind(bucket.id,bucket.cap).first();
  if(!row){if(kind==='voice')for(const id of reserved)await refund(id);return Response.json({error:kind==='voice'?'This demo has reached today’s voice limit. You can still type.':'The demo has reached its daily '+kind+' limit. Please try again later.'},{status:429})}
  reserved.push(bucket.id);
 }return null;
}
