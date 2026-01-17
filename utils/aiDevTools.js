import fs from 'fs';

const safeStringify = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch (err) {
    return `[Unserializable: ${err.message}]`;
  }
};

const ai_log = (var_name, value, remark = '') => {
  const logPath = `${process.cwd()}/aiDev.txt`;
  const timestamp = new Date().toISOString();
  const name = var_name || 'variable';
  const remarkText = remark ? `Remark: ${remark}\n` : '';
  const content = safeStringify(value);
  const logLine = `\n[${timestamp}] ${name}:\n${remarkText}${content}\n`;

  try {
    fs.appendFileSync(logPath, logLine);
  } catch (err) {
    console.warn('Failed to write aiDev.txt:', err.message);
  }
};

export { ai_log };
