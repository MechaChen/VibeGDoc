import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});


app.post("/ghost-text", async (req, res) => {
    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "developer",
                content: `You are an assistant that helps users continue their writing. Respond with only the most natural next sentence based on the user's input. and give one space before sentence.`
            },
            {
                role: "user",
                content: req.body.context,
            },
        ],
        // a sentence is approximately 20 tokens
        max_tokens: 20,
    });

    res.send(completion.choices[0]?.message.content);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});