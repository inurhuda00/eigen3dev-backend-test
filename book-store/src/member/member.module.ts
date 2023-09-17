import { Book } from '@/entities/book.entity';
import { BorrowedBook } from '@/entities/borrowed-book.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../entities/member.entity';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Book, BorrowedBook])],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
