import React from 'react'
import Navbar from './components/navbar/Navbar'
import Hero from './components/hero/Hero'
import About from './components/about/About'
import Services from './components/services/Services'
import Testimonials from './components/testimonials/Testimonials'
import Contact from './components/contact/Contact'
import Title from './components/title/Title'
import Footer from './components/footer/Footer'

const Home = () => {
  return (
    <div>
        <>
        <Navbar />
        <Hero/>
        <div className="container">
            <Title title="About Us" subTitle="Get to know our clinic"/>
            <About/>
            <Title title="Our Services" subTitle="What we offer"/>
            <Services/>
            <Title title="Testimonials" subTitle="Real stories from our clients"/>
            <Testimonials/>
            <Title title="Contact Us" subTitle="We'd love to hear from you"/>
            <Contact/>
        </div>
        <Footer />
    </>
    </div>
  )
}

export default Home