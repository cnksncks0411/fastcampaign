const crypto = require('crypto');

// 기본 키가 32바이트를 초과하므로 32바이트로 잘라서 사용
const rawKey = 'default_secret_key_must_be_32_bytes!!';
const ENCRYPTION_KEY = rawKey.slice(0, 32);
const IV_LENGTH = 16;

function encrypt(text) {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (e) {
        console.error('Encryption error:', e);
        return null;
    }
}

const target = '01012345678';
const result = encrypt(target);
console.log(result);
