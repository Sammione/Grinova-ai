import axios from 'axios';

// Mock delays to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiApi = {
  getFrameworks: async () => {
    await delay(800);
    return [
      { id: 'GRI', name: 'Global Reporting Initiative' },
      { id: 'SASB', name: 'Sustainability Accounting Standards Board' },
      { id: 'TCFD', name: 'Task Force on Climate-related Financial Disclosures' },
      { id: 'IFRS', name: 'IFRS Sustainability Disclosure Standards' }
    ];
  },
  chat: async (query: string, frameworkId: string, context: string = '') => {
    await delay(1500);
    return { 
      response: `[Simulated AI Analysis] Based on the ${frameworkId} framework, your query "${query}" has been analyzed. We recommend aligning your disclosures with the corresponding industry-specific metrics. The intelligence engine has determined high alignment with current regulatory standards.` 
    };
  },
  generateSection: async (sectionName: string, frameworkId: string, data: string) => {
    await delay(2000);
    return { 
      content: `### ${sectionName}\n\nThis section has been automatically generated based on the ${frameworkId} framework guidelines and your provided data. Ensure that you verify the core KPIs before publishing.` 
    };
  },
  rewrite: async (content: string, instruction: string) => {
    await delay(1200);
    return { 
      content: `[Rewritten Content]: ${content}\n\n(Applied instruction: ${instruction})` 
    };
  },
  uploadDocument: async (file: File, frameworkId: string = 'GRI') => {
    await delay(2500);
    return { status: "success", message: "Document uploaded and indexed successfully" };
  },
};

export const analyticsApi = {
  getReadiness: async (frameworkId: string = 'GRI') => {
    await delay(600);
    return { score: 84.2, previous: 80.0, label: "OPTIMIZED", risk: "LOW" };
  },
  getStats: async () => {
    await delay(600);
    return { users: "1,204", active_roles: 8, api_health: "99.9%" };
  },
};

export const healthApi = {
  check: async () => {
    return { status: "ok" };
  },
};
