const { globSync } = require("glob");
const { BehaviorTypes: Types, Statics } = require("./tokenizeCommand");
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

const jsTranslatedStrToStrMethodNames = [
  // String.prototype.replace.name(),
  "replace",
  "replaceAll",
];

// const snakeCaseStrToStr = jsTranslatedStrToStrMethodNames.map(camelToSnake);

const strToStr = (name) => (ctx, args) => {
  return (ctx.subject?.text.slice(1, -1) || "")[name](...args);
};
const arrToStr = (name) => {};
const strToArr = (name) => {};
const arrayToArr = (name) => {};

const Builtins = {
  List: {
    join: (ctx, [str]) => {
      return (ctx.subject?.children || []).join(str);
    },
    join_regex: (ctx, [str]) => {
      return (ctx.subject?.children || []).join(new RegExp(str));
    },
  },
  String: {
    replace: (ctx, [str]) => {
      return (ctx.subject?.text || []).replace(str);
    },
    replace_regex: (ctx, [str]) => {
      return (ctx.subject?.text || []).replace(new RegExp(str));
    },
    ...Object.fromEntries(
      jsTranslatedStrToStrMethodNames.map((jsName) => [
        camelToSnake(jsName),
        strToStr(jsName),
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
        1
      )
  ),
];

module.exports = {
  Method,
  Builtins,
  BuiltinMethods,
  // snakeCaseStrToStr,
};
