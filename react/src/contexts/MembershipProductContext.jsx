import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MembershipProductContext = createContext();

export function MembershipProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/products/');
            if (!response.ok) throw new Error('상품 목록을 불러오는데 실패했습니다.');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const addProduct = async (productData) => {
        try {
            const response = await fetch('/api/products/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });
            if (!response.ok) throw new Error('상품 추가에 실패했습니다.');
            const newProduct = await response.json();
            setProducts(prev => [...prev, newProduct]);
            return newProduct;
        } catch (err) {
            console.error('Error adding product:', err);
            throw err;
        }
    };

    const updateProduct = async (id, updates) => {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('상품 수정에 실패했습니다.');
            const updatedProduct = await response.json();
            setProducts(prev => prev.map(product =>
                product.id === id ? updatedProduct : product
            ));
            return updatedProduct;
        } catch (err) {
            console.error('Error updating product:', err);
            throw err;
        }
    };

    const deleteProduct = async (id) => {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '상품 삭제에 실패했습니다.');
            }
            setProducts(prev => prev.filter(product => product.id !== id));
        } catch (err) {
            console.error('Error deleting product:', err);
            throw err;
        }
    };

    const toggleProductStatus = async (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        try {
            await updateProduct(id, { ...product, active: !product.active });
        } catch (err) {
            console.error('Error toggling product status:', err);
            throw err;
        }
    };

    const getActiveProducts = () => {
        return products.filter(product => product.active);
    };

    const getProductById = (id) => {
        return products.find(product => product.id === id);
    };

    return (
        <MembershipProductContext.Provider value={{
            products,
            isLoading,
            error,
            addProduct,
            updateProduct,
            deleteProduct,
            toggleProductStatus,
            getActiveProducts,
            getProductById,
            refreshProducts: fetchProducts
        }}>
            {children}
        </MembershipProductContext.Provider>
    );
}

export function useMembershipProduct() {
    const context = useContext(MembershipProductContext);
    if (!context) {
        throw new Error('useMembershipProduct must be used within MembershipProductProvider');
    }
    return context;
}
