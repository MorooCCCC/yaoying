"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateYao, YaoResult } from "@/lib/divination";
import { playCoinShake, playCoinLand, playYaoComplete, playGuaComplete, vibrate } from "@/lib/audio";

interface CameraShakeProps {
  onYaoComplete: (yao: YaoResult) => void;
  onAllComplete: (yaos: YaoResult[]) => void;
  currentYaoIndex: number;
  completedYaos: YaoResult[];
}

// 铜钱组件 — 精致金属质感版
function Coin({ result, isFlipping, index, justLanded }: { 
  result: 0 | 1 | null; 
  isFlipping: boolean; 
  index: number;
  justLanded?: boolean;
}) {
  const isYang = result === 1;
  const isEmpty = result === null;

  return (
    <div className="relative w-18 h-18 flex items-center justify-center"
      style={{ width: 72, height: 72, perspective: "500px" }}
    >
      {/* 落定后光晕 */}
      {!isEmpty && !isFlipping && (
        <motion.div
          initial={{ scale: 1.8, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: isYang
              ? "radial-gradient(circle, rgba(184,148,64,0.5) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(100,100,140,0.4) 0%, transparent 70%)",
          }}
        />
      )}

      <motion.div
        className="w-full h-full rounded-full"
        animate={
          isFlipping
            ? { rotateY: [0, 90, 180, 270, 360, 450, 720], scale: [1, 0.88, 1, 0.88, 1, 0.94, 1] }
            : justLanded
            ? { scale: [1.08, 0.95, 1.02, 1], y: [-4, 2, -1, 0] }
            : {}
        }
        transition={{
          duration: isFlipping ? 0.9 : 0.4,
          ease: isFlipping ? [0.76, 0, 0.24, 1] : [0.34, 1.56, 0.64, 1],
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* 铜钱主体 */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: isEmpty
              ? "radial-gradient(circle at 40% 35%, #3a3028, #1e1810)"
              : isYang
              ? "radial-gradient(circle at 38% 32%, #f0e0a8 0%, #d4a830 30%, #9a7020 65%, #5a3a10 100%)"
              : "radial-gradient(circle at 38% 32%, #d8d8e8 0%, #9898b8 30%, #5a5a78 65%, #28283a 100%)",
            boxShadow: isEmpty
              ? "0 6px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)"
              : isYang
              ? "0 6px 22px rgba(184,148,64,0.45), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(240,224,168,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)"
              : "0 6px 22px rgba(80,80,110,0.4), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(220,220,240,0.3), inset 0 -2px 4px rgba(0,0,0,0.35)",
          }}
        >
          {/* 外圈纹路 */}
          {!isEmpty && (
            <div
              className="absolute rounded-full"
              style={{
                inset: "4px",
                border: `1px solid ${isYang ? "rgba(240,224,168,0.25)" : "rgba(200,200,220,0.15)"}`,
              }}
            />
          )}

          {/* 方形孔 */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              width: 20,
              height: 20,
              background: isEmpty ? "#110e08" : isYang ? "#3a2808" : "#14141e",
              border: `2px solid ${isEmpty ? "#110e08" : isYang ? "#6a4818" : "#24243a"}`,
            }}
          >
            {!isEmpty && (
              <span
                className="font-song select-none"
                style={{
                  fontSize: "7px",
                  lineHeight: 1,
                  color: isYang ? "rgba(212,184,96,0.8)" : "rgba(130,130,170,0.7)",
                  letterSpacing: 0,
                }}
              >
                {isYang ? "正" : "反"}
              </span>
            )}
          </div>

          {/* 高光 */}
          {!isEmpty && (
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: 0,
                background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 50%)",
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

// 手势检测状态
type HandState = "idle" | "detecting" | "shaking" | "stopping";

// 爻线展示
function YaoLine({ yao, index, isNew }: { yao: YaoResult; index: number; isNew: boolean }) {
  const isYang = yao.type === 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center gap-3 py-0.5 ${yao.isMoving ? "yao-moving" : ""}`}
    >
      {/* 爻位标签 */}
      <span className="yao-label font-song">{yao.label}</span>
      
      {/* 爻线 */}
      <div className="flex-1 flex items-center gap-1.5 h-5 relative">
        {isYang ? (
          <motion.div
            className="yao-line-yang flex-1"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              transformOrigin: "left center",
              ...(yao.isMoving ? {
                background: "linear-gradient(90deg, transparent 0%, rgba(201,69,53,0.5) 8%, #c94535 25%, #e8806e 50%, #c94535 75%, rgba(201,69,53,0.5) 92%, transparent 100%)",
                boxShadow: "0 0 10px rgba(201,69,53,0.55), 0 0 3px rgba(201,69,53,0.4)",
              } : {}),
            }}
          />
        ) : (
          <>
            <motion.div
              className="yao-line-yin-left flex-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                transformOrigin: "left center",
                ...(yao.isMoving ? {
                  background: "linear-gradient(90deg, transparent, rgba(201,69,53,0.5), #c94535, #e8806e)",
                  boxShadow: "0 0 8px rgba(201,69,53,0.5)",
                } : {}),
              }}
            />
            <div className="w-3.5 flex-none" />
            <motion.div
              className="yao-line-yin-right flex-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                transformOrigin: "right center",
                ...(yao.isMoving ? {
                  background: "linear-gradient(90deg, #e8806e, #c94535, rgba(201,69,53,0.5), transparent)",
                  boxShadow: "0 0 8px rgba(201,69,53,0.5)",
                } : {}),
              }}
            />
          </>
        )}
      </div>
      
      {/* 标注 */}
      <div className="flex items-center gap-1.5 flex-none">
        {yao.isMoving && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-xs px-1.5 py-0.5 rounded-md font-song glow-cinnabar"
            style={{
              background: "rgba(201,69,53,0.12)",
              color: "#e05c4e",
              border: "1px solid rgba(201,69,53,0.3)",
              fontSize: "0.65rem",
            }}
          >
            动
          </motion.span>
        )}
        <span className="text-xs" style={{ color: "rgba(80,80,100,0.7)", fontSize: "0.7rem" }}>
          {yao.name}
        </span>
      </div>
    </motion.div>
  );
}

export default function CameraShake({ onYaoComplete, onAllComplete, currentYaoIndex, completedYaos }: CameraShakeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [cameraErrorMsg, setCameraErrorMsg] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [handState, setHandState] = useState<HandState>("idle");
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [isContainerShaking, setIsContainerShaking] = useState(false);
  
  const [coinResults, setCoinResults] = useState<[0|1|null, 0|1|null, 0|1|null]>([null, null, null]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [landedCoins, setLandedCoins] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [lastYaoResult, setLastYaoResult] = useState<YaoResult | null>(null);
  
  // 手势追踪数据
  const shakeStartRef = useRef<number>(0);
  const shakeCountRef = useRef<number>(0);
  const isGeneratingRef = useRef(false);
  
  const SHAKE_THRESHOLD = 30;
  const SHAKE_REQUIRED = 6;
  const STOP_FRAMES = 15;
  
  const stopFramesRef = useRef(0);
  const prevHandPosRef = useRef<{x: number, y: number} | null>(null);
  const handStateRef = useRef<HandState>("idle");

  // 同步更新 state + ref，解决 initMediaPipe 闭包中 handState 永远是初始值的问题
  const updateHandState = (state: HandState) => {
    handStateRef.current = state;
    setHandState(state);
  };

  // 将 stream 绑到 video 元素并播放
  const attachStream = (video: HTMLVideoElement, stream: MediaStream) => {
    video.srcObject = stream;
    // 移动端兼容：必须同步设置这些属性
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("x5-playsinline", "");
    video.setAttribute("x5-video-player-type", "h5");
    
    const tryPlay = () => {
      const p = video.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.warn("[camera] play() blocked:", err);
          // 降级：显示画面但提示用户点击
        });
      }
    };

    if (video.readyState >= 1) {
      tryPlay();
    } else {
      video.addEventListener("loadedmetadata", tryPlay, { once: true });
    }
  };

  // 启动摄像头 — 必须在用户点击事件的同步上下文中调用
  const startCamera = async () => {
    try {
      setCameraError(false);
      setCameraErrorMsg("");

      // 先把摄像头画面区域打开，让 videoRef 挂载到 DOM
      setCameraActive(true);

      // 等一帧让 React 完成 DOM 更新
      await new Promise(r => setTimeout(r, 50));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: { ideal: "user" },
        },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        attachStream(videoRef.current, stream);
      }

      initMediaPipe();
    } catch (e: any) {
      console.error("Camera error:", e);
      setCameraActive(false);
      setCameraError(true);
      // 给用户具体错误原因
      if (e?.name === "NotAllowedError" || e?.name === "PermissionDeniedError") {
        setCameraErrorMsg("摄像头权限被拒绝，请在浏览器设置中允许访问摄像头");
      } else if (e?.name === "NotFoundError") {
        setCameraErrorMsg("未检测到摄像头设备");
      } else if (e?.name === "NotReadableError") {
        setCameraErrorMsg("摄像头被其他应用占用，请关闭后重试");
      } else {
        setCameraErrorMsg("摄像头启动失败，请使用手动摇卦");
      }
    }
  };

  // 关闭摄像头
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    setCameraActive(false);
    setCameraError(false);
    updateHandState("idle");
  };

  // 初始化 MediaPipe
  const initMediaPipe = useCallback(() => {
    if (typeof window === "undefined") return;

    // 重置重试计数
    (window as any).__mpRetryCount = 0;
    
    const checkMediaPipe = () => {
      if ((window as any).Hands) {
        const Hands = (window as any).Hands;
        const hands = new Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
        });
        
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });
        
        hands.onResults((results: any) => {
          processHandResults(results);
        });
        
        handsRef.current = hands;
        
        const processFrame = async () => {
          if (videoRef.current && handsRef.current && videoRef.current.readyState >= 2) {
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch {
              // 单帧失败不影响后续
            }
          }
          if (handsRef.current) {
            requestAnimationFrame(processFrame);
          }
        };
        processFrame();
      } else {
        (window as any).__mpRetryCount = ((window as any).__mpRetryCount || 0) + 1;
        // 最多等待 8 秒（16次 × 500ms），超时则静默降级
        if ((window as any).__mpRetryCount > 16) {
          // MediaPipe 加载失败 — 摄像头画面仍然正常显示，仅手势检测不可用
          // 不设置 cameraError，只是手势功能不工作，用户仍可看到自己
          console.warn("MediaPipe 加载超时，手势识别不可用，请使用手动摇卦按钮");
          return;
        }
        setTimeout(checkMediaPipe, 500);
      }
    };
    
    checkMediaPipe();
  }, []);

  // 处理手部识别结果
  const processHandResults = (results: any) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      prevHandPosRef.current = null;
      stopFramesRef.current++;
      if (stopFramesRef.current > STOP_FRAMES && handStateRef.current === "shaking" && !isGeneratingRef.current) {
        triggerGenerate();
      }
      return;
    }
    
    stopFramesRef.current = 0;
    
    const landmarks = results.multiHandLandmarks[0];
    
    const palmX = (landmarks[0].x + landmarks[9].x) / 2;
    const palmY = (landmarks[0].y + landmarks[9].y) / 2;
    
    if (prevHandPosRef.current) {
      const dx = (palmX - prevHandPosRef.current.x) * 640;
      const dy = (palmY - prevHandPosRef.current.y) * 480;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const intensity = Math.min(distance * 2, 100);
      setShakeIntensity(intensity);
      
      if (distance > SHAKE_THRESHOLD / 640) {
        shakeCountRef.current++;
        
        if (shakeCountRef.current >= SHAKE_REQUIRED && handStateRef.current !== "shaking") {
          updateHandState("shaking");
          setIsContainerShaking(true);
          playCoinShake();
          vibrate([30, 20, 30]);
          setTimeout(() => setIsContainerShaking(false), 300);
        }
        
        if (handStateRef.current === "shaking") {
          if (shakeCountRef.current % 5 === 0) {
            setIsContainerShaking(true);
            setTimeout(() => setIsContainerShaking(false), 200);
          }
        }
      } else {
        if (shakeCountRef.current > 0) shakeCountRef.current = Math.max(0, shakeCountRef.current - 1);
      }
    }
    
    prevHandPosRef.current = { x: palmX, y: palmY };
    
    if (handStateRef.current === "idle" && results.multiHandLandmarks.length > 0) {
      updateHandState("detecting");
    }
  };

  // 触发爻生成
  const triggerGenerate = useCallback(async () => {
    if (isGeneratingRef.current || currentYaoIndex > 6) return;
    isGeneratingRef.current = true;
    updateHandState("stopping");
    
    setIsFlipping(true);
    setCoinResults([null, null, null]);
    setLandedCoins([false, false, false]);
    
    const yaoResult = generateYao(currentYaoIndex + 1);
    
    const landCoin = (idx: 0|1|2, results: [0|1|null, 0|1|null, 0|1|null]) => {
      setCoinResults(results);
      setLandedCoins(prev => {
        const next = [...prev] as [boolean, boolean, boolean];
        next[idx] = true;
        return next;
      });
      playCoinLand();
      setTimeout(() => {
        setLandedCoins(prev => {
          const next = [...prev] as [boolean, boolean, boolean];
          next[idx] = false;
          return next;
        });
      }, 500);
    };

    setTimeout(() => {
      landCoin(0, [yaoResult.coins[0], null, null]);
    }, 300);
    setTimeout(() => {
      landCoin(1, [yaoResult.coins[0], yaoResult.coins[1], null]);
    }, 550);
    setTimeout(() => {
      landCoin(2, yaoResult.coins);
      setIsFlipping(false);
      playYaoComplete();
      vibrate(100);
      setLastYaoResult(yaoResult);
      onYaoComplete(yaoResult);
      
      if (currentYaoIndex >= 5) {
        playGuaComplete();
        vibrate([100, 50, 200]);
      }
      
      setTimeout(() => {
        isGeneratingRef.current = false;
        shakeCountRef.current = 0;
        updateHandState("idle");
      }, 1500);
    }, 800);
  }, [currentYaoIndex, onYaoComplete]);

  // 手动摇卦（主要方式）
  const manualShake = () => {
    if (isGeneratingRef.current) return;
    updateHandState("shaking");
    setIsContainerShaking(true);
    playCoinShake();
    vibrate([30, 20, 30]);
    setTimeout(() => {
      setIsContainerShaking(false);
      triggerGenerate();
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const yaoPositionNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 左：铜钱 + 摇卦 */}
        <div className="space-y-4">
          {/* 摄像头区域（可选折叠） */}
          {showCamera && (
            <div className="relative rounded-2xl overflow-hidden aspect-video glass border border-ink-700">

              {/* video 元素始终存在于 DOM，避免 ref 为 null */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover scale-x-[-1] ${cameraActive ? "block" : "hidden"}`}
                autoPlay
                muted
                playsInline
                onCanPlay={(e) => {
                  const v = e.currentTarget;
                  if (v.paused) v.play().catch(() => {});
                }}
                onLoadedData={(e) => {
                  // 移动端有时 loadedmetadata 不够，loadeddata 才有画面
                  const v = e.currentTarget;
                  if (v.paused) v.play().catch(() => {});
                }}
              />
              <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${cameraActive ? "block" : "hidden"}`} />

              {/* 未开启 / 出错时的遮罩 */}
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {cameraError ? (
                    <>
                      <div className="text-3xl mb-3 opacity-50">📷</div>
                      <p className="text-ink-400 text-xs text-center mb-3 px-4">
                        {cameraErrorMsg || "摄像头启动失败，请使用手动摇卦"}
                      </p>
                      <button
                        onClick={stopCamera}
                        className="text-xs text-ink-500 hover:text-ink-300 transition-colors"
                      >
                        关闭摄像头面板
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl mb-3">🤲</div>
                      <p className="text-ink-400 text-xs text-center mb-3 px-4">
                        开启摄像头，用手掌摇晃触发摇卦
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={startCamera}
                        className="px-4 py-2 rounded-lg bg-celadon-600/80 hover:bg-celadon-500 text-white text-xs transition-colors"
                      >
                        开启摄像头
                      </motion.button>
                    </>
                  )}
                </div>
              )}

              {/* 开启后的 UI 覆盖层 */}
              {cameraActive && (
                <>
                  <div className="camera-vignette absolute inset-0 pointer-events-none" />
                  <div className="camera-corner camera-corner-tl" />
                  <div className="camera-corner camera-corner-tr" />
                  <div className="camera-corner camera-corner-bl" />
                  <div className="camera-corner camera-corner-br" />

                  {(handState === "detecting" || handState === "shaking") && (
                    <div className="scan-line" />
                  )}
                  
                  {/* 手势状态 */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="glass rounded-lg px-3 py-2 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        handState === "idle" ? "bg-ink-600" :
                        handState === "detecting" ? "bg-brass-400 animate-pulse" :
                        handState === "shaking" ? "bg-celadon-400 animate-pulse" :
                        "bg-cinnabar-400"
                      }`} />
                      <span className="text-xs text-ink-300">
                        {handState === "idle" ? "等待手势..." :
                         handState === "detecting" ? "检测到手 — 开始摇晃" :
                         handState === "shaking" ? "摇晃中... 停止后出爻" :
                         "生成中..."}
                      </span>
                    </div>
                  </div>

                  {/* 关闭按钮 */}
                  <button
                    onClick={stopCamera}
                    className="absolute top-3 right-3 glass rounded-full w-7 h-7 flex items-center justify-center text-ink-400 hover:text-ink-200 transition-colors text-xs"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          )}

          {/* 铜钱区域 */}
          <motion.div
            className={`glass rounded-2xl p-6 border ${
              handState === "shaking" ? "border-celadon-600 glow-celadon" : "border-ink-700"
            }`}
            animate={isContainerShaking ? {
              x: [-5, 5, -4, 4, -3, 3, 0],
              rotate: [-1, 1, -0.8, 0.8, 0],
            } : {}}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-4">
              <p className="text-ink-500 text-xs">
                第 <span className="text-celadon-400 font-song text-lg">{currentYaoIndex + 1}</span> / 6 爻
                {currentYaoIndex < 6 && (
                  <span className="ml-2">{yaoPositionNames[currentYaoIndex]}</span>
                )}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              {[0, 1, 2].map((i) => (
                <Coin
                  key={i}
                  result={coinResults[i]}
                  isFlipping={isFlipping}
                  index={i}
                  justLanded={landedCoins[i]}
                />
              ))}
            </div>

            {/* 当前爻结果 */}
            <AnimatePresence>
              {lastYaoResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <span className={`text-sm font-song ${
                    lastYaoResult.isMoving ? "text-cinnabar-400" : "text-brass-400"
                  }`}>
                    {lastYaoResult.label} · {lastYaoResult.name}
                    {lastYaoResult.isMoving && " · 动爻"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 摇卦按钮 — 主要操作 */}
          {currentYaoIndex < 6 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={manualShake}
              disabled={isGeneratingRef.current}
              className="w-full py-4 rounded-2xl text-white text-base font-medium transition-all disabled:opacity-40"
              style={{
                background: isGeneratingRef.current
                  ? "linear-gradient(135deg, #1a3a2a, #0d2018)"
                  : "linear-gradient(135deg, #1a6b5a, #0d4a3a, #0a3828)",
                boxShadow: isGeneratingRef.current
                  ? "none"
                  : "0 4px 24px rgba(26,107,90,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
                border: "1px solid rgba(26,107,90,0.3)",
              }}
            >
              <span className="flex items-center justify-center gap-2">
                {isGeneratingRef.current ? (
                  <>
                    <motion.span
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      🪙
                    </motion.span>
                    铜钱翻飞中...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🪙</span>
                    <span>摇卦 — 投掷铜钱</span>
                  </>
                )}
              </span>
            </motion.button>
          )}

          {/* 摄像头切换 */}
          {!showCamera ? (
            <button
              onClick={() => setShowCamera(true)}
              className="w-full py-2 rounded-xl border border-ink-700/60 text-ink-500 hover:border-ink-600 hover:text-ink-400 transition-colors text-xs"
            >
              📷 使用摄像头手势摇卦（可选）
            </button>
          ) : (
            <button
              onClick={() => {
                stopCamera();
                setShowCamera(false);
              }}
              className="w-full py-2 rounded-xl border border-ink-700/60 text-ink-500 hover:border-ink-600 hover:text-ink-400 transition-colors text-xs"
            >
              隐藏摄像头面板
            </button>
          )}
        </div>

        {/* 右：爻卦展示 */}
        <div className="space-y-4">
          {/* 卦象标题 */}
          <div className="glass rounded-2xl p-5 border border-ink-700">
            <h3 className="font-song text-center text-ink-300 mb-1 text-sm">本卦爻象</h3>
            <p className="text-ink-600 text-xs text-center mb-5">由下而上，初爻在下</p>
            
            {/* 爻线列表（从上到下显示，上爻在上） */}
            <div className="space-y-4">
              {completedYaos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-3 opacity-30">卦</div>
                  <p className="text-ink-700 text-sm">摇卦后爻象将在此显示</p>
                </div>
              ) : (
                [...completedYaos].reverse().map((yao, revIdx) => {
                  const originalIdx = completedYaos.length - 1 - revIdx;
                  return (
                    <YaoLine
                      key={originalIdx}
                      yao={yao}
                      index={originalIdx}
                      isNew={originalIdx === completedYaos.length - 1}
                    />
                  );
                })
              )}
              
              {/* 待出爻占位 */}
              {Array.from({ length: Math.max(0, 6 - completedYaos.length) }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 opacity-20">
                  <span className="text-xs text-ink-700 w-6 text-right font-song">
                    {["初", "二", "三", "四", "五", "上"][completedYaos.length + i]}
                    {["九", "六"][Math.round(Math.random())]}
                  </span>
                  <div className="flex-1 h-px bg-ink-800" />
                </div>
              ))}
            </div>
          </div>

          {/* 动爻提示 */}
          {completedYaos.some(y => y.isMoving) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 border border-cinnabar-500/30 bg-cinnabar-500/5"
            >
              <p className="text-cinnabar-400 text-xs text-center">
                ⊙ 有动爻，本卦将变化生变卦
              </p>
            </motion.div>
          )}

          {/* 完卦提示 */}
          {completedYaos.length === 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-4 border border-celadon-500/40 glow-celadon text-center"
            >
              <div className="text-2xl mb-2">☯</div>
              <p className="font-song text-celadon-300 text-sm">六爻已成，卦象完整</p>
              <p className="text-ink-500 text-xs mt-1">正在推算卦象...</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
