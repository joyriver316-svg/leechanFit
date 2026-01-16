import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit2 } from 'lucide-react';
import { useMembershipProduct } from '../../contexts/MembershipProductContext';

export default function MemberRegistrationModal({ isOpen, onClose, onSubmit, editingMember }) {
    if (!isOpen) return null;

    const { getActiveProducts } = useMembershipProduct();
    const activeProducts = getActiveProducts();

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        phone: '',
        productId: '',
        regMonths: '',
        durationUnit: 'months',
        price: '',
        regDate: new Date().toISOString().split('T')[0], // Default to today
        startDate: '',
        endDate: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    // Populate form when editing
    useEffect(() => {
        if (editingMember) {
            setFormData({
                name: editingMember.name || '',
                gender: editingMember.gender || '',
                phone: editingMember.phone || '',
                productId: editingMember.productId || '',
                regMonths: editingMember.regMonths || '',
                durationUnit: editingMember.durationUnit || 'months',
                price: editingMember.price || '',
                startDate: editingMember.startDate || '',
                notes: editingMember.notes || ''
            });
        } else {
            setFormData({
                name: '',
                gender: '',
                phone: '',
                productId: '',
                regMonths: '',
                durationUnit: 'months',
                price: '',
                regDate: new Date().toISOString().split('T')[0],
                startDate: '',
                endDate: '',
                notes: ''
            });
        }
        setErrors({});
    }, [editingMember, isOpen]);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });

        // Auto-fill months and price when product is selected
        if (field === 'productId' && value) {
            if (product) {
                setFormData(prev => ({
                    ...prev,
                    productId: value,
                    regMonths: product.regMonths, // Changed from product.months (backend sends regMonths)
                    durationUnit: product.durationUnit || 'months',
                    price: product.price
                }));
            }
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const calculateEndDate = (startDate, months, unit = 'months') => {
        if (!startDate || !months || months === 0) return '';
        const start = new Date(startDate);

        if (unit === 'days') {
            start.setDate(start.getDate() + parseInt(months));
        } else {
            start.setMonth(start.getMonth() + parseInt(months));
        }

        return start.toISOString().split('T')[0];
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = '이름을 입력해주세요.';
        }

        if (!formData.gender) {
            newErrors.gender = '성별을 선택해주세요.';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = '전화번호를 입력해주세요.';
        } else if (!/^\d{3}-\d{4}-\d{4}$/.test(formData.phone)) {
            newErrors.phone = '전화번호 형식: 010-1234-5678';
        }

        if (!formData.productId) {
            newErrors.productId = '회원권 상품을 선택해주세요.';
        }

        if (!formData.startDate) {
            newErrors.startDate = '시작일을 선택해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const endDate = formData.endDate || calculateEndDate(formData.startDate, formData.regMonths, formData.durationUnit);

        onSubmit({
            ...formData,
            endDate: endDate || null, // Allow null for FPT
            regDate
        });

        // Reset form
        setFormData({
            name: '',
            gender: '',
            phone: '',
            productId: '',
            regMonths: '',
            durationUnit: 'months',
            price: '',
            startDate: '',
            notes: ''
        });
        setErrors({});
    };

    const handlePhoneChange = (value) => {
        // Auto-format phone number
        const numbers = value.replace(/\D/g, '');
        let formatted = numbers;

        if (numbers.length > 3 && numbers.length <= 7) {
            formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else if (numbers.length > 7) {
            formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        }

        handleChange('phone', formatted);
    };

    const endDate = calculateEndDate(formData.startDate, formData.regMonths);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        {editingMember ? <Edit2 size={24} /> : <UserPlus size={24} />}
                        <h3 className="text-lg font-bold">{editingMember ? '회원 수정' : '회원 등록'}</h3>
                    </div>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="홍길동"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            성별 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="남"
                                    checked={formData.gender === '남'}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>남</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="여"
                                    checked={formData.gender === '여'}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>여</span>
                            </label>
                        </div>
                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            전화번호 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="010-1234-5678"
                            maxLength="13"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Product Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            회원권 상품 <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.productId}
                            onChange={(e) => handleChange('productId', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.productId ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">선택하세요</option>
                            {activeProducts.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {new Intl.NumberFormat('ko-KR').format(product.price)}원
                                </option>
                            ))}
                        </select>
                        {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId}</p>}
                        {formData.productId && (
                            <p className="text-xs text-gray-500 mt-1">
                                기간: {formData.regMonths}{formData.durationUnit === 'days' ? '일' : '개월'}
                            </p>
                        )}
                    </div>

                    {/* Registration Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            접수일 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.regDate}
                            onChange={(e) => handleChange('regDate', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            시작일 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.startDate ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                    </div>


                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            종료일 <span className="text-gray-400 text-xs">(선택사항 - FPT는 비워두세요)</span>
                        </label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {formData.startDate && formData.regMonths > 0 && !formData.endDate && (
                            <p className="text-xs text-blue-600 mt-1">
                                자동 계산: {calculateEndDate(formData.startDate, formData.regMonths, formData.durationUnit)}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            비고
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="특이사항이나 메모를 입력하세요"
                            rows="3"
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold"
                        >
                            {editingMember ? '수정하기' : '등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
