import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, trend }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}
