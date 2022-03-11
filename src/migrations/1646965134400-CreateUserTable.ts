import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUserTable1646965134400 implements MigrationInterface {
    name = 'CreateUserTable1646965134400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "User" ("id" character varying NOT NULL, "name" character varying(30) NOT NULL, "email" character varying(60) NOT NULL, "password" character varying(30) NOT NULL, "signupVerifyToken" character varying(60) NOT NULL, CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "User"`);
    }

}
