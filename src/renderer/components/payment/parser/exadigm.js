const net = require('net');
const socket = new net.Socket();

const Exadigm = function () {
    let host = null;
    let port = null;
    let auth = null;

    this.initial = function (host, port, authCode) {
        host = host;
        prot = port || 8765;
        auth = authCode;

        return new Promise((resolve) => {
            resolve({
                text() {
                    return {
                        code: "000000", model: "NX2200"
                    }
                }
            })
        });
    };
    this.check = function (device) {
        return { code: "000000", model: "NX2200" }
    };
    this.charge = function (card) {
        console.log(card);
    };
    this.explainTransaction = function (data) {

    };
    this.connect = function () {
        if (!host || !port) throw Error("Please Initial first");

        socket.connect(host, port, () => {

            socket.write(JSON.stringify(
                {
                    "packetID": "XCRP",
                    "packetData": {
                        "packetAuthorization": "987pjasd4687",
                        "requestID": 0,
                        "baseAmount": 0,
                        "receiptCount": 0,
                        "transactionType": 0,
                        "taxAmount": 0
                    }
                }
            ))
        });

        socket.on('data', (data) => {
            console.log(data);
            socket.destroy();
        });

        socket.on('close', () => {
            console.log("connection closed")
        })
    }
};

module.exports = new Exadigm();