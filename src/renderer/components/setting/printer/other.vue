<template>
    <div>

    </div>
</template>

<script>
export default {
    props: ["printer"],
    data() {
        return {
            config: null
        }
    },
    created() {
        console.log(this.printer)
    },
    methods: {

    }

}
</script>