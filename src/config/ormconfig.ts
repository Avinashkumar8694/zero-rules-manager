import { DataSource } from 'typeorm';
import { RuleCategory } from '../models/RuleCategory';
import { RuleVersion } from '../models/RuleVersion';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'zero',
  password: process.env.DB_PASSWORD || 'zero',
  database: process.env.DB_NAME || 'rules_manager',
  synchronize: true,
  logging: false,
  entities: [RuleCategory, RuleVersion],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});