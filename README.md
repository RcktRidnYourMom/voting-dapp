# UOMI DAO Voting DApp

A decentralized application (DApp) for creating and voting on proposals using UOMI tokens. Built with Hardhat for smart contracts and React for the frontend.

---

## 📁 Project Structure

```
your-dapp/
├── voting-contracts/   # Hardhat project with Solidity contracts
└── voting-frontend/    # React app for user interface
```

---

## 🚀 Getting Started on a New Machine

Follow these steps after cloning the repo to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-dapp.git
cd your-dapp
```

### 2. Install Dependencies

#### Hardhat Contracts:

```bash
cd voting-contracts
npm install
```

#### React Frontend:

```bash
cd ../voting-frontend
npm install
```

### 3. Compile & Deploy Smart Contracts

#### Start Local Node:

```bash
cd voting-contracts
npx hardhat node
```

#### Deploy Contracts (in another terminal):

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Update Contract Addresses in Frontend

Copy the printed addresses after deployment and update:

```js
// voting-frontend/src/contracts/addresses.js
export const UOMI_TOKEN_ADDRESS = "0x...";
export const UOMI_DAO_ADDRESS = "0x...";
```

### 5. Start the React Frontend

```bash
cd ../voting-frontend
npm run dev
```

Then open:

```
http://localhost:5173/
```

---

## 🦊 MetaMask Setup

1. Add a new custom network:

   * **Network name**: Hardhat Local
   * **RPC URL**: `http://localhost:8545`
   * **Chain ID**: `31337`
   * **Currency symbol**: ETH

2. Import one of the test accounts from the Hardhat node (shown on `npx hardhat node` startup).

3. Import UOMI token manually using the token address.

---

## 🔁 Developer Tips

* **Clean Build**: `npx hardhat clean`
* **Compile**: `npx hardhat compile`
* **Deploy**: `npx hardhat run scripts/deploy.js --network localhost`

---

## 📄 License

MIT License.

---

Happy building! 🛠️
