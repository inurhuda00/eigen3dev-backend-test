import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { Book } from '../entities/book.entity';
import { BorrowedBook } from '../entities/borrowed-book.entity';
import { Member } from '../entities/member.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(BorrowedBook)
    private borrowedBookRepository: Repository<BorrowedBook>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const createdMember = this.memberRepository.create(createMemberDto);
    return this.memberRepository.save(createdMember);
  }

  async findAll(): Promise<Member[]> {
    const members = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.borrowedBooks', 'borrowedBooks')
      .leftJoinAndSelect('borrowedBooks.book', 'book')
      .loadRelationCountAndMap('member.borrowedCount', 'member.borrowedBooks')
      .getMany();

    return members;
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: {
        borrowedBooks: {
          book: true,
          member: true,
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  async findBook(code: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { code },
      relations: { borrowedBooks: true },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const existsMember = await this.findOne(id);
    const updateMember = { ...existsMember, ...updateMemberDto };
    return this.memberRepository.save(updateMember);
  }

  async remove(id: number) {
    const existsMember = await this.findOne(id);
    await this.memberRepository.delete(existsMember);
  }

  async findBorrowedBookById(memberId: number): Promise<any[]> {
    const member = await this.findOne(memberId);

    return member.borrowedBooks.map((borrowed) => {
      return {
        code: borrowed.book.code,
        title: borrowed.book.title,
        author: borrowed.book.author,
        stock: borrowed.book.stock,
      };
    });
  }

  async borrowABook(memberId: number, bookCode: string): Promise<void> {
    const member = await this.findOne(memberId);
    const book = await this.findBook(bookCode);

    // check book stock
    if (book.stock <= 0) {
      throw new UnprocessableEntityException('book out off stock');
    }

    if (member.penalized_at) {
      const penaltyEndDate = new Date(
        member.penalized_at.getTime() + 3 * 24 * 60 * 60 * 1000,
      );

      if (penaltyEndDate.getTime() > member.penalized_at.getTime()) {
        throw new BadRequestException(
          'Member with penalty cannot borrow the book for 3 days',
        );
      }
      member.penalized_at = null;
      await this.memberRepository.save(member);
    }

    if (member.borrowedBooks.length >= 2) {
      throw new BadRequestException('Member may not borrow more than 2 books');
    }

    if (
      member.borrowedBooks.some(
        (borrowedBook) => borrowedBook.book.code === bookCode,
      )
    ) {
      throw new BadRequestException('Member already borrowed this book');
    }

    const borrowedBook = new BorrowedBook();
    borrowedBook.member = member;
    borrowedBook.book = book;

    const result = await this.borrowedBookRepository.save(borrowedBook);

    member.borrowedBooks.push(result);
    // decrease stock
    book.borrowedBooks.push(result);
    book.stock -= 1;

    await this.memberRepository.save(member);
    await this.bookRepository.save(book);
  }

  async returnBook(memberId: number, bookCode: string): Promise<void> {
    // check member exists
    await this.findOne(memberId);
    // check book exists
    await this.findBook(bookCode);

    // Cari buku yang dipinjam oleh anggota
    const borrowedBook = await this.borrowedBookRepository.findOne({
      where: {
        return_date: IsNull(),
        book: { code: bookCode },
      },
      relations: {
        member: {
          borrowedBooks: true,
        },
        book: {
          borrowedBooks: true,
        },
      },
    });

    console.log(borrowedBook);
    if (!borrowedBook) {
      throw new BadRequestException(
        'The returned book is not a book that the member has borrowed',
      );
    }

    const member = borrowedBook.member;
    const book = borrowedBook.book;

    const returnDate = new Date();
    const dueDate = borrowedBook.borrow_date;
    const daysLate = Math.floor(
      (returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysLate >= 7) {
      member.penalized_at = new Date();
      await this.memberRepository.save(member);
    }

    // set return date
    borrowedBook.return_date = returnDate;
    book.stock += 1;

    // hapus dari member
    const memberIndex = member.borrowedBooks.findIndex(
      (memberBorrow) => memberBorrow.id === borrowedBook.id,
    );

    if (memberIndex !== -1) {
      member.borrowedBooks.splice(memberIndex, 1);
      await this.memberRepository.save(member);
    }
    // hapus dari book
    const bookIndex = book.borrowedBooks.findIndex(
      (bookBorrow) => bookBorrow.id === borrowedBook.id,
    );
    if (bookIndex !== -1) {
      book.borrowedBooks.splice(bookIndex, 1);
      await this.bookRepository.save(book);
    }

    await this.borrowedBookRepository.save(borrowedBook);
  }
}
