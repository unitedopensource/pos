<template>
    <div class="keyboard">
        <section class="alphabetic">
            <span id="Q" @click="input('Q',$event)">Q</span>
            <span id="W" @click="input('W')">W</span>
            <span id="E" @click="input('E')">E</span>
            <span id="R" @click="input('R')">R</span>
            <span id="T" @click="input('T')">T</span>
            <span id="Y" @click="input('Y')">Y</span>
            <span id="U" @click="input('U')">U</span>
            <span id="I" @click="input('I')">I</span>
            <span id="O" @click="input('O')">O</span>
            <i class="fa fa-terminal" @click="clear"></i>
            <span id="A" @click="input('A')">A</span>
            <span id="S" @click="input('S')">S</span>
            <span id="D" @click="input('D')">D</span>
            <span id="F" @click="input('F')">F</span>
            <span id="G" @click="input('G')">G</span>
            <span id="H" @click="input('H')">H</span>
            <span id="J" @click="input('J')">J</span>
            <span id="K" @click="input('K')">K</span>
            <span id="L" @click="input('L')">L</span>
            <i class="fa fa-long-arrow-left" @click="backspace"></i>
            <span id="Z" @click="input('Z')">Z</span>
            <span id="X" @click="input('X')">X</span>
            <span id="C" @click="input('C')">C</span>
            <span id="V" @click="input('V')">V</span>
            <span id="B" @click="input('B')">B</span>
            <span id="N" @click="input('N')">N</span>
            <span id="M" @click="input('M')">M</span>
            <span id="P" @click="input('P')">P</span>
            <span @click="input('/')">/</span>
            <span @click="input('#')">#</span>
            <i class="fa fa-search" @click="search"></i>
            <span @click="input('|')">|</span>
            <span class="space" @click="input(' ')"></span>
            <i class="fa fa-keyboard-o double"></i>
            <span class="double created">{{$t('button.done')}}</span>
        </section>
        <section class="numeric">
            <span @click="input('7')">7</span>
            <span @click="input('8')">8</span>
            <span @click="input('9')">9</span>
            <span @click="input('4')">4</span>
            <span @click="input('5')">5</span>
            <span @click="input('6')">6</span>
            <span @click="input('1')">1</span>
            <span @click="input('2')">2</span>
            <span @click="input('3')">3</span>
            <span class="double" @click="input('0')">0</span>
            <span @click="input('-')">-</span>
        </section>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {

        }
    },
    methods: {
        input(s) {
            this.$bus.emit("input", s)
        },
        backspace() {
            this.$bus.emit("backspace")
        },
        clear() {
            this.$bus.emit("clear")
        },
        search() {
            
        }
    }
}
</script>