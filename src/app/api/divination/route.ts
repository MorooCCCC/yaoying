import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { divination, profile } = body;

  const {
    ganZhi,
    yaos,
    originalLines,
    changedLines,
    movingPositions,
  } = divination;

  const { age, gender, location, question, timeRange } = profile;

  // 构建爻辞描述
  const yaoDescriptions = yaos
    .map((y: any, i: number) => {
      const positions = ["初", "二", "三", "四", "五", "上"];
      const typeStr = y.type === 1 ? "阳爻" : "阴爻";
      const moving = y.isMoving ? "【动爻】" : "";
      return `  ${positions[i]}爻（${y.label}）：${typeStr}，${y.name} ${moving}`;
    })
    .join("\n");

  const originalGuaLines = originalLines.join("");
  const changedGuaLines = changedLines.join("");
  const timeRangeMap: Record<string, string> = {
    "1year": "1年",
    "3years": "3年", 
    "5years": "5年",
    "10years": "10年",
  };
  const timeRangeStr = timeRangeMap[timeRange] || "3年";
  const genderStr = gender === "male" ? "男" : gender === "female" ? "女" : "其他";

  const systemPrompt = `你是一位精通周易六爻的卜卦大师，精通《增删卜易》《卜筮正宗》等传世典籍。
你的解卦风格：专业严谨而不失温情，使用适当的古典意象，但表达清晰易懂。
你擅长将传统六爻与现代生活情境结合，给出实用而有深度的人生指引。`;

  const userPrompt = `
【占卦基本信息】
- 占卦时间：年柱 ${ganZhi.year}，月柱 ${ganZhi.month}，日柱 ${ganZhi.day}，时柱 ${ganZhi.hour}
- 旬空：${ganZhi.xunkong.join("、")}
- 月破：${ganZhi.yuepao}
- 占问者：${age}岁，${genderStr}性，所在地：${location}
- 卜问之事：${question}
- 预测时限：未来 ${timeRangeStr}

【卦象信息】
本卦爻线（初爻到上爻）：${originalGuaLines}
变卦爻线（初爻到上爻）：${changedGuaLines}
动爻位置：${movingPositions.length > 0 ? movingPositions.map((p: number) => `第${p}爻`).join("、") : "无动爻（六爻安静）"}

各爻详情：
${yaoDescriptions}

【解卦要求】
请按以下 Markdown 结构输出专业解卦报告，每个模块用 ## 标题区分：

## 总体卦气
综合分析卦象（本卦+变卦）的整体能量走向，阴阳强弱，结合日月建评估。字数：150-200字。

## 分项解析

### 职业事业
针对"${question}"的核心问题，从职业角度深度分析。

### 财运财帛
财运走势，旺衰时机。

### 感情人际
情感状态与人际关系走向。

### 健康状态
身体能量状态提示。

## 时效预测
根据卦象与干支，在未来 ${timeRangeStr} 内：
- 指出2-3个关键转折时间节点（用具体月份或季节描述）
- 说明各阶段的主要特征

## 未来建议
结合变卦给出：
1. 最应把握的机遇
2. 最需警惕的风险（避坑指南）
3. 一句卦辞式的总结箴言（不超过20字，可用古风语言）

请确保分析专业、具体，紧密结合占问者的实际问题"${question}"，不要泛泛而谈。
`;

  try {
    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.7,
      maxTokens: 2000,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    // 如果没有 API Key，返回演示内容
    const demoContent = generateDemoContent(question, ganZhi, timeRangeStr);
    return new Response(demoContent, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

function generateDemoContent(question: string, ganZhi: any, timeRange: string): string {
  return `## 总体卦气

本卦阴阳交汇，卦气中和而偏动。日柱${ganZhi.day}临之，月建${ganZhi.month}助之，旬空${ganZhi.xunkong.join("、")}提示当下有缺失之处需补全。整体卦气提示：此番占问所涉之事正处于变化酝酿阶段，表面平稳实则内有暗流。阳气渐增，主积极进取方向，但需注意时机未到不可操之过急。变卦显示终将走向明朗。

## 分项解析

### 职业事业
针对"${question}"，卦象显示当前处于蓄势待发阶段。有贵人相助之象，但需主动出击方能获益。近期不宜轻易变动根基，宜守中求进，在原有基础上寻求突破口。内卦主自身状态稳健，外卦主外部环境有新机遇浮现。

### 财运财帛
财运整体向好，但忌投机冒进。本月财气旺于月末，可把握短线机遇。长线投资需审慎，月破地支提示相关方向需回避。正财有望，偏财不稳。

### 感情人际
人际关系和谐中有小摩擦，宜主动沟通化解。贵人在西北方向。感情上宜诚意相待，不可心存侥幸。

### 健康状态
整体精气神尚可，注意肝火偏旺，宜调节情绪。作息规律对运势有正向影响。

## 时效预测

根据卦象与${ganZhi.month}月建，未来 ${timeRange} 内：

- **近期（1-3个月）**：暗流涌动期，宜观察不宜大动。旬空化解后（约45天）局面将逐渐明朗。
- **中期（半年内）**：变卦显示转机出现，可见明显进展。关键节点在下一个季节交替之时。  
- **长期（${timeRange}）**：整体走向积极，若把握好中期转机，终将达成心中所愿。

## 未来建议

1. **最应把握的机遇**：当局面开始明朗的关键节点，务必主动出击，此时天时地利具备，不可犹豫。

2. **最需警惕的风险**：旬空所在之地支对应方向或领域需回避，忌在此期间做重大承诺或决策，防小人口舌。

3. **箴言**：
> 厚积薄发待天时，动静相宜自成事。

---
*⚠️ 提示：当前为演示模式，请配置 OPENAI_API_KEY 环境变量以获得真实 AI 解卦。*`;
}
// 强制触发重新构建 
