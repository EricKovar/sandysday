export const sparkOperations=['start','answer','hint','skip','pause','resume','stop'] as const;
export type SparkOperation=typeof sparkOperations[number];
type Question={kind:string;prompt:string;hint:string;answers:string[];solution:string};
const bank:Question[][]=[
 [{kind:'Word connection',prompt:'Which word connects these three: apple, pear, peach?',hint:'They all grow on trees and are something we eat.',answers:['fruit','fruits'],solution:'fruit'},{kind:'Word connection',prompt:'Which word connects robin, sparrow, and owl?',hint:'They have feathers.',answers:['bird','birds'],solution:'birds'},{kind:'Word connection',prompt:'Which word connects piano, guitar, and trumpet?',hint:'We use them to make music.',answers:['instrument','instruments','musical instruments'],solution:'musical instruments'}],
 [{kind:'Finish the saying',prompt:'Finish this saying: a picture is worth a thousand…',hint:'It is something we use when speaking or writing.',answers:['word','words'],solution:'words'},{kind:'Finish the saying',prompt:'Finish this saying: better late than…',hint:'The missing word means not at any time.',answers:['never'],solution:'never'},{kind:'Finish the saying',prompt:'Finish this saying: every cloud has a silver…',hint:'It rhymes with dining.',answers:['lining'],solution:'lining'}],
 [{kind:'Number pattern',prompt:'What comes next: two, four, six…?',hint:'Add two each time.',answers:['eight','8'],solution:'eight'},{kind:'Number pattern',prompt:'What comes next: five, ten, fifteen…?',hint:'Add five each time.',answers:['twenty','20'],solution:'twenty'},{kind:'Number pattern',prompt:'What comes next: ten, nine, eight…?',hint:'Count down by one.',answers:['seven','7'],solution:'seven'}],
 [{kind:'Odd one out',prompt:'Which is the odd one out: carrot, potato, or banana?',hint:'Two are vegetables; one is a fruit.',answers:['banana','the banana'],solution:'banana'},{kind:'Odd one out',prompt:'Which is the odd one out: bicycle, car, or tulip?',hint:'Two can take you somewhere.',answers:['tulip','the tulip'],solution:'tulip'},{kind:'Odd one out',prompt:'Which is the odd one out: winter, summer, or Tuesday?',hint:'Two are seasons.',answers:['tuesday'],solution:'Tuesday'}],
 [{kind:'Gentle riddle',prompt:'What has hands and a face, but cannot clap or smile?',hint:'It tells you the time.',answers:['clock','watch'],solution:'a clock or watch'},{kind:'Gentle riddle',prompt:'What gets wetter as it dries you?',hint:'You might use it after a bath.',answers:['towel'],solution:'a towel'},{kind:'Gentle riddle',prompt:'What has pages and a cover, but is not a bed?',hint:'You can read it.',answers:['book','magazine'],solution:'a book or magazine'}]
];
export type SparkState={id:string;status:'active'|'paused'|'completed'|'stopped';round:number;correct:number;skipped:number;variant:number;revision:number;lastRequest:string;feedback:string;completedAt?:number};
export function question(s:SparkState){return bank[s.round]?.[s.variant%3]}
export function publicSpark(s:SparkState|null){if(!s)return null;const q=question(s);return {id:s.id,status:s.status,round:s.round,total:bank.length,correct:s.correct,skipped:s.skipped,revision:s.revision,feedback:s.feedback,completedAt:s.completedAt,question:s.status==='active'||s.status==='paused'?{kind:q.kind,prompt:q.prompt}:null}}
const normalize=(s:string)=>s.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
export function advanceSpark(current:SparkState|null,op:SparkOperation,text:string,requestId:string):SparkState{
 if(op==='start'){
  if(current&&['active','paused'].includes(current.status))return {...current,status:'active',lastRequest:requestId,feedback:'Let’s continue where we left off.'};
  return {id:crypto.randomUUID(),status:'active',round:0,correct:0,skipped:0,variant:current?(current.variant+1)%3:Math.floor(Math.random()*3),revision:current?.revision||0,lastRequest:requestId,feedback:'Let’s try five little puzzles, one at a time. There’s no timer. You can ask for a hint, skip, or stop.'};
 }
 if(!current)throw Error('Ask Cindy to start Daily Spark first.');
 if(['completed','stopped'].includes(current.status))throw Error('This Spark session has ended. You can start a new one.');
 const s={...current,lastRequest:requestId};
 if(op==='stop'){s.status='stopped';s.feedback='We’ve stopped Daily Spark. You can try another time.';return s}
 if(op==='pause'){s.status='paused';s.feedback='Daily Spark is paused. Your place is saved.';return s}
 if(op==='resume'){s.status='active';s.feedback='Let’s pick up here.';return s}
 if(s.status==='paused')throw Error('Daily Spark is paused. Say “resume Spark” when you’re ready.');
 const q=question(s);
 if(op==='hint'){s.feedback=q.hint;return s}
 if(op==='answer'){
  const answer=normalize(text);
  // Accept short spoken phrases, but never treat a negated answer as correct.
  const correct=!/\b(not|isnt|is not|dont|do not|no)\b/.test(answer)&&q.answers.some(a=>(' '+answer+' ').includes(' '+normalize(a)+' '));
  if(!correct){s.feedback='That’s not the answer I have. Would you like a hint, another try, or to skip?';return s}
  s.correct++;s.feedback=['That’s it.','You’ve got it.','Yes, that fits.'][s.round%3];
 }else if(op==='skip'){s.skipped++;s.feedback='The answer is '+q.solution+'. Let’s move on.'}else throw Error('That Spark action is not available.');
 s.round++;
 if(s.round===bank.length){s.status='completed';s.completedAt=Date.now();s.feedback='Daily Spark completed. You worked through five puzzles'+(s.skipped?' with '+s.skipped+' skipped':'')+'. Thanks for spending a little time with me.'}
 return s;
}
export const sparkGuidance=`Daily Spark is available inside this conversation. Use open_spark when the Senior Member asks to play a game, do a puzzle, or start Daily Spark. For an active Spark, use spark_answer for their answer, spark_hint for a hint, spark_skip to skip, spark_pause to pause, spark_resume to resume, and spark_stop to stop. Interpret natural intent in context; do not require exact phrases. While Spark is active, a simple yes or no relates to the current Spark exchange, never medication consent unless the Senior Member clearly reopens that topic. Ordinary conversation is still allowed during Spark; do not treat every unrelated comment as an answer. Current Spark question and progress come ONLY from server-confirmed Spark state. Do not invent puzzles, reveal solutions, grade answers, advance rounds, or declare completion yourself. Execute the action, then use its actual feedback and question, one question at a time. When Spark is paused, wait without repeated prompting. A stopped session is not completed. If medication is requested during Spark, pause Spark before opening the camera. Move is not available yet.`;
export type SparkView=ReturnType<typeof publicSpark>;
