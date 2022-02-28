import * as uuid from 'uuid';
import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UserInfo } from './UserInfo';

@Injectable()
export class UsersService {
  constructor(private emailService: EmailService) {}

  async createUser(name: string, email: string, password: string) {
    await this.checkUserExists(email);

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
  private checkUserExists(email: string) {
    return false;
  }

  // TODO: DB 연동 후 구현
  private saveUser(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
  ) {
    return;
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerfication(email, signupVerifyToken);
  }
}