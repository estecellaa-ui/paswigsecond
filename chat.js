const { tutorSystem, parseJSON, ask } = require('../lib/ai');
module.exports = async (req, res) => {
 if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
 try {
  const body = req.body || {};
  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  const safeMessages = messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0,2000) }));
  if (!safeMessages.length) return res.status(400).json({error:'No conversation message provided.'});
  const system = tutorSystem(body.config || {});
  const first = safeMessages[0];
  safeMessages[0] = { role:'user', content:system + '\n\nCONVERSATION BEGINS. Learner message: ' + first.content };
  const raw = await ask('Return only the JSON response requested by these instructions.\n\n' + safeMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n'), 1200);
  return res.status(200).json(parseJSON(raw));
 } catch (e) { return res.status(e.status || 500).json({error:e.message || 'Unexpected server error.'}); }
};
