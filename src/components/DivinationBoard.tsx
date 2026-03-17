"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DivinationResult, WUXING_ZHI, assessGuaStrength } from "@/lib/divination";
import { findGuaByLines, getTrigram } from "@/lib/guaData";

interface DivinationBoardProps {
  result: DivinationResult;
  onAIAnalyze: () => void;
}

// ── 单爻线（小型，用于卦图中）────────────────────
function MiniYaoLine({
  isYang,
  isMoving,
  isChange,
  delay = 0,
}: {
  isYang: boolean;
  isMoving?: boolean;
  isChange?: boolean;
  delay?: number;
}) {
  const color = isMoving
    ? { solid: "#e05c4e", glow: "rgba(201,69,53,0.5)" }
    : isChange
    ? { solid: "#5db8a6", glow: "rgba(51,134,120,0.35)" }
    : { solid: "#c8a040", glow: "rgba(184,148,64,0.3)" };

  return (
    <div className="flex items-center gap-1.5 h-4">
      {isYang ? (
        <motion.div
          className="flex-1 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            height: 4,
            transformOrigin: "left center",
            background: `linear-gradient(90deg, transparent 0%, ${color.solid}88 8%, ${color.solid} 30%, ${isChange ? "#7ec1b2" : isMoving ? "#f08070" : "#e8d4a0"} 50%, ${color.solid} 70%, ${color.solid}88 92%, transparent 100%)`,
            boxShadow: `0 0 6px ${color.glow}`,
          }}
        />
      ) : (
        <>
          <motion.div
            className="flex-1 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              height: 4,
              transformOrigin: "left center",
              background: `linear-gradient(90deg, transparent, ${color.solid}88, ${color.solid})`,
              boxShadow: `0 0 5px ${color.glow}`,
            }}
          />
          <div className="w-2.5 flex-none" />
          <motion.div
            className="flex-1 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: delay + 0.06, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              height: 4,
              transformOrigin: "right center",
              background: `linear-gradient(90deg, ${color.solid}, ${color.solid}88, transparent)`,
              boxShadow: `0 0 5px ${color.glow}`,
            }}
          />
        </>
      )}
    </div>
  );
}

// ── 卦图展示卡 ──────────────────────────────────
function GuaCard({
  lines,
  title,
  isChange,
  movingPositions = [],
  staggerDelay = 0,
}: {
  lines: number[];
  title: string;
  isChange: boolean;
  movingPositions?: number[];
  staggerDelay?: number;
}) {
  const upper = getTrigram([lines[5] as 0|1, lines[4] as 0|1, lines[3] as 0|1]);
  const lower = getTrigram([lines[2] as 0|1, lines[1] as 0|1, lines[0] as 0|1]);
  const gua = findGuaByLines(lines);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: staggerDelay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-2xl p-5 border card-hover relative overflow-hidden ${
        isChange
          ? "border-celadon-700/40"
          : "border-brass-600/30"
      }`}
    >
      {/* 背景微光 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isChange
            ? "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(51,134,120,0.06) 0%, transparent 70%)"
            : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(184,148,64,0.05) 0%, transparent 70%)",
        }}
      />

      {/* 标题标签 */}
      <div className="text-center mb-4">
        <span
          className="text-xs px-2.5 py-0.5 rounded-full font-song"
          style={{
            background: isChange ? "rgba(51,134,120,0.1)" : "rgba(184,148,64,0.08)",
            color: isChange ? "#5db8a6" : "#c8a040",
            border: `1px solid ${isChange ? "rgba(51,134,120,0.25)" : "rgba(184,148,64,0.2)"}`,
          }}
        >
          {title}
        </span>
      </div>

      {/* 卦名 */}
      <div className="text-center mb-3">
        <div
          className={`font-song leading-none mb-1 ${
            isChange ? "gua-name-display-celadon" : "gua-name-display"
          }`}
          style={{ fontSize: "clamp(1.8rem,5vw,2.6rem)" }}
        >
          {gua.name}
        </div>
        <div className="text-xs" style={{ color: "rgba(80,80,100,0.7)" }}>
          {gua.nameEn}
        </div>
      </div>

      {/* 上下卦符 */}
      <div className="flex justify-center items-center gap-2 mb-4 text-xs" style={{ color: "rgba(80,80,100,0.65)" }}>
        <span className="font-song">{upper.symbol}</span>
        <span>{upper.name}</span>
        <span style={{ color: "rgba(50,50,70,0.5)" }}>·</span>
        <span>{lower.name}</span>
        <span className="font-song">{lower.symbol}</span>
      </div>

      {/* 爻线图 */}
      <div className="space-y-1.5 px-3">
        {[...lines].reverse().map((line, revIdx) => {
          const idx = lines.length - 1 - revIdx;
          const isMovingYao = movingPositions.includes(idx + 1);
          return (
            <MiniYaoLine
              key={idx}
              isYang={line === 1}
              isMoving={isMovingYao}
              isChange={isChange}
              delay={staggerDelay + revIdx * 0.07}
            />
          );
        })}
      </div>

      {/* 卦辞 */}
      <div className="mt-4 pt-3.5 border-t" style={{ borderColor: "rgba(255,255,255,0.055)" }}>
        <p
          className="text-xs leading-relaxed font-song text-center"
          style={{ color: "rgba(100,100,130,0.8)" }}
        >
          {gua.description}
        </p>
      </div>
    </motion.div>
  );
}

// ── 主组件 ───────────────────────────────────────
export default function DivinationBoard({ result, onAIAnalyze }: DivinationBoardProps) {
  const { ganZhi, yaos, originalLines, changedLines, movingPositions } = result;
  const hasChanges = movingPositions.length > 0;

  const movingYaoTexts = useMemo(() => {
    const originalGua = findGuaByLines(originalLines);
    return movingPositions.map(pos => ({
      position: pos,
      yao: yaos[pos - 1],
      text: originalGua.yao[pos - 1] || "爻辞待考",
    }));
  }, [originalLines, movingPositions, yaos]);

  const guaStrength = assessGuaStrength(originalLines, ganZhi);

  // 时柱数据
  const pillars = [
    { label: "年柱", gz: ganZhi.year, gan: ganZhi.yearGan, zhi: ganZhi.yearZhi },
    { label: "月柱", gz: ganZhi.month, gan: ganZhi.monthGan, zhi: ganZhi.monthZhi },
    { label: "日柱", gz: ganZhi.day, gan: ganZhi.dayGan, zhi: ganZhi.dayZhi },
    { label: "时柱", gz: ganZhi.hour, gan: ganZhi.hourGan, zhi: ganZhi.hourZhi },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-5 pb-10">

      {/* ── 干支时柱 ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-2xl p-5 border border-ink-700 relative overflow-hidden"
      >
        {/* 顶部微光 */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(184,148,64,0.3), transparent)" }}
        />

        <h3 className="font-song text-center mb-4 text-sm" style={{ color: "rgba(130,130,150,0.9)" }}>
          占卦时柱
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="text-center py-2 px-1 rounded-xl"
              style={{ background: "rgba(184,148,64,0.03)", border: "1px solid rgba(184,148,64,0.07)" }}
            >
              <div className="text-xs mb-1.5 font-song" style={{ color: "rgba(90,90,110,0.8)" }}>
                {p.label}
              </div>
              <div className="ganzhi-digit text-2xl leading-none mb-1">
                {p.gz}
              </div>
              <div className="text-xs font-song" style={{ color: "rgba(130,110,60,0.6)" }}>
                {p.gan} · {p.zhi}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="divider-ancient my-4" />

        <div className="flex justify-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <span style={{ color: "rgba(90,90,110,0.7)" }}>旬空</span>
            <span className="font-song" style={{ color: "#e05c4e" }}>
              {ganZhi.xunkong.join("·")}
            </span>
          </div>
          <div
            className="h-3 w-px self-center"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div className="flex items-center gap-2">
            <span style={{ color: "rgba(90,90,110,0.7)" }}>月破</span>
            <span className="font-song" style={{ color: "#e05c4e" }}>
              {ganZhi.yuepao}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── 卦图 ── */}
      <div className={`grid gap-4 ${hasChanges ? "grid-cols-2" : "grid-cols-1 max-w-xs mx-auto w-full"}`}>
        <GuaCard
          lines={originalLines}
          title="本卦"
          isChange={false}
          movingPositions={movingPositions}
          staggerDelay={0.1}
        />
        {hasChanges && (
          <GuaCard
            lines={changedLines}
            title="变卦"
            isChange={true}
            staggerDelay={0.25}
          />
        )}
      </div>

      {/* ── 卦气概述 ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="glass rounded-xl px-5 py-4 border border-ink-700 flex items-center gap-4"
      >
        <div
          className="w-1.5 h-10 rounded-full flex-none"
          style={{ background: "linear-gradient(180deg, #7ec1b2, #276b60)" }}
        />
        <div>
          <div className="text-xs mb-0.5" style={{ color: "rgba(80,80,100,0.7)" }}>
            卦气概述
          </div>
          <p className="text-sm font-song" style={{ color: "rgba(200,200,220,0.85)" }}>
            {guaStrength}
          </p>
        </div>
      </motion.div>

      {/* ── 动爻爻辞 ── */}
      <AnimatePresence>
        {movingYaoTexts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="glass rounded-2xl p-5 border"
            style={{ borderColor: "rgba(201,69,53,0.2)", background: "rgba(201,69,53,0.025)" }}
          >
            <h3
              className="font-song text-center mb-4 text-sm"
              style={{ color: "#d05a4a" }}
            >
              动爻爻辞
            </h3>
            <div className="space-y-4">
              {movingYaoTexts.map(({ position, yao, text }, i) => (
                <motion.div
                  key={position}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="flex-none mt-0.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-song text-sm"
                      style={{
                        background: "rgba(201,69,53,0.12)",
                        border: "1px solid rgba(201,69,53,0.3)",
                        color: "#e05c4e",
                      }}
                    >
                      {yao.label[0]}
                    </div>
                  </div>
                  <div>
                    <div
                      className="font-song text-sm mb-1"
                      style={{ color: "#d47060" }}
                    >
                      {yao.label}
                      <span
                        className="ml-2 text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(201,69,53,0.12)",
                          border: "1px solid rgba(201,69,53,0.2)",
                          color: "#e05c4e",
                        }}
                      >
                        动
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(170,160,160,0.85)" }}>
                      {text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 六爻详表 ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        className="glass rounded-2xl p-5 border border-ink-700"
      >
        <h3 className="font-song text-center mb-5 text-sm" style={{ color: "rgba(130,130,150,0.9)" }}>
          六爻详情
        </h3>
        <div className="space-y-2.5">
          {[...yaos].reverse().map((yao, revIdx) => {
            const idx = yaos.length - 1 - revIdx;
            const originalGua = findGuaByLines(originalLines);
            const yaoText = originalGua.yao[idx] || "爻辞待考";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + revIdx * 0.06 }}
                className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                style={{
                  background: yao.isMoving ? "rgba(201,69,53,0.06)" : "rgba(255,255,255,0.015)",
                  border: `1px solid ${yao.isMoving ? "rgba(201,69,53,0.18)" : "rgba(255,255,255,0.04)"}`,
                }}
              >
                {/* 爻名 */}
                <div
                  className="font-song text-sm w-9 text-right flex-none pt-0.5"
                  style={{ color: yao.isMoving ? "#d47060" : "rgba(180,148,64,0.7)" }}
                >
                  {yao.label}
                </div>

                {/* 爻线（微缩版） */}
                <div className="flex-none w-16 pt-1.5">
                  <MiniYaoLine
                    isYang={yao.type === 1}
                    isMoving={yao.isMoving}
                    delay={0.7 + revIdx * 0.06}
                  />
                </div>

                {/* 爻辞 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs" style={{ color: "rgba(90,90,110,0.8)" }}>
                      {yao.name}
                    </span>
                    {yao.isMoving && (
                      <span
                        className="text-xs px-1.5 py-px rounded font-song"
                        style={{
                          background: "rgba(201,69,53,0.12)",
                          color: "#e05c4e",
                          border: "1px solid rgba(201,69,53,0.25)",
                          fontSize: "0.6rem",
                        }}
                      >
                        动爻
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs leading-relaxed font-song"
                    style={{ color: "rgba(130,125,140,0.8)" }}
                  >
                    {yaoText}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── AI 解卦按钮 ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="text-center pt-2 pb-6"
      >
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAIAnalyze}
          className="relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-medium overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, #276b60 0%, #338678 50%, #3ea090 100%)",
            boxShadow: "0 6px 28px rgba(51,134,120,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* 光扫 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
            }}
          />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-100%" }}
            whileHover={{ x: "200%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
              width: "60%",
            }}
          />

          <span className="relative font-song text-lg">☯</span>
          <span className="relative font-song text-lg tracking-wider">请 AI 深度解卦</span>
          <span className="relative" style={{ color: "rgba(126,193,178,0.8)", fontSize: "1.1rem" }}>
            →
          </span>
        </motion.button>
        <p className="mt-3 text-xs" style={{ color: "rgba(60,60,80,0.7)" }}>
          结合干支、爻辞、变卦进行多维度分析
        </p>
      </motion.div>
    </div>
  );
}
