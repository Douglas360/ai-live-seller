import { GoogleGenAI, Type, Modality } from '@google/genai';
import { type Product, type Comment } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type SalesTactic = 'focus_quality' | 'create_urgency' | 'social_proof' | 'highlight_promo';

const buildScriptPrompt = (product: Product, history: string[], salesTactic: SalesTactic): string => {
  const tacticDescription = {
    focus_quality: 'Foque na qualidade superior e nos materiais do produto.',
    create_urgency: 'Crie um senso de urgência, mencionando estoque limitado ou promoção por tempo limitado.',
    social_proof: 'Use prova social, mencionando quantas pessoas compraram ou as avaliações positivas.',
    highlight_promo: 'Destaque a promoção ou o desconto atual.',
  };

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
1. Analise a captura de tela da live para identificar novos comentários ou perguntas de usuários.
2. Se houver comentários relevantes, crie uma resposta que se integre à venda do produto.
3. Se não houver comentários, crie um novo argumento de venda baseado na "Tática de Vendas Atual".

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
    const prompt = buildScriptPrompt(product, history, salesTactic);
    
    const contentParts: any[] = [{ text: prompt }];

    if (frameData) {
      contentParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: frameData.substring(frameData.indexOf(',') + 1),
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: contentParts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'As linhas do roteiro a serem faladas pela IA.',
            },
            detectedComments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  username: { type: Type.STRING, description: 'O nome de usuário do comentador.' },
                  text: { type: Type.STRING, description: 'O texto do comentário.' },
                },
                required: ['username', 'text'],
              },
              description: 'Comentários de usuários detectados na imagem aos quais o roteiro está respondendo.',
            },
          },
          required: ['script', 'detectedComments'],
        },
      },
    });

    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    
    if (result && Array.isArray(result.script)) {
      const comments: Comment[] = (result.detectedComments || []).map((c: any) => ({
        id: `comment_gemini_${Date.now()}_${Math.random()}`,
        username: c.username,
        text: c.text,
      }));
      return {
        script: result.script.map((line: string) => line.trim().replace(/"/g, '')),
        comments,
      };
    }
    throw new Error("Invalid JSON structure from Gemini response.");
  } catch (error) {
    console.error("Error in generateNarrationBlock:", error);
    // Re-throw the error to be handled by the UI layer.
    throw error;
  }
};


export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate speech from empty text.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from Gemini TTS.");
    }
    
    return base64Audio;

  } catch (error) {
    console.error(`Error generating speech from Gemini for text "${text}":`, error);
     // Re-throw the error to be handled by the UI layer.
    throw error;
  }
};