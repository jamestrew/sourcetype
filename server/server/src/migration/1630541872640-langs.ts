import { MigrationInterface, QueryRunner } from "typeorm";

export class langs1630541872640 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into language (language_name, language_ext) values ('typescript', 'ts');
      insert into language (language_name, language_ext) values ('typescriptreact', 'tsx');
      insert into language (language_name, language_ext) values ('python', 'py');
      insert into language (language_name, language_ext) values ('javascript', 'js');
      insert into language (language_name, language_ext) values ('javascriptreact', 'jsx');
      insert into language (language_name, language_ext) values ('c++', 'cpp');
      insert into language (language_name, language_ext) values ('go', 'go');
      insert into language (language_name, language_ext) values ('php', 'php');
      insert into language (language_name, language_ext) values ('c', 'c');
      insert into language (language_name, language_ext) values ('c#', 'cs');
      insert into language (language_name, language_ext) values ('java', 'java');
      insert into language (language_name, language_ext) values ('kotlin', 'kt');
      insert into language (language_name, language_ext) values ('html', 'html');
      insert into language (language_name, language_ext) values ('swift', 'swift');
      insert into language (language_name, language_ext) values ('rust', 'rs');
      insert into language (language_name, language_ext) values ('haskel', 'hs');
      insert into language (language_name, language_ext) values ('sql', 'sql');
      insert into language (language_name, language_ext) values ('ruby', 'rb');
      insert into language (language_name, language_ext) values ('lua', 'lua');
      insert into language (language_name, language_ext) values ('elixir', 'ex');
      insert into language (language_name, language_ext) values ('scala', 'scala');
      insert into language (language_name, language_ext) values ('perl', 'pl');
      insert into language (language_name, language_ext) values ('rust', 'rs');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
