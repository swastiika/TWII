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
          <p>${post.content}</p><p>${post.timestamp}</p>
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
                        <strong>${post.owner}</strong>
          <p>${post.content}</p><p>${post.timestamp}</p>
                    </div>
                    </div>
                    </div>`;
                    postsContainer.appendChild(postDiv);
                });
        
                // Update pagination buttons
                currentPage = page;
                updatePaginationButtons_userpost(username, data.has_previous, data.has_next,page);
            } catch (error) {
                console.error("Error loading page:", error);
            }
        }
        
        function updatePaginationButtons_userpost(username, hasPrevious, hasNext,currentPage) {
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
               