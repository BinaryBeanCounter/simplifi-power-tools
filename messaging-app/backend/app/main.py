from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import asyncio
import uuid
import os
from twilio.rest import Client
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

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    print(f"Twilio initialized with phone number: {TWILIO_PHONE_NUMBER}")
else:
    print("Twilio not configured - missing credentials")

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
        print(f"Attempting to send SMS to {conversation.phone_number}")
        if not twilio_client:
            print("ERROR: Twilio not configured")
            raise HTTPException(status_code=500, detail="Twilio not configured")
        
        try:
            message_sid = twilio_client.messages.create(
                body=request.content,
                from_=TWILIO_PHONE_NUMBER,
                to=conversation.phone_number
            )
            print(f"SMS sent successfully! SID: {message_sid.sid}")
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
        if send_sms and conversation.phone_number and twilio_client:
            try:
                message_sid = twilio_client.messages.create(
                    body=content,
                    from_=TWILIO_PHONE_NUMBER,
                    to=conversation.phone_number
                )
                message_count += 1
                if message_count % 10 == 0:
                    print(f"Sent {message_count} SMS messages")
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
