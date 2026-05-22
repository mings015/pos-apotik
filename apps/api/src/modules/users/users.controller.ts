import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const data = await this.usersService.findAll(query)
    return { success: true, message: 'Daftar user berhasil diambil', data }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id)
    return { success: true, message: 'User berhasil diambil', data }
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto)
    return { success: true, message: 'User berhasil ditambahkan', data }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.update(id, dto)
    return { success: true, message: 'User berhasil diperbarui', data }
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id)
    return { success: true, message: 'User berhasil dihapus' }
  }
}
