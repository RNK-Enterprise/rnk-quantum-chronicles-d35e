// RNK-Quantum D35E NPC Generator - Fractal Personalities
// Innovative: NPCs generated with fractal personality trees

export class NPCGenerator {
  static personalityFractal = {
    lawful: { children: ['disciplined', 'honorable'] },
    chaotic: { children: ['impulsive', 'free-spirited'] },
    good: { children: ['compassionate', 'just'] },
    evil: { children: ['selfish', 'cruel'] },
    neutral: { children: ['balanced', 'pragmatic'] }
  };

  static generateNPC(level = 1) {
    const npc = {
      name: this.generateName(),
      level,
      personality: this.generatePersonality(),
      stats: this.generateStats(level),
      equipment: this.generateEquipment(level)
    };
    return npc;
  }

  static generateName() {
    const prefixes = ['Sir', 'Lady', 'Master', 'Captain', 'Lord'];
    const names = ['Aldric', 'Brynna', 'Caspian', 'Dara', 'Eldrin'];
    const suffixes = ['the Brave', 'the Wise', 'the Swift', 'Shadow', 'Storm'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${names[Math.floor(Math.random() * names.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  static generatePersonality() {
    const alignments = Object.keys(this.personalityFractal);
    const primary = alignments[Math.floor(Math.random() * alignments.length)];
    const traits = this.personalityFractal[primary].children;
    const secondary = traits[Math.floor(Math.random() * traits.length)];
    return { primary, secondary };
  }

  static generateStats(level) {
    const base = 10 + level;
    return {
      str: base + Math.floor(Math.random() * 6),
      dex: base + Math.floor(Math.random() * 6),
      con: base + Math.floor(Math.random() * 6),
      int: base + Math.floor(Math.random() * 6),
      wis: base + Math.floor(Math.random() * 6),
      cha: base + Math.floor(Math.random() * 6)
    };
  }

  static generateEquipment(level) {
    const equipment = [];
    if (level > 3) equipment.push('sword');
    if (level > 5) equipment.push('armor');
    if (level > 7) equipment.push('magic item');
    return equipment;
  }
}