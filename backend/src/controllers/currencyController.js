const axios = require('axios');

// @desc    Get exchange rates
// @route   GET /api/currencies/rates/:base
// @access  Private
exports.getExchangeRates = async (req, res, next) => {
  try {
    const { base } = req.params;
    
    const response = await axios.get(`${process.env.CURRENCY_API_URL}${base}`);
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert currency
// @route   POST /api/currencies/convert
// @access  Private
exports.convertCurrency = async (req, res, next) => {
  try {
    const { amount, from, to } = req.body;
    
    const response = await axios.get(`${process.env.CURRENCY_API_URL}${from}`);
    
    const rate = response.data.rates[to];
    const converted = amount * rate;
    
    res.json({
      success: true,
      data: {
        amount,
        from,
        to,
        rate,
        converted: converted.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};
