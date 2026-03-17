"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DivinationResult } from "@/lib/divination";
import { UserProfile } from "./UserProfileForm";
import { findGuaByLines } from "@/lib/guaData";
import { playAIStart } from "@/lib/audio";

interface AIReadingProps {
  divination: DivinationResult;
  profile: UserProfile;
}

// ── 精致 Markdown 渲染器 ──────────────────────────
function RichMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");

  const renderInline = (text: string) => {
    // **bold** 处理
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color: "rgba(220,210,180,0.95)", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        // ## 二级标题
        if (line.startsWith("## ")) {
          return (
            <motion.h2
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="font-song text-lg mt-6 mb-2 flex items-center gap-2.5"
              style={{ color: "rgba(126,193,178,0.9)" }}
            >
              <span
                className="flex-none w-1 h-5 rounded-full"
                style={{ background: "linear-gradient(180deg, #7ec1b2, #276b60)" }}
              />
              {line.slice(3)}
            </motion.h2>
          );
        }
        // ### 三级标题
        if (line.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="font-song text-sm mt-4 mb-1.5"
              style={{ color: "rgba(200,168,80,0.9)" }}
            >
              {line.slice(4)}
            </h3>
          );
        }
        // > 引用块
        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="font-song text-base my-3 italic py-1 px-4"
              style={{
                borderLeft: "2px solid rgba(51,134,120,0.5)",
                color: "rgba(126,193,178,0.85)",
                background: "rgba(51,134,120,0.04)",
                borderRadius: "0 6px 6px 0",
              }}
            >
              {line.slice(2)}
            </blockquote>
          );
        }
        // - 列表项
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2.5 text-sm leading-relaxed">
              <span className="flex-none mt-1.5 w-1 h-1 rounded-full" style={{ background: "rgba(51,134,120,0.7)" }} />
              <span style={{ color: "rgba(180,175,190,0.9)" }}>
                {renderInline(line.slice(2))}
              </span>
            </div>
          );
        }
        // 有序列表
        const orderedMatch = line.match(/^(\d+)\. (.*)$/);
        if (orderedMatch) {
          return (
            <div key={i} className="flex gap-3 text-sm leading-relaxed">
              <span
                className="flex-none font-song"
                style={{ color: "rgba(51,134,120,0.7)", minWidth: "1.2rem" }}
              >
                {orderedMatch[1]}.
              </span>
              <span style={{ color: "rgba(180,175,190,0.9)" }}>
                {renderInline(orderedMatch[2])}
              </span>
            </div>
          );
        }
        // 分割线
        if (line.startsWith("---")) {
          return <div key={i} className="divider-ancient my-4" />;
        }
        // 空行
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        // 普通段落
        return (
          <p
            key={i}
            className="text-sm leading-relaxed"
            style={{ color: "rgba(165,160,180,0.88)" }}
          >
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

// ── 加载波形动画 ────────────────────────────────
function WaveLoader() {
  return (
    <div className="flex items-end justify-center gap-1" style={{ height: 32 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ background: `hsl(${168 + i * 4}, 45%, ${45 + i * 3}%)` }}
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
          initial={{ height: 20, transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

// ── 主组件 ───────────────────────────────────────
export default function AIReading({ divination, profile }: AIReadingProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "done" | "error">("idle");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const originalGua = findGuaByLines(divination.originalLines);
  const changedGua = findGuaByLines(divination.changedLines);
  const hasChange = divination.movingPositions.length > 0;

  const startReading = async () => {
    setStatus("loading");
    setContent("");
    playAIStart();

    try {
      const res = await fetch("/api/divination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ divination, profile }),
      });

      if (!res.ok) throw new Error(`API 请求失败 (${res.status})`);

      setStatus("streaming");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("无法读取响应流");

      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              accumulated += text;
              setContent(accumulated);
            } catch {}
          } else if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data && data !== "[DONE]") {
              try {
                const parsed = JSON.parse(data);
                const text = parsed.choices?.[0]?.delta?.content || "";
                if (text) { accumulated += text; setContent(accumulated); }
              } catch {}
            }
          } else if (
            line.trim() &&
            !line.startsWith("e:") &&
            !line.startsWith("d:") &&
            !line.startsWith("f:")
          ) {
            accumulated += line + "\n";
            setContent(accumulated);
          }
        }

        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }

      setStatus("done");
    } catch (e: any) {
      setError(e.message || "解卦失败，请稍后重试");
      setStatus("error");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-5 pb-10">

      {/* ── 卦象摘要卡 ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-2xl p-5 border border-ink-700 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(51,134,120,0.3), transparent)" }}
        />

        <div className="flex items-center justify-between gap-3">
          {/* 本卦 */}
          <div className="text-center flex-1">
            <div className="text-xs mb-1.5 font-song" style={{ color: "rgba(90,90,110,0.7)" }}>本卦</div>
            <div
              className="font-song text-2xl leading-none mb-1 gua-name-display"
              style={{ fontSize: "1.6rem" }}
            >
              {originalGua.name}
            </div>
            <div className="text-xs" style={{ color: "rgba(100,100,120,0.6)" }}>
              {originalGua.nature}
            </div>
          </div>

          {hasChange ? (
            <>
              {/* 箭头 */}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="font-song text-xl flex-none"
                style={{ color: "rgba(70,70,90,0.6)" }}
              >
                →
              </motion.div>

              {/* 变卦 */}
              <div className="text-center flex-1">
                <div className="text-xs mb-1.5 font-song" style={{ color: "rgba(90,90,110,0.7)" }}>变卦</div>
                <div
                  className="font-song text-2xl leading-none mb-1 gua-name-display-celadon"
                  style={{ fontSize: "1.6rem" }}
                >
                  {changedGua.name}
                </div>
                <div className="text-xs" style={{ color: "rgba(100,100,120,0.6)" }}>
                  {changedGua.nature}
                </div>
              </div>

              <div className="w-px h-10 flex-none self-center"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </>
          ) : (
            <div className="w-px h-10 flex-none self-center"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          )}

          {/* 卜问 */}
          <div className="text-center flex-1">
            <div className="text-xs mb-1.5 font-song" style={{ color: "rgba(90,90,110,0.7)" }}>卜问</div>
            <div
              className="text-sm font-song leading-snug line-clamp-3"
              style={{ color: "rgba(180,175,190,0.85)" }}
            >
              {profile.question || "综合运势"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 内容区 ── */}
      <AnimatePresence mode="wait">

        {/* 待开始 */}
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="text-center py-14"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="font-song select-none mb-6 inline-block"
              style={{ fontSize: "4rem", lineHeight: 1, color: "rgba(51,134,120,0.35)" }}
            >
              ☯
            </motion.div>
            <h3 className="font-song text-xl mb-2" style={{ color: "rgba(200,200,220,0.85)" }}>
              万象已成
            </h3>
            <p className="text-sm mb-8 leading-relaxed max-w-xs mx-auto"
              style={{ color: "rgba(90,90,110,0.85)" }}
            >
              卦象排布完毕，天机已现。<br />
              请 AI 大师为您深度解析此卦。
            </p>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={startReading}
              className="relative inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-white font-song text-lg overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #276b60, #338678, #3ea090)",
                boxShadow: "0 6px 28px rgba(51,134,120,0.28), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                ✦
              </motion.span>
              开始解卦
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </motion.div>
        )}

        {/* 加载中 */}
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <WaveLoader />
            <p className="font-song mt-5 text-sm" style={{ color: "rgba(126,193,178,0.7)" }}>
              正在感知卦象…
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(70,70,90,0.7)" }}>
              易理幽深，片刻即至
            </p>
          </motion.div>
        )}

        {/* 流式 / 完成 */}
        {(status === "streaming" || status === "done") && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              ref={contentRef}
              className="glass rounded-2xl px-6 py-5 border border-ink-700 overflow-y-auto relative"
              style={{ maxHeight: "68vh" }}
            >
              {/* 顶部渐出遮罩（装饰） */}
              <div
                className="sticky top-0 left-0 right-0 h-3 pointer-events-none -mx-6 -mt-5 mb-2"
                style={{
                  background: "linear-gradient(180deg, rgba(26,26,36,0.9) 0%, transparent 100%)",
                }}
              />

              <RichMarkdown content={content} />

              {/* 流式光标 */}
              {status === "streaming" && (
                <span className="ai-cursor" />
              )}

              {/* 底部渐出 */}
              <div
                className="sticky bottom-0 left-0 right-0 h-4 pointer-events-none -mx-6 -mb-5 mt-2"
                style={{
                  background: "linear-gradient(0deg, rgba(26,26,36,0.9) 0%, transparent 100%)",
                }}
              />
            </div>

            {/* 操作按钮 */}
            {status === "done" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setStatus("idle"); setContent(""); }}
                  className="flex-1 py-3 rounded-xl text-sm font-song transition-all duration-200"
                  style={{
                    background: "rgba(51,134,120,0.06)",
                    border: "1px solid rgba(51,134,120,0.2)",
                    color: "rgba(126,193,178,0.8)",
                  }}
                >
                  重新占卜
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  className="px-5 py-3 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: copied ? "rgba(51,134,120,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${copied ? "rgba(51,134,120,0.35)" : "rgba(255,255,255,0.08)"}`,
                    color: copied ? "rgba(126,193,178,0.9)" : "rgba(100,100,120,0.8)",
                  }}
                >
                  {copied ? "✓ 已复制" : "复制"}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 错误状态 */}
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-8 border text-center"
            style={{ borderColor: "rgba(201,69,53,0.25)" }}
          >
            <div className="text-3xl mb-3 font-song" style={{ color: "rgba(201,69,53,0.5)" }}>
              ⊗
            </div>
            <p className="text-sm mb-5" style={{ color: "rgba(200,100,90,0.9)" }}>
              {error}
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="px-6 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                background: "rgba(201,69,53,0.1)",
                border: "1px solid rgba(201,69,53,0.3)",
                color: "#e05c4e",
              }}
            >
              重试
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
