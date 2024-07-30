import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import Layout from "../../components/Layout/Layout";
import "./ContactPage.css";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [messageError, setMessageError] = useState(false);

  const validateEmail = (email) => {
    // Simple regex for email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = () => {
    let valid = true;

    if (name.trim() === "") {
      setNameError(true);
      valid = false;
    } else {
      setNameError(false);
    }

    if (email.trim() === "" || !validateEmail(email)) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    if (message.trim() === "") {
      setMessageError(true);
      valid = false;
    } else {
      setMessageError(false);
    }

    if (valid) {
      const mailtoLink = `mailto:vhoraanas08@gmail.com?subject=Contact from ${name}&body=Name: ${name}%0D%0AEmail: ${email}%0D%0AMessage: ${message}`;
      window.location.href = mailtoLink;
    }
  };

  return (
    <Layout>
      <div className="ContactPageMainDiv">
        <div className="SectionHeading">Contact Me</div>
        <div className="ContactForm">
          <div className="contact-page-input-fields">
            <TextField
              id="name"
              variant="outlined"
              label="Name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              error={nameError}
              helperText={nameError ? "Name is required" : ""}
            />
            <TextField
              id="email"
              type="email"
              label="Email"
              placeholder="Example@email.com"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={emailError}
              helperText={emailError ? "Valid email is required" : ""}
            />
          </div>
          <div className="contact-page-message-input-div">
            <TextField
              id="message"
              label="Message"
              placeholder="Hey there! Type your message here."
              variant="outlined"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              error={messageError}
              helperText={messageError ? "Message is required" : ""}
            />
          </div>
          <div className="contact-page-submit-btn">
            <Button
              variant="contained"
              className="SendBtn"
              onClick={handleSubmit}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
