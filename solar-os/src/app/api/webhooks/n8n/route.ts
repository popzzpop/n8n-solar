import { NextRequest, NextResponse } from 'next/server'
import { n8n } from '@/lib/services/n8n'
import { supabase } from '@/lib/services/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get webhook payload
    const payload = await request.json()
    
    // Validate webhook signature (optional)
    const signature = request.headers.get('x-webhook-signature')
    if (signature) {
      const isValid = n8n.validateWebhookSignature(JSON.stringify(payload), signature)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Process webhook based on event type
    const { event, data } = payload

    switch (event) {
      case 'lead.processed':
        await handleLeadProcessed(data)
        break
      
      case 'job.completed':
        await handleJobCompleted(data)
        break
        
      case 'customer.followup':
        await handleCustomerFollowup(data)
        break
        
      case 'inventory.reordered':
        await handleInventoryReordered(data)
        break
        
      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Webhook processed: ${event}` 
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function handleLeadProcessed(data: any) {
  const { leadId, status, nextAction } = data
  
  // Update lead in database
  const { error } = await supabase
    .from('leads')
    .update({ 
      status, 
      next_action: nextAction,
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId)

  if (error) {
    throw new Error(`Failed to update lead: ${error.message}`)
  }

  console.log(`Lead ${leadId} processed with status: ${status}`)
}

async function handleJobCompleted(data: any) {
  const { jobId, completionData } = data
  
  // Update job status
  const { error } = await supabase
    .from('jobs')
    .update({ 
      status: 'completed',
      actual_cost: completionData.actualCost,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId)

  if (error) {
    throw new Error(`Failed to update job: ${error.message}`)
  }

  console.log(`Job ${jobId} marked as completed`)
}

async function handleCustomerFollowup(data: any) {
  const { customerId, followupType, scheduledDate } = data
  
  // Create a followup task or update customer record
  console.log(`Customer followup scheduled: ${customerId} - ${followupType} on ${scheduledDate}`)
}

async function handleInventoryReordered(data: any) {
  const { itemId, quantityOrdered, supplier } = data
  
  // Update inventory with pending order
  const { error } = await supabase
    .from('inventory')
    .update({ 
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)

  if (error) {
    throw new Error(`Failed to update inventory: ${error.message}`)
  }

  console.log(`Inventory reordered: ${itemId} - ${quantityOrdered} units from ${supplier}`)
}