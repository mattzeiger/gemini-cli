/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenerateContentResponseUsageMetadata } from '@google/genai';

const MODEL_COSTS = {
  'gemini-1.5-pro': {
    input: 7 / 1000000,
    output: 21 / 1000000,
    cached: 3.5 / 1000000,
  },
  'gemini-1.5-flash': {
    input: 0.7 / 1000000,
    output: 2.1 / 1000000,
    cached: 0.35 / 1000000,
  },
  // TODO(mattz): get official pricing for 2.5
  'gemini-2.5-pro': {
    input: 1.25 / 1000000,
    output: 10.0 / 1000000,
    cached: 0.31 / 1000000, // placeholder
  },
};

export function calculateCost(
  model: string,
  usageMetadata: GenerateContentResponseUsageMetadata,
): number {
  const modelCosts = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
  if (!modelCosts) {
    return 0;
  }

  const promptTokens = usageMetadata.promptTokenCount || 0;
  const candidateTokens = usageMetadata.candidatesTokenCount || 0;
  const thinkingTokens = usageMetadata.thinkingTokensCount || 0;
  const cachedTokens = usageMetadata.cachedContentTokenCount || 0;
  const totalTokens = usageMetadata.totalTokenCount || 0;

  const outputTokens = totalTokens - promptTokens - cachedTokens;

  const fallbackOutputTokens = candidateTokens + thinkingTokens;

  const finalOutputTokens = outputTokens > 0 ? outputTokens : fallbackOutputTokens;

  const inputCost = (promptTokens / 1000000) * modelCosts.input;
  const outputCost = (finalOutputTokens / 1000000) * modelCosts.output;
  const cachedCost = (cachedTokens / 1000000) * modelCosts.cached;

  return inputCost + outputCost + cachedCost;
}
