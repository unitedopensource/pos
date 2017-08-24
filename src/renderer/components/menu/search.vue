<template>
  <div class="search">
    <section class="keyboard">
      <header>
        <span class="query">{{query}}</span>
        <div class="btn">{{$t('button.remove')}}</div>
      </header>
      <div class="keys">
        <div>A</div>
        <div>B</div>
        <div>C</div>
        <div>D</div>
        <div>E</div>
        <div>F</div>
        <div>G</div>
        <div>H</div>
        <div>I</div>
        <div>J</div>
        <div>K</div>
        <div>L</div>
        <div>M</div>
        <div>N</div>
        <div>O</div>
        <div>P</div>
        <div>Q</div>
        <div>R</div>
        <div>S</div>
        <div>T</div>
        <div>U</div>
        <div>V</div>
        <div>W</div>
        <div>X</div>
        <div>Y</div>
        <div>Z</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
        <div>7</div>
        <div>8</div>
        <div>9</div>
        <div>0</div>
      </div>
    </section>
    <section class="results">
  
    </section>
  </div>
</template>

<script>
export default {
  methods: {
    query: ""
  }
}
</script>

<style scoped>
.search {
  position: fixed;
}
</style>
