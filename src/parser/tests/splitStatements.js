//  need to allow multilines for templates later
function splitStatements(code) {
  let lines = code.split(/\r?\n/).filter((str) => !!str.trim());
  let inTemplate = false;
  let inTemplateExpression = false;
  const statements = [];

  for (const line of lines) {
    if (inTemplate) {
      statements[statements.length - 1] += "\n" + line;
    } else {
      statements.push(line);
    }

    // Check if the line contains an odd number of back-ticks (ignoring escaped back-ticks)
    if ((line.match(/[^\\]`/g) || []).length % 2 === 1) {
      inTemplate = !inTemplate;
    }
  }

  let errors = staticStatementChecks(statements);
  if (inTemplate) errors.push("Unclosed Template: ( ` ) expected");
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
