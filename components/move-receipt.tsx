import {Leaf,Check} from 'lucide-react';
export function MoveReceipt({createdAt}:{createdAt?:number}){
 return <div className="checkinReceipt sparkReceipt"><Leaf size={21}/><div><div className="receiptHeading"><strong><Check size={15}/> Daily Move completed</strong>{createdAt&&<time dateTime={new Date(createdAt).toISOString()}>{new Date(createdAt).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time>}</div><p>Chair yoga — confirmed by the Senior Member.</p></div></div>
}
