import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryMeterDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  projectId?: string;

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
  @IsString()
  search?: string;
}
