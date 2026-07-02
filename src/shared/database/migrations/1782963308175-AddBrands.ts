import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBrands1782963308175 implements MigrationInterface {
  name = 'AddBrands1782963308175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "brands" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_b0c437120b624da1034a81fc561" DEFAULT NEWSEQUENTIALID(), "created_at" datetime2 NOT NULL CONSTRAINT "DF_1f247307b5b1a85dd981ec8ffc8" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_367e19a7371f10544739c56d1a3" DEFAULT getdate(), "created_by" varchar(100) NOT NULL, "name" varchar(150) NOT NULL, CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" ADD "brand_id" uniqueidentifier`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" ADD CONSTRAINT "FK_f2b1673c6665816ff753e81d1a0" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "models" DROP CONSTRAINT "FK_f2b1673c6665816ff753e81d1a0"`,
    );
    await queryRunner.query(`ALTER TABLE "models" DROP COLUMN "brand_id"`);
    await queryRunner.query(`DROP TABLE "brands"`);
  }
}
