import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReversePaymentDto {
  @ApiProperty({ description: 'Reason for reversing the payment' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
