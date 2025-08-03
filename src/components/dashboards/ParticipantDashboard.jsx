import React, { useState, useEffect } from 'react';
import { Ticket, Clock, Trophy, Users } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import { ethers } from 'ethers';

const RaffleCard = ({ raffle, onPurchaseTickets, onClaimPrize, onClaimRefund }) => {
  const { address } = useWallet();
  const [userTickets, setUserTickets] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!raffle.contract || !address) {
        setUserTickets(0);
        setLoading(false);
        return;
      }

      try {
        const tickets = await raffle.contract.ticketsPurchased(address);
        setUserTickets(tickets.toNumber());
      } catch (error) {
        console.error('Error fetching user tickets:', error);
        setUserTickets(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [raffle.contract, address]);

  useEffect(() => {
    // Update time remaining every second
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = raffle.endTime?.toNumber() || 0;
      const remaining = endTime - now;
      
      if (remaining > 0) {
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining('Ended');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [raffle.endTime]);

  const getStatusBadge = () => {
    const now = Math.floor(Date.now() / 1000);
    const startTime = raffle.startTime?.toNumber() || 0;
    const endTime = raffle.endTime?.toNumber() || 0;

    if (raffle.state === 0) { // Pending
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
    } else if (raffle.state === 1) { // Active
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>;
    } else if (raffle.state === 2) { // Ended
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Ended</span>;
    } else if (raffle.state === 3) { // Drawing
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Drawing</span>;
    } else if (raffle.state === 4) { // Completed
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Completed</span>;
    } else if (raffle.state === 5) { // Deleted
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Deleted</span>;
    } else if (raffle.state === 6) { // ActivationFailed
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Failed</span>;
    } else if (raffle.state === 7) { // AllPrizesClaimed
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Claimed</span>;
    } else if (raffle.state === 8) { // Unengaged
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Unengaged</span>;
    }
    
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
  };

  const canPurchaseTickets = () => {
    return raffle.state === 1; // Active state
  };

  const canClaimPrize = () => {
    return raffle.state === 4 && raffle.isPrized; // Completed state with prize
  };

  const canClaimRefund = () => {
    return (raffle.state === 5 || raffle.state === 6) && userTickets > 0; // Deleted or ActivationFailed with tickets
  };

  const formatAddress = (addr) => {
    if (!addr) return 'N/A';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatEther = (amount) => {
    if (!amount) return '0';
    return ethers.utils.formatEther(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{raffle.name || 'Unnamed Raffle'}</h3>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Creator:</span>
          <span className="font-mono">{formatAddress(raffle.creator)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Ticket Price:</span>
          <span>{formatEther(raffle.ticketPrice)} ETH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Ticket Limit:</span>
          <span>{raffle.ticketLimit?.toNumber() || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Winners:</span>
          <span>{raffle.winnersCount?.toNumber() || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Time Remaining:</span>
          <span>{timeRemaining}</span>
        </div>
        {raffle.isPrized && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prize Collection:</span>
            <span className="font-mono">{formatAddress(raffle.prizeCollection)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Your Tickets:</span>
          <span>{loading ? '...' : userTickets}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        {canPurchaseTickets() && (
          <button
            onClick={() => onPurchaseTickets(raffle)}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Buy Tickets
          </button>
        )}
        
        {canClaimPrize() && (
          <button
            onClick={() => onClaimPrize(raffle)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Claim Prize
          </button>
        )}
        
        {canClaimRefund() && (
          <button
            onClick={() => onClaimRefund(raffle)}
            className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Claim Refund
          </button>
        )}
      </div>
    </div>
  );
};

const TicketPurchaseModal = ({ isOpen, onClose, raffle, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await onConfirm(raffle, quantity);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !raffle) return null;

  const maxTickets = raffle.maxTicketsPerParticipant?.toNumber() || 10;
  const ticketPrice = raffle.ticketPrice;
  const totalCost = ticketPrice ? ticketPrice.mul(quantity) : ethers.BigNumber.from(0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 mx-4">
        <h2 className="text-xl font-semibold mb-4">Purchase Tickets</h2>
        <p className="text-muted-foreground mb-4">Raffle: {raffle.name || 'Unnamed Raffle'}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              max={maxTickets}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum {maxTickets} tickets per participant
            </p>
          </div>
          
          <div className="p-3 bg-muted rounded-md">
            <div className="flex justify-between text-sm">
              <span>Price per ticket:</span>
              <span>{ethers.utils.formatEther(ticketPrice || '0')} ETH</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Total cost:</span>
              <span>{ethers.utils.formatEther(totalCost)} ETH</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParticipantDashboard = () => {
  const { connected, address } = useWallet();
  const { contracts, getContractInstance, executeTransaction } = useContract();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [error, setError] = useState('');

  // Fetch raffles from RaffleManager
  useEffect(() => {
    const fetchRaffles = async () => {
      if (!connected || !contracts.raffleManager) {
        setRaffles([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Get all raffle addresses from RaffleManager
        const raffleAddresses = await contracts.raffleManager.getAllRaffles();
        
        // Fetch details for each raffle
        const raffleDetails = await Promise.all(
          raffleAddresses.map(async (raffleAddress) => {
            try {
              const raffleContract = getContractInstance(raffleAddress, 'raffle');
              if (!raffleContract) {
                console.warn(`Failed to get contract instance for ${raffleAddress}`);
                return null;
              }

              // Fetch all raffle data in parallel
              let name, creator, startTime, endTime, state, ticketPrice, ticketLimit, winnersCount, isPrized, prizeCollection, maxTicketsPerParticipant;
              
              try {
                name = await raffleContract.name().catch(() => 'Unnamed Raffle');
                creator = await raffleContract.creator();
                startTime = await raffleContract.startTime();
                endTime = await raffleContract.endTime();
                state = await raffleContract.state();
                ticketPrice = await raffleContract.ticketPrice();
                ticketLimit = await raffleContract.ticketLimit();
                winnersCount = await raffleContract.winnersCount();
                isPrized = await raffleContract.isPrized();
                prizeCollection = await raffleContract.prizeCollection().catch(() => ethers.constants.AddressZero);
                maxTicketsPerParticipant = await raffleContract.maxTicketsPerParticipant().catch(() => ethers.BigNumber.from(0));
              } catch (error) {
                console.error(`Error fetching data for raffle ${raffleAddress}:`, error);
                return null;
              }

              console.log(`Raffle ${raffleAddress} data:`, {
                name,
                creator,
                startTime: startTime.toString(),
                endTime: endTime.toString(),
                state: state.toString(),
                ticketPrice: ticketPrice.toString(),
                ticketLimit: ticketLimit.toString(),
                winnersCount: winnersCount.toString(),
                isPrized,
                prizeCollection,
                maxTicketsPerParticipant: maxTicketsPerParticipant.toString()
              });

              return {
                address: raffleAddress,
                contract: raffleContract,
                name,
                creator,
                startTime,
                endTime,
                state: state,
                ticketPrice,
                ticketLimit,
                winnersCount,
                isPrized,
                prizeCollection,
                maxTicketsPerParticipant
              };
            } catch (error) {
              console.error(`Error fetching raffle ${raffleAddress}:`, error);
              return null;
            }
          })
        );

        // Filter out null values and sort by start time (newest first)
        const validRaffles = raffleDetails
          .filter(raffle => raffle !== null)
          .sort((a, b) => b.startTime.toNumber() - a.startTime.toNumber());

        setRaffles(validRaffles);
      } catch (error) {
        console.error('Error fetching raffles:', error);
        setError('Failed to fetch raffles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, [connected, contracts.raffleManager, getContractInstance]);

  const handlePurchaseTickets = (raffle) => {
    setSelectedRaffle(raffle);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async (raffle, quantity) => {
    if (!raffle.contract) {
      throw new Error('Raffle contract not available');
    }

    const totalCost = raffle.ticketPrice.mul(quantity);
    
    const result = await executeTransaction(
      raffle.contract.purchaseTickets,
      quantity,
      { value: totalCost }
    );

    if (result.success) {
      alert(`Successfully purchased ${quantity} tickets!`);
      // Refresh raffles data
      window.location.reload();
    } else {
      throw new Error(result.error);
    }
  };

  const handleClaimPrize = async (raffle) => {
    if (!raffle.contract) {
      alert('Raffle contract not available');
      return;
    }

    const result = await executeTransaction(raffle.contract.claimPrize);
    
    if (result.success) {
      alert('Prize claimed successfully!');
      window.location.reload();
    } else {
      alert('Failed to claim prize: ' + result.error);
    }
  };

  const handleClaimRefund = async (raffle) => {
    if (!raffle.contract) {
      alert('Raffle contract not available');
      return;
    }

    const result = await executeTransaction(raffle.contract.claimRefund);
    
    if (result.success) {
      alert('Refund claimed successfully!');
      window.location.reload();
    } else {
      alert('Failed to claim refund: ' + result.error);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to view and participate in raffles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Participant Dashboard</h1>
        <p className="text-muted-foreground">
          Discover and participate in exciting raffles
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Available Raffles
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading raffles...</p>
          </div>
        ) : raffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <RaffleCard
                key={raffle.address}
                raffle={raffle}
                onPurchaseTickets={handlePurchaseTickets}
                onClaimPrize={handleClaimPrize}
                onClaimRefund={handleClaimRefund}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Raffles Available</h3>
            <p className="text-muted-foreground">
              There are currently no raffles available. Check back later!
            </p>
          </div>
        )}
      </div>

      <TicketPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        raffle={selectedRaffle}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
};

export default ParticipantDashboard;

