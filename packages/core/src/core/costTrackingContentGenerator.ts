/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  Content,
  Part,
} from '@google/genai';
import { ContentGenerator } from './contentGenerator.js';

const MODEL_COSTS = {
  'gemini-2.5-pro': {
    input: 0.00125 / 1000,
    output: 0.01 / 1000,
  },
};

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const modelCosts = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
  if (!modelCosts) {
    return 0;
  }
  return (
    (inputTokens / 1000) * modelCosts.input +
    (outputTokens / 1000) * modelCosts.output
  );
}

export class CostTrackingContentGenerator implements ContentGenerator {
  constructor(
    private wrapped: ContentGenerator,
    private model: string,
    private onCostUpdate: (cost: number) => void,
  ) {}

  async generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse> {
    const response = await this.wrapped.generateContent(request);
    this.trackCost(request.contents, response);
    return response;
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const stream = await this.wrapped.generateContentStream(request);

    const self = this;
    async function* wrappedStream(): AsyncGenerator<GenerateContentResponse> {
      for await (const chunk of stream) {
        if (chunk.usageMetadata) {
          const cost = calculateCost(
            self.model,
            chunk.usageMetadata.promptTokenCount || 0,
            chunk.usageMetadata.candidatesTokenCount || 0,
          );
          self.onCostUpdate(cost);
        }
        yield chunk;
      }
    }

    return wrappedStream();
  }

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    return this.wrapped.countTokens(request);
  }

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse> {
    return this.wrapped.embedContent(request);
  }

  private async trackCost(
    requestContent: any,
    response: GenerateContentResponse,
  ) {
    const { usageMetadata } = response;
    if (usageMetadata) {
      const cost = calculateCost(
        this.model,
        usageMetadata.promptTokenCount || 0,
        usageMetadata.candidatesTokenCount || 0,
      );
      this.onCostUpdate(cost);
    }
  }
}

