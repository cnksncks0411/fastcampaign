import crypto from 'crypto'

const RAW_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_must_be_32_bytes!!' // Base key

// 키 길이를 32바이트로 보정 (SHA-256 해싱)
const ENCRYPTION_KEY = Buffer.from(RAW_KEY).length === 32
    ? RAW_KEY
    : crypto.createHash('sha256').update(RAW_KEY).digest()

const IV_LENGTH = 16 // For AES, this is always 16

export function encrypt(text: string): string {
    if (!text) return ''
    try {
        const iv = crypto.randomBytes(IV_LENGTH)
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
        let encrypted = cipher.update(text)
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex')
    } catch (e) {
        console.error('Crypto encrypt error:', e)
        return ''
    }
}

export function decrypt(text: string): string {
    if (!text) return ''
    try {
        const textParts = text.split(':')
        const iv = Buffer.from(textParts.shift()!, 'hex')
        const encryptedText = Buffer.from(textParts.join(':'), 'hex')
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
        let decrypted = decipher.update(encryptedText)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        return decrypted.toString()
    } catch (error) {
        console.error('Decryption failed:', error)
        return ''
    }
}

// 검색 및 중복 방지를 위한 결정적 해시 생성 (HMAC-SHA256)
export function hashPhone(phone: string): string {
    if (!phone) return ''
    // 전화번호 정규화 (하이픈 제거)
    const cleanPhone = phone.replace(/-/g, '').trim()
    return crypto.createHmac('sha256', ENCRYPTION_KEY)
        .update(cleanPhone)
        .digest('hex')
}
