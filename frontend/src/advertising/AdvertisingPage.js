"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import "./Advertising.css";
import "../App.css";
import { ToastContainer, toast } from "react-toastify";

export default function AdvertisingPage() {
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
    { id: "image-1month", duration: "1 month", price: 30, discount: "" },
    { id: "image-3months", duration: "3 months", price: 85, discount: "5% off" },
    { id: "image-6months", duration: "6 months", price: 160, discount: "10% off" },
    { id: "image-9months", duration: "9 months", price: 240, discount: "15% off" },
    { id: "image-12months", duration: "12 months", price: 330, discount: "20% off" }
  ];

  const videoAdOptions = [
    { id: "video-6months", duration: "6 months", price: 180, discount: "10% off" },
    { id: "video-9months", duration: "9 months", price: 260, discount: "15% off" },
    { id: "video-12months", duration: "12 months", price: 350, discount: "20% off" }
  ];

  const adExamples = [
    {
      id: "banner-ad",
      title: "Premium Banner Placement",
      description: "Top-of-page placement with maximum visibility. Perfect for brand awareness campaigns.",
      dimensions: "1200x200px",
      impressions: "50,000+ monthly",
      type: "banner"
    },
    {
      id: "sidebar-ad",
      title: "Sidebar Advertisement",
      description: "Persistent visibility on all pages. Great for targeted promotions.",
      dimensions: "300x600px",
      impressions: "30,000+ monthly",
      type: "sidebar"
    },
    {
      id: "content-ad",
      title: "In-Content Promotion",
      description: "Native-style ads within article content. Higher engagement rates.",
      dimensions: "Flexible",
      impressions: "Varies by content",
      type: "content"
    },
    {
      id: "featured-ad",
      title: "Featured Sponsor Spot",
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
      <ToastContainer position="top-right" autoClose={3000} />
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
        <h1>Advertising Opportunities</h1>
      </div>
      <div className="main-content">
          <p className="header-description">
              Promote your business on our platform to reach thousands of energy-conscious consumers.
              The <strong>SPYDER</strong> Digital Twin Smart Energy Meter Reader helps users find the
              best electricity meters at competitive prices.
            </p>
      </div>
    </div>
  );
}


