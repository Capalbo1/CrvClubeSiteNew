// CHATBOT SIMPLES
  // BOTÃO ABRIR/FECHAR CHATBOT
  const chatbotToggle = document.getElementById("chatbotToggle");
  const chatbot = document.getElementById("chatbot");
  chatbotToggle.addEventListener("click", () => {
    chatbot.style.display = chatbot.style.display === "flex" ? "none" : "flex";
  });

  // RESPOSTAS FIXAS
  const respostas = {
    "horário de funcionamento": "O clube funciona de Terça a Sexta das 6h às 22h e nos fins de semana das 7h às 22h. Fechamos às segundas.",
    "preço da mensalidade": "A mensalidade atual é de R$ 150,00 por associado.",
    "atividades": "Temos piscina, quadras de tênis, futebol, academia e aulas de dança.",
    "contato": "Você pode falar conosco pelo telefone (15) 3251-4080 ou pelo e-mail secretaria@clubedecampodetatui.com.br."
  };

  function sendMessage() {
    const input = document.getElementById("user-input");
    const mensagem = input.value.trim().toLowerCase();
    if (!mensagem) return;

    // Exibe mensagem do usuário
    addMessage(mensagem, "user");

    // Verifica resposta
    let resposta = "Desculpe, não entendi. Tente perguntar sobre: horário de funcionamento, preço da mensalidade, atividades ou contato.";
    for (let chave in respostas) {
      if (mensagem.includes(chave)) {
        resposta = respostas[chave];
        break;
      }
    }

    // Exibe resposta do bot
    setTimeout(() => addMessage(resposta, "bot"), 600);

    input.value = "";
  }

  function addMessage(texto, classe) {
    const chatBody = document.getElementById("chat-body");
    const msg = document.createElement("div");
    msg.className = "chat-message " + classe;
    msg.textContent = texto;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
