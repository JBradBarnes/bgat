const { ArityType } = require("./types");

const camelToSnake = (str) => {
  return str
    .split(/([A-Z][a-z]*)/)
    .filter((s) => s)
    .map((s) => s.toLowerCase())
    .join("_");
};

/**
 * @typedef {Object} MethodArity
 * @property {Method['arity']} arity - The number of arguments the method accepts.
 * @property {Method['arityType']} arityType - The type of arity, e.g., 'STRICT', 'LIST', 'SINGLE', etc.
 */

const { Statics } = require("../Token/types");

/**
 * @typedef {MethodArity & { returnType: Method['returnType'] }} MethodSignature
 */

/**
 * @typedef {Object.<string, MethodArity>} UnreturnedTypeSet
 */

/**
 * @typedef {Object.<string, MethodSignature>} BuiltinTypeSet
 */

/** @type {BuiltinTypeSet} */
const jsTranslatedStrToStrMethods = {
  replace: { arity: 2, arityType: ArityType.STRICT },
  replaceAll: { arity: 2, arityType: ArityType.STRICT },
  concat: { arityType: ArityType.LIST },
  charAt: { arity: 1, arityType: ArityType.STRICT },
  toLowerCase: { arity: 0, arityType: ArityType.NONE },
  toUpperCase: { arity: 0, arityType: ArityType.NONE },
  index: { arity: 1, arityType: ArityType.STRICT },
  indexOf: { arity: 1, arityType: ArityType.STRICT },
  padEnd: { arity: 1, arityType: ArityType.STRICT },
  repeat: { arity: 1, arityType: ArityType.STRICT },
  slice: { arity: 2, arityType: ArityType.STRICT },
  substr: { arity: 1, arityType: ArityType.STRICT },
  trim: { arity: 0, arityType: ArityType.NONE },
  search: { arity: 1, arityType: ArityType.STRICT },
};

const jsRegexStrToStr = ["replace", "replaceAll", "search"];

const jsTranslatedStrToStrMethodNames = Object.keys(
  jsTranslatedStrToStrMethods
);

const toRegexName = (name) => `regex_${name}`;

const strToStr = (name) => (ctx, args) => {
  return (ctx.subject?.text || "")[name](...args) + "";
};

const regexStrToStr =
  (name) =>
  (ctx, [arg1, ...args]) => {
    return (ctx.subject?.text || "")[name](new RegExp(arg1), ...args) + "";
  };

const mapperToStringMethod = (name) => (ctx, args) => {
  let result = ctx.subject.children.flatMap((child) => {
    let strSubject = new ParserToken(TokenType.STRING, child);
    return BuiltinMethods.String[name]({ ...ctx, subject: strSubject }, args);
  });
  return result;
};

/**
 * @typedef {Object.<Statics, BuiltinTypeSet>} BuiltinConstants
 */

/** @type {BuiltinConstants} */
const bultinsConstants = {
  String: {
    ...Object.fromEntries(
      jsTranslatedStrToStrMethodNames.map((name) => [
        camelToSnake(name),
        {
          ...jsTranslatedStrToStrMethods[name],
          returnType: Statics.STRING,
        },
      ])
    ),
    ...Object.fromEntries(
      jsRegexStrToStr.map((jsName) => [
        toRegexName(camelToSnake(jsName)),
        { ...jsTranslatedStrToStrMethods[jsName], returnType: Statics.STRING },
      ])
    ),
    set: { arity: 1, arityType: ArityType.STRICT },
  },
  List: {
    ...Object.fromEntries(
      jsTranslatedStrToStrMethodNames.map((name) => [
        camelToSnake(name),
        { ...jsTranslatedStrToStrMethods[name], returnType: Statics.STRING },
      ])
    ),
    join: { arity: 1, arityType: ArityType.STRICT, returnType: Statics.STRING },
    join_regex: {
      arity: 1,
      arityType: ArityType.STRICT,
      returnType: Statics.STRING,
    },
    filter_regex: {
      arity: 1,
      arityType: ArityType.STRICT,
      returnType: Statics.LIST,
    },
    filter_out_regex: {
      arity: 1,
      arityType: ArityType.STRICT,
      returnType: Statics.LIST,
    },
    map: {
      arity: 1,
      arityType: ArityType.STRICT,
      returnType: Statics.LIST,
    },
  },
  File: {
    write: {
      arity: 2,
      arityType: ArityType.STRICT,
      returnType: Statics.STRING,
    },
    read: { arity: 1, arityType: ArityType.STRICT, returnType: Statics.STRING },
    glob: { arity: 1, arityType: ArityType.STRICT, returnType: Statics.STRING },
  },
  Cmd: {
    run: { arity: 1, arityType: ArityType.STRICT, returnType: Statics.STRING },
    shell: {
      arity: 1,
      arityType: ArityType.STRICT,
      returnType: Statics.STRING,
    },
    eval_js: {
      arity: 1,
      arityType: ArityType.STRICT,
      returnType: Statics.STRING,
    },
  },
};

module.exports = bultinsConstants;
