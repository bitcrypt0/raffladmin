import React, { useState, useEffect } from 'react';
import { DollarSign, Settings, Trash2, CheckCircle } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { SUPPORTED_NETWORKS } from '../../networks';

const OperatorDashboard = () => {
  const { connected, chainId } = useWallet();
  const { contracts, executeTransaction, getContractInstance } = useContract();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all pools from ProtocolManager
  useEffect(() => {
    if (!contracts.protocolManager) return;
    let cancelled = false;

    async function fetchPools() {
      setRefreshing(true);
      try {
        const addresses = await contracts.protocolManager.getAllPools();
        
        const poolData = await Promise.all(
          addresses.map(async (addr) => {
            try {
              const pool = getContractInstance(addr, 'pool');
              if (!pool) {
                return {
                  address: addr,
                  name: 'Error: Invalid Contract',
                  globalFeeProtocolRevenue: '0',
                  pendingProtocolFee: '0',
                  state: null,
                  isVRFConsumer: false,
                  error: 'Failed to create contract instance',
                  contract: null,
                };
              }
              
              // Fetch pool data and VRF consumer status in parallel
              const [name, globalFeeProtocolRevenue, pendingProtocolFee, state, isVRFConsumer] = await Promise.all([
                pool.name(),
                pool.globalFeeProtocolRevenue(),
                pool.pendingProtocolFee(),
                pool.state(),
                contracts.protocolManager.isVRFConsumer(addr),
              ]);
              
              return {
                address: addr,
                name,
                globalFeeProtocolRevenue: globalFeeProtocolRevenue.toString(),
                pendingProtocolFee: pendingProtocolFee.toString(),
                state: parseInt(state.toString()),
                isVRFConsumer,
                contract: pool,
                error: null,
              };
            } catch (e) {
              return {
                address: addr,
                name: 'Error: ' + (e.message || 'Unknown error'),
                globalFeeProtocolRevenue: '0',
                pendingProtocolFee: '0',
                state: null,
                isVRFConsumer: false,
                error: e.message || 'Unknown error',
                contract: null,
              };
            }
          })
        );
        
        if (!cancelled) {
          setPools(poolData);
        }
      } catch (e) {
        if (!cancelled) setPools([]);
      } finally {
        setRefreshing(false);
      }
    }
    
    fetchPools();
    return () => { cancelled = true; };
  }, [contracts.protocolManager, getContractInstance]);

  // Withdraw protocol revenue action
  const handleWithdrawProtocolRevenue = async (pool) => {
    if (!pool.contract) {
      alert('Pool contract not available');
      return;
    }

    setLoading((prev) => ({ ...prev, [pool.address]: true }));
    try {
      const result = await executeTransaction(pool.contract.withdrawProtocolRevenue);
      if (result.success) {
        alert('Protocol revenue withdrawn successfully!');
        // Refresh pool data - reset both values after withdrawal
        setPools((prev) => prev.map(p => 
          p.address === pool.address 
            ? { ...p, globalFeeProtocolRevenue: '0', pendingProtocolFee: '0' } 
            : p
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      alert('Error: ' + (e?.message || e));
    } finally {
      setLoading((prev) => ({ ...prev, [pool.address]: false }));
    }
  };

  // Remove from VRF subscription action
  const handleRemoveConsumer = async (pool) => {
    if (!pool.contract) {
      alert('Pool contract not available');
      return;
    }

    setLoading((prev) => ({ ...prev, [pool.address]: true }));
    try {
      const result = await executeTransaction(pool.contract.removeFromVRFSubscription);
      if (result.success) {
        alert('Consumer removed from VRF subscription successfully!');
        // Optionally refresh pool data or remove from list
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      alert('Error: ' + (e?.message || e));
    } finally {
      setLoading((prev) => ({ ...prev, [pool.address]: false }));
    }
  };

  // Filter pools with protocol revenue available for withdrawal
  const poolsWithFees = pools.filter(pool => 
    !pool.error && (
      parseFloat(pool.globalFeeProtocolRevenue) > 0 || 
      parseFloat(pool.pendingProtocolFee) > 0
    )
  );

  // Filter completed pools - includes Completed, Deleted, ActivationFailed, AllPrizesClaimed, and Unengaged states
  // Only show VRF consumers in this section
  const completedPools = pools.filter(pool => 
    !pool.error && 
    pool.isVRFConsumer && 
    pool.state !== null && (
      pool.state === 4 || // Completed
      pool.state === 5 || // Deleted
      pool.state === 6 || // ActivationFailed
      pool.state === 7 || // AllPrizesClaimed
      pool.state === 8    // Unengaged
    )
  );

  // Get state name for display (only for inactive states tracked by this interface)
  const getStateName = (state) => {
    const stateNames = {
      4: 'Completed',
      5: 'Deleted',
      6: 'ActivationFailed',
      7: 'AllPrizesClaimed',
      8: 'Unengaged'
    };
    return stateNames[state] || `State ${state}`;
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to access operator functions.
          </p>
        </div>
      </div>
    );
  }

  // Check if connected to a supported network
  const currentNetwork = SUPPORTED_NETWORKS[chainId];
  if (!currentNetwork) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Settings className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Unsupported Network</h2>
          <p className="text-muted-foreground mb-4">
            You are connected to an unsupported network (Chain ID: {chainId}).
          </p>
          <p className="text-sm text-muted-foreground">
            Please switch to one of the supported networks:
          </p>
          <div className="mt-4 space-y-2">
            {Object.entries(SUPPORTED_NETWORKS).map(([id, network]) => (
              <div key={id} className="text-sm">
                <span className="font-medium">{network.name}</span> (Chain ID: {id})
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if contract addresses are configured for this network
  if (!currentNetwork.contractAddresses?.protocolManager) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Settings className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Network Not Configured</h2>
          <p className="text-muted-foreground mb-4">
            You are connected to {currentNetwork.name}, but the ProtocolManager contract is not configured for this network.
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact the development team to configure contracts for this network.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Operator Dashboard</h2>
          <p className="text-muted-foreground">Manage protocol fees and inactive pools</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {currentNetwork.name} (Chain ID: {chainId})
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Contract: {currentNetwork.contractAddresses.protocolManager.slice(0, 10)}...{currentNetwork.contractAddresses.protocolManager.slice(-8)}
            </span>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Half - Protocol Fee Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Protocol Fee Management</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Pools with pending protocol revenue that can be withdrawn.
          </p>
          
          <div className="bg-card border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool Name</TableHead>
                  <TableHead>Global Revenue (ETH)</TableHead>
                  <TableHead>Pending Fee (ETH)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poolsWithFees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      {refreshing ? 'Loading pools...' : 'No pools with pending fees found.'}
                    </TableCell>
                  </TableRow>
                )}
                {poolsWithFees.map((pool) => (
                  <TableRow key={pool.address}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pool.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {pool.address.slice(0, 10)}...{pool.address.slice(-8)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {(parseFloat(pool.globalFeeProtocolRevenue) / 1e18).toFixed(6)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {(parseFloat(pool.pendingProtocolFee) / 1e18).toFixed(6)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        disabled={loading[pool.address]}
                        onClick={() => handleWithdrawProtocolRevenue(pool)}
                      >
                        <DollarSign className="h-3 w-3" />
                        {loading[pool.address] ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Half - Completed Pools Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Inactive Pools Management</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Inactive pools (Completed, Deleted, ActivationFailed, AllPrizesClaimed, Unengaged) that can be removed from VRF subscription.
          </p>
          
          <div className="bg-card border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedPools.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      {refreshing ? 'Loading pools...' : 'No inactive pools found.'}
                    </TableCell>
                  </TableRow>
                )}
                {completedPools.map((pool) => (
                  <TableRow key={pool.address}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pool.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {pool.address.slice(0, 10)}...{pool.address.slice(-8)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pool.state === 3 ? 'bg-green-100 text-green-800' : 
                        pool.state === 4 ? 'bg-gray-100 text-gray-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getStateName(pool.state)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        disabled={loading[pool.address]}
                        onClick={() => handleRemoveConsumer(pool)}
                      >
                        <Trash2 className="h-3 w-3" />
                        {loading[pool.address] ? 'Removing...' : 'Remove Consumer'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;

