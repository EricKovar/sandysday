'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Play,Pause,Video,X} from 'lucide-react';

export function SavedCheckinVideo({src}:{src:string}){
 const [open,setOpen]=useState(false),[playing,setPlaying]=useState(false),[error,setError]=useState('');
 const dialog=useRef<HTMLDialogElement>(null),video=useRef<HTMLVideoElement>(null),trigger=useRef<HTMLButtonElement>(null),titleId=useId();
 useEffect(()=>{
  if(!open)return;
  const modal=dialog.current;if(!modal)return;
  modal.showModal();
  function fit(){const viewport=window.visualViewport;modal?.style.setProperty('--player-height',`${viewport?.height??window.innerHeight}px`);modal?.style.setProperty('--player-top',`${viewport?.offsetTop??0}px`)}
  fit();window.visualViewport?.addEventListener('resize',fit);window.visualViewport?.addEventListener('scroll',fit);window.addEventListener('resize',fit);
  return()=>{video.current?.pause();modal.close();window.visualViewport?.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('scroll',fit);window.removeEventListener('resize',fit)};
 },[open]);
 function close(){video.current?.pause();setPlaying(false);setError('');setOpen(false);trigger.current?.focus()}
 async function toggle(){const player=video.current;if(!player)return;if(!player.paused){player.pause();return}try{await player.play();setError('')}catch{setError('Playback could not start. Please try again.')}}
 return <><button type="button" ref={trigger} className="secondary receiptVideoButton" aria-haspopup="dialog" onClick={()=>setOpen(true)}><Video size={20}/> View video</button>{open&&<dialog ref={dialog} className="savedCheckinDialog" aria-labelledby={titleId} onCancel={event=>{event.preventDefault();close()}}><h2 id={titleId}>Medication check-in</h2><div className="savedCheckinFrame"><video ref={video} controls playsInline preload="metadata" src={src} aria-label="Full saved medication check-in video" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setError('This video could not be loaded. Close it and try again.')}/></div><div className="savedCheckinControls"><button type="button" className="secondary" onClick={toggle}>{playing?<Pause size={22}/>:<Play size={22}/>} {playing?'Pause':'Play'}</button><button type="button" className="secondary" onClick={close} autoFocus><X size={22}/> Close video</button></div>{error&&<p className="savedCheckinError" role="alert">{error}</p>}</dialog>}</>;
}
