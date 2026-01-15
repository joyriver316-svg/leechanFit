import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MemberContext = createContext();

export function MemberProvider({ children }) {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMembers = useCallback(async () => {
        console.log('🔍 fetchMembers called');
        setIsLoading(true);
        try {
            console.log('📡 Fetching from /api/users/');
            const response = await fetch('/api/users/');
            console.log('📥 Response received:', response.status);
            if (!response.ok) throw new Error('회원 목록을 불러오는데 실패했습니다.');
            const data = await response.json();
            console.log('✅ Data received:', data);
            setMembers(data);
        } catch (err) {
            console.error('❌ Error fetching members:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        console.log('🚀 MemberProvider mounted, calling fetchMembers');
        fetchMembers();
    }, [fetchMembers]);

    const addMember = async (memberData) => {
        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memberData),
            });
            if (!response.ok) throw new Error('회원 추가에 실패했습니다.');
            const newMember = await response.json();
            setMembers(prev => [...prev, newMember]);
            return newMember;
        } catch (err) {
            console.error('Error adding member:', err);
            throw err;
        }
    };

    const updateMember = async (id, updates) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('회원 수정에 실패했습니다.');
            const updatedMember = await response.json();
            setMembers(prev => prev.map(member =>
                member.id === id ? updatedMember : member
            ));
            return updatedMember;
        } catch (err) {
            console.error('Error updating member:', err);
            throw err;
        }
    };

    const deleteMember = async (id) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '회원 삭제에 실패했습니다.');
            }
            setMembers(prev => prev.filter(member => member.id !== id));
        } catch (err) {
            console.error('Error deleting member:', err);
            throw err;
        }
    };

    const getMemberById = (id) => {
        return members.find(member => member.id === id);
    };

    const refreshMembers = () => {
        fetchMembers();
    };

    return (
        <MemberContext.Provider value={{
            members,
            isLoading,
            error,
            addMember,
            updateMember,
            deleteMember,
            getMemberById,
            refreshMembers
        }}>
            {children}
        </MemberContext.Provider>
    );
}

export function useMember() {
    const context = useContext(MemberContext);
    if (!context) {
        throw new Error('useMember must be used within MemberProvider');
    }
    return context;
}
