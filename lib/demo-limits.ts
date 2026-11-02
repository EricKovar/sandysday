import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
const limits={chat:120,voice:4,search:15,video:8,events:800} as const;
export async function demoLimit(user:{userId:string},kind:keyof typeof limits,request?:Request){
 if(!user.userId.startsWith('demo:'))return null;
 const h=request?.headers||await headers(),ip=h.get('cf-connecting-ip')||'unavailable';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String((env as any).DEMO_SESSION_SECRET)+':demo-limit:'+ip));
 const fingerprint=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
 const day=new Date().toISOString().slice(0,10),scope=ip==='unavailable'?user.userId:fingerprint;
 for(const [bucket,cap] of [[scope,limits[kind]],['all',limits[kind]*20]] as const){
  const row=await env.DB!.prepare('INSERT INTO demo_usage (id,count) VALUES (?,1) ON CONFLICT(id) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').bind(bucket+':'+day+':'+kind,cap).first();
  if(!row)return Response.json({error:'The demo has reached its daily '+kind+' limit. Please try again later.'},{status:429});
 }return null;
}
