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
    // Service handles hashing and DB saving
    const physician = await this.physiciansService.create(createPhysicianDto);

    // Architect Note: NEVER return the password or internal salts
    // We rely on Global Interceptors or manual sanitization here
    return {
      id: physician.id,
      email: physician.email,
      message: 'Registration successful. Please log in.',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt')) // Protects route
  async getProfile(@GetCurrentUser('userId') userId: string) {
    // Fetch fresh data from DB to ensure we don't return stale token data
    const physician = await this.physiciansService.findById(userId);

    // Explicit Serialization (Or use ClassSerializerInterceptor)
    // We MUST prevent sending the hashed password or refresh token hash back
    return {
      id: physician.id,
      fullName: physician.fullName,
      email: physician.email,
      medicalLicenseId: physician.medicalLicenseId,
      lastLogin: physician.lastLoginAt,
    };
  }
}
