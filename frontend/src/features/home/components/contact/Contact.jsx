import React, {useState} from 'react'
import './contact.css'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import PlaceIcon from '@mui/icons-material/Place';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Contact = () => {

    const [result, setResult] = useState("");

    const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending...");
    
    
    const formData = new FormData(event.target);
    formData.append("access_key", "4f4e8c9e-243b-47d1-a28c-91d307ff6c4b");

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    }).then(res => res.json());

    if (res.success) {
        console.log("Success", res);
        setResult(res.message);
        event.target.reset();
    } else {
        console.log("Error", res);
        setResult(res);
    }
};

  return (
    <div className="contact">

    
    <div className="contact-row">
      <div className="contact-col">
        <h3>Get in touch</h3>
            <p>Feel free to reach out to us via the contact form or use the contact information below. We value your feedback, questions, and suggestions, as they help us improve our services.</p>
            <h4>Contact Information:</h4>
            <ul> 
                <li><AlternateEmailIcon className="contact-icon"/>prasannapradeepkumara90@gmail.com</li>
                <li><PhoneEnabledIcon className="contact-icon"/> 077 693 3038 <br/>077 813 0111 </li>
                <li><PlaceIcon className="contact-icon"/>Main St, Pugoda</li>
            </ul>

            <h4>Opening Hours:</h4>
            <p>Everyday (9.00 AM - 8.00 PM)</p>

            <h4>We are on social media:</h4>
            <ul>
                <li>
                    <a href='https://www.facebook.com/pugodapet' target='blank' rel="noopener noreferrer"><FacebookIcon className="contact-icon"/></a>
                    <span>Facebook</span>
                </li>
                <li>
                    <a href='https://www.instagram.com/pugodapet/' target='blank' rel="noopener noreferrer"><InstagramIcon className="contact-icon"/></a>
                    <span>Instagram</span>
                </li>
            </ul>
      </div>

      <div className="contact-col">
	<form onSubmit={onSubmit}>
                <label>Your name</label>
                <input type="text" name="name" placeholder="Enter your name" required/>
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="Enter your mobile number" required/>
                <label>Write your message here</label>
                <textarea name="message" rows="6" placeholder="Enter your message here" required></textarea>
                <button type="submit" className="btn btn-teal">Send Message <ArrowForwardIcon/></button>
         </form>
         <span>{result}</span>
        
      </div>
    </div>

    
    <div className="map">
      <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.250118661554!2d80.1236419!3d6.9797858999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3ab59541ccf31%3A0xfdcc126324c81721!2sPugoda%20Animal%20Hospital!5e0!3m2!1sen!2slk!4v1772345265149!5m2!1sen!2slk"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Pugoda Animal Hospital Location"
        ></iframe>
    </div>

  </div>
  )
}

export default Contact