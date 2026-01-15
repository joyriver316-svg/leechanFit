import React, { useState } from 'react';
import { X, MessageCircle, Phone, Copy, Check } from 'lucide-react';
import { getMessageTemplates } from '../../utils/churnDetection';

export default function EngagementMessageModal({ isOpen, onClose, member, daysSinceVisit, riskLevel = 'caution' }) {
    if (!isOpen || !member) return null;

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [copied, setCopied] = useState(false);
    const templates = getMessageTemplates(member.name, daysSinceVisit, riskLevel);

    const handleCopyMessage = (content) => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCall = () => {
        window.location.href = `tel:${member.phone}`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <MessageCircle size={24} />
                        <div>
                            <h3 className="text-lg font-bold">격려 메시지 보내기</h3>
                            <p className="text-sm text-blue-200">{member.name}님 ({daysSinceVisit}일째 미방문)</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Member Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">이름:</span>
                                <span className="ml-2 font-medium">{member.name}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">전화번호:</span>
                                <span className="ml-2 font-medium">{member.phone}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">마지막 방문:</span>
                                <span className="ml-2 font-medium text-red-600">{daysSinceVisit}일 전</span>
                            </div>
                            <div>
                                <span className="text-gray-600">회원권:</span>
                                <span className="ml-2 font-medium">{member.endDate}까지</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                        <button
                            onClick={handleCall}
                            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Phone size={18} />
                            <span>전화하기</span>
                        </button>
                    </div>

                    {/* Message Templates */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-3">메시지 템플릿</h4>
                        <div className="space-y-3">
                            {templates.map(template => (
                                <div
                                    key={template.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-bold text-gray-900">{template.title}</h5>
                                        {selectedTemplate?.id === template.id && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyMessage(template.content);
                                                }}
                                                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check size={14} />
                                                        <span>복사됨!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={14} />
                                                        <span>복사</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Custom Message */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">직접 작성</h4>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="직접 메시지를 작성하세요..."
                            rows="4"
                        />
                        <button
                            onClick={() => {
                                const textarea = document.querySelector('textarea');
                                if (textarea.value) {
                                    handleCopyMessage(textarea.value);
                                }
                            }}
                            className="mt-2 flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            <Copy size={14} />
                            <span>메시지 복사</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
