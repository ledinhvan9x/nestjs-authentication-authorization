import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
  })
  roleEntities: Role[];

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpires: Date;
}
