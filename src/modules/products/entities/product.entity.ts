import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  image: string;

  @Column()
  categoryId: number;

  @Column({ nullable: true })
  subcategoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'subcategoryId' })
  subcategory: Category;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text')
  description: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  sku: string;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  weight: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}