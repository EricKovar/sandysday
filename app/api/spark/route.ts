import {demoState} from '../../../lib/demo-scenario';
import {getAppUser as getChatGPTUser} from '../../../lib/app-user';
import {checkOrigin} from '../../../lib/server-cindy';
import {sparkState,saveSpark} from '../../../lib/server-spark';
import {advanceSpark,publicSpark,sparkOperations,type SparkOperation} from '../../../lib/spark';
export async function GET(request?:Request){const user=await getChatGPTUser(request);if(!user)return Response.json({error:'Please sign in.'},{status:401});return Response.json({spark:demoState(publicSpark(await sparkState(user.userId)),'demoStartedAt' in user?Number(user.demoStartedAt):undefined)},{headers:{'Cache-Control':'private, no-store'}})}
export async function POST(request:Request){
 const user=await getChatGPTUser(request);if(!user)return Response.json({error:'Please sign in.'},{status:401});if(!checkOrigin(request))return new Response('Forbidden',{status:403});
 try{
 const b=await request.json() as any;
 if(!sparkOperations.includes(b.operation)||typeof b.requestId!=='string'||!/^[0-9a-f-]{36}$/i.test(b.requestId)||!Number.isInteger(b.revision)||String(b.text||'').length>2000)return Response.json({error:'Please try that Spark action again.'},{status:400});
 const old=await sparkState(user.userId);
 if(old?.lastRequest===b.requestId)return Response.json({ok:true,spark:publicSpark(old)});
 if((old?.revision||0)!==b.revision)return Response.json({error:'Your Spark has updated. Please try again.',spark:publicSpark(old)},{status:409});
 let next;try{next=advanceSpark(old,b.operation as SparkOperation,String(b.text||''),b.requestId)}catch(e){return Response.json({error:e instanceof Error?e.message:'That Spark action is not available.'},{status:400})}
 if(!await saveSpark(user.userId,old,next))return Response.json({error:'Your Spark has updated. Please try again.',spark:demoState(publicSpark(await sparkState(user.userId)),'demoStartedAt' in user?Number(user.demoStartedAt):undefined)},{status:409});
 return Response.json({ok:true,spark:demoState(publicSpark(next),'demoStartedAt' in user?Number(user.demoStartedAt):undefined)});
 }catch{return Response.json({error:'Daily Spark could not save your progress. Please try again.'},{status:503})}
}
