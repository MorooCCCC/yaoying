"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import UserProfileForm, { UserProfile } from "@/components/UserProfileForm";
import CameraShake from "@/components/CameraShake";
import DivinationBoard from "@/components/DivinationBoard";
import AIReading from "@/components/AIReading";
import { YaoResult, buildDivination, DivinationResult } from "@/lib/divination";
import { playPageTransition, playClick, setMuted, getMuted } from "@/lib/audio";

type AppStage = "intro" | "profile" | "shaking" | "board" | "ai";

// ── 浮动粒子背景 ──────────────────────────────
function ParticlesBg({ active }: { active: boolean }) {
  // 用 useMemo 稳定随机值，避免 hydration 问题
  const particles = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: (i * 37 + 11) % 100,
      y: (i * 53 + 7) % 100,
      size: 1 + (i % 3) * 0.8,
      duration: 7 + (i % 5) * 1.5,
      delay: (i % 7) * 0.8,
      toY: ((i * 53 + 7) % 100 + 30 + (i % 4) * 10) % 100,
    }))
  ).current;

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? "rgba(51,134,120,0.7)"
                : p.id % 3 === 1
                ? "rgba(184,148,64,0.5)"
                : "rgba(120,120,160,0.4)",
          }}
          initial={{ y: `${p.y}vh`, opacity: 0 }}
          animate={{
            y: [`${p.y}vh`, `${p.toY}vh`, `${p.y}vh`],
            opacity: [0, 0.7, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── 八卦旋转装饰环 ──────────────────────────
const BAGUA_CHARS = ["☰", "☷", "☳", "☴", "☵", "☲", "☶", "☱"];
const BAGUA_NAMES = ["乾", "坤", "震", "巽", "坎", "离", "艮", "兑"];

function BaguaRing({ radius = 110, fontSize = 18 }: { radius?: number; fontSize?: number }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      animate={{ rotate: 360 }}
      transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
    >
      {BAGUA_CHARS.map((char, i) => {
        const angle = (i / 8) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        return (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            <span
              className="font-song select-none"
              style={{
                fontSize,
                color: `hsla(${i * 45}, 30%, 70%, 0.22)`,
                lineHeight: 1,
                transform: `rotate(${angle + 90}deg)`,
                display: "block",
              }}
            >
              {char}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}

// ── 静音切换按钮 ──────────────────────────────
function MuteButton() {
  const [mute, setMute] = useState(false);
  const toggle = () => {
    const next = !mute;
    setMute(next);
    setMuted(next);
  };
  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-full flex items-center justify-center border border-ink-700 text-ink-600 hover:border-ink-500 hover:text-ink-400 transition-all"
      title={mute ? "开启音效" : "静音"}
    >
      <span className="text-xs select-none">{mute ? "🔇" : "🔔"}</span>
    </button>
  );
}

// ── 进度步骤 ──────────────────────────────────
const STAGES: { key: AppStage; label: string; icon: string }[] = [
  { key: "profile", label: "知己", icon: "◎" },
  { key: "shaking", label: "摇卦", icon: "≋" },
  { key: "board",   label: "排盘", icon: "卦" },
  { key: "ai",      label: "解卦", icon: "✦" },
];

// ── 主组件 ────────────────────────────────────
export default function Home() {
  const [stage, setStage] = useState<AppStage>("intro");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completedYaos, setCompletedYaos] = useState<YaoResult[]>([]);
  const [divinationResult, setDivinationResult] = useState<DivinationResult | null>(null);
  const [introStep, setIntroStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // 鼠标跟随光晕（仅桌面）
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 25 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  // intro 分步动画
  useEffect(() => {
    if (stage !== "intro") return;
    setIntroStep(0);
    const timers = [
      setTimeout(() => setIntroStep(1), 600),
      setTimeout(() => setIntroStep(2), 1800),
      setTimeout(() => setIntroStep(3), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  // 带音效的 stage 切换
  const goTo = useCallback((next: AppStage) => {
    if (transitioning) return;
    setTransitioning(true);
    playPageTransition();
    setTimeout(() => {
      setStage(next);
      setTransitioning(false);
    }, 120);
  }, [transitioning]);

  const handleProfileComplete = (p: UserProfile) => {
    setProfile(p);
    goTo("shaking");
  };

  const handleYaoComplete = (yao: YaoResult) => {
    setCompletedYaos(prev => {
      const updated = [...prev, yao];
      if (updated.length === 6) {
        setTimeout(() => {
          const result = buildDivination(updated, new Date());
          setDivinationResult(result);
          goTo("board");
        }, 2200);
      }
      return updated;
    });
  };

  const handleAllComplete = (yaos: YaoResult[]) => {
    const result = buildDivination(yaos, new Date());
    setDivinationResult(result);
    goTo("board");
  };

  const handleReset = () => {
    setCompletedYaos([]);
    setDivinationResult(null);
    setProfile(null);
    goTo("intro");
  };

  const stageIndex = STAGES.findIndex(s => s.key === stage);

  // 页面切换变体
  const pageVariants = {
    initial: { opacity: 0, y: 18, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0,  filter: "blur(0px)" },
    exit:    { opacity: 0, y: -12, filter: "blur(3px)" },
  };
  const pageTransition = { duration: 0.45, ease: [0.16, 1, 0.3, 1] };

  return (
    <div className="min-h-screen bg-ink-gradient relative overflow-x-hidden">

      {/* 鼠标跟随光晕 */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(51,134,120,0.055) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* 全局粒子 */}
      <ParticlesBg active={stage !== "shaking"} />

      {/* ── 顶部导航 ── */}
      <AnimatePresence>
        {stage !== "intro" && (
          <motion.header
            key="header"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,14,22,0.92) 0%, transparent 100%)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center justify-between">
              {/* Logo */}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 group"
                aria-label="回到首页"
              >
                <motion.span
                  className="font-song text-xl text-celadon-400 group-hover:text-celadon-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  爻影
                </motion.span>
                <span
                  className="text-xs tracking-widest"
                  style={{ color: "rgba(70,70,90,0.8)" }}
                >
                  Yao · Vision
                </span>
              </button>

              {/* 步骤指示 */}
              <nav className="flex items-center gap-1" aria-label="进度">
                {STAGES.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-0.5">
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all duration-300 ${
                        i === stageIndex
                          ? "step-active font-song"
                          : i < stageIndex
                          ? "step-done"
                          : "step-pending"
                      }`}
                    >
                      {i < stageIndex ? (
                        <span className="text-celadon-500">✓</span>
                      ) : (
                        <span className="font-song text-xs opacity-60">{s.icon}</span>
                      )}
                      <span>{s.label}</span>
                    </div>
                    {i < STAGES.length - 1 && (
                      <span style={{ color: "rgba(45,45,56,0.8)", fontSize: "0.6rem" }}>
                        ·
                      </span>
                    )}
                  </div>
                ))}
              </nav>

              {/* 静音按钮 */}
              <MuteButton />
            </div>

            {/* 进度条 */}
            <div className="h-px mx-6 mb-0.5">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(51,134,120,0.5), rgba(184,148,64,0.3), transparent)",
                }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{
                  scaleX: stageIndex >= 0 ? (stageIndex + 1) / STAGES.length : 0,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── 主内容区 ── */}
      <main className={`relative z-10 ${stage !== "intro" ? "pt-20" : ""}`}>
        <AnimatePresence mode="wait">

          {/* ════════ 开屏 ════════ */}
          {stage === "intro" && (
            <motion.div
              key="intro"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-aurora"
            >
              {/* 八卦符号装饰 + 中心阴阳 */}
              <motion.div
                className="relative mb-12"
                initial={{ scale: 0.5, opacity: 0, rotate: -120 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: 280, height: 280 }}
              >
                {/* 外圈：八卦文字环 */}
                <BaguaRing radius={118} fontSize={16} />

                {/* 中圈：天青色圆环光晕 */}
                <div
                  className="absolute inset-8 rounded-full halo-breath"
                  style={{
                    border: "1px solid rgba(51,134,120,0.2)",
                    background:
                      "radial-gradient(circle, rgba(51,134,120,0.04) 0%, transparent 70%)",
                  }}
                />

                {/* 内圈：细线圆 */}
                <div
                  className="absolute inset-16 rounded-full"
                  style={{
                    border: "1px solid rgba(184,148,64,0.12)",
                  }}
                />

                {/* 中心：阴阳鱼 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                    style={{ fontSize: 72, lineHeight: 1 }}
                    className="font-song select-none"
                  >
                    ☯
                  </motion.div>
                </div>

                {/* 光晕扩散环 */}
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border"
                    style={{
                      inset: -i * 12 - 4,
                      borderColor: `rgba(51,134,120,${0.08 - i * 0.03})`,
                    }}
                    animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      delay: i * 1.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>

              {/* 主标题 */}
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{
                  opacity: introStep >= 1 ? 1 : 0,
                  y: introStep >= 1 ? 0 : 30,
                  filter: introStep >= 1 ? "blur(0px)" : "blur(8px)",
                }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="mb-2"
              >
                <h1 className="font-song tracking-[0.25em] leading-none select-none"
                  style={{ fontSize: "clamp(3.5rem, 10vw, 6rem)" }}
                >
                  <span style={{
                    background: "linear-gradient(180deg, #f0f0f0 0%, #a0a0b0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    爻
                  </span>
                  <span style={{
                    background: "linear-gradient(180deg, #7ec1b2 0%, #276b60 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    影
                  </span>
                </h1>
                <p
                  className="tracking-[0.55em] uppercase mt-3"
                  style={{ color: "rgba(70,70,90,0.7)", fontSize: "0.7rem" }}
                >
                  Yao · Vision
                </p>
              </motion.div>

              {/* 副标题 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: introStep >= 2 ? 1 : 0 }}
                transition={{ duration: 1.1 }}
                className="mb-10"
              >
                <p className="font-song text-lg leading-relaxed"
                  style={{ color: "rgba(140,140,160,0.85)" }}
                >
                  以手摇卦，以智解象
                </p>
                <p className="mt-1 text-sm"
                  style={{ color: "rgba(80,80,100,0.7)" }}
                >
                  六爻感知天地之机
                </p>
              </motion.div>

              {/* 开始按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: introStep >= 3 ? 1 : 0,
                  y: introStep >= 3 ? 0 : 16,
                }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    playClick();
                    goTo("profile");
                  }}
                  className="btn-primary text-xl tracking-widest font-song px-14 py-4"
                  style={{ borderRadius: "1rem" }}
                >
                  开始占卜
                </motion.button>

                <p className="mt-5 text-xs tracking-widest"
                  style={{ color: "rgba(60,60,80,0.7)" }}
                >
                  新中式极简 · 手部捕捉 · AI 深度解卦
                </p>
              </motion.div>

              {/* 底部装饰文字 */}
              <div
                className="absolute bottom-6 left-0 right-0 flex justify-center gap-7 pointer-events-none select-none"
                aria-hidden
              >
                {BAGUA_NAMES.map((name, i) => (
                  <span
                    key={name}
                    className="font-song text-xs bagua-char"
                    style={{
                      "--d": `${3 + i * 0.5}s`,
                      "--delay": `${i * 0.3}s`,
                      color: "rgba(50,50,70,0.6)",
                    } as React.CSSProperties}
                  >
                    {name}
                  </span>
                ))}
              </div>

              {/* 底部线条 */}
              <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(51,134,120,0.25), transparent)",
                }}
              />
            </motion.div>
          )}

          {/* ════════ 用户画像 ════════ */}
          {stage === "profile" && (
            <motion.div
              key="profile"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="min-h-screen flex flex-col items-center justify-center py-16"
            >
              <div className="w-full max-w-lg mx-auto px-4 mb-10 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl mb-4 font-song"
                  style={{ color: "rgba(51,134,120,0.6)" }}
                >
                  ◎
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-song text-3xl mb-2"
                  style={{
                    background: "linear-gradient(180deg, #e2e2ea 0%, #8888a0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  自知之明
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm"
                  style={{ color: "rgba(100,100,120,0.9)" }}
                >
                  知己方知天命，请先填写基本信息
                </motion.p>
              </div>
              <UserProfileForm onComplete={handleProfileComplete} />
            </motion.div>
          )}

          {/* ════════ 摇卦 ════════ */}
          {stage === "shaking" && (
            <motion.div
              key="shaking"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="min-h-screen flex flex-col items-center py-16"
            >
              <div className="w-full max-w-2xl mx-auto px-4 mb-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-song text-3xl mb-2"
                  style={{
                    background: "linear-gradient(180deg, #e2e2ea 0%, #8888a0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  摇卦起象
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm mb-3"
                  style={{ color: "rgba(100,100,120,0.9)" }}
                >
                  展示双手于摄像头前，上下摇晃触发出爻
                  <br />
                  <span style={{ color: "rgba(70,70,90,0.7)" }}>
                    共需摇 6 次，构成完整六爻卦象
                  </span>
                </motion.p>
                {profile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-ink-700"
                  >
                    <span style={{ color: "rgba(80,80,100,0.8)", fontSize: "0.75rem" }}>
                      卜问：
                    </span>
                    <span className="text-celadon-400 text-xs">{profile.question}</span>
                  </motion.div>
                )}
              </div>

              <CameraShake
                onYaoComplete={handleYaoComplete}
                onAllComplete={handleAllComplete}
                currentYaoIndex={completedYaos.length}
                completedYaos={completedYaos}
              />
            </motion.div>
          )}

          {/* ════════ 排盘 ════════ */}
          {stage === "board" && divinationResult && (
            <motion.div
              key="board"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="min-h-screen flex flex-col items-center py-16"
            >
              <div className="w-full max-w-3xl mx-auto px-4 mb-8 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05, type: "spring", stiffness: 200 }}
                  className="text-3xl mb-4 font-song"
                  style={{ color: "rgba(184,148,64,0.55)" }}
                >
                  ⬡
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="font-song text-3xl mb-2"
                  style={{
                    background: "linear-gradient(180deg, #e2e2ea 0%, #8888a0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  卦象已成
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.22 }}
                  className="text-sm"
                  style={{ color: "rgba(100,100,120,0.9)" }}
                >
                  天时地利人和，三才已备
                </motion.p>
              </div>

              <DivinationBoard
                result={divinationResult}
                onAIAnalyze={() => goTo("ai")}
              />
            </motion.div>
          )}

          {/* ════════ AI 解卦 ════════ */}
          {stage === "ai" && divinationResult && profile && (
            <motion.div
              key="ai"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="min-h-screen flex flex-col items-center py-16"
            >
              <div className="w-full max-w-2xl mx-auto px-4 mb-8 text-center">
                <motion.div
                  initial={{ opacity: 0, rotate: -30 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="text-3xl mb-4 font-song animate-float"
                  style={{ color: "rgba(51,134,120,0.55)", display: "inline-block" }}
                >
                  ✦
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-song text-3xl mb-2"
                  style={{
                    background: "linear-gradient(180deg, #e2e2ea 0%, #8888a0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  天机解析
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm"
                  style={{ color: "rgba(100,100,120,0.9)" }}
                >
                  AI 大师正在感知卦象，深度解析中
                </motion.p>
              </div>

              <AIReading divination={divinationResult} profile={profile} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
