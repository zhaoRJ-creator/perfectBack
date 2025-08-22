<template>
  <!-- <TextType
    :text="['你好，我是打字机！']"
    :typingSpeed="75"
    :pauseDuration="1500"
    :showCursor="false"
    cursorCharacter="|"
    :textColors="['red', 'green', 'blue']"
    :onSentenceComplete="handleSentenceComplete"
  /> -->

  <div class="beams-container">
    <Back
      :beam-width="2"
      :beam-height="25"
      :beam-number="12"
      :light-color="'rgb(169,118,193)'"
      :speed="2"
      :noise-intensity="1.75"
      :scale="0.2"
      :rotation="25"
    />
    <div class="content">
      <TypeWriter
        :text="'你好，我是打字机！'"
        :typingSpeed="200"
        :pauseDuration="1500"
        :className="['typeWriter']"
        :timeoutStart="1000"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// import TextType from "./components/text.vue";
import TypeWriter from "./components/typeWriter.vue";
import Back from "./components/back.vue";
</script>

<style scoped>
.typeWriter {
  font-weight: bold;
  color: pink;
}
.beams-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
}
.content{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
