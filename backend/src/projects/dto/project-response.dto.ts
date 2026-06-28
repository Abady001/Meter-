import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['active', 'inactive'] })
  status!: string;

  @ApiPropertyOptional()
  taxEnabled?: boolean;

  @ApiPropertyOptional()
  taxRate?: number | null;

  @ApiPropertyOptional()
  readingThresholdProfileId?: string | null;

  @ApiProperty({ enum: ['billable', 'report_only'] })
  waterDifferenceMode?: string;

  @ApiPropertyOptional()
  areaId?: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
