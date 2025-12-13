<script lang="ts">
  import ChatMessageComponent from './ChatMessage.svelte';
  import ChatInput from './ChatInput.svelte';
  import { ChatbotService } from '$lib/services/chatbot.service';

  let { userId = null, showOnLoad = false, title = 'EdgyAI' } = $props();
  
  const chatbot = new ChatbotService();
  
  // State using runes
  let messages = $state<Array<{
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    loading?: boolean;
  }>>([
    {
      id: 'welcome-1',
      type: 'bot',
      content: "Hi! I'm your order assistant. I can help you track orders, check status, or answer questions about shipping and returns.",
      timestamp: new Date()
    }
  ]);
  
  let isOpen = $state(false);
  let isLoading = $state(false);
  let chatContainer: HTMLDivElement;

  // Initialize
  $effect(() => {
    if (showOnLoad) {
      setTimeout(() => {
        isOpen = true;
      }, 1000);
    }
  });

  // Auto-scroll to bottom when messages change
  $effect(() => {
    messages; // Track messages for reactivity
    if (chatContainer) {
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 50);
    }
  });

  const toggleChat = () => {
    isOpen = !isOpen;
  };

  const generateId = () => {
    return Date.now() + '-' + Math.random().toString(36).substring(2, 11);
  };

  const addMessage = (content: string, type: 'user' | 'bot' = 'bot', loading = false, customId?: string) => {
    const id = customId || generateId();
    messages = [
      ...messages,
      {
        id,
        type,
        content,
        timestamp: new Date(),
        loading
      }
    ];
    return id; // Return the ID so we can reference it later
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    addMessage(content, 'user');
    isLoading = true;

    // Add loading message with a specific ID
    const loadingMessageId = generateId();
    addMessage('Thinking...', 'bot', true, loadingMessageId);

    try {
      const result = await chatbot.processMessage(content, userId || undefined);
      
      // Update the loading message with actual response
      messages = messages.map(msg => {
        if (msg.id === loadingMessageId) {
          return {
            ...msg,
            content: result.response,
            loading: false
          };
        }
        return msg;
      });
    } catch (error) {
      console.error('Chatbot error:', error);
      // Update loading message with error
      messages = messages.map(msg => {
        if (msg.id === loadingMessageId) {
          return {
            ...msg,
            content: "Sorry, I encountered an error. Please try again or contact support.",
            loading: false
          };
        }
        return msg;
      });
    } finally {
      isLoading = false;
    }
  };

  const quickReplies = [
    { label: 'Track Order', message: 'Track my order' },
    { label: 'Order Status', message: 'What\'s my order status?' },
    { label: 'Shipping Info', message: 'Shipping information' },
    { label: 'Returns', message: 'Return policy' },
    { label: 'Contact Support', message: 'Contact customer support' }
  ];
</script>

<button
  class="chatbot-toggle"
  class:open={isOpen}
  onclick={toggleChat}
  aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
>
  {#if isOpen}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  {/if}
</button>

{#if isOpen}
  <div class="chatbot-window">
    <div class="chatbot-header">
      <div class="chatbot-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <h3>{title}</h3>
      </div>
      <button 
        class="chatbot-close" 
        onclick={toggleChat}
        aria-label="Close chatbot"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="chatbot-messages" bind:this={chatContainer}>
      {#each messages as message (message.id)}
        <ChatMessageComponent {message} />
      {/each}
    </div>

    <div class="chatbot-quick-replies">
      {#each quickReplies as reply}
        <button
          class="quick-reply"
          onclick={() => handleSendMessage(reply.message)}
          disabled={isLoading}
        >
          {reply.label}
        </button>
      {/each}
    </div>

    <div class="chatbot-input">
      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isLoading}
        placeholder="Type your message..."
      />
    </div>
  </div>
{/if}

<style>
  /* Same styles as before */
  :global(:root) {
    --chatbot-primary: #3b82f6;
    --chatbot-bg: #ffffff;
    --chatbot-border: #e5e7eb;
    --chatbot-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .chatbot-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--chatbot-primary);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--chatbot-shadow);
    z-index: 9998;
    transition: all 0.3s ease;
  }

  .chatbot-toggle:hover {
    transform: scale(1.05);
    background: #2563eb;
  }

  .chatbot-toggle.open {
    background: #ef4444;
  }

  .chatbot-toggle.open:hover {
    background: #dc2626;
  }

  .chatbot-window {
    position: fixed;
    bottom: 96px;
    right: 24px;
    width: 400px;
    max-width: calc(100vw - 48px);
    height: 600px;
    max-height: calc(100vh - 120px);
    background: var(--chatbot-bg);
    border-radius: 12px;
    box-shadow: var(--chatbot-shadow);
    display: flex;
    flex-direction: column;
    z-index: 9999;
    overflow: hidden;
    border: 1px solid var(--chatbot-border);
  }

  .chatbot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--chatbot-border);
    background: var(--chatbot-bg);
  }

  .chatbot-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chatbot-title h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .chatbot-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
    border-radius: 4px;
  }

  .chatbot-close:hover {
    color: #111827;
    background: #f3f4f6;
  }

  .chatbot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .chatbot-quick-replies {
    display: flex;
    gap: 8px;
    padding: 0 16px 16px;
    overflow-x: auto;
    flex-wrap: wrap;
  }

  .quick-reply {
    padding: 8px 12px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .quick-reply:hover:not(:disabled) {
    background: #e5e7eb;
    color: #111827;
  }

  .quick-reply:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chatbot-input {
    padding: 16px;
    border-top: 1px solid var(--chatbot-border);
    background: var(--chatbot-bg);
  }

  @media (max-width: 640px) {
    .chatbot-window {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      bottom: 0;
      right: 0;
      border-radius: 0;
    }

    .chatbot-toggle {
      bottom: 16px;
      right: 16px;
    }
  }
</style>