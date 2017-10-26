<template>
    <ul :style="pos">
        <li class="divider" @click="$emit('seat')">
            <i class="fa fa-cutlery"></i>
            <span class="text">{{$t('reservation.seat')}}<span class="name">{{init.book.name}}</span></span>
        </li>
        <li>
            <span class="fa-stack fa-lg">
                <i class="fa fa-print fa-stack-1x"></i>
                <i class="fa fa-ban fa-stack-2x text-danger"></i>
            </span>
            <span class="text">{{$t('context.resetPrint')}}</span>
        </li>
        <li>
            <i class="fa fa-refresh"></i>
            <span class="text">{{$t('context.sync')}}</span>
        </li>
    </ul>
</template>

<script>
export default {
  props: ["init"],
  created() {
    let { top, left } = this.init;
    this.pos = {
      top: top + "px",
      left: left + "px"
    };
  },
  data() {
    return {
      pos: {
        top: 0,
        left: 0
      }
    };
  },
  methods: {}
};
</script>

<style scoped>
ul {
  position: absolute;
  min-width: 160px;
  background: #fff;
  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
}

li {
  padding: 10px;
  border-left: 3px solid transparent;
}

li.divider {
  border-bottom: 1px solid #e5e5e5;
}

li i {
  color: rgba(0, 0, 0, 0.87);
  margin-right: 5px;
  width: 25px;
  text-align: center;
}

li:hover {
  background: #e0e0e0;
  border-left: 3px solid #37474f;
}

.name {
  color: #ff5722;
  margin-left: 5px;
  text-transform: capitalize;
}
</style>