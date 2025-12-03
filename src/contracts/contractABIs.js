import ProtocolManagerABI from './ProtocolManager.json';
import RevenueManagerABI from './RevenueManager.json';
import PoolABI from '../../new abis/Pool.json';
import SocialEngagementManagerABI from './SocialEngagementManager.json';

// Minimal ABIs for contracts that don't have full ABI files
// These contain only the essential functions needed by the application
const RaffleDeployerABI = {
  abi: []
};

const NFTFactoryABI = {
  abi: []
};

const ERC721PrizeABI = {
  abi: []
};

const ERC1155PrizeABI = {
  abi: []
};

export const contractABIs = {
  protocolManager: ProtocolManagerABI.abi,
  raffleDeployer: RaffleDeployerABI.abi,
  revenueManager: RevenueManagerABI.abi,
  nftFactory: NFTFactoryABI.abi,
  erc721Prize: ERC721PrizeABI.abi,
  erc1155Prize: ERC1155PrizeABI.abi,
  pool: PoolABI.abi,
  socialEngagementManager: SocialEngagementManagerABI.abi
};

