export const activitiesGuidance=`You can find current local activities with find_activities. First ask for a city and state, or ZIP/postal code, if the Senior Member has not provided a clear location in this conversation. Never infer their location from names, the Care Circle, or app test data. Do not request an exact address or device location. Ask one question at a time. Once a location is known, search immediately using any interests they already mentioned, or a varied mix of local social activities. Use activity_location and activity_interests in text; in voice pass location and interests to app_action. Interpret natural follow-ups such as 'What about music?' using their previous location. Do not invent venues, events, dates, costs, availability, accessibility, distances, or bookings. Actual search results with sources are required before recommending specific places or events. Read a short summary aloud without reading URLs. Links remain in the shared chat for the Senior Member and their connected Caregivers. A listing is not a reservation; never claim to book, register, notify, or arrange transport. If a search fails, explain and offer retry; do not substitute made-up results. Searching does not complete Spark or a medication check-in.`;
export function safeSource(value:unknown){try{const u=new URL(String(value));return u.protocol==='https:'&&!u.username&&!u.password?u.href.replace(/\(/g,'%28').replace(/\)/g,'%29'):null}catch{return null}}
export function citedActivities(data:any){
 if(!data.output?.some((item:any)=>item.type==='web_search_call'&&item.status==='completed'))throw Error('No completed search');
 const blocks:any[]=data.output.flatMap((item:any)=>item.content||[]).filter((part:any)=>part.type==='output_text'&&typeof part.text==='string');
 const sources:{url:string;title:string}[]=[];
 const parts:string[]=blocks.map((block:any)=>{
  let text=block.text as string;
  const edits:{start:number;end:number;link:string}[]=[];
  for(const citation of block.annotations||[]){
   if(citation.type!=='url_citation')continue;
   const url=safeSource(citation.url);if(!url||url.length>400)continue;
   let index=sources.findIndex(s=>s.url===url);if(index<0){if(sources.length>=4)continue;index=sources.length;sources.push({url,title:String(citation.title||new URL(url).hostname).slice(0,100)})}
   const start=citation.start_index,end=citation.end_index;
   if(Number.isInteger(start)&&Number.isInteger(end)&&start>=0&&end>=start&&end<=text.length)edits.push({start,end,link:` [Source ${index+1}](${url})`});
  }
  for(const edit of edits.sort((a,b)=>b.end-a.end))text=text.slice(0,edit.end)+edit.link+text.slice(edit.end);
  // Remove opaque provider markers; the actual annotated URLs above remain visible.
  return text.replace(/[^]*/g,'');
 });
 if(!sources.length)throw Error('Search returned no cited sources');
 const body=parts.join('\n\n').trim();if(!body)throw Error('Search returned no summary');
 // Discard model-written links: only URL annotations are trusted as source links.
 let clean=body.replace(/\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,(all,label,url)=>sources.some(s=>s.url===safeSource(url))?all:label).replace(/(?<!\()https?:\/\/[^\s)]+/g,'');
 if(clean.length>2300){clean=clean.slice(0,2300);const opening=clean.lastIndexOf('[');if(opening>clean.lastIndexOf(')'))clean=clean.slice(0,opening);clean+='…'}
 return {reply:clean+'\n\nCheck the organizer’s page for current times, cost, registration, and access details.\n\n'+sources.map((s,i)=>`[Source ${i+1}: ${s.title.replace(/[\[\]()]/g,'')}](${s.url})`).join('\n'),sources};
}
