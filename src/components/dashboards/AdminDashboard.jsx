import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Settings, DollarSign, Clock, Users, Package, Pause, Globe, Zap, Award, Plus, Trash2 } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import { contractABIs } from '../../contracts/contractABIs';
import { ethers } from 'ethers';

const ConfigSection = ({ title, icon: Icon, children }) => (
  <div className="bg-card border border-border rounded-lg p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const VRFConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [linkTokenAddress, setLinkTokenAddress] = useState('');
  const [formData, setFormData] = useState({
    subscriptionId: '',
    coordinator: '',
    keyHash: '',
    gasLimit: '',
    linkToken: ''
  });

  const fetchVRF = useCallback(async () => {
    console.log('VRF: Fetching VRF params...');
    console.log('VRF: contracts.protocolManager:', contracts.protocolManager);
    if (!contracts.protocolManager) {
      console.log('VRF: No protocolManager contract available');
      setError('ProtocolManager contract not configured');
      setFetching(false);
      return;
    }
    try {
      console.log('VRF: Calling getVRFParams...');
      const [coordinator, subscriptionId, keyHash, gasLimit] = await contracts.protocolManager.getVRFParams();
      console.log('VRF: Received data:', { coordinator, subscriptionId, keyHash, gasLimit });
      
      // Fetch LINK token address
      let linkToken = '';
      try {
        linkToken = await contracts.protocolManager.linkToken();
        console.log('VRF: LINK token address:', linkToken);
        setLinkTokenAddress(linkToken);
      } catch (err) {
        console.warn('Could not fetch LINK token address:', err);
      }
      
      setFormData({
        subscriptionId: subscriptionId.toString(),
        coordinator,
        keyHash,
        gasLimit: gasLimit.toString(),
        linkToken: linkToken || ''
      });
      setError(null);
    } catch (e) {
      console.error('VRF: Error fetching VRF params:', e);
      setError('Failed to fetch VRF configuration. Please check contract address and network.');
    } finally {
      setFetching(false);
    }
  }, [contracts.protocolManager]);

  useEffect(() => {
    fetchVRF();
  }, [fetchVRF]);

  const handleSave = async () => {
    if (!contracts.protocolManager) {
      alert('ProtocolManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.setVRFParams,
        formData.coordinator,
        formData.keyHash,
        parseInt(formData.gasLimit)
      );

      if (result.success) {
        alert('VRF configuration saved successfully!');
        // Refresh VRF configuration to show updated values
        await fetchVRF();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving VRF config:', error);
      alert('Error saving VRF config: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetLinkToken = async () => {
    if (!contracts.protocolManager) {
      alert('ProtocolManager contract not configured');
      return;
    }

    if (!formData.linkToken || !ethers.utils.isAddress(formData.linkToken)) {
      alert('Please enter a valid LINK token address');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.setLinkToken,
        formData.linkToken
      );

      if (result.success) {
        alert('LINK token address set successfully!');
        // Refresh VRF configuration to show updated LINK token
        await fetchVRF();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error setting LINK token:', error);
      alert('Error setting LINK token: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Please configure the contract addresses in the settings panel.
        </div>
      </div>
    );
  }

  if (fetching) {
    return <div className="text-center py-4">Loading VRF configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* LINK Token Configuration */}
      <div className="space-y-4 border-b border-border pb-4">
        <h4 className="text-md font-semibold">LINK Token Configuration</h4>
        {linkTokenAddress && linkTokenAddress !== ethers.constants.AddressZero ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              ✅ LINK Token Configured
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1 break-all">
              {linkTokenAddress}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ LINK Token Not Set
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Set the LINK token address to enable VRF subscription funding.
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2">LINK Token Address</label>
          <input
            type="text"
            value={formData.linkToken}
            onChange={(e) => setFormData({ ...formData, linkToken: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md"
            placeholder="0x..."
          />
        </div>
        <button
          onClick={handleSetLinkToken}
          disabled={loading || !formData.linkToken}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Setting...' : 'Set LINK Token Address'}
        </button>
      </div>

      {/* VRF Parameters */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold">VRF Parameters</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">VRF Coordinator</label>
            <input
              type="text"
              value={formData.coordinator}
              onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subscription ID</label>
            <input
              type="number"
              value={formData.subscriptionId}
              onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Key Hash</label>
            <input
              type="text"
              value={formData.keyHash}
              onChange={(e) => setFormData({ ...formData, keyHash: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Gas Limit</label>
            <input
              type="number"
              value={formData.gasLimit}
              onChange={(e) => setFormData({ ...formData, gasLimit: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save VRF Parameters'}
        </button>
      </div>
    </div>
  );
};

const SlotLimitsConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    minSlotLimitPrized: '',
    minSlotLimitNonPrized: '',
    maxSlotLimit: ''
  });

  useEffect(() => {
    const fetchLimits = async () => {
      if (!contracts.poolDeployer) {
        setError('PoolDeployer contract not configured for this network');
        setFetching(false);
        return;
      }
      try {
        const [minSlotLimit, minSlotLimitNonPrized, maxSlotLimit] = await Promise.all([
          contracts.poolDeployer.minSlotLimit(),
          contracts.poolDeployer.minSlotLimitNonPrized(),
          contracts.poolDeployer.maxSlotLimit()
        ]);
        setFormData({
          minSlotLimitPrized: minSlotLimit.toString(),
          minSlotLimitNonPrized: minSlotLimitNonPrized.toString(),
          maxSlotLimit: maxSlotLimit.toString()
        });
        setError(null);
      } catch (e) {
        console.error('Error fetching slot limits:', e);
        setError('Failed to fetch slot limits');
      } finally {
        setFetching(false);
      }
    };
    fetchLimits();
  }, [contracts.poolDeployer]);

  const handleSave = async () => {
    if (!contracts.poolDeployer) return;
    setLoading(true);
    try {
      const minPrized = parseInt(formData.minSlotLimitPrized);
      const minNonPrized = parseInt(formData.minSlotLimitNonPrized);
      const max = parseInt(formData.maxSlotLimit);

      if (isNaN(minPrized) || isNaN(minNonPrized) || isNaN(max)) {
        throw new Error('All values must be valid numbers');
      }

      const result = await executeTransaction(
        contracts.poolDeployer.setSlotLimits,
        minPrized,
        minNonPrized,
        max
      );
      
      if (result.success) {
        alert('Slot limits updated successfully!');
        // Refresh the data
        const [minSlotLimit, minSlotLimitNonPrized, maxSlotLimit] = await Promise.all([
          contracts.poolDeployer.minSlotLimit(),
          contracts.poolDeployer.minSlotLimitNonPrized(),
          contracts.poolDeployer.maxSlotLimit()
        ]);
        setFormData({
          minSlotLimitPrized: minSlotLimit.toString(),
          minSlotLimitNonPrized: minSlotLimitNonPrized.toString(),
          maxSlotLimit: maxSlotLimit.toString()
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (fetching) return <div className="text-center py-4">Loading slot limits...</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Min Slot Limit (Prized Pools)</label>
        <input
          type="number"
          value={formData.minSlotLimitPrized}
          onChange={(e) => setFormData({ ...formData, minSlotLimitPrized: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Min Slot Limit (Non-Prized Pools)</label>
        <input
          type="number"
          value={formData.minSlotLimitNonPrized}
          onChange={(e) => setFormData({ ...formData, minSlotLimitNonPrized: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Max Slot Limit</label>
        <input
          type="number"
          value={formData.maxSlotLimit}
          onChange={(e) => setFormData({ ...formData, maxSlotLimit: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save All Slot Limits'}
      </button>
    </div>
  );
};

const FeeConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    globalSlotFee: '',
    protocolFeePercentage: '',
    creationFeePercentage: '',
    socialEngagementFee: ''
  });

  useEffect(() => {
    const fetchFees = async () => {
      if (!contracts.poolDeployer) {
        setError('PoolDeployer contract not configured for this network');
        setFetching(false);
        return;
      }
      try {
        const [globalSlotFee, protocolFee, creationFee, socialFee] = await Promise.all([
          contracts.poolDeployer.globalSlotFee(),
          contracts.poolDeployer.protocolFeePercentage(),
          contracts.poolDeployer.creationFeePercentage(),
          contracts.poolDeployer.socialEngagementFee()
        ]);
        setFormData({
          globalSlotFee: ethers.utils.formatEther(globalSlotFee),
          protocolFeePercentage: (protocolFee / 100).toString(),
          creationFeePercentage: (creationFee / 100).toString(),
          socialEngagementFee: ethers.utils.formatEther(socialFee)
        });
        setError(null);
      } catch (e) {
        console.error('Error fetching fees:', e);
        setError('Failed to fetch fee configuration');
      } finally {
        setFetching(false);
      }
    };
    fetchFees();
  }, [contracts.poolDeployer]);

  const handleSave = async () => {
    if (!contracts.poolDeployer) return;
    setLoading(true);
    try {
      // Convert values for contract call
      const slotFee = ethers.utils.parseEther(formData.globalSlotFee || '0');
      const protocolFee = Math.round(parseFloat(formData.protocolFeePercentage || '0') * 100);
      const creationFee = Math.round(parseFloat(formData.creationFeePercentage || '0') * 100);
      const socialFee = ethers.utils.parseEther(formData.socialEngagementFee || '0');

      const result = await executeTransaction(
        contracts.poolDeployer.setFeeConfig,
        slotFee,
        protocolFee,
        creationFee,
        socialFee
      );
      
      if (result.success) {
        alert('Fee configuration updated successfully!');
        // Refresh the data
        const [globalSlotFee, protocolFeeVal, creationFeeVal, socialFeeVal] = await Promise.all([
          contracts.poolDeployer.globalSlotFee(),
          contracts.poolDeployer.protocolFeePercentage(),
          contracts.poolDeployer.creationFeePercentage(),
          contracts.poolDeployer.socialEngagementFee()
        ]);
        setFormData({
          globalSlotFee: ethers.utils.formatEther(globalSlotFee),
          protocolFeePercentage: (protocolFeeVal / 100).toString(),
          creationFeePercentage: (creationFeeVal / 100).toString(),
          socialEngagementFee: ethers.utils.formatEther(socialFeeVal)
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (fetching) return <div className="text-center py-4">Loading fee configuration...</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Global Slot Fee (ETH)</label>
        <input
          type="number"
          step="0.001"
          min="0"
          value={formData.globalSlotFee}
          onChange={(e) => setFormData({ ...formData, globalSlotFee: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md"
          placeholder="e.g., 0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Protocol Fee Percentage (%)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.protocolFeePercentage}
          onChange={(e) => setFormData({ ...formData, protocolFeePercentage: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md"
          placeholder="e.g., 2.5 for 2.5%"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Creation Fee Percentage (%)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.creationFeePercentage}
          onChange={(e) => setFormData({ ...formData, creationFeePercentage: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md"
          placeholder="e.g., 1.5 for 1.5%"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Social Engagement Fee (ETH)</label>
        <input
          type="number"
          step="0.001"
          min="0"
          value={formData.socialEngagementFee}
          onChange={(e) => setFormData({ ...formData, socialEngagementFee: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md"
          placeholder="e.g., 0.005"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save All Fee Settings'}
      </button>
    </div>
  );
};

const DurationConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    minDuration: '',
    maxDuration: ''
  });

  useEffect(() => {
    const fetchDurations = async () => {
      if (!contracts.poolDeployer) {
        setError('PoolDeployer contract not configured for this network');
        setFetching(false);
        return;
      }
      try {
        const [minDuration, maxDuration] = await Promise.all([
          contracts.poolDeployer.minPoolDuration(),
          contracts.poolDeployer.maxPoolDuration()
        ]);
        // Convert from seconds to minutes for display
        setFormData({
          minDuration: Math.floor(minDuration / 60).toString(),
          maxDuration: Math.floor(maxDuration / 60).toString()
        });
        setError(null);
      } catch (e) {
        console.error('Error fetching durations:', e);
        setError('Failed to fetch duration limits');
      } finally {
        setFetching(false);
      }
    };
    fetchDurations();
  }, [contracts.poolDeployer]);

  const handleSave = async () => {
    if (!contracts.poolDeployer) return;
    setLoading(true);
    try {
      // Convert from minutes to seconds for contract call
      const minDurationSeconds = parseInt(formData.minDuration) * 60;
      const maxDurationSeconds = parseInt(formData.maxDuration) * 60;
      
      const result = await executeTransaction(
        contracts.poolDeployer.setDurationLimits, 
        minDurationSeconds, 
        maxDurationSeconds
      );
      
      if (result.success) {
        alert('Duration limits updated successfully!');
        // Refresh data and convert back to minutes for display
        const [minDuration, maxDuration] = await Promise.all([
          contracts.poolDeployer.minPoolDuration(),
          contracts.poolDeployer.maxPoolDuration()
        ]);
        setFormData({
          minDuration: Math.floor(minDuration / 60).toString(),
          maxDuration: Math.floor(maxDuration / 60).toString()
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (fetching) return <div className="text-center py-4">Loading duration configuration...</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Min Duration (minutes)</label>
        <input
          type="number"
          value={formData.minDuration}
          onChange={(e) => setFormData({ ...formData, minDuration: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Max Duration (minutes)</label>
        <input
          type="number"
          value={formData.maxDuration}
          onChange={(e) => setFormData({ ...formData, maxDuration: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Duration Limits'}
      </button>
    </div>
  );
};

const SetRewardsFlywheel = () => {
  const { contracts, executeTransaction, getContractInstance } = useContract();
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [pointsSystemInfo, setPointsSystemInfo] = useState({
    pointsSystemActive: false,
    pointsClaimsActive: false,
    pointsPerToken: '0',
    pointsRewardToken: '',
    protocolToken: '',
    pointsRewardBalance: '0'
  });
  const [formData, setFormData] = useState({
    rewardsFlywheelAddress: '',
    depositToken: '',
    depositAmount: '',
    withdrawAmount: '',
    pointsPerToken: '',
    protocolToken: '',
    minMultiplierBalance: ''
  });

  // Fetch points system info
  const fetchPointsSystemInfo = useCallback(async (isInitialLoad = false) => {
    if (!contracts.rewardsFlywheel) {
      setError('RewardsFlywheel contract not configured for this network');
      setFetching(false);
      return;
    }
    try {
      console.log('Fetching points system info...');
      const [
        pointsSystemActive,
        pointsClaimsActive,
        pointsPerToken,
        pointsRewardToken,
        protocolToken,
        pointsRewardBalance
      ] = await Promise.all([
        contracts.rewardsFlywheel.pointsSystemActive(),
        contracts.rewardsFlywheel.pointsClaimsActive(),
        contracts.rewardsFlywheel.pointsPerToken(),
        contracts.rewardsFlywheel.pointsRewardToken(),
        contracts.rewardsFlywheel.protocolToken(),
        contracts.rewardsFlywheel.pointsRewardBalance()
      ]);
      
      console.log('Points system state:', {
        pointsSystemActive,
        pointsClaimsActive,
        pointsPerToken: pointsPerToken.toString(),
        pointsRewardToken,
        protocolToken,
        pointsRewardBalance: ethers.utils.formatEther(pointsRewardBalance)
      });
      
      setPointsSystemInfo({
        pointsSystemActive,
        pointsClaimsActive,
        pointsPerToken: pointsPerToken.toString(),
        pointsRewardToken,
        protocolToken,
        pointsRewardBalance: ethers.utils.formatEther(pointsRewardBalance)
      });
      
      // Only pre-populate form fields on initial load
      if (isInitialLoad) {
        setFormData(prev => ({
          ...prev,
          pointsPerToken: pointsPerToken.toString(),
          protocolToken: protocolToken,
          depositToken: pointsRewardToken
        }));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching points system info:', err);
      setError('Failed to fetch points system info');
    } finally {
      setFetching(false);
    }
  }, [contracts.rewardsFlywheel]);

  useEffect(() => {
    fetchPointsSystemInfo(true);
  }, [fetchPointsSystemInfo]);

  const handleSetRewardsFlywheel = async () => {
    if (!contracts.protocolManager || !formData.rewardsFlywheelAddress) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.setRewardsFlywheel,
        formData.rewardsFlywheelAddress
      );
      
      if (result.success) {
        alert('Rewards Flywheel contract set successfully!');
        setFormData(prev => ({ ...prev, rewardsFlywheelAddress: '' }));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositPointsRewardToken = async () => {
    if (!contracts.rewardsFlywheel || !formData.depositToken || !formData.depositAmount) return;
    
    if (!ethers.utils.isAddress(formData.depositToken)) {
      alert('Please enter a valid token address');
      return;
    }
    
    setLoading(true);
    setApproving(true);
    try {
      const amount = ethers.utils.parseEther(formData.depositAmount);
      
      // Approve token first
      const tokenContract = getContractInstance(formData.depositToken, 'erc20');
      if (!tokenContract) throw new Error('Failed to create token contract instance');
      
      const approveResult = await executeTransaction(
        tokenContract.approve,
        contracts.rewardsFlywheel.address,
        amount
      );
      if (!approveResult.success) throw new Error(approveResult.error);
      
      setApproving(false);
      
      const result = await executeTransaction(
        contracts.rewardsFlywheel.depositPointsRewardToken,
        formData.depositToken,
        amount
      );
      
      if (result.success) {
        alert('Points reward token deposited successfully!');
        setFormData(prev => ({ ...prev, depositAmount: '' }));
        await fetchPointsSystemInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
      setApproving(false);
    }
  };

  const handleSetPointsSystemActive = async (active) => {
    if (!contracts.rewardsFlywheel) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.rewardsFlywheel.setPointsSystemActive,
        active
      );
      
      if (result.success) {
        alert(`Points system ${active ? 'activated' : 'deactivated'} successfully!`);
        await fetchPointsSystemInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePointsClaims = async () => {
    if (!contracts.rewardsFlywheel) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.rewardsFlywheel.activatePointsClaims
      );
      
      if (result.success) {
        alert('Points claims activated successfully!');
        await fetchPointsSystemInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPointsPerToken = async () => {
    if (!contracts.rewardsFlywheel || !formData.pointsPerToken) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.rewardsFlywheel.setPointsPerToken,
        formData.pointsPerToken
      );
      
      if (result.success) {
        alert('Points per token updated successfully!');
        await fetchPointsSystemInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetProtocolToken = async () => {
    if (!contracts.rewardsFlywheel || !formData.protocolToken || !formData.minMultiplierBalance) return;
    
    if (!ethers.utils.isAddress(formData.protocolToken)) {
      alert('Please enter a valid token address');
      return;
    }
    
    setLoading(true);
    try {
      const minBalance = ethers.utils.parseEther(formData.minMultiplierBalance);
      const result = await executeTransaction(
        contracts.rewardsFlywheel.setProtocolToken,
        formData.protocolToken,
        minBalance
      );
      
      if (result.success) {
        alert('Protocol token set successfully!');
        await fetchPointsSystemInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawPointsRewardToken = async () => {
    if (!contracts.rewardsFlywheel || !formData.withdrawAmount) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to withdraw ${formData.withdrawAmount} tokens?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const amount = ethers.utils.parseEther(formData.withdrawAmount);
      const result = await executeTransaction(
        contracts.rewardsFlywheel.withdrawPointsRewardToken,
        amount
      );
      
      if (result.success) {
        alert('Points reward token withdrawn successfully!');
        setFormData(prev => ({ ...prev, withdrawAmount: '' }));
        await fetchPointsSystemInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error && !contracts.rewardsFlywheel) {
    return (
      <div className="space-y-4">
        <p className="text-red-500 text-sm">{error}</p>
        <div>
          <label className="block text-sm font-medium mb-2">Rewards Flywheel Address</label>
          <input
            type="text"
            value={formData.rewardsFlywheelAddress}
            onChange={(e) => setFormData({ ...formData, rewardsFlywheelAddress: e.target.value })}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>
        <button
          onClick={handleSetRewardsFlywheel}
          disabled={loading || !formData.rewardsFlywheelAddress}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Setting...' : 'Set Rewards Flywheel'}
        </button>
      </div>
    );
  }

  if (fetching) return <div className="text-center py-4">Loading points system info...</div>;

  return (
    <div className="space-y-6">
      {/* Current Status Display */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-sm">Current Points System Status</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">System Active:</span>
            <span className={`ml-2 ${pointsSystemInfo.pointsSystemActive ? 'text-green-600' : 'text-red-600'}`}>
              {pointsSystemInfo.pointsSystemActive ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Claims Active:</span>
            <span className={`ml-2 ${pointsSystemInfo.pointsClaimsActive ? 'text-green-600' : 'text-red-600'}`}>
              {pointsSystemInfo.pointsClaimsActive ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Points/Token:</span>
            <span className="ml-2">{pointsSystemInfo.pointsPerToken}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Reward Balance:</span>
            <span className="ml-2">{pointsSystemInfo.pointsRewardBalance}</span>
          </div>
        </div>
        <div className="text-xs break-all">
          <span className="text-muted-foreground">Reward Token:</span>
          <span className="ml-2">{pointsSystemInfo.pointsRewardToken || 'Not set'}</span>
        </div>
        <div className="text-xs break-all">
          <span className="text-muted-foreground">Protocol Token:</span>
          <span className="ml-2">{pointsSystemInfo.protocolToken || 'Not set'}</span>
        </div>
      </div>

      {/* Activate/Deactivate Points System */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Points System Control</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSetPointsSystemActive(true)}
            disabled={loading || pointsSystemInfo.pointsSystemActive}
            className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            Activate System
          </button>
          <button
            onClick={() => handleSetPointsSystemActive(false)}
            disabled={loading || !pointsSystemInfo.pointsSystemActive}
            className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            Deactivate System
          </button>
        </div>
        <button
          onClick={handleActivatePointsClaims}
          disabled={loading || pointsSystemInfo.pointsClaimsActive}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {pointsSystemInfo.pointsClaimsActive ? 'Claims Already Active' : 'Activate Points Claims'}
        </button>
      </div>

      {/* Set Points Per Token */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="font-medium text-sm">Configure Points Per Token</h4>
        <input
          type="number"
          value={formData.pointsPerToken}
          onChange={(e) => setFormData({ ...formData, pointsPerToken: e.target.value })}
          placeholder="Points per token (e.g., 100)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetPointsPerToken}
          disabled={loading || !formData.pointsPerToken}
          className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Setting...' : 'Set Points Per Token'}
        </button>
      </div>

      {/* Set Protocol Token */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="font-medium text-sm">Set Protocol Token</h4>
        <input
          type="text"
          value={formData.protocolToken}
          onChange={(e) => setFormData({ ...formData, protocolToken: e.target.value })}
          placeholder="Token address (0x...)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <input
          type="number"
          step="0.01"
          value={formData.minMultiplierBalance}
          onChange={(e) => setFormData({ ...formData, minMultiplierBalance: e.target.value })}
          placeholder="Min multiplier balance (e.g., 100)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetProtocolToken}
          disabled={loading || !formData.protocolToken || !formData.minMultiplierBalance}
          className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Setting...' : 'Set Protocol Token'}
        </button>
      </div>

      {/* Deposit Points Reward Token */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="font-medium text-sm">Deposit Points Reward Token</h4>
        <input
          type="text"
          value={formData.depositToken}
          onChange={(e) => setFormData({ ...formData, depositToken: e.target.value })}
          placeholder="Token address (0x...)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <input
          type="number"
          step="0.01"
          value={formData.depositAmount}
          onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
          placeholder="Amount to deposit"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleDepositPointsRewardToken}
          disabled={loading || approving || !formData.depositToken || !formData.depositAmount}
          className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          {approving ? 'Approving...' : loading ? 'Depositing...' : 'Deposit Reward Token'}
        </button>
      </div>

      {/* Withdraw Points Reward Token */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="font-medium text-sm">Withdraw Points Reward Token</h4>
        <input
          type="number"
          step="0.01"
          value={formData.withdrawAmount}
          onChange={(e) => setFormData({ ...formData, withdrawAmount: e.target.value })}
          placeholder="Amount to withdraw"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleWithdrawPointsRewardToken}
          disabled={loading || !formData.withdrawAmount}
          className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          {loading ? 'Withdrawing...' : 'Withdraw Reward Token'}
        </button>
      </div>

      {/* Set Rewards Flywheel Address (Admin) */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="font-medium text-sm">Update Rewards Flywheel Contract</h4>
        <input
          type="text"
          value={formData.rewardsFlywheelAddress}
          onChange={(e) => setFormData({ ...formData, rewardsFlywheelAddress: e.target.value })}
          placeholder="New Rewards Flywheel address (0x...)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetRewardsFlywheel}
          disabled={loading || !formData.rewardsFlywheelAddress}
          className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Setting...' : 'Update Rewards Flywheel'}
        </button>
      </div>
    </div>
  );
};

// VRF Management Interface
const VRFManagement = () => {
  const { contracts, executeTransaction, getContractInstance } = useContract();
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [linkTokenAddress, setLinkTokenAddress] = useState('');
  const [linkAllowance, setLinkAllowance] = useState('0');
  const [formData, setFormData] = useState({
    linkAmount: '',
    subscriptionId: '',
    fundSubscriptionId: '',
    fundAmount: ''
  });

  // Fetch LINK token address and allowance
  const fetchLinkInfo = useCallback(async () => {
    if (!contracts.protocolManager) return;
    try {
      const linkAddr = await contracts.protocolManager.linkToken();
      console.log('VRF Management: LINK token address from contract:', linkAddr);
      
      if (!linkAddr || linkAddr === ethers.constants.AddressZero) {
        console.warn('VRF Management: LINK token not configured in ProtocolManager');
        setLinkTokenAddress('');
        setLinkAllowance('0');
        return;
      }
      
      setLinkTokenAddress(linkAddr);
      
      // Fetch allowance if account is connected
      if (account) {
        const linkContract = getContractInstance(linkAddr, 'erc20');
        if (linkContract) {
          const allowance = await linkContract.allowance(account, contracts.protocolManager.address);
          setLinkAllowance(allowance.toString());
          console.log('VRF Management: LINK allowance:', allowance.toString());
        }
      }
    } catch (err) {
      console.error('VRF Management: Error fetching LINK info:', err);
      setLinkTokenAddress('');
      setLinkAllowance('0');
    }
  }, [contracts.protocolManager, account, getContractInstance]);

  useEffect(() => {
    fetchLinkInfo();
    
    // Set up polling to check for LINK token updates every 10 seconds
    const interval = setInterval(() => {
      fetchLinkInfo();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchLinkInfo]);

  const checkAndApproveLINK = async (requiredAmount) => {
    if (!linkTokenAddress || linkTokenAddress === ethers.constants.AddressZero) {
      throw new Error('LINK token not configured in ProtocolManager. Please set LINK token address first.');
    }
    
    if (!account) {
      throw new Error('Wallet not connected');
    }
    
    const linkContract = getContractInstance(linkTokenAddress, 'erc20');
    if (!linkContract) {
      throw new Error('Failed to create LINK contract instance');
    }
    
    const currentAllowance = await linkContract.allowance(account, contracts.protocolManager.address);
    
    if (currentAllowance.lt(requiredAmount)) {
      setApproving(true);
      try {
        // Reset allowance if needed (some tokens require this)
        if (currentAllowance.gt(0)) {
          const resetResult = await executeTransaction(
            linkContract.approve,
            contracts.protocolManager.address,
            0
          );
          if (!resetResult.success) throw new Error(resetResult.error);
        }
        
        // Approve required amount
        const approveResult = await executeTransaction(
          linkContract.approve,
          contracts.protocolManager.address,
          requiredAmount
        );
        if (!approveResult.success) throw new Error(approveResult.error);
        
        // Update allowance
        const newAllowance = await linkContract.allowance(account, contracts.protocolManager.address);
        setLinkAllowance(newAllowance.toString());
      } finally {
        setApproving(false);
      }
    }
  };

  const handleFundVRF = async () => {
    if (!contracts.protocolManager || !formData.linkAmount) return;
    setLoading(true);
    try {
      const amount = ethers.utils.parseUnits(formData.linkAmount, 18);
      
      // Check and approve LINK if needed
      await checkAndApproveLINK(amount);
      
      const result = await executeTransaction(
        contracts.protocolManager.fundVRFSubscriptionWithLink,
        amount
      );
      
      if (result.success) {
        alert('VRF subscription funded successfully!');
        setFormData({ ...formData, linkAmount: '' });
        // Refresh LINK info to update allowance
        await fetchLinkInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVRFSubscription = async () => {
    if (!contracts.protocolManager || !formData.subscriptionId) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.addVRFSubscription,
        formData.subscriptionId
      );
      
      if (result.success) {
        alert('VRF subscription added successfully!');
        setFormData({ ...formData, subscriptionId: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVRFSubscription = async () => {
    if (!contracts.protocolManager || !formData.subscriptionId) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to remove VRF subscription ${formData.subscriptionId}?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.removeVRFSubscription,
        formData.subscriptionId
      );
      
      if (result.success) {
        alert('VRF subscription removed successfully!');
        setFormData({ ...formData, subscriptionId: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFundVRFSubscriptionById = async () => {
    if (!contracts.protocolManager || !formData.fundSubscriptionId || !formData.fundAmount) return;
    setLoading(true);
    try {
      const amount = ethers.utils.parseUnits(formData.fundAmount, 18);
      
      // Check and approve LINK if needed
      await checkAndApproveLINK(amount);
      
      const result = await executeTransaction(
        contracts.protocolManager.fundVRFSubscriptionWithLinkById,
        formData.fundSubscriptionId,
        amount
      );
      
      if (result.success) {
        alert(`VRF subscription ${formData.fundSubscriptionId} funded successfully!`);
        setFormData({ ...formData, fundSubscriptionId: '', fundAmount: '' });
        // Refresh LINK info to update allowance
        await fetchLinkInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* LINK Token Warning/Info */}
      {!linkTokenAddress || linkTokenAddress === ethers.constants.AddressZero ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ LINK Token Not Configured
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            The LINK token address is not set in ProtocolManager. You need to set it before funding VRF subscriptions.
            Please use the VRF Configuration section to set the LINK token address via setLinkToken().
          </p>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <div className="font-medium mb-1">LINK Token Configuration</div>
          <div>Address: {linkTokenAddress.slice(0, 10)}...{linkTokenAddress.slice(-8)}</div>
          <div>Current Allowance: {parseFloat(ethers.utils.formatEther(linkAllowance)).toFixed(4)} LINK</div>
        </div>
      )}

      {/* Fund Default VRF Subscription */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold">Fund Default VRF Subscription</h4>
        <div>
          <label className="block text-sm font-medium mb-2">LINK Amount</label>
          <input
            type="number"
            step="0.01"
            value={formData.linkAmount}
            onChange={(e) => setFormData({ ...formData, linkAmount: e.target.value })}
            placeholder="Enter LINK amount"
            className="w-full px-3 py-2 border border-border rounded-md"
            disabled={!linkTokenAddress || linkTokenAddress === ethers.constants.AddressZero}
          />
        </div>
        <button
          onClick={handleFundVRF}
          disabled={loading || approving || !formData.linkAmount || !linkTokenAddress || linkTokenAddress === ethers.constants.AddressZero}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {approving ? 'Approving LINK...' : loading ? 'Funding...' : 'Fund Default Subscription'}
        </button>
      </div>

      {/* Add/Remove VRF Subscription */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="text-md font-semibold">Manage VRF Subscriptions</h4>
        <div>
          <label className="block text-sm font-medium mb-2">Subscription ID</label>
          <input
            type="number"
            value={formData.subscriptionId}
            onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
            placeholder="Enter subscription ID"
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddVRFSubscription}
            disabled={loading || !formData.subscriptionId}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Subscription'}
          </button>
          <button
            onClick={handleRemoveVRFSubscription}
            disabled={loading || !formData.subscriptionId}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Removing...' : 'Remove Subscription'}
          </button>
        </div>
      </div>

      {/* Fund Specific VRF Subscription by ID */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="text-md font-semibold">Fund Specific Subscription by ID</h4>
        <div>
          <label className="block text-sm font-medium mb-2">Subscription ID</label>
          <input
            type="number"
            value={formData.fundSubscriptionId}
            onChange={(e) => setFormData({ ...formData, fundSubscriptionId: e.target.value })}
            placeholder="Enter subscription ID"
            className="w-full px-3 py-2 border border-border rounded-md"
            disabled={!linkTokenAddress || linkTokenAddress === ethers.constants.AddressZero}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">LINK Amount</label>
          <input
            type="number"
            step="0.01"
            value={formData.fundAmount}
            onChange={(e) => setFormData({ ...formData, fundAmount: e.target.value })}
            placeholder="Enter LINK amount"
            className="w-full px-3 py-2 border border-border rounded-md"
            disabled={!linkTokenAddress || linkTokenAddress === ethers.constants.AddressZero}
          />
        </div>
        <button
          onClick={handleFundVRFSubscriptionById}
          disabled={loading || approving || !formData.fundSubscriptionId || !formData.fundAmount || !linkTokenAddress || linkTokenAddress === ethers.constants.AddressZero}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {approving ? 'Approving LINK...' : loading ? 'Funding...' : 'Fund Subscription by ID'}
        </button>
      </div>
    </div>
  );
};

// Deposit Creator Rewards Interface
const DepositCreatorRewards = () => {
  const { contracts, executeTransaction, getContractInstance } = useContract();
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [checkingAllowance, setCheckingAllowance] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [depositData, setDepositData] = useState({
    tokenAddress: '',
    amount: '',
    rewardAmountPerPool: '',
    eligiblePoolCount: ''
  });
  const [updateData, setUpdateData] = useState({
    tokenAddress: '',
    newAmount: ''
  });

  const checkAllowance = useCallback(async () => {
    if (!depositData.tokenAddress || !depositData.amount || !contracts.rewardsFlywheel) {
      setNeedsApproval(false);
      setCheckingAllowance(false);
      return;
    }
    
    // Basic address validation
    if (!ethers.utils.isAddress(depositData.tokenAddress)) {
      setCheckingAllowance(false);
      return;
    }

    // No need to setCheckingAllowance(true) here as it's set by the useEffect/debouncer
    // but ensuring it's true before async operations doesn't hurt.
    
    try {
      const tokenContract = getContractInstance(depositData.tokenAddress, 'erc20');
      if (!tokenContract) {
        setCheckingAllowance(false);
        return;
      }

      // Get decimals first
      const decimals = await tokenContract.decimals();
      const amount = ethers.utils.parseUnits(depositData.amount, decimals);
      const ownerAddress = account || (tokenContract.signer && await tokenContract.signer.getAddress());
      const allowance = await tokenContract.allowance(ownerAddress, contracts.rewardsFlywheel.address);
      
      setNeedsApproval(allowance.lt(amount));
    } catch (error) {
      console.error('Error checking allowance:', error);
      setNeedsApproval(false);
    } finally {
      setCheckingAllowance(false);
    }
  }, [depositData.tokenAddress, depositData.amount, account, contracts.rewardsFlywheel, getContractInstance]);

  useEffect(() => {
    // Disable buttons immediately when input changes
    setCheckingAllowance(true);
    const timeoutId = setTimeout(() => {
      checkAllowance();
    }, 500); // Debounce check
    return () => clearTimeout(timeoutId);
  }, [checkAllowance]);

  const handleApprove = async () => {
    if (!depositData.tokenAddress || !contracts.rewardsFlywheel) {
      alert('Enter a token address and ensure RewardsFlywheel is configured.');
      return;
    }
    if (!ethers.utils.isAddress(depositData.tokenAddress)) {
      alert('Invalid token address');
      return;
    }
    // ethers.Contract always has an address; skip format check to match other interfaces
    setLoading(true);
    try {
      const tokenContract = getContractInstance(depositData.tokenAddress, 'erc20');
      if (!tokenContract) throw new Error('Invalid token address');
      const decimals = await tokenContract.decimals();
      const requiredAmount = ethers.utils.parseUnits(depositData.amount, decimals);
      if (requiredAmount.lte(0)) {
        alert('Approval amount must be greater than zero');
        return;
      }
      const ownerAddress = account || (tokenContract.signer && await tokenContract.signer.getAddress());
      const currentAllowance = await tokenContract.allowance(ownerAddress, contracts.rewardsFlywheel.address);
      if (currentAllowance.gte(requiredAmount)) {
        setNeedsApproval(false);
        await checkAllowance();
        setLoading(false);
        return;
      }
      if (currentAllowance.gt(0)) {
        const reset = await executeTransaction(
          tokenContract.approve,
          contracts.rewardsFlywheel.address,
          0
        );
        if (!reset.success) {
          throw new Error(reset.error);
        }
      }
      const approveExact = await executeTransaction(
        tokenContract.approve,
        contracts.rewardsFlywheel.address,
        requiredAmount
      );
      if (approveExact.success) {
        alert('Token approval successful!');
        await checkAllowance();
      } else {
        throw new Error(approveExact.error);
      }
    } catch (error) {
      alert('Error approving token: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!contracts.rewardsFlywheel || !depositData.tokenAddress || !depositData.amount || !depositData.rewardAmountPerPool || !depositData.eligiblePoolCount) {
      alert('Enter token address, amount, reward per pool, and eligible pool count');
      return;
    }
    if (!ethers.utils.isAddress(depositData.tokenAddress)) {
      alert('Invalid token address');
      return;
    }
    // ethers.Contract always has an address; skip format check to match other interfaces
    setLoading(true);
    try {
      const tokenContract = getContractInstance(depositData.tokenAddress, 'erc20');
      if (!tokenContract) throw new Error('Invalid token address');
      
      const decimals = await tokenContract.decimals();
      const amount = ethers.utils.parseUnits(depositData.amount, decimals);
      const rewardPerPool = ethers.utils.parseUnits(depositData.rewardAmountPerPool, decimals);
      const eligiblePoolCount = ethers.utils.parseUnits(depositData.eligiblePoolCount, 0); // No decimals for count
      if (amount.lte(0) || rewardPerPool.lte(0) || eligiblePoolCount.lte(0)) {
        alert('Amounts and pool count must be greater than zero');
        return;
      }
      const ownerAddress = account || (tokenContract.signer && await tokenContract.signer.getAddress());
      const allowance = await tokenContract.allowance(ownerAddress, contracts.rewardsFlywheel.address);
      if (allowance.lt(amount)) {
        setNeedsApproval(true);
        alert('Allowance is insufficient. Please approve the token.');
        return;
      }
      
      const result = await executeTransaction(
        contracts.rewardsFlywheel.depositCreatorRewards,
        depositData.tokenAddress,
        amount,
        rewardPerPool,
        eligiblePoolCount
      );
      
      if (result.success) {
        alert('Creator rewards deposited successfully!');
        setDepositData({ tokenAddress: '', amount: '', rewardAmountPerPool: '', eligiblePoolCount: '' });
        setNeedsApproval(false); // Reset approval state
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRewardAmount = async () => {
    if (!contracts.rewardsFlywheel || !updateData.tokenAddress || !updateData.newAmount) return;
    setLoading(true);
    try {
      const tokenContract = getContractInstance(updateData.tokenAddress, 'erc20');
      let decimals = 18;
      if (tokenContract) {
         try {
            decimals = await tokenContract.decimals();
         } catch (e) {
            console.warn("Could not fetch decimals for update, defaulting to 18", e);
         }
      }

      const newAmount = ethers.utils.parseUnits(updateData.newAmount, decimals);
      
      const result = await executeTransaction(
        contracts.rewardsFlywheel.updateCreatorRewardAmount,
        updateData.tokenAddress,
        newAmount
      );
      
      if (result.success) {
        alert('Creator reward amount updated successfully!');
        setUpdateData({ tokenAddress: '', newAmount: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!contracts.rewardsFlywheel) {
     return <div className="text-sm text-red-500">RewardsFlywheel contract not configured.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Deposit Section */}
      <div className="space-y-4">
        <h4 className="font-medium">Deposit New Rewards</h4>
        <div>
          <label className="block text-sm font-medium mb-2">Token Address</label>
          <input
            type="text"
            value={depositData.tokenAddress}
            onChange={(e) => setDepositData({ ...depositData, tokenAddress: e.target.value })}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Total Deposit Amount</label>
          <input
            type="number"
            value={depositData.amount}
            onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
            placeholder="Amount"
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Reward Amount Per Pool</label>
          <input
            type="number"
            value={depositData.rewardAmountPerPool}
            onChange={(e) => setDepositData({ ...depositData, rewardAmountPerPool: e.target.value })}
            placeholder="Amount per pool"
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Eligible Pool Count</label>
          <input
            type="number"
            value={depositData.eligiblePoolCount}
            onChange={(e) => setDepositData({ ...depositData, eligiblePoolCount: e.target.value })}
            placeholder="Number of pools eligible for rewards"
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>
        
        {needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={loading || checkingAllowance}
            className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? 'Approving...' : checkingAllowance ? 'Checking Allowance...' : 'Approve Token'}
          </button>
        ) : (
          <button
            onClick={handleDeposit}
            disabled={loading || checkingAllowance || !depositData.tokenAddress || !depositData.amount || !depositData.rewardAmountPerPool || !depositData.eligiblePoolCount}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Depositing...' : checkingAllowance ? 'Checking Allowance...' : 'Deposit Rewards'}
          </button>
        )}
      </div>

      <div className="border-t border-border pt-4"></div>

      {/* Update Section */}
      <div className="space-y-4">
        <h4 className="font-medium">Update Reward Amount</h4>
        <div>
          <label className="block text-sm font-medium mb-2">Token Address</label>
          <input
            type="text"
            value={updateData.tokenAddress}
            onChange={(e) => setUpdateData({ ...updateData, tokenAddress: e.target.value })}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">New Reward Amount Per Pool</label>
          <input
            type="number"
            value={updateData.newAmount}
            onChange={(e) => setUpdateData({ ...updateData, newAmount: e.target.value })}
            placeholder="New amount per pool"
            className="w-full px-3 py-2 border border-border rounded-md"
          />
        </div>
        <button
          onClick={handleUpdateRewardAmount}
          disabled={loading || !updateData.tokenAddress || !updateData.newAmount}
          className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Reward Amount'}
        </button>
      </div>
    </div>
  );
};

// Pool Control Interface
const PoolControlManagement = () => {
  const { contracts, executeTransaction, getContractInstance } = useContract();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [currentValues, setCurrentValues] = useState({
    creationPaused: false,
    isGated: false,
    taskAssignmentsPaused: false
  });
  const [formData, setFormData] = useState({
    creationPaused: false,
    isGated: false,
    taskAssignmentsPaused: false
  });

  // Fetch current status values
  useEffect(() => {
    const fetchCurrentValues = async () => {
      if (!contracts.poolDeployer) {
        setError('PoolDeployer contract not configured for this network');
        setFetching(false);
        return;
      }
      
      try {
        const [creationPaused, isGated] = await Promise.all([
          contracts.poolDeployer.creationPaused(),
          contracts.poolDeployer.isGated()
        ]);
        
        // Get SocialEngagementManager address and task assignment status
        let taskAssignmentsPaused = false;
        try {
          const socialEngagementAddress = await contracts.poolDeployer.socialEngagementManager();
          if (socialEngagementAddress && socialEngagementAddress !== ethers.constants.AddressZero) {
            const socialEngagementContract = getContractInstance(socialEngagementAddress, 'socialEngagementManager');
            if (socialEngagementContract) {
              taskAssignmentsPaused = await socialEngagementContract.isTaskAssignmentPaused();
            }
          }
        } catch (err) {
          console.error('Error fetching SocialEngagementManager status:', err);
        }
        
        const values = {
          creationPaused,
          isGated,
          taskAssignmentsPaused
        };
        
        setCurrentValues(values);
        setFormData(values);
        setError(null);
      } catch (err) {
        console.error('Error fetching pool control values:', err);
        setError('Failed to fetch pool control values');
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentValues();
  }, [contracts.poolDeployer, getContractInstance]);

  const handleSetCreationPaused = async () => {
    if (!contracts.poolDeployer) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.poolDeployer.setCreationPaused,
        formData.creationPaused
      );
      
      if (result.success) {
        alert(`Pool creation ${formData.creationPaused ? 'paused' : 'unpaused'} successfully!`);
        const creationPaused = await contracts.poolDeployer.creationPaused();
        setCurrentValues(prev => ({ ...prev, creationPaused }));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetGating = async () => {
    if (!contracts.poolDeployer) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.poolDeployer.setGating,
        formData.isGated
      );
      
      if (result.success) {
        alert(`Creator gating ${formData.isGated ? 'enabled' : 'disabled'} successfully!`);
        const isGated = await contracts.poolDeployer.isGated();
        setCurrentValues(prev => ({ ...prev, isGated }));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskAssignments = async () => {
    if (!contracts.poolDeployer) return;
    setLoading(true);
    try {
      const socialEngagementAddress = await contracts.poolDeployer.socialEngagementManager();
      if (socialEngagementAddress === ethers.constants.AddressZero) {
        throw new Error('SocialEngagementManager not configured');
      }
      
      const socialEngagementContract = getContractInstance(socialEngagementAddress, 'socialEngagementManager');
      if (!socialEngagementContract) {
        throw new Error('Failed to create SocialEngagementManager contract instance');
      }
      
      const result = await executeTransaction(
        socialEngagementContract.toggleTaskAssignments
      );
      
      if (result.success) {
        alert(`Task assignments ${!currentValues.taskAssignmentsPaused ? 'paused' : 'resumed'} successfully!`);
        const taskAssignmentsPaused = await socialEngagementContract.isTaskAssignmentPaused();
        setCurrentValues(prev => ({ ...prev, taskAssignmentsPaused }));
        setFormData(prev => ({ ...prev, taskAssignmentsPaused }));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (fetching) return <div className="text-center py-4">Loading pool control settings...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium">Pause Pool Creation</label>
          <p className="text-xs text-muted-foreground">
            Current: {currentValues.creationPaused ? 'Paused ⏸️' : 'Active ▶️'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.creationPaused}
            onChange={(e) => setFormData({ ...formData, creationPaused: e.target.checked })}
            className="rounded"
          />
          <button
            onClick={handleSetCreationPaused}
            disabled={loading || formData.creationPaused === currentValues.creationPaused}
            className="bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium">Creator Gating</label>
          <p className="text-xs text-muted-foreground">
            Current: {currentValues.isGated ? 'Enabled ✅' : 'Disabled ❌'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isGated}
            onChange={(e) => setFormData({ ...formData, isGated: e.target.checked })}
            className="rounded"
          />
          <button
            onClick={handleSetGating}
            disabled={loading || formData.isGated === currentValues.isGated}
            className="bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium">Task Assignments</label>
          <p className="text-xs text-muted-foreground">
            Current: {currentValues.taskAssignmentsPaused ? 'Paused ⏸️' : 'Active ▶️'}
          </p>
        </div>
        <button
          onClick={handleToggleTaskAssignments}
          disabled={loading}
          className="bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Toggling...' : 'Toggle'}
        </button>
      </div>
    </div>
  );
};

// Contract Management Interface
const ContractManagement = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    creatorToken: '',
    minBalance: '',
    nftFactory: '',
    poolDeployer: '',
    revenueManager: '',
    contractType: '',
    newAddress: ''
  });

  const handleSetCreatorToken = async () => {
    if (!contracts.protocolManager || !formData.creatorToken || !formData.minBalance) return;
    setLoading(true);
    try {
      const minBalance = ethers.utils.parseUnits(formData.minBalance, 18);
      const result = await executeTransaction(
        contracts.protocolManager.setCreatorToken,
        formData.creatorToken,
        minBalance
      );
      
      if (result.success) {
        alert('Creator token updated successfully!');
        setFormData({ ...formData, creatorToken: '', minBalance: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetNFTFactory = async () => {
    if (!contracts.protocolManager || !formData.nftFactory) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.setNFTFactory,
        formData.nftFactory
      );
      
      if (result.success) {
        alert('NFT Factory updated successfully!');
        setFormData({ ...formData, nftFactory: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPoolDeployer = async () => {
    if (!contracts.protocolManager || !formData.poolDeployer) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.setPoolDeployer,
        formData.poolDeployer
      );
      
      if (result.success) {
        alert('Pool Deployer updated successfully!');
        setFormData({ ...formData, poolDeployer: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetRevenueManager = async () => {
    if (!contracts.protocolManager || !formData.revenueManager) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.setRevenueManager,
        formData.revenueManager
      );
      
      if (result.success) {
        alert('Revenue Manager updated successfully!');
        setFormData({ ...formData, revenueManager: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceContract = async () => {
    if (!contracts.protocolManager || !formData.contractType || !formData.newAddress) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.replaceContract,
        formData.contractType,
        formData.newAddress
      );
      
      if (result.success) {
        alert(`${formData.contractType} contract replaced successfully!`);
        setFormData({ ...formData, contractType: '', newAddress: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="font-medium">Creator Token Configuration</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={formData.creatorToken}
            onChange={(e) => setFormData({ ...formData, creatorToken: e.target.value })}
            placeholder="Creator token address"
            className="px-3 py-2 border border-border rounded-md text-sm"
          />
          <input
            type="number"
            step="0.01"
            value={formData.minBalance}
            onChange={(e) => setFormData({ ...formData, minBalance: e.target.value })}
            placeholder="Min balance required"
            className="px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <button
          onClick={handleSetCreatorToken}
          disabled={loading || !formData.creatorToken || !formData.minBalance}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Set Creator Token'}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">NFT Factory</h4>
        <input
          type="text"
          value={formData.nftFactory}
          onChange={(e) => setFormData({ ...formData, nftFactory: e.target.value })}
          placeholder="NFT Factory contract address"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetNFTFactory}
          disabled={loading || !formData.nftFactory}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Set NFT Factory'}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Pool Deployer</h4>
        <input
          type="text"
          value={formData.poolDeployer}
          onChange={(e) => setFormData({ ...formData, poolDeployer: e.target.value })}
          placeholder="Pool Deployer contract address"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetPoolDeployer}
          disabled={loading || !formData.poolDeployer}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Set Pool Deployer'}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Revenue Manager</h4>
        <input
          type="text"
          value={formData.revenueManager}
          onChange={(e) => setFormData({ ...formData, revenueManager: e.target.value })}
          placeholder="Revenue Manager contract address"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetRevenueManager}
          disabled={loading || !formData.revenueManager}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Set Revenue Manager'}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Replace Contract</h4>
        <p className="text-sm text-muted-foreground">
          Replace PoolDeployer or NFTFactory contract addresses using the generic replaceContract function.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={formData.contractType}
            onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
            className="px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="">Select contract type</option>
            <option value="PoolDeployer">PoolDeployer</option>
            <option value="NFTFactory">NFTFactory</option>
          </select>
          <input
            type="text"
            value={formData.newAddress}
            onChange={(e) => setFormData({ ...formData, newAddress: e.target.value })}
            placeholder="New contract address"
            className="px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <button
          onClick={handleReplaceContract}
          disabled={loading || !formData.contractType || !formData.newAddress}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Replacing...' : 'Replace Contract'}
        </button>
      </div>
    </div>
  );
};

// Fee and Engagement Management Interface
const FeeEngagementManagement = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [currentValues, setCurrentValues] = useState({
    socialEngagementManager: '',
    gatingToken: '',
    minGatingTokenBalance: ''
  });
  const [formData, setFormData] = useState({
    socialEngagementManager: '',
    gatingToken: '',
    minGatingTokenBalance: ''
  });

  useEffect(() => {
    const fetchCurrentValues = async () => {
      if (!contracts.poolDeployer) {
        setError('PoolDeployer contract not configured for this network');
        setFetching(false);
        return;
      }
      
      try {
        const [socialEngagementManager, gatingToken, minGatingTokenBalance] = await Promise.all([
          contracts.poolDeployer.socialEngagementManager(),
          contracts.poolDeployer.gatingToken(),
          contracts.poolDeployer.minGatingTokenBalance()
        ]);

        setCurrentValues({
          socialEngagementManager,
          gatingToken,
          minGatingTokenBalance: ethers.utils.formatEther(minGatingTokenBalance)
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching fee & engagement values:', err);
        setError('Failed to fetch configuration');
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentValues();
  }, [contracts.poolDeployer]);

  const handleSetGatingToken = async () => {
    if (!contracts.poolDeployer || !formData.gatingToken) return;
    
    // Validate address format
    if (!ethers.utils.isAddress(formData.gatingToken)) {
      alert('Please enter a valid token address (0x...)');
      return;
    }
    
    setLoading(true);
    try {
      const minBalance = ethers.utils.parseEther(formData.minGatingTokenBalance || '0');
      const result = await executeTransaction(
        contracts.poolDeployer.setGatingToken,
        formData.gatingToken,
        minBalance
      );
      
      if (result.success) {
        alert('Gating token configuration updated successfully!');
        setFormData({ ...formData, gatingToken: '', minGatingTokenBalance: '' });
        // Refresh current values
        const [gatingToken, minGatingTokenBalance] = await Promise.all([
          contracts.poolDeployer.gatingToken(),
          contracts.poolDeployer.minGatingTokenBalance()
        ]);
        setCurrentValues(prev => ({
          ...prev,
          gatingToken,
          minGatingTokenBalance: ethers.utils.formatEther(minGatingTokenBalance)
        }));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetSocialEngagementManager = async () => {
    if (!contracts.protocolManager || !formData.socialEngagementManager) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.setSocialEngagementManager,
        formData.socialEngagementManager
      );
      
      if (result.success) {
        alert('Social Engagement Manager updated successfully!');
        setFormData({ ...formData, socialEngagementManager: '' });
        // Refresh current values
        const newManager = await contracts.poolDeployer.socialEngagementManager();
        setCurrentValues(prev => ({ ...prev, socialEngagementManager: newManager }));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (fetching) return <div className="text-center py-4">Loading configuration...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="font-medium">Gating Token Configuration</h4>
        <div className="text-sm text-muted-foreground mb-2 break-all">
          Current Token: {currentValues.gatingToken || 'Not set'}
        </div>
        <div className="text-sm text-muted-foreground mb-2">
          Min Balance: {currentValues.minGatingTokenBalance} tokens
        </div>
        <input
          type="text"
          value={formData.gatingToken}
          onChange={(e) => setFormData({ ...formData, gatingToken: e.target.value })}
          placeholder="Gating token address (0x...)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm mb-2"
        />
        <input
          type="number"
          step="0.01"
          value={formData.minGatingTokenBalance}
          onChange={(e) => setFormData({ ...formData, minGatingTokenBalance: e.target.value })}
          placeholder="Minimum token balance required"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetGatingToken}
          disabled={loading || !formData.gatingToken}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Set Gating Token'}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Social Engagement Manager</h4>
        <div className="text-sm text-muted-foreground mb-2 break-all">
          Current: {currentValues.socialEngagementManager || 'Not set'}
        </div>
        <input
          type="text"
          value={formData.socialEngagementManager}
          onChange={(e) => setFormData({ ...formData, socialEngagementManager: e.target.value })}
          placeholder="Social Engagement Manager address"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetSocialEngagementManager}
          disabled={loading || !formData.socialEngagementManager}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Set Social Engagement Manager'}
        </button>
      </div>
    </div>
  );
};

// System Management Interface
const SystemManagement = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [currentValues, setCurrentValues] = useState({
    owner: '',
    nftFactory: '',
    poolDeployer: ''
  });
  const [formData, setFormData] = useState({
    newOwner: '',
    erc721Implementation: '',
    erc1155Implementation: '',
    poolImplementation: ''
  });

  // Fetch current system values
  useEffect(() => {
    const fetchCurrentValues = async () => {
      if (!contracts.protocolManager) return;
      
      try {
        const [owner, nftFactory, poolDeployer] = await Promise.all([
          contracts.protocolManager.owner(),
          contracts.protocolManager.nftFactory(),
          contracts.protocolManager.poolDeployer()
        ]);
        
        setCurrentValues({
          owner,
          nftFactory,
          poolDeployer
        });
      } catch (error) {
        console.error('Error fetching system values:', error);
      }
    };

    fetchCurrentValues();
  }, [contracts.protocolManager]);

  const handleTransferOwnership = async () => {
    if (!contracts.protocolManager || !formData.newOwner) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.transferOwnership,
        formData.newOwner
      );
      
      if (result.success) {
        alert('Ownership transferred successfully!');
        setFormData({ ...formData, newOwner: '' });
        // Refresh current values
        const owner = await contracts.protocolManager.owner();
        setCurrentValues(prev => ({ ...prev, owner }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNFTFactoryImplementations = async () => {
    if (!contracts.protocolManager || !formData.erc721Implementation || !formData.erc1155Implementation) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.updateNFTFactoryImplementations,
        formData.erc721Implementation,
        formData.erc1155Implementation
      );
      
      if (result.success) {
        alert('NFT Factory implementations updated successfully!');
        setFormData({ ...formData, erc721Implementation: '', erc1155Implementation: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePoolDeployerImplementation = async () => {
    if (!contracts.protocolManager || !formData.poolImplementation) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.updatePoolDeployerImplementation,
        formData.poolImplementation
      );
      
      if (result.success) {
        alert('Pool Deployer implementation updated successfully!');
        setFormData({ ...formData, poolImplementation: '' });
        // Refresh current values
        const poolDeployer = await contracts.protocolManager.poolDeployer();
        setCurrentValues(prev => ({ ...prev, poolDeployer }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="font-medium text-red-600">Transfer Ownership</h4>
        <div className="text-sm text-muted-foreground mb-2 break-all">
          Current Owner: {currentValues.owner}
        </div>
        <p className="text-xs text-muted-foreground text-red-500">⚠️ This action is irreversible!</p>
        <input
          type="text"
          value={formData.newOwner}
          onChange={(e) => setFormData({ ...formData, newOwner: e.target.value })}
          placeholder="New owner address"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleTransferOwnership}
          disabled={loading || !formData.newOwner}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          {loading ? 'Transferring...' : 'Transfer Ownership'}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Update NFT Factory Implementations</h4>
        <div className="text-sm text-muted-foreground mb-2 break-all">
          Current NFT Factory: {currentValues.nftFactory}
        </div>
        <div className="space-y-2">
          <input
            type="text"
            value={formData.erc721Implementation}
            onChange={(e) => setFormData({ ...formData, erc721Implementation: e.target.value })}
            placeholder="ERC721 implementation address"
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
          <input
            type="text"
            value={formData.erc1155Implementation}
            onChange={(e) => setFormData({ ...formData, erc1155Implementation: e.target.value })}
            placeholder="ERC1155 implementation address"
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <button
          onClick={handleUpdateNFTFactoryImplementations}
          disabled={loading || !formData.erc721Implementation || !formData.erc1155Implementation}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Update NFT Factory Implementations'}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Update Pool Deployer Implementation</h4>
        <div className="text-sm text-muted-foreground mb-2 break-all">
          Current Pool Deployer: {currentValues.poolDeployer}
        </div>
        <input
          type="text"
          value={formData.poolImplementation}
          onChange={(e) => setFormData({ ...formData, poolImplementation: e.target.value })}
          placeholder="Pool implementation address"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleUpdatePoolDeployerImplementation}
          disabled={loading || !formData.poolImplementation}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Update Pool Deployer Implementation'}
        </button>
      </div>
    </div>
  );
};

// Revenue Manager Interface
const RevenueManagerInterface = () => {
  const { contracts, executeTransaction } = useContract();
  const { provider } = useWallet();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [quoting, setQuoting] = useState(false);

  // Contract state
  const [contractState, setContractState] = useState({
    adminRevenue: '0',
    buybackEnabled: false,
    buybackPercentage: '0',
    protocolToken: '',
    dexRouter: '',
    lockDuration: '0',
    minBuybackAmount: '0',
    totalLockedTokens: '0',
    tokenLockCount: '0'
  });

  // DEX Router quote state
  const [dexQuote, setDexQuote] = useState({
    buybackETH: '0',
    quotedTokens: '0',
    minTokensOut: '0',
    slippageBps: '300',
    deadlineMinutes: '5'
  });

  // Configuration form state
  const [configForm, setConfigForm] = useState({
    protocolToken: '',
    dexRouter: '',
    buybackPercentage: '',
    minBuybackAmount: '',
    lockDuration: '',
    // Individual update fields
    updatePercentage: '',
    updateLockDuration: '',
    updateMinBuybackAmount: ''
  });

  const DEX_ROUTER_ABI = [
    'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
    'function WETH() external pure returns (address)'
  ];

  // Fetch all contract state
  const fetchContractState = useCallback(async () => {
    if (!contracts.revenueManager) return;
    setRefreshing(true);
    try {
      const [
        adminRevenue,
        buybackEnabled,
        buybackPercentage,
        protocolToken,
        dexRouter,
        lockDuration,
        minBuybackAmount,
        totalLockedTokens,
        tokenLockCount
      ] = await Promise.all([
        contracts.revenueManager.adminRevenue(),
        contracts.revenueManager.buybackEnabled(),
        contracts.revenueManager.buybackPercentage(),
        contracts.revenueManager.protocolToken(),
        contracts.revenueManager.dexRouter(),
        contracts.revenueManager.lockDuration(),
        contracts.revenueManager.minBuybackAmount(),
        contracts.revenueManager.totalLockedTokens(),
        contracts.revenueManager.getTokenLockCount()
      ]);

      setContractState({
        adminRevenue: adminRevenue.toString(),
        buybackEnabled,
        buybackPercentage: buybackPercentage.toString(),
        protocolToken,
        dexRouter,
        lockDuration: lockDuration.toString(),
        minBuybackAmount: minBuybackAmount.toString(),
        totalLockedTokens: totalLockedTokens.toString(),
        tokenLockCount: tokenLockCount.toString()
      });
    } catch (error) {
      console.error('Error fetching revenue manager state:', error);
    } finally {
      setRefreshing(false);
    }
  }, [contracts.revenueManager]);

  useEffect(() => {
    fetchContractState();
    const interval = setInterval(fetchContractState, 30000);
    return () => clearInterval(interval);
  }, [fetchContractState]);

  // Query DEX Router for quote
  const handleQueryDexRouter = async () => {
    if (!contractState.dexRouter || contractState.dexRouter === ethers.constants.AddressZero) {
      alert('DEX Router not configured on the contract');
      return;
    }
    if (!contractState.protocolToken || contractState.protocolToken === ethers.constants.AddressZero) {
      alert('Protocol token not configured on the contract');
      return;
    }

    const adminRevBN = ethers.BigNumber.from(contractState.adminRevenue);
    if (adminRevBN.isZero()) {
      alert('No revenue available to quote');
      return;
    }

    setQuoting(true);
    try {
      const router = new ethers.Contract(contractState.dexRouter, DEX_ROUTER_ABI, provider);

      // Calculate how much ETH will go to buyback
      const buybackPct = ethers.BigNumber.from(contractState.buybackPercentage);
      const buybackETH = adminRevBN.mul(buybackPct).div(10000);

      if (buybackETH.isZero()) {
        setDexQuote(prev => ({ ...prev, buybackETH: '0', quotedTokens: '0', minTokensOut: '0' }));
        alert('Buyback ETH amount is zero (percentage may be 0)');
        setQuoting(false);
        return;
      }

      // Get current quote from the router
      const weth = await router.WETH();
      const path = [weth, contractState.protocolToken];
      const amounts = await router.getAmountsOut(buybackETH, path);
      const quotedTokens = amounts[1];

      // Apply slippage tolerance
      const slippageBps = parseInt(dexQuote.slippageBps) || 300;
      const minTokensOut = quotedTokens.mul(10000 - slippageBps).div(10000);

      setDexQuote(prev => ({
        ...prev,
        buybackETH: buybackETH.toString(),
        quotedTokens: quotedTokens.toString(),
        minTokensOut: minTokensOut.toString()
      }));
    } catch (error) {
      console.error('Error querying DEX Router:', error);
      alert('Error querying DEX Router: ' + error.message);
    } finally {
      setQuoting(false);
    }
  };

  // Recalculate minTokensOut when slippage changes
  const handleSlippageChange = (newSlippageBps) => {
    setDexQuote(prev => {
      const quotedBN = ethers.BigNumber.from(prev.quotedTokens || '0');
      if (quotedBN.isZero()) return { ...prev, slippageBps: newSlippageBps };
      const bps = parseInt(newSlippageBps) || 300;
      const minTokensOut = quotedBN.mul(10000 - bps).div(10000);
      return { ...prev, slippageBps: newSlippageBps, minTokensOut: minTokensOut.toString() };
    });
  };

  const handleWithdraw = async () => {
    if (!contracts.revenueManager) return;

    const adminRevBN = ethers.BigNumber.from(contractState.adminRevenue);
    if (adminRevBN.isZero()) {
      alert('No revenue available');
      return;
    }

    // Determine minTokensOut and deadline
    let minTokensOut = ethers.BigNumber.from(0);
    let deadline = 0;

    if (contractState.buybackEnabled && ethers.BigNumber.from(contractState.buybackPercentage).gt(0)) {
      if (dexQuote.quotedTokens === '0') {
        alert('Please query the DEX Router first to get a quote for slippage protection before withdrawing.');
        return;
      }
      minTokensOut = ethers.BigNumber.from(dexQuote.minTokensOut);
      const deadlineMinutes = parseInt(dexQuote.deadlineMinutes) || 5;
      deadline = Math.floor(Date.now() / 1000) + (deadlineMinutes * 60);
    }

    const confirmMsg = contractState.buybackEnabled && ethers.BigNumber.from(contractState.buybackPercentage).gt(0)
      ? `Withdraw ${ethers.utils.formatEther(contractState.adminRevenue)} ETH?\n\n` +
        `Buyback swap: ${ethers.utils.formatEther(dexQuote.buybackETH)} ETH\n` +
        `Min tokens out: ${ethers.utils.formatEther(dexQuote.minTokensOut)}\n` +
        `Slippage: ${(parseInt(dexQuote.slippageBps) / 100).toFixed(1)}%\n` +
        `Deadline: ${dexQuote.deadlineMinutes} minutes`
      : `Withdraw ${ethers.utils.formatEther(contractState.adminRevenue)} ETH from the Revenue Manager?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.revenueManager.withdraw,
        minTokensOut,
        deadline
      );
      if (result.success) {
        alert('Revenue withdrawn successfully!');
        await fetchContractState();
        setDexQuote(prev => ({ ...prev, buybackETH: '0', quotedTokens: '0', minTokensOut: '0' }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Configure Buyback (initial full setup)
  const handleConfigureBuyback = async () => {
    if (!contracts.revenueManager) return;

    if (!ethers.utils.isAddress(configForm.protocolToken)) {
      alert('Please enter a valid protocol token address');
      return;
    }
    if (!ethers.utils.isAddress(configForm.dexRouter)) {
      alert('Please enter a valid DEX router address');
      return;
    }
    if (!configForm.buybackPercentage || !configForm.minBuybackAmount || !configForm.lockDuration) {
      alert('Please fill in all configuration fields');
      return;
    }

    const pctBps = Math.round(parseFloat(configForm.buybackPercentage) * 100);
    if (pctBps < 0 || pctBps > 5000) {
      alert('Buyback percentage must be between 0% and 50%');
      return;
    }

    setLoading(true);
    try {
      const minAmount = ethers.utils.parseEther(configForm.minBuybackAmount);
      const durationSeconds = Math.round(parseFloat(configForm.lockDuration) * 86400);

      const result = await executeTransaction(
        contracts.revenueManager.configureBuyback,
        configForm.protocolToken,
        configForm.dexRouter,
        pctBps,
        minAmount,
        durationSeconds
      );
      if (result.success) {
        alert('Buyback configured successfully!');
        await fetchContractState();
        setConfigForm(prev => ({ ...prev, protocolToken: '', dexRouter: '', buybackPercentage: '', minBuybackAmount: '', lockDuration: '' }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Buyback Percentage
  const handleSetBuybackPercentage = async () => {
    if (!contracts.revenueManager || !configForm.updatePercentage) return;

    const pctBps = Math.round(parseFloat(configForm.updatePercentage) * 100);
    if (pctBps < 0 || pctBps > 5000) {
      alert('Buyback percentage must be between 0% and 50%');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(contracts.revenueManager.setBuybackPercentage, pctBps);
      if (result.success) {
        alert('Buyback percentage updated!');
        await fetchContractState();
        setConfigForm(prev => ({ ...prev, updatePercentage: '' }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Lock Duration
  const handleSetLockDuration = async () => {
    if (!contracts.revenueManager || !configForm.updateLockDuration) return;

    setLoading(true);
    try {
      const durationSeconds = Math.round(parseFloat(configForm.updateLockDuration) * 86400);
      const result = await executeTransaction(contracts.revenueManager.setLockDuration, durationSeconds);
      if (result.success) {
        alert('Lock duration updated!');
        await fetchContractState();
        setConfigForm(prev => ({ ...prev, updateLockDuration: '' }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Min Buyback Amount
  const handleSetMinBuybackAmount = async () => {
    if (!contracts.revenueManager || !configForm.updateMinBuybackAmount) return;

    setLoading(true);
    try {
      const amount = ethers.utils.parseEther(configForm.updateMinBuybackAmount);
      const result = await executeTransaction(contracts.revenueManager.setMinBuybackAmount, amount);
      if (result.success) {
        alert('Min buyback amount updated!');
        await fetchContractState();
        setConfigForm(prev => ({ ...prev, updateMinBuybackAmount: '' }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const s = parseInt(seconds);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
    return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
  };

  const shortenAddress = (addr) => {
    if (!addr || addr === ethers.constants.AddressZero) return 'Not Set';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-4">
      {/* Available Revenue */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="text-sm text-muted-foreground mb-1">Available Revenue</div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <span className="text-2xl font-bold">
            {refreshing ? 'Loading...' : `${ethers.utils.formatEther(contractState.adminRevenue)} ETH`}
          </span>
        </div>
      </div>

      {/* Contract Configuration */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-3">Contract Configuration</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="text-muted-foreground">Buyback Status</div>
          <div className={contractState.buybackEnabled ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {contractState.buybackEnabled ? 'Enabled' : 'Disabled'}
          </div>

          <div className="text-muted-foreground">Buyback Percentage</div>
          <div>{(parseInt(contractState.buybackPercentage) / 100).toFixed(1)}%</div>

          <div className="text-muted-foreground">Protocol Token</div>
          <div className="font-mono text-xs truncate" title={contractState.protocolToken}>
            {shortenAddress(contractState.protocolToken)}
          </div>

          <div className="text-muted-foreground">DEX Router</div>
          <div className="font-mono text-xs truncate" title={contractState.dexRouter}>
            {shortenAddress(contractState.dexRouter)}
          </div>

          <div className="text-muted-foreground">Lock Duration</div>
          <div>{formatDuration(contractState.lockDuration)}</div>

          <div className="text-muted-foreground">Min Buyback Amount</div>
          <div>{ethers.utils.formatEther(contractState.minBuybackAmount)} ETH</div>

          <div className="text-muted-foreground">Total Locked Tokens</div>
          <div>{ethers.utils.formatEther(contractState.totalLockedTokens)}</div>

          <div className="text-muted-foreground">Token Lock Count</div>
          <div>{contractState.tokenLockCount}</div>
        </div>
      </div>

      {/* Configure Buyback (Full Setup) */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-sm">Configure Buyback</h4>
        <p className="text-xs text-muted-foreground">
          Set up or reconfigure the buyback system with all parameters at once.
        </p>
        <input
          type="text"
          value={configForm.protocolToken}
          onChange={(e) => setConfigForm(prev => ({ ...prev, protocolToken: e.target.value }))}
          placeholder="Protocol token address (0x...)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <input
          type="text"
          value={configForm.dexRouter}
          onChange={(e) => setConfigForm(prev => ({ ...prev, dexRouter: e.target.value }))}
          placeholder="DEX router address (0x...)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Buyback %</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={configForm.buybackPercentage}
              onChange={(e) => setConfigForm(prev => ({ ...prev, buybackPercentage: e.target.value }))}
              placeholder="e.g. 10"
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Min Amount (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={configForm.minBuybackAmount}
              onChange={(e) => setConfigForm(prev => ({ ...prev, minBuybackAmount: e.target.value }))}
              placeholder="e.g. 0.01"
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Lock (days)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={configForm.lockDuration}
              onChange={(e) => setConfigForm(prev => ({ ...prev, lockDuration: e.target.value }))}
              placeholder="e.g. 30"
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleConfigureBuyback}
          disabled={loading || !configForm.protocolToken || !configForm.dexRouter || !configForm.buybackPercentage || !configForm.minBuybackAmount || !configForm.lockDuration}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          <Settings className="h-4 w-4" />
          {loading ? 'Configuring...' : 'Configure Buyback'}
        </button>
      </div>

      {/* Individual Parameter Updates */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-sm">Update Parameters</h4>

        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground">Buyback Percentage (%)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={configForm.updatePercentage}
              onChange={(e) => setConfigForm(prev => ({ ...prev, updatePercentage: e.target.value }))}
              placeholder={`Current: ${(parseInt(contractState.buybackPercentage) / 100).toFixed(1)}%`}
              className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
            />
            <button
              onClick={handleSetBuybackPercentage}
              disabled={loading || !configForm.updatePercentage}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {loading ? '...' : 'Update'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground">Lock Duration (days)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="1"
              min="0"
              value={configForm.updateLockDuration}
              onChange={(e) => setConfigForm(prev => ({ ...prev, updateLockDuration: e.target.value }))}
              placeholder={`Current: ${formatDuration(contractState.lockDuration)}`}
              className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
            />
            <button
              onClick={handleSetLockDuration}
              disabled={loading || !configForm.updateLockDuration}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {loading ? '...' : 'Update'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-muted-foreground">Min Buyback Amount (ETH)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.001"
              min="0"
              value={configForm.updateMinBuybackAmount}
              onChange={(e) => setConfigForm(prev => ({ ...prev, updateMinBuybackAmount: e.target.value }))}
              placeholder={`Current: ${ethers.utils.formatEther(contractState.minBuybackAmount)} ETH`}
              className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
            />
            <button
              onClick={handleSetMinBuybackAmount}
              disabled={loading || !configForm.updateMinBuybackAmount}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {loading ? '...' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* DEX Router Query — only shown when buyback is enabled */}
      {contractState.buybackEnabled && (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">DEX Router Quote</h4>
          <p className="text-xs text-muted-foreground">
            Query the DEX Router to calculate minimum tokens out for the buyback swap before withdrawing.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Slippage Tolerance</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={(parseInt(dexQuote.slippageBps) / 100).toString()}
                  onChange={(e) => {
                    const bps = Math.round(parseFloat(e.target.value || '0') * 100);
                    handleSlippageChange(bps.toString());
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">TX Deadline</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={dexQuote.deadlineMinutes}
                  onChange={(e) => setDexQuote(prev => ({ ...prev, deadlineMinutes: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">min</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleQueryDexRouter}
            disabled={quoting || contractState.adminRevenue === '0'}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            {quoting ? 'Querying Router...' : 'Get DEX Quote'}
          </button>

          {dexQuote.quotedTokens !== '0' && (
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyback Amount</span>
                <span>{ethers.utils.formatEther(dexQuote.buybackETH)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Tokens</span>
                <span>{ethers.utils.formatEther(dexQuote.quotedTokens)}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-border pt-1.5">
                <span className="text-muted-foreground">Min Tokens Out</span>
                <span className="text-green-600">{ethers.utils.formatEther(dexQuote.minTokensOut)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={loading || contractState.adminRevenue === '0'}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <DollarSign className="h-4 w-4" />
        {loading ? 'Withdrawing...' : 'Withdraw Revenue'}
      </button>

      <p className="text-xs text-muted-foreground">
        {contractState.buybackEnabled
          ? 'Withdraws revenue and executes buyback swap. Query the DEX Router first to set slippage protection.'
          : 'Withdraws all accumulated revenue from the Revenue Manager contract.'}
      </p>
    </div>
  );
};

const AccessManagement = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [newOperator, setNewOperator] = useState('');

  const handleSetOperator = async () => {
    if (!contracts.protocolManager || !newOperator) return;
    setLoading(true);
    try {
      const result = await executeTransaction(contracts.protocolManager.setOperator, newOperator);
      if (result.success) {
        alert('Operator set successfully!');
        setNewOperator('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExistingCollections = async () => {
    if (!contracts.protocolManager) return;
    setLoading(true);
    try {
      const result = await executeTransaction(contracts.protocolManager.toggleAllowExistingCollections);
      if (result.success) {
        alert('Existing collections setting toggled successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-semibold mb-3">Operator Management</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newOperator}
            onChange={(e) => setNewOperator(e.target.value)}
            placeholder="0x... (operator address)"
            className="flex-1 px-3 py-2 border border-border rounded-md"
          />
          <button
            onClick={handleSetOperator}
            disabled={loading || !newOperator}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Set Operator
          </button>
        </div>
      </div>
      
      <div>
        <h4 className="text-md font-semibold mb-3">Collection Settings</h4>
        <button
          onClick={handleToggleExistingCollections}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Toggle Allow Existing Collections
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { account, connected } = useWallet();
  const { contracts } = useContract();

  // Check if contracts are properly configured
  const contractsConfigured = contracts.protocolManager && contracts.revenueManager;

  if (!connected) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <p className="text-muted-foreground">Please connect your wallet to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (!contractsConfigured) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Contract Configuration Required</h3>
            <p className="text-yellow-700 mb-4">
              The contract addresses are not properly configured for this network. Please switch to a supported network in your wallet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Configure and manage the protocol settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigSection title="VRF Configuration" icon={Settings}>
          <VRFConfiguration />
        </ConfigSection>

        <ConfigSection title="Slot Limits" icon={Users}>
          <SlotLimitsConfiguration />
        </ConfigSection>

        <ConfigSection title="Fee Configuration" icon={DollarSign}>
          <FeeConfiguration />
        </ConfigSection>

        <ConfigSection title="Duration Limits" icon={Clock}>
          <DurationConfiguration />
        </ConfigSection>

        <ConfigSection title="Set Rewards Flywheel Contract" icon={Package}>
          <SetRewardsFlywheel />
        </ConfigSection>

        <ConfigSection title="VRF Management" icon={Zap}>
          <VRFManagement />
        </ConfigSection>

        <ConfigSection title="Deposit Creator Rewards" icon={Award}>
          <DepositCreatorRewards />
        </ConfigSection>

        <ConfigSection title="Pool Control" icon={Pause}>
          <PoolControlManagement />
        </ConfigSection>

        <ConfigSection title="Contract Management" icon={Settings}>
          <ContractManagement />
        </ConfigSection>

        <ConfigSection title="Fee & Engagement" icon={DollarSign}>
          <FeeEngagementManagement />
        </ConfigSection>

        <ConfigSection title="System Management" icon={Globe}>
          <SystemManagement />
        </ConfigSection>

        <ConfigSection title="Revenue Manager" icon={DollarSign}>
          <RevenueManagerInterface />
        </ConfigSection>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Access Management
        </h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <AccessManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
