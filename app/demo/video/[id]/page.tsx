import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
import {notFound,redirect} from 'next/navigation';
import {demoUser} from '../../../../lib/demo-session';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){
 const user=await demoUser((await headers()).get('cookie'));if(!user)redirect('/demo');const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 const row=await env.DB!.prepare('SELECT id,name,created_at FROM checkins WHERE id=? AND user_id=?').bind(id,user.userId).first<{id:string;name:string;created_at:string}>();if(!row)notFound();
 return <main className="videoDetail"><header><a className="brand" href="/demo/home">Sandy’s Day</a><a className="careBack" href="/demo/home">Back to Cindy</a></header><section className="careContainer"><div className="careCard"><span className="eyebrow">DEMO CHECK-IN</span><h1>{row.name}’s check-in</h1><video controls playsInline preload="metadata" src={'/api/checkins?demo=1&video='+row.id}/><p>This recording belongs to your demo session. No live Caregiver is connected.</p></div></section></main>
}
