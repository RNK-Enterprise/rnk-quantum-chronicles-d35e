/**
 * RNK-Quantum D35E - Currency System
 * D&D 3.5e currency with automatic conversion and encumbrance
 */

export class CurrencyManager {
  constructor(actor) {
    this.actor = actor;
    this.initializeCurrency();
  }

  initializeCurrency() {
    if (!this.actor.system.currency) {
      this.actor.system.currency = {};
    }

    // Initialize all currency types (in individual coins)
    this.actor.system.currency.pp = this.actor.system.currency.pp || 0; // Platinum = 1000 gp
    this.actor.system.currency.gp = this.actor.system.currency.gp || 0; // Gold = 1 gp
    this.actor.system.currency.sp = this.actor.system.currency.sp || 0; // Silver = 0.1 gp
    this.actor.system.currency.cp = this.actor.system.currency.cp || 0; // Copper = 0.01 gp
  }

  /**
   * Convert all currency to gold pieces
   */
  getTotalGoldValue() {
    const currency = this.actor.system.currency;
    return (currency.pp * 1000) + currency.gp + (currency.sp * 0.1) + (currency.cp * 0.01);
  }

  /**
   * Add currency
   */
  addCurrency(amount, type = "gp") {
    if (!this.actor.system.currency[type]) {
      console.warn(`Unknown currency type: ${type}`);
      return false;
    }

    this.actor.system.currency[type] += amount;
    this.consolidateCurrency();
    return true;
  }

  /**
   * Remove currency
   */
  removeCurrency(amount, type = "gp") {
    const available = this.actor.system.currency[type] || 0;
    
    if (available < amount) {
      console.warn(`Not enough ${type}. Have ${available}, need ${amount}`);
      return false;
    }

    this.actor.system.currency[type] -= amount;
    return true;
  }

  /**
   * Consolidate currency (convert 10 copper to 1 silver, etc)
   */
  consolidateCurrency() {
    const c = this.actor.system.currency;

    // Copper to Silver
    if (c.cp >= 10) {
      c.sp += Math.floor(c.cp / 10);
      c.cp = c.cp % 10;
    }

    // Silver to Gold
    if (c.sp >= 10) {
      c.gp += Math.floor(c.sp / 10);
      c.sp = c.sp % 10;
    }

    // Gold to Platinum
    if (c.gp >= 1000) {
      c.pp += Math.floor(c.gp / 1000);
      c.gp = c.gp % 1000;
    }
  }

  /**
   * Get currency display string
   */
  getCurrencyString() {
    const c = this.actor.system.currency;
    const parts = [];
    
    if (c.pp > 0) parts.push(`${c.pp} pp`);
    if (c.gp > 0) parts.push(`${c.gp} gp`);
    if (c.sp > 0) parts.push(`${c.sp} sp`);
    if (c.cp > 0) parts.push(`${c.cp} cp`);
    
    return parts.length > 0 ? parts.join(", ") : "No currency";
  }

  /**
   * Calculate weight of coins in pounds
   * D&D 3.5e: 50 coins = 1 pound
   */
  getCurrencyWeight() {
    const totalCoins = (this.actor.system.currency.pp || 0) +
                       (this.actor.system.currency.gp || 0) +
                       (this.actor.system.currency.sp || 0) +
                       (this.actor.system.currency.cp || 0);
    
    return totalCoins / 50;
  }
}

/**
 * Encumbrance Calculator
 */
export class EncumbranceCalculator {
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Get carrying capacity in pounds based on STR
   */
  getCarryingCapacity() {
    const strScore = this.actor.system.abilities.str.value;
    
    // D&D 3.5e Light Load = 1/3 STR x 10
    // Medium Load = 2/3 STR x 10
    // Heavy Load = STR x 10
    
    const lightLoad = Math.floor((strScore * 10) / 3);
    const mediumLoad = Math.floor((strScore * 20) / 3);
    const heavyLoad = strScore * 10;
    
    return {
      light: lightLoad,
      medium: mediumLoad,
      heavy: heavyLoad
    };
  }

  /**
   * Calculate total carried weight
   */
  getTotalWeight() {
    let weight = 0;

    // Add item weights
    this.actor.items.forEach(item => {
      const itemWeight = item.system.properties?.weight || 0;
      const quantity = item.quantity || 1;
      weight += itemWeight * quantity;
    });

    // Add currency weight
    const currencyManager = new CurrencyManager(this.actor);
    weight += currencyManager.getCurrencyWeight();

    return weight;
  }

  /**
   * Get encumbrance level
   */
  getEncumbranceLevel() {
    const capacity = this.getCarryingCapacity();
    const totalWeight = this.getTotalWeight();

    if (totalWeight <= capacity.light) {
      return {
        level: "light",
        name: "Light Encumbrance",
        penalty: 0
      };
    } else if (totalWeight <= capacity.medium) {
      return {
        level: "medium",
        name: "Medium Encumbrance",
        penalty: -3,  // Speed penalty
        speedReduction: 0.75
      };
    } else if (totalWeight <= capacity.heavy) {
      return {
        level: "heavy",
        name: "Heavy Encumbrance",
        penalty: -6,  // Speed penalty
        speedReduction: 0.5
      };
    } else {
      return {
        level: "over",
        name: "Over Carrying Capacity",
        cannotMove: true
      };
    }
  }

  /**
   * Get speed modifier from encumbrance
   */
  getSpeedModifier() {
    const encumbrance = this.getEncumbranceLevel();
    return encumbrance.speedReduction || 1.0;
  }

  /**
   * Get encumbrance penalties for display
   */
  getEncumbrancePenalties() {
    const encumbrance = this.getEncumbranceLevel();
    
    if (encumbrance.penalty) {
      return {
        acPenalty: 0,  // No AC penalty in 3.5e
        skillPenalty: encumbrance.penalty,
        speedReduction: encumbrance.speedReduction || 1.0
      };
    }

    return { acPenalty: 0, skillPenalty: 0, speedReduction: 1.0 };
  }
}

/**
 * Wealth/Treasure Manager
 */
export class WealthManager {
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Calculate character wealth by level (Standard for D&D 3.5e)
   * Used to determine starting equipment value
   */
  static getWealthByLevel(level) {
    const wealthTable = {
      1: 100,
      2: 500,
      3: 1000,
      4: 2500,
      5: 5000,
      6: 8500,
      7: 13000,
      8: 19000,
      9: 27000,
      10: 36000,
      11: 49000,
      12: 66000,
      13: 89000,
      14: 120000,
      15: 160000,
      16: 220000,
      17: 290000,
      18: 380000,
      19: 490000,
      20: 630000
    };

    return wealthTable[level] || wealthTable[20];
  }

  /**
   * Get recommended wealth for character
   */
  getRecommendedWealth() {
    const level = this.actor.system.details.level.value || 1;
    return WealthManager.getWealthByLevel(level);
  }

  /**
   * Get current total wealth (currency + items)
   */
  getTotalWealth() {
    let value = 0;

    // Add currency value
    const currencyManager = new CurrencyManager(this.actor);
    value += currencyManager.getTotalGoldValue();

    // Add item values
    this.actor.items.forEach(item => {
      const itemValue = item.system.properties?.cost || 0;
      const quantity = item.quantity || 1;
      
      // Apply enchantment multiplier
      let multiplier = 1;
      if (item.system.properties?.enhancement) {
        multiplier *= (2 ** item.system.properties.enhancement);
      }
      if (item.system.properties?.masterwork) {
        multiplier *= 1.3;
      }

      value += itemValue * quantity * multiplier;
    });

    return value;
  }

  /**
   * Check if character wealth meets expected for level
   */
  meetsWealthExpectation() {
    const expected = this.getRecommendedWealth();
    const actual = this.getTotalWealth();
    
    return {
      expected,
      actual,
      ratio: actual / expected,
      isSufficient: actual >= expected * 0.9 // Within 90% is acceptable
    };
  }
}
