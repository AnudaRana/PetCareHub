import React from 'react'
import './About.css'
import Vet1 from '../../../../assets/vet1.jpg'
import Vet2 from '../../../../assets/vet2.jpg'
import VetTech1 from '../../../../assets/vetTech1.jpg'
import VetTech2 from '../../../../assets/vetTech2.jpg'
import Receptionist from '../../../../assets/receptionist.jpg'

const About = () => {
    return (
    <div className="about">
        <div className="about-text">
            <h3>We help your pets live happy, disease-free lives.</h3>
            <p>We're an animal hospital in Pugoda. Our team provides complete care from medicine to behavioral counseling, nutritional advice, vaccinations, preventive care, surgeries, and custom health and safety plans for your beloved companions.</p>
        </div>
        <h3 className="staff-heading">Our Team</h3>
        <div className="staff-section">
            <div className="staff-card">
                <div className="staff-img">
                    <img src={Vet1} alt=""/>
                </div>
                <p className="staff-name">Dr. Prasanna Kumara</p>
                <p className="staff-reg-no">Reg. No - 1504</p>
                <p className="staff-title">Managing Director, <br/>Chief Veterinary Surgeon</p>
                <p className="staff-degree">BVSc (SL)</p>
            </div>

            <div className="staff-card">
                <div className="staff-img">
                    <img src={Vet2} alt=""/>
                </div>
                <p className="staff-name">Dr. Sanjeewani Perera</p>
                <p className="staff-reg-no">Reg. No - 1521</p>
                <p className="staff-title">Vetrinary Surgeon</p>
                <p className="staff-degree">BVSc (SL)</p>
                
            </div>

            <div className="staff-card">
                <div className="staff-img">
                    <img src={VetTech1} alt=""/>
                </div>
                <p className="staff-name">Mrs. Piyumali Ranasingha</p>
                <p className="staff-title">Vetrinary Technision</p>
                <p className="staff-degree">BVSc (SL)</p>
            </div>

            <div className="staff-card">
                <div className="staff-img">
                    <img src={Receptionist} alt=""/>
                </div>
                <p className="staff-name">Ms. Saduni Perera</p>
                <p className="staff-title">Receptionist</p>
                <p className="staff-degree">CAP</p>
            </div>
                
        </div>    
    </div>
    )
}

export default About