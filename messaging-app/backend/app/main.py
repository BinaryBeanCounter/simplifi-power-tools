from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import asyncio
import uuid
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class Message(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    timestamp: str

class Conversation(BaseModel):
    id: str
    name: str
    phone_number: Optional[str] = None
    created_at: str

class CreateConversationRequest(BaseModel):
    name: str
    phone_number: Optional[str] = None

class SendMessageRequest(BaseModel):
    sender: str
    content: str
    send_sms: bool = False

class RepeatMessageRequest(BaseModel):
    sender: str
    content: str
    interval_ms: int = 100
    send_sms: bool = False

conversations_db = {}
messages_db = {}
repeat_tasks = {}

TMOBILE_CLIENT_ID = os.getenv("TMOBILE_CLIENT_ID")
TMOBILE_CLIENT_SECRET = os.getenv("TMOBILE_CLIENT_SECRET")
TMOBILE_ICCID = os.getenv("TMOBILE_ICCID")
TMOBILE_AUTH_URL = "https://api.t-mobile.com/oauth2/v1/token"
TMOBILE_SMS_URL = "https://api.t-mobile.com/messaging/v1/sms/notification"

tmobile_access_token = None
tmobile_token_expiry = None

async def get_tmobile_access_token():
    """Get T-Mobile OAuth 2.0 access token using client credentials flow"""
    global tmobile_access_token, tmobile_token_expiry
    
    if not TMOBILE_CLIENT_ID or not TMOBILE_CLIENT_SECRET:
        print("ERROR: T-Mobile credentials not configured")
        return None
    
    if tmobile_access_token and tmobile_token_expiry:
        if datetime.now().timestamp() < tmobile_token_expiry:
            return tmobile_access_token
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                TMOBILE_AUTH_URL,
                data={
                    "grant_type": "client_credentials",
                    "client_id": TMOBILE_CLIENT_ID,
                    "client_secret": TMOBILE_CLIENT_SECRET
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                tmobile_access_token = token_data.get("access_token")
                expires_in = token_data.get("expires_in", 3600)
                tmobile_token_expiry = datetime.now().timestamp() + expires_in - 60
                print(f"T-Mobile access token obtained, expires in {expires_in}s")
                return tmobile_access_token
            else:
                print(f"ERROR: Failed to get T-Mobile access token: {response.status_code} - {response.text}")
                return None
    except Exception as e:
        print(f"ERROR: Exception getting T-Mobile access token: {str(e)}")
        return None

async def send_tmobile_sms(phone_number: str, message: str):
    """Send SMS using T-Mobile SMS Notification API"""
    if not TMOBILE_ICCID:
        raise Exception("T-Mobile ICCID not configured")
    
    access_token = await get_tmobile_access_token()
    if not access_token:
        raise Exception("Failed to get T-Mobile access token")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                TMOBILE_SMS_URL,
                json={
                    "iccid": TMOBILE_ICCID,
                    "msisdn": phone_number,
                    "message": message
                },
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code in [200, 201, 202]:
                print(f"SMS sent successfully to {phone_number}")
                return response.json()
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                print(f"ERROR sending SMS: {error_msg}")
                raise Exception(error_msg)
    except Exception as e:
        print(f"ERROR: Exception sending SMS: {str(e)}")
        raise

if TMOBILE_CLIENT_ID and TMOBILE_CLIENT_SECRET and TMOBILE_ICCID:
    print(f"T-Mobile API configured with ICCID: {TMOBILE_ICCID}")
else:
    print("T-Mobile API not configured - missing credentials")

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/conversations", response_model=Conversation)
async def create_conversation(request: CreateConversationRequest):
    conversation_id = str(uuid.uuid4())
    conversation = Conversation(
        id=conversation_id,
        name=request.name,
        phone_number=request.phone_number,
        created_at=datetime.now().isoformat()
    )
    conversations_db[conversation_id] = conversation
    messages_db[conversation_id] = []
    return conversation

@app.get("/api/conversations", response_model=List[Conversation])
async def get_conversations():
    return list(conversations_db.values())

@app.get("/api/conversations/{conversation_id}/messages", response_model=List[Message])
async def get_messages(conversation_id: str):
    if conversation_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return messages_db.get(conversation_id, [])

@app.post("/api/conversations/{conversation_id}/messages", response_model=Message)
async def send_message(conversation_id: str, request: SendMessageRequest):
    print(f"Received message: send_sms={request.send_sms}, content={request.content[:50]}")
    
    if conversation_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = conversations_db[conversation_id]
    
    if request.send_sms and conversation.phone_number:
        print(f"Attempting to send SMS to {conversation.phone_number} via T-Mobile API")
        if not TMOBILE_CLIENT_ID or not TMOBILE_CLIENT_SECRET or not TMOBILE_ICCID:
            print("ERROR: T-Mobile API not configured")
            raise HTTPException(status_code=500, detail="T-Mobile API not configured")
        
        try:
            await send_tmobile_sms(conversation.phone_number, request.content)
            print(f"SMS sent successfully via T-Mobile API!")
        except Exception as e:
            print(f"ERROR sending SMS: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")
    
    message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        sender=request.sender,
        content=request.content,
        timestamp=datetime.now().isoformat()
    )
    messages_db[conversation_id].append(message)
    return message

async def repeat_message_task(conversation_id: str, sender: str, content: str, interval_ms: int, send_sms: bool = False):
    conversation = conversations_db.get(conversation_id)
    if not conversation:
        return
    
    print(f"Starting repeat task: send_sms={send_sms}, interval={interval_ms}ms")
    message_count = 0
    
    while conversation_id in repeat_tasks:
        if send_sms and conversation.phone_number:
            if TMOBILE_CLIENT_ID and TMOBILE_CLIENT_SECRET and TMOBILE_ICCID:
                try:
                    await send_tmobile_sms(conversation.phone_number, content)
                    message_count += 1
                    if message_count % 10 == 0:
                        print(f"Sent {message_count} SMS messages via T-Mobile API")
                except Exception as e:
                    print(f"Failed to send SMS: {str(e)}")
        
        message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            sender=sender,
            content=content,
            timestamp=datetime.now().isoformat()
        )
        messages_db[conversation_id].append(message)
        await asyncio.sleep(interval_ms / 1000.0)

@app.post("/api/conversations/{conversation_id}/messages/repeat")
async def start_repeat_message(conversation_id: str, request: RepeatMessageRequest):
    if conversation_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation_id in repeat_tasks:
        raise HTTPException(status_code=400, detail="Repeat message already active for this conversation")
    
    task = asyncio.create_task(
        repeat_message_task(conversation_id, request.sender, request.content, request.interval_ms, request.send_sms)
    )
    repeat_tasks[conversation_id] = task
    
    return {"status": "started", "interval_ms": request.interval_ms, "send_sms": request.send_sms}

@app.delete("/api/conversations/{conversation_id}/messages/repeat")
async def stop_repeat_message(conversation_id: str):
    if conversation_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation_id not in repeat_tasks:
        raise HTTPException(status_code=400, detail="No repeat message active for this conversation")
    
    task = repeat_tasks.pop(conversation_id)
    task.cancel()
    
    return {"status": "stopped"}
