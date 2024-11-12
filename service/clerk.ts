'use server'
import { createClerkClient } from '@clerk/backend'
import { Roles } from './types'

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

export async function updateOrganizationMetadata(organizationId: string, metadata: string) {
  await clerkClient.organizations.updateOrganization(organizationId, {
    publicMetadata: JSON.parse(metadata)
  });
}

export async function createUserWithRole(email: string, role: Roles, organizationId: string) {
  const user = await clerkClient.users.createUser({
    emailAddress: [email],
  });

  await clerkClient.organizations.createOrganizationMembership({
    userId: user.id,
    organizationId,
    role: role,
  });

  return user;
}

export async function removeUserFromOrganization(userId: string, organizationId: string) {
  await clerkClient.organizations.deleteOrganizationMembership({
    organizationId,
    userId,
  });
}

