import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message, onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
            <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]">
                <CheckCircle size={20} className="flex-shrink-0" />
                <span className="flex-1 font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:bg-green-700 rounded p-1 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
