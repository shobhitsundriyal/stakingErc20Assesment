import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
  checkMetamaskConnected,
  connectMetamask,
} from '../functions/metamaskFunctions'
const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState()
  const [isWallectConnected, setIsWallectConnected] = useState(false)

  useEffect(() => {
    const checkMetamaskConnection = async () => {
      let account = await checkMetamaskConnected()
      if (account) {
        setCurrentAccount(account)
        setIsWallectConnected(true)
      }
    }
    checkMetamaskConnection()
  }, [])

  async function handleConnectWallet() {
    let account = await connectMetamask()
    if (account) {
      setCurrentAccount(account)
      setIsWallectConnected(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-600">Staking dapp</span>
        </h1>
        <div className="mt-5 border-2">
          {isWallectConnected ? (
            <div>wallect connected</div>
          ) : (
            <button className="p" onClick={handleConnectWallet}>
              Connect metamask
            </button>
          )}
        </div>
      </main>

      <footer className="flex w-full items-center justify-center border-t py-2">
        <a
          className="flex items-center justify-center gap-2"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source Code{'🔗 '}
        </a>
      </footer>
    </div>
  )
}

export default Home
