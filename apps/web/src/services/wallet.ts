import { BrowserProvider } from 'ethers'

export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask
}

export async function connectMetaMask(): Promise<string> {
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('MetaMask not installed')

  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
  if (!accounts[0]) throw new Error('No account found')
  return accounts[0] as string
}

export async function connectWalletConnect(): Promise<string> {
  const { EthereumProvider } = await import('@walletconnect/ethereum-provider')
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
  if (!projectId) throw new Error('WalletConnect project ID not configured')

  const provider = await EthereumProvider.init({
    projectId,
    chains: [1],
    showQrModal: true,
  })

  await provider.enable()
  const accounts = provider.accounts
  if (!accounts[0]) throw new Error('No account found')
  return accounts[0]
}

export async function signMessage(message: string): Promise<string> {
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('No wallet provider')
  const provider = new BrowserProvider(ethereum)
  const signer = await provider.getSigner()
  return signer.signMessage(message)
}

export function disconnect() {
  localStorage.removeItem('auth_token')
}
