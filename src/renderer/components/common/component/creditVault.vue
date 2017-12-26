<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('title.creditVault')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="profiles">
          <template v-if="view">
            <div class="profile" v-for="(opt,index) in opts" :key="opt">
              <input type="radio" name="opt" v-model="select" :value="opt" :id="'opt'+index" @change="blur">
              <label :for="'opt'+index">
                <i class="fa fa-unlock" v-if="opt.unlock"></i>
                <i class="fa fa-lock" v-else></i>
                <div class="card">{{opt.number}}</div>
                <div>
                  <span class="value">{{opt.exp}}</span>
                  <span class="value">{{opt.cvc}}</span>
                </div>
                <i class="fa fa-trash trash" @click="remove(index)"></i>
              </label>
            </div>
          </template>
          <template v-else>
            <div class="dialog">
              <h3>{{$t('button.newRecord')}}</h3>
              <div class="banner"></div>
              <div class="inner">
                <p>{{$t('card.number')}}</p>
                <input type="text" v-model="card" @click="setCursor('card')">
                <p>{{$t('card.expirationDate')}}</p>
                <input type="text" v-model="exp" @click="setCursor('exp')">
                <p>{{$t('card.securityCode')}}</p>
                <input type="text" v-model="cvc" @click="setCursor('cvc')">
              </div>
              <button class="btn" @click="view = true">{{$t('button.cancel')}}</button>
              <button class="btn" @click="save">{{$t('button.save')}}</button>
            </div>
          </template>
        </div>
        <div class="entryWrap">
          <div class="inner">
            <input type="text" v-model="entry">
          </div>
          <num-pad v-model="entry" @enter="unlock" type="number"></num-pad>
        </div>
      </div>
      <footer>
        <div class="f1">
          <button class="btn" @click="newRecord" v-show="opts.length < 4">{{$t('button.new')}}</button>
        </div>
        <button class="btn" @click="confirm" :disabled="!select">{{$t('button.confirm')}}</button>
      </footer>
      <div :is="component" :init="componentData"></div>
    </div>
  </div>
</template>

<script>
import crypto from "crypto";
import numPad from "../numpad";
import dialoger from "../dialoger";
import { mapActions } from "vuex";

export default {
  props: ["init"],
  components: { numPad, dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      opts: this.init.opts.map(opt => ({
        number: (opt.card[0] + "********").replace(/(.{4})/g, "$1 ").trim(),
        exp: opt.card[1],
        cvc: opt.card[2],
        cipher: opt.cipher,
        unlock: false
      })),
      select: null,
      cursor: null,
      view: true,
      card: "",
      exp: "",
      cvc: "",
      entry: ""
    };
  },
  methods: {
    encrypt(plaintext, key) {
      return new Promise((resolve, reject) => {
        const cryptoKey = crypto
          .createHash("sha256")
          .update(key)
          .digest();
        const json = JSON.stringify(plaintext);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes256", cryptoKey, iv);
        const encryptedJSON =
          cipher.update(json, "utf8", "base64") + cipher.final("base64");
        const result = iv.toString("hex") + encryptedJSON;
        resolve(result);
      });
    },
    decrypt(ciphertext, key) {
      const cryptoKey = crypto
        .createHash("sha256")
        .update(key)
        .digest();
      return new Promise((resolve, reject) => {
        const iv = new Buffer(ciphertext.substring(0, 32), "hex");
        const encryptedJSON = ciphertext.substring(32);
        const decryptor = crypto.createDecipheriv("aes256", cryptoKey, iv);
        const json =
          decryptor.update(encryptedJSON, "base64", "utf8") +
          decryptor.final("utf8");

        resolve(JSON.parse(json));
      });
    },
    unlock() {
      this.decrypt(this.select.cipher, this.entry)
        .then(card => {
          Object.assign(this.select, {
            unlock: true,
            number: card[0].replace(/(.{4})/g, "$1 ").trim(),
            exp: card[1],
            cvc: card[2]
          });
        })
        .catch(() => {
          this.entry = "";
        });
    },
    blur() {
      this.entry = "";
      this.cursor = null;
    },
    setCursor(cursor) {
      this.cursor = cursor;
      this.entry = "";
    },
    save() {
      const _id = this.$store.getters.customer._id;
      const card = [this.card.replace(" ", ""), this.exp, this.cvc];
      const key = this.card.split(" ").last();
      this.encrypt(card, key).then(cipher => {
        this.$socket.emit(
          "[CUSTOMER] SAVE_CREDIT_CARD",
          _id,
          {
            card: [this.card.replace(" ", "").slice(0, 8), this.exp, this.cvc],
            cipher,
            lastUse: +new Date()
          },
          () => {
            this.opts.push({
              unlock: true,
              number: this.card,
              exp: this.exp,
              cvc: this.cvc
            });
            this.view = true;
          }
        );
      });
    },
    newRecord() {
      this.view = false;
      this.cursor = "card";
    },
    remove(index) {
      const data = {
        type: "question",
        title: "dialog.removeCreditCard",
        msg: "dialog.removeCreditCardConfirm",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.confirm", fn: "resolve" }
        ]
      };

      const customer = this.$store.getters.customer;

      this.$dialog(data)
        .then(() => {
          this.$socket.emit(
            "[CUSTOMER] REMOVE_CREDIT_CARD",
            customer._id,
            index
          );
          this.opts.splice(index, 1);
          this.entry = "";
          this.$q();
        })
        .catch(() => this.$q());
    },
    confirm() {
      this.select.unlock &&
        this.setOrder({
          __creditPayment__: {
            number: this.select.number,
            date: this.select.exp,
            cvc: this.select.cvc
          }
        });

      this.init.resolve();
    },
    ...mapActions(["setOrder"])
  },
  watch: {
    entry(n) {
      switch (this.cursor) {
        case "card":
          if (n.length > 16) return;

          this[this.cursor] = n
            .replace(" ", "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
          break;
        case "exp":
          if (n.length > 4) return;

          this[this.cursor] = n
            .replace("/", "")
            .replace(/(.{2})/, "$1/")
            .trim();
          break;
        case "cvc":
          this[this.cursor] = n;
      }
    }
  }
};
</script>

<style scoped>
.wrap {
  display: flex;
  padding: 15px;
}

.profiles {
  width: 400px;
  position: relative;
}

.profile {
  display: flex;
  align-items: center;
  height: 80px;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 26px;
  color: gray;
}

input:checked + label {
  border: 2px solid #009688;
  background: #e0f2f1;
  color: #3c3c3c;
}

input:checked + label i.trash {
  display: initial;
}

label {
  border: 2px solid transparent;
  flex: 1;
  padding: 5px 15px 5px 60px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

label i {
  position: absolute;
  left: 22px;
  top: 22px;
}

.value {
  margin-right: 15px;
}

i.trash {
  left: initial;
  right: 22px;
  cursor: pointer;
  display: none;
  color: #f44336;
}

.dialog {
  height: 100%;
  text-align: center;
  border-radius: 4px;
  background: #fafafa;
  box-shadow: var(--shadow);
}

.dialog h3 {
  padding: 15px 0;
}

p {
  text-align: left;
  font-weight: bold;
  margin: 10px;
}

.dialog .inner {
  margin: auto;
  padding: 15px 35px 30px;
}

.dialog input {
  border: 2px solid #eee;
  font-family: "Agency FB";
  outline: none;
  font-size: 26px;
  font-weight: bold;
  color: #3c3c3c;
  padding: 3px 10px;
  background: #fff;
}
</style>

