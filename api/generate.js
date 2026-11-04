const { taskPrompt, parseJSON, ask } = require('../lib/ai');
module.exports = async (req, res) => {
 if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
 try {
  const body = req.body || {};
  const prompt = taskPrompt(body.task, body.params || {});
  if (!prompt) return res.status(400).json({error:'Unknown AI task.'});
  const raw = await ask('You are an expert English-learning content creator for Indonesian learners. Output valid JSON only, no markdown.\n\n' + prompt, 2800);
  return res.status(200).json(parseJSON(raw));
 } catch (e) { return res.status(e.status || 500).json({error:e.message || 'Unexpected server error.'}); }
};
