function compose_post(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Fetch the input values using .value
    const content = document.querySelector('#new_post').value;

    // Send the POST request to the server
    fetch('/compose', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Specify the content type
        },
        body: JSON.stringify({
            content: content,
        })
    })
    .then(response => {
        if (response.ok) {
            // Clear the input field after successful post creation
            document.querySelector('#new_post').value = '';
            alert("Post has been successfully created");

            // Prepend to show the new post at the top
            loadPage(1, 'allpost');
        } else {
            // Handle errors returned from the server
            throw new Error('Error creating post. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.querySelector('#post-message').innerHTML = `
            <h1>Error creating post</h1>
            <p>${error.message}</p>
        `;
    });
}

   async function loadPage(page,task) {
            // Ensure the page number is valid
            if (page < 1) return;

            try {
                // Fetch data from the server
                const response = await fetch(`/posts/${task}/?page=${page}`);
                const data = await response.json();

                // Clear the posts container
                const postsContainer = document.getElementById('posts-container');
                postsContainer.innerHTML = '';

                // Append posts to the container
                data.posts.forEach(post => {
                    if(post.is_own){
                       ownerButtonHtml =`<button class="btn btn-warning edit-btn" data-post-id="${post.id}">Edit</button>`;

                    }
                    else{
                        ownerButtonHtml =``;
                    }
               
                    const profileUrl = `/profile/${post.owner}/`; 
                    const postDiv = document.createElement('div');
                    postDiv.innerHTML = `
                    <div class="row">
      <div class="col-12">
        <div class="card mb-4">
          <div class="card-body">
           <a class="nav-link profile-link" id="profile-container"  href="${profileUrl}" data-username="${post.owner}">
                        <strong>${post.owner}</strong>
                    </a>
          <div id="post-content-${post.id}">
          ${post.content}
          </div>
          <p>${post.timestamp}</p>
           ${ownerButtonHtml}
                    </div>
                    </div>
                    </div>`;
                    postsContainer.appendChild(postDiv);
                });

                // Update pagination buttons
                currentPage = page;
                updatePaginationButtons(task,data.has_previous, data.has_next,page);
            } catch (error) {
                console.error("Error loading page:", error);
            }
        }

        function updatePaginationButtons(task,hasPrevious, hasNext,currentPage) {
            const paginationButtons = document.getElementById('pagination-buttons');
            paginationButtons.innerHTML = '';  // Clear the existing buttons

            // Create Previous button if there is a previous page
            if (hasPrevious) {
                const prevButton = document.createElement('button');
                prevButton.innerText = 'Previous';
                prevButton.onclick = () => loadPage(currentPage - 1,task);
                paginationButtons.appendChild(prevButton);
            }

            // Create Next button if there is a next page
            if (hasNext) {
                const nextButton = document.createElement('button');
                nextButton.innerText = 'Next';
                nextButton.onclick = () => loadPage(currentPage + 1,task);
                paginationButtons.appendChild(nextButton);
            }
        }


       function edit_content(event) {
    const button = event.currentTarget;
    const postId = button.getAttribute("data-post-id");

    const postContentDiv = document.getElementById(`post-content-${postId}`);
    const originalContent = postContentDiv.querySelector('p').textContent.trim();

    // Create a textarea and Save button
    const textarea = document.createElement("textarea");
    textarea.classList.add("form-control");
    textarea.value = originalContent;

    const saveButton = document.createElement("button");
    saveButton.classList.add("btn", "btn-success", "save-btn");
    saveButton.textContent = "Save";

    postContentDiv.innerHTML = ""; // Clear the content
    postContentDiv.appendChild(textarea);
    postContentDiv.appendChild(saveButton);

    saveButton.addEventListener("click", () => {
        const updatedContent = textarea.value;

        fetch(`/save-post/${postId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: updatedContent })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                postContentDiv.innerHTML = updatedContent; // Update content
            } else {
                alert("Error updating post");
            }
        })
        .catch(error => console.log(error));
