import { NextRequest, NextResponse } from 'next/server'
import { validateEnvironment } from '@/lib/config/api-config'
import { supabase } from '@/lib/services/supabase'
import { n8n } from '@/lib/services/n8n'

export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnvironment()

    // Check service health
    const checks = await Promise.allSettled([
      checkSupabase(),
      checkN8n()
    ])

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        supabase: getCheckResult(checks[0]),
        n8n: getCheckResult(checks[1])
      },
      version: process.env.npm_package_version || '1.0.0'
    }

    // Determine overall health
    const allHealthy = Object.values(health.services).every(service => service.status === 'healthy')
    health.status = allHealthy ? 'healthy' : 'degraded'

    return NextResponse.json(health, { 
      status: allHealthy ? 200 : 503 
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function checkSupabase() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1)

    if (error && !error.message.includes('relation "customers" does not exist')) {
      throw error
    }

    return { status: 'healthy', message: 'Connected' }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: error instanceof Error ? error.message : 'Connection failed' 
    }
  }
}

async function checkN8n() {
  try {
    const health = await n8n.healthCheck()
    return { 
      status: health.status === 'healthy' ? 'healthy' : 'unhealthy', 
      message: health.status 
    }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: error instanceof Error ? error.message : 'Connection failed' 
    }
  }
}

function getCheckResult(result: PromiseSettledResult<any>) {
  if (result.status === 'fulfilled') {
    return result.value
  } else {
    return {
      status: 'unhealthy',
      message: result.reason?.message || 'Check failed'
    }
  }
}