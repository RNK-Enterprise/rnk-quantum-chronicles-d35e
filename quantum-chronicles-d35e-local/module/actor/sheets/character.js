// RNK-Quantum D35E Character Sheet - Version Compatible
// Innovative: Sheet using class inheritance for compatibility

import { ActorSheetPF } from "./base.js";

export class ActorSheetPFCharacter extends ActorSheetPF {

  static get DEFAULT_OPTIONS() {
    return {
      classes: ["rnk-quantum-d35e", "sheet", "actor", "character"],
      position: {
        width: 1400,
        height: 900
      }
    };
  }

  // V2 compatibility: Define PARTS for V2 sheets
  static get PARTS() {
    return {
      sheet: {
        tag: "form",
        template: "systems/rnk-quantum-d35e/templates/actors/character-sheet.hbs",
        classes: ["character-sheet"]
      }
    };
  }

  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.quantumState = Math.random();
    context.cssClass = "rnk-quantum-d35e sheet actor character";
    
    // Organize items by type for character sheet display
    const weapons = [];
    const armor = [];
    const feats = [];
    const spellbook = {};
    
    for (const item of this.actor.items) {
      if (item.type === "weapon" || item.type === "attack") weapons.push(item);
      else if (item.type === "armor") armor.push(item);
      else if (item.type === "feat") feats.push(item);
      else if (item.type === "spell") {
        const level = item.system.level || 0;
        if (!spellbook[level]) spellbook[level] = [];
        spellbook[level].push(item);
      }
    }
    
    context.weapons = weapons;
    context.armor = armor;
    context.feats = feats;
    context.spellbook = spellbook;
    
    return context;
  }

  async _onRender(context, options) {
    const html = typeof this.element === 'string' ? document.querySelector(this.element) : this.element;
    const $html = $(html);
    $html.find('.quantum-roll').on('click', this._onQuantumRoll.bind(this));
    await super._onRender(context, options);
  }

  activateListeners(html) {
    super.activateListeners(html);
    // Logic now handled in base class
  }

  _onQuantumRoll(event) {
    event.preventDefault();
    // Quantum roll logic
  }
}