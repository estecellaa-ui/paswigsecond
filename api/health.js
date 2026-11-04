module.exports = async (req, res) => {
 res.setHeader('Cache-Control','no-store');
 return res.status(200).json({ready:!!process.env.ANTHROPIC_API_KEY, model:process.env.ANTHROPIC_MODEL || 'Claude Haiku'});
};
