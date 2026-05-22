import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { RolesModule } from './modules/roles/roles.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { UnitsModule } from './modules/units/units.module'
import { SuppliersModule } from './modules/suppliers/suppliers.module'
import { ProductsModule } from './modules/products/products.module'
import { SettingsModule } from './modules/settings/settings.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
