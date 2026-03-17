# 爻影 Yao Vision

<div align="center">

![Yao Vision](https://img.shields.io/badge/Yao_Vision-AI%20I%20Ching-00b4d8?style=for-the-badge&logo=next.js)

A modern AI-powered I Ching (Yi Jing) divination web application with gesture-based coin tossing and real-time hexagram interpretation.

[中文文档](#chinese-documentation) | [Live Demo](https://yao-vision.vercel.app) | [Deploy](#deployment)

</div>

---

## Features

- 🪙 **Gesture-Based Coin Tossing**: Simulate traditional coin divination with camera hand gesture recognition
- 🔮 **Real-time Hexagram Calculation**: Automatically generate hexagrams based on coin toss results
- 📜 **Professional Divination Board**: Display original and changed hexagrams with moving lines highlighted
- 🤖 **AI-Powered Interpretation**: Generate detailed I Ching readings with career, wealth, relationships, and health analysis
- 📅 **Chinese Calendar Integration**: Automatic Ganzhi (Stem-Branch) time calculation for accurate divination
- 🎨 **Exquisite UI**: Dark celestial theme with gold and azure accents, smooth animations
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **UI Library**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) with OpenAI GPT-4
- **Calendar**: [lunar-javascript](https://github.com/6tail/lunar-js)
- **Language**: TypeScript

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/yao-vision.git
cd yao-vision
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Project Structure

```
yao-vision/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main page
│   ├── components/         # React components
│   │   ├── CameraShake.tsx        # Camera-based coin tossing
│   │   ├── DivinationBoard.tsx   # Hexagram display board
│   │   ├── AIReading.tsx          # AI interpretation
│   │   └── UserProfileForm.tsx    # User input form
│   └── lib/               # Utility functions
│       ├── audio.ts       # Sound effects
│       ├── divination.ts  # Divination logic
│       └── guaData.ts     # Hexagram data
├── public/               # Static assets
└── package.json
```

---

## How It Works

### 1. User Profile Input

Users provide their age, gender, location, and the question they want to ask.

### 2. Coin Tossing

The app uses camera gesture recognition to detect hand movements and simulates tossing three coins six times to determine each yao (line) of the hexagram.

### 3. Hexagram Calculation

Based on the coin toss results, the app calculates:
- Original hexagram (本卦)
- Changed hexagram (变卦)
- Moving lines (动爻)
- Ganzhi (Stem-Branch) time (年月日时)

### 4. AI Interpretation

The app sends the divination data to GPT-4, which generates a professional I Ching reading including:
- Overall hexagram energy (总体卦气)
- Career analysis (职业事业)
- Wealth analysis (财运财帛)
- Relationship advice (感情人际)
- Health guidance (健康状态)
- Time prediction (时效预测)
- Future recommendations (未来建议)

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for GPT-4 | Yes (for AI readings) |
| `ANTHROPIC_API_KEY` | Alternative: Anthropic API key for Claude | No |

Without API keys, the app will run in demo mode and return sample interpretation content.

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Configure environment variables in Vercel dashboard
4. Deploy with one click

Your app will be available at `https://yao-vision.vercel.app`

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
- Railway
- Render

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI inspired by traditional Chinese aesthetics
- Hexagram data based on classical I Ching texts

---

## Chinese Documentation

### 项目介绍

爻影是一个基于 AI 的六爻占卜 Web 应用，支持通过摄像头手势识别模拟铜钱投掷，实时生成专业的卦象解读。

### 功能特点

- 🪙 手势识别模拟铜钱投掷
- 🔮 自动生成本卦、变卦、动爻
- 🤖 AI 解卦（职业、财运、感情、健康）
- 📅 自动计算干支时柱
- 🎨 精致暗色天界主题 UI

### 本地运行

```bash
git clone https://github.com/your-username/yao-vision.git
cd yao-vision
npm install
npm run dev
```

### 配置 AI

在 `.env.local` 文件中添加你的 OpenAI API Key：

```env
OPENAI_API_KEY=your_api_key_here
```

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入你的仓库
3. 在 Vercel 控制台配置环境变量
4. 一键部署

---

<div align="center">

Made with ❤️ using Next.js and Tailwind CSS

</div>
