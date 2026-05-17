const apiBase = "";

function getAuthToken() {
    return localStorage.getItem('jwtToken');
}

function getUserName() {
    return localStorage.getItem('userName') || '';
}

function checkAuth() {
    return Boolean(getAuthToken());
}

function setAuthInfo(token, name) {
    if (token) {
        localStorage.setItem('jwtToken', token);
    }
    if (name) {
        localStorage.setItem('userName', name);
    }
}

function clearAuthInfo() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
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
        setAuthInfo(data.token, `${data.first_name} ${data.last_name}`);
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

window.updateAuthUI = updateAuthUI;

document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();
    renderReviews();
});
