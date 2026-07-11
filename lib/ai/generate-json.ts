import { z } from "zod";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai-client";

type GenerateJsonInput<T> = {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  temperature: number;
};

export async function generateJson<T>({
  systemPrompt,
  userPrompt,
  schema,
  temperature,
}: GenerateJsonInput<T>): Promise<T> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: getOpenAIModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("AIから返答がありませんでした。");

  return schema.parse(JSON.parse(raw));
}
