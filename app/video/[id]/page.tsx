import {SavedCheckinVideo} from '../../../components/saved-checkin-video';
import {env} from 'cloudflare:workers';
import {notFound} from 'next/navigation';
import {requireChatGPTUser} from '../../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();const user=await requireChatGPTUser('/video/'+id);
 const row=await env.DB!.prepare('SELECT id,user_id,name,created_at FROM checkins WHERE id=? AND (user_id=? OR EXISTS (SELECT 1 FROM care_connections c WHERE c.senior_id=checkins.user_id AND c.caregiver_id=?))').bind(id,user.userId,user.userId).first<{id:string;user_id:string;name:string;created_at:string}>();if(!row)notFound();
 return <main className="videoDetail"><header><a className="brand" href={row.user_id===user.userId?'/':'/caregiver'}><img className="brandLogo" src="/sandys-day-logo-copper.png" alt="" width={47} height={47}/><span>Sandy’s Day</span></a><a className="careBack" href={row.user_id===user.userId?'/':'/caregiver'}>Back to conversation</a></header><section className="careContainer"><div className="careCard"><span className="eyebrow">SAVED VIDEO CHECK-IN</span><h1>{row.name}’s check-in</h1><time dateTime={row.created_at}>{row.created_at.replace('T',' ').replace(/\.\d+Z$/,' UTC')}</time><SavedCheckinVideo src={'/api/checkins?video='+row.id}/><p>Saved in <strong>Saved videos</strong>. This video is available only to the Senior Member and currently connected Caregivers.</p></div></section></main>
}
