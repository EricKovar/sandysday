// Keep actual interaction timestamps intact. Sample history never creates video files.
export function demoStamp(actual:number,_started:number){return actual}
export function demoClock(started:number,now=Date.now()){return {now,startedAt:started}}
export const demoSampleCounts=[{checkins:2,spark:1,move:1},{checkins:1,spark:2,move:0},{checkins:2,spark:1,move:2}];
export const demoWelcomeMessages=[
 {id:'demo-welcome',content:'Hello, Donna. Welcome to the interactive demo. You can turn on the mic to talk with me or type in the text box below.'},
 {id:'demo-activities',content:'What would you like to do today?'},
];
export function demoMessages<T extends {id:string;created_at:number}>(messages:T[],started:number){
 const welcome=demoWelcomeMessages.map(message=>({...message,role:'assistant',created_at:started,author_name:'Sandy',author_id:null}));
 return [...welcome,...messages].sort((a,b)=>a.created_at-b.created_at);
}
export function demoRecords<T extends {created_at:string}>(records:T[],started:number){
 const sampleRecords=demoSampleCounts.flatMap((count,i)=>Array.from({length:count.checkins},(_,n)=>{const day=new Date(started);day.setUTCDate(day.getUTCDate()-(3-i));day.setUTCHours(n?18:8,15,0,0);return {id:'sample-checkin-'+i+'-'+n,name:'Donna',created_at:day.toISOString(),bytes:0,sample:true}}));
 return [...records.map(record=>({...record,sample:false})),...sampleRecords].sort((a,b)=>b.created_at.localeCompare(a.created_at));
}
export const demoScenarioGuidance="This is an isolated interactive demo with fictional people Donna (Senior Member) and Pat (Caregiver). Use actual current dates and timestamps, never a simulated Wednesday. Preloaded sample activity is explicitly labeled and has no playable recording. Never claim sample history happened today, and never mark an activity complete based only on chat. Only server-confirmed saved check-ins and completion receipts count as the user's new activity.";
export function demoState<T extends {completedAt?:number}|null>(state:T,_started?:number){return state}
export function demoActualRecords<T extends {created_at:string}>(records:T[],_started:number){return records}
