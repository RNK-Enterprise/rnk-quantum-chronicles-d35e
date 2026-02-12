/**
 * RNK-Quantum D35E - Condition UI System
 * Visual condition tracking with quick toggle buttons
 */

import { SYSTEM_ID } from "./settings.js";

export class ConditionUIManager {
  constructor(actor) {
    this.actor = actor;
    this.conditions = this.initializeConditions();
  }

  initializeConditions() {
    return {
      // Physical Conditions
      blinded: {
        name: "Blinded",
        description: "-2 penalty to attack rolls, cannot use sight-based perception",
        icon: "fas fa-eye-slash",
        effects: { attackBonus: -2, saveDC: -2 }
      },
      bleed: {
        name: "Bleeding",
        description: "Loses 1 HP per round at the start of their turn",
        icon: "fas fa-tint",
        effects: { hpLoss: 1 }
      },
      broken: {
        name: "Broken",
        description: "Creature or object with this condition is rendered inoperative",
        icon: "fas fa-hammer",
        effects: { active: false }
      },
      cowering: {
        name: "Cowering",
        description: "Can take no action except total defense",
        icon: "fas fa-shield",
        effects: { canOnlyDefend: true }
      },
      dazed: {
        name: "Dazed",
        description: "Can take either a move or standard action in a turn, but not both",
        icon: "fas fa-hourglass-half",
        effects: { oneActionOnly: true }
      },
      deafened: {
        name: "Deafened",
        description: "Cannot hear and is immune to hearing-based perception",
        icon: "fas fa-volume-mute",
        effects: { cannotHear: true }
      },
      disabled: {
        name: "Disabled",
        description: "Creature can take a move action without further injuring itself",
        icon: "fas fa-wheelchair",
        effects: { movementOnly: true }
      },
      dying: {
        name: "Dying",
        description: "Creature is unconscious and can lose HP",
        icon: "fas fa-heartbeat",
        effects: { unconscious: true, canDie: true }
      },
      energy_drained: {
        name: "Energy Drained",
        description: "Creature loses one or more level equivalents",
        icon: "fas fa-bolt",
        effects: {}
      },
      exhausted: {
        name: "Exhausted",
        description: "-6 to Str and Dex, can't run or charge, can only take move actions",
        icon: "fas fa-tired",
        effects: { strDexPenalty: -6, limitedActions: true }
      },
      fatigued: {
        name: "Fatigued",
        description: "Can't run or charge, takes -2 to Str and Dex",
        icon: "fas fa-wind",
        effects: { strDexPenalty: -2 }
      },
      frightened: {
        name: "Frightened",
        description: "Must leave the frightening creature's presence, -2 on attacks and checks",
        icon: "fas fa-ghost",
        effects: { attackBonus: -2 }
      },
      grappled: {
        name: "Grappled",
        description: "-4 to AC, can't use ranged weapons, -2 on melee attacks",
        icon: "fas fa-people-arrows",
        effects: { acPenalty: -4, meleePenalty: -2 }
      },
      helpless: {
        name: "Helpless",
        description: "Unable to take any action, easiest target for coup de grace",
        icon: "fas fa-skull-crossbones",
        effects: { incapacitated: true }
      },
      invisible: {
        name: "Invisible",
        description: "Unseen and unheard, attacks at +2, can't use ranged attacks without penalty",
        icon: "fas fa-eye-slash",
        effects: { attackBonus: 2 }
      },
      nauseated: {
        name: "Nauseated",
        description: "Can only take move action (no standard action)",
        icon: "fas fa-vomit",
        effects: { oneActionOnly: true }
      },
      panicked: {
        name: "Panicked",
        description: "Flees at top speed away from source of fear, can't attack or cast",
        icon: "fas fa-running",
        effects: { mustFlee: true }
      },
      paralyzed: {
        name: "Paralyzed",
        description: "Frozen in place, can't move at all",
        icon: "fas fa-person-dots",
        effects: { speed: 0 }
      },
      petrified: {
        name: "Petrified",
        description: "Turned to stone, not entitled to saving throws",
        icon: "fas fa-mountain",
        effects: { incapacitated: true }
      },
      pinned: {
        name: "Pinned",
        description: "-4 to AC, can't move, can't use ranged weapons",
        icon: "fas fa-thumbtack",
        effects: { acPenalty: -4, immobilized: true }
      },
      prone: {
        name: "Prone",
        description: "-4 on melee attacks, +4 bonus to AC from melee attacks, -2 on ranged attacks",
        icon: "fas fa-person-hiking",
        effects: { meleePenalty: -4, acBonus: 4 }
      },
      sickened: {
        name: "Sickened",
        description: "-2 to all attack rolls, ability checks, saving throws",
        icon: "fas fa-disease",
        effects: { allPenalty: -2 }
      },
      slowed: {
        name: "Slowed",
        description: "Can move at half speed, take partial round to move",
        icon: "fas fa-snail",
        effects: { speedReduction: 0.5 }
      },
      sluggish: {
        name: "Sluggish",
        description: "Save at start of next turn or become slowed for 1 round",
        icon: "fas fa-sliders",
        effects: {}
      },
      stunned: {
        name: "Stunned",
        description: "Dazed and can't move, loses DEX bonus to AC",
        icon: "fas fa-stars",
        effects: { dazed: true, acPenalty: 0 }
      },
      unconscious: {
        name: "Unconscious",
        description: "Knocked out and helpless, can't see or take actions",
        icon: "fas fa-bed",
        effects: { incapacitated: true }
      }
    };
  }

  /**
   * Get a specific condition
   */
  getCondition(conditionKey) {
    return this.conditions[conditionKey];
  }

  /**
   * Apply a condition to the actor
   */
  async applyCondition(conditionKey, duration = null) {
    const condition = this.conditions[conditionKey];
    if (!condition) {
      console.warn(`Unknown condition: ${conditionKey}`);
      return false;
    }

    if (!this.actor) {
      console.warn("No actor available for conditions");
      return false;
    }

    if (this.hasCondition(conditionKey)) {
      return false;
    }

    const effectData = {
      label: condition.name,
      icon: condition.icon,
      origin: this.actor.uuid,
      disabled: false,
      flags: {
        [SYSTEM_ID]: {
          conditionKey,
          modifiers: condition.effects
        }
      }
    };

    if (duration) {
      effectData.duration = duration;
    }

    const created = await this.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    return !!created.length;
  }

  /**
   * Remove a condition
   */
  async removeCondition(conditionKey) {
    if (!this.actor) return false;

    const effects = this._getConditionEffects(conditionKey);
    if (!effects.length) return false;

    await this.actor.deleteEmbeddedDocuments("ActiveEffect", effects.map(e => e.id));
    return true;
  }

  /**
   * Toggle a condition on/off
   */
  async toggleCondition(conditionKey) {
    return this.hasCondition(conditionKey)
      ? this.removeCondition(conditionKey)
      : this.applyCondition(conditionKey);
  }

  /**
   * Check if actor has a condition
   */
   hasCondition(conditionKey) {
     return this._getConditionEffects(conditionKey).length > 0;
   }

  /**
   * Get all active conditions
   */
  getActiveConditions() {
    return this._getConditionEffects();
  }

  /**
   * Get condition display data for UI
   */
  getConditionDisplayData() {
    const activeEffects = this.getActiveConditions();

    return {
      all: Object.entries(this.conditions).map(([key, condition]) => ({
        key,
        ...condition,
        active: activeEffects.some(effect => this._getConditionKey(effect) === key)
      })),
      active: activeEffects
        .map(effect => this.conditions[this._getConditionKey(effect)])
        .filter(Boolean)
    };
  }

  /**
   * Calculate AC modifier from conditions
   */
  getACModifier() {
    let modifier = 0;
    this.getActiveConditions().forEach(effect => {
      const modifiers = this._getConditionModifiers(effect);
      if (modifiers.acPenalty) modifier += modifiers.acPenalty;
      if (modifiers.acBonus) modifier += modifiers.acBonus;
    });
    return modifier;
  }

  /**
   * Calculate attack roll modifier from conditions
   */
  getAttackModifier() {
    let modifier = 0;
    this.getActiveConditions().forEach(effect => {
      const modifiers = this._getConditionModifiers(effect);
      if (modifiers.attackBonus) modifier += modifiers.attackBonus;
      if (modifiers.allPenalty) modifier += modifiers.allPenalty;
    });
    return modifier;
  }

  /**
   * Internal helpers
   */
  _getConditionKey(effect) {
    return effect?.getFlag?.(SYSTEM_ID, "conditionKey");
  }

  _getConditionModifiers(effect) {
    return effect?.getFlag?.(SYSTEM_ID, "modifiers") || {};
  }

  _getConditionEffects(conditionKey = null) {
    if (!this.actor?.effects) return [];
    return this.actor.effects.filter(effect => {
      const key = this._getConditionKey(effect);
      return key && (conditionKey ? key === conditionKey : true);
    });
  }
}
