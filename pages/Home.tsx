import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Modal } from '../components/Shared';
import { store } from '../services/store';
import { SuccessStory } from '../types';

const Home: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [search, setSearch] = useState({ title: '', location: '', category: '' });
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [stats, setStats] = useState(store.getStats());
  
  // Success Story Modal State
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);

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

  // Popular Jobs State
  const [popularFilter, setPopularFilter] = useState('All');
  const popularJobsData = [
    { id: 'p1', title: 'Junior Graphic Designer (Web)', featured: true, categories: ['Design', 'Development'], location: 'New York', salary: '$150 - $180 / week', type: 'Full Time', urgent: true, logo: 'O', color: 'bg-blue-600' },
    { id: 'p2', title: 'Finance Manager & Health', featured: true, categories: ['Design', 'Health'], location: 'New York', salary: '$450 - $500 / month', type: 'Full Time', urgent: true, logo: 'M', color: 'bg-gray-900' },
    { id: 'p3', title: 'General Ledger Accountant', featured: true, categories: ['Design', 'Marketing'], location: 'New York', salary: '$50 - $68 / day', type: 'Full Time', urgent: false, logo: 'Up', color: 'bg-green-500' },
    { id: 'p4', title: 'UX/UI Designer Web', featured: false, categories: ['Design', 'Development'], location: 'Paris', salary: '$650 - $700 / month', type: 'Freelance', urgent: false, logo: 'M', color: 'bg-pink-600' },
    { id: 'p5', title: 'Senior Product Designer', featured: false, categories: ['Design'], location: 'New York', salary: '$250 - $300 / month', type: 'Part Time', urgent: true, logo: 'S', color: 'bg-indigo-600' },
    { id: 'p6', title: 'Data Privacy Support', featured: false, categories: ['Customer', 'Design'], location: 'London', salary: '$300 - $500 / month', type: 'Full Time', urgent: false, logo: 'M', color: 'bg-gray-900' },
  ];

  const filteredPopularJobs = popularJobsData.filter(job => 
    popularFilter === 'All' || job.categories.includes(popularFilter)
  );

  // Top Companies Carousel State
  const [companyPage, setCompanyPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  
  const topCompanies = [
    { id: 'c1', name: 'Employer', location: 'New York', openJobs: 1, logo: 'O', bg: 'bg-blue-500', text: 'text-white' },
    { id: 'c2', name: 'Udemy', location: 'New York', openJobs: 1, logo: 'U', bg: 'bg-red-50', text: 'text-red-500' },
    { id: 'c3', name: 'Medium', location: 'New York', openJobs: 3, logo: 'M', bg: 'bg-black', text: 'text-white' },
    { id: 'c4', name: 'Sagments', location: 'New York', openJobs: 2, logo: 'S', bg: 'bg-slate-800', text: 'text-green-400' },
    { id: 'c5', name: 'Google', location: 'Mountain View', openJobs: 5, logo: 'G', bg: 'bg-blue-100', text: 'text-blue-600' },
    { id: 'c6', name: 'Amazon', location: 'Seattle', openJobs: 8, logo: 'A', bg: 'bg-yellow-100', text: 'text-yellow-600' },
    { id: 'c7', name: 'Microsoft', location: 'Redmond', openJobs: 4, logo: 'M', bg: 'bg-green-100', text: 'text-green-600' },
    { id: 'c8', name: 'Apple', location: 'Cupertino', openJobs: 2, logo: 'A', bg: 'bg-gray-100', text: 'text-gray-800' },
  ];

  const allCompanies = [
    ...topCompanies,
    { id: 'c9', name: 'Netflix', location: 'Los Gatos', openJobs: 3, logo: 'N', bg: 'bg-red-600', text: 'text-white' },
    { id: 'c10', name: 'Tesla', location: 'Austin', openJobs: 6, logo: 'T', bg: 'bg-red-500', text: 'text-white' },
    { id: 'c11', name: 'Adobe', location: 'San Jose', openJobs: 4, logo: 'A', bg: 'bg-red-700', text: 'text-white' },
    { id: 'c12', name: 'Salesforce', location: 'San Francisco', openJobs: 7, logo: 'S', bg: 'bg-blue-400', text: 'text-white' },
    { id: 'c13', name: 'Spotify', location: 'Stockholm', openJobs: 2, logo: 'S', bg: 'bg-green-500', text: 'text-white' },
    { id: 'c14', name: 'Twitter', location: 'San Francisco', openJobs: 1, logo: 'T', bg: 'bg-blue-400', text: 'text-white' },
    { id: 'c15', name: 'Airbnb', location: 'San Francisco', openJobs: 3, logo: 'A', bg: 'bg-rose-500', text: 'text-white' },
    { id: 'c16', name: 'Uber', location: 'San Francisco', openJobs: 5, logo: 'U', bg: 'bg-black', text: 'text-white' },
  ];

  const totalCompanyPages = Math.ceil(topCompanies.length / itemsPerPage);
  const visibleCompanies = topCompanies.slice(companyPage * itemsPerPage, (companyPage + 1) * itemsPerPage);

  useEffect(() => {
    // Banner Interval
    let interval: any;
    if (activeBanners.length > 1) {
        interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
        }, 5000);
    }

    // Responsive Carousel Logic
    const handleResize = () => {
        if (window.innerWidth < 640) setItemsPerPage(1);
        else if (window.innerWidth < 1024) setItemsPerPage(2);
        else setItemsPerPage(4);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
    };
  }, [activeBanners.length]);

  const handleFindJobs = () => {
    // Save search criteria to store so JobBoard can read it
    store.setSearchCriteria(search);
    onNavigate('jobboard');
  };

  return (
    <div>
      {/* Banner Carousel Section - Increased Size */}
      {activeBanners.length > 0 && (
          <div className={`relative h-[450px] overflow-hidden transition-colors duration-500 ${activeBanners[currentBannerIndex].style}`}>
             <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                 <div className={`max-w-5xl ${activeBanners[currentBannerIndex].style.includes('text-gray-900') ? 'text-gray-900' : 'text-white'}`}>
                     <h2 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-md transition-all duration-500 transform translate-y-0 opacity-100">
                         {activeBanners[currentBannerIndex].title}
                     </h2>
                     <p className="text-2xl md:text-3xl mb-8 drop-shadow opacity-90 font-light">
                         {activeBanners[currentBannerIndex].description}
                     </p>
                     <Button 
                        onClick={() => onNavigate(activeBanners[currentBannerIndex].link.replace('/', ''))}
                        className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-10 py-4 text-lg rounded-full shadow-lg transform transition hover:scale-105"
                     >
                         {activeBanners[currentBannerIndex].buttonText}
                     </Button>
                 </div>
             </div>
             {/* Indicators */}
             {activeBanners.length > 1 && (
                 <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
                     {activeBanners.map((_, idx) => (
                         <button 
                            key={idx} 
                            onClick={() => setCurrentBannerIndex(idx)}
                            className={`w-3 h-3 rounded-full ${idx === currentBannerIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'} transition-all shadow-sm`}
                         ></button>
                     ))}
                 </div>
             )}
          </div>
      )}

      {/* Hero Section - Reduced Width */}
      <div className="relative h-[500px] flex items-center justify-center bg-blue-900">
        <div className="relative max-w-5xl mx-auto px-4 w-full flex flex-col items-center z-10">
           <div className="text-white mb-10 text-center max-w-4xl drop-shadow-md">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                  15+ Years of Connecting Talent <br/>
                  <span className="text-accent">with Opportunity across India!</span>
              </h1>
              <p className="text-lg text-gray-200 mb-2 font-light">Your gateway to a brighter professional future.</p>
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

      {/* New 3-Column Section (Employers, Candidates, Resume Assistant) */}
      <div className="bg-white py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Employers Card */}
                <div className="bg-gray-500 rounded-xl h-64 relative overflow-hidden group flex items-center shadow-lg transition-transform hover:-translate-y-1">
                   <div className="absolute right-0 top-0 bottom-0 w-1/2">
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Employers" className="h-full w-full object-cover opacity-60 group-hover:opacity-75 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-500"></div>
                   </div>
                   <div className="relative z-10 p-8 w-2/3">
                      <h3 className="text-2xl font-bold text-white mb-2">Employers</h3>
                      <p className="text-white text-sm mb-4 opacity-90 leading-snug">Find the best talent for your company with our advanced hiring tools.</p>
                      <Button onClick={() => onNavigate('register-corporate')} className="bg-white text-gray-800 hover:bg-gray-100 text-sm px-4 py-2 border-0 font-bold shadow-sm">Register Account</Button>
                   </div>
                </div>

                {/* Candidate Card */}
                <div className="bg-rose-400 rounded-xl h-64 relative overflow-hidden group flex items-center shadow-lg transition-transform hover:-translate-y-1">
                   <div className="absolute right-0 top-0 bottom-0 w-1/2">
                       <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400" alt="Candidates" className="h-full w-full object-cover opacity-60 group-hover:opacity-75 transition-opacity" />
                       <div className="absolute inset-0 bg-gradient-to-l from-transparent to-rose-400"></div>
                   </div>
                   <div className="relative z-10 p-8 w-2/3">
                      <h3 className="text-2xl font-bold text-white mb-2">Candidate</h3>
                      <p className="text-white text-sm mb-4 opacity-90 leading-snug">Register today to find your dream job and boost your career.</p>
                      <Button onClick={() => onNavigate('register-candidate')} className="bg-white text-rose-500 hover:bg-gray-100 text-sm px-4 py-2 border-0 font-bold shadow-sm">Register Account</Button>
                   </div>
                </div>

                {/* Resume Assistant Card */}
                 <div className="bg-teal-600 rounded-xl h-64 relative overflow-hidden group flex items-center shadow-lg transition-transform hover:-translate-y-1">
                   <div className="absolute right-0 top-0 bottom-0 w-1/2">
                       <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400" alt="Resume" className="h-full w-full object-cover opacity-60 group-hover:opacity-75 transition-opacity" />
                       <div className="absolute inset-0 bg-gradient-to-l from-transparent to-teal-600"></div>
                   </div>
                   <div className="relative z-10 p-8 w-2/3">
                      <h3 className="text-2xl font-bold text-white mb-2">Resume Assistant</h3>
                      <p className="text-white text-sm mb-4 opacity-90 leading-snug">Build an ATS-friendly resume in minutes with our AI tool.</p>
                      <Button onClick={() => onNavigate('resources')} className="bg-white text-teal-600 hover:bg-gray-100 text-sm px-4 py-2 border-0 font-bold shadow-sm">Build Resume</Button>
                   </div>
                </div>
            </div>
        </div>
      </div>

      {/* Stats Bar - Clickable & Dynamic */}
      <div className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between text-center gap-8">
          <div 
             className="flex-1 min-w-[150px] cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors group"
             onClick={() => onNavigate('jobboard')}
          >
            <div className="text-4xl font-extrabold text-primary mb-1 group-hover:scale-110 transition-transform">{stats.jobsPosted}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide group-hover:text-primary">Jobs Posted</div>
          </div>
          <div 
             className="flex-1 min-w-[150px] cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors group"
             onClick={() => setShowAllCompanies(true)}
          >
            <div className="text-4xl font-extrabold text-primary mb-1 group-hover:scale-110 transition-transform">{stats.companies}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide group-hover:text-primary">Companies</div>
          </div>
          <div 
             className="flex-1 min-w-[150px] cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors group"
             onClick={() => onNavigate('register-candidate')}
          >
            <div className="text-4xl font-extrabold text-primary mb-1 group-hover:scale-110 transition-transform">{stats.candidates}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide group-hover:text-primary">Candidates</div>
          </div>
          <div 
             className="flex-1 min-w-[150px] cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors group"
             onClick={() => onNavigate('events')}
          >
            <div className="text-4xl font-extrabold text-primary mb-1 group-hover:scale-110 transition-transform">{stats.events}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide group-hover:text-primary">Events</div>
          </div>
        </div>
      </div>

      {/* Featured Jobs - Moved here replacing Upcoming Events */}
      <div className="bg-gray-50 py-16">
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

      {/* Most Popular Jobs Section */}
      <div className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Most Popular Jobs</h2>
                  <p className="text-gray-500">Know your worth and find the job that qualify your life</p>
              </div>
              
              {/* Filters */}
              <div className="flex justify-center mb-10">
                  <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
                      {['All', 'Design', 'Marketing', 'Health', 'Development'].map(filter => (
                          <button
                              key={filter}
                              onClick={() => setPopularFilter(filter)}
                              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                                  popularFilter === filter
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                              {filter}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {filteredPopularJobs.map(job => (
                      <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow relative">
                          {/* Bookmark */}
                          <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                              <i className="far fa-bookmark"></i>
                          </button>
                          
                          <div className="flex gap-4">
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 ${job.color}`}>
                                  {job.logo}
                              </div>
                              <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{job.title}</h3>
                                      {job.featured && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Featured</span>}
                                  </div>
                                  <div className="flex flex-wrap items-center text-xs text-gray-500 gap-y-1 gap-x-3 mt-2">
                                      <span className="flex items-center"><i className="fas fa-layer-group mr-1.5 text-gray-400"></i>{job.categories.join(', ')}</span>
                                      <span className="flex items-center"><i className="fas fa-map-marker-alt mr-1.5 text-gray-400"></i>{job.location}</span>
                                      <span className="flex items-center"><i className="fas fa-dollar-sign mr-1.5 text-gray-400"></i>{job.salary.replace('$','')}</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="mt-6 flex gap-3">
                              <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                                  {job.type}
                              </span>
                              {job.urgent && (
                                  <span className="px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold">
                                      Urgent
                                  </span>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Top Companies Registered Section */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div className="text-center md:text-left w-full md:w-auto mb-4 md:mb-0">
                 <h2 className="text-3xl font-bold text-gray-800 mb-2">Top Companies Registered</h2>
                 <p className="text-gray-500">Some of the companies we've helped recruit excellent applicants over the years.</p>
              </div>
              <button onClick={() => setShowAllCompanies(true)} className="text-primary font-bold hover:underline hidden md:block">Browse All Companies &gt;</button>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {visibleCompanies.map(company => (
                 <div key={company.id} className="bg-white border border-gray-100 rounded-xl p-8 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer">
                     <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-6 ${company.bg} ${company.text}`}>
                         {company.logo}
                     </div>
                     <h3 className="font-bold text-lg text-gray-900 mb-2">{company.name}</h3>
                     <div className="text-gray-400 text-sm mb-8 flex items-center justify-center">
                         <i className="fas fa-map-marker-alt mr-2 text-gray-300"></i> {company.location}
                     </div>
                     <button 
                        onClick={() => onNavigate('jobboard')}
                        className="w-full bg-blue-50 text-primary font-bold py-3 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors text-sm"
                     >
                         Open Jobs - {company.openJobs}
                     </button>
                 </div>
              ))}
           </div>

           {/* Pagination Dots */}
           {totalCompanyPages > 1 && (
               <div className="flex justify-center space-x-2">
                   {Array.from({ length: totalCompanyPages }).map((_, idx) => (
                       <button 
                          key={idx} 
                          onClick={() => setCompanyPage(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${companyPage === idx ? 'bg-gray-800 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'}`}
                       ></button>
                   ))}
               </div>
           )}
           
           {/* Mobile View All Button */}
           <div className="mt-8 text-center md:hidden">
              <button onClick={() => setShowAllCompanies(true)} className="text-primary font-bold hover:underline">Browse All Companies &gt;</button>
           </div>
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

      {/* Testimonials - Now Clickable & Active */}
      <div className="py-16 bg-teal-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map(story => (
              <div 
                key={story.id} 
                className="bg-teal-800 p-8 rounded-lg shadow-lg relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-teal-700"
                onClick={() => setSelectedStory(story)}
              >
                <i className="fas fa-quote-left text-teal-600 text-4xl absolute top-4 left-4 opacity-30"></i>
                <p className="text-teal-100 italic mb-6 z-10 relative line-clamp-4">"{story.comment}"</p>
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

      {/* All Companies Modal */}
      <Modal isOpen={showAllCompanies} onClose={() => setShowAllCompanies(false)} title="Registered Companies">
        <div className="max-h-[70vh] overflow-y-auto p-1">
            <p className="text-sm text-gray-500 mb-4">Browse our comprehensive list of registered corporate partners.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCompanies.map(company => (
                    <div key={company.id} className="bg-white border border-gray-100 rounded-lg p-4 flex items-center space-x-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setShowAllCompanies(false); onNavigate('jobboard'); }}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${company.bg} ${company.text}`}>
                            {company.logo}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">{company.name}</h4>
                            <div className="text-xs text-gray-500">{company.location}</div>
                        </div>
                        <div className="ml-auto text-xs font-bold text-primary bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
                            {company.openJobs} Jobs
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-center">
                <Button onClick={() => { setShowAllCompanies(false); onNavigate('register-corporate'); }} className="text-sm">Register Your Company</Button>
            </div>
        </div>
      </Modal>

      {/* Success Story Detail Modal */}
      {selectedStory && (
          <Modal isOpen={!!selectedStory} onClose={() => setSelectedStory(null)} title="Success Story">
              <div className="text-center p-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden shadow-md">
                      <img src={selectedStory.imageUrl} alt={selectedStory.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedStory.name}</h3>
                  <p className="text-primary font-medium mb-6">{selectedStory.role}</p>
                  
                  <div className="relative bg-teal-50 p-6 rounded-lg text-left">
                      <i className="fas fa-quote-left text-teal-200 text-4xl absolute top-4 left-4"></i>
                      <p className="text-gray-700 italic relative z-10 leading-relaxed text-lg">"{selectedStory.comment}"</p>
                  </div>
                  
                  <div className="mt-8 flex justify-center">
                      <Button onClick={() => setSelectedStory(null)}>Close</Button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};

export default Home;