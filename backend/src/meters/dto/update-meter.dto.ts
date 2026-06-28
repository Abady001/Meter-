import { IsString, IsUUID, IsDateString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMeterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ enum: ['electricity', 'water_main', 'water_child', 'solar', 'gas', 'chilled_water', 'outdoor_unit'] })
  @IsOptional()
  @IsString()
  meterType?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  activationDate?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  projectId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  locationId?: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  parentMainMeterId?: string | null;

  @ApiPropertyOptional({
    enum: [
      'available',
      'assigned',
      'active',
      'offline',
      'faulty',
      'replaced',
      'terminated',
      'retired'
    ]
  })
  @IsOptional()
  @IsEnum([
    'available',
    'assigned',
    'active',
    'offline',
    'faulty',
    'replaced',
    'terminated',
    'retired'
  ] as const)
  status?:
    | 'available'
    | 'assigned'
    | 'active'
    | 'offline'
    | 'faulty'
    | 'replaced'
    | 'terminated'
    | 'retired';
}
