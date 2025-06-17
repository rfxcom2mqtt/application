import { BridgeInfo } from '../models/shared';
import request from '../utils/request';

/**
 * API client for controller-related operations
 */
export class ControllerApi {
    /**
     * Base endpoint for controller operations
     */
    private readonly baseEndpoint = '/api/bridge';

    /**
     * Get controller information
     * 
     * @returns {Promise<BridgeInfo>} Promise resolving to controller information
     */
    getInfo(): Promise<BridgeInfo> {
        return request<BridgeInfo>(`${this.baseEndpoint}/info`, { 
            method: 'GET' 
        });
    }

    /**
     * Send an action to the controller
     * 
     * @param {string} action - The action to send
     * @returns {Promise<any>} Promise resolving to the action result
     * @throws {Error} If the action is invalid or fails
     */
    sendAction(action: string): Promise<any> {
        if (!action) {
            return Promise.reject(new Error('Action cannot be empty'));
        }
        
        return request(`${this.baseEndpoint}/action`, { 
            method: 'POST', 
            data: { action } 
        });
    }
    
    /**
     * Restart the controller
     * 
     * @returns {Promise<any>} Promise resolving when restart is initiated
     */
    restart(): Promise<any> {
        return this.sendAction('restart');
    }
    
    /**
     * Reset the controller state
     * 
     * @returns {Promise<any>} Promise resolving when state reset is initiated
     */
    resetState(): Promise<any> {
        return this.sendAction('reset_state');
    }
    
    /**
     * Reset devices
     * 
     * @returns {Promise<any>} Promise resolving when devices reset is initiated
     */
    resetDevices(): Promise<any> {
        return this.sendAction('reset_devices');
    }
}

// Create and export a singleton instance
const controllerApi = new ControllerApi();
export default controllerApi;
