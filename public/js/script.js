const apiBase = "";

function getAuthToken() {
    return localStorage.getItem('jwtToken');
}

function getUserName() {
    return localStorage.getItem('userName') || '';
}

function getUserId() {
    return localStorage.getItem('userId') || null;
}

function checkAuth() {
    return Boolean(getAuthToken());
}

function setAuthInfo(token, name, id) {
    if (token) {
        localStorage.setItem('jwtToken', token);
    }
    if (name) {
        localStorage.setItem('userName', name);
    }
    if (id) {
        localStorage.setItem('userId', id);
    }
}

function clearAuthInfo() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
}

function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const navGreeting = document.getElementById('nav-greeting');
    const userGreeting = document.getElementById('user-greeting');
    const name = getUserName();
    const loggedIn = checkAuth();

    if (authLink) {
        if (loggedIn) {
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.onclick = (event) => {
                event.preventDefault();
                logoutUser();
            };
        } else {
            authLink.textContent = 'Login';
            authLink.href = '/views/login.html';
            authLink.onclick = null;
        }
    }

    if (navGreeting) {
        navGreeting.textContent = loggedIn ? `Hi, ${name}` : '';
    }

    if (userGreeting) {
        userGreeting.textContent = loggedIn ? `Hi, ${name}!` : '';
    }
}

function handleJsonResponse(response) {
    return response.json().then((data) => {
        if (!response.ok) {
            return Promise.reject(data);
        }
        return data;
    });
}

async function loadCurrentUser() {
    const token = getAuthToken();
    if (!token) {
        clearAuthInfo();
        return null;
    }

    try {
        const user = await fetch(`${apiBase}/users/me`, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(handleJsonResponse);

        setAuthInfo(token, `${user.first_name} ${user.last_name}`, user.id);
        return user;
    } catch (error) {
        clearAuthInfo();
        return null;
    }
}

function registerUser() {
    const registerData = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    const responseBox = document.getElementById('response-message');

    if (!registerData.first_name.trim() || !registerData.last_name.trim() || !registerData.email.trim() || !registerData.password.trim()) {
        responseBox.style.display = 'block';
        responseBox.className = 'error';
        responseBox.innerText = 'Please fill in all fields.';
        return;
    }

    if (registerData.password.trim().length < 8) {
        responseBox.style.display = 'block';
        responseBox.className = 'error';
        responseBox.innerText = 'Password must be at least 8 characters long.';
        return;
    }

    fetch(`${apiBase}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
    })
        .then(handleJsonResponse)
        .then(data => {
            responseBox.style.display = 'block';
            responseBox.className = 'success';
            responseBox.innerText = data.message;
            window.location.href = '/views/login.html';
        })
        .catch((error) => {
            responseBox.style.display = 'block';
            responseBox.className = 'error';
            responseBox.innerText = error?.message || 'Failed to register. Please try again.';
        });
}

function loginUser() {
    const userData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    const responseBox = document.getElementById('response-message');

    if (!userData.email.trim() || !userData.password.trim()) {
        responseBox.style.display = 'block';
        responseBox.className = 'error';
        responseBox.innerText = 'Email and password are required.';
        return;
    }

    fetch(`${apiBase}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
        .then(handleJsonResponse)
        .then(data => {
            setAuthInfo(data.token, `${data.first_name} ${data.last_name}`, data.id);
            updateAuthUI();
            responseBox.style.display = 'block';
            responseBox.className = 'success';
            responseBox.innerText = data.message || 'Logged in successfully.';
            window.location.href = '/views/index.html';
        })
        .catch((error) => {
            responseBox.style.display = 'block';
            responseBox.className = 'error';
            responseBox.innerText = error?.message || 'Failed to login. Please try again.';
        });
}

function logoutUser() {
    fetch(`${apiBase}/users/logout`, {
        method: 'POST'
    }).finally(() => {
        clearAuthInfo();
        updateAuthUI();
        window.location.href = '/views/login.html';
    });
}

function sendFooterContact() {
    const contact = {
        name: document.getElementById('footerName')?.value,
        email: document.getElementById('footerEmail')?.value,
        message: document.getElementById('footerMessage')?.value
    };

    fetch(`${apiBase}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    })
        .then(handleJsonResponse)
        .then(data => alert(data.message));
}

function sendContact() {
    const contact = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    const responseBox = document.getElementById('response-message');

    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) {
        responseBox.style.display = 'block';
        responseBox.className = 'error';
        responseBox.innerText = 'Please fill in all fields.';
        return;
    }

    fetch(`${apiBase}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    })
        .then(handleJsonResponse)
        .then(data => {
            responseBox.style.display = 'block';
            responseBox.className = 'success';
            responseBox.innerText = data.message;
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('message').value = '';
        })
        .catch((error) => {
            responseBox.style.display = 'block';
            responseBox.className = 'error';
            responseBox.innerText = error?.message || 'Failed to send message.';
        });
}

function addReview() {
    const name = document.getElementById('reviewName').value.trim();
    const text = document.getElementById('reviewText').value.trim();
    const feedback = document.getElementById('review-feedback');

    if (!feedback) return;

    if (!checkAuth()) {
        feedback.style.display = 'block';
        feedback.className = 'error';
        feedback.innerText = 'Please log in to make a review.';
        return;
    }

    if (!name || !text) {
        feedback.style.display = 'block';
        feedback.className = 'error';
        feedback.innerText = 'Please provide both your name and a review.';
        return;
    }

    const review = {
        name,
        text,
        date: new Date().toLocaleDateString()
    };

    fetch(`${apiBase}/reviews/addReview`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + getAuthToken()
        },
        body: JSON.stringify(review)
    })
        .then(handleJsonResponse)
        .then(() => {
            feedback.style.display = 'block';
            feedback.className = 'success';
            feedback.innerText = 'Thank you! Your review has been added.';
            document.getElementById('reviewName').value = '';
            document.getElementById('reviewText').value = '';
            renderReviews();
        })
        .catch((error) => {
            feedback.style.display = 'block';
            feedback.className = 'error';
            feedback.innerText = error?.message || 'Failed to add review. Try again later.';
        });
}

function renderReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    fetch(`${apiBase}/reviews/`)
        .then(handleJsonResponse)
        .then(reviews => {
            if (!reviews.length) {
                reviewsList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to share your experience.</p>';
                return;
            }

            reviewsList.innerHTML = reviews.map((review, index) => `
                <article class="review-card" style="animation-delay: ${index * 0.08}s;">
                    <div class="review-meta">
                        <strong>${review.name}</strong>
                        <span>${review.date}</span>
                    </div>
                    <p>${review.text}</p>
                </article>
            `).join('');
        })
        .catch(() => {
            reviewsList.innerHTML = '<p class="no-reviews">Failed to load reviews. Try again later.</p>';
        });
}

function addSuggestTrip() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('suggestId');
    if (id == 1) {
        document.getElementById('tripLocation').value = 'Yerushalayim';
        document.getElementById('tripDesc').value = 'Explore the Kedusha of the city.';
    } 
    else if (id == 2) {
        document.getElementById('tripLocation').value = 'Chaifa';
        document.getElementById('tripDesc').value = 'Learn about the major port city of Israel.';
    } 
    else if (id == 3) {
        document.getElementById('tripLocation').value = 'Eilat';
        document.getElementById('tripDesc').value = 'Discover the beauty of Southern Israel.';
    }
}

function addTrip() {
    const title = document.getElementById('tripLocation').value.trim();
    const description = document.getElementById('tripDesc').value.trim();
    const start_date = document.getElementById('tripStart').value.trim();
    const end_date = document.getElementById('tripEnd').value.trim();
    const feedback = document.getElementById('trip-feedback');

    if (!feedback) return;

    if (!checkAuth()) {
        feedback.style.display = 'block';
        feedback.className = 'error';
        feedback.innerText = 'Please log in to add a trip.';
        return;
    }

    if (!title || !description) {
        feedback.style.display = 'block';
        feedback.className = 'error';
        feedback.innerText = 'Please provide both the location name and description.';
        return;
    }

    const userId = getUserId();
    if (!userId) {
        feedback.style.display = 'block';
        feedback.className = 'error';
        feedback.innerText = 'Please log in to add a trip.';
        return;
    }

    const trip = {
        title,
        description,
        user_id: userId,
        start_date: start_date ? new Date(start_date).toLocaleDateString() : '',
        end_date: end_date ? new Date(end_date).toLocaleDateString() : ''
    };

    fetch(`${apiBase}/trips/addTrip`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + getAuthToken()
        },
        body: JSON.stringify(trip)
    })
        .then(handleJsonResponse)
        .then(() => {
            feedback.style.display = 'block';
            feedback.className = 'success';
            feedback.innerText = 'Your trip has been added. Start packing!';
            document.getElementById('tripLocation').value = '';
            document.getElementById('tripDesc').value = '';
            document.getElementById('tripStart').value = null;
            document.getElementById('tripEnd').value = null;
            renderTrips();
        })
        .catch((error) => {
            feedback.style.display = 'block';
            feedback.className = 'error';
            feedback.innerText = error?.message || 'Failed to add trip. Try again later.';
        });
}

function toggleActivityForm(tripId) {
    const form = document.getElementById(`activityForm-${tripId}`);
    if (!form) return;
    form.classList.toggle('hide');
}

function submitActivity(tripId) {
    const titleInput = document.getElementById(`activityTitle-${tripId}`);
    const timeInput = document.getElementById(`activityTime-${tripId}`);
    const descriptionInput = document.getElementById(`activityDesc-${tripId}`);
    const feedback = document.getElementById(`activityFeedback-${tripId}`);

    if (!titleInput || !feedback) return;

    const title = titleInput.value.trim();
    const time = timeInput?.value.trim() || '';
    const description = descriptionInput?.value.trim() || '';

    if (!title) {
        feedback.style.display = 'block';
        feedback.className = 'activity-feedback error';
        feedback.innerText = 'Activity title is required.';
        return;
    }

    fetch(`${apiBase}/trips/addActivity/${tripId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + getAuthToken()
        },
        body: JSON.stringify({ title, time, description })
    })
        .then(handleJsonResponse)
        .then(() => {
            feedback.style.display = 'block';
            feedback.className = 'activity-feedback success';
            feedback.innerText = 'Activity added!';
            titleInput.value = '';
            if (timeInput) timeInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
            renderTrips();
        })
        .catch((error) => {
            feedback.style.display = 'block';
            feedback.className = 'activity-feedback error';
            feedback.innerText = error?.message || 'Failed to add activity. Try again later.';
        });
}

function showWeather() {
    const city = document.getElementById('tripLocation')?.value.trim();
    const modal = document.getElementById('weatherModal');
    const overlay = document.getElementById('weatherModalOverlay');

    if (!city || !modal || !overlay) return;

    function renderWeatherModal(content) {
        overlay.style.display = 'block';
        modal.style.display = 'block';
        modal.innerHTML = content;
    }

    fetch(`${apiBase}/weather/locations?q=${encodeURIComponent(city)}`)
        .then(handleJsonResponse)
        .then(data => {
            if (!data.length) throw new Error('City not found');
            const locationKey = data[0].Key;
            return fetch(`${apiBase}/weather/current/${locationKey}`).then(handleJsonResponse);
        })
        .then(weatherData => {
            const weather = weatherData[0];
            renderWeatherModal(`
                <span id="modalClose" onclick="closeWeatherModal()">?</span>
                <h2>Curious about the weather in ${city}?</h2>
                <p class="weatherDetail"><span class="weatherQ">How warm is it?</span> <span class="weatherA">${weather.Temperature.Imperial.Value} °F</span></p>
                <p class="weatherDetail"><span class="weatherQ">Is it raining?</span> <span class="weatherA">${weather.HasPrecipitation ? 'Yes! Grab an umbrella!' : 'Nope, all dry!'}</span></p>
                <p class="weatherDetail"><span class="weatherQ">What's the sky status?</span> <span class="weatherA">${weather.WeatherText}</span></p>
                <p class="weatherDetail"><span class="weatherQ">What else can you tell me?</span> <span class="weatherA"><a href="${weather.Link}" target="_blank">See more!</a></span></p>
            `);
        })
        .catch(() => {
            renderWeatherModal(`
                <span id="modalClose" onclick="closeWeatherModal()">?</span>
                <h2>Weather lookup failed</h2>
                <p>Please try again later or check the city name.</p>
            `);
        });
}

function closeWeatherModal() {
    const overlay = document.getElementById('weatherModalOverlay');
    if (overlay) overlay.style.display = 'none';
}

function renderTrips() {
    const tripsList = document.getElementById('tripsList');
    if (!tripsList) return;

    const userId = getUserId();
    if (!userId) {
        tripsList.innerHTML = '<p class="no-trips">Please log in to view your trips.</p>';
        return;
    }

    fetch(`${apiBase}/trips/${userId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + getAuthToken()
        }
    })
        .then(handleJsonResponse)
        .then(trips => {
            if (!trips.length) {
                tripsList.innerHTML = '<p class="no-trips">No trips yet. Begin planning your first!</p>';
                return;
            }

            tripsList.innerHTML = trips.map((trip, index) => {
                const activities = Array.isArray(trip.activities) ? trip.activities : [];
                const activitiesHtml = activities.length ? activities.map(activity => `
                    <article class="activity-card">
                        <div class="activity-header">
                            ${activity.time ? `<span class="activity-time">${activity.time}</span><span class="activity-separator">-</span>` : ''}
                            <span class="activity-title">${activity.title}</span>
                        </div>
                        ${activity.description ? `<p class="activity-description">${activity.description}</p>` : ''}
                        ${activity.activityId ? `
                        <div class="activity-actions">
                            <button type="button" class="btn btn-secondary small" onclick="toggleActivityEditForm('${trip._id}','${activity.activityId}')">Edit</button>
                            <button type="button" class="btn btn-secondary small btn-danger" onclick="deleteActivity('${trip._id}','${activity.activityId}')">Delete</button>
                        </div>
                        <div id="activityEditForm-${trip._id}-${activity.activityId}" class="activity-form hide">
                            <label for="activityEditTitle-${trip._id}-${activity.activityId}">Activity title *</label>
                            <input id="activityEditTitle-${trip._id}-${activity.activityId}" type="text" value="${activity.title}" placeholder="Activity title">
                            <label for="activityEditTime-${trip._id}-${activity.activityId}">Time</label>
                            <input id="activityEditTime-${trip._id}-${activity.activityId}" type="text" value="${activity.time || ''}" placeholder="Ex: 10:00 AM or afternoon">
                            <label for="activityEditDesc-${trip._id}-${activity.activityId}">Description</label>
                            <textarea id="activityEditDesc-${trip._id}-${activity.activityId}" placeholder="Optional details">${activity.description || ''}</textarea>
                            <button type="button" class="btn btn-secondary small" onclick="saveActivity('${trip._id}','${activity.activityId}')">Save</button>
                            <button type="button" class="btn btn-secondary small" onclick="toggleActivityEditForm('${trip._id}','${activity.activityId}')">Cancel</button>
                            <div id="activityEditFeedback-${trip._id}-${activity.activityId}" class="activity-feedback"></div>
                        </div>
                        ` : ''}
                    </article>
                `).join('') : '<p class="no-activities">No activities yet. Add one for this trip.</p>';

                return `
                    <article class="trip-card" style="animation-delay: ${index * 0.08}s;">
                        <div class="trip-meta">
                            <strong>${trip.title}</strong>
                            <span>${trip.start_date} - ${trip.end_date}</span>
                        </div>
                        <p>${trip.description}</p>

                        <div class="trip-actions">
                            <button type="button" class="btn btn-secondary small" onclick="toggleTripEditForm('${trip._id}')">Edit Trip</button>
                            <button type="button" class="btn btn-secondary small btn-danger" onclick="deleteTrip('${trip._id}')">Delete Trip</button>
                        </div>

                        <div id="tripEditForm-${trip._id}" class="trip-edit-form hide">
                            <label for="editTripTitle-${trip._id}">Location *</label>
                            <input id="editTripTitle-${trip._id}" type="text" value="${trip.title}" placeholder="Trip location">
                            <label for="editTripDesc-${trip._id}">Description *</label>
                            <textarea id="editTripDesc-${trip._id}" placeholder="Trip description">${trip.description}</textarea>
                            <label for="editTripStart-${trip._id}">Start date</label>
                            <input id="editTripStart-${trip._id}" type="text" value="${trip.start_date}" placeholder="Start date">
                            <label for="editTripEnd-${trip._id}">End date</label>
                            <input id="editTripEnd-${trip._id}" type="text" value="${trip.end_date}" placeholder="End date">
                            <button type="button" class="btn btn-secondary small" onclick="saveTrip('${trip._id}')">Save Changes</button>
                            <button type="button" class="btn btn-secondary small" onclick="toggleTripEditForm('${trip._id}')">Cancel</button>
                            <div id="tripEditFeedback-${trip._id}" class="activity-feedback"></div>
                        </div>

                        <section class="activity-section">
                            <div class="activity-heading">
                                <h3>Activities</h3>
                                <button type="button" class="btn btn-secondary small" onclick="toggleActivityForm('${trip._id}')">+ Add Activity</button>
                            </div>
                            <div class="activity-list">
                                ${activitiesHtml}
                            </div>
                            <div id="activityForm-${trip._id}" class="activity-form hide">
                                <label for="activityTitle-${trip._id}">Activity title *</label>
                                <input id="activityTitle-${trip._id}" type="text" placeholder="Enter activity title">
                                <label for="activityTime-${trip._id}">Time</label>
                                <input id="activityTime-${trip._id}" type="text" placeholder="Ex: 10:00 AM or afternoon">
                                <label for="activityDesc-${trip._id}">Description</label>
                                <textarea id="activityDesc-${trip._id}" placeholder="Optional details"></textarea>
                                <button type="button" class="btn btn-secondary" onclick="submitActivity('${trip._id}')">Add Activity</button>
                                <div id="activityFeedback-${trip._id}" class="activity-feedback"></div>
                            </div>
                        </section>
                    </article>
                `;
            }).join('');
        })
        .catch(() => {
            tripsList.innerHTML = '<p class="no-trips">Failed to load trips. Try again later.</p>';
        });
}

function toggleTripEditForm(tripId) {
    const form = document.getElementById(`tripEditForm-${tripId}`);
    if (!form) return;
    form.classList.toggle('hide');
}

function saveTrip(tripId) {
    const titleInput = document.getElementById(`editTripTitle-${tripId}`);
    const descInput = document.getElementById(`editTripDesc-${tripId}`);
    const startInput = document.getElementById(`editTripStart-${tripId}`);
    const endInput = document.getElementById(`editTripEnd-${tripId}`);
    const feedback = document.getElementById(`tripEditFeedback-${tripId}`);

    if (!titleInput || !descInput || !feedback) return;

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const start_date = startInput?.value.trim() || '';
    const end_date = endInput?.value.trim() || '';

    if (!title || !description) {
        feedback.style.display = 'block';
        feedback.className = 'activity-feedback error';
        feedback.innerText = 'Title and description are required to save the trip.';
        return;
    }

    fetch(`${apiBase}/trips/updateTrip/${tripId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + getAuthToken()
        },
        body: JSON.stringify({ title, description, start_date, end_date })
    })
        .then(handleJsonResponse)
        .then(() => {
            feedback.style.display = 'block';
            feedback.className = 'activity-feedback success';
            feedback.innerText = 'Trip updated successfully.';
            toggleTripEditForm(tripId);
            renderTrips();
        })
        .catch((error) => {
            feedback.style.display = 'block';
            feedback.className = 'activity-feedback error';
            feedback.innerText = error?.message || 'Failed to update trip. Try again later.';
        });
}

function deleteTrip(tripId) {
    if (!confirm('Delete this trip and all its activities?')) return;

    fetch(`${apiBase}/trips/deleteTrip/${tripId}`, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + getAuthToken()
        }
    })
        .then(handleJsonResponse)
        .then(() => {
            renderTrips();
        })
        .catch((error) => {
            alert(error?.message || 'Failed to delete trip. Try again later.');
        });
}

function toggleActivityEditForm(tripId, activityId) {
    const form = document.getElementById(`activityEditForm-${tripId}-${activityId}`);
    if (!form) return;
    form.classList.toggle('hide');
}

function saveActivity(tripId, activityId) {
    const titleInput = document.getElementById(`activityEditTitle-${tripId}-${activityId}`);
    const timeInput = document.getElementById(`activityEditTime-${tripId}-${activityId}`);
    const descInput = document.getElementById(`activityEditDesc-${tripId}-${activityId}`);
    const feedback = document.getElementById(`activityEditFeedback-${tripId}-${activityId}`);

    if (!titleInput || !feedback) return;

    const title = titleInput.value.trim();
    const time = timeInput?.value.trim() || '';
    const description = descInput?.value.trim() || '';

    if (!title) {
        feedback.style.display = 'block';
        feedback.className = 'activity-feedback error';
        feedback.innerText = 'Activity title is required.';
        return;
    }

    fetch(`${apiBase}/trips/updateActivity/${tripId}/${activityId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + getAuthToken()
        },
        body: JSON.stringify({ title, time, description })
    })
        .then(handleJsonResponse)
        .then(() => {
            feedback.style.display = 'block';
            feedback.className = 'activity-feedback success';
            feedback.innerText = 'Activity updated successfully.';
            toggleActivityEditForm(tripId, activityId);
            renderTrips();
        })
        .catch((error) => {
            feedback.style.display = 'block';
            feedback.className = 'activity-feedback error';
            feedback.innerText = error?.message || 'Failed to update activity. Try again later.';
        });
}

function deleteActivity(tripId, activityId) {
    if (!confirm('Remove this activity from the trip?')) return;

    fetch(`${apiBase}/trips/deleteActivity/${tripId}/${activityId}`, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + getAuthToken()
        }
    })
        .then(handleJsonResponse)
        .then(() => {
            renderTrips();
        })
        .catch((error) => {
            alert(error?.message || 'Failed to delete activity. Try again later.');
        });
}

function reviewSuggestions() {
    const reviewSuggestions = document.getElementById('reviewSuggestions');
    if (!reviewSuggestions) return;

    const userId = getUserId();
    if (!userId) return;

    fetch(`${apiBase}/trips/${userId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + getAuthToken()
        }
    })
        .then(handleJsonResponse)
        .then(trips => {
            if (!trips.length) {
                reviewSuggestions.innerHTML = '<p class="no-trips">No trips yet? Begin planning your first!</p>';
                return;
            }

            reviewSuggestions.innerHTML = '<p id=".suggestTitle">Back from your trip? Let us know how it was!</p>';
            reviewSuggestions.innerHTML += trips.map((trip, index) => `
                <article class="trip-card" style="animation-delay: ${index * 0.08}s;">
                    <div class="trip-meta">
                        <strong>${trip.title}</strong>
                        <span>${trip.start_date} - ${trip.end_date}</span>
                        <span><a class="btn" href="/views/reviews.html">Write Review</a></span>
                    </div>
                </article>
            `).join('');
        })
        .catch(() => {
            reviewSuggestions.innerHTML = '';
        });
}

window.updateAuthUI = updateAuthUI;

document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser();
    updateAuthUI();
    renderReviews();
    renderTrips();
    reviewSuggestions();
    addSuggestTrip()
});
