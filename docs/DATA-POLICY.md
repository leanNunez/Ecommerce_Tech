# AI Assistant — Data Policy

> What the shopping assistant stores, for how long, and where.

## What the assistant receives per request

Each `POST /api/assistant/chat` call receives:
- `message` — the user's current message (max 500 chars)
- `history` — the last N turns from the client (max 20 messages, max 2000 chars each)

The server never stores conversation history. Every request is stateless — history lives only in the client's `sessionStorage`.

## What the assistant stores

| Data | Where | TTL | Notes |
|------|-------|-----|-------|
| Conversation history | Client `sessionStorage` only | Until tab is closed | Never sent to any logging service |
| Cart items (via `addToCart` tool) | PostgreSQL `CartItem` table | Until order placed or item removed | Requires auth |
| Rate limit counters | Server in-memory | Resets on server restart (no persistence) | 20 req/min per IP |
| Injection guard strikes | Server in-memory | Resets on server restart | 3 strikes → temp ban |
| AI call metrics | Server in-memory (`/metrics`) | Resets on server restart | Counts only, no content |

## What the assistant does NOT store

- Conversation content (messages, recommendations, queries)
- Search queries sent to Groq or Cohere
- Tool call arguments or results
- User intent or browsing behavior

## Third-party providers

| Provider | Purpose | Data sent |
|----------|---------|-----------|
| **Groq** (llama-3.3-70b) | LLM for chat responses | Message + conversation history per request |
| **Cohere** (embed-multilingual-v3.0) | Search embeddings | Query text only |

Neither provider receives PII beyond what the user types in the chat. Groq and Cohere have their own data retention policies.

## Security

- All messages pass through `injection-guard` before reaching the LLM
- LLM errors are sanitized before reaching the client — no internal provider details exposed
- The `addToCart` tool requires a valid session; unauthenticated users receive a sign-in prompt
- Rate limited to 20 requests/minute per IP
