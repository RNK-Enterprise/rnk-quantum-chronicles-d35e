// RNK-Quantum D35E NPC Sheet - Version Compatible
// Innovative: NPC sheet extending base with fractal data

import { ActorSheetPF } from "./base.js";

export class ActorSheetPFNPC extends ActorSheetPF {

  static get DEFAULT_OPTIONS() {
    return {
      classes: ["rnk-quantum-d35e", "sheet", "actor", "npc"],

      position: {
        width: 1200,
        height: 900
      }
    };
  }

  // V2 compatibility: Define PARTS for V2 sheets
  static get PARTS() {
    return {
      sheet: {
        tag: "form",
        template: "systems/rnk-quantum-d35e/templates/actors/npc-sheet.hbs",
        classes: ["npc-sheet"]
      }
    };
  }

  // V2 compatibility: Prepare context for V2 sheets
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.isNPC = true;
    context.fractalDepth = this.calculateFractalDepth();
    return context;
  }

  calculateFractalDepth() {
    return Math.floor(Math.random() * 10) + 1;
  }
}