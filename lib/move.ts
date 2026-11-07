export const MOVE_VIDEO_ID='Znm51BKoBfs';
export const MOVE_VIDEO_URL='https://www.youtube.com/watch?v='+MOVE_VIDEO_ID;
export const moveOperations=['open','finish','confirm','stop'] as const;
export type MoveOperation=typeof moveOperations[number];
export type MoveState={id:string;status:'active'|'awaiting_confirmation'|'completed'|'stopped';revision:number;lastRequest:string;completedAt?:number};
export type MoveController={control:(operation:'play'|'pause'|'restart')=>Promise<{ok:boolean;reason?:string}>};
export type MovePlayback='loading'|'ready'|'playing'|'paused'|'ended'|'error';
export function advanceMove(old:MoveState|null,operation:MoveOperation,requestId:string):MoveState{
 if(operation==='open')return {id:old&&['active','awaiting_confirmation'].includes(old.status)?old.id:crypto.randomUUID(),status:'active',revision:old?.revision||0,lastRequest:requestId};
 if(!old||!['active','awaiting_confirmation'].includes(old.status))throw Error('Open Daily Move first.');
 if(operation==='confirm'&&old.status!=='awaiting_confirmation')throw Error('Tell Sandy you are finished before confirming completion.');
 return {...old,status:operation==='confirm'?'completed':operation==='finish'?'awaiting_confirmation':'stopped',lastRequest:requestId,...(operation==='confirm'?{completedAt:Date.now()}:{})};
}
export const MOVE_COMING_SOON='Daily Move - coming soon';
export const moveGuidance=`Daily Move is temporarily unavailable. If asked to start Daily Move or play its chair-yoga video, say “${MOVE_COMING_SOON}”. Do not call Daily Move actions or claim to open a video or record a completion.`;
