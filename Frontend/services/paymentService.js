import api from './api'; // Axios instance

/**
 * Initiates a Khalti payment
 * @param {string} token - User's Bearer token from AuthContext
 * @returns {Object} - { payment_url, pidx }
 */
export const initiateKhaltiPayment = async (token) => {
  try {
    const response = await api.post('/payments/khalti/initiate/', null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error initiating Khalti payment:', error);
    throw error;
  }
};

/**
 * Verifies a Khalti payment
 * @param {string} pidx - Khalti Payment IDX
 * @param {string} token - User's Bearer token from AuthContext
 * @returns {Object} - Payment verification result
 */
export const verifyKhaltiPayment = async (pidx, token) => {
  try {
    const formData = new FormData();
    formData.append('pidx', pidx);

    const response = await api.post('/payments/khalti/verify/', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying Khalti payment:', error);
    throw error;
  }
};

export const getSubscriptionStatus = async (token) => {
  const res = await api.get('/payments/subscription-status/', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};
