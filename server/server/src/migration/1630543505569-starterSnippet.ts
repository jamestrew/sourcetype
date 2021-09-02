import { MigrationInterface, QueryRunner } from "typeorm";

const handleKeyPress = `
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (ignoreInputCheck(event.key, sSplitCode, bSplitCode, typed, cursorPos))
      return;

    setCursorPos(
      getCursorMovement(event.key, typed, sSplitCode, bSplitCode, cursorPos)
    );
    setTyped(getNewTyped(event.key, typed));
  };
  `;

const div = `
<div className="grid justify-items-center py-2">
        <input
          id="codeInput"
          data-testid="codeInput"
          ref={focusInputRef}
          tabIndex={0}
          defaultValue={getBareElements(getCurrentTyped(typed))}
          autoComplete="off"
          onKeyPress={handleKeyPress}
          onKeyDown={(e) => e.key === BACKSPACE && handleKeyPress(e)}
          onBlur={handleFocusOut}
          autoFocus
        />
      </div>
  `;

const python = `
def get_all_moves(game, for_white):
    all_moves = []
    for row in game.board:
        for piece in row:
            if isinstance(piece, Null) or piece.is_white != for_white:
                continue
            if (move := piece.get_moves(game)):
                all_moves.extend(move)
    return set(all_moves)
  `;

export class starterSnippet1630543505569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into code ("repoUrl", "lineUrl", snippet, "languageId") values ('https://github.com/trewjames/sourcetype', 'https://github.com/trewjames/sourcetype/blob/43209e81b45c8a1d0b7a740304f0ac3ae24f6c00/src/components/CodeWrapper.tsx#L53', '${handleKeyPress}', 4);
      insert into code ("repoUrl", "lineUrl", snippet, "languageId") values ('https://github.com/trewjames/sourcetype', 'https://github.com/trewjames/sourcetype/blob/43209e81b45c8a1d0b7a740304f0ac3ae24f6c00/src/components/CodeWrapper.tsx#L123', '${div}', 5);
      insert into code ("repoUrl", "lineUrl", snippet, "languageId") values ('https://github.com/trewjames/tdd-chess', 'https://github.com/trewjames/tdd-chess/blob/7aa5c1942627cc93886ffede8e84b65726e44946/chess/engine.py#L93', '${python}', 2);
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
