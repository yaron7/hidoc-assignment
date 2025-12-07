import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';

export class CreatePhysicianDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  @IsString()
  @MinLength(10) // Enforce strong passwords
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password too weak. Must contain upper, lower, number, and special char.',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  medicalLicenseId: string; // Critical domain field
}
