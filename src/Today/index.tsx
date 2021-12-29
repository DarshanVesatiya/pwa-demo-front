import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { decrement, increment } from '../redux/counterSlice'

import { CryptoPrice } from "./CryptoPrice";

import './main.css';

export const Today = ():  JSX.Element => {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  const [todayPrice, setTodayPrice] = useState({
		btcprice: 0,
		ltcprice: 0,
		ethprice: 0
	});

  function getPrice() {
    const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,LTC&tsyms=USD';
    fetch(url).then(async function(response) {
      if (!response.ok) {
        throw new TypeError('bad response status');
      }
      return response.json();
    }).then(function({ BTC, ETH, LTC }) {
      // caches.open('todayPrice').then(cache => cache.put(url, response));
      setTodayPrice({
        btcprice: BTC.USD,
        ethprice: ETH.USD,
        ltcprice: LTC.USD
      });
    });

    // axios.get(url)
		// 	.then(({ data: { BTC, ETH, LTC } }) => {
    //      setTodayPrice({
		// 			btcprice: BTC.USD,
		// 			ethprice: ETH.USD,
		// 			ltcprice: LTC.USD
		// 		});
    //     caches.open('todayPrice').then(cache => cache.put(url, response)));
		// 	})
		// 	.catch(console.error);
  }

  useEffect(() => {
    getPrice();
    const intervalId = setInterval(() => {
      getPrice();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="today--section container">
      <h2>Current Price</h2>
      <button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
        <span >{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
      <div className="columns today--section__box">
        {/** Creating components for things that repeat themselves is also pretty good**/}
        <CryptoPrice currency="btc" price={todayPrice.btcprice} />
        <CryptoPrice currency="eth" price={todayPrice.ethprice} />
        <CryptoPrice currency="ltc" price={todayPrice.ltcprice} />
      </div>
    </div>
  );
}
