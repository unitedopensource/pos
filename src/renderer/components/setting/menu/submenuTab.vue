<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.submenu'}">{{$t('nav.list')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.submenu.item'}" :class="{disable:!submenu}">{{$t('nav.item')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" :submenu="submenu" @set="setSubmenu" @reset="resetSubmenu"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
  data() {
    return {
      submenu: null
    }; 
  },
  methods: {
    setSubmenu(submenu) {
      this.submenu = submenu;
      this.$router.push({ name: "Setting.submenu.item" });
    },
    resetSubmenu() {
      this.submenu = null;
      this.$router.push({ name: "Setting.submenu" });
    }
  }
};
</script>