import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, MessageSquarePlus, RotateCw, StopCircle, Smartphone } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Message {
  id: string
  conversation_id: string
  sender: string
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  name: string
  phone_number?: string
  created_at: string
}

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [senderName, setSenderName] = useState('User')
  const [newConversationName, setNewConversationName] = useState('')
  const [newConversationPhone, setNewConversationPhone] = useState('')
  const [isRepeating, setIsRepeating] = useState(false)
  const [repeatInterval, setRepeatInterval] = useState(100)
  const [sendSMS, setSendSMS] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
      
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedConversation.id)
      }, 500)
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversations`)
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`)
      if (!response.ok) {
        console.error('Error fetching messages:', response.status)
        setMessages([])
        return
      }
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    }
  }

  const createConversation = async () => {
    if (!newConversationName.trim()) return
    
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newConversationName,
          phone_number: newConversationPhone || null
        })
      })
      const data = await response.json()
      setConversations([...conversations, data])
      setSelectedConversation(data)
      setNewConversationName('')
      setNewConversationPhone('')
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return
    
    try {
      await fetch(`${API_URL}/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sender: senderName, 
          content: messageInput,
          send_sms: sendSMS
        })
      })
      setMessageInput('')
      fetchMessages(selectedConversation.id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const startRepeatMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return
    
    try {
      await fetch(`${API_URL}/api/conversations/${selectedConversation.id}/messages/repeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sender: senderName, 
          content: messageInput,
          interval_ms: repeatInterval,
          send_sms: sendSMS
        })
      })
      setIsRepeating(true)
    } catch (error) {
      console.error('Error starting repeat message:', error)
    }
  }

  const stopRepeatMessage = async () => {
    if (!selectedConversation) return
    
    try {
      await fetch(`${API_URL}/api/conversations/${selectedConversation.id}/messages/repeat`, {
        method: 'DELETE'
      })
      setIsRepeating(false)
      setMessageInput('')
    } catch (error) {
      console.error('Error stopping repeat message:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <MessageSquarePlus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="conversation-name">Conversation Name</Label>
                  <Input
                    id="conversation-name"
                    value={newConversationName}
                    onChange={(e) => setNewConversationName(e.target.value)}
                    placeholder="Enter conversation name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number (optional)</Label>
                  <Input
                    id="phone-number"
                    value={newConversationPhone}
                    onChange={(e) => setNewConversationPhone(e.target.value)}
                    placeholder="+1234567890"
                    onKeyDown={(e) => e.key === 'Enter' && createConversation()}
                  />
                  <p className="text-xs text-gray-500">For SMS: Enter phone number with country code</p>
                </div>
                <Button onClick={createConversation} className="w-full">
                  Create Conversation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-500 text-white">
                      {conv.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{conv.name}</p>
                    <p className="text-xs text-gray-500">
                      {conv.phone_number || new Date(conv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-500 text-white">
                    {selectedConversation.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedConversation.name}</h2>
                  <p className="text-xs text-gray-500">{messages.length} messages</p>
                </div>
              </div>
              {isRepeating && (
                <Badge variant="destructive" className="animate-pulse">
                  Repeating every {repeatInterval}ms
                </Badge>
              )}
            </div>

            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === senderName ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={
                        message.sender === senderName ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'
                      }>
                        {message.sender.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${message.sender === senderName ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">{message.sender}</span>
                        <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2 max-w-md ${
                          message.sender === senderName
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="max-w-4xl mx-auto space-y-3">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Your name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-32"
                  />
                  <Input
                    type="number"
                    placeholder="Interval (ms)"
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(Number(e.target.value))}
                    className="w-32"
                    min="10"
                  />
                  {selectedConversation.phone_number && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Checkbox
                        id="send-sms"
                        checked={sendSMS}
                        onCheckedChange={(checked) => setSendSMS(checked as boolean)}
                      />
                      <Label htmlFor="send-sms" className="text-sm cursor-pointer flex items-center gap-1">
                        <Smartphone className="w-4 h-4" />
                        Send SMS
                      </Label>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isRepeating && sendMessage()}
                    disabled={isRepeating}
                    className="flex-1"
                  />
                  {!isRepeating ? (
                    <>
                      <Button onClick={sendMessage} size="icon" className="bg-blue-500 hover:bg-blue-600">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={startRepeatMessage} 
                        size="icon" 
                        variant="outline"
                        className="border-orange-500 text-orange-500 hover:bg-orange-50"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={stopRepeatMessage} 
                      size="icon" 
                      variant="destructive"
                    >
                      <StopCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquarePlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No conversation selected</h2>
              <p className="text-gray-500">Select a conversation or create a new one to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
