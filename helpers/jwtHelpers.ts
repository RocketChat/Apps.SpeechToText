var {
    createHmac,
} = require('crypto');
// importing buffer to not get undefined error
var { Buffer } = require('buffer')

// function to encode payload data to base64 string
const encodeToBase64 = (data) => {
    const buf = Buffer.from(data, 'utf8');
    var base64WithPadding = buf.toString('base64')
    // Replace characters according to base64url specifications by removing the padding ("+","-","=")
    var base64WithoutPadding = base64WithPadding.replace(/=+$/, "");
    base64WithoutPadding = base64WithoutPadding.replace(/\+/g, "-");
    base64WithoutPadding = base64WithoutPadding.replace(/\//g, "_");
    return base64WithoutPadding
}

// function to create a HmacSHA-256 signature for JWT
const generateSignature = (data, secret) => {
    var hash = createHmac('SHA256', secret).update(data).digest('base64');
    // Replace characters according to base64url specifications by removing the padding ("+","-","=")
    var encodedHash = hash.replace(/=+$/, "");
    encodedHash = encodedHash.replace(/\+/g, "-");
    encodedHash = encodedHash.replace(/\//g, "_");
    return encodedHash

}

export const generateJWT = (header, data, secret) => {
    var d = new Date()

    const payload = {
        "iat": Math.floor(d.getTime() / 1000),
        "nbf": Math.floor(d.getTime() / 1000),
        "exp": Math.floor(d.getTime() / 1000) + 3600,
        "aud": "RocketChat",
        "context": data
    }
    const encodedHeader = encodeToBase64(JSON.stringify(header))
    const encodedPayload = encodeToBase64(JSON.stringify(payload))
    const encodedSignature = generateSignature(`${encodedHeader}.${encodedPayload}`, secret)
    const JWT = `${encodedHeader}.${encodedPayload}.${encodedSignature}`
    return JWT
}


export const getPayload = (jwt) => {
    const splittedToken = jwt.split('.')
    let buf = Buffer.from(splittedToken[1], 'base64');
    let payload = JSON.parse(buf.toString());
    console.log(payload)
    return payload
}
