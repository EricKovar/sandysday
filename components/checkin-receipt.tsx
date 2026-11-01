'use client';
import {CheckCircle2,ArrowUpRight} from 'lucide-react';
export function CheckinReceipt({videoId,createdAt}:{videoId:string;createdAt:number}){
 return <article className="checkinReceipt" aria-label="Saved video check-in"><CheckCircle2 size={21}/><div><div className="receiptHeading"><strong>Video check-in completed</strong><time dateTime={new Date(createdAt).toISOString()}>{new Date(createdAt).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time></div><p>Your video was saved to <strong>Saved videos</strong>.</p><a href={'/video/'+encodeURIComponent(videoId)} target="_blank" rel="noopener noreferrer">View video <ArrowUpRight size={15}/></a></div></article>
}
