import {env} from 'cloudflare:workers';
import {type SparkState,publicSpark} from './spark';
export async function sparkState(userId:string){const row=await env.DB!.prepare('SELECT state FROM spark_sessions WHERE user_id=?').bind(userId).first<{state:string}>();return row?JSON.parse(row.state) as SparkState:null}
export async function sparkView(userId:string){return publicSpark(await sparkState(userId))}
export async function saveSpark(userId:string,old:SparkState|null,next:SparkState){
 next.revision=(old?.revision||0)+1;
 const json=JSON.stringify(next);
 const update=old?env.DB!.prepare('UPDATE spark_sessions SET state=?,revision=?,updated_at=? WHERE user_id=? AND revision=?').bind(json,next.revision,Date.now(),userId,old.revision):env.DB!.prepare('INSERT INTO spark_sessions (user_id,state,revision,updated_at) VALUES (?,?,?,?) ON CONFLICT(user_id) DO NOTHING').bind(userId,json,next.revision,Date.now());
 const receipt=next.status==='completed'?env.DB!.prepare("INSERT INTO conversation_messages (id,user_id,role,content,created_at) SELECT ?,?,'assistant',?,? WHERE EXISTS (SELECT 1 FROM spark_sessions WHERE user_id=? AND state=?) ON CONFLICT(id) DO NOTHING").bind('spark-completed:'+next.id,userId,'Daily Spark completed. Five puzzles explored'+(next.skipped?' ('+next.skipped+' skipped)':'')+'.',next.completedAt!,userId,json):null;
 const result=await env.DB!.batch(receipt?[update,receipt]:[update]);
 return Number(result[0].meta.changes)>0;
}
