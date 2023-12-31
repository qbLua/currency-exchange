import React from 'react'
import {Link} from "react-router-dom";
import './menu.sass'
import { useTranslation } from "react-i18next";

const Menu = () => {
    const { t, i18n } = useTranslation();
  return (
    <nav className='menu-wrapper'>
        <ul className='menu-content'>
            <li className='menu-content__block-wrapper'>
                <li className="menu-content__element">
                    <Link to={'/convert'}>{t("Currency_converter")}</Link>
                </li>
                {
                localStorage.getItem('user-email')?<li className="menu-content__element">
                <Link to={'/diary'}>{t("Spend_diary")}</Link>
                </li>:<></>}
            </li>
            <li className='menu-content__block-wrapper'>
            {
                localStorage.getItem('user-email')?<li className="menu-content__element" onClick={()=>localStorage.removeItem('user-email')}>
                    <Link to={'/login'}><button className='menu-content__btn'>{t("log_out")}</button></Link>
                </li>:<>
                <li className="menu-content__element">
                    <Link to={'/login'}><button className='menu-content__btn'>{t("log_in")}</button></Link>
                </li>
                <li className="menu-content__element">
                    <Link to={'/login'}><button className='menu-content__btn'>{t("registration_do")}</button></Link>
                </li>
                </>
            }
            
            </li>
        </ul>
    </nav>
  )
}

export default Menu;