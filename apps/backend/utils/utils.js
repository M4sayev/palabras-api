const stripAnsi = (str) =>
  str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-m]/g,
    "",
  );

module.exports = { stripAnsi };
