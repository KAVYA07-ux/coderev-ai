import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a senior software engineer doing a code review.
Analyze the code for:
1. Bugs and logic errors
2. Security vulnerabilities (XSS, SQL injection, etc.)
3. Performance issues
4. Code style and readability

Respond ONLY with valid JSON in this format:
{
  "summary": "...",
  "bugs": ["..."],
  "security": ["..."],
  "suggestions": ["..."],
  "fixedCode": "..."
}

Be specific. Reference line numbers where possible.`;

export async function reviewCode(code: string, language: string) {
  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ],
    stream: true,
    temperature: 0.3,
    max_tokens: 4096,
  });

  return stream;
}
