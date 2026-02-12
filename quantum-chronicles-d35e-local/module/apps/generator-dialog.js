/**
 * Treasure and Encounter Generator Dialog
 * Provides UI for generating random treasure and NPCs
 */

export class GeneratorDialog extends Dialog {
  constructor(options = {}) {
    super(options);

    this.data = {
      encounterLevel: 1,
      npcCount: 1,
      npcRole: "warrior",
      treasureType: "individual"
    };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/rnk-quantum-d35e/templates/apps/generator-dialog.html",
      classes: ["D35E", "dialog", "generator-dialog"],
      width: 600,
      height: 500,
      resizable: true
    });
  }

  get title() {
    return "Treasure & Encounter Generator";
  }

  getData() {
    return {
      encounterLevel: this.encounterLevel,
      npcCount: this.npcCount,
      npcRole: this.npcRole,
      treasureType: this.treasureType,
      roles: [
        { value: "warrior", label: "Warrior" },
        { value: "mage", label: "Mage" },
        { value: "rogue", label: "Rogue" },
        { value: "priest", label: "Priest" },
        { value: "commoner", label: "Commoner" }
      ],
      treasureTypes: [
        { value: "individual", label: "Individual Treasure" },
        { value: "hoard", label: "Treasure Hoard" }
      ]
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Update data when inputs change
    html.find('input, select').change(event => {
      const target = event.currentTarget;
      this.data[target.name] = target.type === 'number' ? parseInt(target.value) : target.value;
    });

    // Generate treasure button
    html.find('.generate-treasure').click(() => {
      this._generateTreasure();
    });

    // Generate encounter button
    html.find('.generate-encounter').click(() => {
      this._generateEncounter();
    });
  }

  _generateTreasure() {
    const treasure = game.D35E.TreasureGenerator.generateTreasure(
      this.encounterLevel,
      this.treasureType
    );

    const formattedTreasure = game.D35E.TreasureGenerator.formatTreasure(treasure);
    const totalValue = game.D35E.TreasureGenerator.calculateTotalValue(treasure);

    const content = `
      ${formattedTreasure}
      <h4>Total Value: ${totalValue} gp</h4>
      <button class="create-treasure-items">Create Items in Inventory</button>
    `;

    new Dialog({
      title: "Generated Treasure",
      content: content,
      buttons: {
        close: {
          label: "Close"
        }
      }
    }).render(true);
  }

  _generateEncounter() {
    const encounter = game.D35E.NPCGenerator.generateEncounter(
      this.encounterLevel,
      this.npcCount,
      this.npcRole
    );

    let content = `<h3>Generated Encounter</h3>`;
    content += `<p><strong>Difficulty:</strong> ${encounter.difficulty}</p>`;
    content += `<p><strong>Total XP:</strong> ${encounter.totalXP}</p>`;
    content += `<h4>NPCs:</h4><ul>`;

    for (const npc of encounter.npcs) {
      content += `<li><strong>${npc.name}</strong> (${npc.race} ${npc.class} ${npc.level})`;
      content += `<br>HP: ${npc.hp}, AC: ${npc.ac}, Initiative: ${npc.initiative > 0 ? '+' : ''}${npc.initiative}`;
      content += `<br>Alignment: ${npc.alignment}`;
      content += `<br>${npc.description}</li>`;
    }

    content += `</ul><button class="create-npc-actors">Create NPC Actors</button>`;

    new Dialog({
      title: "Generated Encounter",
      content: content,
      buttons: {
        close: {
          label: "Close"
        }
      }
    }).render(true);
  }
}
