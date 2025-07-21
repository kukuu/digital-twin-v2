import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import "./Newsletter.css";
import "../App.css";
import { ToastContainer, toast } from "react-toastify";


export default function NewsletterPage() {
  const [selectedImageAd, setSelectedImageAd] = useState("");
  const [selectedVideoAd, setSelectedVideoAd] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

 

  
  return (
    <div className="app-container">
      {/* Navigation */}
      <ToastContainer position="top-right" autoClose={3000} />
      <nav className="navbar">
        <div className="navbar-brand">
          <h2 style={{ fontWeight: "bold", color: "green" }}><a href="/">SPYDER</a></h2>
        </div>
        <div className="navbar-auth">
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
         <div>
         {/* <Link to="/advertising" className="crumbtrail"> <small>Advertising | </small></Link>
          <Link to="/pricing" className="crumbtrail"> <small>Pricing | </small></Link>*/}
          <Link to="/newsletter" className="crumbtrail"><small>Newsletter</small></Link> 
        </div>
      </nav>

      <div className="advertising-header">
        <h1>Newsletter</h1>
      </div>
      <div className="main-content">
          <p className="header-description">
              More content...
            </p>
      </div>
    </div>
  );
}
