import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it to your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePostCaption = async (title: string, categoryName: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Agisci come un Social Media Manager esperto per farmacie.
      Scrivi un post social (Instagram/Facebook) coinvolgente, professionale ed empatico basato sui seguenti dettagli:
      
      Argomento: ${title}
      Categoria: ${categoryName}
      
      Il post deve:
      1. Avere una lunghezza media (circa 50-80 parole).
      2. Includere emoji pertinenti.
      3. Includere 3-4 hashtag rilevanti in italiano.
      4. Avere una "Call to Action" finale che invita in farmacia.
      5. Non usare formattazione markdown (niente grassetto o asterischi), solo testo puro.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Impossibile generare il contenuto al momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ""; // Return empty string on error so UI can handle it gracefully
  }
};

export const generatePostImage = async (title: string, categoryName: string): Promise<string | null> => {
  try {
    const ai = getClient();
    // Prompt engineered for safe, professional pharmacy context
    const prompt = `Genera un'immagine fotorealistica, professionale, luminosa e pulita per un post Instagram di una farmacia. 
    L'immagine deve rappresentare visivamente questo argomento: "${title}". 
    Contesto: ${categoryName}. 
    Stile: Fotografia di alta qualità, colori rassicuranti (bianco, verde acqua, blu), composizione moderna. 
    Nessun testo all'interno dell'immagine.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      },
    });

    // Iterate through parts to find the image data
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
};
