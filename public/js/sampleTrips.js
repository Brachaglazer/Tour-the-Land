
window.sampleTrips = [
    {
        id: 'yerushalayim-tour',
        title: 'Yerushalayim Tour',
        description: 'Explore the Kedusha of the city while visiting sites like the Kosel, Geula, and Sorotzkin.',
        start_date: '2026-07-10',
        end_date: '2026-07-14',
        activities: [
            { activityId: 'yeru-1', title: 'Shachris at the Kosel', time: '8:00 AM', description: 'Enjoy a meaningful tefillah with Shachris at the Kosel.' },
            { activityId: 'yeru-2', title: 'Kever Dovid', time: '10:30 PM', description: 'Visit the nearby kever of Dovid Hamelech.' },
            { activityId: 'yeru-3', title: 'Lunch', time: '12:00 PM', description: 'Take a break at a falafel shop for a quick bite.' },
            { activityId: 'yeru-4', title: 'Kosel Tunnel Tour', time: '1:30 PM', description: 'Back to the Kosel for an underground look and deep history session.'},
            { activityId: 'yeru-5', title: 'Mincha at the Churvah', time: '3:30 PM', description: 'Enjoy an early Mincha at the Churvah.'},
            { activityId: 'yeru-6', title: 'Jewish Music Museum', time: '5:00 PM', description: 'Immerse yourself in the history of Jewish music at the museum.'}, 
            { activityId: 'yeru-7', title: 'Dinner in Geula', time: '7:00 PM', description: 'End the day with a delicious meal at a local restaurant in Geula.' },
            { activityId: 'yeru-8', title: 'City Walk', time: '8:00 PM', description: 'Walk along the bustling streets of Geula, or enjoy the quiet of the Old City before heading back for the night.'}
        ]
    },
    {
        id: 'chaifa-exploration',
        title: 'Chaifa Exploration',
        description: 'Discover ancient streets, cultural landmarks, and authentic local food.',
        start_date: '2026-09-05',
        end_date: '2026-09-09',
        activities: [
            { activityId: 'chaifa-1', title: 'Shachris at a Local Shul', time: '8:00 AM', description: 'Begin the morning with Shachris in one of Chaifa’s welcoming kehillos.' },
            { activityId: 'chaifa-2', title: 'Stroll Through the German Colony', time: '10:00 AM', description: 'Walk along the historic streets and enjoy the beautiful architecture and atmosphere.' },
            { activityId: 'chaifa-3', title: 'Visit the Madatech Science Center', time: '11:30 AM', description: 'Explore interactive exhibits and fascinating displays at the science museum.' },
            { activityId: 'chaifa-4', title: 'Lunch at a Mehadrin Restaurant', time: '1:00 PM', description: 'Relax with a satisfying kosher lunch at a local Mehadrin-certified restaurant.' },
            { activityId: 'chaifa-5', title: 'Bahai Gardens Viewpoint', time: '2:30 PM', description: 'Take in the breathtaking panoramic views overlooking the famous gardens and Haifa Bay.' },
            { activityId: 'chaifa-6', title: 'Mincha and Coffee Break', time: '4:30 PM', description: 'Stop for Mincha followed by coffee and light refreshments nearby.' },
            { activityId: 'chaifa-7', title: 'Visit Mercaz Carmel', time: '6:00 PM', description: 'Browse local shops and enjoy the lively evening atmosphere in the center of the city.' },
            { activityId: 'chaifa-8', title: 'Dinner and Evening Walk', time: '8:00 PM', description: 'Finish the day with dinner and a relaxing nighttime walk along the scenic streets of Chaifa.' }
        ]
    },
    {
        id: 'eilat-adventure',
        title: 'Eilat Adventure',
        description: 'Explore the beauty of Southern Israel and some of the funnest water activities.',
        start_date: '2026-10-16',
        end_date: '2026-10-20',
        activities: [
            { activityId: 'eilat-1', title: 'Shachris at Netz', time: '6:30 AM', description: 'Enjoy an uplifting Shachris while watching the sunrise over the mountains of Eilat.' },
            { activityId: 'eilat-2', title: 'Hotel Breakfast', time: '8:00 AM', description: 'Start the day with a fresh Israeli breakfast at the hotel dining room.' },
            { activityId: 'eilat-3', title: 'Coral Beach Nature Reserve', time: '9:30 AM', description: 'Explore the beautiful boardwalks and enjoy the clear waters and coral views.' },
            { activityId: 'eilat-4', title: 'Glass Bottom Boat Ride', time: '11:30 AM', description: 'See colorful sea life and coral reefs without getting into the water.' },
            { activityId: 'eilat-5', title: 'Lunch Break', time: '1:00 PM', description: 'Take a relaxing lunch break at a nearby kosher restaurant.' },
            { activityId: 'eilat-6', title: 'Camel Ranch Visit', time: '3:00 PM', description: 'Experience the desert atmosphere with a calm camel ride and scenic desert views.' },
            { activityId: 'eilat-7', title: 'Mincha Before Sunset', time: '5:30 PM', description: 'Gather for Mincha as the sun begins to set over the mountains.' },
            { activityId: 'eilat-8', title: 'Dinner and Night Walk on the טיילת', time: '7:30 PM', description: 'End the evening with a nice dinner and a peaceful walk along Eilat’s waterfront טיילת.' }
        ]
    }
];

window.getSampleTripById = function(id) {
    if (!id) return null;
    if (!isNaN(Number(id))) {
        const idx = Number(id) - 1;
        return window.sampleTrips[idx] || null;
    }
    return window.sampleTrips.find(s => s.id === id) || null;
};
