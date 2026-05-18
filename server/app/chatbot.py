import re
from datetime import datetime
from sqlmodel import Session, select, or_
from app.models import ChatSession, Client, ServiceRequest, Professional
import uuid
import random
import string
from app.utils.geo import get_coordinates, calculate_distance
from app.utils.twilio import send_whatsapp_message

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
CHOOSE_PROVIDER = "CHOOSE_PROVIDER"
PROVIDER_DECISION = "PROVIDER_DECISION"
CANCEL_MENU = "CANCEL_MENU"
CANCEL_REASON = "CANCEL_REASON"

def generate_readable_id() -> str:
    return "SR-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

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
    
    # Generic Cancel Command
    if msg.lower() in ["cancelar", "sair", "parar"] and state not in [CANCEL_MENU, CANCEL_REASON]:
        chat_session.current_state = WELCOME
        chat_session.data = {}
        db.add(chat_session)
        db.commit()
        return "Operação cancelada. Se quiser iniciar, envie qualquer mensagem."
        
    # Intercept "cancelar serviço" command
    if "cancelar serviço" in msg.lower() or "cancelar servico" in msg.lower():
        # Look for active services for this phone number (either client or professional)
        client = db.exec(select(Client).where(Client.whatsapp_number == phone_number)).first()
        prof = db.exec(select(Professional).where(Professional.whatsapp_number == phone_number)).first()
        
        conditions = []
        if client:
            conditions.append(ServiceRequest.client_id == client.id)
        if prof:
            conditions.append(ServiceRequest.professional_id == prof.id)
            
        if not conditions:
            return "Você não possui serviços ativos para cancelar."
            
        active_requests = db.exec(
            select(ServiceRequest).where(or_(*conditions)).where(ServiceRequest.status.in_(["Pendente", "Aguardando Aceitação", "Em Andamento"]))
        ).all()
        
        if not active_requests:
            return "Você não possui serviços ativos para cancelar."
            
        chat_session.current_state = CANCEL_MENU
        chat_session.data = {"active_ids": [r.readable_id for r in active_requests]}
        db.add(chat_session)
        db.commit()
        
        response = "Serviços ativos encontrados:\n"
        for req in active_requests:
            response += f"- ID: {req.readable_id} ({req.service_type} em {req.scheduled_date.strftime('%d/%m/%Y')} às {req.scheduled_time.strftime('%H:%M')})\n"
        response += "\nPor favor, digite o ID do serviço que deseja cancelar:"
        return response

    if state == CANCEL_MENU:
        active_ids = data.get("active_ids", [])
        if msg.upper() in active_ids:
            data["cancel_target"] = msg.upper()
            chat_session.current_state = CANCEL_REASON
            chat_session.data = data
            db.add(chat_session)
            db.commit()
            return f"Você selecionou o serviço {msg.upper()}. Qual o motivo do cancelamento?"
        else:
            return "ID inválido. Por favor, digite um dos IDs listados acima (ex: SR-1234AB) ou 'sair' para abortar."

    if state == CANCEL_REASON:
        target_id = data.get("cancel_target")
        req = db.exec(select(ServiceRequest).where(ServiceRequest.readable_id == target_id)).first()
        if req:
            req.status = "Cancelado"
            req.cancellation_reason = msg
            db.add(req)
            db.commit()
            
            # Reset state
            chat_session.current_state = WELCOME
            chat_session.data = {}
            db.add(chat_session)
            db.commit()
            return f"O serviço {target_id} foi cancelado com sucesso. Motivo registrado: {msg}"
        else:
            chat_session.current_state = WELCOME
            db.add(chat_session)
            db.commit()
            return "Houve um erro ao cancelar o serviço (não encontrado). Retornando ao menu principal."

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
            response = "Buscando prestadores disponíveis na sua região (até 10km)..."
            
            # Geocode client address
            coords = get_coordinates(data.get('address'), data.get('cep'))
            if not coords:
                next_state = WELCOME
                data = {}
                return "Desculpe, não conseguimos localizar o seu endereço exato. Por favor, tente recomeçar com um endereço mais preciso."
                
            client_lat, client_lon = coords
            
            # Find professionals
            all_profs = db.exec(select(Professional)).all()
            nearby_profs = []
            
            for prof in all_profs:
                if prof.latitude is not None and prof.longitude is not None:
                    dist = calculate_distance(client_lat, client_lon, prof.latitude, prof.longitude)
                    if dist <= 10.0:
                        nearby_profs.append({"prof": prof, "distance": dist})
            
            if not nearby_profs:
                next_state = WELCOME
                data = {}
                return "Desculpe, no momento não há profissionais disponíveis num raio de 10km do seu endereço. Tente novamente mais tarde."
                
            # Sort by rating desc
            nearby_profs.sort(key=lambda x: x["prof"].rating, reverse=True)
            top_profs = nearby_profs[:5] # Max 5
            
            providers_data = []
            response = "Encontramos os seguintes profissionais próximos a você:\n\n"
            for idx, p in enumerate(top_profs):
                providers_data.append(str(p["prof"].id))
                response += f"{idx + 1}. {p['prof'].name} ({p['prof'].rating}★) - {p['distance']:.1f}km\n"
            
            response += "\nDigite o número do prestador que deseja escolher:"
            data["available_providers"] = providers_data
            data["client_lat"] = client_lat
            data["client_lon"] = client_lon
            next_state = CHOOSE_PROVIDER
            
        elif msg == "2":
            next_state = WELCOME
            data = {}
            response = "Pedido cancelado. Envie qualquer mensagem para recomeçar."
        else:
            response = "Por favor, digite 1 para Confirmar ou 2 para Cancelar."

    elif state == CHOOSE_PROVIDER:
        providers = data.get("available_providers", [])
        if msg.isdigit() and 1 <= int(msg) <= len(providers):
            chosen_prof_id = uuid.UUID(providers[int(msg) - 1])
            prof = db.exec(select(Professional).where(Professional.id == chosen_prof_id)).first()
            
            if not prof:
                return "Erro ao encontrar prestador. Escolha novamente:"
                
            # Create client if doesn't exist
            client = db.exec(select(Client).where(Client.whatsapp_number == phone_number)).first()
            if not client:
                client = Client(name="Usuário WhatsApp", whatsapp_number=phone_number)
                db.add(client)
                db.commit()
                db.refresh(client)
            
            # Create ServiceRequest
            readable_id = generate_readable_id()
            service_request = ServiceRequest(
                readable_id=readable_id,
                client_id=client.id,
                professional_id=prof.id,
                service_type=data.get('service_type'),
                home_type=data.get('home_type'),
                bedrooms=data.get('bedrooms'),
                bathrooms=data.get('bathrooms'),
                has_pets=data.get('has_pets'),
                cep=data.get('cep'),
                address=data.get('address'),
                scheduled_date=datetime.fromisoformat(data.get('scheduled_date')).date() if 'T' in data.get('scheduled_date') else datetime.strptime(data.get('scheduled_date'), "%Y-%m-%d").date(),
                scheduled_time=datetime.strptime(data.get('scheduled_time'), "%H:%M:%S").time(),
                status="Aguardando Aceitação"
            )
            db.add(service_request)
            db.commit()
            
            # Send ticket to provider (Simulated)
            prof_session = get_or_create_session(db, prof.whatsapp_number)
            prof_session.current_state = PROVIDER_DECISION
            prof_session.data = {
                "pending_service_id": readable_id,
                "ticket_time": datetime.utcnow().isoformat()
            }
            db.add(prof_session)
            db.commit()
            
            ticket_msg = (
                f"=== TICKET DE SERVIÇO ({readable_id}) ===\n"
                f"Cliente WhatsApp: {client.whatsapp_number}\n"
                f"Serviço: {service_request.service_type}\n"
                f"Data: {service_request.scheduled_date.strftime('%d/%m/%Y')} às {service_request.scheduled_time.strftime('%H:%M')}\n"
                f"Endereço: {service_request.address} (CEP: {service_request.cep})\n"
                "Para aceitar, digite 1. Para recusar, digite 2."
            )
            # Use real API to send proactive message
            send_whatsapp_message(prof.whatsapp_number, ticket_msg)
            
            next_state = WELCOME
            data = {}
            response = f"Pedido {readable_id} enviado para {prof.name}! O prestador tem 5 minutos para aceitar. Se não aceitar, o pedido será recusado."
        else:
            response = f"Opção inválida. Digite um número de 1 a {len(providers)}:"

    elif state == PROVIDER_DECISION:
        pending_id = data.get("pending_service_id")
        ticket_time_str = data.get("ticket_time")
        
        req = db.exec(select(ServiceRequest).where(ServiceRequest.readable_id == pending_id)).first()
        
        if not req or req.status != "Aguardando Aceitação":
            next_state = WELCOME
            data = {}
            return "Você não tem serviços pendentes ou este serviço já foi cancelado."
            
        ticket_time = datetime.fromisoformat(ticket_time_str)
        if (datetime.utcnow() - ticket_time).total_seconds() > 300: # 5 minutes
            req.status = "Recusado"
            db.add(req)
            db.commit()
            next_state = WELCOME
            data = {}
            client_msg = f"O prestador demorou para responder e o serviço {req.readable_id} expirou. Envie qualquer mensagem para tentar novamente."
            send_whatsapp_message(req.client.whatsapp_number, client_msg)
            return "O tempo de 5 minutos expirou. O serviço foi automaticamente recusado."
            
        if msg == "1":
            req.status = "Em Andamento"
            db.add(req)
            db.commit()
            next_state = WELCOME
            data = {}
            client_msg = f"Seu serviço {req.readable_id} foi ACEITO pelo prestador! Entre em contato com ele pelo número {phone_number}."
            send_whatsapp_message(req.client.whatsapp_number, client_msg)
            response = f"Você aceitou o serviço {req.readable_id}! O número do cliente é {req.client.whatsapp_number}. Pode entrar em contato com ele diretamente."
        elif msg == "2":
            req.status = "Recusado"
            db.add(req)
            db.commit()
            next_state = WELCOME
            data = {}
            client_msg = f"Infelizmente o prestador recusou o serviço {req.readable_id}. Envie qualquer mensagem para tentar novamente."
            send_whatsapp_message(req.client.whatsapp_number, client_msg)
            response = f"Você recusou o serviço {req.readable_id}."
        else:
            response = "Por favor, digite 1 para Aceitar ou 2 para Recusar o serviço."

    # Update session state and data
    chat_session.current_state = next_state
    
    # In SQLite JSON columns via SQLModel, we need to assign a new dict or use flag_modified
    chat_session.data = data
    chat_session.updated_at = datetime.now()
    db.add(chat_session)
    db.commit()

    return response
