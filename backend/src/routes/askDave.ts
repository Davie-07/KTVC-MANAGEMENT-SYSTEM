import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

const HF_API_TOKEN = process.env.HUGGING_FACE_API_KEY;
const HF_MODEL = 'microsoft/DialoGPT-medium'; // Changed to a more reliable model

router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ answer: 'Please provide a question to ask Dave.' });
    }

    // Check if API token is configured
    if (!HF_API_TOKEN) {
      return res.json({ 
        answer: "Hi! I'm Dave, your AI assistant. I'm currently in maintenance mode, but I can help you with general questions about your studies. What would you like to know about your courses, assignments, or school life?" 
      });
    }

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          inputs: question,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats from Hugging Face
      let answer = 'Sorry, I could not process that question right now.';
      
      if (Array.isArray(data) && data.length > 0) {
        answer = data[0].generated_text || data[0].text || answer;
      } else if (data.generated_text) {
        answer = data.generated_text;
      } else if (data.text) {
        answer = data.text;
      } else if (typeof data === 'string') {
        answer = data;
      }

      // Clean up the response
      answer = answer.trim();
      if (answer.length === 0) {
        answer = "I'm not sure how to answer that. Could you please rephrase your question?";
      }

      res.json({ answer });
      
    } catch (apiError) {
      console.error('Hugging Face API Error:', apiError);
      
      // Fallback responses for common questions
      const fallbackResponses = {
        'hello': "Hello! I'm Dave, your AI study assistant. How can I help you today?",
        'hi': "Hi there! I'm Dave, ready to help with your studies. What's on your mind?",
        'help': "I'm here to help! You can ask me about your courses, assignments, study tips, or any academic questions you have.",
        'study': "Great! I can help you with study strategies, course materials, and academic advice. What specific area do you need help with?",
        'course': "I can help you with course-related questions. What would you like to know about your courses?",
        'assignment': "Need help with assignments? I can provide guidance on study strategies and academic writing. What's your question?",
        'exam': "Exams can be challenging! I can help you with study techniques, time management, and preparation strategies. What do you need help with?",
        'grade': "I can help you understand grading systems and how to improve your academic performance. What would you like to know?",
        'time': "Time management is crucial for academic success! I can help you with scheduling, prioritization, and study planning.",
        'stress': "Academic stress is common. I can help you with stress management techniques and study-life balance strategies."
      };

      const questionLower = question.toLowerCase();
      let fallbackAnswer = "I'm currently experiencing technical difficulties, but I'm here to help! You can ask me about your studies, courses, assignments, or any academic questions.";

      // Check for keywords in the question
      for (const [keyword, response] of Object.entries(fallbackResponses)) {
        if (questionLower.includes(keyword)) {
          fallbackAnswer = response;
          break;
        }
      }

      res.json({ answer: fallbackAnswer });
    }
    
  } catch (err) {
    console.error('AskDave Error:', err);
    res.status(500).json({ 
      answer: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support if the issue persists." 
    });
  }
});

export default router; 