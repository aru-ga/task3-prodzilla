import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

async function writeLog(message: string): Promise<void> {
  const logsDir = path.join(__dirname, '../logs');
  await fs.mkdir(logsDir, { recursive: true }); 
  
  const date = new Date();
  const timestamp = `${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}_${date.getMonth() + 1}_${date.getDate()}_${date.getFullYear()}`;
  const logFile = path.join(logsDir, `${timestamp}.log`);
  const logMessage = `[${date.toISOString()}] ${message}\n`;
  
  await fs.appendFile(logFile, logMessage, 'utf8');
}

async function encryptFile(filePath: string, password: string): Promise<void> {
  try {
    await writeLog(`Mulai mengenkripsi file ${filePath}`);

    const data = await fs.readFile(filePath, 'utf8');
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
    const pwChecker = Buffer.from('ENCRYPTED::');
    const encrypted = Buffer.concat([pwChecker, cipher.update(data), cipher.final()]);

    const encryptedFilePath = `${filePath}_encrypted`;
    await fs.writeFile(encryptedFilePath, Buffer.concat([iv, encrypted]));
    await writeLog(`Berhasil mengenkripsi file ${filePath}`);

    console.log(`File '${path.basename(filePath)}' berhasil dienkripsi menjadi '${path.basename(encryptedFilePath)}'`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    await writeLog(`Error ketika mengenkripsi file: ${(err as Error).message}`);
  }
}

async function decryptFile(filePath: string, password: string): Promise<void> {
  try {
    await writeLog(`Mulai mendekripsi file ${filePath}`);

    const encryptedData = await fs.readFile(filePath);
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = encryptedData.subarray(0, 16);
    const encryptedContent = encryptedData.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);

    const decrypted = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);

    const pwChecker = 'ENCRYPTED::';
    const pwCheckerLength = Buffer.from(pwChecker).length;
    const decryptedPwChecker = decrypted.subarray(0, pwCheckerLength).toString();

    if (decryptedPwChecker !== pwChecker) {
      throw new Error('Password yang dimasukkan salah');
    }

    const decryptedFilePath = filePath.replace('_encrypted', '');
    const decryptedContent = decrypted.subarray(pwCheckerLength);

    await fs.writeFile(decryptedFilePath, decryptedContent, 'utf8');
    await writeLog(`Berhasil mendekripsi file ${filePath}`);

    console.log(`File '${path.basename(filePath)}' berhasil didekripsi menjadi '${path.basename(decryptedFilePath)}'`);
  } catch (err) {
    const error = err as Error;

    if (error.message === 'Password yang dimasukkan salah') {
      console.error('Error: Password yang dimasukkan salah');
      await writeLog(`Error ketika mendekripsi file: Password yang dimasukkan salah`);
    } else {
      console.error(`Error: ${error.message}`);
      await writeLog(`Error ketika mendekripsi file: ${error.message}`);
    }
  }
}

const [,, command, filePath, password] = process.argv;

if (!command || !filePath || !password) {
  console.error('Usage: ts-node index.ts <encrypt|decrypt> <file-path> <password>');
  process.exit(1);
}

const fullPath = path.resolve(filePath);

(async () => {
  if (command === 'encrypt') {
    await encryptFile(fullPath, password);
  } else if (command === 'decrypt') {
    await decryptFile(fullPath, password);
  } else {
    console.error('Invalid command. Use "encrypt" or "decrypt".');
  }
})();
