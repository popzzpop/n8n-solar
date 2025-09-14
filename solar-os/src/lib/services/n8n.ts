import { apiConfig } from '@/lib/config/api-config'

export interface N8nWorkflow {
  id: string
  name: string
  active: boolean
  nodes: any[]
  connections: any
  settings: any
}

export interface N8nExecution {
  id: string
  workflowId: string
  mode: string
  status: 'running' | 'success' | 'error' | 'waiting'
  startedAt: string
  finishedAt?: string
  data?: any
}

export interface WebhookPayload {
  event: string
  data: any
  timestamp: string
  source: string
}

export class N8nService {
  private apiUrl: string
  private apiKey: string

  constructor() {
    this.apiUrl = apiConfig.n8n.apiUrl
    this.apiKey = apiConfig.n8n.apiKey
  }

  // Make authenticated request to n8n API
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1${endpoint}`, {
        ...options,
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`n8n API error: ${response.status} - ${errorData}`)
      }

      return await response.json()
    } catch (error) {
      console.error('n8n API request failed:', error)
      throw error
    }
  }

  // Workflow management
  async getWorkflows(): Promise<{ data: N8nWorkflow[] }> {
    return this.request('/workflows')
  }

  async getWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request(`/workflows/${id}`)
  }

  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow)
    })
  }

  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    return this.request(`/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(workflow)
    })
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.request(`/workflows/${id}`, {
      method: 'DELETE'
    })
  }

  async activateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(id, { active: true })
  }

  async deactivateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(id, { active: false })
  }

  // Execution management
  async getExecutions(workflowId?: string): Promise<{ data: N8nExecution[] }> {
    const query = workflowId ? `?workflowId=${workflowId}` : ''
    return this.request(`/executions${query}`)
  }

  async getExecution(id: string): Promise<N8nExecution> {
    return this.request(`/executions/${id}`)
  }

  async deleteExecution(id: string): Promise<void> {
    return this.request(`/executions/${id}`, {
      method: 'DELETE'
    })
  }

  // Webhook triggers - call n8n webhooks
  async triggerWebhook(workflowId: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/webhook/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Webhook trigger failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Webhook trigger failed:', error)
      throw error
    }
  }

  // Business workflow helpers
  async triggerCustomerUpdate(customerId: string, customerData: any): Promise<any> {
    return this.triggerWebhook('customer-update', {
      event: 'customer.updated',
      customerId,
      data: customerData,
      timestamp: new Date().toISOString()
    })
  }

  async triggerJobScheduled(jobId: string, jobData: any): Promise<any> {
    return this.triggerWebhook('job-scheduled', {
      event: 'job.scheduled',
      jobId,
      data: jobData,
      timestamp: new Date().toISOString()
    })
  }

  async triggerLeadReceived(leadId: string, leadData: any): Promise<any> {
    return this.triggerWebhook('lead-received', {
      event: 'lead.received',
      leadId,
      data: leadData,
      timestamp: new Date().toISOString()
    })
  }

  async triggerInventoryAlert(itemId: string, currentLevel: number, reorderLevel: number): Promise<any> {
    return this.triggerWebhook('inventory-alert', {
      event: 'inventory.low',
      itemId,
      data: {
        currentLevel,
        reorderLevel,
        urgency: currentLevel <= reorderLevel * 0.5 ? 'high' : 'medium'
      },
      timestamp: new Date().toISOString()
    })
  }

  async triggerPaymentReceived(invoiceId: string, paymentData: any): Promise<any> {
    return this.triggerWebhook('payment-received', {
      event: 'payment.received',
      invoiceId,
      data: paymentData,
      timestamp: new Date().toISOString()
    })
  }

  // Workflow templates for common business processes
  async createLeadProcessingWorkflow(): Promise<N8nWorkflow> {
    const workflow = {
      name: 'Lead Processing Automation',
      nodes: [
        {
          id: 'webhook-trigger',
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [200, 300],
          parameters: {
            httpMethod: 'POST',
            path: 'lead-received'
          }
        },
        {
          id: 'supabase-save',
          name: 'Save to Database',
          type: 'n8n-nodes-base.supabase',
          typeVersion: 1,
          position: [400, 300],
          parameters: {
            resource: 'row',
            operation: 'create',
            tableId: 'leads'
          }
        },
        {
          id: 'gmail-notify',
          name: 'Send Notification',
          type: 'n8n-nodes-base.gmail',
          typeVersion: 1,
          position: [600, 300],
          parameters: {
            operation: 'send',
            subject: 'New Lead Received',
            message: 'A new lead has been received and needs attention.'
          }
        }
      ],
      connections: {
        'webhook-trigger': {
          main: [[{ node: 'supabase-save', type: 'main', index: 0 }]]
        },
        'supabase-save': {
          main: [[{ node: 'gmail-notify', type: 'main', index: 0 }]]
        }
      },
      settings: {}
    }

    return this.createWorkflow(workflow)
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/healthz`)
      if (response.ok) {
        return { status: 'healthy' }
      } else {
        return { status: 'unhealthy' }
      }
    } catch (error) {
      return { status: 'unreachable' }
    }
  }

  // Validate webhook signature (for incoming webhooks)
  validateWebhookSignature(payload: string, signature: string): boolean {
    // Implement signature validation based on your webhook secret
    // This is a simplified version - implement proper HMAC validation
    const expectedSignature = apiConfig.n8n.webhookSecret
    return signature === expectedSignature
  }
}

// Export singleton instance
export const n8n = new N8nService()

// Convenience functions
export const getWorkflows = () => n8n.getWorkflows()
export const triggerWebhook = (workflowId: string, data: any) => n8n.triggerWebhook(workflowId, data)
export const triggerCustomerUpdate = (customerId: string, data: any) => n8n.triggerCustomerUpdate(customerId, data)
export const triggerJobScheduled = (jobId: string, data: any) => n8n.triggerJobScheduled(jobId, data)
export const triggerLeadReceived = (leadId: string, data: any) => n8n.triggerLeadReceived(leadId, data)

export default n8n