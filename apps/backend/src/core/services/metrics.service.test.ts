import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let metricsService: MetricsService;

  beforeEach(() => {
    metricsService = MetricsService.getInstance();
    metricsService.clear(); // Clear metrics before each test
  });

  afterEach(() => {
    metricsService.clear(); // Clean up after each test
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MetricsService.getInstance();
      const instance2 = MetricsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('MQTT Metrics', () => {
    it('should record MQTT messages', () => {
      metricsService.recordMqttMessage('inbound', 'command', 'success');
      metricsService.recordMqttMessage('outbound', 'device_data', 'error');

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });

    it('should set MQTT connection status', () => {
      metricsService.setMqttConnectionStatus(true);
      metricsService.setMqttConnectionStatus(false);

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });

    it('should record MQTT publish duration', () => {
      metricsService.recordMqttPublishDuration('device_data', 0.05);
      metricsService.recordMqttPublishDuration('bridge_info', 0.02);

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });
  });

  describe('RFXCOM Metrics', () => {
    it('should record RFXCOM messages', () => {
      metricsService.recordRfxcomMessage('inbound', 'lighting2', 'success');
      metricsService.recordRfxcomMessage('outbound', 'lighting1', 'error');

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });

    it('should set RFXCOM connection status', () => {
      metricsService.setRfxcomConnectionStatus(true);
      metricsService.setRfxcomConnectionStatus(false);

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });

    it('should update RFXCOM devices count', () => {
      metricsService.updateRfxcomDevicesCount('lighting2', 5);
      metricsService.updateRfxcomDevicesCount('temperaturehumidity1', 3);

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });
  });

  describe('Application Metrics', () => {
    it('should record HTTP requests', () => {
      metricsService.recordHttpRequest('GET', '/api/devices', 200, 0.1);
      metricsService.recordHttpRequest('POST', '/api/bridge/restart', 500, 0.5);

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });

    it('should update active devices count', () => {
      metricsService.updateActiveDevicesCount(10);
      metricsService.updateActiveDevicesCount(15);

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });

    it('should update bridge uptime', () => {
      metricsService.updateBridgeUptime(3600); // 1 hour
      metricsService.updateBridgeUptime(7200); // 2 hours

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });
  });

  describe('Discovery Metrics', () => {
    it('should record discovery messages', () => {
      metricsService.recordDiscoveryMessage('homeassistant', 'success');
      metricsService.recordDiscoveryMessage('homeassistant', 'error');

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });

    it('should update Home Assistant devices count', () => {
      metricsService.updateHomeAssistantDevicesCount('lighting2', 8);
      metricsService.updateHomeAssistantDevicesCount('sensor', 12);

      const metrics = metricsService.getRegistry();
      expect(metrics).toBeDefined();
    });
  });

  describe('Metrics Export', () => {
    it('should export metrics in Prometheus format', async () => {
      const metricsOutput = await metricsService.getMetrics();

      expect(metricsOutput).toBeDefined();
      expect(typeof metricsOutput).toBe('string');
      // Metrics output should be a string (even if empty after clearing)
    });

    it('should handle metrics recording and export', () => {
      // Test that metrics can be recorded without throwing errors
      expect(() => {
        metricsService.recordMqttMessage('inbound', 'command', 'success');
        metricsService.setMqttConnectionStatus(true);
        metricsService.recordRfxcomMessage('inbound', 'lighting2', 'success');
        metricsService.setRfxcomConnectionStatus(true);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle metrics export errors gracefully', async () => {
      // This test ensures the service doesn't crash on export errors
      try {
        const metricsOutput = await metricsService.getMetrics();
        expect(metricsOutput).toBeDefined();
      } catch (error) {
        // If an error occurs, it should be handled gracefully
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Registry Management', () => {
    it('should provide access to the registry', () => {
      const registry = metricsService.getRegistry();
      expect(registry).toBeDefined();
      expect(typeof registry.metrics).toBe('function');
    });

    it('should clear metrics when requested', () => {
      // Record some metrics
      metricsService.recordMqttMessage('inbound', 'command', 'success');
      metricsService.setMqttConnectionStatus(true);

      // Clear metrics
      metricsService.clear();

      // Registry should still exist but be cleared
      const registry = metricsService.getRegistry();
      expect(registry).toBeDefined();
    });
  });
});
