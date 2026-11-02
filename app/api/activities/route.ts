import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {checkOrigin} from '../../../lib/server-cindy';
import {findActivities} from '../../../lib/server-activities';
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in.'},{status:401});if(!checkOrigin(request))return new Response('Forbidden',{status:403});
 let b:any;try{b=await request.json()}catch{return Response.json({error:'Please try again.'},{status:400})}
 const location=typeof b.location==='string'?b.location.trim():'',interests=typeof b.interests==='string'?b.interests.trim():'';
 if(!location||/^(near me|here|my area|unknown)$/i.test(location)||location.length>100||interests.length>500||typeof b.requestId!=='string'||!/^[0-9a-f-]{36}$/i.test(b.requestId))return Response.json({error:'Please tell Cindy a city and state, or ZIP code, to search.'},{status:400});
 const prior=await env.DB!.prepare('SELECT content FROM conversation_messages WHERE id=? AND user_id=?').bind(user.userId+':activities:'+b.requestId,user.userId).first<{content:string}>();
 if(prior)return Response.json({ok:true,reply:prior.content});
 try{return Response.json(await findActivities(user.userId,location,interests,b.requestId))}catch(e){return Response.json({error:e instanceof Error?e.message:'Activities search couldn’t connect. Please try again.'},{status:503})}
}
