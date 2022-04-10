const toCamelCasing = (arr) => {
  let result = arr.map((w) => {
    let replaced = {};
    for (const item in w) {
      const camelCaseText = item.replace(/([-_][a-z])/gi, ($1) =>
        $1.toUpperCase().replace("_", "")
      );
      replaced[camelCaseText] = w[item];
    }
    return replaced;
  });
  return result;
};

module.exports = toCamelCasing;
