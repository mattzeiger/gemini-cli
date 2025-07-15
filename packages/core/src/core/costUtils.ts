/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenerateContentResponseUsageMetadata } from '@google/genai';

export const MODEL_COSTS = {
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
  'gemini-2.5-pro': {
    small_prompt: {
      input: 1.25 / 1000000,
      output: 10.0 / 1000000,
      cached: 0.31 / 1000000,
    },
    large_prompt: {
      input: 2.5 / 1000000,
      output: 15.0 / 1000000,
      cached: 0.625 / 1000000,
    },
  },
};

export function calculateCost(
  model: string,
  usageMetadata: GenerateContentResponseUsageMetadata,
): number {
  const modelCostInfo = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
  if (!modelCostInfo) {
    return 0;
  }

  const promptTokens = usageMetadata.promptTokenCount || 0;
  const candidateTokens = usageMetadata.candidatesTokenCount || 0;
  const thinkingTokens = usageMetadata.thinkingTokensCount || 0;
  const cachedTokens = usageMetadata.cachedContentTokenCount || 0;
  const totalTokens = usageMetadata.totalTokenCount || 0;

  let modelCosts;
  if (model === 'gemini-2.5-pro') {
    const tiers = modelCostInfo as {
      small_prompt: { input: number; output: number; cached: number };
      large_prompt: { input: number; output: number; cached: number };
    };
    modelCosts =
      promptTokens > 200000 ? tiers.large_prompt : tiers.small_prompt;
  } else {
    modelCosts = modelCostInfo as {
      input: number;
      output: number;
      cached: number;
    };
  }

  if (!modelCosts) {
    return 0;
  }

  // The most reliable way to calculate output tokens is to take the total
  // and subtract the known input-side tokens.
  const outputTokens = totalTokens - promptTokens - cachedTokens;

  // As a fallback, if for some reason totalTokenCount is not provided,
  // sum up the known output-side tokens.
  const fallbackOutputTokens = candidateTokens + thinkingTokens;

  const finalOutputTokens =
    outputTokens > 0 ? outputTokens : fallbackOutputTokens;

  const inputCost = (promptTokens - cachedTokens) * modelCosts.input;
  const outputCost = finalOutputTokens * modelCosts.output;
  const cachedCost = cachedTokens * modelCosts.cached;

  return inputCost + outputCost + cachedCost;
}
