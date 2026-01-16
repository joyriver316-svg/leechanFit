import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Power } from 'lucide-react';
import { useMembershipProduct } from '../../contexts/MembershipProductContext';
import Toast from '../common/Toast';

export default function MembershipProductManagement() {
    const { products, addProduct, updateProduct, deleteProduct, toggleProductStatus } = useMembershipProduct();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        months: '',
        durationUnit: 'months',
        price: '',
        description: ''
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                months: product.regMonths,
                durationUnit: product.durationUnit || 'months',
                price: product.price,
                description: product.description || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', months: '', durationUnit: 'months', price: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.months) {
            alert('상품명, 기간은 필수 항목입니다.');
            return;
        }

        const productData = {
            name: formData.name,
            regMonths: parseInt(formData.months),
            durationUnit: formData.durationUnit,
            price: formData.price ? parseInt(formData.price) : 0,
            description: formData.description,
            active: editingProduct ? editingProduct.active : true
        };

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
                setToastMessage('✓ 상품 수정 완료');
            } else {
                await addProduct(productData);
                setToastMessage('✓ 상품 추가 완료');
            }

            setIsModalOpen(false);
            setFormData({ name: '', months: '', durationUnit: 'months', price: '', description: '' });
        } catch (error) {
            console.error('상품 저장 실패:', error);
            alert('상품 저장에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleDelete = async (product) => {
        if (confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) {
            try {
                await deleteProduct(product.id);
                setToastMessage('✓ 상품 삭제 완료');
            } catch (error) {
                console.error('상품 삭제 실패:', error);
                alert(error.message || '상품 삭제에 실패했습니다.');
            }
        }
    };

    const handleToggleStatus = async (product) => {
        try {
            await toggleProductStatus(product.id);
            setToastMessage(`✓ ${product.name} ${product.active ? '비활성화' : '활성화'} 완료`);
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경에 실패했습니다.');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">회원권 상품 관리</h2>
                    <p className="text-gray-500">회원권 상품을 추가, 수정, 삭제할 수 있습니다.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>상품 추가</span>
                </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 text-white">
                                <th className="px-4 py-3 text-sm font-bold w-24 text-center">상태</th>
                                <th className="px-4 py-3 text-sm font-bold">상품명</th>
                                <th className="px-4 py-3 text-sm font-bold">기간</th>
                                <th className="px-4 py-3 text-sm font-bold text-right">가격</th>
                                <th className="px-4 py-3 text-sm font-bold">설명</th>
                                <th className="px-4 py-3 text-sm font-bold w-32 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id} className={`hover:bg-blue-50/50 transition-colors ${!product.active ? 'bg-gray-50' : ''}`}>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${product.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {product.active ? '활성' : '비활성'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center space-x-2">
                                                <Package className={product.active ? 'text-blue-600' : 'text-gray-400'} size={20} />
                                                <span className={`font-medium ${product.active ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {product.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-gray-600">
                                            {product.regMonths}{product.durationUnit === 'days' ? '일' : '개월'}
                                        </td>
                                        <td className="p-3 text-right font-medium text-blue-600">
                                            {formatPrice(product.price)}
                                        </td>
                                        <td className="p-3 text-gray-500 text-sm max-w-md truncate">
                                            {product.description || '-'}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                                    title="수정"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`p-2 rounded-lg transition-colors ${product.active
                                                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                                                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                                                        }`}
                                                    title={product.active ? '비활성화' : '활성화'}
                                                >
                                                    <Power size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        등록된 상품이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="bg-blue-900 text-white p-4 flex justify-between items-center rounded-t-xl">
                            <h3 className="text-lg font-bold">
                                {editingProduct ? '상품 수정' : '상품 추가'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    상품명 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="예: 3개월권"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    기간 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        value={formData.months}
                                        onChange={(e) => setFormData({ ...formData, months: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="3"
                                        min="1"
                                    />
                                    <select
                                        value={formData.durationUnit}
                                        onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="months">개월</option>
                                        <option value="days">일</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    가격 (원)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="270000"
                                    step="1000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    설명
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="상품 설명을 입력하세요"
                                    rows="2"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold"
                                >
                                    {editingProduct ? '수정하기' : '추가하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage('')}
                />
            )}
        </div>
    );
}
