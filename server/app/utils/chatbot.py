import os
from google import genai
from google.genai import types
from sqlmodel import Session, select
from app.models import Client, ServiceRequest
from datetime import datetime

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY não configurada nas variáveis de ambiente.")
    return genai.Client(api_key=api_key)

SYSTEM_INSTRUCTION = """Você é o assistente virtual da EsponJÁ, uma plataforma de agendamento de serviços domésticos. 
Seu objetivo é ajudar os clientes a agendar serviços como faxina, limpeza, etc.
Você deve SEMPRE coletar as seguintes informações do usuário antes de agendar o serviço:
1. Tipo de serviço (ex: Faxina Padrão, Faxina Pesada, Limpeza Pós-Obra, etc)
2. Tipo do imóvel (Casa, Apartamento, etc)
3. Quantidade de quartos (ex: 2 quartos)
4. Quantidade de banheiros (ex: 1 banheiro)
5. Se possui pets (Sim ou Não)
6. CEP
7. Endereço completo (Rua, número, bairro, cidade)
8. Data desejada para o serviço (formato AAAA-MM-DD)
9. Horário desejado para o serviço (formato HH:MM)

Faça uma pergunta por vez ou agrupe no máximo duas, para que a conversa fique natural. Não peça todos os dados de uma vez.
Quando (e somente quando) você tiver coletado TODAS as 9 informações acima de forma clara, chame a função `create_booking` para criar o agendamento no sistema. Após a função ser chamada com sucesso, avise o cliente que o agendamento foi concluído e que um profissional entrará em contato.
"""

def generate_chat_response(history: list, client_id: str, db_session: Session) -> dict:
    """
    history é uma lista de objetos ChatMessageItem com role e content.
    """
    booking_created = {"status": False}
    try:
        client = get_gemini_client()
        
        # Define a função de Function Calling que será usada pelo Gemini
        def create_booking(service_type: str, home_type: str, bedrooms: str, bathrooms: str, has_pets: bool, cep: str, address: str, scheduled_date: str, scheduled_time: str) -> str:
            """Cria um agendamento de serviço na plataforma EsponJÁ e retorna sucesso ou erro."""
            try:
                import uuid
                
                # 1. Converte data e hora
                dt_date = datetime.strptime(scheduled_date, "%Y-%m-%d").date()
                dt_time = datetime.strptime(scheduled_time, "%H:%M").time()
                
                # 2. Cria a ServiceRequest
                request = ServiceRequest(
                    client_id=uuid.UUID(client_id),
                    service_type=service_type,
                    home_type=home_type,
                    bedrooms=bedrooms,
                    bathrooms=bathrooms,
                    has_pets=has_pets,
                    cep=cep,
                    address=address,
                    scheduled_date=dt_date,
                    scheduled_time=dt_time
                )
                db_session.add(request)
                db_session.commit()
                booking_created["status"] = True
                return "Agendamento criado com sucesso!"
            except Exception as e:
                print(f"Erro no banco de dados ao criar booking: {e}")
                return "Erro ao criar agendamento no banco de dados."

        # Constrói o histórico para a API do Gemini
        if not history:
            return "Sem mensagens."
            
        contents = []
        for msg in history:
            role = msg.role
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
            
        latest_content = contents.pop() # A última mensagem será enviada separadamente no send_message
        
        chat = client.chats.create(
            model='gemini-2.5-flash',
            history=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.7,
                tools=[create_booking]
            )
        )
        
        # Envia a nova mensagem do usuário. A API cuida automaticamente de invocar a função se necessário.
        response = chat.send_message(latest_content.parts[0].text)
        
        return {"text": response.text, "booked": booking_created["status"]}
        
    except Exception as e:
        import traceback
        with open("gemini_error.txt", "w", encoding="utf-8") as f:
            f.write(str(e) + "\n")
            traceback.print_exc(file=f)
        print(f"Erro ao comunicar com Gemini API: {e}")
        return {"text": "Desculpe, ocorreu um erro ao processar sua mensagem.", "booked": False}
