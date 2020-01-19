import { AstObject } from "json-to-ast";
import { getEntity } from "../../utils";

export const header = (node: AstObject) => {
  const ERRORS: any = [];
  let state: any = { location: node.loc };

  getEntity(node, (e) => ERRORS.push(SEVERAL_H1(e, state)), "text");
  getEntity(node, (e) => ERRORS.push(INVALID_H2_POSITION(e, state)), "text");
  getEntity(node, (e) => ERRORS.push(INVALID_H3_POSITION(e, state)), "text");

  return ERRORS;
};



const SEVERAL_H1 = (node: AstObject, state?: any) => {
  const { children } = node;
  const mods = children.find(child => child.key.value === 'mods');

  let type: any = mods && mods.value.type === "Object" && mods.value.children.find(
    child => child.key.value === 'type'
  );

  if (!type) {
    return;
  }

  type = type.value.value;

  if (type !== "h1") {
    return;
  }

  if (!state.h1) {
    state.h1 = node;
    return;
  }

  const { start, end } = node.loc;
  if (state.h1) {
    return {
      code: 'textSeveralH1',
      error: 'Заголовок первого уровня на странице должен быть единственным',
      location: {
        start: { column: start.column, line: start.line, offset: start.offset },
        end: { column: end.column, line: end.line, offset: end.offset }
      }
    };
  }
};

const INVALID_H2_POSITION = (node: AstObject, state?: any) => {

  const { children } = node;
  const mods = children.find(child => child.key.value === 'mods');

  let type: any = mods && mods.value.type === "Object" && mods.value.children.find(
    child => child.key.value === 'type'
  );

  if (!type) {
    return;
  }

  type = type.value.value;

  if (type !== "h2") {
    return;
  }
  state.h2 = node;

  if (!state.h1) {
    return;
  }

  const { start, end } = node.loc;
  const h1Loc = state.h1.loc;

  if (h1Loc.start.line >= start.line && h1Loc.start.column >= start.column) {
    return {
      code: 'textInvalidH2Position',
      error: 'Заголовок второго уровня не может находиться перед заголовком первого уровня',
      location: {
        start: { column: start.column, line: start.line, offset: start.offset },
        end: { column: end.column, line: end.line, offset: end.offset }
      }
    };
  }
};

const INVALID_H3_POSITION = (node: AstObject, state?: any) => {
  if (!state.h2) {
    return;
  }

  const { children } = node;
  const mods = children.find(child => child.key.value === 'mods');

  let type: any = mods && mods.value.type === "Object" && mods.value.children.find(
    child =>
      child.key.value === 'type'
  );

  if (!type) {
    return;
  }

  type = type.value.value;

  if (type !== "h3") {
    return;
  }

  const { start, end } = node.loc;
  const h2Loc = state.h2.loc;

  if (h2Loc.start.line >= start.line && h2Loc.start.column >= start.column) {
    return {
      code: 'textInvalidH3Position',
      error: 'Заголовок третьего уровня не может находиться перед заголовком второго уровня',
      location: {
        start: { column: start.column, line: start.line, offset: start.offset },
        end: { column: end.column, line: end.line, offset: end.offset }
      }
    };
  }
};

