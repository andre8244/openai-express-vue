<script setup lang="ts">
import { ref } from 'vue'
import { SSE } from 'sse.js'
import { NeTextInput, NeButton, focusElement } from '@nethesis/vue-components'
import ColoredSkeleton from '@/components/ColoredSkeleton.vue'
import { useScroll } from '@vueuse/core'
import markdownit from 'markdown-it'

type ChatMessage = {
  content: string
  role: string
}

const chatInput = ref('')
const chatInputRef = ref()
const chatOutput = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const messagesRef = ref<HTMLElement | null>(null)
const { arrivedState } = useScroll(messagesRef)
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true
})

const result = md.render(`\`\`\`
markdown`) ////
console.log(result) ////

async function send() {
  if (!chatInput.value) {
    return
  }

  const userMessage = { role: 'user', content: chatInput.value } as ChatMessage
  chatMessages.value.push(userMessage)
  isLoading.value = true

  var source = new SSE('http://localhost:3000/chat', {
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify({ msg: chatInput.value })
  })

  chatInput.value = ''

  source.onopen = (e: any) => {
    console.log('sse onopen', e)
  }

  source.onerror = (e: any) => {
    console.log('sse onerror', e)
    isLoading.value = false
  }

  source.addEventListener('message', (e: any) => {
    // console.log('onmessage', e) ////
    // console.log(e.data) ////

    chatOutput.value += e.data

    // if scroll position is at the bottom of messages, continue to scroll
    if (arrivedState.bottom) {
      scrollToBottom()
    }

    // // Assuming we receive JSON-encoded data payloads: ////
    // var payload = JSON.parse(e.data)
    // console.log(payload)
  })

  source.addEventListener('eos', (e: any) => {
    console.log('on eos', e)
    //   evtSource.close() ////

    const assistantMessage = { role: 'assistant', content: chatOutput.value } as ChatMessage
    chatMessages.value.push(assistantMessage)

    // chatOutput.value = '' ////
    console.log('chatOutput.value', chatOutput.value) ////

    isLoading.value = false
    focusElement(chatInputRef)
  })

  // scroll to bottom of messages
  scrollToBottom()
}

function scrollToBottom() {
  setTimeout(() => {
    messagesRef.value?.scrollTo(0, messagesRef.value.scrollHeight)
  }, 50)
}
</script>

<template>
  <div class="flex flex-col h-screen p-6 max-w-3xl m-auto">
    <!-- header -->
    <div>
      <h1 class="text-3xl font-medium text-primary-700 dark:text-primary-500 mb-8">
        openai-express-vue
      </h1>
    </div>
    <!-- messages -->
    <div ref="messagesRef" class="flex flex-col items-start gap-4 overflow-y-auto flex-1">
      <!-- is it safe to use v-html here? -->
      <div
        v-for="(message, index) in chatMessages"
        :key="index"
        :class="[
          'rounded-xl bg-gray-800 p-5 max-w-md',
          { 'self-end bg-primary-900': message.role == 'user' }
        ]"
        v-html="md.render(message.content)"
      />
      <div v-if="isLoading" class="rounded-xl bg-gray-800 p-5 max-w-md">
        <!-- <div v-if="chatOutput.length" v-html="md.render(chatOutput)" /> ////  -->
        <div v-if="chatOutput.length">{{ chatOutput }}</div>
        <ColoredSkeleton
          v-else
          :lines="2"
          colorClasses="bg-primary-300 dark:bg-primary-700"
          size="sm"
          class="w-80"
        />
      </div>
    </div>
    <!-- user input -->
    <form class="flex gap-4 py-4" @submit.prevent>
      <NeTextInput
        v-model.trim="chatInput"
        placeholder="Message"
        :disabled="isLoading"
        ref="chatInputRef"
        class="grow"
      />
      <NeButton type="submit" kind="primary" @click="send" :disabled="isLoading">Send</NeButton>
    </form>
  </div>
</template>
