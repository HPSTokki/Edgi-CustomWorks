<script lang="ts">
  import type { ChatMessage as ChatMessageType } from '$lib/services/chatbot.service';
  
  let { message } = $props<{ message: ChatMessageType }>();
</script>

<div class="chat-message" class:user={message.type === 'user'} class:bot={message.type === 'bot'}>
  <div class="message-content">
    {#if message.loading}
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    {:else}
      {@html message.content.replace(/\n/g, '<br>')}
    {/if}
  </div>
  <div class="message-time">
    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </div>
</div>

<style>
  .chat-message {
    max-width: 80%;
    display: flex;
    flex-direction: column;
  }

  .chat-message.user {
    align-self: flex-end;
  }

  .chat-message.bot {
    align-self: flex-start;
  }

  .message-content {
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.4;
  }

  .chat-message.user .message-content {
    background: #3b82f6;
    color: white;
    border-bottom-right-radius: 4px;
  }

  .chat-message.bot .message-content {
    background: #f3f4f6;
    color: #111827;
    border-bottom-left-radius: 4px;
  }

  .message-time {
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
    padding: 0 4px;
  }

  .chat-message.user .message-time {
    text-align: right;
  }

  .loading-dots {
    display: flex;
    gap: 4px;
    padding: 8px 0;
  }

  .loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
    animation: loading 1.4s infinite ease-in-out both;
  }

  .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
  .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes loading {
    0%, 80%, 100% { opacity: 0; }
    40% { opacity: 1; }
  }
</style>