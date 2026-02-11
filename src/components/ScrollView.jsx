import React, { useEffect, useRef } from 'react';
import '../style.css'; // Ensure styles are available

const ScrollView = ({ children, className = "", autoScroll = false, dependency = [] }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [autoScroll, ...dependency]);

    return (
        <div
            ref={scrollRef}
            className={`scroll-view ${className}`}
        >
            {children}
        </div>
    );
};

export default ScrollView;
