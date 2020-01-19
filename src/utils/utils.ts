import { AstObject, AstProperty, AstJsonEntity, AstArray } from "json-to-ast";

export const getBlockName = (ast: AstObject) => {
  const block: any = ast.children.find((item) => (item.key.value === 'block'));
  return block ? block.value.value : undefined;
};


export const getEntity = (ast: AstJsonEntity | AstArray, callBack: (item: any) => void, blockName?: string) => {
  switch (ast.type) {
    case "Array":
      ast.children.forEach((item: AstJsonEntity) => {
        if (item.type === "Object" && item.children.some(i => i.value.type === "Literal" && (i.value.value === blockName || blockName === undefined))) {
          callBack(item);
          return ast;
        }
        else {
          getEntity(item, callBack, blockName);
        }
      });
      break;
    case "Object":
      if (ast.children.some(item => item.value.type === "Literal" && (item.value.value === blockName || blockName === undefined))) {
        callBack(ast);
      }
      ast.children.forEach((property: AstProperty) => {
        getEntity(property.value, callBack, blockName);
      });
      break;
  }
};
export const getNodeByKey = (ast: AstJsonEntity, callBack: (item: any, value?: any, node?: any) => void, blockName: string) => {
  switch (ast.type) {
    case "Array":
      ast.children.forEach((item: AstJsonEntity) => {
        let value: any;
        if (item.type === "Object" && item.children.some(i => i.key.type === "Identifier" && i.key.value === blockName && (value = i.value))) {
          callBack(item, value, ast);
          return { ast, value };
        }
        else {
          getNodeByKey(item, callBack, blockName);
        }
      });
      break;
    case "Object":
      let value: any;
      const temp = ast.children.find(item => item.key.type === "Identifier" && item.key.value === blockName && (value = item.value));

      if (temp) {
        callBack(ast, value);
        return { ast, value };
      }
      ast.children.forEach((property: AstProperty) => {
        getNodeByKey(property.value, callBack, blockName);
      });
      break;
  }
};

export const getNodeByValue = (ast: AstJsonEntity, callBack: (item: any) => void, blockName: string) => {
  switch (ast.type) {
    case "Array":
      ast.children.forEach((item: AstJsonEntity) => {
        if (item.type === "Object" && item.children.some(i => i.key.type === "Identifier" && i.key.value === blockName)) {
          callBack(item);
          return ast;
        }
        else {
          getNodeByKey(item, callBack, blockName);
        }
      });
      break;
    case "Object":
      const temp = ast.children.find(item => item.key.type === "Identifier" && item.key.value === blockName);

      if (temp) {
        callBack(ast);
      }
      ast.children.forEach((property: AstProperty) => {
        getNodeByKey(property.value, callBack, blockName);
      });
      break;
  }
};
