import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Solar Company OS is running!',
    timestamp: new Date().toISOString(),
    services: {
      nextjs: '✅ Running',
      supabase: '⚠️  Configuration needed',
      n8n: '⚠️  Configuration needed',
      openrouter: '⚠️  API key needed',
      google: '⚠️  OAuth setup needed'
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Solar Company OS API', 
    method: 'POST endpoint ready' 
  })
}