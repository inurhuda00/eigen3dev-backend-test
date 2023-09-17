import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BorrowedBook } from './borrowed-book.entity'; // Impor entitas BorrowedBook

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  stock: number;

  @ManyToMany(() => BorrowedBook, (borrowedBook) => borrowedBook.book, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  borrowedBooks: BorrowedBook[];
}
