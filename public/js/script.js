// register
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

    fetch("http://localhost:3000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData)
    })
    .then(res => res.json())
    .then(data => {
        responseBox.style.display = "block";
        responseBox.className = "success";
        responseBox.innerText = data.message;
        window.open("index.html")
    })
    .catch(() => {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = "Failed to register. Please try again.";
    });
}


// login
function checkAuth() {
    if (localStorage.getItem('jwtToken')) { return true }
    return false
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
        responseBox.innerText = "Username and Password required.";
        return;
    }

    fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(userData)
    })
    .then(res => res.json())
    .then(data => {
        localStorage.setItem('jwtToken', data.token);
        let authorized = checkAuth();
        if (authorized) {
            responseBox.style.display = "block";
            responseBox.className = "success";
            responseBox.innerText = data.message;
            window.open("index.html")
        } else {
            responseBox.style.display = "block";
            responseBox.className = "error";
            responseBox.innerText = "Failed to login. Please try again.";
        }
    })
    .catch(() => {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = "Failed to login. Please try again.";
    });
}

// logout
function logoutUser() {
    localStorage.removeItem('jwtToken');
    window.open("login.html");
}

// contact
function sendFooterContact() {
    const contact = {
        name: document.getElementById("footerName").value,
        email: document.getElementById("footerEmail").value,
        message: document.getElementById("footerMessage").value
    };

    fetch("http://localhost:3000/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    })
    .then(res => res.json())
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

    fetch("http://localhost:3000/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    })
    .then(res => res.json())
    .then(data => {
        responseBox.style.display = "block";
        responseBox.className = "success";
        responseBox.innerText = data.message;
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("message").value = "";
    })
    .catch(() => {
        responseBox.style.display = "block";
        responseBox.className = "error";
        responseBox.innerText = "Failed to send message.";
    });
}

// reviews
function addReview() {
    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();
    const feedback = document.getElementById("review-feedback");

    if (!feedback) return;

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

    fetch("http://localhost:3000/reviews/addReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review)
    })
    .then(res => res.json())
    .then(() => {
        feedback.style.display = "block";
        feedback.className = "success";
        feedback.innerText = "Thank you! Your review has been added.";

        document.getElementById("reviewName").value = "";
        document.getElementById("reviewText").value = "";

        renderReviews();
    })
    .catch(() => {
        feedback.style.display = "block";
        feedback.className = "error";
        feedback.innerText = "Failed to add review. Try again later.";
    });
}

function renderReviews() {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    fetch("http://localhost:3000/reviews/")
    .then(res => res.json())
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

document.addEventListener("DOMContentLoaded", renderReviews);