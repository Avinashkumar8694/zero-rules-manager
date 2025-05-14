import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RuleCategory } from './RuleCategory';

@Entity('flow_versions')
export class FlowVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'varchar', length: 50 })
  version!: string;

  @Column({ type: 'boolean', default: false })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  inputColumns?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  outputColumns?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  variables?: Record<string, {
    type: string;
    default: any;
  }>;

  @Column({ type: 'jsonb' })
  flow!: {
    nodes: Array<{
      id: string;
      type: string;
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
        inputs: Record<string, string>;
      } | Array<{
        node: string;
        input: string;
        value: string;
      }>;
      condition?: string;
      transform?: string;
    }>;
  };

  @ManyToOne(() => RuleCategory, category => category.versions)
  @JoinColumn({ name: 'categoryId' })
  category!: RuleCategory;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}