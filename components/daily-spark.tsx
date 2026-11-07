'use client';

import {Sun, Pause, Lightbulb, SkipForward, X, ArrowRight} from 'lucide-react';
import {type SparkView, type SparkOperation} from '../lib/spark';

export function DailySpark({spark, busy, retryAdvance, onAction}: {
 spark: SparkView;
 busy: boolean;
 retryAdvance: boolean;
 onAction: (operation: SparkOperation) => void;
}){
 if(!spark || spark.status !== 'active')return null;
 const {round, total, awaitingNext, feedback, question} = spark;
 const finished = round + Number(awaitingNext);

 return (
  <section className="sparkCard" aria-label="Daily Spark">
   <div className="sparkHeading">
    <span><Sun size={21}/> Daily Spark</span>
    <small>Puzzle {round + 1} of {total}</small>
   </div>
   <div className="sparkSteps" aria-label={`${finished} of ${total} puzzles finished`}>
    {Array.from({length:total}, (_, i) => <span key={i} className={i < finished ? 'done' : i === round ? 'current' : ''}/>)}
   </div>
   <span className="eyebrow">{question?.kind}</span>
   <h3>{question?.prompt}</h3>
   {feedback && <p className="sparkFeedback" role="status">{feedback}</p>}
   {!awaitingNext && <p className="sparkHelp">Tell Sandy your answer, or type it below.</p>}
   <div className="sparkActions">
    {awaitingNext && (!spark.autoAdvance || retryAdvance) && (
     <button className="sparkNext" disabled={busy} onClick={() => onAction('next')}>
      {retryAdvance ? 'Try again' : round + 1 === total ? 'Finish Spark' : 'Next question'} <ArrowRight size={17}/>
     </button>
    )}
    {!awaitingNext && (
     <>
      <button disabled={busy} onClick={() => onAction('hint')}><Lightbulb size={17}/> A hint</button>
      <button disabled={busy} onClick={() => onAction('skip')}><SkipForward size={17}/> Skip</button>
     </>
    )}
    <button disabled={busy} onClick={() => onAction('pause')}><Pause size={17}/> Pause</button>
    <button disabled={busy} onClick={() => onAction('stop')}><X size={17}/> Stop Spark</button>
   </div>
  </section>
 );
}
