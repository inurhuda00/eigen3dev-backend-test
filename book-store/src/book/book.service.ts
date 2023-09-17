import { CreateBookDto } from '@/dto/create-book.dto';
import { UpdateBookDto } from '@/dto/update-book.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const createdBook = this.bookRepository.create(createBookDto);
    return this.bookRepository.save(createdBook);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const existingBook = await this.findOne(id);
    const updatedBook = { ...existingBook, ...updateBookDto };
    return this.bookRepository.save(updatedBook);
  }

  async remove(id: number): Promise<void> {
    const existingBook = await this.findOne(id);
    await this.bookRepository.remove(existingBook);
  }
}
