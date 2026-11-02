import {getChatGPTUser} from '../../chatgpt-auth';
import {checkOrigin} from '../../../lib/server-cindy';
import {moveState,saveMove} from '../../../lib/server-move';
import {advanceMove,moveOperations,type MoveOperation} from '../../../lib/move';
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in.'},{status:401});if(!checkOrigin(request))return new Response('Forbidden',{status:403});
 try{const b=await request.json() as any;if(!moveOperations.includes(b.operation)||!Number.isInteger(b.revision)||typeof b.requestId!=='string'||!/^[0-9a-f-]{36}$/i.test(b.requestId))return Response.json({error:'Please try that Move action again.'},{status:400});
 const old=await moveState(user.userId);if(old?.lastRequest===b.requestId)return Response.json({ok:true,move:old});
 if((old?.revision||0)!==b.revision)return Response.json({error:'Daily Move has updated. Please try again.',move:old},{status:409});
 let next;try{next=advanceMove(old,b.operation as MoveOperation,b.requestId)}catch(e){return Response.json({error:(e as Error).message},{status:400})}
 if(!await saveMove(user.userId,old,next))return Response.json({error:'Daily Move has updated. Please try again.',move:await moveState(user.userId)},{status:409});return Response.json({ok:true,move:next});
 }catch{return Response.json({error:'Daily Move could not save your progress. Please try again.'},{status:503})}
}
