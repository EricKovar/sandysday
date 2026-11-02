import {Fragment} from 'react';
import {safeSource} from '../lib/activities';
/** Render source links without allowing HTML from AI or web pages. */
export function ChatText({text}:{text:string}){
 const tokens=text.split(/(\[[^\]\n]+\]\(https:\/\/[^\s)]+\))/g);
 return <span className="chatText">{tokens.map((token,i)=>{const match=token.match(/^\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)$/);const url=match&&safeSource(match[2]);return url?<a key={i} href={url} target="_blank" rel="noopener noreferrer">{match![1]}</a>:<Fragment key={i}>{token}</Fragment>})}</span>
}
