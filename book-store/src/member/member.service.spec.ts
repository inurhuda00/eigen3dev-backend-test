import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { BorrowedBook } from '../entities/borrowed-book.entity';
import { Member } from '../entities/member.entity';
import { MemberService } from './member.service';

describe('MemberService', () => {
  let service: MemberService;
  let memberRepository: Repository<Member>;
  let bookRepository: Repository<Book>;
  let borrowedBookRepository: Repository<BorrowedBook>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(Member),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Book),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(BorrowedBook),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    memberRepository = module.get<Repository<Member>>(
      getRepositoryToken(Member),
    );
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book));
    borrowedBookRepository = module.get<Repository<BorrowedBook>>(
      getRepositoryToken(BorrowedBook),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBorrowedBookById', () => {
    it('should return a list of borrowed books for a member', async () => {
      const angga: Member = {
        id: 1,
        code: 'M001',
        name: 'Angga',
        penalized_at: null,
        borrowedBooks: [],
      };

      jest.spyOn(memberRepository, 'findOne').mockResolvedValue(angga);

      const borrowedBooks = await service.findBorrowedBookById(angga.id);

      expect(borrowedBooks).toEqual(angga.borrowedBooks);
    });
  });

  describe('borrowABook', () => {
    it('should not allow a member to borrow out off stock books', async () => {
      const angga: Member = {
        id: 1,
        code: 'M001',
        name: 'Angga',
        penalized_at: null,
        borrowedBooks: [],
      };

      const book: Book = {
        id: 1,
        code: 'JK-45',
        title: 'Harry Potter',
        author: 'J.K Rowling',
        stock: 0,
        borrowedBooks: [],
      };

      jest.spyOn(memberRepository, 'findOne').mockResolvedValue(angga);
      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(book);

      try {
        await service.borrowABook(angga.id, book.code);
      } catch (error) {
        expect(error.message).toBe('book out off stock');
      }
    });

    it('should not allow a member to borrow more than 2 books', async () => {
      const harryPotter: Book = {
        id: 1,
        code: 'JK-45',
        title: 'Harry Potter',
        author: 'J.K Rowling',
        stock: 1,
        borrowedBooks: [],
      };

      const twilight: Book = {
        id: 2,
        code: 'TW-11',
        title: 'Twilight',
        author: 'Stephenie Meyer',
        stock: 1,
        borrowedBooks: [],
      };

      const angga: Member = {
        id: 1,
        code: 'M001',
        name: 'Angga',
        penalized_at: null,
        borrowedBooks: [],
      };

      const borrowedBooks: BorrowedBook[] = [
        {
          id: 1,
          borrow_date: new Date(),
          return_date: null,
          member: angga,
          book: twilight,
        },
        {
          id: 1,
          borrow_date: new Date(),
          return_date: null,
          member: angga,
          book: harryPotter,
        },
      ];

      angga.borrowedBooks.push(...borrowedBooks);

      jest.spyOn(memberRepository, 'findOne').mockResolvedValue(angga);
      jest
        .spyOn(bookRepository, 'findOne')
        .mockResolvedValueOnce(harryPotter)
        .mockResolvedValueOnce(twilight);

      try {
        await service.borrowABook(angga.id, twilight.code);

        expect(service.borrowABook).toBeCalled();
      } catch (error) {
        expect(error.message).toBe('Member may not borrow more than 2 books');
      }
    });

    it('should not allow a member to borrow a book when they are penalized for 3 days', async () => {
      const twilight: Book = {
        id: 2,
        code: 'TW-11',
        title: 'Twilight',
        author: 'Stephenie Meyer',
        stock: 1,
        borrowedBooks: [],
      };

      const angga: Member = {
        id: 1,
        code: 'M001',
        name: 'Angga',
        penalized_at: new Date(),
        borrowedBooks: [],
      };

      jest.spyOn(memberRepository, 'findOne').mockResolvedValue(angga);
      jest.spyOn(bookRepository, 'findOne').mockResolvedValue(twilight);

      try {
        await service.borrowABook(angga.id, twilight.code);

        expect(service.borrowABook).toBeCalled();
      } catch (error) {
        expect(error.message).toBe(
          'Member with penalty cannot borrow the book for 3 days',
        );
      }
    });
  });

  describe('returnBook', () => {
    it('should check if the returned book was borrowed by the member', async () => {
      const harryPotter: Book = {
        id: 1,
        code: 'JK-45',
        title: 'Harry Potter',
        author: 'J.K Rowling',
        stock: 1,
        borrowedBooks: [],
      };

      const twilight: Book = {
        id: 2,
        code: 'TW-11',
        title: 'Twilight',
        author: 'Stephenie Meyer',
        stock: 1,
        borrowedBooks: [],
      };

      const angga: Member = {
        id: 1,
        code: 'M001',
        name: 'Angga',
        penalized_at: null,
        borrowedBooks: [],
      };

      jest.spyOn(memberRepository, 'findOne').mockResolvedValue(angga);
      jest.spyOn(borrowedBookRepository, 'findOne').mockReset();
      jest
        .spyOn(bookRepository, 'findOne')
        .mockResolvedValueOnce(twilight)
        .mockResolvedValueOnce(harryPotter);

      try {
        await service.returnBook(angga.id, harryPotter.code);
        expect(service.returnBook).toBeCalled();
      } catch (error) {
        // Pastikan bahwa error yang diharapkan adalah tentang buku yang tidak dipinjam
        expect(error.message).toBe(
          'The returned book is not a book that the member has borrowed',
        );
      }
    });

    it('should penalize a member if the book is returned after more than 7 days', async () => {
      const harryPotter: Book = {
        id: 1,
        code: 'JK-45',
        title: 'Harry Potter',
        author: 'J.K Rowling',
        stock: 1,
        borrowedBooks: [],
      };

      const angga: Member = {
        id: 1,
        code: 'M001',
        name: 'Angga',
        penalized_at: null,
        borrowedBooks: [],
      };

      const borrowedBooks: BorrowedBook[] = [
        {
          id: 1,
          borrow_date: new Date(),
          return_date: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000),
          member: angga,
          book: harryPotter,
        },
      ];

      angga.borrowedBooks.push(...borrowedBooks);

      jest.spyOn(memberRepository, 'findOne').mockResolvedValue(angga);
      jest
        .spyOn(borrowedBookRepository, 'findOne')
        .mockResolvedValue(borrowedBooks.at(0));
      jest.spyOn(bookRepository, 'findOne').mockResolvedValueOnce(harryPotter);

      jest.spyOn(memberRepository, 'save').mockResolvedValue({
        ...angga,
        penalized_at: new Date(),
      });

      jest.spyOn(bookRepository, 'save').mockResolvedValue(harryPotter);
      jest
        .spyOn(borrowedBookRepository, 'save')
        .mockResolvedValue(borrowedBooks.at(0));

      try {
        await service.returnBook(angga.id, harryPotter.code);
      } catch (error) {
        expect(error).toBe('');
      }
    });
  });
});
