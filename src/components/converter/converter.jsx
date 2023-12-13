import React, { useEffect, useState } from 'react'
import Layout from '../UI/layout/layout';
import CurrencyRow from '../UI/CurrencyRow/CurrencyRow';
import { useTranslation } from "react-i18next";
import { currencies } from './currencies';
import './converter.sass'




const Converter = () => {
  const { t, i18n } = useTranslation();
  const [fromCurrency, setFromCurrency] = useState(currencies[13])
  const [toCurrency, setToCurrency] = useState(currencies[14])
  const [exchangeRate, setExchangeRate] = useState()
  const [amountFrom, setAmountFrom] = useState(0)
  const [amountTo, setAmountTo] = useState(0)
  const [USD, setUSD] = useState('00,0000')
  const [EUR, setEUR] = useState('00,0000')
  const [timeUpdated, setTimeUpdated] = useState('00:00:00')
  const [timeUpdatedDB, setTimeUpdatedDB] = useState('00:00:00')
  const [valutesList, setValutesList] = useState([])
  const [amountInFromCurrency, setAmountInFromCurrency] = useState(true)
  const convertAmount = (from, to, amount, update) => {
    window.fx && update(window.fx(amount).from(from).to(to));
  }

  React.useEffect(() => {
    function CBR_XML_Daily_Ru(rates) {
      /* Иконка для обозначения тренда */
      function trend(current, previous) {
        if (current > previous) return ' ▲';
        if (current < previous) return ' ▼';
        return '';
      }

      var USDrate = rates.Valute.USD.Value.toFixed(4).replace('.', ',');
      setUSD(USDrate + trend(rates.Valute.USD.Value, rates.Valute.USD.Previous));
      var EURrate = rates.Valute.EUR.Value.toFixed(4).replace('.', ',');
      setEUR(EURrate + trend(rates.Valute.EUR.Value, rates.Valute.EUR.Previous));

      var date = new Date(rates.Date);
      setTimeUpdated(date.toLocaleDateString());

      var dateUpdated = new Date(rates.Timestamp);
      setTimeUpdatedDB((dateUpdated + '').replace(/\S+$/g, dateUpdated.toLocaleString()));


      setValutesList(Object.keys(rates.Valute).map((key) => {
        var currency = rates.Valute[key];
        currency.Trend = currency.Value - currency.Previous;
        currency.Trend = '(' + (currency.Trend > 0 ? '+' : '−') + Math.abs(currency.Trend).toFixed(1).replace('.', ',') + ')';
        currency.Value = currency.Value.toFixed(4).replace('.', ',');
        return <tr key={key}>{['Nominal', 'Name', 'Value', 'Trend'].map((i) => {
          return <td key={key + Math.random()}>{i==="Name"?t(currency[i].split(' ').join('')):currency[i]}</td>
        })}</tr>
      }))

    }
    fetch('https://www.cbr-xml-daily.ru/daily_jsonp.js').then((response) => {
      response.text().then((result) => {
        CBR_XML_Daily_Ru(JSON.parse(result.match(/(\{.*\})/)[0]))
      })
    })
  }, [])
  function handleFromAmountChange(e) {
    setAmountFrom(e.target.value)
    setAmountInFromCurrency(true)
  }

  function handleToAmountChange(e) {
    setAmountTo(e.target.value)
    setAmountInFromCurrency(false)
  }
  const [displayComponent, setDisplayComponent] = React.useState(false)
  const check = () => {
    if (window.fx) {
      setDisplayComponent(true)
    } else {
      setTimeout(check, 300)
    }
  }
  React.useEffect(check,[])
  return (
    <Layout>
{displayComponent?
      <div className="convert-wrapper">
        <div>
          <div id="USD">Курс доллара на сегодня: {USD + ''}</div>
          <div id="EUR">Курс евро на сегодня: {EUR + ''}</div>
        </div>
        <div className='lang'>
          <span onClick={() => i18n.changeLanguage('ru')} className={i18n.resolvedLanguage === 'ru' ? 'selected-lang' : ''}>RU</span>
          /
          <span onClick={() => i18n.changeLanguage('en')} className={i18n.resolvedLanguage === 'en' ? 'selected-lang' : ''}>EN</span>
        </div>
        <h1 style={{color: '#0460D9'}}>{t("Currency_converter")}</h1>
        <div>
        <div className="row-wrapper">
          <CurrencyRow
            currencyOptions={currencies}
            selectedCurrency={fromCurrency}
            onChangeCurrency={e => setFromCurrency(e.target.value)}
            onChangeAmount={handleFromAmountChange}
            amount={amountFrom}
            update={(from, to, amount, update) => convertAmount(from, to, amount, update)}
            to={toCurrency}
            setTo={setAmountTo}
          />
          <div className="equals">
            <button  style={{ color: '#0460D9' }}onClick={() => {
              setFromCurrency(toCurrency)
              setToCurrency(fromCurrency)
              window.fx && setAmountTo(window.fx(amountFrom).from(toCurrency).to(fromCurrency))
            }}>{'<->'}</button></div>
          <CurrencyRow
            currencyOptions={currencies}
            selectedCurrency={toCurrency}
            onChangeCurrency={e => setToCurrency(e.target.value)}
            onChangeAmount={handleToAmountChange}
            amount={amountTo}
            update={(from, to, amount, update) => convertAmount(from, to, amount, update)}
            to={fromCurrency}
            setTo={setAmountFrom}
          />
          </div>
          <h3 style={{margin: '1em 0'}} id="header">{t("cb_rf_cur")} {timeUpdated + ''}</h3>
          <p style={{marginBottom: '1em'}} id="timestamp">{t("cb_rf_upd")} {timeUpdatedDB + ''}</p>
          <table id="currencies" className='table-content'>

            <thead>

              <th>{t("Amount")}</th>
              <th>{t("Currency")}</th>
              <th>{t("Rate")}</th>
              <th>{t("Trend")}</th>

            </thead>

            <tbody>
              {valutesList}
            </tbody>
          </table>
        </div>
      </div>:<div className="loader-center"><div className="loader"></div></div>}
    </Layout>
  )
}

export default Converter;