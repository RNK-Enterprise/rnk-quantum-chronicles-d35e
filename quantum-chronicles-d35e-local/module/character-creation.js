/**
 * RNK-Quantum D35E - Character Creation Helpers
 * Simplify character creation with race/class selection and auto-formatting
 */

export const CharacterRaces = {
  dwarf: {
    name: "Dwarf",
    abilityMods: { str: 0, dex: -2, con: 2, int: 0, wis: 0, cha: -2 },
    speed: 20,
    size: "medium",
    favoritedWeapon: "battleaxe",
    languages: ["Common", "Dwarven"]
  },
  elf: {
    name: "Elf",
    abilityMods: { str: -2, dex: 2, con: 0, int: 0, wis: 0, cha: 0 },
    speed: 30,
    size: "medium",
    favoritedWeapon: "longsword",
    languages: ["Common", "Elvish"]
  },
  gnome: {
    name: "Gnome",
    abilityMods: { str: -2, dex: 0, con: 2, int: 0, wis: 0, cha: 0 },
    speed: 20,
    size: "small",
    favoritedWeapon: "dagger",
    languages: ["Common", "Gnome"]
  },
  halfelf: {
    name: "Half-Elf",
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 2 },
    speed: 30,
    size: "medium",
    favoritedWeapon: "longsword",
    languages: ["Common", "Elvish"]
  },
  halfling: {
    name: "Halfling",
    abilityMods: { str: -2, dex: 2, con: 0, int: 0, wis: 0, cha: 0 },
    speed: 20,
    size: "small",
    favoritedWeapon: "dagger",
    languages: ["Common", "Halfling"]
  },
  halforc: {
    name: "Half-Orc",
    abilityMods: { str: 2, dex: 0, con: 0, int: -2, wis: 0, cha: -2 },
    speed: 30,
    size: "medium",
    favoritedWeapon: "greataxe",
    languages: ["Common", "Orc"]
  },
  human: {
    name: "Human",
    abilityMods: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    speed: 30,
    size: "medium",
    favoritedWeapon: "sword",
    languages: ["Common"]
  }
};

export const CharacterClasses = {
  barbarian: {
    name: "Barbarian",
    hitDice: 12,
    baseAttackProgression: "full",
    savingThrows: { fort: "good", ref: "poor", will: "poor" },
    skillPoints: 4,
    primaryAbility: "str"
  },
  bard: {
    name: "Bard",
    hitDice: 8,
    baseAttackProgression: "medium",
    savingThrows: { fort: "poor", ref: "good", will: "good" },
    skillPoints: 6,
    primaryAbility: "cha"
  },
  cleric: {
    name: "Cleric",
    hitDice: 8,
    baseAttackProgression: "medium",
    savingThrows: { fort: "good", ref: "poor", will: "good" },
    skillPoints: 2,
    primaryAbility: "wis"
  },
  druid: {
    name: "Druid",
    hitDice: 8,
    baseAttackProgression: "medium",
    savingThrows: { fort: "good", ref: "poor", will: "good" },
    skillPoints: 4,
    primaryAbility: "wis"
  },
  fighter: {
    name: "Fighter",
    hitDice: 10,
    baseAttackProgression: "full",
    savingThrows: { fort: "good", ref: "poor", will: "poor" },
    skillPoints: 2,
    primaryAbility: "str"
  },
  monk: {
    name: "Monk",
    hitDice: 8,
    baseAttackProgression: "full",
    savingThrows: { fort: "good", ref: "good", will: "good" },
    skillPoints: 4,
    primaryAbility: "dex"
  },
  paladin: {
    name: "Paladin",
    hitDice: 10,
    baseAttackProgression: "full",
    savingThrows: { fort: "good", ref: "poor", will: "good" },
    skillPoints: 2,
    primaryAbility: "str"
  },
  ranger: {
    name: "Ranger",
    hitDice: 10,
    baseAttackProgression: "full",
    savingThrows: { fort: "good", ref: "good", will: "poor" },
    skillPoints: 6,
    primaryAbility: "dex"
  },
  rogue: {
    name: "Rogue",
    hitDice: 6,
    baseAttackProgression: "medium",
    savingThrows: { fort: "poor", ref: "good", will: "poor" },
    skillPoints: 8,
    primaryAbility: "dex"
  },
  sorcerer: {
    name: "Sorcerer",
    hitDice: 6,
    baseAttackProgression: "poor",
    savingThrows: { fort: "poor", ref: "poor", will: "good" },
    skillPoints: 2,
    primaryAbility: "cha"
  },
  wizard: {
    name: "Wizard",
    hitDice: 6,
    baseAttackProgression: "poor",
    savingThrows: { fort: "poor", ref: "poor", will: "good" },
    skillPoints: 2,
    primaryAbility: "int"
  }
};

/**
 * Character Creation Helper
 */
export class CharacterCreationHelper {
  constructor(actor) {
    this.actor = actor;
  }

  /**
   * Apply race to character
   */
  applyRace(raceKey) {
    const race = CharacterRaces[raceKey];
    if (!race) {
      console.warn(`Unknown race: ${raceKey}`);
      return false;
    }

    // Set race name
    this.actor.system.details.race = race.name;

    // Apply ability modifiers
    for (const [ability, mod] of Object.entries(race.abilityMods)) {
      if (this.actor.system.abilities[ability]) {
        this.actor.system.abilities[ability].value += mod;
      }
    }

    // Set speed
    if (race.speed) {
      this.actor.system.attributes.speed.land = race.speed;
    }

    // Set size
    this.actor.system.traits.size = race.size;

    return true;
  }

  /**
   * Apply class to character
   */
  applyClass(classKey, level = 1) {
    const characterClass = CharacterClasses[classKey];
    if (!characterClass) {
      console.warn(`Unknown class: ${classKey}`);
      return false;
    }

    this.actor.system.details.class = characterClass.name;
    this.actor.system.details.level.value = level;

    // Calculate BAB based on class and level
    const bab = this.calculateBAB(characterClass, level);
    this.actor.system.attributes.bab = bab;

    // Calculate saving throw bases
    this.calculateSavingThrows(characterClass, level);

    // Calculate skill points
    const hasHighInt = this.actor.system.abilities.int.mod > 0;
    const intBonus = hasHighInt ? this.actor.system.abilities.int.mod * level : 0;
    const skillPoints = (characterClass.skillPoints + 3) * level + intBonus + 4; // +4 for free 1st level
    
    this.actor.system.details.skillPoints = skillPoints;

    return true;
  }

  /**
   * Calculate Base Attack Bonus
   */
  calculateBAB(characterClass, level) {
    let bab = 0;

    switch (characterClass.baseAttackProgression) {
      case "full":
        bab = level;
        break;
      case "medium":
        bab = Math.floor((level * 3) / 4);
        break;
      case "poor":
        bab = Math.floor(level / 2);
        break;
    }

    return bab;
  }

  /**
   * Calculate base saving throws
   */
  calculateSavingThrows(characterClass, level) {
    const baseGood = Math.floor(level / 2) + 2;
    const basePoor = Math.floor(level / 3);

    const saves = this.actor.system.attributes.saves;

    for (const [saveType, prog] of Object.entries(characterClass.savingThrows)) {
      const hasGood = prog === "good";
      saves[saveType].base = hasGood ? baseGood : basePoor;
    }
  }

  /**
   * Apply ability score array
   * 15, 14, 13, 12, 10, 8 standard array
   */
  applyAbilityScoreArray(abilities = null) {
    const defaultArray = [15, 14, 13, 12, 10, 8];
    const scores = abilities || defaultArray;
    const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"];

    if (scores.length !== 6) {
      console.warn("Ability score array must have 6 values");
      return false;
    }

    abilityKeys.forEach((key, index) => {
      this.actor.system.abilities[key].value = scores[index];
    });

    return true;
  }

  /**
   * Apply point buy system
   * Standard: 25 points, ability scores 8-15
   */
  applyPointBuy(points = 25) {
    const costs = {
      8: -2,
      9: -1,
      10: 0,
      11: 1,
      12: 2,
      13: 3,
      14: 5,
      15: 7
    };

    // Initialize with base 10
    const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"];
    abilityKeys.forEach(key => {
      this.actor.system.abilities[key].value = 10;
    });

    return {
      pointsTotal: points,
      costs: costs,
      message: "Distribute points using the point buy system. Each ability starts at 10."
    };
  }

  /**
   * Calculate hit points
   */
  calculateHP(hdValue = null) {
    const level = this.actor.system.details.level.value || 1;
    const classKey = this.actor.system.details.class.toLowerCase();
    const characterClass = CharacterClasses[classKey];
    
    if (!characterClass && !hdValue) {
      console.warn(`Class ${classKey} not found`);
      return 0;
    }

    const hitDice = hdValue || characterClass.hitDice;
    const conMod = this.actor.system.abilities.con.mod || 0;

    // HP = d[hitDice] at 1st level + (hitDice/2 + 1 + CON mod) per level after
    let hp = hitDice + conMod;
    for (let i = 2; i <= level; i++) {
      hp += Math.floor(hitDice / 2) + 1 + conMod;
    }

    // Minimum 1 HP per level
    hp = Math.max(hp, level);

    return hp;
  }
}
