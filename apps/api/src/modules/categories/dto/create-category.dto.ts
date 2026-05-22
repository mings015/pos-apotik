import { IsString, IsOptional, MinLength } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @MinLength(2, { message: 'Nama kategori minimal 2 karakter' })
  name!: string

  @IsOptional()
  @IsString()
  description?: string
}
