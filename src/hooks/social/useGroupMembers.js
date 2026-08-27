
import { useState, useEffect } from 'react';
import { MOCK_GROUPS } from '../../data/socialMockData';

export const useGroupMembers = (groupId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    
    setLoading(true);
    setTimeout(() => {
      const group = MOCK_GROUPS.find(g => g.groupId === groupId);
      if (group) {
        setMembers(group.members || []);
      }
      setLoading(false);
    }, 500);
  }, [groupId]);

  const searchMembers = (query) => {
    if (!query) return members;
    return members.filter(m => 
      m.username.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filterMembers = (filters, memberList = members) => {
    return memberList.filter(m => {
      if (filters.role && filters.role !== 'all' && m.role !== filters.role) return false;
      if (filters.verified && !m.verified) return false;
      if (filters.online && m.status !== 'online') return false;
      return true;
    });
  };

  return { members, loading, searchMembers, filterMembers };
};
