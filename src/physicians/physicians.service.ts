// src/physicians/physicians.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

import { CreatePhysicianDto } from './dto/create-physician.dto';
import { Physician } from './entities/physician.entity';

@Injectable()
export class PhysiciansService {
  // Observability: Logger initialized with context
  private readonly logger = new Logger(PhysiciansService.name);

  constructor(
    @InjectRepository(Physician)
    private readonly physicianRepository: Repository<Physician>,
  ) {}

  /**
   * Registers a new physician.
   * Handles password hashing and duplicate checks.
   */
  async create(createPhysicianDto: CreatePhysicianDto): Promise<Physician> {
    const { password, ...rest } = createPhysicianDto;

    // 1. Security: Hash password strictly
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Prepare Entity
    const newPhysician = this.physicianRepository.create({
      ...rest,
      password: hashedPassword,
    });

    try {
      // 3. Persist to DB
      const savedPhysician = await this.physicianRepository.save(newPhysician);

      // this.logger.log(`New physician registered: ${savedPhysician.id}`);
      return savedPhysician;
    } catch (error) {
      // 4. Handle Unique Constraints (Error code 23505 in Postgres)
      // if (error.code === '23505') {
      //   this.logger.warn(
      //     `Registration failed: Duplicate entry for ${rest.email} or License`,
      //   );
      //   throw new ConflictException(
      //     'Email or Medical License ID already exists',
      //   );
      // }

      if (error.code === 11000) {
        this.logger.warn(
          `Registration failed: Duplicate entry for ${rest.email} or License`,
        );
        throw new ConflictException(
          'Email or Medical License ID already exists',
        );
      }

      this.logger.error(`Registration error: ${error.message}`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Find generic physician by ID.
   * STRICTLY used for profile retrieval (excludes secrets).
   */
  async findById(id: string): Promise<Physician> {
    //   const physician = await this.physicianRepository.findOne({ where: { id } });
    const physician = await this.physicianRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });

    if (!physician) {
      throw new NotFoundException(`Physician with ID ${id} not found`);
    }

    return physician;
  }

  /**
   * Find by Email.
   * WARNING: Returns the entity WITH password hash.
   * INTENDED USE: Internal Auth flow only.
   */
  async findByEmail(email: string): Promise<Physician | null> {
    return this.physicianRepository.findOne({
      where: { email },
    });
  }

  /**
   * Updates physician data (e.g., Refresh Token Hash).
   */
  async update(id: string, updateData: Partial<Physician>): Promise<void> {
    await this.physicianRepository.update(id, updateData);
  }
}
