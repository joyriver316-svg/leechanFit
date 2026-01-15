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
        price: '',
        description: ''
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                months: product.regMonths,
                price: product.price,
                description: product.description || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', months: '', price: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.months) {
            alert('상품명, 개월은 필수 항목입니다.');
            return;
        }

        const productData = {
            name: formData.name,
            reg_months: parseInt(formData.months),
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
            setFormData({ name: '', months: '', price: '', description: '' });
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

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                    <div
                        key={product.id}
                        className={`bg-white rounded-xl border shadow-sm p-5 ${product.active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-2">
                                <Package className={product.active ? 'text-blue-600' : 'text-gray-400'} size={24} />
                                <h3 className={`text-lg font-bold ${product.active ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {product.name}
                                </h3>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {product.active ? '활성' : '비활성'}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">기간:</span>
                                <span className="font-medium text-gray-900">{product.regMonths}개월</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">가격:</span>
                                <span className="font-bold text-blue-600">{formatPrice(product.price)}</span>
                            </div>
                            {product.description && (
                                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                    {product.description}
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleOpenModal(product)}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                            >
                                <Edit2 size={14} />
                                <span>수정</span>
                            </button>
                            <button
                                onClick={() => handleToggleStatus(product)}
                                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm ${product.active
                                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                                    }`}
                            >
                                <Power size={14} />
                                <span>{product.active ? '비활성' : '활성'}</span>
                            </button>
                            <button
                                onClick={() => handleDelete(product)}
                                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
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
                                    개월 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.months}
                                    onChange={(e) => setFormData({ ...formData, months: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="3"
                                    min="1"
                                />
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
