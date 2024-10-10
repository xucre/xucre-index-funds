//import axios from "axios";
'use server'
import superagent from 'superagent';

const BASEURL = 'https://pgoh3ugkwf7bg4avrcwe5yts7e0epnon.lambda-url.sa-east-1.on.aws/';
export const ASSETURL = (chainName: string, address: string) => `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/assets/${address}`;

export const getTokenPrices = async (data: string) => {
  try {
    const response = await superagent.get(`${BASEURL}prices?${data}`).withCredentials();
    //console.log(response.body);
    return response.body;
  } catch (error) {
    console.log(data, error);
    //return null;
  }
}

export const getWalletHistory = async (wallet: string, chainName: string) => {
  try {
    const response = await superagent.get(`${BASEURL}prices?chainName=${chainName}&wallet=${wallet}`).withCredentials();
    return response.body;
  } catch (error) {
    return null;
  }
}

export const getWalletTransactions = async (wallet: string, chainName: any) => {
  try {
    const response = await superagent.get(`${BASEURL}transactions?chainName=${chainName}&wallet=${wallet.toLowerCase()}`).withCredentials();
    return response.body;
  } catch (error) {
    return null;
  }
}

export const getTokenList = async (chainId: number) => {
  const response = await fetch('https://metadata.p.rainbow.me/token-list/rainbow-token-list.json');
  const data = await response.json();
  return data;
}

export const fetchLogo = async (chainName: string, address: string) => {
  try {
    const logoUrl = ASSETURL(chainName, address) + '/logo.png';
    const response = await fetch(logoUrl);
    if (response.status === 200) return logoUrl;
    return '/icon-green.png';
  } catch (error) {
    //console.log('Error fetching logo:', error);
    return null;
  }
};

export const fetchInfo = async (chainName: string, address: string) => {
  try {
    const infoUrl = ASSETURL(chainName, address) + '/info.json';
    const response = await fetch(infoUrl);
    return await response.json();
  } catch (error) {
    console.log('Error fetching info:', error);
    return null;
  }
};