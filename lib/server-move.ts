import {env} from 'cloudflare:workers';
import {type MoveState} from './move';
export async function moveState(userId:string){const row=await env.DB!.prepare('SELECT state FROM move_sessions WHERE user_id=?').bind(userId).first<{state:string}>();return row?JSON.parse(row.state) as MoveState:null}
export async function saveMove(userId:string,old:MoveState|null,next:MoveState){
 next.revision=(old?.revision||0)+1;const json=JSON.stringify(next);
 const update=old?env.DB!.prepare('UPDATE move_sessions SET state=?,revision=? WHERE user_id=? AND revision=?').bind(json,next.revision,userId,old.revision):env.DB!.prepare('INSERT INTO move_sessions (user_id,state,revision) VALUES (?,?,?) ON CONFLICT(user_id) DO NOTHING').bind(userId,json,next.revision);
 const receipt=next.status==='completed'?env.DB!.prepare("INSERT INTO conversation_messages (id,user_id,role,content,created_at) SELECT ?,?,'assistant',?,? WHERE EXISTS (SELECT 1 FROM move_sessions WHERE user_id=? AND state=?) ON CONFLICT(id) DO NOTHING").bind('move-completed:'+next.id,userId,'Daily Move completed. Chair yoga — confirmed by the Senior Member.',next.completedAt!,userId,json):null;
 const result=await env.DB!.batch(receipt?[update,receipt]:[update]);return Number(result[0].meta.changes)>0;
}
