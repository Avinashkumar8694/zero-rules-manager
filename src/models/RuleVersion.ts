import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RuleCategory } from './RuleCategory';
import { InputColumnType } from '../types/rule.types';
export type RuleType = 'excel' | 'code' | 'flow';

@Entity('rule_versions')
export class RuleVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'varchar', length: 50 })
  version!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20 })
  type!: RuleType;

  @Column({ type: 'boolean', default: false })
  isActive!: boolean;

  @Column({ type: 'varchar', nullable: true })
  filePath?: string;
  @Column({ type: 'varchar', nullable: true })
  code?: string;

  @Column({ type: 'jsonb', nullable: true })
  inputColumns?: Record<string, {
    type: InputColumnType;
    fileTypes?: string[];
    required?: boolean;
    description?: string;
    validation?: {
      maxSize?: number;
      allowedExtensions?: string[];
      mimeTypes?: string[];
      maxCount?: number;
    };
  }>;

  @Column({ type: 'jsonb', nullable: true })
  outputColumns?: Record<string, {
    name: string;
    type: string;
    formula?: string;  // For Excel-based rules
    code?: string;    // For code-based rules
  }>;

  @Column({ type: 'jsonb', nullable: true })
  variables?: Record<string, {
    type: string;
    default: any;
    description?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  flowConfig?: {
    nodes: Array<{
      id: string;
      type: string;
      position: {
        x: number;
        y: number;
        width?: number;
        height?: number;
      };
      nodeStyle?: 'circle' | 'rectangle'
      config: {
        mode: 'reference' | 'inline';
        version_id?: string;
        excel_file?: string;
        code?: string;
        input_mapping: Record<string, string>;
        output_mapping: Record<string, string>;
        metadata?: {
          name: string;
          description: string;
          tags: string[];
        };
      };
    }>;
    connections: Array<{
      from: {
        node: string;
        outputs: Record<string, string>;
      } | Array<{
        node: string;
        output: string;
      }>;
      to: {
        node: string;
        inputs?: Record<string, string>;
        input?: string;
        value?: string;
      } | Array<{
        node: string;
        input?: string;
        inputs?: Record<string, string>;
        value?: string;
      }>;
      condition?: string;
      transform?: string;
    }>;
    variables?: Record<string, {
      type: string;
      default: any;
    }>;
  };

  get flow() {
    return this.flowConfig;
  }

  @ManyToOne(() => RuleCategory, category => category.versions)
  @JoinColumn({ name: 'categoryId' })
  category!: RuleCategory;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
