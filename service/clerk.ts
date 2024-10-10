import { createClerkClient } from '@clerk/backend'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function updateOrganizationLicenses(organizationId: string, seatCount: number) {
  await clerkClient.organizations.updateOrganization(organizationId, { 
    maxAllowedMemberships: seatCount
   })
}

export async function getOrganization(organizationId: string) {
  return await clerkClient.organizations.getOrganization({organizationId})
}