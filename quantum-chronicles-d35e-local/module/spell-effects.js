// RNK-Quantum D35E Spell Effects - Vortex Loading
// Innovative: Spell effects loaded via vortex with gravitational pull

import { vortexLoader } from "../loader.js";

export class SpellEffects {
  constructor() {
    this.effects = new Map();
  }

  async loadEffect(spellId) {
    if (this.effects.has(spellId)) {
      return this.effects.get(spellId);
    }

    const effectModule = await vortexLoader.loadModule(`./spells/effects/${spellId}.js`);
    this.effects.set(spellId, effectModule.default);
    return effectModule.default;
  }

  async applyEffect(spellId, target, caster) {
    const effect = await this.loadEffect(spellId);
    if (effect) {
      effect.apply(target, caster);
    }
  }

  async removeEffect(spellId, target) {
    const effect = await this.loadEffect(spellId);
    if (effect && effect.remove) {
      effect.remove(target);
    }
  }
}

export const spellEffects = new SpellEffects();