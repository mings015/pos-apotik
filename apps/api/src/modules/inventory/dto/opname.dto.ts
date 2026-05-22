import { IsString, IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class OpnameDto {
  @IsString()
  productId!: string

  @Type(() => Number)
  @IsInt()
  @Min(0)
  physicalCount!: number

  @IsOptional()
  @IsString()
  notes?: string
}
