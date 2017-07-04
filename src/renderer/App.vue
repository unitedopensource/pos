<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import store from './vuex/store'
import serialport from 'serialport'
export default {
  store,
  data() {
    return {
      timeout: null
    }
  },
  mounted() {
    // let scale = new serialport('COM1',{
    //     baudRate: 9600,
    //     dataBits: 7,
    //     stopBits: 1,
    //     parser:serialport.parsers.raw,
    //     autoOpen:false
    // });
    //
    // scale.open(err=>{
    //   if(err){
    //     console.log(err)
    //   }else{
    //     console.log("SCALE PORT OPEN")
    //     scale.write(String.fromCharCode(57))
    //   }
    // });
    //
    // scale.on('data',console.log);
    //
    // window.scale = scale;

    let port = new serialport('COM3', {
      autoOpen: false,
      parser: serialport.parsers.raw
    });

    port.open(err => {
      if (err) {
        store.commit("SET_APPLICATION", { callerId: false })
        console.log(err);
      } else {
        port.write('AT#CID=1' + String.fromCharCode(13));
      }
    });

    port.on('data', data => {
      let raw = data.toString().split('\n');
      switch (raw.length) {
        case 3:
          let type = raw[1].replace(/[^a-zA-Z ]/g, "");
          switch (type) {
            case "RING":
              clearTimeout(this.timeout);
              this.timeout = setTimeout(() => {
                store.commit("RINGING", null)
              }, 7000)
              break;
            case "ERROR":
              store.commit("SET_APPLICATION", { callerId: false })
              break;
            case "OK":
              store.commit("SET_APPLICATION", { callerId: true })
              break;
            default:
          }
          break;
        case 9:
          let name = raw.find(arr => arr.indexOf("NAME=") !== -1);
          name = name.split("=")[1];
          let number = raw.find(arr => arr.indexOf("NMBR=") !== -1);
          number = number.split("=")[1].replace(/\D/g, '').replace(/\+?1?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "$1$2$3");
          let time = +new Date();
          store.commit("RINGING", { name, number, time });
          break;
      }
    });
    // window.caller = function(tel){
    //   store.commit("RINGING",{name:"text",number:tel,time:+new Date})
    // } 
  }
}
</script>

<style>
@import url(./assets/css/font-awesome.min);
@import url(./assets/css/icon.css);
@import url(./assets/css/style.css);
</style>
