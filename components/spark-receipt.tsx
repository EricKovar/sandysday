import {Sun,Check} from 'lucide-react';
export function SparkReceipt({text,createdAt}:{text:string;createdAt?:number}){
 return <div className="checkinReceipt sparkReceipt"><Sun size={21}/><div><div className="receiptHeading"><strong><Check size={15}/> Daily Spark completed</strong>{createdAt&&<time dateTime={new Date(createdAt).toISOString()}>{new Date(createdAt).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time>}</div><p>{text.replace(/^Daily Spark completed\.\s*/,'')}</p></div></div>
}
