/**
 * RNK-Quantum D35E - Modern Item Activity System
 * Provides D&D 5e-style activities for items (attack, damage, cast, etc)
 */

export class ItemActivity {
  constructor(item, activityData = {}) {
    this.item = item;
    this.name = activityData.name || "Activity";
    this.type = activityData.type || "generic"; // attack, damage, cast, ability, etc
    this.activation = {
      type: activityData.activation?.type || "action", // action, bonus, reaction, free
      cost: activityData.activation?.cost || 1
    };
    this.results = [];
  }

  /**
   * Execute the activity
   */
  async execute(actor, config = {}) {
    console.log(`Executing activity: ${this.name}`, { item: this.item.name, actor: actor.name });
    
    switch (this.type) {
      case "attack":
        return this.rollAttack(actor, config);
      case "damage":
        return this.rollDamage(actor, config);
      case "cast":
        return this.castSpell(actor, config);
      case "ability":
        return this.useAbility(actor, config);
      default:
        return this.genericRoll(actor, config);
    }
  }

  /**
   * Roll an attack
   */
  async rollAttack(actor, config = {}) {
    const attackBonus = this.getAttackBonus(actor, config);
    const formula = `1d20 + ${attackBonus}`;
    
    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();
    
    const message = await this.createChatMessage(actor, roll, "attack", config);
    this.results.push({ type: "attack", roll, message });
    
    return { roll, message };
  }

  /**
   * Roll damage
   */
  async rollDamage(actor, config = {}) {
    const damageFormula = this.getDamageFormula(actor, config);
    if (!damageFormula) {
      console.warn("No damage formula found");
      return null;
    }
    
    const roll = new Roll(damageFormula, actor.getRollData());
    await roll.evaluate();
    
    const message = await this.createChatMessage(actor, roll, "damage", config);
    this.results.push({ type: "damage", roll, message });
    
    return { roll, message };
  }

  /**
   * Cast a spell
   */
  async castSpell(actor, config = {}) {
    const spellDC = this.getSpellDC(actor, config);
    const message = await this.createSpellMessage(actor, spellDC, config);
    this.results.push({ type: "spell", spellDC, message });
    
    return { spellDC, message };
  }

  /**
   * Use an ability
   */
  async useAbility(actor, config = {}) {
    const message = await this.createAbilityMessage(actor, config);
    this.results.push({ type: "ability", message });
    
    return { message };
  }

  /**
   * Generic roll for unknown activity types
   */
  async genericRoll(actor, config = {}) {
    const formula = config.formula || "1d20";
    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();
    
    const message = await this.createChatMessage(actor, roll, "generic", config);
    this.results.push({ type: "generic", roll, message });
    
    return { roll, message };
  }

  /**
   * Get attack bonus from item and actor
   */
  getAttackBonus(actor, config = {}) {
    let bonus = 0;
    
    // Base attack bonus from actor
    if (actor.system?.attributes?.bab) {
      bonus += actor.system.attributes.bab.total || 0;
    }
    
    // Add ability modifier (STR for melee, DEX for ranged)
    const ability = this.item.system?.properties?.ability || "str";
    if (actor.system?.abilities?.[ability]) {
      const abilityMod = Math.floor((actor.system.abilities[ability].value - 10) / 2);
      bonus += abilityMod;
    }
    
    // Add item enchantment bonus
    if (this.item.system?.enhancement) {
      bonus += this.item.system.enhancement;
    }
    
    // Add any custom modifiers
    if (config.bonus) bonus += config.bonus;
    
    return bonus;
  }

  /**
   * Get damage formula from item
   */
  getDamageFormula(actor, config = {}) {
    // Get base damage dice from item - handle both old and new formats
    let damageDice = "1d8";
    
    if (this.item.system?.damage?.parts?.[0]?.[0]) {
      // D35E format: [[dice, type], ...]
      damageDice = this.item.system.damage.parts[0][0];
    } else if (this.item.system?.damage?.dice) {
      // Alternative format
      damageDice = this.item.system.damage.dice;
    }
    
    // Get damage ability modifier
    const ability = this.item.system?.properties?.ability || "str";
    let abilityMod = 0;
    if (actor.system?.abilities?.[ability]) {
      abilityMod = Math.floor((actor.system.abilities[ability].value - 10) / 2);
    }
    
    // Get enhancement bonus
    const enhancement = this.item.system?.enhancement || this.item.system?.properties?.enhancement || 0;
    
    // Build formula
    let formula = damageDice;
    if (abilityMod !== 0) formula += ` + ${abilityMod}`;
    if (enhancement > 0) formula += ` + ${enhancement}`;
    if (config.bonus) formula += ` + ${config.bonus}`;
    
    return formula;
  }

  /**
   * Get spell DC
   */
  getSpellDC(actor, config = {}) {
    const spellStat = this.item.system?.spellStat || "int";
    const baseDC = 10;
    const spellLevel = this.item.system?.level || 0;
    
    let abilityMod = 0;
    if (actor.system?.abilities?.[spellStat]) {
      abilityMod = Math.floor((actor.system.abilities[spellStat].value - 10) / 2);
    }
    
    return baseDC + spellLevel + abilityMod;
  }

  /**
   * Create chat message for roll
   */
  async createChatMessage(actor, roll, type = "generic", config = {}) {
    const content = this.formatRollMessage(actor, roll, type, config);
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content,
      rolls: [roll]
    };
    
    return ChatMessage.create(chatData);
  }

  /**
   * Create chat message for spell
   */
  async createSpellMessage(actor, spellDC, config = {}) {
    const content = `
      <div class="spell-cast-message">
        <h3>${this.item.name}</h3>
        <p><strong>DC:</strong> ${spellDC}</p>
        <p>${this.item.system?.description?.value || ""}</p>
      </div>
    `;
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content
    };
    
    return ChatMessage.create(chatData);
  }

  /**
   * Create chat message for ability
   */
  async createAbilityMessage(actor, config = {}) {
    const content = `
      <div class="ability-message">
        <h3>${this.item.name}</h3>
        <p>${this.item.system?.description?.value || ""}</p>
      </div>
    `;
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content
    };
    
    return ChatMessage.create(chatData);
  }

  /**
   * Format roll message for display
   */
  formatRollMessage(actor, roll, type = "generic", config = {}) {
    const total = roll.total;
    const formula = roll.formula;
    
    let typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    
    // V13 Safety: Filter out Operators and non-Die terms to prevent [object Object]
    const diceResults = roll.terms
      .filter(term => term.results && Array.isArray(term.results))
      .map(term => term.results.map(r => r.result).join(", "))
      .join(" | ");
    
    return `
      <div class="roll-message ${type}">
        <h3>${this.item.name} - ${typeLabel}</h3>
        <div class="roll-result">
          <strong>Result:</strong> ${total}
          <span class="formula">(${formula})</span>
        </div>
        <div class="dice-details">
          ${diceResults}
        </div>
      </div>
    `;
  }
}

/**
 * Weapon Activity - Auto-create from weapon item
 */
export class WeaponActivity extends ItemActivity {
  constructor(weapon) {
    super(weapon, {
      name: `${weapon.name} Attack`,
      type: "attack"
    });
    this.isWeaponAttack = true;
  }

  /**
   * Weapon attack includes both attack and damage rolls
   */
  async execute(actor, config = {}) {
    const attackResult = await this.rollAttack(actor, config);
    
    // If hit (result > 1), automatically roll damage
    if (attackResult.roll.total > 1 && config.autoRollDamage !== false) {
      const damageResult = await this.rollDamage(actor, config);
      return { attack: attackResult, damage: damageResult };
    }
    
    return attackResult;
  }
}

/**
 * Spell Activity - Auto-create from spell item
 */
export class SpellActivity extends ItemActivity {
  constructor(spell) {
    super(spell, {
      name: `Cast ${spell.name}`,
      type: "cast"
    });
    this.isSpell = true;
  }

  /**
   * Spell casting includes DC card, attack roll, and damage roll if applicable
   */
  async execute(actor, config = {}) {
    const results = {};
    
    // 1. Roll DC / Casting message
    results.cast = await this.castSpell(actor, config);
    
    // 2. Roll Attack if actionType is set (mwak = melee, rwak = ranged)
    if (this.item.system?.actionType === "mwak" || this.item.system?.actionType === "rwak") {
      results.attack = await this.rollAttack(actor, config);
    }
    
    // 3. Roll Damage if it has damage parts
    if (this.item.system?.damage?.parts?.length > 0) {
      results.damage = await this.rollDamage(actor, config);
    }
    
    return results;
  }
}
