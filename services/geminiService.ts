import { GoogleGenAI, Modality } from "@google/genai";
import { type Product, type Comment, type AudioProvider } from '../types';

const DEEPSEEK_API_KEY = 'sk-7776bc8c17c8497ea7317ec32de5aa9e';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_SPEECH_API_URL = 'https://api.openai.com/v1/audio/speech';


export type SalesTactic = 'focus_quality' | 'create_urgency' | 'social_proof' | 'highlight_promo';


const analyzeFrameWithOpenAI = async (frameData: string): Promise<string> => {
    const payload = {
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Analise esta captura de tela de uma live do TikTok. Identifique quaisquer comentários ou perguntas de usuários visíveis na imagem. Descreva os comentários que você encontrar em um formato de texto simples. Se não houver comentários, diga 'Nenhum comentário detectado'. Foque apenas nos comentários dos espectadores."
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: frameData,
                        }
                    }
                ]
            }
        ],
        max_tokens: 300
    };

    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};


const buildScriptPrompt = (product: Product, history: string[], salesTactic: SalesTactic, frameAnalysis: string | null): string => {
  const tacticDescription = {
    focus_quality: 'Foque na qualidade superior e nos materiais do produto.',
    create_urgency: 'Crie um senso de urgência, mencionando estoque limitado ou promoção por tempo limitado.',
    social_proof: 'Use prova social, mencionando quantas pessoas compraram ou as avaliações positivas.',
    highlight_promo: 'Destaque a promoção ou o desconto atual.',
  };

  const taskDescription = frameAnalysis
    ? `1. A análise da captura de tela da live é: "${frameAnalysis}".\n2. Crie uma resposta que se integre à venda do produto com base nessa análise.\n3. Se a análise não contiver comentários relevantes, crie um novo argumento de venda baseado na "Tática de Vendas Atual".`
    : `1. Não há análise de imagem. Crie um novo argumento de venda baseado na "Tática de Vendas Atual".`;

  return `Você é um especialista de produto e vendedor de IA carismático e persuasivo para uma live no TikTok. Seu objetivo é vender o produto descrito abaixo, focando em seus benefícios e características únicas.
**REGRAS IMPORTANTES:**
- **Seja criativo e evite repetições.** Não comece toda frase com "Galera" ou saudações genéricas. Varie suas aberturas.
- **Conecte-se com a audiência.** Faça perguntas, use os nomes das pessoas dos comentários quando responder, e crie uma conexão genuína.
- **Foque no valor.** Em vez de apenas listar características, explique como elas beneficiam o cliente.
- **Seja direto e conciso.** Mantenha o roteiro com 2-3 frases curtas e impactantes. Use emojis para dar energia.
- **Use a Tática de Vendas.** Integre a tática de vendas de forma natural na sua fala.

**Produto:**
- Nome: ${product.name}
- Preço: R$${product.salePrice ? product.salePrice.toFixed(2) : product.regularPrice.toFixed(2)}
- Descrição: ${product.description}
- Pontos de Venda:
${product.sellingPoints.map(p => `- ${p}`).join('\n')}
- Histórico Recente do Roteiro: ${history.join(' ')}

**Tática de Vendas Atual:** ${tacticDescription[salesTactic]}

**Sua Tarefa:**
${taskDescription}

Sua resposta DEVE ser um objeto JSON válido com duas chaves:
1. "script": um array de strings (cada string é uma linha do roteiro).
2. "detectedComments": um array de objetos, cada um com "username" e "text", representando os comentários aos quais você está respondendo. Retorne um array vazio se não estiver respondendo a nenhum.

Exemplo de Resposta:
{
  "script": ["A Maria perguntou se o material é bom. Maria, é de primeira qualidade! ✨", "É por isso que já vendemos mais de 500 unidades hoje!"],
  "detectedComments": [{ "username": "Maria", "text": "o material é bom?" }]
}`;
};

export const generateNarrationBlock = async (
  product: Product,
  history: string[],
  salesTactic: SalesTactic,
  frameData: string | null,
  processedCommentKeys: string[],
): Promise<{ script: string[]; comments: Comment[] }> => {
  try {
    let frameAnalysis: string | null = null;
    if (frameData) {
        try {
            frameAnalysis = await analyzeFrameWithOpenAI(frameData);
        } catch (error) {
            console.error("Error analyzing frame with OpenAI:", error);
            // Don't re-throw; proceed with a failure message so DeepSeek knows what happened.
            frameAnalysis = "A análise da imagem falhou.";
        }
    }

    const prompt = buildScriptPrompt(product, history, salesTactic, frameAnalysis);
    
    // The call to DeepSeek is now always text-only.
    const payload = {
      model: 'deepseek-chat',
      messages: [{
        role: 'user',
        content: prompt,
      }],
      response_format: { type: 'json_object' },
    };

    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    const jsonStr = data.choices[0].message.content;

    const result = JSON.parse(jsonStr);
    
    if (result && Array.isArray(result.script)) {
      const comments: Comment[] = (result.detectedComments || []).map((c: any) => ({
        id: `comment_deepseek_${Date.now()}_${Math.random()}`,
        username: c.username,
        text: c.text,
      }));
      return {
        script: result.script.map((line: string) => line.trim().replace(/"/g, '')),
        comments,
      };
    }
    throw new Error("Invalid JSON structure from DeepSeek response.");
  } catch (error) {
    console.error("Error in generateNarrationBlock (DeepSeek/OpenAI):", error);
    // Re-throw the error to be handled by the UI layer.
    throw error;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
            resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const generateSpeech = async (text: string, voiceId: string, provider: AudioProvider): Promise<string> => {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate speech from empty text.");
  }

  if (provider === 'openai') {
    if (!OPENAI_API_KEY) {
        throw new Error("A chave da API da OpenAI não está configurada. Adicione-a em services/geminiService.ts");
    }

    const payload = {
      model: "tts-1-hd",
      voice: voiceId,
      input: text,
    };

    try {
      const response = await fetch(OPENAI_SPEECH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`OpenAI Speech API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      
      const audioBlob = await response.blob();
      const base64Audio = await blobToBase64(audioBlob);
      return base64Audio;

    } catch (error) {
      console.error(`Error generating speech from OpenAI for text "${text}":`, error);
      throw error;
    }
  } else if (provider === 'google') {
    if (!process.env.API_KEY) {
        throw new Error("A chave da API do Google não está configurada. Verifique as variáveis de ambiente.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceId },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("A API do Google não retornou dados de áudio.");
        }
        return base64Audio;

    } catch(error) {
        console.error(`Error generating speech from Google for text "${text}":`, error);
        throw error;
    }
  }
  
  throw new Error(`Provedor de áudio desconhecido: ${provider}`);
};