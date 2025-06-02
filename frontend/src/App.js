"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import io from "socket.io-client";
import paperWhisky from './images/whisky-in-paper-bottle.png';
import woodenbike from './images/wooden-bicycle.jpg';
import heatpump from './images/heat-pump.png';
import hellofresh from './images/dt-1-hello-fresh-co-uk.png';
import lovejoint from './images/dt-2-love-joint.png';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";

// Define socket connection based on environment
const socket = io(
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_BACKEND_URL_PROD
    : process.env.REACT_APP_BACKEND_URL_DEV
);

// Apps Script URL from environment variable
const APPS_SCRIPT_URL = process.env.REACT_APP_APPS_SCRIPT_URL;

let meterData = {
  "SMR-98756-1-A": {
    supplier: "Octopus Energy",
    cost: 23.28,
    tariff: "Fixed",
    total: 0,
    contact: "0808 164 1088",
    target: "https://octopus.energy/"
  },
  "SMR-43563-2-A": {
    supplier: "EDF Energy",
    cost: 23.28,
    tariff: "Fixed",
    total: 0,
    contact: "0333 200 5100",
    target: "https://www.edfenergy.com/"
  },
  "SMR-65228-1-B": {
    supplier: "E.ON Next",
    cost: 25.69,
    tariff: "Standard",
    total: 0,
    contact: "0808 501 5200",
    target: "https://www.eonnext.com/"
  }
};

// Simple memoized modal component
const Modal = memo(
  ({
    value,
    onChange,
    onClose,
    onSend,
    onPay,
    isSending,
    meterInfo,
    onAccountNumberChange,
  }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>Meter Details - {meterInfo.id}</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <div className="account-number-input">
              <h3>Customer Account Number:</h3>
              <input
                type="text"
                id="accountNumber"
                value={meterInfo.accountNumber}
                onChange={onAccountNumberChange}
                placeholder="Enter account number"
                className="account-input"
              />
            </div>
            <h3>Current Reading</h3>
            <div className="reading-input-container">
              <input
                type="number"
                value={value}
                onChange={onChange}
                className="reading-input"
                step="0.01"
                min="0"
              />
              <span className="reading-unit">kWh</span>
            </div>
          </div>
          <div className="detail-row">
            <h3>Supplier Information</h3>
            <p>Supplier: <span className="energy-supplier">{meterInfo.supplier}</span></p>
            <p>Tariff Type: {meterInfo.tariff}</p>
          </div>
          <div className="detail-row">
            <h3>Cost Calculation</h3>
            <p>Rate per kWh: {meterInfo.cost}p</p>
            <p>Total Cost: £{meterInfo.total}</p>
          </div>
          <div className="detail-row">
            <button
              className="send-reading-button"
              onClick={onSend}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send Meter Reading"}
            </button>
            <button
              className="paypal-payment-button"
              onClick={onPay}
              disabled={isSending}
            >
              Payment Gateway
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

Modal.displayName = "Modal";

export default function EnergyMeter() {
  const [readings, setReadings] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReadingActive, setIsReadingActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();
  const [isSending, setIsSending] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const updateReading = useCallback(({ meter_id, reading }) => {
    setReadings((prevReadings) => ({
      ...prevReadings,
      [meter_id]: {
        ...meterData[meter_id],
        reading: reading.toFixed(2),
        total: ((reading * meterData[meter_id].cost) / 100).toFixed(2),
      },
    }));
    setLoading(false);
  }, []);

  useEffect(() => {
    socket.on("newReading", updateReading);
    return () => socket.off("newReading", updateReading);
  }, [updateReading]);

  const stopReading = () => {
    socket.emit("stopReading");
    setIsReadingActive(false);
  };

  const startReading = () => {
    socket.emit("startReading");
    setIsReadingActive(true);
  };

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setModalData((prev) => ({
        ...prev,
        editedReading: value,
        total: ((numValue * prev.cost) / 100).toFixed(2),
      }));
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    startReading();
  }, []);

  const handleSendReading = useCallback(async () => {
    if (modalData && user) {
      setIsSending(true);
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          redirect: "follow",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            userEmail: user.primaryEmailAddress.emailAddress,
            meterData: {
              id: modalData.id,
              reading: modalData.editedReading,
              supplier: modalData.supplier,
              tariff: modalData.tariff,
              cost: modalData.cost,
              total: modalData.total,
              accountNumber: modalData.accountNumber,
            },
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Meter reading details sent to your email!");
          setShowModal(false);
          startReading();
        } else {
          throw new Error(data.error || "Failed to send email");
        }
      } catch (error) {
        console.error("Email error:", error);
        toast.error("Failed to send email: " + error.message);
      } finally {
        setIsSending(false);
      }
    }
  }, [modalData, user]);

  const handlePay = useCallback(() => {
    console.log("Paying £" + modalData.total);
  }, [modalData]);

  const handleAccountNumberChange = useCallback((e) => {
    setModalData((prev) => ({
      ...prev,
      accountNumber: e.target.value,
    }));
  }, []);

  const handleMeterSelect = useCallback((meterId, data, e) => {
    // Check if the click came from the target link
    if (e.target.closest('.target-link')) {
      return; // Let the default anchor behavior handle it
    }
    
    stopReading();
    const meterSnapshot = {
      id: meterId,
      reading: data.reading,
      supplier: data.supplier,
      tariff: data.tariff,
      cost: data.cost,
      total: data.total,
      editedReading: data.reading,
      accountNumber: "",
    };
    setModalData(meterSnapshot);
    setInputValue(data.reading);
    setShowModal(true);
  }, []);

  const renderModal = () => {
    if (!modalData || !showModal) return null;

    return (
      <Modal
        value={inputValue}
        onChange={handleInputChange}
        onClose={handleModalClose}
        onSend={handleSendReading}
        onPay={handlePay}
        isSending={isSending}
        meterInfo={modalData}
        onAccountNumberChange={handleAccountNumberChange}
      />
    );
  };

  const MeterGrid = ({ isInteractive = true }) => (
    <div className="meter-grid">
      {Object.entries(readings).map(([meterId, data]) => (
        <div
          key={meterId}
          className={`card ${
            isInteractive ? "card-interactive" : "card-disabled"
          }`}
          onClick={
            isInteractive ? (e) => handleMeterSelect(meterId, data, e) : undefined
          }
          role={isInteractive ? "button" : undefined}
          tabIndex={isInteractive ? 0 : undefined}
        >
          <div className="card-header">
            <div className="card-title">
              {`Meter ${meterId}`}
              <span className="status-indicator">
                <span
                  className={`ping ${isReadingActive ? "active" : "stopped"}`}
                ></span>
                <span
                  className={`dot ${isReadingActive ? "active" : "stopped"}`}
                ></span>
              </span>
            </div>
          </div>
          <div className="card-content">
            <div className="reading-display">
              <span>{data.reading}</span>
              <span className="unit">kWh</span>
              <p className="changeReading">Change reading</p>
            </div>
            <div className="other-display">
              <span className="unit2">Supplier:</span>
              <span>{data.supplier}</span>
            </div>
            <div className="other-display">
              <span className="unit2">Tariff:</span>
              <span>{data.tariff}</span>
            </div>
            <div className="other-display">
              <span className="unit2">Cost per kWh:</span>
              <span>{data.cost}p</span>
            </div>
            <div className="other-display">
              <span className="unit2">Total Cost:</span>
              <span>£{data.total}</span>
            </div>
            <div>Contact: {data.contact}</div>
            {data.target && (
              <div className="target-link" onClick={(e) => e.stopPropagation()}>
                <a href={data.target} target="_blank" rel="noopener noreferrer">
                  Find out more!
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <nav className="navbar">
        <div className="navbar-brand">
          <h2 style={{ fontWeight: "bold", color: "blue" }}>SPYDER</h2>
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

      <div className="container">
        <h3 className="title">Price Comparison Smart Energy Meter Reader</h3>
        <p className="app-description">
          The <strong>SPYDER</strong> Digital Twin Smart Energy Meter Reader,
          helps you find the best electricity meter at the most competitive
          price. Compare diferent meters, check prices and choose the right
          option to save on energy bills.
        </p>
        <SignedOut>
          <p className="auth-prompt">
            Start comparing now and make smarter choices for your electricity
            usage. Please &nbsp;
            <SignInButton mode="modal" className="login-button">
              Sign in &nbsp;
            </SignInButton>
            &nbsp;&nbsp; and select a Smart Meter!
          </p>
        </SignedOut>
        <SignedIn>
          <p className="auth-prompt">
            Start comparing now and make smarter choices for your electricity
            usage. Please select a Smart Meter!
          </p>
        </SignedIn>

        {loading ? (
          <div className="loading">Loading meter readings...</div>
        ) : (
          <div className="meter-container">
            <SignedOut>
              <SignInButton mode="modal">
                <MeterGrid isInteractive={false} />
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <MeterGrid isInteractive={true} />
              {renderModal()}

              <div className="button-container">
                {isReadingActive ? (
                  <button onClick={() => stopReading()} className="stop-button">
                    Stop
                  </button>
                ) : (
                  <button onClick={() => startReading()} className="start-button">
                    Start
                  </button>
                )}
              </div>
            </SignedIn>
          </div>
        )}
        
        <div className="ad-container">
          <div className="ad-column">
            <div className="ad-label">
              <h3 className="ad-labelHeader">Race to zero emission future!</h3>
              {/*<span className="ad-space">Advertise here!</span>*/}
              <div className="responsive-iframe-container">
                <iframe
                  src="https://www.youtube.com/embed/O7ACNMj8NW0"
                  title="Evolution of Tesla (Animation)"
                  alt="Evolution of Tesla"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="responsive-image-container">
                <img src={paperWhisky} alt="Whisky in Paper bottle" className="ad-image" />
                <img src={woodenbike} alt="Wooden Bike" className="ad-image" />
                <img src={heatpump} alt="Heat pump" className="ad-image" />
              </div>
            </div>
          </div>

          <div className="ad-column">
            <div className="ad-label">
              <h3 className="ad-labelHeader2">Advertising space!</h3>
              {/*span className="ad-space">Advertise here!</span>*/}
              <div className="media-grid">
                <div className="media-container video">
                <span>Available{/*VIDEO*/}</span>
                  <iframe
                    src=""
                    title="Dummy Video"
                    alt="Dummy Video"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="media-container image">
                  <span>Hello Fresh</span>
                  <iframe
                    src={hellofresh}
                    title="Hello Fresh"
                    alt="Hello Fresh"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="media-container carousel">
                <span>Available{/*Carousel*/}</span>
                  <iframe
                    src=""
                    title="Dummy Carousel"
                    alt="Dummy Carousel"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="media-container video">
                  <span>Available{/*VIDEO*/}</span>
                  <iframe
                    src=""
                    title="Dummy Video"
                    alt="Dummy Video"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="media-container image">
                  <a href="https://www.lovejoint.store"><span>Love Joint</span></a> 
                  <iframe
                    src={lovejoint}
                    title="Dummy ImageLove Joint"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
