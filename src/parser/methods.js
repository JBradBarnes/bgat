const { globSync } = require("glob");
const {
  BehaviorTypes: Types,
  Statics,
  TokenType,
} = require("./tokenizeCommand");
const fs = require("fs");
const path = require("path");

/**
 * Represents a method.
 * @class
 */
class Method {
  /**
   * Creates an instance of Method.
   * @param {string} name - The name of the method.
   * @param {Statics} bindType - The bind type.
   * @param {Statics["LIST"] | Statics["STRING"]} returnType - The return type.
   * @param {Function} impl - The implementation function.
   * @param {number} [arity=0] - The arity of the method (optional, default is 0).
   * @param {string} [arityType="strict"] - The arity of the method (optional, default is 0).
   * @param {boolean} [mutable=true] - This changes parent.
   *
   */
  constructor(
    name,
    bindType,
    returnType,
    impl,
    arityType = ArityType.NONE,
    arity = 0,
    mutable = true
  ) {
    this.name = name;
    this.bindType = bindType;
    this.returnType = returnType;
    this.arity = arity;
    this.arityType = arityType;
    this.impl = impl;
  }
}

/**
 * Arity types.
 * @enum {string}
 */
const ArityType = {
  // matching arity required
  STRICT: "strict",
  // all missing are allowed on typecheck
  DEFAULTS: "defaults",
  // any list will work
  LIST: "list",
  // called without list set
  NONE: "none",
  // can be called via string or list set or string
  SINGLE: "single",
};

const camelToSnake = (str) => {
  return str
    .split(/([A-Z][a-z]*)/)
    .filter((s) => s)
    .map((s) => s.toLowerCase())
    .join("_");
};
const snakeToCamel = (str) => {
  return str
    .split(/_([a-z]*)/)
    .filter((s) => s)
    .map((s) => {
      s[0].toUpperCase() + s.slice(1);
    })
    .join("");
};

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
  return (ctx.subject?.text.slice(1, -1) || "")[name](...args) + "";
};

const regexStrToStr =
  (name) =>
  (ctx, [arg1, ...args]) => {
    return (
      (ctx.subject?.text.slice(1, -1) || "")[name](new RegExp(arg1), ...args) +
      ""
    );
  };

const mapperToStringMethod = (name) => (ctx, args) => {
  let result = ctx.subject.children.flatMap((child) => {
    let strSubject = new ParserToken(TokenType.STRING, `"${child}"`);
    return BuiltinMethods.String[name]({ ...ctx, subject: strSubject }, args);
  });
  return result;
};

const arrToStr = (name) => {};
const strToArr = (name) => {};
const arrayToArr = (name) => {};

const Builtins = {
  String: {
    ...Object.fromEntries(
      jsTranslatedStrToStrMethodNames.map((jsName) => [
        camelToSnake(jsName),
        strToStr(jsName),
      ])
    ),
    ...Object.fromEntries(
      jsRegexStrToStr.map((jsName) => [
        toRegexName(camelToSnake(jsName)),
        regexStrToStr(jsName),
      ])
    ),
  },
  File: {
    write: (ctx, [filename, content]) => {
      // need to abstract arity errors
      if (!content || !filename) console.error("Method Requires Two arguments");
      console.log("ctx.root ", path.resolve(ctx.root, filename));
      let filePath = path.resolve(ctx.root, filename);
      fs.writeFileSync(filePath, content);
      return content;
    },
    glob: (ctx, [glob]) => {
      try {
        let files = globSync(glob, {
          ignore: "node_modules/**",
          cwd: ctx.root || undefined,
        });
        console.log("globs", files);
        return files;
      } catch (e) {
        console.error(e.message);
        throw e;
      }
    },
  },
};

Builtins.List = {
  join: (ctx, [str]) => {
    return (ctx.subject?.children || []).join(str);
  },
  join_regex: (ctx, [str]) => {
    return (ctx.subject?.children || []).join(new RegExp(str));
  },
  // include all string methods as mappers on list
  ...Object.fromEntries(
    Object.keys(Builtins.String).map((name) => [
      name,
      mapperToStringMethod(name),
    ])
  ),
};

// /** @type {{locales: Object.<string, Method>}} */
const BuiltinMethods = [
  new Method(
    "glob",
    Statics.FILE,
    Statics.LIST,
    Builtins.File.glob,
    ArityType.SINGLE,
    1
  ),
  new Method(
    "write",
    Statics.FILE,
    Statics.STRING,
    Builtins.File.write,
    ArityType.STRICT,
    2
  ),
  new Method(
    "join",
    Statics.LIST,
    Statics.STRING,
    Builtins.List.join,
    ArityType.LIST
  ),
  new Method(
    "join_regex",
    Statics.LIST,
    Statics.STRING,
    Builtins.List.join_regex,
    ArityType.LIST
  ),

  ...jsTranslatedStrToStrMethodNames.map(
    (jsName) =>
      new Method(
        camelToSnake(jsName),
        Statics.STRING,
        Statics.STRING,
        Builtins.String[camelToSnake(jsName)],
        // will have some zeros
        jsTranslatedStrToStrMethods[jsName].arityType,
        jsTranslatedStrToStrMethods[jsName].arity
      )
  ),
  ...jsRegexStrToStr.map(
    (jsName) =>
      new Method(
        toRegexName(camelToSnake(jsName)),
        Statics.STRING,
        Statics.STRING,
        Builtins.String[toRegexName(camelToSnake(jsName))],
        // will have some zeros
        jsTranslatedStrToStrMethods[jsName].arityType,
        jsTranslatedStrToStrMethods[jsName].arity
      )
  ),

  // include all string methods as mappers on list
  // include all string methods as mappers on list

  ...Object.keys(Builtins.String).map(
    (snakeName) =>
      new Method(
        snakeName,
        Statics.LIST,
        Statics.LIST,
        Builtins.List[snakeName],
        Builtins.String[snakeName].arityType,
        Builtins.String[snakeName].arity
      )
  ),
];

module.exports = {
  Method,
  Builtins,
  BuiltinMethods,
  // snakeCaseStrToStr,
};
