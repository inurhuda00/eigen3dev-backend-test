import { CreateBookDto } from '@/dto/create-book.dto';
import { UpdateBookDto } from '@/dto/update-book.dto';
import { Book } from '@/entities/book.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './book.controller';
import { BookService } from './book.service';

describe('BookController', () => {
  let controller: BookController;
  let service: BookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: {
            create: jest.fn().mockReturnValue({}),
            findAll: jest.fn().mockResolvedValue([
              {
                code: 'JK-45',
                title: 'Harry Potter',
                author: 'J.K Rowling',
                stock: 1,
              },
              {
                code: 'SHR-1',
                title: 'A Study in Scarlet',
                author: 'Arthur Conan Doyle',
                stock: 1,
              },
              {
                code: 'TW-11',
                title: 'Twilight',
                author: 'Stephenie Meyer',
                stock: 1,
              },
              {
                code: 'HOB-83',
                title: 'The Hobbit, or There and Back Again',
                author: 'J.R.R. Tolkien',
                stock: 1,
              },
              {
                code: 'NRN-7',
                title: 'The Lion, the Witch and the Wardrobe',
                author: 'C.S. Lewis',
                stock: 1,
              },
            ]),
            findOne: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<BookController>(BookController);
    service = module.get<BookService>(BookService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const createBookDto: CreateBookDto = {
        code: 'JK-45',
        title: 'Harry Potter',
        author: 'J.K Rowling',
        stock: 1,
      };

      const expectedResult = { ...createBookDto, id: 1, borrowedBooks: [] };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      const result = await controller.create(createBookDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const expectedResult = [
        {
          id: 1,
          code: 'JK-45',
          title: 'Harry Potter',
          author: 'J.K Rowling',
          stock: 1,
          borrowedBooks: [],
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a book by ID', async () => {
      const id = 1;
      const expectedResult: Book = {
        id,
        code: 'JK-45',
        title: 'Harry Potter',
        author: 'J.K Rowling',
        stock: 1,
        borrowedBooks: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error for a non-existent book', async () => {
      const id = 999; // Non-existent ID
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined);

      try {
        await controller.findOne(id);
      } catch (error) {
        expect(error.message).toBe('Book with ID 999 not found');
      }
    });
  });

  describe('update', () => {
    it('should update a book by ID', async () => {
      const id = 1;
      const updateBookDto: UpdateBookDto = { title: 'Updated Book Title' };
      const existingBook = {
        id: 1,
        code: 'JK-45',
        title: 'Harry Potter',
        author: 'J.K Rowling',
        stock: 1,
      };
      const updatedBook = {
        ...existingBook,
        ...updateBookDto,
        borrowedBooks: [],
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedBook);

      const result = await controller.update(id, updateBookDto);
      expect(result).toEqual(updatedBook);
    });

    it('should throw an error for a non-existent book', async () => {
      const id = 999; // Non-existent ID
      const updateBookDto: UpdateBookDto = { title: 'Updated Book Title' };
      jest.spyOn(service, 'update').mockResolvedValue(undefined);

      try {
        await controller.update(id, updateBookDto);
      } catch (error) {
        expect(error.message).toBe('Book with ID 999 not found');
      }
    });
  });

  describe('remove', () => {
    it('should remove a book by ID', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove(id);
      expect(result).toBeUndefined();
    });

    it('should throw an error for a non-existent book', async () => {
      const id = 999; // Non-existent ID
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      try {
        await controller.remove(id);
      } catch (error) {
        expect(error.message).toBe('Book with ID 999 not found');
      }
    });
  });
});
