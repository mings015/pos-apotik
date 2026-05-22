import { Controller, Get, UseGuards } from '@nestjs/common'
import { RolesService } from './roles.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  async findAll() {
    const data = await this.rolesService.findAll()
    return { success: true, message: 'Daftar role berhasil diambil', data }
  }
}
