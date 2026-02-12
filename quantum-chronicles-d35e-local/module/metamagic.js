// RNK-Quantum D35E Metamagic Feats - Quantum State Transitions
// Innovative: Metamagic as quantum state changes

export class MetamagicFeats {
  static quantumStates = {
    empower: { multiplier: 1.5, levelIncrease: 2 },
    maximize: { fixed: true, levelIncrease: 3 },
    quicken: { action: 'swift', levelIncrease: 4 },
    silent: { verbal: false, levelIncrease: 1 },
    still: { somatic: false, levelIncrease: 1 }
  };

  static applyMetamagic(spell, feat) {
    const state = this.quantumStates[feat];
    if (!state) return spell;

    // Quantum transition
    const newSpell = { ...spell };
    if (state.multiplier) {
      newSpell.damage = Math.floor(newSpell.damage * state.multiplier);
    }
    if (state.fixed) {
      newSpell.damage = newSpell.dice * newSpell.dieType;
    }
    if (state.action) {
      newSpell.action = state.action;
    }
    if (state.verbal !== undefined) {
      newSpell.verbal = state.verbal;
    }
    if (state.somatic !== undefined) {
      newSpell.somatic = state.somatic;
    }
    newSpell.level += state.levelIncrease;

    return newSpell;
  }

  static getAvailableMetamagic() {
    return Object.keys(this.quantumStates);
  }
}