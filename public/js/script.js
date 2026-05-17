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
        localStorage.setItem('userId', id)
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

function registerUser() {
    const registerData = {
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const responseBox = document.getElementById("response-message");

    if (!registerData.first_name.trim() || !registerData.last_name.trim() || !registerData.email.trim() || !registerData.password.trim()) {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = "Please fill in all fields.";
        return;
    }

    if (registerData.password.trim().length < 8) {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = "Password must be at least 8 characters long.";
        return;
    }

    fetch(`${apiBase}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData)
    })
    .then(handleJsonResponse)
    .then(data => {
        responseBox.style.display = "block";
        responseBox.className = "success";
        responseBox.innerText = data.message;
        window.location.href = "/views/login.html";
    })
    .catch((error) => {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = error?.message || "Failed to register. Please try again.";
    });
}

function loginUser() {
    const userData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const responseBox = document.getElementById("response-message");

    if (!userData.email.trim() || !userData.password.trim()) {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = "Email and password are required.";
        return;
    }

    fetch(`${apiBase}/users/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(userData)
    })
    .then(handleJsonResponse)
    .then(data => {
        setAuthInfo(data.token, `${data.first_name} ${data.last_name}`, data.id);
        updateAuthUI();
        responseBox.style.display = "block";
        responseBox.className = "success";
        responseBox.innerText = data.message || "Logged in successfully.";
        window.location.href = "/views/index.html";
    })
    .catch((error) => {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = error?.message || "Failed to login. Please try again.";
    });
}

function logoutUser() {
    clearAuthInfo();
    updateAuthUI();
    window.location.href = "/views/login.html";
}

function sendFooterContact() {
    const contact = {
        name: document.getElementById("footerName")?.value,
        email: document.getElementById("footerEmail")?.value,
        message: document.getElementById("footerMessage")?.value
    };

    fetch(`${apiBase}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    })
    .then(handleJsonResponse)
    .then(data => alert(data.message));
}

function sendContact() {
    const contact = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value
    };

    const responseBox = document.getElementById("response-message");

    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = "Please fill in all fields.";
        return;
    }

    fetch(`${apiBase}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    })
    .then(handleJsonResponse)
    .then(data => {
        responseBox.style.display = "block";
        responseBox.className = "success";
        responseBox.innerText = data.message;
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("message").value = "";
    })
    .catch((error) => {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = error?.message || "Failed to send message.";
    });
}

function addReview() {
    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();
    const feedback = document.getElementById("review-feedback");

    if (!feedback) return;

    if (!checkAuth()) {
        feedback.style.display = "block";
        feedback.className = "error";
        feedback.innerText = "Please log in to make a review.";
        return;
    }

    if (!name || !text) {
        feedback.style.display = "block";
        feedback.className = "error";
        feedback.innerText = "Please provide both your name and a review.";
        return;
    }

    const review = {
        name,
        text,
        date: new Date().toLocaleDateString()
    };

    fetch(`${apiBase}/reviews/addReview`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + getAuthToken()
        },
        body: JSON.stringify(review)
    })
    .then(handleJsonResponse)
    .then(() => {
        feedback.style.display = "block";
        feedback.className = "success";
        feedback.innerText = "Thank you! Your review has been added.";

        document.getElementById("reviewName").value = "";
        document.getElementById("reviewText").value = "";

        renderReviews();
    })
    .catch((error) => {
        feedback.style.display = "block";
        feedback.className = "error";
        feedback.innerText = error?.message || "Failed to add review. Try again later.";
    });
}

function renderReviews() {
    const reviewsList = document.getElementById("reviewsList");
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
        `).join("");
    })
    .catch(() => {
        reviewsList.innerHTML = '<p class="no-reviews">Failed to load reviews. Try again later.</p>';
    });
}

function addTrip() {
    const title = document.getElementById("tripLocation").value.trim();
    const description = document.getElementById("tripDesc").value.trim();
    const user_id = getUserId();
    const start_date = document.getElementById("tripStart").value.trim();
    const end_date = document.getElementById("tripEnd").value.trim();
    const feedback = document.getElementById("trip-feedback");

    if (!feedback) return;

    if (!checkAuth()) {
        feedback.style.display = "block";
        feedback.className = "error";
        feedback.innerText = "Please log in to make a review.";
        return;
    }

    if (!title || !description) {
        feedback.style.display = "block";
        feedback.className = "error";
        feedback.innerText = "Please provide both the location name and description.";
        return;
    }
    const trip = {
        title,
        description,
        user_id,
        start_date: new Date(start_date).toLocaleDateString(),
        end_date: new Date(end_date).toLocaleDateString(),
    };
    fetch(`${apiBase}/trips/addTrip`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + getAuthToken()
        },
        body: JSON.stringify(trip)
    })
    .then(handleJsonResponse)
    .then(() => {
        feedback.style.display = "block";
        feedback.className = "success";
        feedback.innerText = "Your trip has been added. Start packing!";

        document.getElementById("tripLocation").value = "";
        document.getElementById("tripDesc").value = "";
        document.getElementById("tripStart").value = null;
        document.getElementById("tripEnd").value = null;

        renderTrips();
    })
    .catch((error) => {
        feedback.style.display = "block";
        feedback.className = "error";
        feedback.innerText = error?.message || "Failed to add trip. Try again later.";
    });
}

function showWeather() {
    const city = document.getElementById("tripLocation").value.trim();
    const modal = document.getElementById("weatherModal");

    let locationKey = ""
    fetch(`https://dataservice.accuweather.com/locations/v1/cities/search?q=${city}`,
        {
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + 'zpka_c43764e580f947d4ab01c232815d963b_f082852d'
            },
        }
    )
    .then(handleJsonResponse)
    .then(data => {
        locationKey = data[0].Key;
    })
    .catch((error) => {
        console.log("error fetching code")
    });

    let temp = "";
    let realFeel = "";
    let humidity = "";
    let wind = "";
    let link = "";

    /*fetch(`https://dataservice.accuweather.com/currentconditions/v1/${locationKey}`,
        {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:3000/",
                'Access-Control-Allow-Credentials': 'true',
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + 'zpka_c43764e580f947d4ab01c232815d963b_f082852d'
            },
        }
    )
    .then(handleJsonResponse)
    .then(data => {
        console.log("testing data returned", data);
        temp = data.Temperature;
        realFeel = data.RealFeelTemperature;
        humidity = data.RelativeHumidity;
        wind = data.Wind;
        link = data.Link;
    })
    .catch((error) => {
        console.log("error fetching weather")
    });*/
}

function renderTrips() {
    const tripsList = document.getElementById("tripsList");
    if (!tripsList) return;
    const userId = getUserId();
    if (!userId)  {
        tripsList.innerHTML = '<p class="no-trips">Please log in to view your trips.</p>';
        return;
    }
    fetch(`${apiBase}/trips/${userId}`, 
        {
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + getAuthToken()
            },
        }
    )
    .then(handleJsonResponse)
    .then(trips => {
        console.log("testing trips", trips)
        if (!trips.length) {
            tripsList.innerHTML = '<p class="no-trips">No trips yet. Begin planning your first!.</p>';
            return;
        }

        tripsList.innerHTML = trips.map((trip, index) => `
            <article class="trip-card" style="animation-delay: ${index * 0.08}s;">
                <div class="trip-meta">
                    <strong>${trip.title}</strong>
                    <span>${trip.start_date}</span> - <span>${trip.end_date}</span>
                </div>
                <p>${trip.description}</p>
            </article>
        `).join("");
    })
    .catch(() => {
        tripsList.innerHTML = '<p class="no-trips">Failed to load trips. Try again later.</p>';
    });
}

window.updateAuthUI = updateAuthUI;

document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();
    renderReviews();
    renderTrips();
});
