import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { InvoicesController } from './invoices.controller';
import { InvoiceTemplateService } from './invoice-template.service';
import { InvoiceRendererService } from './invoice-renderer.service';
import { ReportEngineClient } from './report-engine-client.service';
import { CalculationEngineService } from '../billing/calculation-engine.service';
import { TariffCalculationService } from '../billing/tariff-calculation.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [InvoicesController],
  providers: [InvoiceTemplateService, InvoiceRendererService, ReportEngineClient, CalculationEngineService, TariffCalculationService],
  exports: [InvoiceTemplateService, InvoiceRendererService, ReportEngineClient, CalculationEngineService, TariffCalculationService],
})
export class InvoicesModule {}
