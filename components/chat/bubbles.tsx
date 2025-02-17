import React from 'react';
import styles from "../chat/chat.module.css";

const Bubbles: React.FC = () => {
    // Set the number of bubbles you want to render.
    const bubbleCount = 200; 

    return (
        <div className={styles.bottomParticles}>
            {Array.from({ length: bubbleCount }, (_, index) => (
                <div key={index} className={styles.bubble} />
            ))}
        </div>
    );
};

export default Bubbles;
