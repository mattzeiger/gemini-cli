/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@google/genai';

declare module '@google/genai' {
  interface GenerateContentResponseUsageMetadata {
    thinkingTokensCount?: number;
    cachedContentTokenCount?: number;
  }
}
