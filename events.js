/* =========================
   1. EVENT DATA
========================= */

const events = [
    {
        id: 1,
        title: "AI & Machine Learning Workshop",
        category: "Technical",
        date: "2026-11-18",
        time: "10:00 AM",
        location: "Computer Lab",
        description: "Explore artificial intelligence, machine learning, and practical applications."
    },

    {
        id: 2,
        title: "Inter-College Coding Contest",
        category: "Technical",
        date: "2026-11-21",
        time: "11:00 AM",
        location: "Main Auditorium",
        description: "Test your programming skills and compete with other students."
    },

    {
        id: 3,
        title: "Photography Club Meetup",
        category: "Cultural",
        date: "2026-11-25",
        time: "02:00 PM",
        location: "Student Activity Centre",
        description: "Meet photography enthusiasts and learn creative photography techniques."
    },

    {
        id: 4,
        title: "Annual Sports Tournament",
        category: "Sports",
        date: "2026-11-28",
        time: "09:00 AM",
        location: "University Sports Ground",
        description: "Participate in exciting sports competitions and team activities."
    },

    {
        id: 5,
        title: "Web Development Bootcamp",
        category: "Workshop",
        date: "2026-12-02",
        time: "10:30 AM",
        location: "Innovation Lab",
        description: "Learn modern web development through practical coding exercises."
    },

    {
        id: 6,
        title: "Cultural Night",
        category: "Cultural",
        date: "2026-12-05",
        time: "06:00 PM",
        location: "Open Air Theatre",
        description: "Enjoy music, dance, performances, and student talent."
    },

    {
        id: 7,
        title: "Cybersecurity Awareness Session",
        category: "Technical",
        date: "2026-12-08",
        time: "12:00 PM",
        location: "Seminar Hall",
        description: "Understand online safety, cyber threats, and digital security."
    },

    {
        id: 8,
        title: "Basketball Championship",
        category: "Sports",
        date: "2026-12-12",
        time: "04:00 PM",
        location: "Basketball Court",
        description: "Watch or participate in the campus basketball championship."
    },

    {
        id: 9,
        title: "Python Programming Workshop",
        category: "Workshop",
        date: "2026-12-15",
        time: "11:00 AM",
        location: "Computer Lab",
        description: "Practice Python programming and build small applications."
    }
];


/* =========================
   2. DOM ELEMENTS
========================= */

const eventsContainer =
    document.getElementById("events-container");

const searchInput =
    document.getElementById("event-search");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const bookmarkFilter =
    document.getElementById("bookmark-filter");

const resultsCount =
    document.getElementById("results-count");

const emptyState =
    document.getElementById("empty-state");


/* =========================
   3. APPLICATION STATE
========================= */

let selectedCategory = "All";

let showBookmarksOnly = false;


// Load saved bookmarks from localStorage

let savedBookmarks = JSON.parse(
    localStorage.getItem("campusBookmarks")
) || [];


/* =========================
   4. DISPLAY EVENTS
========================= */

function displayEvents(eventArray) {

    eventsContainer.innerHTML = "";

    resultsCount.textContent =
        `${eventArray.length} events`;

    if (eventArray.length === 0) {

        emptyState.classList.remove("hidden");

        return;

    }

    emptyState.classList.add("hidden");


    eventArray.forEach(event => {

        const isSaved =
            savedBookmarks.includes(event.id);

        const eventDate =
            new Date(event.date + "T00:00:00");

        const formattedDate =
            eventDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });


        const eventCard = document.createElement("article");

        eventCard.className = "event-card";

        eventCard.innerHTML = `

            <div class="event-card-top">

                <span class="event-category">
                    ${event.category}
                </span>

                <button
                    class="bookmark-btn ${isSaved ? "saved" : ""}"
                    data-id="${event.id}"
                    aria-label="${isSaved ? "Remove bookmark" : "Save event"}"
                    aria-pressed="${isSaved}"
                    type="button"
                >
                    ${isSaved ? "♥" : "♡"}
                </button>

            </div>


            <div class="event-card-body">

                <h3>${event.title}</h3>

                <p class="event-description">
                    ${event.description}
                </p>

                <div class="event-details">

                    <p>📅 <strong>${formattedDate}</strong></p>

                    <p>◷ <strong>${event.time}</strong></p>

                    <p>📍 <strong>${event.location}</strong></p>

                </div>

                <div class="event-card-bottom">

                    <span>Campus Event</span>

                    <a href="mailto:campuscompass@example.com?subject=${encodeURIComponent("Event enquiry: " + event.title)}">
                        Enquire ↗
                    </a>

                </div>

            </div>

        `;


        eventsContainer.appendChild(eventCard);

    });

}


/* =========================
   5. SEARCH AND FILTER
========================= */

function filterEvents() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    let filteredEvents = events.filter(event => {

        const matchesSearch =
            event.title.toLowerCase().includes(searchText) ||
            event.category.toLowerCase().includes(searchText) ||
            event.location.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            event.category === selectedCategory;

        const matchesBookmark =
            !showBookmarksOnly ||
            savedBookmarks.includes(event.id);

        return (
            matchesSearch &&
            matchesCategory &&
            matchesBookmark
        );

    });

    displayEvents(filteredEvents);

}


/* =========================
   6. CATEGORY BUTTONS
========================= */

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedCategory =
            button.dataset.category;

        filterEvents();

    });

});


/* =========================
   7. SEARCH INPUT
========================= */

searchInput.addEventListener("input", () => {

    filterEvents();

});


/* =========================
   8. BOOKMARK FILTER
========================= */

bookmarkFilter.addEventListener("click", () => {

    showBookmarksOnly = !showBookmarksOnly;

    bookmarkFilter.classList.toggle(
        "active",
        showBookmarksOnly
    );

    bookmarkFilter.textContent =
        showBookmarksOnly ? "♥ Saved Events" : "♡ Saved Events";

    filterEvents();

});


/* =========================
   9. SAVE AND REMOVE BOOKMARKS
========================= */

eventsContainer.addEventListener("click", event => {

    const button =
        event.target.closest(".bookmark-btn");

    if (!button) {
        return;
    }

    const eventId = Number(button.dataset.id);

    if (savedBookmarks.includes(eventId)) {

        savedBookmarks = savedBookmarks.filter(
            id => id !== eventId
        );

    } else {

        savedBookmarks.push(eventId);

    }


    // Save bookmarks in browser storage

    localStorage.setItem(
        "campusBookmarks",
        JSON.stringify(savedBookmarks)
    );


    // Refresh event display

    filterEvents();

});


/* =========================
   10. INITIALIZE PAGE
========================= */

displayEvents(events);

console.log("CampusCompass Events Explorer loaded!");
