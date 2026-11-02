import {env} from 'cloudflare:workers';
export const DEMO_COOKIE='__Host-sandys-demo';
export const DEMO_TTL=24*60*60*1000;
const encode=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const decode=(text:string)=>Uint8Array.from(atob(text.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function key(){const secret=(env as any).DEMO_SESSION_SECRET;if(!secret)throw Error('Demo sessions are not configured.');return crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
export async function createDemoToken(now=Date.now()){const payload=encode(new TextEncoder().encode(JSON.stringify({id:crypto.randomUUID(),exp:now+DEMO_TTL})));const signature=await crypto.subtle.sign('HMAC',await key(),new TextEncoder().encode(payload));return payload+'.'+encode(new Uint8Array(signature))}
export async function demoUser(cookie:string|null){
 try{const token=(cookie||'').split(';').map(part=>part.trim()).find(part=>part.startsWith(DEMO_COOKIE+'='))?.slice(DEMO_COOKIE.length+1);if(!token||token.length>512||!/^[-\w]+\.[-\w]+$/.test(token))return null;
 const [payload,signature]=token.split('.');if(!await crypto.subtle.verify('HMAC',await key(),decode(signature),new TextEncoder().encode(payload)))return null;
 const data=JSON.parse(new TextDecoder().decode(decode(payload)));if(!/^[0-9a-f-]{36}$/i.test(data.id)||!Number.isFinite(data.exp)||data.exp<=Date.now()||data.exp>Date.now()+DEMO_TTL)return null;
 return {userId:'demo:'+data.id,email:'demo-'+data.id+'@example.invalid',displayName:'Susan',fullName:'Susan',isDemo:true as const};
 }catch{return null}
}
