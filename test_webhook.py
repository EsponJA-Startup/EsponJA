import os
import requests

N8N_WEBHOOK_URL = None
try:
    with open('server/.env', 'r') as f:
        for line in f:
            if line.startswith('N8N_WEBHOOK_URL='):
                N8N_WEBHOOK_URL = line.strip().split('=', 1)[1]
except FileNotFoundError:
    pass

if not N8N_WEBHOOK_URL:
    N8N_WEBHOOK_URL = os.getenv('N8N_WEBHOOK_URL')

if not N8N_WEBHOOK_URL:
    print("ERRO: N8N_WEBHOOK_URL não está definido no arquivo server/.env")
    exit(1)

# Remove barra final se houver
N8N_WEBHOOK_URL = N8N_WEBHOOK_URL.rstrip('/')

payload = {
    "email": "test@esponja.com",
    "phone": "11999999999",
    "first_access_password": "teste_senha_123"
}

def test_endpoint(path):
    url = f"{N8N_WEBHOOK_URL}{path}"
    print(f"\n--- Testando URL: {url} ---")
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        if response.status_code == 200:
            print("✅ SUCESSO! O n8n recebeu o webhook.")
        elif response.status_code == 404:
            print("❌ ERRO 404: Webhook não encontrado.")
            if "webhook-test" in path:
                print("   Dica: Você clicou em 'Execute Workflow' no n8n para escutar eventos de teste?")
            else:
                print("   Dica: O workflow está ATIVADO (Active) no n8n? Webhooks de produção só funcionam em workflows ativos.")
        else:
            print(f"⚠️ Resposta inesperada do n8n.")
    except requests.exceptions.RequestException as e:
        print(f"❌ Falha na conexão com {url}")
        print(f"   Erro: {e}")
        print("   Dica: Verifique se o ngrok está rodando e se a URL no .env está correta.")

# Testa o webhook de PRODUÇÃO
test_endpoint("/webhook/waitlist-esponja")

# Testa o webhook de TESTE (usado quando clica em "Execute Workflow" no n8n)
test_endpoint("/webhook-test/waitlist-esponja")
