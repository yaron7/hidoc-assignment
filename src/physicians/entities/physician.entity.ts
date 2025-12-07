import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ObjectId } from 'mongodb';

@Entity('physicians')
export class Physician {
  // @PrimaryGeneratedColumn('uuid')
  // id: string;

  @ObjectIdColumn()
  _id: ObjectId;

  get id(): string {
    return this._id.toString();
  }

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  medicalLicenseId: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  @Exclude()
  hashedRefreshToken: string | null;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
