<script setup lang="ts">
import { ref, defineModel } from "vue";
import { delay } from "../engine/utilities";

const emit = defineEmits(["rollValue", "rollClick"]);

var running = defineModel<boolean>("running");

const animateRollNumber = ref<number>(0);
const finalRollNumber = ref<number>(0);

// a function to generate a random number between 3 and 10
function randFromThreeToTen(): number {
    return Math.floor(Math.random() * 8) + 3;
}

// it feels better when the "roll" doesn't repeat the same number
function getNewRollNumber(oldRollNumber: number) {
    let newNumber = randFromThreeToTen();
    if (newNumber != oldRollNumber) {
        animateRollNumber.value = newNumber;
    } else {
        getNewRollNumber(oldRollNumber);
    }
}

// let's spin the wheel, roll the dice, and build a little anticipation as the roll slows down approaching the final number
async function rollTheDice() {
    if (!running.value) {
        running.value = true;
        finalRollNumber.value = 0;

        // random number between 7 and 12, inclusive
        // add a little jitter to the roll to make it feel a little better
        let rollJitter: number = Math.floor(Math.random() * 6) + 7;

        for (let i = 0; i < rollJitter; i++) {
            await delay(100 + i * 20);
            getNewRollNumber(animateRollNumber.value);
            emit("rollClick");
        }
        await delay(250);
        finalRollNumber.value = animateRollNumber.value;
        emit("rollValue", finalRollNumber.value);
    }
}
</script>

<template>
    <button
        @click="rollTheDice"
        :disabled="running"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-25 disabled:bg-gray-500 disabled:hover:bg-gray-500"
    >
        Roll the dice
    </button>
    <div>{{ animateRollNumber }}</div>
    <div>
        &nbsp;
        <span v-if="finalRollNumber > 0"
            >You rolled a {{ finalRollNumber }}</span
        >
        &nbsp;
    </div>
</template>
