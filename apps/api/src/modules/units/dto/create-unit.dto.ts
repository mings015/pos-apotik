import { IsString, MinLength } from 'class-validator'

export class CreateUnitDto {
  @IsString()
  @MinLength(1, { message: 'Nama satuan wajib diisi' })
  name!: string

  @IsString()
  @MinLength(1, { message: 'Simbol satuan wajib diisi' })
  symbol!: string
}
