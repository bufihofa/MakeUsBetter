import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { userApi } from './api';
import storage from './storage';

export const fcmService = {
    async init() {
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) {
            console.log('Push notifications not available on web');
            return;
        }

        // Create high importance channel for Android
        if (Capacitor.getPlatform() === 'android') {
            await PushNotifications.createChannel({
                id: 'makeusbetter_high_importance',
                name: 'High Priority Notifications',
                description: 'Notifications with max priority',
                importance: 5,
                visibility: 1,
                vibration: true,
                lights: true,
                lightColor: '#FF0000'
            });
        }

        // Check user preference first
        if (!storage.getNotificationEnabled()) {
            console.log('Notifications disabled by user preference');
            return;
        }

        try {
            // Check current permission status
            const status = await PushNotifications.checkPermissions();

            if (status.receive === 'granted') {
                // Already granted, just register
                await this.register();
            } else if (status.receive === 'prompt') {
                // Not requested yet, request now (explicit requirement)
                await this.enableNotifications();
            } else {
                console.log('Push notification permission denied previously');
            }

            this.setupListeners();

        } catch (error) {
            console.error('FCM initialization error:', error);
        }
    },

    async checkPermissions() {
        if (!Capacitor.isNativePlatform()) return { receive: 'granted' };
        return await PushNotifications.checkPermissions();
    },

    async enableNotifications() {
        if (!Capacitor.isNativePlatform()) return false;

        storage.setNotificationEnabled(true);
        try {
            const result = await PushNotifications.requestPermissions();
            if (result.receive === 'granted') {
                await this.register();
                return true;
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
        }
        return false;
    },

    async disableNotifications() {
        if (!Capacitor.isNativePlatform()) return;

        storage.setNotificationEnabled(false);
        try {
            await PushNotifications.unregister();
            console.log('Unregistered from push notifications');
        } catch (error) {
            console.error('Error disabling notifications:', error);
        }
    },

    async register() {
        try {
            await PushNotifications.register();
        } catch (e) {
            console.error('Registration failed', e);
        }
    },

    setupListeners() {
        // Clear existing listeners to avoid duplicates if init called multiple times?
        // Note: Capacitor listeners are additive. Ideally we should remove them first or only add once.
        // For simplicity, we assume init is called once per app session or we rely on idempotency if handled carefully.
        // Actually, removing all listeners is safer.
        PushNotifications.removeAllListeners().then(() => {
            // Listen for registration
            PushNotifications.addListener('registration', async (token) => {
                console.log('FCM Token:', token.value);

                // Send token to backend
                try {
                    await userApi.updateFcmToken(token.value);
                    console.log('FCM token sent to backend');
                } catch (error) {
                    console.error('Failed to send FCM token:', error);
                }
            });

            // Listen for registration errors
            PushNotifications.addListener('registrationError', (error) => {
                console.error('Registration error:', error.error);
            });

            // Listen for push notifications received
            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                console.log('Push notification received:', notification);

                // Show in-app notification or update UI
                if (notification.data.type === 'call_emotion') {
                    const event = new CustomEvent('incomingEmotionCall', {
                        detail: notification.data
                    });
                    window.dispatchEvent(event);
                } else {
                    const event = new CustomEvent('emotionReceived', {
                        detail: notification.data
                    });
                    window.dispatchEvent(event);
                }
            });

            // Listen for action performed on push notification
            PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                console.log('Push notification action:', notification);

                // Navigate to relevant screen based on notification data
                const data = notification.notification.data;
                if (data?.type === 'emotion') {
                    window.location.href = '/calendar';
                }
            });
        });
    },

    async getDeliveredNotifications() {
        if (!Capacitor.isNativePlatform()) return [];

        const { notifications } = await PushNotifications.getDeliveredNotifications();
        return notifications;
    },

    async removeAllDeliveredNotifications() {
        if (!Capacitor.isNativePlatform()) return;

        await PushNotifications.removeAllDeliveredNotifications();
    },
};

export default fcmService;
