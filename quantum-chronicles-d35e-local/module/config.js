// RNK-Quantum D35E Configuration - Static for Compatibility
// Innovative: Simplified config for stable operation

export const D35E = {
  // Ability Scores
  abilities: {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma"
  },

  abilityAbbreviations: {
    str: "STR",
    dex: "DEX",
    con: "CON",
    int: "INT",
    wis: "WIS",
    cha: "CHA"
  },

  // Saving Throws
  savingThrows: {
    fort: "Fortitude",
    ref: "Reflex",
    will: "Will"
  },

  saveAbilities: {
    fort: "con",
    ref: "dex",
    will: "wis"
  },

  // Alignment
  alignments: {
    lg: "Lawful Good",
    ng: "Neutral Good",
    cg: "Chaotic Good",
    ln: "Lawful Neutral",
    tn: "True Neutral",
    cn: "Chaotic Neutral",
    le: "Lawful Evil",
    ne: "Neutral Evil",
    ce: "Chaotic Evil"
  },

  // Size Categories
  sizes: {
    fine: "Fine",
    diminutive: "Diminutive",
    tiny: "Tiny",
    small: "Small",
    medium: "Medium",
    large: "Large",
    huge: "Huge",
    gargantuan: "Gargantuan",
    colossal: "Colossal"
  },

  // Size modifiers
  sizeMods: {
    fine: 8,
    diminutive: 4,
    tiny: 2,
    small: 1,
    medium: 0,
    large: -1,
    huge: -2,
    gargantuan: -4,
    colossal: -8
  },

  spellSchools: {
    abjuration: "Abjuration",
    conjuration: "Conjuration",
    divination: "Divination",
    enchantment: "Enchantment",
    evocation: "Evocation",
    illusion: "Illusion",
    necromancy: "Necromancy",
    transmutation: "Transmutation",
    universal: "Universal"
  },

  skills: {
    appraise: { key: "appraise", ability: "int", untrained: true },
    balance: { key: "balance", ability: "dex", untrained: true, armorCheck: true },
    bluff: { key: "bluff", ability: "cha", untrained: true },
    climb: { key: "climb", ability: "str", untrained: true, armorCheck: true },
    concentration: { key: "concentration", ability: "con", untrained: true },
    craft: { key: "craft", ability: "int", untrained: true },
    diplomacy: { key: "diplomacy", ability: "cha", untrained: true },
    disguise: { key: "disguise", ability: "cha", untrained: true },
    escapeArtist: { key: "escapeArtist", ability: "dex", untrained: true, armorCheck: true },
    forgery: { key: "forgery", ability: "int", untrained: true },
    gatherInformation: { key: "gatherInformation", ability: "cha", untrained: true },
    handleAnimal: { key: "handleAnimal", ability: "cha", untrained: false },
    heal: { key: "heal", ability: "wis", untrained: true },
    hide: { key: "hide", ability: "dex", untrained: true, armorCheck: true },
    intimidate: { key: "intimidate", ability: "cha", untrained: true },
    jump: { key: "jump", ability: "str", untrained: true, armorCheck: true },
    knowledge: { key: "knowledge", ability: "int", untrained: false },
    listen: { key: "listen", ability: "wis", untrained: true },
    moveSilently: { key: "moveSilently", ability: "dex", untrained: true, armorCheck: true },
    openLock: { key: "openLock", ability: "dex", untrained: false },
    perform: { key: "perform", ability: "cha", untrained: true },
    profession: { key: "profession", ability: "wis", untrained: false },
    ride: { key: "ride", ability: "dex", untrained: true },
    search: { key: "search", ability: "int", untrained: true },
    senseMotive: { key: "senseMotive", ability: "wis", untrained: true },
    sleightOfHand: { key: "sleightOfHand", ability: "dex", untrained: false, armorCheck: true },
    spellcraft: { key: "spellcraft", ability: "int", untrained: false },
    spot: { key: "spot", ability: "wis", untrained: true },
    survival: { key: "survival", ability: "wis", untrained: true },
    swim: { key: "swim", ability: "str", untrained: true, armorCheck: true },
    tumble: { key: "tumble", ability: "dex", untrained: false, armorCheck: true },
    useMagicDevice: { key: "useMagicDevice", ability: "cha", untrained: false },
    useRope: { key: "useRope", ability: "dex", untrained: true }
  },

  // Races
  races: {
    human: "Human",
    dwarf: "Dwarf",
    elf: "Elf",
    gnome: "Gnome",
    halfElf: "Half-Elf",
    halfOrc: "Half-Orc",
    halfling: "Halfling"
  },

  // Classes
  classes: {
    barbarian: "Barbarian",
    bard: "Bard",
    cleric: "Cleric",
    druid: "Druid",
    fighter: "Fighter",
    monk: "Monk",
    paladin: "Paladin",
    ranger: "Ranger",
    rogue: "Rogue",
    sorcerer: "Sorcerer",
    wizard: "Wizard"
  },

  // Item Types
  itemTypes: {
    weapon: "D35E.ItemTypeWeapon",
    armor: "D35E.ItemTypeArmor",
    spell: "D35E.ItemTypeSpell",
    feat: "D35E.ItemTypeFeat",
    skill: "D35E.ItemTypeSkill",
    class: "D35E.ItemTypeClass",
    consumable: "D35E.ItemTypeConsumable",
    equipment: "D35E.ItemTypeEquipment",
    loot: "D35E.ItemTypeLoot",
    buff: "D35E.ItemTypeBuff",
    aura: "D35E.ItemTypeAura",
    attack: "D35E.ItemTypeAttack"
  },

  // Weapon Types
  weaponTypes: {
    simple: "D35E.WeaponSimple",
    martial: "D35E.WeaponMartial",
    exotic: "D35E.WeaponExotic"
  },

  // Weapon Subtypes
  weaponSubtypes: {
    light: "D35E.WeaponLight",
    oneHanded: "D35E.WeaponOneHanded",
    twoHanded: "D35E.WeaponTwoHanded",
    ranged: "D35E.WeaponRanged"
  },

  // Damage Types
  damageTypes: {
    bludgeoning: "D35E.DamageBludgeoning",
    piercing: "D35E.DamagePiercing",
    slashing: "D35E.DamageSlashing",
    acid: "D35E.DamageAcid",
    cold: "D35E.DamageCold",
    electricity: "D35E.DamageElectricity",
    fire: "D35E.DamageFire",
    sonic: "D35E.DamageSonic"
  },

  // Equipment Types
  equipmentTypes: {
    light: "D35E.EquipmentLight",
    medium: "D35E.EquipmentMedium",
    heavy: "D35E.EquipmentHeavy",
    shield: "D35E.EquipmentShield"
  },

  // Consumable Types
  consumableTypes: {
    potion: "D35E.ConsumablePotion",
    scroll: "D35E.ConsumableScroll",
    wand: "D35E.ConsumableWand",
    staff: "D35E.ConsumableStaff"
  },

  // Spell Schools
  spellSchools: {
    abjuration: "D35E.SpellSchoolAbjuration",
    conjuration: "D35E.SpellSchoolConjuration",
    divination: "D35E.SpellSchoolDivination",
    enchantment: "D35E.SpellSchoolEnchantment",
    evocation: "D35E.SpellSchoolEvocation",
    illusion: "D35E.SpellSchoolIllusion",
    necromancy: "D35E.SpellSchoolNecromancy",
    transmutation: "D35E.SpellSchoolTransmutation"
  },

  // Feat Types
  featTypes: {
    general: "D35E.FeatTypeGeneral",
    combat: "D35E.FeatTypeCombat",
    metamagic: "D35E.FeatTypeMetamagic",
    special: "D35E.FeatTypeSpecial"
  },

  // Aliases used by templates
  saves: {
    fort: "D35E.SavingThrowFort",
    ref: "D35E.SavingThrowRef",
    will: "D35E.SavingThrowWill"
  },

  actorSizes: {
    fine: "D35E.SizeFine",
    diminutive: "D35E.SizeDiminutive",
    tiny: "D35E.SizeTiny",
    small: "D35E.SizeSmall",
    medium: "D35E.SizeMedium",
    large: "D35E.SizeLarge",
    huge: "D35E.SizeHuge",
    gargantuan: "D35E.SizeGargantuan",
    colossal: "D35E.SizeColossal"
  }
};

// Utility functions
export function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}