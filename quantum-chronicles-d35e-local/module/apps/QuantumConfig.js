const api = foundry?.applications?.api;
const ApplicationV2 = api?.ApplicationV2 || class DefaultApplication {};
const HandlebarsApplicationMixin = api?.HandlebarsApplicationMixin;

const SYSTEM_ID = "rnk-quantum-d35e";

/**
 * Quantum Configuration Dialog with Sidebar Navigation
 * True two-column layout: Left sidebar for tabs, Right for content
 */
export class QuantumConfig extends (HandlebarsApplicationMixin ? HandlebarsApplicationMixin(ApplicationV2) : ApplicationV2) {
  static get DEFAULT_OPTIONS() {
    return {
      id: "quantum-config",
      tag: "form",
      classes: ["quantum-config-dialog"],
      window: {
        title: "Quantum Chronicles — Core Configuration",
        icon: "fas fa-atom",
        resizable: true,
        minimizable: true
      },
      position: { width: 1050, height: 700 },
      form: {
        closeOnSubmit: true,
        handler: QuantumConfig.#onCommitChanges
      }
    };
  }

  static PARTS = {
    main: {
      template: "systems/rnk-quantum-d35e/templates/settings/config-main.hbs"
    }
  };

  constructor(options = {}) {
    super(options);
    this.activeTab = "general";
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    
    if (partId === "main") {
      // Build tabs array
      context.tabs = [
        { id: "general", label: "General Settings", icon: "fas fa-cog" },
        { id: "mechanics", label: "Vortex Rules", icon: "fas fa-dna" },
        { id: "debug", label: "Debug Options", icon: "fas fa-bug" }
      ];
      context.activeTab = this.activeTab;
      
      // Build content for active tab
      switch (this.activeTab) {
        case "general":
          context.fields = [
            this.createSettingField("quantumChaos"),
            this.createSettingField("maintenanceEnabled")
          ];
          context.legend = "General Settings";
          context.icon = "fas fa-cog";
          break;
        case "mechanics":
          context.fields = [
            this.createSettingField("vortexInitiative")
          ];
          context.legend = "Vortex Initiative Rules";
          context.icon = "fas fa-dna";
          break;
        case "debug":
          context.fields = [
            this.createSettingField("debugMode")
          ];
          context.legend = "Debug Logging";
          context.icon = "fas fa-bug";
          break;
      }
    }
    
    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    
    // Handle tab switching in sidebar
    const element = this.element;
    if (!element) return;
    
    element.querySelectorAll(".quantum-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        this.activeTab = tab.dataset.tab;
        this.render();
      });
    });
  }

  createSettingField(name) {
    const setting = game.settings.settings.get(`${SYSTEM_ID}.${name}`);
    if (!setting) throw new Error(`Setting \`${SYSTEM_ID}.${name}\` not registered.`);
    
    const value = game.settings.get(SYSTEM_ID, name);
    
    const data = {
      name,
      label: game.i18n.localize(setting.name),
      hint: game.i18n.localize(setting.hint || ""),
      value,
      type: setting.type === Boolean ? "boolean" : 
            setting.type === Number ? "number" : 
            setting.type === String ? "string" : "string"
    };
    
    return data;
  }

  static async #onCommitChanges(event, form, formData) {
    let requiresClientReload = false;
    let requiresWorldReload = false;
    
    const formObject = foundry.utils.expandObject(formData.object);
    
    for (const [key, value] of Object.entries(formObject)) {
      const setting = game.settings.settings.get(`${SYSTEM_ID}.${key}`);
      if (!setting) continue;
      
      let convertedValue = value;
      if (setting.type === Boolean) {
        convertedValue = value === "on" || value === true || value === "true";
      } else if (setting.type === Number) {
        convertedValue = parseFloat(value);
      }
      
      await game.settings.set(SYSTEM_ID, key, convertedValue);
      requiresClientReload ||= (setting.scope !== "world") && setting.requiresReload;
      requiresWorldReload ||= (setting.scope === "world") && setting.requiresReload;
    }
    
    ui.notifications.info("Quantum State Synchronized.");
    
    if (requiresClientReload || requiresWorldReload) {
      return SettingsConfig.reloadConfirm({ world: requiresWorldReload });
    }
  }
}

