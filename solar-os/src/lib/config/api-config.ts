// API Configuration
export const apiConfig = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // n8n
  n8n: {
    apiUrl: process.env.N8N_API_URL!,
    apiKey: process.env.N8N_API_KEY!,
    webhookSecret: process.env.N8N_WEBHOOK_SECRET!,
  },

  // OpenRouter
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    fallbackModel: 'openai/gpt-4-turbo',
  },

  // Google Services
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!,
    serviceAccountBase64: process.env.GOOGLE_SERVICE_ACCOUNT_BASE64,
  },

  // Communication Services
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },

  // Security
  jwt: {
    secret: process.env.JWT_SECRET!,
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY!,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // Limit each IP to 100 requests per windowMs
  },

  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Webhook settings
  webhooks: {
    timeout: 30000, // 30 seconds
    retries: 3,
  },
}

// Validate required environment variables
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'N8N_API_URL',
    'N8N_API_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export default apiConfig