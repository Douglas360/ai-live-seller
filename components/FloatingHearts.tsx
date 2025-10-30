import React from 'react';

const FloatingHearts = () => {
    const heartCount = 15;

    return (
        <div className="absolute inset-0 pointer-events-none z-30">
            {Array.from({ length: heartCount }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 3 + 2}s`, // 2s to 5s
                    animationDelay: `${Math.random() * 3}s`,
                };

                return (
                    <div
                        key={i}
                        className="heart text-red-500 text-2xl"
                        style={style}
                    >
                        ❤️
                    </div>
                );
            })}
        </div>
    );
};

export default FloatingHearts;
