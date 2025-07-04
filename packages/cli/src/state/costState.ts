
import { EventEmitter } from 'events';

class CostState extends EventEmitter {
  private totalCost = 0;

  getTotalCost() {
    return this.totalCost;
  }

  updateCost(cost: number) {
    this.totalCost += cost;
    this.emit('change', this.totalCost);
  }
}

export const costState = new CostState();
