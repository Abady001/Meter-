import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppConfigModule } from './common/config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './auth/auth.module';
import { GlobalAuthGuard } from './auth/global-auth.guard';
import { AreaGuard } from './auth/area.guard';
import { AccessContextMiddleware } from './auth/access-context.middleware';
import { UserAccessService } from './auth/user-access.service';
import { ProjectAccessInterceptor } from './common/interceptors/project-access.interceptor';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { WorkersModule } from './common/workers/workers.module';
import { MetersModule } from './meters/meters.module';
import { SimCardsModule } from './sim-cards/sim-cards.module';
import { ProjectsModule } from './projects/projects.module';
import { LocationsModule } from './projects/locations/locations.module';
import { CustomersModule } from './customers/customers.module';
import { DashboardModule } from './projects/dashboard/dashboard.module';
import { ReadingsModule } from './readings/readings.module';
import { WaterBalanceModule } from './readings/water-balance/water-balance.module';
import { BillingModule } from './billing/billing.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DownloadsModule } from './downloads/downloads.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';
import { TicketsModule } from './tickets/tickets.module';
import { SupportModule } from './support/support.module';
import { CollectionsModule } from './collections/collections.module';
import { SearchModule } from './search/search.module';
import { UploadModule } from './upload/upload.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';
import { SolarModule } from './solar/solar.module';
import { SettlementModule } from './settlement/settlement.module';
import { ChilledWaterModule } from './chilled-water/chilled-water.module';
import { GasModule } from './gas/gas.module';
import { AreasModule } from './areas/areas.module';
import { UnitTypesModule } from './unit-types/unit-types.module';
import { RegistrationModule } from './registration/registration.module';
import { AdminModule } from './admin/admin.module';
import { BillCycleModule } from './bill-cycle/bill-cycle.module';
import { WalletModule } from './wallet/wallet.module';
import { KpiModule } from './kpi/kpi.module';
import { SyncModule } from './sync/sync.module';
import { PortalModule } from './portal/portal.module';
import { CorrelationMiddleware } from './common/http/correlation.middleware';


@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    AuditModule,
    IdempotencyModule,
    MetersModule,
    SimCardsModule,
    ProjectsModule,
    LocationsModule,
    CustomersModule,
    DashboardModule,
    ReadingsModule,
    WaterBalanceModule,
    BillingModule,
    PaymentsModule,
    NotificationsModule,
    DownloadsModule,
    InvoicesModule,
    ReportsModule,
    TicketsModule,
    SupportModule,
    SettingsModule,
    CollectionsModule,
    SearchModule,
    UploadModule,
    UsersModule,
    SolarModule,
    SettlementModule,
    ChilledWaterModule,
    GasModule,
    AreasModule,
    UnitTypesModule,
    RegistrationModule,
    AdminModule,
    BillCycleModule,
    WalletModule,
    KpiModule,
    SyncModule,
    WorkersModule,
    PortalModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      inject: [UserAccessService],
      useFactory: (uas: UserAccessService) => new ProjectAccessInterceptor(uas),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: AreaGuard
    },
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
    consumer.apply(AccessContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
