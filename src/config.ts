import dotenv from 'dotenv';
dotenv.config();

import { ethers  } from 'ethers';

export const MORALIS_API_KEY = `${process.env.MORALIS_API_KEY}`;

export const INTERVAL:number = parseInt(`${process.env.INTERVAL}`);

export const TOKEN0_ADDRESS = `${process.env.TOKEN0_ADDRESS}`;

export const TOKEN1_ADDRESS = `${process.env.TOKEN1_ADDRESS}`;

export const WALLET = `${process.env.WALLET}`;

export const PRIVATE_KEY = `${process.env.PRIVATE_KEY}`;

export const NETWORK = `${process.env.NETWORK }`;

export const INFURA_API_KEY = `${process.env.INFURA_API_KEY}`;

export const ROUTER_ADDRESS = `${process.env.ROUTER_ADDRESS}`;

export const PRICE_TO_BUY = parseFloat(`${process.env.PRICE_TO_BUY}`);

export const AMOUNT_TO_BUY: bigint = ethers.parseUnits(`${process.env.AMOUNT_TO_BUY}`, "ether");

export const PRICE_TO_SELL = PRICE_TO_BUY * parseFloat(`${process.env.PROFITABILITY}`);

export const EXCHANGE = `${process.env.EXCHANGE}`;

export const TELEGRAM_BOT = `${process.env.TELEGRAM_BOT}`;

export const CHAT_ID = `${process.env.CHAT_ID}`;




export default {
    MORALIS_API_KEY,
    INTERVAL,
    TOKEN0_ADDRESS,
    TOKEN1_ADDRESS,
    WALLET,
    PRIVATE_KEY,
    NETWORK,
    INFURA_API_KEY,
    ROUTER_ADDRESS,
    PRICE_TO_BUY,
    AMOUNT_TO_BUY,
    PRICE_TO_SELL,
    EXCHANGE,
    TELEGRAM_BOT,
    CHAT_ID
}