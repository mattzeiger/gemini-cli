/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from 'events';
import { CostBreakdown } from '@google/gemini-cli-core';

class CostState extends EventEmitter {
  private costBreakdowns: CostBreakdown[] = [];

  constructor() {
    super();
    // TODO: Restore session cost from environment variables if needed.
  }

  getCostBreakdowns() {
    return this.costBreakdowns;
  }

  getTotalCost(): number {
    return this.costBreakdowns.reduce(
      (acc, breakdown) => acc + breakdown.totalCost,
      0,
    );
  }

  addCostBreakdown(breakdown: CostBreakdown) {
    this.costBreakdowns.push(breakdown);
    this.emit('change', this.costBreakdowns);
  }
}

export const costState = new CostState();
