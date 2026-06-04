import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class ImportProductRowDto {
  @IsString()
  code!: string

  @IsString()
  name!: string

  @IsString()
  categoryName!: string

  @IsString()
  unitName!: string

  @IsOptional()
  @IsString()
  supplierName?: string

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
  @IsNumber()
  @Min(0)
  stock?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumStock?: number

  @IsOptional()
  @IsString()
  barcode?: string

  @IsOptional()
  @IsString()
  description?: string
}

export class ImportProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportProductRowDto)
  rows!: ImportProductRowDto[]
}
