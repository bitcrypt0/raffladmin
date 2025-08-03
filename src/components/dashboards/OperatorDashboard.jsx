import React, { useState, useEffect } from 'react';
import { Play, Square, Zap, Award, Settings } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';

const RAFFLE_STATE = [
  'Pending',           // 0
  'Active',            // 1
  'Ended',             // 2
  'Drawing',           // 3
  'Completed',         // 4
  'Deleted',           // 5
  'Activation Failed', // 6
  'All Prizes Claimed',// 7
  'Unengaged'          // 8
];

function formatTimestamp(ts) {
  if (!ts) return '-';
  const date = new Date(ts * 1000);
  return date.toLocaleString();
}

function getCountdown(ts) {
  if (!ts) return '-';
  const now = Math.floor(Date.now() / 1000);
  const diff = ts - now;
  if (diff <= 0) return '0s';
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h}h ${m}m ${s}s`;
}

const OperatorCard = ({ title, description, icon: Icon, action, loading, disabled }) => (
  <div className="bg-card border border-border rounded-lg p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <button
      onClick={action}
      disabled={loading || disabled}
      className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {loading ? 'Processing...' : title}
    </button>
  </div>
);

const OperatorDashboard = () => {
  const { connected } = useWallet();
  const { contracts, executeTransaction, getContractInstance } = useContract();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all raffles and their info
  useEffect(() => {
    if (!contracts.raffleManager) return;
    let cancelled = false;
    async function fetchRaffles() {
      setRefreshing(true);
    try {
        const addresses = await contracts.raffleManager.getAllRaffles();
        console.log('Found raffle addresses:', addresses);
        
        const raffleData = await Promise.all(
          addresses.map(async (addr) => {
            try {
              const raffle = getContractInstance(addr, 'raffle');
              if (!raffle) {
                console.error(`Failed to create contract instance for ${addr}`);
                return {
                  address: addr,
                  name: 'Error: Invalid Contract',
                  startTime: 0,
                  endTime: 0,
                  state: -1,
                  error: 'Failed to create contract instance',
                  contract: null,
                };
              }
              
              const [name, startTime, endTime, state] = await Promise.all([
                raffle.name(),
                raffle.startTime(),
                raffle.endTime(),
                raffle.state(),
              ]);
              
              console.log(`Raffle ${addr} data:`, { name, startTime: startTime.toString(), endTime: endTime.toString(), state: state.toString() });
              
              return {
                address: addr,
                name,
                startTime: Number(startTime),
                endTime: Number(endTime),
                state: Number(state),
                contract: raffle,
                error: null,
              };
            } catch (e) {
              console.error(`Error fetching data for raffle ${addr}:`, e);
              return {
                address: addr,
                name: 'Error: ' + (e.message || 'Unknown error'),
                startTime: 0,
                endTime: 0,
                state: -1,
                error: e.message || 'Unknown error',
                contract: null,
              };
            }
          })
        );
        
        if (!cancelled) {
          console.log('Final raffle data:', raffleData);
          setRaffles(raffleData);
        }
      } catch (e) {
        console.error('Error fetching raffle addresses:', e);
        if (!cancelled) setRaffles([]);
    } finally {
        setRefreshing(false);
    }
    }
    fetchRaffles();
    return () => { cancelled = true; };
  }, [contracts.raffleManager, getContractInstance]);

  // Operator actions - all called directly on raffle contracts
  const handleAction = async (raffle, action) => {
    if (!raffle.contract) {
      alert('Raffle contract not available');
      return;
    }

    setLoading((prev) => ({ ...prev, [raffle.address + action]: true }));
    try {
      const result = await executeTransaction(raffle.contract[action]);
      if (result.success) {
        // Optionally, refresh raffle info after action
        setRaffles((prev) => prev.map(r => r.address === raffle.address ? { ...r, state: -1 } : r));
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      alert('Error: ' + (e?.message || e));
    } finally {
      setLoading((prev) => ({ ...prev, [raffle.address + action]: false }));
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Operator Dashboard</h2>
        <button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Refresh</button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Raffle Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Countdown to Start</TableHead>
            <TableHead>Countdown to End</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {raffles.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center">{refreshing ? 'Loading raffles...' : 'No raffles found.'}</TableCell>
            </TableRow>
          )}
          {raffles.map((raffle) => (
            <TableRow key={raffle.address} className={raffle.error ? 'bg-red-50' : ''}>
              <TableCell>
                <div>
                  <div className={raffle.error ? 'text-red-600 font-medium' : ''}>
                    {raffle.name}
                  </div>
                  {raffle.error && (
                    <div className="text-xs text-red-500 mt-1">
                      {raffle.error}
      </div>
                  )}
        </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{raffle.address}</TableCell>
              <TableCell>
                {raffle.error ? (
                  <span className="text-red-500">Error</span>
                ) : raffle.startTime === 0 ? (
                  <span className="text-gray-500">Not set</span>
                ) : (
                  formatTimestamp(raffle.startTime)
                )}
              </TableCell>
              <TableCell>
                {raffle.error ? (
                  <span className="text-red-500">Error</span>
                ) : raffle.endTime === 0 ? (
                  <span className="text-gray-500">Not set</span>
                ) : (
                  formatTimestamp(raffle.endTime)
                )}
              </TableCell>
              <TableCell>
                {raffle.error ? (
                  <span className="text-red-500">-</span>
                ) : raffle.startTime === 0 ? (
                  <span className="text-gray-500">-</span>
                ) : (
                  getCountdown(raffle.startTime)
                )}
              </TableCell>
              <TableCell>
                {raffle.error ? (
                  <span className="text-red-500">-</span>
                ) : raffle.endTime === 0 ? (
                  <span className="text-gray-500">-</span>
                ) : (
                  getCountdown(raffle.endTime)
                )}
              </TableCell>
              <TableCell>
                {raffle.error ? (
                  <span className="text-red-500">Error</span>
                ) : (
                  (raffle.state >= 0 && raffle.state < RAFFLE_STATE.length)
                    ? RAFFLE_STATE[raffle.state]
                    : 'Unknown'
                )}
              </TableCell>
              <TableCell>
                {raffle.error ? (
                  <span className="text-red-500 text-sm">No actions available</span>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-50"
                      disabled={loading[raffle.address+'activate']}
                      onClick={() => handleAction(raffle, 'activate')}
                    >Activate</button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded disabled:opacity-50"
                      disabled={loading[raffle.address+'requestRandomWords']}
                      onClick={() => handleAction(raffle, 'requestRandomWords')}
                    >Request Randomness</button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
                      disabled={loading[raffle.address+'endRaffle']}
                      onClick={() => handleAction(raffle, 'endRaffle')}
                    >End</button>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded disabled:opacity-50"
                      disabled={loading[raffle.address+'processBatch']}
                      onClick={() => handleAction(raffle, 'processBatch')}
                    >Process Batch</button>
      </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OperatorDashboard;

