import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, Min, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'Kode produk minimal 2 karakter' })
  code!: string

  @IsOptional()
  @IsString()
  barcode?: string

  @IsString()
  @MinLength(2, { message: 'Nama produk minimal 2 karakter' })
  name!: string

  @IsString()
  categoryId!: string

  @IsOptional()
  @IsString()
  supplierId?: string

  @IsString()
  unitId!: string

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice!: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice!: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number = 0

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minimumStock?: number = 0

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true
}
