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
    """
    
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model = None
        self.context = None
        self._initialized = False
        
        if self.api_key:
            self._initialize()
    
    def _initialize(self):
        """Initialize the Gemini model."""
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(AI_CONFIG["model_name"])
            self._load_context()
            self._initialized = True
        except ImportError:
            print("Warning: google-generativeai not installed")
            self._initialized = False
        except Exception as e:
            print(f"Warning: Could not initialize Gemini: {e}")
            self._initialized = False
    
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
    
    def ask(self, query: str) -> str:
        """
        Process natural language query about the data.
        Uses loaded context to generate informed responses.
        """
        if not self.is_available():
            return "AI service is not available. Please set GEMINI_API_KEY in your .env file."
        
        try:
            # Build prompt with context
            prompt = QUERY_PROMPT_TEMPLATE.format(
                context=self.context,
                query=query
            )
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            raise AIServiceError(f"Error processing query: {str(e)}")
    
    def explain_trend(self, geo_key: str) -> str:
        """
        Generate AI explanation for a specific region's trends.
        """
        if not self.is_available():
            return "AI service is not available. Please set GEMINI_API_KEY in your .env file."
        
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
            
            # Build prompt
            prompt = EXPLAIN_TREND_TEMPLATE.format(
                geo_key=geo_key,
                region_data=region_data
            )
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            raise AIServiceError(f"Error explaining trend: {str(e)}")
    
    def generate_executive_summary(self) -> str:
        """
        Generate AI-enhanced national-level summary.
        """
        if not self.is_available():
            # Return rule-based summary if AI not available
            from engines.insight_generator import get_executive_summary
            summary = get_executive_summary()
            return summary.get('summary', 'No data available')
        
        try:
            from engines.insight_generator import get_executive_summary
            
            exec_summary = get_executive_summary()
            
            prompt = EXECUTIVE_SUMMARY_TEMPLATE.format(
                data_summary=exec_summary
            )
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            # Fallback to rule-based summary
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


# Module-level singleton
_engine = None

def get_insight_engine() -> InsightEngine:
    """Get or create the insight engine singleton."""
    global _engine
    if _engine is None:
        _engine = InsightEngine()
    return _engine
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
            response = self.model.generate_content(prompt)
            print(f"AI response generated for {title}") # Debug log
            return response.text
        except Exception as e:
            print(f"Error generating AI analysis: {e}")
            return "Unable to generate analysis at this time."
