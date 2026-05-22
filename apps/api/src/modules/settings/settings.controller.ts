import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async get() {
    const data = await this.settingsService.get()
    return { success: true, message: 'Pengaturan berhasil diambil', data }
  }

  @Patch()
  @Roles('SUPER_ADMIN')
  async update(@Body() dto: UpdateSettingDto) {
    const data = await this.settingsService.update(dto)
    return { success: true, message: 'Pengaturan berhasil disimpan', data }
  }
}
