<template>
    <div class="index">
        <h3>{{$t('setting.softwareSetting')}}</h3>
        <section class="grids">
            <router-link tag="figure" :to="{name:'Setting.store'}">
                <i class="fa fa-2x fa-cogs"></i>
                <figcaption>{{$t('setting.store')}}</figcaption>
                <p>{{$t('setting.storeTip')}}</p>
            </router-link>
            <router-link tag="figure" :to="{name:'Setting.menu'}">
                <i class="fa fa-2x fa-braille"></i>
                <figcaption>{{$t('setting.menu')}}</figcaption>
                <p>{{$t('setting.menuTip')}}</p>
            </router-link>
            <router-link tag="figure" :to="{name:'Dashboard'}">
                <i class="fa fa-2x fa-external-link"></i>
                <figcaption>{{$t('setting.exit')}}</figcaption>
                <span class="intro">{{$t('setting.exitTip')}}</span>
            </router-link>
        </section>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import Electron from "electron";

export default {
  data() {
    return {
      componentData: null,
      component: null,
      about: {},
      app: null
    };
  },
  computed: {
    ...mapGetters(["op"])
  },
  created() {
    this.app = Electron.remote.app.getVersion();
    this.$socket.emit("ABOUT", us => (this.about = us));
  },
  methods: {
    go(name) {
      this.$router.push({ name });
    }
  }
};
</script>

<style scoped>
.index {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  display: flex;
  margin: 2em 0;
  position: relative;
}

h3 {
  font-size: 2em;
  font-family: "Microsoft YaHei";
  color: #666;
}

.grids {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 2em 0;
}

figure {
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  padding: 20px 10px 10px;
  height: 104px;
  width: 170px;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
}

figure:active {
  background: #f6f6f6;
  color: #666;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.45);
}

figure i {
  color: #1e88e5;
}

figcaption {
  font-family: "Microsoft YaHei";
  font-weight: bold;
  margin: 7px 0 3px;
  color: #3c3c3c;
  font-size: 1.25em;
}

p {
  color: gray;
  text-align: center;
}
</style>