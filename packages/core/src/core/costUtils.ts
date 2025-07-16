/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenerateContentResponseUsageMetadata } from '@google/genai';

// For a detailed breakdown of the pricing, see ../../../docs/pricing.md
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

export interface CostBreakdown {
  billedInput: number;
  outputTokens: number;
  cachedTokens: number;
  billedInputCost: number;
  outputCost: number;
  cachedCost: number;
  totalCost: number;
  pricing: {
    input: number;
    output: number;
    cached: number;
  };
}

export interface TokenCounts {
  promptTokenCount: number;
  candidatesTokenCount: number;
  thinkingTokensCount: number;
  cachedContentTokenCount: number;
  totalTokenCount: number;
}

interface Pricing {
  input: number;
  output: number;
  cached: number;
}

export function calculateCostBreakdown(
  model: string,
  tokens: TokenCounts,
): CostBreakdown | null {
  const modelCostInfo = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
  if (!modelCostInfo) {
    return null;
  }

  const promptTokens = tokens.promptTokenCount || 0;
  const candidateTokens = tokens.candidatesTokenCount || 0;
  const thinkingTokens = tokens.thinkingTokensCount || 0;
  const cachedTokens = tokens.cachedContentTokenCount || 0;
  const totalTokens = tokens.totalTokenCount || 0;

  let pricing: Pricing;
  if (model === 'gemini-2.5-pro') {
    const tiers = modelCostInfo as {
      small_prompt: Pricing;
      large_prompt: Pricing;
    };
    pricing = promptTokens > 200000 ? tiers.large_prompt : tiers.small_prompt;
  } else {
    pricing = modelCostInfo as Pricing;
  }

  // The most reliable way to calculate output tokens is to take the total
  // and subtract the known input-side tokens.
  const calculatedOutputTokens = totalTokens - promptTokens - cachedTokens;

  // As a fallback, if for some reason totalTokenCount is not provided,
  // sum up the known output-side tokens.
  const fallbackOutputTokens = candidateTokens + thinkingTokens;

  const outputTokens =
    calculatedOutputTokens > 0 ? calculatedOutputTokens : fallbackOutputTokens;

  const billedInput = promptTokens - cachedTokens;
  const billedInputCost = billedInput * pricing.input;
  const outputCost = outputTokens * pricing.output;
  const cachedCost = cachedTokens * pricing.cached;
  const totalCost = billedInputCost + outputCost + cachedCost;

  return {
    billedInput,
    outputTokens,
    cachedTokens,
    billedInputCost,
    outputCost,
    cachedCost,
    totalCost,
    pricing,
  };
}

export function calculateCost(
  model: string,
  usageMetadata: GenerateContentResponseUsageMetadata,
): number {
  const breakdown = calculateCostBreakdown(model, {
    promptTokenCount: usageMetadata.promptTokenCount || 0,
    candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
    thinkingTokensCount: usageMetadata.thinkingTokensCount || 0,
    cachedContentTokenCount: usageMetadata.cachedContentTokenCount || 0,
    totalTokenCount: usageMetadata.totalTokenCount || 0,
  });

  return breakdown?.totalCost || 0;
}
