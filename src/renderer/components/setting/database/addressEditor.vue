<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{text('EDITOR.HEADER.ADDRESS')}}</header>
            <div class="inner">
                <div class="input">
                    <label>{{text('STREET')}}</label>
                    <input v-model="address.street" ref="street">
                </div>
                <div class="input">
                    <label>{{text('CITY')}}</label>
                    <input v-model="address.city" @keydown.enter="confirm">
                </div>
                <div class="input">
                    <label>{{text('ZIP_CODE')}}</label>
                    <input v-model="address.zipCode" @keydown.enter="confirm">
                </div>
            </div>
            <footer>
                <div class="f1" v-show="Number.isInteger(this.init.index)">
                    <span class="del" @click="del">{{text('DELETE')}}</span>
                </div>
                <div class="btn" @click="init.reject()">{{text('CANCEL')}}</div>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['init'],
    created() {
        this.address = Object.assign({}, this.init.address);
    },
    mounted() {
        this.$refs.street.focus();
    },
    data() {
        return {
            address: {}
        }
    },
    methods: {
        del() {
            this.$emit("del", this.init.index);
            this.$socket.emit("[CMD] REMOVE_ADDRESS", this.address._id);
            this.init.reject();
        },
        confirm() {
            if (!this.address.street) return;
            this.address.street = this.address.street.toUpperCase();
            this.address.city = this.address.city.toUpperCase();
            this.$emit("add", this.address);
            this.$socket.emit("[CMD] EDIT_ADDRESS", this.address);
            this.init.resolve();
        }
    }
}
</script>

<style></style>