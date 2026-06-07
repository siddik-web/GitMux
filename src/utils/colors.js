const enabled = process.env.NO_COLOR !== '1' && process.stdout.isTTY;
const wrap = (code, text) => (enabled ? `\u001b[${code}m${text}\u001b[0m` : text);

export const color = {
  bold: (text) => wrap(1, text),
  dim: (text) => wrap(2, text),
  green: (text) => wrap(32, text),
  yellow: (text) => wrap(33, text),
  red: (text) => wrap(31, text),
  cyan: (text) => wrap(36, text),
  gray: (text) => wrap(90, text)
};

export const symbol = {
  ok: color.green('✓'),
  warn: color.yellow('!'),
  fail: color.red('✗'),
  info: color.cyan('›')
};
