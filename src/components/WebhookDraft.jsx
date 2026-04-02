import { useMemo, useState } from "react";
import WEBHOOK_URL from "../config";
import "../styles/WebhookDraft.css";

const ACTIONS = [
  { id: "event_details", label: "Get Event Details" },
  { id: "hackathon_details", label: "Get Hackathon Details" },
  { id: "new_courses", label: "New Courses" },
];

function extractItemList(payload) {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload !== "object") {
    return [];
  }

  const preferredKeys = ["items", "results", "data", "cards", "list", "output"];

  for (const key of preferredKeys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value;
    }
    if (value && typeof value === "object") {
      const nested = extractItemList(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) {
      return value;
    }
    if (value && typeof value === "object") {
      const nested = extractItemList(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function normalizeCards(payload) {
  const items = extractItemList(payload);

  return items.slice(0, 10).map((item, index) => ({
    id: item.id || `${index + 1}`,
    title: item.title || item.name || "Untitled",
    subtitle: item.subtitle || item.provider || item.organizer || "",
    category: item.category || item.type || "",
    description: item.description || item.summary || "No description provided.",
    date: item.date || item.startDate || item.deadline || "",
    location: item.location || item.city || "",
    mode: item.mode || "",
    tags: Array.isArray(item.tags) ? item.tags.slice(0, 3) : [],
    link: item.link || item.url || "",
  }));
}

export default function WebhookDraft() {
  const [loadingAction, setLoadingAction] = useState("");
  const [rawResponse, setRawResponse] = useState(null);
  const [error, setError] = useState("");

  const cards = useMemo(() => normalizeCards(rawResponse), [rawResponse]);

  const handleActionClick = async (action) => {
    if (!WEBHOOK_URL) {
      setError("Webhook URL is not set. Add it in src/config.js.");
      return;
    }

    setLoadingAction(action.id);
    setError("");
    setRawResponse(null);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action.id, actionLabel: action.label }),
      });

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setRawResponse(json);
      } catch {
        setRawResponse({ message: text || "Request sent successfully." });
      }
    } catch {
      setError("Failed to reach the webhook. Check URL and network.");
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div className="action-shell">
      <div className="action-card">
        <h1 className="title">Workflow Trigger Panel</h1>
        <p className="subtitle">All buttons call the same webhook configured in src/config.js.</p>

        <div className="button-grid">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              className="action-btn"
              onClick={() => handleActionClick(action)}
              disabled={Boolean(loadingAction)}
              type="button"
            >
              {loadingAction === action.id ? "Sending..." : action.label}
            </button>
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}

        {cards.length > 0 && (
          <div className="results-wrap">
            <h2 className="results-title">Top {cards.length} Results</h2>
            <div className="card-grid">
              {cards.map((card) => (
                <article className="result-card" key={card.id}>
                  <p className="card-category">{card.category || "General"}</p>
                  <h3 className="card-title">{card.title}</h3>
                  {card.subtitle && <p className="card-subtitle">{card.subtitle}</p>}
                  <p className="card-description">{card.description}</p>

                  <div className="card-meta">
                    {card.date && <span>{card.date}</span>}
                    {card.location && <span>{card.location}</span>}
                    {card.mode && <span>{card.mode}</span>}
                  </div>

                  {card.tags.length > 0 && (
                    <div className="tags-row">
                      {card.tags.map((tag) => (
                        <span className="tag" key={`${card.id}-${tag}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {card.link && (
                    <a className="card-link" href={card.link} target="_blank" rel="noreferrer">
                      View Details
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {rawResponse && cards.length === 0 && (
          <div className="response-box">
            <h2>Webhook Response</h2>
            {typeof rawResponse === "object" ? (
              <pre>{JSON.stringify(rawResponse, null, 2)}</pre>
            ) : (
              <p>{String(rawResponse)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
