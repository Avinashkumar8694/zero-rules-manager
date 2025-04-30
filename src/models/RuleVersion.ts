import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RuleCategory } from './RuleCategory';

@Entity('rule_versions')
export class RuleVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'varchar', length: 50 })
  version!: string;

  @Column({ type: 'boolean', default: false })
  isActive!: boolean;

  @Column({ type: 'varchar' })
  filePath!: string;

  @Column({ type: 'jsonb', nullable: true })
  inputColumns?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  outputColumns?: Record<string, any>;

  @ManyToOne(() => RuleCategory, category => category.versions)
  @JoinColumn({ name: 'categoryId' })
  category!: RuleCategory;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}