<script setup lang="ts">
// 导入 Vue 组合式 API 和 GSAP 动画库
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  useTemplateRef,
} from "vue";
import { gsap } from "gsap";

// 定义组件 Props 接口
interface TextTypeProps {
  className?: string; // 容器元素的附加 CSS 类名
  showCursor?: boolean; // 是否显示光标
  hideCursorWhileTyping?: boolean; // 打字时是否隐藏光标
  cursorCharacter?: string; // 光标使用的字符
  cursorBlinkDuration?: number; // 光标闪烁动画的持续时间（秒）
  cursorClassName?: string; // 光标元素的附加 CSS 类名
  text: string | string[]; // 要打字显示的文本或文本数组
  as?: string; // 渲染的容器元素标签
  typingSpeed?: number; // 打字速度（毫秒/字符）
  initialDelay?: number; // 开始打字前的初始延迟（毫秒）
  pauseDuration?: number; // 打完一句后暂停的时间（毫秒）
  deletingSpeed?: number; // 删除速度（毫秒/字符）
  loop?: boolean; // 是否循环播放动画
  textColors?: string[]; // 可选的文本颜色数组（按句子索引循环）
  variableSpeed?: { min: number; max: number }; // 随机速度范围（毫秒）
  onSentenceComplete?: (sentence: string, index: number) => void; // 一句打完时的回调函数
  startOnVisible?: boolean; // 是否在元素可见时才开始动画（使用 Intersection Observer）
  reverseMode?: boolean; // 是否反向显示文本（从右向左打字）
}

// 使用 withDefaults 为 Props 提供默认值
const props = withDefaults(defineProps<TextTypeProps>(), {
  as: "div",
  typingSpeed: 50,
  initialDelay: 0,
  pauseDuration: 1000,
  deletingSpeed: 30,
  loop: false,
  className: "",
  showCursor: true,
  hideCursorWhileTyping: false,
  cursorCharacter: "|",
  cursorBlinkDuration: 0.5,
  textColors: () => [],
  startOnVisible: false,
  reverseMode: false,
});

// 定义响应式变量
const displayedText = ref(""); // 当前显示的文本内容
const currentCharIndex = ref(0); // 当前正在打字的字符索引
const isDeleting = ref(false); // 当前是否处于删除模式
const currentTextIndex = ref(0); // 当前正在处理的文本数组索引
const isVisible = ref(!props.startOnVisible); // 组件是否可见/应开始动画（如果 startOnVisible 为 false，则默认为 true）
const cursorRef = useTemplateRef("cursorRef"); // 光标元素的模板引用
const containerRef = useTemplateRef("containerRef"); // 容器元素的模板引用（用于 Intersection Observer）

// 计算属性：确保 text 始终是数组形式
const textArray = computed(() =>
  Array.isArray(props.text) ? props.text : [props.text]
);

// 方法：获取随机速度（如果启用了 variableSpeed）
const getRandomSpeed = () => {
  if (!props.variableSpeed) return props.typingSpeed;
  const { min, max } = props.variableSpeed;
  return Math.random() * (max - min) + min;
};

// 方法：根据当前文本索引获取对应的颜色
const getCurrentTextColor = () => {
  if (!props.textColors.length) return "#ffffff"; // 默认白色
  return props.textColors[currentTextIndex.value % props.textColors.length];
};

// 用于存储 setTimeout 的返回值，以便清理
let timeout: ReturnType<typeof setTimeout> | null = null;

// 方法：清理现有的 timeout（如果存在）
const clearTimeoutIfNeeded = () => {
  if (timeout) clearTimeout(timeout);
};

// 核心方法：执行打字动画的逻辑
const executeTypingAnimation = () => {
  const currentText = textArray.value[currentTextIndex.value];
  // 如果启用了反向模式，则将文本反转
  const processedText = props.reverseMode
    ? currentText.split("").reverse().join("")
    : currentText;

  if (isDeleting.value) {
    // 处理删除逻辑
    if (displayedText.value === "") {
      // 如果已删除完毕
      isDeleting.value = false;
      // 如果到达最后一句话且不循环，则停止
      console.log(currentTextIndex.value, textArray.value.length - 1);
      if (currentTextIndex.value === textArray.value.length - 1 && !props.loop)
        return;

      // 触发一句完成的回调
      props.onSentenceComplete?.(
        textArray.value[currentTextIndex.value],
        currentTextIndex.value
      );

      // 移动到下一句文本，循环回到第一句
      currentTextIndex.value =
        (currentTextIndex.value + 1) % textArray.value.length;
      currentCharIndex.value = 0;
      // 设置一个暂停超时，然后再开始下一句
      timeout = setTimeout(() => {}, props.pauseDuration);
    } else {
      // 继续删除字符
      timeout = setTimeout(() => {
        displayedText.value = displayedText.value.slice(0, -1);
      }, props.deletingSpeed);
    }
  } else {
    // 处理打字逻辑
    if (currentCharIndex.value < processedText.length) {
      // 如果还有字符要打
      timeout = setTimeout(
        () => {
          // 添加下一个字符到显示文本
          displayedText.value += processedText[currentCharIndex.value];
          currentCharIndex.value += 1;
        },
        // 使用随机速度或固定速度
        props.variableSpeed ? getRandomSpeed() : props.typingSpeed
      );
    } else if (textArray.value.length > 1) {
      // 如果有多句文本，打完一句后暂停，然后开始删除
      timeout = setTimeout(() => {
        isDeleting.value = true;
      }, props.pauseDuration);
    } else if (currentCharIndex.value === processedText.length) {
      console.log(currentCharIndex.value, processedText.length);
      // 句子输出完成
      props.onSentenceComplete?.(
        textArray.value[currentTextIndex.value],
        currentTextIndex.value
      );
    }
    // 如果只有一句文本，打完后就保持显示，不会删除（除非 loop 为 true 且有多句文本）
  }
};

// 监视多个响应式变量，驱动动画进行
watch(
  [displayedText, currentCharIndex, isDeleting, isVisible],
  () => {
    // 如果组件不可见（由于 startOnVisible），则不执行动画
    if (!isVisible.value) return;
    // 清理之前的超时
    clearTimeoutIfNeeded();

    // 检查是否是动画的初始状态
    if (
      currentCharIndex.value === 0 &&
      !isDeleting.value &&
      displayedText.value === ""
    ) {
      // 应用初始延迟
      timeout = setTimeout(() => {
        executeTypingAnimation();
      }, props.initialDelay);
    } else {
      // 正常执行动画步骤
      executeTypingAnimation();
    }
  },
  { immediate: true } // 组件创建时立即执行一次
);

// 生命周期：组件挂载后
onMounted(() => {
  // 如果显示光标，设置 GSAP 闪烁动画
  if (props.showCursor && cursorRef.value) {
    gsap.set(cursorRef.value, { opacity: 1 });
    gsap.to(cursorRef.value, {
      opacity: 0,
      duration: props.cursorBlinkDuration,
      repeat: -1, // 无限循环
      yoyo: true, // 往返动画
      ease: "power2.inOut",
    });
  }

  // 如果设置了 startOnVisible，则设置 Intersection Observer
  if (props.startOnVisible && containerRef.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 当元素进入视口时，将 isVisible 设为 true 以触发动画
          if (entry.isIntersecting) isVisible.value = true;
        });
      },
      { threshold: 0.1 } // 当 10% 的元素可见时触发
    );
    // 确保 containerRef 是一个 Element
    if (containerRef.value instanceof Element) {
      observer.observe(containerRef.value);
    }
    // 组件卸载前断开观察器
    onBeforeUnmount(() => observer.disconnect());
  }
});

// 生命周期：组件卸载前
onBeforeUnmount(() => {
  // 清理超时，防止内存泄漏
  clearTimeoutIfNeeded();
});
</script>

<template>
  <!-- 动态组件，根容器 -->
  <component
    :is="as"
    ref="containerRef"
    :class="`inline-block whitespace-pre-wrap tracking-tight ${className}`"
    v-bind="$attrs"
  >
    <!-- 显示动态文本，应用颜色 -->
    <span class="inline" :style="{ color: getCurrentTextColor() }">
      {{ displayedText }}
    </span>
    <!-- 条件渲染光标 -->
    <span
      v-if="showCursor"
      ref="cursorRef"
      :class="`ml-1 inline-block opacity-100 ${
        // 如果设置了 hideCursorWhileTyping 并且正在打字或删除，则隐藏光标
        hideCursorWhileTyping &&
        (currentCharIndex < textArray[currentTextIndex].length || isDeleting)
          ? 'hidden'
          : ''
      } ${cursorClassName}`"
    >
      {{ cursorCharacter }}
    </span>
  </component>
</template>
