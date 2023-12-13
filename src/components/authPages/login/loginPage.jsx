import React from "react";
import "./loginPage.css";
import { useTranslation } from "react-i18next";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AuthPage = ({ db }) => {
  const { t, i18n } = useTranslation();
  const [emptyEmail, setEmptyEmail] = React.useState(false);
  const [invalidEmail, setInvalidEmail] = React.useState(false);
  const [notLogged, setNotLogged] = React.useState(false);
  const [invalidPassword, setInvalidPassword] = React.useState(false);
  const [smallPassword, setSmallPassword] = React.useState(false);
  const [emptyPassword, setEmptyPassword] = React.useState(false);
  const navigate = useNavigate();
  async function login(e) {
    e.preventDefault();
    const data = {
      email: e.target[0].value.trim(),
      password: e.target[1].value.trim(),
    };
    setEmptyEmail(false);
    setInvalidEmail(false);
    setInvalidPassword(false);
    setSmallPassword(false);
    setEmptyPassword(false);
    let valid = true;
    if (!data.email) {
      valid = false;
      setEmptyEmail(true);
    } else if (
      !data.email.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)
    ) {
      valid = false;
      setInvalidEmail(true);
    }
    if (!data.password.length) {
      valid = false;
      setEmptyPassword(true);
    } else if (data.password.length < 8) {
      valid = false;
      setSmallPassword(true);
    } else if (data.password.match(/[^a-zA-Z0-9_]/)) {
      valid = false;
      setInvalidPassword(true);
    }
    setNotLogged(false);
    if (valid) {
      const querySnapshot = await getDocs(collection(db, "users"));
        let logged = false
        querySnapshot.docs.forEach((doc) => {
          if (doc.data().email === data.email && doc.data().password === data.password) {
            logged = true
          }
        })
        if (logged) {
          navigate("/convert");
          localStorage.setItem("user-email", data.email);
        } else {
          setNotLogged(true);
        }
    }
  }
  return (
    <div className="container">
      <div className="form-box">
        <div className="form-value">
          <form onSubmit={login}>
            <h2>{t("login_title")}</h2>
            <div className="inputbox">
              <ion-icon name="person-circle-outline"></ion-icon>
              <input type="username" required />
              <label htmlFor="">{t("Email")}</label>
              <p className="error">
                {emptyEmail
                  ? t("empty_email")
                  : invalidEmail
                  ? t("invalid_email")
                  : ""}
              </p>
            </div>
            <div className="inputbox">
              <ion-icon name="lock-closed-outline"></ion-icon>
              <input type="password" required />
              <label htmlFor="">{t("Password")}</label>
              <p className="error">
                {emptyPassword
                  ? t("empty_password")
                  : smallPassword
                  ? t("short_password")
                  : invalidPassword
                  ? t("invalid_password")
                  : ""}
              </p>
            </div>
            <button type="submit">{t("login_submit")}</button>
            <p className="error">
              {notLogged?t("invalid_creds"):''}
            </p>
            <div className="bottom">
              <div className="left">
                <label>
                  <a href="/signup">{t("not_registered?")}</a>
                </label>
              </div>
              <div className="right">
                <label>
                  <a href="#">{t("forgot_password?")}</a>
                </label>
              </div>
            </div>
            <div className="lang">
              <span
                onClick={() => i18n.changeLanguage("ru")}
                className={
                  i18n.resolvedLanguage === "ru" ? "selected-lang" : ""
                }
              >
                RU
              </span>
              /
              <span
                onClick={() => i18n.changeLanguage("en")}
                className={
                  i18n.resolvedLanguage === "en" ? "selected-lang" : ""
                }
              >
                EN
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
