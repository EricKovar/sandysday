export type ReportDay={start:number;end:number;checkins:number;spark:number;move:number};
export function weeklyReport(days:ReportDay[],now:number,timeZone:string){
 const included=days.filter(day=>day.start<=now);
 const past=included.filter(day=>day.end<=now);
 const current=included.find(day=>day.start<=now&&day.end>now);
 const totals=included.reduce((sum,day)=>({checkins:sum.checkins+day.checkins,spark:sum.spark+day.spark,move:sum.move+day.move}),{checkins:0,spark:0,move:0});
 const phrase=(n:number,singular:string,plural=singular+'s')=>n+' '+(n===1?singular:plural);
 const counts=(day:{checkins:number;spark:number;move:number})=>phrase(day.checkins,'medication check-in')+', '+phrase(day.spark,'Daily Spark completion')+', and '+phrase(day.move,'Daily Move completion');
 const weekday=(stamp:number)=>new Date(stamp).toLocaleDateString('en-US',{weekday:'long',timeZone});
 const summary='Donna has '+counts(totals)+' recorded this week so far.'+(current?' '+weekday(current.start)+' so far: '+counts(current)+'.':'');
 const coverage=(key:'checkins'|'spark'|'move')=>past.filter(day=>day[key]>0).length;
 const gaps=past.filter(day=>day.move===0).map(day=>weekday(day.start));
 const pattern=past.length?'Across the '+phrase(past.length,'earlier day')+', check-ins were recorded on '+phrase(coverage('checkins'),'day')+', Spark on '+phrase(coverage('spark'),'day')+', and Move on '+phrase(coverage('move'),'day')+'.'+(gaps.length?' No Move completion was recorded '+gaps.join(' or ')+'.':''):'There are no earlier days in this week to compare yet.';
 return {totals,summary,pattern};
}
