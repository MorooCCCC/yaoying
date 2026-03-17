"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface UserProfile {
  age: number;
  gender: "male" | "female" | "other";
  location: string;
  hemisphere: "north" | "south";
  question: string;
  timeRange: "1year" | "3years" | "5years" | "10years";
}

interface UserProfileFormProps {
  onComplete: (profile: UserProfile) => void;
}

const TIME_RANGES = [
  { value: "1year", label: "近 1 年", desc: "短期运势" },
  { value: "3years", label: "近 3 年", desc: "中期规划" },
  { value: "5years", label: "近 5 年", desc: "人生阶段" },
  { value: "10years", label: "近 10 年", desc: "长远布局" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "男", icon: "♂" },
  { value: "female", label: "女", icon: "♀" },
  { value: "other", label: "其他", icon: "◎" },
];

export default function UserProfileForm({ onComplete }: UserProfileFormProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: 28,
    hemisphere: "north",
    timeRange: "3years",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!profile.gender) newErrors.gender = "请选择性别";
    if (!profile.location?.trim()) newErrors.location = "请输入所在地";
    if (!profile.question?.trim()) newErrors.question = "请描述您的问题";
    if (profile.question && profile.question.trim().length < 5) {
      newErrors.question = "问题描述至少5个字";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onComplete(profile as UserProfile);
    }
  };

  const steps = [
    { title: "基本信息", subtitle: "天时地利人和，首先知己" },
    { title: "卜问之事", subtitle: "心中有问，方能得解" },
    { title: "时效设定", subtitle: "占问时限，明确期望" },
  ];

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {/* 步骤指示 */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-song border ${
                i === step
                  ? "border-celadon-400 bg-celadon-500/20 text-celadon-300"
                  : i < step
                  ? "border-celadon-600 bg-celadon-600/30 text-celadon-400"
                  : "border-ink-600 bg-ink-800 text-ink-500"
              }`}
              animate={{ scale: i === step ? 1.1 : 1 }}
            >
              {i < step ? "✓" : i + 1}
            </motion.div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px ${i < step ? "bg-celadon-600" : "bg-ink-700"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* 步骤标题 */}
          <div className="text-center mb-8">
            <h2 className="font-song text-2xl text-ink-100 mb-1">{steps[step].title}</h2>
            <p className="text-ink-400 text-sm">{steps[step].subtitle}</p>
          </div>

          {/* Step 0: 基本信息 */}
          {step === 0 && (
            <div className="space-y-6">
              {/* 年龄 */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-ink-200 text-sm font-medium">年龄</label>
                  <span className="font-song text-2xl text-celadon-300">{profile.age}</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="80"
                  value={profile.age}
                  onChange={(e) => updateField("age", parseInt(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #338678 0%, #338678 ${((( profile.age || 28) - 16) / 64) * 100}%, #2d2d38 ${(((profile.age || 28) - 16) / 64) * 100}%, #2d2d38 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-ink-600 mt-1">
                  <span>16</span>
                  <span>80</span>
                </div>
              </div>

              {/* 性别 */}
              <div>
                <label className="block text-ink-400 text-sm mb-3">性别</label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map((g) => (
                    <motion.button
                      key={g.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateField("gender", g.value as UserProfile["gender"])}
                      className={`py-3 rounded-xl border text-center transition-all duration-200 ${
                        profile.gender === g.value
                          ? "border-celadon-500 bg-celadon-500/15 text-celadon-300"
                          : "border-ink-700 bg-ink-800/50 text-ink-400 hover:border-ink-500"
                      }`}
                    >
                      <div className="text-xl mb-1">{g.icon}</div>
                      <div className="text-sm">{g.label}</div>
                    </motion.button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-cinnabar-400 text-xs mt-2">{errors.gender}</p>
                )}
              </div>

              {/* 所在地 */}
              <div>
                <label className="block text-ink-400 text-sm mb-2">所在地</label>
                <input
                  type="text"
                  placeholder="如：北京、上海、东京..."
                  value={profile.location || ""}
                  onChange={(e) => updateField("location", e.target.value)}
                  className={`w-full bg-ink-800/60 border rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 outline-none focus:border-celadon-500 transition-colors ${
                    errors.location ? "border-cinnabar-500" : "border-ink-700"
                  }`}
                />
                {errors.location && (
                  <p className="text-cinnabar-400 text-xs mt-1">{errors.location}</p>
                )}
                {/* 南北半球 */}
                <div className="flex gap-3 mt-3">
                  {[
                    { value: "north", label: "北半球", sub: "中国/欧洲/北美" },
                    { value: "south", label: "南半球", sub: "澳洲/南美/非洲" },
                  ].map((h) => (
                    <button
                      key={h.value}
                      onClick={() => updateField("hemisphere", h.value as UserProfile["hemisphere"])}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-all ${
                        profile.hemisphere === h.value
                          ? "border-celadon-500 bg-celadon-500/10 text-celadon-300"
                          : "border-ink-700 text-ink-500 hover:border-ink-500"
                      }`}
                    >
                      <div>{h.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{h.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: 卜问之事 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">☯</div>
                  <p className="text-ink-400 text-sm leading-relaxed">
                    心中默念所问之事<br/>
                    专注片刻，方可开始摇卦
                  </p>
                </div>

                <label className="block text-ink-400 text-sm mb-2">
                  问题描述 <span className="text-cinnabar-400">*</span>
                </label>
                <textarea
                  placeholder="请具体描述您想卜问的事项，如：此番职业转换是否顺遂？..."
                  value={profile.question || ""}
                  onChange={(e) => updateField("question", e.target.value)}
                  rows={4}
                  className={`w-full bg-ink-800/60 border rounded-xl px-4 py-3 text-ink-100 placeholder-ink-600 outline-none focus:border-celadon-500 transition-colors resize-none ${
                    errors.question ? "border-cinnabar-500" : "border-ink-700"
                  }`}
                />
                {errors.question && (
                  <p className="text-cinnabar-400 text-xs mt-1">{errors.question}</p>
                )}
                <p className="text-ink-600 text-xs mt-2 text-right">
                  {profile.question?.length || 0} 字
                </p>
              </div>

              {/* 快捷问题模板 */}
              <div>
                <p className="text-ink-600 text-xs mb-2">常见问题模板</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "职业发展走向如何",
                    "感情婚姻前景",
                    "投资财运吉凶",
                    "健康状况预判",
                    "学业考试顺利否",
                  ].map((t) => (
                    <button
                      key={t}
                      onClick={() => updateField("question", t)}
                      className="px-3 py-1.5 rounded-full border border-ink-700 text-ink-500 text-xs hover:border-celadon-600 hover:text-celadon-400 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 时效设定 */}
          {step === 2 && (
            <div className="space-y-4">
              {TIME_RANGES.map((t) => (
                <motion.button
                  key={t.value}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateField("timeRange", t.value as UserProfile["timeRange"])}
                  className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 ${
                    profile.timeRange === t.value
                      ? "border-celadon-500 bg-celadon-500/10 glow-celadon"
                      : "border-ink-700 glass hover:border-ink-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-song text-xl mb-1 ${
                        profile.timeRange === t.value ? "text-celadon-300" : "text-ink-200"
                      }`}>
                        {t.label}
                      </div>
                      <div className="text-ink-500 text-sm">{t.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      profile.timeRange === t.value
                        ? "border-celadon-400 bg-celadon-500"
                        : "border-ink-600"
                    }`}>
                      {profile.timeRange === t.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 底部按钮 */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-none px-6 py-3 rounded-xl border border-ink-700 text-ink-400 hover:border-ink-500 hover:text-ink-300 transition-colors"
          >
            上一步
          </button>
        )}
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (step < 2) {
              if (step === 1 && !validate()) return;
              setStep(s => s + 1);
            } else {
              handleSubmit();
            }
          }}
          className="flex-1 py-3 rounded-xl bg-celadon-600 hover:bg-celadon-500 text-white font-medium transition-colors relative overflow-hidden"
        >
          <span>{step < 2 ? "下一步" : "开始摇卦"}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
        </motion.button>
      </div>
    </div>
  );
}
