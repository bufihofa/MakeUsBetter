import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { userApi } from './api';

export const fcmService = {
    async init() {
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) {
            console.log('Push notifications not available on web');
            return;
        }

        try {
            // Request permission
            const permResult = await PushNotifications.requestPermissions();

            if (permResult.receive === 'granted') {
                // Register with FCM
                await PushNotifications.register();
            } else {
                console.log('Push notification permission denied');
            }

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
                // You can dispatch an event or use a state management solution here
                const event = new CustomEvent('emotionReceived', {
                    detail: notification.data
                });
                window.dispatchEvent(event);
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

        } catch (error) {
            console.error('FCM initialization error:', error);
        }
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
