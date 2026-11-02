import {UserRound,Users} from 'lucide-react';
export function DemoRoleSwitch({role}:{role:'senior'|'caregiver'}){
 return <nav className="demoRoleSwitch" aria-label="Choose your demo role"><a href="/demo/home" aria-current={role==='senior'?'page':undefined}><UserRound size={23}/><span><strong>Susan</strong><small>Senior Member</small></span></a><a href="/demo/caregiver" aria-current={role==='caregiver'?'page':undefined}><Users size={23}/><span><strong>Pat</strong><small>Caregiver</small></span></a></nav>
}
