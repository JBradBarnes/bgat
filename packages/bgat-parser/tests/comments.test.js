const { stripComments } = require("../stripComments.js");

test("comments parse out when follows", () => {
  let str = `
  // gone
  stays // gone
  /stays/
  \`
  // stays
  \`
  `;
  let exp = `
  
  stays 
  /stays/
  \`
  // stays
  \`
  `;
  expect(stripComments(str)).toBe(exp);
});
