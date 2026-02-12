// RNK-Quantum D35E Settings - Quantum Configuration
// Innovative: Settings with dynamic quantum states
import { QuantumConfig } from "./apps/QuantumConfig.js";

export const SYSTEM_ID = "rnk-quantum-d35e";

export function registerSystemSettings() {
  // Register Modern V13 Menu
  game.settings.registerMenu(SYSTEM_ID, "quantum_config", {
    name: "Quantum Configuration",
    label: "Launch Vortex Controls",
    hint: "Access the modern system engine configuration.",
    icon: "fas fa-atom",
    type: QuantumConfig,
    restricted: true
  });

  game.settings.register(SYSTEM_ID, "debugMode", {
    name: "Debug Mode",
    hint: "Enable debug logging for quantum operations",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(SYSTEM_ID, "systemVersion", {
    name: "System Version",
    scope: "world",
    config: false,
    type: String,
    default: "1.0.0"
  });

  game.settings.register(SYSTEM_ID, "quantumChaos", {
    name: "Quantum Chaos Level",
    hint: "Adjust chaos factor for random events",
    scope: "world",
    config: true,
    type: Number,
    default: 0.5,
    range: { min: 0, max: 1, step: 0.1 }
  });

  game.settings.register(SYSTEM_ID, "maintenanceEnabled", {
    name: "Item Maintenance",
    hint: "Toggle item degradation tracking",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(SYSTEM_ID, "vortexInitiative", {
    name: "Vortex Initiative",
    hint: "Toggle specialized initiative system",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}
