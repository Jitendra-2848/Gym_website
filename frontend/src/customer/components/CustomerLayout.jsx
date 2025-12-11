// src/customer/components/CustomerLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import CustomerNavbar from './CustomerNavbar'
import Footer from './Footer'

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-dark-400 flex flex-col">
      <CustomerNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default CustomerLayout