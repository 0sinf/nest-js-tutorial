import * as uuid from 'uuid';
import { ulid } from 'ulid';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UserInfo } from './UserInfo';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Connection, Repository } from 'typeorm';
import { AuthService } from './auth.service';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private authService: AuthService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private connection: Connection,
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
    // const isSuccessTransaction = await this.saveUserUsingQueryRunner(
    //   name,
    //   email,
    //   password,
    //   signupVerifyToken,
    // );
    // if (isSuccessTransaction) {}
    await this.sendMemberJoinEmail(email, signupVerifyToken);
  }

  async verifyEmail(signupVerifyToken: string): Promise<string> {
    const user = await this.usersRepository.findOne({ signupVerifyToken });

    if (!user) {
      throw new Error('유저가 존재하지 않습니다.');
    }
    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.usersRepository.findOne({ email, password });

    if (!user) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    // TODO:
    // 1. userId를 가진 유저가 존재하는지
    // 2. 조회된 데이터를 UserInfo 타입으로 응답
    throw new Error('Method not implemented');
  }

  private async checkUserExists(emailAddress: string) {
    const user = await this.usersRepository.findOne({ email: emailAddress });
    return user !== undefined;
  }

  /**
   * 트랜잭션: 요청을 처리하는 과정에서 DB에 변경이 일어나는 요청을 독립적으로 분리하고
   * 에러 발생 시 이전 상태로 되돌리기 위해 제공하는 기능
   *
   * 1. QueryRunner (선택)
   * 2. transaction 객체 이용
   * 3. 데코레이터 @Transaction, @TransactionManager, @TransactionRepository, 사용 (권장 X)
   *
   * 문제는, QueryRunner 클래스를 사용할 경우 롤백 시, 이메일 전송을 막을 수 없음.
   * 어떻게 막아야 할까?
   * 1. return boolean? 성공 시 true, 실패 시 false
   *    true 시 이메일 발송, false 시 이메일 발송 하지 않음
   * 2. Promise chain? 성공 시에 이메일 발송 로직 실행하도록
   */
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
  private async saveUserUsingQueryRunner(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
  ) {
    // QueryRunner
    let isSuccess = false;
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = new UserEntity();
      user.id = ulid();
      user.name = name;
      user.email = email;
      user.password = password;
      user.signupVerifyToken = signupVerifyToken;

      await queryRunner.manager.save(user);
      isSuccess = true;
    } catch (e) {
      // 에러 발생 시 롤백
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      return isSuccess;
    }
  }
  private async saveUserUsingTransaction(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
  ) {
    // transaction 객체 이용
    await this.connection.transaction(async (manager) => {
      const user = new UserEntity();
      user.id = ulid();
      user.name = name;
      user.email = email;
      user.password = password;
      user.signupVerifyToken = signupVerifyToken;

      await manager.save(user);
    });
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerfication(email, signupVerifyToken);
  }
}
