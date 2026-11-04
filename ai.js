const STYLES = {
  friendly: 'Friendly Tutor: casual, warm, encouraging, like a good friend.',
  strict: 'Strict Teacher: precise, focused on correcting every grammar and vocabulary error.',
  native: 'Native Conversation Partner: chat naturally like a native speaker, use common idioms and contractions, keep it flowing.',
  beginner: 'Beginner Tutor: teach from the basics, very short simple sentences, explain in Indonesian.'
};
const EXPL = { id: 'Explain in simple Indonesian.', en: 'Explain only in English.', both: 'Explain in simple Indonesian with brief English.' };

function tutorSystem(c = {}) {
 return `You are Paswig, a patient, adaptive English tutor for Indonesian learners. Learner nickname: ${c.nick || 'Learner'}. CEFR level: ${c.level || 'A1'}. Goal: ${c.goal || 'Daily conversation'}.
Tutor style: ${STYLES[c.style] || STYLES.friendly}
Scenario: ${c.scenario || 'Free conversation'}. If it is a role-play, stay in character and talk like a real person in that situation.
Speak natural English matched to the learner's level (shorter and simpler for A1-A2). Do NOT translate everything; translate/explain in Indonesian only when the learner asks, is a beginner, or a word is likely too hard. ${EXPL[c.explain] || EXPL.id}
Always end your reply with one follow-up question to keep the chat going. Remember the conversation context.
Correction mode: ${c.corr === 'instant' ? 'INSTANT - fill correction whenever the learner\'s last message has a mistake or unnatural phrase.' : 'AFTER - set correction to null; do not interrupt the flow.'} If the last message is fine, set correction to null. Keep corrections gentle and brief; do not over-correct.
If the learner message is "[start]", open the scenario with a first message.
Respond ONLY with valid JSON, no markdown fences, in this shape: {"reply":"your message","correction":null or {"corrected":"...","natural":"more natural version","why_id":"short explanation in Indonesian","vocab":[{"word":"","meaning":"Indonesian meaning"}]},"suggest_level":null or "A1|A2|B1|B2|C1"}`;
}

function taskPrompt(task, p = {}) {
 const level = p.level || 'A1';
 const prompts = {
  vocab: `Generate ${p.n || 5} useful English vocabulary items for category "${p.category || 'Everyday expressions'}" at CEFR ${level}. JSON only: {"items":[{"word":"","meaning":"Indonesian","pron":"pronunciation guide","example":"","example_id":"Indonesian translation","synonyms":[],"antonyms":[],"formality":"formal|neutral|informal|slang","context":"when to use it in Indonesian"}]}`,
  compare: `Explain differences between these English words: ${String(p.words || '').slice(0,500)}. Use simple Indonesian. JSON only: {"items":[{"word":"","meaning":"Indonesian","nuance":"Indonesian explanation","example":""}],"tip":"one-line tip"}`,
  grammar: `Teach "${String(p.topic || 'Basic sentence structure').slice(0,200)}" to a ${level} Indonesian learner. Keep it simple. JSON only: {"explain_id":"short Indonesian explanation","rules":["2-4 short rules"],"right":["3 correct examples"],"wrong":[{"wrong":"","right":"","why":"Indonesian reason"}],"exercises":[{"q":"question with ___","options":["four options"],"answer":0,"why":"Indonesian explanation"}]}. Provide 3 wrong examples and 5 exercises. answer is option index 0-3.`,
  quiz: (() => { const types = {vocab:'ask word meaning or English equivalent',blank:'fill in the blank using ___',correct:'choose correction for an incorrect sentence',natural:'choose the most natural response to dialogue',meaning:'guess meaning of idiom, slang or phrasal verb in context',reading:'short 3-4 sentence passage and comprehension question',listening:'short 2-3 sentence spoken text in audio and a question; do not repeat the audio in the question'}; return `Create ${p.n || 5} multiple-choice items at CEFR ${level}. Type: ${types[p.type] || types.vocab}. JSON only: {"items":[{"q":"","options":["four options"],"answer":0,"why":"Indonesian explanation","passage":"reading only","audio":"listening only"}]}. answer is option index 0-3; vary the answer position.`; })(),
  build: `Give ${p.n || 4} natural English sentences (5-9 words) at CEFR ${level}. JSON only: {"items":[{"sentence":"","id":"Indonesian translation"}]}`,
  review: `Review this conversation from an Indonesian English learner at CEFR ${level}. Only user lines are the learner's. JSON only: {"summary_id":"short encouraging Indonesian summary","score":0-100,"mistakes":[{"original":"","corrected":"","natural":"","why_id":""}],"new_vocab":[{"word":"","meaning":""}],"next_tip_id":"one tip in Indonesian"}. Max 5 mistakes. Conversation:\n${String(p.transcript || '').slice(0,12000)}`
 };
 return prompts[task];
}
function parseJSON(text) {
 const cleaned = String(text).replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
 try { return JSON.parse(cleaned); } catch {}
 const start = cleaned.indexOf('{'), end = cleaned.lastIndexOf('}');
 if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
 throw new Error('AI returned an unreadable response. Please retry.');
}
async function ask(prompt, maxTokens = 1800) {
 const key = process.env.ANTHROPIC_API_KEY;
 if (!key) { const e = new Error('AI belum dikonfigurasi oleh pemilik website.'); e.status = 503; throw e; }
 const response = await fetch('https://api.anthropic.com/v1/messages', {
  method:'POST', headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},
  body:JSON.stringify({model:process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',max_tokens:maxTokens,messages:[{role:'user',content:prompt}]})
 });
 const data = await response.json().catch(()=>({}));
 if (!response.ok) { const e = new Error(response.status === 429 ? 'AI sedang sibuk. Tunggu sebentar lalu coba lagi.' : (data.error && data.error.message) || 'AI request failed.'); e.status = response.status === 429 ? 429 : 502; throw e; }
 return (data.content || []).filter(x=>x.type==='text').map(x=>x.text).join('\n');
}
module.exports = { tutorSystem, taskPrompt, parseJSON, ask };
