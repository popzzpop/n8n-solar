import { apiConfig } from '@/lib/config/api-config'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  model?: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface ChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: ChatMessage
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenRouterService {
  private apiKey: string
  private baseUrl: string
  private defaultModel: string

  constructor() {
    this.apiKey = apiConfig.openrouter.apiKey
    this.baseUrl = apiConfig.openrouter.baseUrl
    this.defaultModel = apiConfig.openrouter.defaultModel
  }

  // Main chat completion method
  async chat(options: ChatOptions): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://solar-os.com', // Replace with your domain
          'X-Title': 'Solar Company OS'
        },
        body: JSON.stringify({
          model: options.model || this.defaultModel,
          messages: options.messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000,
          top_p: options.topP || 1,
          frequency_penalty: options.frequencyPenalty || 0,
          presence_penalty: options.presencePenalty || 0,
          stream: options.stream || false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      console.error('OpenRouter chat error:', error)
      throw error
    }
  }

  // Streaming chat completion
  async chatStream(options: ChatOptions, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://solar-os.com',
          'X-Title': 'Solar Company OS'
        },
        body: JSON.stringify({
          model: options.model || this.defaultModel,
          messages: options.messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader available')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (parseError) {
              console.error('Error parsing stream chunk:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenRouter stream error:', error)
      throw error
    }
  }

  // Get available models
  async getModels(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting models:', error)
      throw error
    }
  }

  // Simple text completion wrapper
  async complete(prompt: string, options: Partial<ChatOptions> = {}): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ]

    const response = await this.chat({
      ...options,
      messages
    })

    return response.choices[0]?.message?.content || ''
  }

  // Business-specific AI helpers
  async generateQuote(customerInfo: any, systemRequirements: any): Promise<string> {
    const prompt = `Generate a professional solar installation quote for the following customer:
    
Customer: ${JSON.stringify(customerInfo, null, 2)}
System Requirements: ${JSON.stringify(systemRequirements, null, 2)}

Please include:
- System specifications
- Estimated cost breakdown
- Installation timeline
- Warranty information
- Financial benefits/ROI
- Next steps

Format as professional proposal text.`

    return this.complete(prompt)
  }

  async analyzeEmail(emailContent: string): Promise<{
    intent: string
    priority: 'low' | 'medium' | 'high'
    category: string
    suggestedResponse: string
  }> {
    const prompt = `Analyze this email and provide analysis in JSON format:

Email: "${emailContent}"

Return JSON with:
{
  "intent": "brief description of what customer wants",
  "priority": "low/medium/high",
  "category": "inquiry/complaint/support/sales/other",
  "suggestedResponse": "brief suggested response"
}`

    const response = await this.complete(prompt, { temperature: 0.3 })
    
    try {
      return JSON.parse(response)
    } catch (error) {
      return {
        intent: 'Unable to parse email',
        priority: 'medium',
        category: 'other',
        suggestedResponse: 'Please review this email manually.'
      }
    }
  }

  async optimizeSchedule(jobs: any[], crews: any[], constraints: any[]): Promise<any> {
    const prompt = `Optimize this job schedule for maximum efficiency:

Jobs: ${JSON.stringify(jobs, null, 2)}
Available Crews: ${JSON.stringify(crews, null, 2)}
Constraints: ${JSON.stringify(constraints, null, 2)}

Consider:
- Travel time between jobs
- Crew expertise match
- Priority levels
- Weather conditions
- Material availability

Return optimized schedule as JSON.`

    const response = await this.complete(prompt, { temperature: 0.2 })
    
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Schedule optimization parsing failed:', error)
      return { error: 'Failed to optimize schedule' }
    }
  }
}

// Export singleton instance
export const ai = new OpenRouterService()

// Convenience functions
export const chat = (options: ChatOptions) => ai.chat(options)
export const chatStream = (options: ChatOptions, onChunk: (chunk: string) => void) => ai.chatStream(options, onChunk)
export const complete = (prompt: string, options?: Partial<ChatOptions>) => ai.complete(prompt, options)
export const generateQuote = (customerInfo: any, systemRequirements: any) => ai.generateQuote(customerInfo, systemRequirements)
export const analyzeEmail = (emailContent: string) => ai.analyzeEmail(emailContent)
export const optimizeSchedule = (jobs: any[], crews: any[], constraints: any[]) => ai.optimizeSchedule(jobs, crews, constraints)

export default ai