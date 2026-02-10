import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { contractABIs } from '../contracts/contractABIs';
import { SUPPORTED_NETWORKS } from '../networks';

const ContractContext = createContext();

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    console.error('useContract hook called outside of ContractProvider');
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

export const ContractProvider = ({ children }) => {
  const { signer, provider, connected, chainId } = useWallet();
  const [contracts, setContracts] = useState({});

  // Initialize contracts when wallet is connected and addresses are available
  useEffect(() => {
    if (connected && signer && chainId && SUPPORTED_NETWORKS[chainId]) {
      initializeContracts();
    } else {
      setContracts({});
    }
  }, [connected, signer, chainId]);

  const initializeContracts = () => {
    const network = SUPPORTED_NETWORKS[chainId];
    if (!network || !network.contractAddresses) {
      setContracts({});
      return;
    }
    const contractAddresses = network.contractAddresses;
    const newContracts = {};
    try {
      if (contractAddresses.protocolManager) {
        newContracts.protocolManager = new ethers.Contract(
          contractAddresses.protocolManager,
          contractABIs.protocolManager,
          signer
        );
      }
      if (contractAddresses.raffleDeployer) {
        newContracts.raffleDeployer = new ethers.Contract(
          contractAddresses.raffleDeployer,
          contractABIs.raffleDeployer,
          signer
        );
      }
      if (contractAddresses.revenueManager) {
        newContracts.revenueManager = new ethers.Contract(
          contractAddresses.revenueManager,
          contractABIs.revenueManager,
          signer
        );
      }
      if (contractAddresses.nftFactory) {
        newContracts.nftFactory = new ethers.Contract(
          contractAddresses.nftFactory,
          contractABIs.nftFactory,
          signer
        );
      }
      if (contractAddresses.rewardsFlywheel) {
        newContracts.rewardsFlywheel = new ethers.Contract(
          contractAddresses.rewardsFlywheel,
          contractABIs.rewardsFlywheel,
          signer
        );
      }
      if (contractAddresses.poolDeployer) {
        newContracts.poolDeployer = new ethers.Contract(
          contractAddresses.poolDeployer,
          contractABIs.poolDeployer,
          signer
        );
      }
      setContracts(newContracts);
    } catch (error) {
      console.error('Error initializing contracts:', error);
      setContracts({});
    }
  };

  // Create contract instance for a specific address
  const getContractInstance = (address, abiType) => {
    if (!address || !signer) return null;
    
    try {
      return new ethers.Contract(address, contractABIs[abiType], signer);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  };

  // Helper function to handle contract transactions
  const executeTransaction = async (contractMethod, ...args) => {
    try {
      const tx = await contractMethod(...args);
      const receipt = await tx.wait();
      return { success: true, receipt, hash: tx.hash };
    } catch (error) {
      console.error('Transaction failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to handle contract calls (view functions)
  const executeCall = async (contractMethod, ...args) => {
    try {
      const result = await contractMethod(...args);
      return { success: true, result };
    } catch (error) {
      console.error('Contract call failed:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    contracts,
    getContractInstance,
    executeTransaction,
    executeCall
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

