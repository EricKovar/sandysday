import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
export async function GET(request:Request){
 const user=await getChatGPTUser(); if(!user)return Response.json({error:'Please sign in to view saved check-ins.'},{status:401});
 const url=new URL(request.url);const id=url.searchParams.get('video');
 if(id){
 const row=await env.DB!.prepare('SELECT * FROM checkins WHERE id=? AND user_id=?').bind(id,user.userId).first<any>();if(!row)return new Response('Not found',{status:404});
 const range=request.headers.get('range');let offset=0,length=Number(row.bytes),partial=false;
 if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${row.bytes}`}});if(match[1]){offset=Number(match[1]);length=(match[2]?Math.min(Number(match[2]),row.bytes-1):row.bytes-1)-offset+1}else if(match[2]){length=Math.min(Number(match[2]),row.bytes);offset=row.bytes-length}else return new Response(null,{status:416});if(offset>=row.bytes||length<=0)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${row.bytes}`}});partial=true}
 const file=await env.BUCKET!.get(row.video_key,partial?{range:{offset,length}}:undefined);if(!file)return new Response('Not found',{status:404});
 return new Response(file.body,{status:partial?206:200,headers:{'Content-Type':row.mime,'Content-Length':String(length),'Accept-Ranges':'bytes','Cache-Control':'private, no-store',...(partial?{'Content-Range':`bytes ${offset}-${offset+length-1}/${row.bytes}`}:{})}});
 }
 const records=await env.DB!.prepare('SELECT id,name,created_at,bytes FROM checkins WHERE user_id=? ORDER BY created_at DESC LIMIT 50').bind(user.userId).all();return Response.json({records:records.results},{headers:{'Cache-Control':'private, no-store'}});
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in before saving a recording.'},{status:401});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 const form=await request.formData();const video=form.get('video');if(!(video instanceof File)||!video.size||video.size>40*1024*1024||!/^video\/(webm|mp4)/.test(video.type))return Response.json({error:'Please record a video under 40 MB.'},{status:400});
 const requested=String(form.get('id')||'');
 const id=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requested)?requested:crypto.randomUUID();
 const existing=await env.DB!.prepare('SELECT id,created_at FROM checkins WHERE id=? AND user_id=?').bind(id,user.userId).first<any>();
 if(existing)return Response.json({...existing,notification:'not_enabled'});
 const key=user.userId+'/'+id;const created=new Date().toISOString();
 await env.BUCKET!.put(key,video.stream(),{httpMetadata:{contentType:video.type}});
 try{await env.DB!.prepare('INSERT INTO checkins (id,user_id,name,video_key,mime,bytes,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,user.userId,String(form.get('name')||'Senior Member').slice(0,60),key,video.type,video.size,created).run()}catch(e){const existing=await env.DB!.prepare('SELECT id,created_at FROM checkins WHERE id=? AND user_id=?').bind(id,user.userId).first<any>();if(existing)return Response.json({...existing,notification:'not_enabled'});await env.BUCKET!.delete(key);throw e}
 return Response.json({id,created_at:created,notification:'not_enabled'});
}
