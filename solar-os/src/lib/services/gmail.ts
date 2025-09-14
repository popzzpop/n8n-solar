import { getGmailClient, oauth2Client, jwtClient } from './google-auth'
import { gmail_v1 } from 'googleapis'

export interface EmailOptions {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  body: string
  html?: string
  attachments?: {
    filename: string
    content: Buffer | string
    contentType?: string
  }[]
}

export interface SearchOptions {
  query?: string
  maxResults?: number
  labelIds?: string[]
  includeSpamTrash?: boolean
}

export class GmailService {
  private gmail: gmail_v1.Gmail

  constructor(auth = oauth2Client) {
    this.gmail = getGmailClient(auth)
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<any> {
    try {
      const message = this.createMessage(options)
      
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message
        }
      })

      return response.data
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  // Search emails
  async searchEmails(options: SearchOptions = {}): Promise<any> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: options.query,
        maxResults: options.maxResults || 50,
        labelIds: options.labelIds,
        includeSpamTrash: options.includeSpamTrash || false
      })

      return response.data
    } catch (error) {
      console.error('Error searching emails:', error)
      throw error
    }
  }

  // Get email by ID
  async getEmail(messageId: string): Promise<any> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      })

      return response.data
    } catch (error) {
      console.error('Error getting email:', error)
      throw error
    }
  }

  // Get email attachments
  async getAttachment(messageId: string, attachmentId: string): Promise<any> {
    try {
      const response = await this.gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: messageId,
        id: attachmentId
      })

      return response.data
    } catch (error) {
      console.error('Error getting attachment:', error)
      throw error
    }
  }

  // Create draft
  async createDraft(options: EmailOptions): Promise<any> {
    try {
      const message = this.createMessage(options)
      
      const response = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: message
          }
        }
      })

      return response.data
    } catch (error) {
      console.error('Error creating draft:', error)
      throw error
    }
  }

  // Mark as read/unread
  async markAsRead(messageId: string): Promise<any> {
    return this.modifyLabels(messageId, [], ['UNREAD'])
  }

  async markAsUnread(messageId: string): Promise<any> {
    return this.modifyLabels(messageId, ['UNREAD'], [])
  }

  // Add/remove labels
  async modifyLabels(messageId: string, addLabels: string[] = [], removeLabels: string[] = []): Promise<any> {
    try {
      const response = await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: addLabels,
          removeLabelIds: removeLabels
        }
      })

      return response.data
    } catch (error) {
      console.error('Error modifying labels:', error)
      throw error
    }
  }

  // Get labels
  async getLabels(): Promise<any> {
    try {
      const response = await this.gmail.users.labels.list({
        userId: 'me'
      })

      return response.data
    } catch (error) {
      console.error('Error getting labels:', error)
      throw error
    }
  }

  // Create email message (helper method)
  private createMessage(options: EmailOptions): string {
    const { to, cc, bcc, subject, body, html, attachments } = options

    // Convert recipients to string
    const toStr = Array.isArray(to) ? to.join(', ') : to
    const ccStr = cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : ''
    const bccStr = bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : ''

    // Create headers
    const headers = [
      `To: ${toStr}`,
      ccStr && `Cc: ${ccStr}`,
      bccStr && `Bcc: ${bccStr}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0'
    ].filter(Boolean)

    // Create body
    let messageBody: string
    
    if (html) {
      messageBody = [
        ...headers,
        'Content-Type: text/html; charset=utf-8',
        '',
        html
      ].join('\n')
    } else {
      messageBody = [
        ...headers,
        'Content-Type: text/plain; charset=utf-8',
        '',
        body
      ].join('\n')
    }

    // Handle attachments (simplified - full implementation would use multipart)
    if (attachments && attachments.length > 0) {
      console.warn('Attachments not fully implemented in this version')
    }

    // Encode message
    return Buffer.from(messageBody).toString('base64url')
  }

  // Watch for new emails (webhook setup)
  async watchInbox(topicName: string): Promise<any> {
    try {
      const response = await this.gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: topicName,
          labelIds: ['INBOX']
        }
      })

      return response.data
    } catch (error) {
      console.error('Error setting up watch:', error)
      throw error
    }
  }

  // Stop watching
  async stopWatch(): Promise<any> {
    try {
      const response = await this.gmail.users.stop({
        userId: 'me'
      })

      return response.data
    } catch (error) {
      console.error('Error stopping watch:', error)
      throw error
    }
  }
}

// Export convenience functions
export const gmail = new GmailService()

export const sendEmail = (options: EmailOptions) => gmail.sendEmail(options)
export const searchEmails = (options: SearchOptions) => gmail.searchEmails(options)
export const getEmail = (messageId: string) => gmail.getEmail(messageId)

export default gmail