/* ================================
   CAMPUSCOMPASS - RESOURCE HUB
================================ */

// HTML elements
const resourceSearch = document.getElementById("resource-search");
const resourceContainer = document.getElementById("resource-container");
const resourceEmpty = document.getElementById("resource-empty");
const resourceResults = document.getElementById("resource-results");

const totalResourcesElement = document.getElementById("total-resources");
const totalCategoriesElement = document.getElementById("total-categories");
const totalBookmarksElement = document.getElementById("total-bookmarks");

const bookmarkFilterButton = document.getElementById("show-bookmarks-btn");

const resourceFormSection = document.getElementById("custom-resource-section");
const resourceForm = document.getElementById("resource-form");

const resourceIdInput = document.getElementById("resource-id");
const resourceTitleInput = document.getElementById("resource-title");
const resourceCategoryInput = document.getElementById("resource-category");
const resourceTypeInput = document.getElementById("resource-type");
const resourceUrlInput = document.getElementById("resource-url");
const resourceDescriptionInput = document.getElementById("resource-description");

const resourceFormHeading = document.getElementById("resource-form-heading");
const saveResourceButton = document.getElementById("save-resource-btn");

// Curated sample resources
const defaultResources = [
    {
        id: "r1",
        title: "Python Official Documentation",
        category: "Programming",
        type: "Documentation",
        description: "Learn Python syntax, functions, data structures and other language features.",
        url: "https://docs.python.org/3/"
    },
    {
        id: "r2",
        title: "LeetCode",
        category: "Programming",
        type: "Practice",
        description: "Practice coding problems and improve your data structures and algorithms skills.",
        url: "https://leetcode.com/"
    },
    {
        id: "r3",
        title: "GeeksforGeeks",
        category: "Programming",
        type: "Tutorial",
        description: "Explore programming tutorials, computer science concepts and coding problems.",
        url: "https://www.geeksforgeeks.org/"
    },
    {
        id: "r4",
        title: "Khan Academy Mathematics",
        category: "Mathematics",
        type: "Course",
        description: "Study algebra, calculus, statistics and other mathematics topics.",
        url: "https://www.khanacademy.org/math"
    },
    {
        id: "r5",
        title: "Paul's Online Math Notes",
        category: "Mathematics",
        type: "Tutorial",
        description: "Find calculus notes, explanations, practice problems and solutions.",
        url: "https://tutorial.math.lamar.edu/"
    },
    {
        id: "r6",
        title: "PhET Interactive Simulations",
        category: "Physics",
        type: "Tool",
        description: "Understand physics concepts through interactive science simulations.",
        url: "https://phet.colorado.edu/"
    },
    {
        id: "r7",
        title: "MDN Web Docs",
        category: "Web Development",
        type: "Documentation",
        description: "Learn HTML, CSS, JavaScript and modern web development.",
        url: "https://developer.mozilla.org/"
    },
    {
        id: "r8",
        title: "freeCodeCamp",
        category: "Web Development",
        type: "Course",
        description: "Learn programming and web development through practical lessons and projects.",
        url: "https://www.freecodecamp.org/"
    },
    {
        id: "r9",
        title: "Visual Studio Code",
        category: "Tools",
        type: "Tool",
        description: "Download and explore the code editor used for building software projects.",
        url: "https://code.visualstudio.com/"
    }
];

// Load custom resources and bookmarks
function loadStoredArray(key, fallback) {
    try {
        const stored = localStorage.getItem(key);

        if (!stored) return fallback;

        const parsed = JSON.parse(stored);

        return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
        return fallback;
    }
}

let customResources = loadStoredArray("campusCustomResources", []);
let savedResourceIds = loadStoredArray("campusResourceBookmarks", []);

let selectedResourceCategory = "All";
let showBookmarkedOnly = false;

// Save data
function saveResourceData() {
    localStorage.setItem(
        "campusCustomResources",
        JSON.stringify(customResources)
    );

    localStorage.setItem(
        "campusResourceBookmarks",
        JSON.stringify(savedResourceIds)
    );
}

// Get all resources
function getAllResources() {
    return [...defaultResources, ...customResources];
}

// Update statistics
function updateResourceStats() {
    const allResources = getAllResources();

    const categories = new Set(
        allResources.map(resource => resource.category)
    );

    totalResourcesElement.textContent = allResources.length;
    totalCategoriesElement.textContent = categories.size;

    totalBookmarksElement.textContent = savedResourceIds.filter(id =>
        allResources.some(resource => resource.id === id)
    ).length;
}

// Display resources
function displayResources(resourceArray) {
    resourceContainer.innerHTML = "";

    updateResourceStats();

    resourceResults.textContent =
        `Showing ${resourceArray.length} of ${getAllResources().length} resources`;

    if (resourceArray.length === 0) {
        resourceEmpty.classList.remove("hidden");
        return;
    }

    resourceEmpty.classList.add("hidden");

    resourceArray.forEach(resource => {
        const isSaved = savedResourceIds.includes(resource.id);
        const isCustom = customResources.some(item =>
            item.id === resource.id
        );

        const card = document.createElement("article");
        card.className = "resource-card";

        const top = document.createElement("div");
        top.className = "resource-card-top";

        const category = document.createElement("span");
        category.className = "resource-category-badge";
        category.textContent = resource.category;

        const type = document.createElement("span");
        type.className = "resource-type-badge";
        type.textContent = resource.type;

        const bookmarkButton = document.createElement("button");
        bookmarkButton.className = `resource-save-btn ${isSaved ? "saved" : ""}`;
        bookmarkButton.dataset.id = resource.id;
        bookmarkButton.textContent = isSaved ? "★" : "☆";
        bookmarkButton.title = isSaved ? "Remove bookmark" : "Save bookmark";
        bookmarkButton.setAttribute("aria-label", bookmarkButton.title);

        top.append(category, type, bookmarkButton);

        const title = document.createElement("h3");
        title.textContent = resource.title;

        const description = document.createElement("p");
        description.className = "resource-card-description";
        description.textContent = resource.description;

        const actions = document.createElement("div");
        actions.className = "resource-card-actions";

        const openLink = document.createElement("a");
        openLink.className = "resource-open-btn";
        openLink.href = resource.url;
        openLink.target = "_blank";
        openLink.rel = "noopener noreferrer";
        openLink.textContent = "Open Resource ↗";

        actions.appendChild(openLink);

        if (isCustom) {
            const editButton = document.createElement("button");
            editButton.className = "resource-edit-btn";
            editButton.dataset.id = resource.id;
            editButton.textContent = "Edit";

            const deleteButton = document.createElement("button");
            deleteButton.className = "resource-delete-btn";
            deleteButton.dataset.id = resource.id;
            deleteButton.textContent = "Delete";

            actions.append(editButton, deleteButton);
        }

        card.append(top, title, description, actions);
        resourceContainer.appendChild(card);
    });
}

// Search, filter and display
function filterResources() {
    const searchText = resourceSearch.value.trim().toLowerCase();

    let filteredResources = getAllResources();

    if (selectedResourceCategory !== "All") {
        filteredResources = filteredResources.filter(resource =>
            resource.category === selectedResourceCategory
        );
    }

    if (showBookmarkedOnly) {
        filteredResources = filteredResources.filter(resource =>
            savedResourceIds.includes(resource.id)
        );
    }

    if (searchText) {
        filteredResources = filteredResources.filter(resource =>
            resource.title.toLowerCase().includes(searchText) ||
            resource.category.toLowerCase().includes(searchText) ||
            resource.description.toLowerCase().includes(searchText) ||
            resource.type.toLowerCase().includes(searchText)
        );
    }

    displayResources(filteredResources);
}

// Open the custom resource form
function openResourceForm() {
    resourceFormSection.classList.remove("hidden");

    resourceFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Reset the form
function resetResourceForm() {
    resourceForm.reset();
    resourceIdInput.value = "";

    resourceFormHeading.textContent = "Add Your Own Resource";
    saveResourceButton.textContent = "Save Resource";
}

// Close the form
function closeResourceForm() {
    resetResourceForm();
    resourceFormSection.classList.add("hidden");
}

// Add or update a custom resource
resourceForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = resourceTitleInput.value.trim();
    const category = resourceCategoryInput.value;
    const type = resourceTypeInput.value;
    const description = resourceDescriptionInput.value.trim();

    let url;

    try {
        url = new URL(resourceUrlInput.value.trim());
    } catch (error) {
        alert("Please enter a valid website URL.");
        return;
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
        alert("Only HTTP and HTTPS website links are allowed.");
        return;
    }

    const existingId = resourceIdInput.value;

    if (existingId) {
        customResources = customResources.map(resource => {
            if (resource.id === existingId) {
                return {
                    ...resource,
                    title,
                    category,
                    type,
                    description,
                    url: url.href
                };
            }

            return resource;
        });
    } else {
        const newResource = {
            id: `custom-${Date.now()}`,
            title,
            category,
            type,
            description,
            url: url.href
        };

        customResources.push(newResource);
    }

    saveResourceData();
    closeResourceForm();
    filterResources();
});

// Handle resource card buttons
resourceContainer.addEventListener("click", function(event) {
    const button = event.target.closest("button");

    if (!button) return;

    const resourceId = button.dataset.id;

    // Bookmark or remove bookmark
    if (button.classList.contains("resource-save-btn")) {
        if (savedResourceIds.includes(resourceId)) {
            savedResourceIds = savedResourceIds.filter(id =>
                id !== resourceId
            );
        } else {
            savedResourceIds.push(resourceId);
        }

        saveResourceData();
        filterResources();
    }

    // Edit custom resource
    else if (button.classList.contains("resource-edit-btn")) {
        const resource = customResources.find(item =>
            item.id === resourceId
        );

        if (!resource) return;

        resourceIdInput.value = resource.id;
        resourceTitleInput.value = resource.title;
        resourceCategoryInput.value = resource.category;
        resourceTypeInput.value = resource.type;
        resourceUrlInput.value = resource.url;
        resourceDescriptionInput.value = resource.description;

        resourceFormHeading.textContent = "Edit Your Resource";
        saveResourceButton.textContent = "Update Resource";

        openResourceForm();
    }

    // Delete custom resource
    else if (button.classList.contains("resource-delete-btn")) {
        const confirmed = confirm(
            "Are you sure you want to delete this resource?"
        );

        if (!confirmed) return;

        customResources = customResources.filter(resource =>
            resource.id !== resourceId
        );

        savedResourceIds = savedResourceIds.filter(id =>
            id !== resourceId
        );

        saveResourceData();
        filterResources();
    }
});

// Search input
resourceSearch.addEventListener("input", filterResources);

// Category filters
document.querySelectorAll(".resource-filter").forEach(button => {
    button.addEventListener("click", function() {
        document.querySelectorAll(".resource-filter").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
        selectedResourceCategory = this.dataset.category;

        filterResources();
    });
});

// Bookmark filter
bookmarkFilterButton.addEventListener("click", function() {
    showBookmarkedOnly = !showBookmarkedOnly;

    this.classList.toggle("active", showBookmarkedOnly);

    filterResources();
});

// Form buttons
document.getElementById("open-resource-form").addEventListener(
    "click",
    openResourceForm
);

document.getElementById("close-resource-form").addEventListener(
    "click",
    closeResourceForm
);

document.getElementById("cancel-resource-form").addEventListener(
    "click",
    closeResourceForm
);

// Initial display
filterResources();

console.log("CampusCompass Resource Hub loaded successfully.");
