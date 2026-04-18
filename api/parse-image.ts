import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
})

const STATUS_MAP: Record<string, string> = {
  '网申': 's1', '投递': 's1', '已投递': 's1',
  '笔试': 's2', '测评': 's2', '笔试/测评': 's2', '在线测评': 's2',
  '一面': 's3', '初试': 's3', '电话面试': 's3', '视频面试': 's3',
  '二面': 's4', '复试': 's4', '终面': 's4',
  'Offer': 's5', 'offer': 's5', '已Offer': 's5',
}

const PROMPT = `你是一个求职申请信息提取助手。请仔细分析这张截图，提取所有可见的求职申请记录。

对于每条记录，请提取：
- companyName: 公司名称（字符串）
- jobTitle: 职位/岗位名称（字符串）
- status: 当前状态，从以下选项中选一个：网申、笔试、一面、二面、Offer（字符串）
- deadline: 截止日期，如果截图中有明确的截止日期则用 ISO 8601 格式（YYYY-MM-DDTHH:mm:ss），否则为 null

只返回一个合法的 JSON 数组，不要有任何其他说明文字。格式示例：
[
  {"companyName": "美团", "jobTitle": "产品经理", "status": "网申", "deadline": null},
  {"companyName": "字节跳动", "jobTitle": "前端工程师", "status": "一面", "deadline": "2024-04-20T23:59:00"}
]`

export default async function handler(
  req: { method: string; body: { image: string; mimeType: string } },
  res: {
    status: (code: number) => {
      json: (data: unknown) => void
      end: () => void
    }
  }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { image, mimeType } = req.body ?? {}
  if (!image || !mimeType) {
    return res.status(400).json({ error: 'Missing image or mimeType' })
  }

  try {
    const response = await client.chat.completions.create({
      model: 'glm-4v-plus',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${image}` },
            } as { type: 'image_url'; image_url: { url: string } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
      max_tokens: 2000,
    })

    const text = response.choices[0]?.message?.content ?? '[]'
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const parsed: Array<{
      companyName: string
      jobTitle: string
      status: string
      deadline: string | null
    }> = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    const applications = parsed
      .filter((item) => item.companyName && item.jobTitle)
      .map((item, i) => ({
        id:          `ai_${Date.now()}_${i}`,
        companyName: item.companyName,
        jobTitle:    item.jobTitle,
        statusId:    STATUS_MAP[item.status] ?? 's1',
        deadline:    item.deadline ?? undefined,
        confidence:  88,
      }))

    return res.status(200).json({ applications })
  } catch (err) {
    console.error('[parse-image]', err)
    return res.status(500).json({ error: 'AI 解析失败，请重试' })
  }
}
