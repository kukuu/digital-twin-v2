"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import "./Pricing.css";
import "../App.css";
import { ToastContainer, toast } from "react-toastify";

export default function PricingPage() {
  // State management
  const [selectedImageAd, setSelectedImageAd] = useState("");
  const [selectedVideoAd, setSelectedVideoAd] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAdExample, setActiveAdExample] = useState(null);

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  // Constants for ad options
  const imageAdOptions = [
    { id: "image-1month", duration: "1 ", price: 30, discount: "" },
    { id: "image-3months", duration: "3 ", price: 85, discount: "5% off" },
    { id: "image-6months", duration: "6 ", price: 160, discount: "10% off" },
    { id: "image-9months", duration: "9", price: 240, discount: "15% off" },
    { id: "image-12months", duration: "12", price: 330, discount: "20% off" },
    { id: "image-18months", duration: "18", price: 415, discount: "25% off" }
  ];

  const videoAdOptions = [
    { id: "video-6months", duration: "6", price: 180, discount: "10% off" },
    { id: "video-9months", duration: "9", price: 260, discount: "15% off" },
    { id: "video-12months", duration: "12", price: 350, discount: "20% off" }
  ];

  const adExamples = [
    {
      id: "banner-ad",
      title: "Premium Banner Placement - Homepage",
      description: "Top-of-page placement with maximum visibility. Perfect for brand awareness campaigns.",
      dimensions: "1200x200px",
      impressions: "50,000+ monthly",
      type: "banner"
    },
    {
      id: "sidebar-ad",
      title: "Sidebar Placement  - Advertising",
      description: "Persistent visibility on all pages. Great for targeted promotions.",
      dimensions: "300x600px",
      impressions: "30,000+ monthly",
      type: "sidebar"
    },
    {
      id: "content-ad",
      title: "In-Content Promotion - Advertising",
      description: "Native-style ads within article content. Higher engagement rates.",
      dimensions: "Flexible",
      impressions: "Varies by content",
      type: "content"
    },
    {
      id: "featured-ad",
      title: "Featured Sponsor Spot - Homepage",
      description: "Exclusive placement in our featured section. Limited availability.",
      dimensions: "800x400px",
      impressions: "25,000+ monthly",
      type: "featured"
    }
  ];

  // Form submission handler
  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      console.log("Form submitted:", data);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Payment successful! Total: $${calculateTotal()}`);
      resetForm();
    } catch (error) {
      setPaymentError("Payment processing failed. Please try again.");
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // PayPal integration
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: calculateTotal().toString(),
            currency_code: "USD",
            breakdown: {
              item_total: {
                value: calculateTotal().toString(),
                currency_code: "USD"
              }
            }
          },
          items: getSelectedItems()
        }
      ]
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      alert(`Transaction completed by ${details.payer.name.given_name}`);
      resetForm();
    });
  };

  // Helper functions
  const calculateTotal = () => {
    let total = 0;
    const imageAd = imageAdOptions.find(opt => opt.duration === selectedImageAd);
    const videoAd = videoAdOptions.find(opt => opt.duration === selectedVideoAd);
    
    if (imageAd) total += imageAd.price;
    if (videoAd) total += videoAd.price;
    
    return total;
  };

  const getSelectedItems = () => {
    const items = [];
    if (selectedImageAd) {
      const option = imageAdOptions.find(opt => opt.duration === selectedImageAd);
      items.push({
        name: `Image Ad (${option.duration})`,
        unit_amount: {
          value: option.price.toString(),
          currency_code: "USD"
        },
        quantity: "1"
      });
    }
    if (selectedVideoAd) {
      const option = videoAdOptions.find(opt => opt.duration === selectedVideoAd);
      items.push({
        name: `Video Ad (${option.duration})`,
        unit_amount: {
          value: option.price.toString(),
          currency_code: "USD"
        },
        quantity: "1"
      });
    }
    return items;
  };

  const resetForm = () => {
    setSelectedImageAd("");
    setSelectedVideoAd("");
    setPaymentError("");
    reset();
  };

  const handleAdExampleClick = (adId) => {
    setActiveAdExample(adId === activeAdExample ? null : adId);
  };

  // Render function
  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h2 style={{ fontWeight: "bold", color: "green" }}><a href="/">SPYDER</a></h2>
          <Link to="/newsletter" className="crumbtrail"><small>Newsletter | </small></Link> 
          <Link to="/advertising" className="crumbtrail"> <small>Advertising | </small></Link>
          <Link to="/pricing" className="crumbtrail"> <small>Pricing</small></Link>
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

      {/* Page Header */}
      <div className="advertising-header">
        <h1>Pricing Model</h1>
        <p className="header-description">
          Promote your business on our platform to reach thousands of energy-conscious consumers.
          The <strong>SPYDER</strong> Digital Twin Smart Energy Meter Reader helps users find the
          best electricity meters at competitive prices.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="advertising-columns">
        {/* Left Column - Tariffs and Payment Form (30%) */}
        <div className="tariffs-column">
          <form onSubmit={handleSubmit(onSubmit)} className="advertising-form">
          <h2><i className="icon-image"></i> Image Ads</h2>
             <p className="section-description">Static image advertisements displayed throughout our platform.
                Perfect for product promotions and brand awareness. Prices are listed in months.
              </p>
            {/* Image Ads Section */}
            <div className="form-section">
              <div className="options-grid">
                {imageAdOptions.map((option) => (
                  <div 
                    className={`option-card ${selectedImageAd === option.duration ? 'selected' : ''}`}
                    key={option.id}
                    onClick={() => setSelectedImageAd(option.duration)}
                  >
                    <input
                      type="radio"
                      id={option.id}
                      name="imageAd"
                      checked={selectedImageAd === option.duration}
                      onChange={() => {}}
                      hidden
                    />
                    <label htmlFor={option.id}>
                      <span className="duration">{option.duration}</span>
                      {option.discount && <span className="discount-badge">{option.discount}</span>}
                      <span className="price">${option.price}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Ads Section */}

            <h2 className="video-ads"><i className="icon-video"></i> Video Ads</h2>
              <p className="section-description">
                Dynamic video content in premium placements. Higher engagement
                and conversion rates. Prices are listed in months.
              </p>
            <div className="form-section">
             

              <div className="options-grid">
                {videoAdOptions.map((option) => (
                  <div 
                    className={`option-card ${selectedVideoAd === option.duration ? 'selected' : ''}`}
                    key={option.id}
                    onClick={() => setSelectedVideoAd(option.duration)}
                  >
                    <input
                      type="radio"
                      id={option.id}
                      name="videoAd"
                      checked={selectedVideoAd === option.duration}
                      onChange={() => {}}
                      hidden
                    />
                    <label htmlFor={option.id}>
                      <span className="duration">{option.duration}</span>
                      {option.discount && <span className="discount-badge">{option.discount}</span>}
                      <span className="price">${option.price}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Section */}
            <div className="payment-section">
              <h2><i className="icon-payment"></i> Payment Details</h2>
              
              <SignedOut>
                <div className="auth-prompt">
                  <p>Please <SignInButton mode="modal" className="login-button">sign in</SignInButton> to complete your purchase.</p>
                </div>
              </SignedOut>

              <SignedIn>
                {/* Order Summary */}
                <div className="order-summary">
                  <h3>Your Order</h3>
                  <div className="order-items">
                    {selectedImageAd && (
                      <div className="order-item">
                        <span>Image Ad ({selectedImageAd})</span>
                        <span>${imageAdOptions.find(opt => opt.duration === selectedImageAd).price}</span>
                      </div>
                    )}
                    {selectedVideoAd && (
                      <div className="order-item">
                        <span>Video Ad ({selectedVideoAd})</span>
                        <span>${videoAdOptions.find(opt => opt.duration === selectedVideoAd).price}</span>
                      </div>
                    )}
                    <div className="order-total">
                      <span>Total</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="payment-methods">
                  <div className="credit-card-form">
                    <h4>Credit/Debit Card</h4>
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input
                        type="text"
                        id="cardNumber"
                        {...register("cardNumber", { 
                          required: "Card number is required",
                          pattern: {
                            value: /^[0-9]{16}$/,
                            message: "Invalid card number"
                          }
                        })}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && <span className="error">{errors.cardNumber.message}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiry">Expiry Date</label>
                        <input
                          type="text"
                          id="expiry"
                          {...register("expiry", { 
                            required: "Expiry date is required",
                            pattern: {
                              value: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
                              message: "MM/YY format required"
                            }
                          })}
                          placeholder="MM/YY"
                        />
                        {errors.expiry && <span className="error">{errors.expiry.message}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="cvc">CVC</label>
                        <input
                          type="text"
                          id="cvc"
                          {...register("cvc", { 
                            required: "CVC is required",
                            pattern: {
                              value: /^[0-9]{3,4}$/,
                              message: "Invalid CVC"
                            }
                          })}
                          placeholder="123"
                        />
                        {errors.cvc && <span className="error">{errors.cvc.message}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="name">Name on Card</label>
                      <input
                        type="text"
                        id="name"
                        {...register("name", { 
                          required: "Name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters"
                          }
                        })}
                        placeholder="John Smith"
                      />
                      {errors.name && <span className="error">{errors.name.message}</span>}
                    </div>
                  </div>

                  <div className="paypal-container">
                    <h4>PayPal</h4>
                    <PayPalScriptProvider 
                      options={{ 
                        "client-id": "test",
                        "currency": "USD",
                        "intent": "capture"
                      }}
                    >
                      <PayPalButtons
                        style={{ 
                          layout: "vertical",
                          color: "blue",
                          shape: "rect",
                          label: "paypal"
                        }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={(err) => {
                          setPaymentError("PayPal payment failed: " + err.message);
                          console.error("PayPal error:", err);
                        }}
                        onCancel={() => {
                          setPaymentError("PayPal payment was cancelled");
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="submit-section">
                  <button
                    type="submit"
                    className="payment-button"
                    disabled={isProcessing || (!selectedImageAd && !selectedVideoAd)}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner"></span> Processing...
                      </>
                    ) : (
                      "Complete Payment"
                    )}
                  </button>
                  {paymentError && (
                    <div className="payment-error">
                      <i className="icon-error"></i> {paymentError}
                    </div>
                  )}
                </div>
              </SignedIn>
            </div>
          </form>
        </div>

        {/* Right Column - Advertising Examples (70%) */}
        <div className="ads-column">
          <h2 className="examples-title">Advertising Placement Examples</h2>
          <p className="examples-description">
            See how your ads could appear on our platform. Click on each example to view details.
          </p>

          <div className="ad-examples-grid">
            {adExamples.map((ad) => (
              <div 
                className={`ad-example-card ${ad.type} ${activeAdExample === ad.id ? 'expanded' : ''}`}
                key={ad.id}
                onClick={() => handleAdExampleClick(ad.id)}
              >
                <div className="ad-example-header">
                  <h3>{ad.title}</h3>
                  <i className={`icon-${ad.type}`}></i>
                </div>
                <div className="ad-example-preview">
                  {ad.title} Preview Area
                </div>
                <div className="ad-example-details">
                  <p>{ad.description}</p>
                  <div className="ad-specs">
                    <div className="spec">
                      <span className="spec-label">Dimensions:</span>
                      <span className="spec-value">{ad.dimensions}</span>
                    </div>
                    <div className="spec">
                      <span className="spec-label">Impressions:</span>
                      <span className="spec-value">{ad.impressions}</span>
                    </div>
                  </div>
                  {activeAdExample === ad.id && (
                    <div className="ad-benefits">
                      <h4>Benefits:</h4>
                      <ul>
                        <li>Premium visibility on all devices</li>
                        <li>Detailed performance analytics</li>
                        <li>Dedicated account manager</li>
                        {ad.type === 'featured' && <li>Exclusive placement</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Advertising Info */}
          <div className="advertising-info">
            <h3>Why Advertise With Us?</h3>
            <div className="info-cards">
              <div className="info-card">
                <i className="icon-audience"></i>
                <h4>Targeted Audience</h4>
                <p>Reach energy-conscious consumers actively looking for solutions</p>
              </div>
              <div className="info-card">
                <i className="icon-analytics"></i>
                <h4>Detailed Analytics</h4>
                <p>Comprehensive reporting on impressions, clicks, and conversions</p>
              </div>
              <div className="info-card">
                <i className="icon-support"></i>
                <h4>Dedicated Support</h4>
                <p>Our team will help optimize your campaigns for best results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}