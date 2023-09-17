import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './book/book.module';
import { Book } from './entities/book.entity';
import { BorrowedBook } from './entities/borrowed-book.entity';
import { Member } from './entities/member.entity';
import { MemberModule } from './member/member.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'book_store',
      entities: [Book, BorrowedBook, Member],
      synchronize: true,
    }),
    BookModule,
    MemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
