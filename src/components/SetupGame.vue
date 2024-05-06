<script setup lang="ts">
import { ref } from "vue";
import * as _ from "lodash";
import { delay } from "../engine/utilities";
import { Entry } from "../engine/entry";
import { Category, Categories } from "../engine/category";
import { DefaultOptions } from "../engine/defaultOptions";

const emit = defineEmits(["playerOptions", "whoosh", "endDing", "riffle"]);

const categories = ref<Category[]>(_.sortBy(Categories, ["order"]));

const defaultOptions = ref<Entry[]>(DefaultOptions);

const steps = ref<number>(categories.value.length - 1);
var currentStep = ref<number>(0);
var choicesLeft = ref<number>(4);

var stepOptions = ref<Entry[]>(getStepOptions());

var playerSelections = ref<Entry[]>([]);

function stepText(currentStep: number): string {
    if (currentStep == 0) {
        return "First,";
    } else if (currentStep < steps.value) {
        return "Next,";
    } else {
        return "Finally,";
    }
}

function choicesLeftText(): string {
    if (choicesLeft.value == 1) {
        return "one more choice";
    } else {
        return `${choicesLeft.value} choices`;
    }
}

function instructionText(currentStep: number): string {
    if (choicesLeft.value > 0) {
        return `${stepText(currentStep)} select ${choicesLeftText()} for your possible future ${stepCategory(currentStep)}...`;
    }
    return `You have selected your possible future ${stepCategory(currentStep)}!`;
}

function stepCategory(currentStep: number): string {
    return categories.value[currentStep].name;
}

// a possible future improvement would be to compare against the player selections and only show options that are not already selected
function getStepOptions(currentStep: number = 0) {
    let options = _.filter(defaultOptions.value, {
        category: categories.value[currentStep],
    });
    emit("riffle");
    return _.shuffle(options).slice(0, 10);
}

function reloadStepOptions(currentStep: number) {
    stepOptions.value = getStepOptions(currentStep);
}

// there's probably a better way to play with the ref.value paradigm of vue and typescript, but I'm not sure of it at thme moment. Happy to learn when I have more time to delve into the vagaries of the interplay here.
// for now, I'll be content to say that this would make more sense definied within the methods of the old vue setup rather than the compositional setup here.
async function selectOption(option: Entry) {
    if (choicesLeft.value > 0) {
        choicesLeft.value -= 1;
        playerSelections.value.push(option);
        stepOptions.value = _.filter(
            stepOptions.value,
            (o: object) => o != option,
        );
        if (choicesLeft.value <= 0) {
            emit("endDing");
            await delay(1000);
            currentStep.value++;
            if (currentStep.value > steps.value) {
                emit("playerOptions", playerSelections.value);
                return;
            }
            choicesLeft.value = 4;
            stepOptions.value = getStepOptions(currentStep.value);
        } else {
            emit("whoosh");
        }
    }
}

function filterPlayerSelections() {
    return _.filter(playerSelections.value, {
        category: categories.value[currentStep.value],
    });
}

function enthusiasticMouthGrunt() {
    var grunts: string[] = [
        "Great!",
        "Splendid!",
        "Fantastic!",
        "Superb!",
        "Excellent!",
        "Marvelous!",
        "Wonderful!",
        "Terrific!",
        "Brilliant!",
        "Amazing!",
        "Incredible!",
        "Awesome!",
        "Outstanding!",
        "Impressive!",
        "Magnificent!",
    ];
    return _.shuffle(grunts)[0];
}
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="text-2xl font-bold">
            {{ instructionText(currentStep) }}
        </h1>

        <div class="flex flex-row w-full max-w-4xl">
            <!-- options -->
            <div class="flex-1 p-4">
                <div class="space-y-2">
                    <div
                        v-for="(option, index) in stepOptions"
                        :key="`option-${currentStep}-${index}`"
                        class="p-2 shadow-md rounded-lg bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline cursor-pointer"
                        @click="selectOption(option)"
                    >
                        {{ option.title }}
                    </div>
                    <div
                        class="p-2 italic font-sm text-gray-600 hover:underline hover:text-red-600 cursor-pointer"
                        @click="reloadStepOptions(currentStep)"
                    >
                        ... may I please have different choices?
                    </div>
                </div>
            </div>

            <!-- selections -->
            <div class="flex-1 p-4">
                <div class="space-y-2">
                    <div
                        v-for="(selection, index) in filterPlayerSelections()"
                        :key="`selection-${currentStep}-${index}`"
                        class="p-2 shadow-md rounded-lg text-black font-bold py-2 px-4 shadow-outline bg-white"
                    >
                        {{ selection.title }}
                    </div>
                    <div class="text-3xl font-semibold" v-if="choicesLeft == 0">
                        {{ enthusiasticMouthGrunt() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
