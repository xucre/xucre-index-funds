import { transferSignerOwnership } from "@/service/safe";
import { getOrganizationMembers, getAllOrganizations } from "@/service/clerk";
import { getSafeAddress, getOrganizationSafeAddress } from "@/service/db";
import { globalChainId } from "@/service/constants";

const main = async () => {
  try {
    // Replace with your actual chain ID
    const CHAIN_ID = globalChainId; // Example: globalChainId for Polygon Mainnet


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
        await transferSignerOwnership({
          safeWallet: safeWalletAddress,
          chainid: CHAIN_ID,
        });
      } else {
      }
    }

    // Process organization safe wallets
    for (const organizationId of organizationIds) {
      const safeWalletAddress = await getOrganizationSafeAddress(organizationId, 'escrow');
      const selfSafeWalletAddress = await getOrganizationSafeAddress(organizationId, 'self');
      if (safeWalletAddress) {
       await transferSignerOwnership({
          safeWallet: safeWalletAddress,
          chainid: CHAIN_ID,
        });
      } else {
        
      }

      if (selfSafeWalletAddress) {
        
        await transferSignerOwnership({
          safeWallet: selfSafeWalletAddress,
          chainid: CHAIN_ID,
        });
      } else {
        
      }
    }

  } catch (error) {
    console.error('Error transferring ownership:', error);
  }
};

main();

// Execute the script with:
// node scripts/transferOwner.ts --env-file .env.local