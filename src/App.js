import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  bg: "#0F1923",
  bgCard: "#162232",
  bgCardHover: "#1B2D42",
  accent: "#00E5A0",
  accentGlow: "rgba(0,229,160,0.3)",
  accentDim: "#00B87D",
  gold: "#FFD700",
  goldGlow: "rgba(255,215,0,0.3)",
  purple: "#A855F7",
  purpleGlow: "rgba(168,85,247,0.3)",
  coral: "#FF6B6B",
  coralGlow: "rgba(255,107,107,0.3)",
  blue: "#3B82F6",
  blueGlow: "rgba(59,130,246,0.3)",
  textPrimary: "#F0F4F8",
  textSecondary: "#8899AA",
  textMuted: "#5A6B7C",
  border: "rgba(255,255,255,0.06)",
  overlay: "rgba(15,25,35,0.85)",
};

const HABIT_CATEGORIES = [
  { id: "fitness", label: "Fitness", icon: "💪", color: COLORS.coral, glow: COLORS.coralGlow },
  { id: "mindfulness", label: "Mindfulness", icon: "🧘", color: COLORS.purple, glow: COLORS.purpleGlow },
  { id: "nutrition", label: "Nutrition", icon: "🥗", color: COLORS.accent, glow: COLORS.accentGlow },
  { id: "learning", label: "Learning", icon: "📚", color: COLORS.blue, glow: COLORS.blueGlow },
  { id: "sleep", label: "Sleep", icon: "😴", color: COLORS.purple, glow: COLORS.purpleGlow },
  { id: "social", label: "Social", icon: "👋", color: COLORS.gold, glow: COLORS.goldGlow },
];

const AVATAR_ITEMS = {
  hats: [
    { id: "none", label: "None", cost: 0, emoji: "" },
    { id: "cap", label: "Sport Cap", cost: 50, emoji: "🧢" },
    { id: "crown", label: "Crown", cost: 200, emoji: "👑" },
    { id: "wizard", label: "Wizard Hat", cost: 500, emoji: "🧙" },
    { id: "cowboy", label: "Cowboy", cost: 150, emoji: "🤠" },
  ],
  faces: [
    { id: "smile", label: "Smile", cost: 0, emoji: "😊" },
    { id: "cool", label: "Cool", cost: 75, emoji: "😎" },
    { id: "star", label: "Star Eyes", cost: 120, emoji: "🤩" },
    { id: "zen", label: "Zen", cost: 200, emoji: "😌" },
    { id: "strong", label: "Strong", cost: 100, emoji: "💪" },
  ],
  backgrounds: [
    { id: "default", label: "Default", cost: 0, color: "#1B2D42" },
    { id: "sunset", label: "Sunset", cost: 100, color: "linear-gradient(135deg, #FF6B6B, #FFD700)" },
    { id: "ocean", label: "Ocean", cost: 100, color: "linear-gradient(135deg, #3B82F6, #00E5A0)" },
    { id: "galaxy", label: "Galaxy", cost: 250, color: "linear-gradient(135deg, #A855F7, #3B82F6)" },
    { id: "forest", label: "Forest", cost: 150, color: "linear-gradient(135deg, #00B87D, #162232)" },
  ],
};

const DEFAULT_HABITS = [
  { id: 1, name: "Morning Walk", category: "fitness", xp: 30, streak: 5, completedToday: false },
  { id: 2, name: "Meditate 10min", category: "mindfulness", xp: 25, streak: 12, completedToday: false },
  { id: 3, name: "Drink 8 Glasses Water", category: "nutrition", xp: 20, streak: 3, completedToday: false },
  { id: 4, name: "Read 20 Pages", category: "learning", xp: 35, streak: 7, completedToday: false },
  { id: 5, name: "Sleep by 10:30pm", category: "sleep", xp: 25, streak: 2, completedToday: false },
  { id: 6, name: "Call a Friend", category: "social", xp: 20, streak: 0, completedToday: false },
];

const LEADERBOARD_DATA = [
  { name: "You", xp: 0, avatar: "😊", level: 1, isUser: true },
  { name: "Sarah M.", xp: 1840, avatar: "😎", level: 14, isUser: false },
  { name: "James K.", xp: 1650, avatar: "🤩", level: 12, isUser: false },
  { name: "Lisa R.", xp: 1420, avatar: "😌", level: 11, isUser: false },
  { name: "Mike T.", xp: 1280, avatar: "💪", level: 10, isUser: false },
  { name: "Emma W.", xp: 1100, avatar: "😊", level: 9, isUser: false },
  { name: "David L.", xp: 980, avatar: "😎", level: 8, isUser: false },
  { name: "Anna B.", xp: 870, avatar: "🤩", level: 7, isUser: false },
  { name: "Chris P.", xp: 760, avatar: "😌", level: 6, isUser: false },
  { name: "Rachel S.", xp: 650, avatar: "💪", level: 5, isUser: false },
];

const FRIENDS_DATA = [
  { name: "Sarah M.", avatar: "😎", level: 14, status: "online", streak: 28 },
  { name: "James K.", avatar: "🤩", level: 12, status: "online", streak: 15 },
  { name: "Lisa R.", avatar: "😌", level: 11, status: "offline", streak: 22 },
  { name: "Mike T.", avatar: "💪", level: 10, status: "online", streak: 9 },
];

function getLevel(xp) {
  return Math.floor(xp / 150) + 1;
}
function getXpForNextLevel(xp) {
  const level = getLevel(xp);
  return level * 150;
}
function getXpProgress(xp) {
  const level = getLevel(xp);
  const base = (level - 1) * 150;
  const next = level * 150;
  return ((xp - base) / (next - base)) * 100;
}

// --- Particle burst on XP gain ---
function XPBurst({ x, y, amount, onDone }) {
  const [particles, setParticles] = useState([]);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const p = [];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      p.push({
        id: i,
        x: Math.cos(angle) * (40 + Math.random() * 30),
        y: Math.sin(angle) * (40 + Math.random() * 30),
        size: 3 + Math.random() * 4,
        color: [COLORS.accent, COLORS.gold, COLORS.purple][i % 3],
      });
    }
    setParticles(p);
    const t = setTimeout(() => setOpacity(0), 50);
    const t2 = setTimeout(onDone, 800);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999 }}>
      <div style={{
        position: "absolute", transform: "translate(-50%,-50%)",
        fontSize: 22, fontWeight: 800, color: COLORS.gold,
        textShadow: `0 0 20px ${COLORS.goldGlow}`,
        animation: "floatUp 0.8s ease-out forwards",
      }}>+{amount} XP</div>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          width: p.size, height: p.size, borderRadius: "50%",
          background: p.color,
          boxShadow: `0 0 6px ${p.color}`,
          transform: `translate(-50%,-50%)`,
          left: 0, top: 0,
          animation: `burst-${p.id % 4} 0.7s ease-out forwards`,
          opacity: opacity === 1 ? 1 : 0,
          transition: "opacity 0.6s",
          "--dx": `${p.x}px`, "--dy": `${p.y}px`,
        }} />
      ))}
    </div>
  );
}

// --- Coin animation ---
function CoinPop({ x, y, amount, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: "fixed", left: x, top: y - 30, pointerEvents: "none", zIndex: 9999,
      transform: "translate(-50%,-50%)",
      fontSize: 18, fontWeight: 800, color: COLORS.gold,
      textShadow: `0 0 15px ${COLORS.goldGlow}`,
      animation: "floatUp 1s ease-out forwards",
    }}>🪙 +{amount}</div>
  );
}

// --- Progress ring ---
function ProgressRing({ progress, size = 48, stroke = 4, color = COLORS.accent }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={COLORS.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

// --- Avatar display ---
function AvatarDisplay({ avatar, size = 64, showBorder = true }) {
  const bg = AVATAR_ITEMS.backgrounds.find(b => b.id === avatar.background) || AVATAR_ITEMS.backgrounds[0];
  const hat = AVATAR_ITEMS.hats.find(h => h.id === avatar.hat) || AVATAR_ITEMS.hats[0];
  const face = AVATAR_ITEMS.faces.find(f => f.id === avatar.face) || AVATAR_ITEMS.faces[0];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", flexShrink: 0,
      border: showBorder ? `3px solid ${COLORS.accent}` : "none",
      boxShadow: showBorder ? `0 0 15px ${COLORS.accentGlow}` : "none",
    }}>
      {hat.emoji && <span style={{ position: "absolute", top: -size*0.18, fontSize: size*0.35 }}>{hat.emoji}</span>}
      <span style={{ fontSize: size * 0.45 }}>{face.emoji}</span>
    </div>
  );
}

// --- Tab bar ---
function TabBar({ active, onTab }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "leaderboard", icon: "🏆", label: "Ranks" },
    { id: "friends", icon: "👥", label: "Friends" },
    { id: "avatar", icon: "✨", label: "Avatar" },
    { id: "shop", icon: "🛒", label: "Shop" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(15,25,35,0.95)", backdropFilter: "blur(20px)",
      borderTop: `1px solid ${COLORS.border}`,
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 0 env(safe-area-inset-bottom, 12px)",
      zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onTab(t.id)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          opacity: active === t.id ? 1 : 0.5,
          transform: active === t.id ? "scale(1.1)" : "scale(1)",
          transition: "all 0.2s",
        }}>
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
            color: active === t.id ? COLORS.accent : COLORS.textSecondary,
          }}>{t.label}</span>
          {active === t.id && <div style={{
            width: 4, height: 4, borderRadius: "50%", background: COLORS.accent,
            boxShadow: `0 0 8px ${COLORS.accent}`, marginTop: 2,
          }} />}
        </button>
      ))}
    </div>
  );
}

// --- Streak badge ---
function StreakBadge({ streak }) {
  if (streak === 0) return null;
  return (
    <span style={{
      background: streak >= 7 ? `linear-gradient(135deg, ${COLORS.gold}, #FF8C00)` : COLORS.bgCardHover,
      color: streak >= 7 ? "#000" : COLORS.textSecondary,
      fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
      display: "inline-flex", alignItems: "center", gap: 3,
    }}>
      🔥 {streak}
    </span>
  );
}

// --- Main App ---
export default function LifeXPApp() {
  const [tab, setTab] = useState("home");
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [totalXp, setTotalXp] = useState(420);
  const [coins, setCoins] = useState(85);
  const [weeklyXp, setWeeklyXp] = useState(420);
  const [bursts, setBursts] = useState([]);
  const [coinPops, setCoinPops] = useState([]);
  const [avatar, setAvatar] = useState({ hat: "none", face: "smile", background: "default" });
  const [ownedItems, setOwnedItems] = useState(["none", "smile", "default"]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCat, setNewHabitCat] = useState("fitness");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(getLevel(420));
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [showDailyReward, setShowDailyReward] = useState(false);

  const completeHabit = useCallback((id, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const habit = habits.find(h => h.id === id);
    if (!habit || habit.completedToday) return;

    const xpGain = habit.xp;
    const coinGain = Math.floor(habit.xp / 5) + (habit.streak >= 7 ? 5 : 0);
    const oldLevel = getLevel(totalXp);

    setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: true, streak: h.streak + 1 } : h));
    setTotalXp(prev => prev + xpGain);
    setWeeklyXp(prev => prev + xpGain);
    setCoins(prev => prev + coinGain);
    setDailyCompleted(prev => {
      const next = prev + 1;
      if (next === habits.length) {
        setTimeout(() => setShowDailyReward(true), 600);
      }
      return next;
    });

    setBursts(prev => [...prev, { id: Date.now(), x: rect.left + rect.width / 2, y: rect.top, amount: xpGain }]);
    setCoinPops(prev => [...prev, { id: Date.now() + 1, x: rect.right - 20, y: rect.top, amount: coinGain }]);

    setTimeout(() => {
      const newLevel = getLevel(totalXp + xpGain);
      if (newLevel > oldLevel) {
        setPrevLevel(oldLevel);
        setShowLevelUp(true);
      }
    }, 400);
  }, [habits, totalXp]);

  const removeBurst = useCallback((id) => {
    setBursts(prev => prev.filter(b => b.id !== id));
  }, []);
  const removeCoinPop = useCallback((id) => {
    setCoinPops(prev => prev.filter(c => c.id !== id));
  }, []);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newH = {
      id: Date.now(),
      name: newHabitName.trim(),
      category: newHabitCat,
      xp: 20 + Math.floor(Math.random() * 20),
      streak: 0,
      completedToday: false,
    };
    setHabits(prev => [...prev, newH]);
    setNewHabitName("");
    setShowAddHabit(false);
  };

  const buyItem = (type, item) => {
    if (ownedItems.includes(item.id)) {
      setAvatar(prev => ({ ...prev, [type === "backgrounds" ? "background" : type === "hats" ? "hat" : "face"]: item.id }));
      return;
    }
    if (coins >= item.cost) {
      setCoins(prev => prev - item.cost);
      setOwnedItems(prev => [...prev, item.id]);
      setAvatar(prev => ({ ...prev, [type === "backgrounds" ? "background" : type === "hats" ? "hat" : "face"]: item.id }));
    }
  };

  const level = getLevel(totalXp);
  const xpProgress = getXpProgress(totalXp);
  const xpNeeded = getXpForNextLevel(totalXp);
  const completedCount = habits.filter(h => h.completedToday).length;

  const leaderboard = LEADERBOARD_DATA.map(p =>
    p.isUser ? { ...p, xp: weeklyXp, level, avatar: AVATAR_ITEMS.faces.find(f => f.id === avatar.face)?.emoji || "😊" } : p
  ).sort((a, b) => b.xp - a.xp);

  const userRank = leaderboard.findIndex(p => p.isUser) + 1;

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.textPrimary,
      fontFamily: "'DM Sans', 'Nunito', sans-serif",
      paddingBottom: 90, position: "relative", overflow: "hidden",
      maxWidth: 480, margin: "0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&family=Outfit:wght@700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        @keyframes floatUp { 0% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -60px); opacity: 0; } }
        @keyframes burst-0 { to { transform: translate(var(--dx), var(--dy)); opacity: 0; } }
        @keyframes burst-1 { to { transform: translate(var(--dx), var(--dy)); opacity: 0; } }
        @keyframes burst-2 { to { transform: translate(var(--dx), var(--dy)); opacity: 0; } }
        @keyframes burst-3 { to { transform: translate(var(--dx), var(--dy)); opacity: 0; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 20px rgba(0,229,160,0.2); } 50% { box-shadow: 0 0 40px rgba(0,229,160,0.5); } }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        .habit-card { transition: transform 0.15s, box-shadow 0.15s; }
        .habit-card:active { transform: scale(0.97); }
        .stagger-1 { animation: slideUp 0.4s ease-out 0.05s both; }
        .stagger-2 { animation: slideUp 0.4s ease-out 0.1s both; }
        .stagger-3 { animation: slideUp 0.4s ease-out 0.15s both; }
        .stagger-4 { animation: slideUp 0.4s ease-out 0.2s both; }
        .stagger-5 { animation: slideUp 0.4s ease-out 0.25s both; }
        .stagger-6 { animation: slideUp 0.4s ease-out 0.3s both; }
        input::placeholder { color: ${COLORS.textMuted}; }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -200, right: -200, width: 500, height: 500,
        borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, transparent 70%)`,
        opacity: 0.15, pointerEvents: "none",
      }} />

      {/* XP Bursts */}
      {bursts.map(b => <XPBurst key={b.id} {...b} onDone={() => removeBurst(b.id)} />)}
      {coinPops.map(c => <CoinPop key={c.id} {...c} onDone={() => removeCoinPop(c.id)} />)}

      {/* Level Up Modal */}
      {showLevelUp && (
        <div onClick={() => setShowLevelUp(false)} style={{
          position: "fixed", inset: 0, zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center", background: COLORS.overlay,
          animation: "scaleIn 0.3s ease-out",
        }}>
          <div style={{
            background: COLORS.bgCard, borderRadius: 24, padding: 40, textAlign: "center",
            border: `2px solid ${COLORS.gold}`, boxShadow: `0 0 60px ${COLORS.goldGlow}`,
            maxWidth: 320,
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: COLORS.gold, marginBottom: 8 }}>
              LEVEL UP!
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: COLORS.textPrimary, lineHeight: 1 }}>
              {level}
            </div>
            <div style={{ color: COLORS.textSecondary, marginTop: 12, fontSize: 14 }}>
              +50 bonus coins earned! 🪙
            </div>
            <div style={{
              marginTop: 20, padding: "12px 32px", borderRadius: 16,
              background: `linear-gradient(135deg, ${COLORS.gold}, #FF8C00)`,
              color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer",
            }}>TAP TO CONTINUE</div>
          </div>
        </div>
      )}

      {/* Daily Reward Modal */}
      {showDailyReward && (
        <div onClick={() => { setShowDailyReward(false); setCoins(prev => prev + 25); }} style={{
          position: "fixed", inset: 0, zIndex: 9999, display: "flex",
          alignItems: "center", justifyContent: "center", background: COLORS.overlay,
          animation: "scaleIn 0.3s ease-out",
        }}>
          <div style={{
            background: COLORS.bgCard, borderRadius: 24, padding: 40, textAlign: "center",
            border: `2px solid ${COLORS.accent}`, boxShadow: `0 0 60px ${COLORS.accentGlow}`,
            maxWidth: 320,
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🌟</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900, color: COLORS.accent }}>
              ALL TASKS DONE!
            </div>
            <div style={{ color: COLORS.textSecondary, marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
              Perfect day! You completed every habit.<br/>Claim your daily bonus!
            </div>
            <div style={{ fontSize: 28, marginTop: 16, fontWeight: 800, color: COLORS.gold }}>🪙 +25 Bonus</div>
            <div style={{
              marginTop: 20, padding: "12px 32px", borderRadius: 16,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
              color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer",
            }}>CLAIM REWARD</div>
          </div>
        </div>
      )}

      {/* --- HOME TAB --- */}
      {tab === "home" && (
        <div style={{ padding: "16px 20px" }}>
          {/* Header */}
          <div className="stagger-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <AvatarDisplay avatar={avatar} size={52} />
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800 }}>LifeXP</div>
                <div style={{ color: COLORS.textSecondary, fontSize: 13 }}>Level {level} Explorer</div>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,215,0,0.1)", padding: "6px 14px", borderRadius: 20,
              border: `1px solid rgba(255,215,0,0.2)`,
            }}>
              <span style={{ fontSize: 16 }}>🪙</span>
              <span style={{ fontWeight: 800, color: COLORS.gold, fontSize: 15 }}>{coins}</span>
            </div>
          </div>

          {/* XP Progress Card */}
          <div className="stagger-2" style={{
            background: `linear-gradient(135deg, ${COLORS.bgCard}, ${COLORS.bgCardHover})`,
            borderRadius: 20, padding: 20, marginBottom: 16,
            border: `1px solid ${COLORS.border}`,
            animation: "pulseGlow 4s ease-in-out infinite",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 600 }}>TOTAL XP</span>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 900, color: COLORS.accent, lineHeight: 1.1 }}>
                  {totalXp.toLocaleString()}
                </div>
              </div>
              <ProgressRing progress={xpProgress} size={64} stroke={5} />
            </div>
            <div style={{
              background: "rgba(255,255,255,0.06)", borderRadius: 10, height: 8, overflow: "hidden",
            }}>
              <div style={{
                width: `${xpProgress}%`, height: "100%", borderRadius: 10,
                background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.gold})`,
                transition: "width 0.6s ease",
                boxShadow: `0 0 12px ${COLORS.accentGlow}`,
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>Level {level}</span>
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>{xpNeeded - totalXp % 150} XP to Level {level + 1}</span>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="stagger-3" style={{
            background: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 20,
            border: `1px solid ${COLORS.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 600, marginBottom: 2 }}>TODAY'S PROGRESS</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                <span style={{ color: COLORS.accent }}>{completedCount}</span>
                <span style={{ color: COLORS.textMuted }}> / {habits.length}</span>
                <span style={{ color: COLORS.textSecondary, fontSize: 13, marginLeft: 8 }}>habits done</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {habits.map((h, i) => (
                <div key={h.id} style={{
                  width: 10, height: 28, borderRadius: 5,
                  background: h.completedToday ? COLORS.accent : "rgba(255,255,255,0.08)",
                  transition: "background 0.3s",
                  boxShadow: h.completedToday ? `0 0 8px ${COLORS.accentGlow}` : "none",
                }} />
              ))}
            </div>
          </div>

          {/* Habit Cards */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Today's Habits</div>
            <button onClick={() => setShowAddHabit(true)} style={{
              background: `rgba(0,229,160,0.15)`, border: `1px solid rgba(0,229,160,0.3)`,
              color: COLORS.accent, fontSize: 13, fontWeight: 700, padding: "6px 14px",
              borderRadius: 12, cursor: "pointer",
            }}>+ Add</button>
          </div>

          {habits.map((habit, idx) => {
            const cat = HABIT_CATEGORIES.find(c => c.id === habit.category);
            return (
              <div key={habit.id} className={`habit-card stagger-${Math.min(idx + 1, 6)}`}
                onClick={(e) => !habit.completedToday && completeHabit(habit.id, e)}
                style={{
                  background: habit.completedToday
                    ? `linear-gradient(135deg, rgba(0,229,160,0.08), ${COLORS.bgCard})`
                    : COLORS.bgCard,
                  borderRadius: 16, padding: 16, marginBottom: 10,
                  border: `1px solid ${habit.completedToday ? 'rgba(0,229,160,0.2)' : COLORS.border}`,
                  display: "flex", alignItems: "center", gap: 14,
                  cursor: habit.completedToday ? "default" : "pointer",
                  opacity: habit.completedToday ? 0.7 : 1,
                }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: habit.completedToday ? `rgba(0,229,160,0.2)` : `${cat?.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                  border: `1px solid ${habit.completedToday ? COLORS.accent : cat?.color}30`,
                  flexShrink: 0,
                }}>
                  {habit.completedToday ? "✓" : cat?.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 15, marginBottom: 4,
                    textDecoration: habit.completedToday ? "line-through" : "none",
                    color: habit.completedToday ? COLORS.textSecondary : COLORS.textPrimary,
                  }}>{habit.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: cat?.color, fontWeight: 600 }}>{cat?.label}</span>
                    <StreakBadge streak={habit.streak} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: habit.completedToday ? COLORS.textMuted : COLORS.accent }}>
                    +{habit.xp}
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600 }}>XP</div>
                </div>
              </div>
            );
          })}

          {/* Add Habit Modal */}
          {showAddHabit && (
            <div onClick={(e) => e.target === e.currentTarget && setShowAddHabit(false)} style={{
              position: "fixed", inset: 0, zIndex: 9999, display: "flex",
              alignItems: "flex-end", justifyContent: "center", background: COLORS.overlay,
            }}>
              <div style={{
                background: COLORS.bgCard, borderRadius: "24px 24px 0 0", padding: 28,
                width: "100%", maxWidth: 480, animation: "slideUp 0.3s ease-out",
                border: `1px solid ${COLORS.border}`, borderBottom: "none",
              }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>New Habit</div>
                <input value={newHabitName} onChange={e => setNewHabitName(e.target.value)}
                  placeholder="What habit do you want to build?"
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 14,
                    background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                    color: COLORS.textPrimary, fontSize: 15, outline: "none", marginBottom: 16,
                  }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {HABIT_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setNewHabitCat(cat.id)} style={{
                      padding: "8px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: newHabitCat === cat.id ? `${cat.color}30` : "rgba(255,255,255,0.05)",
                      color: newHabitCat === cat.id ? cat.color : COLORS.textSecondary,
                      fontWeight: 700, fontSize: 13,
                      outline: newHabitCat === cat.id ? `2px solid ${cat.color}` : "none",
                    }}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
                <button onClick={addHabit} style={{
                  width: "100%", padding: "14px", borderRadius: 16, border: "none",
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
                  color: "#000", fontWeight: 800, fontSize: 16, cursor: "pointer",
                }}>Create Habit</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- LEADERBOARD TAB --- */}
      {tab === "leaderboard" && (
        <div style={{ padding: "16px 20px" }}>
          <div className="stagger-1" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
            Weekly Ranks 🏆
          </div>
          <div className="stagger-1" style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 20 }}>
            Your rank: #{userRank} of {leaderboard.length}
          </div>

          {/* Top 3 Podium */}
          <div className="stagger-2" style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 12, marginBottom: 28 }}>
            {[1, 0, 2].map((idx, posIdx) => {
              const p = leaderboard[idx];
              if (!p) return null;
              const heights = [120, 90, 70];
              const medals = ["🥇", "🥈", "🥉"];
              const rank = idx + 1;
              return (
                <div key={idx} style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{p.avatar}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, marginBottom: 2,
                    color: p.isUser ? COLORS.accent : COLORS.textPrimary,
                  }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 }}>{p.xp} XP</div>
                  <div style={{
                    height: heights[posIdx], borderRadius: "12px 12px 0 0",
                    background: p.isUser
                      ? `linear-gradient(180deg, ${COLORS.accent}40, ${COLORS.accent}10)`
                      : `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`,
                    border: `1px solid ${p.isUser ? `${COLORS.accent}40` : COLORS.border}`,
                    borderBottom: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28,
                  }}>{medals[idx]}</div>
                </div>
              );
            })}
          </div>

          {/* Full Leaderboard */}
          {leaderboard.slice(3).map((p, idx) => (
            <div key={idx} className={`stagger-${Math.min(idx + 3, 6)}`} style={{
              background: p.isUser ? `rgba(0,229,160,0.08)` : COLORS.bgCard,
              borderRadius: 14, padding: 14, marginBottom: 8,
              border: `1px solid ${p.isUser ? 'rgba(0,229,160,0.2)' : COLORS.border}`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.05)", fontWeight: 800, fontSize: 14, color: COLORS.textSecondary,
              }}>#{idx + 4}</div>
              <div style={{ fontSize: 24 }}>{p.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: p.isUser ? COLORS.accent : COLORS.textPrimary }}>{p.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Level {p.level}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.accent }}>{p.xp} XP</div>
            </div>
          ))}
        </div>
      )}

      {/* --- FRIENDS TAB --- */}
      {tab === "friends" && (
        <div style={{ padding: "16px 20px" }}>
          <div className="stagger-1" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900, marginBottom: 20 }}>
            Friends 👥
          </div>

          <div className="stagger-2" style={{
            background: `linear-gradient(135deg, rgba(0,229,160,0.1), ${COLORS.bgCard})`,
            borderRadius: 16, padding: 16, marginBottom: 20,
            border: `1px solid rgba(0,229,160,0.15)`,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: `rgba(0,229,160,0.15)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>➕</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Invite Friends</div>
              <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Earn 50 coins per invite!</div>
            </div>
          </div>

          {FRIENDS_DATA.map((f, idx) => (
            <div key={idx} className={`stagger-${Math.min(idx + 2, 6)}`} style={{
              background: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 10,
              border: `1px solid ${COLORS.border}`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: COLORS.bgCardHover,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                }}>{f.avatar}</div>
                <div style={{
                  position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%",
                  background: f.status === "online" ? "#22C55E" : COLORS.textMuted,
                  border: `2px solid ${COLORS.bgCard}`,
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{f.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Level {f.level}</span>
                  <StreakBadge streak={f.streak} />
                </div>
              </div>
              <button style={{
                background: "rgba(0,229,160,0.1)", border: `1px solid rgba(0,229,160,0.2)`,
                color: COLORS.accent, fontSize: 12, fontWeight: 700, padding: "8px 14px",
                borderRadius: 10, cursor: "pointer",
              }}>Nudge 👋</button>
            </div>
          ))}
        </div>
      )}

      {/* --- AVATAR TAB --- */}
      {tab === "avatar" && (
        <div style={{ padding: "16px 20px" }}>
          <div className="stagger-1" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900, marginBottom: 20 }}>
            Your Avatar ✨
          </div>

          <div className="stagger-2" style={{
            display: "flex", justifyContent: "center", marginBottom: 28,
          }}>
            <AvatarDisplay avatar={avatar} size={120} />
          </div>

          {[
            { key: "hats", label: "Hats", items: AVATAR_ITEMS.hats },
            { key: "faces", label: "Expressions", items: AVATAR_ITEMS.faces },
            { key: "backgrounds", label: "Backgrounds", items: AVATAR_ITEMS.backgrounds },
          ].map((section, sIdx) => (
            <div key={section.key} className={`stagger-${sIdx + 3}`} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: COLORS.textSecondary }}>
                {section.label}
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                {section.items.map(item => {
                  const owned = ownedItems.includes(item.id);
                  const equipped = avatar[section.key === "backgrounds" ? "background" : section.key === "hats" ? "hat" : "face"] === item.id;
                  return (
                    <button key={item.id} onClick={() => buyItem(section.key, item)} style={{
                      minWidth: 80, padding: "12px 10px", borderRadius: 14, border: "none",
                      background: equipped ? `rgba(0,229,160,0.15)` : COLORS.bgCard,
                      outline: equipped ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                      cursor: "pointer", textAlign: "center",
                      opacity: !owned && coins < item.cost ? 0.4 : 1,
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>
                        {item.emoji || (item.color ? "🎨" : "")}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 2 }}>
                        {item.label}
                      </div>
                      {!owned && item.cost > 0 ? (
                        <div style={{ fontSize: 11, color: COLORS.gold, fontWeight: 700 }}>🪙 {item.cost}</div>
                      ) : owned ? (
                        <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 600 }}>
                          {equipped ? "EQUIPPED" : "OWNED"}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SHOP TAB --- */}
      {tab === "shop" && (
        <div style={{ padding: "16px 20px" }}>
          <div className="stagger-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900 }}>Shop 🛒</div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,215,0,0.1)", padding: "6px 14px", borderRadius: 20,
              border: `1px solid rgba(255,215,0,0.2)`,
            }}>
              <span>🪙</span>
              <span style={{ fontWeight: 800, color: COLORS.gold }}>{coins}</span>
            </div>
          </div>

          <div className="stagger-2" style={{
            background: `linear-gradient(135deg, ${COLORS.gold}15, ${COLORS.bgCard})`,
            borderRadius: 20, padding: 20, marginBottom: 20,
            border: `1px solid ${COLORS.gold}30`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.gold, marginBottom: 8 }}>🌟 PREMIUM</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              LifeXP Pro
            </div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>
              Unlock unlimited habits, exclusive avatar items, detailed analytics, and priority leaderboard placement.
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: COLORS.accent }}>$4.99</span>
              <span style={{ fontSize: 13, color: COLORS.textSecondary }}>/month</span>
            </div>
            <button style={{
              width: "100%", padding: "14px", borderRadius: 16, border: "none",
              background: `linear-gradient(135deg, ${COLORS.gold}, #FF8C00)`,
              color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer",
            }}>Start Free Trial</button>
          </div>

          {[
            { name: "Coin Bundle S", desc: "100 coins", price: "$0.99", icon: "🪙" },
            { name: "Coin Bundle M", desc: "500 coins + bonus 50", price: "$3.99", icon: "💰" },
            { name: "Coin Bundle L", desc: "1200 coins + bonus 200", price: "$7.99", icon: "🏆" },
            { name: "Streak Shield", desc: "Protect your streak for 1 day", coins: 75, icon: "🛡️" },
            { name: "Double XP (24h)", desc: "2x XP for all habits", coins: 150, icon: "⚡" },
            { name: "Custom Habit Color", desc: "Pick any color for a habit", coins: 50, icon: "🎨" },
          ].map((item, idx) => (
            <div key={idx} className={`stagger-${Math.min(idx + 3, 6)}`} style={{
              background: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 10,
              border: `1px solid ${COLORS.border}`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{item.desc}</div>
              </div>
              <button style={{
                padding: "8px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                background: item.price ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})` : "rgba(255,215,0,0.15)",
                color: item.price ? "#000" : COLORS.gold,
                fontWeight: 800, fontSize: 13,
              }}>
                {item.price || `🪙 ${item.coins}`}
              </button>
            </div>
          ))}
        </div>
      )}

      <TabBar active={tab} onTab={setTab} />
    </div>
  );
}
