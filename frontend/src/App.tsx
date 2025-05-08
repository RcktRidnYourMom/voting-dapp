import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { UOMI_DAO_ABI } from './contracts/UomiDAO_ABI';
import { UOMI_TOKEN_ABI } from './contracts/UomiToken_ABI';



export const UOMI_TOKEN_ADDRESS = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
export const UOMI_DAO_ADDRESS = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";


function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [uomiBalance, setUomiBalance] = useState("0");
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [proposals, setProposals] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask or a UOMI-compatible wallet first.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } catch (err) {
      console.error(err);
      alert("Connection failed");
    }
  };

  const handleApprove = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const token = new ethers.Contract(UOMI_TOKEN_ADDRESS, UOMI_TOKEN_ABI, signer);
  
      const amount = ethers.parseEther("1000"); // Max spend allowance
      const tx = await token.approve(UOMI_DAO_ADDRESS, amount);
      await tx.wait();
  
      alert("DAO approved to spend your UOMI!");
    } catch (err) {
      console.error("Approve error:", err);
      alert("Approval failed.");
    }
  };
  

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filledOptions = options.filter(opt => opt.trim() !== '');
    if (!title || !description || filledOptions.length < 2) {
      alert("Please fill in title, description, and at least 2 options.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(UOMI_DAO_ADDRESS, UOMI_DAO_ABI, signer);

      const durationSeconds = 3 * 24 * 60 * 60;
      const tx = await contract.createProposal(title, description, filledOptions, durationSeconds);
      await tx.wait();

      alert("Proposal submitted!");
      setTitle('');
      setDescription('');
      setOptions(['', '']);
      await loadProposals(walletAddress);
      await loadBalance(walletAddress); // 🆕 refresh UOMI balance
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Failed to submit proposal.");
    }
  };

  const handleVote = async (proposalId, optionIndex) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(UOMI_DAO_ADDRESS, UOMI_DAO_ABI, signer);
  
      const tx = await contract.vote(proposalId, optionIndex);
      await tx.wait();
  
      alert("Vote submitted!");
  
      // ⏱️ Add a tiny delay to wait for local node to update storage
      setTimeout(() => {
        loadProposals(walletAddress);
        loadBalance(walletAddress);
      }, 500); // 0.5 second delay
    } catch (err) {
      console.error("Vote failed:", err);
      alert("Voting failed (maybe already voted?)");
    }
  };
  

  const loadProposals = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(UOMI_DAO_ADDRESS, UOMI_DAO_ABI, provider);
  
      const count = await contract.proposalCount();
      const items = [];
  
      for (let i = 0; i < Number(count); i++) {
        const proposal = await contract.getProposal(i);
  
        let hasVoted = false;
        if (address) {
          hasVoted = await contract.hasVoted(i, address);
        }
  
        items.push({
          id: Number(proposal.id),
          title: proposal.title,
          description: proposal.description,
          options: proposal.options,
          votes: proposal.votes.map(v => BigInt(v).toString()),
          deadline: Number(proposal.deadline),
          hasVoted
        });
      }
  
      setProposals(items);
    } catch (err) {
      console.error("Failed to load proposals:", err);
    }
  };
  const loadBalance = async (address) => {
    if (!address) return;
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = new ethers.Contract(UOMI_TOKEN_ADDRESS, UOMI_TOKEN_ABI, provider);
      const balance = await token.balanceOf(address);
      setUomiBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };
  

  // Load proposals on connect or page load
  useEffect(() => {
    if (walletAddress) {
      loadProposals(walletAddress);
      loadBalance(walletAddress); // 🆕 fetch balance
    } else {
      loadProposals(null);
    }
  }, [walletAddress]);
  
  
  useEffect(() => {
    const checkBalances = async () => {
      if (!walletAddress) return;
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const token = new ethers.Contract(UOMI_TOKEN_ADDRESS, UOMI_TOKEN_ABI, signer);
  
      const balance = await token.balanceOf(walletAddress);
      const allowance = await token.allowance(walletAddress, UOMI_DAO_ADDRESS);
  
      console.log("🔎 Wallet:", walletAddress);
      console.log("💰 UOMI Balance:", ethers.formatEther(balance));
      console.log("✅ Allowance to DAO:", ethers.formatEther(allowance));
    };
  
    checkBalances();
  }, [walletAddress]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>UOMI DAO Voting DApp</h1>

      {walletAddress ? (
        <>
          <p>Connected: {walletAddress}</p>
          <p>💰 UOMI Balance: {uomiBalance}</p>
          <button onClick={handleApprove} style={{ marginBottom: '1rem' }}>
            Approve DAO to Spend UOMI
          </button>
          <h2>Create a Proposal</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Title:</label><br />
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label>Description:</label><br />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div>
              <label>Options:</label>
              {options.map((opt, idx) => (
                <div key={idx}>
                  <input
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    required
                  />
                </div>
              ))}
              {options.length < 5 && (
                <button type="button" onClick={addOption}>+ Add Option</button>
              )}
            </div>
            <button type="submit" style={{ marginTop: '1rem' }}>Submit Proposal</button>
          </form>

          <h2>Proposals</h2>
          {proposals.length === 0 ? (
            <p>No proposals yet. Submit one above!</p>
          ) : (
            proposals.map((p) => (
              <div key={p.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <ul>
                  {p.options.map((opt, idx) => (
                    <li key={idx}>
                      <strong>{opt}</strong> — {p.votes[idx]} vote(s)
                      <button
                        onClick={() => handleVote(p.id, idx)}
                        disabled={p.hasVoted || Date.now() / 1000 > p.deadline}
                        style={{ marginLeft: '1rem' }}
                      >
                        Vote
                      </button>
                      {p.hasVoted && (
                        <span style={{ color: 'green', marginLeft: '0.5rem' }}>
                          ✔️ You already voted
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <p>⏳ Ends: {new Date(p.deadline * 1000).toLocaleString()}</p>
              </div>
            ))
          )}
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;
