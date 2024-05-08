<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import { SSE } from 'sse.js'

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
    console.log('onmessage', e)

    console.log(e.data) ////
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
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <form class="flex" @submit.prevent>
        <div>Chat input</div>
        <input type="text" v-model="chatInput" />
        <button @click="send" :disabled="!chatInput">Send</button>
        <div>Chat output</div>
        <div>{{ chatOutput }}</div>
      </form>

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
