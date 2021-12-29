import React from "react";

interface Price {
  currency: string;
  price: number;
}

export const CryptoPrice = ({ currency, price }: Price): JSX.Element => (
  <div className={`column ${currency}--section`}>
    <h5>${price}</h5>
    <p>1 {currency.toUpperCase()}</p>
  </div>
);
