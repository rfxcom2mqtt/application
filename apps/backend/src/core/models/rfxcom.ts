export class RfxcomInfo {
  receiverTypeCode: number = 0;
  receiverType: string = "";
  hardwareVersion: string = "";
  firmwareVersion: number = 0;
  firmwareType: string = "";
  enabledProtocols: string[] = [];
}

export interface RfxcomEvent {
  id: string;
  deviceName?: string; // computed value
  subtype: number;
  subTypeValue?: string; // computed value
  seqnbr: number;
  type: string;
  group: boolean;
}

export interface LightingEvent extends RfxcomEvent {
  commandNumber: number;
  command: string;
  rssi: number;
}

export interface Lighting1Event extends LightingEvent {
  houseCode: string;
  unitCode: string;
}

export interface Lighting2Event extends LightingEvent {
  unitCode: string;
  level: number;
}

export interface Lighting4Event extends LightingEvent {
  data: string;
  pulseWidth: string;
}

export interface Lighting5Event extends LightingEvent {
  unitCode: string;
  level: string;
}

export interface Lighting6Event extends LightingEvent {
  groupCode: string;
  unitCode: string;
}

export interface ChimeEvent extends RfxcomEvent {
  commandNumber: number;
  command: string;
  rssi: number;
}

export interface FanEvent extends RfxcomEvent {
  commandNumber: number;
  command: string;
  rssi: number;
  state: string;
  co2: string;
}

export interface Blinds1Event extends RfxcomEvent {
  unitCode: number;
  commandNumber: number;
  command: string;
  batteryLevel: number;
  rssi: number;
}

interface EdisioEvent extends RfxcomEvent {
  unitCode: number;
  commandNumber: number;
  command: string;
  level: number;
  colour: string;
  maxRepeat: number;
  repeatCount: number;
  batteryVoltage: number;
  rssi: number;
  extraBytes: string;
}

interface ActivLinkEvent extends RfxcomEvent {
  commandNumber: number;
  command: string;
  alert: string;
  deviceStatus: string;
  batteryLevel: number;
  rssi: number;
}

interface FunkbusEvent extends RfxcomEvent {
  groupCode: string;
  commandNumber: number;
  command: string;
  commandTime: string;
  deviceTypeNumber: number;
  sceneNumber: number;
  channelNumber: number;
  rssi: number;
}

interface HunterfanEvent extends RfxcomEvent {
  commandNumber: number;
  command: string;
  rssi: number;
}

export interface Security1Event extends RfxcomEvent {
  deviceStatus: string;
  tampered: string;
  batteryLevel: string;
  rssi: number;
}

interface Camera1Event extends RfxcomEvent {
  houseCode: string;
  commandNumber: number;
  command: string;
  rssi: number;
}

interface RemoteEvent extends RfxcomEvent {
  houseCode: string;
  commandNumber: number;
  command: string;
  commandType: string;
  rssi: number;
}

interface Blinds2Event extends RfxcomEvent {
  unitCode: string;
  commandNumber: number;
  command: string;
  percent: string;
  angle: string;
  batteryLevel: number;
  rssi: number;
}

interface thermostat1Event extends RfxcomEvent {
  temperature: string;
  setpoint: string;
  modeNumber: number;
  mode: string;
  statusNumber: number;
  status: string;
  rssi: number;
}

interface Thermostat3Event extends RfxcomEvent {
  commandNumber: number;
  command: string;
}

export interface Bbq1Event extends RfxcomEvent {
  temperature: string;
  batteryLevel: number;
  rssi: number;
}

export interface TempEvent extends RfxcomEvent {
  temperature: string;
  batteryLevel: number;
  rssi: number;
}

interface TemprainEvent extends TempEvent {
  rainfall: string;
}

export interface HumidityEvent extends RfxcomEvent {
  humidity: string;
  humidityStatus: string;
  batteryLevel: number;
  rssi: number;
}

export interface TemphumidityEvent extends RfxcomEvent {
  temperature: string;
  humidity: string;
  humidityStatus: string;
  batteryLevel: number;
  rssi: number;
}

export interface TemphumbaroEvent extends TemphumidityEvent {
  barometer: string;
  forecast: string;
}

interface RainEvent extends RfxcomEvent {
  rainfallIncrement?: number;
  rainfall?: number;
  rainfallRate?: number;
  batteryLevel: number;
  rssi: number;
}

interface WindEvent extends RfxcomEvent {
  gustSpeed: string;
  direction?: string;
  averageSpeed?: string;
  temperature?: string;
  chillfactor?: string;
  batteryLevel: number;
  rssi: number;
}

export interface UvEvent extends RfxcomEvent {
  uv: number;
  temperature?: string;
  batteryLevel: number;
  rssi: number;
}

interface DateEvent extends RfxcomEvent {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  weekDay: string;
  batteryLevel: number;
  rssi: number;
}

interface Elec1Event extends RfxcomEvent {
  energy: number;
  count: number;
  current: number;
  batteryLevel: number;
  rssi: number;
}

interface Elec23Event extends RfxcomEvent {
  energy: number;
  count: number;
  power: number;
  batteryLevel: number;
  rssi: number;
}

interface Elec4Event extends RfxcomEvent {
  energy: number;
  count: number;
  current: number;
  batteryLevel: number;
  rssi: number;
}

interface Elec5Event extends RfxcomEvent {
  voltage: number;
  current: number;
  power: number;
  energy: number;
  powerFactor: number;
  frequency: number;
  rssi: number;
}

export interface WeightEvent extends RfxcomEvent {
  weight: number;
  batteryLevel: number;
  rssi: number;
}

interface CartelectronicEvent extends RfxcomEvent {
  identifiantCompteur: string;
  typeContrat: string;
  periodeTarifaireEnCours: string;
  compteur: string[];
  avertissemntJourEJP: string;
  avertissementCouleurAujourdHui: string;
  avertissementCouleurDemain: string;
  puissanceApparenteValide: boolean;
  puissanceApparente: string;
  teleInfoPresente: string;
  tensionMoyenne: string;
  indexTariffaireEnCours: string;
  unknownSubtype: boolean;
  batteryLevel: number;
  rssi: number;
}

interface RfxsensorEvent extends RfxcomEvent {
  message: string;
  rssi: number;
}

interface RfxmeterEvent extends RfxcomEvent {
  counter: number;
  rssi: number;
}

export interface WaterlevelEvent extends RfxcomEvent {
  temperature: string;
  level: number;
  batteryLevel: number;
  rssi: number;
}

interface LightningEvent extends RfxcomEvent {
  status: string;
  distance: string;
  strikes: string;
  batteryLevel: number;
  rssi: number;
  valid: boolean;
}

interface WeatherEvent extends RfxcomEvent {
  temperature: string;
  averageSpeed: number;
  gustSpeed: number;
  rssi: number;
  rainfallIncrement: string;
  // for subtype 0
  direction?: string;
  humidity?: string;
  humidityStatus?: string;
  uv?: string;
  insolation?: string;
  batteryLevel?: string;
}

interface SolarEvent extends RfxcomEvent {
  insolation: string;
  batteryLevel: number;
  rssi: number;
}
