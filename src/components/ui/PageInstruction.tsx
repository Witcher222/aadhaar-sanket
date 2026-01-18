import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, MousePointer2 } from 'lucide-react';

export const PageInstruction: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    // Check if user has dismissed it before in this session
    useEffect(() => {
        const dismissed = sessionStorage.getItem('page_instruction_dismissed');
        if (dismissed) setIsVisible(false);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('page_instruction_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-6 flex items-start gap-4 relative group">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary mt-0.5">
                            <Info className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pr-8">
                            <h4 className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                                Data Transparency Guide
                                <MousePointer2 className="w-3 h-3 animate-pulse" />
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Understanding our demographic intelligence is key. Click on the <strong>Details</strong> or <strong>Information</strong> icons ( <Info className="inline w-3 h-3 text-primary mx-0.5" /> ) next to any metric to view its underlying data sources, mathematical formulas, and AI-driven root cause analysis.
                            </p>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1 hover:bg-primary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
