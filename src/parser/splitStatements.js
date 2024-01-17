function splitStatements(code) {
  let lines = code.split(/\r?\n/);
  let isInTemplate = false;
  let listLevel = 0;
  const statements = [];

  for (const line of lines) {
    let isMethod = line.trim()[0] === ".";
    if (isInTemplate || listLevel > 0 || isMethod) {
      statements[statements.length - 1] += "\n" + line;
    } else {
      if (line.trim().length) statements.push(line);
    }

    const openParentheses = (line.match(/(?<!\\)\(/g) || []).length;
    const closedParentheses = (line.match(/(?<!\\)\)/g) || []).length;
    listLevel += openParentheses - closedParentheses;

    if ((line.match(/(?<!\\)`/g) || []).length % 2 === 1) {
      isInTemplate = !isInTemplate;
    }
  }

  let errors = staticStatementChecks(statements);
  if (isInTemplate) errors.push("Unclosed Template: ( ` ) expected");
  if (listLevel > 0) errors.push("Unclosed List: ) expected");
  if (errors.length) throw new Error(errors.join("\n"));

  return statements;
}

const staticStatementChecks = (statements) => {
  let errors = [];

  for (let statement of statements) {
    checkBrackets(statement, errors);

    let chunks = statement.split("`");
    let isInTemplate = false;
    for (let chunk of chunks) {
      if (isInTemplate) checkBrackets(chunk, errors);
      isInTemplate = !isInTemplate;
    }
  }

  return errors;
};

let checkBrackets = (str, errors) => {
  let openBrackets = (str.match(/[^\\]?\{/g) || []).length;
  let closeBrackets = (str.match(/[^\\]?\}/g) || []).length;
  if (openBrackets > closeBrackets) errors.push(" ( } ) expected");
  if (openBrackets < closeBrackets) errors.push(" ( } ) unexpected");
};

module.exports = { splitStatements };
