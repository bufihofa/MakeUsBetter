import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Entities
import { User, Emotion } from './entities';

// Modules
import { PairModule } from './modules/pair/pair.module';
import { EmotionModule } from './modules/emotion/emotion.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuthModule } from './modules/auth/auth.module';

// Strategies
import { JwtStrategy } from './common/strategies/jwt.strategy';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [User, Emotion],
        synchronize: config.get('NODE_ENV') !== 'production', // Auto sync in dev only
        extra: {
          ssl: {
            rejectUnauthorized: false, // Allow self-signed certificates
          },
        },
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    // Auth
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '30d') },
      }),
    }),

    // Feature Modules
    AuthModule,
    NotificationModule,
    PairModule,
    EmotionModule,
    UserModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule { }
