const net = require('net');

const Exadigm = function () {
    let host = null;
    let port = null;
    let auth = null;
    let station = null;
    let terminal = null;

    this.initial = function (ip, pt, authCode, alias, device) {
        host = ip;
        port = pt || 8765;
        auth = authCode || "987pjasd4687";
        station = alias;
        terminal = device || "Exadigm";

        return new Promise((next) => next({ code: "000000", model: "NX2200" }));
    };

    this.check = (device) => ({ code: "000000", model: "NX2200" });

    this.charge = function ({ amount, creditCard, tip }) {
        console.log(amount, creditCard, tip);
        const command = {
            "packetID": "XCRP",
            "packetData": {
                "packetAuthorization": auth,
                "requestID": 0,
                "baseAmount": amount * 100,
                "receiptCount": 0,
                "transactionType": 0,
                "taxAmount": 0,
                "tipAmount": tip * 100
            }
        };

        this.sent(command).then(result => {
            console.log(result)
        }).catch(error => {
            console.log(error)
        })
    };

    this.explainTransaction = function (data) {

    };

    this.sent = function (command) {
        console.log(host, port)
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            socket.setEncoding("utf8");

            let buffer = null;

            socket.connect(port, host, () => socket.write(JSON.stringify(command)));

            socket.on('data', (data) => {
                buffer = data;
                socket.destroy();
            });

            socket.on('error', (error) => reject(error));
            socket.on('close', () => resolve(JSON.parse(buffer)));
        })
    }
};

// module.exports = function () {
//     return new Exadigm()
// };

export default function () {
    return new Exadigm();
}