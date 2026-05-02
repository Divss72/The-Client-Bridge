from openai import OpenAI
from app.core.config import settings
import json

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_embedding(text: str) -> list:
    """Returns 1536 dim embedding vector using OpenAI"""
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding Error: {e}. Falling back to mock embedding.")
        # Fallback to zeros for testing without API key
        return [0.0] * 1536

def generate_summary(text: str) -> str:
    """Generates a summary of text"""
    try:
        if "mock-key" in settings.OPENAI_API_KEY:
            raise ValueError("Using mock key")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional CRM assistant. Summarize the following text briefly in 1-2 sentences."},
                {"role": "user", "content": text}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        # Fallback summary
        words = text.split()
        if len(words) > 30:
            return " ".join(words[:30]) + "..."
        return text if text else "No content to summarize."

def generate_rag_response(query: str, context: list) -> str:
    prompt = f"""You are a helpful CRM AI Assistant helping a salesperson or manager.
    Answer the user's question based strictly on the stored context/memory below.
    If the context doesn't have the answer, say you don't know based on memory.
    
    Context:
    {chr(10).join([c['text'] for c in context])}
    
    User Query: {query}
    """
    
    try:
        if "mock-key" in settings.OPENAI_API_KEY:
            raise ValueError("Using mock key")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        # Fallback RAG response
        if context:
            return "Based on my simulated memory, the context says: " + context[0]['text'][:100] + "..."
        return "I don't know based on simulated memory."

def analyze_sentiment(text: str) -> str:
    """Returns positive, negative, or neutral and a brief reason"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Respond only with a JSON like {\"sentiment\": \"positive/neutral/negative\", \"reason\": \"brief reason\"}"},
                {"role": "user", "content": f"Analyze this interaction: {text}"}
            ]
        )
        res_text = response.choices[0].message.content
        res_text = res_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(res_text)
        return data.get("sentiment", "neutral"), data.get("reason", "")
    except Exception as e:
        return "neutral", "analysis failed"
