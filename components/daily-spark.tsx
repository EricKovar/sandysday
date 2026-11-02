'use client';
import {Sun,Pause,Lightbulb,SkipForward,X} from 'lucide-react';
import {type SparkView,type SparkOperation} from '../lib/spark';
export function DailySpark({spark,busy,onAction}:{spark:SparkView;busy:boolean;onAction:(operation:SparkOperation)=>void}){
 if(!spark||spark.status!=='active')return null;
 return <section className="sparkCard" aria-label="Daily Spark"><div className="sparkHeading"><span><Sun size={21}/> Daily Spark</span><small>Puzzle {spark.round+1} of {spark.total}</small></div><div className="sparkSteps" aria-label={`${spark.round} of ${spark.total} puzzles finished`}>{Array.from({length:spark.total},(_,i)=><span key={i} className={i<spark.round?'done':i===spark.round?'current':''}/>)}</div><span className="eyebrow">{spark.question?.kind}</span><h3>{spark.question?.prompt}</h3><p role="status">{spark.feedback}</p><p className="sparkHelp">Tell Cindy your answer, or type it below. There’s no timer.</p><div className="sparkActions"><button disabled={busy} onClick={()=>onAction('hint')}><Lightbulb size={17}/> A hint</button><button disabled={busy} onClick={()=>onAction('skip')}><SkipForward size={17}/> Skip</button><button disabled={busy} onClick={()=>onAction('pause')}><Pause size={17}/> Pause</button><button disabled={busy} onClick={()=>onAction('stop')}><X size={17}/> Stop Spark</button></div></section>
}
