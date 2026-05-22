import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  storeName?: string

  @IsOptional()
  @IsString()
  storeLogo?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercentage?: number

  @IsOptional()
  @IsString()
  printerName?: string

  @IsOptional()
  @IsBoolean()
  autoPrint?: boolean
}
