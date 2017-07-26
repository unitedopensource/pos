const Exadigm = function () {
    let url = null;
    let auth = null;
    this.initial = function (ip, port, authCode) {
        url = `http://${ip}:${port}`;
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

    }
};

module.exports = new Exadigm();