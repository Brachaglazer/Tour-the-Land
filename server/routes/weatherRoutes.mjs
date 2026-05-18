import express from "express";

const router = express.Router();
const apiKey = process.env.WEATHER_API_KEY;
const baseUrl = "http://dataservice.accuweather.com";

router.get('/locations', async (req, res) => {
    const city = req.query.q;
    if (!city) return res.status(400).json({ message: 'City is required' });
    if (!apiKey) return res.status(500).json({ message: 'Weather API key is not configured' });

    try {
        const response = await fetch(`${baseUrl}/locations/v1/cities/search?apikey=${apiKey}&q=${encodeURIComponent(city)}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Weather lookup failed' });
    }
});

router.get('/current/:locationKey', async (req, res) => {
    const locationKey = req.params.locationKey;
    if (!locationKey) return res.status(400).json({ message: 'Location key is required' });
    if (!apiKey) return res.status(500).json({ message: 'Weather API key is not configured' });

    try {
        const response = await fetch(`${baseUrl}/currentconditions/v1/${locationKey}?apikey=${apiKey}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to load weather conditions' });
    }
});

export default router;
