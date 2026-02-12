/**
 * RNK-Quantum D35E - Spell System
 * Modern spell management with slots, preparation, and casting
 */

export class SpellSlotManager {
  constructor(actor) {
    this.actor = actor;
    this.initializeSlots();
  }

  initializeSlots() {
    if (!this.actor.system.spellSlots) {
      this.actor.system.spellSlots = {};
    }

    // Initialize spell levels 0-9
    for (let level = 0; level <= 9; level++) {
      if (!this.actor.system.spellSlots[level]) {
        this.actor.system.spellSlots[level] = {
          value: 0,
          max: 0,
          prepared: []
        };
      }
    }
  }

  /**
   * Get spell slots for a given level
   */
  getSlots(spellLevel) {
    return this.actor.system.spellSlots[spellLevel] || { value: 0, max: 0, prepared: [] };
  }

  /**
   * Set spell slots for a given level
   */
  setSlots(spellLevel, max) {
    this.actor.system.spellSlots[spellLevel].max = max;
    this.actor.system.spellSlots[spellLevel].value = max; // Reset to max
  }

  /**
   * Expend a spell slot
   */
  expendSlot(spellLevel) {
    const slots = this.getSlots(spellLevel);
    if (slots.value > 0) {
      slots.value--;
      return true;
    }
    return false;
  }

  /**
   * Restore a spell slot
   */
  restoreSlot(spellLevel) {
    const slots = this.getSlots(spellLevel);
    if (slots.value < slots.max) {
      slots.value++;
      return true;
    }
    return false;
  }

  /**
   * Mark spell as prepared
   */
  prepareSpell(spellId) {
    // Find spell in actor items
    const spell = this.actor.items.get(spellId);
    if (!spell || spell.type !== "spell") return false;

    const level = spell.system.level || 0;
    const slots = this.getSlots(level);
    
    if (!slots.prepared.includes(spellId)) {
      slots.prepared.push(spellId);
      return true;
    }
    return false;
  }

  /**
   * Unprepare a spell
   */
  unprepareSpell(spellId) {
    const spell = this.actor.items.get(spellId);
    if (!spell) return false;

    const level = spell.system.level || 0;
    const slots = this.getSlots(level);
    
    slots.prepared = slots.prepared.filter(id => id !== spellId);
    return true;
  }

  /**
   * Check if spell is prepared
   */
  isPrepared(spellId) {
    const spell = this.actor.items.get(spellId);
    if (!spell) return false;

    const level = spell.system.level || 0;
    const slots = this.getSlots(level);
    return slots.prepared.includes(spellId);
  }

  /**
   * Get spell DC for saving throw
   */
  getSpellDC(spellLevel, abilityMod = 0) {
    const baseDC = 10;
    return baseDC + spellLevel + abilityMod;
  }

  /**
   * Calculate spells per day based on ability modifier
   * D&D 3.5e formula: You get bonus spells if ability modifier is high enough
   * Bonus spells = (ability_mod - spell_level + 1) / 4, rounded down, minimum 1 if qualified
   */
  calculateBonusSpells(spellcasterAbilityMod) {
    const bonusSpells = {};
    for (let level = 1; level <= 9; level++) {
      const bonus = Math.max(0, Math.floor((spellcasterAbilityMod - level) / 4) + 1);
      bonusSpells[level] = bonus;
    }
    return bonusSpells;
  }

  /**
   * Get all prepared spells of a given level
   */
  getPreparedSpellsOfLevel(spellLevel) {
    const slots = this.getSlots(spellLevel);
    return slots.prepared
      .map(spellId => this.actor.items.get(spellId))
      .filter(spell => spell && spell.system.level === spellLevel);
  }

  /**
   * Get all spells known/available of a given level
   */
  getAvailableSpellsOfLevel(spellLevel) {
    return this.actor.items.filter(item => 
      item.type === "spell" && 
      item.system.level === spellLevel
    );
  }
}

/**
 * Advanced Spell Activity - Extends ItemActivity for spell casting
 */
export class SpellActivity {
  constructor(spell) {
    this.spell = spell;
    this.name = spell.name;
    this.level = spell.system.level || 0;
    this.school = spell.system.school || "abjuration";
    this.components = spell.system.components || { verbal: true, somatic: true, material: false };
    this.castingTime = spell.system.castingTime || "1 action";
    this.range = spell.system.range || "Self";
    this.duration = spell.system.duration || "Instantaneous";
    this.description = spell.system.description?.value || "";
  }

  /**
   * Cast the spell
   */
  async cast(actor, config = {}) {
    console.log(`Casting ${this.spell.name}`, { actor: actor.name, config });

    // Check spell slots
    const slotManager = actor._spellSlotManager;
    if (!slotManager) {
      console.error("No spell slot manager found on actor");
      return null;
    }

    // Only expend slots for leveled spells (cantrips are 0)
    if (this.level > 0) {
      if (!slotManager.expendSlot(this.level)) {
        console.warn(`No spell slots available for level ${this.level}`);
        return null;
      }
    }

    // Create chat message
    const message = await this.createSpellMessage(actor, config);
    return message;
  }

  /**
   * Create spell cast message
   */
  async createSpellMessage(actor, config = {}) {
    const spellDC = this.calculateDC(actor);
    const components = this.formatComponents();
    
    const content = `
      <div class="spell-cast-message">
        <div class="spell-header">
          <h2>${this.spell.name}</h2>
          <div class="spell-meta">
            <span class="spell-level">Level ${this.level}</span>
            <span class="spell-school">${this.school}</span>
          </div>
        </div>
        
        <div class="spell-details">
          <div class="detail-row">
            <span class="label">Casting Time:</span>
            <span class="value">${this.castingTime}</span>
          </div>
          <div class="detail-row">
            <span class="label">Range:</span>
            <span class="value">${this.range}</span>
          </div>
          <div class="detail-row">
            <span class="label">Duration:</span>
            <span class="value">${this.duration}</span>
          </div>
          <div class="detail-row">
            <span class="label">Components:</span>
            <span class="value">${components}</span>
          </div>
          ${this.level > 0 ? `
          <div class="detail-row">
            <span class="label">Save DC:</span>
            <span class="value">${spellDC}</span>
          </div>
          ` : ''}
        </div>

        <div class="spell-description">
          <p>${this.description}</p>
        </div>

        <div class="spell-actions">
          <button class="spell-concentration" data-spell-id="${this.spell.id}">
            Maintain Concentration
          </button>
        </div>
      </div>
    `;

    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content,
      flags: {
        "rnk-quantum-d35e": {
          spellId: this.spell.id,
          spellLevel: this.level,
          spellDC: spellDC
        }
      }
    };

    return ChatMessage.create(chatData);
  }

  /**
   * Calculate spell DC
   */
  calculateDC(actor) {
    // Get spellcasting ability - default to INT for wizards, WIS for clerics/druids, CHA for sorcerers
    const defaultAbility = config.spellcasterAbility || "int";
    const ability = this.spell.system.spellcasterAbility || defaultAbility;
    
    const abilityMod = actor.system.abilities[ability]?.mod || 0;
    return 10 + this.level + abilityMod;
  }

  /**
   * Format components for display
   */
  formatComponents() {
    const parts = [];
    if (this.components.verbal) parts.push("V");
    if (this.components.somatic) parts.push("S");
    if (this.components.material) {
      parts.push(`M${this.components.materialComponent ? ` (${this.components.materialComponent})` : ""}`);
    }
    return parts.join(", ");
  }
}
