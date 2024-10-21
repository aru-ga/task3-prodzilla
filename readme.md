# Node.js File Encryption and Decryption with TypeScript

This Node.js application allows you to securely encrypt and decrypt files using the `crypto` module with TypeScript. The application supports both encryption and decryption operations with password-based key generation, ensuring file confidentiality.

## Features
- **File Encryption**: Encrypt any file by providing its path and a password.
- **File Decryption**: Decrypt an encrypted file by providing the correct password.
- **Logging**: All activities are logged into a timestamped log file.
- **Password Validation**: Detects incorrect passwords during decryption and returns an appropriate error message.

## How to Use

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Execute the Code

#### To Encrypt a File:
```bash
npx ts-node src/index.ts encrypt ./path/to/your_file.txt yourPassword
```

#### To Decrypt a File:
```bash
npx ts-node src/index.ts decrypt ./path/to/your_file_encrypted.txt yourPassword
```

### Step 3: Check the Output

- After encryption, you will find a new file with `_encrypted` appended (suffix) to the original filename.
- After decryption, the original file will be restored from the encrypted file.
- Check the `logs` directory for any log files that capture the operations performed.
