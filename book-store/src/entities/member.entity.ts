import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BorrowedBook } from './borrowed-book.entity';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp', nullable: true })
  penalized_at: Date;

  @ManyToMany(() => BorrowedBook, (borrowedBook) => borrowedBook.member, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  borrowedBooks: BorrowedBook[];
}
