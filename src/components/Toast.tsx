"use client";

import { useToastStore } from "@/store/useToastStore";
import { Check, AlertCircle, Info, X, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        className="toast"
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    >
                        <div className="toast-icon-wrapper">
                            {toast.type === 'success' && <Check size={18} color="var(--corewave-cyan)" />}
                            {toast.type === 'error' && <AlertCircle size={18} color="var(--corewave-pink)" />}
                            {toast.type === 'info' && <Info size={18} color="var(--corewave-blue)" />}
                        </div>
                        <span className="toast-message">{toast.message}</span>
                        <button
                            className="toast-close"
                            onClick={() => removeToast(toast.id)}
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
