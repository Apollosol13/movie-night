import PocketBase from 'pocketbase';

// Initialize PocketBase client
// For development, you can use 'http://localhost:8090' if running PocketBase locally
// For production, replace with your deployed PocketBase URL
const pb = new PocketBase('http://localhost:8090');

// Type definition for survey response
export interface SurveyResponse {
  id?: string;
  email: string;
  movie_type: string;
  snack_choice: string;
  candy_choice: string;
  candy_custom?: string;
  beverage_choice: string;
  lighting_preference: string;
  comfort_setup: string;
  completed_at: string;
}

// Function to save survey response
export const saveSurveyResponse = async (answers: Record<string, string>) => {
  try {
    const surveyData: Partial<SurveyResponse> = {
      email: answers['email'] || '',
      movie_type: answers['movie-type'] || '',
      snack_choice: answers['snack-choice'] || '',
      candy_choice: answers['candy-choice'] || '',
      candy_custom: answers['candy-custom'] || '',
      beverage_choice: answers['beverage-choice'] || '',
      lighting_preference: answers['lighting-preference'] || '',
      comfort_setup: answers['comfort-setup'] || '',
      completed_at: new Date().toISOString(),
    };

    const record = await pb.collection('survey_responses').create(surveyData);
    console.log('Survey response saved:', record);
    return record;
  } catch (error) {
    console.error('Error saving survey response:', error);
    throw error;
  }
};

// Function to get all survey responses (for admin use)
export const getAllSurveyResponses = async () => {
  try {
    const records = await pb.collection('survey_responses').getFullList<SurveyResponse>();
    return records;
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    throw error;
  }
};

export default pb; 