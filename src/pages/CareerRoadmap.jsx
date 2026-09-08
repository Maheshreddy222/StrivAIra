import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════
   FORM STEPS
═══════════════════════════════════════════════════ */
const STEPS = [
  {
    id: "basics", title: "Who are you?", subtitle: "Let's start with the fundamentals", icon:"◎",
    fields: [
      { key: "name", label: "Your Name", type: "text", placeholder: "e.g. Arjun Sharma", required: true },
      { key: "currentRole", label: "Current Role / Status", type: "text", placeholder: "e.g. CS Final Year Student, Junior Developer…", required: true },
      { key: "experience", label: "Years of Experience", type: "select", options: ["0 (Student/Fresher)", "< 1 year", "1–2 years", "3–5 years", "5–10 years", "10+ years"], required: true },
      { key: "education", label: "Highest Education", type: "select", options: ["High School", "Diploma", "B.Tech / B.E.", "B.Sc / BCA", "M.Tech / M.E.", "MBA", "PhD", "Self-taught / Bootcamp"], required: true },
    ],
  },
  {
    id: "skills", title: "What do you know?", subtitle: "Be honest — this shapes your starting point", icon: "✦",
    fields: [
      { key: "currentSkills", label: "Current Skills (comma-separated)", type: "textarea", placeholder: "e.g. Python, SQL, basic React, Excel, Figma…", required: true },
      { key: "strongestSkill", label: "Your Strongest Skill", type: "text", placeholder: "The one thing you're most confident about", required: true },
      { key: "weaknesses", label: "Areas You Feel Weak In", type: "textarea", placeholder: "e.g. System Design, DSA, Communication…", required: false },
      { key: "learningStyle", label: "How Do You Learn Best?", type: "select", options: ["Video courses (YouTube/Udemy)", "Reading docs & books", "Building projects", "Mentorship / Coaching", "Structured bootcamps", "Mix of everything"], required: true },
    ],
  },
  {
    id: "goals", title: "Where do you want to go?", subtitle: "Dream big — then we'll make it real", icon: "◈",
    fields: [
      { key: "targetRole", label: "Target Role / Dream Job", type: "text", placeholder: "e.g. ML Engineer at a startup, Senior SDE at FAANG…", required: true },
      { key: "targetTimeline", label: "Your Timeline", type: "select", options: ["3 months", "6 months", "1 year", "2 years", "3+ years"], required: true },
      { key: "preferredDomain", label: "Preferred Domain", type: "select", options: ["Frontend Development", "Backend Development", "Full Stack", "Data Science / ML / AI", "DevOps / Cloud", "Cybersecurity", "Mobile (iOS/Android)", "Product Management", "UI/UX Design", "Data Engineering", "Game Development", "Blockchain / Web3", "Other"], required: true },
      { key: "workPreference", label: "Work Preference", type: "select", options: ["Product Company (startup)", "Product Company (MNC/FAANG)", "Service Company", "Freelancing", "Research / Academia", "Government / PSU", "Open to anything"], required: true },
    ],
  },
  {
    id: "context", title: "Tell us more", subtitle: "The details that make your roadmap uniquely yours", icon: "⌁",
    fields: [
      { key: "location", label: "Location / Target Market", type: "text", placeholder: "e.g. Hyderabad, India · Remote · USA", required: true },
      { key: "availability", label: "Hours Per Day to Learn", type: "select", options: ["< 1 hour", "1–2 hours", "2–4 hours", "4–6 hours", "Full-time (8+ hours)"], required: true },
      { key: "constraints", label: "Any Constraints or Challenges?", type: "textarea", placeholder: "e.g. Working a day job, family responsibilities…", required: false },
      { key: "additionalContext", label: "Anything Else We Should Know?", type: "textarea", placeholder: "Certifications, projects, passions, side hustles…", required: false },
    ],
  },
];

const SYSTEM_PROMPT = `You are an expert career coach. Return ONLY valid JSON — no markdown fences, no preamble.

Schema:
{
  "meta": {
    "name": "string",
    "targetRole": "string",
    "summary": "2-3 sentence personalized overview",
    "currentLevel": "Beginner|Intermediate|Advanced",
    "timeline": "realistic timeline string",
    "salary": "salary range for their location and target role"
  },
  "tree": {
    "id": "root",
    "label": "START",
    "sublabel": "Your current position",
    "type": "root",
    "children": [
      {
        "id": "phase-1",
        "label": "Phase Name",
        "sublabel": "Month 1-2",
        "type": "phase",
        "color": "blue",
        "children": [
          {
            "id": "skill-1-1",
            "label": "Skill or Topic",
            "sublabel": "Learn · Build",
            "type": "skill",
            "detail": "2 sentences: why this skill matters and how to approach it",
            "resources": [
              {"name": "Real resource name", "type": "Course|Book|Platform|Tool", "priority": "Must|Good|Optional"}
            ],
            "milestones": ["Concrete milestone 1", "Concrete milestone 2", "Concrete milestone 3"],
            "estimatedTime": "2-3 weeks",
            "difficulty": "Beginner|Intermediate|Advanced"
          }
        ]
      }
    ]
  },
  "extras": {
    "quickWins": ["specific action 1", "specific action 2", "specific action 3"],
    "warnings": ["honest concern 1", "honest concern 2"],
    "goalNode": { "id": "goal", "label": "TARGET ROLE", "sublabel": "Your destination" }
  }
}

Rules:
- 4-5 phases
- 3-4 skill nodes per phase
- Skill nodes have empty children arrays
- color: blue, green, yellow, pink, cyan, purple (vary per phase)
- Use real resource names (Neetcode, CS50, The Odin Project, etc.)
- Be brutally honest about timelines
- Add estimatedTime and difficulty to each skill`;

const buildPrompt = (d) => `Name: ${d.name}, Role: ${d.currentRole}, Exp: ${d.experience}, Edu: ${d.education}
Skills: ${d.currentSkills}, Best: ${d.strongestSkill}, Weak: ${d.weaknesses||"n/a"}
Learning: ${d.learningStyle}, Target: ${d.targetRole}, Timeline: ${d.targetTimeline}
Domain: ${d.preferredDomain}, Work: ${d.workPreference}, Location: ${d.location}
Hours/day: ${d.availability}, Constraints: ${d.constraints||"none"}, Extra: ${d.additionalContext||"none"}`;


/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════ */
const PAL = {
  blue:   { bg:"#eff6ff", border:"#1d4ed8", stroke:"#3b82f6", glow:"#3b82f6", text:"#1d4ed8", accent:"#2563eb", dim:"rgba(59,130,246,0.12)", particle:"59,130,246" },
  green:  { bg:"#f0fdf4", border:"#15803d", stroke:"#22c55e", glow:"#22c55e", text:"#15803d", accent:"#16a34a", dim:"rgba(34,197,94,0.12)",  particle:"34,197,94"  },
  yellow: { bg:"#fffbeb", border:"#b45309", stroke:"#f59e0b", glow:"#f59e0b", text:"#b45309", accent:"#d97706", dim:"rgba(245,158,11,0.12)", particle:"245,158,11" },
  pink:   { bg:"#fdf2f8", border:"#9d174d", stroke:"#ec4899", glow:"#ec4899", text:"#9d174d", accent:"#db2777", dim:"rgba(236,72,153,0.12)", particle:"236,72,153" },
  cyan:   { bg:"#ecfeff", border:"#0e7490", stroke:"#06b6d4", glow:"#06b6d4", text:"#0e7490", accent:"#0891b2", dim:"rgba(6,182,212,0.12)",  particle:"6,182,212"  },
  purple: { bg:"#faf5ff", border:"#7e22ce", stroke:"#a855f7", glow:"#a855f7", text:"#7e22ce", accent:"#9333ea", dim:"rgba(168,85,247,0.12)", particle:"168,85,247" },
  root:   { bg:"#eef2ff", border:"#4338ca", stroke:"#6366f1", glow:"#818cf8", text:"#4338ca", accent:"#4f46e5", dim:"rgba(99,102,241,0.14)",  particle:"99,102,241" },
  goal:   { bg:"#fffbeb", border:"#92400e", stroke:"#f59e0b", glow:"#fbbf24", text:"#92400e", accent:"#b45309", dim:"rgba(251,191,36,0.14)",  particle:"251,191,36" },
};

const DIFF_COLOR = { Beginner:"#16a34a", Intermediate:"#b45309", Advanced:"#dc2626" };
const DIFF_BG    = { Beginner:"rgba(52,211,153,.15)", Intermediate:"rgba(251,191,36,.15)", Advanced:"rgba(248,113,113,.15)" };
const PRI_COLOR  = { Must:"#dc2626", Good:"#fbbf24", Optional:"#64748b" };
const PRI_BG     = { Must:"rgba(248,113,113,.13)", Good:"rgba(251,191,36,.13)", Optional:"rgba(148,163,184,.1)" };
const TYPE_ICON  = { Course:"🎓", Book:"📚", Platform:"💻", Tool:"🔧", Community:"👥" };

/* ═══════════════════════════════════════════════════
   LAYOUT ENGINE
═══════════════════════════════════════════════════ */
const NW = { root:176, phase:200, skill:178, goal:176 };
const NH = { root:80,  phase:84,  skill:74,  goal:80  };
const VGAP = 110;
const HGAP = 32;

function subtreeW(n) {
  if (!n.children?.length) return NW[n.type]||178;
  const cw = n.children.reduce((s,c)=>s+subtreeW(c),0) + HGAP*(n.children.length-1);
  return Math.max(NW[n.type]||178, cw);
}

function doLayout(node, cx, y, out=[], edges=[]) {
  const nw=NW[node.type]||178, nh=NH[node.type]||74;
  out.push({...node, cx, cy:y+nh/2, x:cx-nw/2, y, w:nw, h:nh});
  if (!node.children?.length) return;
  const cy2 = y+nh+VGAP;
  const tot = node.children.reduce((s,c)=>s+subtreeW(c),0)+HGAP*(node.children.length-1);
  let cur = cx-tot/2;
  node.children.forEach(child=>{
    const sw=subtreeW(child), ccx=cur+sw/2;
    edges.push({x1:cx, y1:y+nh, x2:ccx, y2:cy2, color:child.color||node.color||"root", childType:child.type});
    doLayout(child, ccx, cy2, out, edges);
    cur+=sw+HGAP;
  });
}

function buildGraph(tree, goalNode) {
  const nodes=[], edges=[];
  doLayout(tree, 0, 0, nodes, edges);
  const maxY = nodes.reduce((m,n)=>Math.max(m,n.y+n.h),0);
  const goalY = maxY+VGAP;
  nodes.push({...goalNode, type:"goal", cx:0, cy:goalY+NH.goal/2, x:-NW.goal/2, y:goalY, w:NW.goal, h:NH.goal});
  // convergence lines from skills → goal
  nodes.filter(n=>n.type==="skill").forEach(n=>{
    edges.push({x1:n.cx, y1:n.y+n.h, x2:0, y2:goalY, color:"goal", isGoal:true});
  });
  const allX=nodes.flatMap(n=>[n.x,n.x+n.w]);
  const allY=nodes.flatMap(n=>[n.y,n.y+n.h]);
  return {
    nodes, edges,
    minX:Math.min(...allX)-80, minY:Math.min(...allY)-80,
    maxX:Math.max(...allX)+80, maxY:Math.max(...allY)+80,
  };
}


/* ═══════════════════════════════════════════════════
   SKILL MODAL — full-screen overlay
═══════════════════════════════════════════════════ */
function SkillModal({ node, onClose }) {
  const pal = PAL[node.color] || PAL.blue;
  useEffect(()=>{
    const handler = e=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return ()=>window.removeEventListener("keydown", handler);
  },[onClose]);

  return (
    <div
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0, zIndex:9999,
        background:"rgba(0,0,0,0.75)",
        backdropFilter:"blur(14px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"24px",
        animation:"modalBgIn 0.2s ease both",
      }}
    >
      <div style={{
        width:"100%", maxWidth:620, maxHeight:"88vh", overflowY:"auto",
        background:`linear-gradient(145deg, ${pal.bg} 0%, #ffffff 100%)`,
        border:`1px solid ${pal.border}`,
        borderRadius:24,
        boxShadow:`0 0 0 1px ${pal.stroke}22, 0 32px 80px rgba(15,23,42,0.25), 0 0 60px ${pal.glow}20`,
        animation:"modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        position:"relative",
        overflow:"hidden",
      }}>
        {/* Top glow bar */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:3,
          background:`linear-gradient(90deg, transparent 0%, ${pal.stroke} 30%, ${pal.accent} 60%, transparent 100%)`,
          opacity:0.9,
        }}/>

        {/* Background glow orb */}
        <div style={{
          position:"absolute", top:-60, right:-60, width:260, height:260, borderRadius:"50%",
          background:`radial-gradient(circle, ${pal.dim} 0%, transparent 70%)`,
          pointerEvents:"none",
        }}/>

        <div style={{ padding:"32px 32px 28px", position:"relative" }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:24 }}>
            <div style={{ flex:1 }}>
              {/* Breadcrumb tag */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, background:pal.dim, color:pal.accent, border:`1px solid ${pal.stroke}40`, textTransform:"uppercase", letterSpacing:".09em" }}>
                  {node.sublabel || "Skill"}
                </span>
                {node.difficulty && (
                  <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, background:DIFF_BG[node.difficulty]||DIFF_BG.Beginner, color:DIFF_COLOR[node.difficulty]||DIFF_COLOR.Beginner, textTransform:"uppercase", letterSpacing:".09em" }}>
                    {node.difficulty}
                  </span>
                )}
                {node.estimatedTime && (
                  <span style={{ fontSize:10, fontWeight:600, color:"#475569", display:"flex", alignItems:"center", gap:4 }}>
                    ⏱ {node.estimatedTime}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize:26, fontWeight:800, color:pal.text, margin:"0 0 10px", letterSpacing:"-.02em", lineHeight:1.2 }}>
                {node.label}
              </h2>

              {node.detail && (
                <p style={{ fontSize:14, color:"#64748b", lineHeight:1.8, margin:0 }}>
                  {node.detail}
                </p>
              )}
            </div>

            <button onClick={onClose} style={{
              width:36, height:36, borderRadius:12, flexShrink:0,
              background:"#e5e7eb", border:"1px solid #cbd5e1",
              color:"#64748b", cursor:"pointer", fontSize:18,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .15s",
            }}>×</button>
          </div>

          {/* Divider */}
          <div style={{ height:1, background:`linear-gradient(90deg, ${pal.stroke}40, transparent)`, marginBottom:24 }}/>

          {/* Two-column grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>

            {/* Milestones */}
            {node.milestones?.length>0 && (
              <div style={{ background:"#f8fafc", border:"1px solid #e5e7eb", borderRadius:16, padding:"18px 16px" }}>
                <p style={{ fontSize:10, fontWeight:700, color:pal.accent, textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 14px", display:"flex", alignItems:"center", gap:6 }}>
                  <span>🏁</span> Milestones
                </p>
                {node.milestones.map((m,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:pal.dim, border:`1px solid ${pal.stroke}50`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:10, fontWeight:800, color:pal.accent, marginTop:1 }}>{i+1}</div>
                    <p style={{ fontSize:12.5, color:"#64748b", margin:0, lineHeight:1.65 }}>{m}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Resources */}
            {node.resources?.length>0 && (
              <div style={{ background:"#f8fafc", border:"1px solid #e5e7eb", borderRadius:16, padding:"18px 16px" }}>
                <p style={{ fontSize:10, fontWeight:700, color:pal.accent, textTransform:"uppercase", letterSpacing:".1em", margin:"0 0 14px", display:"flex", alignItems:"center", gap:6 }}>
                  <span>📚</span> Resources
                </p>
                {node.resources.map((r,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:10, padding:"9px 11px", background:"#f8fafc", borderRadius:10, border:`1px solid ${pal.stroke}18` }}>
                    <div style={{ display:"flex", gap:7, flex:1, alignItems:"flex-start" }}>
                      <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}>{TYPE_ICON[r.type]||"📌"}</span>
                      <div>
                        <p style={{ fontSize:12, color:"#cbd5e1", margin:"0 0 2px", fontWeight:600 }}>{r.name}</p>
                        <p style={{ fontSize:10, color:"#475569", margin:0 }}>{r.type}</p>
                      </div>
                    </div>
                    <span style={{ fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:8, flexShrink:0, background:PRI_BG[r.priority]||PRI_BG.Optional, color:PRI_COLOR[r.priority]||PRI_COLOR.Optional, border:`1px solid ${PRI_COLOR[r.priority]||PRI_COLOR.Optional}30`, whiteSpace:"nowrap" }}>
                      {r.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:pal.dim, borderRadius:14, border:`1px solid ${pal.stroke}30` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:pal.stroke, boxShadow:`0 0 8px ${pal.glow}` }}/>
              <span style={{ fontSize:12, color:pal.text, fontWeight:600 }}>
                {node.resources?.length||0} resource{node.resources?.length!==1?"s":""} · {node.milestones?.length||0} milestone{node.milestones?.length!==1?"s":""}
              </span>
            </div>
            <button onClick={onClose} style={{ fontSize:12, fontWeight:700, color:pal.accent, background:"none", border:`1px solid ${pal.stroke}40`, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
              Close esc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   TREE CANVAS
═══════════════════════════════════════════════════ */
function TreeCanvas({ treeData, goalNode }) {
  const containerRef = useRef(null);
  const [modal, setModal] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [vp, setVp] = useState({ x:0, y:0, scale:0.82 });
  const [size, setSize] = useState({ w:900, h:650 });
  const drag = useRef(null);
  const graph = buildGraph(treeData, goalNode);

  // Fit on mount / resize
  useEffect(()=>{
    const el = containerRef.current; if (!el) return;
    const fit = ()=>{
      const {width:w, height:h} = el.getBoundingClientRect();
      setSize({w,h});
      const gw=graph.maxX-graph.minX, gh=graph.maxY-graph.minY;
      const sc = Math.min(w/gw, h/gh, 0.88)*0.94;
      const cx=(graph.minX+graph.maxX)/2, cy=(graph.minY+graph.maxY)/2;
      setVp({ x:w/2-cx*sc, y:h/2-cy*sc, scale:sc });
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return ()=>ro.disconnect();
  },[]);

  const onWheel = useCallback(e=>{
    e.preventDefault();
    const rect=containerRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const f = e.deltaY<0?1.13:0.88;
    const ns=Math.min(Math.max(vp.scale*f,0.18),3.5);
    setVp(v=>({x:mx-(mx-v.x)*(ns/v.scale), y:my-(my-v.y)*(ns/v.scale), scale:ns}));
  },[vp.scale]);

  useEffect(()=>{
    const el=containerRef.current; if(!el) return;
    el.addEventListener("wheel",onWheel,{passive:false});
    return()=>el.removeEventListener("wheel",onWheel);
  },[onWheel]);

  const onMouseDown=e=>{ drag.current={sx:e.clientX,sy:e.clientY,ox:vp.x,oy:vp.y,moved:false}; };
  const onMouseMove=e=>{
    if(!drag.current) return;
    const dx=e.clientX-drag.current.sx, dy=e.clientY-drag.current.sy;
    if(Math.abs(dx)>3||Math.abs(dy)>3) drag.current.moved=true;
    // Capture ox/oy into local vars before setVp — drag.current may be null by the time updater runs
    const ox=drag.current.ox, oy=drag.current.oy;
    setVp(v=>({...v, x:ox+dx, y:oy+dy}));
  };
  const onMouseUp=()=>{ drag.current=null; };

  const fitView=()=>{
    const gw=graph.maxX-graph.minX, gh=graph.maxY-graph.minY;
    const sc=Math.min(size.w/gw, size.h/gh, 0.88)*0.94;
    const cx=(graph.minX+graph.maxX)/2, cy=(graph.minY+graph.maxY)/2;
    setVp({x:size.w/2-cx*sc, y:size.h/2-cy*sc, scale:sc});
  };

  const phaseNums = graph.nodes.filter(n=>n.type==="phase");

  return (
    <div ref={containerRef}
      style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden",
        background:"#f8fafc",
        cursor: drag.current?.moved?"grabbing":"grab",
      }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
    >
      {/* Dot-grid background */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:.35 }}>
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#1e293b"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)"/>
      </svg>

      {/* Radial ambient glow at center */}
      <div style={{ position:"absolute", top:"38%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:400, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 65%)", pointerEvents:"none" }}/>

      <svg width={size.w} height={size.h} style={{ display:"block", position:"absolute", inset:0 }}>
        <defs>
          {/* Per-color glow filters */}
          {Object.entries(PAL).map(([k,p])=>(
            <filter key={k} id={`glow-${k}`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          ))}
          <filter id="glow-strong" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Gradients for each node color */}
          {Object.entries(PAL).map(([k,p])=>(
            <linearGradient key={k} id={`ng-${k}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={p.stroke} stopOpacity="0.22"/>
              <stop offset="100%" stopColor={p.bg} stopOpacity="1"/>
            </linearGradient>
          ))}

          {/* Arrow marker */}
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M1 1L8 5L1 9" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>

          <style>{`
            @keyframes flow  { to { stroke-dashoffset:-28; } }
            @keyframes flowS { to { stroke-dashoffset:-16; } }
            @keyframes nIn   { from{opacity:0;transform:scale(.55)} to{opacity:1;transform:scale(1)} }
            @keyframes gPulse{ 0%,100%{opacity:.55}50%{opacity:1} }
            @keyframes rPulse{ 0%,100%{r:5}50%{r:7.5} }
            @keyframes spin  { to{transform:rotate(360deg)} }
            .sk-node:hover rect.main-rect { stroke-width:2.2 !important; }
          `}</style>
        </defs>

        <g transform={`translate(${vp.x},${vp.y}) scale(${vp.scale})`}>

          {/* ── EDGES ── */}
          {graph.edges.map((e,i)=>{
            const pal=PAL[e.color]||PAL.blue;
            const my=(e.y1+e.y2)/2;
            const d=`M${e.x1},${e.y1} C${e.x1},${my} ${e.x2},${my} ${e.x2},${e.y2}`;
            if (e.isGoal) return (
              <path key={i} d={d} fill="none" stroke={pal.stroke} strokeWidth={1}
                strokeDasharray="3 7" opacity={.14}
                style={{animation:"flow 2.5s linear infinite"}}/>
            );
            return (
              <g key={i}>
                {/* Glow duplicate */}
                <path d={d} fill="none" stroke={pal.glow} strokeWidth={4} opacity={.12}/>
                {/* Main edge */}
                <path d={d} fill="none" stroke={pal.stroke} strokeWidth={2}
                  strokeDasharray="8 5" opacity={.75}
                  style={{animation:"flow 1.6s linear infinite"}}/>
                {/* Bright center line */}
                <path d={d} fill="none" stroke={pal.accent} strokeWidth={.6} opacity={.4}/>
              </g>
            );
          })}

          {/* ── NODES ── */}
          {graph.nodes.map((n,i)=>{
            const isSkill=n.type==="skill", isPhase=n.type==="phase";
            const isRoot=n.type==="root",  isGoal=n.type==="goal";
            const pal = isGoal?PAL.goal : isRoot?PAL.root : PAL[n.color]||PAL.blue;
            const isHov = hovered===n.id;
            const rx = isRoot||isGoal ? 40 : isPhase ? 18 : 14;

            return (
              <g key={n.id}
                className={isSkill?"sk-node":""}
                style={{
                  cursor:isSkill?"pointer":"default",
                  animation:`nIn 0.45s cubic-bezier(.34,1.56,.64,1) ${i*.04}s both`,
                  transformOrigin:`${n.cx}px ${n.cy}px`,
                }}
                onMouseEnter={()=>isSkill&&setHovered(n.id)}
                onMouseLeave={()=>setHovered(null)}
                onClick={e=>{ if(!drag.current?.moved&&isSkill) { e.stopPropagation(); setModal(n); } }}
              >
                {/* Outer halo for skill hover */}
                {isHov && (
                  <rect x={n.x-8} y={n.y-8} width={n.w+16} height={n.h+16} rx={rx+6}
                    fill="none" stroke={pal.accent} strokeWidth={1.2} opacity={.5}
                    strokeDasharray="5 4"
                    style={{animation:"flow .8s linear infinite"}}/>
                )}

                {/* Deep shadow glow for root/goal */}
                {(isRoot||isGoal) && (
                  <rect x={n.x-4} y={n.y+8} width={n.w+8} height={n.h} rx={rx+4}
                    fill={pal.glow} opacity={.13} filter={`url(#glow-strong)`}/>
                )}

                {/* Glow fill behind main rect */}
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={rx}
                  fill={pal.glow} opacity={isRoot||isGoal?.25:isHov?.2:.08}
                  filter={`url(#glow-${isGoal?"goal":isRoot?"root":n.color||"blue"})`}/>

                {/* Main rect */}
                <rect className="main-rect" x={n.x} y={n.y} width={n.w} height={n.h} rx={rx}
                  fill={`url(#ng-${isGoal?"goal":isRoot?"root":n.color||"blue"})`}
                  stroke={pal.stroke}
                  strokeWidth={isRoot||isGoal?2:isHov?2:1.3}
                  style={isGoal?{animation:"gPulse 2.5s ease-in-out infinite"}:isRoot?{animation:"gPulse 3s ease-in-out infinite"}:{}}
                />

                {/* Top shimmer line */}
                <rect x={n.x+12} y={n.y+3} width={n.w-24} height={3} rx={1.5}
                  fill={pal.accent} opacity={.3}/>

                {/* ── ROOT ── */}
                {isRoot&&(<>
                  <circle cx={n.x+22} cy={n.cy} r={16} fill={pal.dim}/>
                  <text x={n.x+22} y={n.cy+6} textAnchor="middle" fontSize={17}>📍</text>
                  <text x={n.x+46} y={n.cy-8} fontSize={12} fontWeight={800} fill={pal.text} fontFamily="'Sora',sans-serif">{n.label}</text>
                  <text x={n.x+46} y={n.cy+9} fontSize={10} fill={pal.accent} opacity={.8} fontFamily="'Sora',sans-serif">{(n.sublabel||"").slice(0,22)}</text>
                </>)}

                {/* ── GOAL ── */}
                {isGoal&&(<>
                  <circle cx={n.x+22} cy={n.cy} r={18} fill={pal.dim}
                    style={{animation:"gPulse 2s ease-in-out infinite"}}/>
                  <text x={n.x+22} y={n.cy+7} textAnchor="middle" fontSize={19}>🏆</text>
                  <text x={n.x+48} y={n.cy-7} fontSize={12} fontWeight={800} fill={pal.text} fontFamily="'Sora',sans-serif">{n.label.slice(0,16)}</text>
                  <text x={n.x+48} y={n.cy+9} fontSize={10} fill={pal.accent} opacity={.8} fontFamily="'Sora',sans-serif">{(n.sublabel||"").slice(0,22)}</text>
                </>)}

                {/* ── PHASE ── */}
                {isPhase&&(<>
                  {/* Number badge */}
                  <circle cx={n.x+22} cy={n.cy} r={17} fill={pal.stroke} opacity={.2}/>
                  <circle cx={n.x+22} cy={n.cy} r={13} fill={pal.stroke} opacity={.9}/>
                  <text x={n.x+22} y={n.cy+5} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff" fontFamily="'Sora',sans-serif">
                    {phaseNums.indexOf(n)+1}
                  </text>
                  <text x={n.x+46} y={n.cy-8} fontSize={12.5} fontWeight={800} fill={pal.text} fontFamily="'Sora',sans-serif">{n.label.slice(0,18)}</text>
                  <text x={n.x+46} y={n.cy+9} fontSize={10} fill={pal.accent} opacity={.8} fontFamily="'Sora',sans-serif">{(n.sublabel||"").slice(0,20)}</text>
                </>)}

                {/* ── SKILL ── */}
                {isSkill&&(<>
                  {/* Animated dot */}
                  <circle cx={n.x+16} cy={n.cy} r={5} fill={pal.stroke} opacity={.8}
                    style={isHov?{animation:"rPulse .8s ease-in-out infinite"}:{}}/>
                  <circle cx={n.x+16} cy={n.cy} r={3} fill={pal.accent}/>
                  <text x={n.x+30} y={n.cy-6} fontSize={12} fontWeight={700} fill={pal.text} fontFamily="'Sora',sans-serif">{n.label.slice(0,18)}</text>
                  <text x={n.x+30} y={n.cy+9} fontSize={9.5} fill={pal.accent} opacity={.7} fontFamily="'Sora',sans-serif">{(n.sublabel||"").slice(0,18)}</text>
                  {/* click indicator */}
                  <text x={n.x+n.w-10} y={n.cy+5} fontSize={10} fill={pal.accent} opacity={isHov?.9:.3} fontFamily="sans-serif">
                    {isHov?"↗":"·"}
                  </text>
                </>)}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div style={{ position:"absolute", bottom:22, right:22, display:"flex", flexDirection:"column", gap:8 }}>
        {[{l:"+",f:()=>setVp(v=>({...v,scale:Math.min(v.scale*1.22,3.5)}))},
          {l:"−",f:()=>setVp(v=>({...v,scale:Math.max(v.scale*.8,.18)}))},
          {l:"⊡",f:fitView}
        ].map(b=>(
          <button key={b.l} onClick={b.f} style={{ width:36, height:36, borderRadius:10, background:"rgba(15,20,40,0.92)", border:"1px solid rgba(99,102,241,.3)", color:"#818cf8", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit", boxShadow:"0 4px 12px rgba(0,0,0,.4)", transition:"border-color .2s" }}>
            {b.l}
          </button>
        ))}
      </div>

      {/* Legend hint */}
      <div style={{ position:"absolute", bottom:22, left:22, display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:"rgba(5,8,20,.88)", border:"1px solid #e5e7eb", borderRadius:10, backdropFilter:"blur(8px)" }}>
        <span style={{ fontSize:11, color:"#475569" }}>🖱 Scroll · Drag · </span>
        <div style={{ width:7, height:7, borderRadius:"50%", background:"#818cf8", boxShadow:"0 0 6px #6366f1" }}/>
        <span style={{ fontSize:11, color:"#818cf8", fontWeight:600 }}>Click skill nodes for details</span>
      </div>

      {/* Modal */}
      {modal && <SkillModal node={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   ROADMAP VIEW WRAPPER
═══════════════════════════════════════════════════ */
function RoadmapView({ data, onReset }) {
  const { meta, tree, extras } = data;
  const lvlC={Beginner:"#16a34a",Intermediate:"#b45309",Advanced:"#dc2626"};
  const lvlB={Beginner:"rgba(52,211,153,.13)",Intermediate:"rgba(251,191,36,.13)",Advanced:"rgba(248,113,113,.13)"};
  const totalSkills = tree.children?.reduce((s,p)=>s+(p.children?.length||0),0)||0;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 80px)", fontFamily:"'Sora',sans-serif" }}>
      {/* ── HEADER ── */}
      <div style={{ flexShrink:0, padding:"14px 24px", background:"rgba(3,7,18,0.95)", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", backdropFilter:"blur(12px)" }}>
        <div style={{ flex:1, minWidth:220 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:20, background:lvlB[meta.currentLevel]||"rgba(99,102,241,.13)", color:lvlC[meta.currentLevel]||"#818cf8" }}>
              {meta.currentLevel}
            </span>
            <span style={{ fontSize:10.5, color:"#374151" }}>·</span>
            <span style={{ fontSize:11, color:"#475569", fontWeight:600 }}>{meta.timeline}</span>
            <span style={{ fontSize:10.5, color:"#374151" }}>·</span>
            <span style={{ fontSize:11, color:"#64748b", fontWeight:500 }}>{meta.salary}</span>
          </div>
          <h2 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 3px", letterSpacing:"-.02em" }}>
            {meta.name}'s Road to <span style={{ background:"linear-gradient(90deg,#818cf8,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{meta.targetRole}</span>
          </h2>
          <p style={{ fontSize:11.5, color:"#374151", margin:0 }}>{totalSkills} skill nodes across {tree.children?.length||0} phases</p>
        </div>

        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          {extras.quickWins?.slice(0,2).map((w,i)=>(
            <div key={i} style={{ padding:"6px 12px", background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)", borderRadius:10, fontSize:11, color:"#15803d", maxWidth:200 }}>
              ⚡ {w.slice(0,40)}{w.length>40?"…":""}
            </div>
          ))}
          {extras.warnings?.slice(0,1).map((w,i)=>(
            <div key={i} style={{ padding:"6px 12px", background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", borderRadius:10, fontSize:11, color:"#92400e", maxWidth:200 }}>
              ⚠ {w.slice(0,40)}{w.length>40?"…":""}
            </div>
          ))}
          <button onClick={onReset} style={{ padding:"7px 16px", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:10, fontSize:12, color:"#64748b", cursor:"pointer", fontFamily:"'Sora',sans-serif", fontWeight:600 }}>
            ↩ New Roadmap
          </button>
        </div>
      </div>

      {/* ── TREE CANVAS ── */}
      <div style={{ flex:1, overflow:"hidden" }}>
        <TreeCanvas treeData={tree} goalNode={extras.goalNode}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LOADING SCREEN
═══════════════════════════════════════════════════ */
function LoadingScreen({ idx }) {
  const msgs=["Analyzing your profile…","Mapping skill gaps…","Growing your tree…","Connecting branches…","Curating real resources…","Crafting milestones…","Almost there…"];
  return (
    <div style={{ minHeight:"calc(100vh - 80px)", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif" }}>
      <style>{`
        @keyframes fadeM{0%,100%{opacity:0;transform:translateY(6px)}20%,80%{opacity:1;transform:translateY(0)}}
        @keyframes pr2{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes lineGrow{from{stroke-dashoffset:120}to{stroke-dashoffset:0}}
        @keyframes spinRing{to{stroke-dashoffset:-60}}
      `}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ position:"relative", width:120, height:140, margin:"0 auto 28px" }}>
          <svg width="120" height="140" viewBox="0 0 120 140">
            <circle cx="60" cy="15" r="9" fill="#6366f1" style={{animation:"pr2 1s ease-in-out infinite"}}/>
            <circle cx="60" cy="15" r="14" fill="none" stroke="#6366f180" strokeWidth="1.5" strokeDasharray="15 5" style={{animation:"spinRing 2s linear infinite"}}/>
            <line x1="60" y1="24" x2="60" y2="48" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="60" y1="48" x2="26" y2="75" stroke="#818cf8" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="50" style={{animation:"lineGrow .6s ease .1s both"}}/>
            <line x1="60" y1="48" x2="94" y2="75" stroke="#818cf8" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="50" style={{animation:"lineGrow .6s ease .2s both"}}/>
            <circle cx="26" cy="75" r="7" fill="#818cf8" style={{animation:"pr2 1.2s ease-in-out .2s infinite"}}/>
            <circle cx="94" cy="75" r="7" fill="#818cf8" style={{animation:"pr2 1.2s ease-in-out .3s infinite"}}/>
            <line x1="26" y1="82" x2="12" y2="106" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="40" style={{animation:"lineGrow .6s ease .35s both"}}/>
            <line x1="26" y1="82" x2="40" y2="106" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="40" style={{animation:"lineGrow .6s ease .45s both"}}/>
            <line x1="94" y1="82" x2="80" y2="106" stroke="#c084fc" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="40" style={{animation:"lineGrow .6s ease .55s both"}}/>
            <line x1="94" y1="82" x2="108" y2="106" stroke="#c084fc" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="40" style={{animation:"lineGrow .6s ease .65s both"}}/>
            <circle cx="12" cy="106" r="5" fill="#a78bfa"/>
            <circle cx="40" cy="106" r="5" fill="#a78bfa"/>
            <circle cx="80" cy="106" r="5" fill="#c084fc"/>
            <circle cx="108" cy="106" r="5" fill="#c084fc"/>
            <circle cx="60" cy="128" r="9" fill="#f59e0b" style={{animation:"pr2 1.3s ease-in-out .5s infinite"}}/>
            <circle cx="60" cy="128" r="14" fill="none" stroke="#f59e0b50" strokeWidth="1.5" strokeDasharray="12 6" style={{animation:"spinRing 2.5s linear reverse infinite"}}/>
          </svg>
        </div>
        <p style={{ fontSize:22, fontWeight:800, color:"#0f172a", margin:"0 0 10px", letterSpacing:"-.02em" }}>Growing Your Tree</p>
        <p style={{ fontSize:14, color:"#6366f1", fontWeight:600, animation:"fadeM 1.8s ease-in-out infinite", minHeight:22 }}>
          {msgs[idx%msgs.length]}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════ */
export default function CareerRoadmap() {
  const [step,setStep]       = useState(0);
  const [form,setForm]       = useState({});
  const [errors,setErrors]   = useState({});
  const [loading,setLoading] = useState(false);
  const [lIdx,setLIdx]       = useState(0);
  const [roadmap,setRoadmap] = useState(null);

  useEffect(()=>{
    if(!loading) return;
    const t=setInterval(()=>setLIdx(p=>p+1),1800);
    return()=>clearInterval(t);
  },[loading]);

  const cur=STEPS[step];
  const validate=()=>{
    const e={};
    cur.fields.forEach(f=>{ if(f.required&&!form[f.key]?.trim()) e[f.key]="Required"; });
    setErrors(e); return !Object.keys(e).length;
  };
  const next=()=>{ if(!validate()) return; if(step<STEPS.length-1) setStep(s=>s+1); else generate(); };
  const chg=(k,v)=>{ setForm(p=>({...p,[k]:v})); setErrors(p=>{const n={...p};delete n[k];return n;}); };

  const generate=async()=>{
    setLoading(true);
    try {
      const key=import.meta.env.VITE_GROQ_API_KEY;
      if(!key) throw new Error("VITE_GROQ_API_KEY not set in .env");
      const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
        body:JSON.stringify({model:"openai/gpt-oss-120b",max_tokens:8000,temperature:.65,
          messages:[{role:"system",content:SYSTEM_PROMPT},{role:"user",content:buildPrompt(form)}]}),
      });
      if(!res.ok){const e=await res.json();throw new Error(e?.error?.message||"Groq error");}
      const data=await res.json();
      const raw=data.choices?.[0]?.message?.content||"";
      setRoadmap(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch(e){alert(`Error: ${e.message}`);console.error(e);}
    finally{setLoading(false);}
  };

  const reset=()=>{setStep(0);setForm({});setErrors({});setRoadmap(null);};

  const renderField=f=>{
    const val=form[f.key]||"",err=errors[f.key];
    const base={width:"100%",background:"#f1f5f9",border:`1px solid ${err?"rgba(239,68,68,.55)":"#cbd5e1"}`,borderRadius:10,padding:"11px 14px",fontSize:14,color:"#1e293b",fontFamily:"'Sora',sans-serif",outline:"none",transition:"border-color .2s, box-shadow .2s"};
    return (
      <div key={f.key} style={{marginBottom:20}}>
        <label style={{display:"block",fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".09em",marginBottom:7}}>
          {f.label} {f.required&&<span style={{color:"#dc2626"}}>*</span>}
        </label>
        {f.type==="select"?(
          <select value={val} onChange={e=>chg(f.key,e.target.value)} style={{...base,cursor:"pointer"}}>
            <option value="" style={{background:"#ffffff"}}>Select…</option>
            {f.options.map(o=><option key={o} value={o} style={{background:"#ffffff"}}>{o}</option>)}
          </select>
        ):f.type==="textarea"?(
          <textarea value={val} onChange={e=>chg(f.key,e.target.value)} placeholder={f.placeholder} rows={3} style={{...base,resize:"vertical",lineHeight:1.65}}/>
        ):(
          <input type="text" value={val} onChange={e=>chg(f.key,e.target.value)} placeholder={f.placeholder} style={base}/>
        )}
        {err&&<p style={{margin:"5px 0 0",fontSize:11.5,color:"#dc2626"}}>⚠ {err}</p>}
      </div>
    );
  };

  if(loading) return <LoadingScreen idx={lIdx}/>;
  if(roadmap)  return <RoadmapView data={roadmap} onReset={reset}/>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.8)}}
        @keyframes modalBgIn{from{opacity:0}to{opacity:1}}
        @keyframes modalIn{from{opacity:0;transform:scale(.88) translateY(24px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .rm-wrap *{box-sizing:border-box}
        .rm-wrap input:focus,.rm-wrap textarea:focus,.rm-wrap select:focus{border-color:rgba(99,102,241,.6)!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)}
        .rm-wrap select option{background:#ffffff;color:#1e293b}
        .cta-btn:hover{transform:translateY(-1px);filter:brightness(1.14)}
        .cta-btn{transition:transform .15s,filter .15s}
        .back-btn:hover{border-color:#94a3b8!important;color:#64748b!important}
        .back-btn{transition:border-color .15s,color .15s}
      `}</style>

      <div className="rm-wrap" style={{ minHeight:"calc(100vh - 80px)", background:"#f8fafc", fontFamily:"'Sora',sans-serif", padding:"40px 24px", color:"#0f172a" }}>

        {/* Subtle background grid */}
        <div style={{ position:"fixed", inset:0, backgroundImage:"radial-gradient(rgba(99,102,241,.06) 1px, transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", top:"20%", left:"50%", transform:"translateX(-50%)", width:700, height:400, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(99,102,241,.04) 0%, transparent 65%)", pointerEvents:"none", zIndex:0 }}/>

        <div style={{ maxWidth:680, margin:"0 auto", position:"relative", zIndex:1 }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:48, animation:"fadeUp .55s ease both" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,.1)", border:"1px solid rgba(99,102,241,.25)", borderRadius:20, padding:"7px 18px", marginBottom:18 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#6366f1", animation:"pdot 1.6s ease-in-out infinite", boxShadow:"0 0 8px #6366f1" }}/>
              <span style={{ fontSize:10.5, fontWeight:700, color:"#818cf8", textTransform:"uppercase", letterSpacing:".12em" }}>AI-Powered</span>
            </div>
            <h1 style={{ fontSize:"clamp(28px,5vw,44px)", fontWeight:800, letterSpacing:"-.035em", margin:"0 0 14px", background:"linear-gradient(135deg,#1e293b 20%,#818cf8 60%,#c084fc 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.1 }}>
              Personalized Career Roadmap
            </h1>
            <p style={{ fontSize:15, color:"#374151", lineHeight:1.75, maxWidth:420, margin:"0 auto" }}>
              Answer {STEPS.length} short sections. Get a zoomable, interactive skill tree with resources and milestones.
            </p>
          </div>

          {/* Step progress */}
          <div style={{ display:"flex", gap:4, marginBottom:28, background:"#f8fafc", borderRadius:16, padding:6, border:"1px solid #e5e7eb" }}>
            {STEPS.map((s,i)=>{
              const done=i<step,active=i===step;
              return (
                <div key={s.id} style={{ flex:1, textAlign:"center", padding:"11px 4px", borderRadius:12, background:active?"rgba(99,102,241,.18)":done?"rgba(34,197,94,.08)":"transparent", border:active?"1px solid rgba(99,102,241,.35)":"1px solid transparent", transition:"all .3s" }}>
                  <div style={{ fontSize:16, marginBottom:4, filter:done?"none":"none" }}>{done?"✓":s.icon}</div>
                  <p style={{ fontSize:9.5, fontWeight:700, color:active?"#818cf8":done?"#16a34a":"#cbd5e1", margin:0, textTransform:"uppercase", letterSpacing:".06em" }}>{s.title.split(" ").slice(0,2).join(" ")}</p>
                </div>
              );
            })}
          </div>

          {/* Form card */}
          <div key={step} style={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:24, padding:"38px 42px", animation:"fadeUp .4s ease both", boxShadow:"0 24px 60px rgba(15,23,42,.1)" }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:52, height:52, borderRadius:16, background:"rgba(99,102,241,.15)", border:"1px solid rgba(99,102,241,.25)", fontSize:24, marginBottom:14 }}>{cur.icon}</div>
              <h2 style={{ fontSize:23, fontWeight:800, letterSpacing:"-.02em", margin:"0 0 6px", color:"#0f172a" }}>{cur.title}</h2>
              <p style={{ fontSize:13.5, color:"#475569", margin:0, lineHeight:1.6 }}>{cur.subtitle}</p>
            </div>

            {cur.fields.map(renderField)}

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
              {step>0?(
                <button onClick={()=>setStep(s=>s-1)} className="back-btn" style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:12, padding:"11px 24px", fontSize:14, fontWeight:600, color:"#64748b", cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
                  ← Back
                </button>
              ):<div/>}
              <button onClick={next} className="cta-btn" style={{ background:"linear-gradient(135deg,#4338ca,#7c3aed)", border:"none", borderRadius:14, padding:"13px 32px", fontSize:15, fontWeight:700, color:"#fff", cursor:"pointer", boxShadow:"0 8px 28px rgba(99,102,241,.35)", fontFamily:"'Sora',sans-serif", letterSpacing:"-.01em" }}>
                {step===STEPS.length-1?"🌳 Grow My Tree":"Continue →"}
              </button>
            </div>
          </div>

          <p style={{ textAlign:"center", fontSize:11.5, color:"#1e293b", marginTop:20 }}>
            Step {step+1} of {STEPS.length} · Zero data stored · Session only
          </p>
        </div>
      </div>
    </>
  );
}