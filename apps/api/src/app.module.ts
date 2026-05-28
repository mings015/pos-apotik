import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { join } from 'path'
import { HealthController } from './common/health/health.controller'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { RolesModule } from './modules/roles/roles.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { UnitsModule } from './modules/units/units.module'
import { SuppliersModule } from './modules/suppliers/suppliers.module'
import { ProductsModule } from './modules/products/products.module'
import { SettingsModule } from './modules/settings/settings.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module'
import { BatchesModule } from './modules/batches/batches.module'
import { SalesModule } from './modules/sales/sales.module'
import { PurchasesModule } from './modules/purchases/purchases.module'
import { GoodsReceivingModule } from './modules/goods-receiving/goods-receiving.module'
import { SupplierInvoicesModule } from './modules/supplier-invoices/supplier-invoices.module'
import { PurchaseReturnsModule } from './modules/purchase-returns/purchase-returns.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { ReportsModule } from './modules/reports/reports.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: 'global', ttl: 60000, limit: 120 }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    UnitsModule,
    SuppliersModule,
    ProductsModule,
    SettingsModule,
    InventoryModule,
    StockMovementsModule,
    BatchesModule,
    SalesModule,
    PurchasesModule,
    GoodsReceivingModule,
    SupplierInvoicesModule,
    PurchaseReturnsModule,
    AnalyticsModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
