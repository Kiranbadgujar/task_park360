Sure! To include the button for deleting a comment (with the trash icon), we need to add the "Delete" button functionality into the modal. Here's how you can modify the modal's comment section to include the delete button for each comment.

### Updated Modal Code

```html
<div class="modal fade" id="commentModal" role="dialog" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Comments</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-start" id="commentsContainer">
        <!-- Comments will be dynamically inserted here -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
```

### Updated JavaScript for Displaying Comments and Adding Delete Button

You’ll need to ensure that when comments are displayed, a **delete button** (with the trash icon) is included next to each comment. I’ll add the delete button in the comment creation loop and also provide a way to handle the deletion (even though the actual deletion functionality isn't implemented here, I'll show you the structure to handle it).

#### Updated `fetchCommentsForPost` function:

```javascript
const fetchCommentsForPost = async (postId) => {
  const token = localStorage.getItem("Authortoken");
  if (!token) {
    // If no token found, redirect to login
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`/get-comments-for-post/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (data.status === 200 && data.comments.length > 0) {
      const commentsContainer = document.getElementById("commentsContainer");
      commentsContainer.innerHTML = ""; // Clear existing comments

      data.comments.forEach((comment) => {
        const commentElement = document.createElement("div");
        commentElement.classList.add("mb-3");

        // Creating comment structure with a delete button
        commentElement.innerHTML = `
          <div class="d-flex justify-content-between">
            <h4>${comment.users.first_name} ${comment.users.last_name}</h4>
            <p class="fs-6">${new Date(comment.createdAt).toLocaleDateString()}</p>
          </div>
          <p>${comment.comment}</p>
          <div class="d-flex justify-content-end">
            <a href="#" class="btn btn-outline-danger btn-rounded" data-comment-id="${comment.id}" onclick="deleteComment(event)">
              <i class="fas fa-trash"></i>
            </a>
          </div>
        `;

        commentsContainer.appendChild(commentElement);
      });
    } else {
      const commentsContainer = document.getElementById("commentsContainer");
      commentsContainer.innerHTML = "<p>No comments yet.</p>";
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
};

// Handle delete comment functionality
const deleteComment = async (event) => {
  event.preventDefault(); // Prevent the default link behavior

  const commentId = event.target.closest("a").dataset.commentId; // Get the comment ID from the data-attribute
  const token = localStorage.getItem("Authortoken");
  const postId = new URLSearchParams(window.location.search).get('postId'); // Get the postId from the URL

  if (!token || !commentId || !postId) {
    alert("Invalid request.");
    return;
  }

  try {
    const response = await fetch(`/delete-comment/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId }),
    });

    const data = await response.json();

    if (data.status === 200) {
      alert("Comment deleted successfully");
      fetchCommentsForPost(postId); // Refresh the comments
    } else {
      alert("Failed to delete comment");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    alert("Something went wrong. Try again.");
  }
};

// Add event listener to comment icon to open modal and fetch comments
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-bs-toggle='modal']")) {
    const postId = event.target.closest("[data-bs-toggle='modal']").dataset.postId;
    if (postId) {
      fetchCommentsForPost(postId);
    }
  }
});
```

### Key Changes:

1. **Delete Button**:
   - Each comment now has a delete button (trash icon) next to it, and the `data-comment-id` attribute stores the ID of the comment.
   - The `deleteComment()` function handles the deletion of a comment.

2. **`deleteComment` Function**:
   - This function is called when a user clicks the delete button. It sends a `DELETE` request to the backend API to remove the comment by its ID.
   - After deletion, the comments are re-fetched to update the comment list in the modal.

3. **`delete-comment/${commentId}` API Endpoint**:
   - You'll need to ensure that the backend has an endpoint to handle the deletion of a comment, typically via a `DELETE` method. This API would look for the comment ID and remove it from the database.

---

### Backend API (for Deleting a Comment)

Here’s an example of how the backend route for deleting a comment might look like:

```javascript
const deleteComment = async (req, res) => {
  const { commentId } = req.params; // Get the commentId from the URL
  const { postId } = req.body; // Get the postId from the request body

  try {
    // Check if the comment exists
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Check if the comment belongs to the author
    if (comment.postId !== postId) {
      return res.status(403).json({ message: "This comment does not belong to the specified post." });
    }

    // Delete the comment
    await comment.destroy();

    return res.status(200).json({ status: 200, message: "Comment deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// Express route for deleting a comment
app.delete("/delete-comment/:commentId", deleteComment);
```

In the above backend function:
- **`Comment.findByPk(commentId)`**: Fetches the comment by its ID.
- **`comment.destroy()`**: Deletes the comment from the database.

---

### Conclusion:

With these changes, your comment modal will now display each comment with a "Delete" button. Clicking the "Delete" button will trigger the backend API to delete the comment, and the list of comments will refresh automatically.