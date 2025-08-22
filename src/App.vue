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
      <input type="text" class="input" />
      <TypeWriter
        :text="str"
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
const str = "Radiant beams for creative user interfaces";
</script>

<style scoped lang="less">
.typeWriter {
  text-align: center;
  width: 80%;
  margin-top: 200px;
  font-size: 70px;
  font-weight: 1000;
  color: #fff;
}
.beams-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
}
.content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .input {
    width: 70%;
    height: 60px;
    border: none;
    border-radius: 30px;
    padding: 5px;
    opacity: 0.2;
    margin-top: 80px;
  }
}
</style>
