<template>
    <div class="radio">
        <input :id="id" :value="val" type="radio" :name="name" @change="$emit('input',$event.target.value)">
        <label class="box" :for="id"></label>
        <label class="text" :for="id">{{$t(label)}}</label>
    </div>
</template>

<script>
export default {
    props: ['val','label', 'value', 'name'],
    data() {
        return {
            id: Math.random().toString(36).substring(3, 6)
        }
    }
}
</script>

<style scoped>
.radio {
    margin: 0 10px;
}

input {
    display: none;
}

input:checked+label {
    background: #009688;
    border-color: #009688;
}

input:checked+label:after {
    transform: scale(1.3);
}

.box {
    display: inline-block;
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    background: #EEE;
    border: 2px solid #7A7A7A;
    border-radius: 50%;
    position: relative;
    cursor: pointer;
    transition: .2s;
}

.box:before {
    content: '';
    position: absolute;
    display: block;
    height: 300%;
    width: 300%;
    top: -100%;
    left: -100%;
    z-index: 0;
    border-radius: 50%;
    transition: .3s;
}

.box:after {
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    background: #009688;
    border-radius: 50%;
    transform: scale(0);
    transition: .2s;
}

.box:active:before {
    background: rgba(76, 175, 80, 0.25);
}

.text {
    vertical-align: top;
}
</style>
