import openai
from typing import List, Optional
from app.core.config import settings

from app.services.rag_service import rag_service

class AIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    async def get_response(self, prompt: str, system_prompt: str = "You are an ESG and Sustainability expert."):
        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content

    async def framework_specific_qa(self, query: str, framework_id: str, context: str = ""):
        # If no context provided, search RAG
        if not context:
            context = await rag_service.query(query, framework_id=framework_id)
            
        system_prompt = f"""
        You are an expert AI Assistant specialized in the {framework_id} sustainability framework.
        Your goal is to provide accurate, professional, and framework-compliant advice.
        Use the provided context to ground your answer. If the context doesn't contain the answer, use your expert knowledge but state that you are doing so.
        """
        
        prompt = f"User Query: {query}\n\nRelevant Context:\n{context}"
        return await self.get_response(prompt, system_prompt)

    async def generate_report_section(self, section_name: str, framework_id: str, data: str):
        # Enhance with RAG context if needed
        rag_context = await rag_service.query(f"{framework_id} requirements for {section_name}", framework_id=framework_id)
        
        system_prompt = f"You are a senior sustainability report writer. Generate a professional, board-level quality report section for '{section_name}' following {framework_id} standards."
        prompt = f"Context from Knowledge Base:\n{rag_context}\n\nData to include:\n{data}\n\nRequirements: Use professional tone, include strategic insights, and ensure alignment with {framework_id} metrics."
        return await self.get_response(prompt, system_prompt)

    async def rewrite_content(self, content: str, rewrite_prompt: str):
        system_prompt = "You are an elite editor. Rewrite the following content based on the user's instructions while maintaining professional integrity."
        prompt = f"Original Content:\n{content}\n\nInstruction: {rewrite_prompt}"
        return await self.get_response(prompt, system_prompt)

ai_service = AIService()
