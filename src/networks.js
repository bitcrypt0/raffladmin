export const SUPPORTED_NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    explorer: 'https://etherscan.io',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  10: {
    name: 'OP Mainnet',
    rpcUrl: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  56: {
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc.blockrazor.xyz',
    explorer: 'https://bscscan.com',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  97: {
    name: 'BNB Smart Chain Testnet',
    rpcUrl: 'https://bsc-testnet-rpc.publicnode.com',
    explorer: 'https://testnet.bscscan.com',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  43113: {
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://avalanche-fuji.drpc.org',
    explorer: 'https://testnet.snowscan.xyz',
    contractAddresses: {
      raffleManager: '0x6649394333eFFe00858601793FFc7B70c8c88d89',
      raffleDeployer: '0x06eD8263D074766d4A51EA3B5A722F7C1A95f091',
      revenueManager: '0xf36Cb76ACEA8A1F6D2d9d8A01F3E0A9dBBa6532F',
      nftFactory: '0x6B3D09dcF670AC46D363DA8F7A07a7C6B3eFcE0A'
    }
  },
  43114: {
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://avalanche.drpc.org',
    explorer: 'https://snowscan.xyz',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  8453: {
    name: 'Base Mainnet',
    rpcUrl: 'https://base.drpc.org',
    explorer: 'https://basescan.org',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  84532: {
    name: 'Base Sepolia',
    rpcUrl: 'https://base-sepolia-rpc.publicnode.com',
    explorer: 'https://sepolia.basescan.org',
    contractAddresses: {
      raffleManager: '0xc6B953b28b3f3C7C802c752BB9feC6A1fCfd6Bd7',
      raffleDeployer: '0x513357EaC3cc355080342801abdB989333d28AE6',
      revenueManager: '0x1f97dBB5a388C4392E599f7D96C07CaF3D54ae7F',
      nftFactory: '0xaD56478AD05FCE692BC49928A900858ed65E2Ac8'
    }
  },
  11155111: {
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io',
    explorer: 'https://sepolia.etherscan.io',
    contractAddresses: {
      raffleManager: '0x8C98BDC5D98E82672Ab5876CDf52506b6489A874',
      raffleDeployer: '0x9a26D7a905A00248e8327D8d7a1786D3E8Bb7592',
      revenueManager: '0x2bE1d957d97EFE3c600cF88B9421b9cafb74B0ca',
      nftFactory: '0x6a778FBf0d7A16Ec9Ea9e42b3e66170181359223'
    }
  },
  11155420: {
    name: 'OP Sepolia Testnet',
    rpcUrl: 'https://sepolia.optimism.io',
    explorer: 'https://sepolia-optimism.etherscan.io',
    contractAddresses: {
      raffleManager: '0x6fC8B56e2939AC1098eed8FD194c5b301CBfb3AA',
      raffleDeployer: '0x0b4F7b472aa07722D16d3368f1B9D66A18254D2B',
      revenueManager: '0x8824506d425270bA9fa6dEf3142BAE146b4E7a9B',
      nftFactory: '0x98b20229665CFa296008c388b0cbD8b15a38A4C5'
    }
  },
  2020: {
    name: 'Ronin Mainnet',
    rpcUrl: 'https://ronin.drpc.org',
    explorer: 'https://app.roninchain.com/',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  2021: {
    name: 'Ronin Saigon Testnet',
    rpcUrl: 'https://saigon-testnet.roninchain.com/rpc',
    explorer: 'https://saigon-app.roninchain.com/explorer',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  42161: {
    name: 'Arbitrum One',
    rpcUrl: 'https://arbitrum.drpc.org',
    explorer: 'https://arbiscan.io',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  421614: {
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://endpoints.omniatech.io/v1/arbitrum/sepolia/public',
    explorer: 'https://sepolia.arbiscan.io',
    contractAddresses: {
      raffleManager: '0xfbc7A4eF8CaA79758a48D6A063Afcf2b3B521f0a',
      raffleDeployer: '0x9a09ab41bA86F1925FEd9930B689837EEa30b6D1',
      revenueManager: '0x8712a6E5619C43443327f7Dfc50D5a7b8bc11112',
      nftFactory: '0xBD50C18d269932df060AA31F12E4417223D6B8fD'
    }
  },
}; 