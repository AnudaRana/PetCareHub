import React, { useEffect, useState } from 'react'
import { Link as SLink } from 'react-scroll'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../auth/contexts/AuthContext'
import './Navbar.css'
import logo from '../../../../assets/logo-weyes.png'
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';


const Navbar = () => {
  const { user } = useAuth();
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      window.scrollY > 50 ? setSticky(true) : setSticky(false);
    })
  }, []);

  const [mobileMenu, setMobileMenu] = useState(false);
  const toggleMenu = () => {
    mobileMenu ? setMobileMenu(false) : setMobileMenu(true);
  };


  return (
    <nav className={`container ${sticky ? 'dark-nav' : ''}`}>
      <img src={logo} alt="" className="logo" />
      <ul className={mobileMenu ? '' : 'hide-mobile-menu'}>
        <li><SLink to='hero' smooth={true} offset={0} duration={500}>Home</SLink></li>
        <li><SLink to='about' smooth={true} offset={-240} duration={500}>About Us</SLink></li>
        <li><SLink to='services' smooth={true} offset={-290} duration={500}>Services</SLink></li>
        <li><SLink to='testimonials' smooth={true} offset={-260} duration={500}>Testimonials</SLink></li>
        <li><SLink to='contact' smooth={true} offset={-260} duration={500}>Contact Us</SLink></li>
        <li><Link to='/store'>Shop</Link></li>
        <li>
          {user ? (
            <Link to='/dashboard' className="profile-pill-link">
              <span>Hi, {user.fullName ? user.fullName.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'User')}!</span>
              <button className="btn btn-teal navbar-profile-btn">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="profile-btn-avatar" />
                ) : (
                  <PersonIcon className="profile-btn-icon" />
                )}
              </button>
            </Link>
          ) : (
            <Link to='/login'>
              <button className="btn btn-teal">Login</button>
            </Link>
          )}
        </li>
      </ul>
      <MenuIcon className='menu-icon' onClick={toggleMenu} />
    </nav>
  )
}

export default Navbar