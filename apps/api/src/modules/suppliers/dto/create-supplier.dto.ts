import { IsString, IsOptional, IsEmail, IsBoolean, MinLength } from 'class-validator'

export class CreateSupplierDto {
  @IsString()
  @MinLength(2, { message: 'Nama supplier minimal 2 karakter' })
  name!: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsEmail({}, { message: 'Email tidak valid' })
  email?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true
}
