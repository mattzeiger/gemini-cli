# Gemini 2.5 Pro Pricing

This document outlines the detailed, tiered pricing structure for the Gemini 2.5 Pro model as of July 2025.

## Pay-as-you-go Pricing Tiers

Pricing for Gemini 2.5 Pro is tiered based on the number of tokens in the input prompt.

### Tier 1: Prompts <= 200,000 tokens

| Feature                               | Price per 1,000,000 tokens (USD) |
| ------------------------------------- | -------------------------------- |
| **Input**                             | $1.25                            |
| **Output (including thinking tokens)**| $10.00                           |
| **Context Caching**                   | $0.31                            |

### Tier 2: Prompts > 200,000 tokens

| Feature                               | Price per 1,000,000 tokens (USD) |
| ------------------------------------- | -------------------------------- |
| **Input**                             | $2.50                            |
| **Output (including thinking tokens)**| $15.00                           |
| **Context Caching**                   | $0.625                           |

---

## Additional Costs

### Context Caching Storage

Beyond the cost of the cached tokens themselves, there is a storage fee.

| Feature                 | Price                                  |
| ----------------------- | -------------------------------------- |
| **Storage (TTL)**       | $4.50 / 1M tokens / hour               |

### Grounding with Google Search

This feature is used to improve model responses with real-time information from Google Search.

| Feature                 | Price                                  |
| ----------------------- | -------------------------------------- |
| **Google Search**       | 1,500 requests per day (free)          |
|                         | $35.00 / 1,000 requests (after free tier) |

---

*This document should be used as the source of truth for implementing cost calculation logic.*
