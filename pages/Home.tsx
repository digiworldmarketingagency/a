import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Modal } from '../components/Shared';
import { store } from '../services/store';

const Home: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [search, setSearch] = useState({ title: '', location: '', category: '' });
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Filter only upcoming events for home page
  const events = store.getEvents()
    .filter(e => new Date(e.date) > new Date())
    .slice(0, 3);
    
  const recentJobs = store.getJobs().slice(0, 4);
  const blogs = store.getBlogs().slice(0, 3);
  const successStories = store.getSuccessStories();
  const creatives = store.getGallery();

  const activeBanners = store.getBanners().filter(b => b.isActive);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handleFindJobs = () => {
    // Save search criteria to store so JobBoard can read it
    store.setSearchCriteria(search);
    onNavigate('jobboard');
  };

  return (
    <div>
      {/* Banner Carousel Section */}
      {activeBanners.length > 0 && (
          <div className={`relative h-64 overflow-hidden transition-colors duration-500 ${activeBanners[currentBannerIndex].style}`}>
             <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                 <div className={`max-w-4xl ${activeBanners[currentBannerIndex].style.includes('text-gray-900') ? 'text-gray-900' : 'text-white'}`}>
                     <h2 className="text-4xl font-bold mb-4 drop-shadow-md transition-all duration-500 transform translate-y-0 opacity-100">
                         {activeBanners[currentBannerIndex].title}
                     </h2>
                     <p className="text-xl mb-6 drop-shadow opacity-90">
                         {activeBanners[currentBannerIndex].description}
                     </p>
                     <Button 
                        onClick={() => onNavigate(activeBanners[currentBannerIndex].link.replace('/', ''))}
                        className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-3 rounded-full shadow-lg"
                     >
                         {activeBanners[currentBannerIndex].buttonText}
                     </Button>
                 </div>
             </div>
             {/* Indicators */}
             {activeBanners.length > 1 && (
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                     {activeBanners.map((_, idx) => (
                         <button 
                            key={idx} 
                            onClick={() => setCurrentBannerIndex(idx)}
                            className={`w-3 h-3 rounded-full ${idx === currentBannerIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'} transition-all`}
                         ></button>
                     ))}
                 </div>
             )}
          </div>
      )}

      {/* Hero Section */}
      <div 
        className="relative h-[550px] flex items-center justify-center bg-cover"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
          backgroundPosition: 'center 20%' // Ensures faces are not cut off at the top
        }}
      >
        {/* Background Overlay Tint */}
        <div className="absolute inset-0 bg-blue-900/60 pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 w-full flex flex-col items-center z-10">
           <div className="text-white mb-10 text-center max-w-4xl drop-shadow-md">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                  15+ Years of Connecting Talent <br/>
                  <span className="text-accent">with Opportunity across India!</span>
              </h1>
              <p className="text-lg text-gray-100 mb-2 font-light">Your gateway to a brighter professional future.</p>
           </div>
           
           <div className="w-full max-w-5xl">
               {/* Search Box - Sleek & Horizontal */}
               <div className="bg-white rounded-lg shadow-2xl p-2 md:p-3 flex flex-col md:flex-row gap-2 items-center">
                   <div className="w-full md:flex-1">
                     <Input 
                        placeholder="Job Title, Keywords, or Company" 
                        value={search.title} 
                        onChange={(e) => setSearch({...search, title: e.target.value})} 
                        containerClassName="mb-0" 
                        className="border-0 bg-gray-50 focus:bg-white h-12 rounded-md"
                     />
                   </div>
                   <div className="w-full md:flex-1">
                     <Input 
                        placeholder="City or Pincode" 
                        value={search.location} 
                        onChange={(e) => setSearch({...search, location: e.target.value})} 
                        containerClassName="mb-0" 
                        className="border-0 bg-gray-50 focus:bg-white h-12 rounded-md"
                     />
                   </div>
                   <div className="w-full md:w-48">
                     <Select 
                        options={['IT', 'Marketing', 'Finance', 'HR', 'Sales']} 
                        value={search.category} 
                        onChange={(e) => setSearch({...search, category: e.target.value})} 
                        containerClassName="mb-0" 
                        className="border-0 bg-gray-50 focus:bg-white h-12 rounded-md"
                     />
                   </div>
                   <Button 
                     className="w-full md:w-auto h-12 px-8 text-lg bg-primary hover:bg-teal-700 shadow-md whitespace-nowrap" 
                     onClick={handleFindJobs}
                   >
                     Find Jobs
                   </Button>
               </div>
               
               {/* Get Started Button - Left Aligned below Search Box */}
               <div className="mt-6 flex justify-start">
                   <Button 
                      onClick={() => onNavigate('register-candidate')} 
                      className="px-8 py-3 text-lg bg-accent hover:bg-orange-600 text-white shadow-xl rounded-full transform transition hover:-translate-y-1"
                   >
                      Get Started <i className="fas fa-arrow-right ml-2"></i>
                   </Button>
               </div>
           </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between text-center gap-8">
          <div className="flex-1 min-w-[150px]">
            <div className="text-4xl font-extrabold text-primary mb-1">10k+</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Jobs Posted</div>
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-4xl font-extrabold text-primary mb-1">500+</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Companies</div>
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-4xl font-extrabold text-primary mb-1">50k+</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Candidates</div>
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-4xl font-extrabold text-primary mb-1">100+</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Events</div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Carousel */}
      <div className="py-16 max-w-7xl mx-auto px-4 bg-gray-50">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
           <Button variant="outline" onClick={() => onNavigate('events')}>View All Events</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? events.map(ev => (
            <Card key={ev.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="overflow-hidden h-48 relative">
                 <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                 <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow text-xs font-bold text-gray-800">
                    {new Date(ev.date).toLocaleDateString()}
                 </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-primary group-hover:text-teal-700">{ev.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ev.description}</p>
                <div className="flex items-center text-xs text-gray-500 mb-4">
                   <i className="fas fa-map-marker-alt mr-1"></i> {ev.location}
                </div>
                <Button variant="secondary" className="w-full">Register</Button>
              </div>
            </Card>
          )) : <p>No upcoming events.</p>}
        </div>
      </div>

      {/* Creative Gallery */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creatives.map(c => (
              <div 
                key={c.id} 
                className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-gray-200"
                onClick={() => setLightboxImg(c.url)}
              >
                <img src={c.url} alt={c.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                {c.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                     <i className="fas fa-play-circle text-white text-4xl opacity-80 drop-shadow-lg"></i>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Jobs */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Jobs</h2>
             <p className="text-gray-500">Explore opportunities from top employers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentJobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-transparent hover:border-primary">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.company} className="w-16 h-16 object-contain rounded-md border border-gray-100 p-1" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border border-gray-200">
                        <i className="fas fa-building text-2xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-primary">{job.title}</h3>
                        <p className="font-medium text-gray-700">{job.company}</p>
                      </div>
                      <Button variant="outline" onClick={() => onNavigate('jobboard')} className="mt-4 sm:mt-0 text-sm py-1 px-3">Apply</Button>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                      <span><i className="fas fa-map-marker-alt mr-1"></i> {job.location}</span>
                      <span><i className="fas fa-briefcase mr-1"></i> {job.category}</span>
                      <span><i className="fas fa-clock mr-1"></i> {job.postedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
             <Button onClick={() => onNavigate('jobboard')} className="px-8">View All Jobs</Button>
          </div>
        </div>
      </div>

      {/* Blog Feed */}
      <div className="py-16 max-w-7xl mx-auto px-4">
         <h2 className="text-3xl font-bold text-gray-800 mb-8">Latest from Our Blog</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-lg transition-shadow">
                 <div className="text-xs text-primary font-bold uppercase mb-2">Career Advice</div>
                 <h3 className="font-bold text-xl mb-3">{blog.title}</h3>
                 <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.content}</p>
                 <button className="text-accent font-medium text-sm hover:underline">Read More <i className="fas fa-arrow-right ml-1"></i></button>
              </div>
            ))}
         </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-teal-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map(story => (
              <div key={story.id} className="bg-teal-800 p-8 rounded-lg shadow-lg relative">
                <i className="fas fa-quote-left text-teal-600 text-4xl absolute top-4 left-4 opacity-30"></i>
                <p className="text-teal-100 italic mb-6 z-10 relative">"{story.comment}"</p>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-3 overflow-hidden">
                     <img src={story.imageUrl} alt={story.name} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">{story.name}</div>
                    <div className="text-xs text-teal-300">{story.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
           <button className="absolute top-4 right-4 text-white text-4xl" onClick={() => setLightboxImg(null)}>&times;</button>
           <img src={lightboxImg} alt="Lightbox" className="max-w-full max-h-screen rounded" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default Home;