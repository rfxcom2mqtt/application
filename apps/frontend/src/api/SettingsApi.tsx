import { Settings } from '../models/shared';
import request from '../utils/request';

/**
 * API client for settings-related operations
 */
export class SettingsApi {
    /**
     * Base endpoint for settings operations
     */
    private readonly baseEndpoint = '/api/settings';

    /**
     * Get application settings
     * 
     * @returns {Promise<Settings>} Promise resolving to application settings
     */
    getSettings(): Promise<Settings> {
        return request<Settings>(this.baseEndpoint, { 
            method: 'GET' 
        });
    }

    /**
     * Update application settings
     * 
     * @param {Settings} settings - The settings to update
     * @returns {Promise<Settings>} Promise resolving to the updated settings
     * @throws {Error} If settings are invalid
     */
    updateSettings(settings: Settings): Promise<Settings> {
        if (!settings) {
            return Promise.reject(new Error('Settings cannot be empty'));
        }
        
        // Validate critical settings
        if (settings.mqtt && !settings.mqtt.server) {
            return Promise.reject(new Error('MQTT server cannot be empty'));
        }
        
        if (settings.rfxcom && !settings.rfxcom.usbport) {
            return Promise.reject(new Error('RFXCOM USB port cannot be empty'));
        }
        
        return request<Settings>(this.baseEndpoint, { 
            method: 'POST', 
            data: settings 
        });
    }
    
    /**
     * Update log level setting
     * 
     * @param {string} logLevel - The new log level
     * @returns {Promise<Settings>} Promise resolving to the updated settings
     * @throws {Error} If log level is invalid
     */
    updateLogLevel(logLevel: string): Promise<Settings> {
        if (!logLevel || !['debug', 'info', 'warn', 'error'].includes(logLevel)) {
            return Promise.reject(new Error('Invalid log level'));
        }
        
        return this.getSettings()
            .then(settings => {
                settings.loglevel = logLevel;
                return this.updateSettings(settings);
            });
    }
}

// Create and export a singleton instance
const settingsApi = new SettingsApi();
export default settingsApi;
