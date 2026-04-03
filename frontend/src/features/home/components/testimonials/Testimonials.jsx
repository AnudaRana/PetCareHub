import React, {useRef, useState} from 'react'
import './Testimonials.css'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import User1 from '../../../../assets/user1.jpg';
import User2 from '../../../../assets/user2.jpg';
import User3 from '../../../../assets/user3.jpg';
import User4 from '../../../../assets/user4.jpg';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const Testimonials = () => {

    const slider  = useRef();
    let tx = 0;

    const slideForward = () => {
        if(tx > -50){
            tx -= 25;
        } 
        slider.current.style.transform = `translateX(${tx}%)`;
    }

    const slideBackward = () => {
        if(tx < 0){
            tx += 25;
        }
        slider.current.style.transform = `translateX(${tx}%)`;
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) =>
            index < rating ? (
            <StarIcon key={index} className="star filled" />
            ) : (
            <StarBorderIcon key={index} className="star" />
            )
        );
    };

    return (
    <div className="testimonials">
        <h1 className="container-title"> Testimonials</h1>
        <ArrowBackIcon className='prev-btn' onClick={slideBackward}/>
        <ArrowForwardIcon className='next-btn' onClick={slideForward} />
        <div className="slider">
            <ul ref={slider}>
                <li>
                    <div className="slide">
                        <div className="user-info">
                            <img src={User1} alt="User 1"/>
                            <div>
                                <h3>Piyal Rathnapala</h3>
                                <span>Pugoda</span><br/>
                                <span>Pet: Rocky (3 years old Labrador)</span>
                            </div>
                        </div>
                        <div className="rating">
                            {renderStars(5)}
                        </div>
                        <p>Dr. Prasanna and his team saved my Rocky when he had a serious infection. They stayed late to treat him and monitored him 9pm, way past closing time. That's dedication I've never seen before. Forever grateful.</p>
                    </div>
                </li>

                <li>
                    <div className="slide">
                        <div className="user-info">
                            <img src={User2} alt="User 2"/>
                            <div>
                                <h3>Nimali Perera</h3>
                                <span>Kosgama</span><br/>
                                <span>Pet: Bella (8 yr old Persian Cat)</span>
                            </div>
                        </div>
                        <div className="rating">
                            {renderStars(5)}
                        </div>
                        <p>I was so nervous bringing my senior cat for dental surgery. Dr. Sanjeewani explained everything patiently and a staff member even called the next day to check on Bella. The facility is clean and the staff truly cares. Will definitely return.</p>
                    </div>
                </li>

                <li>
                    <div className="slide">
                        <div className="user-info">
                            <img src={User3} alt="User 3"/>
                            <div>
                                <h3>Ruwan Jayasinghe</h3>
                                <span>Avissawella</span><br/>
                                <span>Pet: Max (German Shepherd)</span>
                            </div>
                        </div>
                        <div className="rating">
                            {renderStars(5)}
                        </div>
                        <p>After three other vets couldn't figure out what was wrong with Max, Dr. Prasanna diagnosed his condition in minutes. Reasonably priced and genuinely passionate about animals.</p>
                    </div>    
                </li>

                <li>
                    <div className="slide">
                        <div className="user-info">
                            <img src={User4} alt="User 4"/>
                            <div>
                                <h3>Dilini Weerasinghe</h3>
                                <span>Hanwella</span><br/>
                                <span>Pet: Cookie (Rabbit) & Mithu (Parrot)</span>
                            </div>
                        </div>
                        <div className="rating">
                            {renderStars(5)}
                        </div>
                        <p>Not many vets treat exotic pets, but Pugoda Animal Hospital handled both my rabbit and parrot with expertise. They're gentle and knowledgeable. So happy to have found them!</p>
                    </div>               
                </li>
            </ul>
        </div>
    </div>
    )
    }

export default Testimonials