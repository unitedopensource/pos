<template>
    <label class="paper" :for="'note'+index">
        <div class="wrap">{{note.name}}</div>
    </label>
</template>

<script>
export default {
    props: ['note', 'index']
}
</script>

<style scoped>
.paper {
    margin: 5px;
    padding: 5px;
    width: 170px;
    position: relative;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    color: lightgray;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    border-radius: 4px;
    border-left: 4px solid transparent;
    transition: border 0.22s ease;
}
</style>