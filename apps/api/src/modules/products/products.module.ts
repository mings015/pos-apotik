import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  imports: [MulterModule.register({ dest: './uploads/products' })],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
