# Raffle Protocol Frontend

A React-based frontend for the Raffle Protocol, featuring role-based dashboards for administrators, operators, creators, and participants.

## Features

- **Role-based Dashboards**: Separate interfaces for Admin, Operator, Creator, and Participant roles
- **Contract Integration**: Full integration with Raffle Protocol smart contracts
- **Wallet Connection**: MetaMask and other Web3 wallet support
- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Web3 wallet (MetaMask recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd raffle-protocol-frontend-v2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Contract Configuration

Before using the application, you need to configure the contract addresses:

1. **Deploy your contracts** or obtain the addresses of deployed contracts
2. **Connect your wallet** to the application
3. **Click the "Configure Contracts" button** in the admin dashboard
4. **Enter the contract addresses**:
   - Raffle Manager Address
   - Raffle Deployer Address
   - Revenue Manager Address
   - NFT Factory Address
5. **Save the configuration**

### Default Development Addresses

The application comes with example addresses for development purposes:
- Raffle Manager: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- Raffle Deployer: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- Revenue Manager: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- NFT Factory: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`

**Note**: These are example addresses and will not work with actual contracts. Replace them with your deployed contract addresses.

## Troubleshooting

### "Contract not configured" Errors

If you see errors about contracts not being configured:

1. **Check your wallet connection** - Make sure your wallet is connected to the correct network
2. **Verify contract addresses** - Ensure the contract addresses are correct and the contracts are deployed
3. **Check network compatibility** - Make sure you're connected to the same network where your contracts are deployed
4. **Refresh the page** - Sometimes a page refresh helps after updating contract addresses

### "Call revert exception" Errors

These errors typically occur when:
- Contract addresses are incorrect
- Contracts are not deployed on the current network
- You're calling functions that don't exist on the contract
- The contract ABI doesn't match the deployed contract

### Common Issues

1. **Wrong Network**: Make sure your wallet is connected to the same network where your contracts are deployed
2. **Incorrect Addresses**: Double-check that all contract addresses are correct
3. **Missing Permissions**: Ensure your wallet account has the necessary permissions to call admin functions

## Project Structure

```
src/
├── components/
│   ├── dashboards/          # Role-specific dashboard components
│   ├── ui/                  # Reusable UI components
│   └── wallet/              # Wallet-related components
├── contexts/
│   ├── ContractContext.jsx  # Contract management
│   ├── ThemeContext.jsx     # Theme management
│   └── WalletContext.jsx    # Wallet connection
├── contracts/
│   ├── contractABIs.js      # Contract ABIs
│   └── contractAddresses.js # Contract address management
└── utils/                   # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

