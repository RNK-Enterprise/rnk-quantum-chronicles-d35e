// RNK-Quantum D35E Feats System - Fractal Dependencies
// Innovative: Feats as fractal trees with dependencies

class FeatNode {
  constructor(feat, parent = null) {
    this.feat = feat;
    this.parent = parent;
    this.children = [];
    if (parent) parent.children.push(this);
  }

  canTake(actor) {
    if (this.parent && !actor.feats.includes(this.parent.feat.id)) return false;
    return this.feat.prerequisites.every(pre => this.checkPrerequisite(pre, actor));
  }

  checkPrerequisite(pre, actor) {
    // Quantum prerequisite check
    return Math.random() > 0.5; // Simulate
  }
}

export class FeatsSystem {
  static featTree = new Map();

  static buildFeatTree(feats) {
    feats.forEach(feat => {
      const node = new FeatNode(feat);
      this.featTree.set(feat.id, node);

      if (feat.prerequisites) {
        feat.prerequisites.forEach(pre => {
          if (this.featTree.has(pre)) {
            node.parent = this.featTree.get(pre);
            node.parent.children.push(node);
          }
        });
      }
    });
  }

  static getAvailableFeats(actor) {
    return Array.from(this.featTree.values()).filter(node => node.canTake(actor));
  }

  static applyFeat(actor, featId) {
    const node = this.featTree.get(featId);
    if (node && node.canTake(actor)) {
      actor.feats.push(featId);
      // Apply quantum bonuses
      actor.system.attributes.bab += node.feat.babBonus || 0;
    }
  }
}