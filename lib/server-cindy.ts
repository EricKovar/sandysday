import {env} from 'cloudflare:workers';
export async function history(userId:string){const rows=await env.DB!.prepare('SELECT role, content FROM conversation_messages WHERE user_id=? ORDER BY created_at DESC, rowid DESC LIMIT 40').bind(userId).all<{role:string;content:string}>();return rows.results.reverse()}
export async function remember(userId:string,role:string,content:string){await env.DB!.prepare('INSERT INTO conversation_messages (id,user_id,role,content,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),userId,role,content.slice(0,5000),Date.now()).run()}
export function checkOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin}
export function secret(){return (env as any).OPENAI_API_KEY||process.env.OPENAI_API_KEY}
export async function savedRecords(userId:string){const result=await env.DB!.prepare('SELECT id,name,created_at FROM checkins WHERE user_id=? ORDER BY created_at DESC LIMIT 20').bind(userId).all();return result.results}
