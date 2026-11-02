import {env} from 'cloudflare:workers';
export async function history(userId:string){const rows=await env.DB!.prepare('SELECT id,role,content,author_id,author_name,created_at FROM conversation_messages WHERE user_id=? ORDER BY created_at DESC, rowid DESC LIMIT 40').bind(userId).all<{id:string;role:string;content:string;author_id:string|null;author_name:string|null;created_at:number}>();return rows.results.reverse()}
export async function remember(userId:string,role:string,content:string,authorId:string|null=null,authorName:string|null=null,messageId:string=crypto.randomUUID()){await env.DB!.prepare('INSERT INTO conversation_messages (id,user_id,role,content,created_at,author_id,author_name) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(messageId,userId,role,content.slice(0,5000),Date.now(),authorId,authorName).run()}
export function checkOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin}
export function secret(){return (env as any).OPENAI_API_KEY||process.env.OPENAI_API_KEY}
export async function savedRecords(userId:string){const result=await env.DB!.prepare('SELECT id,name,created_at FROM checkins WHERE user_id=? ORDER BY created_at DESC LIMIT 20').bind(userId).all();return result.results}

// Receipts come from confirmed check-in rows, not client messages or AI claims.
export async function timeline(userId:string){
 const [recent,visible,activities,records]=await Promise.all([history(userId),
 env.DB!.prepare("SELECT id,role,content,author_id,author_name,created_at FROM conversation_messages WHERE user_id=? AND role IN ('user','assistant') ORDER BY created_at DESC, rowid DESC LIMIT 100").bind(userId).all<{id:string;role:string;content:string;author_id:string|null;author_name:string|null;created_at:number}>(),
 env.DB!.prepare("SELECT id,role,content,author_id,author_name,created_at FROM conversation_messages WHERE user_id=? AND role='assistant' AND id LIKE '%:activities:%' ORDER BY created_at DESC, rowid DESC LIMIT 50").bind(userId).all<{id:string;role:string;content:string;author_id:string|null;author_name:string|null;created_at:number}>(),env.DB!.prepare('SELECT id,created_at FROM checkins WHERE user_id=? ORDER BY created_at DESC LIMIT 50').bind(userId).all<{id:string;created_at:string}>()]);
 const receipts=records.results.map(r=>({id:'checkin:'+r.id,role:'checkin',kind:'checkin_saved',video_id:r.id,content:'Video check-in completed. Your video was saved to Saved videos.',author_id:null,author_name:null,created_at:Date.parse(r.created_at)}));
 const chat=Array.from(new Map([...recent,...visible.results,...activities.results].map(message=>[message.id,message])).values());
 return [...chat,...receipts].sort((a,b)=>a.created_at-b.created_at||a.id.localeCompare(b.id));
}
