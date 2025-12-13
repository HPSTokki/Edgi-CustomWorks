<script lang="ts">
  let { placeholder = 'Type a message...', disabled = false, onSend } = $props<{
    placeholder?: string;
    disabled?: boolean;
    onSend: (message: string) => void;
  }>();
  
  let inputValue = $state('');
  let textareaRef: HTMLTextAreaElement;

  const handleSubmit = () => {
    if (inputValue.trim() && !disabled) {
      onSend(inputValue.trim());
      inputValue = '';
      resetTextareaHeight();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef) {
      textareaRef.style.height = 'auto';
      textareaRef.style.height = Math.min(textareaRef.scrollHeight, 120) + 'px';
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef) {
      textareaRef.style.height = 'auto';
    }
  };

  $effect(() => {
    if (inputValue) {
      adjustTextareaHeight();
    }
  });
</script>

<div class="chat-input-container">
  <div class="chat-input-wrapper">
    <textarea
      bind:this={textareaRef}
      bind:value={inputValue}
      onkeydown={handleKeyDown}
      {placeholder}
      {disabled}
      rows="1"
      class="chat-input"
    ></textarea>
    <button
      onclick={handleSubmit}
      disabled={disabled || !inputValue.trim()}
      class="send-button"
      aria-label="Send message"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  </div>
</div>

<style>
  .chat-input-container {
    width: 100%;
  }

  .chat-input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 8px 12px;
    transition: border-color 0.2s;
  }

  .chat-input-wrapper:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .chat-input {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-size: 14px;
    line-height: 1.4;
    padding: 4px 0;
    min-height: 20px;
    max-height: 120px;
    background: transparent;
    color: #111827;
    font-family: inherit;
  }

  .chat-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chat-input::placeholder {
    color: #9ca3af;
  }

  .send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .send-button:hover:not(:disabled) {
    background: #2563eb;
    transform: scale(1.05);
  }

  .send-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
</style>