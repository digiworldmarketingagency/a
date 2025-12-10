import React, { useState } from 'react';
import { store } from '../services/store';
import { Card, Button, Select } from '../components/Shared';

const Events: React.FC = () => {
  const [filter, setFilter] = useState<'UPCOMING' | 'PAST' | 'ALL'>('UPCOMING');
  const allEvents = store.getEvents();

  const filteredEvents = allEvents.filter(ev => {
    const eventDate = new Date(ev.date);
    const today = new Date();
    if (filter === 'UPCOMING') return eventDate >= today;
    if (filter === 'PAST') return eventDate < today;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Events</h1>
        <div className="w-64 mt-4 md:mt-0">
          <Select 
            options={['UPCOMING', 'PAST', 'ALL']} 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)} 
            label="Filter Events"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredEvents.length > 0 ? filteredEvents.map(ev => (
          <div key={ev.id} className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row ${new Date(ev.date) < new Date() ? 'opacity-75 grayscale' : ''}`}>
            <img src={ev.imageUrl} alt={ev.title} className="md:w-48 object-cover h-48 md:h-auto" />
            <div className="p-6 flex flex-col justify-between flex-1">
               <div>
                  <div className={`font-bold text-sm uppercase tracking-wide mb-1 ${new Date(ev.date) < new Date() ? 'text-gray-500' : 'text-accent'}`}>
                    {new Date(ev.date) < new Date() ? 'Completed' : 'Upcoming'} • {ev.date}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{ev.title}</h3>
                  <div className="text-gray-500 text-sm mb-4"><i className="fas fa-map-marker-alt mr-2"></i>{ev.location}</div>
                  <p className="text-gray-600 text-sm">{ev.description}</p>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  {new Date(ev.date) >= new Date() ? (
                     <Button>Register</Button>
                  ) : (
                     <Button variant="outline" disabled>View Recap</Button>
                  )}
               </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg">
             <p className="text-gray-500">No events found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;