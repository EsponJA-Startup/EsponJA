import re
from datetime import datetime
from sqlmodel import Session, select
from app.models import ChatSession, Client, ServiceRequest
import uuid

# Define States
WELCOME = "WELCOME"
ASK_SERVICE_TYPE = "ASK_SERVICE_TYPE"
ASK_HOME_TYPE = "ASK_HOME_TYPE"
ASK_BEDROOMS = "ASK_BEDROOMS"
ASK_BATHROOMS = "ASK_BATHROOMS"
ASK_PETS = "ASK_PETS"
ASK_CEP = "ASK_CEP"
ASK_ADDRESS = "ASK_ADDRESS"
ASK_DATE = "ASK_DATE"
ASK_TIME = "ASK_TIME"
CONFIRMATION = "CONFIRMATION"

def get_or_create_session(db: Session, phone_number: str) -> ChatSession:
    chat_session = db.exec(select(ChatSession).where(ChatSession.phone_number == phone_number)).first()
    if not chat_session:
        chat_session = ChatSession(phone_number=phone_number, current_state=WELCOME, data={})
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)
    return chat_session

def process_message(db: Session, phone_number: str, message: str) -> str:
    chat_session = get_or_create_session(db, phone_number)
    state = chat_session.current_state
    msg = message.strip()
    
    response = "Desculpe, não entendi."
    next_state = state
    data = dict(chat_session.data) # Copy data
    
    # Simple cancel command
    if msg.lower() in ["cancelar", "sair", "parar"]:
        chat_session.current_state = WELCOME
        chat_session.data = {}
        db.add(chat_session)
        db.commit()
        return "Solicitação cancelada. Se quiser recomeçar, envie qualquer mensagem."

    if state == WELCOME:
        response = (
            "Olá! Bem-vindo(a) à EsponJÁ. Como posso ajudar?\n\n"
            "1. Solicitar um serviço de limpeza\n"
            "2. Falar com atendente\n"
            "Digite o número da opção desejada:"
        )
        if msg == "1" or msg.lower() == "oi" or msg.lower() == "ola": # Treat first message normally if it's just 'oi'
            next_state = ASK_SERVICE_TYPE
            response = (
                "Ótimo! Vamos agendar sua limpeza. Qual tipo de serviço você precisa?\n\n"
                "1. Faxina Padrão\n"
                "2. Faxina Pesada\n"
                "3. Limpeza Pós-Obra\n"
                "Digite o número da opção:"
            )
        elif msg == "2":
            response = "Um atendente entrará em contato em breve. Se quiser solicitar limpeza, digite 1."
        else:
            # If they just said "hello", show welcome menu without changing state, but we already set response
            # Let's be smart: if it's their first message ever, show welcome menu and wait for 1 or 2
            pass
            
    elif state == ASK_SERVICE_TYPE:
        options = {"1": "Faxina Padrão", "2": "Faxina Pesada", "3": "Pós-Obra"}
        if msg in options:
            data["service_type"] = options[msg]
            next_state = ASK_HOME_TYPE
            response = (
                "Qual é o tipo do imóvel?\n\n"
                "1. Casa\n"
                "2. Apartamento\n"
                "Digite o número da opção:"
            )
        else:
            response = "Por favor, digite 1, 2 ou 3."

    elif state == ASK_HOME_TYPE:
        options = {"1": "Casa", "2": "Apartamento"}
        if msg in options:
            data["home_type"] = options[msg]
            next_state = ASK_BEDROOMS
            response = (
                "Quantos quartos tem o imóvel?\n\n"
                "1. 1 Quarto\n"
                "2. 2 Quartos\n"
                "3. 3 Quartos\n"
                "4. 4 ou mais\n"
                "Digite o número da opção:"
            )
        else:
            response = "Por favor, digite 1 ou 2."

    elif state == ASK_BEDROOMS:
        options = {"1": "1 Quarto", "2": "2 Quartos", "3": "3 Quartos", "4": "4+ Quartos"}
        if msg in options:
            data["bedrooms"] = options[msg]
            next_state = ASK_BATHROOMS
            response = (
                "Quantos banheiros?\n\n"
                "1. 1 Banheiro\n"
                "2. 2 Banheiros\n"
                "3. 3 ou mais\n"
                "Digite o número da opção:"
            )
        else:
            response = "Por favor, digite 1, 2, 3 ou 4."

    elif state == ASK_BATHROOMS:
        options = {"1": "1 Banheiro", "2": "2 Banheiros", "3": "3+ Banheiros"}
        if msg in options:
            data["bathrooms"] = options[msg]
            next_state = ASK_PETS
            response = (
                "Você tem animais de estimação?\n\n"
                "1. Sim\n"
                "2. Não\n"
                "Digite o número da opção:"
            )
        else:
            response = "Por favor, digite 1, 2 ou 3."

    elif state == ASK_PETS:
        if msg == "1":
            data["has_pets"] = True
            next_state = ASK_CEP
        elif msg == "2":
            data["has_pets"] = False
            next_state = ASK_CEP
        
        if msg in ["1", "2"]:
            response = "Por favor, informe o seu CEP (apenas números, ou formato XXXXX-XXX):"
        else:
            response = "Por favor, digite 1 para Sim ou 2 para Não."

    elif state == ASK_CEP:
        # Very basic CEP validation
        clean_cep = re.sub(r'[^0-9]', '', msg)
        if len(clean_cep) == 8:
            data["cep"] = msg
            next_state = ASK_ADDRESS
            response = "Agora, informe o seu endereço completo (Rua, Número, Complemento, Bairro):"
        else:
            response = "CEP inválido. Por favor, tente novamente:"

    elif state == ASK_ADDRESS:
        if len(msg) > 5:
            data["address"] = msg
            next_state = ASK_DATE
            response = "Para qual data você precisa do serviço? (Formato: DD/MM/AAAA):"
        else:
            response = "Por favor, insira um endereço válido:"

    elif state == ASK_DATE:
        try:
            parsed_date = datetime.strptime(msg, "%d/%m/%Y").date()
            if parsed_date < datetime.now().date():
                response = "A data não pode ser no passado. Por favor, insira uma data válida (DD/MM/AAAA):"
            else:
                data["scheduled_date"] = parsed_date.isoformat()
                next_state = ASK_TIME
                response = "Qual o horário de início? (Formato: HH:MM):"
        except ValueError:
            response = "Formato de data inválido. Use DD/MM/AAAA (exemplo: 25/12/2023):"

    elif state == ASK_TIME:
        try:
            parsed_time = datetime.strptime(msg, "%H:%M").time()
            data["scheduled_time"] = parsed_time.isoformat()
            next_state = CONFIRMATION
            
            # Format confirmation message
            response = (
                "Tudo certo! Confirme os dados do seu pedido:\n\n"
                f"Serviço: {data.get('service_type')}\n"
                f"Imóvel: {data.get('home_type')} ({data.get('bedrooms')}, {data.get('bathrooms')})\n"
                f"Pets: {'Sim' if data.get('has_pets') else 'Não'}\n"
                f"CEP: {data.get('cep')}\n"
                f"Endereço: {data.get('address')}\n"
                f"Data: {datetime.fromisoformat(data.get('scheduled_date')).strftime('%d/%m/%Y')} às {parsed_time.strftime('%H:%M')}\n\n"
                "O preço será combinado posteriormente.\n\n"
                "1. Confirmar Pedido\n"
                "2. Cancelar e recomeçar"
            )
        except ValueError:
            response = "Formato de horário inválido. Use HH:MM (exemplo: 14:30):"

    elif state == CONFIRMATION:
        if msg == "1":
            # Process and create ServiceRequest
            client = db.exec(select(Client).where(Client.whatsapp_number == phone_number)).first()
            if not client:
                # Create a dummy client
                client = Client(
                    name="Usuário WhatsApp",
                    whatsapp_number=phone_number,
                )
                db.add(client)
                db.commit()
                db.refresh(client)
            
            # Create request
            service_request = ServiceRequest(
                client_id=client.id,
                service_type=data.get('service_type'),
                home_type=data.get('home_type'),
                bedrooms=data.get('bedrooms'),
                bathrooms=data.get('bathrooms'),
                has_pets=data.get('has_pets'),
                cep=data.get('cep'),
                address=data.get('address'),
                scheduled_date=datetime.fromisoformat(data.get('scheduled_date')).date() if 'T' in data.get('scheduled_date') else datetime.strptime(data.get('scheduled_date'), "%Y-%m-%d").date(),
                scheduled_time=datetime.strptime(data.get('scheduled_time'), "%H:%M:%S").time(),
                status="Pendente"
            )
            db.add(service_request)
            db.commit()
            
            next_state = WELCOME
            data = {}
            response = "Pedido confirmado com sucesso! Entraremos em contato em breve para combinar o valor e o profissional responsável."
            
        elif msg == "2":
            next_state = WELCOME
            data = {}
            response = "Pedido cancelado. Envie qualquer mensagem para recomeçar."
        else:
            response = "Por favor, digite 1 para Confirmar ou 2 para Cancelar."

    # Update session state and data
    chat_session.current_state = next_state
    
    # In SQLite JSON columns via SQLModel, we need to assign a new dict or use flag_modified
    chat_session.data = data
    chat_session.updated_at = datetime.now()
    db.add(chat_session)
    db.commit()

    return response
