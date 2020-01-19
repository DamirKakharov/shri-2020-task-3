import { AstObject, AstArray } from "json-to-ast";
import { getEntity, getNodeByKey } from "../../utils";

export const grid = (node: AstObject) => {
  const ERRORS: any = [];
  let state: any = { location: node.loc };

  getEntity(node, (e) => ERRORS.push(...(TOO_MUCH_MARKETING_BLOCKS(e, state)) || []), "grid");

  return ERRORS;
};

const TOO_MUCH_MARKETING_BLOCKS = (node: AstObject, state?: any) => {
  const ERRORS: any = [];
  let parent;

  getNodeByKey(node, (e, value) => { parent = e; state.mColums = value.value; }, "m-columns");

  if (!parent) {
    return;
  }
  const blocks = node.children.find(item => item.key.value === "content");

  if (blocks !== undefined) {
    getEntity(blocks.value, (e) => ERRORS.push(COMPARE_BLOCK(e, state)), "grid");
  }

  return ERRORS;
};

const COMPARE_BLOCK = (node: AstObject, state?: any) => {
  let blockType;
  let mCol;

  getNodeByKey(node, (e, value) => mCol = value.value, "m-col");

  const blocks = node.children.find(item => item.key.value === "content");
  if (blocks !== undefined) {
    getNodeByKey(blocks.value, (e, value) => { blockType = value.value; }, "block");
  }

  if (!(blockType === "offer" || blockType === "commercial")) {
    return;
  }


  const halfGridPosition = state.mColums % 2 === 0 ? state.mColums / 2 : (state.mColums - 1) / 2;
  const { start, end } = node.loc;

  if (halfGridPosition < Number(mCol)) {
    return {
      code: 'textTooMuchMarketingBlocks',
      error: 'Рекламный блок должен занимать не более половины ',
      location: {
        start: { column: start.column, line: start.line, offset: start.offset },
        end: { column: end.column, line: end.line, offset: end.offset }
      }
    };
  }
};

