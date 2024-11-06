document.addEventListener('DOMContentLoaded',function(){
    document.querySelector('.profile').style.display = 'none';
    document.querySelector('#compose-form').addEventListener('submit', compose_post);
    const allPostsLink = document.getElementById('following');
    document.querySelector('#profile-link').addEventListener('click',show_profile)
    allPostsLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default link behavior
        document.querySelector('.profile').style.display = 'none';
        // Call your function to load all posts or perform any action
        loadPage(1,'following');
        });
        const allpost = document.getElementById('allpost');
        allpost.addEventListener('click', function (event) {
        event.preventDefault();
        document.querySelector('.profile').style.display = 'none'; 
        // Call your function to load all posts or perform any action
        loadPage(1,'allpost');
        });


        loadPage(1,'allpost');
        

})





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
            window.location.reload();

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
                    const postDiv = document.createElement('div');
                    postDiv.innerHTML = `
                    <div class="row">
      <div class="col-12">
        <div class="card mb-4">
          <div class="card-body">
           <a class="nav-link profile-link" id="profile-container"  href="#" data-username="${post.owner}">
                        <strong>${post.owner}</strong>
                    </a>
          <div id="post-content-${post.id}">
         <p> ${post.content}</p>
          </div>
          <p>${post.timestamp}</p>
           ${ownerButtonHtml}
                    </div>
                    </div>
                    </div>`;
                    postsContainer.appendChild(postDiv);
                });
                attachEditButtons();
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
        .then(response => {
            if (response.ok) {
                window.location.reload();

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
    })
}

function attachEditButtons() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        console.log("Attaching event listener to button:", button);
        button.addEventListener('click', edit_content);
    });
    document.querySelectorAll("#profile-container").forEach(profile =>{
        console.log("attaching event listener to profile:",profile)
        profile.addEventListener('click',show_profile)

    })     

    
}

function show_profile(event) {
    document.querySelector('.profile').style.display = 'block';

    const profile = event.currentTarget;
    const username = profile.getAttribute("data-username");

    fetch(`/profile/${username}`)
        .then(response => {
            if (!response.ok) {
                console.log("error");
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.querySelector('.profile h3').innerText = data.is_owner ? "MY PROFILE" : `${data.username}'s PROFILE`;
            document.getElementById('follower-count').innerText = data.follower_count;
            document.getElementById('following-count').innerText = data.following_count;
            document.getElementById('profile-email').innerText = data.email;
            const followButtonContainer = document.querySelector('.follow-button-container');
            followButtonContainer.innerHTML = ''; // Clear existing buttons
            
            // Set button attributes based on current follow status
            if (!data.is_owner) {
                const action = data.current_user_is_follower ? "unfollow" : "follow";
                const buttonClass = action === "unfollow" ? "btn-danger" : "btn-primary";
                const buttonText = action.charAt(0).toUpperCase() + action.slice(1);

                followButtonContainer.innerHTML = `
                    <button type="button" class="btn ${buttonClass}" data-username="${data.username}" data-action="${action}">${buttonText}</button>
                `;
                
                // Select the button using a single querySelector
                const actionButton = followButtonContainer.querySelector('button');
                
                // Add a single event listener
                actionButton.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    const targetUsername = this.getAttribute('data-username');
                    const method = action === "follow" ? "PUT" : "DELETE";  // Change method if needed

                    fetch(`/${action}/${targetUsername}/`, {
                        method: method
                    })
                    .then(response => {
                        if (response.ok) {
                            // Update button text and class based on the action
                            if (action === "follow") {
                                console.log("Followed successfully");
                                this.innerText = "Unfollow";
                                this.classList.replace("btn-primary", "btn-danger");
                                this.setAttribute('data-action', "unfollow"); // Update action
                                updateFollowerCount(targetUsername);
                              

                            } else {
                                console.log("Unfollowed successfully");
                                this.innerText = "Follow";
                                this.classList.replace("btn-danger", "btn-primary");
                                this.setAttribute('data-action', "follow"); // Update action
                                updateFollowerCount(targetUsername);
                               

                            }
                        } else {
                            console.error(`${action.charAt(0).toUpperCase() + action.slice(1)} failed`);
                        }
                    })
                    .catch(error => console.error("Error:", error));
                });
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
        loadPage('1',username);
}

async function updateFollowerCount(username) {
    try {
        const response = await fetch(`/followers/${username}/`);
        
        if (!response.ok) {
            console.error("Failed to retrieve follower count.");
            return;
        }
        
        const data = await response.json();
        document.getElementById('follower-count').innerText = data.follower_count;
        console.log("Follower count updated successfully.");
    } catch (error) {
        console.error("Error fetching follower count:", error);
    }
}

// Usage example
// Call this function with the specific username to update the follower count on the page
updateFollowerCount('sostika');
