import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MeterResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  serialNumber!: string;

  @ApiProperty({ enum: ['electricity', 'water_main', 'water_child', 'solar', 'gas', 'chilled_water', 'outdoor_unit'] })
  meterType!: string;

  @ApiProperty()
  brand!: string;

  @ApiProperty()
  model!: string;

  @ApiPropertyOptional()
  phaseType?: string;

  @ApiPropertyOptional()
  ampRating?: string;

  @ApiPropertyOptional()
  diameter?: string;

  @ApiPropertyOptional()
  solarEnabled?: boolean;

  @ApiProperty({
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
  status!: string;

  @ApiProperty({ format: 'date-time' })
  installationDate!: Date;

  @ApiProperty({ format: 'date-time' })
  activationDate!: Date;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  terminationDate!: Date | null;

  @ApiProperty({ format: 'uuid' })
  projectId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  locationId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  parentMainMeterId!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
