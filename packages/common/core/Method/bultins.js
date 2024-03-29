const { globSync } = require("glob");
const { TokenType } = require("../Token/types");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const { Method, ArityType } = require("./types");
const { VariableContext, VariableType } = require("../Variable/types");
const { bultinsConstants } = require("./consts");

const camelToSnake = (str) => {
  return str
    .split(/([A-Z][a-z]*)/)
    .filter((s) => s)
    .map((s) => s.toLowerCase())
    .join("_");
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
    set: (ctx, [value]) => {
      if (!ctx.subject.variable)
        throw new TypeError("set can only be used on a variable");
      ctx.subject.variable.value = value;
      return value;
    },
  },
  File: {
    write: (ctx, [filename, content]) => {
      // need to abstract arity errors
      if (!content || !filename) console.error("Method Requires Two arguments");
      let filePath = path.resolve(ctx.output || ctx.root, filename);
      // console.info("Writing to: " + filePath);
      // console.info("Content: " + content.slice(0, 100) + "...");
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeFileSync(filePath, content, "utf-8");
      return content || "";
    },
    read: (ctx, [filename]) => {
      // need to abstract arity errors
      if (!filename) console.error("Method Requires an argument");
      console.log("ctx.root ", path.resolve(ctx.root, filename));
      let filePath = path.resolve(ctx.root, filename);
      let content = fs.readFileSync(filePath, "utf-8");
      return content || "";
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
  Cmd: {
    // run in scope
    run: (ctx, [code], params) => {
      try {
        let newCtx = ctx.newChildContext(params);
        newCtx.pushCode(code);
        newCtx.tokenizeCode();
        let result = newCtx.exec() || "";
        return result;
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    shell: (ctx, [code]) => {
      try {
        let result = "";
        let bytes = execSync(code, (err, stdout, stderr) => {
          if (err) throw e;
          if (stdout) result = stdout;
          if (stderr) throw new Error(stderr);
          else return "";
        });
        if (bytes?.length) {
          result = new TextDecoder().decode(bytes);
        }
        return result;
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    eval_js: (ctx, [code]) => {
      let result = eval(code);
      return result + "";
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
  map: (ctx, [code]) => {
    let resCtx = new VariableContext(VariableType.LIST, "$result", [], ["$4"]);
    ctx.subject.children.forEach((item, index) => {
      let itCtx = new VariableContext(VariableType.PARAM, "$item", item, [
        "$1",
      ]);
      let inCtx = new VariableContext(
        VariableType.PARAM,
        "$index",
        index + "",
        ["$2"]
      );
      let subVar = ctx.subject.variable;
      let params = [
        new VariableContext(subVar.type, "$subject", subVar.value, [
          ...ctx.subject.variable.alias,
          "$3",
        ]),
        resCtx,
        itCtx,
        inCtx,
      ];
      let runResult = Builtins.Cmd.run(ctx, [code], params);
      resCtx.value.push(runResult);
    });
    return resCtx.value;
  },
  filter_regex: (ctx, [reg]) => {
    let regex = new RegExp(reg);
    result = ctx.subject.children.filter((child) => regex.test(child));
    return result;
  },
  filter_out_regex: (ctx, [reg]) => {
    let regex = new RegExp(reg);
    result = ctx.subject.children.filter((child) => !regex.test(child));
    return result;
  },
};

/** @type {{locales: Object.<string, Method>}} */
const BuiltinMethods = Object.keys(bultinsConstants).flatMap((statc) => {
  let methodsOnStaticDict = bultinsConstants[statc];
  let methodNames = Object.keys(methodsOnStaticDict);
  let methodsWithImpl = methodNames.map((name) => {
    let meth = methodsOnStaticDict[name];
    let impl = Builtins?.[statc]?.[name];
    if (!impl)
      throw new Error(
        `Missing Implementation in Builtins for ${statc}.${name}`
      );
    return new Method(
      name,
      statc,
      meth.returnType,
      impl,
      meth.ArityType,
      meth.arity
    );
  });
  return methodsWithImpl;
});

// [
//   new Method(
//     "run",
//     Statics.Cmd,
//     Statics.STRING,
//     Builtins.Cmd.run,
//     ArityType.SINGLE,
//     1
//   ),
//   new Method(
//     "shell",
//     Statics.Cmd,
//     Statics.STRING,
//     Builtins.Cmd.shell,
//     ArityType.SINGLE,
//     1
//   ),
//   new Method(
//     "glob",
//     Statics.FILE,
//     Statics.LIST,
//     Builtins.File.glob,
//     ArityType.SINGLE,
//     1
//   ),
//   new Method(
//     "write",
//     Statics.FILE,
//     Statics.STRING,
//     Builtins.File.write,
//     ArityType.STRICT,
//     2
//   ),
//   new Method(
//     "read",
//     Statics.FILE,
//     Statics.STRING,
//     Builtins.File.read,
//     ArityType.STRICT,
//     1
//   ),
//   new Method(
//     "filter_regex",
//     Statics.LIST,
//     Statics.LIST,
//     Builtins.List.filter_regex,
//     ArityType.SINGLE
//   ),
//   new Method(
//     "filter_out_regex",
//     Statics.LIST,
//     Statics.LIST,
//     Builtins.List.filter_out_regex,
//     ArityType.SINGLE
//   ),
//   new Method(
//     "join",
//     Statics.LIST,
//     Statics.STRING,
//     Builtins.List.join,
//     ArityType.LIST
//   ),
//   new Method(
//     "join_regex",
//     Statics.LIST,
//     Statics.STRING,
//     Builtins.List.join_regex,
//     ArityType.LIST
//   ),

//   ...jsTranslatedStrToStrMethodNames.map(
//     (jsName) =>
//       new Method(
//         camelToSnake(jsName),
//         Statics.STRING,
//         Statics.STRING,
//         Builtins.String[camelToSnake(jsName)],
//         // will have some zeros
//         jsTranslatedStrToStrMethods[jsName].arityType,
//         jsTranslatedStrToStrMethods[jsName].arity
//       )
//   ),
//   ...jsRegexStrToStr.map(
//     (jsName) =>
//       new Method(
//         toRegexName(camelToSnake(jsName)),
//         Statics.STRING,
//         Statics.STRING,
//         Builtins.String[toRegexName(camelToSnake(jsName))],
//         // will have some zeros
//         jsTranslatedStrToStrMethods[jsName].arityType,
//         jsTranslatedStrToStrMethods[jsName].arity
//       )
//   ),

//   new Method(
//     "set",
//     Statics.STRING,
//     Statics.STRING,
//     Builtins.String.set,
//     ArityType.SINGLE,
//     1,
//     true
//   ),

//   // include all string methods as mappers on list
//   // include all string methods as mappers on list

//   ...Object.keys(Builtins.String).map(
//     (snakeName) =>
//       new Method(
//         snakeName,
//         Statics.LIST,
//         Statics.LIST,
//         Builtins.List[snakeName],
//         Builtins.String[snakeName].arityType,
//         Builtins.String[snakeName].arity
//       )
//   ),

//   new Method(
//     "map",
//     Statics.LIST,
//     Statics.LIST,
//     Builtins.List.map,
//     ArityType.SINGLE,
//     1,
//     true
//   ),
// ];

module.exports = {
  Method,
  Builtins,
  BuiltinMethods,
  // snakeCaseStrToStr,
};
