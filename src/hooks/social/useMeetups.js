
import { useState, useEffect } from 'react';
import { MOCK_MEETUPS } from '../../data/socialMockData';

export const useMeetups = (meetupId) => { // Optional ID
  const [meetup, setMeetup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetupId) return;

    setLoading(true);
    setTimeout(() => {
        const found = MOCK_MEETUPS.find(m => m.meetupId === meetupId);
        setMeetup(found || null);
        setLoading(false);
    }, 600);
  }, [meetupId]);

  const updateRSVP = async (id, status) => {
      // Simulate API call
      console.log(`Updating RSVP for ${id} to ${status}`);
      if (meetup && meetup.meetupId === id) {
          // Optimistically update local state for demo
          // In reality we would refetch or update the list
          const updatedAttendees = meetup.attendees.map(a => 
              a.userId === 'user_current' ? { ...a, status } : a
          );
          // If user not in list, add them
          if (!updatedAttendees.find(a => a.userId === 'user_current')) {
             updatedAttendees.push({
                 userId: 'user_current',
                 username: 'Joe Traveler', // Mock
                 status
             });
          }
          setMeetup({ ...meetup, attendees: updatedAttendees });
      }
      return Promise.resolve(true);
  };

  return { meetup, loading, updateRSVP };
};

export const useGroupMeetups = (groupId) => {
    const [meetups, setMeetups] = useState([]);
    
    useEffect(() => {
        if(groupId) {
             const groupMeetups = MOCK_MEETUPS.filter(m => m.groupId === groupId);
             setMeetups(groupMeetups);
        }
    }, [groupId]);
    
    return { meetups };
}
