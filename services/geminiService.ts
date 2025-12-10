import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateResumeContent = async (candidateData: any): Promise<string> => {
  if (!API_KEY) return "Mock Resume: API Key missing. Please configure.";
  
  try {
    const prompt = `You are an expert resume writer and formatter for global job markets. Create an ATS-friendly resume in MS Word (docx) using the following JSON candidate object. Use reverse-chronological layout, include a 2-sentence professional summary, 4–6 achievement bullets under each role where data exists, quantify results when numbers present, skills list as tags, and education. Also produce a short cover-note (3 sentences) the candidate can send to recruiters. Output: structured fields (header meta, sections with markdown-like tags).

    User payload: ${JSON.stringify(candidateData)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Failed to generate resume.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating resume content.";
  }
};

export const generateInterviewTips = async (role: string): Promise<string> => {
  if (!API_KEY) return "Mock Tips: API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide 5 top interview tips for a ${role} position. Keep it concise.`,
    });
    return response.text || "No tips available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating tips.";
  }
};

export const draftBlogPost = async (topic: string): Promise<string> => {
  if (!API_KEY) return "Mock Blog Post: API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a 600-word blog post about '${topic}' with headings, bullets, and a CTA to Download sample resume.`,
    });
    return response.text || "Failed to generate blog.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating blog.";
  }
};

export const generateEmailTemplate = async (jobTitle: string, candidateName: string): Promise<string> => {
  if (!API_KEY) return "Mock Email: API Key missing.";

  try {
    const prompt = `Write a professional email notifying company HR of a new application for ${jobTitle}. Include candidate name ${candidateName}, placeholder for phone/email, 2-sentence summary, link to resume, and next steps.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Failed to generate email.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating email.";
  }
};