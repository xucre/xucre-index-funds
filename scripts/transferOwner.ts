import { transferSignerOwnership } from "@/service/safe";
import { getOrganizationMembers, getAllOrganizations } from "@/service/clerk";
import { getSafeAddress, getOrganizationSafeAddress } from "@/service/db";

const main = async () => {
  try {
    // Replace with your actual chain ID
    const CHAIN_ID = 137; // Example: 137 for Polygon Mainnet


    // Retrieve all organization IDs
    const organizations = await getAllOrganizations();
    const organizationIds = organizations.map((org: any) => org.id);


    // Retrieve all user IDs
    const users = await Promise.all(organizationIds.map((organizationId: string) => getOrganizationMembers(organizationId)));
    const userIds = users.map((user: any) => user.id);

    // Process user safe wallets
    for (const userId of userIds) {
      const safeWalletAddress = await getSafeAddress(userId);
      if (safeWalletAddress) {
        console.log(`Transferring ownership for user ${userId} safe wallet ${safeWalletAddress}`);
        await transferSignerOwnership({
          safeWallet: safeWalletAddress,
          chainid: CHAIN_ID,
        });
      } else {
        console.log(`No safe wallet found for user ${userId}`);
      }
    }

    // Process organization safe wallets
    for (const organizationId of organizationIds) {
      const safeWalletAddress = await getOrganizationSafeAddress(organizationId, 'escrow');
      const selfSafeWalletAddress = await getOrganizationSafeAddress(organizationId, 'self');
      if (safeWalletAddress) {
        console.log(`Transferring ownership for organization ${organizationId} escrow safe wallet ${safeWalletAddress}`);
        await transferSignerOwnership({
          safeWallet: safeWalletAddress,
          chainid: CHAIN_ID,
        });
      } else {
        console.log(`No escrow safe wallet found for organization ${organizationId}`);
      }

      if (selfSafeWalletAddress) {
        console.log(`Transferring ownership for organization ${organizationId} self safe wallet ${selfSafeWalletAddress}`);
        await transferSignerOwnership({
          safeWallet: selfSafeWalletAddress,
          chainid: CHAIN_ID,
        });
      } else {
        console.log(`No self safe wallet found for organization ${organizationId}`);
      }
    }

    console.log('Ownership transfer completed.');
  } catch (error) {
    console.error('Error transferring ownership:', error);
  }
};

main();

// Execute the script with:
// node scripts/transferOwner.ts --env-file .env.local