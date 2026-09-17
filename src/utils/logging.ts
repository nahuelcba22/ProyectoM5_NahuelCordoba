const redactToken = (msg: string): string => {
  if (typeof msg !== 'string') return msg;
  return msg.replace(/(ghp|github_pat)_[a-zA-Z0-9_]+/g, '***REDACTED_TOKEN***');
};

const formatMessage = (level: string, msg: string) => {

  return `[${level}] ${redactToken(msg)}`;
};

export const logger = {
  info: (msg: string) => console.error(formatMessage('INFO', msg)),
  warn: (msg: string) => console.error(formatMessage('WARN', msg)),
  error: (msg: string, err?: any) => {
    if (err) {
      const errMsg = err instanceof Error ? redactToken(err.message) : err;
      console.error(formatMessage('ERROR', msg), errMsg);
    } else {
      console.error(formatMessage('ERROR', msg));
    }
  }
};