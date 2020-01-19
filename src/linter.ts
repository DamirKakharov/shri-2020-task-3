import * as jsonToAst from "json-to-ast";

import { warning, header, grid, reference } from "./rules";

export type JsonAST = jsonToAst.AstJsonEntity | undefined;

export interface LinterProblem<TKey> {
  key: TKey;
  loc: jsonToAst.AstLocation;
}

export function makeLint<TProblemKey>(json: string): LinterProblem<TProblemKey>[] {

  function parseJson(json: string): JsonAST {
    return jsonToAst(json);
  }

  const errors: LinterProblem<TProblemKey>[] = [];
  const ast: JsonAST = parseJson(json);

  if (ast && ast.type === "Object") {

    let errorsLint = [];
    errorsLint.push(...warning(ast) || []);
    errorsLint.push(...header(ast) || []);
    errorsLint.push(...grid(ast) || []);
    errorsLint.push(...reference(ast) || []);
    errorsLint = errorsLint.filter(Boolean);
    console.log(errorsLint);
    errorsLint = errorsLint.map(item => ({
      key: item.code,
      loc: item.location
    }));
    errors.push(...errorsLint);
  }

  return errors;
}
