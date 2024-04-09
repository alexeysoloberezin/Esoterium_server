import * as path from "path";
import * as fs from "fs";

function logError(error) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] Ошибка: ${error.message}\n`;

  const logFilePath = path.join(__dirname, 'error.log');

  fs.appendFile(logFilePath, message, (err) => {
    if (err) {
      console.error('Ошибка при записи в файл лога:', err);
    }
  });
}

export default logError;