import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column('simple-array')
  roles: string[];

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpires: Date;
}
