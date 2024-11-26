# Sara - YouTube Transcript Reader

Sara transforms YouTube videos into readable, enhanced articles with AI-powered summaries. Perfect for readers who prefer text over video content.

## Features

- YouTube video transcript extraction
- AI-enhanced article generation
- TLDR summaries
- YouTube comments integration
- Clean, blog-style presentation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- YouTube Data API key
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rahmansalawu/sara.git
cd sara
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
OPEN_AI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Paste a YouTube URL into the input field
2. Wait for the transcript to be processed
3. Toggle between original and enhanced versions
4. Read the TLDR summary for quick overview

## Tech Stack

- Next.js 14
- TypeScript
- TailwindCSS
- OpenAI API
- YouTube Data API

## Contributing

See [FEATURES.md](FEATURES.md) for upcoming features and development roadmap.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- YouTube Transcript API
- OpenAI GPT API
- Next.js Team

---
Built with ❤️ by [Rahman Salawu](https://github.com/rahmansalawu)
