const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const port = 3000;
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI();
// const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] }); // This is the default and can be omitted

const chatMessages = [
  {
    role: "system",
    content: "You are a helpful assistant"
  }
];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// api supporting server-sent events
app.get("/events", async function (req, res) {
  console.log("Got /events");

  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive"
  });
  res.flushHeaders();

  // Tell the client to retry every 10 seconds if connectivity is lost
  res.write("retry: 10000\n\n");
  let count = 0;

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Emit", ++count);
    // Emit an SSE that contains the current 'count' as a string
    res.write(`data: ${count}\n\n`);
  }
});

app.get("/test", async (req, res) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Say this is a test" }],
    model: "gpt-4o-mini"
  });

  console.log(chatCompletion.choices[0]);
  res.send(chatCompletion.choices[0]);
});

app.post("/chat", async (req, res) => {
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive"
  });
  res.flushHeaders();

  console.log("msg", req.body.msg); ////
  const msg = req.body.msg;

  chatMessages.push({ role: "user", content: msg });

  console.log("\nchatMessages:"); ////
  console.log(chatMessages); ////

  // Tell the client to retry if connectivity is lost
  res.write("retry: 15000\n\n");

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: chatMessages,
    stream: true
  });

  let assistantMessage = "";

  for await (const chunk of stream) {
    chunkContent = chunk.choices[0]?.delta?.content || "";

    if (chunkContent) {
      // console.log(`chunkContent: .${chunkContent}.`);
      // process.stdout.write(chunkContent); ////
      res.write(`data: ${chunkContent}\n\n`);
      assistantMessage += chunkContent;
    }
  }
  chatMessages.push({ role: "assistant", content: assistantMessage });

  // send end of stream event
  res.write(`event: eos\ndata: #\n\n`);

  console.log("\nEnd of stream");
  res.end();
});

app.get("/stream", async (req, res) => {
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive"
  });
  res.flushHeaders();

  // Tell the client to retry if connectivity is lost
  res.write("retry: 15000\n\n");

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Count from 1 to 3" }],
    stream: true
  });

  for await (const chunk of stream) {
    // console.log("chunk", chunk);
    chunkContent = chunk.choices[0]?.delta?.content || "";

    if (chunkContent) {
      // console.log(`chunkContent: .${chunkContent}.`);
      // process.stdout.write(chunkContent); ////
      res.write(`data: ${chunkContent}\n\n`);
    }
  }

  // send end of stream event
  res.write(`event: eos\ndata: #\n\n`);

  console.log("\nEnd of stream");
  res.end();
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
