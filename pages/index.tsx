import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
  checkMetamaskConnected,
  connectMetamask,
} from '../functions/metamaskFunctions'
import { BigNumber, BigNumberish, ethers } from 'ethers'
import {
  erc20TokenAddr,
  erc20TokenABI,
  stakingContractAddr,
  stakingContractABI,
} from '../contractDetails'
const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [isWallectConnected, setIsWallectConnected] = useState(false)
  const [balance, setBalance] = useState(0)
  const [stakingAmount, setStakingAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isStaked, setIsStaked] = useState(false)

  const [byAddress, setByAddress] = useState()
  const [contractBalance, setContractBalance] = useState(0)
  const [rewardsEarnedBy, setRewardsEarnedBy] = useState(0)
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

  useEffect(() => {
    if (currentAccount != '') {
      checkBalance()
    }
  }, [currentAccount])
  async function handleConnectWallet() {
    let account = await connectMetamask()
    if (account) {
      setCurrentAccount(account)
      setIsWallectConnected(true)
    }
  }

  async function checkBalance() {
    const network = 'kovan'
    const provider = ethers.getDefaultProvider(network)
    const address = erc20TokenAddr
    const tokenContract = new ethers.Contract(
      erc20TokenAddr,
      erc20TokenABI,
      provider
    )
    tokenContract.balanceOf(currentAccount).then((balance: BigNumberish) => {
      console.log(ethers.utils.formatEther(balance))
      setBalance(parseInt(ethers.utils.formatEther(balance)))
    })
  }

  async function checkAmountStaked() {
    const network = 'kovan'
    const provider = ethers.getDefaultProvider(network)
    const address = stakingContractAddr
    const tokenContract = new ethers.Contract(
      stakingContractAddr,
      stakingContractABI,
      provider
    )
    tokenContract.contractTokenBalance().then((balance: BigNumberish) => {
      console.log(ethers.utils.formatEther(balance))
      setContractBalance(parseInt(ethers.utils.formatEther(balance)))
    })
  }

  async function checkTotalRewardEarnedBy() {
    const network = 'kovan'
    const provider = ethers.getDefaultProvider(network)
    const address = stakingContractAddr
    const tokenContract = new ethers.Contract(
      stakingContractAddr,
      stakingContractABI,
      provider
    )
    tokenContract
      .checkTotalRewardsEarned(byAddress)
      .then((balance: BigNumberish) => {
        console.log(ethers.utils.formatEther(balance))
        setRewardsEarnedBy(parseInt(ethers.utils.formatEther(balance)))
      })
  }

  async function handleStaking(e: any) {
    try {
      e.preventDefault()
      setLoading(true)
      const { ethereum } = window as any
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        erc20TokenAddr,
        erc20TokenABI,
        signer
      )
      const stakingContract = new ethers.Contract(
        stakingContractAddr,
        stakingContractABI,
        signer
      )
      //approve
      let txn1 = await tokenContract.approve(
        stakingContractAddr,
        ethers.utils.parseUnits(stakingAmount.toString(), 18)
      )
      await txn1.wait()
      if (txn1) {
        //transfer tokens
        let txn2 = await stakingContract.stakeTokens(stakingAmount)
        await txn2.wait()
        if (txn2) {
          setLoading(false)
          setIsStaked(true)
          checkBalance()
        }
      }
    } catch (err) {
      setLoading(false)
      console.log(err)
    }
  }

  async function handleWithdrawal() {
    try {
      setLoading(true)
      const { ethereum } = window as any
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        erc20TokenAddr,
        erc20TokenABI,
        signer
      )
      const stakingContract = new ethers.Contract(
        stakingContractAddr,
        stakingContractABI,
        signer
      )
      let txn = await stakingContract.withdrawTokens()
      await txn.wait()

      if (txn) {
        setLoading(false)
        setIsStaked(false)
        checkBalance()
      }
    } catch (err) {
      setLoading(false)
      console.log(err)
    }
  }

  async function addTokenToMetamask() {
    try {
      const { ethereum } = window as any
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        erc20TokenAddr,
        erc20TokenABI,
        signer
      )
      const stakingContract = new ethers.Contract(
        stakingContractAddr,
        stakingContractABI,
        signer
      )
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: erc20TokenAddr,
            symbol: 'CGT',
            decimals: 18,
          },
        },
      })

      if (wasAdded) {
        console.log('Thanks for your interest!')
      } else {
        console.log('Your loss!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function claimTokens() {
    try {
      await addTokenToMetamask()
      const { ethereum } = window as any
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        erc20TokenAddr,
        erc20TokenABI,
        signer
      )
      const stakingContract = new ethers.Contract(
        stakingContractAddr,
        stakingContractABI,
        signer
      )
      setLoading(true)
      let txn = await stakingContract.claimIntialToken()
      await txn.wait()

      if (txn) {
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      console.log(err)
    }
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Staking App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {currentAccount && (
        <div className="flex items-center space-x-4">
          <span className=" font-mono text-2xl">If you dont have any CGT</span>
          <button className="btn" onClick={claimTokens}>
            claim few tokens
          </button>
        </div>
      )}
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-600">Staking dapp</span>
        </h1>
        <div className="mt-5 text-xl">
          {isWallectConnected ? (
            <div>
              <div>Stake your CGT to earn more CGT</div>

              <form
                action="submit"
                className="mt-3 flex items-center"
                onSubmit={(e) => handleStaking(e)}
              >
                <input
                  type="number"
                  placeholder="Amount to stake"
                  max={balance}
                  min={1}
                  className="w-52 rounded-md rounded-r-none border-2 border-black p-2 text-base outline-none"
                  onChange={(e: any) => setStakingAmount(e.target.value)}
                />
                <button className=" rounded-md rounded-l-none bg-blue-500 p-2 text-white">
                  Stake CGT
                </button>
              </form>
              <div className=" ml-2 text-left text-sm">Balance: {balance}</div>
            </div>
          ) : (
            <button className="btn" onClick={handleConnectWallet}>
              Connect metamask
            </button>
          )}

          {isStaked && (
            <button className="btn mt-3 font-mono" onClick={handleWithdrawal}>
              Withdraw tokens
            </button>
          )}
          {loading && (
            <div className=" mt-3 animate-pulse font-mono text-lg">
              Loading please wait...
            </div>
          )}
        </div>

        {/** admin view  */}
        {currentAccount.toLowerCase() ==
          '0x489DcE5bE878F73A8F21FCB50594414A1B77EebC'.toLowerCase() && (
          <div>
            <div className=" bottom-2 mt-8 border-t-2 text-xl ">
              Owner's View
            </div>
            <div className="">
              <button
                className=" rounded-xl bg-orange-700 p-2 text-white"
                onClick={checkAmountStaked}
              >
                {' '}
                Total staked tokens
              </button>{' '}
              :&nbsp;{contractBalance} CGT
            </div>
            <div className=" mt-4">
              <button
                className=" rounded-xl bg-orange-700 p-2 text-white"
                onClick={checkTotalRewardEarnedBy}
              >
                Total Rewards Earned
              </button>{' '}
              <input
                type="text"
                onChange={(e: any) => setByAddress(e.target.value)}
                className=" ml-4 border-2 border-black outline-none"
              />
              : {rewardsEarnedBy} CGT
            </div>
          </div>
        )}
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
