//index.ts
import config, { TOKEN0_ADDRESS } from "./config";

import Moralis from "moralis";

import { EvmChain } from "@moralisweb3/common-evm-utils";

import { Telegraf } from "telegraf";

import { InterfaceAbi, ethers } from "ethers";

import ABI_UNISWAP from '../abi.uniswap.json';
import ABI_ERC20 from '../abi.erc20.json';

const provider = new ethers.InfuraProvider(config.NETWORK, config.INFURA_API_KEY);
const signer = new ethers.Wallet(config.PRIVATE_KEY, provider);
const router = new ethers.Contract(config.ROUTER_ADDRESS, ABI_UNISWAP as InterfaceAbi, signer);
const token0 = new ethers.Contract(config.TOKEN0_ADDRESS, ABI_ERC20 as InterfaceAbi, signer);
const token1 = new ethers.Contract(config.TOKEN1_ADDRESS, ABI_ERC20 as InterfaceAbi, signer);

let isOpened = false, isApproved = false;
let amountOut : bigint = BigInt(0);

const bot = new Telegraf(config.TELEGRAM_BOT);


async function getPrice(): Promise<number> {
    const { result } = await Moralis.EvmApi.token.getTokenPrice({
        address: TOKEN0_ADDRESS,
        chain: EvmChain.SEPOLIA,
        exchange: config.EXCHANGE
    })


    const message = "WETH/USD" + result.usdPrice;
    console.log(message);
    

    return result.usdPrice;
  
}


type ExactInputSingleParams = {
    tokenIn: string;
    tokenOut: string;
    fee: number;
    recipient: string;
    deadline: number;
    amountIn: bigint;
    amountOutMinimum: number;
    sqrtPriceLimitX96: number;
}

async function swap(tokenIn: string, tokenOut: string , amountIn: bigint): Promise<bigint>{
    const params : ExactInputSingleParams = {
        tokenIn,
        tokenOut, 
        fee: 3000, //0.3%
        recipient: config.WALLET,
        deadline: (Date.now() / 1000) +  10, //o maximo de tempo que aguardamos ele fazer o trade no futuro
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0

    }

    const tx : ethers.TransactionResponse = await router.exactInputSingle(params, {
        from: config.WALLET,
        gasPrice: ethers.parseUnits("10", "gwei"),
        gasLimit: 250000
    })

    console.log("swapping at..." + tx.hash);
    const receipt = await tx.wait();

    if(receipt){
        const amountOut = ethers.toBigInt(receipt?.logs[0].data);
        console.log("Received" + ethers.formatUnits(amountOut, "ether"));
    }

    return BigInt(0);
}

async function approve(tokenContract: ethers.Contract, amount: bigint){
    const tx : ethers.TransactionResponse = await tokenContract.approve(config.ROUTER_ADDRESS, amount);
    console.log("Approving" + tx.hash)
    await tx.wait();
}

async function executionCycle(){
    const usdPrice = await getPrice();

    if(!isApproved){
        await approve(token1, config.AMOUNT_TO_BUY);
        isApproved = true;
    }

    if(usdPrice < config.PRICE_TO_BUY && !isOpened){
        isOpened = true;
        amountOut = await swap(config.TOKEN1_ADDRESS, config.TOKEN0_ADDRESS, config.AMOUNT_TO_BUY);
        await bot.telegram.sendMessage(config.CHAT_ID, "Comprou em" + usdPrice);

        await approve(token0, amountOut);
    }
    else if(usdPrice > config.PRICE_TO_SELL && isOpened){
        isOpened = false;
        swap(config.TOKEN0_ADDRESS, config.TOKEN1_ADDRESS, amountOut);
        amountOut = BigInt(0);
        isApproved = false;
        await bot.telegram.sendMessage(config.CHAT_ID, "Vendeu em" + usdPrice);
    }
    
   
}

 async function start() {
    await Moralis.start({
        apiKey: config.MORALIS_API_KEY
    })

    await getPrice();
    await executionCycle();

    setInterval(getPrice, config.INTERVAL);
}

start();

