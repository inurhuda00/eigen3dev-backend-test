// create-member.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BorrowBook {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  code: string;
}
