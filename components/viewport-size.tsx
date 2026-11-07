'use client';
import {useEffect} from 'react';

// Pixel fallback also supports Safari versions without dynamic viewport units.
export function ViewportSize(){
 useEffect(()=>{
  const viewport=window.visualViewport;
  const fit=()=>document.documentElement.style.setProperty('--app-height',`${viewport?.height??window.innerHeight}px`);
  fit();
  window.addEventListener('resize',fit);
  viewport?.addEventListener('resize',fit);
  return()=>{window.removeEventListener('resize',fit);viewport?.removeEventListener('resize',fit);document.documentElement.style.removeProperty('--app-height')};
 },[]);
 return null;
}
