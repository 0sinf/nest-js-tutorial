import * as uuid from 'uuid';
import { ulid } from 'ulid';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UserInfo } from './UserInfo';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(name: string, email: string, password: string) {
    const isExist = await this.checkUserExists(email);
    if (isExist) {
      throw new UnprocessableEntityException(
        '해당 이메일로는 가입할 수 없습니다.',
      );
    }

    const signupVerifyToken = uuid.v1();

    await this.saveUser(name, email, password, signupVerifyToken);
    await this.sendMemberJoinEmail(email, signupVerifyToken);
  }

  async verifyEmail(signupVerifyToken: string): Promise<string> {
    // TODO:
    // 1. DB에서 signupVerifyToken으로 회원 가입 인증 유저인지 확인 후 처리
    // 2. 바로 로그인 상태 되도록 JWT 발급
    throw new Error('Method not implemented');
  }

  async login(email: string, password: string): Promise<string> {
    // TODO:
    // 1. email, password 가진 유저 존재하는지 DB 확인
    // 2. JWT 발급
    throw new Error('Method not implemented');
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    // TODO:
    // 1. userId를 가진 유저가 존재하는지
    // 2. 조회된 데이터를 UserInfo 타입으로 응답
    throw new Error('Method not implemented');
  }

  // TODO: DB 연동 후 구현
  private async checkUserExists(emailAddress: string) {
    const user = await this.usersRepository.findOne({ email: emailAddress });
    return user !== undefined;
  }

  // TODO: DB 연동 후 구현
  private async saveUser(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
  ) {
    const user = new UserEntity();
    user.id = ulid();
    user.name = name;
    user.email = email;
    user.password = password;
    user.signupVerifyToken = signupVerifyToken;
    await this.usersRepository.save(user);
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerfication(email, signupVerifyToken);
  }
}
