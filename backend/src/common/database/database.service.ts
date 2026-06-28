import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor() {
    const schema = process.env.DB_SCHEMA || 'sim_system';
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse',
      application_name: 'meter-verse-backend',
      options: `-c search_path=${schema},public`
    });
  }

  async onModuleInit(): Promise<void> {
    const expectedDatabase = process.env.DB_NAME || 'meter_pulse';
    const expectedSchema = process.env.DB_SCHEMA || 'sim_system';
    const client = await this.pool.connect();
    try {
      const result = await client.query<{
        current_database: string;
        current_schema: string;
      }>('SELECT current_database() AS current_database, current_schema() AS current_schema');

      const row = result.rows[0];
      const dbMatches = row?.current_database === expectedDatabase;
      const schemaMatches = row?.current_schema === expectedSchema;

      if (!dbMatches || !schemaMatches) {
        throw new Error(
          `PostgreSQL target mismatch: expected database=${expectedDatabase}, schema=${expectedSchema}; got database=${row?.current_database}, schema=${row?.current_schema}`
        );
      }

      this.logger.log('PostgreSQL connection validated');
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
