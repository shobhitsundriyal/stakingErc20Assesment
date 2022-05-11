//SPDX-License-Identifier:MIT

pragma solidity ^0.8.x;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("CommunityGaming", "CGT") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

contract Staking {
    address owner;
    mapping(address=> bool) alreadMinted;
    mapping(address=>bool) isStaked;
    mapping(address => uint) stakingTime;
    mapping(address=>uint) noTokenStaked; // in wei
    MyToken OurToken;
    uint minStakingTime;
    constructor(address _tokenAddress){
        OurToken =  MyToken(_tokenAddress);
        minStakingTime = 120; //120s == 2 min
    }

    function claimIntialToken() public {
        require(alreadMinted[msg.sender]==false, 'you have already claimed free tokens');
        OurToken.mint(msg.sender, 10 * 1 ether);
    }

    function tokenAddr() public view returns(address){
        return address(OurToken);
    }

    function TokenBalance(address _of) internal view returns (uint) {
        return OurToken.balanceOf(_of);
    }

    function contractTokenBalance() public view returns (uint) {
        return TokenBalance(address(this));
    }

    function myTokenBalance() public view returns (uint) {
        return TokenBalance(msg.sender);
    }

    function stakeTokens(uint _noOfTokensToStake) public { // in eth(number)
        uint convertedNoOfTokensToStake = _noOfTokensToStake * 1 ether;
        require(!isStaked[msg.sender], 'You have already staked');
        uint256 balance = OurToken.balanceOf(msg.sender);
        require(balance >= convertedNoOfTokensToStake,"Balance is low");
        OurToken.transferFrom(msg.sender, address(this), convertedNoOfTokensToStake);
        isStaked[msg.sender] = true;
        stakingTime[msg.sender] = block.timestamp;
        noTokenStaked[msg.sender] = convertedNoOfTokensToStake;
    }

    function calculateUnstakingIntrest(address _of) public view returns (uint){
        // one token for every minute passed
        require(isStaked[_of], 'No stake is present by this address');
        return ((block.timestamp - stakingTime[_of])/60) * noTokenStaked[_of];
    }

    function withdrawTokens() public {
        require(isStaked[msg.sender], 'You have not staked anything');
        require(block.timestamp - stakingTime[msg.sender] >= minStakingTime, 'you can withdraw only after minimum locking period has passed');
        // mint new tokens to contract
        uint intrest = calculateUnstakingIntrest(msg.sender);
        OurToken.mint(address(this), intrest);
        isStaked[msg.sender] = false;
        uint totalAmount = noTokenStaked[msg.sender] + intrest;
        //send tokens to caller
        OurToken.transfer(msg.sender, totalAmount);
    }
}