// contact
function sendFooterContact() {
    const contact = {
        name: document.getElementById("footerName").value,
        email: document.getElementById("footerEmail").value,
        message: document.getElementById("footerMessage").value
    };

    fetch("http://localhost:3000/contact", {
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

    fetch("http://localhost:3000/contact", {
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

    fetch("http://localhost:3000/addData", {
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

    fetch("http://localhost:3000/getData")
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