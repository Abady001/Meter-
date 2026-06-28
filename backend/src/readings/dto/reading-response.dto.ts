import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReadingSource, ReadingStatus, MeterType } from '@prisma/client';

export class ReadingResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  meterId!: string;

  @ApiProperty()
  meterSerial!: string;

  @ApiProperty({ enum: ['electricity', 'water_main', 'water_child'] })
  meterType!: MeterType;

  @ApiPropertyOptional({ format: 'uuid' })
  customerId?: string;

  @ApiPropertyOptional()
  customerName?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  unitId?: string;

  @ApiPropertyOptional()
  unitNumber?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  projectId?: string;

  @ApiProperty({ type: 'number' })
  previousReading!: number;

  @ApiProperty({ type: 'number' })
  currentReading!: number;

  @ApiProperty({ type: 'number' })
  consumption!: number;

  @ApiProperty()
  readingDate!: string;

  @ApiProperty({ enum: ['manual', 'import', 'automatic'] })
  source!: ReadingSource;

  @ApiProperty({
    enum: ['valid', 'pending_review', 'estimated', 'suspicious', 'corrected', 'rejected']
  })
  status!: ReadingStatus;

  @ApiProperty()
  anomaly!: boolean;

  @ApiProperty()
  enteredBy!: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  projectThresholdProfile?: string | null;
}
