const postForm = document.getElementById('postForm');

// Function to fetch and display user's posts
function fetchUserPosts() {
    fetch('/user-posts/')
        .then(response => response.json())
        .then(data => {
            const postsContainer = document.getElementById('userPostsContainer');
            postsContainer.innerHTML = '';

            // Check if there are posts
            if (data.posts.length === 0) {
                postsContainer.innerHTML = "<p>No posts available.</p>";
            }

            data.posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('card', 'mb-3');

                const likeBtnClass = post.liked_by_user ? 'btn-primary' : 'btn-outline-primary';

                postElement.innerHTML = `
                    <div class="card-body" style="box-shadow: 0 0 5px;">
                        <h6 class="card-subtitle mb-2 text-dark" style="font-weight: 900;">${post.username}:</h6>
                        <p class="card-text">${post.content}</p>
                        <small class="text-muted">Posted on ${post.created_at}</small>

                        <div class="mt-3">
                            <button class="btn btn-sm ${likeBtnClass} me-2" id="like-btn-${post.id}" onclick="likePost(${post.id})">
                            <i class="bi bi-hand-thumbs-up"></i> Like (${post.like_count})
                        </button>
                        <button class="btn btn-sm btn-outline-secondary me-2" onclick="commentPost(${post.id})">
                            <i class="bi bi-chat-left-text"></i> Comment
                        </button>
                        ${post.can_delete ? `<button class="btn btn-sm btn-outline-danger" onclick="deletePost(${post.id})">
                            <i class="bi bi-trash"></i> Delete
                        </button>` : ''}
                    </div>
                    <hr>
                    <div class="comments-section">
                        <h6><strong>Comments:</strong></h6>
                        ${post.comments.map(comment => `
                        <div class="comment">
                            <p><strong>${comment.username}</strong>: ${comment.content}</p>
                            <small class="text-muted comment-date">${comment.created_at}</small>
                            <hr>
                        </div>
                        `).join('')}
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => console.error('Error fetching posts:', error));
}

fetchUserPosts();

if (postForm) {
    postForm.addEventListener('submit', function(event) {
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
                document.getElementById('content').value = '';
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('postModal'));
                modal.hide();
        
                fetchUserPosts();
            } else {
                alert('Failed to create post.');
            }
        })
        .catch(error => console.error('Error creating post:', error));
    });
}

// Function to like posts
function likePost(postId) {
    fetch(`/like/${postId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => response.json())
    .then(data => {
        const likeBtn = document.getElementById(`like-btn-${postId}`);
        likeBtn.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Like (${data.like_count})`;

        if (data.liked) {
            likeBtn.classList.remove('btn-outline-primary');
            likeBtn.classList.add('btn-primary');
        } else {
            likeBtn.classList.remove('btn-primary');
            likeBtn.classList.add('btn-outline-primary');
        }
    });
}

// Function for comments
function commentPost(postId) {
    const commentContent = prompt('Enter your comment:');
    if (commentContent) {
        fetch(`/comment/${postId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: new URLSearchParams({
                'content': commentContent,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error adding comment');
            } else {
                console.log('Comment added:', data);
                fetchUserPosts();
            }
        });
    }
}

// Delete posts function
function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    fetch('/api/delete_post/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: `post_id=${postId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchUserPosts();
        } else {
            alert('Error deleting post: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => console.error('Error:', error));
}

// Helper to get the CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

