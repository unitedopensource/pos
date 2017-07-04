<template>
    <div class="input">
        <label class="label">{{text(label)}}</label>
        <label class="input-toggle">
            <input type="checkbox" :checked="value" @change="$emit('input',$event.target.checked)">
            <span></span>
        </label>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Boolean,
            default:false
        },
        label: String,
        tip: String,
    }
}
</script>

<style scoped>
.input {
    display: flex;
}

.label {
    width: 130px;
    text-align: right;
    color: #666;
    padding: 8px 20px 8px 0;
}
</style>