import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Settings, DollarSign, Clock, Users, Package, Pause, Globe, Zap, Award, Plus, Trash2 } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
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
  const [formData, setFormData] = useState({
    subscriptionId: '',
    coordinator: '',
    keyHash: '',
    gasLimit: ''
  });

  useEffect(() => {
    const fetchVRF = async () => {
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
        setFormData({
          subscriptionId: subscriptionId.toString(),
          coordinator,
          keyHash,
          gasLimit: gasLimit.toString()
        });
        setError(null);
      } catch (e) {
        console.error('VRF: Error fetching VRF params:', e);
        setError('Failed to fetch VRF configuration. Please check contract address and network.');
      } finally {
        setFetching(false);
      }
    };
    fetchVRF();
  }, [contracts.protocolManager]);

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
    <div className="space-y-4">
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
        {loading ? 'Saving...' : 'Save VRF Configuration'}
      </button>
    </div>
  );
};

const SlotLimitsConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    minSlotLimit: '',
    maxSlotLimit: '',
    minSlotLimitNonPrized: ''
  });

  useEffect(() => {
    const fetchLimits = async () => {
      if (!contracts.protocolManager) {
        setFetching(false);
        return;
      }
      try {
        const [slotLimits, minSlotLimitNonPrized] = await Promise.all([
          contracts.protocolManager.getSlotLimits(),
          contracts.protocolManager.minSlotLimitNonPrized()
        ]);
        setFormData({
          minSlotLimit: slotLimits[0].toString(),
          maxSlotLimit: slotLimits[1].toString(),
          minSlotLimitNonPrized: minSlotLimitNonPrized.toString()
        });
      } catch (e) {
        console.error('Error fetching slot limits:', e);
      } finally {
        setFetching(false);
      }
    };
    fetchLimits();
  }, [contracts.protocolManager]);

  const handleSave = async (field, value) => {
    if (!contracts.protocolManager) return;
    setLoading(true);
    try {
      let result;
      if (field === 'minSlotLimit' || field === 'maxSlotLimit') {
        // For slot limits, we need to use setSlotLimits with both values
        const currentMin = field === 'minSlotLimit' ? parseInt(value) : parseInt(formData.minSlotLimit);
        const currentMax = field === 'maxSlotLimit' ? parseInt(value) : parseInt(formData.maxSlotLimit);
        result = await executeTransaction(contracts.protocolManager.setSlotLimits, currentMin, currentMax);
      } else if (field === 'minSlotLimitNonPrized') {
        result = await executeTransaction(contracts.protocolManager.setMinSlotLimitNonPrized, parseInt(value));
      }
      
      if (result.success) {
        alert('Slot limit updated successfully!');
        // Refresh the data
        const [slotLimits, minSlotLimitNonPrized] = await Promise.all([
          contracts.protocolManager.getSlotLimits(),
          contracts.protocolManager.minSlotLimitNonPrized()
        ]);
        setFormData({
          minSlotLimit: slotLimits[0].toString(),
          maxSlotLimit: slotLimits[1].toString(),
          minSlotLimitNonPrized: minSlotLimitNonPrized.toString()
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

  if (fetching) return <div className="text-center py-4">Loading slot limits...</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Min Slot Limit</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={formData.minSlotLimit}
            onChange={(e) => setFormData({ ...formData, minSlotLimit: e.target.value })}
            className="flex-1 px-3 py-2 border border-border rounded-md"
          />
          <button
            onClick={() => handleSave('minSlotLimit', formData.minSlotLimit)}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Max Slot Limit</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={formData.maxSlotLimit}
            onChange={(e) => setFormData({ ...formData, maxSlotLimit: e.target.value })}
            className="flex-1 px-3 py-2 border border-border rounded-md"
          />
          <button
            onClick={() => handleSave('maxSlotLimit', formData.maxSlotLimit)}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Min Slot Limit (Non-Prized)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={formData.minSlotLimitNonPrized}
            onChange={(e) => setFormData({ ...formData, minSlotLimitNonPrized: e.target.value })}
            className="flex-1 px-3 py-2 border border-border rounded-md"
          />
          <button
            onClick={() => handleSave('minSlotLimitNonPrized', formData.minSlotLimitNonPrized)}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const FeeConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    creationFeePercentage: '',
    protocolFeePercentage: ''
  });

  useEffect(() => {
    const fetchFees = async () => {
      if (!contracts.protocolManager) {
        setFetching(false);
        return;
      }
      try {
        const [creationFee, protocolFee] = await Promise.all([
          contracts.protocolManager.getCreationFeePercentage(),
          contracts.protocolManager.protocolFeePercentage()
        ]);
        // Convert from basis points to percentages for display (divide by 100)
        setFormData({
          creationFeePercentage: (creationFee / 100).toString(),
          protocolFeePercentage: (protocolFee / 100).toString()
        });
      } catch (e) {
        console.error('Error fetching fees:', e);
      } finally {
        setFetching(false);
      }
    };
    fetchFees();
  }, [contracts.protocolManager]);

  const handleSave = async (field, value) => {
    if (!contracts.protocolManager) return;
    setLoading(true);
    try {
      let result;
      // Convert from percentage to basis points for contract call (multiply by 100)
      const basisPointsValue = Math.round(parseFloat(value) * 100);
      
      if (field === 'creationFeePercentage') {
        result = await executeTransaction(contracts.protocolManager.setCreationFeePercentage, basisPointsValue);
      } else if (field === 'protocolFeePercentage') {
        result = await executeTransaction(contracts.protocolManager.setProtocolFee, basisPointsValue);
      }
      
      if (result.success) {
        alert('Fee updated successfully!');
        // Refresh the data and convert back to percentages for display
        const [creationFee, protocolFee] = await Promise.all([
          contracts.protocolManager.getCreationFeePercentage(),
          contracts.protocolManager.protocolFeePercentage()
        ]);
        setFormData({
          creationFeePercentage: (creationFee / 100).toString(),
          protocolFeePercentage: (protocolFee / 100).toString()
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

  if (fetching) return <div className="text-center py-4">Loading fee configuration...</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Creation Fee Percentage (%)</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.creationFeePercentage}
            onChange={(e) => setFormData({ ...formData, creationFeePercentage: e.target.value })}
            className="flex-1 px-3 py-2 border border-border rounded-md"
            placeholder="e.g., 2.5 for 2.5%"
          />
          <button
            onClick={() => handleSave('creationFeePercentage', formData.creationFeePercentage)}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Protocol Fee Percentage (%)</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.protocolFeePercentage}
            onChange={(e) => setFormData({ ...formData, protocolFeePercentage: e.target.value })}
            className="flex-1 px-3 py-2 border border-border rounded-md"
            placeholder="e.g., 1.5 for 1.5%"
          />
          <button
            onClick={() => handleSave('protocolFeePercentage', formData.protocolFeePercentage)}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const DurationConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    minDuration: '',
    maxDuration: ''
  });

  useEffect(() => {
    const fetchDurations = async () => {
      if (!contracts.protocolManager) {
        setFetching(false);
        return;
      }
      try {
        const [minDuration, maxDuration] = await contracts.protocolManager.getDurationLimits();
        // Convert from seconds to minutes for display
        setFormData({
          minDuration: Math.floor(minDuration / 60).toString(),
          maxDuration: Math.floor(maxDuration / 60).toString()
        });
      } catch (e) {
        console.error('Error fetching durations:', e);
      } finally {
        setFetching(false);
      }
    };
    fetchDurations();
  }, [contracts.protocolManager]);

  const handleSave = async () => {
    if (!contracts.protocolManager) return;
    setLoading(true);
    try {
      // Convert from minutes to seconds for contract call
      const minDurationSeconds = parseInt(formData.minDuration) * 60;
      const maxDurationSeconds = parseInt(formData.maxDuration) * 60;
      
      const result = await executeTransaction(
        contracts.protocolManager.setDurationLimits, 
        minDurationSeconds, 
        maxDurationSeconds
      );
      
      if (result.success) {
        alert('Duration limits updated successfully!');
        // Refresh data and convert back to minutes for display
        const [minDuration, maxDuration] = await contracts.protocolManager.getDurationLimits();
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

const CollectionWhitelistManagement = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [whitelistStatus, setWhitelistStatus] = useState(null);
  const [currentAllowExisting, setCurrentAllowExisting] = useState(false);
  const [formData, setFormData] = useState({
    collectionAddress: '',
    allowExistingCollections: false
  });

  // Fetch current allowExistingCollections status
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!contracts.protocolManager) return;
      
      try {
        const allowExisting = await contracts.protocolManager.allowExistingCollections();
        setCurrentAllowExisting(allowExisting);
        setFormData(prev => ({ ...prev, allowExistingCollections: allowExisting }));
      } catch (error) {
        console.error('Error fetching allowExistingCollections status:', error);
      }
    };

    fetchCurrentStatus();
  }, [contracts.protocolManager]);

  // Check whitelist status when address changes
  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (!contracts.protocolManager || !formData.collectionAddress || !ethers.isAddress(formData.collectionAddress)) {
        setWhitelistStatus(null);
        return;
      }
      
      setCheckingStatus(true);
      try {
        const isApproved = await contracts.protocolManager.isCollectionApproved(formData.collectionAddress);
        setWhitelistStatus(isApproved);
      } catch (error) {
        console.error('Error checking collection approval status:', error);
        setWhitelistStatus(null);
      } finally {
        setCheckingStatus(false);
      }
    };

    const timeoutId = setTimeout(checkWhitelistStatus, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [contracts.protocolManager, formData.collectionAddress]);

  const handleAddExternalCollection = async () => {
    if (!contracts.protocolManager || !formData.collectionAddress) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.addExternalCollection,
        formData.collectionAddress
      );
      
      if (result.success) {
        alert('External collection added successfully!');
        // Refresh whitelist status
        const isApproved = await contracts.protocolManager.isCollectionApproved(formData.collectionAddress);
        setWhitelistStatus(isApproved);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInternalCollection = async () => {
    if (!contracts.protocolManager || !formData.collectionAddress) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.addInternalCollection,
        formData.collectionAddress
      );
      
      if (result.success) {
        alert('Internal collection added successfully!');
        // Refresh whitelist status
        const isApproved = await contracts.protocolManager.isCollectionApproved(formData.collectionAddress);
        setWhitelistStatus(isApproved);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollection = async () => {
    if (!contracts.protocolManager || !formData.collectionAddress) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.removeApprovedCollection,
        formData.collectionAddress
      );
      
      if (result.success) {
        alert('Collection removed successfully!');
        // Refresh whitelist status
        const isApproved = await contracts.protocolManager.isCollectionApproved(formData.collectionAddress);
        setWhitelistStatus(isApproved);
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
      const result = await executeTransaction(
        contracts.protocolManager.toggleAllowExistingCollections,
        formData.allowExistingCollections
      );
      
      if (result.success) {
        alert(`Existing collections ${formData.allowExistingCollections ? 'enabled' : 'disabled'} successfully!`);
        // Refresh current status
        const allowExisting = await contracts.protocolManager.allowExistingCollections();
        setCurrentAllowExisting(allowExisting);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (checkingStatus) return 'Checking...';
    if (whitelistStatus === null) return 'Enter valid address to check status';
    return whitelistStatus ? 'Approved ✅' : 'Not Approved ❌';
  };

  const getStatusColor = () => {
    if (checkingStatus || whitelistStatus === null) return 'text-muted-foreground';
    return whitelistStatus ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Collection Address</label>
        <input
          type="text"
          value={formData.collectionAddress}
          onChange={(e) => setFormData({ ...formData, collectionAddress: e.target.value })}
          placeholder="Enter collection contract address (0x...)"
          className="w-full px-3 py-2 border border-border rounded-md"
        />
        <div className={`text-sm mt-2 ${getStatusColor()}`}>
          Status: {getStatusDisplay()}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          <button
            onClick={handleAddExternalCollection}
            disabled={loading || !formData.collectionAddress || whitelistStatus === true}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add External
          </button>
          
          <button
            onClick={handleRemoveCollection}
            disabled={loading || !formData.collectionAddress || whitelistStatus === false}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
        
        {whitelistStatus === true && (
          <div className="text-sm text-muted-foreground mt-2">
            ℹ️ This collection is already approved. Use "Remove" to unapprove it.
          </div>
        )}
        {whitelistStatus === false && (
          <div className="text-sm text-muted-foreground mt-2">
            ℹ️ This collection is not approved. Use "Add External" to approve it.
          </div>
        )}
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium">Allow Existing Collections</label>
            <p className="text-xs text-muted-foreground">
              Current: {currentAllowExisting ? 'Enabled ✅' : 'Disabled ❌'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.allowExistingCollections}
              onChange={(e) => setFormData({ ...formData, allowExistingCollections: e.target.checked })}
              className="rounded"
            />
            <button
              onClick={handleToggleExistingCollections}
              disabled={loading || formData.allowExistingCollections === currentAllowExisting}
              className="bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// VRF Management Interface
const VRFManagement = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    linkAmount: '',
    subscriptionId: '',
    fundSubscriptionId: '',
    fundAmount: ''
  });

  const handleFundVRF = async () => {
    if (!contracts.protocolManager || !formData.linkAmount) return;
    setLoading(true);
    try {
      const amount = ethers.utils.parseUnits(formData.linkAmount, 18); // LINK has 18 decimals
      const result = await executeTransaction(
        contracts.protocolManager.fundVRFSubscriptionWithLink,
        amount
      );
      
      if (result.success) {
        alert('VRF subscription funded successfully!');
        setFormData({ ...formData, linkAmount: '' });
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
      // Convert LINK amount to uint96 (LINK has 18 decimals)
      const amount = ethers.utils.parseUnits(formData.fundAmount, 18);
      const result = await executeTransaction(
        contracts.protocolManager.fundVRFSubscriptionWithLinkById,
        formData.fundSubscriptionId,
        amount
      );
      
      if (result.success) {
        alert(`VRF subscription ${formData.fundSubscriptionId} funded successfully!`);
        setFormData({ ...formData, fundSubscriptionId: '', fundAmount: '' });
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
          />
        </div>
        <button
          onClick={handleFundVRF}
          disabled={loading || !formData.linkAmount}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Funding...' : 'Fund Default Subscription'}
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
          />
        </div>
        <button
          onClick={handleFundVRFSubscriptionById}
          disabled={loading || !formData.fundSubscriptionId || !formData.fundAmount}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Funding...' : 'Fund Subscription by ID'}
        </button>
      </div>
    </div>
  );
};

// ERC20 Prize Management Interface
const ERC20PrizeManagement = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [whitelistStatus, setWhitelistStatus] = useState(null);
  const [formData, setFormData] = useState({
    tokenAddress: ''
  });

  // Check whitelist status when address changes
  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (!contracts.protocolManager || !formData.tokenAddress || !ethers.isAddress(formData.tokenAddress)) {
        setWhitelistStatus(null);
        return;
      }
      
      setCheckingStatus(true);
      try {
        const isWhitelisted = await contracts.protocolManager.isERC20PrizeWhitelisted(formData.tokenAddress);
        setWhitelistStatus(isWhitelisted);
      } catch (error) {
        console.error('Error checking whitelist status:', error);
        setWhitelistStatus(null);
      } finally {
        setCheckingStatus(false);
      }
    };

    const timeoutId = setTimeout(checkWhitelistStatus, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [contracts.protocolManager, formData.tokenAddress]);

  const handleAddERC20Prize = async () => {
    if (!contracts.protocolManager || !formData.tokenAddress) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.addERC20Prize,
        formData.tokenAddress
      );
      
      if (result.success) {
        alert('ERC20 prize token added successfully!');
        // Refresh whitelist status
        const isWhitelisted = await contracts.protocolManager.isERC20PrizeWhitelisted(formData.tokenAddress);
        setWhitelistStatus(isWhitelisted);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveERC20Prize = async () => {
    if (!contracts.protocolManager || !formData.tokenAddress) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.removeERC20Prize,
        formData.tokenAddress
      );
      
      if (result.success) {
        alert('ERC20 prize token removed successfully!');
        // Refresh whitelist status
        const isWhitelisted = await contracts.protocolManager.isERC20PrizeWhitelisted(formData.tokenAddress);
        setWhitelistStatus(isWhitelisted);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (checkingStatus) return 'Checking...';
    if (whitelistStatus === null) return 'Enter valid address to check status';
    return whitelistStatus ? 'Whitelisted ✅' : 'Not Whitelisted ❌';
  };

  const getStatusColor = () => {
    if (checkingStatus || whitelistStatus === null) return 'text-muted-foreground';
    return whitelistStatus ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Token Address</label>
        <input
          type="text"
          value={formData.tokenAddress}
          onChange={(e) => setFormData({ tokenAddress: e.target.value })}
          placeholder="Enter ERC20 token contract address"
          className="w-full px-3 py-2 border border-border rounded-md"
        />
        <div className={`text-sm mt-2 ${getStatusColor()}`}>
          Status: {getStatusDisplay()}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleAddERC20Prize}
          disabled={loading || !formData.tokenAddress || whitelistStatus === true}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Prize Token'}
        </button>
        <button
          onClick={handleRemoveERC20Prize}
          disabled={loading || !formData.tokenAddress || whitelistStatus === false}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Removing...' : 'Remove Prize Token'}
        </button>
      </div>
      {whitelistStatus === true && (
        <div className="text-sm text-muted-foreground">
          ℹ️ This token is already whitelisted. Use "Remove" to unwhitelist it.
        </div>
      )}
      {whitelistStatus === false && (
        <div className="text-sm text-muted-foreground">
          ℹ️ This token is not whitelisted. Use "Add" to whitelist it.
        </div>
      )}
    </div>
  );
};

// Pool Control Interface
const PoolControlManagement = () => {
  const { contracts, executeTransaction, getContractInstance } = useContract();
  const [loading, setLoading] = useState(false);
  const [currentValues, setCurrentValues] = useState({
    pauseCreation: false,
    creatorTokenGated: false,
    prizedPools: false,
    taskAssignmentsPaused: false
  });
  const [formData, setFormData] = useState({
    pauseCreation: false,
    creatorTokenGated: false,
    prizedPools: false,
    taskAssignmentsPaused: false
  });

  // Fetch current status values
  useEffect(() => {
    const fetchCurrentValues = async () => {
      if (!contracts.protocolManager) return;
      
      try {
        const [pauseCreation, creatorTokenGated, prizedPools] = await Promise.all([
          contracts.protocolManager.isCreationPaused(),
          contracts.protocolManager.isCreatorTokenGated(),
          contracts.protocolManager.prizedPoolsEnabled()
        ]);
        
        // Get SocialEngagementManager address and task assignment status
        let taskAssignmentsPaused = false;
        try {
          const socialEngagementAddress = await contracts.protocolManager.socialEngagementManager();
          if (socialEngagementAddress && socialEngagementAddress !== ethers.constants.AddressZero) {
            const socialEngagementContract = getContractInstance(socialEngagementAddress, 'socialEngagementManager');
            if (socialEngagementContract) {
              taskAssignmentsPaused = await socialEngagementContract.isTaskAssignmentPaused();
            }
          }
        } catch (error) {
          console.error('Error fetching SocialEngagementManager status:', error);
        }
        
        const values = {
          pauseCreation,
          creatorTokenGated,
          prizedPools,
          taskAssignmentsPaused
        };
        
        setCurrentValues(values);
        setFormData(values);
      } catch (error) {
        console.error('Error fetching pool control values:', error);
      }
    };

    fetchCurrentValues();
  }, [contracts.protocolManager]);

  const handlePausePoolCreation = async () => {
    if (!contracts.protocolManager) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.pausePoolCreation,
        formData.pauseCreation
      );
      
      if (result.success) {
        alert(`Pool creation ${formData.pauseCreation ? 'paused' : 'unpaused'} successfully!`);
        // Refresh current values
        const pauseCreation = await contracts.protocolManager.isCreationPaused();
        setCurrentValues(prev => ({ ...prev, pauseCreation }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCreatorTokenGated = async () => {
    if (!contracts.protocolManager) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.toggleCreatorTokenGated,
        formData.creatorTokenGated
      );
      
      if (result.success) {
        alert(`Creator token gating ${formData.creatorTokenGated ? 'enabled' : 'disabled'} successfully!`);
        // Refresh current values
        const creatorTokenGated = await contracts.protocolManager.isCreatorTokenGated();
        setCurrentValues(prev => ({ ...prev, creatorTokenGated }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrizedPools = async () => {
    if (!contracts.protocolManager) return;
    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.protocolManager.togglePrizedPools,
        formData.prizedPools
      );
      
      if (result.success) {
        alert(`Prized pools ${formData.prizedPools ? 'enabled' : 'disabled'} successfully!`);
        // Refresh current values
        const prizedPools = await contracts.protocolManager.prizedPoolsEnabled();
        setCurrentValues(prev => ({ ...prev, prizedPools }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskAssignments = async () => {
    if (!contracts.protocolManager) return;
    setLoading(true);
    try {
      // Get SocialEngagementManager address
      const socialEngagementAddress = await contracts.protocolManager.socialEngagementManager();
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
        alert(`Task assignments ${formData.taskAssignmentsPaused ? 'paused' : 'resumed'} successfully!`);
        // Refresh current values
        const taskAssignmentsPaused = await socialEngagementContract.isTaskAssignmentPaused();
        setCurrentValues(prev => ({ ...prev, taskAssignmentsPaused }));
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium">Pause Pool Creation</label>
          <p className="text-xs text-muted-foreground">
            Current: {currentValues.pauseCreation ? 'Paused ⏸️' : 'Active ▶️'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.pauseCreation}
            onChange={(e) => setFormData({ ...formData, pauseCreation: e.target.checked })}
            className="rounded"
          />
          <button
            onClick={handlePausePoolCreation}
            disabled={loading || formData.pauseCreation === currentValues.pauseCreation}
            className="bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium">Creator Token Gated</label>
          <p className="text-xs text-muted-foreground">
            Current: {currentValues.creatorTokenGated ? 'Enabled ✅' : 'Disabled ❌'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.creatorTokenGated}
            onChange={(e) => setFormData({ ...formData, creatorTokenGated: e.target.checked })}
            className="rounded"
          />
          <button
            onClick={handleToggleCreatorTokenGated}
            disabled={loading || formData.creatorTokenGated === currentValues.creatorTokenGated}
            className="bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium">Prized Pools</label>
          <p className="text-xs text-muted-foreground">
            Current: {currentValues.prizedPools ? 'Enabled ✅' : 'Disabled ❌'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.prizedPools}
            onChange={(e) => setFormData({ ...formData, prizedPools: e.target.checked })}
            className="rounded"
          />
          <button
            onClick={handleTogglePrizedPools}
            disabled={loading || formData.prizedPools === currentValues.prizedPools}
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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.taskAssignmentsPaused}
            onChange={(e) => setFormData({ ...formData, taskAssignmentsPaused: e.target.checked })}
            className="rounded"
          />
          <button
            onClick={handleToggleTaskAssignments}
            disabled={loading || formData.taskAssignmentsPaused === currentValues.taskAssignmentsPaused}
            className="bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
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
  const [currentValues, setCurrentValues] = useState({
    globalSlotFee: '',
    socialEngagementManager: '',
    socialEngagementFee: ''
  });
  const [formData, setFormData] = useState({
    globalSlotFee: '',
    socialEngagementManager: '',
    socialEngagementFee: ''
  });

  // Fetch current values using direct contract calls like working interfaces
  useEffect(() => {
    const fetchCurrentValues = async () => {
      if (!contracts.protocolManager) {
        setFetching(false);
        return;
      }
      
      try {
        // Use direct contract calls like Duration Limits and Fee Configuration interfaces
        const [globalSlotFee, socialEngagementManager, socialEngagementFee] = await Promise.all([
          contracts.protocolManager.globalSlotFee(),
          contracts.protocolManager.socialEngagementManager(),
          contracts.protocolManager.socialEngagementFee()
        ]);

        setCurrentValues({
          globalSlotFee: ethers.utils.formatEther(globalSlotFee) + ' ETH',
          socialEngagementManager: socialEngagementManager,
          socialEngagementFee: ethers.utils.formatEther(socialEngagementFee) + ' ETH'
        });
      } catch (error) {
        console.error('Error fetching fee & engagement values:', error);
        setCurrentValues({
          globalSlotFee: 'Error loading',
          socialEngagementManager: 'Error loading',
          socialEngagementFee: 'Error loading'
        });
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentValues();
  }, [contracts.protocolManager]);

  const handleSetGlobalSlotFee = async () => {
    if (!contracts.protocolManager || !formData.globalSlotFee) return;
    setLoading(true);
    try {
      const fee = ethers.utils.parseUnits(formData.globalSlotFee, 18);
      const result = await executeTransaction(
        contracts.protocolManager.setGlobalSlotFee,
        fee
      );
      
      if (result.success) {
        alert('Global slot fee updated successfully!');
        setFormData({ ...formData, globalSlotFee: '' });
        // Refresh current values using direct contract call
        const newFee = await contracts.protocolManager.globalSlotFee();
        setCurrentValues(prev => ({ ...prev, globalSlotFee: ethers.utils.formatEther(newFee) + ' ETH' }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
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
        // Refresh current values using direct contract call
        const newManager = await contracts.protocolManager.socialEngagementManager();
        setCurrentValues(prev => ({ ...prev, socialEngagementManager: newManager }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetSocialEngagementFee = async () => {
    if (!contracts.protocolManager || !formData.socialEngagementFee) return;
    setLoading(true);
    try {
      const fee = ethers.utils.parseUnits(formData.socialEngagementFee, 18);
      const result = await executeTransaction(
        contracts.protocolManager.setSocialEngagementFee,
        fee
      );
      
      if (result.success) {
        alert('Social Engagement Fee updated successfully!');
        setFormData({ ...formData, socialEngagementFee: '' });
        // Refresh current values using direct contract call
        const newFee = await contracts.protocolManager.socialEngagementFee();
        setCurrentValues(prev => ({ ...prev, socialEngagementFee: ethers.utils.formatEther(newFee) + ' ETH' }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-4">Loading fee & engagement configuration...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="font-medium">Global Slot Fee</h4>
        <div className="text-sm text-muted-foreground mb-2">
          Current: {currentValues.globalSlotFee}
        </div>
        <input
          type="number"
          step="0.01"
          value={formData.globalSlotFee}
          onChange={(e) => setFormData({ ...formData, globalSlotFee: e.target.value })}
          placeholder="Fee amount (ETH)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetGlobalSlotFee}
          disabled={loading || !formData.globalSlotFee}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Set Global Slot Fee'}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Social Engagement Manager</h4>
        <div className="text-sm text-muted-foreground mb-2 break-all">
          Current: {currentValues.socialEngagementManager}
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

      <div className="space-y-2">
        <h4 className="font-medium">Social Engagement Fee</h4>
        <div className="text-sm text-muted-foreground mb-2">
          Current: {currentValues.socialEngagementFee}
        </div>
        <input
          type="number"
          step="0.01"
          value={formData.socialEngagementFee}
          onChange={(e) => setFormData({ ...formData, socialEngagementFee: e.target.value })}
          placeholder="Fee amount (ETH)"
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
        />
        <button
          onClick={handleSetSocialEngagementFee}
          disabled={loading || !formData.socialEngagementFee}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
        >
          {loading ? 'Updating...' : 'Set Social Engagement Fee'}
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
  const [loading, setLoading] = useState(false);
  const [adminRevenue, setAdminRevenue] = useState('0');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch admin revenue balance
  const fetchAdminRevenue = useCallback(async () => {
    if (!contracts.revenueManager) return;
    setRefreshing(true);
    try {
      const revenue = await contracts.revenueManager.adminRevenue();
      setAdminRevenue(revenue.toString());
    } catch (error) {
      console.error('Error fetching admin revenue:', error);
      setAdminRevenue('0');
    } finally {
      setRefreshing(false);
    }
  }, [contracts.revenueManager]);

  useEffect(() => {
    fetchAdminRevenue();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAdminRevenue, 30000);
    return () => clearInterval(interval);
  }, [fetchAdminRevenue]);

  const handleWithdraw = async () => {
    if (!contracts.revenueManager) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to withdraw ${(parseFloat(adminRevenue) / 1e18).toFixed(6)} ETH from the Revenue Manager?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await executeTransaction(contracts.revenueManager.withdraw);
      if (result.success) {
        alert('Revenue withdrawn successfully!');
        // Fetch the actual balance from the contract after withdrawal
        await fetchAdminRevenue();
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
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <span className="text-2xl font-bold">
            {refreshing ? 'Loading...' : (parseFloat(adminRevenue) / 1e18).toFixed(6)} ETH
          </span>
        </div>
      </div>
      
      <button
        onClick={handleWithdraw}
        disabled={loading || parseFloat(adminRevenue) === 0}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <DollarSign className="h-4 w-4" />
        {loading ? 'Withdrawing...' : 'Withdraw Revenue'}
      </button>
      
      <p className="text-xs text-muted-foreground">
        Withdraws all accumulated revenue from the Revenue Manager contract to the owner's address.
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

        <ConfigSection title="Collection Whitelist Management" icon={Package}>
          <CollectionWhitelistManagement />
        </ConfigSection>

        <ConfigSection title="VRF Management" icon={Zap}>
          <VRFManagement />
        </ConfigSection>

        <ConfigSection title="ERC20 Prize Management" icon={Award}>
          <ERC20PrizeManagement />
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

