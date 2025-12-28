import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);
    private isConfigured = false;

    constructor(private configService: ConfigService) {
        this.initializeCloudinary();
    }

    private initializeCloudinary() {
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

        if (!cloudName || !apiKey || !apiSecret) {
            this.logger.warn('Cloudinary credentials not configured. Avatar upload disabled.');
            return;
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });

        this.isConfigured = true;
        this.logger.log('Cloudinary configured successfully');
    }

    async uploadImage(file: Express.Multer.File): Promise<string | null> {
        if (!this.isConfigured) {
            this.logger.warn('Cloudinary not configured. Skipping upload.');
            return null;
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'avatars',
                    transformation: [
                        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                        { quality: 'auto', fetch_format: 'auto' },
                    ],
                },
                (error, result: UploadApiResponse | undefined) => {
                    if (error) {
                        this.logger.error('Failed to upload image to Cloudinary', error);
                        reject(error);
                    } else {
                        this.logger.log(`Image uploaded: ${result?.public_id}`);
                        resolve(result?.secure_url || null);
                    }
                },
            );

            // Convert buffer to stream and pipe to Cloudinary
            const readable = new Readable();
            readable.push(file.buffer);
            readable.push(null);
            readable.pipe(uploadStream);
        });
    }

    async deleteImage(publicId: string): Promise<boolean> {
        if (!this.isConfigured) {
            return false;
        }

        try {
            await cloudinary.uploader.destroy(publicId);
            this.logger.log(`Image deleted: ${publicId}`);
            return true;
        } catch (error) {
            this.logger.error('Failed to delete image', error);
            return false;
        }
    }
}
