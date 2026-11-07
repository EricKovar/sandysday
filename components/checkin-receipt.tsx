'use client';
import {CheckCircle2} from 'lucide-react';
import {SavedCheckinVideo} from './saved-checkin-video';
export function CheckinReceipt({videoId,createdAt,demo=false,demoRole='senior'}:{videoId:string;createdAt:number;demo?:boolean;demoRole?:'senior'|'caregiver'}){
 const src='/api/checkins?video='+encodeURIComponent(videoId)+(demo?'&demo=1&role='+demoRole:'');
 return <article className="checkinReceipt" aria-label="Saved video check-in"><CheckCircle2 size={21}/><div><div className="receiptHeading"><strong>Video check-in completed</strong><time dateTime={new Date(createdAt).toISOString()}>{new Date(createdAt).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time></div><p>{demoRole==='senior'?'Your check-in is saved and shared with your Caregiver.':'This check-in is saved in Saved check-ins.'}</p>{demoRole==='caregiver'&&<SavedCheckinVideo src={src}/>}</div></article>
}
