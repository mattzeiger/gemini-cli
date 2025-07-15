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

export class CostTrackingContentGenerator implements ContentGenerator {
  constructor(
    private wrapped: ContentGenerator,
    private model: string,
    private onCostUpdate: (cost: number) => void,
  ) {}

  async generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse> {
    // Cost is now handled by the stream processor in GeminiChat.
    return this.wrapped.generateContent(request);
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    // Cost is now handled by the stream processor in GeminiChat.
    return this.wrapped.generateContentStream(request);
  }

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    return this.wrapped.countTokens(request);
  }

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse> {
    return this.wrapped.embedContent(request);
  }
}

