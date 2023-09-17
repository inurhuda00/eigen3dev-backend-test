import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { BorrowBook } from '../dto/borrow-book.dto';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { MemberService } from './member.service';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get()
  findAll() {
    return this.memberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.memberService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.memberService.remove(id);
  }

  @Get(':id/books')
  findBorrowedBook(@Param('id') id: number) {
    return this.memberService.findBorrowedBookById(id);
  }

  @Post(':id/books')
  borrowBook(@Param('id') id: number, @Body() book: BorrowBook) {
    return this.memberService.borrowABook(id, book.code);
  }

  @Put(':id/books')
  backBook(@Param('id') id: number, @Body() book: BorrowBook) {
    return this.memberService.returnBook(id, book.code);
  }
}
