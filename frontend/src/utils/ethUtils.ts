import { formatEther, formatUnits, parseEther } from 'viem';


export const formattedPercentage = (royaltyWei) => {

    const salePriceWei = parseEther("0.01");
    const royaltyEth = parseFloat(formatUnits(royaltyWei, 18));
    const salePriceEth = parseFloat(formatUnits(salePriceWei, 18));
    
    const royaltyPercentage = (royaltyEth / salePriceEth) * 100;

    return royaltyPercentage;
}
export const reduceEth = (percentage: number, ethValue: number): number => {
    const ethWei = parseEther(ethValue.toString());
    const multiplier = BigInt(100 - percentage);
    const reducedWei = (ethWei * multiplier) / BigInt(100);
    return parseFloat(formatEther(reducedWei));
  };