# @rfxcom2mqtt/shared

Package partagé contenant les types, modèles, schémas de validation et utilitaires communs pour le projet RFXCOM2MQTT.

## Installation

Ce package est automatiquement installé comme dépendance workspace dans les applications backend et frontend.

```bash
# Dans le backend ou frontend
import { DeviceState, validateSettings, DEVICE_TYPES } from '@rfxcom2mqtt/shared';
```

## Structure

```
src/
├── types/           # Interfaces TypeScript
│   ├── common.ts    # Types communs (Action, MQTTMessage, etc.)
│   ├── devices.ts   # Types liés aux devices
│   └── settings.ts  # Types de configuration
├── schemas/         # Schémas de validation Zod
│   ├── common.ts    # Schémas pour types communs
│   ├── devices.ts   # Schémas pour devices
│   └── settings.ts  # Schémas pour configuration
├── models/          # Classes de modèles
│   ├── index.ts     # Classes de base
│   └── DeviceStateStore.ts # Gestionnaire d'état des devices
└── utils/           # Utilitaires
    └── validation.ts # Fonctions de validation
```

## Utilisation

### Types et Interfaces

```typescript
import { 
  Settings, 
  DeviceState, 
  MQTTMessage, 
  Action 
} from '@rfxcom2mqtt/shared';

// Utilisation des types
const settings: Settings = {
  mock: false,
  loglevel: 'info',
  // ...
};

const action: Action = {
  type: 'device',
  action: 'toggle',
  deviceId: '0x123456',
  entityId: 'switch_1'
};
```

### Validation avec Zod

```typescript
import { 
  validateSettings, 
  validateDeviceState, 
  ValidationError 
} from '@rfxcom2mqtt/shared';

try {
  const validatedSettings = validateSettings(rawConfig);
  console.log('Configuration valide:', validatedSettings);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Erreurs de validation:', error.errors);
  }
}
```

### Classes de Modèles

```typescript
import { 
  DeviceStateStore, 
  BridgeInfoClass, 
  ActionClass 
} from '@rfxcom2mqtt/shared';

// Utilisation des classes
const bridgeInfo = new BridgeInfoClass();
const action = new ActionClass('device', 'toggle', '0x123456', 'switch_1');

// Gestionnaire d'état des devices
const deviceStore = new DeviceStateStore(deviceState);
deviceStore.addSensor({
  id: 'temp_1',
  name: 'Temperature Sensor',
  description: 'Room temperature',
  property: 'temperature',
  type: 'sensor'
});
```

### Constantes

```typescript
import { 
  DEVICE_TYPES, 
  BRIDGE_ACTIONS, 
  LOG_LEVELS 
} from '@rfxcom2mqtt/shared';

// Utilisation des constantes
if (deviceType === DEVICE_TYPES.LIGHTING2) {
  // Traitement spécifique pour LIGHTING2
}

await controller.runBridgeAction(BRIDGE_ACTIONS.RESTART);
```

## Validation Avancée

### Validation Sécurisée

```typescript
import { safeValidate, SettingsSchema } from '@rfxcom2mqtt/shared';

const result = safeValidate(SettingsSchema, rawData);
if (result.success) {
  console.log('Données valides:', result.data);
} else {
  console.error('Erreurs:', result.error);
}
```

### Validation Partielle

```typescript
import { validatePartialSettings } from '@rfxcom2mqtt/shared';

// Pour les mises à jour partielles
const partialUpdate = validatePartialSettings({
  loglevel: 'debug',
  mqtt: {
    server: 'localhost'
  }
});
```

### Formatage des Erreurs

```typescript
import { formatValidationErrors } from '@rfxcom2mqtt/shared';

try {
  validateSettings(invalidData);
} catch (error) {
  if (error instanceof ValidationError) {
    const formattedErrors = formatValidationErrors(error.errors);
    formattedErrors.forEach(err => console.error(err));
  }
}
```

## Exemples d'Utilisation

### Backend - Validation de Configuration

```typescript
import { validateSettings, ValidationError } from '@rfxcom2mqtt/shared';

export class ConfigService {
  loadConfig(configPath: string) {
    const rawConfig = this.readConfigFile(configPath);
    
    try {
      return validateSettings(rawConfig);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Configuration invalide: ${error.message}`);
      }
      throw error;
    }
  }
}
```

### Frontend - Gestion des Types

```typescript
import { DeviceState, BridgeInfo } from '@rfxcom2mqtt/shared';

interface DeviceListProps {
  devices: DeviceState[];
  bridgeInfo: BridgeInfo;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, bridgeInfo }) => {
  return (
    <div>
      <h2>Bridge Version: {bridgeInfo.version}</h2>
      {devices.map(device => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </div>
  );
};
```

## Développement

### Build

```bash
cd packages/shared
pnpm build
```

### Tests

```bash
cd packages/shared
pnpm test
```

### Linting

```bash
cd packages/shared
pnpm lint
```

## Migration depuis les Types Locaux

Si vous migrez depuis des types définis localement :

1. Remplacez les imports locaux par les imports du package shared
2. Utilisez les classes avec le suffixe `Class` si nécessaire pour éviter les conflits
3. Adoptez les schémas de validation Zod pour une validation robuste

### Avant

```typescript
import { BridgeInfo } from './models/local';
```

### Après

```typescript
import { BridgeInfo, BridgeInfoClass } from '@rfxcom2mqtt/shared';

// Pour les types
const info: BridgeInfo = { ... };

// Pour les instances de classe
const infoInstance = new BridgeInfoClass();
