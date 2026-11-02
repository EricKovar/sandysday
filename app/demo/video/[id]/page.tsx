import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
import {notFound,redirect} from 'next/navigation';
import {demoIdentity} from '../../../../lib/demo-circle';
export const dynamic='force-dynamic';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{role?:string}>}){
 const role=(await searchParams).role==='caregiver'?'caregiver':'senior';const user=await demoIdentity((await headers()).get('cookie'),role);if(!user)redirect('/demo');const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 const row=await env.DB!.prepare('SELECT id,name,created_at FROM checkins WHERE id=? AND (user_id=? OR EXISTS (SELECT 1 FROM care_connections c WHERE c.senior_id=checkins.user_id AND c.caregiver_id=?))').bind(id,user.userId,user.userId).first<{id:string;name:string;created_at:string}>();if(!row)notFound();
 return <main className="videoDetail"><header><a className="brand" href="/demo/home">Sandy’s Day</a><a className="careBack" href={role==='caregiver'?'/demo/caregiver':'/demo/home'}>Back to conversation</a></header><section className="careContainer"><div className="careCard"><span className="eyebrow">DEMO CHECK-IN</span><h1>{row.name}’s check-in</h1><video controls playsInline preload="metadata" src={'/api/checkins?demo=1&role='+role+'&video='+row.id}/><p>This recording is shared between Susan and Pat in your demo Care Circle.</p></div></section></main>
}
