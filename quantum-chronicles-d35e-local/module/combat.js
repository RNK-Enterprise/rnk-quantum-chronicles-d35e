// RNK-Quantum D35E Combat System - Trigger-Based Rolls
// Innovative: Combat using trigger nexus for event-driven resolution

import { DicePF } from "./dice.js";
import { nexus } from "../nexus.js";

export class CombatPF extends Combat {
  constructor(...args) {
    super(...args);
    this.quantumInitiative = [];
  }

  async rollInitiative(ids, options = {}) {
    // Trigger-based initiative
    nexus.fireTrigger('combatStart', { ids, options });

    for (let id of ids) {
      const combatant = this.combatants.get(id);
      if (!combatant) continue;

      const roll = await this.rollInitiativeForCombatant(combatant);
      this.quantumInitiative.push({ id, roll: roll.total });
    }

    // Sort via quantum entanglement
    this.quantumInitiative.sort((a, b) => b.roll - a.roll);
    this.updateCombatantsOrder();

    nexus.fireTrigger('initiativeRolled', this.quantumInitiative);
  }

  async rollInitiativeForCombatant(combatant) {
    const actor = combatant.actor;
    const initMod = actor.system.attributes.init.total;
    const roll = new Roll("1d20 + @init", { init: initMod });
    await roll.evaluate();
    return roll;
  }

  updateCombatantsOrder() {
    this.combatants.forEach((combatant, index) => {
      const quantumData = this.quantumInitiative.find(q => q.id === combatant.id);
      if (quantumData) {
        combatant.update({ initiative: quantumData.roll });
      }
    });
  }

  async nextTurn() {
    super.nextTurn();
    nexus.fireTrigger('turnChange', { current: this.current });
  }

  async nextRound() {
    super.nextRound();
    nexus.fireTrigger('roundChange', { round: this.round });
  }
}