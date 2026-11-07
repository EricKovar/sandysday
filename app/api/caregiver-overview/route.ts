import {demoSampleCounts} from '../../../lib/demo-scenario';
import {env} from 'cloudflare:workers';
import {getAppUser} from '../../../lib/app-user';
import {caregiverConnection} from '../../../lib/chat-access';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(request:Request){
 const user=await getAppUser(request);if(!user)return json({error:'Please sign in.'},401);
 const url=new URL(request.url),senior=url.searchParams.get('senior')||'',start=Number(url.searchParams.get('start')),end=Number(url.searchParams.get('end'));
 if(!Number.isFinite(start)||!Number.isFinite(end)||start<=0||end<=start||end-start>27*60*60*1000)return json({error:'Choose a valid day.'},400);
 const boundaries=(url.searchParams.get('days')||'').split(',').map(Number);
 if(boundaries.length!==8||boundaries.some((n,i)=>!Number.isFinite(n)||n<=0||(i>0&&(n-boundaries[i-1]<20*3600000||n-boundaries[i-1]>27*3600000)))||start<boundaries[0]||end>boundaries[7])return json({error:'Choose a valid Sunday–Saturday week.'},400);
 if(!await caregiverConnection(user.userId,senior))return json({error:'This Senior Member is not connected to your account.'},403);
 const [firstChat,checkins,completions]=await Promise.all([
 env.DB!.prepare("SELECT id,content,created_at FROM conversation_messages WHERE user_id=? AND author_id=? AND role='user' AND created_at>=? AND created_at<? ORDER BY created_at ASC,rowid ASC LIMIT 1").bind(senior,senior,start,end).first<{id:string;content:string;created_at:number}>(),
 env.DB!.prepare('SELECT created_at FROM checkins WHERE user_id=? AND julianday(created_at)>=julianday(?) AND julianday(created_at)<julianday(?)').bind(senior,new Date(boundaries[0]).toISOString(),new Date(boundaries[7]).toISOString()).all<{created_at:string}>(),
 env.DB!.prepare("SELECT id,created_at FROM conversation_messages WHERE user_id=? AND role='assistant' AND created_at>=? AND created_at<? AND (id LIKE 'spark-completed:%' OR id LIKE 'move-completed:%')").bind(senior,boundaries[0],boundaries[7]).all<{id:string;created_at:number}>()
 ]);
 const days=boundaries.slice(0,7).map((day,i)=>{const sample='demoStartedAt' in user&&day<start;return {start:day,end:boundaries[i+1],...(sample?demoSampleCounts[i%3]:{checkins:0,spark:0,move:0}),sample}});
 for(const row of checkins.results){const text=row.created_at;const stamp=Date.parse(/(?:Z|[+-]\d\d:\d\d)$/.test(text)?text:text.replace(' ','T')+'Z');const day=days.find(d=>stamp>=d.start&&stamp<d.end);if(day)day.checkins++}
 for(const row of completions.results){const day=days.find(d=>row.created_at>=d.start&&row.created_at<d.end);if(day){if(row.id.startsWith('spark-completed:'))day.spark++;else day.move++}}
 return json({clock:{now:Date.now()},firstChat,engagement:{days,start:boundaries[0],end:boundaries[7]}});
}
