import RaffleManagerABI from './RaffleManager.minimal.json';
import RaffleDeployerABI from './RaffleDeployer.minimal.json';
import RevenueManagerABI from './RevenueManager.minimal.json';
import NFTFactoryABI from './NFTFactory.minimal.json';
import ERC721PrizeABI from './ERC721Prize.minimal.json';
import ERC1155PrizeABI from './ERC1155Prize.minimal.json';
import RaffleABI from './Raffle.minimal.json';

export const contractABIs = {
  raffleManager: RaffleManagerABI.abi,
  raffleDeployer: RaffleDeployerABI.abi,
  revenueManager: RevenueManagerABI.abi,
  nftFactory: NFTFactoryABI.abi,
  erc721Prize: ERC721PrizeABI.abi,
  erc1155Prize: ERC1155PrizeABI.abi,
  raffle: RaffleABI.abi
};

