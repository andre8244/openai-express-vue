<script setup lang="ts">
import { ref } from 'vue'
import { SSE } from 'sse.js'
import { NeTextInput, NeButton, focusElement } from '@nethesis/vue-components'
import ColoredSkeleton from '@/components/ColoredSkeleton.vue'

type ChatMessage = {
  content: string
  role: string
}

const chatInput = ref('')
const chatInputRef = ref()
const chatOutput = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isLoading = ref(false)

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

    // // Assuming we receive JSON-encoded data payloads: ////
    // var payload = JSON.parse(e.data)
    // console.log(payload)
  })

  source.addEventListener('eos', (e: any) => {
    console.log('on eos', e)
    //   evtSource.close() ////

    const assistantMessage = { role: 'assistant', content: chatOutput.value } as ChatMessage
    chatMessages.value.push(assistantMessage)
    chatOutput.value = ''
    isLoading.value = false
    focusElement(chatInputRef)
  })
}
</script>

<template>
  <div class="p-6 space-y-6 max-w-2xl m-auto">
    <h1 class="text-3xl font-bold text-primary-700 dark:text-primary-500">openai-express-vue</h1>

    <form class="flex flex-col space-y-6" @submit.prevent>
      <div class="flex flex-col items-start gap-4">
        <div
          v-for="(message, index) in chatMessages"
          :key="index"
          :class="[
            'rounded-xl bg-gray-800 p-5 max-w-96',
            { 'self-end bg-primary-900': message.role !== 'user' }
          ]"
        >
          {{ message.content }}
        </div>
        <div v-if="isLoading" class="rounded-xl bg-primary-900 p-5 max-w-96 self-end">
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
      <NeTextInput
        v-model.trim="chatInput"
        placeholder="Message"
        :disabled="isLoading"
        ref="chatInputRef"
      />
      <NeButton type="submit" kind="primary" @click="send" :disabled="isLoading">Send</NeButton>
    </form>
  </div>
</template>
