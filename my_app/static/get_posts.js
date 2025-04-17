 // Function to fetch and display posts
 function fetchPosts() {
    fetch('/api/get_posts/') 
        .then(response => response.json())
        .then(data => {
            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML = '';

            data.posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('card', 'text-dark', 'border-secondary', 'mb-3');
                
                postElement.innerHTML = `
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-dark" style="font-weight: 900;">${post.username}:</h6>
                    <p class="card-text">${post.content}</p>
                    <small class="text-muted">Posted on ${post.created_at}</small>
            
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="likePost(${post.id})">
                            <i class="bi bi-hand-thumbs-up"></i> Like
                        </button>
                        <button class="btn btn-sm btn-outline-secondary me-2" onclick="commentPost(${post.id})">
                            <i class="bi bi-chat-left-text"></i> Comment
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePost(${post.id})">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            
                
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => console.error('Error fetching posts:', error));
}

fetchPosts();


document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const content = document.getElementById('content').value;

    fetch('/api/post_user/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name="csrfmiddlewaretoken"]').value
        },
        body: JSON.stringify({ content: content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const post = data.post;
            const postsContainer = document.getElementById('postsContainer');
            
            const postElement = document.createElement('div');
            postElement.classList.add('card', 'text-dark', 'border-secondary', 'mb-3');
            postElement.innerHTML = `
                  <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-dark" style="font-weight: 900;">${post.username}:</h6>
                    <p class="card-text">${post.content}</p>
                    <small class="text-muted">Posted on ${post.created_at}</small>
            
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="likePost(${post.id})">
                            <i class="bi bi-hand-thumbs-up"></i> Like
                        </button>
                        <button class="btn btn-sm btn-outline-secondary me-2" onclick="commentPost(${post.id})">
                            <i class="bi bi-chat-left-text"></i> Comment
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePost(${post.id})">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;

            postsContainer.insertBefore(postElement, postsContainer.firstChild);

            document.getElementById('content').value = '';
        } else {
            alert('Failed to create post.');
        }
    })
    .catch(error => console.error('Error creating post:', error));
});