<template>
    <div>
        <header class="nav">
            <div class="title">
                <h3>{{$t('title.databaseHealth')}}</h3>
            </div>
            <nav>
                <span>{{$t('button.backup')}}</span>
            </nav>
        </header>
        <div class="status">
            <h3>
                <span class="name">{{database.db}}</span>{{$t('database.dataSize')}}</h3>
            <h5>{{space | mb}} / {{database.dataSize | mb}}</h5>
        </div>
        <div class="status">
            <h3>{{$t('database.storageSize')}}</h3>
            <h5>{{database.storageSize | mb}}</h5>
        </div>
        <div class="status">
            <h3>{{$t('database.objects')}}</h3>
            <h5>{{database.objects}}</h5>
        </div>
        <div class="status">
            <h3>{{$t('database.averageSize')}}</h3>
            <h5>{{database.avgObjSize | kb}}</h5>
        </div>
        <div class="status">
            <h3>{{$t('database.version')}}</h3>
            <h5>{{server.version}}
                <span> ({{$t("text.bit",server.mem.bits)}})</span>
            </h5>
        </div>
        <div class="status">
            <h3>{{$t('database.uptime')}}</h3>
            <h5>{{uptime(server.uptime)}}</h5>
        </div>
        <div class="status">
            <h3>{{$t('database.memoryUsage')}}</h3>
            <h5>{{server.mem.resident}} MB</h5>
        </div>
    </div>
</template>

<script>
import disk from "diskusage";
export default {
    props: ["space", "database", "server"],
    filters: {
        mb(value) {
            return value ? (value / 1024 / 1024).toFixed(2) + " MB" : value;
        },
        kb(value) {
            return value ? (value / 1024).toFixed(2) + " KB" : value;
        }
    },
    created() {

    },
    methods: {
        uptime(duration) {
            console.log(duration)
            const hh = ("00" + Math.floor(duration / 3600)).slice(-2);
            const mm = ("00" + Math.floor(duration / 60 % 60)).slice(-2);
            const ss = ("00" + Math.floor(duration % 60)).slice(-2);

            return this.$t("text.hhmmss", hh, mm, ss);
        }
    }
}
</script>

<style scoped>
.status {
  padding: 10px 25px 5px;
  border-bottom: 1px solid #eee;
}
h3 {
  font-size: 18px;
  color: #3c3c3c;
}
h5 {
  font-weight: normal;
  color: #656565;
}
</style>