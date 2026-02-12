// RNK-Quantum D35E Item Entity - Fractal Tree Structure
// Innovative: Items as fractal trees with infinite nesting

import { ItemActivity, WeaponActivity, SpellActivity } from "./activities.js";

class FractalItemNode {
  constructor(data, parent = null) {
    this.data = data;
    this.parent = parent;
    this.children = [];
    if (parent) parent.children.push(this);
  }

  traverse(callback) {
    callback(this);
    this.children.forEach(child => child.traverse(callback));
  }

  addChild(data) {
    return new FractalItemNode(data, this);
  }

  addEnhancement(data) {
    return new FractalItemNode({ type: 'enhancement', ...data }, this);
  }

  calculateTotal() {
    let total = this.data.value || 0;
    this.children.forEach(child => {
      total += child.calculateTotal();
    });
    return total;
  }
}

export class ItemPF extends Item {
  constructor(...args) {
    super(...args);
    this.activities = [];
  }

  prepareData() {
    super.prepareData();
    this.buildFractalTree();
    this.initializeActivities();
  }

  buildFractalTree() {
    // Initialize or Reset fractal root to prevent memory leaks and duplicate nodes on every prepareData call
    this.fractalRoot = new FractalItemNode({ 
      type: 'item', 
      id: this.id || "new-item", 
      name: this.name || "New Item" 
    });

    const itemData = this.system;
    if (!itemData) return;

    // Add base properties
    this.fractalRoot.addChild({ type: 'properties', data: itemData });

    // Add enhancements as children (ensure enhancements is an array)
    if (Array.isArray(itemData.enhancements)) {
      itemData.enhancements.forEach(enh => {
        this.fractalRoot.addEnhancement(enh);
      });
    }

    // Calculate total value via fractal
    itemData.totalValue = this.fractalRoot.calculateTotal();
  }

  /**
   * Initialize activities based on item type and system data
   */
  initializeActivities() {
    this.activities = [];
    
    // Add default activities based on type if none exist in system data
    if (!this.system.activities || this.system.activities.length === 0) {
      switch (this.type) {
        case "weapon":
          this.activities.push(new WeaponActivity(this));
          break;
        case "spell":
          this.activities.push(new SpellActivity(this));
          break;
        case "feat":
          if (this.system?.actionType) {
            this.activities.push(new ItemActivity(this, {
              name: `Use ${this.name}`,
              type: "ability"
            }));
          }
          break;
      }
    } else {
      // Load activities from system data
      this.system.activities.forEach(actData => {
        this.activities.push(new ItemActivity(this, actData));
      });
    }
  }

  /**
   * Get all activities for this item
   */
  getActivities() {
    return this.activities;
  }

  /**
   * Get activity by type
   */
  getActivity(type) {
    return this.activities.find(a => a.type === type);
  }

  /**
   * Modern roll method - uses activities
   */
  async roll(actor = null, config = {}) {
    // If no actor provided, try to get from game context
    if (!actor && game.canvas?.tokens?.controlled?.[0]) {
      actor = game.canvas.tokens.controlled[0].actor;
    }

    if (!actor) {
      ui.notifications.warn("No actor selected to perform this action");
      return null;
    }

    // Get primary activity (usually attack for weapons, cast for spells)
    const activity = this.activities[0];
    
    if (!activity) {
      // Fallback to old roll system or toMessage
      return this.toMessage();
    }

    // Execute the activity
    return activity.execute(actor, config);
  }

  getRollData() {
    const rollData = super.getRollData();
    rollData.fractalBonus = this.fractalRoot.calculateTotal() * 0.1; // Quantum bonus
    return rollData;
  }
}
