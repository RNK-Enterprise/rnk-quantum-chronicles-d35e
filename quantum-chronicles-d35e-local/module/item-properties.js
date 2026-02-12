/**
 * RNK-Quantum D35E - Item Property System
 * Comprehensive item properties for weapons, armor, and other items
 */

export const ItemProperties = {
  // Weapon Properties
  weaponProperties: {
    finesse: {
      name: "Finesse",
      description: "Can use STR or DEX for attacks and damage",
      type: "weapon"
    },
    reach: {
      name: "Reach",
      description: "Threat range increased by 5 feet",
      type: "weapon"
    },
    thrown: {
      name: "Thrown",
      description: "Can be thrown with range 10/20",
      type: "weapon"
    },
    light: {
      name: "Light Weapon",
      description: "Can be used in off-hand, added to TWF attacks",
      type: "weapon"
    },
    twohanded: {
      name: "Two-Handed",
      description: "Requires two hands to wield effectively",
      type: "weapon"
    },
    versatile: {
      name: "Versatile",
      description: "Can be wielded with one or two hands",
      type: "weapon"
    },
    ammunition: {
      name: "Ammunition",
      description: "Requires ammunition to fire",
      type: "weapon"
    },
    disarm: {
      name: "Disarm",
      description: "Can be used for disarm attempts without penalty",
      type: "weapon"
    },
    dangerous: {
      name: "Dangerous",
      description: "Deals 1d6 extra damage on a successful hit",
      type: "weapon"
    },
    parry: {
      name: "Parry",
      description: "Can be used to parry attacks",
      type: "weapon"
    },
    sunder: {
      name: "Sunder",
      description: "Effective for sundering other items",
      type: "weapon"
    },
    trip: {
      name: "Trip",
      description: "Can be used for trip attempts",
      type: "weapon"
    }
  },

  // Armor Types
  armorTypes: {
    light: {
      name: "Light Armor",
      description: "Doesn't impede movement or impose skill penalties",
      type: "armor",
      category: "light"
    },
    medium: {
      name: "Medium Armor",
      description: "Allows some movement, small skill penalties",
      type: "armor",
      category: "medium"
    },
    heavy: {
      name: "Heavy Armor",
      description: "Severely limits movement and imposes skill penalties",
      type: "armor",
      category: "heavy"
    },
    shield: {
      name: "Shield",
      description: "Provides AC bonus, can be used with armor",
      type: "armor",
      category: "shield"
    }
  },

  // Item Rarity
  rarities: {
    common: {
      name: "Common",
      description: "Everyday items, no special properties",
      color: "#808080"
    },
    uncommon: {
      name: "Uncommon",
      description: "Difficult to find, has minor magic",
      color: "#1eff00"
    },
    rare: {
      name: "Rare",
      description: "Very difficult to find, significant magic",
      color: "#0070dd"
    },
    veryrare: {
      name: "Very Rare",
      description: "Extremely difficult to find, powerful magic",
      color: "#a335ee"
    },
    legendary: {
      name: "Legendary",
      description: "Unique or nearly unique, extremely powerful",
      color: "#ff8000"
    },
    artifact: {
      name: "Artifact",
      description: "One-of-a-kind item with immense power",
      color: "#e6cc80"
    }
  },

  // Item Qualities
  qualities: {
    masterwork: {
      name: "Masterwork",
      description: "+1 bonus to attack rolls",
      type: "quality"
    },
    enchanted: {
      name: "Enchanted",
      description: "Magical item with special properties",
      type: "quality"
    },
    cursed: {
      name: "Cursed",
      description: "Item has a curse attached",
      type: "quality"
    },
    intelligent: {
      name: "Intelligent",
      description: "Item has sentience and abilities",
      type: "quality"
    },
    sentient: {
      name: "Sentient",
      description: "Item is fully sentient with personality",
      type: "quality"
    }
  }
};

/**
 * Item Property Manager - Handles all item properties
 */
export class ItemPropertyManager {
  constructor(item) {
    this.item = item;
    this.initializeProperties();
  }

  initializeProperties() {
    if (!this.item.system.properties) {
      this.item.system.properties = {};
    }

    // Initialize based on item type
    if (this.item.type === "weapon") {
      this.initializeWeaponProperties();
    } else if (this.item.type === "armor") {
      this.initializeArmorProperties();
    }

    // Universal properties
    this.item.system.properties.rarity = this.item.system.properties.rarity || "common";
    this.item.system.properties.identified = this.item.system.properties.identified !== false;
    this.item.system.properties.masterwork = this.item.system.properties.masterwork || false;
    this.item.system.properties.weight = this.item.system.properties.weight || 0;
    this.item.system.properties.cost = this.item.system.properties.cost || 0;
  }

  initializeWeaponProperties() {
    this.item.system.properties.finesse = this.item.system.properties.finesse || false;
    this.item.system.properties.reach = this.item.system.properties.reach || false;
    this.item.system.properties.thrown = this.item.system.properties.thrown || false;
    this.item.system.properties.light = this.item.system.properties.light || false;
    this.item.system.properties.twohanded = this.item.system.properties.twohanded || false;
    this.item.system.properties.versatile = this.item.system.properties.versatile || false;
    this.item.system.properties.ammunition = this.item.system.properties.ammunition || false;
  }

  initializeArmorProperties() {
    this.item.system.properties.armorType = this.item.system.properties.armorType || "light";
    this.item.system.properties.acBonus = this.item.system.properties.acBonus || 0;
    this.item.system.properties.checkPenalty = this.item.system.properties.checkPenalty || 0;
    this.item.system.properties.spellFailureChance = this.item.system.properties.spellFailureChance || 0;
  }

  /**
   * Check if item has a property
   */
  hasProperty(propertyKey) {
    return this.item.system.properties[propertyKey] === true;
  }

  /**
   * Set a property on the item
   */
  setProperty(propertyKey, value) {
    this.item.system.properties[propertyKey] = value;
  }

  /**
   * Get all active weapon properties
   */
  getWeaponProperties() {
    if (this.item.type !== "weapon") return [];
    const props = this.item.system.properties || {};
    return Object.keys(ItemProperties.weaponProperties)
      .filter(key => props[key] === true)
      .map(key => ItemProperties.weaponProperties[key]);
  }

  /**
   * Calculate attack bonus from properties
   */
  getPropertyAttackBonus() {
    let bonus = 0;

    if (this.item.system.properties?.masterwork) bonus += 1;
    if (this.item.system.properties?.enhancement) bonus += this.item.system.properties.enhancement;

    return bonus;
  }

  /**
   * Calculate item value in copper
   */
  calculateItemValue() {
    const baseCost = this.item.system.properties?.cost || 0;
    let multiplier = 1;

    if (this.item.system.properties?.masterwork) multiplier *= 1.3;
    if (this.item.system.properties?.enhancement) multiplier *= (2 ** this.item.system.properties.enhancement);

    return baseCost * multiplier;
  }

  /**
   * Identify or unidentify the item
   */
  setIdentified(identified = true) {
    this.item.system.properties.identified = identified;
  }

  /**
   * Check if item is identified
   */
  isIdentified() {
    return this.item.system.properties?.identified !== false;
  }

  /**
   * Get item display name (with rarity color)
   */
  getDisplayName() {
    const rarity = ItemProperties.rarities[this.item.system.properties?.rarity || "common"];
    const color = rarity?.color || "#ffffff";
    
    let name = this.item.name;
    if (!this.isIdentified()) {
      name = `${name} (Unidentified)`;
    }

    return `<span style="color: ${color};">${name}</span>`;
  }

  /**
   * Get item description with all properties
   */
  getFullDescription() {
    let description = this.item.system.description?.value || "";
    
    const properties = [];
    
    if (this.item.system.properties?.masterwork) {
      properties.push("Masterwork (+1 to attacks)");
    }
    
    if (this.item.system.properties?.enhancement) {
      properties.push(`+${this.item.system.properties.enhancement} Enhancement`);
    }

    const rarity = ItemProperties.rarities[this.item.system.properties?.rarity];
    if (rarity) {
      properties.push(`Rarity: ${rarity.name}`);
    }

    if (properties.length > 0) {
      description += `\n\n**Properties:** ${properties.join(", ")}`;
    }

    return description;
  }
}
