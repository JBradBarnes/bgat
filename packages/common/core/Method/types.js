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
    mutable = false
  ) {
    this.name = name;
    this.bindType = bindType;
    this.returnType = returnType;
    this.arity = arity;
    this.arityType = arityType;
    this.impl = impl;
    this.mutable = mutable;
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

module.exports = {
  Method,
  ArityType,
};
