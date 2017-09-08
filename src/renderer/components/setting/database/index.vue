<template>
    <div>
        <header>
            <h1>{{$t('title.databaseHealth',status.db)}}</h1>
            <div class="summary">
                <div>
                    <span class="text">{{$t('database.dataSize')}}</span>
                    <span class="value">{{status.dataSize | mb}}</span>
                </div>
                <div>
                    <span class="text">{{$t('database.storageSize')}}</span>
                    <span class="value">{{status.storageSize | mb}}</span>
                </div>
                <div>
                    <span class="text">{{$t('database.objects')}}</span>
                    <span class="value">{{status.objects}}</span>
                </div>
                <div>
                    <span class="text">{{$t('database.averageSize')}}</span>
                    <span class="value">{{status.avgObjSize | kb}}</span>
                </div>
            </div>
        </header>
    </div>
</template>

<script>
export default {
    data() {
        return {
            status: {}
        }
    },
    created() {
        this.$socket.emit('[DB] STATUS', data => { this.status = data })
    },
    filters: {
        mb(value) {
            return value ? (value / 1024 / 1024).toPrecision(4) + " MB" : value
        },
        kb(value) {
            return value ? (value / 1024).toPrecision(4) + " KB" : value
        }
    }
}
</script>

<style scoped>
header {
    height: 140px;
    padding: 45px;
    background: #eee;
}

h1 {
    font-size: 34px;
    color: #37474F;
    font-family: 'Microsoft YaHei';
}

.summary {
    color: #666;
    padding: 15px;
}

.summary div {
    display: flex;
}

.text {
    min-width: 100px;
}
</style>