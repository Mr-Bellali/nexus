import { useEffect, useState } from "react"
import useGlobal from "../../core/global"
import MessageBubbleFriend from "./MessageBubbleFriend"
import MessageBubbleMe from "./MessageBubbleMe"

interface MessageBubbleProps {
    index: any,
    message: any,
    friend: any,
    user: any,
  }
function MessageBubble({ index, message, user, friend }: MessageBubbleProps) {

  const [showTyping, setShowTyping] = useState(false)

  const messagesTyping = useGlobal(state => state.messagesTyping)

  useEffect(() => {
    if (index !== 0) return
    if (messagesTyping === null) {
      setShowTyping(false)
      return
    }
    setShowTyping(true)
    const check = setInterval(() => {
      const now = new Date()
      const ms = now - messagesTyping as number
      if (ms > 2000) {
        setShowTyping(false)
      }
    }, 1000)
    return () => clearInterval(check)
  }, [messagesTyping])


  if (index === 0) {
    if (showTyping) {
      return <MessageBubbleFriend content={message.content} friend={friend} typing={true} />
    }
    return
  }

  return user.account.id === message.accountId ? (
    <MessageBubbleMe
      content={message.content}

    />
  ) : (
    <MessageBubbleFriend
      content={message.content}
      friend={friend}
      typing={false}
    />
  )
}

export default MessageBubble