import { createContext, useState, useContext } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";



const AccountContext = createContext();

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  };
  

export function AccountProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);

  const addAccount = (accountName, app, auth, user) => {
    setAccounts((prev) => [...prev, { name: accountName, app, auth, user }]);
    setActiveAccount(accountName);
  };

  const switchAccount = (accountName) => {
    setActiveAccount(accountName);
  };

  const getActiveAuth = () => {
    const account = accounts.find((a) => a.name === activeAccount);
    return account ? account.auth : null;
  };

  const getActiveUser = () => {
    const account = accounts.find((a) => a.name === activeAccount);
    return account ? account.user : null;
  };

  // ✅ 🔥 Place the login function here so it can call addAccount:
  const loginNewAccount = async (email, password, accountName) => {
    const app = initializeApp(firebaseConfig, accountName); // unique app
    const auth = getAuth(app);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    addAccount(accountName, app, auth, user);
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        activeAccount,
        addAccount,
        switchAccount,
        getActiveAuth,
        getActiveUser,
        loginNewAccount, // ✅ expose function here
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  return useContext(AccountContext);
}
