<script setup lang="ts">
import { ref, defineModel } from "vue";
import * as _ from "lodash";
import { delay } from "../engine/utilities";
import { Category, Categories } from "../engine/category";
import { Entry } from "../engine/entry";
import RollerVue from "./Roller.vue";

const emit = defineEmits([
    "resetGame",
    "scratchOut",
    "rollClick",
    "tap",
    "winFanfare",
    "optionFanfare",
]);
var playerOptions = defineModel<Entry[]>("playerOptions"); // playerOptions from parent

var finalOptions = ref<Entry[]>([]);

// To be tracked in the parent, and shared with the Roller component
var running = ref<boolean>(false);

var complete = ref<boolean>(false);

var rollValue = ref<number>(0);

// suppressing strict null checks on the tsconfig.json because I'm initializing this to null for
// what I think are valid reasons,
// and the compiler error is annoying me
var highlightObject = ref<Entry | null>(null);

function updateRollValue(value: number) {
    rollValue.value = value;
    processChoices();
}

function isCategoryFinished(category: Category) {
    let categoryLength: number = _.filter(playerOptions.value, {
        category: category,
        enabled: true,
    }).length;
    return categoryLength === 1;
}

// Pretty sure this isn't the most efficient way to get this sorted
// but it's a small list for this project, so I'm willing to risk it
function checkIndexPos(indexPos: number) {
    if (indexPos < 0) {
        return checkIndexPos(0);
    }

    if (indexPos >= playerOptions.value.length) {
        return checkIndexPos(0);
    }

    if (playerOptions.value[indexPos].enabled === false) {
        return checkIndexPos(indexPos + 1);
    }

    if (playerOptions.value[indexPos].enabled === true) {
        if (isCategoryFinished(playerOptions.value[indexPos].category)) {
            return checkIndexPos(indexPos + 1);
        }
        return indexPos;
    }
}

// Here's the meat of the actual logic of the game
// Funny that 99% of this entire project is interface and not game logic
async function processChoices() {
    // starting at -1 because we want to start the tapping loop at the beginning of the list
    let indexPos: number = -1;
    // if the highlightObject isn't nil we start at its index
    if (highlightObject.value !== null) {
        indexPos = playerOptions.value.indexOf(highlightObject.value);
    }

    // and then we move to the next object in the list that doesn't have its disabled property set to true
    // if we reach the end of the list, we start over at the beginning
    // before we stop, we need to determine if this is the last object in its category
    // if it is, then we advance the index without doing anything
    for (let i = 0; i < rollValue.value; i++) {
        indexPos = checkIndexPos(indexPos + 1);
        highlightObject.value = playerOptions.value[indexPos];

        let delayJitter: number = Math.floor(Math.random() * 20) + 10;
        emit("tap");
        await delay(100 + i * delayJitter);
    }

    // If you're here, then we landed on the last valid item. Time to scratch it out.
    highlightObject.value.enabled = false;
    emit("scratchOut");
    running.value = false;
    checkWinCondition();
}

function checkWinCondition() {
    let enabledOptions = _.filter(playerOptions.value, { enabled: true });

    _.each(Categories, (category: Category) => {
        if (isCategoryFinished(category)) {
            let finalOption: Entry = _.find(playerOptions.value, {
                category: category,
                enabled: true,
            });
            if (!finalOptions.value.includes(finalOption)) {
                finalOptions.value.push(finalOption);
                emit("optionFanfare");
            }
        }
    });

    if (enabledOptions.length === 5) {
        emit("winFanfare");
        complete.value = true;
    }
}

// There's probably a better way to get a central bus for signals in vue.
// TODO: pass sounds through an event bus
function emitRollClick() {
    emit("rollClick");
}

function resetGame() {
    emit("resetGame");
}

function entryInFinal(entry: Entry) {
    return finalOptions.value.includes(entry);
}

function finalEntryForCategory(category: Category) {
    return _.find(finalOptions.value, { category: category });
}

function finalTextForCategory(category: Category): string {
    let finalEntry = finalEntryForCategory(category);
    if (finalEntry) {
        // if the final entry title begins with "A " or "An ", we want to lowercase the first letter
        // because looking at an internal capital A is driving me bonkers
        let title: string = finalEntry.title;
        if (title.startsWith("A ")) {
            title = title.replace("A ", "a ");
        }
        if (title.startsWith("An ")) {
            title = title.replace("An ", "an ");
        }
        return `${category.description} ${title}.`;
    }
    return "";
}

function filterOptionsByCategory(category: Category) {
    return _.filter(playerOptions.value, { category: category });
}
</script>

<template>
    <div class="mt-8">
        <div class="flex">
            <!-- Left Column: w-1/4 of the container -->
            <div class="w-1/4">
                <RollerVue
                    @rollValue="updateRollValue"
                    @rollClick="emitRollClick"
                    v-model:running="running"
                    v-if="!complete"
                />
                <div v-if="complete">
                    <button
                        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                        @click="resetGame"
                    >
                        Play Again?
                    </button>
                </div>
            </div>

            <div class="w-3/4 flex flex-wrap">
                <div
                    class="w-1/2 flex justify-between"
                    v-for="category in Categories"
                >
                    <div v-if="finalEntryForCategory(category)">
                        {{ finalTextForCategory(category) }}
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-wrap -mx-2">
            <div
                v-for="(category, catIndex) in Categories"
                :key="`category-${catIndex}`"
                class="p-5 w-1/3"
            >
                <div class="m-2 border-b-2 font-bold">
                    {{ category.name }}
                </div>
                <div class="m-2">
                    <!-- Woof, this is an ugly nested ternary -->
                    <div
                        v-for="(entry, entryIndex) in filterOptionsByCategory(
                            category,
                        )"
                        :key="`entry-${entryIndex}`"
                        class="m-2 p-2"
                        :class="
                            entry == highlightObject
                                ? 'bg-yellow-300 rounded-lg dark:text-black'
                                : entryInFinal(entry)
                                  ? 'bg-blue-300 rounded-lg dark:text-black'
                                  : ''
                        "
                    >
                        <div class="flex justify-between">
                            <div :class="entry.enabled ? '' : 'line-through'">
                                {{ entry.title }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
