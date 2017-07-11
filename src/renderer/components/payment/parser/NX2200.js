const Exadigm = function () {
    let url = "";
    this.initial = function (ip, port) {
        url = `http://${ip}:${port}?`;
        
        return fetch(command);
    };
    this.check = function (device) {
        let data = device.split(String.fromCharCode(28));
        return {
            code: data[3],
            msg: data[4],
            sn: data[5],
            model: data[6],
            mac: data[8]
        }
    };
};

export default Exadigm