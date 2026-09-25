const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "22.04.0"]
    })

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode("201104710667")
                console.log(`\n\n================\nكود الربط: ${code}\n================\n`)
            } catch (e) { console.log("خطأ في طلب الكود", e) }
        }, 5000)
    }

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) startBot()
        } else if (connection === 'open') {
            console.log('✅ مانو بوت شغال تمام - Mano Bot Online')
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        if (text.trim() === "السلام عليكم") {
            await sock.sendMessage(msg.key.remoteJid, { text: "وعليكم السلام يا مانو ❤️ البوت شغال 100%" })
        }
    })
}
startBot()
