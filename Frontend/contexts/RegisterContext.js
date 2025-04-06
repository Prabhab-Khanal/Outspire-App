import React, { createContext, useState } from 'react';

export const RegisterContext = createContext();

export const RegisterProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    profile_picture: null,
    otp: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      username: '',
      email: '',
      phone_number: '',
      password: '',
      profile_picture: null,
      otp: '',
    });
  };

  return (
    <RegisterContext.Provider value={{ formData, updateField, resetForm }}>
      {children}
    </RegisterContext.Provider>
  );
};
