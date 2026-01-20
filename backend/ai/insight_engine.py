"""
Aadhaar Sanket - AI Insight Engine
Gemini AI integration for natural language insights.
"""
import os
import sys
from pathlib import Path
from typing import Optional, Dict, List

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import GEMINI_API_KEY, AI_CONFIG, PATHS
from exceptions import AIServiceError
from .prompts import (
    SYSTEM_CONTEXT,
    QUERY_PROMPT_TEMPLATE,
    EXPLAIN_TREND_TEMPLATE,
    EXECUTIVE_SUMMARY_TEMPLATE
)


class InsightEngine:
    """
    AI-powered insight engine using Google Gemini.
    Supports automatic model fallback when quota is exceeded.
    """
    
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model = None
        self.genai = None
        self.context = None
        self._initialized = False
        self.current_model_name = None
        self.available_models = [AI_CONFIG["model_name"]] + AI_CONFIG.get("fallback_models", [])
        self.model_index = 0
        
        if self.api_key:
            self._initialize()
    
    def _initialize(self):
        """
        Initialize the Gemini model with dynamic discovery.
        Fetches available models associated with the key to ensure universal compatibility.
        """
        if not self.api_key:
            print("Warning: No GEMINI_API_KEY provided.")
            self._initialized = False
            return

        try:
            import google.generativeai as genai
            self.genai = genai
            genai.configure(api_key=self.api_key)
            
            # 1. Get all models available for this specific API key
            try:
                all_models = list(genai.list_models())
                # Filter for text generation models
                self.available_models = [
                    m.name for m in all_models 
                    if 'generateContent' in m.supported_generation_methods
                ]
                print(f"Discovered {len(self.available_models)} available models for this key")
                if not self.available_models:
                    # Fallback to some common names if list failed but didn't error
                    self.available_models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]
            except Exception as e:
                print(f"Could not list models: {e}. Falling back to defaults.")
                self.available_models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]

            # 2. Prioritize "Flash" and "Pro" models
            def model_priority(name):
                name = name.lower()
                if 'flash' in name and 'lite' in name: return 0
                if 'flash' in name: return 1
                if 'pro' in name: return 2
                return 3
            
            self.available_models.sort(key=model_priority)
            
            # 3. Try to initialize with the best available model
            self._try_next_model()
            
            if self.model:
                self._load_context()
                self._initialized = True
            else:
                print("Warning: No Gemini models could be initialized")
                self._initialized = False
                
        except Exception as e:
            print(f"Warning: Could not initialize Gemini: {e}")
            self._initialized = False

    def _try_next_model(self) -> bool:
        """Helper to try to load the next available model."""
        while self.model_index < len(self.available_models):
            model_name = self.available_models[self.model_index]
            try:
                print(f"Attempting to initialize Gemini with: {model_name}")
                self.model = self.genai.GenerativeModel(model_name)
                # Quick validation to see if the model/key combination is actually valid
                # self.model.generate_content("test") 
                self.current_model_name = model_name
                return True
            except Exception as e:
                print(f"Skipping {model_name}: {e}")
                self.model_index += 1
        return False

    def get_active_model(self):
        """Returns the currently active generative model. Re-initializes if key changed."""
        from dotenv import load_dotenv
        from config import ROOT_DIR
        load_dotenv(ROOT_DIR / ".env", override=True) # Force reload from file
        
        # Get fresh from os.environ
        env_key = os.getenv("GEMINI_API_KEY")
        
        if env_key and env_key != self.api_key:
            print(f"Detected GEMINI_API_KEY change. Refreshing engine...")
            self.refresh_key(env_key)

            
        if not self.is_available():
            # Try to re-initialize once if we failed before
            self._initialize()
        return self.model


    def refresh_key(self, new_key: str):
        """Update API key and re-initialize."""
        self.api_key = new_key
        self.model_index = 0
        self._initialize()

    
    def _switch_to_next_model(self):
        """Switch to the next available model when quota is exceeded."""
        if not self.genai:
            return False
            
        self.model_index += 1
        while self.model_index < len(self.available_models):
            model_name = self.available_models[self.model_index]
            try:
                self.model = self.genai.GenerativeModel(model_name)
                self.current_model_name = model_name
                print(f"Switched to fallback model: {model_name}")
                return True
            except Exception as e:
                print(f"Could not switch to {model_name}: {e}")
                self.model_index += 1
        
        print("No more fallback models available")
        return False

    def _load_context(self):
        """Load processed analytics data as context for AI."""
        from engines.ingestion import load_processed_dataset
        from engines.mvi import get_mvi_summary
        from engines.insight_generator import get_executive_summary
        
        context_parts = [SYSTEM_CONTEXT]
        
        # Load MVI summary
        try:
            mvi_summary = get_mvi_summary()
            context_parts.append(f"\n\nMVI Analytics Summary:\n{mvi_summary}")
        except:
            pass
        
        # Load executive summary
        try:
            exec_summary = get_executive_summary()
            context_parts.append(f"\n\nExecutive Summary:\n{exec_summary.get('summary', '')}")
        except:
            pass
        
        # Load sample data
        try:
            mvi_df = load_processed_dataset('mvi_analytics')
            if mvi_df is not None and len(mvi_df) > 0:
                sample = mvi_df.head(20).to_dicts()
                context_parts.append(f"\n\nSample MVI Data (top 20 regions):\n{sample}")
        except:
            pass
        
        self.context = "\n".join(context_parts)
    
    def is_available(self) -> bool:
        """Check if AI service is available."""
        return self._initialized and self.model is not None
    
    def generate_content(self, prompt: str) -> Optional[str]:
        """
        Centralized method to generate content with robust error handling and model rotation.
        Retries on Quota (429) and Invalid Key (400) errors.
        """
        if not self.is_available():
            return None
            
        max_retries = len(self.available_models) + 1
        
        for attempt in range(max_retries):
            try:
                # Ensure we have a model
                if not self.model:
                    if not self._try_next_model():
                        print("No models availability to generate content")
                        return None

                response = self.model.generate_content(prompt)
                return response.text
                
            except Exception as e:
                error_str = str(e).lower()
                print(f"Gemini Error (model: {self.current_model_name}): {type(e).__name__}: {str(e)}")
                
                # Check for recoverable errors (Quota, Rate Limit, Expiry, Invalid Key)
                is_recoverable = any(x in error_str for x in ['429', '400', 'quota', 'rate', 'limit', 'expired', 'invalid'])
                
                if is_recoverable:
                    print(f"Recoverable error on {self.current_model_name}, attempting fallback...")
                    if self._switch_to_next_model():
                        continue
                    else:
                        print("All AI models exhausted.")
                        raise AIServiceError("All AI models exhausted quota.")
                else:
                    # Non-recoverable error
                    raise e
        
        return None

    def ask(self, query: str, context: dict = None) -> str:
        """
        Process natural language query about the data.
        """
        if not self.is_available():
            return "AI service is not available. Please set GEMINI_API_KEY in your .env file."
        
        try:
            prompt = QUERY_PROMPT_TEMPLATE.format(
                context=self.context,
                query=query
            )
            result = self.generate_content(prompt)
            return result if result else "Unable to generate response."
        except Exception as e:
             return f"I encountered an error: {str(e)[:200]}. Please try again."
    
    def explain_trend(self, geo_key: str) -> str:
        """
        Generate AI explanation for a specific region's trends.
        """
        if not self.is_available():
            return "AI service is not available."
        
        try:
            from engines.ingestion import load_processed_dataset
            
            # Load region data
            mvi_df = load_processed_dataset('mvi_analytics')
            typology_df = load_processed_dataset('typology_analytics')
            
            region_data = {}
            
            if mvi_df is not None:
                region = mvi_df.filter(mvi_df['geo_key'] == geo_key)
                if len(region) > 0:
                    region_data['mvi'] = region.to_dicts()[0]
            
            if typology_df is not None:
                region = typology_df.filter(typology_df['geo_key'] == geo_key)
                if len(region) > 0:
                    region_data['typology'] = region.to_dicts()[0]
            
            if not region_data:
                return f"No data found for region: {geo_key}"
            
            prompt = EXPLAIN_TREND_TEMPLATE.format(
                geo_key=geo_key,
                region_data=region_data
            )
            
            result = self.generate_content(prompt)
            return result if result else "Unable to explain trend."
            
        except Exception as e:
            raise AIServiceError(f"Error explaining trend: {str(e)}")
    
    def generate_executive_summary(self) -> str:
        """
        Generate AI-enhanced national-level summary.
        """
        if not self.is_available():
            from engines.insight_generator import get_executive_summary
            summary = get_executive_summary()
            return summary.get('summary', 'No data available')
        
        try:
            from engines.insight_generator import get_executive_summary
            exec_summary = get_executive_summary()
            
            prompt = EXECUTIVE_SUMMARY_TEMPLATE.format(data_summary=exec_summary)
            
            result = self.generate_content(prompt)
            return result if result else exec_summary.get('summary', 'AI generation failed.')
            
        except Exception as e:
            from engines.insight_generator import get_executive_summary
            summary = get_executive_summary()
            return summary.get('summary', f'Error generating summary: {str(e)}')
    
    def get_suggested_queries(self) -> List[str]:
        """
        Get suggested queries for the AI assistant.
        """
        return [
            "What are the top 5 districts with highest migration pressure?",
            "Explain the migration patterns in Karnataka",
            "Which states are experiencing declining migration?",
            "What policy actions are recommended for high-inflow zones?",
            "Show me the seasonal migration patterns",
            "Compare urban vs rural migration trends",
            "What are the main migration corridors in India?",
            "Identify districts that need immediate attention"
        ]

    def analyze_issue(self, title: str, description: str, data: Dict = {}) -> str:
        """
        Analyze a specific issue and provide actionable solutions.
        """
        if not self.is_available():
            return "AI service unavailable."

        prompt = f"""
        Analyze this critical dashboard issue:
        **Issue**: {title}
        **Details**: {description}
        **Data Context**: {data}

        Please provide a structured response with:
        1. **Root Cause Analysis**: Why is this likely happening?
        2. **Impact Assessment**: What are the consequences?
        3. **Actionable Solutions**: 3 concrete steps to resolve this.

        Keep it concise and professional.
        """
        try:
            result = self.generate_content(prompt)
            return result if result else "Unable to generate analysis."
        except Exception as e:
            print(f"Error generating AI analysis: {e}")
            return "Unable to generate analysis at this time."

# Module-level singleton
_engine = None

def get_insight_engine() -> InsightEngine:
    """Get or create the insight engine singleton."""
    global _engine
    if _engine is None:
        _engine = InsightEngine()
    return _engine

