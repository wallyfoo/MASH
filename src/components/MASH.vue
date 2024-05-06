<script setup lang="ts">
import { ref } from "vue";
import { delay } from "../engine/utilities";
import { Howl, Howler } from "howler";
import { Entry } from "../engine/entry";
import SetupGameVue from "./SetupGame.vue";
import PlayGameVue from "./PlayGame.vue";

// set up a state for the mash game. setup and play. setup will have steps foreach of the categories in the Categories enum

type MashState = "setup" | "play";

const gameState = ref<MashState>("setup");

const playerOptions = ref<Entry[]>([]);

function assignPlayerOptions(options: Entry[]) {
    playerOptions.value = options;
    gameState.value = "play";
}

function onResetGame() {
    gameState.value = "setup";
    playerOptions.value = [];
}

// Howler for the juice

Howler.autoUnlock = true;

const whoosh = new Howl({
    src: ["/src/assets/audio/whoosh.mp3"],
    volume: 0.5,
});

const ding = new Howl({
    src: ["/src/assets/audio/ding.mp3"],
    volume: 0.5,
});

const riffle = new Howl({
    src: ["/src/assets/audio/riffle.mp3"],
    volume: 0.5,
});

const scratchOut = new Howl({
    src: ["/src/assets/audio/scratch-out.mp3"],
    volume: 0.5,
});

const click = new Howl({
    src: ["/src/assets/audio/click.mp3"],
    volume: 0.5,
});

const winFanfare = new Howl({
    src: ["/src/assets/audio/harp.mp3"],
    volume: 0.5,
});

const optionFanfare = new Howl({
    src: ["/src/assets/audio/fanfare.mp3"],
    volume: 0.5,
});

// a little variety in the boardgame taps
const tapNames: string[] = ["tap1", "tap2", "tap3", "tap4", "tap5"];
var taps: Howl[] = tapNames.map((name) => {
    return new Howl({
        src: [`/src/assets/audio/${name}.mp3`],
        volume: 0.5,
    });
});

function playTap() {
    taps[Math.floor(Math.random() * taps.length)].play();
}

function playWoosh() {
    whoosh.play();
}

function playRiffle() {
    riffle.play();
}

function playScratchOut() {
    scratchOut.play();
}

function playClick() {
    click.play();
}

function playWinFanfare() {
    winFanfare.play();
}

function playOptionFanfare() {
    optionFanfare.play();
}

async function endDing() {
    whoosh.play();
    await delay(250);
    ding.play();
}
</script>

<template>
    <!-- header -->
    <div class="mb-10">
        <div
            class="grid grid-cols-4 gap-4 text-5xl font-semibold text-gray-600 max-w-[500px] mx-auto my-4 dark:text-gray-200"
        >
            <div>M</div>
            <div>A</div>
            <div>S</div>
            <div>H</div>
        </div>
        <div class="text-sm italic">
            Arbitrarily predict your future with this adaptation of a
            back-of-the-notebook classroom time-waster.
        </div>
    </div>
    <!-- setup or play -->
    <div v-if="gameState == 'setup'">
        <SetupGameVue
            @playerOptions="assignPlayerOptions"
            @endDing="endDing"
            @whoosh="playWoosh"
            @riffle="playRiffle"
        />
    </div>
    <div v-else-if="gameState == 'play'">
        <PlayGameVue
            v-model:playerOptions="playerOptions"
            @resetGame="onResetGame"
            @scratchOut="playScratchOut"
            @rollClick="playClick"
            @tap="playTap"
            @winFanfare="playWinFanfare"
            @optionFanfare="playOptionFanfare"
        />
    </div>
</template>
