import React from 'react'
import './Services.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcaseMedical, faBedPulse, faMicroscope, faUserDoctor, faBowlFood, faPrescriptionBottleMedical, faXRay, faPaw} from '@fortawesome/free-solid-svg-icons'

const Services = () => {
  return (
    <div className="services">
        <div className="service-container">

            <div className="services-row">
                <div className="service-item">
                    <FontAwesomeIcon icon={faBriefcaseMedical} className="service-icon"/>
                    <h3>Medicine and Treatment</h3>
                    <p>Diagnosis, treatments, prescriptions and preventive measures.</p>
                </div>

                <div className="service-item">
                    <FontAwesomeIcon icon={faBedPulse} className="service-icon"/>
                    <h3>Surgeries</h3>
                    <p>Routine and specialized surgical procedures with post-operative care</p>
                </div>

                <div className="service-item">
                    <FontAwesomeIcon icon={faMicroscope} className="service-icon"/>
                    <h3>Laboratory</h3>
                    <p>Comprehensive blood work and urinalysis</p>
                </div>

                <div className="service-item">
                    <FontAwesomeIcon icon={faUserDoctor} className="service-icon"/>
                    <h3>Counseling</h3>
                    <p>Professional guidance for health concerns and treatment plans</p>
                </div>
            </div>

            <div className="services-row">
                <div className="service-item">
                    <FontAwesomeIcon icon={faBowlFood} className="service-icon"/>
                    <h3>Food and Accessories</h3>
                    <p>Pet food, prescription diets and various accessories</p>
                </div>

                <div className="service-item">
                    <FontAwesomeIcon icon={faPrescriptionBottleMedical} className="service-icon"/>
                    <h3>Pharmacy</h3>
                    <p>Dispensing prescribed medications and oinments</p>
                </div>

                <div className="service-item">
                    <FontAwesomeIcon icon={faXRay} className="service-icon"/>
                    <h3>Scan</h3>
                    <p>3D ultrasound imaging for accurate diagnosis</p>
                </div>

                <div className="service-item">
                    <FontAwesomeIcon icon={faPaw} className="service-icon"/>
                    <h3>Post Mortem</h3>
                    <p>Post mortem examinations to determine cause of passing</p>
                </div>
            </div>

        </div>
</div>
  )
}

export default Services