"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import "./Advertising.css";

import "../App.css";


export default function AdvertisingPage() {
  const [selectedImageAd, setSelectedImageAd] = useState("");
  const [selectedVideoAd, setSelectedVideoAd] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setIsProcessing(true);
    console.log("Form submitted:", data);
    // Payment processing would happen here
  };

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: calculateTotal().toString(),
            currency_code: "USD",
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      alert(`Transaction completed by ${details.payer.name.given_name}`);
      // Handle successful payment
    });
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedImageAd === "1 month") total += 30;
    if (selectedImageAd === "3 months") total += 85;
    if (selectedImageAd === "6 months") total += 160;
    if (selectedImageAd === "9 months") total += 240;
    if (selectedImageAd === "12 months") total += 330;
    
    if (selectedVideoAd === "6 months") total += 180;
    if (selectedVideoAd === "9 months") total += 260;
    if (selectedVideoAd === "12 months") total += 350;
    
    return total;
  };

  return (
    <div className="advertising-container">


    <nav className="navbar">
        <div className="navbar-brand">
          <h2 style={{ fontWeight: "bold", color: "green" }}>SPYDER</h2>
        </div>
        <div className="navbar-auth">
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      <div className="advertising-header">
        <h3>Advertising Opportunities</h3>
        <p>Promote your business on our platform to reach thousands of energy-conscious consumers.<br />

          The <strong>SPYDER</strong> Digital Twin Smart Energy Meter Reader,
          helps you find the best electricity meter at the most competitive
          price. Compare diferent meters, check prices and choose the right
          option to save on energy bills.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="advertising-form">
        {/* Image Ads Section */}
        <div className="form-section">
          <h2>Image Ads</h2>
          <p className="section-description">
            Display your brand with static image advertisements that appear throughout our platform.
            Perfect for product promotions and brand awareness campaigns.
          </p>

          <div className="option-row">
            <div className="option-cell">
              <input
                type="radio"
                id="image-1month"
                name="imageAd"
                value="1 month"
                checked={selectedImageAd === "1 month"}
                onChange={() => setSelectedImageAd("1 month")}
              />
              <label htmlFor="image-1month">1 month</label>
            </div>
            <div className="option-cell price">$30</div>
          </div>

          <div className="option-row">
            <div className="option-cell">
              <input
                type="radio"
                id="image-3months"
                name="imageAd"
                value="3 months"
                checked={selectedImageAd === "3 months"}
                onChange={() => setSelectedImageAd("3 months")}
              />
              <label htmlFor="image-3months">3 months</label>
            </div>
            <div className="option-cell price">$85</div>
          </div>

          <div className="option-row">
            <div className="option-cell">
              <input
                type="radio"
                id="image-6months"
                name="imageAd"
                value="6 months"
                checked={selectedImageAd === "6 months"}
                onChange={() => setSelectedImageAd("6 months")}
              />
              <label htmlFor="image-6months">6 months</label>
            </div>
            <div className="option-cell price">$160</div>
          </div>

          <div className="option-row">
            <div className="option-cell">
              <input
                type="radio"
                id="image-9months"
                name="imageAd"
                value="9 months"
                checked={selectedImageAd === "9 months"}
                onChange={() => setSelectedImageAd("9 months")}
              />
              <label htmlFor="image-9months">9 months</label>
            </div>
            <div className="option-cell price">$240</div>
          </div>

          <div className="option-row">
            <div className="option-cell">
              <input
                type="radio"
                id="image-12months"
                name="imageAd"
                value="12 months"
                checked={selectedImageAd === "12 months"}
                onChange={() => setSelectedImageAd("12 months")}
              />
              <label htmlFor="image-12months">12 months</label>
            </div>
            <div className="option-cell price">$330</div>
          </div>
        </div>

        {/* Video Ads Section */}
        <div className="form-section">
          <h2>Video Ads</h2>
          <p className="section-description">
            Engage our audience with dynamic video content. Video ads appear in premium placements
            and can significantly increase conversion rates.
          </p>

          <div className="option-row">
            <div className="option-cell">
              <input
                type="radio"
                id="video-6months"
                name="videoAd"
                value="6 months"
                checked={selectedVideoAd === "6 months"}
                onChange={() => setSelectedVideoAd("6 months")}
              />
              <label htmlFor="video-6months">6 months</label>
            </div>
            <div className="option-cell price">$180</div>
          </div>

          <div className="option-row">
            <div className="option-cell">
              <input
                type="radio"
                id="video-9months"
                name="videoAd"
                value="9 months"
                checked={selectedVideoAd === "9 months"}
                onChange={() => setSelectedVideoAd("9 months")}
              />
              <label htmlFor="video-9months">9 months</label>
            </div>
            <div className="option-cell price">$260</div>
          </div>

          <div className="option-row">
            <div className="option-cell">
              <input
                type="radio"
                id="video-12months"
                name="videoAd"
                value="12 months"
                checked={selectedVideoAd === "12 months"}
                onChange={() => setSelectedVideoAd("12 months")}
              />
              <label htmlFor="video-12months">12 months</label>
            </div>
            <div className="option-cell price">$350</div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="payment-section">
          <h2>Payment Details</h2>
          
          <SignedOut>
            <div className="auth-prompt">
              <p>Please <SignInButton mode="modal" className="login-button">sign in</SignInButton> to complete your purchase.</p>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="payment-methods">
              <div className="credit-card-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    {...register("cardNumber", { required: "Card number is required" })}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && <span className="error">{errors.cardNumber.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="expiry">Expiry Date</label>
                  <input
                    type="text"
                    id="expiry"
                    {...register("expiry", { required: "Expiry date is required" })}
                    placeholder="MM/YY"
                  />
                  {errors.expiry && <span className="error">{errors.expiry.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="cvc">CVC</label>
                  <input
                    type="text"
                    id="cvc"
                    {...register("cvc", { required: "CVC is required" })}
                    placeholder="123"
                  />
                  {errors.cvc && <span className="error">{errors.cvc.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="name">Name on Card</label>
                  <input
                    type="text"
                    id="name"
                    {...register("name", { required: "Name is required" })}
                    placeholder="John Smith"
                  />
                  {errors.name && <span className="error">{errors.name.message}</span>}
                </div>
              </div>

              <div className="paypal-container">
                <PayPalScriptProvider options={{ "client-id": "test" }}>
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={(err) => {
                      setPaymentError("Payment failed: " + err.message);
                      console.error("PayPal error:", err);
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </div>

            <div className="total-section">
              <h3>Total: ${calculateTotal()}</h3>
              <button
                type="submit"
                className="payment-button"
                disabled={isProcessing || (!selectedImageAd && !selectedVideoAd)}
              >
                {isProcessing ? "Processing..." : "Complete Payment"}
              </button>
              {paymentError && <div className="payment-error">{paymentError}</div>}
            </div>
          </SignedIn>
        </div>
      </form>
    </div>
  );
}