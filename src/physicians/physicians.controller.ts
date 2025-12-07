import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PhysiciansService } from './physicians.service';
import { CreatePhysicianDto } from './dto/create-physician.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';

@Controller('physicians')
@UseGuards(ThrottlerGuard)
export class PhysiciansController {
  constructor(private readonly physiciansService: PhysiciansService) {}

  @Post('register')
  async register(@Body() createPhysicianDto: CreatePhysicianDto) {
    const physician = await this.physiciansService.create(createPhysicianDto);

    return {
      id: physician.id,
      email: physician.email,
      message: 'Registration successful. Please log in.',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@GetCurrentUser('userId') userId: string) {
    const physician = await this.physiciansService.findById(userId);

    return {
      id: physician.id,
      fullName: physician.fullName,
      email: physician.email,
      medicalLicenseId: physician.medicalLicenseId,
      lastLogin: physician.lastLoginAt,
    };
  }
}
