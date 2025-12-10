import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="bg-gray-100 py-16">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">About AMPOWERJOBS.com</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Bridging the gap between talent and opportunity through innovation and compassion.</p>
         </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose lg:prose-xl text-gray-700">
           <p className="mb-6">
             Association of Muslim Professionals (AMP) is a Platform for all Muslim professionals and volunteers to share their Knowledge, Intellect, Experience and Skills for the overall development of not just the Muslim Community but also the society at large.
           </p>
           <h3 className="text-2xl font-bold text-gray-900 mb-4">Employment Assistance Cell</h3>
           <p className="mb-6">
             The Employment Assistance Cell (EAC) is one of the core projects of AMP. We believe that economic empowerment is the first step towards the upliftment of the community. Through JobConnect, we aim to provide free recruitment services to candidates and corporate partners alike.
           </p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="bg-teal-50 p-6 rounded-lg">
                 <h4 className="font-bold text-lg text-primary mb-2">Our Vision</h4>
                 <p className="text-sm">To impact 1 million lives by 2030 through sustainable employment opportunities.</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                 <h4 className="font-bold text-lg text-accent mb-2">Our Mission</h4>
                 <p className="text-sm">Creating a seamless ecosystem where skills meet demand, regardless of background.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default About;