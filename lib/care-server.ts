import {env} from 'cloudflare:workers';
export async function sharingStatus(seniorId:string){
 const result=await env.DB!.prepare('SELECT caregiver_name FROM care_connections WHERE senior_id=? ORDER BY created_at').bind(seniorId).all<{caregiver_name:string}>();
 return {sharing_status:'confirmed',shared_with:result.results.map(x=>x.caregiver_name),notifications_enabled:false};
}
export async function saveReceipt(userId:string,id:string,createdAt:string){let sharing:any;try{sharing=await sharingStatus(userId)}catch{sharing={sharing_status:'unknown',shared_with:[],notifications_enabled:false}}return {id,created_at:createdAt,notification:'not_enabled',...sharing}}
export async function hashToken(token:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
