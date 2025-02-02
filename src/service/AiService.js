import httpClient from '../http-common';
import TeamService from './TeamService';

const API_KEY = 'AIzaSyDGiyo_nl9XPZ1FQbBZDEI4c6zRdXhJVrA';

const generateAiResponse = async (prompt, context = {}) => {
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                }
            })
        });

        const data = await response.json();
        
        // Check if there's an error in the response
        if (data.error) {
            throw new Error(data.error.message || 'Error from Gemini API');
        }

        // The correct path to the generated text in Gemini's response
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.promptFeedback) {
            throw new Error(data.promptFeedback.blockReason || 'Content blocked by Gemini API');
        } else {
            throw new Error('Unexpected response structure from Gemini API');
        }
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw error;
    }
};

const calculateProjectMetrics = (description) => {
    const complexityIndicators = {
        high: ['complex', 'innovative', 'large-scale', 'enterprise', 'integration', 'AI', 'machine learning', 'blockchain'],
        medium: ['database', 'api', 'authentication', 'dashboard', 'reporting', 'mobile'],
        low: ['simple', 'basic', 'landing page', 'static', 'form']
    };

    let complexityScore = 1;
    const descLower = description.toLowerCase();
    
    complexityIndicators.high.forEach(indicator => {
        if (descLower.includes(indicator)) complexityScore += 0.5;
    });
    complexityIndicators.medium.forEach(indicator => {
        if (descLower.includes(indicator)) complexityScore += 0.3;
    });
    complexityIndicators.low.forEach(indicator => {
        if (descLower.includes(indicator)) complexityScore += 0.1;
    });

    const baseMetrics = {
        baseDuration: 3, // months
        baseCost: 10000, // dollars per month
        baseTeamSize: 3
    };

    return {
        duration: Math.ceil(baseMetrics.baseDuration * complexityScore),
        budget: Math.ceil(baseMetrics.baseCost * complexityScore * 1000) / 1000,
        teamSize: Math.ceil(baseMetrics.baseTeamSize * complexityScore)
    };
};

const generateProjectStructure = async (requirements) => {
    try {
        const teamsResponse = await TeamService.getAll();
        const availableTeams = teamsResponse.data;

        const metrics = calculateProjectMetrics(requirements.description);

        const prompt = `Generate a detailed project structure with the following requirements and constraints:

Project Details:
- Name: "${requirements.name}"
- Description: "${requirements.description}"
- Type: "${requirements.type}"
- Industry: "${requirements.industry}"
- Calculated Duration: ${metrics.duration} months
- Estimated Budget: $${metrics.budget}
- Recommended Team Size: ${metrics.teamSize} members

Available Teams:
${JSON.stringify(availableTeams.map(team => ({
    id: team._id,
    name: team.teamName,
    skills: team.skills || []
})))}

Generate a project structure in the following JSON format:
{
    "name": "${requirements.name}",
    "description": "Detailed project description",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "budget": "Estimated budget in numbers",
    "costEstimate": "Estimated cost in numbers",
    "keyFeatures": ["feature1", "feature2", "feature3"],
    "teamStructure": ["role1", "role2", "role3"],
    "recommendedTeams": [
        {
            "teamId": "id from available teams",
            "teamName": "name from available teams",
            "reason": "Why this team is recommended"
        }
    ],
    "initialSprints": [
        {
            "name": "Sprint name",
            "duration": "2 weeks",
            "goals": ["goal1", "goal2"]
        }
    ],
    "keyMilestones": [
        {
            "name": "Milestone name",
            "date": "YYYY-MM-DD",
            "deliverables": ["deliverable1", "deliverable2"]
        }
    ],
    "riskAssessment": [
        {
            "risk": "Potential risk",
            "impact": "High/Medium/Low",
            "mitigation": "Mitigation strategy"
        }
    ]
}

Ensure:
1. Dates are in YYYY-MM-DD format
2. Budget and cost estimates are realistic based on scope
3. Team recommendations match project needs
4. Features and milestones align with description
5. Sprints cover the entire project duration
6. Risk assessment is comprehensive`;

        const response = await generateAiResponse(prompt, { type: 'project_creation' });
        
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON object found in response');
        }

        const jsonStr = jsonMatch[0];
        const cleanJson = jsonStr
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\n\r\t]/g, ' ')
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/:\s*'([^']*)'/g, ':"$1"')
            .replace(/\\/g, '');

        const parsedProject = JSON.parse(cleanJson);

        const requiredFields = [
            'name', 'description', 'startDate', 'endDate', 
            'budget', 'costEstimate', 'keyFeatures', 'teamStructure', 
            'recommendedTeams', 'initialSprints', 'keyMilestones', 'riskAssessment'
        ];
        
        for (const field of requiredFields) {
            if (!parsedProject[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(parsedProject.startDate) || !dateRegex.test(parsedProject.endDate)) {
            throw new Error('Invalid date format');
        }

        return parsedProject;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        
        const metrics = calculateProjectMetrics(requirements.description);
        
        const today = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + metrics.duration);

        return {
            name: requirements.name,
            description: requirements.description,
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            budget: metrics.budget.toString(),
            costEstimate: (metrics.budget * 0.8).toString(), // 80% of budget as cost estimate
            keyFeatures: ['Feature 1', 'Feature 2', 'Feature 3'],
            teamStructure: ['Project Manager', 'Developer', 'Designer'],
            recommendedTeams: [],
            initialSprints: [
                {
                    name: 'Sprint 1: Planning',
                    duration: '2 weeks',
                    goals: ['Project Setup', 'Requirements Analysis']
                }
            ],
            keyMilestones: [
                {
                    name: 'Project Kickoff',
                    date: today.toISOString().split('T')[0],
                    deliverables: ['Project Charter', 'Initial Timeline']
                }
            ],
            riskAssessment: [
                {
                    risk: 'Timeline Risk',
                    impact: 'Medium',
                    mitigation: 'Regular progress monitoring'
                }
            ]
        };
    }
};

const analyzeProject = async (projectData) => {
    const prompt = `Provide a brief analysis of this project in bullet points:
    - Project: ${projectData.name}
    - Status: ${projectData.status}
    - Timeline: ${projectData.startDate} to ${projectData.endDate}
    
    Focus on key insights and risks only.`;
    return generateAiResponse(prompt, { type: 'project_analysis' });
};

const suggestImprovements = async (projectData) => {
    const prompt = `List 3 key improvements for this project:
    - Project: ${projectData.name}
    - Status: ${projectData.status}
    - Challenges: ${projectData.challenges || 'None specified'}
    
    Provide specific, actionable suggestions.`;
    return generateAiResponse(prompt, { type: 'improvement_suggestions' });
};

const generateProjectTemplate = async (requirements) => {
    const prompt = `Create a brief project template outline for:
    - Industry: ${requirements.industry}
    - Type: ${requirements.type}
    - Team: ${requirements.teamSize}
    - Duration: ${requirements.duration}
    
    List only essential components.`;
    return generateAiResponse(prompt, { type: 'template_generation' });
};

const estimateProjectTimeline = async (projectData) => {
    const prompt = `Provide a quick timeline estimate for:
    - Scope: ${projectData.description}
    - Team: ${projectData.teamSize}
    
    List only major milestones and durations.`;
    return generateAiResponse(prompt, { type: 'timeline_estimation' });
};

export default {
    generateAiResponse,
    analyzeProject,
    suggestImprovements,
    generateProjectTemplate,
    estimateProjectTimeline,
    generateProjectStructure,
};
