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

const numpy = `
def restore_func(name):
    if name not in __all__:
        raise ValueError("{} not a dual function.".format(name))
    try:
        val = _restore_dict[name]
    except KeyError:
        return
    else:
        sys._getframe(0).f_globals[name] = val
`;

const typescript = `
function parseEventPort(eventPortStr: string | undefined) {
    const eventPort = eventPortStr === undefined ? undefined : parseInt(eventPortStr);
    return eventPort !== undefined && !isNaN(eventPort) ? eventPort : undefined;
}
`;

const pytorch = `
def _is_from_torch(obj: Any) -> bool:
    module_name = getattr(obj, "__module__", None)
    if module_name is not None:
        base_module = module_name.partition(".")[0]
        return base_module == "torch"

    name = getattr(obj, "__name__", None)
    if name is not None and name != "torch":
        for guess in [torch, torch.nn.functional]:
            if getattr(guess, name, None) is obj:
                return True

    return False
`;

export class testInit1630634349195 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into language (id, name, ext) values (1, 'typescript', 'ts');
      insert into language (id, name, ext) values (2, 'typescriptreact', 'tsx');
      insert into language (id, name, ext) values (3, 'python', 'py');

      insert into code (repo, permalink, tabsize, snippet, language_id) values ('https://github.com/trewjames/sourcetype', 'https://github.com/trewjames/sourcetype/blob/43209e81b45c8a1d0b7a740304f0ac3ae24f6c00/src/components/CodeWrapper.tsx#L53', 2, '${handleKeyPress}', 1);
      insert into code (repo, permalink, tabsize, snippet, language_id) values ('https://github.com/trewjames/sourcetype', 'https://github.com/trewjames/sourcetype/blob/43209e81b45c8a1d0b7a740304f0ac3ae24f6c00/src/components/CodeWrapper.tsx#L123', 2, '${div}', 2);
      insert into code (repo, permalink, tabsize, snippet, language_id) values ('https://github.com/trewjames/tdd-chess', 'https://github.com/trewjames/tdd-chess/blob/7aa5c1942627cc93886ffede8e84b65726e44946/chess/engine.py#L93', 4, '${python}', 3);
      insert into code (repo, permalink, tabsize, snippet, language_id) values ('https://github.com/numpy/numpy', 'https://github.com/numpy/numpy/blob/1fe57b2427e20f466c254ed6a98a014d9a9e574e/numpy/dual.py#L71', 4, '${numpy}', 3);
      insert into code (repo, permalink, tabsize, snippet, language_id) values ('https://github.com/Microsoft/TypeScript', 'https://github.com/microsoft/TypeScript/blob/3488e6e3003c7d17f7461b837ea276a92f4119bc/src/tsserver/nodeServer.ts#L381', 4, '${typescript}', 1);
      insert into code (repo, permalink, tabsize, snippet, language_id) values ('https://github.com/pytorch/pytorch', 'https://github.com/pytorch/pytorch/blob/571a2becf337ae84275fa96300043762387058cf/torch/fx/graph.py#L83', 4, '${pytorch}', 3);
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("delete from code;");
    await queryRunner.query("delete from language;");
  }
}
