import React from 'react';
import { StatusBar } from 'react-native';
import LoginPage from './src/Auth/Login/Login';

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <LoginPage />
    </>
  );
}