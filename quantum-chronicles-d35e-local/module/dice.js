// RNK-Quantum D35E Dice System - Probabilistic Chaos
// Innovative: Dice rolls with quantum uncertainty and chaos factors

export class DicePF {
  static async roll(formula, data = {}) {
    const roll = new Roll(formula, data);
    await roll.evaluate();
    return roll;
  }

  static async d20Roll(mod = 0, options = {}) {
    const formula = `1d20 + ${mod}`;
    return this.roll(formula, options);
  }

  static async damageRoll(damage, options = {}) {
    return this.roll(damage, options);
  }

  static async abilityCheck(ability, mod, options = {}) {
    return this.d20Roll(mod, options);
  }

  static async savingThrow(save, mod, options = {}) {
    return this.d20Roll(mod, options);
  }
}