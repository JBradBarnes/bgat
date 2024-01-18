const VariableType = {
  LIST: "list",
  PARAM: "param",
  CONST: "const",
  BUFFER: "buf",
};
class VariableContext {
  constructor(typ, name, value = "") {
    this.type = typ;
    this.name = name;
    this.value = value || (typ === VariableType.LIST ? [] : "");
  }
}

module.exports = {
  VariableContext,
  VariableType,
};
