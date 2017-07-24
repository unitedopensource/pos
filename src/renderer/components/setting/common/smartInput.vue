<template>
    <div class="input">
        <label :for="id">{{text(label)}}</label>
        <input :id="id" :value="value" :type="type" @input="$emit('input', $event.target.value)" :disabled="disable">
        <i class="fa fa-level-down" v-if="more" @click="trigger"></i>
    </div>
</template>

<script>
export default {
    props: {
        value: [String, Number],
        label: String,
        tip: String,
        reg: String,
        disable: {
            type: Boolean,
            default: false
        },
        more: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: 'text'
        }
    },
    created() {
        this.id = Math.random().toString(36).substr(2, 5);
    },
    data() {
        return {
            id: null
        }
    },
    methods: {
        trigger() {
            this.$emit("toggle")
        }
    }
}
</script>

<style scoped>
.input {
    display: flex;
    position: relative;
}

label {
    min-width: 130px;
    padding-right: 20px;
    text-align: right;
    color: #666;
}

.input input {
    border: none;
    padding: 7px 0;
    font-size: 1em;
    flex: 1;
    font-family: 'Yuanti-SC'
}

i {
    position: absolute;
    right: -37px;
    padding: 8px 13px;
    background: #fff;
    z-index: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    box-shadow: 3px 0px 5px -3px rgba(0, 0, 0, 0.4);
}

i:active {
    background: #eee;
}
</style>