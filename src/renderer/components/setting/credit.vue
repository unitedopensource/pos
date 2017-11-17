<template>
    <div class="background">
        <ul>
            <li><h1>United POS</h1></li>
            <li>
                <h5>Program Design</h5>
                <h3>Xuewu Huang</h3>
            </li>
            <li>
                <h5>User Interface Design</h5>
                <h3>Xuewu Huang</h3>
            </li>
            <li>
                <h5>Project Manager</h5>
                <h3>Kevin</h3>
            </li>
            <li>
                <h5>Marketing Manager</h5>
                <h3>XiuQin Liu</h3>
            </li>
            <li>
                <h5>Test Team</h5>
                <h3>Crist</h3>
                <h3>Joe</h3>
            </li>
            <li>
                <h5>Special Thanks To</h5>
                <h3>Amano Sushi</h3>
                <h3>New China One</h3>
                <h3>Dong Tian</h3>
                <h3>Super China</h3>
            </li>
        </ul>
    </div>
</template>

<script>
export default {};
</script>

<style scoped>
.background {
  height: 100vh;
  background: radial-gradient(circle at top center, #333 0%, #111 100%);
  overflow: hidden;
}
ul{
    animation: 60s credits linear infinite;
}
@keyframes credits {
    0%{
        transform: translate3d(0px, 0px, 0px)
    }
    100%{
        transform: translate3d(0px, 500px, 0px)
    }
}
</style>