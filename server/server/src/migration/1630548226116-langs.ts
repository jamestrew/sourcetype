import { MigrationInterface, QueryRunner } from "typeorm";

export class langs1630548226116 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into language (name, ext) values ('typescript', 'ts');
      insert into language (name, ext) values ('typescriptreact', 'tsx');
      insert into language (name, ext) values ('python', 'py');
      insert into language (name, ext) values ('javascript', 'js');
      insert into language (name, ext) values ('javascriptreact', 'jsx');
      insert into language (name, ext) values ('c++', 'cpp');
      insert into language (name, ext) values ('go', 'go');
      insert into language (name, ext) values ('php', 'php');
      insert into language (name, ext) values ('c', 'c');
      insert into language (name, ext) values ('c#', 'cs');
      insert into language (name, ext) values ('java', 'java');
      insert into language (name, ext) values ('kotlin', 'kt');
      insert into language (name, ext) values ('html', 'html');
      insert into language (name, ext) values ('swift', 'swift');
      insert into language (name, ext) values ('rust', 'rs');
      insert into language (name, ext) values ('haskel', 'hs');
      insert into language (name, ext) values ('sql', 'sql');
      insert into language (name, ext) values ('ruby', 'rb');
      insert into language (name, ext) values ('lua', 'lua');
      insert into language (name, ext) values ('elixir', 'ex');
      insert into language (name, ext) values ('scala', 'scala');
      insert into language (name, ext) values ('perl', 'pl');
      insert into language (name, ext) values ('rust', 'rs');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
