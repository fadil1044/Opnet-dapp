# BitcoinDeFi Smart Contracts

Real OP_NET smart contracts in AssemblyScript for Bitcoin L1.

## Contracts

| Contract | File | Description |
|----------|------|-------------|
| SwapRouter | `SwapRouter.ts` | OP-20 token swap with 0.3% fee |
| NFTMarketplace | `NFTMarketplace.ts` | OP-721 NFT mint and trade |
| DAOGovernance | `DAOGovernance.ts` | On-chain proposals and voting |
| LendingProtocol | `LendingProtocol.ts` | Supply, borrow, repay with yield |
| RaffleLottery | `RaffleLottery.ts` | Provably fair Bitcoin randomness lottery |

## How to Deploy

```bash
npm install
npm run build:swap
npm run build:nft
npm run build:dao
npm run build:lending
npm run build:raffle
