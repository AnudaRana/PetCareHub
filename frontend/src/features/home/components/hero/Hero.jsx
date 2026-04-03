import React from 'react'
import './Hero.css'
import { Link } from 'react-scroll'
import Logo from '../../../../assets/logo-b.png'
import HeroImgDog from '../../../../assets/dog-hero.jpg'
import KeyboardDoubleArrowDownSharpIcon from '@mui/icons-material/KeyboardDoubleArrowDownSharp';

const Hero = () => {
  return (
    <div className="hero">
        <div className="hero-text">
          <img src={Logo} alt="" className="logo-img"/>
          <h1>Welcome To<br />
            <span>Pugoda Animal Hospital</span>
          </h1>
          <p>Trust our experienced veterinary team to provide the highest quality care for your cherished companions. We believe every pet deserves treatment delivered with genuine compassion and kindness.</p>
          <Link to='services' smooth={true} offset={-260} duration={500}><button className="btn btn-white">Explore More <KeyboardDoubleArrowDownSharpIcon sx={{color: 'black' }}/></button></Link>
        </div>

        <div className="hero-right">
            <img src={HeroImgDog} alt="" className="dog-img"/>
        </div>
    </div>
  )
}

export default Hero