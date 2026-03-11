import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ======================== SOUND ENGINE ========================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}
function playCompleteSound() {
  try {
    const ctx = getAudio();
    const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
    o1.type = "sine"; o1.frequency.setValueAtTime(523, ctx.currentTime);
    o1.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
    o1.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
    g1.gain.setValueAtTime(0.3, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    o1.connect(g1); g1.connect(ctx.destination);
    o1.start(ctx.currentTime); o1.stop(ctx.currentTime + 0.4);
    // sparkle overlay
    const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
    o2.type = "triangle"; o2.frequency.setValueAtTime(1568, ctx.currentTime + 0.1);
    g2.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    o2.connect(g2); g2.connect(ctx.destination);
    o2.start(ctx.currentTime + 0.1); o2.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}
function playLevelUpSound() {
  try {
    const ctx = getAudio();
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = i < 3 ? "sine" : "triangle";
      o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
    // bass hit
    const bass = ctx.createOscillator(); const bg = ctx.createGain();
    bass.type = "sine"; bass.frequency.setValueAtTime(130, ctx.currentTime + 0.4);
    bg.gain.setValueAtTime(0.4, ctx.currentTime + 0.4);
    bg.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
    bass.connect(bg); bg.connect(ctx.destination);
    bass.start(ctx.currentTime + 0.4); bass.stop(ctx.currentTime + 0.9);
  } catch(e) {}
}
function playCoinSound() {
  try {
    const ctx = getAudio();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(1200, ctx.currentTime);
    o.frequency.setValueAtTime(1600, ctx.currentTime + 0.05);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
  } catch(e) {}
}
function playTrophySound() {
  try {
    const ctx = getAudio();
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.15);
      g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.5);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.15); o.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
  } catch(e) {}
}
function playClickSound() {
  try {
    const ctx = getAudio();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(800, ctx.currentTime);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.06);
  } catch(e) {}
}

// ======================== CONSTANTS ========================
const C = {
  bg: "#0D1117", bgCard: "#161B22", bgCardHover: "#1C2333", bgElevated: "#21262D",
  accent: "#2EE59D", accentGlow: "rgba(46,229,157,0.25)", accentDim: "#1FA870",
  gold: "#F0B429", goldGlow: "rgba(240,180,41,0.25)",
  coral: "#FF6B6B", coralGlow: "rgba(255,107,107,0.2)",
  blue: "#58A6FF", blueGlow: "rgba(88,166,255,0.2)",
  purple: "#BC8CF2", purpleGlow: "rgba(188,140,242,0.2)",
  amber: "#FFA657", amberGlow: "rgba(255,166,87,0.2)",
  textPrimary: "#E6EDF3", textSecondary: "#8B949E", textMuted: "#484F58",
  border: "rgba(240,246,252,0.06)", borderLight: "rgba(240,246,252,0.1)",
};

const SKIN_COLORS = ["#FDDBB4","#F1C27D","#E0AC69","#C68642","#8D5524","#5C3317","#3B2014","#F9E0D0","#FFE0BD","#D4A76A"];
const HAIR_COLORS = ["#2C1B0E","#4A3728","#8B6914","#C9B037","#E84118","#D63031","#6C5CE7","#00B894","#FDCB6E","#DFE6E9"];
const HAIR_STYLES = [
  { id: "short", label: "Short", draw: "✂️" },
  { id: "medium", label: "Medium", draw: "💇" },
  { id: "long", label: "Long", draw: "💇‍♀️" },
  { id: "curly", label: "Curly", draw: "🦱" },
  { id: "bald", label: "Bald", draw: "👨‍🦲" },
  { id: "mohawk", label: "Mohawk", draw: "🎸" },
];
const EYE_STYLES = [
  { id: "normal", label: "Normal", emoji: "👁️" },
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "cool", label: "Cool", emoji: "😎" },
  { id: "wink", label: "Wink", emoji: "😉" },
  { id: "star", label: "Star", emoji: "🤩" },
  { id: "sleepy", label: "Sleepy", emoji: "😴" },
];

const GOAL_OPTIONS = [
  { id: "fitness", icon: "💪", label: "Fitness", desc: "Build strength & endurance", color: C.coral },
  { id: "nutrition", icon: "🥗", label: "Nutrition", desc: "Eat healthier every day", color: C.accent },
  { id: "productivity", icon: "⚡", label: "Productivity", desc: "Get more done, stress less", color: C.amber },
  { id: "mindfulness", icon: "🧘", label: "Mindfulness", desc: "Inner peace & mental clarity", color: C.purple },
  { id: "learning", icon: "📚", label: "Learning", desc: "Never stop growing", color: C.blue },
  { id: "sleep", icon: "😴", label: "Better Sleep", desc: "Rest & recover properly", color: C.purple },
];

const SHOP_HATS = [
  { id: "cap", label: "Sport Cap", cost: 40, emoji: "🧢" },
  { id: "crown", label: "Crown", cost: 200, emoji: "👑" },
  { id: "wizard", label: "Wizard", cost: 300, emoji: "🧙" },
  { id: "cowboy", label: "Cowboy", cost: 120, emoji: "🤠" },
  { id: "tophat", label: "Top Hat", cost: 250, emoji: "🎩" },
  { id: "helmet", label: "Viking", cost: 350, emoji: "⛑️" },
];
const SHOP_CLOTHES = [
  { id: "tshirt", label: "Basic Tee", cost: 30, emoji: "👕" },
  { id: "suit", label: "Suit", cost: 200, emoji: "🤵" },
  { id: "hoodie", label: "Hoodie", cost: 80, emoji: "🧥" },
  { id: "dress", label: "Dress", cost: 150, emoji: "👗" },
  { id: "armor", label: "Armor", cost: 400, emoji: "🛡️" },
  { id: "jersey", label: "Jersey", cost: 100, emoji: "🏀" },
];
const SHOP_ACCESSORIES = [
  { id: "glasses", label: "Glasses", cost: 60, emoji: "👓" },
  { id: "sunglasses", label: "Shades", cost: 90, emoji: "🕶️" },
  { id: "watch", label: "Watch", cost: 120, emoji: "⌚" },
  { id: "chain", label: "Chain", cost: 180, emoji: "📿" },
  { id: "medal", label: "Medal", cost: 250, emoji: "🏅" },
  { id: "cape", label: "Cape", cost: 500, emoji: "🦸" },
];
const PROFILE_WALLPAPERS = [
  { id: "default", label: "Default", cost: 0, bg: C.bgCard },
  { id: "emerald", label: "Emerald", cost: 80, bg: "linear-gradient(135deg, #0D1117, #1FA870)" },
  { id: "sunset", label: "Sunset", cost: 80, bg: "linear-gradient(135deg, #0D1117, #FF6B6B, #F0B429)" },
  { id: "ocean", label: "Ocean", cost: 100, bg: "linear-gradient(135deg, #0D1117, #58A6FF, #2EE59D)" },
  { id: "galaxy", label: "Galaxy", cost: 150, bg: "linear-gradient(135deg, #0D1117, #BC8CF2, #58A6FF)" },
  { id: "fire", label: "Fire", cost: 150, bg: "linear-gradient(135deg, #0D1117, #FF6B6B, #FFA657)" },
  { id: "midnight", label: "Midnight", cost: 200, bg: "linear-gradient(135deg, #000000, #161B22, #21262D)" },
  { id: "aurora", label: "Aurora", cost: 300, bg: "linear-gradient(135deg, #0D1117, #2EE59D, #BC8CF2, #58A6FF)" },
];

const DEFAULT_HABITS_BY_GOAL = {
  fitness: [
    { name: "Morning Walk", xp: 30 }, { name: "30min Workout", xp: 40 }, { name: "Stretch 10min", xp: 20 },
  ],
  nutrition: [
    { name: "Drink 8 Glasses Water", xp: 20 }, { name: "Eat a Salad", xp: 25 }, { name: "No Junk Food", xp: 30 },
  ],
  productivity: [
    { name: "Plan Tomorrow", xp: 25 }, { name: "Deep Work 2hrs", xp: 40 }, { name: "Inbox Zero", xp: 20 },
  ],
  mindfulness: [
    { name: "Meditate 10min", xp: 30 }, { name: "Gratitude Journal", xp: 25 }, { name: "Screen-Free Hour", xp: 20 },
  ],
  learning: [
    { name: "Read 20 Pages", xp: 30 }, { name: "Learn Something New", xp: 25 }, { name: "Practice a Skill", xp: 35 },
  ],
  sleep: [
    { name: "Sleep by 10:30pm", xp: 30 }, { name: "No Screens Before Bed", xp: 25 }, { name: "Wind-Down Routine", xp: 20 },
  ],
};

const TROPHIES = [
  { id: "gold1", label: "Weekly Champion", desc: "#1 on leaderboard", emoji: "🥇", tier: "gold" },
  { id: "silver1", label: "Runner Up", desc: "#2 on leaderboard", emoji: "🥈", tier: "silver" },
  { id: "bronze1", label: "Top Three", desc: "#3 on leaderboard", emoji: "🥉", tier: "bronze" },
  { id: "streak7", label: "On Fire", desc: "7-day streak", emoji: "🔥", tier: "bronze" },
  { id: "streak30", label: "Unstoppable", desc: "30-day streak", emoji: "⚡", tier: "gold" },
  { id: "first100", label: "Centurion", desc: "Earn 100 XP total", emoji: "💯", tier: "silver" },
];

function getLevel(xp) { return Math.floor(xp / 150) + 1; }
function getXpProgress(xp) { const l = getLevel(xp); const base = (l-1)*150; return ((xp-base)/150)*100; }
function getXpToNext(xp) { const l = getLevel(xp); return l*150 - xp; }
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return `${Math.floor(diff/86400000)}d ago`;
}

// ======================== COMPONENTS ========================

function ProgressRing({ progress, size=48, stroke=4, color=C.accent }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ-(progress/100)*circ} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 0.6s ease" }}/>
    </svg>
  );
}

function AvatarFull({ avatar, size=80, equipped={}, showBorder=true }) {
  const wp = PROFILE_WALLPAPERS.find(w=>w.id===(avatar.wallpaper||"default")) || PROFILE_WALLPAPERS[0];
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", background: wp.bg,
      display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0,
      border: showBorder ? `3px solid ${C.accent}` : "none",
      boxShadow: showBorder ? `0 0 20px ${C.accentGlow}` : "none",
    }}>
      {equipped.hat && <span style={{ position:"absolute", top:-size*0.15, fontSize:size*0.3, filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>{SHOP_HATS.find(h=>h.id===equipped.hat)?.emoji}</span>}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
        <span style={{ fontSize:size*0.22 }}>{HAIR_STYLES.find(h=>h.id===avatar.hair)?.draw || "✂️"}</span>
        <div style={{
          width:size*0.5, height:size*0.5, borderRadius:"50%", background: avatar.skin || SKIN_COLORS[0],
          display:"flex", alignItems:"center", justifyContent:"center",
          border:`2px solid rgba(0,0,0,0.15)`,
        }}>
          <span style={{ fontSize:size*0.2 }}>{EYE_STYLES.find(e=>e.id===avatar.eyes)?.emoji || "👁️"}</span>
        </div>
      </div>
      {equipped.accessory && <span style={{ position:"absolute", bottom:2, right:2, fontSize:size*0.2 }}>{SHOP_ACCESSORIES.find(a=>a.id===equipped.accessory)?.emoji}</span>}
    </div>
  );
}

function TabBar({ active, onTab }) {
  const tabs = [
    { id:"home", icon:"🏠", label:"Home" },
    { id:"timeline", icon:"📰", label:"Feed" },
    { id:"leaderboard", icon:"🏆", label:"Ranks" },
    { id:"profile", icon:"👤", label:"Profile" },
    { id:"shop", icon:"🛍️", label:"Shop" },
  ];
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, background:"rgba(13,17,23,0.96)",
      backdropFilter:"blur(20px)", borderTop:`1px solid ${C.border}`,
      display:"flex", justifyContent:"space-around", alignItems:"center",
      padding:"6px 0 max(env(safe-area-inset-bottom),10px)", zIndex:100,
    }}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>{onTab(t.id);playClickSound();}} style={{
          background:"none", border:"none", cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"center", gap:1,
          opacity: active===t.id?1:0.45, transform: active===t.id?"scale(1.08)":"scale(1)",
          transition:"all 0.2s",
        }}>
          <span style={{ fontSize:20 }}>{t.icon}</span>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.06em",
            color: active===t.id?C.accent:C.textSecondary }}>{t.label}</span>
          {active===t.id && <div style={{ width:4,height:4,borderRadius:"50%",background:C.accent,
            boxShadow:`0 0 8px ${C.accent}`,marginTop:1 }}/>}
        </button>
      ))}
    </div>
  );
}

function StreakBadge({ streak }) {
  if (!streak) return null;
  return <span style={{
    background: streak>=7?`linear-gradient(135deg,${C.gold},${C.amber})`:C.bgElevated,
    color: streak>=7?"#000":C.textSecondary,
    fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20,
    display:"inline-flex", alignItems:"center", gap:2,
  }}>🔥{streak}</span>;
}

function XPBurst({ x, y, amount, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,900); return()=>clearTimeout(t); },[]);
  return (
    <div style={{ position:"fixed",left:x,top:y,pointerEvents:"none",zIndex:9999 }}>
      <div style={{
        position:"absolute", transform:"translate(-50%,-50%)",
        fontSize:24, fontWeight:900, color:C.accent,
        textShadow:`0 0 20px ${C.accentGlow}`, fontFamily:"'Sora',sans-serif",
        animation:"floatUp 0.9s ease-out forwards",
      }}>+{amount} XP</div>
      {Array.from({length:8}).map((_,i)=>{
        const angle=(Math.PI*2*i)/8;
        return <div key={i} style={{
          position:"absolute", width:4, height:4, borderRadius:"50%",
          background:[C.accent,C.gold,C.blue][i%3],
          boxShadow:`0 0 6px ${[C.accent,C.gold,C.blue][i%3]}`,
          left:0,top:0, animation:`particle${i%4} 0.7s ease-out forwards`,
          "--px":`${Math.cos(angle)*50}px`, "--py":`${Math.sin(angle)*50}px`,
        }}/>;
      })}
    </div>
  );
}

// ======================== ONBOARDING ========================

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [skin, setSkin] = useState(SKIN_COLORS[0]);
  const [hair, setHair] = useState("short");
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
  const [eyes, setEyes] = useState("normal");
  const [goals, setGoals] = useState([]);
  const [bio, setBio] = useState("");

  const toggleGoal = (id) => {
    setGoals(prev => prev.includes(id) ? prev.filter(g=>g!==id) : [...prev, id]);
    playClickSound();
  };

  const canNext = () => {
    if (step===0) return name.trim().length >= 2;
    if (step===1) return true;
    if (step===2) return goals.length > 0;
    return true;
  };

  const next = () => {
    if (!canNext()) return;
    playClickSound();
    if (step===3) {
      onComplete({ name:name.trim(), height, weight, skin, hair, hairColor, eyes, goals, bio, wallpaper:"default" });
      return;
    }
    setStep(s=>s+1);
  };

  return (
    <div style={{
      minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden",
    }}>
      {/* ambient */}
      <div style={{ position:"absolute", top:-150, right:-150, width:400, height:400, borderRadius:"50%",
        background:`radial-gradient(circle,${C.accentGlow} 0%,transparent 70%)`, opacity:0.2 }}/>
      <div style={{ position:"absolute", bottom:-100, left:-100, width:300, height:300, borderRadius:"50%",
        background:`radial-gradient(circle,${C.goldGlow} 0%,transparent 70%)`, opacity:0.15 }}/>

      {/* progress dots */}
      <div style={{ display:"flex", gap:8, marginBottom:32 }}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{
            width: i===step?24:8, height:8, borderRadius:4,
            background: i<=step?C.accent:`${C.textMuted}40`,
            transition:"all 0.3s",
          }}/>
        ))}
      </div>

      {/* STEP 0: Name & Stats */}
      {step===0 && (
        <div style={{ animation:"scaleIn 0.4s ease-out", textAlign:"center", width:"100%", maxWidth:380 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>👋</div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:800, color:C.textPrimary, marginBottom:6 }}>
            Welcome to LifeXP
          </h1>
          <p style={{ color:C.textSecondary, fontSize:14, marginBottom:28, lineHeight:1.6 }}>
            Level up your life. Let's create your character.
          </p>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your character name"
            style={{ width:"100%", padding:"14px 18px", borderRadius:14, background:C.bgCard,
              border:`1px solid ${C.borderLight}`, color:C.textPrimary, fontSize:16, outline:"none",
              marginBottom:14, fontFamily:"'Quicksand',sans-serif" }}/>
          <div style={{ display:"flex", gap:10 }}>
            <input value={height} onChange={e=>setHeight(e.target.value)} placeholder="Height (e.g. 5'10)"
              style={{ flex:1, padding:"12px 14px", borderRadius:12, background:C.bgCard,
                border:`1px solid ${C.borderLight}`, color:C.textPrimary, fontSize:14, outline:"none",
                fontFamily:"'Quicksand',sans-serif" }}/>
            <input value={weight} onChange={e=>setWeight(e.target.value)} placeholder="Weight (e.g. 180lb)"
              style={{ flex:1, padding:"12px 14px", borderRadius:12, background:C.bgCard,
                border:`1px solid ${C.borderLight}`, color:C.textPrimary, fontSize:14, outline:"none",
                fontFamily:"'Quicksand',sans-serif" }}/>
          </div>
        </div>
      )}

      {/* STEP 1: Avatar Creator */}
      {step===1 && (
        <div style={{ animation:"scaleIn 0.4s ease-out", width:"100%", maxWidth:400 }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <AvatarFull avatar={{ skin, hair, hairColor, eyes, wallpaper:"default" }} size={100} equipped={{}}/>
          </div>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:C.textPrimary, textAlign:"center", marginBottom:20 }}>
            Design Your Avatar
          </h2>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.textSecondary, marginBottom:8, letterSpacing:"0.05em" }}>SKIN TONE</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {SKIN_COLORS.map(c=>(
                <button key={c} onClick={()=>{setSkin(c);playClickSound();}} style={{
                  width:32, height:32, borderRadius:"50%", border:"none", cursor:"pointer",
                  background:c, outline: skin===c?`3px solid ${C.accent}`:`2px solid ${C.border}`,
                  outlineOffset:2, transition:"all 0.15s",
                }}/>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.textSecondary, marginBottom:8, letterSpacing:"0.05em" }}>HAIR STYLE</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {HAIR_STYLES.map(h=>(
                <button key={h.id} onClick={()=>{setHair(h.id);playClickSound();}} style={{
                  padding:"6px 12px", borderRadius:10, border:"none", cursor:"pointer",
                  background: hair===h.id?`${C.accent}20`:C.bgCard,
                  outline: hair===h.id?`2px solid ${C.accent}`:`1px solid ${C.border}`,
                  color:C.textPrimary, fontSize:12, fontWeight:600,
                }}>{h.draw} {h.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.textSecondary, marginBottom:8, letterSpacing:"0.05em" }}>HAIR COLOR</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {HAIR_COLORS.map(c=>(
                <button key={c} onClick={()=>{setHairColor(c);playClickSound();}} style={{
                  width:28, height:28, borderRadius:"50%", border:"none", cursor:"pointer",
                  background:c, outline: hairColor===c?`3px solid ${C.accent}`:`2px solid ${C.border}`,
                  outlineOffset:2,
                }}/>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize:12, fontWeight:700, color:C.textSecondary, marginBottom:8, letterSpacing:"0.05em" }}>EYES</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {EYE_STYLES.map(e=>(
                <button key={e.id} onClick={()=>{setEyes(e.id);playClickSound();}} style={{
                  padding:"6px 12px", borderRadius:10, border:"none", cursor:"pointer",
                  background: eyes===e.id?`${C.accent}20`:C.bgCard,
                  outline: eyes===e.id?`2px solid ${C.accent}`:`1px solid ${C.border}`,
                  color:C.textPrimary, fontSize:12, fontWeight:600,
                }}>{e.emoji} {e.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Goals */}
      {step===2 && (
        <div style={{ animation:"scaleIn 0.4s ease-out", width:"100%", maxWidth:400 }}>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:C.textPrimary, textAlign:"center", marginBottom:6 }}>
            What are your goals?
          </h2>
          <p style={{ color:C.textSecondary, fontSize:13, textAlign:"center", marginBottom:24 }}>Pick one or more. We'll set up habits for you.</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {GOAL_OPTIONS.map(g=>{
              const sel = goals.includes(g.id);
              return (
                <button key={g.id} onClick={()=>toggleGoal(g.id)} style={{
                  padding:16, borderRadius:16, border:"none", cursor:"pointer", textAlign:"left",
                  background: sel?`${g.color}15`:C.bgCard,
                  outline: sel?`2px solid ${g.color}`:`1px solid ${C.border}`,
                  transition:"all 0.2s",
                }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>{g.icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, color: sel?g.color:C.textPrimary, marginBottom:2 }}>{g.label}</div>
                  <div style={{ fontSize:11, color:C.textSecondary, lineHeight:1.4 }}>{g.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Bio */}
      {step===3 && (
        <div style={{ animation:"scaleIn 0.4s ease-out", width:"100%", maxWidth:380, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✍️</div>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:C.textPrimary, marginBottom:6 }}>
            Write your bio
          </h2>
          <p style={{ color:C.textSecondary, fontSize:13, marginBottom:24 }}>Others will see this on your profile. Keep it real.</p>
          <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="What motivates you? What are you working on?"
            rows={4} style={{
              width:"100%", padding:"14px 16px", borderRadius:14, background:C.bgCard,
              border:`1px solid ${C.borderLight}`, color:C.textPrimary, fontSize:14, outline:"none",
              resize:"none", fontFamily:"'Quicksand',sans-serif", lineHeight:1.6,
            }}/>
        </div>
      )}

      <button onClick={next} disabled={!canNext()} style={{
        marginTop:32, padding:"14px 48px", borderRadius:16, border:"none", cursor:canNext()?"pointer":"default",
        background: canNext()?`linear-gradient(135deg,${C.accent},${C.accentDim})`:`${C.textMuted}40`,
        color: canNext()?"#000":C.textMuted,
        fontWeight:800, fontSize:16, fontFamily:"'Sora',sans-serif",
        transition:"all 0.2s", boxShadow: canNext()?`0 4px 24px ${C.accentGlow}`:"none",
      }}>{step===3?"Let's Go!":"Continue"}</button>
    </div>
  );
}

// ======================== MAIN APP ========================

export default function LifeXPApp() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [habits, setHabits] = useState([]);
  const [totalXp, setTotalXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [weeklyXp, setWeeklyXp] = useState(0);
  const [bursts, setBursts] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [trophies, setTrophies] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCat, setNewHabitCat] = useState("fitness");
  const [newHabitPublic, setNewHabitPublic] = useState(true);
  const [shopTab, setShopTab] = useState("hats");
  const [commentText, setCommentText] = useState({});

  const FRIENDS = useMemo(()=>[
    { name:"Sarah M.", xp:1840, level:14, avatar:{skin:SKIN_COLORS[3],hair:"long",eyes:"cool",wallpaper:"ocean"}, equipped:{hat:"crown"}, status:"online", streak:28 },
    { name:"James K.", xp:1650, level:12, avatar:{skin:SKIN_COLORS[1],hair:"short",eyes:"happy",wallpaper:"sunset"}, equipped:{hat:"cap"}, status:"online", streak:15 },
    { name:"Lisa R.", xp:1420, level:11, avatar:{skin:SKIN_COLORS[5],hair:"curly",eyes:"star",wallpaper:"galaxy"}, equipped:{accessory:"glasses"}, status:"offline", streak:22 },
    { name:"Mike T.", xp:1280, level:10, avatar:{skin:SKIN_COLORS[0],hair:"mohawk",eyes:"cool",wallpaper:"fire"}, equipped:{hat:"cowboy"}, status:"online", streak:9 },
    { name:"Emma W.", xp:1100, level:9, avatar:{skin:SKIN_COLORS[7],hair:"medium",eyes:"happy",wallpaper:"emerald"}, equipped:{}, status:"offline", streak:18 },
  ],[]);

  // initialize after onboarding
  const onOnboardingComplete = (data) => {
    setUser(data);
    const allHabits = [];
    let id = 1;
    data.goals.forEach(g => {
      (DEFAULT_HABITS_BY_GOAL[g]||[]).forEach(h => {
        allHabits.push({ id: id++, name:h.name, category:g, xp:h.xp, streak:0, completedToday:false, isPublic:true });
      });
    });
    setHabits(allHabits);
    // seed timeline
    setTimeline([
      { id:1, type:"join", user:"Sarah M.", text:"joined LifeXP!", ts:Date.now()-86400000*2, comments:[] },
      { id:2, type:"levelup", user:"James K.", text:"reached Level 13!", ts:Date.now()-86400000, comments:[{user:"Lisa R.",text:"Congrats! 🎉",ts:Date.now()-80000000}] },
      { id:3, type:"trophy", user:"Lisa R.", text:"earned 🥇 Weekly Champion!", ts:Date.now()-43200000, comments:[] },
      { id:4, type:"task", user:"Mike T.", text:'completed "Morning Run"', ts:Date.now()-7200000, comments:[] },
    ]);
  };

  const completeHabit = useCallback((id, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const habit = habits.find(h=>h.id===id);
    if (!habit || habit.completedToday) return;

    playCompleteSound();
    const xpGain = habit.xp;
    const coinGain = Math.floor(habit.xp/4) + (habit.streak>=7?5:0);
    const oldLevel = getLevel(totalXp);

    setHabits(prev=>prev.map(h=>h.id===id?{...h,completedToday:true,streak:h.streak+1}:h));
    setTotalXp(prev=>prev+xpGain);
    setWeeklyXp(prev=>prev+xpGain);
    setCoins(prev=>prev+coinGain);
    playCoinSound();

    setBursts(prev=>[...prev,{id:Date.now(),x:rect.left+rect.width/2,y:rect.top,amount:xpGain}]);

    // add to timeline if public
    if (habit.isPublic && user) {
      setTimeline(prev=>[{
        id:Date.now(), type:"task", user:user.name,
        text:`completed "${habit.name}"`, ts:Date.now(), comments:[], isUser:true,
      }, ...prev]);
    }

    setTimeout(()=>{
      if (getLevel(totalXp+xpGain)>oldLevel) {
        playLevelUpSound();
        setShowLevelUp(true);
        setCoins(prev=>prev+50);
        setTimeline(prev=>[{
          id:Date.now()+1, type:"levelup", user:user?.name||"You",
          text:`reached Level ${getLevel(totalXp+xpGain)}!`, ts:Date.now(), comments:[], isUser:true,
        },...prev]);
      }
    },300);
  },[habits, totalXp, user]);

  const addComment = (timelineId) => {
    const text = commentText[timelineId];
    if (!text?.trim()) return;
    playClickSound();
    setTimeline(prev=>prev.map(t=>t.id===timelineId?{...t, comments:[...t.comments,{user:user?.name||"You",text:text.trim(),ts:Date.now()}]}:t));
    setCommentText(prev=>({...prev,[timelineId]:""}));
  };

  const buyItem = (type, item) => {
    if (ownedItems.includes(item.id)) {
      setEquipped(prev=>({...prev,[type]:prev[type]===item.id?null:item.id}));
      playClickSound();
      return;
    }
    if (coins>=item.cost) {
      setCoins(prev=>prev-item.cost);
      setOwnedItems(prev=>[...prev,item.id]);
      setEquipped(prev=>({...prev,[type]:item.id}));
      playCoinSound();
    }
  };

  const buyWallpaper = (wp) => {
    if (ownedItems.includes(wp.id) || wp.cost===0) {
      setUser(prev=>({...prev,wallpaper:wp.id}));
      playClickSound();
      return;
    }
    if (coins>=wp.cost) {
      setCoins(prev=>prev-wp.cost);
      setOwnedItems(prev=>[...prev,wp.id]);
      setUser(prev=>({...prev,wallpaper:wp.id}));
      playCoinSound();
    }
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    playClickSound();
    setHabits(prev=>[...prev,{
      id:Date.now(), name:newHabitName.trim(), category:newHabitCat,
      xp:20+Math.floor(Math.random()*20), streak:0, completedToday:false, isPublic:newHabitPublic,
    }]);
    setNewHabitName(""); setShowAddHabit(false);
  };

  if (!user) return <OnboardingScreen onComplete={onOnboardingComplete}/>;

  const level = getLevel(totalXp);
  const xpProgress = getXpProgress(totalXp);
  const completedCount = habits.filter(h=>h.completedToday).length;

  const leaderboard = [...FRIENDS.map(f=>({...f,isUser:false})),
    { name:user.name, xp:weeklyXp, level, avatar:user, equipped, isUser:true, streak: Math.max(...habits.map(h=>h.streak),0) }
  ].sort((a,b)=>b.xp-a.xp);
  const userRank = leaderboard.findIndex(p=>p.isUser)+1;

  return (
    <div style={{
      minHeight:"100vh", background:C.bg, color:C.textPrimary,
      fontFamily:"'Quicksand','DM Sans',sans-serif",
      paddingBottom:85, position:"relative", overflow:"hidden", maxWidth:480, margin:"0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        @keyframes floatUp{0%{transform:translate(-50%,0);opacity:1}100%{transform:translate(-50%,-70px);opacity:0}}
        @keyframes scaleIn{from{transform:scale(0.85);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 15px ${C.accentGlow}}50%{box-shadow:0 0 35px ${C.accentGlow}}}
        @keyframes particle0{to{transform:translate(var(--px),var(--py));opacity:0}}
        @keyframes particle1{to{transform:translate(var(--px),var(--py));opacity:0}}
        @keyframes particle2{to{transform:translate(var(--px),var(--py));opacity:0}}
        @keyframes particle3{to{transform:translate(var(--px),var(--py));opacity:0}}
        @keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}
        .s1{animation:slideUp .35s ease-out .04s both}
        .s2{animation:slideUp .35s ease-out .08s both}
        .s3{animation:slideUp .35s ease-out .12s both}
        .s4{animation:slideUp .35s ease-out .16s both}
        .s5{animation:slideUp .35s ease-out .2s both}
        .s6{animation:slideUp .35s ease-out .24s both}
        .hcard{transition:transform .12s,box-shadow .12s}.hcard:active{transform:scale(0.97)}
        input::placeholder,textarea::placeholder{color:${C.textMuted}}
        ::-webkit-scrollbar{width:0;height:0}
      `}</style>

      {/* ambient glow */}
      <div style={{ position:"fixed",top:-200,right:-200,width:500,height:500,borderRadius:"50%",
        background:`radial-gradient(circle,${C.accentGlow} 0%,transparent 70%)`,opacity:0.12,pointerEvents:"none"}}/>

      {/* bursts */}
      {bursts.map(b=><XPBurst key={b.id} {...b} onDone={()=>setBursts(prev=>prev.filter(x=>x.id!==b.id))}/>)}

      {/* Level Up Modal */}
      {showLevelUp && (
        <div onClick={()=>setShowLevelUp(false)} style={{
          position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",
          background:C.bg+"DD", animation:"scaleIn 0.3s ease-out",
        }}>
          <div style={{
            background:C.bgCard, borderRadius:24, padding:40, textAlign:"center",
            border:`2px solid ${C.gold}`, boxShadow:`0 0 80px ${C.goldGlow}`, maxWidth:320,
          }}>
            <div style={{ fontSize:60, marginBottom:8 }}>🎉</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:34, fontWeight:800, color:C.gold }}>LEVEL UP!</div>
            <div style={{ fontSize:72, fontWeight:900, fontFamily:"'Sora',sans-serif", color:C.textPrimary, lineHeight:1, margin:"8px 0" }}>{level}</div>
            <div style={{ color:C.textSecondary, fontSize:13 }}>+50 bonus coins! 🪙</div>
            <div style={{
              marginTop:20, padding:"12px 32px", borderRadius:14,
              background:`linear-gradient(135deg,${C.gold},${C.amber})`,
              color:"#000", fontWeight:800, fontSize:14, cursor:"pointer",
            }}>CONTINUE</div>
          </div>
        </div>
      )}

      {/* ============ HOME ============ */}
      {tab==="home" && (
        <div style={{ padding:"14px 18px" }}>
          {/* Header */}
          <div className="s1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <AvatarFull avatar={user} size={50} equipped={equipped}/>
              <div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800 }}>{user.name}</div>
                <div style={{ color:C.textSecondary, fontSize:12 }}>Level {level} · {user.goals.map(g=>GOAL_OPTIONS.find(o=>o.id===g)?.icon).join(" ")}</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, background:`${C.gold}15`, padding:"5px 12px", borderRadius:18, border:`1px solid ${C.gold}30` }}>
              <span style={{ fontSize:14 }}>🪙</span>
              <span style={{ fontWeight:800, color:C.gold, fontSize:14, fontFamily:"'Sora',sans-serif" }}>{coins}</span>
            </div>
          </div>

          {/* XP Card */}
          <div className="s2" style={{
            background:`linear-gradient(135deg,${C.bgCard},${C.bgCardHover})`,
            borderRadius:18, padding:18, marginBottom:14, border:`1px solid ${C.border}`,
            animation:"pulseGlow 4s ease-in-out infinite",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div>
                <div style={{ fontSize:11, color:C.textSecondary, fontWeight:700, letterSpacing:"0.06em" }}>TOTAL XP</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:34, fontWeight:800, color:C.accent, lineHeight:1 }}>{totalXp.toLocaleString()}</div>
              </div>
              <ProgressRing progress={xpProgress} size={58} stroke={5}/>
            </div>
            <div style={{ background:`${C.textMuted}30`, borderRadius:8, height:7, overflow:"hidden" }}>
              <div style={{ width:`${xpProgress}%`, height:"100%", borderRadius:8,
                background:`linear-gradient(90deg,${C.accent},${C.gold})`,
                transition:"width 0.6s", boxShadow:`0 0 10px ${C.accentGlow}` }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
              <span style={{ fontSize:10, color:C.textMuted }}>Level {level}</span>
              <span style={{ fontSize:10, color:C.textMuted }}>{getXpToNext(totalXp)} XP to next</span>
            </div>
          </div>

          {/* Daily progress */}
          <div className="s3" style={{
            background:C.bgCard, borderRadius:14, padding:14, marginBottom:18, border:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ fontSize:11, color:C.textSecondary, fontWeight:700, letterSpacing:"0.06em" }}>TODAY</div>
              <div style={{ fontSize:18, fontWeight:800 }}>
                <span style={{ color:C.accent }}>{completedCount}</span>
                <span style={{ color:C.textMuted }}> / {habits.length}</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:3 }}>
              {habits.map(h=>(
                <div key={h.id} style={{ width:8, height:26, borderRadius:4,
                  background: h.completedToday?C.accent:`${C.textMuted}30`,
                  transition:"background 0.3s",
                  boxShadow: h.completedToday?`0 0 6px ${C.accentGlow}`:"none" }}/>
              ))}
            </div>
          </div>

          {/* Habits */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:15, fontWeight:700 }}>Today's Habits</div>
            <button onClick={()=>setShowAddHabit(true)} style={{
              background:`${C.accent}15`, border:`1px solid ${C.accent}30`,
              color:C.accent, fontSize:12, fontWeight:700, padding:"5px 12px", borderRadius:10, cursor:"pointer",
            }}>+ Add</button>
          </div>

          {habits.map((habit, idx) => {
            const cat = GOAL_OPTIONS.find(c=>c.id===habit.category);
            return (
              <div key={habit.id} className={`hcard s${Math.min(idx+3,6)}`}
                onClick={(e)=>!habit.completedToday && completeHabit(habit.id,e)}
                style={{
                  background: habit.completedToday?`${C.accent}08`:C.bgCard,
                  borderRadius:14, padding:14, marginBottom:8,
                  border:`1px solid ${habit.completedToday?`${C.accent}25`:C.border}`,
                  display:"flex", alignItems:"center", gap:12,
                  cursor: habit.completedToday?"default":"pointer",
                  opacity: habit.completedToday?0.65:1,
                }}>
                <div style={{
                  width:40, height:40, borderRadius:12,
                  background: habit.completedToday?`${C.accent}20`:`${cat?.color||C.accent}12`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0,
                  border:`1px solid ${habit.completedToday?C.accent:cat?.color||C.accent}25`,
                }}>
                  {habit.completedToday?"✓":cat?.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, textDecoration:habit.completedToday?"line-through":"none",
                    color:habit.completedToday?C.textSecondary:C.textPrimary }}>{habit.name}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
                    <span style={{ fontSize:11, color:cat?.color, fontWeight:600 }}>{cat?.label}</span>
                    <StreakBadge streak={habit.streak}/>
                    {habit.isPublic && <span style={{ fontSize:9, color:C.textMuted, fontWeight:600 }}>PUBLIC</span>}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:habit.completedToday?C.textMuted:C.accent }}>+{habit.xp}</div>
                  <div style={{ fontSize:9, color:C.textMuted, fontWeight:700 }}>XP</div>
                </div>
              </div>
            );
          })}

          {/* Add Habit Modal */}
          {showAddHabit && (
            <div onClick={e=>e.target===e.currentTarget&&setShowAddHabit(false)} style={{
              position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",background:`${C.bg}DD`,
            }}>
              <div style={{
                background:C.bgCard, borderRadius:"22px 22px 0 0", padding:24, width:"100%", maxWidth:480,
                animation:"slideUp 0.3s ease-out", border:`1px solid ${C.border}`, borderBottom:"none",
              }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, marginBottom:18 }}>New Habit</div>
                <input value={newHabitName} onChange={e=>setNewHabitName(e.target.value)} placeholder="What habit do you want to build?"
                  style={{ width:"100%", padding:"12px 14px", borderRadius:12, background:C.bg, border:`1px solid ${C.borderLight}`,
                    color:C.textPrimary, fontSize:14, outline:"none", marginBottom:14, fontFamily:"'Quicksand',sans-serif" }}/>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                  {GOAL_OPTIONS.map(cat=>(
                    <button key={cat.id} onClick={()=>setNewHabitCat(cat.id)} style={{
                      padding:"6px 12px", borderRadius:10, border:"none", cursor:"pointer",
                      background:newHabitCat===cat.id?`${cat.color}25`:`${C.textMuted}15`,
                      color:newHabitCat===cat.id?cat.color:C.textSecondary, fontWeight:700, fontSize:12,
                      outline:newHabitCat===cat.id?`2px solid ${cat.color}`:"none",
                    }}>{cat.icon} {cat.label}</button>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
                  <button onClick={()=>setNewHabitPublic(!newHabitPublic)} style={{
                    width:44, height:24, borderRadius:12, border:"none", cursor:"pointer",
                    background:newHabitPublic?C.accent:`${C.textMuted}40`, position:"relative", transition:"background 0.2s",
                  }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3,
                      left:newHabitPublic?23:3, transition:"left 0.2s" }}/>
                  </button>
                  <span style={{ fontSize:13, color:C.textSecondary }}>Show on public feed</span>
                </div>
                <button onClick={addHabit} style={{
                  width:"100%", padding:"13px", borderRadius:14, border:"none",
                  background:`linear-gradient(135deg,${C.accent},${C.accentDim})`,
                  color:"#000", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"'Sora',sans-serif",
                }}>Create Habit</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ TIMELINE / FEED ============ */}
      {tab==="timeline" && (
        <div style={{ padding:"14px 18px" }}>
          <div className="s1" style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, marginBottom:18 }}>Activity Feed 📰</div>
          {timeline.map((item,idx)=>{
            const icons = { task:"✅", levelup:"⬆️", trophy:"🏆", join:"🎉" };
            return (
              <div key={item.id} className={`s${Math.min(idx+1,6)}`} style={{
                background:C.bgCard, borderRadius:16, padding:14, marginBottom:10, border:`1px solid ${C.border}`,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:18 }}>{icons[item.type]}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontWeight:700, fontSize:14, color:item.isUser?C.accent:C.textPrimary }}>{item.user}</span>
                    <span style={{ fontSize:13, color:C.textSecondary }}> {item.text}</span>
                  </div>
                  <span style={{ fontSize:11, color:C.textMuted }}>{timeAgo(item.ts)}</span>
                </div>

                {/* Comments */}
                {item.comments.length>0 && (
                  <div style={{ marginLeft:28, marginBottom:6 }}>
                    {item.comments.map((c,ci)=>(
                      <div key={ci} style={{ fontSize:12, color:C.textSecondary, padding:"4px 0",
                        borderTop:ci>0?`1px solid ${C.border}`:"none" }}>
                        <span style={{ fontWeight:700, color:C.textPrimary }}>{c.user}</span> {c.text}
                        <span style={{ color:C.textMuted, marginLeft:6, fontSize:10 }}>{timeAgo(c.ts)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment */}
                <div style={{ display:"flex", gap:6, marginTop:6 }}>
                  <input value={commentText[item.id]||""} onChange={e=>setCommentText(prev=>({...prev,[item.id]:e.target.value}))}
                    placeholder="Comment..." onKeyDown={e=>e.key==="Enter"&&addComment(item.id)}
                    style={{ flex:1, padding:"7px 10px", borderRadius:10, background:C.bg, border:`1px solid ${C.border}`,
                      color:C.textPrimary, fontSize:12, outline:"none", fontFamily:"'Quicksand',sans-serif" }}/>
                  <button onClick={()=>addComment(item.id)} style={{
                    padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer",
                    background:`${C.accent}20`, color:C.accent, fontWeight:700, fontSize:12,
                  }}>Send</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ LEADERBOARD ============ */}
      {tab==="leaderboard" && (
        <div style={{ padding:"14px 18px" }}>
          <div className="s1" style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, marginBottom:4 }}>Weekly Ranks 🏆</div>
          <div className="s1" style={{ color:C.textSecondary, fontSize:12, marginBottom:18 }}>Your rank: #{userRank} · Top 3 earn trophies!</div>

          {/* Podium */}
          <div className="s2" style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", gap:10, marginBottom:24 }}>
            {[1,0,2].map((idx,posIdx)=>{
              const p = leaderboard[idx]; if(!p) return null;
              const heights = [110,85,65]; const medals = ["🥇","🥈","🥉"];
              return (
                <div key={idx} style={{ textAlign:"center", flex:1 }}>
                  <AvatarFull avatar={p.avatar} size={40} equipped={p.equipped||{}} showBorder={p.isUser}/>
                  <div style={{ fontSize:11, fontWeight:700, marginTop:4, color:p.isUser?C.accent:C.textPrimary }}>{p.name}</div>
                  <div style={{ fontSize:10, color:C.textSecondary }}>{p.xp} XP</div>
                  <div style={{
                    height:heights[posIdx], borderRadius:"10px 10px 0 0", marginTop:6,
                    background:p.isUser?`${C.accent}15`:`${C.textMuted}10`,
                    border:`1px solid ${p.isUser?`${C.accent}30`:C.border}`, borderBottom:"none",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:26,
                  }}>{medals[idx]}</div>
                </div>
              );
            })}
          </div>

          {leaderboard.slice(3).map((p,idx)=>(
            <div key={idx} className={`s${Math.min(idx+3,6)}`} style={{
              background:p.isUser?`${C.accent}08`:C.bgCard,
              borderRadius:12, padding:12, marginBottom:6, border:`1px solid ${p.isUser?`${C.accent}20`:C.border}`,
              display:"flex", alignItems:"center", gap:10,
            }}>
              <div style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
                background:`${C.textMuted}15`, fontWeight:800, fontSize:13, color:C.textSecondary }}>#{idx+4}</div>
              <AvatarFull avatar={p.avatar} size={32} equipped={p.equipped||{}} showBorder={false}/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:p.isUser?C.accent:C.textPrimary }}>{p.name}</div>
                <div style={{ fontSize:11, color:C.textSecondary }}>Lv {p.level}</div>
              </div>
              <div style={{ fontWeight:800, fontSize:14, color:C.accent }}>{p.xp}</div>
            </div>
          ))}
        </div>
      )}

      {/* ============ PROFILE ============ */}
      {tab==="profile" && (
        <div style={{ padding:"14px 18px" }}>
          {/* Profile header with wallpaper */}
          {(() => {
            const wp = PROFILE_WALLPAPERS.find(w=>w.id===user.wallpaper) || PROFILE_WALLPAPERS[0];
            return (
              <div className="s1" style={{
                background:wp.bg, borderRadius:20, padding:24, marginBottom:16,
                border:`1px solid ${C.border}`, textAlign:"center", position:"relative",
              }}>
                {/* wallpaper label */}
                <div style={{ position:"absolute", top:10, right:12, fontSize:9, color:`${C.textMuted}80`,
                  background:`${C.bg}80`, padding:"2px 8px", borderRadius:8, fontWeight:600 }}>
                  🎨 {PROFILE_WALLPAPERS.find(w=>w.id===user.wallpaper)?.label || "Default"}
                </div>
                <AvatarFull avatar={user} size={90} equipped={equipped}/>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, marginTop:10 }}>{user.name}</div>
                <div style={{ color:C.textSecondary, fontSize:12, marginTop:2 }}>
                  Level {level} · {user.height} · {user.weight}
                </div>
                {user.bio && <div style={{ color:C.textSecondary, fontSize:13, marginTop:8, lineHeight:1.5, fontStyle:"italic" }}>"{user.bio}"</div>}
                <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:14 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:C.accent }}>{totalXp}</div>
                    <div style={{ fontSize:10, color:C.textMuted, fontWeight:600 }}>TOTAL XP</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:C.gold }}>{coins}</div>
                    <div style={{ fontSize:10, color:C.textMuted, fontWeight:600 }}>COINS</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:C.coral }}>{Math.max(...habits.map(h=>h.streak),0)}</div>
                    <div style={{ fontSize:10, color:C.textMuted, fontWeight:600 }}>BEST STREAK</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Equipped Items */}
          <div className="s2" style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.textSecondary, marginBottom:8, letterSpacing:"0.05em" }}>EQUIPPED</div>
            <div style={{ display:"flex", gap:8 }}>
              {["hat","clothing","accessory"].map(type=>{
                const items = type==="hat"?SHOP_HATS:type==="clothing"?SHOP_CLOTHES:SHOP_ACCESSORIES;
                const item = items.find(i=>i.id===equipped[type]);
                return (
                  <div key={type} style={{
                    flex:1, background:C.bgCard, borderRadius:12, padding:12, textAlign:"center",
                    border:`1px solid ${C.border}`,
                  }}>
                    <div style={{ fontSize:24 }}>{item?.emoji||"—"}</div>
                    <div style={{ fontSize:10, color:C.textMuted, fontWeight:600, marginTop:2 }}>{type.toUpperCase()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trophies */}
          <div className="s3" style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.textSecondary, marginBottom:8, letterSpacing:"0.05em" }}>TROPHY CASE 🏆</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {TROPHIES.map(t=>{
                const earned = trophies.includes(t.id);
                return (
                  <div key={t.id} style={{
                    background: earned?`${C.gold}10`:C.bgCard, borderRadius:12, padding:12, textAlign:"center",
                    border:`1px solid ${earned?`${C.gold}25`:C.border}`, opacity:earned?1:0.35,
                  }}>
                    <div style={{ fontSize:28 }}>{t.emoji}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:C.textPrimary, marginTop:4 }}>{t.label}</div>
                    <div style={{ fontSize:9, color:C.textMuted }}>{t.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Wallpapers */}
          <div className="s4">
            <div style={{ fontSize:13, fontWeight:700, color:C.textSecondary, marginBottom:8, letterSpacing:"0.05em" }}>PROFILE WALLPAPERS 🎨</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {PROFILE_WALLPAPERS.map(wp=>{
                const owned = ownedItems.includes(wp.id) || wp.cost===0;
                const active = user.wallpaper===wp.id;
                return (
                  <button key={wp.id} onClick={()=>buyWallpaper(wp)} style={{
                    height:56, borderRadius:10, border:"none", cursor:"pointer",
                    background:wp.bg, outline:active?`2px solid ${C.accent}`:`1px solid ${C.border}`,
                    position:"relative", opacity:!owned&&coins<wp.cost?0.3:1,
                  }}>
                    <div style={{ position:"absolute", bottom:2, left:0, right:0, textAlign:"center",
                      fontSize:8, fontWeight:700, color:C.textPrimary,
                      textShadow:"0 1px 3px rgba(0,0,0,0.8)" }}>
                      {active?"✓":!owned?`🪙${wp.cost}`:wp.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Public completed tasks */}
          <div className="s5" style={{ marginTop:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.textSecondary, marginBottom:8, letterSpacing:"0.05em" }}>COMPLETED TODAY</div>
            {habits.filter(h=>h.completedToday&&h.isPublic).length===0 && (
              <div style={{ color:C.textMuted, fontSize:13, padding:12 }}>No public tasks completed yet today.</div>
            )}
            {habits.filter(h=>h.completedToday&&h.isPublic).map(h=>{
              const cat = GOAL_OPTIONS.find(c=>c.id===h.category);
              return (
                <div key={h.id} style={{
                  background:C.bgCard, borderRadius:10, padding:10, marginBottom:6,
                  border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8,
                }}>
                  <span style={{ fontSize:16 }}>{cat?.icon}</span>
                  <span style={{ fontWeight:600, fontSize:13, color:C.textSecondary }}>{h.name}</span>
                  <span style={{ marginLeft:"auto", fontSize:12, fontWeight:700, color:C.accent }}>+{h.xp} XP</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============ SHOP ============ */}
      {tab==="shop" && (
        <div style={{ padding:"14px 18px" }}>
          <div className="s1" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800 }}>Shop 🛍️</div>
            <div style={{ display:"flex", alignItems:"center", gap:5, background:`${C.gold}15`, padding:"5px 12px", borderRadius:18, border:`1px solid ${C.gold}30` }}>
              <span>🪙</span><span style={{ fontWeight:800, color:C.gold, fontFamily:"'Sora',sans-serif" }}>{coins}</span>
            </div>
          </div>

          {/* Premium Card */}
          <div className="s2" style={{
            background:`linear-gradient(135deg,${C.gold}12,${C.bgCard})`,
            borderRadius:18, padding:18, marginBottom:16, border:`1px solid ${C.gold}25`,
          }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.gold, marginBottom:6 }}>⭐ PREMIUM</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, marginBottom:4 }}>LifeXP Pro</div>
            <div style={{ fontSize:12, color:C.textSecondary, lineHeight:1.5, marginBottom:12 }}>
              Unlimited habits, exclusive items, analytics, and more.
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:12 }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:900, color:C.accent }}>$4.99</span>
              <span style={{ fontSize:12, color:C.textSecondary }}>/mo</span>
            </div>
            <button style={{ width:"100%", padding:"12px", borderRadius:14, border:"none",
              background:`linear-gradient(135deg,${C.gold},${C.amber})`,
              color:"#000", fontWeight:800, fontSize:14, cursor:"pointer" }}>Start Free Trial</button>
          </div>

          {/* Shop Tabs */}
          <div className="s3" style={{ display:"flex", gap:6, marginBottom:14 }}>
            {[{id:"hats",label:"🧢 Hats"},{id:"clothing",label:"👕 Clothes"},{id:"accessories",label:"🕶️ Gear"},{id:"power",label:"⚡ Power"}].map(t=>(
              <button key={t.id} onClick={()=>{setShopTab(t.id);playClickSound();}} style={{
                flex:1, padding:"8px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background:shopTab===t.id?`${C.accent}15`:`${C.textMuted}10`,
                color:shopTab===t.id?C.accent:C.textSecondary,
                fontWeight:700, fontSize:11,
                outline:shopTab===t.id?`1px solid ${C.accent}40`:"none",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Shop Items */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
            {(shopTab==="hats"?SHOP_HATS:shopTab==="clothing"?SHOP_CLOTHES:shopTab==="accessories"?SHOP_ACCESSORIES:[
              {id:"shield",label:"Streak Shield",cost:75,emoji:"🛡️",desc:"Protect streak 1 day"},
              {id:"double",label:"2x XP (24h)",cost:150,emoji:"⚡",desc:"Double all XP earned"},
              {id:"reveal",label:"Rank Reveal",cost:50,emoji:"🔍",desc:"See others' habits"},
              {id:"boost",label:"Coin Boost",cost:100,emoji:"💰",desc:"2x coins for 24h"},
            ]).map(item=>{
              const owned = ownedItems.includes(item.id);
              const isEquipped = equipped[shopTab==="hats"?"hat":shopTab==="clothing"?"clothing":"accessory"]===item.id;
              return (
                <button key={item.id} onClick={()=>shopTab!=="power"&&buyItem(shopTab==="hats"?"hat":shopTab==="clothing"?"clothing":"accessory",item)}
                  style={{
                    padding:14, borderRadius:14, border:"none", cursor:"pointer", textAlign:"center",
                    background: isEquipped?`${C.accent}10`:C.bgCard,
                    outline: isEquipped?`2px solid ${C.accent}`:`1px solid ${C.border}`,
                    opacity:!owned&&coins<item.cost?0.4:1,
                  }}>
                  <div style={{ fontSize:36, marginBottom:6 }}>{item.emoji}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.textPrimary }}>{item.label}</div>
                  {item.desc && <div style={{ fontSize:10, color:C.textMuted, marginTop:2 }}>{item.desc}</div>}
                  {!owned && item.cost>0 ? (
                    <div style={{ fontSize:12, color:C.gold, fontWeight:800, marginTop:4 }}>🪙 {item.cost}</div>
                  ) : owned ? (
                    <div style={{ fontSize:10, color:isEquipped?C.accent:C.textSecondary, fontWeight:700, marginTop:4 }}>
                      {isEquipped?"EQUIPPED":"OWNED · TAP TO EQUIP"}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <TabBar active={tab} onTab={setTab}/>
    </div>
  );
}
