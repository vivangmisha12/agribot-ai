import React, { useEffect, useRef } from 'react';
import '../style.css'; // Ensure styles are available

const ScrollView = ({ children, className = "", autoScroll = false, dependency = [], onRefresh }) => {
    const scrollRef = useRef(null);
    const [pullY, setPullY] = React.useState(0);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const startY = useRef(0);
    const threshold = 80; // Pull distance to trigger refresh

    useEffect(() => {
        if (autoScroll && scrollRef.current && !isRefreshing) { // Don't auto-scroll while refreshing
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [autoScroll, isRefreshing, ...dependency]);

    const handleTouchStart = (e) => {
        if (scrollRef.current?.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
        } else {
            startY.current = 0;
        }
    };

    const handleTouchMove = (e) => {
        if (startY.current === 0 || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const delta = currentY - startY.current;

        // Only allow pulling down if at top
        if (delta > 0 && scrollRef.current.scrollTop === 0) {
            // Add resistance
            setPullY(delta * 0.5);
            // Prevent default browser refresh if possible (though passive listener might block this)
        } else {
            setPullY(0);
        }
    };

    const handleTouchEnd = async () => {
        if (pullY > threshold && onRefresh) {
            setIsRefreshing(true);
            setPullY(60); // Snap to loading position
            try {
                await onRefresh();
            } finally {
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullY(0);
                }, 500);
            }
        } else {
            setPullY(0);
        }
    };

    return (
        <div
            className="scroll-view-wrapper"
            style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Refresh Indicator */}
            <div
                className="pull-indicator"
                style={{
                    height: pullY + 'px',
                    opacity: pullY > 0 ? 1 : 0,
                    transition: isRefreshing ? 'height 0.3s ease' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
            >
                {isRefreshing ? (
                    <div className="spinner"></div>
                ) : (
                    <span style={{ transform: `rotate(${pullY * 2}deg)`, fontSize: '20px' }}>⬇️</span>
                )}
            </div>

            <div
                ref={scrollRef}
                className={`scroll-view ${className}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    transform: `translateY(${pullY * 0.3}px)`, // Slight parallax
                    transition: isRefreshing ? 'transform 0.3s ease' : 'none'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ScrollView;
