const { globSync } = require("glob");
const { BehaviorTypes: Types } = require("./tokenizeCommand");

/**
 * Represents a method.
 * @class
 */
class Method {
  /**
   * Creates an instance of Method.
   * @param {string} name - The name of the method.
   * @param {string} bindType - The bind type.
   * @param {string} returnType - The return type.
   * @param {Function} impl - The implementation function.
   * @param {boolean} [mutable=true] - The implementation function.
   * @param {number} [arity=0] - The arity of the method (optional, default is 0).
   * @param {string} [arityType="strict"] - The arity of the method (optional, default is 0).
   */
  constructor(
    name,
    bindType,
    returnType,
    impl,
    mutable = true,
    arityType = ArityType.NONE,
    arity = 0
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

// /** @type {{locales: Object.<string, Method>}} */
const Builtins = {
  glob: new Method(
    "glob",
    "list",
    "list",
    (ctx, glob) => {
      let files = globSync(glob, {
        ignore: "node_modules/**",
        cwd: ctx.root || undefined,
      });
      ctx.subject.push(files);
      return ctx.subject;
    },
    true,
    1
  ),
};

module.exports = {
  Method,
  Builtins,
};
