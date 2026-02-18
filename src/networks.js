export const SUPPORTED_NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    explorer: 'https://etherscan.io',
    contractAddresses: {
      protocolManager: '0xf468403383a0A42136Cbe92633771f5CB280A17C',
      raffleDeployer: '0x75249eB4844E02039Fc0F3016eF039690EEdF021',
      revenueManager: '0x3BC2d0051B14E38D598DBccA504d1da78c46d46E',
      nftFactory: '0xE6Ed36377BC7E68C64a589c457Da9E02461B9b99',
      rewardsFlywheel: '0x...'
    }
  },
  10: {
    name: 'OP Mainnet',
    rpcUrl: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    contractAddresses: {
      protocolManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...',
      rewardsFlywheel: '0x...'
    }
  },
  56: {
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc.blockrazor.xyz',
    explorer: 'https://bscscan.com',
    contractAddresses: {
      protocolManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...',
      rewardsFlywheel: '0x...'
    }
  },
  97: {
    name: 'BNB Smart Chain Testnet',
    rpcUrl: 'https://bsc-testnet-rpc.publicnode.com',
    explorer: 'https://testnet.bscscan.com',
    contractAddresses: {
      protocolManager: '0xa3F0AF8E90644bF0a371fABf8Ed688371352E2Fb',
      raffleDeployer: '0x422D280BFd76f4533F670706AA0eeC63A2e1330a',
      revenueManager: '0x2472e38aE1b868D1Dd0EFB59762D4e5f793a551f',
      nftFactory: '0xb52606980b0a000adfc27F0de0DC49d2CDA1d6a5',
      rewardsFlywheel: '0x...'
    }
  },
  43113: {
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://avalanche-fuji.drpc.org',
    explorer: 'https://testnet.snowscan.xyz',
    contractAddresses: {
      protocolManager: '0x0cb72c04AfD46Fc91DB50FBa0e215Ad61A385781',
      raffleDeployer: '0x1d87Df2CB34fC115E4dA9a9a69d6b7b5E83d3381',
      revenueManager: '0x723A31c0C8eCc1fE6dCb22eE1113AEC885b3144c',
      nftFactory: '0x2F43A7D4C8723C93B15b5cF8b3061C06de4Bda87',
      rewardsFlywheel: '0x...'
    }
  },
  43114: {
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://avalanche.drpc.org',
    explorer: 'https://snowscan.xyz',
    contractAddresses: {
      protocolManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...',
      rewardsFlywheel: '0x...'
    }
  },
  8453: {
    name: 'Base Mainnet',
    rpcUrl: 'https://base.drpc.org',
    explorer: 'https://basescan.org',
    contractAddresses: {
      protocolManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...',
      rewardsFlywheel: '0x...'
    }
  },
  84532: {
    name: 'Base Sepolia',
    rpcUrl: 'https://base-sepolia-rpc.publicnode.com',
    explorer: 'https://sepolia.basescan.org',
    contractAddresses: {
      protocolManager: '0x5eb752D45906eb32619F1fE6d5005734F10C3da2',
      poolDeployer: '0x69602037B275Cc9506519AA1cE66b843C127bc7a',
      revenueManager: '0x09C08a2E6465e8abD75F854FC3C7D01344964FaA',
      nftFactory: '0x959c429900c63D2D1F453BA4c64FBa04DBFBF6f3',
      rewardsFlywheel: '0xF6635D6F8527728a629D5CCDdaF985eCd88B820a'
    }
  },
  11155111: {
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io',
    explorer: 'https://sepolia.etherscan.io',
    contractAddresses: {
      protocolManager: '0x1243f69977e4db974fA4fcAB20DcaA1af81e3b94',
      raffleDeployer: '0x85c3A282075611D924723e20700A7D583014a5ae',
      revenueManager: '0x076925a375C1A14830486fff4C991Ad4279D56Bb',
      nftFactory: '0x6575629a471665886195AA7410d29272f295C66D',
      rewardsFlywheel: '0x...'
    }
  },
  11155420: {
    name: 'OP Sepolia Testnet',
    rpcUrl: 'https://sepolia.optimism.io',
    explorer: 'https://sepolia-optimism.etherscan.io',
    contractAddresses: {
      protocolManager: '0xD0aA2A1076c7EFfE6f6DAE959B7e512Ad557F3D9',
      poolDeployer: '0x340d3c4f461A27Ca87BDDBf071eDEF42f605503E',
      revenueManager: '0x3ee6B06e1F1DA1dD8a8809eE19AFe98DA6C5EC4C',
      nftFactory: '0xDCa93973C41915F544f14Ca44de2697028888B1C',
      rewardsFlywheel: '0x7d21c990bf7D2E1d691Cc082F7ba121D3A7d868B'
    }
  },
  2020: {
    name: 'Ronin Mainnet',
    rpcUrl: 'https://ronin.drpc.org',
    explorer: 'https://app.roninchain.com/',
    contractAddresses: {
      protocolManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...',
      rewardsFlywheel: '0x...'
    }
  },
  2021: {
    name: 'Ronin Saigon Testnet',
    rpcUrl: 'https://saigon-testnet.roninchain.com/rpc',
    explorer: 'https://saigon-app.roninchain.com/explorer',
    contractAddresses: {
      protocolManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...',
      rewardsFlywheel: '0x...'
    }
  },
  42161: {
    name: 'Arbitrum One',
    rpcUrl: 'https://arbitrum.drpc.org',
    explorer: 'https://arbiscan.io',
    contractAddresses: {
      protocolManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...',
      rewardsFlywheel: '0x...'
    }
  },
  421614: {
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://endpoints.omniatech.io/v1/arbitrum/sepolia/public',
    explorer: 'https://sepolia.arbiscan.io',
    contractAddresses: {
      protocolManager: '0xF425Db442318D587f04280956F562C99e52818E3',
      raffleDeployer: '0xa86aDF75CdE7BA7c23204cdfa095Cd498629091a',
      revenueManager: '0xd496047e70CEafd89a05C1B63910F10d0180F283',
      nftFactory: '0x1dF3590f141b6E0992EcE00D65d314Cf5B97D848',
      rewardsFlywheel: '0x...'
    }
  },
};