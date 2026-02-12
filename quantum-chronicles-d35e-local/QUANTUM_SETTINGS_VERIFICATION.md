# Quantum Chronicles Settings Dashboard - Verification Guide

## Summary of Changes

### Files Modified:
1. **module/settings.js** - Changed all 5 settings from `config: true` to `config: false`
2. **module/apps/QuantumConfig.js** - Enhanced with form submission handler and range value display
3. **templates/settings/quantum-config.hbs** - Wrapped content in `<form>` element for proper submission
4. **dnd35e_css.css** - Contains quantum dashboard styling (already in place)

## System Architecture

```
QuantumConfig (ApplicationV2)
├── Default Options
│   ├── tag: "form" (creates form element)
│   ├── classes: ["quantum-app", "quantum-settings-dashboard"]
│   └── form.handler: onSubmitForm (static method)
├── Template: quantum-config.hbs
│   ├── Header (logo + title)
│   ├── Tabs (General, Mechanics, Debug)
│   ├── Form Fields
│   │   ├── Quantum Chaos Level (range: 0-1)
│   │   ├── System Maintenance (checkbox)
│   │   ├── Vortex Initiative (checkbox)
│   │   └── Debug Mode (checkbox)
│   └── Submit Button
└── Events
    ├── _onRender: Sets up range value display listener
    └── onSubmitForm: Saves settings with type conversion
```

## Form Data Type Handling

The form handler properly converts HTML form data to JavaScript types:

```javascript
// Checkboxes: "on" or undefined → boolean
debugMode = data.debugMode === "on" || data.debugMode === true

// Range inputs: string "0.5" → float
quantumChaos = parseFloat(data.quantumChaos)
```

## How It Works

1. **User opens Game Settings** → Clicks "Launch Vortex Controls" menu
2. **QuantumConfig window opens** with modern dashboard interface
3. **User adjusts settings** (range slides, checkboxes toggle)
4. **Real-time feedback** - range value displays updates as you slide
5. **User clicks "Synchronize Quantum State"** → Form submits
6. **Form handler** converts data types and saves each setting
7. **Success notification** → "Quantum State Synchronized"

## Verification Steps

### Step 1: Hard Refresh Browser
```
Press: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### Step 2: Reload World
- Close and reopen your Quantum Chronicles world in Foundry

### Step 3: Test Settings Menu
1. Open **Game Settings** (gear icon)
2. Look for **"Launch Vortex Controls"** button
3. Settings should NOT appear in the default list anymore (they have `config: false`)
4. Click the button to open the QuantumConfig dashboard

### Step 4: Test Dashboard
1. The dashboard should open with:
   - Cyan/blue thermal theme
   - Pulsating atom icon in header
   - Three tabs: General, Mechanics, Debug
   - All form fields populated with current setting values

### Step 5: Test Form Submission
1. In the General tab, adjust the Quantum Chaos slider
2. Watch the range value update in real-time next to the slider
3. Click "Synchronize Quantum State" button
4. Check browser console (F12 > Console) for:
   ```
   Quantum Chronicles | Setting saved: quantumChaos = 0.5
   ```
5. Check for success notification: "Quantum State Synchronized"

### Step 6: Test Persistence
1. Close the dashboard
2. Reopen "Launch Vortex Controls"
3. Your changed value should still be there

## CSS Classes and Styling

- `.quantum-settings-dashboard` - Main container with thermal gradient background
- `.sheet-tabs` - Tab navigation with cyan highlights
- `.tab.active` - Active tab content
- `.form-group` - Individual setting row
- `.range-value` - Real-time display of range input value
- `.sheet-footer` - Footer with submit button
- `.quantum-logo.pulsate` - Animated pulsating atom icon

## Browser Console Expected Output

### On successful save:
```
Quantum Chronicles | Setting saved: debugMode = false
Quantum Chronicles | Setting saved: quantumChaos = 0.7
Quantum Chronicles | Setting saved: maintenanceEnabled = true
Quantum Chronicles | Setting saved: vortexInitiative = true
```

### If there's an error:
```
Quantum Chronicles | Error saving setting quantumChaos: [error details]
```

## Troubleshooting

### Issue: Settings still appear in default Game Settings list
- **Solution**: Verify `config: false` is set in module/settings.js for all 5 settings
- **Check**: `game.settings.get("rnk-quantum-d35e", "debugMode")`

### Issue: Dashboard opens but fields are empty
- **Solution**: Check `_prepareContext()` method is fetching settings correctly
- **Check**: Open browser console and verify: `game.settings.get("rnk-quantum-d35e", "quantumChaos")`

### Issue: Form submit button doesn't save
- **Solution**: Verify template has `<form>` wrapper around all content
- **Check**: ApplicationV2 option `tag: "form"` must be set

### Issue: Range value doesn't update in real-time
- **Solution**: Check that `.range-value` span exists in template
- **Check**: Browser console for listener attachment: look for element with class "range-value"

## Technical Details

### Setting Configuration
```javascript
game.settings.register(SYSTEM_ID, "quantumChaos", {
  name: "Quantum Chaos Level",
  scope: "world",
  config: false,  // Hidden from default panel
  type: Number,
  default: 0.5,
  // Accessed via custom QuantumConfig dashboard only
});
```

### Form Submission Flow
```
User clicks "Synchronize Quantum State"
  ↓
FormData collected from form elements
  ↓
onSubmitForm called with [event, form, FormDataExtended]
  ↓
Parse form data to JavaScript types
  ↓
Loop through each [key, value] pair
  ↓
game.settings.set(SYSTEM_ID, key, value)
  ↓
Success notification displayed
```

## Support

If settings aren't saving, check:
1. Browser console for errors (F12)
2. Application is set to correct system: `rnk-quantum-d35e`
3. Form element exists in DOM (inspect with F12)
4. Field names match setting keys exactly

