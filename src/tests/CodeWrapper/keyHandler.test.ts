import { TAB } from "utils/constants";
import createKeyHandler, {
  testing,
} from "../../components/CodeWrapper/keyHandler";
const { KeyHandler, BackspaceHandler, EnterHandler, SpaceHandler } = testing;

const foo = new KeyHandler({});

const sCode = [
  ["if", "(true)", "{"],
  [TAB, "if", "(bar)", "{"],
  [TAB, TAB, "return", "'foo"],
  [TAB, "}"],
  ["}"],
];

const bCode = [];
