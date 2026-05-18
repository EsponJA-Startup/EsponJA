import os
import requests

def send_whatsapp_message(to_number: str, body: str):
    """
    Sends a proactive WhatsApp message using the Twilio API.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_WHATSAPP_NUMBER")
    
    # Format the to_number according to Twilio standard if it's not already
    formatted_to = f"whatsapp:{to_number}" if not to_number.startswith("whatsapp:") else to_number
    formatted_from = f"whatsapp:{from_number}" if from_number and not from_number.startswith("whatsapp:") else from_number

    if not account_sid or not auth_token or not from_number:
        print(f"\n[AVISO - TWILIO DESABILITADO] Credenciais não encontradas no .env.")
        print(f"Mensagem que seria enviada para {to_number}:\n{body}\n")
        return False
        
    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    
    data = {
        "From": formatted_from,
        "To": formatted_to,
        "Body": body
    }
    
    try:
        response = requests.post(url, auth=(account_sid, auth_token), data=data)
        if response.status_code in [200, 201]:
            print(f"Mensagem enviada com sucesso para {to_number} via Twilio.")
            return True
        else:
            print(f"Erro ao enviar mensagem via Twilio ({response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"Exceção ao enviar mensagem via Twilio: {e}")
        return False
