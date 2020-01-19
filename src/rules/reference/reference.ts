import { AstObject } from "json-to-ast";
import { getBlockName, getEntity } from "../../utils";
import { RuleKeys } from "../../configuration";


export const reference = (node: AstObject) => {
  const ERRORS: any = [];
  let state: any = {};


  getEntity(node, (e) => ERRORS.push(BlockNameIsRequired(e)));
  getEntity(node, (e) => ERRORS.push(UppercaseNamesIsForbidden(e)));

  return ERRORS;
};

export const BlockNameIsRequired = (node: AstObject, state?: any) => {

  if (!node.children.some(p => p.key.value === "block")) {
    return {
      code: RuleKeys.BlockNameIsRequired,
      location: node.loc,
      error: 'Same text',
    };
  }

};

export const UppercaseNamesIsForbidden = (node: AstObject, state?: any) => {
  let error: any;
  node.children.forEach(item => {
    if (item.type === "Property" && /^[A-Z]+$/.test(item.key.value)) {
      error = {
        code: RuleKeys.UppercaseNamesIsForbidden,
        location: item.loc,
        error: 'Same text',
      };
    }
  });


  return error;
};

