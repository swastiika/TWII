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
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        document.querySelector('#new_post').value='';
        alert("post has been successfully created")

         // Prepend to show the new post at the top
         loadPage(1,1);
    })
    .catch(error => {
        console.error('Error:', error);
        document.querySelector('#post-message').innerHTML = `
            <h1>Error creating post</h1>
            <p>${error.message}</p>
        `;
    });

}
   async function loadPage(page,task,current_user) {
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
          <p>${current_user}</p>
           ${ownerButtonHtml}
                    </div>
                    </div>
                    </div>`;
                    postsContainer.appendChild(postDiv);
                });

                // Update pagination buttons
                currentPage = page;
                updatePaginationButtons(task,data.has_previous, data.has_next,page,current_user);
            } catch (error) {
                console.error("Error loading page:", error);
            }
        }

        function updatePaginationButtons(task,hasPrevious, hasNext,currentPage,current_user) {
            const paginationButtons = document.getElementById('pagination-buttons');
            paginationButtons.innerHTML = '';  // Clear the existing buttons

            // Create Previous button if there is a previous page
            if (hasPrevious) {
                const prevButton = document.createElement('button');
                prevButton.innerText = 'Previous';
                prevButton.onclick = () => loadPage(currentPage - 1,task,current_user);
                paginationButtons.appendChild(prevButton);
            }

            // Create Next button if there is a next page
            if (hasNext) {
                const nextButton = document.createElement('button');
                nextButton.innerText = 'Next';
                nextButton.onclick = () => loadPage(currentPage + 1,task,current_user);
                paginationButtons.appendChild(nextButton);
            }
        }


        function edit_content() {
            const postId = this.getAttribute("data-post-id"); // Assuming each button has a data-post-id attribute
            const postContentDiv = document.getElementById(`post-content-${postId}`);
            const originalContent = postContentDiv.textContent.trim();
        
            // Create a textarea and populate with the original content
            const textarea = document.createElement("textarea");
            textarea.classList.add("form-control");
            textarea.value = originalContent;
        
            // Create a Save button
            const saveButton = document.createElement("button");
            saveButton.classList.add("btn", "btn-success", "save-btn");
            saveButton.textContent = "Save";
        
            // Clear the post content area and add the textarea and Save button
            postContentDiv.innerHTML = "";
            postContentDiv.appendChild(textarea);
            postContentDiv.appendChild(saveButton);
        
            // Add event listener to the Save button
            saveButton.addEventListener("click", () => {
              const updatedContent = textarea.value; // Get updated content
        
              // Example fetch call to save updated content
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
                  // Update the post content and remove textarea
                  postContentDiv.innerHTML = updatedContent;
                } else {
                  alert("Error updating post");
                }
              })
              .catch(error => console.log(error));
            });
        }