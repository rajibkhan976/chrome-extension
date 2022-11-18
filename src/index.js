import React from "react";
import ReactDOM from "react-dom";

import { store } from './app/store';
import { ThemeContextProvider } from './context/ThemeContext';
import { LoaderContextProvider } from './context/PageLoaderContext'
import "./assets/scss/index.scss"
import MainExtension from "./components/MainExtension";

import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";


ReactDOM.render(
  <Provider store={store}>
    <ThemeContextProvider>
      <LoaderContextProvider>
        <MainExtension />
      </LoaderContextProvider>
    </ThemeContextProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(// console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
