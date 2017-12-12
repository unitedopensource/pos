import crypto from "crypto";

const encryptor = {
    install(Vue, opts) {

        Vue.prototype.$encrypt = function (plaintext, key) {
            const cryptoKey = crypto.createHash('sha256').update(key).digest();
            const json = JSON.stringify(plaintext);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes256', cryptoKey, iv);
            const encryptedJSON = cipher.update(json, 'utf8', 'base64') + cipher.final('base64');
            const result = iv.toString('hex') + encryptedJSON;
            return result;
        }

        Vue.prototype.$decrypt = function (ciphertext, key) {
            const cryptoKey = crypto.createHash('sha256').update(key).digest();
            try {
                const iv = new Buffer(ciphertext.substring(0, 32), 'hex');
                const encryptedJSON = ciphertext.substring(32);
                const decryptor = crypto.createDecipheriv('aes256', cryptoKey, iv);
                const json = decryptor.update(encryptedJSON, 'base64', 'utf8') + decryptor.final('utf8');

                return JSON.parse(json)
            } catch (e) {
                console.error('Exception in decrypt (ignored): %s', e);
                return null
            }
        }
    }
}

export default encryptor;