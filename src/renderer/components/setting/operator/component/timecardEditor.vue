<template>
    <div class="popupMask setting dark center">
        <div class="editor">
            <header>
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{$t('title.timecard')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.date" v-model="log.date" placeholder="YYYY-MM-DD" :disabled="log.hasOwnProperty('_id')"></inputer>
                <inputer title="text.clockIn" v-model="log.clockIn" placeholder="HH:mm:ss"></inputer>
                <inputer title="text.clockOut" v-model="log.clockIn" placeholder="HH:mm:ss"></inputer>
                <inputer title="text.wage" v-model.number="log.wage"></inputer>
                <inputer title="text.note"></inputer>
                <toggle title="button.valid" v-model="log.valid"></toggle>
            </div>
            <footer>
                <div class="opt">
                    <checkbox v-model="lock" label="text.lock"></checkbox>
                </div>
                <button class="btn">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";

export default {
  props: ["init"],
  components: { toggle, inputer, checkbox },
  data() {
    return {
      log: Object.assign({}, this.init.log),
      lock: false
    };
  },
  methods: {}
};
</script>

<style scoped>

</style>