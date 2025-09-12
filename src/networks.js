export const SUPPORTED_NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    explorer: 'https://etherscan.io',
    contractAddresses: {
      raffleManager: '0xf468403383a0A42136Cbe92633771f5CB280A17C',
      raffleDeployer: '0x75249eB4844E02039Fc0F3016eF039690EEdF021',
      revenueManager: '0x3BC2d0051B14E38D598DBccA504d1da78c46d46E',
      nftFactory: '0xE6Ed36377BC7E68C64a589c457Da9E02461B9b99'
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
      raffleManager: '0xd32E33197611473C917301965726e12Da1fb19F4',
      raffleDeployer: '0x82DEB79fE0a2380aB2799F8675Af296A1133F40F',
      revenueManager: '0x20A10ABbafbFff78402D1E79cEF1423282C64568',
      nftFactory: '0xa22a2105fBe227Db05FD0D76ccbC317A53EC9aC5'
    }
  },
  43113: {
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://avalanche-fuji.drpc.org',
    explorer: 'https://testnet.snowscan.xyz',
    contractAddresses: {
      raffleManager: '0x0cb72c04AfD46Fc91DB50FBa0e215Ad61A385781',
      raffleDeployer: '0x1d87Df2CB34fC115E4dA9a9a69d6b7b5E83d3381',
      revenueManager: '0x723A31c0C8eCc1fE6dCb22eE1113AEC885b3144c',
      nftFactory: '0x2F43A7D4C8723C93B15b5cF8b3061C06de4Bda87'
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
      raffleManager: '0x409A6847c34f04Dfba37A0B9a243701B20b10080',
      raffleDeployer: '0x7EEc3B06dF8b00A42f4890baD476FB51b5fF2b4F',
      revenueManager: '0xae08d5494470CE390DcBc4709A8bBA01B5d6dAF6',
      nftFactory: '0xe8b59DD7ca7825B890C0Fea8f1cdB0d7a3C0e52B'
    }
  },
  11155111: {
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io',
    explorer: 'https://sepolia.etherscan.io',
    contractAddresses: {
      raffleManager: '0x1243f69977e4db974fA4fcAB20DcaA1af81e3b94',
      raffleDeployer: '0x85c3A282075611D924723e20700A7D583014a5ae',
      revenueManager: '0x076925a375C1A14830486fff4C991Ad4279D56Bb',
      nftFactory: '0x6575629a471665886195AA7410d29272f295C66D'
    }
  },
  11155420: {
    name: 'OP Sepolia Testnet',
    rpcUrl: 'https://sepolia.optimism.io',
    explorer: 'https://sepolia-optimism.etherscan.io',
    contractAddresses: {
      raffleManager: '0x27096A4cB1b37d6caAaa399286016C1fD9770a78',
      raffleDeployer: '0xE300723adE1d200DE1C1F2F01EA1a8309E0c796c',
      revenueManager: '0x27930DAc4699fd813764aE57D4acc63A2192Ca16',
      nftFactory: '0x205b597cCC9c72A28A71abb9DD590FEB333B8B09'
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
      raffleManager: '0xF425Db442318D587f04280956F562C99e52818E3',
      raffleDeployer: '0xa86aDF75CdE7BA7c23204cdfa095Cd498629091a',
      revenueManager: '0xd496047e70CEafd89a05C1B63910F10d0180F283',
      nftFactory: '0x1dF3590f141b6E0992EcE00D65d314Cf5B97D848'
    }
  },
}; 