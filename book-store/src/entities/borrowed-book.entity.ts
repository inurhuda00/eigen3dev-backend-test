import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Book } from './book.entity';
import { Member } from './member.entity';

@Entity()
export class BorrowedBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  borrow_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  return_date: Date;

  @ManyToOne(() => Member, (member) => member.borrowedBooks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member?: Member;

  @ManyToOne(() => Book, (book) => book.borrowedBooks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book?: Book;
}
