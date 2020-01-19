import { AstObject } from "json-to-ast";
import { getBlockName, getEntity } from "../../utils";
import { SIZES } from "../../constants";


export const warning = (node: AstObject) => {
  const ERRORS: any = [];
  getEntity(node, (e) => ERRORS.push(...(check(e)) || []), "warning");


  return ERRORS || [];
};

export const check = (node: AstObject, ) => {
  const ERRORS: any = [];
  let state: any = { location: node.loc };

  getEntity(node, (e) => ERRORS.push(TEXT_SIZES_SHOULD_BE_EQUAL(e, state)), "text");
  getEntity(node, (e) => ERRORS.push(INVALID_BUTTON_SIZE(e, state)), "button");

  getEntity(node, (e) => { state.placeholder = e; ERRORS.push(INVALID_PLACEHOLDER_SIZE(e, state)); }, "placeholder");
  getEntity(node, (e) => ERRORS.push(INVALID_BUTTON_POSITION(e, state)), "button");

  return ERRORS || [];
};


export const TEXT_SIZES_SHOULD_BE_EQUAL = (node: AstObject, state?: any) => {
  const { children } = node;
  const mods = children.find(child => child.key.value === 'mods');

  let size: any = mods && mods.value.type === "Object" && mods.value.children.find(
    child =>
      child.key.value === 'size'
  );
  if (!size) {
    return;
  }


  size = size.value.value;
  state.size = state.size || size;

  const { start, end } = state.location;
  if (state.size !== size) {
    return {
      code: 'warningTextSizesShouldBeEqual',
      error: 'Тексты в блоке warning должны быть одного размера',
      location: {
        start: { column: start.column, line: start.line, offset: start.offset },
        end: { column: end.column, line: end.line, offset: end.offset }
      }
    };
  }
};

export const INVALID_BUTTON_SIZE = (node: AstObject, state?: any) => {
  if (!state.size) {
    return;
  }

  const { children } = node;
  const mods = children.find(child => child.key.value === 'mods');

  let size: any = mods && mods.value.type === "Object" && mods.value.children.find(
    child =>
      child.key.value === 'size'
  );

  if (!size) {
    return;
  }

  size = size.value.value;

  const index = SIZES.indexOf(state.size);
  if (index === -1 && index === SIZES.length - 1) { return; }
  if (size !== SIZES[index + 1]) {
    const { start, end } = node.loc;
    return {
      code: 'warningInvalidButtonSize',
      error: 'Размер кнопки блока warning должен быть на 1 шаг больше эталонного',
      location: {
        start: { column: start.column, line: start.line, offset: start.offset },
        end: { column: end.column, line: end.line, offset: end.offset }
      }
    };
  }
};

export const INVALID_BUTTON_POSITION = (node: AstObject, state?: any) => {
  if (!state.placeholder) {
    return;
  }

  const { start, end } = node.loc;
  const placeholderLoc = state.placeholder.loc;

  if (placeholderLoc.start.line > start.line) {
    return {
      code: 'warningInvalidButtonPosition',
      error: 'Блок button в блоке warning не может находиться перед блоком placeholder на том же или более глубоком уровне вложенности',
      location: {
        start: { column: start.column, line: start.line, offset: start.offset },
        end: { column: end.column, line: end.line, offset: end.offset }
      }
    };
  }
};

export const INVALID_PLACEHOLDER_SIZE = (node: AstObject, state?: any) => {
  const { children } = node;
  state.placeholder = node;
  const mods = children.find(child => child.key.value === 'mods');

  let size: any = mods && mods.value.type === "Object" && mods.value.children.find(
    child =>
      child.key.value === 'size'
  );

  if (!size) {
    return;
  }

  size = size.value.value;
  const SIZES = [
    "s",
    "m",
    "l",
  ];

  if (!SIZES.find(item => item === size)) {
    const { start, end } = node.loc;
    return {
      code: 'warningInvalidPlaceholderSize',
      error: 'Допустимые размеры для блока placeholder в блоке warning: s, m, l',
      location: {
        start: { column: start.column, line: start.line, offset: start.offset },
        end: { column: end.column, line: end.line, offset: end.offset }
      }
    };
  }
};