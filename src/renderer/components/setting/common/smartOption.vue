<template>
    <div class="input">
        <label>{{text(label)}}</label>
        <select :value="value" @change="$emit('input', $event.target.value)">
            <option :value="option.value" v-for="(option,index) in data" :key="index">{{option.label}}</option>
        </select>
    </div>
</template>

<script>
export default {
    props: ['value', 'label', 'tip', 'options'],
    created() {
        this.data = this.options.map(option => {
            return typeof option === 'string' ? { label: option, value: option } : option;
        });
    },
    data() {
        return {
            data: null
        }
    }
}
</script>

<style scoped>
.input {
    display: flex;
}

label {
    width: 130px;
    padding-right: 20px;
    text-align: right;
    color: #666;
}

select {
    border: none;
    outline: none;
    flex: 1;
    padding: 8px 0;
    font-size: 1em;
    color: #9E9E9E;
    font-family: 'Yuanti-SC';
}
</style>