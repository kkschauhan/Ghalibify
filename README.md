# Ghalibify 

Ghalibify is a modern web application that suggests the perfect Ghalib couplet based on the scenario or feeling you describe. It now leverages a free‑tier language model to fetch authentic Mirza Ghalib poetry on the fly, while still falling back to a curated local collection when necessary.

## Overview

Just describe your current situation or emotion, click **Find My Couplet**, and Ghalibify will retrieve a relevant couplet along with its Latin transliteration, an English translation and a short theme. The application uses a serverless API to call the [Groq](https://groq.com) language model for high quality results and falls back to a built‑in dataset if the AI is unavailable.

## Features

- **AI‑powered matching**: A serverless backend asks a Groq model to return a couplet matching your scenario.
- **Graceful fallback**: If the API fails, the app falls back to a local keyword‑based matching algorithm.
- **Transliteration & translation**: Each suggestion includes a Latin transliteration and an English translation.
- **Theme classification**: The returned JSON includes a theme summarising the couplet’s mood or topic.
- **Responsive design**: Works seamlessly on desktop and mobile devices.

## Getting Started

### Prerequisites

- Node.js 18+ (required for the serverless function)
- A modern web browser
- A Groq API key (free to generate at the [Groq console](https://console.groq.com))

### Installation

1. **Clone this repository** into a new folder:

   ```bash
   git clone https://github.com/your-username/Ghalibify.git
   cd Ghalibify
   ```

2. **Configure your environment** by creating a `.env` file at the project root with your Groq API key:

   ```env
   # .env
   GROQ_API_KEY=your_groq_api_key_here
   ```

   Without this key the backend will return an error and the app will fall back to the built‑in dataset only.

3. **Install dev dependencies** (for local development only):

   ```bash
   npm install
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

   Then open `http://localhost:3000` in your browser.

### Deployment

This project is ready to deploy on [Vercel](https://vercel.com). It includes a serverless function located at `api/generateCouplet.js` that handles requests to `/api/generateCouplet`. To deploy:

1. Import the repository into Vercel or run `vercel` in the project directory if you have the [Vercel CLI](https://vercel.com/download).
2. Set the `GROQ_API_KEY` environment variable in your Vercel project settings.
3. Deploy! Vercel will automatically detect the `api/` folder and configure the function.

## Usage

1. Open the application in your browser.
2. Describe your current scenario or feeling in the text area.
3. Click **Find My Couplet** or press Ctrl+Enter.
4. Enjoy your personalised Ghalib couplet!

## Technical Details

- **Frontend**: Pure HTML, CSS and vanilla JavaScript.
- **Serverless API**: Calls the Groq Chat Completions API via fetch with a system prompt instructing the model to return a JSON object.
- **Fallback logic**: If the API call fails, a simple scoring algorithm selects a couplet from a curated list.
- **Fonts**: Uses Inter for UI text. The original Nastaliq script is not displayed in this version.

## Troubleshooting

- If you see an error about `GROQ_API_KEY` when hitting the API, ensure you have provided a valid key in your `.env` file or via Vercel environment variables.
- If the AI response cannot be parsed, the app will log the error and use the local fallback.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests to add more couplets, improve the matching algorithm, or enhance the UI/UX.

## License

MIT License — feel free to use and modify as needed.

---

*"ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے"* — Mirza Ghalib
