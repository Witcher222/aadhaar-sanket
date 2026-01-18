
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingBarProps {
    isLoading: boolean;
    delay?: number; // ms to wait before showing
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ isLoading, delay = 1500 }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isLoading) {
            timer = setTimeout(() => {
                setShow(true);
            }, delay);
        } else {
            setShow(false);
        }

        return () => clearTimeout(timer);
    }, [isLoading, delay]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
                >
                    <div className="h-1 w-full bg-primary/20 overflow-hidden">
                        <div className="h-full bg-primary animate-progress-indeterminate origin-left" />
                    </div>
                    <div className="absolute top-2 right-4 bg-background/80 backdrop-blur text-xs font-medium px-2 py-1 rounded border shadow-sm">
                        Fetching latest analytics...
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
