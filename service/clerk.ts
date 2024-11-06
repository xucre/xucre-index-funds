'use server'
import { createClerkClient } from '@clerk/backend'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function updateOrganizationLicenses(organizationId: string, seatCount: number) {
  await clerkClient.organizations.updateOrganization(organizationId, { 
    maxAllowedMemberships: seatCount
   })
}

export async function getOrganization(organizationId: string) {
  return JSON.parse(JSON.stringify(await clerkClient.organizations.getOrganization({organizationId})))
}

export async function getAllOrganizations() {
  return JSON.parse(JSON.stringify(await clerkClient.organizations.getOrganizationList()));
}


export async function getOrganizationMembers(organizationId: string) {
  return JSON.parse(JSON.stringify(await clerkClient.organizations.getOrganizationMembershipList({
    organizationId
  })));
}