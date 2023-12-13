import React, { useEffect, useState } from "react";
import Layout from "../UI/layout/layout";
import { useTranslation } from "react-i18next";
import { collection, addDoc, getDocs, Timestamp, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { currencies } from "../converter/currencies";
import './diary.sass'
import '../../loader.css'
const DiaryPage = ({ db }) => {
  const { t, i18n } = useTranslation();
  const categories = [
    {
      name: t("food"),
      operation: "-",
    },
    { name: t("clothes"), operation: "-" },
    { name: t("transport"), operation: "-" },
    { name: t("entertainment"), operation: "-" },
    { name: t("rent"), operation: "-" },
    { name: t("job"), operation: "+" },
    { name: t("deposit"), operation: "+" },
  ];
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [balanceCurrency, setBalanceCurrency] = useState("RUB");
  const [direction, setDirection] = useState(true);
  const [sortValue, setSortValue] = useState("date");
  const [newAmount, setNewAmount] = useState(0);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [validationEdit, setValidationEdit] = useState([]);
  const [newCurrency, setNewCurrency] = useState("RUB");
  const [validationCreate, setValidationCreate] = useState({
    amount: true,
    name: true,
    category: true,
    date: true,
  });
  const [displayComponent, setDisplayComponent] = React.useState(false)
  const check = () => {
    if (window.fx) {
      setDisplayComponent(true)
    } else {
      setTimeout(check, 300)
    }
  }
  React.useEffect(check,[])
  const [editNotes, setEditNotes] = useState([]);
  const calculateBalnce = (history) => {

    if (window.fx) {
      setBalance(
        history.reduce((accumulator, value) => {
          if (value.operation === "-") {
            if (value.currency !== balanceCurrency) {
              return (
                accumulator -
                window
                  .fx(value.amount)
                  .from(value.currency)
                  .to(balanceCurrency)
              );
            }
            return accumulator - value.amount;
          } else {
            if (value.currency !== balanceCurrency) {
              return (
                accumulator +
                window
                  .fx(value.amount)
                  .from(value.currency)
                  .to(balanceCurrency)
              );
            }
            return accumulator + value.amount;
          }
        }, 0)
      );
    } else {
      setTimeout(() => calculateBalnce(history), 100);
    }
  };
  async function getNotes() {
    const querySnapshot = await getDocs(collection(db, "diaries"));
    setHistory(querySnapshot.docs.map((doc) => { return { id: doc.id, ...doc.data() } }));
    setEditNotes(
      querySnapshot.docs.map((note) => {
        return { id: note.id, ...note.data(), editing: false };
      })
    );
    calculateBalnce(querySnapshot.docs.map((doc) => { return { id: doc.id, ...doc.data() } }))
    setValidationEdit(querySnapshot.docs.map((note) => {
      return {
        amount: true,
        name: true
      };
    }))
    setValidationCreate({
      amount: true,
      name: true,
      category: true,
      date: true,
    })
  }
  useEffect(() => {
    getNotes();
  }, []);
  const sort = (value) => {
    const newDirection = value === sortValue ? !direction : direction;
    setDirection(newDirection);
    setSortValue(value);
    let ar = [...history];

    const sorted = [...history].sort((a, b) => {
      if (newDirection) {
        if (a[value] < b[value]) {
          return -1;
        }
        return 1;
      } else {
        if (a[value] > b[value]) {
          return -1;
        }
        return 1;
      }
    });
    setEditNotes(
      sorted.map((note) => {
        return { ...note, editing: false };
      })
    );
    setHistory(sorted);
  };
  useEffect(() => {
  }, [newCategory])

  async function create() {
    let valid = true;
    let newValid = {
      amount: true,
      name: true,
      category: true,
      date: true,
    };
    if (isNaN(+newAmount) || newAmount === 0) {
      valid = false;
      newValid = {
        ...newValid,
        amount: false,
      };
    } else {
      newValid = {
        ...newValid,
        amount: true,
      };
    }
    if (newName.length <= 3) {
      valid = false;
      newValid = {
        ...newValid,
        name: false,
      };
    } else {
      newValid = {
        ...newValid,
        name: true,
      };
    }
    if (valid) {
      await addDoc(collection(db, "diaries"), {
        operation: newCategory.operation,
        amount: newAmount,
        currency: newCurrency,
        name: newName,
        category: newCategory.name,
        date: Timestamp.fromDate(new Date()),
      })
      getNotes()
      setNewAmount(0);
      setNewName("");
      setNewCategory(categories[0]);
      setNewCurrency("RUB");
    }
    setValidationCreate(newValid);
  };

  async function deleteNote(i) {
    await deleteDoc(doc(db, "diaries", history[i].id))
    getNotes()
  };

  const writeEdit = (i, field, value) => {
    setEditNotes([
      ...editNotes.slice(0, i),
      {
        ...editNotes[i],
        [field]: value,
      },
      ...editNotes.slice(i + 1, editNotes.length),
    ]);
  };

  async function saveEdit(i) {
    let valid = true
    const newEditValid = {
      amount: validationEdit[i].amount,
      name: validationEdit[i].name
    }
    if (editNotes[i].amount <= 0) {
      valid = false
      newEditValid.amount = false
    } else {
      newEditValid.amount = true
    }
    if (editNotes[i].name.length <= 3) {
      valid = false
      newEditValid.name = false
    } else {
      newEditValid.name = true
    }
    if (valid) {
      await updateDoc(doc(db, 'diaries', editNotes[i].id), {
        amount: editNotes[i].amount,
        category: editNotes[i].category,
        currency: editNotes[i].currency,
        name: editNotes[i].name,
        operation: editNotes[i].operation
      });
      getNotes()
      setEditNotes([])
    }
    setValidationEdit([
      ...validationEdit.slice(0, i), newEditValid, ...validationEdit.slice(i + 1, validationEdit.length)])
  };

  const startEdit = (i) => {
    setEditNotes([
      ...editNotes.slice(0, i),
      {
        ...editNotes[i],
        editing: true,
      },
      ...editNotes.slice(i + 1, editNotes.length),
    ]);
  };

  const cancelEdit = (i) => {
    setValidationEdit([
      ...validationEdit.slice(0, i), {
        amount: true,
        name: true
      }, ...validationEdit.slice(i + 1, validationEdit.length)])
    setEditNotes([
      ...editNotes.slice(0, i),
      {
        ...history[i],
        editing: false,
      },
      ...editNotes.slice(i + 1, editNotes.length),
    ]);
  };
  return (
    <Layout>
      {displayComponent?<div className="diary-wrapper">
        <div className="diary-header">
          <div id="6">
            {t("balance")}: {balance.toFixed ? balance.toFixed(2) : balance}
            {balanceCurrency}
          </div>
          <select
            id="5"
            value={balanceCurrency}
            onChange={(e) => setBalanceCurrency(e.target.value)}
          >
            {currencies.map((option) => (
              <option key={option} value={option}>
                {t(option)}
              </option>
            ))}
          </select>
          <div className="lang">
            <span
              onClick={() => i18n.changeLanguage("ru")}
              className={i18n.resolvedLanguage === "ru" ? "selected-lang" : ""}
            >
              RU
            </span>
            /
            <span
              onClick={() => i18n.changeLanguage("en")}
              className={i18n.resolvedLanguage === "en" ? "selected-lang" : ""}
            >
              EN
            </span>
          </div>
        </div>
        <div className="add-note-wrapper">
          <h3 style={{ color: '#5E9FF2' }}> {t("add_diary_note")}</h3>
          <div className="add-note_row">
            <input
              value={newAmount}
              style={validationCreate.amount ? {} : { border: "1px solid red" }}
              type="number"
              onChange={(e) => setNewAmount(e.target.value)}
            />
            <input
              value={newName}
              style={validationCreate.name ? {} : { border: "1px solid red" }}
              onChange={(e) => setNewName(e.target.value)}
            />
            <select
              defaultValue={newCategory}
              onChange={(e) => setNewCategory(categories[e.target.value])}
            >
              {categories.map((option, i) => (
                <option key={option.name + i} value={i}>
                  {t(option.name)}
                </option>
              ))}
            </select>
            <select
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value)}
            >
              {currencies.map((option) => (
                <option key={option} value={option}>
                  {t(option)}
                </option>
              ))}
            </select>
          </div>
          <button onClick={create}>{t("do_add_note")}</button>

        </div>

        <h1 style={{ color: '#5E9FF2' }} id="3">{t("diary_title")}</h1>
        <div className="filter-wrapper">
          <h3>Выберите фильтр: </h3>
          <div onClick={() => sort("amount")}>{t("amount")}</div>
          <div onClick={() => sort("operation")}>{t("operation")}</div>
          <div onClick={() => sort("name")}>{t("name")}</div>
          <div onClick={() => sort("category")}>{t("category")}</div>
          <div onClick={() => sort("currency")}>{t("currency")}</div>
          <div onClick={() => sort("date")}>{t("date")}</div>
        </div>
        {history &&
          history.map &&
          history.map((record, i) => {
            return (
              editNotes[i] && editNotes[i].editing) ? (
              <div id="2" className="edit-wrapper">
                <input
                  value={editNotes[i].amount}
                  type="number"
                  style={validationEdit[i].amount ? {} : { border: "1px solid red" }}
                  onChange={(e) => writeEdit(i, "amount", e.target.value)}
                />
                <input
                  value={editNotes[i].name}
                  style={validationEdit[i].name ? {} : { border: "1px solid red" }}
                  onChange={(e) => writeEdit(i, "name", e.target.value)}
                />
                <select
                  value={editNotes[i].category.name}
                  onChange={(e) => writeEdit(i, "category", e.target.value)}
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {t(option.name)}
                    </option>
                  ))}
                </select>
                <select
                  value={editNotes[i].currency}
                  onChange={(e) => writeEdit(i, "currency", e.target.value)}
                >
                  {currencies.map((option) => (
                    <option key={option} value={option}>
                      {t(option)}
                    </option>
                  ))}
                </select>
                <button onClick={() => cancelEdit(i)}>{t("cancel")}</button>{" "}
                <button onClick={() => saveEdit(i)}>{t("save")}</button>
              </div>
            ) : (
              <div id="1" className="text-note-wrapper">
                <span>{record.operation + record.amount}</span>
                <span>{t(record.currency)}</span>
                <span>{record.name}</span>
                <span>{t(record.category)}</span>
                <span>{new Date(record.date.seconds * 1000)
                  .toISOString()
                  .replace(
                    /(\d\d\d\d)\-(\d\d)\-(\d\d)T(\d\d:\d\d:\d\d).*/,
                    "$4 $3.$2.$1"
                  )}</span>
                <div className="button-edit-wrapper">
                  <button onClick={() => startEdit(i)}>{t("edit")}</button>
                  <button onClick={() => deleteNote(i)}>{t("delete")}</button>
                </div>
              </div>
            );
          })}
      </div>:<div className="loader-center"><div className="loader"></div></div>}
      
    </Layout>
  );
};

export default DiaryPage;
