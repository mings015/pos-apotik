import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { QueryProductDto } from './dto/query-product.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

const imageStorage = diskStorage({
  destination: './uploads/products',
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
})

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: QueryProductDto) {
    const data = await this.productsService.findAll(query)
    return { success: true, message: 'Daftar produk berhasil diambil', data }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.productsService.findOne(id)
    return { success: true, message: 'Produk berhasil diambil', data }
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.productsService.create(dto, file?.filename)
    return { success: true, message: 'Produk berhasil ditambahkan', data }
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.productsService.update(id, dto, file?.filename)
    return { success: true, message: 'Produk berhasil diperbarui', data }
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id)
    return { success: true, message: 'Produk berhasil dihapus' }
  }
}
