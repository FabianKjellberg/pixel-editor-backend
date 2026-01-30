export function generateSessionToken(bytes: number = 32): string {
    const arr = new Uint8Array(bytes)
    crypto.getRandomValues(arr)

    // base64url encode
    let b64 = btoa(String.fromCharCode(...arr))
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function hex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hashSessionToken(token: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const sig = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(token)
    )

    return hex(sig) // store this in DB
}