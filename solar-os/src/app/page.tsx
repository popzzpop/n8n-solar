import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            Solar Company OS ☀️
          </h1>
          
          <p className="text-xl mb-12 text-gray-600">
            Complete automation platform for solar company operations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* System Health */}
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold mb-4">System Health</h2>
              <Link 
                href="/api/health" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
              >
                Check API Status →
              </Link>
            </div>

            {/* AI Chat */}
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold mb-4">AI Assistant</h2>
              <p className="text-gray-600 mb-4">
                OpenRouter-powered AI for solar operations
              </p>
              <Link 
                href="/api/ai/chat" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
              >
                API Documentation →
              </Link>
            </div>

            {/* n8n Integration */}
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold mb-4">Automation Engine</h2>
              <p className="text-gray-600 mb-4">
                n8n workflows for business automation
              </p>
              <Link 
                href="https://n8n-production-b56e.up.railway.app" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
              >
                Open n8n Dashboard →
              </Link>
            </div>

            {/* Supabase Database */}
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold mb-4">Database</h2>
              <p className="text-gray-600 mb-4">
                Supabase PostgreSQL with real-time features
              </p>
              <Link 
                href="https://boxgypzqwqqeubnwojdl.supabase.co" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
              >
                Open Supabase →
              </Link>
            </div>

            {/* Google Workspace */}
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold mb-4">Google Services</h2>
              <p className="text-gray-600 mb-4">
                Gmail, Calendar, Drive integration
              </p>
              <span className="text-yellow-600">
                Setup Required
              </span>
            </div>

            {/* Coming Soon */}
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow opacity-60">
              <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
              <p className="text-gray-600 mb-4">
                Interactive management interface
              </p>
              <span className="text-gray-500">
                Coming Soon...
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Current Status</h2>
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span>✅ Next.js Project Initialized</span>
              </div>
              <div className="flex justify-between">
                <span>✅ Environment Configuration</span>
              </div>
              <div className="flex justify-between">
                <span>✅ Supabase Client Setup</span>
              </div>
              <div className="flex justify-between">
                <span>✅ n8n Integration Ready</span>
              </div>
              <div className="flex justify-between">
                <span>✅ OpenRouter AI Configured</span>
              </div>
              <div className="flex justify-between">
                <span>✅ API Routes Created</span>
              </div>
              <div className="flex justify-between">
                <span>🔄 Google OAuth Setup Needed</span>
              </div>
              <div className="flex justify-between">
                <span>⏳ Database Schema Pending</span>
              </div>
              <div className="flex justify-between">
                <span>⏳ Dashboard UI Pending</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>🤖 Built with Claude Code</p>
            <p>Ready for solar company automation</p>
          </div>
        </div>
      </div>
    </main>
  )
}