<template>
  <div :class="className">{{ displayText }}</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

// 定义组件 Props 接口
interface TextTypeProps {
  text: string | string[]; // 要打字显示的文本或文本数组
  typingSpeed: number; // 打字速度（毫秒）
  pauseDuration: number; // 暂停时间（毫秒）
  className: string | string[]; // 类名
  timeoutStart: number; // 开始时间（毫秒）
}
// 使用 withDefaults 为 Props 提供默认值
const props = withDefaults(defineProps<TextTypeProps>(), {
  typingSpeed: 100,
  pauseDuration: 1000,
  className: () => [],
  timeoutStart: 0,
});
const emit = defineEmits(["onSentenceComplete", "onSentenceStart"]);
const displayText = ref("");
const interval = ref(); // 定时器
const curTextIndex = ref(0); // 当前正在处理的文本数组索引
const startTimer = ref(); // 超时定时器

// 开始打字
const startWord = () => {
  emit("onSentenceStart");
  interval.value = setInterval(() => {
    if (displayText.value.length === props.text.length) {
      clearInterval(interval.value);
      clearTimeout(startTimer.value);
      emit("onSentenceComplete");
      return;
    }
    displayText.value += props.text[curTextIndex.value];
    curTextIndex.value++;
  }, props.typingSpeed);
};

onMounted(() => {
  // 开始打字
  startTimer.value = setTimeout(() => {
    startWord();
  }, props.timeoutStart);
});

onUnmounted(() => {
  clearInterval(interval.value);
  clearTimeout(startTimer.value);
});
</script>

<style scoped></style>
