const net = require('net');

const Exadigm = function () {
    let host = null;
    let port = null;
    let auth = null;

    this.initial = function (host, port, authCode) {
        host = host;
        port = port || 8765;
        auth = authCode || "987pjasd4687";

        return new Promise((resolve) => {
            resolve({ code: "000000", model: "NX2200" })
        });
    };

    this.check = function (device) {
        return { code: "000000", model: "NX2200" }
    };

    this.charge = function (card) {
        console.log(card);
        const command = {
            "packetID": "XCRP",
            "packetData": {
                "packetAuthorization": auth,
                "requestID": 0,
                "baseAmount": 0,
                "receiptCount": 0,
                "transactionType": 0,
                "taxAmount": 0
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
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            let results = [];

            socket.connect(host, port, () => socket.write(JSON.stringify(command)));

            socket.on('data', (data) => {
                results.push(data);
                socket.destroy();
            });

            socket.on('error', (error) => reject(error));
            socket.on('close', () => resolve(results));
        })
    }
};

module.exports = function () {
    return new Exadigm()
};