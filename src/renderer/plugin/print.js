var Printer = function () {
    let config = null;
    let station = null;
    let plugin = null;
    let devices = [];
    let job = 'All';
    let jobDevices = [];

    let initial = function (l, c) {
        this.plugin = l;
        this.config = c;
        this.station = c.station;
        this.devices = Object.keys(c.printer);
    }

    /**
     * Set target printers
     * @param  {string} name       The name of the print job
     * 
     *           All,     // call all printer to print 
     *           Receipt, // only the cashier printer to print
     *           Order,   // All printer but EXCLUDE cashier printer
     *         
     * @return 
     */
    let setJob = function (name) {
        this.job = name;
    }

    let setPrinter = function (name) {
        plugin.SET_PRINTER_INDEX(name)
    }

    let openCashDrawer = function () {
        if (station.cashDrawer) {
            this.setPrinter(station.printer);
            plugin.SEND_PRINT_RAWDATA(String.fromCharCode(27) + String.fromCharCode(112) + String.fromCharCode(48) + String.fromCharCode(55) + String.fromCharCode(221));
        }
    }
    let buzzer = function (name) {
        plugin.PRINT_INIT('Buzzer');
        this.setPrinter(name);
        plugin.SEND_PRINT_RAWDATA(String.fromCharCode(27) + String.fromCharCode(67) + String.fromCharCode(4) + String.fromCharCode(2) + String.fromCharCode(3));
        return this
    }

    let print = function (raw) {
        plugin.PRINT_INIT(this.job);
        let template = this.getTemplate(raw.type);
        
    }
}

export default new Printer()