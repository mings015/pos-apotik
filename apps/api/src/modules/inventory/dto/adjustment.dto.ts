import { IsString, IsInt, IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'

export class AdjustmentDto {
  @IsString()
  productId!: string

  @Type(() => Number)
  @IsInt()
  quantity!: number  // signed: positive = tambah, negative = kurang

  @IsString()
  @IsNotEmpty()
  notes!: string  // wajib ada alasan
}
