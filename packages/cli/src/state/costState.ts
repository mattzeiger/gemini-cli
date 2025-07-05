/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from 'events';

class CostState extends EventEmitter {
  private totalCost = 0;

  constructor() {
    super();
    const initialCost = Number(process.env.GEMINI_CLI_SESSION_COST || 0);
    this.totalCost = initialCost;
  }

  getTotalCost() {
    return this.totalCost;
  }

  updateCost(cost: number) {
    this.totalCost += cost;
    this.emit('change', this.totalCost);
  }
}

export const costState = new CostState();
