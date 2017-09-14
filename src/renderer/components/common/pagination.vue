<template>
    <div class="pagination" v-show="totalPage > 1">
        <div class="page">
            <i class="fa fa-angle-left"></i>
        </div>
        <div class="page" v-for="i in pages" :key="i" :class="{active:i === page}" @click="setPage(i)">{{i}}</div>
        <div class="page">
            <i class="fa fa-angle-right"></i>
        </div>
    </div>
</template>

<script>
export default {
    props: ['of', 'contain', 'max'],
    data() {
        return {
            pages: [],
            page: 1
        }
    },
    created() {
        this.format(this.page)
    },
    methods: {
        format(page) {
            let array;
            if (this.totalPage <= this.max) {
                this.pages = [...Array(this.totalPage).keys()].map((e, i) => i + 1);
            } else if (page <= 4 || page >= this.totalPage - 6) {
                array = [1, 2, 3, 4, 5, 6];
                for (let i = this.totalPage - 6; i < this.totalPage; i++) {
                    array.push(i)
                }
                this.pages = array;
            } else {
                array = [1, 2, 3, 4, page - 2, page - 1, page, page + 1, page + 2];
                for (let i = this.totalPage - 3; i < this.totalPage; i++) {
                    array.push(i)
                }
                this.pages = array;
            }
        },
        setPage(number) {
            this.$emit('page', number - 1);
            this.page = number;
            this.format(number);
        }
    },
    computed: {
        totalPage() {
            return Math.ceil(this.of.length / this.contain)
        }
    },
    watch: {
        of() {
            this.page = 1;
            this.format(0)
        }
    }
}
</script>

<style scoped>
.pagination {
    justify-content: center;
    align-items: center;
    display: flex;
}

.pagination .page {
    margin: 5px;
    width: 20px;
    text-align: center;
    cursor: pointer;
    padding: 10px 10px;
    border-radius: 4px;
    text-shadow: 0 1px 1px #fff;
    background: linear-gradient(#fefefe, #cfd0d3);
    box-shadow: 0 1px 3px rgba(0, 0, 0, .7);
}

.page.active {
    font-weight: bold;
    background: #676767;
    color: #fff;
    text-shadow: 0 1px 1px #000;
    box-shadow: rgba(0, 0, 0, 0.75) 0 0 0 0 inset;
}
</style>