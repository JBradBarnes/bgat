module.exports = function stripComments(str) {
  const regex = /(\/\/[^\n]*)|(`(?:[^`\\]|\\.)*`)/g;

  const result = str.replace(regex, (match, group1, group2) => {
    // If the match is a comment outside template string, replace it with an empty string
    if (group1) {
      return "";
    }
    // If the match is inside a template string, keep it unchanged
    return group2;
  });
  return result;
};
