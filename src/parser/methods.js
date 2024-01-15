const { globSync } = require("glob");
const { Types } = require("./tokenizeCommand");

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
   */
  constructor(name, bindType, returnType, impl, mutable = true, arity = 0) {
    this.name = name;
    this.bindType = bindType;
    this.returnType = returnType;
    this.arity = arity;
    this.impl = impl;
  }
}

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
