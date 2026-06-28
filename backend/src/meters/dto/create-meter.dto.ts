import { IsString, IsUUID, IsDateString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeterDto {
  @ApiProperty()
  @IsString()
  serialNumber!: string;

  @ApiProperty({ enum: ['electricity', 'water_main', 'water_child', 'solar', 'gas', 'chilled_water', 'outdoor_unit'] })
  @IsEnum(['electricity', 'water_main', 'water_child', 'solar', 'gas', 'chilled_water', 'outdoor_unit'] as const)
  meterType!: 'electricity' | 'water_main' | 'water_child' | 'solar' | 'gas' | 'chilled_water' | 'outdoor_unit';

  @ApiProperty()
  @IsString()
  brand!: string;

  @ApiProperty()
  @IsString()
  model!: string;

  @ApiPropertyOptional({ enum: ['1PH', '3PH'] })
  @IsOptional()
  @IsString()
  phaseType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ampRating?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diameter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  solarEnabled?: boolean;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  installationDate!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  activationDate!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all')
  projectId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  locationId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  parentMainMeterId?: string;
}
