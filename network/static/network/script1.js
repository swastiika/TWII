async function loadUserPosts(username, page) {
    // Ensure the page number is valid
    if (page < 1) return;

    try {
        // Fetch data from the server
        const response = await fetch(`/userposts/?user=${username}&page=${page}`);
        const data = await response.json();

        // Clear the posts container
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '';

        // Append posts to the container
        data.posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h3>${post.owner}</h3>
                            <p>${post.content}</p>
                            <p>${post.timestamp}</p>
                        </div>
                    </div>
                </div>
            </div>`;
            postsContainer.appendChild(postDiv);
        });

        // Update pagination buttons
        currentPage = page;
        updatePaginationButtons(username, data.has_previous, data.has_next);
    } catch (error) {
        console.error("Error loading page:", error);
    }
}

function updatePaginationButtons(username, hasPrevious, hasNext) {
    const paginationButtons = document.getElementById('pagination-buttons');
    paginationButtons.innerHTML = '';  // Clear the existing buttons

    // Create Previous button if there is a previous page
    if (hasPrevious) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.onclick = () => loadUserPosts(username, currentPage - 1);
        paginationButtons.appendChild(prevButton);
    }

    // Create Next button if there is a next page
    if (hasNext) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.onclick = () => loadUserPosts(username, currentPage + 1);
        paginationButtons.appendChild(nextButton);
    }
}
