import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import GLOBE from 'vanta/dist/vanta.globe.min';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
    const vantaRef = useRef(null);

    useEffect(() => {
        const vantaEffect = GLOBE({
            el: vantaRef.current,
            THREE, // Pass THREE explicitly
            mouseControls: false,
            touchControls: false,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x9b5858,
            color2: 0x6d236,
            backgroundColor: 0xdedede,
            size: 0.9,
        });

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, []);

    return (
        <div className="landing" ref={vantaRef}>
            <div className="content">
                <h1>Course Buddy</h1>
                <h2>Your personal Course Registration recommendations!</h2>
                <div className="buttons">
                    <Link to="/login"><button className="btn">Login</button></Link>
                    <Link to="/signup"><button className="btn">Signup</button></Link>
                </div>
            </div>
        </div>
    );
}
