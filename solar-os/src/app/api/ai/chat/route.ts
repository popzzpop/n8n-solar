import { NextRequest, NextResponse } from 'next/server'
import { ai } from '@/lib/services/openrouter'
import type { ChatMessage } from '@/lib/services/openrouter'

export async function POST(request: NextRequest) {
  try {
    const { messages, model, temperature, maxTokens, stream } = await request.json()

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ 
        error: 'Messages array is required' 
      }, { status: 400 })
    }

    // Add system message for solar company context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are an AI assistant for a solar company management system. You help with:
      - Customer inquiries and support
      - Solar system design and recommendations  
      - Installation scheduling and logistics
      - Sales support and quote generation
      - Business operations and automation
      
      Be professional, knowledgeable about solar energy, and always prioritize customer satisfaction.
      When handling technical questions, provide accurate information about solar panels, inverters, and installation processes.`
    }

    const enhancedMessages: ChatMessage[] = [systemMessage, ...messages]

    if (stream) {
      // Handle streaming response
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            await ai.chatStream({
              model,
              messages: enhancedMessages,
              temperature,
              maxTokens
            }, (chunk) => {
              const data = `data: ${JSON.stringify({ content: chunk })}\n\n`
              controller.enqueue(encoder.encode(data))
            })
            
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        }
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Handle regular response
      const response = await ai.chat({
        model,
        messages: enhancedMessages,
        temperature,
        maxTokens
      })

      return NextResponse.json(response)
    }
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ 
      error: 'Failed to process chat request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Solar Company AI Chat API',
    endpoints: {
      POST: 'Send chat messages to AI',
      parameters: {
        messages: 'Array of chat messages',
        model: 'AI model to use (optional)',
        temperature: 'Response randomness (0-1)',
        maxTokens: 'Maximum response length',
        stream: 'Enable streaming response'
      }
    },
    models: {
      default: 'anthropic/claude-3.5-sonnet',
      alternatives: ['openai/gpt-4-turbo', 'openai/gpt-3.5-turbo']
    }
  })
}