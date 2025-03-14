'use server'
import { createClerkClient } from '@clerk/backend'
import { auth } from '@clerk/nextjs/server';
import { Roles } from './types'
import superagent from 'superagent';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function updateOrganizationLicenses(organizationId: string, seatCount: number) {
  await clerkClient.organizations.updateOrganization(organizationId, { 
    maxAllowedMemberships: seatCount
   })
}

/**
 * Create a new organization
 * @param {string} name - The name of the organization
 * @param {string} slug - The slug of the organization
 * @param {number} maxAllowedMemberships - The maximum number of memberships allowed in the organization
 * @returns {Organization} The newly created organization
 */
export async function createOrganization({name, slug, maxAllowedMemberships}: { name: string; slug: string; maxAllowedMemberships:number}){
  const {userId} = await auth();
  if(!userId){
    throw new Error('User not authenticated.');
  }
  const newOrg = await clerkClient.organizations.createOrganization({name, slug, createdBy: userId, maxAllowedMemberships});

  return JSON.parse(JSON.stringify(newOrg));
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
    firstName: '',
    lastName: '',
    emailAddress: [email],
  });
  // await clerkClient.organizations.createOrganizationMembership({
  //   userId: user.id,
  //   organizationId,
  //   role: role,
  // });

  return;
}

export async function removeUserFromOrganization(userId: string, organizationId: string) {
  await clerkClient.organizations.deleteOrganizationMembership({
    organizationId,
    userId,
  });
}

export const bulkInviteUsers = async (organizationId: string, emailAddresses:string[], role: string) => {
  try {
    const payload = emailAddresses.map(email => {
      return {
        "email_address": email,
        "role": role,
        "public_metadata": { },
        "private_metadata": { }
      }
    })
    const response = await superagent.post(`https://api.clerk.com/v1/organizations/${organizationId}/invitations/bulk`).send(payload).set('Authorization', `Bearer ${process.env.CLERK_SECRET_KEY}`).withCredentials();
    return response.body;
  } catch (error) {
    //console.error('Error inviting users:', error);
    return null;
  }
}

export const inviteUser = async (organizationId: string, email: string, role: string) => {
  try {
    const response = await superagent.post(`https://api.clerk.com/v1/organizations/${organizationId}/invitations`).send({
      "email_address": email,
      "role": role,
      "public_metadata": { },
      "private_metadata": { }
    }).set('Authorization', `Bearer ${process.env.CLERK_SECRET_KEY}`).withCredentials();
    return response.body;
  } catch (error) {
    //console.error('Error inviting user:', error);
    return null;
  }
}