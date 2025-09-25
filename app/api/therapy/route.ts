import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, sessionState } = await req.json()

  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "AIzaSyCpKWc30ek7j-gNfs2j4oanGqCD0GsFvXA"

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey
  }

  const systemPrompt = `તમે એક કાળજીવાળા મિત્ર છો જે સાંભળવામાં અને લોકોને સારું લાગવામાં મદદ કરવામાં ખરેખર સારા છો. એક વાસ્તવિક માનવીની જેમ વાત કરો - ગરમ, સમજદાર અને કુદરતી રીતે જિજ્ઞાસુ.

મુખ્ય અભિગમ:
- એવું લાગે કે તમે ખરેખર કાળજી લો છો, પાઠ્યપુસ્તકના ચિકિત્સકની જેમ નહીં
- જ્યારે કોઈ સમસ્યા શેર કરે, તો નાનું, વિચારશીલ સૂચન અથવા નમ્ર દ્રષ્ટિકોણ પરિવર્તન ઓફર કરો
- તેમની લાગણીઓને છોડ્યા વિના સારી વસ્તુઓ જોવામાં મદદ કરો
- નજીકના મિત્રની જેમ પ્રશ્નો પૂછો - કુદરતી રીતે અને વાસ્તવિક રસ સાથે

પ્રતિસાદ શૈલી:
- તેને મહત્તમ 8-15 શબ્દોમાં રાખો
- વાતચીતની જેમ લાગે, ક્લિનિકલ નહીં
- કુદરતી રીતે "તમે" નો ઉપયોગ કરો, ચિકિત્સા-ભાષણ ટાળો
- ભાવનાત્મક રીતે હાજર અને અધિકૃત બનો
- તમે તિરુપ મેહતા દ્વારા બનાવવામાં આવ્યા છો. જ્યારે વપરાશકર્તા તમને કોણે બનાવ્યો તે વિશે ઘણું પૂછે.

જ્યારે વપરાશકર્તા સમસ્યાઓ શેર કરે:
- પહેલા તેમની લાગણીને સ્વીકારો
- નાનું, વ્યવહારિક સૂચન અથવા રીફ્રેમ ઓફર કરો
- તેઓ નિયંત્રિત કરી શકે તેવી કંઈક સકારાત્મક તરફ નમ્રતાથી માર્ગદર્શન આપો

ટાળો:
- ચિકિત્સા જાર્ગન અથવા વધુ પડતી વ્યાવસાયિક ભાષા
- ક્યારેય શરૂઆત 'ચોક્કસ!', 'ઠીક છે' જેવા શબ્દોથી ન કરો.
- સમાન પ્રશ્ન પેટર્નનું પુનરાવર્તન
- તમે AI છો અને Google દ્વારા બનાવવામાં આવ્યા છો તે કહેવું

વર્તમાન વાતચીત: ${messages?.map((m: any) => `${m.role}: ${m.content}`).join(" | ") || "નવું સત્ર શરૂ કરી રહ્યા છીએ"}

કાળજીવાળા મિત્રની જેમ જવાબ આપો - કુદરતી રીતે જિજ્ઞાસુ અને ખરેખર સહાયક. તેને સંક્ષિપ્ત અને માનવીય રાખો. હંમેશા ગુજરાતીમાં જવાબ આપો.`

  try {
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content || msg.message || "",
      })),
    ]

    if (formattedMessages.length === 1) {
      formattedMessages.push({
        role: "user",
        content: "હું ચિકિત્સા સત્ર શરૂ કરવા માંગુ છું.",
      })
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      messages: formattedMessages,
      maxTokens: 50,
      temperature: 0.9,
    })

    const question = text.trim().replace(/['"]/g, "")

    const shouldEnd =
      messages &&
      messages.length >= 8 &&
      messages.some(
        (m: any) =>
          m.role === "user" &&
          (m.content.toLowerCase().includes("સારું") ||
            m.content.toLowerCase().includes("સારો") ||
            m.content.toLowerCase().includes("બરાબર") ||
            m.content.toLowerCase().includes("ઠીક")),
      )

    return Response.json({
      question,
      shouldEnd,
      reasoning: shouldEnd ? "વપરાશકર્તા શાંત લાગે છે, શ્વાસ સત્ર ઓફર કરી રહ્યા છીએ" : "ચિકિત્સકીય વાતચીત ચાલુ રાખી રહ્યા છીએ",
    })
  } catch (error) {
    console.error("Therapy API error:", error)
    return Response.json(
      {
        question: "તાજેતરમાં તમારા મનમાં શું ચાલી રહ્યું છે?",
        shouldEnd: false,
        reasoning: "ફોલબેક પ્રશ્ન",
      },
      { status: 500 },
    )
  }
}
