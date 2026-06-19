import os
from google import genai

# Inicializa o cliente do Gemini usando a variável de ambiente GEMINI_API_KEY
def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY não configurada nas variáveis de ambiente.")
    return genai.Client(api_key=api_key)

def generate_chat_response(message: str) -> str:
    """
    Função simples para testar a comunicação básica com o modelo.
    """
    try:
        client = get_gemini_client()
        # Usando o gemini-2.5-flash que é rápido e ótimo para chats
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=message,
        )
        return response.text
    except Exception as e:
        print(f"Erro ao comunicar com Gemini API: {e}")
        return "Desculpe, ocorreu um erro ao processar sua mensagem."
