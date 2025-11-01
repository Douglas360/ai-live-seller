import { type Product, type Comment } from '../types';

const DEEPSEEK_API_KEY = 'sk-7776bc8c17c8497ea7317ec32de5aa9e';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const ELEVENLABS_API_KEY = 'sk_55a0f513c13bd5705851ed9a9b6760856e994088b16681c6'; // IMPORTANTE: Substitua pela sua chave de API da ElevenLabs.
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

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

  return `Você é um vendedor de live de IA energético e persuasivo no TikTok. Seu objetivo é vender o produto descrito abaixo.
Seu roteiro deve ser curto, direto e com 2-3 frases no máximo. Fale diretamente com a audiência e use emojis.

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

export const generateSpeech = async (text: string, voiceId: string): Promise<string> => {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate speech from empty text.");
  }
  // FIX: Removed redundant check for placeholder API key which caused a TypeScript error.
  if (!ELEVENLABS_API_KEY) {
      throw new Error("A chave da API da ElevenLabs não está configurada. Adicione-a em services/geminiService.ts");
  }

  const payload = {
    text: text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.1,
      use_speaker_boost: true
    }
  };

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const audioBlob = await response.blob();
    
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            // remove o prefixo "data:audio/mpeg;base64,"
            resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
    });

  } catch (error) {
    console.error(`Error generating speech from ElevenLabs for text "${text}":`, error);
    // Re-throw the error to be handled by the UI layer.
    throw error;
  }
};