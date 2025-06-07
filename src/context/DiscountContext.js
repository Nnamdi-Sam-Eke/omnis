import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const DiscountContext = createContext({
  showBanner: false,
  discountEndDate: null,
});

export const useDiscount = () => useContext(DiscountContext);

export const DiscountProvider = ({ children }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [discountEndDate, setDiscountEndDate] = useState(null);

  useEffect(() => {
    const fetchDiscountStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const discountUntil = docSnap.data()?.discountAvailableUntil;

          if (discountUntil && typeof discountUntil.toDate === 'function') {
            const date = discountUntil.toDate();
            if (date > new Date()) {
              setShowBanner(true);
              setDiscountEndDate(date);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching discount status:', error);
      }
    };

    fetchDiscountStatus();
  }, []);

  return (
    <DiscountContext.Provider value={{ showBanner, discountEndDate }}>
      {children}
    </DiscountContext.Provider>
  );
};
export default DiscountProvider;