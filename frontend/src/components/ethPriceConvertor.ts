import { useEffect, useState } from 'react';
export const EthPriceConvertor = () => {
  const [ethPriceUSD, setEthPriceUSD] = useState(1);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await response.json();
        setEthPriceUSD(data.ethereum.usd);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEthPrice();
  }, []);

  const handleEthToUsd = (ethAmount: number) => {
    return ethAmount * ethPriceUSD;
  };

  return { handleEthToUsd };
};
