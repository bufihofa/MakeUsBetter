import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string; // Avatar URL for rich notification
}

@Injectable()
export class NotificationService implements OnModuleInit {
    private readonly logger = new Logger(NotificationService.name);
    private isInitialized = false;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        const projectId = this.configService.get('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY');

        if (!projectId || !clientEmail || !privateKey) {
            this.logger.warn('Firebase credentials not configured. Push notifications disabled.');
            return;
        }

        try {
            // Check if already initialized
            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey: privateKey.replace(/\\n/g, '\n'),
                    }),
                });
            }
            this.isInitialized = true;
            this.logger.log('Firebase Admin SDK initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK', error);
        }
    }

    async sendNotification(fcmToken: string, payload: NotificationPayload): Promise<boolean> {
        if (!this.isInitialized) {
            this.logger.warn('Firebase not initialized. Skipping notification.');
            return false;
        }

        try {
            const message: admin.messaging.Message = {
                token: fcmToken,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: { ...payload.data, type: 'call_emotion' },
                android: {
                    priority: 'high',
                    notification: {
                        imageUrl: payload.imageUrl,
                        channelId: 'makeusbetter_high_importance',
                        priority: 'max',
                        defaultSound: true,
                        defaultVibrateTimings: true,
                        visibility: 'public',
                        // specialized flags for full screen intent might be needed here if using data-only messages to trigger local notifications,
                        // but since we rely on the system to wake up, we rely on the high priority channel.
                    },
                },
            };

            const response = await admin.messaging().send(message);
            this.logger.log(`Notification sent successfully: ${response}`);
            return true;
        } catch (error) {
            this.logger.error('Failed to send notification', error);
            return false;
        }
    }

    async sendToMultiple(fcmTokens: string[], payload: NotificationPayload): Promise<void> {
        if (!this.isInitialized || fcmTokens.length === 0) {
            return;
        }

        const messages: admin.messaging.Message[] = fcmTokens.map((token) => ({
            token,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: { ...payload.data, type: 'call_emotion' },
            android: {
                priority: 'high',
                notification: {
                    imageUrl: payload.imageUrl,
                    channelId: 'makeusbetter_high_importance',
                    priority: 'max',
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    visibility: 'public',
                },
            },
        }));

        try {
            const response = await admin.messaging().sendEach(messages);
            this.logger.log(`Sent ${response.successCount}/${fcmTokens.length} notifications`);
        } catch (error) {
            this.logger.error('Failed to send batch notifications', error);
        }
    }
}
