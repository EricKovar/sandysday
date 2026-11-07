'use client';
import {useEffect,useImperativeHandle,useRef,useState,type RefObject} from 'react';
import {PersonStanding,Play,Pause,RotateCcw,Square,Check} from 'lucide-react';
import {MOVE_VIDEO_ID,MOVE_VIDEO_URL,type MoveController,type MoveState,type MovePlayback} from '../lib/move';
let loadingAPI:Promise<void>|null=null;
function youtubeAPI(){
 const w=window as any;if(w.YT?.Player)return Promise.resolve();
 if(!loadingAPI)loadingAPI=new Promise<void>((resolve,reject)=>{
  const script=document.createElement('script');let settled=false;
  const timer=setTimeout(()=>finish(false),15000);
  function finish(ok:boolean){if(settled)return;settled=true;clearTimeout(timer);if(ok)resolve();else{script.remove();loadingAPI=null;reject(Error('YouTube could not load.'))}}
  const previous=w.onYouTubeIframeAPIReady;w.onYouTubeIframeAPIReady=()=>{if(typeof previous==='function')previous();finish(true)};
  script.src='https://www.youtube.com/iframe_api';script.async=true;script.onerror=()=>finish(false);document.head.appendChild(script);
 });return loadingAPI;
}
export function DailyMove({move,controllerRef,onPlayback,onAction,busy}:{move:MoveState;controllerRef:RefObject<MoveController|null>;onPlayback:(state:MovePlayback)=>void;onAction:(action:'move_play'|'move_pause'|'move_restart'|'move_stop'|'move_finish'|'move_confirm'|'open_move')=>void;busy:boolean}){
 const container=useRef<HTMLDivElement>(null),player=useRef<any>(null),ready=useRef(false),pending=useRef<{state:number;resolve:(r:{ok:boolean;reason?:string})=>void}|null>(null),callbacks=useRef(onPlayback);callbacks.current=onPlayback;
 const [playback,setPlayback]=useState<MovePlayback>('loading'),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 function report(state:MovePlayback){setPlayback(state);callbacks.current(state)}
 useImperativeHandle(controllerRef,()=>({control:async(operation)=>{
  if(!ready.current||!player.current)return {ok:false,reason:'The video is not ready. Wait a moment or use the YouTube Play button.'};
  pending.current?.resolve({ok:false,reason:'Playback request replaced.'});
  const target=operation==='pause'?2:1;
  const promise=new Promise<{ok:boolean;reason?:string}>(resolve=>{pending.current={state:target,resolve};setTimeout(()=>{if(pending.current?.resolve===resolve){pending.current=null;resolve({ok:false,reason:'YouTube has not confirmed playback. Tap Play in the video if your browser is blocking it.'})}},5000)});
  try{if(operation==='pause')player.current.pauseVideo();else{if(operation==='restart')player.current.seekTo(0,true);player.current.playVideo()}if(player.current.getPlayerState()===target){pending.current?.resolve({ok:true});pending.current=null}}
  catch{pending.current?.resolve({ok:false,reason:'The YouTube player could not perform that action.'});pending.current=null}
  return promise;
 }}),[]);
 useEffect(()=>{
  let active=true;ready.current=false;setError('');report('loading');
  youtubeAPI().then(()=>{
   if(!active||!container.current)return;const target=document.createElement('div');container.current.replaceChildren(target);
   player.current=new (window as any).YT.Player(target,{host:'https://www.youtube-nocookie.com',videoId:MOVE_VIDEO_ID,width:'100%',height:'100%',playerVars:{origin:window.location.origin,playsinline:1,autoplay:0,rel:0,controls:1},events:{
    onReady:()=>{if(!active)return;ready.current=true;const iframe=player.current.getIframe();iframe.title='Daily Move chair yoga';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';report('ready')},
    onStateChange:(e:any)=>{if(!active)return;if(e.data===1)setError('');const state=e.data===1?'playing':e.data===2?'paused':e.data===0?'ended':null;if(state)report(state);const task=pending.current;if(task&&task.state===e.data){task.resolve({ok:true});pending.current=null}},
    onAutoplayBlocked:()=>{if(!active)return;setError('Your browser needs a tap. Press Play in the video to begin.');pending.current?.resolve({ok:false,reason:'Your browser needs you to tap Play in the video.'});pending.current=null},
    onError:()=>{if(!active)return;ready.current=false;report('error');setError('This video could not play here. You can retry or open the same video on YouTube.');pending.current?.resolve({ok:false,reason:'YouTube could not play this video.'});pending.current=null}
   }});
  }).catch(()=>{if(active){report('error');setError('YouTube could not load. Check your connection and try again.')}});
  return()=>{active=false;ready.current=false;pending.current?.resolve({ok:false,reason:'The video was closed.'});pending.current=null;player.current?.destroy();player.current=null;callbacks.current('paused')};
 },[move.id,retry]);
 const confirming=move.status==='awaiting_confirmation';
 return <section className="moveCard" aria-label="Daily Move chair yoga"><div className="sparkHeading"><span><PersonStanding size={21}/> Daily Move</span><small>Chair yoga · YouTube</small></div><div className="movePlayer" ref={container}/>{error&&<p className="moveError" role="alert">{error} <button onClick={()=>setRetry(n=>n+1)}>Retry video</button></p>}<p className="moveStatus" role="status">{confirming?'Would you like to mark your chair yoga as completed?':playback==='playing'?'Playing. Say “Sandy, pause” or “Sandy, stop.”':playback==='loading'?'Loading the video…':playback==='paused'?'Paused. Sandy is listening if your microphone is on.':'Ready when you are. Press Play or say “Sandy, play.”'}</p><div className="sparkActions">{confirming?<><button disabled={busy} onClick={()=>onAction('move_confirm')}><Check size={17}/> Yes, completed</button><button disabled={busy} onClick={()=>onAction('open_move')}>Not yet</button></>:<><button disabled={busy||playback==='loading'||playback==='error'} onClick={()=>onAction(playback==='playing'?'move_pause':'move_play')}>{playback==='playing'?<Pause size={17}/>:<Play size={17}/>} {playback==='playing'?'Pause video':'Play video'}</button><button disabled={busy||playback==='loading'||playback==='error'} onClick={()=>onAction('move_restart')}><RotateCcw size={17}/> Start over</button><button disabled={busy} onClick={()=>onAction('move_finish')}><Check size={17}/> I’m finished</button></>}<button disabled={busy} onClick={()=>onAction('move_stop')}><Square size={17}/> Stop and close</button></div><a className="moveSource" href={MOVE_VIDEO_URL} target="_blank" rel="noopener noreferrer">Open this video on YouTube ↗</a></section>
}
