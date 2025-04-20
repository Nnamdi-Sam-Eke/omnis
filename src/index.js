import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Import from "react-dom/client"
import { BrowserRouter } from "react-router-dom"; // ✅ Ensure React Router is set up
import App from "./App"
import "./App.css"; // ✅ Import App.css
import reportWebVitals from "./reportWebVitals";
// import HomePage from "./Home";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* ✅ Wrap App in Router */}
      <App/>
    </BrowserRouter>
  </React.StrictMode>
);




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
