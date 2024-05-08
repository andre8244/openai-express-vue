<script setup lang="ts">
import { ref } from 'vue'
import { SSE } from 'sse.js'
import { NeTextInput, NeButton } from '@nethesis/vue-components'

const chatInput = ref('')
const chatOutput = ref('')

async function send() {
  chatOutput.value = ''

  var source = new SSE('http://localhost:3000/chat', {
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify({ msg: chatInput.value })
  })

  source.onopen = (e: any) => {
    console.log('sse onopen', e)
  }

  source.onerror = (e: any) => {
    console.log('sse onerror', e)
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
    //   evtSource.close()
  })
}
</script>

<template>
  <div class="p-6 space-y-6 max-w-2xl m-auto">
    <h1 class="text-3xl font-bold text-primary-700 dark:text-primary-500">openai-express-vue</h1>

    <form class="flex flex-col space-y-6" @submit.prevent>
      <NeTextInput v-model.trim="chatInput" placeholder="Message" />
      <NeButton type="submit" kind="primary" @click="send" :disabled="!chatInput">Send</NeButton>
      <div>{{ chatOutput }}</div>
    </form>

    <!-- <nav> //// 
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav> -->

    <!-- <RouterView /> ////  -->
  </div>
</template>
