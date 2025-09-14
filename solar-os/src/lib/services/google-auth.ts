import { google } from 'googleapis'
import { apiConfig } from '@/lib/config/api-config'

// OAuth2 client for user authentication
export const oauth2Client = new google.auth.OAuth2(
  apiConfig.google.clientId,
  apiConfig.google.clientSecret,
  apiConfig.google.redirectUri
)

// Service account for server-side operations
let serviceAccount: any = null
if (apiConfig.google.serviceAccountBase64) {
  try {
    serviceAccount = JSON.parse(
      Buffer.from(apiConfig.google.serviceAccountBase64, 'base64').toString()
    )
  } catch (error) {
    console.error('Failed to parse service account:', error)
  }
}

// JWT client for service account authentication
export const jwtClient = serviceAccount ? new google.auth.JWT(
  serviceAccount.client_email,
  undefined,
  serviceAccount.private_key,
  [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets'
  ]
) : null

// Get authorization URL for OAuth2 flow
export function getAuthUrl(scopes: string[] = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file'
]) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  })
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    return tokens
  } catch (error) {
    console.error('Error getting tokens:', error)
    throw error
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await oauth2Client.refreshAccessToken()
    return credentials
  } catch (error) {
    console.error('Error refreshing token:', error)
    throw error
  }
}

// Set user credentials
export function setUserCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens)
}

// Get authenticated Gmail client
export function getGmailClient(auth = oauth2Client) {
  return google.gmail({ version: 'v1', auth })
}

// Get authenticated Calendar client
export function getCalendarClient(auth = oauth2Client) {
  return google.calendar({ version: 'v3', auth })
}

// Get authenticated Drive client
export function getDriveClient(auth = oauth2Client) {
  return google.drive({ version: 'v3', auth })
}

// Get authenticated Sheets client
export function getSheetsClient(auth = oauth2Client) {
  return google.sheets({ version: 'v4', auth })
}

// Helper to authenticate service account
export async function authenticateServiceAccount() {
  if (!jwtClient) {
    throw new Error('Service account not configured')
  }
  
  try {
    await jwtClient.authorize()
    return jwtClient
  } catch (error) {
    console.error('Service account authentication failed:', error)
    throw error
  }
}

// Check if user is authenticated
export function isUserAuthenticated() {
  const credentials = oauth2Client.credentials
  return !!(credentials && credentials.access_token)
}

export default {
  oauth2Client,
  jwtClient,
  getAuthUrl,
  getTokensFromCode,
  refreshAccessToken,
  setUserCredentials,
  getGmailClient,
  getCalendarClient,
  getDriveClient,
  getSheetsClient,
  authenticateServiceAccount,
  isUserAuthenticated
}