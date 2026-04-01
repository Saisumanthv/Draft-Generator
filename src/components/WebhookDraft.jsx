import { useState } from "react";
import WEBHOOK_URL from "../config";
import "../styles/WebhookDraft.css";

export default function WebhookDraft() {
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetDraft = async () => {
    if (!WEBHOOK_URL) {
      setError("Webhook URL is not set. Please fill in config.js.");
      return;
    }
    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: url }),
      });

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponse(json);
      } catch {
        setResponse(text);
      }
    } catch (err) {
      setError("Failed to reach the webhook. Check the URL or your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Draft Generator</h2>

      <input
        type="text"
        className="url-input"
        placeholder="Enter website URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        className="get-draft-btn"
        onClick={handleGetDraft}
        disabled={loading}
      >
        {loading ? "Fetching..." : "Get Draft"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {response && (
        <div className="response-box">
          {typeof response === "object" ? (
            Object.entries(response).map(([key, value]) => (
              <div key={key} className="response-row">
                <span className="response-key">{key}</span>
                <span className="response-value">
                  {typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </span>
              </div>
            ))
          ) : (
            <p>{response}</p>
          )}
        </div>
      )}
    </div>
  );
}