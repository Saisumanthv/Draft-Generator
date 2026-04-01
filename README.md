# Draft Generator

A React + Vite app that takes a website URL as input and fetches a draft using an n8n webhook workflow.

---

## Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) (v18 or above)
- npm (comes with Node.js)
- An active [n8n](https://n8n.io/) workflow with a Webhook node

Check your versions:
```bash
node -v
npm -v
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Webhook URL

Open the file `src/config.js` and replace the empty string with your n8n webhook URL:

```js
const WEBHOOK_URL = "https://your-n8n-webhook-url-here";

export default WEBHOOK_URL;
```

> **Note:** Use the **Test URL** while building/testing your n8n workflow, and switch to the **Production URL** once the workflow is finalized and activated.

### 4. Start the Development Server

```bash
npm run dev
```

The app will run at `http://localhost:5173` by default. Open it in your browser.

---

## Project Structure

```
src/
├── App.jsx                  # Root component
├── config.js                # Webhook URL config (edit this!)
├── main.jsx                 # Vite entry point
├── index.css                # Global styles
├── components/
│   └── WebhookDraft.jsx     # Main UI component with logic
└── styles/
    └── WebhookDraft.css     # Component styles
```

---

## How It Works

1. User enters a website URL in the input field
2. Clicks the **Get Draft** button
3. The app sends a `POST` request to the configured n8n webhook with the payload:
   ```json
   { "websiteUrl": "https://example.com" }
   ```
4. n8n processes the request through the workflow
5. The response is displayed below the button in a formatted card

---

## n8n Workflow Setup

If you're setting up the n8n workflow from scratch:

1. Create a new workflow in n8n
2. Add a **Webhook** node:
   - HTTP Method: `POST`
   - Path: any name (e.g. `research-lead`)
   - Respond: `When Last Node Finishes`
   - Response Data: `First Entry JSON`
3. Add your logic nodes in between (AI, HTTP Request, etc.)
4. Add a **Respond to Webhook** node at the end
5. Connect all nodes in sequence:
   ```
   Webhook → (your logic nodes) → Respond to Webhook
   ```
6. Copy the **Test URL** or **Production URL** and paste it into `src/config.js`

> **Tip:** Use the Test URL with "Listen for test event" while developing. Activate the workflow and use the Production URL for final use.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |

---

## Build for Production

```bash
npm run build
```

This generates an optimized `dist/` folder that can be deployed to any static hosting platform (Vercel, Netlify, GitHub Pages, etc.).

---

## Troubleshooting

**Webhook not responding?**
- Make sure your n8n workflow is active (for Production URL) or you've clicked "Listen for test event" (for Test URL)
- Check that all nodes in the workflow are properly connected

**CORS error in browser?**
- If running n8n locally, add these to your n8n environment config:
  ```
  N8N_CORS_ENABLE=true
  N8N_CORS_ALLOWED_ORIGINS=http://localhost:5173
  ```
- If using n8n.cloud, CORS is handled automatically

**Empty or raw JSON response?**
- Make sure your workflow has a **Respond to Webhook** node connected at the end

---

## License

This project is open source and available under the [MIT License](LICENSE).