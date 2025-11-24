import React from 'react'
import Hero from "../components/Hero.jsx";
import LatestListing from "../components/LatestListing.jsx";
import PricingPlans from "../components/PricingPlans.jsx";
import Cta from "../components/CTA.jsx";
import Footer from "../components/Footer.jsx";

const Home = () => {
    return (
        <div>
            <Hero />
            <LatestListing />
            <PricingPlans />
            <Cta />
            <Footer />
        </div>
    )
}
export default Home
