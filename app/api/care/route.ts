import {getAppUser} from '../../../lib/app-user';
import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {checkOrigin} from '../../../lib/server-cindy';
import {hashToken} from '../../../lib/care-server';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
const clean=(value:unknown,max=60)=>String(value||'').trim().slice(0,max);
export async function GET(request?:Request){
 const user=await getAppUser(request);if(!user)return json({error:'Please sign in to see your Care Circle.'},401);
 const profile=await env.DB!.prepare('SELECT name,role FROM care_profiles WHERE user_id=?').bind(user.userId).first();
 const connections=await env.DB!.prepare('SELECT id,senior_id,caregiver_id,senior_name,caregiver_name,created_at FROM care_connections WHERE senior_id=? OR caregiver_id=? ORDER BY created_at DESC').bind(user.userId,user.userId).all();
 const invitations=await env.DB!.prepare("SELECT id,creator_id,creator_name,creator_role,target_name,target_email,status,expires_at,created_at FROM care_invitations WHERE (creator_id=? OR target_email=?) AND status='pending' AND expires_at>? ORDER BY created_at DESC").bind(user.userId,user.email.toLowerCase(),Date.now()).all();
 return json({user_id:user.userId,email:user.email,profile:profile||{name:user.fullName?.split(' ')[0]||'',role:'senior'},connections:connections.results,invitations:invitations.results});
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'Please sign in to manage your Care Circle.'},401);if(!checkOrigin(request))return json({error:'This request could not be verified.'},403);
 let b:any;try{b=await request.json()}catch{return json({error:'Invalid request.'},400)}const now=Date.now();const email=user.email.toLowerCase();
 if(b.action==='save_profile'){
 const name=clean(b.name);const role=b.role;if(!name||!['senior','caregiver'].includes(role))return json({error:'Please enter your first name and choose your role.'},400);
 await env.DB!.prepare('INSERT INTO care_profiles (user_id,name,role) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,role=excluded.role').bind(user.userId,name,role).run();return json({ok:true});
 }
 if(b.action==='create_invite'){
 const name=clean(b.name),targetName=clean(b.target_name),targetEmail=clean(b.target_email,254).toLowerCase(),role=b.role;
 if(!name||!targetName||!['senior','caregiver'].includes(role)||!/^\S+@\S+\.\S+$/.test(targetEmail))return json({error:'Please enter both first names, a valid email, and your role.'},400);
 if(targetEmail===email)return json({error:'Use the other person’s email. You cannot connect to yourself.'},400);if(b.consent!==true)return json({error:'Please confirm the video-sharing terms before creating an invitation.'},400);
 const existing=await env.DB!.prepare("SELECT id FROM care_invitations WHERE creator_id=? AND target_email=? AND status='pending' AND expires_at>?").bind(user.userId,targetEmail,now).first();if(existing)return json({error:'An invitation for this email is already pending. Cancel it first to create a fresh link.'},409);
 const token=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');const id=crypto.randomUUID();const expires=now+7*24*60*60*1000;
 await env.DB!.batch([
 env.DB!.prepare('INSERT INTO care_profiles (user_id,name,role) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,role=excluded.role').bind(user.userId,name,role),
 env.DB!.prepare('INSERT INTO care_invitations (id,token_hash,creator_id,creator_name,creator_role,target_email,target_name,status,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,await hashToken(token),user.userId,name,role,targetEmail,targetName,'pending',expires,now)
 ]);
 return json({ok:true,id,token,expires_at:expires});
 }
 if(b.action==='revoke_invite'){
 const row=await env.DB!.prepare("SELECT id FROM care_invitations WHERE id=? AND creator_id=? AND status='pending'").bind(clean(b.id,100),user.userId).first();if(!row)return json({error:'That pending invitation was not found.'},404);
 await env.DB!.prepare("UPDATE care_invitations SET status='revoked' WHERE id=? AND creator_id=? AND status='pending'").bind(clean(b.id,100),user.userId).run();return json({ok:true});
 }
 if(b.action==='disconnect'){
 const row=await env.DB!.prepare('SELECT id FROM care_connections WHERE id=? AND (senior_id=? OR caregiver_id=?)').bind(clean(b.id,100),user.userId,user.userId).first();if(!row)return json({error:'That connection was not found.'},404);
 await env.DB!.prepare('DELETE FROM care_connections WHERE id=? AND (senior_id=? OR caregiver_id=?)').bind(clean(b.id,100),user.userId,user.userId).run();return json({ok:true});
 }
 if(['inspect_invite','respond_invite'].includes(b.action)){
 const token=clean(b.token,128);const id=clean(b.id,100);let invite:any;
 if(token)invite=await env.DB!.prepare('SELECT * FROM care_invitations WHERE token_hash=?').bind(await hashToken(token)).first();
 else if(id)invite=await env.DB!.prepare('SELECT * FROM care_invitations WHERE id=?').bind(id).first();
 if(!invite||invite.target_email!==email||invite.creator_id===user.userId)return json({error:'This invitation is for a different account, or the link is invalid. Sign in with the invited email.'},404);
 if(invite.status!=='pending'||invite.expires_at<=now)return json({error:'This invitation has expired, was cancelled, or has already been used. Ask for a fresh invitation.'},410);
 if(b.action==='inspect_invite')return json({invite:{id:invite.id,creator_name:invite.creator_name,creator_role:invite.creator_role,target_name:invite.target_name,expires_at:invite.expires_at}});
 if(b.decision==='decline'){await env.DB!.prepare("UPDATE care_invitations SET status='declined' WHERE id=? AND target_email=? AND status='pending'").bind(invite.id,email).run();return json({ok:true,declined:true})}
 if(b.decision!=='connect'||b.consent!==true)return json({error:'Please confirm video sharing before connecting.'},400);
 const name=clean(b.name)||invite.target_name;const senior=invite.creator_role==='senior'?invite.creator_id:user.userId;const caregiver=invite.creator_role==='caregiver'?invite.creator_id:user.userId;const seniorName=invite.creator_role==='senior'?invite.creator_name:name;const caregiverName=invite.creator_role==='caregiver'?invite.creator_name:name;const linkId=crypto.randomUUID();
 await env.DB!.batch([
 env.DB!.prepare("INSERT OR IGNORE INTO care_connections (id,senior_id,caregiver_id,senior_name,caregiver_name,created_at) SELECT ?,?,?,?,?,? FROM care_invitations WHERE id=? AND target_email=? AND status='pending' AND expires_at>?").bind(linkId,senior,caregiver,seniorName,caregiverName,now,invite.id,email,now),
 env.DB!.prepare("UPDATE care_invitations SET status='accepted',accepted_by=? WHERE id=? AND target_email=? AND status='pending' AND expires_at>? AND EXISTS (SELECT 1 FROM care_connections WHERE senior_id=? AND caregiver_id=?)").bind(user.userId,invite.id,email,now,senior,caregiver),
 env.DB!.prepare('INSERT INTO care_profiles (user_id,name,role) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,role=excluded.role').bind(user.userId,name,invite.creator_role==='senior'?'caregiver':'senior')
 ]);
 const accepted=await env.DB!.prepare('SELECT status,accepted_by FROM care_invitations WHERE id=?').bind(invite.id).first<any>();if(accepted?.status!=='accepted'||accepted.accepted_by!==user.userId)return json({error:'The invitation changed before it could be accepted. Refresh your Care Circle.'},409);
 return json({ok:true,connected:true,role:invite.creator_role==='senior'?'caregiver':'senior',senior_name:seniorName,caregiver_name:caregiverName});
 }
 return json({error:'Unknown Care Circle action.'},400);
}
