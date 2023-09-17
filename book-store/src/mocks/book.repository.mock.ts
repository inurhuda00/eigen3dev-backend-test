import { Book } from '@/entities/book.entity';
import { Repository } from 'typeorm';

// Buat mock untuk Repository<Book>
export const createMockBookRepository = () => {
  const repository = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    find: jest.fn().mockResolvedValue([
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
    remove: jest.fn().mockResolvedValue({}),
  } as unknown as Repository<Book>;

  return repository;
};
