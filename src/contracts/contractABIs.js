import ProtocolManagerABI from './ProtocolManager.json';
import RevenueManagerABI from './RevenueManager.json';
import PoolABI from '../../new abis/Pool.json';
import SocialEngagementManagerABI from './SocialEngagementManager.json';
import RewardsFlywheelABI from './RewardsFlywheel.json';
import PoolDeployerABI from './PoolDeployer.json';

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

const ERC20ABI = {
  abi: [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)"
  ]
};

export const contractABIs = {
  protocolManager: ProtocolManagerABI.abi,
  raffleDeployer: RaffleDeployerABI.abi,
  poolDeployer: PoolDeployerABI.abi,
  revenueManager: RevenueManagerABI.abi,
  nftFactory: NFTFactoryABI.abi,
  erc721Prize: ERC721PrizeABI.abi,
  erc1155Prize: ERC1155PrizeABI.abi,
  erc20: ERC20ABI.abi,
  pool: PoolABI.abi,
  socialEngagementManager: SocialEngagementManagerABI.abi,
  rewardsFlywheel: RewardsFlywheelABI.abi
};

